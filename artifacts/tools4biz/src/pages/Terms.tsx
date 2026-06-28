import { Link } from "wouter";
import { ChevronLeft } from "lucide-react";
import SeoHead from "@/components/SeoHead";

export default function Terms() {
  return (
    <>
      <SeoHead
        title="Terms of Service | Tools4Biz"
        description="Read the Terms of Service for Tools4Biz. By using our platform and purchasing our business software tools, you agree to these terms."
        keywords="terms of service, terms and conditions, Tools4Biz, software license"
        canonicalPath="/terms"
      />
      <div className="flex-1 w-full bg-background animate-in fade-in duration-500">
        <div className="bg-muted/10 border-b border-border/40 py-12 px-4">
          <div className="container mx-auto max-w-3xl">
            <Link href="/" className="inline-flex items-center text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors mb-6 group">
              <ChevronLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />
              Back to Home
            </Link>
            <h1 className="text-4xl font-extrabold tracking-tight mb-3">Terms of Service</h1>
            <p className="text-muted-foreground font-medium">Last updated: June 27, 2026</p>
          </div>
        </div>

        <div className="container mx-auto max-w-3xl px-4 py-12">
          <div className="prose prose-lg max-w-none space-y-10">

            <section>
              <h2 className="text-2xl font-bold tracking-tight mb-3">1. Acceptance of Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                By accessing or using the Tools4Biz website (tools4biz.com) or purchasing any of our software products, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services. These terms apply to all visitors, customers, and users of Tools4Biz.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold tracking-tight mb-3">2. Products & Services</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Tools4Biz offers a marketplace of premium, AI-built software tools designed for business growth. Our offerings include:
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex gap-3"><span className="text-primary font-bold">→</span><strong className="text-foreground">Ready-to-use software tools</strong> — licensed for immediate deployment in your business.</li>
                <li className="flex gap-3"><span className="text-primary font-bold">→</span><strong className="text-foreground">Custom software builds</strong> — bespoke development services tailored to your specifications.</li>
                <li className="flex gap-3"><span className="text-primary font-bold">→</span><strong className="text-foreground">Waitlist access</strong> — early access registration for upcoming tools.</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                All tools are sold with a <strong>one-time payment for lifetime access</strong> unless explicitly stated otherwise on the product page.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold tracking-tight mb-3">3. License Grant</h2>
              <p className="text-muted-foreground leading-relaxed">
                Upon purchase, Tools4Biz grants you a non-exclusive, non-transferable, revocable license to use the purchased software tool for your personal or business use. You may not resell, sublicense, redistribute, or claim ownership of the underlying software. The license is for a single business entity unless a multi-license is explicitly purchased.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold tracking-tight mb-3">4. Custom Software Requests</h2>
              <p className="text-muted-foreground leading-relaxed">
                Custom software requests are subject to a separate agreement and statement of work issued after initial consultation. Submitting a custom request form does not constitute a binding contract. Work begins only after payment of the agreed deposit. Ownership of custom-built software is transferred to the client only upon full payment as specified in the project agreement.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold tracking-tight mb-3">5. Payments</h2>
              <p className="text-muted-foreground leading-relaxed">
                All payments are processed securely through Stripe or Paystack. Prices are listed in USD unless otherwise stated. By making a purchase, you authorize us to charge your selected payment method. All sales are final unless otherwise specified in our Refund Policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold tracking-tight mb-3">6. Intellectual Property</h2>
              <p className="text-muted-foreground leading-relaxed">
                All content on the Tools4Biz website — including text, graphics, logos, product designs, and software — is the intellectual property of Tools4Biz and is protected by applicable copyright and trademark laws. You may not copy, modify, distribute, or create derivative works without our prior written consent.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold tracking-tight mb-3">7. Prohibited Uses</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">You agree not to:</p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex gap-3"><span className="text-destructive font-bold">✕</span>Use our tools for illegal, fraudulent, or malicious activities</li>
                <li className="flex gap-3"><span className="text-destructive font-bold">✕</span>Reverse-engineer, decompile, or disassemble any software</li>
                <li className="flex gap-3"><span className="text-destructive font-bold">✕</span>Resell or redistribute purchased tools without written permission</li>
                <li className="flex gap-3"><span className="text-destructive font-bold">✕</span>Attempt to gain unauthorized access to our systems</li>
                <li className="flex gap-3"><span className="text-destructive font-bold">✕</span>Misrepresent your identity or business when submitting requests</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold tracking-tight mb-3">8. Disclaimer of Warranties</h2>
              <p className="text-muted-foreground leading-relaxed">
                Tools4Biz software tools are provided "as is" and "as available" without warranties of any kind, either express or implied. We do not warrant that the tools will be error-free, uninterrupted, or suitable for your specific business needs. Results from use of our tools will vary based on individual business circumstances.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold tracking-tight mb-3">9. Limitation of Liability</h2>
              <p className="text-muted-foreground leading-relaxed">
                To the fullest extent permitted by law, Tools4Biz shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of our services. Our total liability to you for any claim shall not exceed the amount you paid for the specific product or service giving rise to the claim.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold tracking-tight mb-3">10. Governing Law</h2>
              <p className="text-muted-foreground leading-relaxed">
                These Terms of Service shall be governed by and construed in accordance with applicable law. Any disputes arising from these terms shall first be attempted to be resolved through good-faith negotiation, and thereafter through binding arbitration or the relevant courts of jurisdiction.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold tracking-tight mb-3">11. Changes to Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                We reserve the right to modify these Terms of Service at any time. Updates will be posted on this page with a revised "Last updated" date. Continued use of our services after changes constitutes acceptance of the updated terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold tracking-tight mb-3">12. Contact</h2>
              <p className="text-muted-foreground leading-relaxed">
                For questions about these Terms of Service, please contact:
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
