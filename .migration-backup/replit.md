# [Project name]

_Replace the heading above with the project's name, and this line with one sentence describing what this app does for users._

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

_Populate as you build — short repo map plus pointers to the source-of-truth file for DB schema, API contracts, theme files, etc._

## Architecture decisions

_Populate as you build — non-obvious choices a reader couldn't infer from the code (3-5 bullets)._

## Product

_Describe the high-level user-facing capabilities of this app once they exist._

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Vercel Deployment (agency-site)

The `agency-site` is configured to deploy to Vercel as a static frontend. The `vercel.json` at the repo root points Vercel at the right build command and output directory.

### Environment variables to set in the Vercel dashboard

| Variable | Required | Description |
|---|---|---|
| `VITE_API_BASE_URL` | **Yes** | Full URL of your deployed API server (e.g. `https://your-api.railway.app`). Without this, all `/api/...` calls will fail since Vercel has no backend. |

### How to set them
1. Go to your Vercel project → **Settings** → **Environment Variables**
2. Add `VITE_API_BASE_URL` with the URL of your separately-hosted API server
3. Set the environment to **Production** (and Preview if desired)
4. Redeploy

### Deploying the API server
The API server (`artifacts/api-server`) is an Express app — it cannot run on Vercel directly. Host it on a platform that supports Node.js long-running servers, such as:
- **Railway** (recommended — easiest pnpm monorepo support)
- **Render**
- **Fly.io**

Once deployed there, copy that URL into the `VITE_API_BASE_URL` variable above.

The API server requires its own environment variable:
| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `GOOGLE_GENERATIVE_AI_API_KEY` | Google Gemini API key (for AI recommendation feature) |

## Gotchas

- `PORT` and `BASE_PATH` are optional in `vite.config.ts` — they default to `3000` and `/` when not set (as on Vercel builds). Do not make them required again.
- The pnpm version is pinned to `10.26.1` in `package.json` (`packageManager` field). If you upgrade pnpm, update this field and regenerate the lockfile before pushing.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
