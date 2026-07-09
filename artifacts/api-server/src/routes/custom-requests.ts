import { Router } from "express";
import { db } from "@workspace/db";
import { customRequestsTable } from "@workspace/db";
import { SubmitCustomRequestBody } from "@workspace/api-zod";
import { notifyAdmin } from "./crm-ai";

const router = Router();

router.post("/custom-requests", async (req, res) => {
  try {
    const parsed = SubmitCustomRequestBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid input" });
      return;
    }

    const [entry] = await db
      .insert(customRequestsTable)
      .values({
        name: parsed.data.name ?? null,
        email: parsed.data.email,
        businessType: parsed.data.businessType ?? null,
        description: parsed.data.description,
        budget: parsed.data.budget ?? null,
        whatsapp: parsed.data.whatsapp ?? null,
        status: "new",
      })
      .returning();

    res.status(201).json({
      ...entry,
      paymentAmount: entry!.paymentAmount ? Number(entry!.paymentAmount) : null,
      createdAt: entry!.createdAt.toISOString(),
    });

    // Fire-and-forget internal notification — never blocks or fails the client response.
    notifyAdmin(
      `New proposal request${entry!.businessType ? ` — ${entry!.businessType}` : ""}`,
      `<div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;">
        <h2 style="color:#6d28d9;">New custom project request</h2>
        <p><strong>Name:</strong> ${entry!.name || "(not provided)"}</p>
        <p><strong>Email:</strong> ${entry!.email}</p>
        <p><strong>Business type:</strong> ${entry!.businessType || "(not provided)"}</p>
        <p><strong>WhatsApp:</strong> ${entry!.whatsapp || "(not provided)"}</p>
        <p><strong>Budget:</strong> ${entry!.budget || "(not provided)"}</p>
        <p><strong>Description:</strong></p>
        <p style="white-space:pre-wrap;background:#f5f3ff;padding:12px;border-radius:8px;">${entry!.description}</p>
      </div>`
    ).catch(() => {});
  } catch (err) {
    req.log.error({ err }, "Failed to submit custom request");
    res.status(500).json({ error: "Failed to submit request" });
  }
});

export default router;
