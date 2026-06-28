import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Mail, Github, Twitter, MapPin, ArrowRight } from "lucide-react";
import SeoHead from "@/components/SeoHead";

export default function About() {
  return (
    <>
      <SeoHead
        title="About DevStudio — Custom Web Apps Agency"
        description="DevStudio is a custom web app agency dedicated to building focused, high-performance software for businesses. No bloat, no enterprise pricing. Direct access to the developer who built it."
        keywords="about devstudio, custom web agency, business software developer, indie agency"
        canonicalPath="/about"
      />
      <div className="min-h-screen bg-background pt-24 pb-16 px-4">
        <div className="max-w-3xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <div className="w-24 h-24 bg-gradient-to-br from-[#7C3AED] to-[#6366F1] rounded-full mx-auto shadow-xl shadow-purple-200 mb-6 flex items-center justify-center overflow-hidden border-4 border-background">
              <span className="text-3xl text-white font-extrabold">D</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">The Builder Behind DevStudio</h1>
            <p className="text-xl text-muted-foreground font-medium max-w-2xl mx-auto">
              A custom web app agency dedicated to building un-bloated, highly effective software for serious businesses.
            </p>
          </div>

          <div className="prose prose-lg mx-auto font-medium text-muted-foreground leading-relaxed bg-card p-8 rounded-3xl border border-border/50 shadow-sm">
            <p>
              After years of watching small businesses get fleeced by enterprise SaaS contracts for features they never use, DevStudio was founded to build tailored alternatives.
            </p>
            <p>
              Every project is built with a single philosophy: <strong>do one thing exceptionally well, make it blazing fast, and charge a fair, transparent price.</strong>
            </p>
            <p>
              When you work with us, you aren't paying for a massive marketing team or fancy office space. You're paying for raw utility and direct access to the developers who built it.
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

            <a href="mailto:hello@devstudio.com" className="bg-muted/30 p-6 rounded-2xl flex items-center gap-4 border border-border/50 hover:bg-muted/50 transition-colors cursor-pointer group">
              <div className="w-12 h-12 bg-background rounded-full flex items-center justify-center shadow-sm shrink-0 group-hover:scale-110 transition-transform">
                <Mail className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h4 className="font-bold text-foreground">Contact</h4>
                <p className="text-sm font-medium text-muted-foreground">hello@devstudio.com</p>
              </div>
            </a>

            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="bg-muted/30 p-6 rounded-2xl flex items-center gap-4 border border-border/50 hover:bg-muted/50 transition-colors cursor-pointer group">
              <div className="w-12 h-12 bg-background rounded-full flex items-center justify-center shadow-sm shrink-0 group-hover:scale-110 transition-transform">
                <Twitter className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h4 className="font-bold text-foreground">Twitter</h4>
                <p className="text-sm font-medium text-muted-foreground">@devstudio</p>
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

          <div className="text-center pt-4">
            <Link href="/custom-request">
              <Button size="lg" className="btn-premium text-white font-bold px-10 h-13 rounded-full gap-2">
                Start a Custom Project <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
