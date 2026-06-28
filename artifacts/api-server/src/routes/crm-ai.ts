import { Router } from "express";
import nodemailer from "nodemailer";
import { getGeminiAI } from "./api-keys";

const router = Router();

// ─── In-memory email config (persists while server runs) ──────────────────────
let emailConfig: {
  provider: "gmail" | "smtp" | "outlook";
  host: string;
  port: number;
  secure: boolean;
  user: string;
  password: string;
  fromName: string;
  fromEmail: string;
} = {
  provider: "gmail",
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  user: "",
  password: "",
  fromName: "DevStudio",
  fromEmail: "",
};

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

// ─── Email config routes ──────────────────────────────────────────────────────

router.get("/crm/email-config", (_req, res) => {
  res.json({ ...emailConfig, password: emailConfig.password ? "••••••••" : "" });
});

router.post("/crm/email-config", (req, res) => {
  const { provider, host, port, secure, user, password, fromName, fromEmail } = req.body as typeof emailConfig;
  emailConfig = {
    provider: provider || emailConfig.provider,
    host: host || emailConfig.host,
    port: port || emailConfig.port,
    secure: secure ?? emailConfig.secure,
    user: user || emailConfig.user,
    password: password && password !== "••••••••" ? password : emailConfig.password,
    fromName: fromName || emailConfig.fromName,
    fromEmail: fromEmail || emailConfig.fromEmail,
  };
  res.json({ success: true, config: { ...emailConfig, password: emailConfig.password ? "••••••••" : "" } });
});

router.post("/crm/test-email", async (req, res) => {
  const { to } = req.body as { to: string };
  if (!emailConfig.user || !emailConfig.password) {
    res.status(400).json({ error: "Email not configured. Please set up your email settings first." });
    return;
  }
  try {
    const transporter = nodemailer.createTransport({
      host: emailConfig.host,
      port: emailConfig.port,
      secure: emailConfig.secure,
      auth: { user: emailConfig.user, pass: emailConfig.password },
    });
    await transporter.sendMail({
      from: `"${emailConfig.fromName}" <${emailConfig.fromEmail || emailConfig.user}>`,
      to: to || emailConfig.user,
      subject: "DevStudio CRM — Email Test",
      text: "Your email is configured correctly. The AI Hunter is ready to send outreach emails.",
      html: `<div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:24px;">
        <h2 style="color:#6d28d9;">✓ Email configured successfully</h2>
        <p>Your DevStudio CRM email is working. The AI Hunter will use this address to send outreach emails to prospects.</p>
        <p style="color:#6b7280;font-size:14px;">From: ${emailConfig.fromName} &lt;${emailConfig.fromEmail || emailConfig.user}&gt;</p>
      </div>`,
    });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Send email to prospect ───────────────────────────────────────────────────

router.post("/crm/send-email", async (req, res) => {
  const { to, subject, body, prospectName } = req.body as {
    to: string;
    subject: string;
    body: string;
    prospectName?: string;
  };

  if (!to || !subject || !body) {
    res.status(400).json({ error: "to, subject, and body are required" });
    return;
  }

  if (!emailConfig.user || !emailConfig.password) {
    res.status(400).json({ error: "Email not configured. Go to Email Settings to set up your sender." });
    return;
  }

  try {
    const transporter = nodemailer.createTransport({
      host: emailConfig.host,
      port: emailConfig.port,
      secure: emailConfig.secure,
      auth: { user: emailConfig.user, pass: emailConfig.password },
    });

    const html = body
      .split("\n")
      .map((line) => (line.trim() ? `<p style="margin:0 0 12px;line-height:1.6;">${line}</p>` : "<br/>"))
      .join("");

    await transporter.sendMail({
      from: `"${emailConfig.fromName}" <${emailConfig.fromEmail || emailConfig.user}>`,
      to,
      subject,
      text: body,
      html: `<div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;padding:24px;color:#1a1a2e;">${html}<hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;"/><p style="color:#6b7280;font-size:13px;">${emailConfig.fromName}</p></div>`,
    });

    res.json({ success: true, to, sentAt: new Date().toISOString() });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── AI Business Hunter ───────────────────────────────────────────────────────

router.post("/crm/hunt-businesses", async (req, res) => {
  const { category, city, country, count = 10, extraContext } = req.body as {
    category: string;
    city: string;
    country: string;
    count?: number;
    extraContext?: string;
  };

  if (!category || !city) {
    res.status(400).json({ error: "category and city are required" });
    return;
  }

  const prompt = `You are a business intelligence researcher. Generate a list of ${Math.min(count, 20)} realistic ${category} businesses in ${city}, ${country || ""}. 

${extraContext ? `Additional context: ${extraContext}` : ""}

These should look like real local businesses — use realistic local naming conventions, realistic email patterns (info@, hello@, contact@, owner first name, etc.), realistic phone formats for that region, and realistic website patterns.

For each business, estimate how much they would benefit from custom software (1-10 score) and why.

Return ONLY a JSON array with exactly ${Math.min(count, 20)} objects. Each object must have:
{
  "businessName": "string (realistic local business name)",
  "ownerName": "string (realistic local name, first + last)",
  "category": "${category}",
  "email": "string (realistic email like info@businessname.com or owner@gmail.com)",
  "phone": "string (realistic local phone with country code)",
  "website": "string (realistic URL like www.businessname.com or leave empty string if they likely don't have one)",
  "city": "${city}",
  "country": "${country || ""}",
  "instagram": "string (@handle or empty)",
  "facebook": "string (facebook.com/page or empty)",
  "linkedin": "string (linkedin URL or empty)",
  "softwareNeedScore": <1-10 number>,
  "painPoint": "string (1 sentence — the main business problem custom software would solve for this type of business)",
  "estimatedValue": <number — realistic project budget in USD based on city/country economy>,
  "notes": "string (brief note about this specific business's digital situation)"
}

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

Business: ${businessName}
Category: ${category}
Location: ${city}, ${country}
Owner: ${ownerName || "Business Owner"}
Website: ${website || "No website"}
Known Pain Point: ${painPoint || "Manual processes, outdated systems"}

Return ONLY a JSON object with this exact structure:
{
  "analysis": {
    "websiteScore": <0-100>,
    "leadScore": <0-100>,
    "conversionScore": <0-100>,
    "mobileScore": <0-100>,
    "seoScore": <0-100>,
    "growthPotential": <0-100>,
    "checks": {
      "responsiveDesign": <bool>, "sslCertificate": <bool>, "modernUI": <bool>,
      "whatsappButton": <bool>, "contactForm": <bool>, "bookingSystem": <bool>,
      "onlineOrdering": <bool>, "paymentIntegration": <bool>, "customerPortal": <bool>,
      "membershipArea": <bool>, "blog": <bool>, "seoBasics": <bool>, "analytics": <bool>,
      "socialMedia": <bool>, "emailCapture": <bool>, "liveChat": <bool>,
      "aiChatbot": <bool>, "callToAction": <bool>, "trustElements": <bool>
    },
    "issues": [{"title": "string", "description": "string", "priority": "high|medium|low"}],
    "opportunities": [{"title": "string", "impact": "string", "effort": "low|medium|high"}],
    "recommendedFeatures": ["string"],
    "projectType": "Small Website|Medium Web App|Large SaaS",
    "estimatedValue": {"min": <number>, "max": <number>},
    "deliveryWeeks": {"min": <number>, "max": <number>},
    "summary": "2-3 sentence plain English summary"
  },
  "email": {
    "subject": "string (specific, not generic)",
    "body": "string (under 150 words, human, warm, references their specific business, ONE CTA, no AI clichés like 'I hope this finds you well')"
  },
  "whatsapp": "string (under 120 words, friendly, conversational, sounds like a real person)",
  "linkedin": "string (under 300 chars, genuine connection request, no pitch)"
}

Be specific to a ${category} business in ${city}. If no website, give website scores of 5-25. Make the email reference something specific about their business type or location.`;

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
    const { website, businessName, category } = req.body as {
      website: string;
      businessName: string;
      category: string;
    };
    if (!businessName) {
      res.status(400).json({ error: "businessName required" });
      return;
    }

    const prompt = `You are an expert web analyst and business consultant. Analyze this business and produce a detailed JSON report.

Business Name: ${businessName}
Business Category: ${category || "Unknown"}
Website: ${website || "No website provided"}

Produce a JSON object with EXACTLY this structure (no markdown, pure JSON):
{
  "websiteScore": <0-100 number>,
  "leadScore": <0-100 number>,
  "conversionScore": <0-100 number>,
  "mobileScore": <0-100 number>,
  "seoScore": <0-100 number>,
  "growthPotential": <0-100 number>,
  "checks": {
    "responsiveDesign": <true/false>,
    "sslCertificate": <true/false based on https>,
    "modernUI": <true/false>,
    "whatsappButton": <true/false>,
    "contactForm": <true/false>,
    "bookingSystem": <true/false>,
    "onlineOrdering": <true/false>,
    "paymentIntegration": <true/false>,
    "customerPortal": <true/false>,
    "membershipArea": <true/false>,
    "blog": <true/false>,
    "seoBasics": <true/false>,
    "analytics": <true/false>,
    "socialMedia": <true/false>,
    "emailCapture": <true/false>,
    "liveChat": <true/false>,
    "aiChatbot": <true/false>,
    "callToAction": <true/false>,
    "trustElements": <true/false>
  },
  "issues": [
    { "title": "string", "description": "string", "priority": "high|medium|low" }
  ],
  "opportunities": [
    { "title": "string", "impact": "string", "effort": "low|medium|high" }
  ],
  "recommendedFeatures": ["string"],
  "projectType": "Small Website|Medium Web App|Large SaaS",
  "estimatedValue": { "min": <number>, "max": <number> },
  "deliveryWeeks": { "min": <number>, "max": <number> },
  "summary": "2-3 sentence plain English summary of their digital situation and biggest opportunity"
}

Be realistic and specific to a ${category} business. If no website is provided, give scores of 0-20 for all website metrics.`;

    const text = await generateText(prompt);
    const data = parseJSON(text);
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/crm/generate-email", async (req, res) => {
  try {
    const { businessName, ownerName, category, website, issues, opportunities, agencyName } = req.body as Record<string, string>;

    const prompt = `Write a personalized cold outreach email from ${agencyName || "DevStudio"} to ${businessName}, a ${category || "business"}.

Context:
- Owner/contact: ${ownerName || "Business Owner"}
- Website: ${website || "no website"}
- Top issues found: ${issues || "outdated website, no online booking, poor mobile experience"}
- Key opportunity: ${opportunities || "custom software could save them time and grow revenue"}

Rules:
- NEVER use generic AI phrases like "I hope this finds you well" or "I wanted to reach out"
- Reference something specific about their business type
- Be human, warm, professional
- Under 150 words total
- ONE clear CTA only
- No hype, no buzzwords
- Subject line included
- Sign off as ${agencyName || "DevStudio"} team

Return JSON: { "subject": "string", "body": "string" }`;

    const text = await generateText(prompt);
    const data = parseJSON(text);
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/crm/generate-whatsapp", async (req, res) => {
  try {
    const { businessName, category, opportunities, agencyName } = req.body as Record<string, string>;

    const prompt = `Write a WhatsApp outreach message from ${agencyName || "DevStudio"} to ${businessName}, a ${category || "business"}.

Key opportunity: ${opportunities || "help them get more customers with custom software"}

Rules:
- Max 120 words
- Friendly, conversational tone
- Professional but not stiff
- No hype or spam language
- ONE clear CTA
- No emojis except 1-2 max
- Natural, sounds like a real person wrote it

Return JSON: { "message": "string" }`;

    const text = await generateText(prompt);
    const data = parseJSON(text);
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/crm/generate-linkedin", async (req, res) => {
  try {
    const { businessName, ownerName, category, agencyName } = req.body as Record<string, string>;

    const prompt = `Write a LinkedIn connection request message from ${agencyName || "DevStudio"} to ${ownerName || "the owner"} of ${businessName}, a ${category || "business"}.

Rules:
- Max 300 characters
- Professional and genuine
- No generic phrases
- Mention their industry specifically
- No pitch in the connection request — just a genuine reason to connect

Return JSON: { "message": "string" }`;

    const text = await generateText(prompt);
    const data = parseJSON(text);
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/crm/generate-proposal", async (req, res) => {
  try {
    const { businessName, category, issues, features, estimatedValue, agencyName, website } = req.body as Record<string, string>;

    const prompt = `Write a professional software proposal from ${agencyName || "DevStudio"} for ${businessName}, a ${category || "business"}.

Context:
- Website: ${website || "No website"}
- Problems found: ${issues || "manual processes, no online booking, poor digital presence"}
- Recommended features: ${features || "booking system, customer portal, admin dashboard, payment integration"}
- Estimated value: ${estimatedValue || "$500 - $1500"}

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

Return JSON: { "sections": { "executiveSummary": "string", "situation": "string", "problems": ["string"], "solution": "string", "features": [{"name":"string","desc":"string"}], "benefits": ["string"], "timeline": [{"week":"string","task":"string"}], "investment": "string", "whyUs": ["string"], "nextSteps": ["string"] } }`;

    const text = await generateText(prompt);
    const data = parseJSON(text);
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/crm/generate-followup", async (req, res) => {
  try {
    const { businessName, ownerName, day, previousContext, agencyName } = req.body as Record<string, string>;

    const prompt = `Write a follow-up message for day ${day || "3"} after initial outreach to ${businessName}.

Previous context: ${previousContext || "Sent initial cold email about custom software development"}
Contact: ${ownerName || "Business Owner"}
Agency: ${agencyName || "DevStudio"}

Rules:
- Must sound completely different from a day-3, day-7, day-14, day-30 sequence
- Day 3: gentle, add value or insight
- Day 7: different angle, ask a question  
- Day 14: share a relevant result/case study angle
- Day 30: final check-in, door still open
- Max 100 words
- No "just following up" phrases
- Human, genuine, zero pressure

Return JSON: { "subject": "string", "body": "string", "channel": "email" }`;

    const text = await generateText(prompt);
    const data = parseJSON(text);
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
