---
name: Brevo SMTP debugging
description: How to diagnose "SMTP not routed / not working" complaints for the Brevo mailer in this app
---

When a user says Brevo/SMTP emails "aren't routed" or "not working" but insists the same credentials work fine elsewhere, the root cause is almost always a missing or unsaved `BREVO_SMTP_KEY` (the SMTP password), not a code/routing bug.

**Why:** The mailer (`brevo-mailer.ts`) throws a clear "Brevo SMTP not configured" error when the key is absent — but that error can look like a generic failure to a non-technical user, and they may believe they already "saved" it via the admin UI or elsewhere when it never actually persisted (checked both the `site_config` DB table and Replit secrets — both were empty despite the user believing otherwise).

**How to apply:**
1. Check `viewEnvVars` for `BREVO_SMTP_USER`/`BREVO_SMTP_KEY`, and query the `site_config` table (admin UI also stores keys there via `/admin/api-keys`).
2. To prove the routing/code path itself is fine before blaming credentials, POST a dummy value to `/admin/api-keys` and call `/api/brevo/verify` — a real Brevo `535 Authentication failed` response (vs. "not configured") confirms the pipeline reaches Brevo correctly and the issue is purely the credential value.
3. Clean up the dummy key afterward, then request the real secret via `requestEnvVar` and re-verify with both `/api/brevo/verify` and an actual `/api/brevo/test` send.
