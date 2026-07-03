---
name: Email credential validation
description: Provider-specific SMTP credential format checks and where they must be kept in sync
---

Gmail App Passwords are exactly 16 characters (not the user's regular account password). SendGrid SMTP requires the literal username `apikey`. Resend SMTP requires the literal username `resend`.

**Why:** A stale/malformed credential (e.g. wrong length Gmail password, or a real email address used as the SendGrid username) produces a generic auth rejection from the provider that looks identical to a code/routing bug, wasting debugging time. Catching the format issue before it's saved prevents that class of support issue entirely.

**How to apply:** Enforce the same format rule in two places that must stay in sync: the server-side route validation (rejects on save with a 400 and a specific message) and the admin UI form (blocks submission client-side with the same message, shown inline near the password field). When adding a new SMTP provider, add its format rule to both places.
