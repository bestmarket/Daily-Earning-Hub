import { Link } from "wouter";
import { useListTools, useGetToolStats } from "@workspace/api-client-react";
import ToolCard from "@/components/ToolCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, Zap, Code, Shield, Users, Layers, TrendingUp, Rocket } from "lucide-react";
import { useState } from "react";
import ActionModal from "@/components/ActionModal";

export default function Home() {
  const { data: stats, isLoading: statsLoading } = useGetToolStats();
  const { data: tools, isLoading: toolsLoading } = useListTools({ featured: true });
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="flex flex-col w-full min-h-screen animate-in fade-in duration-700">
      {/* Hero Section */}
      <section className="relative pt-24 pb-32 overflow-hidden flex flex-col items-center justify-center text-center px-4 border-b border-border/40">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background -z-10"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary/20 blur-[120px] rounded-full pointer-events-none -z-10"></div>
        
        <div className="max-w-3xl mx-auto z-10 space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 text-accent-foreground border border-accent/20 text-sm font-semibold tracking-wide uppercase shadow-sm mx-auto animate-in slide-in-from-bottom-4 duration-500 fade-in fill-mode-both">
            <Zap className="w-4 h-4 text-accent" /> Premium Indie Software
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-foreground leading-[1.1] animate-in slide-in-from-bottom-6 duration-700 fade-in fill-mode-both delay-150">
            Tools that <span className="text-primary italic font-serif">actually</span> move the needle.
          </h1>
          
          <p className="text-xl text-muted-foreground font-medium max-w-2xl mx-auto leading-relaxed animate-in slide-in-from-bottom-8 duration-700 fade-in fill-mode-both delay-300">
            Expertly crafted software tailored for serious businesses. No bloat, no recurring enterprise fees. Just tools that work, built by someone who cares.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 animate-in slide-in-from-bottom-10 duration-700 fade-in fill-mode-both delay-500">
            <Link href="/tools" data-testid="hero-browse-cta">
              <Button size="lg" className="h-14 px-8 rounded-full text-base font-bold shadow-xl hover:shadow-primary/25 transition-all hover:-translate-y-0.5">
                Browse Catalog
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="h-14 px-8 rounded-full text-base font-bold bg-background/50 backdrop-blur-sm" onClick={() => setModalOpen(true)} data-testid="hero-waitlist-cta">
              Join Newsletter Waitlist
            </Button>
          </div>
        </div>

        {/* Stats strip */}
        <div className="mt-24 max-w-4xl mx-auto w-full grid grid-cols-2 md:grid-cols-4 gap-4 px-4">
          {statsLoading ? (
            Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)
          ) : stats ? (
            <>
              <StatBox icon={<Layers />} value={stats.totalTools} label="Active Tools" />
              <StatBox icon={<Users />} value={stats.totalCustomers} label="Happy Customers" />
              <StatBox icon={<Code />} value={stats.totalCategories} label="Categories" />
              <StatBox icon={<TrendingUp />} value={stats.upcomingTools} label="Upcoming" />
            </>
          ) : null}
        </div>
      </section>

      {/* Featured Tools */}
      <section className="py-24 px-4 bg-muted/10 relative">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
            <div>
              <h2 className="text-3xl font-bold tracking-tight mb-2">Featured Arsenal</h2>
              <p className="text-muted-foreground font-medium">Hand-picked powerups for your business workflows.</p>
            </div>
            <Link href="/tools" data-testid="link-view-all">
              <Button variant="ghost" className="rounded-full group font-semibold">
                View all tools 
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {toolsLoading ? (
              Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-[380px] rounded-2xl" />)
            ) : tools?.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        </div>
      </section>

      {/* Custom Request Section */}
      <section className="py-24 px-4 border-t border-border/40 bg-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent pointer-events-none"></div>
        <div className="container mx-auto max-w-5xl text-center relative z-10">
          <div className="w-20 h-20 bg-white/10 rounded-3xl mx-auto flex items-center justify-center mb-8 backdrop-blur-sm border border-white/20">
            <Rocket className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6">Need a custom tool?</h2>
          <p className="text-xl md:text-2xl font-medium max-w-3xl mx-auto leading-relaxed mb-12 text-primary-foreground/90">
            We build ANY business tool for you. Describe what you need, get a quote in 24 hours. No hidden fees, just fast delivery and premium quality.
          </p>
          <Link href="/custom-request">
            <Button size="lg" className="bg-white text-primary hover:bg-white/90 h-14 px-10 rounded-full text-lg font-bold shadow-xl hover:-translate-y-1 transition-all">
              Request a Custom Build
            </Button>
          </Link>
        </div>
      </section>

      {/* Trust section */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-5xl text-center">
          <Shield className="w-16 h-16 text-primary mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">Built different.</h2>
          <p className="text-xl text-muted-foreground font-medium max-w-3xl mx-auto leading-relaxed mb-12">
            Most B2B software is bloated and overpriced. I build focused, high-performance tools that solve one problem exceptionally well. When you buy from Tools4Biz, you get direct access to the builder, lifetime updates on major versions, and absolute transparency.
          </p>
          <Link href="/about" data-testid="link-about-cta">
            <Button variant="outline" size="lg" className="rounded-full h-12 px-8 font-bold">
              Read the manifesto
            </Button>
          </Link>
        </div>
      </section>
      
      <ActionModal isOpen={modalOpen} onOpenChange={setModalOpen} />
    </div>
  );
}

function StatBox({ icon, value, label }: { icon: React.ReactNode, value: number, label: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-6 bg-card border border-border/50 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
      <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-3">
        {icon}
      </div>
      <div className="text-3xl font-extrabold tracking-tight mb-1">{value}</div>
      <div className="text-xs text-muted-foreground font-mono uppercase tracking-wider font-semibold">{label}</div>
    </div>
  );
}
