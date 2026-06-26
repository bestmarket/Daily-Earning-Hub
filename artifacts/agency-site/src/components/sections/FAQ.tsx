import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "How long does it take to build my software?",
    a: "Most projects are delivered in 1–4 weeks depending on complexity. Simple landing pages and booking systems take 1–2 weeks. Full SaaS platforms with AI features take 3–4 weeks. We'll give you an exact timeline during your free discovery call before any work begins.",
  },
  {
    q: "How much does it cost?",
    a: "Projects start from $99. The final cost depends on your requirements — we provide a fixed, transparent quote before we start. No hidden fees, no monthly retainers unless you choose ongoing maintenance. Get a free estimate by filling out our project form.",
  },
  {
    q: "Can you integrate payment processing?",
    a: "Yes, we integrate with Stripe, PayPal, Paystack, Flutterwave, and Paddle depending on your location and needs. We handle the entire payment flow including subscriptions, invoicing, and payment receipts.",
  },
  {
    q: "Can I request changes and revisions?",
    a: "Absolutely. Every project includes revision rounds so you can refine the software until it's exactly right. We don't lock you into 'take it or leave it' deliverables — collaboration is core to how we work.",
  },
  {
    q: "Do you build complete SaaS platforms?",
    a: "Yes — SaaS development is one of our specialties. We build complete multi-tenant SaaS applications with subscription billing, user management, admin dashboards, and all the infrastructure you need to scale.",
  },
  {
    q: "Can you build AI-powered tools?",
    a: "Yes. We integrate AI into your software using OpenAI, Claude, and other leading AI APIs. From AI chatbots and assistants to intelligent automation and data analysis — we make your software smarter.",
  },
  {
    q: "Do you provide hosting for my software?",
    a: "Yes, we can handle full deployment and hosting on Vercel, Railway, Render, or a cloud provider of your choice. We'll recommend the best hosting option for your budget and traffic requirements.",
  },
  {
    q: "Can you maintain and update my software after launch?",
    a: "Yes, we offer monthly maintenance plans that cover bug fixes, security updates, feature additions, and performance optimization. Your software will stay fast, secure, and current as your business grows.",
  },
];

export default function FAQ() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="faq" className="py-24 md:py-32 relative">
      <div className="container mx-auto px-4 md:px-6 max-w-3xl">
        <motion.div
          ref={ref}
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block text-sm font-semibold tracking-widest text-primary uppercase mb-4">
            FAQ
          </span>
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Frequently Asked Questions
          </h2>
          <p className="text-muted-foreground text-lg">
            Everything you need to know before getting started.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                className="rounded-xl border border-border/50 bg-card/40 backdrop-blur-sm px-5 hover:border-primary/30 transition-colors"
                data-testid={`faq-item-${i}`}
              >
                <AccordionTrigger className="text-left font-semibold text-sm md:text-base hover:no-underline py-5">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm leading-relaxed pb-5">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}
