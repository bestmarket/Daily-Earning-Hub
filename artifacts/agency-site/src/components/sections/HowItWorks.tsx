import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { MessageSquare, Lightbulb, Code2, Eye, Rocket } from "lucide-react";

const steps = [
  {
    icon: MessageSquare,
    number: "01",
    title: "Tell Us About Your Business",
    description: "Fill out a quick form about your business goals, challenges, and what you need. No tech jargon required.",
    color: "text-blue-400",
    bg: "bg-blue-400/10",
  },
  {
    icon: Lightbulb,
    number: "02",
    title: "We Design the Perfect Solution",
    description: "Our team creates a custom software plan tailored to your exact business needs and budget.",
    color: "text-yellow-400",
    bg: "bg-yellow-400/10",
  },
  {
    icon: Code2,
    number: "03",
    title: "We Build Your Software",
    description: "Development begins with regular progress updates. You're always in the loop — no surprises.",
    color: "text-purple-400",
    bg: "bg-purple-400/10",
  },
  {
    icon: Eye,
    number: "04",
    title: "You Review Everything",
    description: "Test your software and request any changes. We revise until it's exactly what you envisioned.",
    color: "text-cyan-400",
    bg: "bg-cyan-400/10",
  },
  {
    icon: Rocket,
    number: "05",
    title: "Launch and Grow",
    description: "Your software goes live and starts generating results. We're here to support you as you scale.",
    color: "text-green-400",
    bg: "bg-green-400/10",
  },
];

export default function HowItWorks() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="process" className="py-24 md:py-32 relative">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          ref={ref}
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block text-sm font-semibold tracking-widest text-primary uppercase mb-4">
            Our Process
          </span>
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            How We Build Your Software<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
              in 5 Simple Steps
            </span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            We make the process simple, transparent, and collaborative. No tech overwhelm — just results.
          </p>
        </motion.div>

        <div className="relative max-w-4xl mx-auto">
          {/* Connector line */}
          <div className="hidden lg:block absolute left-[44px] top-16 bottom-16 w-0.5 bg-gradient-to-b from-primary/50 via-accent/30 to-transparent" />

          <div className="space-y-8">
            {steps.map((step, i) => (
              <motion.div
                key={step.number}
                className="relative flex flex-col lg:flex-row items-start gap-6"
                initial={{ opacity: 0, x: -20 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <div className="flex-shrink-0 flex flex-col items-center">
                  <div className={`w-[88px] h-[88px] rounded-2xl ${step.bg} border border-border/50 flex items-center justify-center z-10 relative`}>
                    <step.icon className={`w-8 h-8 ${step.color}`} />
                  </div>
                </div>
                <div className="flex-1 rounded-2xl border border-border/50 bg-card/40 backdrop-blur-sm p-6 hover:border-primary/30 transition-colors">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs font-bold text-primary tracking-widest">{step.number}</span>
                    <h3 className="font-bold text-lg">{step.title}</h3>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
