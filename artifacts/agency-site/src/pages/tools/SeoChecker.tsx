import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import WhatsAppButton from "@/components/layout/WhatsAppButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, CheckCircle2, X, AlertTriangle, ArrowRight, TrendingUp, Globe, Zap, ChevronDown, ChevronUp, BarChart3, Sparkles } from "lucide-react";
import API_BASE from "@/lib/api";

function useSEOMeta(title: string, desc: string) {
  useEffect(() => {
    document.title = title;
    let m = document.querySelector('meta[name="description"]');
    if (!m) { m = document.createElement("meta"); m.setAttribute("name", "description"); document.head.appendChild(m); }
    m.setAttribute("content", desc);
  }, []);
}

interface SEOResult {
  overallScore: number;
  scores: Record<string, number>;
  checks: Record<string, boolean>;
  issues: { severity: string; title: string; description: string; fix: string }[];
  keywords: { keyword: string; difficulty: string; opportunity: string }[];
  recommendations: string[];
  estimatedMonthlyVisitors: number;
  summary: string;
}

const SCORE_LABELS: Record<string, string> = {
  technical: "Technical SEO", onPage: "On-Page SEO", content: "Content Quality",
  mobile: "Mobile SEO", performance: "Performance", backlinks: "Backlink Profile",
};
const CHECK_LABELS: Record<string, string> = {
  httpsEnabled: "HTTPS / SSL Enabled", metaTitle: "Meta Title Tag", metaDescription: "Meta Description",
  h1Tags: "H1 Heading Tags", imageAltText: "Image Alt Text", mobileFriendly: "Mobile-Friendly",
  pageSpeed: "Page Speed Score", xmlSitemap: "XML Sitemap", robotsTxt: "robots.txt File",
  structuredData: "Structured Data (Schema)", canonicalTags: "Canonical Tags", internalLinks: "Internal Linking",
  socialTags: "Open Graph / Social Tags", googleAnalytics: "Google Analytics", coreWebVitals: "Core Web Vitals",
};

function scoreColor(v: number) { return v >= 70 ? "#16A34A" : v >= 40 ? "#D97706" : "#DC2626"; }

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-[#E5E7EB] rounded-xl overflow-hidden">
      <button className="w-full flex items-center justify-between p-4 text-left font-semibold text-[#111827]" onClick={() => setOpen(!open)}>
        {q}{open ? <ChevronUp className="w-4 h-4 flex-shrink-0 text-[#6B7280]" /> : <ChevronDown className="w-4 h-4 flex-shrink-0 text-[#6B7280]" />}
      </button>
      {open && <div className="px-4 pb-4 text-sm text-[#6B7280] leading-relaxed">{a}</div>}
    </div>
  );
}

export default function SeoChecker() {
  useSEOMeta(
    "Free SEO Checker — AI Website SEO Score Tool | DevStudio",
    "Free AI-powered SEO checker. Instantly analyze any website's SEO score, find technical issues, discover keyword opportunities, and get actionable recommendations. No sign-up needed."
  );
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SEOResult | null>(null);
  const [error, setError] = useState("");

  const check = async () => {
    if (!url.trim()) return;
    setLoading(true); setError(""); setResult(null);
    try {
      const cleanUrl = url.startsWith("http") ? url : `https://${url}`;
      const base = API_BASE.replace(/\/agency-site$/, "");
      const r = await fetch(`${base}/api/tools/seo-check`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: cleanUrl }),
      });
      if (!r.ok) throw new Error("Analysis failed. Try again.");
      setResult(await r.json());
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  const severityColor = (s: string) => s === "critical" ? "bg-red-100 text-red-700" : s === "warning" ? "bg-yellow-100 text-yellow-700" : "bg-blue-100 text-blue-700";

  return (
    <div className="min-h-[100dvh] flex flex-col bg-white">
      <Navbar />
      <main className="flex-1 pt-24 pb-20">
        <div className="bg-gradient-to-b from-[#F8FAFC] to-white border-b border-[#E5E7EB] py-14">
          <div className="container mx-auto px-4 md:px-6 text-center max-w-3xl">
            <div className="inline-flex items-center gap-2 text-xs font-bold tracking-widest text-blue-600 uppercase bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-full mb-5">
              <Search className="w-3.5 h-3.5" /> Free SEO Tool
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-[#111827] mb-4 leading-tight">
              Free SEO Checker &amp;<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">AI SEO Score Analyzer</span>
            </h1>
            <p className="text-[#6B7280] text-lg mb-8 max-w-2xl mx-auto">
              Instantly check any website's SEO score. Find technical issues, keyword opportunities, and get an actionable fix list — free and instant.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto">
              <div className="relative flex-1">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
                <Input className="pl-10 h-12 text-sm" placeholder="yourwebsite.com" value={url} onChange={e => setUrl(e.target.value)} onKeyDown={e => e.key === "Enter" && check()} />
              </div>
              <Button className="h-12 px-6 font-bold bg-blue-600 hover:bg-blue-700 text-white whitespace-nowrap" onClick={check} disabled={loading || !url.trim()}>
                {loading ? "Checking…" : "Check SEO Score"}
              </Button>
            </div>
            {error && <p className="text-red-500 text-sm mt-3">{error}</p>}
          </div>
        </div>

        {loading && (
          <div className="container mx-auto px-4 max-w-3xl py-16 text-center">
            <div className="w-16 h-16 rounded-full border-4 border-blue-600 border-t-transparent animate-spin mx-auto mb-4" />
            <h3 className="font-bold text-lg text-[#111827]">Analyzing SEO…</h3>
            <p className="text-sm text-[#6B7280] mt-2">Checking technical SEO, on-page factors, content quality, performance & more</p>
          </div>
        )}

        <AnimatePresence>
          {result && (
            <motion.div key="results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="container mx-auto px-4 md:px-6 max-w-4xl py-10 space-y-6">
              {/* Score */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white text-center">
                <p className="text-blue-200 text-sm font-semibold mb-2">{url}</p>
                <div className="text-8xl font-black mb-2">{result.overallScore}</div>
                <div className="text-blue-100 text-lg font-bold mb-3">SEO Score / 100</div>
                <p className="text-blue-200 text-sm max-w-lg mx-auto">{result.summary}</p>
                {result.estimatedMonthlyVisitors > 0 && (
                  <div className="mt-4 inline-block bg-white/20 rounded-xl px-4 py-2 text-sm font-bold">
                    Est. ~{result.estimatedMonthlyVisitors.toLocaleString()} organic visitors/month
                  </div>
                )}
              </div>

              {/* Score breakdown */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {Object.entries(result.scores).map(([k, v]) => (
                  <div key={k} className="bg-white border border-[#E5E7EB] rounded-xl p-4">
                    <div className="text-xs text-[#6B7280] font-medium mb-1">{SCORE_LABELS[k] || k}</div>
                    <div className="text-2xl font-extrabold mb-2" style={{ color: scoreColor(v) }}>{v}/100</div>
                    <div className="h-1.5 bg-gray-100 rounded-full">
                      <motion.div className="h-full rounded-full" style={{ backgroundColor: scoreColor(v) }} initial={{ width: 0 }} animate={{ width: `${v}%` }} transition={{ duration: 0.8 }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Checklist */}
              <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden">
                <div className="p-4 border-b border-[#E5E7EB] bg-[#F8FAFC] flex justify-between">
                  <h2 className="font-bold text-[#111827]">SEO Checklist</h2>
                  <span className="text-sm font-bold text-blue-600">{Object.values(result.checks).filter(Boolean).length}/{Object.keys(result.checks).length} passed</span>
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

              {/* Issues */}
              {result.issues.length > 0 && (
                <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden">
                  <div className="p-4 border-b border-[#E5E7EB] bg-[#F8FAFC]">
                    <h2 className="font-bold text-[#111827]">SEO Issues Found</h2>
                  </div>
                  <div className="divide-y divide-[#F3F4F6]">
                    {result.issues.map((issue, i) => (
                      <div key={i} className="p-4 flex items-start gap-3">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 mt-0.5 ${severityColor(issue.severity)}`}>{issue.severity}</span>
                        <div>
                          <div className="font-semibold text-sm text-[#111827]">{issue.title}</div>
                          <div className="text-xs text-[#6B7280] mt-0.5">{issue.description}</div>
                          <div className="text-xs text-green-700 mt-1 font-medium">Fix: {issue.fix}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Keywords */}
              {result.keywords.length > 0 && (
                <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden">
                  <div className="p-4 border-b border-[#E5E7EB] bg-[#F8FAFC]">
                    <h2 className="font-bold text-[#111827]">Keyword Opportunities</h2>
                  </div>
                  <div className="divide-y divide-[#F3F4F6]">
                    {result.keywords.map((kw, i) => (
                      <div key={i} className="p-4 flex items-start gap-3">
                        <Search className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <div className="font-semibold text-sm text-[#111827]">"{kw.keyword}"</div>
                          <div className="text-xs text-[#6B7280] mt-0.5">{kw.opportunity}</div>
                        </div>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${kw.difficulty === "easy" ? "bg-green-100 text-green-700" : kw.difficulty === "medium" ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"}`}>{kw.difficulty}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {result.recommendations.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
                  <h3 className="font-bold text-[#111827] mb-3 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-blue-600" /> Priority Recommendations</h3>
                  <ul className="space-y-2">{result.recommendations.map((r, i) => <li key={i} className="flex items-start gap-2 text-sm text-[#374151]"><ArrowRight className="w-3.5 h-3.5 text-blue-600 flex-shrink-0 mt-0.5" />{r}</li>)}</ul>
                </div>
              )}

              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-center text-white">
                <h3 className="text-2xl font-extrabold mb-2">Want Better SEO Rankings?</h3>
                <p className="text-blue-200 mb-6">We build SEO-optimized websites and web apps that rank on Google and convert visitors into customers.</p>
                <Button size="lg" className="bg-white text-blue-700 hover:bg-blue-50 font-bold shadow-xl" onClick={() => window.dispatchEvent(new CustomEvent("open-lead-magnet"))}>
                  Get a Free SEO Strategy <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!result && !loading && (
          <div className="container mx-auto px-4 md:px-6 max-w-4xl py-14">
            <h2 className="text-2xl font-extrabold text-center text-[#111827] mb-10">What Our Free SEO Checker Analyzes</h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { icon: <Zap className="w-5 h-5 text-yellow-600" />, t: "Technical SEO", d: "HTTPS, sitemap, robots.txt, canonical tags, crawlability" },
                { icon: <Search className="w-5 h-5 text-blue-600" />, t: "On-Page SEO", d: "Title tags, meta descriptions, H1/H2 headings, keyword usage" },
                { icon: <BarChart3 className="w-5 h-5 text-purple-600" />, t: "Content Quality", d: "Content depth, readability, freshness, internal linking" },
                { icon: <Globe className="w-5 h-5 text-green-600" />, t: "Mobile SEO", d: "Mobile-first indexing, responsive design, mobile UX" },
                { icon: <TrendingUp className="w-5 h-5 text-orange-600" />, t: "Performance", d: "Page speed, Core Web Vitals, server response time" },
                { icon: <Sparkles className="w-5 h-5 text-indigo-600" />, t: "Keyword Opportunities", d: "Find easy-to-rank keywords your competitors are missing" },
              ].map(item => (
                <div key={item.t} className="bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl p-4">
                  <div className="mb-2">{item.icon}</div>
                  <div className="font-bold text-sm text-[#111827] mb-1">{item.t}</div>
                  <div className="text-xs text-[#6B7280]">{item.d}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="container mx-auto px-4 md:px-6 max-w-3xl pb-10">
          <h2 className="text-2xl font-extrabold text-center text-[#111827] mb-6">SEO Checker FAQ</h2>
          <div className="space-y-3">
            {[
              { q: "Is this SEO checker free?", a: "Yes, completely free. No sign-up, no credit card, no limits on how many sites you can check." },
              { q: "How is this different from Semrush or Ahrefs?", a: "Semrush and Ahrefs require paid subscriptions ($100+/month) and are complex tools designed for agencies. Our AI SEO Checker is free, instant, and gives you a clear plain-English report with specific fixes — perfect for small business owners who need answers, not dashboards." },
              { q: "Can I check a competitor's website?", a: "Yes. Enter any public URL to see their SEO score, weaknesses, and keyword opportunities. This is a powerful way to find gaps you can exploit." },
              { q: "What SEO score should I aim for?", a: "A score of 70+ is good. 80+ is excellent. Below 50 means your site has significant issues that are likely hurting your Google rankings and traffic." },
              { q: "How do I improve my SEO score?", a: "Start with critical issues first (red flags in the report), then work through warnings. Common quick wins include: adding meta descriptions, fixing broken images with alt text, creating an XML sitemap, and getting your site HTTPS-secure." },
            ].map(faq => <FAQItem key={faq.q} q={faq.q} a={faq.a} />)}
          </div>
        </div>
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}
