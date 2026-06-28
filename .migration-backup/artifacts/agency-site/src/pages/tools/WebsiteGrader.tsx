import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import WhatsAppButton from "@/components/layout/WhatsAppButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Globe, CheckCircle2, X, AlertTriangle, Sparkles, ArrowRight,
  Star, TrendingUp, Shield, Zap, Smartphone, Search, BarChart3,
  ChevronDown, ChevronUp,
} from "lucide-react";
import API_BASE from "@/lib/api";

// ─── SEO Meta ─────────────────────────────────────────────────────────────────
function useSEOMeta(title: string, description: string) {
  useEffect(() => {
    document.title = title;
    let desc = document.querySelector('meta[name="description"]');
    if (!desc) { desc = document.createElement("meta"); desc.setAttribute("name", "description"); document.head.appendChild(desc); }
    desc.setAttribute("content", description);
  }, [title, description]);
}

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

const SCORE_ICONS: Record<string, any> = {
  design: Star, userExperience: Zap, performance: TrendingUp,
  mobile: Smartphone, seo: Search, conversion: BarChart3, security: Shield, accessibility: Globe,
};
const SCORE_LABELS: Record<string, string> = {
  design: "Design", userExperience: "User Experience", performance: "Performance",
  mobile: "Mobile", seo: "SEO", conversion: "Conversion", security: "Security", accessibility: "Accessibility",
};
const CHECK_LABELS: Record<string, string> = {
  modernDesign: "Modern Design", mobileResponsive: "Mobile Responsive", fastLoading: "Fast Loading",
  sslSecure: "SSL Secure (HTTPS)", clearCTA: "Clear Call-to-Action", contactInfo: "Contact Info Visible",
  socialProof: "Social Proof / Reviews", blogContent: "Blog / Content", seoOptimized: "SEO Optimized",
  analyticsTracking: "Analytics Tracking", liveChat: "Live Chat", bookingSystem: "Booking System",
  onlinePayments: "Online Payments", emailCapture: "Email Capture", accessibility: "Accessibility",
};

function gradeColor(g: string) {
  if (g.startsWith("A")) return "text-green-600";
  if (g.startsWith("B")) return "text-blue-600";
  if (g.startsWith("C")) return "text-yellow-600";
  return "text-red-600";
}
function scoreColor(v: number) { return v >= 70 ? "#16A34A" : v >= 40 ? "#D97706" : "#DC2626"; }

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-[#E5E7EB] rounded-xl overflow-hidden">
      <button className="w-full flex items-center justify-between p-4 text-left font-semibold text-[#111827]" onClick={() => setOpen(!open)}>
        {q}
        {open ? <ChevronUp className="w-4 h-4 text-[#6B7280] flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-[#6B7280] flex-shrink-0" />}
      </button>
      {open && <div className="px-4 pb-4 text-sm text-[#6B7280] leading-relaxed">{a}</div>}
    </div>
  );
}

export default function WebsiteGrader() {
  useSEOMeta(
    "Free Website Grader — AI Website Score Checker | DevStudio",
    "Get a free AI-powered website grade in seconds. Check your website's design, SEO, performance, mobile experience, conversion, and security. Free website analyzer — no sign-up required."
  );

  const [url, setUrl] = useState("");
  const [businessName, setBizName] = useState("");
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
        body: JSON.stringify({ url: cleanUrl, businessName }),
      });
      if (!r.ok) throw new Error("Analysis failed. Try again.");
      setResult(await r.json());
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  const passed = result ? Object.values(result.checks).filter(Boolean).length : 0;
  const total = result ? Object.keys(result.checks).length : 0;

  return (
    <div className="min-h-[100dvh] flex flex-col bg-white">
      <Navbar />
      <main className="flex-1 pt-24 pb-20">

        {/* Hero */}
        <div className="bg-gradient-to-b from-[#F8FAFC] to-white border-b border-[#E5E7EB] py-14">
          <div className="container mx-auto px-4 md:px-6 text-center max-w-3xl">
            <div className="inline-flex items-center gap-2 text-xs font-bold tracking-widest text-[#7C3AED] uppercase bg-purple-50 border border-purple-200 px-3 py-1.5 rounded-full mb-5">
              <Sparkles className="w-3.5 h-3.5" /> Free AI Tool
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-[#111827] mb-4 leading-tight">
              Free Website Grader &amp; <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7C3AED] to-[#6366F1]">AI Website Score Checker</span>
            </h1>
            <p className="text-[#6B7280] text-lg mb-8 max-w-2xl mx-auto">
              Get an instant AI-powered website grade across 8 key dimensions — design, SEO, performance, mobile, conversion, security, and more. Free, instant, no sign-up.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto">
              <div className="relative flex-1">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
                <Input
                  className="pl-10 h-12 text-sm"
                  placeholder="yourwebsite.com"
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && analyze()}
                />
              </div>
              <Input className="h-12 sm:w-48 text-sm" placeholder="Business name (optional)" value={businessName} onChange={e => setBizName(e.target.value)} />
              <Button className="btn-premium text-white font-bold h-12 px-6 whitespace-nowrap" onClick={analyze} disabled={loading || !url.trim()}>
                {loading ? "Analyzing…" : "Grade My Website"}
              </Button>
            </div>
            {error && <p className="text-red-500 text-sm mt-3">{error}</p>}
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="container mx-auto px-4 max-w-3xl py-16 text-center">
            <div className="w-16 h-16 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto mb-4" />
            <h3 className="font-bold text-lg text-[#111827]">AI is analyzing your website…</h3>
            <p className="text-[#6B7280] text-sm mt-2">Checking design, SEO, performance, security, mobile experience & more</p>
          </div>
        )}

        {/* Results */}
        <AnimatePresence>
          {result && (
            <motion.div key="results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="container mx-auto px-4 md:px-6 max-w-4xl py-12 space-y-8">

              {/* Grade card */}
              <div className="bg-gradient-to-r from-[#7C3AED] to-[#6366F1] rounded-2xl p-8 text-white text-center">
                <p className="text-purple-200 text-sm font-semibold mb-2">{url}</p>
                <div className={`text-8xl font-black mb-2 ${gradeColor(result.overallGrade).replace("text-", "text-white")}`} style={{ filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.2))" }}>
                  {result.overallGrade}
                </div>
                <div className="text-purple-100 text-lg font-bold mb-3">{result.overallScore}/100 Overall Score</div>
                <p className="text-purple-200 text-sm max-w-lg mx-auto">{result.summary}</p>
                <div className="mt-4 text-xs text-purple-300 italic">{result.competitorGap}</div>
              </div>

              {/* Score grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(result.scores).map(([k, v]) => {
                  const Icon = SCORE_ICONS[k] || Globe;
                  return (
                    <div key={k} className="bg-white border border-[#E5E7EB] rounded-2xl p-4 text-center shadow-sm">
                      <Icon className="w-5 h-5 mx-auto mb-2" style={{ color: scoreColor(v) }} />
                      <div className="text-2xl font-extrabold mb-1" style={{ color: scoreColor(v) }}>{v}</div>
                      <div className="h-1.5 bg-gray-100 rounded-full mb-2">
                        <motion.div className="h-full rounded-full" style={{ backgroundColor: scoreColor(v) }} initial={{ width: 0 }} animate={{ width: `${v}%` }} transition={{ duration: 0.8 }} />
                      </div>
                      <div className="text-xs text-[#6B7280] font-medium">{SCORE_LABELS[k]}</div>
                    </div>
                  );
                })}
              </div>

              {/* Checklist */}
              <div className="bg-white border border-[#E5E7EB] rounded-2xl shadow-sm overflow-hidden">
                <div className="p-4 border-b border-[#E5E7EB] bg-[#F8FAFC] flex items-center justify-between">
                  <h2 className="font-bold text-[#111827]">Website Checklist</h2>
                  <span className="text-sm font-bold text-[#7C3AED]">{passed}/{total} passed</span>
                </div>
                <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {Object.entries(result.checks).map(([k, v]) => (
                    <div key={k} className={`flex items-center gap-2 text-sm px-3 py-2.5 rounded-xl ${v ? "bg-green-50 text-green-800 border border-green-200" : "bg-red-50 text-red-700 border border-red-100"}`}>
                      {v ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> : <X className="w-4 h-4 flex-shrink-0" />}
                      <span className="font-medium">{CHECK_LABELS[k] || k}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Weaknesses */}
              {result.weaknesses.length > 0 && (
                <div className="bg-white border border-[#E5E7EB] rounded-2xl shadow-sm overflow-hidden">
                  <div className="p-4 border-b border-[#E5E7EB] bg-[#F8FAFC]">
                    <h2 className="font-bold text-[#111827]">Issues Found</h2>
                  </div>
                  <div className="divide-y divide-[#F3F4F6]">
                    {result.weaknesses.map((w, i) => (
                      <div key={i} className="p-4 flex items-start gap-3">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 mt-0.5 ${w.impact === "high" ? "bg-red-100 text-red-700" : w.impact === "medium" ? "bg-yellow-100 text-yellow-700" : "bg-blue-100 text-blue-700"}`}>{w.impact}</span>
                        <div>
                          <div className="font-semibold text-sm text-[#111827]">{w.issue}</div>
                          <div className="text-xs text-[#6B7280] mt-0.5"><span className="font-medium text-green-700">Fix: </span>{w.fix}</div>
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
                    <h3 className="font-bold text-[#111827] mb-3 flex items-center gap-2"><Zap className="w-4 h-4 text-amber-600" /> Quick Wins</h3>
                    <ul className="space-y-2">{result.quickWins.map((w, i) => <li key={i} className="flex items-start gap-2 text-sm text-[#374151]"><ArrowRight className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5" />{w}</li>)}</ul>
                  </div>
                )}
                {result.strengths.length > 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-2xl p-5">
                    <h3 className="font-bold text-[#111827] mb-3 flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-600" /> What's Working</h3>
                    <ul className="space-y-2">{result.strengths.map((s, i) => <li key={i} className="flex items-start gap-2 text-sm text-[#374151]"><CheckCircle2 className="w-3.5 h-3.5 text-green-600 flex-shrink-0 mt-0.5" />{s}</li>)}</ul>
                  </div>
                )}
              </div>

              {/* CTA */}
              <div className="bg-gradient-to-r from-[#7C3AED] to-[#6366F1] rounded-2xl p-8 text-center text-white">
                <h3 className="text-2xl font-extrabold mb-2">Want Us to Fix These Issues?</h3>
                <p className="text-purple-200 mb-6">We build custom software that solves every problem found above — and turns your website into a sales machine.</p>
                <Button size="lg" className="bg-white text-[#7C3AED] hover:bg-purple-50 font-bold shadow-xl" onClick={() => window.dispatchEvent(new CustomEvent("open-lead-magnet"))}>
                  Get a Free Improvement Plan <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* How it works */}
        {!result && !loading && (
          <div className="container mx-auto px-4 md:px-6 max-w-4xl py-16">
            <h2 className="text-2xl font-extrabold text-center text-[#111827] mb-10">How Our Free Website Grader Works</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { step: "1", title: "Enter Your Website URL", desc: "Paste any website URL — your own site, a competitor's, or a prospect's." },
                { step: "2", title: "AI Analyzes 8 Dimensions", desc: "Our AI checks design, SEO, performance, mobile UX, conversion, security, accessibility, and more." },
                { step: "3", title: "Get Your Grade & Action Plan", desc: "See your grade (A–F), detailed scores, all issues found with fixes, and quick wins to implement today." },
              ].map(s => (
                <div key={s.step} className="text-center">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#6366F1] text-white font-extrabold text-xl flex items-center justify-center mx-auto mb-4">{s.step}</div>
                  <h3 className="font-bold text-[#111827] mb-2">{s.title}</h3>
                  <p className="text-sm text-[#6B7280]">{s.desc}</p>
                </div>
              ))}
            </div>

            <div className="mt-14">
              <h2 className="text-2xl font-extrabold text-center text-[#111827] mb-6">What Does Our Website Grader Check?</h2>
              <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { icon: <Star className="w-5 h-5 text-purple-600" />, title: "Design Quality", desc: "Modern UI, visual hierarchy, branding consistency" },
                  { icon: <Search className="w-5 h-5 text-blue-600" />, title: "SEO Factors", desc: "Meta tags, headings, keywords, sitemap, robots.txt" },
                  { icon: <Zap className="w-5 h-5 text-yellow-600" />, title: "Page Speed", desc: "Load time, Core Web Vitals, resource optimization" },
                  { icon: <Smartphone className="w-5 h-5 text-green-600" />, title: "Mobile Experience", desc: "Responsive design, touch targets, mobile UX" },
                  { icon: <BarChart3 className="w-5 h-5 text-orange-600" />, title: "Conversion Rate", desc: "CTAs, lead capture, booking systems, trust signals" },
                  { icon: <Shield className="w-5 h-5 text-red-600" />, title: "Security", desc: "SSL certificate, HTTPS, security best practices" },
                  { icon: <Globe className="w-5 h-5 text-indigo-600" />, title: "Accessibility", desc: "Alt text, contrast ratios, keyboard navigation" },
                  { icon: <TrendingUp className="w-5 h-5 text-pink-600" />, title: "Growth Potential", desc: "Analytics, social media, email capture, reviews" },
                ].map(item => (
                  <div key={item.title} className="bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl p-4">
                    <div className="mb-2">{item.icon}</div>
                    <div className="font-bold text-sm text-[#111827] mb-1">{item.title}</div>
                    <div className="text-xs text-[#6B7280]">{item.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* FAQ */}
        <div className="container mx-auto px-4 md:px-6 max-w-3xl py-10">
          <h2 className="text-2xl font-extrabold text-center text-[#111827] mb-6">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {[
              { q: "Is this website grader really free?", a: "Yes, 100% free with no sign-up required. Enter any URL and get your grade instantly." },
              { q: "How is this different from GTmetrix or Google PageSpeed?", a: "GTmetrix and PageSpeed Insights focus only on technical performance. Our AI Website Grader checks 8 dimensions including design, conversion, SEO, security, and business growth potential — giving you a complete picture, not just speed." },
              { q: "Can I grade a competitor's website?", a: "Absolutely. Enter any public URL to get a full analysis. It's a great way to benchmark your site against competitors." },
              { q: "What does my website grade mean?", a: "A (80-100) means excellent — your site is well-optimized. B (60-79) is good with room to improve. C (40-59) means significant issues affecting growth. D or F (below 40) means urgent improvements needed." },
              { q: "How accurate is the AI website analysis?", a: "Our AI analysis is based on publicly available signals and domain patterns. It provides strong directional guidance but some checks (like actual page speed) may require manual verification using tools like Google PageSpeed Insights." },
              { q: "What should I do after getting my grade?", a: "Start with the 'Quick Wins' section — these are the easiest fixes with the biggest impact. If you'd like professional help implementing improvements, click 'Get a Free Improvement Plan' to speak with our team." },
            ].map(faq => <FAQItem key={faq.q} q={faq.q} a={faq.a} />)}
          </div>
        </div>

      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}
