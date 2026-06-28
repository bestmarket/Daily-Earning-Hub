import { Link } from "wouter";
import { ChevronLeft, ShieldCheck } from "lucide-react";
import SeoHead from "@/components/SeoHead";

export default function Refund() {
  return (
    <>
      <SeoHead
        title="Refund Policy | Tools4Biz"
        description="Tools4Biz refund policy for software tool purchases and custom builds. Understand how we handle refunds, disputes, and satisfaction guarantees."
        keywords="refund policy, money back, Tools4Biz, software refund"
        canonicalPath="/refund"
      />
      <div className="flex-1 w-full bg-background animate-in fade-in duration-500">
        <div className="bg-muted/10 border-b border-border/40 py-12 px-4">
          <div className="container mx-auto max-w-3xl">
            <Link href="/" className="inline-flex items-center text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors mb-6 group">
              <ChevronLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />
              Back to Home
            </Link>
            <h1 className="text-4xl font-extrabold tracking-tight mb-3">Refund Policy</h1>
            <p className="text-muted-foreground font-medium">Last updated: June 27, 2026</p>
          </div>
        </div>

        <div className="container mx-auto max-w-3xl px-4 py-12">

          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 mb-10 flex gap-4 items-start">
            <ShieldCheck className="w-6 h-6 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-foreground">Our Commitment to You</p>
              <p className="text-muted-foreground text-sm mt-1 leading-relaxed">
                We stand behind every tool we build. If a product doesn't work as described, we will make it right — through a fix, credit, or refund.
              </p>
            </div>
          </div>

          <div className="prose prose-lg max-w-none space-y-10">

            <section>
              <h2 className="text-2xl font-bold tracking-tight mb-3">1. Software Tool Purchases (One-Time)</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Because our tools are digital software products, all sales are generally final. However, we offer the following protections:
              </p>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex gap-3"><span className="text-primary font-bold mt-0.5">→</span><span><strong className="text-foreground">7-Day Refund Window:</strong> If you purchased a tool and it does not function as described on the product page, you are eligible for a full refund within 7 days of purchase. Contact us with a description of the issue.</span></li>
                <li className="flex gap-3"><span className="text-primary font-bold mt-0.5">→</span><span><strong className="text-foreground">Technical Issues:</strong> If we are unable to resolve a critical bug or technical defect within a reasonable timeframe, a full refund will be issued.</span></li>
                <li className="flex gap-3"><span className="text-primary font-bold mt-0.5">→</span><span><strong className="text-foreground">Duplicate Purchases:</strong> If you accidentally purchased the same tool twice, contact us within 48 hours and we will refund the duplicate charge.</span></li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold tracking-tight mb-3">2. Situations Not Eligible for Refund</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">Refunds will generally <strong>not</strong> be issued in the following situations:</p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex gap-3"><span className="text-destructive font-bold">✕</span>Change of mind after accessing or downloading the software</li>
                <li className="flex gap-3"><span className="text-destructive font-bold">✕</span>Incompatibility with your own systems due to failure to review tool requirements</li>
                <li className="flex gap-3"><span className="text-destructive font-bold">✕</span>Requests made more than 7 days after purchase (unless an ongoing technical issue exists)</li>
                <li className="flex gap-3"><span className="text-destructive font-bold">✕</span>Tools that have been customized or significantly modified by the buyer</li>
                <li className="flex gap-3"><span className="text-destructive font-bold">✕</span>Violation of our Terms of Service</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold tracking-tight mb-3">3. Custom Software Build Projects</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Custom builds involve significant upfront planning and development effort. The following policy applies:
              </p>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex gap-3"><span className="text-primary font-bold mt-0.5">→</span><span><strong className="text-foreground">Before Work Begins:</strong> 100% of any deposit paid is refundable if the project is cancelled before we start development.</span></li>
                <li className="flex gap-3"><span className="text-primary font-bold mt-0.5">→</span><span><strong className="text-foreground">After Work Has Started:</strong> Deposits are non-refundable once active development has commenced, as they compensate for time and resources already invested.</span></li>
                <li className="flex gap-3"><span className="text-primary font-bold mt-0.5">→</span><span><strong className="text-foreground">Final Payments:</strong> Final milestone payments are non-refundable once the deliverable has been handed over and accepted.</span></li>
                <li className="flex gap-3"><span className="text-primary font-bold mt-0.5">→</span><span><strong className="text-foreground">Disputes:</strong> If you believe delivered work does not meet the agreed specifications, contact us within 7 days of delivery and we will work toward a resolution.</span></li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold tracking-tight mb-3">4. Waitlist</h2>
              <p className="text-muted-foreground leading-relaxed">
                Joining a waitlist is free and carries no financial commitment. No payment is collected until a tool becomes available and you choose to purchase it.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold tracking-tight mb-3">5. How to Request a Refund</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                To request a refund, please email us with the following information:
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex gap-3"><span className="text-primary font-bold">→</span>Your name and email address used for purchase</li>
                <li className="flex gap-3"><span className="text-primary font-bold">→</span>The tool or service purchased</li>
                <li className="flex gap-3"><span className="text-primary font-bold">→</span>Order or transaction ID (if available)</li>
                <li className="flex gap-3"><span className="text-primary font-bold">→</span>A clear description of the issue or reason for the refund request</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                We aim to respond to all refund requests within <strong>2 business days</strong>. Approved refunds are typically processed within <strong>5–10 business days</strong> depending on your payment provider.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold tracking-tight mb-3">6. Contact Us</h2>
              <p className="text-muted-foreground leading-relaxed">
                For refund requests or billing questions, please reach out:
              </p>
              <div className="mt-4 bg-muted/30 rounded-2xl p-6 border border-border/50">
                <p className="font-bold text-foreground">Tools4Biz</p>
                <p className="text-muted-foreground mt-1">Email: <a href="mailto:hello@tools4biz.com" className="text-primary hover:underline">hello@tools4biz.com</a></p>
                <p className="text-muted-foreground">Website: <a href="https://tools4biz.com" className="text-primary hover:underline">tools4biz.com</a></p>
              </div>
            </section>

          </div>
        </div>
      </div>
    </>
  );
}
