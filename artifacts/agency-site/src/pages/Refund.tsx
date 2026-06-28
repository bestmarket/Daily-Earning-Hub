import { Link } from "wouter";
import { ChevronLeft, ShieldCheck } from "lucide-react";
import SeoHead from "@/components/SeoHead";

export default function Refund() {
  return (
    <>
      <SeoHead
        title="Refund Policy | DevStudio"
        description="DevStudio refund policy for software purchases and custom builds. Understand how we handle refunds and satisfaction guarantees."
        keywords="refund policy, money back, DevStudio"
        canonicalPath="/refund"
      />
      <div className="min-h-screen bg-background pt-16">
        <div className="bg-muted/10 border-b border-border/40 py-12 px-4">
          <div className="container mx-auto max-w-3xl">
            <Link href="/" className="inline-flex items-center text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors mb-6 group">
              <ChevronLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />
              Back to Home
            </Link>
            <h1 className="text-4xl font-extrabold tracking-tight mb-3">Refund Policy</h1>
            <p className="text-muted-foreground font-medium">Last updated: June 28, 2026</p>
          </div>
        </div>

        <div className="container mx-auto max-w-3xl px-4 py-12">
          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 mb-10 flex gap-4 items-start">
            <ShieldCheck className="w-6 h-6 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-foreground">Our Commitment to You</p>
              <p className="text-muted-foreground text-sm mt-1 leading-relaxed">
                We stand behind every tool and project we build. If a product doesn't work as described, we will make it right — through a fix, credit, or refund.
              </p>
            </div>
          </div>

          <div className="prose prose-lg max-w-none space-y-10">
            <section>
              <h2 className="text-2xl font-bold tracking-tight mb-3">1. Software Tool Purchases</h2>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex gap-3"><span className="text-primary font-bold mt-0.5">→</span><span><strong className="text-foreground">7-Day Refund Window:</strong> If a tool does not function as described on the product page, you are eligible for a full refund within 7 days of purchase.</span></li>
                <li className="flex gap-3"><span className="text-primary font-bold mt-0.5">→</span><span><strong className="text-foreground">Technical Issues:</strong> If we are unable to resolve a critical bug within a reasonable timeframe, a full refund will be issued.</span></li>
                <li className="flex gap-3"><span className="text-primary font-bold mt-0.5">→</span><span><strong className="text-foreground">Duplicate Purchases:</strong> If you accidentally purchased the same tool twice, contact us within 48 hours and we will refund the duplicate charge.</span></li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold tracking-tight mb-3">2. Situations Not Eligible for Refund</h2>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex gap-3"><span className="text-destructive font-bold">✕</span>Change of mind after accessing or downloading the software</li>
                <li className="flex gap-3"><span className="text-destructive font-bold">✕</span>Requests made more than 7 days after purchase</li>
                <li className="flex gap-3"><span className="text-destructive font-bold">✕</span>Tools that have been significantly modified by the buyer</li>
                <li className="flex gap-3"><span className="text-destructive font-bold">✕</span>Violation of our Terms of Service</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold tracking-tight mb-3">3. Custom Software Build Projects</h2>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex gap-3"><span className="text-primary font-bold mt-0.5">→</span><span><strong className="text-foreground">Before Work Begins:</strong> 100% of any deposit paid is refundable if the project is cancelled before we start development.</span></li>
                <li className="flex gap-3"><span className="text-primary font-bold mt-0.5">→</span><span><strong className="text-foreground">After Work Has Started:</strong> Deposits are non-refundable once active development has commenced.</span></li>
                <li className="flex gap-3"><span className="text-primary font-bold mt-0.5">→</span><span><strong className="text-foreground">Disputes:</strong> If delivered work does not meet the agreed specifications, contact us within 7 days of delivery.</span></li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold tracking-tight mb-3">4. How to Request a Refund</h2>
              <p className="text-muted-foreground leading-relaxed">
                Email us at <a href="mailto:hello@devstudio.com" className="text-primary hover:underline">hello@devstudio.com</a> with your name, email used for purchase, the product purchased, and a description of the issue. We aim to respond within 2 business days. Approved refunds are typically processed within 5–10 business days.
              </p>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
