import { motion, useInView, useMotionValue, useTransform, animate } from "framer-motion";
import { useRef, useEffect } from "react";
import { TrendingUp, Clock, Star, Users, Zap, Shield } from "lucide-react";

const stats = [
  { value: 48, suffix: "+", label: "Projects Delivered", icon: TrendingUp, color: "text-[#7C3AED]", bg: "bg-purple-50" },
  { value: 4, suffix: " wks", label: "Max Delivery Time", icon: Clock, color: "text-[#6366F1]", bg: "bg-indigo-50" },
  { value: 100, suffix: "%", label: "Custom Built", icon: Star, color: "text-amber-600", bg: "bg-amber-50" },
  { value: 15, suffix: "+", label: "Industries Served", icon: Users, color: "text-green-600", bg: "bg-green-50" },
  { value: 24, suffix: "/7", label: "AI-Powered Tools", icon: Zap, color: "text-cyan-600", bg: "bg-cyan-50" },
  { value: 99, suffix: "%", label: "Client Satisfaction", icon: Shield, color: "text-rose-600", bg: "bg-rose-50" },
];

function Counter({ value, suffix }: { value: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => Math.round(v));

  useEffect(() => {
    if (inView) {
      const controls = animate(count, value, { duration: 1.8, ease: "easeOut" });
      return controls.stop;
    }
  }, [inView, value, count]);

  return (
    <span ref={ref} className="tabular-nums">
      <motion.span>{rounded}</motion.span>{suffix}
    </span>
  );
}

export default function Stats() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section className="py-20 bg-white border-y border-[#E5E7EB] relative overflow-hidden">
      {/* Subtle background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] rounded-full bg-purple-50/60 blur-3xl" />
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <motion.div
          ref={ref}
          className="text-center mb-12"
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-block text-sm font-bold tracking-widest text-[#7C3AED] uppercase mb-3">
            By The Numbers
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#111827]">
            Proven Results for Growing Businesses
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-5">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              className="group text-center"
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.08 }}
            >
              <div className={`w-12 h-12 rounded-2xl ${stat.bg} flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-200`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div className={`text-3xl md:text-4xl font-extrabold ${stat.color} leading-none mb-1`}>
                <Counter value={stat.value} suffix={stat.suffix} />
              </div>
              <div className="text-xs font-semibold text-[#6B7280] leading-tight mt-1">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
