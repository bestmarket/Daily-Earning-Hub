import { Router } from "express";
import { db } from "@workspace/db";
import { customRequestsTable } from "@workspace/db";
import { SubmitCustomRequestBody } from "@workspace/api-zod";

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
  } catch (err) {
    req.log.error({ err }, "Failed to submit custom request");
    res.status(500).json({ error: "Failed to submit request" });
  }
});

export default router;
