---
name: Production DB Helium Issue
description: Why the production deployment can't connect to the database, and the env-var fallback workaround implemented.
---

# Production Database — Helium Cannot Resolve in Production

## The Rule
Replit's dev database (Helium) is at hostname `helium` (172.24.0.3) — only resolvable from inside the dev container. Production autoscale containers cannot reach it. Replit uses Neon for production databases, provisioned via the Publish flow.

**Why:** When this project was imported, a Helium dev DB was provisioned but no production Neon DB was created. The Publish flow should auto-create one; for this project it did not apply the production DATABASE_URL correctly even after multiple publishes.

**How to apply:** If the user reports DB errors in the deployed app, the fix is: open Publishing Settings → Production database → check both "Create production database" AND "Set up with current development data" → Publish. If that still fails, user must save config via the DEV admin panel URL (worf.replit.dev/admin), then publish with both options.

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
