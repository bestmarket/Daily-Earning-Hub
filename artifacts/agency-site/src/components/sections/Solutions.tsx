import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Calendar, ShoppingCart, Users, Bot, Calculator, MapPin, Crown, CreditCard, Target, BarChart2, Package, BookOpen, LayoutDashboard, DollarSign, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

const solutions = [
  { icon: Calendar, name: "Booking Systems", benefit: "Let customers book 24/7. Reduce no-shows with auto reminders.", time: "1–2 weeks", price: "$299", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100" },
  { icon: ShoppingCart, name: "Restaurant Ordering", benefit: "Online menu, ordering, and table management in one place.", time: "2 weeks", price: "$399", color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-100" },
  { icon: Users, name: "Customer Portals", benefit: "Give customers a self-service hub to track orders, invoices & support.", time: "2–3 weeks", price: "$499", color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-100" },
  { icon: Bot, name: "AI Assistants", benefit: "AI chatbot that handles enquiries, bookings, and support 24/7.", time: "2–3 weeks", price: "$699", color: "text-cyan-600", bg: "bg-cyan-50", border: "border-cyan-100" },
  { icon: Calculator, name: "Quote Calculators", benefit: "Let customers get instant quotes — more leads, less back-and-forth.", time: "1 week", price: "$199", color: "text-green-600", bg: "bg-green-50", border: "border-green-100" },
  { icon: MapPin, name: "Business Directories", benefit: "A searchable directory for your industry or local area.", time: "1–2 weeks", price: "$299", color: "text-pink-600", bg: "bg-pink-50", border: "border-pink-100" },
  { icon: Crown, name: "Membership Platforms", benefit: "Sell memberships with gated content, perks, and renewals.", time: "3–4 weeks", price: "$799", color: "text-yellow-600", bg: "bg-yellow-50", border: "border-yellow-100" },
  { icon: CreditCard, name: "Subscription Websites", benefit: "Recurring billing, plan management, and subscriber dashboards.", time: "2–3 weeks", price: "$599", color: "text-violet-600", bg: "bg-violet-50", border: "border-violet-100" },
  { icon: Target, name: "Lead Generation Systems", benefit: "Capture, qualify, and follow up with leads automatically.", time: "1–2 weeks", price: "$299", color: "text-red-600", bg: "bg-red-50", border: "border-red-100" },
  { icon: BarChart2, name: "CRM Dashboards", benefit: "Track customers, deals, and follow-ups in one clear dashboard.", time: "2–3 weeks", price: "$499", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100" },
  { icon: Package, name: "Inventory Systems", benefit: "Real-time stock tracking, low-stock alerts, and order management.", time: "2 weeks", price: "$399", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
  { icon: BookOpen, name: "Course Platforms", benefit: "Sell online courses with video, quizzes, and certificates.", time: "3–4 weeks", price: "$699", color: "text-indigo-600", bg: "bg-indigo-50", border: "border-indigo-100" },
  { icon: LayoutDashboard, name: "Admin Dashboards", benefit: "A central command center to run and monitor your entire business.", time: "1–2 weeks", price: "$349", color: "text-slate-600", bg: "bg-slate-50", border: "border-slate-100" },
  { icon: DollarSign, name: "Payment Systems", benefit: "Accept payments online with invoicing, receipts, and reports.", time: "1–2 weeks", price: "$299", color: "text-green-600", bg: "bg-green-50", border: "border-green-100" },
  { icon: Clock, name: "Appointment Systems", benefit: "Staff scheduling, client appointments, and calendar syncing.", time: "1 week", price: "$249", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100" },
];

const container = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

export default function Solutions() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const openLeadMagnet = () => window.dispatchEvent(new CustomEvent("open-lead-magnet"));

  return (
    <section id="solutions" className="py-24 md:py-32 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          ref={ref}
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block text-sm font-bold tracking-widest text-[#7C3AED] uppercase mb-4">
            What We Build
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold mb-6 leading-tight text-[#111827]">
            Solutions Built<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7C3AED] to-[#6366F1]">
              For Businesses Like Yours
            </span>
          </h2>
          <p className="text-[#6B7280] text-lg max-w-2xl mx-auto">
            Every solution is custom-built for your business. No templates. No generic code. Your business, your software.
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          animate={inView ? "show" : "hidden"}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4"
        >
          {solutions.map((solution) => (
            <motion.div
              key={solution.name}
              variants={item}
              className={`group bg-white rounded-2xl border ${solution.border} p-5 card-premium flex flex-col`}
            >
              <div className={`w-10 h-10 rounded-xl ${solution.bg} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-200`}>
                <solution.icon className={`w-5 h-5 ${solution.color}`} />
              </div>
              <h3 className="font-bold text-sm mb-1.5 text-[#111827]">{solution.name}</h3>
              <p className="text-xs text-[#6B7280] leading-relaxed flex-1 mb-4">{solution.benefit}</p>
              <div className="flex items-center justify-between text-xs mb-3">
                <span className="text-[#6B7280]">{solution.time}</span>
                <span className="font-bold text-[#7C3AED]">{solution.price}</span>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="w-full text-xs h-8 border-[#E5E7EB] text-[#6B7280] hover:border-[#7C3AED] hover:bg-[#7C3AED] hover:text-white transition-all duration-200"
                onClick={openLeadMagnet}
              >
                Get This Built
              </Button>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
