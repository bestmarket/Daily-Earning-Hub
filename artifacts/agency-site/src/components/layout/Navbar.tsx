import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? "bg-background/80 backdrop-blur-md border-b border-border shadow-sm py-3"
          : "bg-transparent py-5"
      }`}
    >
      <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 z-50">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <span className="text-white font-bold text-xl">D</span>
          </div>
          <span className="font-bold text-xl tracking-tight">DevStudio</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          <button onClick={() => scrollTo("home")} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Home</button>
          <button onClick={() => scrollTo("solutions")} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Solutions</button>
          <button onClick={() => scrollTo("pricing")} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Pricing</button>
          <button onClick={() => scrollTo("process")} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Process</button>
          <button onClick={() => scrollTo("faq")} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">FAQ</button>
        </nav>

        <div className="hidden md:flex items-center gap-4">
          <Button onClick={() => window.dispatchEvent(new CustomEvent('open-lead-magnet'))} className="font-semibold shadow-lg shadow-primary/20">
            Start My Project
          </Button>
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden p-2 z-50"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden fixed inset-0 bg-background/95 backdrop-blur-xl z-40 transition-transform duration-300 flex flex-col items-center justify-center gap-8 ${
          mobileMenuOpen ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <button onClick={() => scrollTo("home")} className="text-2xl font-medium">Home</button>
        <button onClick={() => scrollTo("solutions")} className="text-2xl font-medium">Solutions</button>
        <button onClick={() => scrollTo("pricing")} className="text-2xl font-medium">Pricing</button>
        <button onClick={() => scrollTo("process")} className="text-2xl font-medium">Process</button>
        <button onClick={() => scrollTo("faq")} className="text-2xl font-medium">FAQ</button>
        <Button size="lg" className="mt-4" onClick={() => {
          setMobileMenuOpen(false);
          window.dispatchEvent(new CustomEvent('open-lead-magnet'));
        }}>
          Start My Project
        </Button>
      </div>
    </header>
  );
}
