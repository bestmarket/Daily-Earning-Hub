import { Link } from "wouter";
import { ChevronLeft } from "lucide-react";
import SeoHead from "@/components/SeoHead";

export default function PrivacyPolicy() {
  return (
    <>
      <SeoHead
        title="Privacy Policy | DevStudio"
        description="Learn how DevStudio collects, uses, and protects your personal data. We are committed to transparency and your privacy."
        keywords="privacy policy, data protection, DevStudio"
        canonicalPath="/privacy-policy"
      />
      <div className="min-h-screen bg-background pt-16">
        <div className="bg-muted/10 border-b border-border/40 py-12 px-4">
          <div className="container mx-auto max-w-3xl">
            <Link href="/" className="inline-flex items-center text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors mb-6 group">
              <ChevronLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />
              Back to Home
            </Link>
            <h1 className="text-4xl font-extrabold tracking-tight mb-3">Privacy Policy</h1>
            <p className="text-muted-foreground font-medium">Last updated: June 28, 2026</p>
          </div>
        </div>

        <div className="container mx-auto max-w-3xl px-4 py-12">
          <div className="prose prose-lg max-w-none space-y-10">
            <section>
              <h2 className="text-2xl font-bold tracking-tight mb-3">1. Introduction</h2>
              <p className="text-muted-foreground leading-relaxed">
                Welcome to <strong>DevStudio</strong> ("we," "our," or "us"). We operate the website and provide custom web app development and software tools for businesses. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or purchase our products. Please read this policy carefully.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold tracking-tight mb-3">2. Information We Collect</h2>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex gap-3"><span className="text-primary font-bold mt-0.5">→</span><span><strong className="text-foreground">Contact Information:</strong> Name, email address, and WhatsApp number when you submit a custom software request or join our waitlist.</span></li>
                <li className="flex gap-3"><span className="text-primary font-bold mt-0.5">→</span><span><strong className="text-foreground">Business Information:</strong> Business type, budget range, and project description provided through our Custom Request form.</span></li>
                <li className="flex gap-3"><span className="text-primary font-bold mt-0.5">→</span><span><strong className="text-foreground">Transaction Data:</strong> Payment-related information processed securely through Stripe or PayPal. We do not store full card numbers on our servers.</span></li>
                <li className="flex gap-3"><span className="text-primary font-bold mt-0.5">→</span><span><strong className="text-foreground">Usage Data:</strong> Browsing behavior, pages visited, time on site, and referring URLs.</span></li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold tracking-tight mb-3">3. How We Use Your Information</h2>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex gap-3"><span className="text-primary font-bold">→</span>Process and fulfill your software tool purchases</li>
                <li className="flex gap-3"><span className="text-primary font-bold">→</span>Respond to custom software build requests and quotes</li>
                <li className="flex gap-3"><span className="text-primary font-bold">→</span>Send you waitlist notifications when tools become available</li>
                <li className="flex gap-3"><span className="text-primary font-bold">→</span>Send transactional and service-related communications</li>
                <li className="flex gap-3"><span className="text-primary font-bold">→</span>Improve our website, tools, and services</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold tracking-tight mb-3">4. Sharing Your Information</h2>
              <p className="text-muted-foreground leading-relaxed">
                We do <strong>not</strong> sell, trade, or rent your personal information to third parties. We may share your data with trusted service providers (e.g., payment processors like Stripe and PayPal) solely to provide those services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold tracking-tight mb-3">5. Cookies & Tracking</h2>
              <p className="text-muted-foreground leading-relaxed">
                Our website may use cookies to enhance your browsing experience, remember preferences, and analyze site traffic. You can control cookie settings through your browser.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold tracking-tight mb-3">6. Data Security</h2>
              <p className="text-muted-foreground leading-relaxed">
                We implement appropriate technical and organizational security measures to protect your personal data. However, no method of internet transmission is 100% secure.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold tracking-tight mb-3">7. Your Rights</h2>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex gap-3"><span className="text-primary font-bold">→</span>Access the personal data we hold about you</li>
                <li className="flex gap-3"><span className="text-primary font-bold">→</span>Request correction of inaccurate data</li>
                <li className="flex gap-3"><span className="text-primary font-bold">→</span>Request deletion of your personal data</li>
                <li className="flex gap-3"><span className="text-primary font-bold">→</span>Withdraw consent for data processing at any time</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold tracking-tight mb-3">8. Contact Us</h2>
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
