import express, { type Express, type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import path from "path";
import { fileURLToPath } from "url";
import { existsSync } from "fs";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

// Allow all origins so Vercel (or any frontend) can call this API
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Deployment healthcheck — must respond 200 before the router is entered ───
app.get("/api", (_req, res) => res.json({ status: "ok" }));

// ─── API routes ───────────────────────────────────────────────────────────────
app.use("/api", router);

// ─── Serve built frontend (production) ───────────────────────────────────────
// Resolve staticDir relative to this file's location so it works regardless
// of what the working directory is.
// Built output: artifacts/api-server/dist/index.mjs
// Frontend build: artifacts/agency-site/dist/
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Allow override via env var, otherwise resolve relative to this file
const staticDir =
  process.env.STATIC_DIR ??
  path.resolve(__dirname, "../../agency-site/dist/public");

if (existsSync(staticDir)) {
  logger.info({ staticDir }, "Serving frontend static files");
  app.use(express.static(staticDir));

  // SPA fallback — serve index.html for all unmatched GET routes so
  // client-side routing works (/admin, /pay, /tools/…, etc.)
  // Express 5 requires named wildcard syntax instead of bare "*"
  app.get("/{*splat}", (_req, res) => {
    res.sendFile(path.join(staticDir, "index.html"));
  });
} else {
  logger.warn({ staticDir }, "Frontend static files not found — API-only mode");
  app.get("/", (_req, res) => {
    res.json({ ok: true, message: "API server running. Build the frontend to enable full-stack mode." });
  });
}

// ─── Global JSON error handler ───────────────────────────────────────────────
// Must be registered AFTER all routes. Catches any error that escapes a route
// handler (unhandled promise rejections in Express 5, thrown errors, etc.) and
// always responds with JSON so the client never receives an HTML error page.
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = typeof err.status === "number" ? err.status : (typeof err.statusCode === "number" ? err.statusCode : 500);
  const message = err.message || "Internal server error";
  logger.error({ err }, "Unhandled error");
  if (!res.headersSent) {
    res.status(status).json({ error: message });
  }
});

export default app;
