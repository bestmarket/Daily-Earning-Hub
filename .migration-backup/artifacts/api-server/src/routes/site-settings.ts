import { Router } from "express";

const router = Router();

// In-memory store (persists while server runs, reset on restart)
// In production you'd store in DB — good enough for admin editing
let siteSettings = {
  pricing: [
    {
      id: "starter",
      name: "Starter",
      price: "$99",
      description: "Perfect for getting your business online fast.",
      features: [
        "Landing page design",
        "Lead generation form",
        "Contact & inquiry forms",
        "WhatsApp chat integration",
        "SEO setup & optimization",
      ],
      popular: false,
    },
    {
      id: "business",
      name: "Business",
      price: "$299",
      description: "Everything you need to automate and scale your business.",
      features: [
        "Online booking system",
        "Admin dashboard & analytics",
        "Payment integration",
        "Customer self-service portal",
        "Workflow automation",
        "Email & SMS notifications",
      ],
      popular: true,
    },
    {
      id: "custom",
      name: "Custom Software",
      price: "$999",
      description: "A fully custom SaaS or enterprise platform built for growth.",
      features: [
        "Complete SaaS application",
        "AI integration & automation",
        "Membership platform",
        "Marketplace functionality",
        "Subscription billing system",
        "Advanced reporting dashboards",
      ],
      popular: false,
    },
  ],
  paymentMethods: [
    { id: "paypal", name: "PayPal", enabled: true, details: "payments@devstudio.com" },
    { id: "paystack", name: "Paystack", enabled: true, details: "" },
    { id: "stripe", name: "Stripe", enabled: false, details: "" },
    { id: "bank", name: "Bank Transfer", enabled: true, details: "Details sent on request" },
    { id: "crypto", name: "Crypto (USDT/BTC)", enabled: false, details: "" },
  ],
  contact: {
    whatsapp: "+15550000000",
    email: "hello@devstudio.com",
    whatsappDisplay: "+1 (555) 000-0000",
  },
  hero: {
    headline: "We Build Custom Web Apps That Help Businesses Get More Customers, Save Time & Increase Revenue.",
    subheadline: "From booking systems and customer portals to AI-powered business tools and SaaS platforms, we build software that helps your business grow faster.",
    ctaPrimary: "Get My Free Business Tool Idea",
    ctaSecondary: "View Live Examples",
  },
};

// Public: get all settings (used by frontend)
router.get("/site-settings", (_req, res) => {
  res.json(siteSettings);
});

// Admin: update pricing plans
router.put("/admin/site-settings/pricing", (req, res) => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (token !== process.env.ADMIN_TOKEN && token !== "devstudio-admin") {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  siteSettings.pricing = req.body;
  res.json({ success: true, pricing: siteSettings.pricing });
});

// Admin: update a single pricing plan
router.patch("/admin/site-settings/pricing/:id", (req, res) => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (token !== process.env.ADMIN_TOKEN && token !== "devstudio-admin") {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const idx = siteSettings.pricing.findIndex((p) => p.id === req.params.id);
  if (idx === -1) {
    res.status(404).json({ error: "Plan not found" });
    return;
  }
  siteSettings.pricing[idx] = { ...siteSettings.pricing[idx], ...req.body };
  res.json({ success: true, plan: siteSettings.pricing[idx] });
});

// Admin: update payment methods
router.put("/admin/site-settings/payment-methods", (req, res) => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (token !== process.env.ADMIN_TOKEN && token !== "devstudio-admin") {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  siteSettings.paymentMethods = req.body;
  res.json({ success: true, paymentMethods: siteSettings.paymentMethods });
});

// Admin: update contact info
router.patch("/admin/site-settings/contact", (req, res) => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (token !== process.env.ADMIN_TOKEN && token !== "devstudio-admin") {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  siteSettings.contact = { ...siteSettings.contact, ...req.body };
  res.json({ success: true, contact: siteSettings.contact });
});

// Admin: update hero content
router.patch("/admin/site-settings/hero", (req, res) => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (token !== process.env.ADMIN_TOKEN && token !== "devstudio-admin") {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  siteSettings.hero = { ...siteSettings.hero, ...req.body };
  res.json({ success: true, hero: siteSettings.hero });
});

export default router;
