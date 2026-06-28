import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import WhatsAppButton from "@/components/layout/WhatsAppButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Copy, Check, RefreshCw, Globe, Star, ArrowRight, ChevronDown, ChevronUp, Lightbulb } from "lucide-react";
import API_BASE from "@/lib/api";

function useSEOMeta(title: string, desc: string) {
  useEffect(() => {
    document.title = title;
    let m = document.querySelector('meta[name="description"]');
    if (!m) { m = document.createElement("meta"); m.setAttribute("name", "description"); document.head.appendChild(m); }
    m.setAttribute("content", desc);
  }, []);
}

interface BusinessName {
  name: string;
  tagline: string;
  reason: string;
  domainAvailability: string;
  style: string;
}

const INDUSTRIES = [
  "Restaurant / Café", "Bakery", "Gym / Fitness", "Hair Salon / Beauty",
  "Real Estate", "Construction", "Cleaning Service", "Landscaping",
  "Accounting / Finance", "Legal Services", "Consulting", "Marketing Agency",
  "Web Design / Development", "Photography", "Event Planning", "Catering",
  "Pet Services", "Childcare / Daycare", "Healthcare / Clinic", "Dental Practice",
  "Auto Repair", "Plumbing", "Electrical Services", "Retail / E-commerce",
  "Education / Tutoring", "Travel Agency", "Insurance", "Logistics",
];

const STYLES = [
  "Modern & Minimal", "Bold & Powerful", "Friendly & Approachable",
  "Professional & Corporate", "Creative & Artistic", "Fun & Playful", "Luxury & Premium",
];

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors" onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}>
      {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5 text-[#9CA3AF]" />}
    </button>
  );
}

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

const domainBadge = (d: string) => {
  if (d === "likely") return "bg-green-100 text-green-700";
  if (d === "check") return "bg-yellow-100 text-yellow-700";
  return "bg-red-100 text-red-700";
};
const domainLabel = (d: string) => d === "likely" ? "Domain likely free" : d === "check" ? "Check domain" : "May be taken";

export default function BusinessNameGenerator() {
  useSEOMeta(
    "Free AI Business Name Generator — Get Unique Company Name Ideas | DevStudio",
    "Generate unique, creative business name ideas with AI. Enter your industry and get 12 original business names with taglines, domain availability hints, and the reasoning behind each name. 100% free."
  );
  const [industry, setIndustry] = useState("");
  const [keywords, setKeywords] = useState("");
  const [style, setStyle] = useState("");
  const [country, setCountry] = useState("United States");
  const [loading, setLoading] = useState(false);
  const [names, setNames] = useState<BusinessName[]>([]);
  const [error, setError] = useState("");

  const generate = async () => {
    if (!industry) return;
    setLoading(true); setError(""); setNames([]);
    try {
      const base = API_BASE.replace(/\/agency-site$/, "");
      const r = await fetch(`${base}/api/tools/business-names`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ industry, keywords, style, country }),
      });
      if (!r.ok) throw new Error("Generation failed. Try again.");
      setNames(await r.json());
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col bg-white">
      <Navbar />
      <main className="flex-1 pt-24 pb-20">
        <div className="bg-gradient-to-b from-amber-50 to-white border-b border-[#E5E7EB] py-14">
          <div className="container mx-auto px-4 md:px-6 text-center max-w-3xl">
            <div className="inline-flex items-center gap-2 text-xs font-bold tracking-widest text-amber-600 uppercase bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-full mb-5">
              <Sparkles className="w-3.5 h-3.5" /> Free AI Tool
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-[#111827] mb-4 leading-tight">
              Free AI Business<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-500">Name Generator</span>
            </h1>
            <p className="text-[#6B7280] text-lg mb-10 max-w-2xl mx-auto">
              Get 12 unique, creative business name ideas with taglines and domain availability hints — powered by AI. Free, instant, no sign-up.
            </p>
            <div className="bg-white border border-[#E5E7EB] rounded-2xl shadow-lg p-6 text-left max-w-2xl mx-auto space-y-4">
              <div>
                <label className="text-sm font-bold text-[#374151] mb-2 block">Your Industry *</label>
                <Select value={industry} onValueChange={setIndustry}>
                  <SelectTrigger className="h-11"><SelectValue placeholder="Select your industry" /></SelectTrigger>
                  <SelectContent>{INDUSTRIES.map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-bold text-[#374151] mb-2 block">Keywords or Themes (optional)</label>
                <Input className="h-11" placeholder="e.g. fresh, local, premium, fast, digital…" value={keywords} onChange={e => setKeywords(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-bold text-[#374151] mb-2 block">Style Preference</label>
                  <Select value={style} onValueChange={setStyle}>
                    <SelectTrigger className="h-11"><SelectValue placeholder="Any style" /></SelectTrigger>
                    <SelectContent>{STYLES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-bold text-[#374151] mb-2 block">Country / Market</label>
                  <Input className="h-11" placeholder="e.g. United States" value={country} onChange={e => setCountry(e.target.value)} />
                </div>
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <Button className="w-full h-12 font-bold text-white" style={{ background: "linear-gradient(135deg,#F59E0B,#EF4444)" }} onClick={generate} disabled={loading || !industry}>
                {loading ? <><RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Generating Names…</> : <><Sparkles className="w-4 h-4 mr-2" /> Generate 12 Business Names</>}
              </Button>
            </div>
          </div>
        </div>

        {loading && (
          <div className="container mx-auto px-4 max-w-3xl py-16 text-center">
            <div className="w-16 h-16 rounded-full border-4 border-amber-500 border-t-transparent animate-spin mx-auto mb-4" />
            <h3 className="font-bold text-lg">AI is brainstorming names…</h3>
            <p className="text-sm text-[#6B7280] mt-2">Creating 12 unique, creative business name ideas for you</p>
          </div>
        )}

        <AnimatePresence>
          {names.length > 0 && (
            <motion.div key="names" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="container mx-auto px-4 md:px-6 max-w-4xl py-10 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="font-extrabold text-2xl text-[#111827]">12 Name Ideas for Your {industry} Business</h2>
                <Button variant="outline" size="sm" onClick={generate} className="gap-1.5"><RefreshCw className="w-3.5 h-3.5" /> Regenerate</Button>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {names.map((n, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    className="bg-white border border-[#E5E7EB] rounded-2xl p-5 hover:border-amber-300 hover:shadow-md transition-all group">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="text-xl font-extrabold text-[#111827] group-hover:text-amber-600 transition-colors">{n.name}</div>
                        <div className="text-sm text-[#6B7280] italic mt-0.5">"{n.tagline}"</div>
                      </div>
                      <CopyBtn text={`${n.name}\n"${n.tagline}"`} />
                    </div>
                    <p className="text-xs text-[#6B7280] leading-relaxed mb-3">{n.reason}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${domainBadge(n.domainAvailability)}`}>{domainLabel(n.domainAvailability)}</span>
                      <span className="text-xs bg-gray-100 text-[#6B7280] px-2 py-0.5 rounded-full">{n.style}</span>
                      <a href={`https://www.godaddy.com/domainsearch/find?domainToCheck=${n.name.toLowerCase().replace(/\s+/g, "")}.com`} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline flex items-center gap-0.5">
                        <Globe className="w-3 h-3" /> Check .com
                      </a>
                    </div>
                  </motion.div>
                ))}
              </div>
              <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-8 text-center text-white">
                <h3 className="text-2xl font-extrabold mb-2">Found the Perfect Name?</h3>
                <p className="text-amber-100 mb-6">Now you need a brand-matching website and custom software to launch your business properly.</p>
                <Button size="lg" className="bg-white text-amber-600 hover:bg-amber-50 font-bold shadow-xl" onClick={() => window.dispatchEvent(new CustomEvent("open-lead-magnet"))}>
                  Build My Business Website <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!names.length && !loading && (
          <div className="container mx-auto px-4 md:px-6 max-w-4xl py-14">
            <h2 className="text-2xl font-extrabold text-center text-[#111827] mb-8">Tips for Choosing a Great Business Name</h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { icon: "🎯", t: "Keep it Short", d: "1–3 words. Easy to say, spell, and remember. Avoid hyphens and numbers." },
                { icon: "🌐", t: "Check the Domain", d: "Try to get the .com version. If taken, try .co or add a word like 'get' or 'the'." },
                { icon: "🔍", t: "Search Google", d: "Make sure no big competitor has a similar name. Check trademark databases." },
                { icon: "🗣️", t: "Say It Out Loud", d: "If it's hard to say or explain over the phone, it'll hurt word-of-mouth marketing." },
                { icon: "📱", t: "Check Social Media", d: "See if the handle is available on Instagram, LinkedIn, Facebook, and X." },
                { icon: "💡", t: "Think Long-Term", d: "Don't name it after a location or niche if you plan to expand. Think broader." },
              ].map(item => (
                <div key={item.t} className="bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl p-4">
                  <div className="text-2xl mb-2">{item.icon}</div>
                  <div className="font-bold text-sm text-[#111827] mb-1">{item.t}</div>
                  <div className="text-xs text-[#6B7280]">{item.d}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="container mx-auto px-4 md:px-6 max-w-3xl pb-10">
          <h2 className="text-2xl font-extrabold text-center text-[#111827] mb-6">Business Name Generator FAQ</h2>
          <div className="space-y-3">
            {[
              { q: "Are these business names unique?", a: "Yes — our AI generates original name ideas based on your industry and preferences. However, always search Google and trademark databases to confirm no existing business uses the same name." },
              { q: "Can I use these names commercially?", a: "Yes, but always verify availability. Check trademark databases (USPTO in the US, IPO in the UK), search Google, and check domain/social media availability before committing to a name." },
              { q: "What makes a good business name?", a: "A good business name is short (1-3 words), easy to spell and pronounce, memorable, available as a .com domain, and reflects your business values or unique selling point." },
              { q: "How many names can I generate?", a: "Unlimited — completely free. Click 'Regenerate' as many times as you need, or try different keywords and styles to explore more ideas." },
              { q: "Does this generator check real domain availability?", a: "The AI provides an estimate ('likely free', 'check', 'may be taken') based on name patterns, but we recommend clicking 'Check .com' next to each name to verify real-time availability with a registrar like GoDaddy or Namecheap." },
            ].map(faq => <FAQItem key={faq.q} q={faq.q} a={faq.a} />)}
          </div>
        </div>
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}
