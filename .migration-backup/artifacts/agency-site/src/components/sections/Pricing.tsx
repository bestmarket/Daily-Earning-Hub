import { motion, useInView } from "framer-motion";
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
  },
];

export default function Pricing() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const openLeadMagnet = () => window.dispatchEvent(new CustomEvent("open-lead-magnet"));

  return (
    <section id="pricing" className="py-24 md:py-32 bg-[#F8FAFC]">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          ref={ref}
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block text-sm font-bold tracking-widest text-[#7C3AED] uppercase mb-4">
            Pricing
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold mb-6 text-[#111827]">
            Simple, Transparent Pricing
          </h2>
          <p className="text-[#6B7280] text-lg max-w-xl mx-auto">
            No hidden fees. No retainers. Fixed price before we start — free estimates always available.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              className={`relative rounded-2xl flex flex-col p-8 ${
                plan.popular
                  ? "bg-gradient-to-b from-[#7C3AED] to-[#6366F1] text-white shadow-2xl shadow-purple-300/40 ring-4 ring-purple-300/20"
                  : "bg-white border border-[#E5E7EB] shadow-sm"
              }`}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-white text-[#7C3AED] text-xs font-bold px-4 py-1.5 rounded-full shadow-lg">
                    ⭐ Most Popular
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className={`font-bold text-lg mb-1 ${plan.popular ? "text-white" : "text-[#111827]"}`}>{plan.name}</h3>
                <p className={`text-sm mb-4 ${plan.popular ? "text-purple-200" : "text-[#6B7280]"}`}>{plan.description}</p>
                <div className={`text-xs ${plan.popular ? "text-purple-200" : "text-[#6B7280]"} mb-1`}>{plan.label}</div>
                <div className={`text-4xl font-extrabold ${plan.popular ? "text-white" : "text-[#111827]"}`}>{plan.price}</div>
              </div>

              <ul className="space-y-3 flex-1 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-sm">
                    <CheckCircle2 className={`w-4 h-4 flex-shrink-0 ${plan.popular ? "text-purple-200" : "text-[#7C3AED]"}`} />
                    <span className={plan.popular ? "text-purple-100" : "text-[#374151]"}>{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                size="lg"
                className={`w-full font-semibold ${
                  plan.popular
                    ? "bg-white text-[#7C3AED] hover:bg-purple-50 shadow-lg"
                    : "btn-premium text-white"
                }`}
                onClick={openLeadMagnet}
              >
                {plan.cta}
              </Button>
            </motion.div>
          ))}
        </div>

        <motion.p
          className="text-center text-sm text-[#6B7280] mt-8"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.5 }}
        >
          All projects include a free discovery call, revision rounds, and post-launch support. {" "}
          <button onClick={openLeadMagnet} className="text-[#7C3AED] underline underline-offset-2 hover:no-underline font-medium">
            Get a free estimate →
          </button>
        </motion.p>
      </div>
    </section>
  );
}
