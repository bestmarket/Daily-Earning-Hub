import { Link } from "wouter";
import { ChevronLeft } from "lucide-react";
import SeoHead from "@/components/SeoHead";

export default function Terms() {
  return (
    <>
      <SeoHead
        title="Terms of Service | DevStudio"
        description="Read the Terms of Service for DevStudio. By using our platform and services, you agree to these terms."
        keywords="terms of service, terms and conditions, DevStudio"
        canonicalPath="/terms"
      />
      <div className="min-h-screen bg-background pt-16">
        <div className="bg-muted/10 border-b border-border/40 py-12 px-4">
          <div className="container mx-auto max-w-3xl">
            <Link href="/" className="inline-flex items-center text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors mb-6 group">
              <ChevronLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />
              Back to Home
            </Link>
            <h1 className="text-4xl font-extrabold tracking-tight mb-3">Terms of Service</h1>
            <p className="text-muted-foreground font-medium">Last updated: June 28, 2026</p>
          </div>
        </div>

        <div className="container mx-auto max-w-3xl px-4 py-12">
          <div className="prose prose-lg max-w-none space-y-10">
            <section>
              <h2 className="text-2xl font-bold tracking-tight mb-3">1. Acceptance of Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                By accessing or using the DevStudio website or purchasing any of our software products or services, you agree to be bound by these Terms of Service. If you do not agree, please do not use our services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold tracking-tight mb-3">2. Products & Services</h2>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex gap-3"><span className="text-primary font-bold">→</span><strong className="text-foreground">Custom web app development</strong> — bespoke development services tailored to your specifications.</li>
                <li className="flex gap-3"><span className="text-primary font-bold">→</span><strong className="text-foreground">Ready-to-use software tools</strong> — licensed for immediate deployment in your business.</li>
                <li className="flex gap-3"><span className="text-primary font-bold">→</span><strong className="text-foreground">Free tools</strong> — provided as-is at no cost for business insights and analysis.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold tracking-tight mb-3">3. Custom Software Requests</h2>
              <p className="text-muted-foreground leading-relaxed">
                Custom software requests are subject to a separate agreement issued after initial consultation. Submitting a request form does not constitute a binding contract. Work begins only after payment of the agreed deposit. Ownership of custom-built software is transferred to the client only upon full payment.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold tracking-tight mb-3">4. Payments</h2>
              <p className="text-muted-foreground leading-relaxed">
                All payments are processed securely through Stripe or PayPal. Prices are listed in USD unless otherwise stated. All sales are final unless otherwise specified in our Refund Policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold tracking-tight mb-3">5. Intellectual Property</h2>
              <p className="text-muted-foreground leading-relaxed">
                All content on the DevStudio website — including text, graphics, logos, product designs, and software — is the intellectual property of DevStudio and is protected by applicable copyright and trademark laws.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold tracking-tight mb-3">6. Prohibited Uses</h2>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex gap-3"><span className="text-destructive font-bold">✕</span>Use our tools for illegal, fraudulent, or malicious activities</li>
                <li className="flex gap-3"><span className="text-destructive font-bold">✕</span>Reverse-engineer, decompile, or disassemble any software</li>
                <li className="flex gap-3"><span className="text-destructive font-bold">✕</span>Resell or redistribute purchased tools without written permission</li>
                <li className="flex gap-3"><span className="text-destructive font-bold">✕</span>Attempt to gain unauthorized access to our systems</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold tracking-tight mb-3">7. Limitation of Liability</h2>
              <p className="text-muted-foreground leading-relaxed">
                To the fullest extent permitted by law, DevStudio shall not be liable for any indirect, incidental, or consequential damages arising from your use of our services. Our total liability shall not exceed the amount you paid for the specific product giving rise to the claim.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold tracking-tight mb-3">8. Contact</h2>
              <div className="mt-4 bg-muted/30 rounded-2xl p-6 border border-border/50">
                <p className="font-bold text-foreground">DevStudio</p>
                <p className="text-muted-foreground mt-1">Email: <a href="mailto:hello@devstudio.com" className="text-primary hover:underline">hello@devstudio.com</a></p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
