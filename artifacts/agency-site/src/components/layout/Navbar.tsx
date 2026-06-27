import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Menu, X, Sparkles, Wrench } from "lucide-react";

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
        <nav className="hidden md:flex items-center gap-7">
          {[
            { label: "Home", id: "home" },
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

          {/* Free Tools link — highlighted */}
          <Link
            href="/free-tools"
            className="flex items-center gap-1.5 text-sm font-semibold text-[#7C3AED] bg-purple-50 border border-purple-200 px-3 py-1.5 rounded-full hover:bg-purple-100 transition-colors"
          >
            <Wrench className="w-3.5 h-3.5" />
            Free Tools
          </Link>
        </nav>

        <div className="hidden md:flex items-center gap-3">
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

      {/* Mobile Menu */}
      <div
        className={`md:hidden fixed inset-0 bg-white z-40 transition-transform duration-300 flex flex-col items-center justify-center gap-5 ${
          mobileMenuOpen ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        {[
          { label: "Home", id: "home" },
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
          href="/free-tools"
          onClick={() => setMobileMenuOpen(false)}
          className="flex items-center gap-2 text-xl font-semibold text-[#7C3AED]"
        >
          <Wrench className="w-5 h-5" />
          Free Tools
        </Link>

        <Button
          size="lg"
          className="btn-premium text-white mt-2 px-8"
          onClick={() => {
            setMobileMenuOpen(false);
            window.dispatchEvent(new CustomEvent("open-lead-magnet"));
          }}
        >
          Start My Project
        </Button>
      </div>
    </header>
  );
}
