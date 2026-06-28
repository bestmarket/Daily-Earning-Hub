import { Router } from "express";
import nodemailer from "nodemailer";
import { getGeminiAI } from "./api-keys";
import { db, emailAccountsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

// ─── Get the primary (first active) email account from DB ─────────────────────

async function getPrimaryAccount() {
  const rows = await db.select().from(emailAccountsTable).where(eq(emailAccountsTable.active, true)).orderBy(emailAccountsTable.id).limit(1);
  return rows[0] ?? null;
}

// ─── Legacy email config endpoint (keeps old UI working) ──────────────────────
// These now read/write the primary account in DB so password persists across restarts.

router.get("/crm/email-config", async (_req, res) => {
  const acct = await getPrimaryAccount();
  if (!acct) {
    res.json({ provider: "gmail", host: "smtp.gmail.com", port: 587, secure: false, user: "", password: "", fromName: "DevStudio", fromEmail: "" });
    return;
  }
  res.json({
    provider: acct.provider, host: acct.host, port: acct.port,
    secure: acct.secure, user: acct.user,
    password: acct.password ? "••••••••" : "",
    fromName: acct.fromName, fromEmail: acct.fromEmail,
  });
});

router.post("/crm/email-config", async (req, res) => {
  const { provider, host, port, secure, user, password, fromName, fromEmail } = req.body;
  const existing = await getPrimaryAccount();

  if (existing) {
    const updated = await db.update(emailAccountsTable).set({
      provider: provider || existing.provider,
      host: host || existing.host,
      port: port || existing.port,
      secure: secure ?? existing.secure,
      user: user || existing.user,
      password: password && password !== "••••••••" ? password : existing.password,
      fromName: fromName || existing.fromName,
      fromEmail: fromEmail || existing.fromEmail,
    }).where(eq(emailAccountsTable.id, existing.id)).returning();
    const a = updated[0];
    res.json({ success: true, config: { provider: a.provider, host: a.host, port: a.port, secure: a.secure, user: a.user, password: a.password ? "••••••••" : "", fromName: a.fromName, fromEmail: a.fromEmail } });
  } else {
    await db.insert(emailAccountsTable).values({
      label: user || "Primary",
      provider: provider || "gmail",
      host: host || "smtp.gmail.com",
      port: port || 587,
      secure: secure ?? false,
      user: user || "",
      password: password || "",
      fromName: fromName || "DevStudio",
      fromEmail: fromEmail || "",
    });
    res.json({ success: true });
  }
});

router.post("/crm/test-email", async (req, res) => {
  const { to } = req.body as { to: string };
  const acct = await getPrimaryAccount();
  if (!acct?.user || !acct?.password) {
    res.status(400).json({ error: "Email not configured. Please set up your email settings first." });
    return;
  }
  try {
    const transporter = nodemailer.createTransport({ host: acct.host, port: acct.port, secure: acct.secure, auth: { user: acct.user, pass: acct.password } });
    await transporter.sendMail({
      from: `"${acct.fromName}" <${acct.fromEmail || acct.user}>`,
      to: to || acct.user,
      subject: "DevStudio CRM — Email Test",
      text: "Your email is configured correctly. The AI Hunter is ready to send outreach emails.",
      html: `<div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:24px;">
        <h2 style="color:#6d28d9;">✓ Email configured successfully</h2>
        <p>Your DevStudio CRM email is working. The AI Hunter will use this address to send outreach emails to prospects.</p>
        <p style="color:#6b7280;font-size:14px;">From: ${acct.fromName} &lt;${acct.fromEmail || acct.user}&gt;</p>
      </div>`,
    });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
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

  // Use specified account or fall back to primary
  let acct;
  if (accountId) {
    const rows = await db.select().from(emailAccountsTable).where(eq(emailAccountsTable.id, accountId)).limit(1);
    acct = rows[0];
  } else {
    acct = await getPrimaryAccount();
  }

  if (!acct?.user || !acct?.password) {
    res.status(400).json({ error: "Email not configured. Go to Email Settings to set up your sender." });
    return;
  }

  try {
    const transporter = nodemailer.createTransport({ host: acct.host, port: acct.port, secure: acct.secure, auth: { user: acct.user, pass: acct.password } });
    const html = body.split("\n").map((line) => (line.trim() ? `<p style="margin:0 0 12px;line-height:1.6;">${line}</p>` : "<br/>")).join("");
    await transporter.sendMail({
      from: `"${acct.fromName}" <${acct.fromEmail || acct.user}>`,
      to, subject, text: body,
      html: `<div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;padding:24px;color:#1a1a2e;">${html}<hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;"/><p style="color:#6b7280;font-size:13px;">${acct.fromName}</p></div>`,
    });
    res.json({ success: true, to, sentAt: new Date().toISOString() });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Send proposal email ──────────────────────────────────────────────────────

router.post("/crm/send-proposal-email", async (req, res) => {
  const { to, prospectName, proposal, agencyName } = req.body as {
    to: string; prospectName: string; proposal: any; agencyName?: string;
  };
  if (!to || !proposal) { res.status(400).json({ error: "to and proposal are required" }); return; }

  const acct = await getPrimaryAccount();
  if (!acct?.user || !acct?.password) {
    res.status(400).json({ error: "Email not configured." });
    return;
  }

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
    const transporter = nodemailer.createTransport({ host: acct.host, port: acct.port, secure: acct.secure, auth: { user: acct.user, pass: acct.password } });
    await transporter.sendMail({
      from: `"${acct.fromName}" <${acct.fromEmail || acct.user}>`,
      to,
      subject: `Your Custom Software Proposal — ${prospectName}`,
      html,
    });
    res.json({ success: true, to, sentAt: new Date().toISOString() });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── AI Business Hunter ───────────────────────────────────────────────────────

router.post("/crm/hunt-businesses", async (req, res) => {
  const { category, city, country, count = 10, extraContext } = req.body as {
    category: string; city: string; country: string; count?: number; extraContext?: string;
  };
  if (!category || !city) { res.status(400).json({ error: "category and city are required" }); return; }

  const prompt = `You are a business intelligence researcher. Generate a list of ${Math.min(count, 20)} realistic ${category} businesses in ${city}, ${country || ""}.
${extraContext ? `Additional context: ${extraContext}` : ""}
These should look like real local businesses — use realistic local naming conventions, realistic email patterns (info@, hello@, contact@, owner first name, etc.), realistic phone formats for that region, and realistic website patterns.
For each business, estimate how much they would benefit from custom software (1-10 score) and why.
Return ONLY a JSON array with exactly ${Math.min(count, 20)} objects. Each object must have:
{ "businessName":"string","ownerName":"string","category":"${category}","email":"string","phone":"string","website":"string","city":"${city}","country":"${country || ""}","instagram":"string","facebook":"string","linkedin":"string","softwareNeedScore":<1-10>,"painPoint":"string","estimatedValue":<number>,"notes":"string" }
Make the data diverse: mix of businesses with websites and without, different owner names, different email styles. Be realistic for ${city}, ${country || ""}.`;

  try {
    const text = await generateText(prompt);
    const data = parseJSON(text);
    res.json(Array.isArray(data) ? data : data.businesses || []);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Auto-analyze + generate everything for a hunted prospect ─────────────────

router.post("/crm/auto-generate", async (req, res) => {
  const { businessName, category, website, city, country, ownerName, painPoint, agencyName } = req.body as Record<string, string>;
  const prompt = `You are a senior business analyst and sales copywriter at ${agencyName || "DevStudio"}, a custom software agency.
Analyze this business and generate everything needed to start the sales process — all in one response.
Business: ${businessName}, Category: ${category}, Location: ${city}, ${country}, Owner: ${ownerName || "Business Owner"}, Website: ${website || "No website"}, Known Pain Point: ${painPoint || "Manual processes, outdated systems"}
Return ONLY a JSON object with this exact structure:
{ "analysis":{"websiteScore":<0-100>,"leadScore":<0-100>,"conversionScore":<0-100>,"mobileScore":<0-100>,"seoScore":<0-100>,"growthPotential":<0-100>,"checks":{"responsiveDesign":<bool>,"sslCertificate":<bool>,"modernUI":<bool>,"whatsappButton":<bool>,"contactForm":<bool>,"bookingSystem":<bool>,"onlineOrdering":<bool>,"paymentIntegration":<bool>,"customerPortal":<bool>,"membershipArea":<bool>,"blog":<bool>,"seoBasics":<bool>,"analytics":<bool>,"socialMedia":<bool>,"emailCapture":<bool>,"liveChat":<bool>,"aiChatbot":<bool>,"callToAction":<bool>,"trustElements":<bool>},"issues":[{"title":"string","description":"string","priority":"high|medium|low"}],"opportunities":[{"title":"string","impact":"string","effort":"low|medium|high"}],"recommendedFeatures":["string"],"projectType":"Small Website|Medium Web App|Large SaaS","estimatedValue":{"min":<number>,"max":<number>},"deliveryWeeks":{"min":<number>,"max":<number>},"summary":"2-3 sentence plain English summary"}, "email":{"subject":"string","body":"string"},"whatsapp":"string","linkedin":"string" }
Be specific to a ${category} business in ${city}. If no website, give website scores of 5-25.`;
  try {
    const text = await generateText(prompt);
    const data = parseJSON(text);
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
    const prompt = `Write a personalized cold outreach email from ${agencyName || "DevStudio"} to ${businessName}, a ${category || "business"}.
Context: Owner/contact: ${ownerName || "Business Owner"}, Website: ${website || "no website"}, Top issues found: ${issues || "outdated website, no online booking, poor mobile experience"}, Key opportunity: ${opportunities || "custom software could save them time and grow revenue"}
Rules: NEVER use generic AI phrases like "I hope this finds you well" or "I wanted to reach out". Reference something specific about their business type. Be human, warm, professional. Under 150 words total. ONE clear CTA only. No hype, no buzzwords. Subject line included. Sign off as ${agencyName || "DevStudio"} team.
Return JSON: { "subject":"string","body":"string" }`;
    const text = await generateText(prompt);
    const data = parseJSON(text);
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
