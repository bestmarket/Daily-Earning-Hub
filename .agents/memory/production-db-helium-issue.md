---
name: Production DB Helium Issue
description: Why the production deployment can't connect to the database, and the env-var fallback workaround implemented.
---

# Production Database — Helium Cannot Resolve in Production

## The Rule
Replit's dev database (Helium) is at hostname `helium` (172.24.0.3) — only resolvable from inside the dev container. Production autoscale containers cannot reach it. Replit uses Neon for production databases, provisioned via the Publish flow.

**Why:** When this project was imported, a Helium dev DB was provisioned but no production Neon DB was created. The Publish flow should auto-create one; for this project it did not apply the production DATABASE_URL correctly even after multiple publishes.

**How to apply:** If the user reports DB errors in the deployed app, the fix is: open Publishing Settings → Production database → check both "Create production database" AND "Set up with current development data" → Publish. If that still fails, user must save config via the DEV admin panel URL (worf.replit.dev/admin), then publish with both options.

## Recurrence after re-import (2026-07-09)
After a fresh GitHub import, the dev (Helium) database itself had zero tables — `pnpm --filter @workspace/db run push` had never actually been run against it, despite replit.md claiming "DB schema pushed". This made *every* DB-backed feature (SMTP accounts, Gemini key pool) fail and silently fall back to KV/env, which looked like "nothing saves / test says account not found".

**How to apply:** After any import or environment reset, don't trust replit.md's checklist at face value — verify with `SELECT table_name FROM information_schema.tables WHERE table_schema='public'` before assuming schema-dependent features are broken for a different reason. Re-run the db push script if the table list is empty. Separately, `getDeploymentInfo()` confirmed this repl has never actually been published (`isDeployed: false`) even though the user was hitting a `*.replit.app`-style URL — so the production Neon DB genuinely does not exist yet; publishing is required before production email/Gemini config can persist to a real DB (KV fallback still works without it).

## Env-Var Fallback (implemented)

For email accounts and Gemini keys, env-var fallbacks were added so the AI Hunter works even without a production DB:

- **Gemini key**: `GEMINI_API_KEY` secret → already supported by `api-key-pools.ts` readPool fallback
- **Email account**: `SMTP_USER` + `SMTP_PASSWORD` + `SMTP_FROM_NAME` + `SMTP_FROM_EMAIL` + `SMTP_HOST` + `SMTP_PORT` secrets → virtual account (id=-1) built by `getEnvEmailAccount()` in `crm-ai.ts`

### Virtual account (id = -1) rules
- `incrementSentCount(id)` and `recordFailure(id)` skip DB writes when `id <= 0`
- `getNextAccount(excludeIds)` returns `null` (not env account) if `-1` is already in `excludeIds`, so failover terminates
- `followUpQueueTable` stores `null` (not -1) for accountId when using env account

### Datasource-status Gemini check
Reports true if any of: `GOOGLE_GENERATIVE_AI_API_KEY`, `AI_INTEGRATIONS_GEMINI_API_KEY`, or `GEMINI_API_KEY` is set.
