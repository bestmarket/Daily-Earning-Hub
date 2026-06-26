import { Link } from "wouter";
import { MessageCircle, Mail, Twitter, Linkedin, Github } from "lucide-react";

export default function Footer() {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <footer className="border-t border-border/40 bg-card/20 backdrop-blur-sm relative z-10">
      <div className="container mx-auto px-4 md:px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <span className="text-white font-bold text-xl">D</span>
              </div>
              <span className="font-bold text-xl tracking-tight">DevStudio</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6">
              We build custom web apps that help businesses get more customers, save time, and increase revenue.
            </p>
            <div className="flex items-center gap-3">
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-lg border border-border/50 flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/50 transition-all" aria-label="Twitter">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-lg border border-border/50 flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/50 transition-all" aria-label="LinkedIn">
                <Linkedin className="w-4 h-4" />
              </a>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-lg border border-border/50 flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/50 transition-all" aria-label="GitHub">
                <Github className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-semibold text-sm mb-5">Services</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              {["Booking Systems", "Customer Portals", "AI Assistants", "SaaS Development", "Membership Platforms", "CRM Dashboards"].map((s) => (
                <li key={s}>
                  <button
                    onClick={() => scrollTo("solutions")}
                    className="hover:text-foreground transition-colors text-left"
                  >
                    {s}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold text-sm mb-5">Company</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              {[
                { label: "How It Works", id: "process" },
                { label: "Pricing", id: "pricing" },
                { label: "Featured Projects", id: "solutions" },
                { label: "FAQ", id: "faq" },
              ].map((item) => (
                <li key={item.label}>
                  <button
                    onClick={() => scrollTo(item.id)}
                    className="hover:text-foreground transition-colors text-left"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-sm mb-5">Contact</h4>
            <ul className="space-y-4 text-sm text-muted-foreground">
              <li>
                <a
                  href="https://wa.me/15550000000"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 hover:text-green-400 transition-colors"
                  data-testid="link-footer-whatsapp"
                >
                  <MessageCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-foreground">WhatsApp</div>
                    <div className="text-xs">+1 (555) 000-0000</div>
                  </div>
                </a>
              </li>
              <li>
                <a
                  href="mailto:hello@devstudio.com"
                  className="flex items-center gap-3 hover:text-primary transition-colors"
                  data-testid="link-footer-email"
                >
                  <Mail className="w-4 h-4 text-primary flex-shrink-0" />
                  <div>
                    <div className="font-medium text-foreground">Email</div>
                    <div className="text-xs">hello@devstudio.com</div>
                  </div>
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border/40 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <span>© {new Date().getFullYear()} DevStudio. All rights reserved.</span>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
