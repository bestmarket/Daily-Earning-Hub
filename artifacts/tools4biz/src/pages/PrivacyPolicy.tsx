import { Link } from "wouter";
import { ChevronLeft } from "lucide-react";
import SeoHead from "@/components/SeoHead";

export default function PrivacyPolicy() {
  return (
    <>
      <SeoHead
        title="Privacy Policy | Tools4Biz"
        description="Learn how Tools4Biz collects, uses, and protects your personal data. We are committed to transparency and your privacy."
        keywords="privacy policy, data protection, Tools4Biz, personal data"
        canonicalPath="/privacy-policy"
      />
      <div className="flex-1 w-full bg-background animate-in fade-in duration-500">
        <div className="bg-muted/10 border-b border-border/40 py-12 px-4">
          <div className="container mx-auto max-w-3xl">
            <Link href="/" className="inline-flex items-center text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors mb-6 group">
              <ChevronLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />
              Back to Home
            </Link>
            <h1 className="text-4xl font-extrabold tracking-tight mb-3">Privacy Policy</h1>
            <p className="text-muted-foreground font-medium">Last updated: June 27, 2026</p>
          </div>
        </div>

        <div className="container mx-auto max-w-3xl px-4 py-12">
          <div className="prose prose-lg max-w-none space-y-10">

            <section>
              <h2 className="text-2xl font-bold tracking-tight mb-3">1. Introduction</h2>
              <p className="text-muted-foreground leading-relaxed">
                Welcome to <strong>Tools4Biz</strong> ("we," "our," or "us"). We operate the website at tools4biz.com and provide a curated marketplace of business software tools for entrepreneurs and indie businesses. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or purchase our products. Please read this policy carefully.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold tracking-tight mb-3">2. Information We Collect</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">We may collect the following types of information:</p>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex gap-3"><span className="text-primary font-bold mt-0.5">→</span><span><strong className="text-foreground">Contact Information:</strong> Name, email address, and WhatsApp number when you submit a custom software request or join our waitlist.</span></li>
                <li className="flex gap-3"><span className="text-primary font-bold mt-0.5">→</span><span><strong className="text-foreground">Business Information:</strong> Business type, budget range, and project description provided through our Custom Request form.</span></li>
                <li className="flex gap-3"><span className="text-primary font-bold mt-0.5">→</span><span><strong className="text-foreground">Transaction Data:</strong> Payment-related information processed securely through Stripe or Paystack. We do not store full card numbers or banking credentials on our servers.</span></li>
                <li className="flex gap-3"><span className="text-primary font-bold mt-0.5">→</span><span><strong className="text-foreground">Usage Data:</strong> Browsing behavior, pages visited, time on site, and referring URLs collected via standard server logs or analytics tools.</span></li>
                <li className="flex gap-3"><span className="text-primary font-bold mt-0.5">→</span><span><strong className="text-foreground">Device Information:</strong> Browser type, IP address, operating system, and device identifiers.</span></li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold tracking-tight mb-3">3. How We Use Your Information</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">We use your information to:</p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex gap-3"><span className="text-primary font-bold">→</span>Process and fulfill your software tool purchases</li>
                <li className="flex gap-3"><span className="text-primary font-bold">→</span>Respond to custom software build requests and quotes</li>
                <li className="flex gap-3"><span className="text-primary font-bold">→</span>Send you waitlist notifications when tools become available</li>
                <li className="flex gap-3"><span className="text-primary font-bold">→</span>Send transactional and service-related communications</li>
                <li className="flex gap-3"><span className="text-primary font-bold">→</span>Improve our website, tools, and services</li>
                <li className="flex gap-3"><span className="text-primary font-bold">→</span>Comply with legal obligations and resolve disputes</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold tracking-tight mb-3">4. Sharing Your Information</h2>
              <p className="text-muted-foreground leading-relaxed">
                We do <strong>not</strong> sell, trade, or rent your personal information to third parties. We may share your data with trusted third-party service providers who help us operate our business (e.g., payment processors like Stripe and Paystack, email service providers), solely for the purpose of providing those services. All third parties are required to maintain the confidentiality and security of your information.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold tracking-tight mb-3">5. Cookies & Tracking</h2>
              <p className="text-muted-foreground leading-relaxed">
                Our website may use cookies and similar tracking technologies to enhance your browsing experience, remember preferences, and analyze site traffic. You can control cookie settings through your browser. Disabling cookies may affect some functionality of the site.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold tracking-tight mb-3">6. Data Security</h2>
              <p className="text-muted-foreground leading-relaxed">
                We implement appropriate technical and organizational security measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction. However, no method of internet transmission or electronic storage is 100% secure, and we cannot guarantee absolute security.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold tracking-tight mb-3">7. Data Retention</h2>
              <p className="text-muted-foreground leading-relaxed">
                We retain your personal information only as long as necessary to fulfill the purposes outlined in this policy, comply with legal obligations, resolve disputes, and enforce our agreements. Waitlist and custom request data is typically retained for up to 2 years unless you request deletion sooner.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold tracking-tight mb-3">8. Your Rights</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">Depending on your location, you may have the right to:</p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex gap-3"><span className="text-primary font-bold">→</span>Access the personal data we hold about you</li>
                <li className="flex gap-3"><span className="text-primary font-bold">→</span>Request correction of inaccurate data</li>
                <li className="flex gap-3"><span className="text-primary font-bold">→</span>Request deletion of your personal data</li>
                <li className="flex gap-3"><span className="text-primary font-bold">→</span>Withdraw consent for data processing at any time</li>
                <li className="flex gap-3"><span className="text-primary font-bold">→</span>Lodge a complaint with a data protection authority</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                To exercise any of these rights, please contact us at the email address below.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold tracking-tight mb-3">9. Children's Privacy</h2>
              <p className="text-muted-foreground leading-relaxed">
                Tools4Biz is not directed at individuals under the age of 16. We do not knowingly collect personal information from children. If you believe a child has provided us with personal data, please contact us and we will promptly delete it.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold tracking-tight mb-3">10. Changes to This Policy</h2>
              <p className="text-muted-foreground leading-relaxed">
                We reserve the right to update this Privacy Policy at any time. When we make changes, we will update the "Last updated" date at the top of this page. Continued use of our services after any changes constitutes your acceptance of the updated policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold tracking-tight mb-3">11. Contact Us</h2>
              <p className="text-muted-foreground leading-relaxed">
                If you have any questions or concerns about this Privacy Policy, please contact us at:
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
