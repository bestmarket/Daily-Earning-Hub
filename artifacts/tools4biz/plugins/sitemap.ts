import type { Plugin, ResolvedConfig } from "vite";
import { writeFileSync, mkdirSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SITE_URL = process.env.SITE_URL || "https://tools4biz.com";

const STATIC_PAGES = [
  { path: "/", priority: "1.0", changefreq: "weekly" },
  { path: "/tools", priority: "0.9", changefreq: "daily" },
  { path: "/about", priority: "0.7", changefreq: "monthly" },
  { path: "/custom-request", priority: "0.8", changefreq: "monthly" },
  { path: "/privacy-policy", priority: "0.3", changefreq: "yearly" },
  { path: "/terms", priority: "0.3", changefreq: "yearly" },
  { path: "/refund", priority: "0.3", changefreq: "yearly" },
];

const ROBOTS_TXT = `User-agent: *
Allow: /
Sitemap: ${SITE_URL}/sitemap.xml
`;

async function fetchToolIds(): Promise<number[]> {
  try {
    const { db, toolsTable } = await import("@workspace/db");
    const tools = await db.select({ id: toolsTable.id }).from(toolsTable);
    return tools.map((t) => t.id);
  } catch {
    return [];
  }
}

function buildSitemapXml(toolIds: number[]): string {
  const today = new Date().toISOString().split("T")[0];

  const staticUrls = STATIC_PAGES.map(
    (p) => `  <url>
    <loc>${SITE_URL}${p.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`,
  );

  const toolUrls = toolIds.map(
    (id) => `  <url>
    <loc>${SITE_URL}/tools/${id}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`,
  );

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...staticUrls, ...toolUrls].join("\n")}
</urlset>`;
}

export function sitemapPlugin(): Plugin {
  let resolvedConfig: ResolvedConfig;

  return {
    name: "tools4biz-sitemap",

    configResolved(config) {
      resolvedConfig = config;
    },

    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url?.split("?")[0];

        if (url === "/robots.txt") {
          res.setHeader("Content-Type", "text/plain; charset=utf-8");
          res.setHeader("Cache-Control", "public, max-age=3600");
          res.end(ROBOTS_TXT);
          return;
        }

        if (url === "/sitemap.xml") {
          try {
            const toolIds = await fetchToolIds();
            const xml = buildSitemapXml(toolIds);
            res.setHeader("Content-Type", "application/xml; charset=utf-8");
            res.setHeader("Cache-Control", "public, max-age=3600");
            res.end(xml);
          } catch (err) {
            console.error("[sitemap] Generation failed:", err);
            next();
          }
          return;
        }

        next();
      });
    },

    async closeBundle() {
      if (resolvedConfig?.command !== "build") return;

      const outDir = resolvedConfig.build?.outDir ?? resolve(__dirname, "../dist/public");

      try {
        mkdirSync(outDir, { recursive: true });

        const toolIds = await fetchToolIds();
        const xml = buildSitemapXml(toolIds);

        writeFileSync(resolve(outDir, "sitemap.xml"), xml, "utf-8");
        writeFileSync(resolve(outDir, "robots.txt"), ROBOTS_TXT, "utf-8");

        console.log(`[sitemap] ✓ Generated sitemap.xml with ${toolIds.length} tool pages + ${STATIC_PAGES.length} static pages`);
        console.log(`[sitemap] ✓ Generated robots.txt`);
      } catch (err) {
        console.warn("[sitemap] Could not generate static sitemap at build time:", err);
      }
    },
  };
}
