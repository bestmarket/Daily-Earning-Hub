import { Router } from "express";
import { GoogleGenAI } from "@google/genai";
import { getConfigKey } from "./api-keys";

const router = Router();

async function getAI() {
  const key = await getConfigKey("GEMINI_API_KEY");
  if (!key) throw new Error("GEMINI_API_KEY not configured. Add it in Admin → API Keys.");
  return new GoogleGenAI({ apiKey: key });
}

async function generate(prompt: string): Promise<string> {
  const ai = await getAI();
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    config: { maxOutputTokens: 8192 },
  });
  return response.text ?? "";
}

function parseJSON(text: string): any {
  const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  const match = cleaned.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
  if (!match) throw new Error("No JSON found");
  return JSON.parse(match[0]);
}

// ─── SEO Checker ─────────────────────────────────────────────────────────────
router.post("/tools/seo-check", async (req, res) => {
  try {
    const { url, businessName } = req.body as { url: string; businessName?: string };
    if (!url) { res.status(400).json({ error: "url required" }); return; }

    const domain = url.replace(/https?:\/\//i, "").split("/")[0];
    const prompt = `You are an expert SEO analyst. Perform a detailed SEO audit for this website.

URL: ${url}
Business: ${businessName || domain}

Return a JSON object (no markdown):
{
  "overallScore": <0-100>,
  "scores": {
    "technical": <0-100>,
    "onPage": <0-100>,
    "content": <0-100>,
    "mobile": <0-100>,
    "performance": <0-100>,
    "backlinks": <0-100>
  },
  "checks": {
    "httpsEnabled": <bool>,
    "metaTitle": <bool>,
    "metaDescription": <bool>,
    "h1Tags": <bool>,
    "imageAltText": <bool>,
    "mobileFriendly": <bool>,
    "pageSpeed": <bool>,
    "xmlSitemap": <bool>,
    "robotsTxt": <bool>,
    "structuredData": <bool>,
    "canonicalTags": <bool>,
    "internalLinks": <bool>,
    "socialTags": <bool>,
    "googleAnalytics": <bool>,
    "coreWebVitals": <bool>
  },
  "issues": [
    { "severity": "critical|warning|info", "title": "string", "description": "string", "fix": "string" }
  ],
  "keywords": [
    { "keyword": "string", "difficulty": "easy|medium|hard", "opportunity": "string" }
  ],
  "recommendations": ["string"],
  "estimatedMonthlyVisitors": <number>,
  "summary": "2-3 sentence plain English SEO status summary"
}

Be realistic. If the URL seems like a small local business, reflect that in scores (20-60 range typically). Provide 5-8 issues and 5 keyword opportunities.`;

    const text = await generate(prompt);
    const data = parseJSON(text);
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Business Name Generator ─────────────────────────────────────────────────
router.post("/tools/business-names", async (req, res) => {
  try {
    const { industry, keywords, style, country } = req.body as Record<string, string>;
    if (!industry) { res.status(400).json({ error: "industry required" }); return; }

    const prompt = `Generate 12 unique, memorable business names for a ${industry} business.

Additional context:
- Keywords/themes: ${keywords || "none specified"}
- Style preference: ${style || "professional and modern"}
- Country/market: ${country || "United States"}

Return a JSON array (no markdown):
[
  {
    "name": "string",
    "tagline": "one-line tagline (max 8 words)",
    "reason": "why this name works (1 sentence)",
    "domainAvailability": "likely|check|taken",
    "style": "modern|classic|playful|bold|minimal"
  }
]

Rules:
- Names must be original and not existing major brands
- Mix different styles: some short (1-2 words), some compound, some invented words
- Make them easy to spell and remember
- Appropriate for ${industry} industry
- No generic names like "Pro Solutions" or "Expert Services"`;

    const text = await generate(prompt);
    const data = parseJSON(text);
    res.json(Array.isArray(data) ? data : data.names || []);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Website Grader (public, same as CRM analyzer) ───────────────────────────
router.post("/tools/website-grade", async (req, res) => {
  try {
    const { url, businessName, category } = req.body as Record<string, string>;
    if (!url) { res.status(400).json({ error: "url required" }); return; }

    const prompt = `You are an expert website consultant. Grade this website and give a full public-facing report.

Website URL: ${url}
Business Name: ${businessName || url}
Category: ${category || "Unknown"}

Return JSON (no markdown):
{
  "overallGrade": "A+|A|A-|B+|B|B-|C+|C|C-|D|F",
  "overallScore": <0-100>,
  "scores": {
    "design": <0-100>,
    "userExperience": <0-100>,
    "performance": <0-100>,
    "mobile": <0-100>,
    "seo": <0-100>,
    "conversion": <0-100>,
    "security": <0-100>,
    "accessibility": <0-100>
  },
  "checks": {
    "modernDesign": <bool>,
    "mobileResponsive": <bool>,
    "fastLoading": <bool>,
    "sslSecure": <bool based on https>,
    "clearCTA": <bool>,
    "contactInfo": <bool>,
    "socialProof": <bool>,
    "blogContent": <bool>,
    "seoOptimized": <bool>,
    "analyticsTracking": <bool>,
    "liveChat": <bool>,
    "bookingSystem": <bool>,
    "onlinePayments": <bool>,
    "emailCapture": <bool>,
    "accessibility": <bool>
  },
  "strengths": ["string"],
  "weaknesses": [{ "issue": "string", "impact": "high|medium|low", "fix": "string" }],
  "quickWins": ["string"],
  "summary": "2-3 sentence plain English website grade summary",
  "competitorGap": "1 sentence about what competitors likely do better"
}

Be realistic and specific. If URL uses https, sslSecure = true. Grade harshly for business value.`;

    const text = await generate(prompt);
    const data = parseJSON(text);
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
