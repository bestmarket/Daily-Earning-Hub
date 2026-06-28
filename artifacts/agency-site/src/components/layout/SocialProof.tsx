import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, X } from "lucide-react";

const notifications = [
  { name: "James O.", location: "Lagos, Nigeria", action: "just submitted a project request", type: "Booking System", avatar: "JO", color: "bg-blue-500" },
  { name: "Sarah M.", location: "London, UK", action: "just got a free estimate for", type: "E-Commerce Store", avatar: "SM", color: "bg-pink-500" },
  { name: "Ahmed K.", location: "Dubai, UAE", action: "just started a project for", type: "AI Assistant", avatar: "AK", color: "bg-cyan-500" },
  { name: "Priya R.", location: "Toronto, Canada", action: "just requested a quote for", type: "Membership Platform", avatar: "PR", color: "bg-purple-500" },
  { name: "Chidi N.", location: "Abuja, Nigeria", action: "just booked a free consultation", type: "Restaurant System", avatar: "CN", color: "bg-orange-500" },
  { name: "Sofia L.", location: "Lisbon, Portugal", action: "just submitted a project for", type: "Customer Portal", avatar: "SL", color: "bg-green-500" },
  { name: "Marcus T.", location: "Atlanta, USA", action: "just got a quote for", type: "CRM Dashboard", avatar: "MT", color: "bg-indigo-500" },
  { name: "Fatima H.", location: "Cairo, Egypt", action: "just started a project for", type: "Inventory System", avatar: "FH", color: "bg-rose-500" },
  { name: "Daniel W.", location: "Melbourne, AU", action: "just submitted a request for", type: "SaaS Platform", avatar: "DW", color: "bg-teal-500" },
  { name: "Amara S.", location: "Accra, Ghana", action: "just booked a free call about", type: "Lead Generation", avatar: "AS", color: "bg-amber-500" },
];

const SHOW_DURATION = 5000;
const INTERVAL = 8000;
const INITIAL_DELAY = 4000;

export default function SocialProof() {
  const [current, setCurrent] = useState<number | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    // Shuffle order on mount
    const shuffled = [...Array(notifications.length).keys()].sort(() => Math.random() - 0.5);
    let step = 0;

    const show = () => {
      if (dismissed) return;
      const idx = shuffled[step % shuffled.length];
      setIndex(idx);
      setCurrent(idx);
      step++;

      setTimeout(() => {
        setCurrent(null);
      }, SHOW_DURATION);
    };

    const initialTimer = setTimeout(() => {
      show();
      const interval = setInterval(show, INTERVAL);
      return () => clearInterval(interval);
    }, INITIAL_DELAY);

    return () => clearTimeout(initialTimer);
  }, [dismissed]);

  if (dismissed) return null;

  return (
    <AnimatePresence>
      {current !== null && (
        <motion.div
          key={current}
          initial={{ opacity: 0, x: -40, y: 0 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          exit={{ opacity: 0, x: -40, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 28 }}
          className="fixed bottom-24 left-4 z-50 w-[280px] sm:w-[300px]"
        >
          <div className="bg-white rounded-2xl shadow-2xl border border-[#E5E7EB] p-3.5 flex items-start gap-3 relative overflow-hidden">
            {/* Left accent bar */}
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#7C3AED] rounded-l-2xl" />

            {/* Avatar */}
            <div className={`w-9 h-9 rounded-full ${notifications[index].color} flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-md`}>
              {notifications[index].avatar}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 pr-4">
              <div className="flex items-center gap-1 mb-0.5">
                <CheckCircle2 className="w-3 h-3 text-green-500 flex-shrink-0" />
                <span className="text-[10px] text-green-600 font-semibold">New Activity</span>
              </div>
              <p className="text-[11px] text-[#374151] leading-snug">
                <span className="font-bold text-[#111827]">{notifications[index].name}</span>
                {" "}from{" "}
                <span className="font-semibold text-[#111827]">{notifications[index].location}</span>
                {" "}{notifications[index].action}{" "}
                <span className="text-[#7C3AED] font-semibold">{notifications[index].type}</span>
              </p>
              <div className="flex items-center gap-1 mt-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                <span className="text-[9px] text-[#9CA3AF]">just now • verified</span>
              </div>
            </div>

            {/* Dismiss */}
            <button
              onClick={() => setDismissed(true)}
              className="absolute top-2.5 right-2.5 text-[#9CA3AF] hover:text-[#374151] transition-colors"
              aria-label="Dismiss"
            >
              <X className="w-3 h-3" />
            </button>

            {/* Progress bar */}
            <motion.div
              className="absolute bottom-0 left-0 h-0.5 bg-[#7C3AED]/30 rounded-full"
              initial={{ width: "100%" }}
              animate={{ width: "0%" }}
              transition={{ duration: SHOW_DURATION / 1000, ease: "linear" }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
