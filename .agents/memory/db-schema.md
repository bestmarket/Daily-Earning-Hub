---
name: DB schema push required on fresh env
description: Each new Replit container starts with an empty PostgreSQL DB — the schema and seed data must be re-applied.
---

When the Replit environment is reset or a new container spins up, the PostgreSQL database is empty. All `@workspace/db` queries will fail with "relation does not exist" errors.

**Why:** Replit's DB is persistent across sessions normally, but container resets wipe it.

**How to apply:**
1. Run schema: `pnpm --filter @workspace/db run push`
2. Seed tools: run the INSERT statements for the 6 tools (Digital Product Store Builder, Freelancer Client Portal, WhatsApp Business Automation, SaaS Starter Kit, Appointment Booking System, Online Course Platform) — see the api-server seed script or re-insert manually.
3. Verify: `psql "$DATABASE_URL" -c "SELECT count(*) FROM tools;"`
