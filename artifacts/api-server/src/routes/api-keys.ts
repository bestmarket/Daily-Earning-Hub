import { Router } from "express";
import { db } from "@workspace/db";
import { siteConfigTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

import { requireAdmin } from "../lib/admin-auth";

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

// ─── Gemini API key pool (multiple keys, rotational) ───────────────────────

const GEMINI_POOL_CONFIG_KEY = "GEMINI_API_KEYS";

type GeminiPoolEntry = { id: string; key: string; label?: string; addedAt: string };

let geminiRotationIndex = 0;

async function readGeminiPool(): Promise<GeminiPoolEntry[]> {
  const rows = await db
    .select()
    .from(siteConfigTable)
    .where(eq(siteConfigTable.key, GEMINI_POOL_CONFIG_KEY))
    .limit(1);

  if (rows[0]?.value) {
    try {
      const parsed = JSON.parse(rows[0].value);
      if (Array.isArray(parsed)) return parsed;
    } catch {}
  }

  // Migrate legacy single GEMINI_API_KEY into the pool, if present
  const legacy = await getConfigKey("GEMINI_API_KEY");
  if (legacy) {
    const migrated: GeminiPoolEntry[] = [
      { id: randomId(), key: legacy, label: "Key 1", addedAt: new Date().toISOString() },
    ];
    await writeGeminiPool(migrated);
    return migrated;
  }

  return [];
}

async function writeGeminiPool(pool: GeminiPoolEntry[]): Promise<void> {
  const value = JSON.stringify(pool);
  const existing = await db
    .select()
    .from(siteConfigTable)
    .where(eq(siteConfigTable.key, GEMINI_POOL_CONFIG_KEY))
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(siteConfigTable)
      .set({ value, updatedAt: new Date() })
      .where(eq(siteConfigTable.key, GEMINI_POOL_CONFIG_KEY));
  } else {
    await db.insert(siteConfigTable).values({ key: GEMINI_POOL_CONFIG_KEY, value });
  }
}

function randomId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

router.get("/admin/gemini-keys", requireAdmin, async (req, res) => {
  try {
    const integrationKey = process.env.AI_INTEGRATIONS_GEMINI_API_KEY;
    if (integrationKey) {
      res.json({ viaIntegration: true, keys: [] });
      return;
    }
    const pool = await readGeminiPool();
    res.json({
      viaIntegration: false,
      keys: pool.map((k) => ({ id: k.id, label: k.label || "Key", masked: maskKey(k.key), addedAt: k.addedAt })),
    });
  } catch (err) {
    req.log.error({ err }, "Get gemini-keys error");
    res.status(500).json({ error: "Failed to load Gemini keys" });
  }
});

router.post("/admin/gemini-keys", requireAdmin, async (req, res) => {
  try {
    const { apiKey, label } = req.body ?? {};
    if (!apiKey || typeof apiKey !== "string" || !apiKey.trim()) {
      res.status(400).json({ error: "API key is required" });
      return;
    }
    const pool = await readGeminiPool();
    const entry: GeminiPoolEntry = {
      id: randomId(),
      key: apiKey.trim(),
      label: label?.trim() || `Key ${pool.length + 1}`,
      addedAt: new Date().toISOString(),
    };
    pool.push(entry);
    await writeGeminiPool(pool);
    res.json({ success: true, id: entry.id, count: pool.length });
  } catch (err) {
    req.log.error({ err }, "Add gemini-key error");
    res.status(500).json({ error: "Failed to save Gemini key" });
  }
});

router.delete("/admin/gemini-keys/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await readGeminiPool();
    const next = pool.filter((k) => k.id !== id);
    await writeGeminiPool(next);
    res.json({ success: true, count: next.length });
  } catch (err) {
    req.log.error({ err }, "Delete gemini-key error");
    res.status(500).json({ error: "Failed to delete Gemini key" });
  }
});

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

// Returns a ready GoogleGenAI instance using the best available key + base URL.
// When multiple manual keys are configured, rotates round-robin across them.
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
  // Fall back to the rotational pool of manually saved keys
  const pool = await readGeminiPool();
  if (pool.length > 0) {
    const entry = pool[geminiRotationIndex % pool.length];
    geminiRotationIndex = (geminiRotationIndex + 1) % pool.length;
    return new GoogleGenAI({ apiKey: entry.key });
  }
  throw new Error("Gemini AI not configured. Add your API key in Admin → AI Setup.");
}

export default router;
