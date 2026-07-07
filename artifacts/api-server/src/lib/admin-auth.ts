/**
 * Shared admin authentication helper.
 * Single source of truth — imported by admin.ts, api-keys.ts, site-settings.ts.
 *
 * Password priority: ADMIN_PASSWORD env var → SESSION_SECRET env var.
 * Set ADMIN_PASSWORD as a Replit Secret to give the admin panel a known password.
 */

export const ADMIN_SECRET =
  process.env.ADMIN_PASSWORD ?? process.env.SESSION_SECRET;

if (!ADMIN_SECRET) {
  console.error(
    "FATAL: ADMIN_PASSWORD env var must be set as a Replit Secret (SESSION_SECRET is used as a fallback)",
  );
  process.exit(1);
}

export function requireAdmin(req: any, res: any, next: any) {
  const auth = req.headers["authorization"] ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!token || token !== ADMIN_SECRET) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
}
