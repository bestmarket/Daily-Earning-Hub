import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Menu, X, Sparkles, Wrench, Package, Info, ChevronDown } from "lucide-react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [location, navigate] = useLocation();
  const isHome = location === "/";

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    setMobileMenuOpen(false);
    if (!isHome) {
      navigate("/");
      setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }), 300);
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-md border-b border-[#E5E7EB] shadow-sm py-3"
          : "bg-white/80 backdrop-blur-sm py-5"
      }`}
    >
      <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 z-50">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#6366F1] flex items-center justify-center shadow-lg shadow-purple-200">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight text-[#111827]">DevStudio</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          {[
            { label: "Solutions", id: "solutions" },
            { label: "Pricing", id: "pricing" },
            { label: "Process", id: "process" },
            { label: "FAQ", id: "faq" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => scrollTo(item.id)}
              className="text-sm font-medium text-[#6B7280] hover:text-[#7C3AED] transition-colors"
            >
              {item.label}
            </button>
          ))}

          <Link
            href="/software"
            className="flex items-center gap-1.5 text-sm font-semibold text-[#6B7280] hover:text-[#7C3AED] transition-colors"
          >
            <Package className="w-3.5 h-3.5" />
            Software
          </Link>

          <Link
            href="/free-tools"
            className="flex items-center gap-1.5 text-sm font-semibold text-[#7C3AED] bg-purple-50 border border-purple-200 px-3 py-1.5 rounded-full hover:bg-purple-100 transition-colors"
          >
            <Wrench className="w-3.5 h-3.5" />
            Free Tools
          </Link>

          <Link
            href="/about"
            className="flex items-center gap-1.5 text-sm font-medium text-[#6B7280] hover:text-[#7C3AED] transition-colors"
          >
            <Info className="w-3.5 h-3.5" />
            About
          </Link>
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <Link href="/custom-request">
            <Button variant="outline" size="sm" className="font-semibold rounded-full border-[#7C3AED]/30 text-[#7C3AED] hover:bg-purple-50">
              Custom Request
            </Button>
          </Link>
          <Button
            onClick={() => window.dispatchEvent(new CustomEvent("open-lead-magnet"))}
            className="btn-premium text-white font-semibold"
          >
            Start My Project
          </Button>
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden p-2 z-50 text-[#111827]" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-white z-40 flex flex-col overflow-y-auto">
          <div className="h-16 flex-shrink-0" />
          <div className="flex flex-col items-center justify-center flex-1 gap-5 py-10 px-6">
            {[
              { label: "Solutions", id: "solutions" },
              { label: "Pricing", id: "pricing" },
              { label: "Process", id: "process" },
              { label: "FAQ", id: "faq" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className="text-2xl font-semibold text-[#111827] hover:text-[#7C3AED] transition-colors"
              >
                {item.label}
              </button>
            ))}

            <Link
              href="/software"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 text-2xl font-semibold text-[#111827] hover:text-[#7C3AED] transition-colors"
            >
              <Package className="w-6 h-6" />
              Software
            </Link>

            <Link
              href="/free-tools"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 text-xl font-semibold text-[#7C3AED] bg-purple-50 border border-purple-200 px-5 py-2.5 rounded-full"
            >
              <Wrench className="w-5 h-5" />
              Free Tools
            </Link>

            <Link
              href="/about"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 text-xl font-semibold text-[#6B7280] hover:text-[#7C3AED] transition-colors"
            >
              <Info className="w-5 h-5" />
              About
            </Link>

            <Link
              href="/custom-request"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full max-w-xs"
            >
              <Button variant="outline" size="lg" className="w-full font-bold rounded-full border-[#7C3AED]/30 text-[#7C3AED]">
                Custom Request
              </Button>
            </Link>

            <Button
              size="lg"
              className="btn-premium text-white mt-2 px-10 h-14 text-base w-full max-w-xs"
              onClick={() => {
                setMobileMenuOpen(false);
                window.dispatchEvent(new CustomEvent("open-lead-magnet"));
              }}
            >
              Start My Project
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
