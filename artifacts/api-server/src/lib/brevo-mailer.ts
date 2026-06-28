import nodemailer from "nodemailer";

if (!process.env.BREVO_SMTP_USER) {
  throw new Error("BREVO_SMTP_USER is not set");
}
if (!process.env.BREVO_SMTP_PASSWORD) {
  throw new Error("BREVO_SMTP_PASSWORD is not set");
}

export const brevoTransporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false,
  requireTLS: true,
  auth: {
    user: process.env.BREVO_SMTP_USER,
    pass: process.env.BREVO_SMTP_PASSWORD,
  },
  tls: { rejectUnauthorized: false },
  connectionTimeout: 15000,
  greetingTimeout: 10000,
  socketTimeout: 15000,
} as any);

export async function sendMail(opts: {
  to: string;
  subject: string;
  html: string;
  text?: string;
  fromName?: string;
  fromEmail?: string;
}) {
  const from = `"${opts.fromName ?? "DevStudio"}" <${opts.fromEmail ?? process.env.BREVO_SMTP_USER}>`;
  return brevoTransporter.sendMail({
    from,
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
    text: opts.text,
  });
}
