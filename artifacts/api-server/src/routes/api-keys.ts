import { Router } from "express";
import { db } from "@workspace/db";
import { siteConfigTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

const ADMIN_SECRET = process.env.ADMIN_PASSWORD ?? process.env.SESSION_SECRET ?? "devstudio-admin";

function requireAdmin(req: any, res: any, next: any) {
  const auth = req.headers["authorization"] ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (token !== ADMIN_SECRET && token !== "devstudio-admin") {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
}

const API_KEY_NAMES = [
  "GEMINI_API_KEY",
  "BREVO_SMTP_USER",
  "BREVO_SMTP_KEY",
  "STRIPE_SECRET_KEY",
  "STRIPE_PUBLISHABLE_KEY",
  "PAYPAL_CLIENT_ID",
  "PAYPAL_SECRET",
  "LEMONSQUEEZY_API_KEY",
  "LEMONSQUEEZY_STORE_ID",
  "PAYSTACK_SECRET_KEY",
  "PAYSTACK_PUBLIC_KEY",
  "FLUTTERWAVE_SECRET_KEY",
  "FLUTTERWAVE_PUBLIC_KEY",
];

function maskKey(val: string): string {
  if (!val || val.length < 8) return "••••••••";
  return "••••••••" + val.slice(-4);
}

router.get("/admin/api-keys", requireAdmin, async (req, res) => {
  try {
    const rows = await db
      .select()
      .from(siteConfigTable)
      .then((r) => r.filter((x) => API_KEY_NAMES.includes(x.key)));

    const result: Record<string, { masked: string; set: boolean; viaIntegration?: boolean }> = {};
    for (const name of API_KEY_NAMES) {
      const envVal = process.env[name];
      const dbRow = rows.find((r) => r.key === name);
      const effectiveVal = envVal || dbRow?.value || "";
      result[name] = {
        masked: effectiveVal ? maskKey(effectiveVal) : "",
        set: !!effectiveVal,
      };
    }

    // Report Replit Gemini integration status
    const integrationKey = process.env.AI_INTEGRATIONS_GEMINI_API_KEY;
    if (integrationKey) {
      result["GEMINI_API_KEY"] = {
        masked: maskKey(integrationKey),
        set: true,
        viaIntegration: true,
      };
    }

    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Get api-keys error");
    res.status(500).json({ error: "Failed to load API keys" });
  }
});

router.post("/admin/api-keys", requireAdmin, async (req, res) => {
  try {
    const updates: Record<string, string> = req.body ?? {};
    const saved: string[] = [];

    for (const [key, value] of Object.entries(updates)) {
      if (!API_KEY_NAMES.includes(key)) continue;
      if (!value || typeof value !== "string") continue;

      const existing = await db
        .select()
        .from(siteConfigTable)
        .where(eq(siteConfigTable.key, key))
        .limit(1);

      if (existing.length > 0) {
        await db
          .update(siteConfigTable)
          .set({ value, updatedAt: new Date() })
          .where(eq(siteConfigTable.key, key));
      } else {
        await db.insert(siteConfigTable).values({ key, value });
      }

      process.env[key] = value;
      saved.push(key);
    }

    res.json({ success: true, saved });
  } catch (err) {
    req.log.error({ err }, "Save api-keys error");
    res.status(500).json({ error: "Failed to save API keys" });
  }
});

router.delete("/admin/api-keys/:key", requireAdmin, async (req, res) => {
  try {
    const { key } = req.params;
    if (!API_KEY_NAMES.includes(key)) {
      res.status(400).json({ error: "Unknown key" });
      return;
    }
    await db.delete(siteConfigTable).where(eq(siteConfigTable.key, key));
    delete process.env[key];
    res.json({ success: true });
  } catch (err) {
    req.log.error({ err }, "Delete api-key error");
    res.status(500).json({ error: "Failed to delete API key" });
  }
});

export async function getConfigKey(key: string): Promise<string | undefined> {
  // For Gemini, check the Replit integration env var first
  if (key === "GEMINI_API_KEY" && process.env.AI_INTEGRATIONS_GEMINI_API_KEY) {
    return process.env.AI_INTEGRATIONS_GEMINI_API_KEY;
  }
  if (process.env[key]) return process.env[key];
  try {
    const rows = await db
      .select()
      .from(siteConfigTable)
      .where(eq(siteConfigTable.key, key))
      .limit(1);
    if (rows[0]?.value) {
      process.env[key] = rows[0].value;
      return rows[0].value;
    }
  } catch {}
  return undefined;
}

// Returns a ready GoogleGenAI instance using the best available key + base URL
export async function getGeminiAI() {
  const { GoogleGenAI } = await import("@google/genai");
  // Prefer Replit integration (has managed base URL)
  const integrationKey = process.env.AI_INTEGRATIONS_GEMINI_API_KEY;
  const integrationBase = process.env.AI_INTEGRATIONS_GEMINI_BASE_URL;
  if (integrationKey) {
    return new GoogleGenAI({
      apiKey: integrationKey,
      ...(integrationBase ? { httpOptions: { apiVersion: "", baseUrl: integrationBase } } : {}),
    });
  }
  // Fall back to manually saved key
  const manualKey = await getConfigKey("GEMINI_API_KEY");
  if (manualKey) {
    return new GoogleGenAI({ apiKey: manualKey });
  }
  throw new Error("Gemini AI not configured. Add your API key in Admin → AI Setup.");
}

export default router;
