import { Button } from "@/components/ui/button";
import { Mail, Github, Twitter, MapPin } from "lucide-react";
import SeoHead from "@/components/SeoHead";

export default function About() {
  return (
    <>
      <SeoHead
        title="About Tools4Biz — The Builder Behind the Software"
        description="Tools4Biz is a one-person indie lab building focused, high-performance business software. No bloat, no enterprise pricing. Direct access to the developer who built it."
        keywords="about tools4biz, indie developer, business software maker, indie SaaS"
        canonicalPath="/about"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "AboutPage",
          "name": "About Tools4Biz",
          "description": "One-person indie lab dedicated to building un-bloated, effective software for serious businesses.",
          "url": "https://tools4biz.com/about"
        }}
      />
    <div className="flex-1 w-full bg-background animate-in fade-in duration-500 py-16 px-4">
      <div className="max-w-3xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <div className="w-24 h-24 bg-primary rounded-full mx-auto shadow-xl shadow-primary/20 mb-6 flex items-center justify-center overflow-hidden border-4 border-background">
             <div className="text-3xl text-white font-extrabold">T</div>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">The Builder Behind the Tools</h1>
          <p className="text-xl text-muted-foreground font-medium max-w-2xl mx-auto">
            Tools4Biz is a one-person indie lab dedicated to building un-bloated, highly effective software for serious businesses.
          </p>
        </div>

        <div className="prose prose-lg dark:prose-invert mx-auto font-medium text-muted-foreground leading-relaxed bg-card p-8 rounded-3xl border border-border/50 shadow-sm">
          <p>
            Hey, I'm the founder of Tools4Biz. After years of watching small businesses get fleeced by enterprise SaaS contracts for features they never use, I decided to build alternatives.
          </p>
          <p>
            Every tool on this platform is built with a single philosophy: <strong>do one thing exceptionally well, make it blazing fast, and charge a fair, transparent price.</strong>
          </p>
          <p>
            When you buy a tool here, you aren't paying for a massive marketing team or fancy office space. You're paying for raw utility and direct access to the developer who built it.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-6 pt-8 border-t border-border/40">
          <div className="bg-muted/30 p-6 rounded-2xl flex items-center gap-4 border border-border/50 hover:bg-muted/50 transition-colors">
            <div className="w-12 h-12 bg-background rounded-full flex items-center justify-center shadow-sm shrink-0">
              <MapPin className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-bold text-foreground">Location</h4>
              <p className="text-sm font-medium text-muted-foreground">Worldwide & Remote</p>
            </div>
          </div>
          
          <a href="mailto:hello@tools4biz.com" className="bg-muted/30 p-6 rounded-2xl flex items-center gap-4 border border-border/50 hover:bg-muted/50 transition-colors cursor-pointer group">
            <div className="w-12 h-12 bg-background rounded-full flex items-center justify-center shadow-sm shrink-0 group-hover:scale-110 transition-transform">
              <Mail className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-bold text-foreground">Contact</h4>
              <p className="text-sm font-medium text-muted-foreground">hello@tools4biz.com</p>
            </div>
          </a>

          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="bg-muted/30 p-6 rounded-2xl flex items-center gap-4 border border-border/50 hover:bg-muted/50 transition-colors cursor-pointer group">
            <div className="w-12 h-12 bg-background rounded-full flex items-center justify-center shadow-sm shrink-0 group-hover:scale-110 transition-transform">
              <Twitter className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-bold text-foreground">Twitter</h4>
              <p className="text-sm font-medium text-muted-foreground">@tools4biz</p>
            </div>
          </a>

          <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="bg-muted/30 p-6 rounded-2xl flex items-center gap-4 border border-border/50 hover:bg-muted/50 transition-colors cursor-pointer group">
            <div className="w-12 h-12 bg-background rounded-full flex items-center justify-center shadow-sm shrink-0 group-hover:scale-110 transition-transform">
              <Github className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-bold text-foreground">GitHub</h4>
              <p className="text-sm font-medium text-muted-foreground">Open Source Labs</p>
            </div>
          </a>
        </div>
      </div>
    </div>
    </>
  );
}
