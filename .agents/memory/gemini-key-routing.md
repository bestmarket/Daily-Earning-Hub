---
name: Gemini API routing and key management
description: How Gemini AI keys are resolved/rotated, and a frontend/backend route-path mismatch pitfall to avoid.
---

The AI test/connection endpoint lives at `/api/ai/recommend` (mounted via `ai-recommend.ts`), NOT `/api/tools-ai/recommend` — `tools-ai.ts` only exposes `/api/tools/*` paths (seo-check, business-names, website-grade). A prior frontend call to the wrong path caused a persistent "AI error: HTTP 404" in the Admin AI Setup tab even though the backend and API key were fine.

**Why:** Naming similarity between `ai-recommend.ts` (mounted at `/ai/recommend`) and `tools-ai.ts` (mounted at `/tools/*`) makes it easy to guess the wrong endpoint. Always verify the actual mounted path in `routes/index.ts` rather than inferring it from the filename.

**How to apply:** When wiring any new frontend call to an API route, grep `routes/index.ts` + the target router file for the literal `router.use`/`router.post` path instead of assuming based on router filename.

Gemini key resolution order (`getGeminiAI()` in `api-keys.ts`): Replit-managed integration key (`AI_INTEGRATIONS_GEMINI_API_KEY`) always wins if present; otherwise falls back to a rotating pool of manually-added keys stored as JSON under the `GEMINI_API_KEYS` site_config row (round-robin via an in-memory index, resets on server restart). Legacy single `GEMINI_API_KEY` config rows are auto-migrated into the pool on first read.
