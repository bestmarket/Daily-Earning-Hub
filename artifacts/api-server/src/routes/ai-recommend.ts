import { Router } from "express";
import { GoogleGenAI } from "@google/genai";

const router = Router();

router.post("/ai/recommend", async (req, res) => {
  const { businessName, industry, description, challenges, goal, budget } = req.body;

  if (!industry || !description || !goal) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: "Gemini API key not configured" });
    return;
  }

  const genai = new GoogleGenAI({ apiKey });

  const prompt = `You are a senior software consultant. A business owner has filled out a form requesting a custom software recommendation.

Business Info:
- Business Name: ${businessName || "Not provided"}
- Industry: ${industry}
- Description: ${description}
- Current Challenges: ${challenges || "Not specified"}
- Main Goal: ${goal}
- Budget Range: ${budget || "Not specified"}

Respond ONLY with a valid JSON object (no markdown, no extra text) in this exact structure:
{
  "tool": "Name of the recommended software solution (e.g. 'Online Booking & CRM System')",
  "features": ["feature 1", "feature 2", "feature 3", "feature 4", "feature 5", "feature 6"],
  "timeline": "e.g. 2-3 weeks",
  "benefits": ["benefit 1 with metric", "benefit 2 with metric", "benefit 3", "benefit 4"],
  "tech": ["React", "Node.js", "PostgreSQL"],
  "investment": "$X – $Y",
  "reasoning": "2-3 sentence explanation of why this solution fits their business"
}

Be specific to their industry and goals. Include realistic metrics in benefits. Keep features practical and business-focused.`;

  try {
    const response = await genai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    const raw = response.text ?? "";
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      res.status(500).json({ error: "Failed to parse AI response" });
      return;
    }

    const parsed = JSON.parse(jsonMatch[0]);
    res.json(parsed);
  } catch (err) {
    console.error("Gemini error:", err);
    res.status(500).json({ error: "AI recommendation failed" });
  }
});

export default router;
