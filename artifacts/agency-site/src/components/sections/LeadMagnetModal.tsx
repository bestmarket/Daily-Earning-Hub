import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2, Loader2, Sparkles, ArrowRight, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const industries = [
  "Restaurant / Food & Beverage", "Retail / E-commerce", "Healthcare / Medical",
  "Real Estate", "Fitness / Wellness", "Education / Coaching", "Professional Services",
  "Hospitality / Tourism", "Construction / Trades", "Beauty / Salon", "Church / Non-profit",
  "Technology / SaaS", "Finance / Accounting", "Agency / Marketing", "Other",
];

const budgets = [
  "Under $500", "$500 – $1,000", "$1,000 – $3,000", "$3,000 – $10,000", "$10,000+",
];

type Rec = {
  tool: string;
  features: string[];
  timeline: string;
  benefits: string[];
  tech: string[];
  investment: string;
  reasoning?: string;
};

type Step = 1 | 2 | 3 | 4 | "loading" | "result" | "error";

const API_BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

export default function LeadMagnetModal() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>(1);
  const [rec, setRec] = useState<Rec | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [form, setForm] = useState({
    businessName: "",
    industry: "",
    website: "",
    description: "",
    challenges: "",
    goal: "",
    budget: "",
    whatsapp: "",
    email: "",
  });

  useEffect(() => {
    const handler = () => {
      setOpen(true);
      setStep(1);
      setRec(null);
      setErrorMsg("");
    };
    window.addEventListener("open-lead-magnet", handler);
    return () => window.removeEventListener("open-lead-magnet", handler);
  }, []);

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const setSelect = (field: string) => (value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async () => {
    setStep("loading");
    setErrorMsg("");
    try {
      const res = await fetch(`${API_BASE}/api/ai/recommend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName: form.businessName,
          industry: form.industry,
          description: form.description,
          challenges: form.challenges,
          goal: form.goal,
          budget: form.budget,
        }),
      });
      if (!res.ok) throw new Error("Request failed");
      const data: Rec = await res.json();
      setRec(data);
      setStep("result");
    } catch {
      setErrorMsg("Something went wrong generating your recommendation. Please try again.");
      setStep("error");
    }
  };

  const progress = step === 1 ? 25 : step === 2 ? 50 : step === 3 ? 75 : step === 4 ? 100 : 100;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-lg w-full max-h-[90vh] overflow-y-auto bg-card border-border/60 p-0">
        <DialogTitle className="sr-only">Get My Free Business Tool Idea</DialogTitle>

        {/* Header */}
        <div className="p-6 pb-0">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <span className="text-sm font-semibold text-primary">AI-Powered Business Tool Recommendation</span>
          </div>
          <h2 className="text-xl font-bold mb-1">Get Your Free Custom Software Idea</h2>
          <p className="text-sm text-muted-foreground">Tell us about your business and our AI will recommend the perfect software solution.</p>
        </div>

        {/* Progress bar */}
        {typeof step === "number" && (
          <div className="px-6 pt-4">
            <div className="flex justify-between text-xs text-muted-foreground mb-2">
              <span>Step {step} of 4</span>
              <span>{progress}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>
          </div>
        )}

        <div className="p-6 pt-5">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <h3 className="font-semibold">Business Info</h3>
                <Input placeholder="Business name *" value={form.businessName} onChange={set("businessName")} />
                <Select onValueChange={setSelect("industry")} value={form.industry}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your industry *" />
                  </SelectTrigger>
                  <SelectContent>
                    {industries.map((ind) => (
                      <SelectItem key={ind} value={ind}>{ind}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input placeholder="Website URL (optional)" value={form.website} onChange={set("website")} />
                <Button className="w-full" disabled={!form.businessName || !form.industry} onClick={() => setStep(2)}>
                  Continue <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <h3 className="font-semibold">About Your Business</h3>
                <Textarea placeholder="Describe your business and what you do *" value={form.description} onChange={set("description")} rows={3} />
                <Textarea placeholder="What are your biggest business challenges? *" value={form.challenges} onChange={set("challenges")} rows={3} />
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep(1)} className="flex-1">Back</Button>
                  <Button className="flex-1" disabled={!form.description || !form.challenges} onClick={() => setStep(3)}>
                    Continue <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <h3 className="font-semibold">Goals & Budget</h3>
                <Textarea placeholder="What is your main business goal? *" value={form.goal} onChange={set("goal")} rows={3} />
                <Select onValueChange={setSelect("budget")} value={form.budget}>
                  <SelectTrigger>
                    <SelectValue placeholder="Estimated budget *" />
                  </SelectTrigger>
                  <SelectContent>
                    {budgets.map((b) => (
                      <SelectItem key={b} value={b}>{b}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep(2)} className="flex-1">Back</Button>
                  <Button className="flex-1" disabled={!form.goal || !form.budget} onClick={() => setStep(4)}>
                    Continue <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <h3 className="font-semibold">Contact Details</h3>
                <p className="text-sm text-muted-foreground">We'll send your recommendation here and be ready to answer any questions.</p>
                <Input placeholder="WhatsApp number (with country code) *" value={form.whatsapp} onChange={set("whatsapp")} />
                <Input type="email" placeholder="Email address *" value={form.email} onChange={set("email")} />
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep(3)} className="flex-1">Back</Button>
                  <Button className="flex-1" disabled={!form.whatsapp || !form.email} onClick={handleSubmit}>
                    Get My Free Recommendation
                  </Button>
                </div>
              </motion.div>
            )}

            {step === "loading" && (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="py-12 flex flex-col items-center gap-4 text-center">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                  </div>
                  <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
                </div>
                <div>
                  <h3 className="font-semibold text-base mb-1">AI is Analyzing Your Business...</h3>
                  <p className="text-sm text-muted-foreground">Generating your personalized software recommendation</p>
                </div>
              </motion.div>
            )}

            {step === "error" && (
              <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-10 flex flex-col items-center gap-4 text-center">
                <AlertCircle className="w-10 h-10 text-destructive" />
                <div>
                  <h3 className="font-semibold mb-1">Something went wrong</h3>
                  <p className="text-sm text-muted-foreground mb-4">{errorMsg}</p>
                  <Button onClick={() => setStep(4)}>Try Again</Button>
                </div>
              </motion.div>
            )}

            {step === "result" && rec && (
              <motion.div key="result" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
                <div className="flex items-center gap-2 text-green-400">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="font-semibold">Your AI Recommendation is Ready!</span>
                </div>

                <div className="rounded-xl border border-primary/30 bg-primary/5 p-5 space-y-4">
                  <div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Best Software For You</div>
                    <h3 className="font-bold text-base">{rec.tool}</h3>
                    {rec.reasoning && <p className="text-sm text-muted-foreground mt-1">{rec.reasoning}</p>}
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Recommended Features</div>
                    <ul className="space-y-1.5">
                      {rec.features.map((f) => (
                        <li key={f} className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Timeline</div>
                      <div className="font-semibold">{rec.timeline}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Estimated Investment</div>
                      <div className="font-semibold text-primary">{rec.investment}</div>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Expected Benefits</div>
                    <ul className="space-y-1.5">
                      {rec.benefits.map((b) => (
                        <li key={b} className="flex items-center gap-2 text-sm">
                          <span className="text-green-400">↑</span> {b}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Technology</div>
                    <div className="flex flex-wrap gap-1.5">
                      {rec.tech.map((t) => (
                        <span key={t} className="text-xs bg-primary/10 text-primary border border-primary/20 rounded-full px-2.5 py-1">{t}</span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-accent/30 bg-accent/5 p-4">
                  <div className="text-sm font-semibold mb-1">Want the Full Project Blueprint?</div>
                  <p className="text-xs text-muted-foreground mb-3">
                    For just $1, get a complete project blueprint including UI layouts, feature specs, development roadmap, cost breakdown, and growth strategy.
                  </p>
                  <Button size="sm" className="w-full bg-accent hover:bg-accent/90 shadow-lg shadow-accent/20">
                    Get Full Blueprint for $1 <ArrowRight className="ml-2 w-3.5 h-3.5" />
                  </Button>
                </div>

                <Button
                  className="w-full"
                  onClick={() => {
                    setOpen(false);
                    const el = document.getElementById("faq");
                    el?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  Start My Full Project
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}
