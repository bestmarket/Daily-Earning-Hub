import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { MessageSquare, Lightbulb, Code2, Eye, Rocket } from "lucide-react";

const steps = [
  { icon: MessageSquare, number: "01", title: "Tell Us About Your Business", description: "Fill out a quick form about your business goals, challenges, and what you need. No tech jargon required.", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100" },
  { icon: Lightbulb, number: "02", title: "We Design the Perfect Solution", description: "Our team creates a custom software plan tailored to your exact business needs and budget.", color: "text-yellow-600", bg: "bg-yellow-50", border: "border-yellow-100" },
  { icon: Code2, number: "03", title: "We Build Your Software", description: "Development begins with regular progress updates. You're always in the loop — no surprises.", color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-100" },
  { icon: Eye, number: "04", title: "You Review Everything", description: "Test your software and request any changes. We revise until it's exactly what you envisioned.", color: "text-cyan-600", bg: "bg-cyan-50", border: "border-cyan-100" },
  { icon: Rocket, number: "05", title: "Launch and Grow", description: "Your software goes live and starts generating results. We're here to support you as you scale.", color: "text-green-600", bg: "bg-green-50", border: "border-green-100" },
];

export default function HowItWorks() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="process" className="py-24 md:py-32 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          ref={ref}
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block text-sm font-bold tracking-widest text-[#7C3AED] uppercase mb-4">
            Our Process
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold mb-6 text-[#111827]">
            How We Build Your Software<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7C3AED] to-[#6366F1]">
              in 5 Simple Steps
            </span>
          </h2>
          <p className="text-[#6B7280] text-lg max-w-xl mx-auto">
            We make the process simple, transparent, and collaborative. No tech overwhelm — just results.
          </p>
        </motion.div>

        <div className="relative max-w-4xl mx-auto">
          {/* Connector line */}
          <div className="hidden lg:block absolute left-[44px] top-16 bottom-16 w-0.5 bg-gradient-to-b from-[#7C3AED]/40 via-[#6366F1]/20 to-transparent" />

          <div className="space-y-6">
            {steps.map((step, i) => (
              <motion.div
                key={step.number}
                className="relative flex flex-col lg:flex-row items-start gap-5"
                initial={{ opacity: 0, x: -20 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <div className="flex-shrink-0">
                  <div className={`w-[88px] h-[88px] rounded-2xl ${step.bg} border ${step.border} flex items-center justify-center z-10 relative shadow-sm`}>
                    <step.icon className={`w-8 h-8 ${step.color}`} />
                  </div>
                </div>
                <div className="flex-1 bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-sm hover:shadow-md hover:border-[#7C3AED]/20 transition-all duration-300">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs font-extrabold text-[#7C3AED] tracking-widest bg-purple-50 px-2 py-0.5 rounded-full">{step.number}</span>
                    <h3 className="font-bold text-lg text-[#111827]">{step.title}</h3>
                  </div>
                  <p className="text-[#6B7280] leading-relaxed">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
