import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";
import type { Tool } from "@workspace/api-client-react";

export default function ToolCard({ tool }: { tool: Tool }) {
  const isAvailable = tool.status === "available";
  
  return (
    <Card className="group relative overflow-hidden border border-border/50 bg-card hover:shadow-xl hover:border-primary/20 transition-all duration-500 flex flex-col h-full rounded-2xl">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      <CardHeader className="p-6 pb-4">
        <div className="flex justify-between items-start mb-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-2xl group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
            {tool.emoji || "⚡"}
          </div>
          <div className="flex gap-2">
            {tool.featured && (
              <Badge variant="secondary" className="bg-accent text-accent-foreground border-transparent font-mono text-xs uppercase tracking-wider font-bold">
                Featured
              </Badge>
            )}
            <Badge variant="outline" className={`font-mono text-xs uppercase tracking-wider font-bold ${isAvailable ? 'text-green-600 border-green-200 bg-green-50/50' : 'text-primary border-primary/20 bg-primary/5'}`}>
              {tool.status.replace("_", " ")}
            </Badge>
          </div>
        </div>
        <h3 className="text-xl font-bold tracking-tight mb-1 group-hover:text-primary transition-colors">
          {tool.name}
        </h3>
        <p className="text-sm font-medium text-muted-foreground/80 font-mono tracking-tight uppercase">
          {tool.category}
        </p>
      </CardHeader>
      
      <CardContent className="p-6 py-0 flex-1">
        <p className="text-muted-foreground text-sm line-clamp-2 mb-4 leading-relaxed">
          {tool.description}
        </p>
        
        {tool.features && tool.features.length > 0 && (
          <ul className="space-y-2 mb-4">
            {tool.features.slice(0, 2).map((feat, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                <CheckCircle2 className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                <span className="line-clamp-1">{feat}</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
      
      <CardFooter className="p-6 pt-4 mt-auto border-t border-border/40 bg-muted/10 flex items-center justify-between">
        <div className="flex items-baseline gap-1">
          <span className="text-lg font-bold">${tool.price}</span>
          <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{tool.currency}</span>
        </div>
        <Link href={`/tools/${tool.id}`} data-testid={`link-tool-${tool.id}`}>
          <Button variant={isAvailable ? "default" : "secondary"} size="sm" className="rounded-full group/btn font-semibold">
            {isAvailable ? "Get Access" : "Join Waitlist"}
            <ArrowRight className="w-3.5 h-3.5 ml-1.5 group-hover/btn:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
