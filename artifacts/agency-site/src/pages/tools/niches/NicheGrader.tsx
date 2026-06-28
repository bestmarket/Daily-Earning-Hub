import { useState, useEffect } from "react";
import { useParams, Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import WhatsAppButton from "@/components/layout/WhatsAppButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Globe, CheckCircle2, X, ArrowRight, Zap, TrendingUp,
  Shield, Smartphone, Search, BarChart3, Star, ChevronDown, ChevronUp,
} from "lucide-react";
import { NICHE_MAP } from "./niches-data";
import API_BASE from "@/lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────
interface GradeResult {
  overallGrade: string;
  overallScore: number;
  scores: Record<string, number>;
  checks: Record<string, boolean>;
  strengths: string[];
  weaknesses: { issue: string; impact: string; fix: string }[];
  quickWins: string[];
  summary: string;
  competitorGap: string;
}

// ─── Utils ────────────────────────────────────────────────────────────────────
function scoreColor(v: number) {
  return v >= 70 ? "#16A34A" : v >= 40 ? "#D97706" : "#DC2626";
}

const SCORE_ICONS: Record<string, any> = {
  design: Star, userExperience: Zap, performance: TrendingUp,
  mobile: Smartphone, seo: Search, conversion: BarChart3,
  security: Shield, accessibility: Globe,
};
const SCORE_LABELS: Record<string, string> = {
  design: "Design", userExperience: "UX", performance: "Speed",
  mobile: "Mobile", seo: "SEO", conversion: "Conversion",
  security: "Security", accessibility: "Accessibility",
};
const CHECK_LABELS: Record<string, string> = {
  modernDesign: "Modern Design", mobileResponsive: "Mobile Responsive",
  fastLoading: "Fast Loading", sslSecure: "SSL / HTTPS",
  clearCTA: "Clear CTA", contactInfo: "Contact Visible",
  socialProof: "Reviews / Social Proof", blogContent: "Blog / Content",
  seoOptimized: "SEO Optimized", analyticsTracking: "Analytics",
  liveChat: "Live Chat", bookingSystem: "Booking System",
  onlinePayments: "Online Payments", emailCapture: "Email Capture",
  accessibility: "Accessibility",
};

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-[#E5E7EB] rounded-xl overflow-hidden">
      <button
        className="w-full flex items-center justify-between p-4 text-left font-semibold text-[#111827]"
        onClick={() => setOpen(!open)}
      >
        {q}
        {open
          ? <ChevronUp className="w-4 h-4 flex-shrink-0 text-[#6B7280]" />
          : <ChevronDown className="w-4 h-4 flex-shrink-0 text-[#6B7280]" />}
      </button>
      {open && (
        <div className="px-4 pb-4 text-sm text-[#6B7280] leading-relaxed">{a}</div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function NicheGrader() {
  const params = useParams<{ niche: string }>();
  const niche = NICHE_MAP[params.niche || ""];

  // 404 fallback
  if (!niche) {
    return (
      <div className="min-h-[100dvh] flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-4">Niche not found</h1>
        <Link href="/tools/website-grader">
          <Button>Go to Website Grader</Button>
        </Link>
      </div>
    );
  }

  // SEO meta
  useEffect(() => {
    document.title = niche.title;
    let m = document.querySelector('meta[name="description"]');
    if (!m) {
      m = document.createElement("meta");
      m.setAttribute("name", "description");
      document.head.appendChild(m);
    }
    m.setAttribute("content", niche.metaDesc);
  }, [niche.slug]);

  const [url, setUrl] = useState("");
  const [bizName, setBizName] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GradeResult | null>(null);
  const [error, setError] = useState("");

  const analyze = async () => {
    if (!url.trim()) return;
    setLoading(true); setError(""); setResult(null);
    try {
      const cleanUrl = url.startsWith("http") ? url : `https://${url}`;
      const base = API_BASE.replace(/\/agency-site$/, "");
      const r = await fetch(`${base}/api/tools/website-grade`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: cleanUrl, businessName: bizName || url, category: niche.industry }),
      });
      if (!r.ok) throw new Error("Analysis failed. Please try again.");
      setResult(await r.json());
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const passed = result ? Object.values(result.checks).filter(Boolean).length : 0;
  const total  = result ? Object.keys(result.checks).length : 0;

  return (
    <div className="min-h-[100dvh] flex flex-col bg-white">
      <Navbar />
      <main className="flex-1 pt-24 pb-20">

        {/* ── Hero ── */}
        <div
          className="border-b border-[#E5E7EB] py-14"
          style={{ background: `linear-gradient(135deg, ${niche.gradientFrom}10, #fff)` }}
        >
          <div className="container mx-auto px-4 md:px-6 text-center max-w-3xl">
            {/* Breadcrumb */}
            <div className="flex items-center justify-center gap-2 text-xs text-[#6B7280] mb-4">
              <Link href="/tools" className="hover:text-[#7C3AED]">All Tools</Link>
              <span>›</span>
              <Link href="/tools/website-grader" className="hover:text-[#7C3AED]">Website Grader</Link>
              <span>›</span>
              <span className="font-semibold text-[#111827]">{niche.plural}</span>
            </div>

            <div
              className="inline-flex items-center gap-2 text-xs font-bold tracking-widest uppercase px-3 py-1.5 rounded-full mb-5 border"
              style={{ color: niche.color, background: `${niche.color}15`, borderColor: `${niche.color}40` }}
            >
              <span>{niche.emoji}</span> Free {niche.name} Website Grader
            </div>

            <h1 className="text-4xl md:text-5xl font-extrabold text-[#111827] mb-4 leading-tight">
              {niche.h1}
            </h1>
            <p className="text-[#6B7280] text-lg mb-8 max-w-2xl mx-auto">
              {niche.subheading}
            </p>

            {/* Stats row */}
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              {niche.stats.map(s => (
                <div
                  key={s.label}
                  className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm px-5 py-3 text-center"
                >
                  <div className="text-xl font-extrabold" style={{ color: niche.color }}>{s.value}</div>
                  <div className="text-xs text-[#6B7280]">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Input row */}
            <div className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto">
              <div className="relative flex-1">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
                <Input
                  className="pl-10 h-12 text-sm"
                  placeholder={niche.placeholder}
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && analyze()}
                />
              </div>
              <Input
                className="h-12 sm:w-52 text-sm"
                placeholder={`${niche.name} name (optional)`}
                value={bizName}
                onChange={e => setBizName(e.target.value)}
              />
              <Button
                className="h-12 px-6 font-bold text-white whitespace-nowrap"
                style={{ background: `linear-gradient(135deg, ${niche.gradientFrom}, ${niche.gradientTo})` }}
                onClick={analyze}
                disabled={loading || !url.trim()}
              >
                {loading ? "Analyzing…" : `Grade My ${niche.name} Website`}
              </Button>
            </div>
            {error && <p className="text-red-500 text-sm mt-3">{error}</p>}
          </div>
        </div>

        {/* ── Loading ── */}
        {loading && (
          <div className="container mx-auto px-4 max-w-3xl py-16 text-center">
            <div
              className="w-16 h-16 rounded-full border-4 border-t-transparent animate-spin mx-auto mb-4"
              style={{ borderColor: `${niche.color}40`, borderTopColor: niche.color }}
            />
            <h3 className="font-bold text-lg text-[#111827]">
              AI is grading your {niche.name.toLowerCase()} website…
            </h3>
            <p className="text-[#6B7280] text-sm mt-2">
              Checking design, SEO, performance, booking system, mobile UX & more
            </p>
          </div>
        )}

        {/* ── Results ── */}
        <AnimatePresence>
          {result && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="container mx-auto px-4 md:px-6 max-w-4xl py-10 space-y-6"
            >
              {/* Grade card */}
              <div
                className="rounded-2xl p-8 text-white text-center"
                style={{ background: `linear-gradient(135deg, ${niche.gradientFrom}, ${niche.gradientTo})` }}
              >
                <p className="text-white/70 text-sm font-semibold mb-2">{url}</p>
                <div className="text-8xl font-black mb-2 drop-shadow-lg">{result.overallGrade}</div>
                <div className="text-white/90 text-lg font-bold mb-3">
                  {result.overallScore}/100 — {niche.name} Website Score
                </div>
                <p className="text-white/80 text-sm max-w-lg mx-auto">{result.summary}</p>
                <div className="mt-3 text-xs text-white/60 italic">{result.competitorGap}</div>
              </div>

              {/* Score grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.entries(result.scores).map(([k, v]) => {
                  const Icon = SCORE_ICONS[k] || Globe;
                  return (
                    <div key={k} className="bg-white border border-[#E5E7EB] rounded-2xl p-4 text-center shadow-sm">
                      <Icon className="w-5 h-5 mx-auto mb-1" style={{ color: scoreColor(v) }} />
                      <div className="text-2xl font-extrabold" style={{ color: scoreColor(v) }}>{v}</div>
                      <div className="h-1.5 bg-gray-100 rounded-full my-1.5">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ backgroundColor: scoreColor(v) }}
                          initial={{ width: 0 }}
                          animate={{ width: `${v}%` }}
                          transition={{ duration: 0.8 }}
                        />
                      </div>
                      <div className="text-xs text-[#6B7280] font-medium">{SCORE_LABELS[k] || k}</div>
                    </div>
                  );
                })}
              </div>

              {/* Checklist */}
              <div className="bg-white border border-[#E5E7EB] rounded-2xl shadow-sm overflow-hidden">
                <div className="p-4 border-b border-[#E5E7EB] bg-[#F8FAFC] flex justify-between items-center">
                  <h2 className="font-bold text-[#111827]">{niche.name} Website Checklist</h2>
                  <span className="text-sm font-bold" style={{ color: niche.color }}>{passed}/{total} passed</span>
                </div>
                <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {Object.entries(result.checks).map(([k, v]) => (
                    <div
                      key={k}
                      className={`flex items-center gap-2 text-sm px-3 py-2.5 rounded-xl border font-medium ${
                        v
                          ? "bg-green-50 text-green-800 border-green-200"
                          : "bg-red-50 text-red-700 border-red-100"
                      }`}
                    >
                      {v
                        ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                        : <X className="w-4 h-4 flex-shrink-0" />}
                      {CHECK_LABELS[k] || k}
                    </div>
                  ))}
                </div>
              </div>

              {/* Issues */}
              {result.weaknesses.length > 0 && (
                <div className="bg-white border border-[#E5E7EB] rounded-2xl shadow-sm overflow-hidden">
                  <div className="p-4 border-b border-[#E5E7EB] bg-[#F8FAFC]">
                    <h2 className="font-bold text-[#111827]">Issues Found</h2>
                  </div>
                  <div className="divide-y divide-[#F3F4F6]">
                    {result.weaknesses.map((w, i) => (
                      <div key={i} className="p-4 flex items-start gap-3">
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 mt-0.5 ${
                            w.impact === "high"
                              ? "bg-red-100 text-red-700"
                              : w.impact === "medium"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {w.impact}
                        </span>
                        <div>
                          <div className="font-semibold text-sm text-[#111827]">{w.issue}</div>
                          <div className="text-xs text-[#6B7280] mt-0.5">
                            <span className="font-medium text-green-700">Fix: </span>{w.fix}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick wins + strengths */}
              <div className="grid md:grid-cols-2 gap-4">
                {result.quickWins.length > 0 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
                    <h3 className="font-bold text-[#111827] mb-3 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-amber-600" /> Quick Wins
                    </h3>
                    <ul className="space-y-2">
                      {result.quickWins.map((w, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-[#374151]">
                          <ArrowRight className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
                          {w}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {result.strengths.length > 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-2xl p-5">
                    <h3 className="font-bold text-[#111827] mb-3 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600" /> What's Working
                    </h3>
                    <ul className="space-y-2">
                      {result.strengths.map((s, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-[#374151]">
                          <CheckCircle2 className="w-3.5 h-3.5 text-green-600 flex-shrink-0 mt-0.5" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* CTA */}
              <div
                className="rounded-2xl p-8 text-center text-white"
                style={{ background: `linear-gradient(135deg, ${niche.gradientFrom}, ${niche.gradientTo})` }}
              >
                <h3 className="text-2xl font-extrabold mb-2">Want Us to Fix These Issues?</h3>
                <p className="text-white/80 mb-6">
                  We build custom {niche.plural.toLowerCase()} websites that solve every problem above — and turn your site into a client-generating machine.
                </p>
                <Button
                  size="lg"
                  className="bg-white font-bold shadow-xl hover:bg-white/90"
                  style={{ color: niche.color }}
                  onClick={() => window.dispatchEvent(new CustomEvent("open-lead-magnet"))}
                >
                  Get a Free {niche.name} Website Audit <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Before result: Must-haves + how it works ── */}
        {!result && !loading && (
          <div className="container mx-auto px-4 md:px-6 max-w-4xl py-14 space-y-12">

            {/* Must-have features */}
            <div>
              <h2 className="text-2xl font-extrabold text-center text-[#111827] mb-2">
                What Every {niche.name} Website Must Have
              </h2>
              <p className="text-center text-[#6B7280] text-sm mb-8">
                Our AI checks all of these specifically for {niche.plural.toLowerCase()}
              </p>
              <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3">
                {niche.mustHaves.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2.5 bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl px-4 py-3 text-sm font-medium text-[#374151]"
                  >
                    <div
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: niche.color }}
                    />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* How it works */}
            <div>
              <h2 className="text-2xl font-extrabold text-center text-[#111827] mb-8">
                How the {niche.name} Website Grader Works
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  {
                    step: "1",
                    title: `Enter Your ${niche.name} Website URL`,
                    desc: `Paste your ${niche.name.toLowerCase()} website URL above. You can also check a competitor's site.`,
                  },
                  {
                    step: "2",
                    title: "AI Analyzes 8 Key Dimensions",
                    desc: `Our AI checks design, SEO, performance, mobile UX, conversion, security, accessibility — plus ${niche.name.toLowerCase()}-specific features.`,
                  },
                  {
                    step: "3",
                    title: "Get Your Grade & Action Plan",
                    desc: `Receive an A–F grade, detailed scores, every issue found with specific fixes, and quick wins you can implement today.`,
                  },
                ].map(s => (
                  <div key={s.step} className="text-center">
                    <div
                      className="w-12 h-12 rounded-full text-white font-extrabold text-xl flex items-center justify-center mx-auto mb-4"
                      style={{ background: `linear-gradient(135deg, ${niche.gradientFrom}, ${niche.gradientTo})` }}
                    >
                      {s.step}
                    </div>
                    <h3 className="font-bold text-[#111827] mb-2">{s.title}</h3>
                    <p className="text-sm text-[#6B7280]">{s.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Other niches */}
            <div>
              <h2 className="text-xl font-extrabold text-center text-[#111827] mb-6">
                Website Graders for Other Business Types
              </h2>
              <div className="flex flex-wrap gap-2 justify-center">
                {Object.values(NICHE_MAP)
                  .filter(n => n.slug !== niche.slug)
                  .slice(0, 12)
                  .map(n => (
                    <Link key={n.slug} href={`/tools/website-grader/${n.slug}`}>
                      <span className="inline-flex items-center gap-1.5 bg-white border border-[#E5E7EB] hover:border-[#7C3AED]/40 hover:bg-purple-50 text-sm text-[#374151] px-3 py-1.5 rounded-full cursor-pointer transition-all">
                        {n.emoji} {n.plural}
                      </span>
                    </Link>
                  ))}
                <Link href="/tools/website-grader">
                  <span className="inline-flex items-center gap-1.5 bg-[#7C3AED] text-white text-sm px-3 py-1.5 rounded-full cursor-pointer">
                    View All 20 →
                  </span>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* ── FAQ ── */}
        <div className="container mx-auto px-4 md:px-6 max-w-3xl pb-12">
          <h2 className="text-2xl font-extrabold text-center text-[#111827] mb-6">
            {niche.name} Website FAQ
          </h2>
          <div className="space-y-3">
            {niche.faqs.map(faq => (
              <FAQItem key={faq.q} q={faq.q} a={faq.a} />
            ))}
            <FAQItem
              q={`Is this ${niche.name.toLowerCase()} website grader really free?`}
              a={`Yes — 100% free, no sign-up, no email required. Enter any ${niche.name.toLowerCase()} website URL and get your grade instantly.`}
            />
            <FAQItem
              q={`Can I grade a competitor's ${niche.name.toLowerCase()} website?`}
              a={`Absolutely. Enter any competitor's URL to see their score, find their weaknesses, and discover what you can do better to win more customers in your market.`}
            />
          </div>
        </div>

      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}
