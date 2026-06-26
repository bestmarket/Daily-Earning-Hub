import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Calendar, ClipboardList, Globe, User, Zap, TrendingDown, MessageSquare, Package } from "lucide-react";

const problems = [
  {
    icon: Calendar,
    title: "Customers Forget Appointments",
    description: "No automated reminders means no-shows and lost revenue every single week.",
  },
  {
    icon: ClipboardList,
    title: "Too Much Manual Admin Work",
    description: "Hours wasted on spreadsheets, paperwork, and repetitive tasks that software can handle in seconds.",
  },
  {
    icon: Globe,
    title: "No Online Booking System",
    description: "Customers can't book after hours. You lose sales while your competitors sleep.",
  },
  {
    icon: User,
    title: "No Customer Self-Service Portal",
    description: "Customers call or message for every update. Your team spends all day answering the same questions.",
  },
  {
    icon: Zap,
    title: "Missing Automation & Follow-Ups",
    description: "Leads go cold because no one followed up. Revenue slips through the cracks daily.",
  },
  {
    icon: TrendingDown,
    title: "Poor Lead Generation",
    description: "Your website gets visitors but converts nobody. There's no system to capture and nurture leads.",
  },
  {
    icon: MessageSquare,
    title: "Slow Customer Communication",
    description: "Late replies cost you customers. Businesses that respond instantly win the sale every time.",
  },
  {
    icon: Package,
    title: "No Order or Inventory Tracking",
    description: "You're guessing what's in stock or what orders are pending. Mistakes damage your reputation.",
  },
];

const container = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function BusinessProblems() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="problems" className="py-24 md:py-32 relative">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          ref={ref}
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block text-sm font-semibold tracking-widest text-primary uppercase mb-4">
            Sound Familiar?
          </span>
          <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
            Is Your Business Losing Customers<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-destructive to-orange-500">
              Because of These Problems?
            </span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Every day these problems go unsolved, you're leaving money on the table. The good news? Custom software fixes all of them.
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          animate={inView ? "show" : "hidden"}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
        >
          {problems.map((problem) => (
            <motion.div
              key={problem.title}
              variants={item}
              className="group relative rounded-2xl border border-border/50 bg-card/40 backdrop-blur-sm p-6 hover:border-primary/30 hover:bg-card/70 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center mb-4 group-hover:bg-destructive/20 transition-colors">
                <problem.icon className="w-6 h-6 text-destructive" />
              </div>
              <h3 className="font-semibold text-base mb-2">{problem.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{problem.description}</p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          className="mt-14 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <div className="inline-flex items-center gap-3 rounded-2xl border border-primary/30 bg-primary/10 px-8 py-4 text-base font-semibold text-primary">
            ✓ Custom software solves every one of these — permanently.
          </div>
        </motion.div>
      </div>
    </section>
  );
}
