import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useGetWaitlistCount } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";

export default function Layout({ children }: { children: ReactNode }) {
  const { data: waitlistData } = useGetWaitlistCount();
  const [location] = useLocation();

  if (location.startsWith('/admin')) {
    return <div className="min-h-screen flex flex-col font-sans selection:bg-primary selection:text-white">{children}</div>;
  }

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-primary selection:text-white">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 group" data-testid="link-home">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-lg group-hover:rotate-12 transition-transform duration-300">
                T
              </div>
              <span className="font-bold text-xl tracking-tight hidden sm:inline-block">Tools4Biz</span>
            </Link>
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
              <Link href="/tools" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-tools">
                Catalog
              </Link>
              <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-about">
                About
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full border border-border/50">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              {waitlistData?.count ? `${waitlistData.count} hackers waiting` : "Join the revolution"}
            </div>
            <Link href="/tools" className="inline-block" data-testid="link-nav-cta">
              <Button className="rounded-full shadow-sm hover:shadow-md transition-shadow font-semibold" variant="default">
                Explore Tools
              </Button>
            </Link>
          </div>
        </div>
      </header>
      
      <main className="flex-1 flex flex-col">
        {children}
      </main>

      <footer className="border-t bg-muted/20 mt-auto">
        <div className="container mx-auto px-4 md:px-6 py-12">
          <div className="flex flex-col md:flex-row justify-between items-start gap-10">
            <div className="flex flex-col gap-3 max-w-sm">
              <Link href="/" className="flex items-center gap-2" data-testid="link-footer-home">
                <div className="w-6 h-6 rounded bg-primary flex items-center justify-center text-white font-bold text-xs">
                  T
                </div>
                <span className="font-bold text-lg tracking-tight">Tools4Biz</span>
              </Link>
              <p className="text-sm text-muted-foreground">
                Premium AI-built software tools curated for ambitious businesses. Built by an indie hacker.
              </p>
            </div>

            <div className="flex flex-wrap gap-10 text-sm font-medium">
              <div className="flex flex-col gap-3">
                <p className="font-bold text-foreground text-xs uppercase tracking-widest">Product</p>
                <Link href="/tools" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-footer-tools">All Tools</Link>
                <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-footer-about">About</Link>
                <Link href="/custom-request" className="text-muted-foreground hover:text-foreground transition-colors">Custom Build</Link>
              </div>
              <div className="flex flex-col gap-3">
                <p className="font-bold text-foreground text-xs uppercase tracking-widest">Connect</p>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">X (Twitter)</a>
              </div>
              <div className="flex flex-col gap-3">
                <p className="font-bold text-foreground text-xs uppercase tracking-widest">Legal</p>
                <Link href="/privacy-policy" className="text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</Link>
                <Link href="/terms" className="text-muted-foreground hover:text-foreground transition-colors">Terms of Service</Link>
                <Link href="/refund" className="text-muted-foreground hover:text-foreground transition-colors">Refund Policy</Link>
              </div>
            </div>
          </div>

          <div className="border-t border-border/40 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center gap-3 text-xs text-muted-foreground">
            <p>© {new Date().getFullYear()} Tools4Biz. All rights reserved.</p>
            <div className="flex gap-4">
              <Link href="/privacy-policy" className="hover:text-foreground transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link>
              <Link href="/refund" className="hover:text-foreground transition-colors">Refunds</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
