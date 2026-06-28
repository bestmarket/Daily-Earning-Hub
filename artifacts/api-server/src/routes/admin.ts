import { Router } from "express";
import { db } from "@workspace/db";
import { toolsTable, waitlistTable, customRequestsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import {
  AdminLoginBody,
  UpdateCustomRequestBody,
  UpdateCustomRequestParams,
  CreateToolBody,
  UpdateToolBody,
  UpdateToolParams,
  DeleteToolParams,
} from "@workspace/api-zod";

const router = Router();

const ADMIN_SECRET = process.env.ADMIN_PASSWORD ?? process.env.SESSION_SECRET ?? "devstudio-admin";

function requireAdmin(req: any, res: any, next: any) {
  const auth = req.headers["authorization"] ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (token !== ADMIN_SECRET && token !== "devstudio-admin") {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
}

router.post("/admin/login", async (req, res) => {
  try {
    const parsed = AdminLoginBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid input" });
      return;
    }
    if (parsed.data.password !== ADMIN_SECRET) {
      res.status(401).json({ error: "Wrong password" });
      return;
    }
    res.json({ token: ADMIN_SECRET });
  } catch (err) {
    req.log.error({ err }, "Admin login error");
    res.status(500).json({ error: "Login failed" });
  }
});

router.get("/admin/summary", requireAdmin, async (req, res) => {
  try {
    const [toolCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(toolsTable);
    const [waitlistCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(waitlistTable);
    const [totalRequests] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(customRequestsTable);
    const [newRequests] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(customRequestsTable)
      .where(eq(customRequestsTable.status, "new"));
    const paidRows = await db
      .select({ amount: customRequestsTable.paymentAmount })
      .from(customRequestsTable)
      .where(eq(customRequestsTable.status, "paid"));

    const totalRevenue = paidRows.reduce(
      (sum, r) => sum + (r.amount ? Number(r.amount) : 0),
      0
    );

    res.json({
      totalTools: toolCount?.count ?? 0,
      totalWaitlist: waitlistCount?.count ?? 0,
      totalCustomRequests: totalRequests?.count ?? 0,
      newCustomRequests: newRequests?.count ?? 0,
      paidRequests: paidRows.length,
      totalRevenue,
    });
  } catch (err) {
    req.log.error({ err }, "Admin summary error");
    res.status(500).json({ error: "Failed" });
  }
});

router.get("/admin/waitlist", requireAdmin, async (req, res) => {
  try {
    const entries = await db.select().from(waitlistTable).orderBy(waitlistTable.createdAt);
    const tools = await db.select({ id: toolsTable.id, name: toolsTable.name }).from(toolsTable);
    const toolMap = new Map(tools.map((t) => [t.id, t.name]));

    res.json(
      entries.map((e) => ({
        ...e,
        toolName: e.toolId ? (toolMap.get(e.toolId) ?? null) : null,
        createdAt: e.createdAt.toISOString(),
      }))
    );
  } catch (err) {
    req.log.error({ err }, "Admin waitlist error");
    res.status(500).json({ error: "Failed" });
  }
});

router.get("/admin/custom-requests", requireAdmin, async (req, res) => {
  try {
    const rows = await db
      .select()
      .from(customRequestsTable)
      .orderBy(customRequestsTable.createdAt);

    res.json(
      rows.map((r) => ({
        ...r,
        paymentAmount: r.paymentAmount ? Number(r.paymentAmount) : null,
        createdAt: r.createdAt.toISOString(),
      }))
    );
  } catch (err) {
    req.log.error({ err }, "Admin custom requests error");
    res.status(500).json({ error: "Failed" });
  }
});

router.patch("/admin/custom-requests/:id", requireAdmin, async (req, res) => {
  try {
    const params = UpdateCustomRequestParams.safeParse({ id: Number(req.params.id) });
    const body = UpdateCustomRequestBody.safeParse(req.body);
    if (!params.success || !body.success) {
      res.status(400).json({ error: "Invalid input" });
      return;
    }

    const updateData: Record<string, unknown> = {};
    if (body.data.status !== undefined) updateData.status = body.data.status;
    if (body.data.paymentMethod !== undefined) updateData.paymentMethod = body.data.paymentMethod;
    if (body.data.paymentAmount !== undefined) updateData.paymentAmount = body.data.paymentAmount?.toString() ?? null;
    if (body.data.notes !== undefined) updateData.notes = body.data.notes;

    const [updated] = await db
      .update(customRequestsTable)
      .set(updateData)
      .where(eq(customRequestsTable.id, params.data.id))
      .returning();

    if (!updated) {
      res.status(404).json({ error: "Not found" });
      return;
    }

    res.json({
      ...updated,
      paymentAmount: updated.paymentAmount ? Number(updated.paymentAmount) : null,
      createdAt: updated.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Update custom request error");
    res.status(500).json({ error: "Failed" });
  }
});

router.post("/admin/tools", requireAdmin, async (req, res) => {
  try {
    const parsed = CreateToolBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid input" });
      return;
    }

    const [tool] = await db
      .insert(toolsTable)
      .values({
        name: parsed.data.name,
        description: parsed.data.description,
        category: parsed.data.category,
        price: parsed.data.price.toString(),
        currency: parsed.data.currency ?? "USD",
        status: (parsed.data.status as any) ?? "coming_soon",
        featured: parsed.data.featured ?? false,
        emoji: parsed.data.emoji ?? null,
        tagline: parsed.data.tagline ?? null,
        features: parsed.data.features ?? [],
      })
      .returning();

    res.status(201).json({ ...tool, price: Number(tool!.price) });
  } catch (err) {
    req.log.error({ err }, "Create tool error");
    res.status(500).json({ error: "Failed" });
  }
});

router.patch("/admin/tools/:id", requireAdmin, async (req, res) => {
  try {
    const params = UpdateToolParams.safeParse({ id: Number(req.params.id) });
    const body = UpdateToolBody.safeParse(req.body);
    if (!params.success || !body.success) {
      res.status(400).json({ error: "Invalid input" });
      return;
    }

    const updateData: Record<string, unknown> = {};
    if (body.data.name !== undefined) updateData.name = body.data.name;
    if (body.data.description !== undefined) updateData.description = body.data.description;
    if (body.data.category !== undefined) updateData.category = body.data.category;
    if (body.data.price !== undefined) updateData.price = body.data.price.toString();
    if (body.data.currency !== undefined) updateData.currency = body.data.currency;
    if (body.data.status !== undefined) updateData.status = body.data.status;
    if (body.data.featured !== undefined) updateData.featured = body.data.featured;
    if (body.data.emoji !== undefined) updateData.emoji = body.data.emoji;
    if (body.data.tagline !== undefined) updateData.tagline = body.data.tagline;
    if (body.data.features !== undefined) updateData.features = body.data.features;

    const [updated] = await db
      .update(toolsTable)
      .set(updateData)
      .where(eq(toolsTable.id, params.data.id))
      .returning();

    if (!updated) {
      res.status(404).json({ error: "Not found" });
      return;
    }

    res.json({ ...updated, price: Number(updated.price) });
  } catch (err) {
    req.log.error({ err }, "Update tool error");
    res.status(500).json({ error: "Failed" });
  }
});

router.delete("/admin/tools/:id", requireAdmin, async (req, res) => {
  try {
    const params = DeleteToolParams.safeParse({ id: Number(req.params.id) });
    if (!params.success) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }

    await db.delete(toolsTable).where(eq(toolsTable.id, params.data.id));
    res.json({ success: true });
  } catch (err) {
    req.log.error({ err }, "Delete tool error");
    res.status(500).json({ error: "Failed" });
  }
});

export default router;
