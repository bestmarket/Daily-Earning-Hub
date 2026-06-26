import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const plans = [
  {
    name: "Starter",
    price: "$99",
    label: "Starting from",
    description: "Perfect for getting your business online fast.",
    features: [
      "Landing page design",
      "Lead generation form",
      "Contact & inquiry forms",
      "WhatsApp chat integration",
      "SEO setup & optimization",
    ],
    cta: "Get Started",
    popular: false,
    gradient: "from-slate-700/50 to-slate-800/50",
    border: "border-border/50",
    buttonVariant: "outline" as const,
  },
  {
    name: "Business",
    price: "$299",
    label: "Starting from",
    description: "Everything you need to automate and scale your business.",
    features: [
      "Online booking system",
      "Admin dashboard & analytics",
      "Payment integration",
      "Customer self-service portal",
      "Workflow automation",
      "Email & SMS notifications",
    ],
    cta: "Start My Project",
    popular: true,
    gradient: "from-primary/20 to-accent/20",
    border: "border-primary/40",
    buttonVariant: "default" as const,
  },
  {
    name: "Custom Software",
    price: "$999",
    label: "Starting from",
    description: "A fully custom SaaS or enterprise platform built for growth.",
    features: [
      "Complete SaaS application",
      "AI integration & automation",
      "Membership platform",
      "Marketplace functionality",
      "Subscription billing system",
      "Advanced reporting dashboards",
    ],
    cta: "Discuss My Project",
    popular: false,
    gradient: "from-accent/20 to-violet-900/30",
    border: "border-accent/30",
    buttonVariant: "outline" as const,
  },
];

export default function Pricing() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  const openLeadMagnet = () => {
    window.dispatchEvent(new CustomEvent("open-lead-magnet"));
  };

  return (
    <section id="pricing" className="py-24 md:py-32 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent pointer-events-none" />
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          ref={ref}
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block text-sm font-semibold tracking-widest text-primary uppercase mb-4">
            Pricing
          </span>
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Simple, Transparent Pricing
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            No hidden fees. No retainers. You get a fixed price before we start — and free estimates are always available.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              className={`relative rounded-2xl border ${plan.border} bg-gradient-to-br ${plan.gradient} backdrop-blur-sm p-8 flex flex-col ${plan.popular ? "ring-1 ring-primary/40 shadow-2xl shadow-primary/10" : ""}`}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-gradient-to-r from-primary to-accent text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className="font-bold text-lg mb-1">{plan.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
                <div>
                  <span className="text-xs text-muted-foreground">{plan.label}</span>
                  <div className="text-4xl font-bold">{plan.price}</div>
                </div>
              </div>

              <ul className="space-y-3 flex-1 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                variant={plan.buttonVariant}
                size="lg"
                className={`w-full ${plan.popular ? "shadow-lg shadow-primary/25" : ""}`}
                onClick={openLeadMagnet}
                data-testid={`button-pricing-${plan.name.toLowerCase().replace(/\s+/g, "-")}`}
              >
                {plan.cta}
              </Button>
            </motion.div>
          ))}
        </div>

        <motion.p
          className="text-center text-sm text-muted-foreground mt-8"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.5 }}
        >
          All projects include a free discovery call, revision rounds, and post-launch support.
          <button onClick={openLeadMagnet} className="text-primary underline underline-offset-2 ml-1 hover:no-underline">
            Get a free estimate →
          </button>
        </motion.p>
      </div>
    </section>
  );
}
