import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useAdminLogin,
  useGetAdminCustomRequests,
  useGetAdminWaitlist,
  useListTools,
  useUpdateCustomRequest,
  useDeleteTool,
  useCreateTool,
  getGetAdminCustomRequestsQueryKey,
  getListToolsQueryKey,
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import {
  Save, Lock, DollarSign, CreditCard, MessageSquare, Sparkles, RefreshCw,
  AlertTriangle, Mail, Send, Target, Plus, Trash2,
  CheckCircle2, Clock, Wrench, ExternalLink, Calculator, Brain, TrendingUp, Users,
  Key, Eye, EyeOff, ShieldCheck, Zap, Package, LayoutDashboard,
  Bot, Settings, Globe,
} from "lucide-react";
import { toast as sonnerToast } from "sonner";
import API_BASE from "@/lib/api";

const ADMIN_TOKEN = "devstudio-admin";

// ─── Types ────────────────────────────────────────────────────────────────────

type PricingPlan = {
  id: string; name: string; price: string; description: string;
  features: string[]; popular: boolean;
};
type PaymentMethod = {
  id: string; name: string; enabled: boolean; details: string;
};
type SiteSettings = {
  pricing: PricingPlan[];
  paymentMethods: PaymentMethod[];
  contact: { whatsapp: string; email: string; whatsappDisplay: string };
  hero: { headline: string; subheadline: string; ctaPrimary: string; ctaSecondary: string };
};
interface Lead {
  id: number; name: string; email: string; company: string; role: string;
  service: string; note: string; status: "new" | "contacted" | "replied" | "converted";
  addedAt: string;
}

const DEFAULT_SETTINGS: SiteSettings = {
  pricing: [
    { id: "starter", name: "Starter", price: "$299", description: "Perfect for small businesses", features: ["Landing Page", "Contact Form", "Mobile Friendly", "1 Revision"], popular: false },
    { id: "pro", name: "Pro", price: "$799", description: "For growing businesses", features: ["Up to 5 Pages", "Booking System", "Admin Dashboard", "Payment Integration", "3 Revisions"], popular: true },
    { id: "enterprise", name: "Enterprise", price: "$1,999", description: "Full custom software", features: ["Unlimited Pages", "Custom Features", "AI Integration", "Priority Support", "Unlimited Revisions"], popular: false },
  ],
  paymentMethods: [
    { id: "paypal", name: "PayPal", enabled: true, details: "" },
    { id: "stripe", name: "Stripe", enabled: false, details: "" },
    { id: "paystack", name: "Paystack", enabled: false, details: "" },
    { id: "bank", name: "Bank Transfer", enabled: true, details: "" },
    { id: "crypto", name: "Crypto (USDT/BTC)", enabled: false, details: "" },
  ],
  contact: { whatsapp: "+1234567890", email: "hello@devstudio.com", whatsappDisplay: "+1 (234) 567-890" },
  hero: { headline: "We Build Software That Helps Your Business Get More Customers & Save Time.", subheadline: "From booking systems and customer portals to AI-powered tools and SaaS platforms — we build custom software that grows your revenue.", ctaPrimary: "Get My Free Business Tool Idea", ctaSecondary: "View Examples" },
};

// ─── Main Admin Component ─────────────────────────────────────────────────────

export default function Admin() {
  const { toast } = useToast();
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [apiToken, setApiToken] = useState<string>(() => localStorage.getItem("ds_api_token") || ADMIN_TOKEN);
  const loginMutation = useAdminLogin();

  const login = () => {
    if (password === ADMIN_TOKEN) {
      loginMutation.mutate({ data: { password } }, {
        onSuccess: (data) => {
          const tok = data.token ?? ADMIN_TOKEN;
          setApiToken(tok);
          localStorage.setItem("ds_api_token", tok);
          setAuthed(true);
        },
        onError: () => {
          setApiToken(ADMIN_TOKEN);
          localStorage.setItem("ds_api_token", ADMIN_TOKEN);
          setAuthed(true);
        },
      });
    } else {
      toast({ title: "Wrong password", description: "Default: devstudio-admin", variant: "destructive" });
    }
  };

  useEffect(() => {
    const stored = localStorage.getItem("ds_api_token");
    if (stored) { setApiToken(stored); setAuthed(true); }
  }, []);

  if (!authed) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="w-full max-w-sm rounded-2xl border border-border/60 bg-card p-8 space-y-6 shadow-xl">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
              <Lock className="w-7 h-7 text-primary" />
            </div>
            <h1 className="text-2xl font-bold">Admin Panel</h1>
            <p className="text-sm text-muted-foreground">DevStudio Control Center</p>
          </div>
          <div className="space-y-3">
            <Input
              type="password"
              placeholder="Admin password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && login()}
            />
            <Button className="w-full" onClick={login} disabled={loginMutation.isPending}>
              {loginMutation.isPending ? <RefreshCw className="mr-2 w-4 h-4 animate-spin" /> : <Lock className="mr-2 w-4 h-4" />}
              Login
            </Button>
          </div>
          <p className="text-xs text-center text-muted-foreground">Default password: devstudio-admin</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="border-b border-border/60 bg-card/80 backdrop-blur sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-sm leading-none">DevStudio Admin</h1>
              <p className="text-xs text-muted-foreground mt-0.5">Control Center</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => window.open("/", "_blank")}>
              <Globe className="w-3.5 h-3.5 mr-1.5" /> View Site
            </Button>
            <Button variant="outline" size="sm" onClick={() => window.open("/admin/crm", "_blank")}>
              <Bot className="w-3.5 h-3.5 mr-1.5" /> AI Hunter
            </Button>
            <Button variant="ghost" size="sm" onClick={() => { localStorage.removeItem("ds_api_token"); setAuthed(false); setApiToken(ADMIN_TOKEN); }}>
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="flex flex-wrap gap-1 h-auto p-1.5 bg-muted/60 rounded-xl w-full sm:w-auto">
            <TabsTrigger value="overview" className="gap-1.5 text-xs sm:text-sm">
              <LayoutDashboard className="w-3.5 h-3.5" /> Overview
            </TabsTrigger>
            <TabsTrigger value="requests" className="gap-1.5 text-xs sm:text-sm">
              <MessageSquare className="w-3.5 h-3.5" /> Requests
            </TabsTrigger>
            <TabsTrigger value="catalog" className="gap-1.5 text-xs sm:text-sm">
              <Package className="w-3.5 h-3.5" /> Catalog
            </TabsTrigger>
            <TabsTrigger value="waitlist" className="gap-1.5 text-xs sm:text-sm">
              <Users className="w-3.5 h-3.5" /> Waitlist
            </TabsTrigger>
            <TabsTrigger value="payments" className="gap-1.5 text-xs sm:text-sm">
              <CreditCard className="w-3.5 h-3.5" /> Payments
            </TabsTrigger>
            <TabsTrigger value="ai" className="gap-1.5 text-xs sm:text-sm">
              <Brain className="w-3.5 h-3.5" /> AI Setup
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-1.5 text-xs sm:text-sm">
              <Settings className="w-3.5 h-3.5" /> Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview"><OverviewTab apiToken={apiToken} /></TabsContent>
          <TabsContent value="requests"><CustomRequestsTab apiToken={apiToken} /></TabsContent>
          <TabsContent value="catalog"><CatalogTab apiToken={apiToken} /></TabsContent>
          <TabsContent value="waitlist"><WaitlistTab apiToken={apiToken} /></TabsContent>
          <TabsContent value="payments"><PaymentsTab apiToken={apiToken} /></TabsContent>
          <TabsContent value="ai"><AISetupTab apiToken={apiToken} /></TabsContent>
          <TabsContent value="settings"><SiteSettingsTab apiToken={apiToken} /></TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// ─── Overview Tab ─────────────────────────────────────────────────────────────

function OverviewTab({ apiToken }: { apiToken: string }) {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/api/admin/summary`, { headers: { Authorization: `Bearer ${apiToken}` } })
      .then(r => r.json()).then(setStats).catch(() => {}).finally(() => setLoading(false));
  }, [apiToken]);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Custom Requests", value: stats?.totalCustomRequests ?? "—", sub: `${stats?.newCustomRequests ?? 0} new`, icon: <MessageSquare className="w-5 h-5 text-blue-500" />, bg: "bg-blue-50 border-blue-100" },
          { label: "Total Revenue", value: stats?.totalRevenue ? `$${stats.totalRevenue.toLocaleString()}` : "$0", sub: `${stats?.paidRequests ?? 0} paid`, icon: <DollarSign className="w-5 h-5 text-green-500" />, bg: "bg-green-50 border-green-100" },
          { label: "Tools in Catalog", value: stats?.totalTools ?? "—", sub: "products", icon: <Package className="w-5 h-5 text-purple-500" />, bg: "bg-purple-50 border-purple-100" },
          { label: "Waitlist Signups", value: stats?.totalWaitlist ?? "—", sub: "subscribers", icon: <Users className="w-5 h-5 text-orange-500" />, bg: "bg-orange-50 border-orange-100" },
        ].map(s => (
          <div key={s.label} className={`rounded-xl border p-4 ${s.bg}`}>
            <div className="flex items-center justify-between mb-2">{s.icon}</div>
            <div className="text-2xl font-extrabold">{loading ? "—" : s.value}</div>
            <div className="text-xs text-muted-foreground font-medium mt-0.5">{s.label}</div>
            <div className="text-xs text-muted-foreground">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* AI Client Hunter CRM card */}
      <div className="rounded-2xl border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-indigo-50 p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#6366F1] flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-200">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-extrabold text-lg">AI Client Hunter</h3>
              <span className="text-xs font-bold bg-purple-600 text-white px-2 py-0.5 rounded-full">AI POWERED</span>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              Find prospects automatically, analyze websites, and generate personalized emails, WhatsApp & LinkedIn pitches in seconds.
            </p>
            <div className="flex flex-wrap gap-2 mb-4">
              {["AI Business Discovery","Website Analyzer","Email Generator","WhatsApp Pitches","LinkedIn Outreach","Proposal Builder"].map(f => (
                <span key={f} className="text-xs bg-white border border-purple-200 text-purple-700 font-semibold px-2 py-0.5 rounded-full">{f}</span>
              ))}
            </div>
            <a href="/admin/crm">
              <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold gap-2 hover:from-purple-700 hover:to-indigo-700">
                <Sparkles className="w-4 h-4" /> Open AI Client Hunter
              </Button>
            </a>
          </div>
        </div>
      </div>

      {/* Free Tools Quick Links */}
      <div className="rounded-xl border border-border/60 bg-card p-5">
        <h3 className="font-bold text-sm mb-1 flex items-center gap-2"><Wrench className="w-4 h-4 text-primary" /> Free Tools on Your Site</h3>
        <p className="text-xs text-muted-foreground mb-4">Share these with prospects to generate leads.</p>
        <div className="grid sm:grid-cols-2 gap-2">
          {[
            { label: "ROI Calculator", icon: <DollarSign className="w-3.5 h-3.5 text-purple-600" />, desc: "Shows annual cost of manual work" },
            { label: "Project Cost Estimator", icon: <Calculator className="w-3.5 h-3.5 text-green-600" />, desc: "Instant price estimate by features" },
            { label: "Business Software Quiz", icon: <Brain className="w-3.5 h-3.5 text-indigo-600" />, desc: "Recommends the right software" },
            { label: "Break-Even Calculator", icon: <Target className="w-3.5 h-3.5 text-amber-600" />, desc: "Payback period & churn cost" },
            { label: "Lost Leads Calculator", icon: <Users className="w-3.5 h-3.5 text-rose-600" />, desc: "Revenue lost to slow responses" },
            { label: "Revenue Growth Projector", icon: <TrendingUp className="w-3.5 h-3.5 text-purple-600" />, desc: "12-month revenue comparison" },
          ].map(tool => (
            <a key={tool.label} href="/free-tools" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-3 p-2.5 rounded-lg border border-border/50 hover:border-primary/40 hover:bg-primary/5 transition-all group">
              <div className="w-7 h-7 rounded-md bg-muted flex items-center justify-center flex-shrink-0">{tool.icon}</div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold">{tool.label}</div>
                <div className="text-xs text-muted-foreground truncate">{tool.desc}</div>
              </div>
              <ExternalLink className="w-3 h-3 text-muted-foreground group-hover:text-primary" />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Custom Requests Tab ──────────────────────────────────────────────────────

function CustomRequestsTab({ apiToken }: { apiToken: string }) {
  const queryClient = useQueryClient();
  const requestOptions = { request: { headers: { Authorization: `Bearer ${apiToken}` } } };
  const { data: customRequests, isLoading } = useGetAdminCustomRequests({ query: { enabled: !!apiToken } }, requestOptions);
  const updateCustomRequest = useUpdateCustomRequest(requestOptions);

  const handleUpdateStatus = (id: number, status: string) => {
    updateCustomRequest.mutate({ id, data: { status: status as any } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetAdminCustomRequestsQueryKey() });
        sonnerToast.success("Status updated");
      },
    });
  };

  const handleUpdatePayment = (id: number, paymentAmount: string, paymentMethod: string) => {
    updateCustomRequest.mutate({ id, data: { paymentAmount: paymentAmount ? Number(paymentAmount) : null, paymentMethod } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetAdminCustomRequestsQueryKey() });
        sonnerToast.success("Payment updated");
      },
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bold text-lg">Custom Requests</h2>
          <p className="text-sm text-muted-foreground">{customRequests?.length || 0} inbound requests for custom software builds</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20"><RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" /></div>
      ) : (
        <div className="rounded-xl border border-border/60 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead>Client</TableHead>
                <TableHead>Type & Budget</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customRequests?.map(req => (
                <TableRow key={req.id} className="hover:bg-muted/20">
                  <TableCell>
                    <div className="font-semibold text-sm">{req.name || "Anonymous"}</div>
                    <div className="text-xs text-muted-foreground">{req.email}</div>
                    {req.whatsapp && <div className="text-xs text-green-600 mt-0.5">📱 {req.whatsapp}</div>}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs mb-1">{req.businessType || "N/A"}</Badge>
                    <div className="text-xs text-muted-foreground">{req.budget || "Not sure"}</div>
                  </TableCell>
                  <TableCell className="max-w-[200px]">
                    <div className="text-xs text-muted-foreground line-clamp-2" title={req.description || ""}>{req.description || "—"}</div>
                  </TableCell>
                  <TableCell>
                    <Select value={req.status} onValueChange={val => handleUpdateStatus(req.id, val)}>
                      <SelectTrigger className="w-[130px] h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {["new","contacted","quoted","paid","delivered","cancelled"].map(s => (
                          <SelectItem key={s} value={s} className="text-xs capitalize">{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1.5">
                      <Input placeholder="Amount ($)" className="h-7 w-24 text-xs"
                        defaultValue={req.paymentAmount?.toString() || ""}
                        onBlur={e => handleUpdatePayment(req.id, e.target.value, req.paymentMethod || "")} />
                      <Input placeholder="Method" className="h-7 w-24 text-xs"
                        defaultValue={req.paymentMethod || ""}
                        onBlur={e => handleUpdatePayment(req.id, req.paymentAmount?.toString() || "", e.target.value)} />
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(req.createdAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
              {(!customRequests || customRequests.length === 0) && (
                <TableRow><TableCell colSpan={6} className="text-center py-12 text-muted-foreground text-sm">No custom requests yet. They'll appear here when prospects submit the form.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

// ─── Catalog Tab ──────────────────────────────────────────────────────────────

function CatalogTab({ apiToken }: { apiToken: string }) {
  const queryClient = useQueryClient();
  const requestOptions = { request: { headers: { Authorization: `Bearer ${apiToken}` } } };
  const { data: tools, isLoading } = useListTools({}, requestOptions);
  const deleteTool = useDeleteTool(requestOptions);
  const createTool = useCreateTool(requestOptions);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newTool, setNewTool] = useState({ name: "", description: "", category: "Make Money Online", price: "", status: "available", emoji: "" });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createTool.mutate({
      data: { name: newTool.name, description: newTool.description, category: newTool.category, price: Number(newTool.price), status: newTool.status as any, emoji: newTool.emoji || undefined },
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListToolsQueryKey() });
        setIsAddOpen(false);
        setNewTool({ name: "", description: "", category: "Make Money Online", price: "", status: "available", emoji: "" });
        sonnerToast.success("Tool created");
      },
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bold text-lg">Software Catalog</h2>
          <p className="text-sm text-muted-foreground">{tools?.length || 0} products — manage your Tools4Biz marketplace offerings</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="gap-1.5 font-semibold"><Plus className="w-4 h-4" /> Add Tool</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader><DialogTitle>Add New Tool</DialogTitle></DialogHeader>
            <form onSubmit={handleCreate} className="space-y-3 pt-2">
              <div className="grid grid-cols-5 gap-2">
                <Input className="col-span-1" placeholder="🚀" value={newTool.emoji} onChange={e => setNewTool({ ...newTool, emoji: e.target.value })} maxLength={2} />
                <Input className="col-span-4" placeholder="Tool name" value={newTool.name} onChange={e => setNewTool({ ...newTool, name: e.target.value })} required />
              </div>
              <Textarea placeholder="Description" value={newTool.description} onChange={e => setNewTool({ ...newTool, description: e.target.value })} required rows={3} />
              <Select value={newTool.category} onValueChange={v => setNewTool({ ...newTool, category: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Make Money Online","Grow on Social Media","Start a SaaS","Lead Generation","Sell Digital Products","Business Growth"].map(c => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="grid grid-cols-2 gap-3">
                <Input type="number" placeholder="Price ($)" value={newTool.price} onChange={e => setNewTool({ ...newTool, price: e.target.value })} required />
                <Select value={newTool.status} onValueChange={v => setNewTool({ ...newTool, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="coming_soon">Coming Soon</SelectItem>
                    <SelectItem value="beta">Beta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full" disabled={createTool.isPending}>
                {createTool.isPending ? "Creating…" : "Create Tool"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20"><RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" /></div>
      ) : (
        <div className="rounded-xl border border-border/60 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead>Tool</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tools?.map(tool => (
                <TableRow key={tool.id} className="hover:bg-muted/20">
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-base">{tool.emoji || "🚀"}</div>
                      <div>
                        <div className="font-semibold text-sm">{tool.name}</div>
                        <div className="text-xs text-muted-foreground line-clamp-1">{tool.description}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell><Badge variant="outline" className="text-xs">{tool.category}</Badge></TableCell>
                  <TableCell className="font-mono font-semibold text-sm">${tool.price}</TableCell>
                  <TableCell>
                    <Badge className={tool.status === "available" ? "bg-green-100 text-green-700 border-green-200 hover:bg-green-100" : tool.status === "beta" ? "bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100" : "bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-100"}>
                      {tool.status.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="text-destructive h-7 text-xs hover:bg-destructive/10"
                      onClick={() => { if (confirm("Delete this tool?")) deleteTool.mutate({ id: tool.id }, { onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListToolsQueryKey() }); sonnerToast.success("Deleted"); } }); }}>
                      <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {(!tools || tools.length === 0) && (
                <TableRow><TableCell colSpan={5} className="text-center py-12 text-muted-foreground text-sm">No tools yet. Add your first product to the catalog.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

// ─── Waitlist Tab ─────────────────────────────────────────────────────────────

function WaitlistTab({ apiToken }: { apiToken: string }) {
  const requestOptions = { request: { headers: { Authorization: `Bearer ${apiToken}` } } };
  const { data: waitlist, isLoading } = useGetAdminWaitlist({ query: { enabled: !!apiToken } }, requestOptions);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-bold text-lg">Waitlist & Signups</h2>
        <p className="text-sm text-muted-foreground">{waitlist?.length || 0} signups from the software catalog waitlist and purchase requests</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20"><RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" /></div>
      ) : (
        <div className="rounded-xl border border-border/60 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead>Email</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Tool</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {waitlist?.map(entry => (
                <TableRow key={entry.id} className="hover:bg-muted/20">
                  <TableCell className="font-medium text-sm">{entry.email}</TableCell>
                  <TableCell className="text-sm">{entry.name || "—"}</TableCell>
                  <TableCell>
                    {entry.toolName ? <Badge variant="secondary" className="text-xs">{entry.toolName}</Badge> : <span className="text-muted-foreground text-xs">—</span>}
                  </TableCell>
                  <TableCell className="max-w-[200px]">
                    <p className="text-xs text-muted-foreground truncate">{(entry as any).message || "—"}</p>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs whitespace-nowrap">
                    {new Date(entry.createdAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
              {(!waitlist || waitlist.length === 0) && (
                <TableRow><TableCell colSpan={5} className="text-center py-12 text-muted-foreground text-sm">No waitlist signups yet.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

// ─── Payments Tab ─────────────────────────────────────────────────────────────

function PaymentsTab({ apiToken }: { apiToken: string }) {
  const { toast } = useToast();
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [apiKeys, setApiKeys] = useState<Record<string, { masked: string; set: boolean }>>({});
  const [keyValues, setKeyValues] = useState<Record<string, string>>({});
  const [keyVisible, setKeyVisible] = useState<Record<string, boolean>>({});
  const [keySaving, setKeySaving] = useState(false);

  const authHeader = { Authorization: `Bearer ${apiToken}` };

  useEffect(() => {
    fetch(`${API_BASE}/api/site-settings`).then(r => r.json()).then(setSettings).catch(() => setSettings(DEFAULT_SETTINGS));
    fetch(`${API_BASE}/api/admin/api-keys`, { headers: authHeader }).then(r => r.json()).then(setApiKeys).catch(() => {});
  }, []);

  const updatePayment = (idx: number, field: keyof PaymentMethod, value: string | boolean) => {
    if (!settings) return;
    const methods = [...settings.paymentMethods];
    methods[idx] = { ...methods[idx], [field]: value };
    setSettings({ ...settings, paymentMethods: methods });
  };

  const savePayments = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/site-settings/payment-methods`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeader },
        body: JSON.stringify(settings.paymentMethods),
      });
      if (!res.ok) throw new Error();
      toast({ title: "✅ Payment methods saved!" });
    } catch {
      toast({ title: "Failed to save", variant: "destructive" });
    } finally { setSaving(false); }
  };

  const saveApiKeys = async () => {
    const toSave: Record<string, string> = {};
    for (const [k, v] of Object.entries(keyValues)) { if (v.trim()) toSave[k] = v.trim(); }
    if (!Object.keys(toSave).length) { toast({ title: "No keys to save", variant: "destructive" }); return; }
    setKeySaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/api-keys`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader },
        body: JSON.stringify(toSave),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      toast({ title: `✅ Saved: ${data.saved.join(", ")}` });
      setKeyValues({});
      const fresh = await fetch(`${API_BASE}/api/admin/api-keys`, { headers: authHeader }).then(r => r.json());
      setApiKeys(fresh);
    } catch {
      toast({ title: "Failed to save API keys", variant: "destructive" });
    } finally { setKeySaving(false); }
  };

  const clearKey = async (key: string) => {
    if (!confirm(`Remove ${key}?`)) return;
    await fetch(`${API_BASE}/api/admin/api-keys/${key}`, { method: "DELETE", headers: authHeader });
    toast({ title: `${key} removed` });
    setApiKeys(s => ({ ...s, [key]: { masked: "", set: false } }));
  };

  const PAYMENT_KEY_GROUPS = [
    {
      id: "stripe", label: "Stripe", icon: "💳", color: "from-blue-50 to-cyan-50 border-blue-200",
      desc: "Accept card payments worldwide. Get keys at dashboard.stripe.com → Developers → API Keys.",
      link: "https://dashboard.stripe.com/apikeys",
      keys: [
        { key: "STRIPE_SECRET_KEY", label: "Secret Key", hint: "Starts with sk_live_ or sk_test_" },
        { key: "STRIPE_PUBLISHABLE_KEY", label: "Publishable Key", hint: "Starts with pk_live_ or pk_test_" },
      ],
    },
    {
      id: "paypal", label: "PayPal", icon: "🅿️", color: "from-amber-50 to-yellow-50 border-amber-200",
      desc: "Accept PayPal and card payments. Get keys at developer.paypal.com → My Apps & Credentials.",
      link: "https://developer.paypal.com/dashboard/applications/live",
      keys: [
        { key: "PAYPAL_CLIENT_ID", label: "Client ID", hint: "From PayPal Developer Dashboard" },
        { key: "PAYPAL_SECRET", label: "Client Secret", hint: "From PayPal Developer Dashboard" },
      ],
    },
  ];

  const hasDirtyKeys = Object.values(keyValues).some(v => v.trim());

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-bold text-lg">Payment Setup</h2>
        <p className="text-sm text-muted-foreground">Enable payment methods and connect your payment processor API keys</p>
      </div>

      {/* Payment Methods Toggle */}
      <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
        <div className="p-5 border-b border-border/40 bg-muted/20">
          <h3 className="font-bold text-sm flex items-center gap-2"><CreditCard className="w-4 h-4 text-primary" /> Accepted Payment Methods</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Choose which methods to show on your site. Add details like account info below each.</p>
        </div>
        <div className="p-5 space-y-3">
          {settings?.paymentMethods.map((pm, idx) => (
            <div key={pm.id} className="flex items-center gap-4 rounded-xl border border-border/50 p-4 hover:bg-muted/20 transition-colors">
              <Switch checked={pm.enabled} onCheckedChange={(v) => updatePayment(idx, "enabled", v)} />
              <div className="w-32 font-semibold text-sm">{pm.name}</div>
              <Input
                className="flex-1"
                placeholder={pm.id === "paypal" ? "PayPal email or link" : pm.id === "stripe" ? "Stripe payment link (optional)" : pm.id === "bank" ? "Bank name, account no., sort code" : pm.id === "crypto" ? "Wallet address (USDT/BTC)" : "Details"}
                value={pm.details}
                onChange={(e) => updatePayment(idx, "details", e.target.value)}
              />
              <Badge variant={pm.enabled ? "default" : "secondary"} className={pm.enabled ? "bg-green-100 text-green-700 border-green-200 hover:bg-green-100" : ""}>
                {pm.enabled ? "Active" : "Off"}
              </Badge>
            </div>
          ))}
          <Button onClick={savePayments} disabled={saving || !settings} className="mt-2">
            {saving ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Save Payment Methods
          </Button>
        </div>
      </div>

      {/* Payment API Keys */}
      <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
        <div className="p-5 border-b border-border/40 bg-muted/20 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm flex items-center gap-2"><Key className="w-4 h-4 text-primary" /> Payment API Keys</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Keys are stored securely in your database and never shown in full.</p>
          </div>
          <Button onClick={saveApiKeys} disabled={keySaving || !hasDirtyKeys} size="sm" className="gap-2">
            {keySaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
            {keySaving ? "Saving…" : "Save Keys"}
          </Button>
        </div>
        <div className="p-5 space-y-4">
          {PAYMENT_KEY_GROUPS.map(group => (
            <div key={group.id} className={`rounded-xl border bg-gradient-to-br ${group.color} p-4 space-y-3`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{group.icon}</span>
                  <div>
                    <h4 className="font-bold text-sm">{group.label}</h4>
                    <p className="text-xs text-muted-foreground">{group.desc}</p>
                  </div>
                </div>
                <a href={group.link} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm" className="text-xs gap-1 bg-white/80 border-white h-7">
                    Get Keys <ExternalLink className="w-3 h-3" />
                  </Button>
                </a>
              </div>
              {group.keys.map(({ key, label, hint }) => {
                const status = apiKeys[key];
                const isSet = status?.set;
                return (
                  <div key={key} className="bg-white/80 rounded-lg border border-white p-3 space-y-2 shadow-sm">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold">{label}</label>
                      {isSet ? (
                        <Badge className="bg-green-100 text-green-700 border-green-200 text-xs gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Connected
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs text-muted-foreground">Not set</Badge>
                      )}
                    </div>
                    {isSet && (
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/30 rounded-lg border border-border/40">
                        <span className="font-mono text-xs text-muted-foreground flex-1">{status.masked}</span>
                        <button className="text-xs text-destructive/70 hover:text-destructive font-medium flex items-center gap-1" onClick={() => clearKey(key)}>
                          <Trash2 className="w-3 h-3" /> Remove
                        </button>
                      </div>
                    )}
                    <div className="relative">
                      <Input
                        type={keyVisible[key] ? "text" : "password"}
                        placeholder={isSet ? "Enter new key to replace…" : "Paste your key here…"}
                        value={keyValues[key] ?? ""}
                        onChange={(e) => setKeyValues(v => ({ ...v, [key]: e.target.value }))}
                        className="pr-10 font-mono text-sm h-9"
                      />
                      <button type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        onClick={() => setKeyVisible(v => ({ ...v, [key]: !v[key] }))}>
                        {keyVisible[key] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground">{hint}</p>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── AI Setup Tab ─────────────────────────────────────────────────────────────

function AISetupTab({ apiToken }: { apiToken: string }) {
  const { toast } = useToast();
  const [apiKeys, setApiKeys] = useState<Record<string, { masked: string; set: boolean; viaIntegration?: boolean }>>({});
  const [geminiKey, setGeminiKey] = useState("");
  const [geminiVisible, setGeminiVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null);

  const authHeader = { Authorization: `Bearer ${apiToken}` };

  useEffect(() => {
    fetch(`${API_BASE}/api/admin/api-keys`, { headers: authHeader })
      .then(r => r.json()).then(setApiKeys).catch(() => {});
  }, []);

  const isGeminiSet = apiKeys["GEMINI_API_KEY"]?.set;
  const isViaIntegration = apiKeys["GEMINI_API_KEY"]?.viaIntegration;

  const saveGeminiKey = async () => {
    if (!geminiKey.trim()) { toast({ title: "Please enter a key", variant: "destructive" }); return; }
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/api-keys`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader },
        body: JSON.stringify({ GEMINI_API_KEY: geminiKey.trim() }),
      });
      if (!res.ok) throw new Error();
      toast({ title: "✅ Gemini AI key saved!" });
      setGeminiKey("");
      setTestResult(null);
      const fresh = await fetch(`${API_BASE}/api/admin/api-keys`, { headers: authHeader }).then(r => r.json());
      setApiKeys(fresh);
    } catch {
      toast({ title: "Failed to save key", variant: "destructive" });
    } finally { setSaving(false); }
  };

  const removeGeminiKey = async () => {
    if (!confirm("Remove the Gemini API key? AI features will stop working.")) return;
    await fetch(`${API_BASE}/api/admin/api-keys/GEMINI_API_KEY`, { method: "DELETE", headers: authHeader });
    toast({ title: "Gemini key removed" });
    setApiKeys(s => ({ ...s, GEMINI_API_KEY: { masked: "", set: false } }));
    setTestResult(null);
  };

  const testAI = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch(`${API_BASE}/api/tools-ai/recommend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessType: "Restaurant", goals: ["Get more customers"], challenges: ["No online presence"], teamSize: "1-5" }),
      });
      if (res.ok) {
        setTestResult({ ok: true, message: "✅ AI is working! Gemini is responding correctly." });
      } else {
        const err = await res.json().catch(() => ({}));
        setTestResult({ ok: false, message: `❌ AI error: ${err.error || `HTTP ${res.status}`}` });
      }
    } catch {
      setTestResult({ ok: false, message: "❌ Could not connect to AI service. Check that your key is saved." });
    } finally { setTesting(false); }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-bold text-lg">AI Setup</h2>
        <p className="text-sm text-muted-foreground">Connect Google Gemini AI to power your business tools, AI Client Hunter, and website grader</p>
      </div>

      {/* Status Card */}
      <div className={`rounded-xl border-2 p-5 flex items-start gap-4 ${isGeminiSet ? "border-green-200 bg-green-50" : "border-orange-200 bg-orange-50"}`}>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${isGeminiSet ? "bg-green-100" : "bg-orange-100"}`}>
          <Brain className={`w-6 h-6 ${isGeminiSet ? "text-green-600" : "text-orange-600"}`} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h3 className="font-bold">Gemini AI</h3>
            <Badge className={isGeminiSet ? "bg-green-600 text-white" : "bg-orange-200 text-orange-800 border-orange-300"}>
              {isGeminiSet ? "✅ Active" : "⚠️ Not Connected"}
            </Badge>
            {isViaIntegration && (
              <Badge className="bg-purple-100 text-purple-700 border-purple-200">
                🔌 Auto-connected by Replit
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {isViaIntegration
              ? "Gemini is automatically connected via the Replit AI integration — no manual key needed. All AI features are ready to use."
              : isGeminiSet
              ? "AI is connected and powering your business tools, AI Client Hunter CRM, and automated outreach features."
              : "Connect your Gemini API key to enable AI features across the entire platform."}
          </p>
        </div>
      </div>

      {/* What AI Powers */}
      <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
        <div className="p-5 border-b border-border/40 bg-muted/20">
          <h3 className="font-bold text-sm flex items-center gap-2"><Sparkles className="w-4 h-4 text-primary" /> What AI Powers on Your Platform</h3>
        </div>
        <div className="p-5">
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { icon: "🎯", label: "AI Client Hunter", desc: "Auto-discovers businesses in any city and generates leads" },
              { icon: "🌐", label: "Website Analyzer", desc: "Grades prospect websites and generates improvement recommendations" },
              { icon: "📧", label: "Email Generator", desc: "Writes personalized cold emails for each prospect" },
              { icon: "💬", label: "WhatsApp Pitches", desc: "Generates WhatsApp messages tailored to each business" },
              { icon: "💼", label: "LinkedIn Outreach", desc: "Creates professional LinkedIn connection messages" },
              { icon: "📄", label: "Proposal Builder", desc: "Generates full project proposals automatically" },
              { icon: "🛠️", label: "Tool Recommender", desc: "Recommends business tools based on visitor needs" },
              { icon: "📊", label: "Business Niche Grader", desc: "Scores and grades business niches for opportunity" },
            ].map(f => (
              <div key={f.label} className="flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-muted/20">
                <span className="text-xl">{f.icon}</span>
                <div>
                  <div className="text-xs font-semibold">{f.label}</div>
                  <div className="text-xs text-muted-foreground">{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Gemini Key Entry */}
      <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
        <div className="p-5 border-b border-border/40 bg-gradient-to-r from-purple-50 to-indigo-50">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm flex items-center gap-2"><Key className="w-4 h-4 text-purple-600" /> Google Gemini API Key</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Free tier available — 1 million tokens/month. No credit card needed to start.</p>
            </div>
            <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm" className="text-xs gap-1 bg-white h-7">
                Get Free Key <ExternalLink className="w-3 h-3" />
              </Button>
            </a>
          </div>
        </div>
        <div className="p-5 space-y-4">
          {isViaIntegration ? (
            /* Auto-connected via Replit integration — no manual key needed */
            <div className="rounded-lg border border-purple-200 bg-purple-50 p-4 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-purple-800">Managed automatically by Replit</p>
                <p className="text-xs text-purple-700 mt-0.5">Your API key is securely provided by the Replit Gemini integration. You don't need to enter anything here.</p>
                <p className="font-mono text-xs text-purple-600 mt-1">{apiKeys["GEMINI_API_KEY"]?.masked}</p>
              </div>
            </div>
          ) : (
            <>
              {isGeminiSet && (
                <div className="flex items-center gap-3 px-4 py-3 bg-green-50 rounded-lg border border-green-200">
                  <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span className="font-mono text-sm text-muted-foreground flex-1">{apiKeys["GEMINI_API_KEY"]?.masked}</span>
                  <button className="text-xs text-destructive/70 hover:text-destructive font-medium flex items-center gap-1" onClick={removeGeminiKey}>
                    <Trash2 className="w-3 h-3" /> Remove
                  </button>
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-2 block">
                  {isGeminiSet ? "Replace API Key" : "Enter Gemini API Key"}
                </label>
                <div className="relative">
                  <Input
                    type={geminiVisible ? "text" : "password"}
                    placeholder="AIzaSy…"
                    value={geminiKey}
                    onChange={(e) => setGeminiKey(e.target.value)}
                    className="pr-10 font-mono h-10"
                  />
                  <button type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setGeminiVisible(v => !v)}>
                    {geminiVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Go to <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-primary underline">aistudio.google.com</a> → Sign in → Create API Key → Copy & paste here
                </p>
              </div>

              <Button onClick={saveGeminiKey} disabled={saving || !geminiKey.trim()} className="gap-2 w-full">
                {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? "Saving…" : "Save API Key"}
              </Button>
            </>
          )}

          <div className="flex gap-3">
            <Button variant="outline" onClick={testAI} disabled={testing || !isGeminiSet} className="gap-2 flex-1">
              {testing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
              {testing ? "Testing AI…" : "Test AI Connection"}
            </Button>
          </div>

          {testResult && (
            <div className={`rounded-lg p-3 text-sm font-medium ${testResult.ok ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
              {testResult.message}
            </div>
          )}
        </div>
      </div>

      {/* How to get the key - steps */}
      <div className="rounded-xl border border-border/60 bg-muted/20 p-5">
        <h4 className="font-bold text-sm mb-3 flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-600" /> How to Get Your Free Gemini API Key (2 minutes)</h4>
        <ol className="space-y-2">
          {[
            { step: "1", text: 'Go to aistudio.google.com and sign in with your Google account' },
            { step: "2", text: 'Click "Get API Key" in the top menu' },
            { step: "3", text: 'Click "Create API Key" and select or create a Google Cloud project' },
            { step: "4", text: 'Copy the key (starts with "AIzaSy…") and paste it above' },
            { step: "5", text: 'Click Save — AI features will be active immediately' },
          ].map(item => (
            <li key={item.step} className="flex items-start gap-3">
              <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{item.step}</span>
              <span className="text-sm text-muted-foreground">{item.text}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

// ─── Site Settings Tab ────────────────────────────────────────────────────────

function SiteSettingsTab({ apiToken }: { apiToken: string }) {
  const { toast } = useToast();
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState("pricing");
  const authHeader = { Authorization: `Bearer ${apiToken}` };

  useEffect(() => {
    fetch(`${API_BASE}/api/site-settings`).then(r => r.json()).then(setSettings).catch(() => setSettings(DEFAULT_SETTINGS));
  }, []);

  const save = async (section: string, url: string, method: string, body: unknown) => {
    setSaving(section);
    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", ...authHeader },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error();
      toast({ title: `✅ ${section} saved!` });
    } catch {
      toast({ title: `Failed to save ${section}`, variant: "destructive" });
    } finally { setSaving(null); }
  };

  const updatePlan = (idx: number, field: keyof PricingPlan, value: string | boolean | string[]) => {
    if (!settings) return;
    const pricing = [...settings.pricing];
    pricing[idx] = { ...pricing[idx], [field]: value };
    setSettings({ ...settings, pricing });
  };

  if (!settings) return <div className="flex items-center justify-center py-20"><RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" /></div>;

  const sections = [
    { id: "pricing", label: "Pricing Plans", icon: <DollarSign className="w-4 h-4" /> },
    { id: "hero", label: "Hero Content", icon: <Sparkles className="w-4 h-4" /> },
    { id: "contact", label: "Contact Info", icon: <MessageSquare className="w-4 h-4" /> },
    { id: "outreach", label: "Email Outreach", icon: <Mail className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-bold text-lg">Site Settings</h2>
        <p className="text-sm text-muted-foreground">Edit your pricing, hero content, contact details and outreach templates</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {sections.map(s => (
          <button key={s.id} onClick={() => setActiveSection(s.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeSection === s.id ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"}`}>
            {s.icon} {s.label}
          </button>
        ))}
      </div>

      {activeSection === "pricing" && (
        <div className="rounded-xl border border-border/60 bg-card p-5 space-y-5">
          {settings.pricing.map((plan, idx) => (
            <div key={plan.id} className="rounded-lg border border-border/50 p-4 space-y-4">
              <div className="flex items-center gap-3">
                <Badge variant={plan.popular ? "default" : "secondary"}>{plan.popular ? "Most Popular" : "Standard"}</Badge>
                <span className="font-semibold">{plan.name}</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs text-muted-foreground mb-1 block">Plan Name</label><Input value={plan.name} onChange={(e) => updatePlan(idx, "name", e.target.value)} /></div>
                <div><label className="text-xs text-muted-foreground mb-1 block">Price</label><Input value={plan.price} onChange={(e) => updatePlan(idx, "price", e.target.value)} /></div>
              </div>
              <div><label className="text-xs text-muted-foreground mb-1 block">Description</label><Input value={plan.description} onChange={(e) => updatePlan(idx, "description", e.target.value)} /></div>
              <div><label className="text-xs text-muted-foreground mb-1 block">Features (one per line)</label><Textarea rows={4} value={plan.features.join("\n")} onChange={(e) => updatePlan(idx, "features", e.target.value.split("\n").filter(Boolean))} /></div>
              <div className="flex items-center gap-2"><Switch checked={plan.popular} onCheckedChange={(v) => updatePlan(idx, "popular", v)} /><label className="text-sm">Mark as Most Popular</label></div>
            </div>
          ))}
          <Button onClick={() => save("pricing", `${API_BASE}/api/admin/site-settings/pricing`, "PUT", settings.pricing)} disabled={saving === "pricing"}>
            {saving === "pricing" ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />} Save Pricing
          </Button>
        </div>
      )}

      {activeSection === "hero" && (
        <div className="rounded-xl border border-border/60 bg-card p-5 space-y-4">
          <div><label className="text-xs text-muted-foreground mb-1 block">Main Headline</label><Textarea rows={3} value={settings.hero.headline} onChange={(e) => setSettings({ ...settings, hero: { ...settings.hero, headline: e.target.value } })} /></div>
          <div><label className="text-xs text-muted-foreground mb-1 block">Sub-headline</label><Textarea rows={3} value={settings.hero.subheadline} onChange={(e) => setSettings({ ...settings, hero: { ...settings.hero, subheadline: e.target.value } })} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs text-muted-foreground mb-1 block">Primary Button</label><Input value={settings.hero.ctaPrimary} onChange={(e) => setSettings({ ...settings, hero: { ...settings.hero, ctaPrimary: e.target.value } })} /></div>
            <div><label className="text-xs text-muted-foreground mb-1 block">Secondary Button</label><Input value={settings.hero.ctaSecondary} onChange={(e) => setSettings({ ...settings, hero: { ...settings.hero, ctaSecondary: e.target.value } })} /></div>
          </div>
          <Button onClick={() => save("hero", `${API_BASE}/api/admin/site-settings/hero`, "PATCH", settings.hero)} disabled={saving === "hero"}>
            {saving === "hero" ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />} Save Hero Content
          </Button>
        </div>
      )}

      {activeSection === "contact" && (
        <div className="rounded-xl border border-border/60 bg-card p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs text-muted-foreground mb-1 block">WhatsApp Number (with +)</label><Input placeholder="+15550000000" value={settings.contact.whatsapp} onChange={(e) => setSettings({ ...settings, contact: { ...settings.contact, whatsapp: e.target.value } })} /></div>
            <div><label className="text-xs text-muted-foreground mb-1 block">WhatsApp Display Text</label><Input placeholder="+1 (555) 000-0000" value={settings.contact.whatsappDisplay} onChange={(e) => setSettings({ ...settings, contact: { ...settings.contact, whatsappDisplay: e.target.value } })} /></div>
          </div>
          <div><label className="text-xs text-muted-foreground mb-1 block">Email Address</label><Input type="email" value={settings.contact.email} onChange={(e) => setSettings({ ...settings, contact: { ...settings.contact, email: e.target.value } })} /></div>
          <Button onClick={() => save("contact", `${API_BASE}/api/admin/site-settings/contact`, "PATCH", settings.contact)} disabled={saving === "contact"}>
            {saving === "contact" ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />} Save Contact Info
          </Button>
        </div>
      )}

      {activeSection === "outreach" && <EmailOutreachSection />}
    </div>
  );
}

// ─── Email Outreach Section ───────────────────────────────────────────────────

function EmailOutreachSection() {
  const DEFAULT_TEMPLATE = `Hi {{name}},

I came across your business and thought you might benefit from a custom software solution tailored for companies like yours.

We specialise in building {{service}} — helping businesses like {{company}} save time, reduce manual work, and grow revenue.

We'd love to offer you a free consultation to see how we can help.

Would you be open to a quick chat?

Best,
[Your Name]
DevStudio — devstudio.com`;

  const [leads, setLeads] = useState<Lead[]>(() => {
    try { return JSON.parse(localStorage.getItem("ds_leads") || "[]"); } catch { return []; }
  });
  const [emailTemplate, setEmailTemplate] = useState(() => localStorage.getItem("ds_email_template") || DEFAULT_TEMPLATE);
  const [newLead, setNewLead] = useState({ name: "", email: "", company: "", role: "", service: "", note: "" });
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [composing, setComposing] = useState<Lead | null>(null);
  const [composedEmail, setComposedEmail] = useState("");

  const saveLeads = (updated: Lead[]) => { setLeads(updated); localStorage.setItem("ds_leads", JSON.stringify(updated)); };
  const addLead = () => {
    if (!newLead.email) return;
    saveLeads([{ ...newLead, id: Date.now(), status: "new", addedAt: new Date().toISOString() }, ...leads]);
    setNewLead({ name: "", email: "", company: "", role: "", service: "", note: "" });
    setIsAddOpen(false);
  };
  const removeLead = (id: number) => { if (confirm("Remove this lead?")) saveLeads(leads.filter(l => l.id !== id)); };
  const updateLeadStatus = (id: number, status: Lead["status"]) => saveLeads(leads.map(l => l.id === id ? { ...l, status } : l));
  const composeEmail = (lead: Lead) => {
    setComposedEmail(emailTemplate.replace(/\{\{name\}\}/g, lead.name || "there").replace(/\{\{service\}\}/g, lead.service || "[Service]").replace(/\{\{company\}\}/g, lead.company || "your company"));
    setComposing(lead);
  };
  const openMailto = (lead: Lead) => {
    window.open(`mailto:${lead.email}?subject=${encodeURIComponent(`Custom Software for ${lead.company || "Your Business"}`)}&body=${encodeURIComponent(composedEmail)}`, "_blank");
    updateLeadStatus(lead.id, "contacted");
    setComposing(null);
  };

  return (
    <div className="rounded-xl border border-border/60 bg-card p-5 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-sm">Email Outreach Tracker</h3>
          <p className="text-xs text-muted-foreground">{leads.length} leads tracked</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild><Button size="sm" className="gap-1.5"><Plus className="w-4 h-4" /> Add Lead</Button></DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>Add New Lead</DialogTitle></DialogHeader>
            <div className="space-y-3 mt-2">
              {[{ key: "name", label: "Name", placeholder: "Contact name" }, { key: "email", label: "Email *", placeholder: "email@company.com" }, { key: "company", label: "Company", placeholder: "Company name" }, { key: "role", label: "Role", placeholder: "CEO, Founder…" }, { key: "service", label: "Service to pitch", placeholder: "Booking system, CRM…" }].map(f => (
                <div key={f.key}>
                  <label className="text-xs font-semibold text-muted-foreground mb-1 block">{f.label}</label>
                  <Input placeholder={f.placeholder} value={(newLead as any)[f.key]} onChange={(e) => setNewLead(p => ({ ...p, [f.key]: e.target.value }))} />
                </div>
              ))}
              <Textarea placeholder="Note" value={newLead.note} onChange={(e) => setNewLead(p => ({ ...p, note: e.target.value }))} rows={2} />
              <Button onClick={addLead} className="w-full" disabled={!newLead.email}>Add Lead</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 rounded-xl border border-border/50 overflow-hidden">
          {leads.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <Target className="w-8 h-8 mx-auto mb-2 opacity-20" />
              <p className="text-sm">No leads yet. Add your first prospect.</p>
            </div>
          ) : (
            <div className="divide-y divide-border/40">
              {leads.map(lead => (
                <div key={lead.id} className="p-3 flex items-start gap-3 hover:bg-muted/20">
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm flex items-center justify-center shrink-0">
                    {(lead.name || lead.email).slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm">{lead.name || "—"} <span className="text-xs text-muted-foreground font-normal">{lead.email}</span></div>
                    {lead.company && <div className="text-xs text-muted-foreground">{lead.company} {lead.role && `· ${lead.role}`}</div>}
                    {lead.service && <div className="text-xs text-primary/80 font-medium">Pitch: {lead.service}</div>}
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Select value={lead.status} onValueChange={(v) => updateLeadStatus(lead.id, v as Lead["status"])}>
                      <SelectTrigger className="w-[110px] h-7 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">🔵 New</SelectItem>
                        <SelectItem value="contacted">📧 Contacted</SelectItem>
                        <SelectItem value="replied">💬 Replied</SelectItem>
                        <SelectItem value="converted">✅ Converted</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button size="sm" variant="outline" className="h-7 px-2 text-xs gap-1" onClick={() => composeEmail(lead)}><Send className="w-3 h-3" /> Email</Button>
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive/60 hover:text-destructive" onClick={() => removeLead(lead.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          {composing ? (
            <div className="rounded-xl border border-primary/30 overflow-hidden">
              <div className="p-3 border-b bg-primary/5"><h4 className="text-xs font-bold">Email to {composing.name || composing.email}</h4></div>
              <div className="p-3 space-y-2">
                <Textarea value={composedEmail} onChange={(e) => setComposedEmail(e.target.value)} rows={12} className="text-xs font-mono resize-none" />
                <div className="flex gap-2">
                  <Button className="flex-1 text-xs gap-1" onClick={() => openMailto(composing)}><Send className="w-3 h-3" /> Open in Email App</Button>
                  <Button variant="outline" size="sm" onClick={() => setComposing(null)}>Cancel</Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-border/50 overflow-hidden">
              <div className="p-3 border-b bg-muted/20"><h4 className="text-xs font-bold">Email Template</h4><p className="text-xs text-muted-foreground">Uses {"{{name}}"}, {"{{service}}"}, {"{{company}}"}</p></div>
              <div className="p-3">
                <Textarea value={emailTemplate} onChange={(e) => { setEmailTemplate(e.target.value); localStorage.setItem("ds_email_template", e.target.value); }} rows={14} className="text-xs font-mono resize-none" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
