import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Chidi Nwosu",
    role: "Owner",
    company: "GrillHouse Lagos",
    location: "Lagos, Nigeria",
    avatar: "CN",
    color: "bg-orange-500",
    rating: 5,
    text: "Before DevStudio, my staff spent 3 hours a day just answering booking calls. Now customers book themselves online and get automatic reminders. No-shows dropped by 70% in the first month. I genuinely wish I did this years ago.",
    service: "Restaurant Booking System",
    result: "70% fewer no-shows",
  },
  {
    name: "Amara Osei",
    role: "Principal Agent",
    company: "PrimeLand Realty",
    location: "Accra, Ghana",
    avatar: "AO",
    color: "bg-blue-600",
    rating: 5,
    text: "We were losing leads every single day because there was no system. Leads came from Facebook, WhatsApp, referrals — and just disappeared. DevStudio built us a CRM portal that captures and scores every lead automatically. We've tripled our conversions.",
    service: "Real Estate Lead Portal",
    result: "3× lead conversion",
  },
  {
    name: "Sarah Mitchell",
    role: "Studio Director",
    company: "FitCore Studio",
    location: "Manchester, UK",
    avatar: "SM",
    color: "bg-green-600",
    rating: 5,
    text: "I used to track memberships on a spreadsheet and chase people for payments every month. Now members sign up, pay, and book classes all by themselves. My admin time has basically gone to zero. The platform paid for itself within the first 6 weeks.",
    service: "Fitness Membership Platform",
    result: "Paid back in 6 weeks",
  },
  {
    name: "Dr. Fatima Al-Hassan",
    role: "Practice Owner",
    company: "Bright Smiles Dental",
    location: "Dubai, UAE",
    avatar: "FA",
    color: "bg-cyan-600",
    rating: 5,
    text: "My receptionist was overwhelmed — 60+ calls a day just for bookings. DevStudio built an appointment system in 2 weeks and it completely transformed our front desk. Patients now book at midnight, get reminders, and even fill out forms before arriving. Incredible.",
    service: "Dental Clinic System",
    result: "60+ calls automated daily",
  },
  {
    name: "Marcus Thompson",
    role: "Founder",
    company: "ThreadWorks Retail",
    location: "Atlanta, USA",
    avatar: "MT",
    color: "bg-purple-600",
    rating: 5,
    text: "Running inventory across 3 stores in spreadsheets was a nightmare. We'd run out of best sellers and overstock slow items constantly. The dashboard DevStudio built gives me real-time stock levels, auto reorder alerts, and a full purchase history. Stockouts are basically gone.",
    service: "Inventory Dashboard",
    result: "80% fewer stockouts",
  },
  {
    name: "Priya Venkatesh",
    role: "Online Coach",
    company: "MindGrow Academy",
    location: "Bangalore, India",
    avatar: "PV",
    color: "bg-indigo-600",
    rating: 5,
    text: "I was selling courses through PDF links and WhatsApp groups — embarrassing for the price I was charging. DevStudio built a proper platform with video lessons, progress tracking, and certificates. I launched 3 courses in month one and revenue doubled. My students love it.",
    service: "E-Learning Platform",
    result: "Revenue doubled in month 1",
  },
];

function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {[...Array(count)].map((_, i) => (
        <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
      ))}
    </div>
  );
}

const container = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };
const item = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

export default function Testimonials() {
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
            Client Stories
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold mb-6 text-[#111827]">
            What Business Owners Say<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7C3AED] to-[#6366F1]">
              After We Build Their Software
            </span>
          </h2>
          <p className="text-[#6B7280] text-lg max-w-xl mx-auto">
            Real clients. Real results. No made-up reviews.
          </p>

          {/* Aggregate rating */}
          <div className="inline-flex items-center gap-3 bg-white border border-[#E5E7EB] rounded-2xl px-6 py-3 mt-6 shadow-sm">
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
            </div>
            <span className="text-sm font-bold text-[#111827]">4.9 / 5.0</span>
            <span className="text-sm text-[#6B7280]">from 48+ client projects</span>
          </div>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          animate={inView ? "show" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {testimonials.map((t) => (
            <motion.div
              key={t.name}
              variants={item}
              className="bg-white rounded-2xl border border-[#E5E7EB] p-6 flex flex-col card-premium"
            >
              {/* Quote icon */}
              <Quote className="w-8 h-8 text-[#7C3AED]/15 mb-3 -ml-1" />

              {/* Stars */}
              <Stars count={t.rating} />

              {/* Quote */}
              <p className="text-sm text-[#374151] leading-relaxed mt-3 mb-4 flex-1">
                "{t.text}"
              </p>

              {/* Result badge */}
              <div className="inline-flex items-center gap-1.5 bg-green-50 border border-green-200 text-green-700 text-[11px] font-bold px-3 py-1.5 rounded-full mb-4 self-start">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                {t.result}
              </div>

              {/* Author */}
              <div className="flex items-center gap-3 pt-4 border-t border-[#F3F4F6]">
                <div className={`w-10 h-10 rounded-full ${t.color} flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow-md`}>
                  {t.avatar}
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-sm text-[#111827]">{t.name}</div>
                  <div className="text-xs text-[#6B7280] truncate">{t.role} · {t.company}</div>
                  <div className="text-[10px] text-[#9CA3AF]">{t.location}</div>
                </div>
                <div className="ml-auto text-[10px] text-[#7C3AED] font-semibold bg-purple-50 border border-purple-100 px-2 py-1 rounded-full text-right whitespace-nowrap">
                  {t.service}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
