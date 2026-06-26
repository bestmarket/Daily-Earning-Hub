import { ReactNode } from "react";
import { Link } from "wouter";
import { useGetWaitlistCount } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";

export default function Layout({ children }: { children: ReactNode }) {
  const { data: waitlistData } = useGetWaitlistCount();

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
        <div className="container mx-auto px-4 md:px-6 py-12 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col items-center md:items-start gap-2">
            <Link href="/" className="flex items-center gap-2" data-testid="link-footer-home">
              <div className="w-6 h-6 rounded bg-primary flex items-center justify-center text-white font-bold text-xs">
                T
              </div>
              <span className="font-bold text-lg tracking-tight">Tools4Biz</span>
            </Link>
            <p className="text-sm text-muted-foreground text-center md:text-left max-w-sm">
              Premium AI-built software tools curated for ambitious businesses. Built by an indie hacker.
            </p>
          </div>
          <div className="flex gap-6 text-sm font-medium">
            <Link href="/tools" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-footer-tools">Catalog</Link>
            <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-footer-about">About</Link>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">X (Twitter)</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
