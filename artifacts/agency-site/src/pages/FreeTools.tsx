import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import WhatsAppButton from "@/components/layout/WhatsAppButton";
import SocialProof from "@/components/layout/SocialProof";
import {
  Calculator, DollarSign, Brain, ArrowRight, CheckCircle2,
  ChevronRight, RotateCcw, TrendingUp, Users, Clock, Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// ─── Shared Slider ──────────────────────────────────────────────────────────

function Slider({ label, value, min, max, step, unit = "", onChange, color, prefix = "", noUnit = false }: {
  label: string; value: number; min: number; max: number; step: number;
  unit?: string; onChange: (v: number) => void; color: string; prefix?: string; noUnit?: boolean;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <label className="text-sm font-medium text-[#374151]">{label}</label>
        <span className="text-sm font-extrabold" style={{ color }}>
          {prefix}{value.toLocaleString()}{noUnit ? "" : ` ${unit}`}
        </span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
        style={{ background: `linear-gradient(to right, ${color} ${pct}%, #E5E7EB ${pct}%)` }}
      />
      <div className="flex justify-between text-[10px] text-[#9CA3AF] mt-0.5">
        <span>{prefix}{min.toLocaleString()}{noUnit ? "" : unit}</span>
        <span>{prefix}{max.toLocaleString()}{noUnit ? "" : unit}</span>
      </div>
    </div>
  );
}

function StatBox({ label, value, sub, color, bg, border }: {
  label: string; value: string; sub?: string; color: string; bg: string; border: string;
}) {
  return (
    <div className={`${bg} border ${border} rounded-2xl p-4 text-center`}>
      <div className={`text-[11px] font-bold uppercase tracking-wide mb-1`} style={{ color }}>{label}</div>
      <div className="text-3xl font-extrabold" style={{ color }}>{value}</div>
      {sub && <div className="text-[11px] mt-1" style={{ color, opacity: 0.6 }}>{sub}</div>}
    </div>
  );
}

// ─── 1. ROI Calculator ──────────────────────────────────────────────────────

function ROICalculator() {
  const [hours, setHours] = useState(10);
  const [rate, setRate] = useState(15);
  const [employees, setEmployees] = useState(2);
  const [softwareCost, setSoftwareCost] = useState(499);

  const weeklyLoss = hours * rate * employees;
  const yearlyLoss = weeklyLoss * 52;
  const yearlyROI = yearlyLoss - softwareCost;
  const roiPercent = Math.round((yearlyROI / softwareCost) * 100);
  const paybackWeeks = Math.max(1, Math.ceil(softwareCost / weeklyLoss));

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
          <Slider label="One-time software investment" value={softwareCost} min={99} max={5000} step={50} unit="" onChange={setSoftwareCost} color="#10B981" prefix="$" noUnit />
        </div>
        <div className="space-y-4">
          <StatBox label="Annual Cost of Manual Work" value={`$${yearlyLoss.toLocaleString()}`} sub={`$${weeklyLoss.toLocaleString()} per week × 52 weeks`} color="#DC2626" bg="bg-red-50" border="border-red-200" />
          <StatBox label="Annual Saving With Software" value={`$${Math.max(0, yearlyROI).toLocaleString()}`} sub={`After $${softwareCost} one-time investment`} color="#16A34A" bg="bg-green-50" border="border-green-200" />
          <div className="grid grid-cols-2 gap-3">
            <StatBox label="ROI Year 1" value={roiPercent > 0 ? `${roiPercent}%` : "—"} color="#7C3AED" bg="bg-purple-50" border="border-purple-100" />
            <StatBox label="Payback Period" value={`${paybackWeeks}wk`} color="#6366F1" bg="bg-indigo-50" border="border-indigo-100" />
          </div>
          <Button className="w-full btn-premium text-white font-bold h-11" onClick={() => window.dispatchEvent(new CustomEvent("open-lead-magnet"))}>
            Get This Software Built →
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── 2. Cost Estimator ──────────────────────────────────────────────────────

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
  const toggle = (id: string) => setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const allFeatures = featureGroups.flatMap(g => g.features);
  const total = allFeatures.filter(f => selected.has(f.id)).reduce((s, f) => s + f.cost, 0);
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
                  <button key={f.id} onClick={() => toggle(f.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-sm text-left transition-all ${selected.has(f.id) ? "bg-green-50 border-green-300 text-[#111827]" : "bg-white border-[#E5E7EB] text-[#6B7280] hover:border-green-200 hover:bg-green-50/30"}`}
                  >
                    <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-all ${selected.has(f.id) ? "bg-green-500 border-green-500" : "border-[#D1D5DB]"}`}>
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
        <div>
          <div className="sticky top-24 space-y-4">
            <div className="bg-[#F8FAFC] border border-[#E5E7EB] rounded-2xl p-4">
              <div className="text-xs font-bold uppercase tracking-wide text-[#9CA3AF] mb-3">Selected ({selected.size})</div>
              <div className="space-y-1.5 max-h-52 overflow-y-auto mb-3">
                {allFeatures.filter(f => selected.has(f.id)).map(f => (
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
                  <span>Delivery</span><span className="font-semibold">{weeks} weeks</span>
                </div>
              </div>
            </div>
            <Button className="w-full btn-premium text-white font-bold h-11" onClick={() => window.dispatchEvent(new CustomEvent("open-lead-magnet"))} disabled={selected.size === 0}>
              Get Exact Quote →
            </Button>
            <p className="text-[11px] text-[#9CA3AF] text-center">Free estimate · No commitment</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── 3. Business Software Quiz ──────────────────────────────────────────────

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
    q: "How many customers do you serve per month?",
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
    if (step < questions.length - 1) setStep(step + 1);
    else setDone(true);
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
            <motion.div key={step} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }}>
              <div className="flex items-center gap-3 mb-6">
                <div className="flex-1 h-1.5 bg-[#E5E7EB] rounded-full">
                  <motion.div className="h-full bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] rounded-full" animate={{ width: `${(step / questions.length) * 100}%` }} />
                </div>
                <span className="text-xs text-[#6B7280] font-medium">{step + 1}/{questions.length}</span>
              </div>
              <h4 className="text-lg font-bold text-[#111827] mb-4">{questions[step].q}</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {questions[step].options.map(opt => (
                  <button key={opt.tag} onClick={() => pick(opt.tag)}
                    className="flex items-center gap-3 border border-[#E5E7EB] rounded-xl px-4 py-3.5 text-sm font-medium text-[#374151] hover:border-[#6366F1] hover:bg-indigo-50 hover:text-[#6366F1] transition-all text-left group"
                  >
                    <ChevronRight className="w-4 h-4 text-[#9CA3AF] group-hover:text-[#6366F1] flex-shrink-0" />
                    {opt.label}
                  </button>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div key="result" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}>
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
                    <div className="inline-block bg-white border border-indigo-200 text-[#6366F1] font-bold text-sm px-3 py-1 rounded-full">{recommendation?.price}</div>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <Button className="flex-1 btn-premium text-white font-bold h-11" onClick={() => window.dispatchEvent(new CustomEvent("open-lead-magnet"))}>
                  Build This For Me <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
                <Button variant="outline" className="h-11 px-4 border-[#E5E7EB]" onClick={reset}><RotateCcw className="w-4 h-4" /></Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── 4. Break-Even Calculator ───────────────────────────────────────────────

function BreakEvenCalculator() {
  const [clientValue, setClientValue] = useState(200);
  const [softwareCost, setSoftwareCost] = useState(499);
  const [monthlyClients, setMonthlyClients] = useState(15);
  const [churnRate, setChurnRate] = useState(10);

  const clientsNeeded = Math.ceil(softwareCost / clientValue);
  const weeksToBreakEven = Math.ceil(clientsNeeded / (monthlyClients / 4.33));
  const annualRevenueLost = monthlyClients * clientValue * (churnRate / 100) * 12;
  const retainedClients = Math.round(monthlyClients * (churnRate / 100));

  return (
    <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-5">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
            <Target className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-xl font-extrabold text-white">Break-Even & Churn Calculator</h3>
        </div>
        <p className="text-amber-100 text-sm">How quickly will your software pay for itself — and how much are you losing to churn?</p>
      </div>
      <div className="p-6 grid md:grid-cols-2 gap-8">
        <div className="space-y-5">
          <Slider label="Average value per client/order" value={clientValue} min={10} max={2000} step={10} onChange={setClientValue} color="#F59E0B" prefix="$" noUnit />
          <Slider label="Software investment cost" value={softwareCost} min={99} max={5000} step={50} onChange={setSoftwareCost} color="#EF4444" prefix="$" noUnit />
          <Slider label="New clients per month" value={monthlyClients} min={1} max={200} step={1} unit="clients" onChange={setMonthlyClients} color="#10B981" />
          <Slider label="Monthly client churn rate" value={churnRate} min={1} max={50} step={1} unit="%" onChange={setChurnRate} color="#8B5CF6" />
        </div>
        <div className="space-y-4">
          <StatBox label="Clients Needed to Break Even" value={`${clientsNeeded}`} sub={`At $${clientValue} average value`} color="#D97706" bg="bg-amber-50" border="border-amber-200" />
          <StatBox label="Weeks to Pay Off Software" value={`${weeksToBreakEven} wks`} sub={`Based on ${monthlyClients} clients/month`} color="#059669" bg="bg-green-50" border="border-green-200" />
          <div className="grid grid-cols-2 gap-3">
            <StatBox label="Clients Lost/Month" value={`${retainedClients}`} color="#DC2626" bg="bg-red-50" border="border-red-100" />
            <StatBox label="Annual Churn Loss" value={`$${annualRevenueLost.toLocaleString()}`} color="#9333EA" bg="bg-purple-50" border="border-purple-100" />
          </div>
          <Button className="w-full btn-premium text-white font-bold h-11" onClick={() => window.dispatchEvent(new CustomEvent("open-lead-magnet"))}>
            Reduce My Churn →
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── 5. Lost Leads Calculator ───────────────────────────────────────────────

function LostLeadsCalculator() {
  const [visitors, setVisitors] = useState(500);
  const [convRate, setConvRate] = useState(3);
  const [clientValue, setClientValue] = useState(350);
  const [responseHours, setResponseHours] = useState(24);
  const [missedPct, setMissedPct] = useState(30);

  const monthlyLeads = Math.round(visitors * (convRate / 100));
  const lostLeads = Math.round(monthlyLeads * (missedPct / 100));
  const monthlyRevLost = lostLeads * clientValue;
  const yearlyRevLost = monthlyRevLost * 12;

  const responseMultiplier = responseHours <= 1 ? 1 : responseHours <= 5 ? 0.5 : responseHours <= 24 ? 0.3 : 0.1;
  const closeProbability = Math.round(responseMultiplier * 100);
  const slowResponseLoss = Math.round(monthlyLeads * clientValue * (1 - responseMultiplier));

  return (
    <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-rose-500 to-pink-600 px-6 py-5">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
            <Users className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-xl font-extrabold text-white">Lost Leads Revenue Calculator</h3>
        </div>
        <p className="text-pink-100 text-sm">Find out how much revenue you're losing from missed and slow lead responses</p>
      </div>
      <div className="p-6 grid md:grid-cols-2 gap-8">
        <div className="space-y-5">
          <Slider label="Monthly website visitors" value={visitors} min={50} max={10000} step={50} unit="visitors" onChange={setVisitors} color="#E11D48" />
          <Slider label="Enquiry / lead conversion rate" value={convRate} min={1} max={20} step={0.5} unit="%" onChange={setConvRate} color="#F59E0B" />
          <Slider label="Average value of a new client" value={clientValue} min={50} max={5000} step={50} onChange={setClientValue} color="#10B981" prefix="$" noUnit />
          <Slider label="Average lead response time" value={responseHours} min={1} max={72} step={1} unit="hrs" onChange={setResponseHours} color="#8B5CF6" />
          <Slider label="% of leads that go unanswered" value={missedPct} min={0} max={80} step={5} unit="%" onChange={setMissedPct} color="#EF4444" />
        </div>
        <div className="space-y-4">
          <StatBox label="Monthly Leads Generated" value={`${monthlyLeads}`} sub={`${visitors.toLocaleString()} visitors × ${convRate}%`} color="#0891B2" bg="bg-cyan-50" border="border-cyan-200" />
          <StatBox label="Monthly Revenue Lost (Missed)" value={`$${monthlyRevLost.toLocaleString()}`} sub={`${lostLeads} unanswered leads/month`} color="#DC2626" bg="bg-red-50" border="border-red-200" />
          <div className="grid grid-cols-2 gap-3">
            <StatBox label="Close Rate at ${responseHours}h" value={`${closeProbability}%`} color="#D97706" bg="bg-amber-50" border="border-amber-100" />
            <StatBox label="Yearly Revenue Lost" value={`$${yearlyRevLost.toLocaleString()}`} color="#9333EA" bg="bg-purple-50" border="border-purple-100" />
          </div>
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-sm text-rose-700">
            <strong>Insight:</strong> Responding within 1 hour gives you a <strong>{Math.round(1 / responseMultiplier)}×</strong> higher chance of closing vs your current {responseHours}h response time.
          </div>
          <Button className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold h-11 rounded-xl" onClick={() => window.dispatchEvent(new CustomEvent("open-lead-magnet"))}>
            Automate My Lead Follow-Up →
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── 6. Staff Productivity Audit ────────────────────────────────────────────

const adminTasks = [
  { id: "bookings", label: "Taking bookings / appointments manually", hrs: 5 },
  { id: "invoices", label: "Creating and sending invoices", hrs: 3 },
  { id: "followups", label: "Chasing leads and follow-ups", hrs: 4 },
  { id: "reports", label: "Generating reports manually", hrs: 3 },
  { id: "inventory", label: "Checking / updating stock levels", hrs: 4 },
  { id: "dataentry", label: "Manual data entry", hrs: 5 },
  { id: "social", label: "Managing social media manually", hrs: 4 },
  { id: "scheduling", label: "Staff scheduling / rota management", hrs: 3 },
  { id: "emails", label: "Responding to routine customer emails", hrs: 5 },
  { id: "payments", label: "Manually reconciling payments", hrs: 2 },
];

function ProductivityAudit() {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [rate, setRate] = useState(20);
  const toggle = (id: string) => setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const totalHours = adminTasks.filter(t => selected.has(t.id)).reduce((s, t) => s + t.hrs, 0);
  const weeklyCost = totalHours * rate;
  const yearlyCost = weeklyCost * 52;
  const automatable = Math.round(totalHours * 0.85);
  const saveable = Math.round(automatable * rate * 52);
  const productivePct = selected.size > 0 ? Math.round(((40 - totalHours) / 40) * 100) : 100;

  return (
    <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-teal-500 to-cyan-600 px-6 py-5">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
            <Clock className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-xl font-extrabold text-white">Staff Productivity Audit</h3>
        </div>
        <p className="text-teal-100 text-sm">Tick every admin task your team does manually — see the real cost in time and money</p>
      </div>
      <div className="p-6 grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-2">
          {adminTasks.map(t => (
            <button key={t.id} onClick={() => toggle(t.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-sm text-left transition-all ${selected.has(t.id) ? "bg-teal-50 border-teal-300 text-[#111827]" : "bg-white border-[#E5E7EB] text-[#6B7280] hover:border-teal-200 hover:bg-teal-50/30"}`}
            >
              <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${selected.has(t.id) ? "bg-teal-500 border-teal-500" : "border-[#D1D5DB]"}`}>
                {selected.has(t.id) && <CheckCircle2 className="w-3 h-3 text-white" />}
              </div>
              <span className="flex-1 font-medium">{t.label}</span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${selected.has(t.id) ? "bg-teal-100 text-teal-700" : "bg-[#F3F4F6] text-[#9CA3AF]"}`}>{t.hrs}h/wk</span>
            </button>
          ))}
          <div className="pt-2">
            <Slider label="Average hourly staff rate" value={rate} min={5} max={100} step={5} onChange={setRate} color="#0D9488" prefix="$" noUnit />
          </div>
        </div>
        <div>
          <div className="sticky top-24 space-y-4">
            {/* Productivity gauge */}
            <div className="bg-[#F8FAFC] border border-[#E5E7EB] rounded-2xl p-4 text-center">
              <div className="text-xs font-bold uppercase tracking-wide text-[#9CA3AF] mb-3">Productive Time</div>
              <div className="relative w-24 h-24 mx-auto mb-2">
                <svg viewBox="0 0 36 36" className="w-24 h-24 -rotate-90">
                  <path d="M18 2 a 16 16 0 0 1 0 32 a 16 16 0 0 1 0 -32" fill="none" stroke="#E5E7EB" strokeWidth="3.5" />
                  <path d="M18 2 a 16 16 0 0 1 0 32 a 16 16 0 0 1 0 -32" fill="none" stroke={productivePct > 60 ? "#0D9488" : productivePct > 30 ? "#F59E0B" : "#EF4444"} strokeWidth="3.5" strokeDasharray={`${productivePct} 100`} strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-extrabold text-[#111827]">{productivePct}%</span>
                </div>
              </div>
              <div className="text-xs text-[#6B7280]">{totalHours}h/wk lost to admin</div>
            </div>

            <StatBox label="Weekly Admin Cost" value={`$${weeklyCost.toLocaleString()}`} color="#0D9488" bg="bg-teal-50" border="border-teal-200" />
            <StatBox label="Yearly Cost" value={`$${yearlyCost.toLocaleString()}`} sub={`${automatable}h/wk automatable`} color="#DC2626" bg="bg-red-50" border="border-red-200" />
            <StatBox label="Potential Annual Saving" value={`$${saveable.toLocaleString()}`} color="#059669" bg="bg-green-50" border="border-green-200" />
            <Button className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold h-11 rounded-xl" onClick={() => window.dispatchEvent(new CustomEvent("open-lead-magnet"))}>
              Automate These Tasks →
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── 7. Revenue Growth Projector ────────────────────────────────────────────

function RevenueProjector() {
  const [currentRevenue, setCurrentRevenue] = useState(5000);
  const [organicGrowth, setOrganicGrowth] = useState(3);
  const [boostGrowth, setBoostGrowth] = useState(15);
  const [softwareCost, setSoftwareCost] = useState(499);

  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  const withoutSoftware = useMemo(() =>
    months.map(m => Math.round(currentRevenue * Math.pow(1 + organicGrowth / 100, m))),
    [currentRevenue, organicGrowth]
  );

  const withSoftware = useMemo(() =>
    months.map(m => Math.round(currentRevenue * Math.pow(1 + boostGrowth / 100, m))),
    [currentRevenue, boostGrowth]
  );

  const year1Without = withoutSoftware[11];
  const year1With = withSoftware[11];
  const extraRevenue = year1With - year1Without;
  const maxVal = Math.max(...withSoftware);

  return (
    <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-[#7C3AED] to-[#EC4899] px-6 py-5">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-xl font-extrabold text-white">12-Month Revenue Growth Projector</h3>
        </div>
        <p className="text-purple-200 text-sm">Compare your revenue trajectory with and without custom software automation</p>
      </div>
      <div className="p-6 grid md:grid-cols-3 gap-8">
        <div className="space-y-5">
          <Slider label="Current monthly revenue" value={currentRevenue} min={500} max={50000} step={500} onChange={setCurrentRevenue} color="#7C3AED" prefix="$" noUnit />
          <Slider label="Growth rate without software" value={organicGrowth} min={0} max={20} step={1} unit="%" onChange={setOrganicGrowth} color="#6B7280" />
          <Slider label="Growth rate WITH software" value={boostGrowth} min={5} max={50} step={1} unit="%" onChange={setBoostGrowth} color="#10B981" />
          <Slider label="Software investment" value={softwareCost} min={99} max={5000} step={50} onChange={setSoftwareCost} color="#EF4444" prefix="$" noUnit />

          <div className="space-y-3 pt-2">
            <StatBox label="Revenue in Month 12 (without)" value={`$${year1Without.toLocaleString()}`} color="#6B7280" bg="bg-gray-50" border="border-gray-200" />
            <StatBox label="Revenue in Month 12 (with software)" value={`$${year1With.toLocaleString()}`} color="#059669" bg="bg-green-50" border="border-green-200" />
            <StatBox label="Extra Revenue in Year 1" value={`$${Math.max(0, extraRevenue - softwareCost).toLocaleString()}`} sub={`After $${softwareCost} investment`} color="#7C3AED" bg="bg-purple-50" border="border-purple-100" />
          </div>

          <Button className="w-full btn-premium text-white font-bold h-11" onClick={() => window.dispatchEvent(new CustomEvent("open-lead-magnet"))}>
            Accelerate My Growth →
          </Button>
        </div>

        {/* Chart */}
        <div className="md:col-span-2">
          <div className="flex items-center gap-4 mb-4 text-xs">
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-[#E5E7EB]" /><span className="text-[#6B7280]">Without Software</span></div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-gradient-to-br from-[#7C3AED] to-[#EC4899]" /><span className="text-[#6B7280]">With Software</span></div>
          </div>
          <div className="flex items-end gap-1.5 h-48">
            {months.map(m => (
              <div key={m} className="flex-1 flex flex-col items-center gap-0.5">
                <div className="w-full flex flex-col justify-end gap-0.5" style={{ height: "180px" }}>
                  <motion.div
                    className="w-full rounded-t-md bg-[#E5E7EB]"
                    animate={{ height: `${(withoutSoftware[m - 1] / maxVal) * 180}px` }}
                    transition={{ duration: 0.6, delay: m * 0.04 }}
                  />
                  <motion.div
                    className="w-full rounded-t-md bg-gradient-to-t from-[#7C3AED] to-[#EC4899]"
                    animate={{ height: `${(withSoftware[m - 1] / maxVal) * 180}px` }}
                    transition={{ duration: 0.6, delay: m * 0.04 + 0.05 }}
                  />
                </div>
                <span className="text-[9px] text-[#9CA3AF]">M{m}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {months.filter((_, i) => i % 3 === 2).map(m => (
              <div key={m} className="bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl p-3 flex justify-between text-xs">
                <span className="text-[#6B7280] font-medium">Month {m}</span>
                <div className="text-right">
                  <div className="text-green-700 font-extrabold">${withSoftware[m - 1].toLocaleString()}</div>
                  <div className="text-[#9CA3AF]">${withoutSoftware[m - 1].toLocaleString()} without</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Page Shell ─────────────────────────────────────────────────────────────

const tools = [
  { id: "roi", label: "ROI Calculator", icon: DollarSign, color: "text-[#7C3AED]" },
  { id: "cost", label: "Cost Estimator", icon: Calculator, color: "text-green-600" },
  { id: "quiz", label: "Software Quiz", icon: Brain, color: "text-[#6366F1]" },
  { id: "breakeven", label: "Break-Even", icon: Target, color: "text-amber-500" },
  { id: "leads", label: "Lost Leads", icon: Users, color: "text-rose-500" },
  { id: "productivity", label: "Productivity Audit", icon: Clock, color: "text-teal-600" },
  { id: "revenue", label: "Revenue Projector", icon: TrendingUp, color: "text-purple-600" },
];

export default function FreeTools() {
  const [active, setActive] = useState("roi");

  return (
    <div className="min-h-[100dvh] flex flex-col bg-white">
      <Navbar />
      <main className="flex-1 pt-24 pb-20">
        <div className="bg-gradient-to-b from-[#F8FAFC] to-white border-b border-[#E5E7EB] py-14">
          <div className="container mx-auto px-4 md:px-6 text-center">
            <span className="inline-block text-sm font-bold tracking-widest text-[#7C3AED] uppercase mb-4">Free Tools</span>
            <h1 className="text-4xl md:text-5xl font-extrabold text-[#111827] mb-4">
              Free Business Tools for<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7C3AED] to-[#6366F1]">Growing Businesses</span>
            </h1>
            <p className="text-[#6B7280] text-lg max-w-xl mx-auto mb-8">
              7 free calculators and tools to plan, estimate, and grow your business — no sign-up required.
            </p>

            {/* Tool selector — wrapping pill tabs */}
            <div className="flex flex-wrap justify-center gap-2">
              {tools.map(t => (
                <button
                  key={t.id}
                  onClick={() => setActive(t.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold border transition-all ${
                    active === t.id
                      ? "bg-[#7C3AED] text-white border-[#7C3AED] shadow-md shadow-purple-200"
                      : "bg-white text-[#6B7280] border-[#E5E7EB] hover:border-[#7C3AED] hover:text-[#7C3AED]"
                  }`}
                >
                  <t.icon className={`w-4 h-4 ${active === t.id ? "text-white" : t.color}`} />
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 md:px-6 py-12 max-w-5xl">
          <AnimatePresence mode="wait">
            <motion.div key={active} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.25 }}>
              {active === "roi" && <ROICalculator />}
              {active === "cost" && <CostEstimator />}
              {active === "quiz" && <BusinessQuiz />}
              {active === "breakeven" && <BreakEvenCalculator />}
              {active === "leads" && <LostLeadsCalculator />}
              {active === "productivity" && <ProductivityAudit />}
              {active === "revenue" && <RevenueProjector />}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="container mx-auto px-4 md:px-6 max-w-5xl pb-4">
          <div className="bg-gradient-to-r from-[#7C3AED] to-[#6366F1] rounded-2xl p-8 text-center text-white">
            <h3 className="text-2xl font-extrabold mb-2">Ready to Turn Insights into Action?</h3>
            <p className="text-purple-200 mb-6">Share your calculator results and we'll turn them into a free custom software proposal.</p>
            <Button size="lg" className="bg-white text-[#7C3AED] hover:bg-purple-50 font-bold shadow-xl"
              onClick={() => window.dispatchEvent(new CustomEvent("open-lead-magnet"))}>
              Get My Free Software Proposal <ArrowRight className="ml-2 w-5 h-5" />
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
