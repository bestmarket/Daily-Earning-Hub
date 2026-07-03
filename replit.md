# DevStudio / Tools4Biz

A pnpm monorepo with two public-facing sites (agency marketing site + software tools catalog) backed by a shared Express API server.

## Run & Operate

| Workflow | Command | Port |
|---|---|---|
| Custom Web Apps Agency | `pnpm --filter @workspace/agency-site run dev` | 19242 |
| Tools4Biz | `pnpm --filter @workspace/tools4biz run dev` | 22944 |
| API Server | `pnpm --filter @workspace/api-server run dev` | 8080 |

- `pnpm install` — install all workspace dependencies
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)

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

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._
