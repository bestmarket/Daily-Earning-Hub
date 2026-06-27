import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import WhatsAppButton from "@/components/layout/WhatsAppButton";
import SocialProof from "@/components/layout/SocialProof";
import { Calculator, DollarSign, Brain, ArrowRight, CheckCircle2, ChevronRight, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

// ─── ROI Calculator ───────────────────────────────────────────────────────────

function ROICalculator() {
  const [hours, setHours] = useState(10);
  const [rate, setRate] = useState(15);
  const [employees, setEmployees] = useState(2);
  const [softwareCost, setSoftwareCost] = useState(499);

  const weeklyLoss = hours * rate * employees;
  const yearlyLoss = weeklyLoss * 52;
  const yearlyROI = yearlyLoss - softwareCost;
  const roiPercent = Math.round((yearlyROI / softwareCost) * 100);
  const paybackWeeks = Math.ceil(softwareCost / weeklyLoss);

  return (
    <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-[#7C3AED] to-[#6366F1] px-6 py-5">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-xl font-extrabold text-white">Business Software ROI Calculator</h3>
        </div>
        <p className="text-purple-200 text-sm">Find out how much manual work is costing your business annually</p>
      </div>

      <div className="p-6 grid md:grid-cols-2 gap-8">
        <div className="space-y-5">
          <Slider label="Hours/week spent on admin tasks" value={hours} min={1} max={60} step={1} unit="hrs" onChange={setHours} color="#7C3AED" />
          <Slider label="Average hourly rate of staff doing admin" value={rate} min={5} max={100} step={5} unit="$/hr" onChange={setRate} color="#6366F1" />
          <Slider label="Number of employees doing admin" value={employees} min={1} max={20} step={1} unit="people" onChange={setEmployees} color="#8B5CF6" />
          <Slider label="One-time software investment" value={softwareCost} min={99} max={5000} step={50} unit="$" onChange={setSoftwareCost} color="#10B981" prefix="$" noUnit />
        </div>

        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-center">
            <div className="text-xs font-bold text-red-500 uppercase tracking-wide mb-1">Annual Cost of Manual Work</div>
            <div className="text-4xl font-extrabold text-red-600">${yearlyLoss.toLocaleString()}</div>
            <div className="text-xs text-red-400 mt-1">${weeklyLoss.toLocaleString()} per week × 52 weeks</div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-center">
            <div className="text-xs font-bold text-green-600 uppercase tracking-wide mb-1">Annual Saving With Software</div>
            <div className="text-4xl font-extrabold text-green-600">${Math.max(0, yearlyROI).toLocaleString()}</div>
            <div className="text-xs text-green-500 mt-1">After ${softwareCost} one-time investment</div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-purple-50 border border-purple-100 rounded-xl p-3 text-center">
              <div className="text-2xl font-extrabold text-[#7C3AED]">{roiPercent > 0 ? `${roiPercent}%` : "—"}</div>
              <div className="text-[11px] text-[#6B7280] font-medium mt-0.5">ROI in Year 1</div>
            </div>
            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3 text-center">
              <div className="text-2xl font-extrabold text-[#6366F1]">{paybackWeeks}wk</div>
              <div className="text-[11px] text-[#6B7280] font-medium mt-0.5">Payback Period</div>
            </div>
          </div>

          <Button
            className="w-full btn-premium text-white font-bold h-11"
            onClick={() => window.dispatchEvent(new CustomEvent("open-lead-magnet"))}
          >
            Get This Software Built → 
          </Button>
        </div>
      </div>
    </div>
  );
}

function Slider({ label, value, min, max, step, unit, onChange, color, prefix = "", noUnit = false }: any) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <label className="text-sm font-medium text-[#374151]">{label}</label>
        <span className="text-sm font-extrabold" style={{ color }}>{prefix}{value.toLocaleString()}{noUnit ? "" : ` ${unit}`}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
        style={{ background: `linear-gradient(to right, ${color} ${pct}%, #E5E7EB ${pct}%)` }}
      />
      <div className="flex justify-between text-[10px] text-[#9CA3AF] mt-0.5">
        <span>{prefix}{min}{noUnit ? "" : unit}</span><span>{prefix}{max}{noUnit ? "" : unit}</span>
      </div>
    </div>
  );
}

// ─── Cost Estimator ────────────────────────────────────────────────────────────

const featureGroups = [
  {
    label: "Core Features",
    features: [
      { id: "landing", label: "Landing / Marketing Page", cost: 99 },
      { id: "booking", label: "Online Booking System", cost: 200 },
      { id: "payments", label: "Payment Integration (Stripe/Paystack)", cost: 150 },
      { id: "dashboard", label: "Admin Dashboard", cost: 180 },
      { id: "auth", label: "User Login & Accounts", cost: 120 },
    ],
  },
  {
    label: "Customer Tools",
    features: [
      { id: "portal", label: "Customer Self-Service Portal", cost: 220 },
      { id: "notifications", label: "Email & SMS Notifications", cost: 100 },
      { id: "crm", label: "CRM / Lead Tracking", cost: 200 },
      { id: "quotes", label: "Quote / Estimate Calculator", cost: 130 },
      { id: "chat", label: "Live Chat / WhatsApp Integration", cost: 80 },
    ],
  },
  {
    label: "Advanced Features",
    features: [
      { id: "ai", label: "AI Chatbot / Assistant", cost: 350 },
      { id: "inventory", label: "Inventory Management", cost: 220 },
      { id: "subscriptions", label: "Subscription / Membership Billing", cost: 280 },
      { id: "courses", label: "Course / E-Learning Platform", cost: 350 },
      { id: "multiuser", label: "Multi-user / Team Roles", cost: 150 },
      { id: "reports", label: "Analytics & Reporting", cost: 180 },
    ],
  },
];

function CostEstimator() {
  const [selected, setSelected] = useState<Set<string>>(new Set(["landing"]));

  const toggle = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const total = featureGroups
    .flatMap(g => g.features)
    .filter(f => selected.has(f.id))
    .reduce((sum, f) => sum + f.cost, 0);

  const weeks = total < 300 ? "1–2" : total < 600 ? "2–3" : total < 1000 ? "3–4" : "4–6";

  return (
    <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-green-600 to-emerald-500 px-6 py-5">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
            <Calculator className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-xl font-extrabold text-white">Project Cost Estimator</h3>
        </div>
        <p className="text-green-100 text-sm">Select the features you need — get an instant price estimate</p>
      </div>

      <div className="p-6 grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-5">
          {featureGroups.map(group => (
            <div key={group.label}>
              <div className="text-xs font-extrabold uppercase tracking-widest text-[#9CA3AF] mb-2">{group.label}</div>
              <div className="space-y-2">
                {group.features.map(f => (
                  <button
                    key={f.id}
                    onClick={() => toggle(f.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-sm text-left transition-all ${
                      selected.has(f.id)
                        ? "bg-green-50 border-green-300 text-[#111827]"
                        : "bg-white border-[#E5E7EB] text-[#6B7280] hover:border-green-200 hover:bg-green-50/30"
                    }`}
                  >
                    <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-all ${
                      selected.has(f.id) ? "bg-green-500 border-green-500" : "border-[#D1D5DB]"
                    }`}>
                      {selected.has(f.id) && <CheckCircle2 className="w-3 h-3 text-white" />}
                    </div>
                    <span className="flex-1 font-medium">{f.label}</span>
                    <span className={`text-sm font-bold ${selected.has(f.id) ? "text-green-700" : "text-[#9CA3AF]"}`}>+${f.cost}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="md:col-span-1">
          <div className="sticky top-24 space-y-4">
            <div className="bg-[#F8FAFC] border border-[#E5E7EB] rounded-2xl p-4">
              <div className="text-xs font-bold uppercase tracking-wide text-[#9CA3AF] mb-3">Selected Features ({selected.size})</div>
              <div className="space-y-1.5 max-h-52 overflow-y-auto mb-3">
                {featureGroups.flatMap(g => g.features).filter(f => selected.has(f.id)).map(f => (
                  <div key={f.id} className="flex justify-between text-xs">
                    <span className="text-[#374151] truncate flex-1">{f.label}</span>
                    <span className="text-green-700 font-bold ml-2">${f.cost}</span>
                  </div>
                ))}
                {selected.size === 0 && <div className="text-xs text-[#9CA3AF]">Select features above</div>}
              </div>
              <div className="border-t border-[#E5E7EB] pt-3">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-bold text-[#374151]">Estimate</span>
                  <span className="text-xl font-extrabold text-green-700">${total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs text-[#6B7280]">
                  <span>Delivery time</span>
                  <span className="font-semibold">{weeks} weeks</span>
                </div>
              </div>
            </div>

            <Button
              className="w-full btn-premium text-white font-bold h-11"
              onClick={() => window.dispatchEvent(new CustomEvent("open-lead-magnet"))}
              disabled={selected.size === 0}
            >
              Get Exact Quote →
            </Button>
            <p className="text-[11px] text-[#9CA3AF] text-center">Free estimate · No commitment required</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Business Software Quiz ────────────────────────────────────────────────────

const questions = [
  {
    q: "What's your biggest business headache right now?",
    options: [
      { label: "Managing bookings / appointments", tag: "booking" },
      { label: "Tracking customers and follow-ups", tag: "crm" },
      { label: "Manual admin work eating my time", tag: "automation" },
      { label: "Not getting enough leads / enquiries", tag: "leads" },
      { label: "Managing stock or orders", tag: "inventory" },
      { label: "Selling online (products / services / courses)", tag: "ecommerce" },
    ],
  },
  {
    q: "How many customers/clients does your business serve per month?",
    options: [
      { label: "Under 50", tag: "small" },
      { label: "50–200", tag: "medium" },
      { label: "200–500", tag: "medium" },
      { label: "500+", tag: "large" },
    ],
  },
  {
    q: "Do you currently accept payments online?",
    options: [
      { label: "No, everything is cash / in-person", tag: "nopay" },
      { label: "Partial — bank transfer only", tag: "partial" },
      { label: "Yes, but it's clunky / manual", tag: "clunky" },
      { label: "Yes, fully automated", tag: "pay" },
    ],
  },
  {
    q: "What's your budget for custom software?",
    options: [
      { label: "Under $200", tag: "starter" },
      { label: "$200 – $500", tag: "business" },
      { label: "$500 – $1,500", tag: "pro" },
      { label: "$1,500+", tag: "enterprise" },
    ],
  },
  {
    q: "How soon do you want to get started?",
    options: [
      { label: "Right now — urgent", tag: "urgent" },
      { label: "Within the next month", tag: "soon" },
      { label: "Just exploring for now", tag: "exploring" },
    ],
  },
];

const recommendations: Record<string, { title: string; desc: string; price: string }> = {
  booking: { title: "Online Booking System", desc: "A custom booking platform that lets customers schedule 24/7 with auto SMS/email reminders, reducing no-shows and freeing your staff.", price: "From $299" },
  crm: { title: "CRM Dashboard", desc: "A centralised system to capture, score, and follow up with every lead automatically — so no opportunity falls through the cracks.", price: "From $499" },
  automation: { title: "Business Automation System", desc: "Custom workflows that automate your most repetitive admin tasks — notifications, follow-ups, data entry — saving you 10+ hours a week.", price: "From $399" },
  leads: { title: "Lead Generation System", desc: "A high-converting landing page with smart forms, instant quotes, and automatic follow-up sequences to turn visitors into paying customers.", price: "From $299" },
  inventory: { title: "Inventory Management Dashboard", desc: "Real-time stock tracking across locations, with low-stock alerts and automated reorder — so you never run out of your best sellers.", price: "From $399" },
  ecommerce: { title: "E-Commerce / Course Platform", desc: "A fully custom storefront or course platform with payment integration, product management, and an admin dashboard built for scale.", price: "From $499" },
};

function BusinessQuiz() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [done, setDone] = useState(false);

  const pick = (tag: string) => {
    const next = [...answers, tag];
    setAnswers(next);
    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      setDone(true);
    }
  };

  const reset = () => { setStep(0); setAnswers([]); setDone(false); };

  const recommendation = done ? (recommendations[answers[0]] || recommendations.automation) : null;

  return (
    <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] px-6 py-5">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-xl font-extrabold text-white">What Software Does Your Business Need?</h3>
        </div>
        <p className="text-purple-200 text-sm">Answer 5 quick questions — get a personalised recommendation in seconds</p>
      </div>

      <div className="p-6">
        <AnimatePresence mode="wait">
          {!done ? (
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3 }}
            >
              {/* Progress */}
              <div className="flex items-center gap-3 mb-6">
                <div className="flex-1 h-1.5 bg-[#E5E7EB] rounded-full">
                  <motion.div
                    className="h-full bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] rounded-full"
                    animate={{ width: `${((step) / questions.length) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-[#6B7280] font-medium">{step + 1}/{questions.length}</span>
              </div>

              <h4 className="text-lg font-bold text-[#111827] mb-4">{questions[step].q}</h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {questions[step].options.map(opt => (
                  <button
                    key={opt.tag}
                    onClick={() => pick(opt.tag)}
                    className="flex items-center gap-3 border border-[#E5E7EB] rounded-xl px-4 py-3.5 text-sm font-medium text-[#374151] hover:border-[#6366F1] hover:bg-indigo-50 hover:text-[#6366F1] transition-all text-left group"
                  >
                    <ChevronRight className="w-4 h-4 text-[#9CA3AF] group-hover:text-[#6366F1] flex-shrink-0" />
                    {opt.label}
                  </button>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
            >
              <div className="text-center mb-6">
                <div className="text-4xl mb-3">🎯</div>
                <h4 className="text-xl font-extrabold text-[#111827] mb-1">Your Perfect Solution</h4>
                <p className="text-[#6B7280] text-sm">Based on your answers, here's what we recommend:</p>
              </div>

              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200 rounded-2xl p-6 mb-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] rounded-2xl flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-bold text-[#6366F1] uppercase tracking-wide mb-1">Recommended for You</div>
                    <h5 className="text-xl font-extrabold text-[#111827] mb-2">{recommendation?.title}</h5>
                    <p className="text-sm text-[#6B7280] leading-relaxed mb-3">{recommendation?.desc}</p>
                    <div className="inline-block bg-white border border-indigo-200 text-[#6366F1] font-bold text-sm px-3 py-1 rounded-full">
                      {recommendation?.price}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  className="flex-1 btn-premium text-white font-bold h-11"
                  onClick={() => window.dispatchEvent(new CustomEvent("open-lead-magnet"))}
                >
                  Build This For Me
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
                <Button variant="outline" className="h-11 px-4 border-[#E5E7EB]" onClick={reset}>
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const tools = [
  { id: "roi", label: "ROI Calculator", icon: DollarSign, desc: "See how much manual work is costing you", color: "text-[#7C3AED]", bg: "bg-purple-50" },
  { id: "cost", label: "Cost Estimator", icon: Calculator, desc: "Pick features, get an instant price", color: "text-green-600", bg: "bg-green-50" },
  { id: "quiz", label: "Software Quiz", icon: Brain, desc: "Find out what your business needs", color: "text-[#6366F1]", bg: "bg-indigo-50" },
];

export default function FreeTools() {
  const [active, setActive] = useState("roi");

  return (
    <div className="min-h-[100dvh] flex flex-col bg-white">
      <Navbar />
      <main className="flex-1 pt-24 pb-20">
        {/* Hero */}
        <div className="bg-gradient-to-b from-[#F8FAFC] to-white border-b border-[#E5E7EB] py-16">
          <div className="container mx-auto px-4 md:px-6 text-center">
            <span className="inline-block text-sm font-bold tracking-widest text-[#7C3AED] uppercase mb-4">Free Tools</span>
            <h1 className="text-4xl md:text-5xl font-extrabold text-[#111827] mb-4">
              Free Business Tools for<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7C3AED] to-[#6366F1]">
                Growing Businesses
              </span>
            </h1>
            <p className="text-[#6B7280] text-lg max-w-xl mx-auto mb-8">
              Use our free calculators and tools to plan, estimate, and grow your business — no sign-up required.
            </p>

            {/* Tool selector tabs */}
            <div className="inline-flex bg-[#F3F4F6] rounded-2xl p-1.5 gap-1">
              {tools.map(t => (
                <button
                  key={t.id}
                  onClick={() => setActive(t.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    active === t.id
                      ? "bg-white shadow-md text-[#111827]"
                      : "text-[#6B7280] hover:text-[#374151]"
                  }`}
                >
                  <t.icon className={`w-4 h-4 ${active === t.id ? t.color : ""}`} />
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tool content */}
        <div className="container mx-auto px-4 md:px-6 py-12 max-w-5xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.3 }}
            >
              {active === "roi" && <ROICalculator />}
              {active === "cost" && <CostEstimator />}
              {active === "quiz" && <BusinessQuiz />}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* All tools overview */}
        <div className="container mx-auto px-4 md:px-6 max-w-5xl">
          <div className="bg-gradient-to-r from-[#7C3AED] to-[#6366F1] rounded-2xl p-8 text-center text-white">
            <h3 className="text-2xl font-extrabold mb-2">Ready to Turn Insights into Action?</h3>
            <p className="text-purple-200 mb-6">Share your calculator results with us and we'll turn them into a free custom software proposal.</p>
            <Button
              size="lg"
              className="bg-white text-[#7C3AED] hover:bg-purple-50 font-bold shadow-xl"
              onClick={() => window.dispatchEvent(new CustomEvent("open-lead-magnet"))}
            >
              Get My Free Software Proposal
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>
      </main>
      <Footer />
      <WhatsAppButton />
      <SocialProof />
    </div>
  );
}
