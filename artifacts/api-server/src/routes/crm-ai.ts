import { Router } from "express";
import nodemailer from "nodemailer";
import { randomUUID } from "crypto";
import { promises as dnsPromises } from "dns";
import { getGeminiAI } from "./api-keys";
import { db, emailAccountsTable, emailTrackingTable } from "@workspace/db";
import { eq, inArray, sql } from "drizzle-orm";
import { scrapeBusinessDirectories } from "../lib/business-scrapers";

const router = Router();

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeTransporter(acct: { host: string; port: number; secure: boolean; user: string; password: string }) {
  const port = acct.port || 587;
  const secure = port === 465;
  const pass = (acct.password || "").replace(/\s/g, "");
  const user = (acct.user || "").trim();
  return nodemailer.createTransport({
    host: acct.host,
    port,
    secure,
    requireTLS: !secure,
    auth: { user, pass },
    tls: { rejectUnauthorized: false },
    connectionTimeout: 15000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  } as any);
}

async function generateText(prompt: string, systemInstruction?: string): Promise<string> {
  const ai = await getGeminiAI();
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    config: {
      maxOutputTokens: 8192,
      ...(systemInstruction ? { systemInstruction } : {}),
    },
  });
  return response.text ?? "";
}

function parseJSON(text: string): any {
  const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const match = cleaned.match(/[\[\{][\s\S]*[\]\}]/);
    if (match) return JSON.parse(match[0]);
    throw new Error("Failed to parse AI response as JSON");
  }
}

// ─── Real website scraper ─────────────────────────────────────────────────────

/**
 * Fetch the actual HTML of a business website and return plain-text content
 * (scripts/styles stripped). Returns "" if URL is missing or fetch fails.
 * Used to give the AI real, specific content for hyper-personalised emails.
 */
async function scrapeWebsite(url: string): Promise<string> {
  if (!url || /^(none|n\/a|no website|-)$/i.test(url.trim())) return "";
  const fullUrl = url.startsWith("http") ? url : `https://${url}`;
  try {
    const res = await Promise.race([
      fetch(fullUrl, { headers: { "User-Agent": "Mozilla/5.0 (compatible; DevStudio/1.0)" } }),
      new Promise<never>((_, r) => setTimeout(() => r(new Error("timeout")), 8000)),
    ]) as Response;
    const html = await res.text();
    return html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/&[a-z#0-9]+;/gi, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 2500);
  } catch { return ""; }
}

// ─── Domain / email verification helpers ─────────────────────────────────────

/** Extract the bare hostname from a URL or raw domain string. Returns "" if unparseable. */
function extractHostname(raw: string): string {
  if (!raw || raw.trim() === "" || /^(none|n\/a|no website|-)$/i.test(raw.trim())) return "";
  const s = raw.trim().startsWith("http") ? raw.trim() : `https://${raw.trim()}`;
  try { return new URL(s).hostname.replace(/^www\./, ""); }
  catch { return ""; }
}

/**
 * Returns true if the domain has at least one A/AAAA record (i.e. is real and live).
 * Times out after 5 s so it never hangs the whole request.
 */
async function verifyWebsiteDomain(website: string): Promise<boolean> {
  const host = extractHostname(website);
  if (!host) return true; // no website listed → not a reason to discard
  try {
    await Promise.race([
      dnsPromises.lookup(host),
      new Promise<never>((_, r) => setTimeout(() => r(new Error("timeout")), 5000)),
    ]);
    return true;
  } catch { return false; }
}

/**
 * Returns true if the email's domain has at least one MX record.
 * Emails sent to a domain with no MX will always bounce.
 */
async function verifyEmailMx(email: string): Promise<boolean> {
  if (!email || !email.includes("@")) return false;
  const domain = email.split("@")[1].toLowerCase();
  try {
    const records = await Promise.race([
      dnsPromises.resolveMx(domain),
      new Promise<never>((_, r) => setTimeout(() => r(new Error("timeout")), 5000)),
    ]);
    return Array.isArray(records) && records.length > 0;
  } catch { return false; }
}

/**
 * Verify all prospects in parallel; return only those whose email domain has
 * MX records AND (if a website is listed) whose website domain resolves in DNS.
 */
async function filterLiveProspects(prospects: any[]): Promise<{ live: any[]; dead: number }> {
  const results = await Promise.all(
    prospects
      .filter(biz => biz && typeof biz === "object")
      .map(async (biz) => {
        const [emailOk, domainOk] = await Promise.all([
          verifyEmailMx(biz.email),
          verifyWebsiteDomain(biz.website),
        ]);
        return { biz, ok: emailOk && domainOk };
      })
  );
  const live = results.filter(r => r.ok).map(r => r.biz);
  return { live, dead: results.length - live.length };
}

// ─── Google Places API (optional enrichment) ──────────────────────────────────

/**
 * Search Google Places API for real, operational businesses.
 * Returns an empty array if GOOGLE_PLACES_API_KEY is not set.
 */
async function searchGooglePlaces(category: string, city: string, country: string, count: number): Promise<any[]> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) return [];

  const query = `${category} in ${city}${country ? ", " + country : ""}`;
  try {
    const res = await Promise.race([
      fetch("https://places.googleapis.com/v1/places:searchText", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask": "places.displayName,places.formattedAddress,places.nationalPhoneNumber,places.websiteUri,places.businessStatus",
        },
        body: JSON.stringify({ textQuery: query, maxResultCount: Math.min(count, 20), languageCode: "en" }),
      }),
      new Promise<never>((_, r) => setTimeout(() => r(new Error("timeout")), 10000)),
    ]) as Response;
    const data = await res.json() as any;
    return (data.places || []).filter((p: any) => !p.businessStatus || p.businessStatus === "OPERATIONAL");
  } catch { return []; }
}

// ─── Placeholder filler ───────────────────────────────────────────────────────

/**
 * Replace any unfilled bracket placeholders in AI-generated text with real values.
 * Covers patterns like [Your Name], [Agency Name], [Your Company], etc.
 */
function fillPlaceholders(
  text: string,
  senderName = "Daniel",
  agencyName = "DevStudio"
): string {
  return text
    .replace(/\[(?:your\s+)?name\]/gi, senderName)
    .replace(/\[sender(?:\s+name)?\]/gi, senderName)
    .replace(/\[(?:agency|company|your\s+(?:agency|company))(?:\s+name)?\]/gi, agencyName)
    .replace(/\[(?:from|your)\s+(?:email\s+)?signature\]/gi, agencyName)
    // catch any remaining single-word bracket token that looks like a placeholder
    .replace(/\[\s*[A-Z][a-zA-Z\s]{1,30}\s*\]/g, (match) => {
      const inner = match.replace(/[\[\]]/g, "").trim().toLowerCase();
      if (inner.includes("name") || inner === "your" || inner === "sender") return senderName;
      if (inner.includes("agency") || inner.includes("company") || inner.includes("studio")) return agencyName;
      return match; // leave truly unknown tokens as-is
    });
}

// ─── 1x1 transparent GIF for open-tracking pixel ─────────────────────────────

const PIXEL_GIF = Buffer.from(
  "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
  "base64"
);

// ─── Tracking helpers ─────────────────────────────────────────────────────────

function getBaseUrl(req: any): string {
  const host = req.get("host") || "";
  const proto = req.get("x-forwarded-proto") || req.protocol || "https";
  return `${proto}://${host}`;
}

async function createTracking(prospectEmail: string, subject: string, emailType: string): Promise<string> {
  const trackingId = randomUUID();
  await db.insert(emailTrackingTable).values({
    trackingId, prospectEmail, subject, emailType,
  });
  return trackingId;
}

function injectTracking(html: string, baseUrl: string, trackingId: string): string {
  const pixelUrl = `${baseUrl}/api/crm/track/open/${trackingId}`;
  const pixel = `<img src="${pixelUrl}" width="1" height="1" style="display:none;border:0;" alt="" />`;

  // Wrap every <a href="..."> link through the click tracker
  const tracked = html.replace(
    /<a\s([^>]*?)href="(https?:\/\/[^"]+)"([^>]*?)>/gi,
    (_match, before, url, after) => {
      const clickUrl = `${baseUrl}/api/crm/track/click/${trackingId}?url=${encodeURIComponent(url)}`;
      return `<a ${before}href="${clickUrl}"${after}>`;
    }
  );

  // Append pixel before </body> if present, otherwise at end
  if (tracked.includes("</body>")) {
    return tracked.replace("</body>", `${pixel}</body>`);
  }
  return tracked + pixel;
}

// ─── Account selection: round-robin by sentCount ──────────────────────────────

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function effectiveSentToday(a: typeof emailAccountsTable.$inferSelect): number {
  return a.lastSentDay === todayStr() ? a.sentToday : 0;
}

function maskAccount(a: typeof emailAccountsTable.$inferSelect) {
  return {
    id: a.id, label: a.label, provider: a.provider,
    host: a.host, port: a.port, secure: a.secure,
    user: a.user, fromName: a.fromName, fromEmail: a.fromEmail,
    active: a.active, sentCount: a.sentCount,
    dailyLimit: a.dailyLimit, sentToday: effectiveSentToday(a),
    consecutiveFailures: a.consecutiveFailures,
    lastError: a.lastError, lastErrorAt: (a.lastErrorAt as any)?.toISOString?.() ?? null,
    autoPaused: a.autoPaused,
    hasPassword: !!a.password,
    createdAt: (a.createdAt as any)?.toISOString?.() ?? String(a.createdAt),
  };
}

const MAX_CONSECUTIVE_FAILURES = 3;

async function autoSeedBrevo(): Promise<void> {
  const envUser = process.env.BREVO_SMTP_USER;
  const envPass = process.env.BREVO_PASS;
  if (!envUser || !envPass) return;
  // Only seed if there is literally no account at all
  const count = await db.select().from(emailAccountsTable).limit(1);
  if (count.length > 0) return;
  await db.insert(emailAccountsTable).values({
    label: "Brevo SMTP", provider: "brevo",
    host: "smtp-relay.brevo.com", port: 587, secure: false,
    user: envUser, password: envPass,
    fromName: "DevStudio", fromEmail: "", active: true, sentCount: 0,
  });
}

async function getNextAccount(excludeIds: number[] = []) {
  await autoSeedBrevo();
  const rows = await db.select().from(emailAccountsTable)
    .where(eq(emailAccountsTable.active, true));
  const today = todayStr();
  const eligible = rows
    .filter(a => !excludeIds.includes(a.id))
    .filter(a => !a.autoPaused)
    .filter(a => {
      const sentToday = a.lastSentDay === today ? a.sentToday : 0;
      return a.dailyLimit <= 0 || sentToday < a.dailyLimit;
    })
    .sort((a, b) => {
      const aToday = a.lastSentDay === today ? a.sentToday : 0;
      const bToday = b.lastSentDay === today ? b.sentToday : 0;
      if (aToday !== bToday) return aToday - bToday;
      if (a.sentCount !== b.sentCount) return a.sentCount - b.sentCount;
      return a.id - b.id;
    });
  return eligible[0] ?? null;
}

async function incrementSentCount(id: number) {
  const today = todayStr();
  const rows = await db.select().from(emailAccountsTable).where(eq(emailAccountsTable.id, id)).limit(1);
  const acct = rows[0];
  const sentToday = acct && acct.lastSentDay === today ? acct.sentToday + 1 : 1;
  await db.update(emailAccountsTable)
    .set({
      sentCount: sql`${emailAccountsTable.sentCount} + 1`,
      sentToday,
      lastSentDay: today,
      consecutiveFailures: 0,
      lastError: "",
    })
    .where(eq(emailAccountsTable.id, id));
}

async function recordFailure(id: number, message: string) {
  const rows = await db.select().from(emailAccountsTable).where(eq(emailAccountsTable.id, id)).limit(1);
  const acct = rows[0];
  if (!acct) return;
  const failures = acct.consecutiveFailures + 1;
  await db.update(emailAccountsTable)
    .set({
      consecutiveFailures: failures,
      lastError: message.slice(0, 500),
      lastErrorAt: new Date(),
      ...(failures >= MAX_CONSECUTIVE_FAILURES && { autoPaused: true }),
    })
    .where(eq(emailAccountsTable.id, id));
}

async function sendWithFailover(
  buildMail: (acct: typeof emailAccountsTable.$inferSelect) => Record<string, any>,
  preferredAccountId?: number
): Promise<{ acct: typeof emailAccountsTable.$inferSelect; result: any }> {
  const tried: number[] = [];
  let acct = preferredAccountId
    ? (await db.select().from(emailAccountsTable).where(eq(emailAccountsTable.id, preferredAccountId)).limit(1))[0] ?? null
    : await getNextAccount();

  let lastErr: any = null;
  for (let attempt = 0; attempt < 4; attempt++) {
    if (!acct || !acct.user || !acct.password) {
      throw new Error(lastErr?.message || "No active email account available (all accounts paused, over limit, or missing credentials).");
    }
    tried.push(acct.id);
    try {
      const transporter = makeTransporter(acct);
      const result = await transporter.sendMail(buildMail(acct));
      await incrementSentCount(acct.id);
      return { acct, result };
    } catch (err: any) {
      lastErr = err;
      await recordFailure(acct.id, err.message || String(err));
      acct = await getNextAccount(tried);
    }
  }
  throw new Error(lastErr?.message || "Failed to send after trying all available accounts.");
}

// ─── Email account CRUD ───────────────────────────────────────────────────────

router.get("/crm/email-accounts", async (_req, res) => {
  await autoSeedBrevo();
  const rows = await db.select().from(emailAccountsTable).orderBy(emailAccountsTable.id);
  res.json(rows.map(maskAccount));
});

router.post("/crm/email-accounts", async (req, res) => {
  const { label, provider, host, port, secure, user, password, fromName, fromEmail, dailyLimit } = req.body;
  if (!user || !password || !host) {
    res.status(400).json({ error: "host, user, and password are required" });
    return;
  }
  const inserted = await db.insert(emailAccountsTable).values({
    label: label || user, provider: provider || "smtp",
    host, port: port || 587, secure: secure ?? false,
    user, password, fromName: fromName || "DevStudio",
    fromEmail: fromEmail || "", active: true, sentCount: 0,
    dailyLimit: Number.isFinite(dailyLimit) ? Math.max(0, dailyLimit) : 0,
  }).returning();
  res.json({ success: true, account: maskAccount(inserted[0]) });
});

router.put("/crm/email-accounts/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const { label, provider, host, port, secure, user, password, fromName, fromEmail, active, dailyLimit, resetFailures } = req.body;
  const rows = await db.select().from(emailAccountsTable).where(eq(emailAccountsTable.id, id)).limit(1);
  const existing = rows[0];
  if (!existing) { res.status(404).json({ error: "Account not found" }); return; }
  const reactivating = active === true && existing.active === false;
  const updated = await db.update(emailAccountsTable).set({
    ...(label !== undefined && { label }),
    ...(provider !== undefined && { provider }),
    ...(host !== undefined && { host }),
    ...(port !== undefined && { port }),
    ...(secure !== undefined && { secure }),
    ...(user !== undefined && { user }),
    ...(password && password !== "••••••••" && { password }),
    ...(fromName !== undefined && { fromName }),
    ...(fromEmail !== undefined && { fromEmail }),
    ...(active !== undefined && { active }),
    ...(dailyLimit !== undefined && Number.isFinite(dailyLimit) && { dailyLimit: Math.max(0, dailyLimit) }),
    ...((resetFailures || reactivating) && { consecutiveFailures: 0, autoPaused: false, lastError: "" }),
  }).where(eq(emailAccountsTable.id, id)).returning();
  res.json({ success: true, account: maskAccount(updated[0]) });
});

router.delete("/crm/email-accounts/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  await db.delete(emailAccountsTable).where(eq(emailAccountsTable.id, id));
  res.json({ success: true });
});

// Direct single-account test — does NOT fail over, so the user can verify that specific account.
router.post("/crm/email-accounts/:id/test", async (req, res) => {
  const id = parseInt(req.params.id);
  const { to } = req.body as { to?: string };
  const rows = await db.select().from(emailAccountsTable).where(eq(emailAccountsTable.id, id)).limit(1);
  const acct = rows[0];
  if (!acct?.user || !acct?.password) {
    res.status(404).json({ error: "Account not found or missing credentials" });
    return;
  }
  try {
    const transporter = makeTransporter(acct);
    await transporter.sendMail({
      from: `"${acct.fromName}" <${acct.fromEmail || acct.user}>`,
      to: to || acct.user,
      subject: "DevStudio CRM — Email Test",
      text: `Account "${acct.label}" is working correctly.`,
      html: `<div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:24px;"><h2 style="color:#6d28d9;">✓ Account working</h2><p>Account <strong>${acct.label}</strong> (${acct.user}) is configured and sending correctly via ${acct.host}.</p></div>`,
    });
    await db.update(emailAccountsTable).set({ consecutiveFailures: 0, autoPaused: false, lastError: "" }).where(eq(emailAccountsTable.id, id));
    res.json({ success: true });
  } catch (err: any) {
    await recordFailure(id, err.message || String(err));
    res.status(500).json({ error: err.message });
  }
});

// Legacy test-email (uses rotation + failover across active accounts)
router.post("/crm/test-email", async (req, res) => {
  const { to } = req.body as { to?: string };
  try {
    const { acct } = await sendWithFailover((a) => ({
      from: `"${a.fromName}" <${a.fromEmail || a.user}>`,
      to: to || a.user,
      subject: "DevStudio CRM — Email Test",
      text: "Email is configured correctly.",
      html: `<div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:24px;"><h2 style="color:#6d28d9;">✓ Email working</h2><p>Sending via <strong>${a.label}</strong> (${a.user}).</p></div>`,
    }));
    res.json({ success: true, sentVia: acct.label });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ─── Send email to prospect ───────────────────────────────────────────────────

router.post("/crm/send-email", async (req, res) => {
  const { to, subject, body, prospectName, accountId } = req.body as {
    to: string; subject: string; body: string; prospectName?: string; accountId?: number;
  };

  if (!to || !subject || !body) {
    res.status(400).json({ error: "to, subject, and body are required" });
    return;
  }

  try {
    const baseUrl = getBaseUrl(req);
    const trackingId = await createTracking(to, subject, "outreach");
    const htmlBody = body.split("\n").map((line) => (line.trim() ? `<p style="margin:0 0 12px;line-height:1.6;">${line}</p>` : "<br/>")).join("");
    const { acct } = await sendWithFailover((a) => {
      const rawHtml = `<div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;padding:24px;color:#1a1a2e;">${htmlBody}<hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;"/><p style="color:#6b7280;font-size:13px;">${a.fromName}</p></div>`;
      return {
        from: `"${a.fromName}" <${a.fromEmail || a.user}>`,
        to, subject, text: body,
        html: injectTracking(rawHtml, baseUrl, trackingId),
      };
    }, accountId);
    res.json({ success: true, to, sentAt: new Date().toISOString(), trackingId, sentVia: acct.label });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ─── Send proposal email ──────────────────────────────────────────────────────

router.post("/crm/send-proposal-email", async (req, res) => {
  const { to, prospectName, proposal, agencyName } = req.body as {
    to: string; prospectName: string; proposal: any; agencyName?: string;
  };
  if (!to || !proposal) { res.status(400).json({ error: "to and proposal are required" }); return; }

  const p = proposal.sections;
  const agency = agencyName || "DevStudio";

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f8f9fa;font-family:Georgia,serif;">
<div style="max-width:680px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

  <div style="background:linear-gradient(135deg,#6d28d9,#4f46e5);padding:40px 32px;color:#fff;">
    <div style="font-size:13px;letter-spacing:2px;text-transform:uppercase;opacity:0.8;margin-bottom:8px;">Software Proposal</div>
    <h1 style="margin:0 0 8px;font-size:28px;font-weight:700;">${prospectName}</h1>
    <p style="margin:0;opacity:0.85;font-size:15px;">Prepared exclusively by ${agency}</p>
  </div>

  ${p?.executiveSummary ? `
  <div style="padding:28px 32px;border-bottom:1px solid #f0f0f0;">
    <h2 style="color:#6d28d9;font-size:15px;text-transform:uppercase;letter-spacing:1px;margin:0 0 12px;">Executive Summary</h2>
    <p style="color:#374151;line-height:1.7;margin:0;">${p.executiveSummary}</p>
  </div>` : ""}

  ${p?.problems?.length ? `
  <div style="padding:28px 32px;border-bottom:1px solid #f0f0f0;background:#fef9f0;">
    <h2 style="color:#d97706;font-size:15px;text-transform:uppercase;letter-spacing:1px;margin:0 0 16px;">Problems We Identified</h2>
    ${p.problems.map((pb: string) => `<div style="display:flex;align-items:flex-start;gap:12px;margin-bottom:10px;"><span style="color:#ef4444;font-size:18px;flex-shrink:0;">⚠</span><p style="margin:0;color:#374151;line-height:1.6;">${pb}</p></div>`).join("")}
  </div>` : ""}

  ${p?.features?.length ? `
  <div style="padding:28px 32px;border-bottom:1px solid #f0f0f0;">
    <h2 style="color:#6d28d9;font-size:15px;text-transform:uppercase;letter-spacing:1px;margin:0 0 16px;">What We'll Build For You</h2>
    <div style="display:grid;gap:12px;">
      ${p.features.map((f: any) => `<div style="background:#f5f3ff;border-left:4px solid #6d28d9;padding:14px 16px;border-radius:0 8px 8px 0;"><div style="font-weight:700;color:#4c1d95;margin-bottom:4px;">${f.name}</div><div style="color:#6b7280;font-size:14px;line-height:1.5;">${f.desc}</div></div>`).join("")}
    </div>
  </div>` : ""}

  ${p?.benefits?.length ? `
  <div style="padding:28px 32px;border-bottom:1px solid #f0f0f0;background:#f0fdf4;">
    <h2 style="color:#16a34a;font-size:15px;text-transform:uppercase;letter-spacing:1px;margin:0 0 16px;">Business Benefits</h2>
    ${p.benefits.map((b: string) => `<div style="display:flex;align-items:flex-start;gap:12px;margin-bottom:10px;"><span style="color:#16a34a;font-size:18px;flex-shrink:0;">✓</span><p style="margin:0;color:#374151;line-height:1.6;">${b}</p></div>`).join("")}
  </div>` : ""}

  ${p?.timeline?.length ? `
  <div style="padding:28px 32px;border-bottom:1px solid #f0f0f0;">
    <h2 style="color:#6d28d9;font-size:15px;text-transform:uppercase;letter-spacing:1px;margin:0 0 16px;">Delivery Timeline</h2>
    ${p.timeline.map((t: any, i: number) => `<div style="display:flex;gap:16px;margin-bottom:14px;align-items:flex-start;"><div style="background:#6d28d9;color:#fff;font-size:11px;font-weight:700;padding:4px 10px;border-radius:20px;white-space:nowrap;flex-shrink:0;">${t.week}</div><p style="margin:0;color:#374151;line-height:1.6;">${t.task}</p></div>`).join("")}
  </div>` : ""}

  ${p?.investment ? `
  <div style="padding:28px 32px;border-bottom:1px solid #f0f0f0;background:#f5f3ff;">
    <h2 style="color:#6d28d9;font-size:15px;text-transform:uppercase;letter-spacing:1px;margin:0 0 12px;">Investment</h2>
    <p style="color:#374151;line-height:1.7;margin:0;">${p.investment}</p>
  </div>` : ""}

  ${p?.nextSteps?.length ? `
  <div style="padding:28px 32px;border-bottom:1px solid #f0f0f0;">
    <h2 style="color:#6d28d9;font-size:15px;text-transform:uppercase;letter-spacing:1px;margin:0 0 16px;">Next Steps</h2>
    ${p.nextSteps.map((s: string, i: number) => `<div style="display:flex;gap:14px;margin-bottom:12px;align-items:flex-start;"><div style="width:28px;height:28px;background:#6d28d9;color:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px;flex-shrink:0;">${i + 1}</div><p style="margin:0;color:#374151;line-height:1.6;padding-top:4px;">${s}</p></div>`).join("")}
  </div>` : ""}

  <div style="padding:32px;background:#1a1a2e;text-align:center;">
    <p style="color:#fff;font-size:16px;font-weight:700;margin:0 0 8px;">${agency}</p>
    <p style="color:#9ca3af;font-size:13px;margin:0;">Ready to get started? Reply to this email.</p>
  </div>

</div>
</body>
</html>`;

  try {
    const baseUrl = getBaseUrl(req);
    const subject = `Your Custom Software Proposal — ${prospectName}`;
    const trackingId = await createTracking(to, subject, "proposal");
    const trackedHtml = injectTracking(html, baseUrl, trackingId);
    const { acct } = await sendWithFailover((a) => ({
      from: `"${a.fromName}" <${a.fromEmail || a.user}>`,
      to, subject, html: trackedHtml,
    }));
    res.json({ success: true, to, sentAt: new Date().toISOString(), trackingId, sentVia: acct.label });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ─── Email Tracking endpoints ─────────────────────────────────────────────────

// Open pixel
router.get("/crm/track/open/:trackingId", async (req, res) => {
  const { trackingId } = req.params;
  try {
    const now = new Date();
    const rows = await db.select().from(emailTrackingTable)
      .where(eq(emailTrackingTable.trackingId, trackingId)).limit(1);
    if (rows[0]) {
      await db.update(emailTrackingTable).set({
        opens: sql`${emailTrackingTable.opens} + 1`,
        lastOpenAt: now,
        firstOpenAt: rows[0].firstOpenAt ?? now,
      }).where(eq(emailTrackingTable.trackingId, trackingId));
    }
  } catch { /* silent — never break email clients */ }
  res.set("Content-Type", "image/gif");
  res.set("Cache-Control", "no-store, no-cache, must-revalidate");
  res.set("Pragma", "no-cache");
  res.send(PIXEL_GIF);
});

// Click redirect
router.get("/crm/track/click/:trackingId", async (req, res) => {
  const { trackingId } = req.params;
  const url = req.query.url as string;
  try {
    const now = new Date();
    const rows = await db.select().from(emailTrackingTable)
      .where(eq(emailTrackingTable.trackingId, trackingId)).limit(1);
    if (rows[0]) {
      await db.update(emailTrackingTable).set({
        clicks: sql`${emailTrackingTable.clicks} + 1`,
        firstClickAt: rows[0].firstClickAt ?? now,
      }).where(eq(emailTrackingTable.trackingId, trackingId));
    }
  } catch { /* silent */ }
  res.redirect(url && url.startsWith("http") ? url : "/");
});

// Batch stats by email list
router.get("/crm/track/stats", async (req, res) => {
  const emailsParam = req.query.emails as string;
  if (!emailsParam) { res.json({}); return; }
  const emails = emailsParam.split(",").map(e => e.trim()).filter(Boolean).slice(0, 100);
  if (emails.length === 0) { res.json({}); return; }
  try {
    const rows = await db.select().from(emailTrackingTable)
      .where(inArray(emailTrackingTable.prospectEmail, emails));
    const map: Record<string, { opens: number; clicks: number; firstOpenAt: string | null; lastOpenAt: string | null; firstClickAt: string | null; count: number }> = {};
    for (const r of rows) {
      const prev = map[r.prospectEmail];
      if (!prev) {
        map[r.prospectEmail] = {
          opens: r.opens, clicks: r.clicks,
          firstOpenAt: r.firstOpenAt?.toISOString() ?? null,
          lastOpenAt: r.lastOpenAt?.toISOString() ?? null,
          firstClickAt: r.firstClickAt?.toISOString() ?? null,
          count: 1,
        };
      } else {
        prev.opens += r.opens;
        prev.clicks += r.clicks;
        prev.count++;
        if (r.firstOpenAt && (!prev.firstOpenAt || r.firstOpenAt.toISOString() < prev.firstOpenAt)) prev.firstOpenAt = r.firstOpenAt.toISOString();
        if (r.lastOpenAt && (!prev.lastOpenAt || r.lastOpenAt.toISOString() > prev.lastOpenAt)) prev.lastOpenAt = r.lastOpenAt.toISOString();
        if (r.firstClickAt && (!prev.firstClickAt || r.firstClickAt.toISOString() < prev.firstClickAt)) prev.firstClickAt = r.firstClickAt.toISOString();
      }
    }
    res.json(map);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get all tracking events for a single prospect email
router.get("/crm/track/history/:email", async (req, res) => {
  try {
    const email = decodeURIComponent(req.params.email);
    const rows = await db.select().from(emailTrackingTable)
      .where(eq(emailTrackingTable.prospectEmail, email))
      .orderBy(emailTrackingTable.sentAt);
    res.json(rows.map(r => ({
      trackingId: r.trackingId,
      subject: r.subject,
      emailType: r.emailType,
      opens: r.opens,
      clicks: r.clicks,
      firstOpenAt: r.firstOpenAt?.toISOString() ?? null,
      lastOpenAt: r.lastOpenAt?.toISOString() ?? null,
      firstClickAt: r.firstClickAt?.toISOString() ?? null,
      sentAt: r.sentAt.toISOString(),
    })));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Business Hunter ──────────────────────────────────────────────────────────

router.post("/crm/hunt-businesses", async (req, res) => {
  const { category, city, country, count = 10, extraContext } = req.body as {
    category: string; city: string; country: string; count?: number; extraContext?: string;
  };
  if (!category || !city) { res.status(400).json({ error: "category and city are required" }); return; }

  const needed = Math.min(Number(count) || 10, 200);

  try {
    let raw: any[] = [];
    const sourceLog: string[] = [];

    // ── Step 1: Multi-source directory scraper (Yelp, YP, Google, Manta, ─────
    // ──         Hotfrog, Yell, Foursquare, Bing) — all in parallel          ──
    const { businesses: scraped, sources, errors } = await scrapeBusinessDirectories(category, city, country || "", needed);

    if (scraped.length > 0) {
      sourceLog.push(...sources);
      raw = scraped
        .filter(b => b.businessName)
        .map(b => ({
          businessName: b.businessName,
          ownerName: "",
          category: b.category || category,
          email: b.email || "",
          phone: b.phone || "",
          website: b.website || "",
          city: b.city || city,
          country: b.country || country || "",
          instagram: "",
          facebook: "",
          linkedin: "",
          softwareNeedScore: 5,
          painPoint: "",
          estimatedValue: 0,
          notes: b.address || "",
          source: b.source,
        }));
    }

    // Log scraper diagnostics to server console for debugging (never sent to client)
    if (Object.keys(errors).length > 0) {
      console.warn("[hunt-businesses] scraper errors:", errors);
    }

    // ── Step 2: Supplement with Google Places API if key is configured ────────
    if (raw.length < needed && process.env.GOOGLE_PLACES_API_KEY) {
      const places = await searchGooglePlaces(category, city, country, needed - raw.length);
      if (places.length > 0) {
        sourceLog.push("google_places");
        raw.push(...places.map((p: any) => ({
          businessName: p.displayName?.text || "",
          ownerName: "",
          category,
          email: "",
          phone: p.nationalPhoneNumber || "",
          website: p.websiteUri || "",
          city,
          country: country || "",
          instagram: "",
          facebook: "",
          linkedin: "",
          softwareNeedScore: 5,
          painPoint: "",
          estimatedValue: 0,
          notes: p.formattedAddress || "",
          source: "google_places",
        })));
      }
    }

    // ── Step 3: AI fallback if directories came up short ──────────────────────
    if (raw.length < Math.ceil(needed / 2)) {
      sourceLog.push("ai_fallback");
      const prompt = `You are a business intelligence researcher. Generate a list of ${needed - raw.length} realistic ${category} businesses in ${city}, ${country || ""}.
${extraContext ? `Additional context: ${extraContext}` : ""}
Use realistic local naming, email patterns (info@, hello@, owner first name), phone formats, and websites for ${city}.
For each, estimate how much they would benefit from custom software (softwareNeedScore 1-10) and describe their main pain point.
Return ONLY a JSON array. Each object must have:
{ "businessName":"string","ownerName":"string","category":"${category}","email":"string","phone":"string","website":"string","city":"${city}","country":"${country || ""}","instagram":"string","facebook":"string","linkedin":"string","softwareNeedScore":<1-10>,"painPoint":"string","estimatedValue":<number>,"notes":"string" }`;
      try {
        const text = await generateText(prompt);
        const data = parseJSON(text);
        const aiBizes: any[] = Array.isArray(data) ? data : data.businesses || [];
        raw.push(...aiBizes.map(b => ({ ...b, source: "ai" })));
      } catch {}
    }

    // ── Step 4: Deduplicate by normalized name ────────────────────────────────
    const seen = new Set<string>();
    raw = raw.filter(b => {
      const key = b.businessName?.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 40);
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    // ── Step 5: MX / DNS verification ────────────────────────────────────────
    const { live, dead } = await filterLiveProspects(raw);

    res.json({
      prospects: live,
      filtered: dead,
      total: raw.length,
      sources: [...new Set(sourceLog)],
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Auto-analyze + generate everything for a hunted prospect ─────────────────

router.post("/crm/auto-generate", async (req, res) => {
  const { businessName, category, website, city, country, ownerName, painPoint, agencyName } = req.body as Record<string, string>;

  // Scrape the real website so the AI references actual content
  const siteContent = await scrapeWebsite(website);
  const siteContext = siteContent
    ? `\nReal website content scraped from ${website}:\n"""\n${siteContent}\n"""`
    : (website ? `\nWebsite ${website} could not be loaded.` : "\nNo website.");

  const prompt = `You are a senior business analyst and sales copywriter at ${agencyName || "DevStudio"}, a custom software agency run by Daniel.
Analyze this business and generate everything needed to start the sales process — all in one response.
Business: ${businessName}, Category: ${category}, Location: ${city}, ${country}, Owner: ${ownerName || "the owner"}, Website: ${website || "No website"}, Known Pain Point: ${painPoint || "Manual processes, outdated systems"}${siteContext}

For the cold email and WhatsApp/LinkedIn messages, follow this high-converting framework:
1. ONE specific observation pulled directly from their real website content (name something real — an actual service, product, gap, or outdated element you noticed)
2. The exact business problem that costs them money or customers right now
3. What DevStudio would build to fix it (one sentence, concrete)
4. CTA: End with one low-pressure question inviting them to reply by email — something like "Does this sound relevant to where you're at? Just hit reply." NO mention of a call whatsoever.
RULES: Email body max 100 words. No "I hope this finds you well". No buzzwords. Sound like a real human, not a template. Subject line: max 6 words, curiosity-driven. Sign off as "Daniel, DevStudio". If no website content is available, make the observation specific to their business category.

Return ONLY a JSON object with this exact structure:
{ "analysis":{"websiteScore":<0-100>,"leadScore":<0-100>,"conversionScore":<0-100>,"mobileScore":<0-100>,"seoScore":<0-100>,"growthPotential":<0-100>,"checks":{"responsiveDesign":<bool>,"sslCertificate":<bool>,"modernUI":<bool>,"whatsappButton":<bool>,"contactForm":<bool>,"bookingSystem":<bool>,"onlineOrdering":<bool>,"paymentIntegration":<bool>,"customerPortal":<bool>,"membershipArea":<bool>,"blog":<bool>,"seoBasics":<bool>,"analytics":<bool>,"socialMedia":<bool>,"emailCapture":<bool>,"liveChat":<bool>,"aiChatbot":<bool>,"callToAction":<bool>,"trustElements":<bool>},"issues":[{"title":"string","description":"string","priority":"high|medium|low"}],"opportunities":[{"title":"string","impact":"string","effort":"low|medium|high"}],"recommendedFeatures":["string"],"projectType":"Small Website|Medium Web App|Large SaaS","estimatedValue":{"min":<number>,"max":<number>},"deliveryWeeks":{"min":<number>,"max":<number>},"summary":"2-3 sentence plain English summary"}, "email":{"subject":"string","body":"string"},"whatsapp":"string","linkedin":"string" }
Be specific to a ${category} business in ${city}. If no website, give website scores of 5-25.`;
  try {
    const text = await generateText(prompt);
    const data = parseJSON(text);
    // Fill any bracket placeholders the AI left in generated email/messages
    if (data?.email?.body) data.email.body = fillPlaceholders(data.email.body);
    if (data?.email?.subject) data.email.subject = fillPlaceholders(data.email.subject);
    if (data?.whatsapp) data.whatsapp = fillPlaceholders(data.whatsapp);
    if (data?.linkedin) data.linkedin = fillPlaceholders(data.linkedin);
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Existing routes ──────────────────────────────────────────────────────────

router.post("/crm/analyze-website", async (req, res) => {
  try {
    const { website, businessName, category } = req.body as { website: string; businessName: string; category: string };
    if (!businessName) { res.status(400).json({ error: "businessName required" }); return; }
    const prompt = `You are an expert web analyst and business consultant. Analyze this business and produce a detailed JSON report.
Business Name: ${businessName}, Business Category: ${category || "Unknown"}, Website: ${website || "No website provided"}
Produce a JSON object with EXACTLY this structure (no markdown, pure JSON):
{ "websiteScore":<0-100>,"leadScore":<0-100>,"conversionScore":<0-100>,"mobileScore":<0-100>,"seoScore":<0-100>,"growthPotential":<0-100>,"checks":{"responsiveDesign":<true/false>,"sslCertificate":<true/false>,"modernUI":<true/false>,"whatsappButton":<true/false>,"contactForm":<true/false>,"bookingSystem":<true/false>,"onlineOrdering":<true/false>,"paymentIntegration":<true/false>,"customerPortal":<true/false>,"membershipArea":<true/false>,"blog":<true/false>,"seoBasics":<true/false>,"analytics":<true/false>,"socialMedia":<true/false>,"emailCapture":<true/false>,"liveChat":<true/false>,"aiChatbot":<true/false>,"callToAction":<true/false>,"trustElements":<true/false>},"issues":[{"title":"string","description":"string","priority":"high|medium|low"}],"opportunities":[{"title":"string","impact":"string","effort":"low|medium|high"}],"recommendedFeatures":["string"],"projectType":"Small Website|Medium Web App|Large SaaS","estimatedValue":{"min":<number>,"max":<number>},"deliveryWeeks":{"min":<number>,"max":<number>},"summary":"2-3 sentence plain English summary" }
Be realistic and specific to a ${category} business. If no website is provided, give scores of 0-20 for all website metrics.`;
    const text = await generateText(prompt);
    const data = parseJSON(text);
    res.json(data);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.post("/crm/generate-email", async (req, res) => {
  try {
    const { businessName, ownerName, category, website, issues, opportunities, agencyName } = req.body as Record<string, string>;

    // Scrape real website for genuine personalisation
    const siteContent = await scrapeWebsite(website);
    const siteContext = siteContent
      ? `\nReal content from their website:\n"""\n${siteContent}\n"""`
      : "";

    const prompt = `Write a high-converting cold outreach email from Daniel at ${agencyName || "DevStudio"} to ${businessName}, a ${category || "business"}.
Context: Owner: ${ownerName || "the owner"}, Website: ${website || "no website"}, Issues found: ${issues || "outdated systems, no online booking"}, Opportunity: ${opportunities || "custom software to save time and grow revenue"}${siteContext}

Framework (follow exactly):
1. Open with ONE specific observation from their actual website or business type — name something real (a service, a gap, something you noticed)
2. Name the exact pain point this causes (lost bookings, manual work, missed revenue)
3. One sentence: what you'd build to fix it
4. CTA: A single low-pressure question asking them to reply by email — e.g. "Does any of this apply to you? Just hit reply." Do NOT mention a call at all.

RULES: Max 100 words body. NEVER say "I hope this finds you well", "I wanted to reach out", or any AI filler. No buzzwords. Subject: max 6 words, curiosity-driven. Sign off: "Daniel, DevStudio". Sound like a real person wrote this at 9am.
Return JSON: { "subject":"string","body":"string" }`;
    const text = await generateText(prompt);
    const data = parseJSON(text);
    if (data?.subject) data.subject = fillPlaceholders(data.subject);
    if (data?.body) data.body = fillPlaceholders(data.body);
    res.json(data);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.post("/crm/generate-whatsapp", async (req, res) => {
  try {
    const { businessName, category, opportunities, agencyName } = req.body as Record<string, string>;
    const prompt = `Write a WhatsApp outreach message from ${agencyName || "DevStudio"} to ${businessName}, a ${category || "business"}.
Key opportunity: ${opportunities || "help them get more customers with custom software"}
Rules: Max 120 words. Friendly, conversational tone. Professional but not stiff. No hype or spam language. ONE clear CTA. No emojis except 1-2 max. Natural, sounds like a real person wrote it.
Return JSON: { "message":"string" }`;
    const text = await generateText(prompt);
    const data = parseJSON(text);
    if (data?.message) data.message = fillPlaceholders(data.message);
    res.json(data);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.post("/crm/generate-linkedin", async (req, res) => {
  try {
    const { businessName, ownerName, category, agencyName } = req.body as Record<string, string>;
    const prompt = `Write a LinkedIn connection request message from ${agencyName || "DevStudio"} to ${ownerName || "the owner"} of ${businessName}, a ${category || "business"}.
Rules: Max 300 characters. Professional and genuine. No generic phrases. Mention their industry specifically. No pitch in the connection request — just a genuine reason to connect.
Return JSON: { "message":"string" }`;
    const text = await generateText(prompt);
    const data = parseJSON(text);
    if (data?.message) data.message = fillPlaceholders(data.message);
    res.json(data);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.post("/crm/generate-proposal", async (req, res) => {
  try {
    const { businessName, category, issues, features, estimatedValue, agencyName, website } = req.body as Record<string, string>;
    const prompt = `Write a professional software proposal from ${agencyName || "DevStudio"} for ${businessName}, a ${category || "business"}.
Context: Website: ${website || "No website"}, Problems found: ${issues || "manual processes, no online booking, poor digital presence"}, Recommended features: ${features || "booking system, customer portal, admin dashboard, payment integration"}, Estimated value: ${estimatedValue || "$500 - $1500"}
Write a full proposal with these sections:
1. Executive Summary (2-3 sentences)
2. Current Digital Situation (what they have now and what's missing)
3. Problems We Found (3-5 specific bullet points)
4. Our Recommended Solution (describe the custom software)
5. Key Features (bullet list with one-line description each)
6. Business Benefits (5 measurable/realistic benefits)
7. Delivery Timeline (week by week breakdown)
8. Investment (pricing tiers if applicable)
9. Why Choose ${agencyName || "DevStudio"} (3 compelling points)
10. Next Steps (clear 3-step action plan)
Be specific, professional, and persuasive. Every point should be specific to a ${category} business.
Return JSON: { "sections":{"executiveSummary":"string","situation":"string","problems":["string"],"solution":"string","features":[{"name":"string","desc":"string"}],"benefits":["string"],"timeline":[{"week":"string","task":"string"}],"investment":"string","whyUs":["string"],"nextSteps":["string"]} }`;
    const text = await generateText(prompt);
    const data = parseJSON(text);
    res.json(data);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.post("/crm/generate-followup", async (req, res) => {
  try {
    const { businessName, ownerName, day, previousContext, agencyName } = req.body as Record<string, string>;
    const prompt = `Write a follow-up message for day ${day || "3"} after initial outreach to ${businessName}.
Previous context: ${previousContext || "Sent initial cold email about custom software development"}
Contact: ${ownerName || "Business Owner"}, Agency: ${agencyName || "DevStudio"}
Rules: Day 3: gentle, add value or insight. Day 7: different angle, ask a question. Day 14: share a relevant result/case study angle. Day 30: final check-in, door still open. Max 100 words. No "just following up" phrases. Human, genuine, zero pressure.
Return JSON: { "subject":"string","body":"string","channel":"email" }`;
    const text = await generateText(prompt);
    const data = parseJSON(text);
    res.json(data);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

export default router;
