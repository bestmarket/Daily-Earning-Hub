import { Router } from "express";
import nodemailer from "nodemailer";
import { db, emailAccountsTable, affiliateCampaignsTable, affiliateContactsTable } from "@workspace/db";
import { eq, and, asc, sql } from "drizzle-orm";
import { getGeminiAI } from "./api-keys";
import { requireAdmin } from "../lib/admin-auth";

const router = Router();

// ─── In-memory send loop registry ─────────────────────────────────────────────
// Maps campaignId -> abort flag object
const activeSenders = new Map<number, { running: boolean }>();

// ─── Email helpers (self-contained, parallel to crm-ai.ts) ────────────────────

function makeTransporter(acct: { host: string; port: number; secure: boolean; user: string; password: string }) {
  const port = acct.port || 587;
  const secure = port === 465;
  return nodemailer.createTransport({
    host: acct.host, port, secure, requireTLS: !secure,
    auth: { user: acct.user.trim(), pass: acct.password.replace(/\s/g, "") },
    tls: { rejectUnauthorized: false },
    connectionTimeout: 15000, greetingTimeout: 10000, socketTimeout: 15000,
  } as any);
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

async function pickAccount(excludeIds: number[] = []) {
  const rows = await db.select().from(emailAccountsTable)
    .where(eq(emailAccountsTable.active, true)).catch(() => []);
  const today = todayStr();
  const eligible = rows
    .filter(a => !excludeIds.includes(a.id) && !a.autoPaused)
    .filter(a => a.dailyLimit <= 0 || (a.lastSentDay === today ? a.sentToday : 0) < a.dailyLimit)
    .sort((a, b) => {
      const as = a.lastSentDay === today ? a.sentToday : 0;
      const bs = b.lastSentDay === today ? b.sentToday : 0;
      return as !== bs ? as - bs : a.sentCount - b.sentCount;
    });
  // fallback to env vars
  if (!eligible[0]) {
    if (excludeIds.includes(-1)) return null;
    const u = process.env.SMTP_USER, p = process.env.SMTP_PASS, h = process.env.SMTP_HOST;
    if (u && p && h) return { id: -1, label: "env", host: h, port: Number(process.env.SMTP_PORT || 587), secure: false, user: u, password: p, fromName: process.env.SMTP_FROM_NAME || "DevStudio", fromEmail: process.env.SMTP_FROM_EMAIL || u } as any;
    return null;
  }
  return eligible[0];
}

async function incSent(id: number) {
  if (id <= 0) return;
  const today = todayStr();
  const rows = await db.select().from(emailAccountsTable).where(eq(emailAccountsTable.id, id)).limit(1).catch(() => []);
  const acct = rows[0];
  if (!acct) return;
  const sentToday = acct.lastSentDay === today ? acct.sentToday + 1 : 1;
  await db.update(emailAccountsTable).set({ sentCount: sql`${emailAccountsTable.sentCount} + 1`, sentToday, lastSentDay: today, consecutiveFailures: 0, lastError: "" }).where(eq(emailAccountsTable.id, id)).catch(() => {});
}

async function incFail(id: number, msg: string) {
  if (id <= 0) return;
  const rows = await db.select().from(emailAccountsTable).where(eq(emailAccountsTable.id, id)).limit(1).catch(() => []);
  const acct = rows[0];
  if (!acct) return;
  const failures = acct.consecutiveFailures + 1;
  await db.update(emailAccountsTable).set({ consecutiveFailures: failures, lastError: msg.slice(0, 300), lastErrorAt: new Date(), ...(failures >= 3 && { autoPaused: true }) }).where(eq(emailAccountsTable.id, id)).catch(() => {});
}

async function sendEmailWithFailover(opts: { to: string; subject: string; html: string; text: string }) {
  const tried: number[] = [];
  let acct = await pickAccount();
  let lastErr: any = null;
  for (let attempt = 0; attempt < 4; attempt++) {
    if (!acct || !acct.user || !acct.password) throw new Error(lastErr?.message || "No active email account available.");
    tried.push(acct.id);
    try {
      const t = makeTransporter(acct);
      await t.sendMail({ from: `"${acct.fromName}" <${acct.fromEmail || acct.user}>`, ...opts });
      await incSent(acct.id);
      return;
    } catch (e: any) {
      lastErr = e;
      await incFail(acct.id, e.message || String(e));
      acct = await pickAccount(tried);
    }
  }
  throw new Error(lastErr?.message || "Failed after trying all accounts.");
}

// ─── AI / template message generation ─────────────────────────────────────────

function substituteVars(template: string, vars: Record<string, string>) {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] || "");
}

async function generateMessageForContact(
  template: string,
  subject: string,
  contact: { businessName: string; ownerName: string; city: string; category: string; website: string }
): Promise<{ subject: string; body: string }> {
  const vars: Record<string, string> = {
    businessName: contact.businessName,
    ownerName: contact.ownerName || "Business Owner",
    city: contact.city,
    category: contact.category,
    website: contact.website || "your website",
  };

  // Try AI personalisation first
  try {
    const ai = await getGeminiAI();
    const prompt = `You are writing a personalised affiliate outreach email.

Business: ${contact.businessName}
Owner: ${contact.ownerName || "Business Owner"}  
Category: ${contact.category}
City: ${contact.city}
Website: ${contact.website || "N/A"}

Use the following template as your guide for tone, length, and style. Personalise it for this specific business — mention their category and city naturally. Keep the email concise (under 200 words). Do not add any meta-commentary.

TEMPLATE:
${template}

Return ONLY valid JSON with two keys:
{
  "subject": "the email subject line",
  "body": "the full email body (plain text, with line breaks as \\n)"
}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: { maxOutputTokens: 1024 },
    });
    const text = (response.text ?? "").replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const parsed = JSON.parse(text);
    return { subject: parsed.subject || substituteVars(subject, vars), body: parsed.body || substituteVars(template, vars) };
  } catch {
    // Fallback: plain variable substitution
    return { subject: substituteVars(subject, vars), body: substituteVars(template, vars) };
  }
}

// ─── Background send loop ──────────────────────────────────────────────────────

async function runSendLoop(campaignId: number, intervalMs: number) {
  const flag = activeSenders.get(campaignId);
  if (!flag) return;

  try {
    while (flag.running) {
      // Fetch next pending contact with an email
      const rows = await db.select().from(affiliateContactsTable)
        .where(and(eq(affiliateContactsTable.campaignId, campaignId), eq(affiliateContactsTable.status, "pending")))
        .orderBy(asc(affiliateContactsTable.id))
        .limit(1);

      if (rows.length === 0) {
        // All contacts processed — mark completed
        await db.update(affiliateCampaignsTable)
          .set({ status: "completed", updatedAt: new Date() })
          .where(eq(affiliateCampaignsTable.id, campaignId));
        break;
      }

      const contact = rows[0];

      if (!contact.email || contact.email.trim() === "") {
        // No email — skip
        await db.update(affiliateContactsTable)
          .set({ status: "skipped", errorMsg: "No email address" })
          .where(eq(affiliateContactsTable.id, contact.id));
        await db.update(affiliateCampaignsTable)
          .set({ sentCount: sql`${affiliateCampaignsTable.sentCount} + 1`, updatedAt: new Date() })
          .where(eq(affiliateCampaignsTable.id, campaignId));
        continue;
      }

      // Use stored generated message if available, otherwise generate on the fly
      const campaign = await db.select().from(affiliateCampaignsTable)
        .where(eq(affiliateCampaignsTable.id, campaignId)).limit(1);
      if (!campaign[0] || !flag.running) break;

      let subject = contact.generatedSubject || campaign[0].emailSubject;
      let body = contact.generatedMessage || campaign[0].emailTemplate;

      if (!subject || !body) {
        // Skip — template missing
        await db.update(affiliateContactsTable)
          .set({ status: "skipped", errorMsg: "No template set on campaign" })
          .where(eq(affiliateContactsTable.id, contact.id));
        continue;
      }

      try {
        const htmlBody = body.replace(/\n/g, "<br>");
        await sendEmailWithFailover({
          to: contact.email,
          subject,
          html: htmlBody,
          text: body,
        });
        await db.update(affiliateContactsTable)
          .set({ status: "sent", sentAt: new Date(), errorMsg: "" })
          .where(eq(affiliateContactsTable.id, contact.id));
        await db.update(affiliateCampaignsTable)
          .set({ sentCount: sql`${affiliateCampaignsTable.sentCount} + 1`, updatedAt: new Date() })
          .where(eq(affiliateCampaignsTable.id, campaignId));
      } catch (e: any) {
        await db.update(affiliateContactsTable)
          .set({ status: "failed", errorMsg: (e.message || "Send error").slice(0, 300) })
          .where(eq(affiliateContactsTable.id, contact.id));
        await db.update(affiliateCampaignsTable)
          .set({ failedCount: sql`${affiliateCampaignsTable.failedCount} + 1`, updatedAt: new Date() })
          .where(eq(affiliateCampaignsTable.id, campaignId));
      }

      if (!flag.running) break;

      // Wait for the configured interval
      await new Promise<void>(resolve => {
        const timeout = setTimeout(resolve, intervalMs);
        // Poll abort every 500ms
        const poll = setInterval(() => { if (!flag.running) { clearTimeout(timeout); clearInterval(poll); resolve(); } }, 500);
        setTimeout(() => clearInterval(poll), intervalMs + 1000);
      });
    }
  } finally {
    activeSenders.delete(campaignId);
    // If still "running" in DB but loop exited (e.g. paused), mark as paused
    const [camp] = await db.select().from(affiliateCampaignsTable).where(eq(affiliateCampaignsTable.id, campaignId)).limit(1).catch(() => [undefined]);
    if (camp && camp.status === "running") {
      await db.update(affiliateCampaignsTable).set({ status: "paused", updatedAt: new Date() }).where(eq(affiliateCampaignsTable.id, campaignId)).catch(() => {});
    }
  }
}

// ─── Campaign CRUD ────────────────────────────────────────────────────────────

router.get("/affiliate/campaigns", requireAdmin, async (_req, res) => {
  const rows = await db.select().from(affiliateCampaignsTable)
    .orderBy(asc(affiliateCampaignsTable.createdAt));
  res.json(rows);
});

router.post("/affiliate/campaigns", requireAdmin, async (req, res) => {
  const { name, description, emailSubject, emailTemplate, sendIntervalMinutes } = req.body as any;
  if (!name?.trim()) { res.status(400).json({ error: "name is required" }); return; }
  const [row] = await db.insert(affiliateCampaignsTable).values({
    name: name.trim(),
    description: description?.trim() || "",
    emailSubject: emailSubject?.trim() || "",
    emailTemplate: emailTemplate?.trim() || "",
    sendIntervalMinutes: Number(sendIntervalMinutes) || 5,
  }).returning();
  res.json(row);
});

router.put("/affiliate/campaigns/:id", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  const { name, description, emailSubject, emailTemplate, sendIntervalMinutes } = req.body as any;
  const updates: Record<string, any> = { updatedAt: new Date() };
  if (name !== undefined) updates.name = name.trim();
  if (description !== undefined) updates.description = description;
  if (emailSubject !== undefined) updates.emailSubject = emailSubject;
  if (emailTemplate !== undefined) updates.emailTemplate = emailTemplate;
  if (sendIntervalMinutes !== undefined) updates.sendIntervalMinutes = Number(sendIntervalMinutes) || 5;
  await db.update(affiliateCampaignsTable).set(updates).where(eq(affiliateCampaignsTable.id, id));
  const [row] = await db.select().from(affiliateCampaignsTable).where(eq(affiliateCampaignsTable.id, id)).limit(1);
  res.json(row);
});

router.delete("/affiliate/campaigns/:id", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  // Stop sender if running
  const flag = activeSenders.get(id);
  if (flag) flag.running = false;
  // Delete contacts first
  await db.delete(affiliateContactsTable).where(eq(affiliateContactsTable.campaignId, id));
  await db.delete(affiliateCampaignsTable).where(eq(affiliateCampaignsTable.id, id));
  res.json({ ok: true });
});

// ─── Contacts ─────────────────────────────────────────────────────────────────

router.get("/affiliate/campaigns/:id/contacts", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  const contacts = await db.select().from(affiliateContactsTable)
    .where(eq(affiliateContactsTable.campaignId, id))
    .orderBy(asc(affiliateContactsTable.id));
  res.json(contacts);
});

router.post("/affiliate/campaigns/:id/contacts", requireAdmin, async (req, res) => {
  const campaignId = Number(req.params.id);
  const { contacts } = req.body as { contacts: { businessName: string; ownerName?: string; email?: string; phone?: string; website?: string; city?: string; country?: string; category?: string }[] };
  if (!Array.isArray(contacts) || contacts.length === 0) { res.status(400).json({ error: "contacts[] required" }); return; }

  const rows = await db.insert(affiliateContactsTable).values(
    contacts.map(c => ({
      campaignId,
      businessName: c.businessName || "",
      ownerName: c.ownerName || "",
      email: c.email || "",
      phone: c.phone || "",
      website: c.website || "",
      city: c.city || "",
      country: c.country || "",
      category: c.category || "",
      status: "pending",
    }))
  ).returning();

  // Update totalContacts count
  const allContacts = await db.select().from(affiliateContactsTable).where(eq(affiliateContactsTable.campaignId, campaignId));
  await db.update(affiliateCampaignsTable).set({ totalContacts: allContacts.length, updatedAt: new Date() }).where(eq(affiliateCampaignsTable.id, campaignId));

  res.json({ imported: rows.length });
});

router.delete("/affiliate/contacts/:contactId", requireAdmin, async (req, res) => {
  const contactId = Number(req.params.contactId);
  const [contact] = await db.select().from(affiliateContactsTable).where(eq(affiliateContactsTable.id, contactId)).limit(1);
  if (contact) {
    await db.delete(affiliateContactsTable).where(eq(affiliateContactsTable.id, contactId));
    // Update total
    const all = await db.select().from(affiliateContactsTable).where(eq(affiliateContactsTable.campaignId, contact.campaignId));
    await db.update(affiliateCampaignsTable).set({ totalContacts: all.length, updatedAt: new Date() }).where(eq(affiliateCampaignsTable.id, contact.campaignId));
  }
  res.json({ ok: true });
});

// Reset a failed/skipped contact back to pending
router.post("/affiliate/contacts/:contactId/reset", requireAdmin, async (req, res) => {
  const contactId = Number(req.params.contactId);
  await db.update(affiliateContactsTable).set({ status: "pending", errorMsg: "", sentAt: null }).where(eq(affiliateContactsTable.id, contactId));
  res.json({ ok: true });
});

// ─── Generate messages ────────────────────────────────────────────────────────

router.post("/affiliate/campaigns/:id/generate-messages", requireAdmin, async (req, res) => {
  const campaignId = Number(req.params.id);
  const { contactIds } = req.body as { contactIds?: number[] };

  const [campaign] = await db.select().from(affiliateCampaignsTable).where(eq(affiliateCampaignsTable.id, campaignId)).limit(1);
  if (!campaign) { res.status(404).json({ error: "Campaign not found" }); return; }
  if (!campaign.emailTemplate) { res.status(400).json({ error: "Set an email template first" }); return; }

  const contacts = await db.select().from(affiliateContactsTable)
    .where(and(
      eq(affiliateContactsTable.campaignId, campaignId),
      ...(contactIds?.length ? [] : [eq(affiliateContactsTable.status, "pending")])
    ))
    .orderBy(asc(affiliateContactsTable.id));

  const toProcess = contactIds?.length ? contacts.filter(c => contactIds.includes(c.id)) : contacts;

  res.setHeader("Content-Type", "application/json");
  res.setHeader("Transfer-Encoding", "chunked");

  let done = 0;
  const errors: string[] = [];

  for (const contact of toProcess) {
    try {
      const { subject, body } = await generateMessageForContact(
        campaign.emailTemplate,
        campaign.emailSubject,
        { businessName: contact.businessName, ownerName: contact.ownerName, city: contact.city, category: contact.category, website: contact.website }
      );
      await db.update(affiliateContactsTable)
        .set({ generatedMessage: body, generatedSubject: subject })
        .where(eq(affiliateContactsTable.id, contact.id));
      done++;
    } catch (e: any) {
      errors.push(`${contact.businessName}: ${e.message}`);
    }
  }

  res.json({ generated: done, errors });
});

// ─── Start / Pause ────────────────────────────────────────────────────────────

router.post("/affiliate/campaigns/:id/start", requireAdmin, async (req, res) => {
  const campaignId = Number(req.params.id);
  const [campaign] = await db.select().from(affiliateCampaignsTable).where(eq(affiliateCampaignsTable.id, campaignId)).limit(1);
  if (!campaign) { res.status(404).json({ error: "Campaign not found" }); return; }
  if (!campaign.emailTemplate) { res.status(400).json({ error: "Set an email template before sending" }); return; }

  // Check pending contacts
  const pending = await db.select().from(affiliateContactsTable)
    .where(and(eq(affiliateContactsTable.campaignId, campaignId), eq(affiliateContactsTable.status, "pending")));
  if (pending.length === 0) { res.status(400).json({ error: "No pending contacts to send to" }); return; }

  if (activeSenders.has(campaignId)) { res.json({ ok: true, message: "Already running" }); return; }

  // Mark running
  await db.update(affiliateCampaignsTable).set({ status: "running", updatedAt: new Date() }).where(eq(affiliateCampaignsTable.id, campaignId));

  const flag = { running: true };
  activeSenders.set(campaignId, flag);
  const intervalMs = (campaign.sendIntervalMinutes || 5) * 60 * 1000;

  // Launch background loop (don't await)
  runSendLoop(campaignId, intervalMs).catch(e => {
    console.error(`[affiliate] send loop error for campaign ${campaignId}:`, e.message);
  });

  res.json({ ok: true, pendingContacts: pending.length, intervalMinutes: campaign.sendIntervalMinutes });
});

router.post("/affiliate/campaigns/:id/pause", requireAdmin, async (req, res) => {
  const campaignId = Number(req.params.id);
  const flag = activeSenders.get(campaignId);
  if (flag) {
    flag.running = false;
    activeSenders.delete(campaignId);
  }
  await db.update(affiliateCampaignsTable).set({ status: "paused", updatedAt: new Date() }).where(eq(affiliateCampaignsTable.id, campaignId));
  res.json({ ok: true });
});

router.get("/affiliate/campaigns/:id/progress", requireAdmin, async (req, res) => {
  const campaignId = Number(req.params.id);
  const [campaign] = await db.select().from(affiliateCampaignsTable).where(eq(affiliateCampaignsTable.id, campaignId)).limit(1);
  if (!campaign) { res.status(404).json({ error: "Not found" }); return; }

  const contacts = await db.select().from(affiliateContactsTable).where(eq(affiliateContactsTable.campaignId, campaignId));
  const breakdown = { pending: 0, sent: 0, failed: 0, skipped: 0 };
  for (const c of contacts) breakdown[c.status as keyof typeof breakdown] = (breakdown[c.status as keyof typeof breakdown] || 0) + 1;

  res.json({ campaign, breakdown, isRunning: activeSenders.has(campaignId) });
});

export default router;
