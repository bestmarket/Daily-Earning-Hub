import { useEffect } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import WhatsAppButton from "@/components/layout/WhatsAppButton";
import { ArrowRight, Globe } from "lucide-react";
import { NICHES } from "./niches-data";

export default function NichesIndex() {
  useEffect(() => {
    document.title = "Free Website Grader by Industry — 20 Business Types | DevStudio";
    let m = document.querySelector('meta[name="description"]');
    if (!m) { m = document.createElement("meta"); m.setAttribute("name", "description"); document.head.appendChild(m); }
    m.setAttribute("content", "Free AI website grader for 20 business types: restaurants, salons, dentists, law firms, gyms, contractors, and more. Get a grade, checklist, and action plan — free, instant, no sign-up.");
  }, []);

  return (
    <div className="min-h-[100dvh] flex flex-col bg-white">
      <Navbar />
      <main className="flex-1 pt-24 pb-20">

        {/* Hero */}
        <div className="bg-gradient-to-b from-[#F8FAFC] to-white border-b border-[#E5E7EB] py-14">
          <div className="container mx-auto px-4 md:px-6 text-center max-w-3xl">
            <div className="flex items-center justify-center gap-2 text-xs text-[#6B7280] mb-4">
              <Link href="/tools" className="hover:text-[#7C3AED]">All Tools</Link>
              <span>›</span>
              <Link href="/tools/website-grader" className="hover:text-[#7C3AED]">Website Grader</Link>
              <span>›</span>
              <span className="font-semibold text-[#111827]">By Industry</span>
            </div>
            <div className="inline-flex items-center gap-2 text-xs font-bold tracking-widest text-[#7C3AED] uppercase bg-purple-50 border border-purple-200 px-3 py-1.5 rounded-full mb-5">
              <Globe className="w-3.5 h-3.5" /> 20 Business Types
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-[#111827] mb-4 leading-tight">
              Free Website Grader<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7C3AED] to-[#6366F1]">
                By Industry
              </span>
            </h1>
            <p className="text-[#6B7280] text-lg max-w-2xl mx-auto">
              Get an AI-powered website grade tailored specifically to your industry. Each grader checks the features that matter most for your type of business — free, instant, no sign-up.
            </p>
          </div>
        </div>

        {/* Grid */}
        <div className="container mx-auto px-4 md:px-6 max-w-5xl py-14">
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {NICHES.map((niche, i) => (
              <motion.div
                key={niche.slug}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <Link href={`/tools/website-grader/${niche.slug}`}>
                  <div className="group bg-white border border-[#E5E7EB] rounded-2xl p-5 hover:shadow-lg hover:border-transparent transition-all cursor-pointer h-full"
                    style={{ ["--tw-hover-border-color" as any]: niche.color }}>
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4"
                      style={{ background: `${niche.color}15` }}
                    >
                      {niche.emoji}
                    </div>
                    <h3 className="font-extrabold text-[#111827] text-sm mb-1 group-hover:text-[#7C3AED] transition-colors leading-snug">
                      {niche.plural}
                    </h3>
                    <p className="text-[10px] text-[#9CA3AF] mb-3 leading-relaxed line-clamp-2">
                      {niche.keywords.slice(0, 2).join(" · ")}
                    </p>
                    <div className="flex items-center gap-1 text-xs font-bold" style={{ color: niche.color }}>
                      Grade my website <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-14 bg-gradient-to-r from-[#7C3AED] to-[#6366F1] rounded-2xl p-10 text-center text-white">
            <h3 className="text-2xl font-extrabold mb-3">Don't See Your Industry?</h3>
            <p className="text-purple-200 mb-7 max-w-xl mx-auto">
              Use our general Website Grader for any business type — or contact us and we'll build a custom grader for your niche.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/tools/website-grader">
                <div className="inline-flex items-center gap-2 bg-white text-[#7C3AED] font-bold px-6 py-3 rounded-xl cursor-pointer hover:bg-purple-50 transition-colors">
                  <Globe className="w-4 h-4" /> Use General Grader
                </div>
              </Link>
              <div
                className="inline-flex items-center gap-2 border border-white/40 text-white font-bold px-6 py-3 rounded-xl cursor-pointer hover:bg-white/10 transition-colors"
                onClick={() => window.dispatchEvent(new CustomEvent("open-lead-magnet"))}
              >
                Request My Industry <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>

      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}
