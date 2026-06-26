import { Link } from "wouter";
import { MessageCircle, Mail, Twitter, Linkedin, Github, Sparkles } from "lucide-react";

export default function Footer() {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <footer className="border-t border-[#E5E7EB] bg-[#111827] text-white">
      <div className="container mx-auto px-4 md:px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#6366F1] flex items-center justify-center shadow-lg shadow-purple-900/40">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-xl tracking-tight text-white">DevStudio</span>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed mb-6">
              We build custom web apps that help businesses get more customers, save time, and increase revenue.
            </p>
            <div className="flex items-center gap-3">
              {[
                { href: "https://twitter.com", Icon: Twitter, label: "Twitter" },
                { href: "https://linkedin.com", Icon: Linkedin, label: "LinkedIn" },
                { href: "https://github.com", Icon: Github, label: "GitHub" },
              ].map(({ href, Icon, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-9 h-9 rounded-lg border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:border-[#7C3AED]/60 hover:bg-[#7C3AED]/20 transition-all"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-semibold text-sm mb-5 text-white">Services</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              {["Booking Systems", "Customer Portals", "AI Assistants", "SaaS Development", "Membership Platforms", "CRM Dashboards"].map((s) => (
                <li key={s}>
                  <button onClick={() => scrollTo("solutions")} className="hover:text-[#8B5CF6] transition-colors text-left">
                    {s}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold text-sm mb-5 text-white">Company</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              {[
                { label: "How It Works", id: "process" },
                { label: "Pricing", id: "pricing" },
                { label: "Case Studies", id: "solutions" },
                { label: "FAQ", id: "faq" },
              ].map((item) => (
                <li key={item.label}>
                  <button onClick={() => scrollTo(item.id)} className="hover:text-[#8B5CF6] transition-colors text-left">
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-sm mb-5 text-white">Contact</h4>
            <ul className="space-y-4 text-sm text-gray-400">
              <li>
                <a href="https://wa.me/15550000000" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:text-green-400 transition-colors">
                  <MessageCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-white text-xs">WhatsApp</div>
                    <div className="text-xs">+1 (555) 000-0000</div>
                  </div>
                </a>
              </li>
              <li>
                <a href="mailto:hello@devstudio.com" className="flex items-center gap-3 hover:text-[#8B5CF6] transition-colors">
                  <Mail className="w-4 h-4 text-[#8B5CF6] flex-shrink-0" />
                  <div>
                    <div className="font-medium text-white text-xs">Email</div>
                    <div className="text-xs">hello@devstudio.com</div>
                  </div>
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <span>© {new Date().getFullYear()} DevStudio. All rights reserved.</span>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-gray-300 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-gray-300 transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
