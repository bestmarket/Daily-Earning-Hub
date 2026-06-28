import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { X, CheckCircle2 } from "lucide-react";

const comparisons = [
  { traditional: "Weeks of meetings before any work starts", ours: "Quick discovery call, we start building fast" },
  { traditional: "Expensive monthly retainers ($5,000+/mo)", ours: "Fixed transparent pricing from $99" },
  { traditional: "Slow delivery — months of waiting", ours: "Fast delivery in 1–4 weeks" },
  { traditional: "Generic templates passed off as custom", ours: "100% custom-built for your business" },
  { traditional: "No AI features or modern integrations", ours: "AI-powered by default" },
  { traditional: "Slow email support, weeks for a reply", ours: "Direct WhatsApp communication daily" },
  { traditional: "Pitches full of technical jargon", ours: "We talk about business outcomes, not code" },
];

export default function WhyChooseUs() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section className="py-24 md:py-32 bg-[#F8FAFC]">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          ref={ref}
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block text-sm font-bold tracking-widest text-[#7C3AED] uppercase mb-4">
            The Difference
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold mb-6 text-[#111827]">
            Why Businesses Choose Us<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7C3AED] to-[#6366F1]">
              Over Traditional Agencies
            </span>
          </h2>
          <p className="text-[#6B7280] text-lg max-w-xl mx-auto">
            We're not an agency hiding behind project managers. We're a focused team obsessed with your results.
          </p>
        </motion.div>

        <motion.div
          className="max-w-4xl mx-auto rounded-2xl border border-[#E5E7EB] bg-white overflow-hidden shadow-lg"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {/* Header */}
          <div className="grid grid-cols-2 border-b border-[#E5E7EB]">
            <div className="p-5 text-center font-semibold text-[#6B7280] text-sm bg-[#F3F4F6]">
              ❌ Traditional Agency
            </div>
            <div className="p-5 text-center font-bold text-[#7C3AED] text-sm bg-purple-50 border-l border-[#E5E7EB]">
              ✅ DevStudio
            </div>
          </div>

          {/* Rows */}
          {comparisons.map((row, i) => (
            <motion.div
              key={i}
              className="grid grid-cols-2 border-b border-[#F3F4F6] last:border-0 hover:bg-[#FAFAFA] transition-colors"
              initial={{ opacity: 0, y: 10 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.3 + i * 0.06 }}
            >
              <div className="p-4 md:p-5 flex items-start gap-3 border-r border-[#F3F4F6]">
                <X className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-[#6B7280]">{row.traditional}</span>
              </div>
              <div className="p-4 md:p-5 flex items-start gap-3 bg-purple-50/40">
                <CheckCircle2 className="w-4 h-4 text-[#7C3AED] flex-shrink-0 mt-0.5" />
                <span className="text-sm font-medium text-[#111827]">{row.ours}</span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
