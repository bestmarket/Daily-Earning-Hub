import { Router } from "express";
import { brevoTransporter, sendMail } from "../lib/brevo-mailer";

const router = Router();

router.post("/brevo/test", async (req, res) => {
  const to = req.body.to;
  if (!to) {
    res.status(400).json({ error: "Missing 'to' email address" });
    return;
  }
  try {
    await brevoTransporter.verify();
    await sendMail({
      to,
      subject: "DevStudio — Brevo SMTP Test",
      html: `<div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:24px;">
        <h2 style="color:#6d28d9;">✓ Brevo SMTP is working</h2>
        <p>This is a test email sent via Brevo (smtp-relay.brevo.com:587).</p>
        <p style="color:#6b7280;font-size:13px;">Sent at: ${new Date().toISOString()}</p>
      </div>`,
      text: "Brevo SMTP is working. Test sent at: " + new Date().toISOString(),
    });
    res.json({ success: true, message: "Test email sent via Brevo" });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/brevo/verify", async (_req, res) => {
  try {
    await brevoTransporter.verify();
    res.json({ success: true, message: "Brevo SMTP connection verified" });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
