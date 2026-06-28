import { Router } from "express";
import { GoogleGenAI } from "@google/genai";

const router = Router();

function getAI() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY not set");
  return new GoogleGenAI({ apiKey: key });
}

async function generateText(prompt: string, systemInstruction?: string): Promise<string> {
  const ai = getAI();
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
    const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    let data: object;
    try {
      data = JSON.parse(cleaned);
    } catch {
      const match = cleaned.match(/\{[\s\S]*\}/);
      data = match ? JSON.parse(match[0]) : { error: "parse_failed", raw: cleaned.slice(0, 500) };
    }
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
    const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const match = cleaned.match(/\{[\s\S]*\}/);
    const data = match ? JSON.parse(match[0]) : { subject: "Following up", body: cleaned };
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
    const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const match = cleaned.match(/\{[\s\S]*\}/);
    const data = match ? JSON.parse(match[0]) : { message: cleaned };
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
    const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const match = cleaned.match(/\{[\s\S]*\}/);
    const data = match ? JSON.parse(match[0]) : { message: cleaned };
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

Be specific, professional, and persuasive. Avoid generic marketing speak. Every point should be specific to a ${category} business.

Return JSON: { "sections": { "executiveSummary": "string", "situation": "string", "problems": ["string"], "solution": "string", "features": [{"name":"string","desc":"string"}], "benefits": ["string"], "timeline": [{"week":"string","task":"string"}], "investment": "string", "whyUs": ["string"], "nextSteps": ["string"] } }`;

    const text = await generateText(prompt);
    const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const match = cleaned.match(/\{[\s\S]*\}/);
    const data = match ? JSON.parse(match[0]) : { raw: cleaned };
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
    const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const match = cleaned.match(/\{[\s\S]*\}/);
    const data = match ? JSON.parse(match[0]) : { subject: "Checking in", body: cleaned };
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
