import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Calendar, ClipboardList, Globe, User, Zap, TrendingDown, MessageSquare, Package } from "lucide-react";

const problems = [
  { icon: Calendar, title: "Customers Forget Appointments", description: "No automated reminders means no-shows and lost revenue every single week." },
  { icon: ClipboardList, title: "Too Much Manual Admin Work", description: "Hours wasted on spreadsheets, paperwork, and repetitive tasks that software handles in seconds." },
  { icon: Globe, title: "No Online Booking System", description: "Customers can't book after hours. You lose sales while your competitors sleep." },
  { icon: User, title: "No Customer Self-Service Portal", description: "Customers call for every update. Your team spends all day answering the same questions." },
  { icon: Zap, title: "Missing Automation & Follow-Ups", description: "Leads go cold because no one followed up. Revenue slips through the cracks daily." },
  { icon: TrendingDown, title: "Poor Lead Generation", description: "Your website gets visitors but converts nobody. There's no system to capture and nurture leads." },
  { icon: MessageSquare, title: "Slow Customer Communication", description: "Late replies cost you customers. Businesses that respond instantly win the sale every time." },
  { icon: Package, title: "No Order or Inventory Tracking", description: "You're guessing what's in stock. Mistakes and stockouts damage your reputation." },
];

const container = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
const item = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.45 } } };

export default function BusinessProblems() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="problems" className="py-24 md:py-32 bg-[#F8FAFC]">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          ref={ref}
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block text-sm font-bold tracking-widest text-[#7C3AED] uppercase mb-4">
            Sound Familiar?
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold mb-6 leading-tight text-[#111827]">
            Is Your Business Losing Customers<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">
              Because of These Problems?
            </span>
          </h2>
          <p className="text-[#6B7280] text-lg max-w-2xl mx-auto">
            Every day these problems go unsolved, you're leaving money on the table. Custom software fixes all of them permanently.
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
              className="group bg-white rounded-2xl border border-[#E5E7EB] p-6 card-premium cursor-default"
            >
              <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center mb-4 group-hover:bg-red-100 transition-colors">
                <problem.icon className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="font-bold text-base mb-2 text-[#111827]">{problem.title}</h3>
              <p className="text-sm text-[#6B7280] leading-relaxed">{problem.description}</p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          className="mt-14 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <div className="inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r from-[#7C3AED]/10 to-[#6366F1]/10 border border-[#7C3AED]/20 px-8 py-4 text-base font-semibold text-[#7C3AED]">
            ✓ Custom software solves every one of these — permanently.
          </div>
        </motion.div>
      </div>
    </section>
  );
}
