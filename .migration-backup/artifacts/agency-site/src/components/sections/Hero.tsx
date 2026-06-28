import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowRight, Shield, Zap, Star, Users } from "lucide-react";

const trustBadges = [
  { icon: Shield, label: "Secure" },
  { icon: Zap, label: "Fast Delivery" },
  { icon: Star, label: "Custom Built" },
  { icon: Users, label: "AI Powered" },
  { icon: CheckCircle2, label: "Mobile Friendly" },
];

const stats = [
  { value: "48+", label: "Projects Delivered" },
  { value: "1–4wk", label: "Average Delivery" },
  { value: "100%", label: "Custom Built" },
];

export default function Hero() {
  const scrollToSolutions = () => {
    document.getElementById("solutions")?.scrollIntoView({ behavior: "smooth" });
  };
  const openLeadMagnet = () => {
    window.dispatchEvent(new CustomEvent("open-lead-magnet"));
  };

  return (
    <section
      id="home"
      className="relative pt-24 pb-14 md:pt-40 md:pb-32 overflow-hidden bg-white"
    >
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-gradient-to-bl from-purple-100/60 via-indigo-50/40 to-transparent blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-gradient-to-tr from-violet-50/80 to-transparent blur-2xl" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle, #7C3AED 1px, transparent 1px)`,
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
          {/* Content */}
          <div className="flex-1 text-center lg:text-left w-full">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2 bg-purple-50 border border-purple-200 text-[#7C3AED] text-xs sm:text-sm font-semibold px-3 sm:px-4 py-1.5 sm:py-2 rounded-full mb-5"
            >
              <span className="w-2 h-2 rounded-full bg-[#7C3AED] animate-pulse flex-shrink-0" />
              Custom Web Apps for Growing Businesses
            </motion.div>

            <motion.h1
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-[4.25rem] font-extrabold tracking-tight text-[#111827] mb-5 leading-[1.15]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              We Build Software That Helps Your Business{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7C3AED] to-[#6366F1]">
                Get More Customers
              </span>{" "}
              & Save Time.
            </motion.h1>

            <motion.p
              className="text-base sm:text-lg md:text-xl text-[#6B7280] mb-7 max-w-xl mx-auto lg:mx-0 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              From booking systems and customer portals to AI-powered tools and SaaS platforms — we build custom software that grows your revenue.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Button
                size="lg"
                className="btn-premium text-white h-12 sm:h-14 px-6 sm:px-8 text-sm sm:text-base font-semibold w-full sm:w-auto"
                onClick={openLeadMagnet}
              >
                Get My Free Business Tool Idea
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-12 sm:h-14 px-6 sm:px-8 text-sm sm:text-base font-medium border-[#E5E7EB] text-[#6B7280] hover:text-[#7C3AED] hover:border-[#7C3AED]/30 hover:bg-purple-50 transition-all w-full sm:w-auto"
                onClick={scrollToSolutions}
              >
                View Examples
              </Button>
            </motion.div>

            {/* Trust badges */}
            <motion.div
              className="flex flex-wrap gap-2 justify-center lg:justify-start"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              {trustBadges.map((b) => (
                <div
                  key={b.label}
                  className="flex items-center gap-1.5 bg-[#F8FAFC] border border-[#E5E7EB] text-[#6B7280] text-xs font-medium px-3 py-1.5 rounded-full"
                >
                  <b.icon className="w-3.5 h-3.5 text-[#7C3AED]" />
                  {b.label}
                </div>
              ))}
            </motion.div>

            {/* Stats */}
            <motion.div
              className="flex gap-6 sm:gap-8 justify-center lg:justify-start mt-8 pt-6 border-t border-[#E5E7EB]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              {stats.map((s) => (
                <div key={s.label}>
                  <div className="text-xl sm:text-2xl font-extrabold text-[#7C3AED]">{s.value}</div>
                  <div className="text-xs text-[#6B7280] font-medium mt-0.5">{s.label}</div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Dashboard Visual — hidden on small mobile, shown from md up */}
          <div className="hidden sm:block flex-1 w-full max-w-lg lg:max-w-none relative">
            <motion.div
              className="relative w-full aspect-[4/3] rounded-2xl border border-[#E5E7EB] bg-white shadow-2xl shadow-purple-100/60 overflow-hidden"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              {/* Browser chrome */}
              <div className="h-10 border-b border-[#E5E7EB] bg-[#F8FAFC] flex items-center px-4 gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
                <div className="flex-1 mx-4 h-5 bg-white rounded border border-[#E5E7EB] flex items-center px-3">
                  <span className="text-[10px] text-[#6B7280]">app.yourbusiness.com/dashboard</span>
                </div>
              </div>

              {/* Dashboard content */}
              <div className="p-4 bg-[#F8FAFC] h-full">
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {[
                    { label: "Revenue", value: "$12,480", color: "text-[#7C3AED]", bg: "bg-purple-50" },
                    { label: "Bookings", value: "248", color: "text-[#10B981]", bg: "bg-green-50" },
                    { label: "Customers", value: "1,042", color: "text-[#6366F1]", bg: "bg-indigo-50" },
                  ].map((m) => (
                    <div key={m.label} className={`${m.bg} rounded-xl p-2.5 border border-white shadow-sm`}>
                      <div className="text-[9px] text-[#6B7280] font-medium mb-1">{m.label}</div>
                      <div className={`text-sm font-bold ${m.color}`}>{m.value}</div>
                    </div>
                  ))}
                </div>

                <div className="bg-white rounded-xl border border-[#E5E7EB] p-3 mb-3 shadow-sm">
                  <div className="text-[9px] text-[#6B7280] font-semibold mb-2">Monthly Revenue</div>
                  <div className="flex items-end gap-1 h-16">
                    {[30, 50, 40, 70, 60, 85, 75, 90, 80, 95, 88, 100].map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-sm"
                        style={{
                          height: `${h}%`,
                          background: i === 11
                            ? "linear-gradient(to top, #7C3AED, #6366F1)"
                            : "rgba(124,58,237,0.15)",
                        }}
                      />
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-[#E5E7EB] p-3 shadow-sm">
                  <div className="text-[9px] text-[#6B7280] font-semibold mb-2">Recent Bookings</div>
                  {["Sarah M. — 10:00 AM", "James O. — 11:30 AM", "Priya K. — 2:00 PM"].map((name) => (
                    <div key={name} className="flex items-center justify-between py-1 border-b border-[#F3F4F6] last:border-0">
                      <div className="text-[9px] text-[#111827] font-medium">{name}</div>
                      <div className="text-[8px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-medium">Confirmed</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white/20 to-transparent pointer-events-none" />
            </motion.div>

            {/* Floating cards — contained within parent, no negative offsets on mobile */}
            <FloatingCard label="Booking Confirmed ✓" sub="Auto reminder sent" delay={0} top="-5%" left="2%" color="purple" />
            <FloatingCard label="New Customer" sub="+$299 revenue" delay={1.5} top="30%" right="2%" color="green" />
            <FloatingCard label="Payment Received" sub="$499 — Stripe" delay={0.8} bottom="10%" left="2%" color="purple" />
            <FloatingCard label="AI Assistant" sub="48 leads captured" delay={2} top="5%" right="5%" color="indigo" />
          </div>
        </div>
      </div>
    </section>
  );
}

function FloatingCard({ label, sub, delay, top, left, right, bottom, color }: any) {
  const colors: Record<string, string> = {
    purple: "bg-[#7C3AED]",
    green: "bg-[#10B981]",
    indigo: "bg-[#6366F1]",
  };
  return (
    <motion.div
      className="absolute bg-white border border-[#E5E7EB] shadow-xl rounded-xl px-4 py-3 flex items-center gap-3 z-20"
      style={{ top, left, right, bottom, minWidth: 160 }}
      animate={{ y: [0, -8, 0] }}
      transition={{ duration: 3.5, repeat: Infinity, repeatType: "reverse", delay }}
    >
      <div className={`w-2 h-2 rounded-full ${colors[color]} shadow-md flex-shrink-0`} />
      <div>
        <div className="text-xs font-semibold text-[#111827] whitespace-nowrap">{label}</div>
        <div className="text-[10px] text-[#6B7280]">{sub}</div>
      </div>
    </motion.div>
  );
}
