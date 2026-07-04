# DevStudio / Tools4Biz

A pnpm monorepo with two public-facing sites (agency marketing site + software tools catalog) backed by a shared Express API server.

## Run & Operate

Managed artifact workflows are configured and start automatically in the Replit UI:

| Workflow | Command | Port |
|---|---|---|
| `artifacts/agency-site: web` | `pnpm --filter @workspace/agency-site run dev` | 19242 |
| `artifacts/tools4biz: web` | `pnpm --filter @workspace/tools4biz run dev` | 3000 |
| `artifacts/api-server: API Server` | `pnpm --filter @workspace/api-server run dev` | 8080 |
| `artifacts/mockup-sandbox: Component Preview Server` | `pnpm --filter @workspace/mockup-sandbox run dev` | — |

Start order: **API Server first**, then the front-end sites (agency-site proxies `/api` to port 8080).

- `pnpm install` — install all workspace dependencies (run after clone; handled by `scripts/post-merge.sh` on merge)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only; run by `scripts/post-merge.sh` on merge)

## Setup status (last verified 2026-07-04)

- ✅ `pnpm install` completed — all workspace dependencies installed
- ✅ DB schema pushed — `lib/db` schema applied to the Replit-managed PostgreSQL instance
- ✅ `ADMIN_PASSWORD` secret set — required by api-server on startup
- ✅ Managed artifact workflows configured — agency-site (19242), api-server (8080), tools4biz (3000)
- ⚠️ `GOOGLE_GENERATIVE_AI_API_KEY` not yet set — AI analysis and email generation will return 500s without it

## Stack

- pnpm workspaces, Node.js 20, TypeScript 5.9
- **Frontends:** React 19 + Vite 7 + Tailwind CSS 4 + Wouter
- **API:** Express 5
- **DB:** PostgreSQL + Drizzle ORM (`lib/db`)
- **Validation:** Zod v4 + drizzle-zod
- **AI:** Google Gemini (`@google/genai`) via `lib/integrations-gemini-ai`
- **Build:** esbuild (API), Vite (frontends)

## Where things live

```
artifacts/
  agency-site/   — DevStudio marketing & CRM site (port 19242)
  tools4biz/     — Tools4Biz software catalog (port 22944)
  api-server/    — Shared Express API (port 8080)
  mockup-sandbox/ — Vite mockup preview server
lib/
  db/            — Drizzle schema + migrations (source of truth for DB)
  api-spec/      — OpenAPI spec + Orval codegen for hooks & Zod
  api-zod/       — Shared Zod schemas
  integrations/  — Third-party integration helpers
  integrations-gemini-ai/ — Gemini AI wrapper
```

## Environment

- `DATABASE_URL` — managed automatically by Replit (PostgreSQL)
- `GOOGLE_GENERATIVE_AI_API_KEY` — optional; required for AI recommendation features on Tools4Biz

## Architecture decisions

- `BASE_PATH` and `PORT` env vars configure each Vite app's dev server. The workflows always set them explicitly; production builds (e.g. Vercel) rely on the defaults in each `vite.config.ts`.
- The pnpm version in use is `10.26.1` (enforced by `preinstall` script). Update the lockfile if upgrading pnpm.
- API server bundles to a single `dist/index.mjs` via esbuild; frontend static files can be served from `agency-site/dist/public` in production.

## Gotchas

- After import, run `pnpm install` before starting any workflow — node_modules are not committed.
- `GOOGLE_GENERATIVE_AI_API_KEY` being absent causes 500s on AI endpoints in Tools4Biz; everything else works fine.
- Admin panels (agency-site `/admin`, tools4biz `/admin`) use a single shared `ADMIN_PASSWORD` secret as the bearer token — must be set as a Replit Secret or the api-server refuses to start.
- Every admin-only tab/fetch in `Admin.tsx` must send `Authorization: Bearer <token>`; a missing header 401s silently and looks like the tab "doesn't render" (fixed for the Automation tab).
- The business hunter's real-result volume is capped by anti-bot blocking (403/429) on free directory sites from cloud IPs — not fixable in code without a paid Google Places API key.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._
