import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, MessageCircle, Shield, Zap, Star } from "lucide-react";

export default function FinalCTA() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const openLeadMagnet = () => window.dispatchEvent(new CustomEvent("open-lead-magnet"));

  return (
    <section className="py-24 md:py-32 relative overflow-hidden">
      {/* Purple gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#7C3AED] via-[#6366F1] to-[#8B5CF6]" />
      {/* Decorative circles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-white/5" />
        <div className="absolute bottom-[-30%] left-[-15%] w-[500px] h-[500px] rounded-full bg-white/5" />
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "32px 32px" }}
        />
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <motion.div
          ref={ref}
          className="max-w-4xl mx-auto text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
        >
          <span className="inline-block text-sm font-bold tracking-widest text-purple-200 uppercase mb-6">
            Ready to Get Started?
          </span>

          <h2 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight text-white">
            Ready to Build Software That<br />
            <span className="text-purple-200">
              Grows Your Business?
            </span>
          </h2>

          <p className="text-purple-100 text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Join hundreds of businesses using custom software to get more customers, save time, and increase revenue. Your first consultation is completely free.
          </p>

          {/* Trust badges */}
          <div className="flex flex-wrap gap-3 justify-center mb-10">
            {[
              { icon: Shield, label: "Free Discovery Call" },
              { icon: Zap, label: "1–4 Week Delivery" },
              { icon: Star, label: "Fixed Pricing" },
            ].map((b) => (
              <div key={b.label} className="flex items-center gap-2 bg-white/10 border border-white/20 text-white text-sm font-medium px-4 py-2 rounded-full">
                <b.icon className="w-4 h-4 text-purple-200" />
                {b.label}
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button
              size="lg"
              className="h-14 px-8 text-base font-bold bg-white text-[#7C3AED] hover:bg-purple-50 shadow-2xl shadow-black/20 transition-all hover:-translate-y-0.5"
              onClick={openLeadMagnet}
            >
              Start My Project
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-14 px-8 text-base font-semibold border-white/40 text-white hover:bg-white/10 hover:border-white/60 transition-all"
              onClick={openLeadMagnet}
            >
              Get My Free Business Tool Idea
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-purple-200">
            <a
              href="https://wa.me/15550000000"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:text-white transition-colors"
            >
              <MessageCircle className="w-4 h-4 text-green-300" />
              WhatsApp: +1 (555) 000-0000
            </a>
            <span className="hidden sm:block text-white/30">·</span>
            <a href="mailto:hello@devstudio.com" className="hover:text-white transition-colors">
              hello@devstudio.com
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
