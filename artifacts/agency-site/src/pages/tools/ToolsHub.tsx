import { useEffect } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import WhatsAppButton from "@/components/layout/WhatsAppButton";
import { Globe, Search, Sparkles, FileText, TrendingUp, Calculator, DollarSign, Brain, Target, Clock, RotateCcw, ArrowRight } from "lucide-react";

function useSEOMeta(title: string, desc: string) {
  useEffect(() => {
    document.title = title;
    let m = document.querySelector('meta[name="description"]');
    if (!m) { m = document.createElement("meta"); m.setAttribute("name", "description"); document.head.appendChild(m); }
    m.setAttribute("content", desc);
  }, []);
}

const AI_TOOLS = [
  {
    href: "/tools/website-grader",
    icon: Globe,
    color: "#7C3AED",
    bg: "bg-purple-50",
    border: "border-purple-200",
    badge: "AI-Powered",
    badgeColor: "bg-purple-100 text-purple-700",
    title: "Free Website Grader",
    desc: "Get an A–F grade across 8 dimensions: design, SEO, performance, mobile, conversion, security & more.",
    keywords: ["website grader", "website score", "website checker"],
  },
  {
    href: "/tools/seo-checker",
    icon: Search,
    color: "#2563EB",
    bg: "bg-blue-50",
    border: "border-blue-200",
    badge: "AI-Powered",
    badgeColor: "bg-blue-100 text-blue-700",
    title: "Free SEO Checker",
    desc: "Analyze any site's SEO score, find technical issues, discover keyword opportunities, get an action plan.",
    keywords: ["SEO checker", "SEO score", "SEO analyzer"],
  },
  {
    href: "/tools/business-name-generator",
    icon: Sparkles,
    color: "#D97706",
    bg: "bg-amber-50",
    border: "border-amber-200",
    badge: "AI-Powered",
    badgeColor: "bg-amber-100 text-amber-700",
    title: "Business Name Generator",
    desc: "Generate 12 unique business name ideas with taglines, domain hints, and the reasoning behind each name.",
    keywords: ["business name ideas", "company name generator"],
  },
];

const CALC_TOOLS = [
  {
    href: "/tools/invoice-generator",
    icon: FileText,
    color: "#16A34A",
    bg: "bg-green-50",
    border: "border-green-200",
    badge: "Free Tool",
    badgeColor: "bg-green-100 text-green-700",
    title: "Free Invoice Generator",
    desc: "Create professional invoices online. Add line items, tax, discounts. Download as PDF instantly — no sign-up.",
    keywords: ["invoice generator", "invoice maker", "free invoice"],
  },
  {
    href: "/tools/profit-margin-calculator",
    icon: TrendingUp,
    color: "#0D9488",
    bg: "bg-teal-50",
    border: "border-teal-200",
    badge: "Free Tool",
    badgeColor: "bg-teal-100 text-teal-700",
    title: "Profit Margin Calculator",
    desc: "4 calculators in one: gross & net margin, markup to margin, selling price finder, and break-even point.",
    keywords: ["profit margin calculator", "markup calculator", "break-even"],
  },
  {
    href: "/free-tools",
    icon: Calculator,
    color: "#6366F1",
    bg: "bg-indigo-50",
    border: "border-indigo-200",
    badge: "7 Tools",
    badgeColor: "bg-indigo-100 text-indigo-700",
    title: "Business ROI Calculators",
    desc: "ROI calculator, cost estimator, break-even, lost leads calculator, productivity audit & revenue projector.",
    keywords: ["ROI calculator", "business calculators"],
  },
];

function ToolCard({ tool, index }: { tool: typeof AI_TOOLS[0]; index: number }) {
  const Icon = tool.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07 }}
    >
      <Link href={tool.href}>
        <div className={`group bg-white border ${tool.border} rounded-2xl p-6 hover:shadow-lg transition-all cursor-pointer h-full`}>
          <div className="flex items-start justify-between mb-4">
            <div className={`w-11 h-11 rounded-xl ${tool.bg} flex items-center justify-center`}>
              <Icon className="w-5 h-5" style={{ color: tool.color }} />
            </div>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${tool.badgeColor}`}>{tool.badge}</span>
          </div>
          <h3 className="font-extrabold text-[#111827] text-lg mb-2 group-hover:text-[#7C3AED] transition-colors">{tool.title}</h3>
          <p className="text-sm text-[#6B7280] leading-relaxed mb-4">{tool.desc}</p>
          <div className="flex flex-wrap gap-1.5">
            {tool.keywords.map(k => (
              <span key={k} className="text-[10px] bg-[#F3F4F6] text-[#6B7280] px-2 py-0.5 rounded-full">{k}</span>
            ))}
          </div>
          <div className="flex items-center gap-1 mt-4 text-sm font-bold" style={{ color: tool.color }}>
            Use Free Tool <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default function ToolsHub() {
  useSEOMeta(
    "Free Business Tools — Website Grader, SEO Checker, Invoice Generator | DevStudio",
    "Free AI-powered business tools: website grader, SEO checker, business name generator, invoice maker, profit margin calculator, and ROI calculators. No sign-up required."
  );

  return (
    <div className="min-h-[100dvh] flex flex-col bg-white">
      <Navbar />
      <main className="flex-1 pt-24 pb-20">
        <div className="bg-gradient-to-b from-[#F8FAFC] to-white border-b border-[#E5E7EB] py-16">
          <div className="container mx-auto px-4 md:px-6 text-center max-w-3xl">
            <div className="inline-flex items-center gap-2 text-xs font-bold tracking-widest text-[#7C3AED] uppercase bg-purple-50 border border-purple-200 px-3 py-1.5 rounded-full mb-5">
              <Sparkles className="w-3.5 h-3.5" /> All Free · No Sign-Up
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-[#111827] mb-4 leading-tight">
              Free Business Tools<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7C3AED] to-[#6366F1]">Powered by AI</span>
            </h1>
            <p className="text-[#6B7280] text-lg max-w-2xl mx-auto">
              Professional tools used by thousands of businesses — completely free. No sign-up, no credit card, instant results.
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 md:px-6 max-w-5xl py-14">
          <div className="mb-3">
            <h2 className="text-xl font-extrabold text-[#111827] mb-1">🤖 AI-Powered Tools</h2>
            <p className="text-sm text-[#6B7280]">Instant analysis and generation powered by Gemini AI</p>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5 mb-12">
            {AI_TOOLS.map((tool, i) => <ToolCard key={tool.href} tool={tool} index={i} />)}
          </div>

          <div className="mb-3">
            <h2 className="text-xl font-extrabold text-[#111827] mb-1">🧮 Calculators & Generators</h2>
            <p className="text-sm text-[#6B7280]">Practical tools for everyday business decisions</p>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5 mb-14">
            {CALC_TOOLS.map((tool, i) => <ToolCard key={tool.href} tool={tool} index={i} />)}
          </div>

          <div className="bg-gradient-to-r from-[#7C3AED] to-[#6366F1] rounded-2xl p-10 text-center text-white">
            <h3 className="text-2xl font-extrabold mb-3">Need a Custom Tool for Your Business?</h3>
            <p className="text-purple-200 mb-7 max-w-xl mx-auto">We build custom web apps, dashboards, CRMs, and automation tools tailored to your exact business needs.</p>
            <Link href="/">
              <div className="inline-flex items-center gap-2 bg-white text-[#7C3AED] hover:bg-purple-50 font-bold px-7 py-3 rounded-xl shadow-xl cursor-pointer transition-colors">
                Get a Free Custom Software Quote <ArrowRight className="w-5 h-5" />
              </div>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}
