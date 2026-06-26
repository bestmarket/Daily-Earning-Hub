import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { X, CheckCircle2 } from "lucide-react";

const comparisons = [
  {
    traditional: "Weeks of meetings before any work starts",
    ours: "Quick discovery call, we start building fast",
  },
  {
    traditional: "Expensive monthly retainers ($5,000+/mo)",
    ours: "Fixed transparent pricing from $99",
  },
  {
    traditional: "Slow delivery — months of waiting",
    ours: "Fast delivery in 1–4 weeks",
  },
  {
    traditional: "Generic templates passed off as custom",
    ours: "100% custom-built for your business",
  },
  {
    traditional: "No AI features or modern integrations",
    ours: "AI-powered by default",
  },
  {
    traditional: "Slow email support, weeks for a reply",
    ours: "Direct WhatsApp communication daily",
  },
  {
    traditional: "Pitches full of technical jargon",
    ours: "We talk about business outcomes, not code",
  },
];

export default function WhyChooseUs() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="py-24 md:py-32 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-accent/5 to-transparent pointer-events-none" />
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          ref={ref}
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block text-sm font-semibold tracking-widest text-primary uppercase mb-4">
            The Difference
          </span>
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Why Businesses Choose Us<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
              Over Traditional Agencies
            </span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            We're not an agency hiding behind project managers. We're a focused team obsessed with your results.
          </p>
        </motion.div>

        <motion.div
          className="max-w-4xl mx-auto rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm overflow-hidden"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {/* Header */}
          <div className="grid grid-cols-2 border-b border-border/50">
            <div className="p-5 text-center font-semibold text-muted-foreground text-sm bg-muted/30">
              Traditional Agency
            </div>
            <div className="p-5 text-center font-semibold text-primary text-sm bg-primary/5 border-l border-border/50">
              DevStudio
            </div>
          </div>

          {/* Rows */}
          {comparisons.map((row, i) => (
            <motion.div
              key={i}
              className="grid grid-cols-2 border-b border-border/30 last:border-0 hover:bg-white/2 transition-colors"
              initial={{ opacity: 0, y: 10 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.3 + i * 0.06 }}
            >
              <div className="p-4 md:p-5 flex items-start gap-3 border-r border-border/30">
                <X className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                <span className="text-sm text-muted-foreground">{row.traditional}</span>
              </div>
              <div className="p-4 md:p-5 flex items-start gap-3 bg-primary/5">
                <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-sm font-medium">{row.ours}</span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
