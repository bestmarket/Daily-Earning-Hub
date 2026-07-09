/**
 * Thin client for Replit's built-in key-value store (REPLIT_DB_URL).
 * Works from both dev containers and production autoscale deployments,
 * making it a reliable fallback when the PostgreSQL Helium host is unreachable.
 *
 * API: plain HTTP — no extra packages needed.
 */

const KV_URL = process.env.REPLIT_DB_URL;

export const kvAvailable = !!KV_URL;

async function kvFetch(method: string, path: string, body?: string): Promise<Response> {
  if (!KV_URL) throw new Error("REPLIT_DB_URL not set");
  return fetch(`${KV_URL}${path}`, {
    method,
    headers: body ? { "Content-Type": "application/x-www-form-urlencoded" } : {},
    body,
  });
}

export async function kvGet(key: string): Promise<string | null> {
  try {
    const res = await kvFetch("GET", `/${encodeURIComponent(key)}`);
    if (res.status === 404) return null;
    return res.ok ? res.text() : null;
  } catch { return null; }
}

export async function kvSet(key: string, value: string): Promise<boolean> {
  try {
    const res = await kvFetch("POST", "", `${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
    return res.ok;
  } catch { return false; }
}

export async function kvDelete(key: string): Promise<boolean> {
  try {
    const res = await kvFetch("DELETE", `/${encodeURIComponent(key)}`);
    return res.ok;
  } catch { return false; }
}

export async function kvGetJson<T>(key: string): Promise<T | null> {
  const raw = await kvGet(key);
  if (!raw) return null;
  try { return JSON.parse(raw) as T; } catch { return null; }
}

export async function kvSetJson(key: string, value: unknown): Promise<boolean> {
  return kvSet(key, JSON.stringify(value));
}
