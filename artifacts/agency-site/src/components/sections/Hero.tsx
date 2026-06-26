import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowRight } from "lucide-react";

export default function Hero() {
  const scrollToSolutions = () => {
    document.getElementById("solutions")?.scrollIntoView({ behavior: "smooth" });
  };

  const openLeadMagnet = () => {
    window.dispatchEvent(new CustomEvent('open-lead-magnet'));
  };

  return (
    <section id="home" className="pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-8">
          
          {/* Content */}
          <div className="flex-1 text-center lg:text-left z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight text-foreground mb-6 leading-tight">
                We Build Custom Web Apps That Help Businesses <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Get More Customers</span>, Save Time & Increase Revenue.
              </h1>
            </motion.div>
            
            <motion.p 
              className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto lg:mx-0"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              From booking systems and customer portals to AI-powered business tools and SaaS platforms, we build software that helps your business grow faster.
            </motion.p>
            
            <motion.div 
              className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start mb-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Button size="lg" className="w-full sm:w-auto text-base h-14 px-8 shadow-lg shadow-primary/20" onClick={openLeadMagnet}>
                Get My Free Business Tool Idea
              </Button>
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-base h-14 px-8" onClick={scrollToSolutions}>
                View Live Examples <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </motion.div>

            <motion.div 
              className="flex flex-wrap items-center justify-center lg:justify-start gap-4 md:gap-6 text-sm text-muted-foreground font-medium"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              {['Mobile Friendly', 'Secure', 'Fast Delivery', 'Custom Built', 'AI Powered'].map((badge, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span>{badge}</span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Visual */}
          <div className="flex-1 w-full max-w-lg lg:max-w-none relative z-10">
            <motion.div 
              className="relative w-full aspect-square md:aspect-[4/3] rounded-2xl border border-white/10 bg-card/40 backdrop-blur-3xl shadow-2xl overflow-hidden flex items-center justify-center"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              {/* Inner Dashboard Mockup Elements */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5" />
              
              <div className="relative w-[80%] h-[70%] bg-background/80 rounded-xl border border-border shadow-xl flex flex-col overflow-hidden">
                {/* Header */}
                <div className="h-10 border-b border-border flex items-center px-4 gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                {/* Content */}
                <div className="flex-1 p-4 grid grid-cols-2 gap-4">
                  <div className="col-span-2 h-24 bg-card rounded-lg border border-border/50 p-3 flex flex-col gap-2">
                    <div className="w-1/3 h-3 bg-muted rounded-full" />
                    <div className="w-full flex-1 bg-gradient-to-r from-primary/20 to-accent/20 rounded-md" />
                  </div>
                  <div className="h-20 bg-card rounded-lg border border-border/50 p-3 flex flex-col justify-between">
                    <div className="w-1/2 h-3 bg-muted rounded-full" />
                    <div className="w-2/3 h-5 bg-primary/40 rounded-full" />
                  </div>
                  <div className="h-20 bg-card rounded-lg border border-border/50 p-3 flex flex-col justify-between">
                    <div className="w-1/2 h-3 bg-muted rounded-full" />
                    <div className="w-2/3 h-5 bg-accent/40 rounded-full" />
                  </div>
                </div>
              </div>

              {/* Floating Cards */}
              <FloatingCard label="Booking Confirmed" delay={0} top="10%" left="-5%" />
              <FloatingCard label="New Customer +1" delay={1.5} top="40%" right="-5%" color="accent" />
              <FloatingCard label="Payment Received $299" delay={0.7} bottom="20%" left="5%" color="primary" />
              <FloatingCard label="Analytics ↑48%" delay={2.2} top="15%" right="10%" />
              <FloatingCard label="AI Assistant Active" delay={1.1} bottom="10%" right="5%" color="accent" />
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}

function FloatingCard({ label, delay, top, left, right, bottom, color = "primary" }: any) {
  return (
    <motion.div
      className="absolute bg-card/90 backdrop-blur-md border border-white/10 shadow-xl rounded-lg px-4 py-3 flex items-center gap-3 z-20"
      style={{ top, left, right, bottom }}
      animate={{
        y: [0, -10, 0],
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        repeatType: "reverse",
        delay,
      }}
    >
      <div className={`w-2 h-2 rounded-full ${color === 'primary' ? 'bg-primary' : 'bg-accent'} shadow-[0_0_8px_currentColor]`} />
      <span className="text-sm font-medium whitespace-nowrap">{label}</span>
    </motion.div>
  );
}
