import { Router } from "express";
import { db } from "@workspace/db";
import { toolsTable, waitlistTable } from "@workspace/db";
import { eq, sql, and } from "drizzle-orm";
import {
  ListToolsQueryParams,
  GetToolParams,
  JoinWaitlistBody,
} from "@workspace/api-zod";

const router = Router();

router.get("/tools/stats", async (req, res) => {
  try {
    const [toolCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(toolsTable);
    const [waitlistCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(waitlistTable);
    const categories = await db
      .selectDistinct({ category: toolsTable.category })
      .from(toolsTable);
    const [upcomingCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(toolsTable)
      .where(eq(toolsTable.status, "coming_soon"));

    res.json({
      totalTools: toolCount?.count ?? 0,
      totalCustomers: waitlistCount?.count ?? 0,
      totalCategories: categories.length,
      upcomingTools: upcomingCount?.count ?? 0,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get stats");
    res.status(500).json({ error: "Failed to get stats" });
  }
});

router.get("/tools", async (req, res) => {
  try {
    const parsed = ListToolsQueryParams.safeParse(req.query);
    const params = parsed.success ? parsed.data : {};

    const conditions = [];
    if (params.category) {
      conditions.push(eq(toolsTable.category, params.category));
    }
    if (params.featured !== undefined) {
      conditions.push(eq(toolsTable.featured, params.featured));
    }

    const tools =
      conditions.length > 0
        ? await db
            .select()
            .from(toolsTable)
            .where(conditions.length === 1 ? conditions[0] : and(...conditions))
        : await db.select().from(toolsTable);

    res.json(tools.map((t) => ({ ...t, price: Number(t.price) })));
  } catch (err) {
    req.log.error({ err }, "Failed to list tools");
    res.status(500).json({ error: "Failed to list tools" });
  }
});

router.get("/tools/:id", async (req, res) => {
  try {
    const parsed = GetToolParams.safeParse({ id: Number(req.params.id) });
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }

    const [tool] = await db
      .select()
      .from(toolsTable)
      .where(eq(toolsTable.id, parsed.data.id));

    if (!tool) {
      res.status(404).json({ error: "Tool not found" });
      return;
    }

    res.json({ ...tool, price: Number(tool.price) });
  } catch (err) {
    req.log.error({ err }, "Failed to get tool");
    res.status(500).json({ error: "Failed to get tool" });
  }
});

router.post("/waitlist", async (req, res) => {
  try {
    const parsed = JoinWaitlistBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid input" });
      return;
    }

    const [entry] = await db
      .insert(waitlistTable)
      .values({
        email: parsed.data.email,
        name: parsed.data.name ?? null,
        toolId: parsed.data.toolId ?? null,
        message: parsed.data.message ?? null,
      })
      .returning();

    res.status(201).json({
      ...entry,
      createdAt: entry!.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to join waitlist");
    res.status(500).json({ error: "Failed to join waitlist" });
  }
});

router.get("/waitlist/count", async (req, res) => {
  try {
    const [result] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(waitlistTable);
    res.json({ count: result?.count ?? 0 });
  } catch (err) {
    req.log.error({ err }, "Failed to get waitlist count");
    res.status(500).json({ error: "Failed to get count" });
  }
});

export default router;
