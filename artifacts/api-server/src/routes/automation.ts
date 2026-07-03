import { Router } from "express";
import nodemailer from "nodemailer";
import { promises as dnsPromises } from "dns";
import { db, emailAccountsTable, automationSettingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { getGeminiAI } from "./api-keys";
import { sendMail as brevoSendMail, brevoTransporter } from "../lib/brevo-mailer";

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

async function generateText(prompt: string): Promise<string> {
  const ai = await getGeminiAI();
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    config: { maxOutputTokens: 8192 },
  });
  return response.text ?? "";
}

function parseJSON(text: string): any {
  const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  try { return JSON.parse(cleaned); } catch {
    const match = cleaned.match(/[\[\{][\s\S]*[\]\}]/);
    if (match) return JSON.parse(match[0]);
    throw new Error("Failed to parse AI response as JSON");
  }
}

// ─── Domain / email verification helpers ─────────────────────────────────────

function extractHostname(raw: string): string {
  if (!raw || raw.trim() === "" || /^(none|n\/a|no website|-)$/i.test(raw.trim())) return "";
  const s = raw.trim().startsWith("http") ? raw.trim() : `https://${raw.trim()}`;
  try { return new URL(s).hostname.replace(/^www\./, ""); }
  catch { return ""; }
}

async function verifyWebsiteDomain(website: string): Promise<boolean> {
  const host = extractHostname(website);
  if (!host) return true;
  try {
    await Promise.race([
      dnsPromises.lookup(host),
      new Promise<never>((_, r) => setTimeout(() => r(new Error("timeout")), 5000)),
    ]);
    return true;
  } catch { return false; }
}

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

async function filterLiveProspects(prospects: any[]): Promise<any[]> {
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
  return results.filter(r => r.ok).map(r => r.biz);
}

// ─── Placeholder filler ───────────────────────────────────────────────────────

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
    .replace(/\[\s*[A-Z][a-zA-Z\s]{1,30}\s*\]/g, (match) => {
      const inner = match.replace(/[\[\]]/g, "").trim().toLowerCase();
      if (inner.includes("name") || inner === "your" || inner === "sender") return senderName;
      if (inner.includes("agency") || inner.includes("company") || inner.includes("studio")) return agencyName;
      return match;
    });
}

// ─────────────────────────────────────────────────────────────────────────────

function maskPassword(acct: any) {
  return { ...acct, password: acct.password ? "••••••••" : "" };
}

async function getOrCreateSettings(): Promise<typeof automationSettingsTable.$inferSelect> {
  const rows = await db.select().from(automationSettingsTable).limit(1);
  if (rows.length > 0) return rows[0];
  const inserted = await db.insert(automationSettingsTable).values({}).returning();
  return inserted[0];
}

// ─── Email Accounts ───────────────────────────────────────────────────────────

router.get("/automation/email-accounts", async (_req, res) => {
  const accounts = await db.select().from(emailAccountsTable).orderBy(emailAccountsTable.id);
  res.json(accounts.map(maskPassword));
});

function cleanPassword(password: string): string {
  return (password || "").replace(/\s/g, "");
}

function validateCredentials(provider: string, cleanedPassword: string, user: string): string | null {
  if (provider === "gmail" && cleanedPassword.length !== 16) {
    return `Gmail requires a 16-character App Password (not your regular password). You provided ${cleanedPassword.length} characters. Generate one at myaccount.google.com/apppasswords.`;
  }
  if (provider === "sendgrid" && user.trim().toLowerCase() !== "apikey") {
    return `SendGrid requires the username to be exactly "apikey", not your email address.`;
  }
  if (provider === "resend" && user.trim().toLowerCase() !== "resend") {
    return `Resend requires the username to be exactly "resend".`;
  }
  return null;
}

router.post("/automation/email-accounts", async (req, res) => {
  const { label, provider, host, port, secure, user, password, fromName, fromEmail, imapEnabled, imapHost, imapPort } = req.body;
  if (!user) { res.status(400).json({ error: "user (email address) is required" }); return; }
  if (!password || !password.trim()) { res.status(400).json({ error: "Password / API key is required" }); return; }
  const cleanedPassword = cleanPassword(password);
  const validationError = validateCredentials(provider || "gmail", cleanedPassword, user);
  if (validationError) { res.status(400).json({ error: validationError }); return; }
  const inserted = await db.insert(emailAccountsTable).values({
    label: label || user,
    provider: provider || "gmail",
    host: host || "smtp.gmail.com",
    port: port || 587,
    secure: secure ?? false,
    user: user.trim(),
    password: cleanPassword(password),
    fromName: fromName || "DevStudio",
    fromEmail: fromEmail || "",
    imapEnabled: imapEnabled ?? false,
    imapHost: imapHost || "imap.gmail.com",
    imapPort: imapPort || 993,
    active: true,
  }).returning();
  res.json(maskPassword(inserted[0]));
});

router.put("/automation/email-accounts/:id", async (req, res) => {
  const id = Number(req.params.id);
  const { label, provider, host, port, secure, user, password, fromName, fromEmail, imapEnabled, imapHost, imapPort, active } = req.body;
  const existing = await db.select().from(emailAccountsTable).where(eq(emailAccountsTable.id, id)).limit(1);
  if (!existing.length) { res.status(404).json({ error: "Account not found" }); return; }
  const effectiveProvider = provider !== undefined ? provider : existing[0].provider;
  const effectiveUser = user !== undefined ? user : existing[0].user;
  if (password && password !== "••••••••") {
    const cleanedPassword = cleanPassword(password);
    const validationError = validateCredentials(effectiveProvider, cleanedPassword, effectiveUser);
    if (validationError) { res.status(400).json({ error: validationError }); return; }
  }
  const updated = await db.update(emailAccountsTable).set({
    ...(label !== undefined && { label }),
    ...(provider !== undefined && { provider }),
    ...(host !== undefined && { host }),
    ...(port !== undefined && { port }),
    ...(secure !== undefined && { secure }),
    ...(user !== undefined && { user }),
    ...(password && password !== "••••••••" ? { password: cleanPassword(password) } : {}),
    ...(fromName !== undefined && { fromName }),
    ...(fromEmail !== undefined && { fromEmail }),
    ...(imapEnabled !== undefined && { imapEnabled }),
    ...(imapHost !== undefined && { imapHost }),
    ...(imapPort !== undefined && { imapPort }),
    ...(active !== undefined && { active }),
  }).where(eq(emailAccountsTable.id, id)).returning();
  res.json(maskPassword(updated[0]));
});

router.delete("/automation/email-accounts/:id", async (req, res) => {
  const id = Number(req.params.id);
  await db.delete(emailAccountsTable).where(eq(emailAccountsTable.id, id));
  res.json({ success: true });
});

router.post("/automation/email-accounts/:id/test", async (req, res) => {
  const id = Number(req.params.id);
  const rows = await db.select().from(emailAccountsTable).where(eq(emailAccountsTable.id, id)).limit(1);
  if (!rows.length) { res.status(404).json({ error: "Account not found" }); return; }
  const acct = rows[0];
  if (!acct.user || !acct.password) { res.status(400).json({ error: "Account has no credentials saved" }); return; }
  try {
    const transporter = makeTransporter(acct);
    await transporter.verify();
    await transporter.sendMail({
      from: `"${acct.fromName}" <${acct.fromEmail || acct.user}>`,
      to: req.body.to || acct.user,
      subject: "DevStudio — Email Account Test",
      html: `<div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:24px;"><h2 style="color:#6d28d9;">✓ ${acct.label || acct.user} is working</h2><p>This account is correctly configured for automated outreach.</p></div>`,
    });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Brevo fallback test (uses server-level Brevo credentials) ────────────────

router.post("/automation/brevo-test", async (req, res) => {
  const to = req.body.to;
  if (!to) { res.status(400).json({ error: "Missing 'to' email address" }); return; }
  try {
    await brevoTransporter.verify();
    await brevoTransporter.sendMail({
      from: `"DevStudio" <${process.env.BREVO_SMTP_USER}>`,
      to,
      subject: "DevStudio — Brevo SMTP Test",
      html: `<div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:24px;"><h2 style="color:#6d28d9;">✓ Brevo SMTP is working</h2><p>Your outreach emails will be sent via Brevo (smtp-relay.brevo.com:587).</p><p style="color:#6b7280;font-size:13px;">Sent at: ${new Date().toISOString()}</p></div>`,
    });
    res.json({ success: true, message: "Test email sent via Brevo" });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── Automation Settings ──────────────────────────────────────────────────────

router.get("/automation/settings", async (_req, res) => {
  const settings = await getOrCreateSettings();
  res.json(settings);
});

router.put("/automation/settings", async (req, res) => {
  const current = await getOrCreateSettings();
  const {
    autoHuntEnabled, huntCategory, huntCity, huntCountry, huntCount,
    huntExtraContext, huntIntervalHours, autoScore, autoEmail,
    emailDelayMinutes, autoReply,
  } = req.body;

  const updated = await db.update(automationSettingsTable).set({
    ...(autoHuntEnabled !== undefined && { autoHuntEnabled }),
    ...(huntCategory !== undefined && { huntCategory }),
    ...(huntCity !== undefined && { huntCity }),
    ...(huntCountry !== undefined && { huntCountry }),
    ...(huntCount !== undefined && { huntCount }),
    ...(huntExtraContext !== undefined && { huntExtraContext }),
    ...(huntIntervalHours !== undefined && { huntIntervalHours }),
    ...(autoScore !== undefined && { autoScore }),
    ...(autoEmail !== undefined && { autoEmail }),
    ...(emailDelayMinutes !== undefined && { emailDelayMinutes }),
    ...(autoReply !== undefined && { autoReply }),
    updatedAt: new Date(),
    // recalculate nextRunAt if interval changed
    ...(autoHuntEnabled === true ? {
      nextRunAt: new Date(Date.now() + ((huntIntervalHours ?? current.huntIntervalHours) * 60 * 60 * 1000)),
    } : {}),
    ...(autoHuntEnabled === false ? { nextRunAt: null } : {}),
  }).where(eq(automationSettingsTable.id, current.id)).returning();
  res.json(updated[0]);
});

// ─── Automation Status (live run info) ───────────────────────────────────────

router.get("/automation/status", async (_req, res) => {
  const settings = await getOrCreateSettings();
  const accounts = await db.select().from(emailAccountsTable).where(eq(emailAccountsTable.active, true));
  res.json({
    enabled: settings.autoHuntEnabled,
    lastRunAt: settings.lastRunAt,
    nextRunAt: settings.nextRunAt,
    activeAccounts: accounts.length,
    stats: settings.runStats,
  });
});

// ─── Manual trigger ───────────────────────────────────────────────────────────

router.post("/automation/run-now", async (req, res) => {
  // Kick off without awaiting — respond immediately
  res.json({ success: true, message: "Automation run started" });
  runAutomationCycle().catch(() => {});
});

// ─── Core automation engine ───────────────────────────────────────────────────

export async function runAutomationCycle(overrides?: {
  category?: string; city?: string; country?: string; count?: number; extraContext?: string;
}) {
  const settings = await getOrCreateSettings();
  const cfg = {
    category: overrides?.category ?? settings.huntCategory,
    city: overrides?.city ?? settings.huntCity,
    country: overrides?.country ?? settings.huntCountry,
    count: overrides?.count ?? settings.huntCount,
    extraContext: overrides?.extraContext ?? settings.huntExtraContext,
  };

  if (!cfg.city) return;

  const runStats: Record<string, number> = { hunted: 0, scored: 0, emailed: 0, errors: 0 };

  // 1. Hunt businesses
  let businesses: any[] = [];
  try {
    const huntPrompt = `You are a business intelligence researcher. Generate a list of ${Math.min(cfg.count, 20)} realistic ${cfg.category} businesses in ${cfg.city}, ${cfg.country || ""}.
${cfg.extraContext ? `Additional context: ${cfg.extraContext}` : ""}
Return ONLY a JSON array. Each object:
{ "businessName":"string","ownerName":"string","category":"${cfg.category}","email":"string","phone":"string","website":"string","city":"${cfg.city}","country":"${cfg.country || ""}","instagram":"string","facebook":"string","linkedin":"string","softwareNeedScore":<1-10>,"painPoint":"string","estimatedValue":<number>,"notes":"string" }`;
    const text = await generateText(huntPrompt);
    businesses = parseJSON(text);
    if (!Array.isArray(businesses)) businesses = [];
    runStats.hunted = businesses.length;

    // Filter: discard businesses whose email domain has no MX records or whose website domain doesn't resolve in DNS
    businesses = await filterLiveProspects(businesses);
    runStats.filtered = runStats.hunted - businesses.length;
  } catch { runStats.errors++; }

  // 2. Auto-score + generate email content for each, then send
  const accounts = await db.select().from(emailAccountsTable).where(eq(emailAccountsTable.active, true));
  let accountIndex = 0;

  // Store prospects as JSON in runStats for display
  const prospectsSummary: any[] = [];

  for (let i = 0; i < businesses.length; i++) {
    const biz = businesses[i];
    let analysis: any = null;
    let emailContent: { subject: string; body: string } | null = null;

    if (settings.autoScore) {
      try {
        const autoPrompt = `You are a senior business analyst at DevStudio, a custom software agency.
Analyze this ${biz.category} business and generate analysis + cold email.
Business: ${biz.businessName}, Location: ${biz.city} ${biz.country}, Owner: ${biz.ownerName || "Owner"}, Website: ${biz.website || "No website"}, Pain Point: ${biz.painPoint || "manual processes"}
Return ONLY JSON: { "analysis": { "websiteScore":<0-100>,"leadScore":<0-100>,"conversionScore":<0-100>,"mobileScore":<0-100>,"seoScore":<0-100>,"growthPotential":<0-100>,"summary":"string","projectType":"string","estimatedValue":{"min":<n>,"max":<n>},"deliveryWeeks":{"min":<n>,"max":<n>},"recommendedFeatures":["string"],"issues":[{"title":"string","description":"string","priority":"high|medium|low"}],"opportunities":[{"title":"string","impact":"string","effort":"low|medium|high"}],"checks":{"responsiveDesign":false,"sslCertificate":false,"modernUI":false,"whatsappButton":false,"contactForm":false,"bookingSystem":false,"onlineOrdering":false,"paymentIntegration":false,"customerPortal":false,"membershipArea":false,"blog":false,"seoBasics":false,"analytics":false,"socialMedia":false,"emailCapture":false,"liveChat":false,"aiChatbot":false,"callToAction":false,"trustElements":false}}, "email":{"subject":"string","body":"string"} }`;
        const genText = await generateText(autoPrompt);
        const genData = parseJSON(genText);
        analysis = genData.analysis;
        emailContent = genData.email
          ? {
              subject: fillPlaceholders(genData.email.subject || ""),
              body: fillPlaceholders(genData.email.body || ""),
            }
          : null;
        runStats.scored++;
      } catch { runStats.errors++; }
    }

    prospectsSummary.push({
      businessName: biz.businessName, email: biz.email, city: biz.city,
      score: biz.softwareNeedScore, scored: !!analysis, emailed: false,
    });

    // 3. Send email — use DB accounts if available, otherwise fall back to Brevo
    const canSend = settings.autoEmail && biz.email && emailContent;
    if (canSend) {
      const html = emailContent!.body.split("\n").map(l => l.trim() ? `<p style="margin:0 0 12px;line-height:1.6;">${l}</p>` : "<br/>").join("");
      try {
        if (accounts.length > 0) {
          const acct = accounts[accountIndex % accounts.length];
          accountIndex++;
          const transporter = makeTransporter(acct);
          await transporter.sendMail({
            from: `"${acct.fromName}" <${acct.fromEmail || acct.user}>`,
            to: biz.email,
            subject: emailContent!.subject,
            text: emailContent!.body,
            html: `<div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;padding:24px;color:#1a1a2e;">${html}<hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;"/><p style="color:#6b7280;font-size:13px;">${acct.fromName}</p></div>`,
          });
        } else {
          // Brevo fallback — uses server-level credentials from env or DB
          await brevoSendMail({
            to: biz.email,
            subject: emailContent!.subject,
            text: emailContent!.body,
            html: `<div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;padding:24px;color:#1a1a2e;">${html}<hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;"/><p style="color:#6b7280;font-size:13px;">DevStudio</p></div>`,
          });
        }
        runStats.emailed++;
        prospectsSummary[prospectsSummary.length - 1].emailed = true;
        // Delay before next email (convert minutes to ms)
        if (i < businesses.length - 1 && settings.emailDelayMinutes > 0) {
          await new Promise(r => setTimeout(r, settings.emailDelayMinutes * 60 * 1000));
        }
      } catch { runStats.errors++; }
    }
  }

  // Update settings with run stats + timestamps
  const now = new Date();
  const nextRun = settings.autoHuntEnabled
    ? new Date(now.getTime() + settings.huntIntervalHours * 60 * 60 * 1000)
    : null;

  await db.update(automationSettingsTable).set({
    lastRunAt: now,
    nextRunAt: nextRun,
    runStats: { ...runStats, lastProspects: prospectsSummary.slice(0, 20), lastRunAt: now.toISOString() },
  }).where(eq(automationSettingsTable.id, settings.id));
}

// ─── IMAP reply checker ───────────────────────────────────────────────────────

router.post("/automation/check-replies", async (_req, res) => {
  res.json({ checked: 0, replied: 0, message: "Reply checking requires IMAP — enable it on your email accounts and ensure IMAP access is enabled in Gmail settings." });
});

// ─── Daily email account health check ────────────────────────────────────────

async function runHealthCheck() {
  const accounts = await db.select().from(emailAccountsTable).where(eq(emailAccountsTable.active, true));
  for (const acct of accounts) {
    if (!acct.user || !acct.password) continue;
    try {
      const transporter = makeTransporter(acct);
      await transporter.verify();
      await db.update(emailAccountsTable).set({
        lastError: "",
        lastErrorAt: null,
        consecutiveFailures: 0,
      }).where(eq(emailAccountsTable.id, acct.id));
    } catch (err: any) {
      await db.update(emailAccountsTable).set({
        lastError: err.message || "Verification failed",
        lastErrorAt: new Date(),
        consecutiveFailures: (acct.consecutiveFailures || 0) + 1,
      }).where(eq(emailAccountsTable.id, acct.id));
    }
  }
}

router.post("/automation/health-check", async (_req, res) => {
  try {
    await runHealthCheck();
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Scheduler (runs in-process) ─────────────────────────────────────────────

let schedulerTimer: ReturnType<typeof setTimeout> | null = null;
let healthCheckTimer: ReturnType<typeof setInterval> | null = null;

async function scheduleNext() {
  if (schedulerTimer) clearTimeout(schedulerTimer);
  const settings = await getOrCreateSettings().catch(() => null);
  if (!settings?.autoHuntEnabled || !settings.huntCity) return;
  const now = Date.now();
  const nextRun = settings.nextRunAt ? new Date(settings.nextRunAt).getTime() : now;
  const delay = Math.max(nextRun - now, 60_000); // at least 1 minute
  schedulerTimer = setTimeout(async () => {
    await runAutomationCycle().catch(() => {});
    scheduleNext();
  }, delay);
}

export function startScheduler() {
  scheduleNext().catch(() => {});
  // Re-check every 5 minutes in case settings changed
  setInterval(() => scheduleNext().catch(() => {}), 5 * 60 * 1000);

  // Run an initial account health check shortly after boot, then every 24h
  setTimeout(() => runHealthCheck().catch(() => {}), 30_000);
  if (healthCheckTimer) clearInterval(healthCheckTimer);
  healthCheckTimer = setInterval(() => runHealthCheck().catch(() => {}), 24 * 60 * 60 * 1000);
}

export default router;
