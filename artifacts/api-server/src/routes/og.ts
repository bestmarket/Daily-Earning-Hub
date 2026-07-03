import { Router } from "express";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import { db, toolsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

const CACHE_TTL_MS = 60 * 60 * 1000;
const imageCache = new Map<number, { buf: Buffer; ts: number }>();
let fontBold: ArrayBuffer | null = null;
let fontRegular: ArrayBuffer | null = null;

async function loadFonts() {
  if (fontBold && fontRegular) return;
  const [bold, regular] = await Promise.all([
    fetch("https://fonts.bunny.net/inter/files/inter-latin-700-normal.woff").then((r) => r.arrayBuffer()),
    fetch("https://fonts.bunny.net/inter/files/inter-latin-400-normal.woff").then((r) => r.arrayBuffer()),
  ]);
  fontBold = bold;
  fontRegular = regular;
}

function statusLabel(status: string) {
  if (status === "available") return "✓ Available";
  if (status === "beta") return "β Beta";
  return "⏳ Coming Soon";
}

function statusColors(status: string) {
  if (status === "available") return { bg: "#dcfce7", text: "#15803d" };
  if (status === "beta") return { bg: "#dbeafe", text: "#1d4ed8" };
  return { bg: "#fff7ed", text: "#c2410c" };
}

// Satori: EVERY element with multiple children needs display: flex
async function generateOgImage(tool: {
  id: number;
  name: string;
  description: string;
  category: string;
  price: string | number;
  currency: string;
  status: string;
  emoji: string | null;
  tagline: string | null;
}): Promise<Buffer> {
  await loadFonts();

  const sc = statusColors(tool.status);
  const emoji = tool.emoji || "⚡";
  const price = Number(tool.price);
  const subtitle =
    tool.tagline ||
    (tool.description.length > 90 ? tool.description.slice(0, 90) + "…" : tool.description);

  const svg = await satori(
    // Root: 1200×630 white card
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ({
      type: "div",
      props: {
        style: {
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: "1200px",
          height: "630px",
          backgroundColor: "#ffffff",
          fontFamily: "Inter",
          padding: "0px",
          position: "relative",
        },
        children: [
          // Top accent strip
          {
            type: "div",
            props: {
              style: {
                display: "flex",
                width: "1200px",
                height: "8px",
                background: "linear-gradient(90deg, #6366f1 0%, #8b5cf6 50%, #a78bfa 100%)",
              },
              children: [],
            },
          },

          // Main body
          {
            type: "div",
            props: {
              style: {
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                flex: 1,
                padding: "52px 72px 48px 72px",
              },
              children: [
                // ── Top section ──────────────────────────────────────
                {
                  type: "div",
                  props: {
                    style: {
                      display: "flex",
                      flexDirection: "column",
                      gap: "20px",
                    },
                    children: [
                      // Row: emoji + badges
                      {
                        type: "div",
                        props: {
                          style: {
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "center",
                            gap: "16px",
                          },
                          children: [
                            // Emoji box
                            {
                              type: "div",
                              props: {
                                style: {
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  width: "76px",
                                  height: "76px",
                                  borderRadius: "18px",
                                  backgroundColor: "#f5f3ff",
                                  border: "2px solid #e9e5ff",
                                  fontSize: "40px",
                                },
                                children: [emoji],
                              },
                            },
                            // Category badge
                            {
                              type: "div",
                              props: {
                                style: {
                                  display: "flex",
                                  alignItems: "center",
                                  backgroundColor: "#ede9fe",
                                  borderRadius: "9999px",
                                  padding: "8px 20px",
                                  fontSize: "18px",
                                  fontWeight: 700,
                                  color: "#4f46e5",
                                  letterSpacing: "0.04em",
                                },
                                children: [tool.category.toUpperCase()],
                              },
                            },
                            // Status badge
                            {
                              type: "div",
                              props: {
                                style: {
                                  display: "flex",
                                  alignItems: "center",
                                  backgroundColor: sc.bg,
                                  borderRadius: "9999px",
                                  padding: "8px 20px",
                                  fontSize: "18px",
                                  fontWeight: 700,
                                  color: sc.text,
                                  letterSpacing: "0.04em",
                                },
                                children: [statusLabel(tool.status)],
                              },
                            },
                          ],
                        },
                      },

                      // Tool name
                      {
                        type: "div",
                        props: {
                          style: {
                            display: "flex",
                            fontSize: "60px",
                            fontWeight: 700,
                            color: "#0f0f0f",
                            lineHeight: 1.1,
                            letterSpacing: "-0.025em",
                            maxWidth: "950px",
                          },
                          children: [tool.name],
                        },
                      },

                      // Subtitle / tagline
                      {
                        type: "div",
                        props: {
                          style: {
                            display: "flex",
                            fontSize: "26px",
                            fontWeight: 400,
                            color: "#6b7280",
                            lineHeight: 1.4,
                            maxWidth: "860px",
                          },
                          children: [subtitle],
                        },
                      },
                    ],
                  },
                },

                // ── Bottom bar ───────────────────────────────────────
                {
                  type: "div",
                  props: {
                    style: {
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      borderTop: "2px solid #f3f4f6",
                      paddingTop: "24px",
                    },
                    children: [
                      // Left: branding
                      {
                        type: "div",
                        props: {
                          style: {
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "center",
                            gap: "14px",
                          },
                          children: [
                            // T logo mark
                            {
                              type: "div",
                              props: {
                                style: {
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  width: "46px",
                                  height: "46px",
                                  borderRadius: "12px",
                                  backgroundColor: "#6366f1",
                                  fontSize: "26px",
                                  fontWeight: 700,
                                  color: "#ffffff",
                                },
                                children: ["T"],
                              },
                            },
                            // Name + domain stacked
                            {
                              type: "div",
                              props: {
                                style: {
                                  display: "flex",
                                  flexDirection: "column",
                                  gap: "2px",
                                },
                                children: [
                                  {
                                    type: "div",
                                    props: {
                                      style: {
                                        display: "flex",
                                        fontSize: "24px",
                                        fontWeight: 700,
                                        color: "#111827",
                                        letterSpacing: "-0.01em",
                                      },
                                      children: ["Tools4Biz"],
                                    },
                                  },
                                  {
                                    type: "div",
                                    props: {
                                      style: {
                                        display: "flex",
                                        fontSize: "16px",
                                        fontWeight: 400,
                                        color: "#9ca3af",
                                      },
                                      children: ["tools4biz.com"],
                                    },
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },

                      // Right: price block
                      {
                        type: "div",
                        props: {
                          style: {
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "flex-end",
                            gap: "4px",
                          },
                          children: [
                            // Price row
                            {
                              type: "div",
                              props: {
                                style: {
                                  display: "flex",
                                  flexDirection: "row",
                                  alignItems: "baseline",
                                  gap: "6px",
                                },
                                children: [
                                  {
                                    type: "div",
                                    props: {
                                      style: {
                                        display: "flex",
                                        fontSize: "54px",
                                        fontWeight: 700,
                                        color: "#0f0f0f",
                                        letterSpacing: "-0.03em",
                                      },
                                      children: [`$${price}`],
                                    },
                                  },
                                  {
                                    type: "div",
                                    props: {
                                      style: {
                                        display: "flex",
                                        fontSize: "20px",
                                        fontWeight: 700,
                                        color: "#9ca3af",
                                        letterSpacing: "0.08em",
                                      },
                                      children: [tool.currency || "USD"],
                                    },
                                  },
                                ],
                              },
                            },
                            // One-time label
                            {
                              type: "div",
                              props: {
                                style: {
                                  display: "flex",
                                  fontSize: "16px",
                                  fontWeight: 400,
                                  color: "#6b7280",
                                },
                                children: ["One-time payment · Lifetime access"],
                              },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    }) as any,
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: "Inter", data: fontBold!, weight: 700, style: "normal" },
        { name: "Inter", data: fontRegular!, weight: 400, style: "normal" },
      ],
    },
  );

  const resvg = new Resvg(svg, { fitTo: { mode: "width", value: 1200 } });
  return Buffer.from(resvg.render().asPng());
}

router.get("/og/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!id || isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const cached = imageCache.get(id);
  if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
    res.setHeader("Content-Type", "image/png");
    res.setHeader("Cache-Control", "public, max-age=3600, stale-while-revalidate=86400");
    res.send(cached.buf);
    return;
  }

  try {
    const [tool] = await db.select().from(toolsTable).where(eq(toolsTable.id, id));
    if (!tool) {
      res.status(404).json({ error: "Tool not found" });
      return;
    }

    const buf = await generateOgImage(tool);
    imageCache.set(id, { buf, ts: Date.now() });

    res.setHeader("Content-Type", "image/png");
    res.setHeader("Cache-Control", "public, max-age=3600, stale-while-revalidate=86400");
    res.send(buf);
  } catch (err) {
    req.log.error({ err }, "Failed to generate OG image");
    res.status(500).json({ error: "Failed to generate image" });
  }
});

export default router;
