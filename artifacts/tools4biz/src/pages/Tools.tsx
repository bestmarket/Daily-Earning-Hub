import { useState } from "react";
import { useListTools } from "@workspace/api-client-react";
import ToolCard from "@/components/ToolCard";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, SlidersHorizontal } from "lucide-react";
import { Button } from "react-day-picker";

export default function Tools() {
  const [category, setCategory] = useState<string>("all");
  const [search, setSearch] = useState("");

  const { data: tools, isLoading } = useListTools(category !== "all" ? { category } : {});

  const filteredTools = tools?.filter(t => 
    t.name.toLowerCase().includes(search.toLowerCase()) || 
    t.description.toLowerCase().includes(search.toLowerCase())
  );

  const categories = ["all", "Marketing", "Sales", "Development", "Productivity", "Design", "Data"];

  return (
    <div className="flex-1 w-full bg-background animate-in fade-in duration-500">
      <div className="bg-muted/10 border-b border-border/40 py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <h1 className="text-4xl font-extrabold tracking-tight mb-4">Complete Catalog</h1>
          <p className="text-lg text-muted-foreground font-medium max-w-2xl">
            Explore the full arsenal of tools built to accelerate your business.
          </p>
        </div>
      </div>

      <div className="container mx-auto max-w-6xl py-8 px-4">
        <div className="flex flex-col md:flex-row gap-4 mb-10 items-center justify-between bg-card p-4 rounded-2xl border border-border/50 shadow-sm">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input 
              placeholder="Search tools by name or description..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-12 rounded-xl bg-background border-border/50 text-base shadow-inner-sm"
              data-testid="input-search"
            />
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <SlidersHorizontal className="w-5 h-5 text-primary" />
            </div>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-full md:w-[200px] h-12 rounded-xl font-semibold bg-background" data-testid="select-category">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(c => (
                  <SelectItem key={c} value={c} className="font-medium cursor-pointer">
                    {c === "all" ? "All Categories" : c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-[380px] rounded-2xl" />)}
          </div>
        ) : filteredTools && filteredTools.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom-8 duration-700">
            {filteredTools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        ) : (
          <div className="py-24 text-center border border-dashed border-border/60 rounded-3xl bg-muted/5 flex flex-col items-center">
            <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mb-4 rotate-12">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold tracking-tight mb-2">No tools found</h3>
            <p className="text-muted-foreground font-medium max-w-sm">
              We couldn't find any tools matching your search criteria. Try adjusting your filters.
            </p>
            <Button 
              variant="outline" 
              className="mt-6 rounded-full font-semibold"
              onClick={() => { setSearch(""); setCategory("all"); }}
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
