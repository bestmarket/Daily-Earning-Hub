import { useParams, Link } from "wouter";
import { useGetTool } from "@workspace/api-client-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, CheckCircle2, ArrowRight, ShieldCheck, Zap, Share2, Check } from "lucide-react";
import ActionModal from "@/components/ActionModal";
import SeoHead from "@/components/SeoHead";

export default function ToolDetail() {
  const params = useParams();
  const id = Number(params.id);
  const { data: tool, isLoading } = useGetTool(id);
  
  const [modalOpen, setModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        <Skeleton className="w-24 h-6 mb-8" />
        <div className="grid md:grid-cols-3 gap-12">
          <div className="md:col-span-2 space-y-6">
            <Skeleton className="h-16 w-3/4" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-32 w-full mt-8" />
          </div>
          <div className="md:col-span-1">
            <Skeleton className="h-64 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!tool) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h2 className="text-2xl font-bold mb-4">Tool not found</h2>
        <Link href="/tools">
          <Button variant="outline">Back to Catalog</Button>
        </Link>
      </div>
    );
  }

  const isAvailable = tool.status === "available";
  const seoTitle = `${tool.name} | Tools4Biz — ${tool.category} Software`;
  const seoDescription = tool.tagline
    ? `${tool.tagline} — ${tool.description?.slice(0, 120)}...`
    : `${tool.description?.slice(0, 155)}...`;
  const seoKeywords = `${tool.name}, ${tool.category}, business software, ${isAvailable ? "buy" : "waitlist"}, Tools4Biz, indie tools, business tools`;
  const ogImage = `https://tools4biz.com/api/og/${tool.id}`;

  return (
    <>
      <SeoHead
        title={seoTitle}
        description={seoDescription}
        keywords={seoKeywords}
        canonicalPath={`/tools/${tool.id}`}
        ogImage={ogImage}
      />
      <div className="flex-1 w-full bg-background animate-in fade-in duration-500 pb-24">
        <div className="h-64 bg-primary/5 absolute top-0 left-0 right-0 border-b border-border/40 -z-10"></div>
        
        <div className="container mx-auto px-4 py-8 max-w-5xl mt-8">
          <Link href="/tools" className="inline-flex items-center text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors mb-8 group" data-testid="link-back">
            <ChevronLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />
            Back to Catalog
          </Link>
          
          <div className="grid md:grid-cols-3 gap-12 items-start">
            <div className="md:col-span-2">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-white shadow-sm border border-border/50 flex items-center justify-center text-4xl">
                  {tool.emoji || "⚡"}
                </div>
                <div>
                  <div className="flex gap-2 mb-2">
                    <Badge variant="outline" className="font-mono text-xs uppercase tracking-wider font-bold bg-background">
                      {tool.category}
                    </Badge>
                    {tool.featured && (
                      <Badge className="bg-accent text-accent-foreground hover:bg-accent border-transparent font-mono text-xs uppercase tracking-wider font-bold">
                        Featured
                      </Badge>
                    )}
                  </div>
                  <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">{tool.name}</h1>
                </div>
              </div>
              
              {tool.tagline && (
                <p className="text-2xl font-serif italic text-primary/80 mb-8 leading-snug">
                  "{tool.tagline}"
                </p>
              )}
              
              <div className="prose prose-lg dark:prose-invert max-w-none text-muted-foreground font-medium leading-relaxed mb-12">
                <p>{tool.description}</p>
              </div>
              
              {tool.features && tool.features.length > 0 && (
                <div className="bg-card border border-border/50 rounded-3xl p-8 shadow-sm">
                  <h3 className="text-xl font-bold tracking-tight mb-6 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-accent" /> Key Features
                  </h3>
                  <ul className="grid sm:grid-cols-2 gap-4">
                    {tool.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <span className="font-medium text-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mt-12 bg-muted/30 border border-border/40 rounded-2xl p-6">
                <h2 className="text-lg font-bold mb-3">Why choose {tool.name}?</h2>
                <p className="text-muted-foreground leading-relaxed text-sm">
                  {tool.name} is part of the Tools4Biz curated software catalog — a collection of premium, AI-built tools designed for ambitious entrepreneurs and growing businesses. Unlike bloated SaaS subscriptions, {tool.name} is a one-time purchase giving you lifetime access, direct support, and full ownership. Built for the {tool.category} space, this tool is designed to save you time and generate results fast.
                </p>
                <div className="flex flex-wrap gap-2 mt-4">
                  <Badge variant="secondary" className="text-xs font-semibold">One-time payment</Badge>
                  <Badge variant="secondary" className="text-xs font-semibold">Lifetime access</Badge>
                  <Badge variant="secondary" className="text-xs font-semibold">{tool.category}</Badge>
                  <Badge variant="secondary" className="text-xs font-semibold">Direct support</Badge>
                </div>
              </div>
            </div>
            
            <div className="md:col-span-1 sticky top-24">
              <div className="bg-card border border-border/60 rounded-3xl p-6 shadow-xl shadow-primary/5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors"></div>
                
                <Badge variant="outline" className={`mb-6 font-mono text-xs uppercase tracking-wider font-bold px-3 py-1 ${isAvailable ? 'text-green-600 border-green-200 bg-green-50' : 'text-primary border-primary/20 bg-primary/5'}`}>
                  Status: {tool.status.replace("_", " ")}
                </Badge>
                
                <div className="flex items-baseline gap-2 mb-6">
                  <span className="text-5xl font-extrabold tracking-tight">${tool.price}</span>
                  <span className="text-sm text-muted-foreground font-bold uppercase tracking-widest">{tool.currency}</span>
                </div>
                
                <p className="text-sm font-medium text-muted-foreground mb-8">
                  {isAvailable ? "One-time payment. Lifetime access. Direct support." : "Register your interest to get early access pricing."}
                </p>
                
                <Button 
                  size="lg" 
                  className="w-full h-14 text-base rounded-xl font-bold shadow-md hover:shadow-lg transition-all mb-4 group/btn"
                  variant={isAvailable ? "default" : "secondary"}
                  onClick={() => setModalOpen(true)}
                  data-testid="button-cta-main"
                >
                  {isAvailable ? "Get Access Now" : "Join the Waitlist"}
                  <ArrowRight className="w-5 h-5 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full h-10 text-sm rounded-xl font-semibold gap-2 transition-all"
                  onClick={handleShare}
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-green-500" />
                      <span className="text-green-600">Link Copied!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-4 h-4" />
                      Share this Tool
                    </>
                  )}
                </Button>

                <div className="mt-4 rounded-xl overflow-hidden border border-border/50 bg-muted/30">
                  <div className="px-3 py-2 flex items-center justify-between border-b border-border/40">
                    <span className="text-xs font-semibold text-muted-foreground tracking-wide uppercase">Social Preview</span>
                    <span className="text-xs text-muted-foreground">1200 × 630</span>
                  </div>
                  <img
                    src={`/api/og/${tool.id}`}
                    alt={`Social preview card for ${tool.name}`}
                    className="w-full block"
                    loading="lazy"
                  />
                </div>

                <div className="space-y-3 pt-4 border-t border-border/40 mt-6">
                  <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                    <ShieldCheck className="w-4 h-4 text-green-500" /> Secure payment via Stripe / Paystack
                  </div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                    <ShieldCheck className="w-4 h-4 text-green-500" /> Global payments supported
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <ActionModal 
          isOpen={modalOpen} 
          onOpenChange={setModalOpen} 
          toolId={tool.id} 
          toolName={tool.name} 
          isAvailable={isAvailable}
          price={tool.price}
        />
      </div>
    </>
  );
}
