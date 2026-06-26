import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, MessageCircle } from "lucide-react";

export default function FinalCTA() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  const openLeadMagnet = () => {
    window.dispatchEvent(new CustomEvent("open-lead-magnet"));
  };

  return (
    <section className="py-24 md:py-32 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[40%] h-[60%] rounded-full bg-accent/8 blur-[100px]" />
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <motion.div
          ref={ref}
          className="max-w-4xl mx-auto text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
        >
          <span className="inline-block text-sm font-semibold tracking-widest text-primary uppercase mb-6">
            Ready to Get Started?
          </span>

          <h2 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Ready to Build Software That<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-cyan-400">
              Grows Your Business?
            </span>
          </h2>

          <p className="text-muted-foreground text-xl max-w-2xl mx-auto mb-10">
            Join hundreds of businesses using custom software to get more customers, save time, and increase revenue. Your first consultation is completely free.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button
              size="lg"
              className="h-14 px-8 text-base font-semibold shadow-2xl shadow-primary/30"
              onClick={openLeadMagnet}
              data-testid="button-final-cta-start"
            >
              Start My Project
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-14 px-8 text-base font-semibold border-border/60 hover:border-primary/60"
              onClick={openLeadMagnet}
              data-testid="button-final-cta-free-idea"
            >
              Get My Free Business Tool Idea
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-muted-foreground">
            <a
              href="https://wa.me/15550000000"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:text-green-400 transition-colors"
              data-testid="link-whatsapp-footer"
            >
              <MessageCircle className="w-4 h-4 text-green-400" />
              WhatsApp: +1 (555) 000-0000
            </a>
            <span className="hidden sm:block text-border">·</span>
            <a
              href="mailto:hello@devstudio.com"
              className="hover:text-primary transition-colors"
              data-testid="link-email-footer"
            >
              hello@devstudio.com
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
