import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
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
  Bot, Settings, Globe, Radar, PlayCircle, StopCircle, MailCheck, X,
} from "lucide-react";
import { toast as sonnerToast } from "sonner";
import API_BASE from "@/lib/api";

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
    { id: "flutterwave", name: "Flutterwave", enabled: false, details: "" },
    { id: "lemonsqueezy", name: "Lemon Squeezy", enabled: false, details: "" },
    { id: "bank", name: "Bank Transfer", enabled: true, details: "" },
    { id: "crypto_usdt", name: "Crypto — USDT (TRC20/ERC20)", enabled: false, details: "" },
    { id: "crypto_btc", name: "Crypto — Bitcoin (BTC)", enabled: false, details: "" },
  ],
  contact: { whatsapp: "+1234567890", email: "hello@devstudio.com", whatsappDisplay: "+1 (234) 567-890" },
  hero: { headline: "We Build Software That Helps Your Business Get More Customers & Save Time.", subheadline: "From booking systems and customer portals to AI-powered tools and SaaS platforms — we build custom software that grows your revenue.", ctaPrimary: "Get My Free Business Tool Idea", ctaSecondary: "View Examples" },
};

// ─── Main Admin Component ─────────────────────────────────────────────────────

export default function Admin() {
  const { toast } = useToast();
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [apiToken, setApiToken] = useState<string>(() => localStorage.getItem("ds_api_token") ?? "");
  const loginMutation = useAdminLogin();

  const login = () => {
    if (!password) return;
    loginMutation.mutate({ data: { password } }, {
      onSuccess: (data) => {
        const tok = data.token;
        if (!tok) {
          toast({ title: "Login failed", description: "No token returned", variant: "destructive" });
          return;
        }
        setApiToken(tok);
        localStorage.setItem("ds_api_token", tok);
        setAuthed(true);
      },
      onError: () => {
        toast({ title: "Wrong password", variant: "destructive" });
      },
    });
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
          <p className="text-xs text-center text-muted-foreground">Enter your admin password to continue.</p>
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
            <Button variant="ghost" size="sm" onClick={() => { localStorage.removeItem("ds_api_token"); setAuthed(false); setApiToken(""); }}>
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
            <TabsTrigger value="automation" className="gap-1.5 text-xs sm:text-sm">
              <Radar className="w-3.5 h-3.5" /> Automation
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
          <TabsContent value="automation"><AutomationTab apiToken={apiToken} /></TabsContent>
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
  const { data: customRequests, isLoading } = useGetAdminCustomRequests(requestOptions);
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
  const { data: waitlist, isLoading } = useGetAdminWaitlist(requestOptions);

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
    {
      id: "paystack", label: "Paystack", icon: "🟢", color: "from-green-50 to-emerald-50 border-green-200",
      desc: "Accept cards, bank transfers, USSD & mobile money. Popular across Africa. Get keys at dashboard.paystack.com.",
      link: "https://dashboard.paystack.com/#/settings/developer",
      keys: [
        { key: "PAYSTACK_SECRET_KEY", label: "Secret Key", hint: "Starts with sk_live_ or sk_test_" },
        { key: "PAYSTACK_PUBLIC_KEY", label: "Public Key", hint: "Starts with pk_live_ or pk_test_" },
      ],
    },
    {
      id: "flutterwave", label: "Flutterwave", icon: "🦋", color: "from-orange-50 to-red-50 border-orange-200",
      desc: "Accept 30+ payment types across Africa & globally. Get keys at developer.flutterwave.com → API Keys.",
      link: "https://developer.flutterwave.com/docs/integration-guides/introduction",
      keys: [
        { key: "FLUTTERWAVE_SECRET_KEY", label: "Secret Key", hint: "From Flutterwave Dashboard → Settings → API Keys" },
        { key: "FLUTTERWAVE_PUBLIC_KEY", label: "Public Key", hint: "From Flutterwave Dashboard → Settings → API Keys" },
      ],
    },
    {
      id: "lemonsqueezy", label: "Lemon Squeezy", icon: "🍋", color: "from-yellow-50 to-lime-50 border-yellow-200",
      desc: "Sell digital products & subscriptions with built-in tax handling. Get keys at app.lemonsqueezy.com → Settings → API.",
      link: "https://app.lemonsqueezy.com/settings/api",
      keys: [
        { key: "LEMONSQUEEZY_API_KEY", label: "API Key", hint: "From Lemon Squeezy → Settings → API → Generate New API Key" },
        { key: "LEMONSQUEEZY_STORE_ID", label: "Store ID", hint: "Found in your Lemon Squeezy store URL or dashboard" },
      ],
    },
    {
      id: "crypto", label: "Crypto Wallets", icon: "₿", color: "from-violet-50 to-purple-50 border-violet-200",
      desc: "Accept Bitcoin & USDT directly to your wallets — no API keys needed. Just enter your wallet addresses in the payment methods section above.",
      link: "",
      keys: [],
    },
  ];

  const hasDirtyKeys = Object.values(keyValues).some(v => v.trim());

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-bold text-lg">Payment Setup</h2>
          <p className="text-sm text-muted-foreground">Enable payment methods and connect your payment processor API keys</p>
        </div>
        <a href="/pay" target="_blank" rel="noopener noreferrer" className="flex-shrink-0">
          <Button variant="outline" size="sm" className="gap-2 text-xs">
            <ExternalLink className="w-3.5 h-3.5" /> View Pay Page
          </Button>
        </a>
      </div>

      {/* Payment Methods Toggle */}
      <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
        <div className="p-5 border-b border-border/40 bg-muted/20">
          <h3 className="font-bold text-sm flex items-center gap-2"><CreditCard className="w-4 h-4 text-primary" /> Accepted Payment Methods</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Choose which methods to show on your site. Add details like account info below each.</p>
        </div>
        <div className="p-5 space-y-3">
          {settings?.paymentMethods.map((pm, idx) => {
            const isCrypto = pm.id === "crypto_usdt" || pm.id === "crypto_btc";
            const cryptoAddress = isCrypto ? pm.details.trim() : "";
            const qrValue = pm.id === "crypto_btc" && cryptoAddress ? `bitcoin:${cryptoAddress}` : cryptoAddress;

            return (
              <div key={pm.id} className={`rounded-xl border border-border/50 transition-colors ${pm.enabled ? "bg-card" : "bg-muted/10"}`}>
                <div className="flex items-center gap-4 p-4">
                  <Switch checked={pm.enabled} onCheckedChange={(v) => updatePayment(idx, "enabled", v)} />
                  <div className="w-36 font-semibold text-sm flex-shrink-0">{pm.name}</div>
                  <Input
                    className="flex-1"
                    placeholder={
                      pm.id === "paypal" ? "PayPal email or payment link" :
                      pm.id === "stripe" ? "Stripe payment link (optional)" :
                      pm.id === "paystack" ? "Paystack payment link (optional)" :
                      pm.id === "flutterwave" ? "Flutterwave payment link (optional)" :
                      pm.id === "lemonsqueezy" ? "Lemon Squeezy checkout URL" :
                      pm.id === "bank" ? "Bank name, account no., sort code" :
                      pm.id === "crypto_usdt" ? "USDT wallet address (TRC20 or ERC20)" :
                      pm.id === "crypto_btc" ? "Bitcoin (BTC) wallet address" :
                      "Details"
                    }
                    value={pm.details}
                    onChange={(e) => updatePayment(idx, "details", e.target.value)}
                  />
                  <Badge variant={pm.enabled ? "default" : "secondary"} className={pm.enabled ? "bg-green-100 text-green-700 border-green-200 hover:bg-green-100" : ""}>
                    {pm.enabled ? "Active" : "Off"}
                  </Badge>
                </div>
                {/* Inline QR preview for crypto wallets */}
                {isCrypto && cryptoAddress && (
                  <div className="px-4 pb-4 flex items-start gap-4 border-t border-border/30 pt-3">
                    <div className="bg-white rounded-xl p-3 border border-violet-100 shadow-sm flex-shrink-0">
                      <QRCodeSVG value={qrValue} size={96} level="M" fgColor="#4c1d95" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-violet-700 mb-1">QR Preview</p>
                      <p className="font-mono text-xs text-muted-foreground break-all leading-relaxed">{cryptoAddress}</p>
                      <p className="text-xs text-muted-foreground mt-2">This QR code is shown to clients on the <a href="/pay" target="_blank" className="text-primary underline">/pay page</a>.</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
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
                {group.link && (
                  <a href={group.link} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm" className="text-xs gap-1 bg-white/80 border-white h-7">
                      Get Keys <ExternalLink className="w-3 h-3" />
                    </Button>
                  </a>
                )}
              </div>
              {group.keys.length === 0 && (
                <div className="bg-white/80 rounded-lg border border-white p-3 text-xs text-muted-foreground flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-violet-500 flex-shrink-0" />
                  Enter your wallet addresses in the <span className="font-semibold text-foreground">Accepted Payment Methods</span> section above — no API keys needed for crypto.
                </div>
              )}
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

// ─── Brevo Setup Section (used inside AISetupTab) ─────────────────────────────

function BrevoSetupSection({ apiToken, apiKeys, onRefresh }: {
  apiToken: string;
  apiKeys: Record<string, { masked: string; set: boolean }>;
  onRefresh: () => void;
}) {
  const { toast } = useToast();
  const [smtpUser, setSmtpUser] = useState("");
  const [smtpKey, setSmtpKey] = useState("");
  const [keyVisible, setKeyVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null);
  const authHeader = { Authorization: `Bearer ${apiToken}` };

  const isUserSet = apiKeys["BREVO_SMTP_USER"]?.set;
  const isKeySet = apiKeys["BREVO_SMTP_KEY"]?.set;
  const isConnected = isUserSet && isKeySet;

  const save = async () => {
    if (!smtpUser.trim() && !smtpKey.trim()) {
      toast({ title: "Enter at least one field to update", variant: "destructive" }); return;
    }
    setSaving(true);
    try {
      const body: Record<string, string> = {};
      if (smtpUser.trim()) body["BREVO_SMTP_USER"] = smtpUser.trim();
      if (smtpKey.trim()) body["BREVO_SMTP_KEY"] = smtpKey.trim();
      const res = await fetch(`${API_BASE}/api/admin/api-keys`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error();
      toast({ title: "✅ Brevo credentials saved!" });
      setSmtpUser(""); setSmtpKey(""); setTestResult(null);
      onRefresh();
    } catch {
      toast({ title: "Failed to save", variant: "destructive" });
    } finally { setSaving(false); }
  };

  const remove = async (key: string) => {
    await fetch(`${API_BASE}/api/admin/api-keys/${key}`, { method: "DELETE", headers: authHeader });
    toast({ title: `${key} removed` });
    onRefresh();
  };

  const testBrevo = async () => {
    setTesting(true); setTestResult(null);
    try {
      const res = await fetch(`${API_BASE}/api/brevo/verify`, { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setTestResult({ ok: true, message: "✅ Brevo SMTP connected and verified!" });
      } else {
        setTestResult({ ok: false, message: `❌ ${data.error || "Connection failed"}` });
      }
    } catch {
      setTestResult({ ok: false, message: "❌ Could not reach Brevo. Check your credentials." });
    } finally { setTesting(false); }
  };

  return (
    <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
      <div className="p-5 border-b border-border/40 bg-gradient-to-r from-blue-50 to-cyan-50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm flex items-center gap-2">
              <Mail className="w-4 h-4 text-blue-600" /> Brevo SMTP (Email Sending)
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">300 free emails/day. Powers automated outreach & notifications.</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={isConnected ? "bg-green-600 text-white" : "bg-orange-200 text-orange-800 border-orange-300"}>
              {isConnected ? "✅ Connected" : "⚠️ Not Set"}
            </Badge>
            <a href="https://app.brevo.com/settings/keys/smtp" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm" className="text-xs gap-1 bg-white h-7">
                Brevo Dashboard <ExternalLink className="w-3 h-3" />
              </Button>
            </a>
          </div>
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* Current values */}
        {(isUserSet || isKeySet) && (
          <div className="space-y-2">
            {isUserSet && (
              <div className="flex items-center gap-3 px-4 py-2.5 bg-green-50 rounded-lg border border-green-200">
                <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-muted-foreground">SMTP Login</p>
                  <p className="font-mono text-sm">{apiKeys["BREVO_SMTP_USER"]?.masked}</p>
                </div>
                <button className="text-xs text-destructive/70 hover:text-destructive flex items-center gap-1" onClick={() => remove("BREVO_SMTP_USER")}>
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            )}
            {isKeySet && (
              <div className="flex items-center gap-3 px-4 py-2.5 bg-green-50 rounded-lg border border-green-200">
                <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-muted-foreground">SMTP API Key</p>
                  <p className="font-mono text-sm">{apiKeys["BREVO_SMTP_KEY"]?.masked}</p>
                </div>
                <button className="text-xs text-destructive/70 hover:text-destructive flex items-center gap-1" onClick={() => remove("BREVO_SMTP_KEY")}>
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Input fields */}
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">
              {isUserSet ? "Replace SMTP Login" : "SMTP Login (email)"}
            </label>
            <Input
              placeholder="b038ba001@smtp-brevo.com"
              value={smtpUser}
              onChange={e => setSmtpUser(e.target.value)}
              className="font-mono h-9 text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">
              {isKeySet ? "Replace SMTP API Key" : "SMTP API Key"}
            </label>
            <div className="relative">
              <Input
                type={keyVisible ? "text" : "password"}
                placeholder="xsmtpsib-…"
                value={smtpKey}
                onChange={e => setSmtpKey(e.target.value)}
                className="font-mono h-9 text-sm pr-9"
              />
              <button type="button"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={() => setKeyVisible(v => !v)}>
                {keyVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          Get your SMTP key at <a href="https://app.brevo.com/settings/keys/smtp" target="_blank" rel="noopener noreferrer" className="text-primary underline">app.brevo.com → SMTP & API → Generate SMTP key</a>. Login is the email shown on that page.
        </p>

        <div className="flex gap-2">
          <Button onClick={save} disabled={saving || (!smtpUser.trim() && !smtpKey.trim())} className="gap-2 flex-1">
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? "Saving…" : "Save Brevo Credentials"}
          </Button>
          <Button variant="outline" onClick={testBrevo} disabled={testing || !isConnected} className="gap-2">
            {testing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <MailCheck className="w-4 h-4" />}
            {testing ? "Testing…" : "Test"}
          </Button>
        </div>

        {testResult && (
          <div className={`rounded-lg p-3 text-sm font-medium ${testResult.ok ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
            {testResult.message}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── AI Setup Tab ─────────────────────────────────────────────────────────────

function AISetupTab({ apiToken }: { apiToken: string }) {
  const { toast } = useToast();
  const [apiKeys, setApiKeys] = useState<Record<string, { masked: string; set: boolean; viaIntegration?: boolean }>>({});
  const [geminiPool, setGeminiPool] = useState<{ id: string; label: string; masked: string; addedAt: string }[]>([]);
  const [viaIntegration, setViaIntegration] = useState(false);
  const [geminiKey, setGeminiKey] = useState("");
  const [geminiLabel, setGeminiLabel] = useState("");
  const [geminiVisible, setGeminiVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null);

  const authHeader = { Authorization: `Bearer ${apiToken}` };

  const loadGeminiKeys = () =>
    fetch(`${API_BASE}/api/admin/gemini-keys`, { headers: authHeader })
      .then(r => r.json())
      .then((d) => { setViaIntegration(!!d.viaIntegration); setGeminiPool(d.keys || []); })
      .catch(() => {});

  useEffect(() => {
    fetch(`${API_BASE}/api/admin/api-keys`, { headers: authHeader })
      .then(r => r.json()).then(setApiKeys).catch(() => {});
    loadGeminiKeys();
  }, []);

  const isGeminiSet = viaIntegration || geminiPool.length > 0;
  const isViaIntegration = viaIntegration;

  const addGeminiKey = async () => {
    if (!geminiKey.trim()) { toast({ title: "Please enter a key", variant: "destructive" }); return; }
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/gemini-keys`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader },
        body: JSON.stringify({ apiKey: geminiKey.trim(), label: geminiLabel.trim() || undefined }),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(d.error || "Failed to save key");
      toast({ title: geminiPool.length > 0 ? "✅ Gemini key added to rotation!" : "✅ Gemini AI key saved!" });
      setGeminiKey("");
      setGeminiLabel("");
      setTestResult(null);
      await loadGeminiKeys();
    } catch (e: any) {
      toast({ title: e.message || "Failed to save key", variant: "destructive" });
    } finally { setSaving(false); }
  };

  const removeGeminiKey = async (id: string) => {
    if (!confirm(geminiPool.length <= 1 ? "Remove this Gemini API key? AI features will stop working." : "Remove this key from the rotation?")) return;
    await fetch(`${API_BASE}/api/admin/gemini-keys/${id}`, { method: "DELETE", headers: authHeader });
    toast({ title: "Gemini key removed" });
    setTestResult(null);
    await loadGeminiKeys();
  };

  const testAI = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch(`${API_BASE}/api/ai/recommend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessName: "Test Business", industry: "Restaurant", description: "A small local restaurant", challenges: "No online presence", goal: "Get more customers" }),
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
              </div>
            </div>
          ) : (
            <>
              {geminiPool.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-muted-foreground">
                      {geminiPool.length > 1 ? `${geminiPool.length} keys in rotation` : "Active key"}
                    </label>
                    {geminiPool.length > 1 && (
                      <Badge className="bg-indigo-100 text-indigo-700 border-indigo-200 text-[10px]">🔁 Rotating requests across keys</Badge>
                    )}
                  </div>
                  {geminiPool.map((k) => (
                    <div key={k.id} className="flex items-center gap-3 px-4 py-3 bg-green-50 rounded-lg border border-green-200">
                      <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold text-green-800">{k.label}</div>
                        <span className="font-mono text-sm text-muted-foreground">{k.masked}</span>
                      </div>
                      <button className="text-xs text-destructive/70 hover:text-destructive font-medium flex items-center gap-1" onClick={() => removeGeminiKey(k.id)}>
                        <Trash2 className="w-3 h-3" /> Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="grid sm:grid-cols-[1fr_140px] gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-2 block">
                    {geminiPool.length > 0 ? "Add Another Key (optional, for rotation)" : "Enter Gemini API Key"}
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
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-2 block">Label (optional)</label>
                  <Input
                    placeholder={`Key ${geminiPool.length + 1}`}
                    value={geminiLabel}
                    onChange={(e) => setGeminiLabel(e.target.value)}
                    className="h-10"
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground -mt-2">
                Go to <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-primary underline">aistudio.google.com</a> → Sign in → Create API Key → Copy & paste here.
                {geminiPool.length > 0 && " Adding more keys is optional — each request will rotate automatically across all saved keys to help spread out free-tier rate limits."}
              </p>

              <Button onClick={addGeminiKey} disabled={saving || !geminiKey.trim()} className="gap-2 w-full">
                {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? "Saving…" : geminiPool.length > 0 ? "Add Key to Rotation" : "Save API Key"}
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

      {/* ── Brevo SMTP ── */}
      <BrevoSetupSection apiToken={apiToken} apiKeys={apiKeys} onRefresh={() =>
        fetch(`${API_BASE}/api/admin/api-keys`, { headers: { Authorization: `Bearer ${apiToken}` } })
          .then(r => r.json()).then(setApiKeys).catch(() => {})
      } />

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

// ─── Automation Tab ───────────────────────────────────────────────────────────

const CATEGORIES = [
  // Real Estate & Property
  "Real Estate Agency", "Property Management", "Real Estate Developer",
  "Mortgage Broker", "Interior Designer", "Architecture Firm",
  // Food & Beverage
  "Restaurant", "Bakery", "Café / Coffee Shop", "Bar & Lounge",
  "Catering", "Food Truck", "Juice Bar", "Ice Cream Shop",
  // Health & Medical
  "Hospital", "Clinic", "Dentist", "Pharmacy", "Optician",
  "Physiotherapy", "Chiropractic", "Mental Health Practice", "Vet Clinic",
  // Beauty & Wellness
  "Salon", "Barbershop", "Spa & Wellness", "Nail Studio", "Tattoo Studio",
  // Fitness
  "Gym", "Yoga Studio", "Pilates Studio", "Martial Arts School",
  // Automotive
  "Car Dealer", "Auto Repair", "Car Wash", "Car Rental",
  // Professional Services
  "Lawyer", "Accountant", "Insurance", "Consultant", "Financial Advisor",
  "Recruiting Agency", "Marketing Agency", "Advertising Agency",
  // Education
  "School", "Tutoring Center", "Driving School", "Language School",
  "Music School", "Dance Studio",
  // Retail & Shopping
  "Supermarket", "Clothing Store", "Electronics Store", "Furniture Store",
  "Jewellery Store", "Pet Shop", "Book Store", "Gift Shop",
  // Hospitality & Travel
  "Hotel", "Guesthouse / B&B", "Hostel", "Travel Agency", "Tour Operator",
  // Events & Creative
  "Event Planner", "Photography Studio", "Videography Studio",
  "Wedding Planner", "Florist",
  // Home & Trade Services
  "Construction", "Electrician", "Plumber", "Landscaping",
  "Cleaning Service", "Security Company", "Pest Control",
  // Logistics & Transport
  "Logistics Company", "Courier Service", "Moving Company",
  // Technology
  "IT Services", "Printing & Design Studio", "Web Agency",
  // Religion & Community
  "Church", "Mosque", "Community Center", "NGO / Non-Profit",
  "Other",
];

interface EmailAccount {
  id: number; label: string; provider: string; host: string; port: number;
  secure: boolean; user: string; password: string; fromName: string;
  fromEmail: string; imapEnabled: boolean; imapHost: string; imapPort: number;
  active: boolean; lastError?: string | null; lastErrorAt?: string | null;
}

interface AutoSettings {
  id: number; autoHuntEnabled: boolean; huntCategory: string; huntCity: string;
  huntCountry: string; huntCount: number; huntExtraContext: string;
  huntIntervalHours: number; autoScore: boolean; autoEmail: boolean;
  emailDelayMinutes: number; autoReply: boolean;
  followUpEnabled: boolean; followUpDays: number;
  lastRunAt: string | null; nextRunAt: string | null;
  runStats: any;
}

function apiBase() { return API_BASE.replace("/agency-site", ""); }

function AutomationTab({ apiToken }: { apiToken: string }) {
  const authHeader = { Authorization: `Bearer ${apiToken}` };
  const [accounts, setAccounts] = useState<EmailAccount[]>([]);
  const [settings, setSettings] = useState<AutoSettings | null>(null);
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [runningNow, setRunningNow] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // New account form
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [newAcct, setNewAcct] = useState({ label: "", provider: "gmail", host: "smtp.gmail.com", port: 587, secure: false, user: "", password: "", fromName: "DevStudio", fromEmail: "", imapEnabled: false });
  const [addingAcct, setAddingAcct] = useState(false);
  const [testingId, setTestingId] = useState<number | null>(null);
  const [showPassId, setShowPassId] = useState<number | null>(null);
  const [editAcct, setEditAcct] = useState<EmailAccount | null>(null);
  const [editPass, setEditPass] = useState("");
  const [savingAcct, setSavingAcct] = useState(false);

  // Data Sources (Foursquare / TomTom / HERE API key pools)
  type PoolKey = { id: string; label: string; maskedKey: string };
  type PoolStatus = { count: number; active: boolean; envFallback: boolean };
  const [poolStatus, setPoolStatus] = useState<{ foursquare: PoolStatus; tomtom: PoolStatus; here: PoolStatus } | null>(null);
  const [openPool, setOpenPool] = useState<string | null>(null);
  const [poolKeys, setPoolKeys] = useState<PoolKey[]>([]);
  const [newPoolKey, setNewPoolKey] = useState("");
  const [newPoolLabel, setNewPoolLabel] = useState("");
  const [savingPool, setSavingPool] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [accts, setts, stat, pstat] = await Promise.all([
        fetch(`${apiBase()}/api/automation/email-accounts`, { headers: authHeader }).then(r => r.json()),
        fetch(`${apiBase()}/api/automation/settings`, { headers: authHeader }).then(r => r.json()),
        fetch(`${apiBase()}/api/automation/status`, { headers: authHeader }).then(r => r.json()),
        fetch(`${apiBase()}/api/api-pools/status`, { headers: authHeader }).then(r => r.json()).catch(() => null),
      ]);
      setAccounts(accts);
      setSettings(setts);
      setStatus(stat);
      if (pstat) setPoolStatus(pstat);
    } catch { setMsg({ type: "error", text: "Failed to load automation settings" }); }
    finally { setLoading(false); }
  };

  const openPoolPanel = async (provider: string) => {
    setOpenPool(provider);
    setNewPoolKey(""); setNewPoolLabel("");
    try {
      const r = await fetch(`${apiBase()}/api/api-pools/${provider}`, { headers: authHeader });
      const d = await r.json().catch(() => ({ keys: [] }));
      // API returns { id, label, masked } — normalize to our PoolKey shape
      const normalized: PoolKey[] = (d.keys ?? []).map((k: any) => ({
        id: String(k.id ?? ""),
        label: k.label || "Key",
        maskedKey: k.masked || k.maskedKey || "",
      }));
      setPoolKeys(normalized);
    } catch { setPoolKeys([]); }
  };

  const addPoolKey = async (provider: string) => {
    if (!newPoolKey.trim()) return;
    setSavingPool(true);
    try {
      const r = await fetch(`${apiBase()}/api/api-pools/${provider}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader },
        body: JSON.stringify({ apiKey: newPoolKey.trim(), label: newPoolLabel.trim() || undefined }),
      });
      if (!r.ok) { const d = await r.json().catch(() => ({})); throw new Error(d.error || "Failed to save"); }
      setNewPoolKey(""); setNewPoolLabel("");
      await openPoolPanel(provider);
      const ps = await fetch(`${apiBase()}/api/api-pools/status`, { headers: authHeader }).then(r => r.json()).catch(() => null);
      if (ps) setPoolStatus(ps);
    } catch (e: any) { setMsg({ type: "error", text: e.message }); }
    finally { setSavingPool(false); }
  };

  const removePoolKey = async (provider: string, id: string) => {
    try {
      const r = await fetch(`${apiBase()}/api/api-pools/${provider}/${id}`, { method: "DELETE", headers: authHeader });
      if (!r.ok) { const d = await r.json().catch(() => ({})); throw new Error(d.error || `Delete failed (${r.status})`); }
      await openPoolPanel(provider);
      const ps = await fetch(`${apiBase()}/api/api-pools/status`, { headers: authHeader }).then(r2 => r2.json()).catch(() => null);
      if (ps) setPoolStatus(ps);
    } catch (e: any) { setMsg({ type: "error", text: e.message }); }
  };

  useEffect(() => { load(); }, []);

  const saveSettings = async (patch: Partial<AutoSettings>) => {
    if (!settings) return;
    setSavingSettings(true); setMsg(null);
    try {
      const r = await fetch(`${apiBase()}/api/automation/settings`, {
        method: "PUT", headers: { "Content-Type": "application/json", ...authHeader }, body: JSON.stringify(patch),
      });
      const updated = await safeJson(r);
      if (!r.ok) throw new Error(updated.error || "Save failed");
      setSettings(updated);
      setMsg({ type: "success", text: "Settings saved." });
    } catch (e: any) { setMsg({ type: "error", text: e.message }); }
    finally { setSavingSettings(false); }
  };

  const toggleAuto = async () => {
    if (!settings) return;
    const newVal = !settings.autoHuntEnabled;
    setSettings(s => s ? { ...s, autoHuntEnabled: newVal } : s);
    await saveSettings({ autoHuntEnabled: newVal });
    await load();
  };

  const runNow = async () => {
    setRunningNow(true); setMsg(null);
    try {
      await fetch(`${apiBase()}/api/automation/run-now`, { method: "POST", headers: authHeader });
      setMsg({ type: "success", text: "Automation run started! Check back in a few minutes for results." });
      setTimeout(load, 3000);
    } catch { setMsg({ type: "error", text: "Failed to trigger run" }); }
    finally { setRunningNow(false); }
  };

  const addAccount = async () => {
    if (!newAcct.user) return;
    const validationError = validateCredentials(newAcct.provider, newAcct.password, newAcct.user);
    if (validationError) { setMsg({ type: "error", text: `⚠ ${validationError}` }); return; }
    setAddingAcct(true); setMsg(null);
    try {
      const r = await fetch(`${apiBase()}/api/automation/email-accounts`, {
        method: "POST", headers: { "Content-Type": "application/json", ...authHeader }, body: JSON.stringify(newAcct),
      });
      if (!r.ok) { const d = await safeJson(r); throw new Error(d.error); }
      setShowAddAccount(false);
      setNewAcct({ label: "", provider: "gmail", host: "smtp.gmail.com", port: 587, secure: false, user: "", password: "", fromName: "DevStudio", fromEmail: "", imapEnabled: false });
      setMsg({ type: "success", text: "Email account added." });
      await load();
    } catch (e: any) { setMsg({ type: "error", text: e.message }); }
    finally { setAddingAcct(false); }
  };

  const testAccount = async (id: number) => {
    setTestingId(id); setMsg(null);
    try {
      const r = await fetch(`${apiBase()}/api/automation/email-accounts/${id}/test`, { method: "POST", headers: { "Content-Type": "application/json", ...authHeader }, body: JSON.stringify({}) });
      const d = await safeJson(r);
      if (!r.ok) throw new Error(d.error);
      setMsg({ type: "success", text: "✓ Test email sent successfully! Check your inbox." });
    } catch (e: any) {
      const raw = e.message || "";
      let friendly = `Test failed: ${raw}`;
      if (raw.includes("534") || raw.includes("Application-specific password") || raw.includes("InvalidSecondFactor")) {
        friendly = "❌ Gmail rejected your password. You must use a 16-character App Password (not your regular Gmail password). Go to myaccount.google.com/apppasswords to generate one.";
      } else if (raw.includes("535") || raw.includes("Username and Password not accepted")) {
        friendly = "❌ Wrong email or password. Double-check your Gmail address and App Password.";
      } else if (raw.includes("ECONNREFUSED") || raw.includes("ETIMEDOUT")) {
        friendly = "❌ Cannot connect to SMTP server. Check your host/port settings.";
      }
      setMsg({ type: "error", text: friendly });
    }
    finally { setTestingId(null); }
  };

  const deleteAccount = async (id: number) => {
    await fetch(`${apiBase()}/api/automation/email-accounts/${id}`, { method: "DELETE", headers: authHeader });
    await load();
  };

  const saveEditAccount = async () => {
    if (!editAcct) return;
    if (editPass && editPass !== "••••••••") {
      const validationError = validateCredentials(editAcct.provider, editPass, editAcct.user);
      if (validationError) { setMsg({ type: "error", text: `⚠ ${validationError}` }); return; }
    }
    setSavingAcct(true);
    try {
      const body: any = { label: editAcct.label, fromName: editAcct.fromName, fromEmail: editAcct.fromEmail, active: editAcct.active, imapEnabled: editAcct.imapEnabled };
      if (editPass && editPass !== "••••••••") body.password = editPass;
      const r = await fetch(`${apiBase()}/api/automation/email-accounts/${editAcct.id}`, {
        method: "PUT", headers: { "Content-Type": "application/json", ...authHeader }, body: JSON.stringify(body),
      });
      if (!r.ok) { const d = await safeJson(r); throw new Error(d.error); }
      setEditAcct(null); setEditPass("");
      setMsg({ type: "success", text: "Account updated." });
      await load();
    } finally { setSavingAcct(false); }
  };

  const BLANK_ACCT = { label: "", user: "", password: "", fromName: "DevStudio", fromEmail: "", imapEnabled: false };

  async function safeJson(r: Response): Promise<any> {
    const text = await r.text();
    try { return JSON.parse(text); } catch {
      throw new Error(
        r.ok
          ? "Server returned an unexpected response. Please try again."
          : "Server is temporarily unavailable (it may be restarting). Please wait a few seconds and try again."
      );
    }
  }

  function validateCredentials(provider: string, password: string, user: string): string | null {
    const cleaned = password.replace(/\s/g, "");
    if (provider === "gmail" && cleaned.length > 0 && cleaned.length !== 16) {
      return `App Passwords are exactly 16 characters. You entered ${cleaned.length}.`;
    }
    if (provider === "sendgrid" && user.trim().length > 0 && user.trim().toLowerCase() !== "apikey") {
      return `SendGrid requires the username to be exactly "apikey".`;
    }
    if (provider === "resend" && user.trim().length > 0 && user.trim().toLowerCase() !== "resend") {
      return `Resend requires the username to be exactly "resend".`;
    }
    return null;
  }

  const applyProviderPreset = (provider: string) => {
    const presets: Record<string, { provider: string; host: string; port: number; secure: boolean; user: string }> = {
      brevo:    { provider: "brevo",    host: "smtp-relay.brevo.com",      port: 587, secure: false, user: "" },
      resend:   { provider: "resend",   host: "smtp.resend.com",           port: 587, secure: false, user: "resend" },
      sendgrid: { provider: "sendgrid", host: "smtp.sendgrid.net",         port: 587, secure: false, user: "apikey" },
      mailjet:  { provider: "mailjet",  host: "in-v3.mailjet.com",         port: 587, secure: false, user: "" },
      gmail:    { provider: "gmail",    host: "smtp.gmail.com",            port: 587, secure: false, user: "" },
      outlook:  { provider: "outlook",  host: "smtp-mail.outlook.com",     port: 587, secure: false, user: "" },
      smtp:     { provider: "smtp",     host: "",                          port: 587, secure: false, user: "" },
    };
    const preset = presets[provider];
    if (!preset) return;
    setNewAcct({ ...BLANK_ACCT, ...preset, password: "" });
  };

  const PROVIDER_INFO: Record<string, { label: string; free: string; userHint: string; passHint: string; signupUrl: string; passLabel: string }> = {
    brevo:    { label: "Brevo",     free: "300/day free", userHint: "your Brevo login email",        passHint: "SMTP key from Brevo dashboard",          signupUrl: "https://app.brevo.com/settings/keys/smtp", passLabel: "SMTP Key (from Brevo → SMTP & API)" },
    resend:   { label: "Resend",    free: "100/day free", userHint: "use: resend",                   passHint: "API key from Resend dashboard",           signupUrl: "https://resend.com/api-keys",              passLabel: "API Key (from Resend dashboard)" },
    sendgrid: { label: "SendGrid",  free: "100/day free", userHint: "use: apikey",                   passHint: "API key from SendGrid dashboard",         signupUrl: "https://app.sendgrid.com/settings/api_keys", passLabel: "API Key (from SendGrid → API Keys)" },
    mailjet:  { label: "Mailjet",   free: "200/day free", userHint: "Mailjet API Key (public key)",  passHint: "Mailjet Secret Key",                     signupUrl: "https://app.mailjet.com/account/apikeys",  passLabel: "Secret Key (from Mailjet → API Keys)" },
    gmail:    { label: "Gmail",     free: "~500/day",     userHint: "your Gmail address",            passHint: "16-char App Password (NOT your password)",signupUrl: "https://myaccount.google.com/apppasswords", passLabel: "App Password (16-char code from Google)" },
    outlook:  { label: "Outlook",   free: "~300/day",     userHint: "your Outlook/Hotmail address",  passHint: "your Microsoft account password",         signupUrl: "",                                         passLabel: "Password" },
    smtp:     { label: "Custom",    free: "varies",       userHint: "SMTP username",                 passHint: "SMTP password",                           signupUrl: "",                                         passLabel: "Password" },
  };

  if (loading) return (
    <div className="flex items-center justify-center py-16"><div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" /></div>
  );

  const s = settings;

  return (
    <div className="space-y-6 max-w-4xl">

      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <Radar className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-extrabold text-xl">AI Hunter Automation</h2>
            <p className="text-white/80 text-sm">Hunt → Score → Email — fully automatic or on-demand</p>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold ${s?.autoHuntEnabled ? "bg-green-400/20 text-green-200" : "bg-white/10 text-white/60"}`}>
              {s?.autoHuntEnabled ? <><span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />Auto ON</> : <><span className="w-2 h-2 rounded-full bg-white/30" />Manual</>}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 text-center">
          {[
            { v: status?.activeAccounts ?? 0, l: "Email Accounts" },
            { v: status?.stats?.hunted ?? 0, l: "Last Run Hunted" },
            { v: status?.stats?.emailed ?? 0, l: "Last Run Sent" },
          ].map(s => (
            <div key={s.l} className="bg-white/10 rounded-xl p-3">
              <div className="font-extrabold text-xl">{s.v}</div>
              <div className="text-white/70 text-xs mt-0.5">{s.l}</div>
            </div>
          ))}
        </div>
        {status?.lastRunAt && (
          <p className="text-white/60 text-xs mt-3">Last run: {new Date(status.lastRunAt).toLocaleString()}{status?.nextRunAt ? ` · Next: ${new Date(status.nextRunAt).toLocaleString()}` : ""}</p>
        )}
      </div>

      {msg && (
        <div className={`flex items-center gap-2 text-sm px-4 py-3 rounded-xl border ${msg.type === "success" ? "bg-green-50 text-green-800 border-green-200" : "bg-red-50 text-red-700 border-red-200"}`}>
          {msg.type === "success" ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> : <AlertTriangle className="w-4 h-4 flex-shrink-0" />}
          <span className="flex-1">{msg.text}</span>
          <button onClick={() => setMsg(null)}><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Auto / Manual toggle */}
      <div className="rounded-xl border border-border/50 overflow-hidden">
        <div className="p-4 bg-muted/20 border-b border-border/50 flex items-center justify-between">
          <div>
            <h3 className="font-bold">Automation Mode</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Switch between fully automatic hunting or manual control in the CRM</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-muted-foreground">Manual</span>
            <Switch checked={s?.autoHuntEnabled ?? false} onCheckedChange={toggleAuto} />
            <span className="text-sm font-medium text-green-700">Auto</span>
          </div>
        </div>
        <div className="p-4 flex gap-3">
          <Button onClick={runNow} disabled={runningNow} variant="outline" className="gap-2 font-semibold">
            {runningNow ? <RefreshCw className="w-4 h-4 animate-spin" /> : <PlayCircle className="w-4 h-4 text-green-600" />}
            {runningNow ? "Running…" : "Run Once Now"}
          </Button>
          <p className="text-xs text-muted-foreground self-center">Runs a full Hunt → Score → Email cycle immediately, regardless of mode.</p>
        </div>
      </div>

      {/* Hunt settings */}
      {s && (
        <div className="rounded-xl border border-border/50 overflow-hidden">
          <div className="p-4 bg-muted/20 border-b border-border/50">
            <h3 className="font-bold flex items-center gap-2"><Radar className="w-4 h-4 text-purple-600" /> Hunt Settings</h3>
          </div>
          <div className="p-4 grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">Business Category</label>
              <Select value={s.huntCategory} onValueChange={v => setSettings(p => p ? { ...p, huntCategory: v } : p)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent className="max-h-72 overflow-y-auto">{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">Businesses per Run</label>
              <Select value={String(s.huntCount)} onValueChange={v => setSettings(p => p ? { ...p, huntCount: Number(v) } : p)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{["5","10","15","20"].map(n => <SelectItem key={n} value={n}>{n} businesses</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">City *</label>
              <Input value={s.huntCity} onChange={e => setSettings(p => p ? { ...p, huntCity: e.target.value } : p)} placeholder="e.g. Lagos, London, Miami" />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">Country</label>
              <Input value={s.huntCountry} onChange={e => setSettings(p => p ? { ...p, huntCountry: e.target.value } : p)} placeholder="e.g. Nigeria, UK, USA" />
            </div>
            <div className="col-span-2">
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">Extra Context (optional)</label>
              <Input value={s.huntExtraContext} onChange={e => setSettings(p => p ? { ...p, huntExtraContext: e.target.value } : p)} placeholder="e.g. focus on mid-size businesses, luxury segment…" />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">Run Interval (hours)</label>
              <Select value={String(s.huntIntervalHours)} onValueChange={v => setSettings(p => p ? { ...p, huntIntervalHours: Number(v) } : p)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[["6","Every 6 hours"],["12","Every 12 hours"],["24","Every day"],["48","Every 2 days"],["168","Every week"]].map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Auto-pipeline toggles */}
          <div className="p-4 border-t border-border/50 space-y-3">
            <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wide">Automation Pipeline</h4>
            {[
              { key: "autoScore", label: "Auto-Score & Analyze", desc: "AI scores every hunted business and writes analysis automatically", icon: <Brain className="w-4 h-4 text-indigo-600" /> },
              { key: "autoEmail", label: "Auto-Send Cold Emails", desc: "Generates and sends personalized cold emails to each hunted business", icon: <Send className="w-4 h-4 text-purple-600" /> },
              { key: "autoReply", label: "Auto-Reply with Proposal", desc: "When a business replies, AI sends a full HTML proposal email automatically", icon: <MailCheck className="w-4 h-4 text-green-600" /> },
            ].map(({ key, label, desc, icon }) => (
              <div key={key} className={`flex items-center justify-between p-3 rounded-xl border ${(s as any)[key] ? "bg-purple-50 border-purple-200" : "bg-muted/20 border-border/40"}`}>
                <div className="flex items-center gap-3">
                  {icon}
                  <div>
                    <div className="text-sm font-bold">{label}</div>
                    <div className="text-xs text-muted-foreground">{desc}</div>
                  </div>
                </div>
                <Switch checked={(s as any)[key]} onCheckedChange={v => setSettings(p => p ? { ...p, [key]: v } : p)} />
              </div>
            ))}
          </div>

          {s.autoEmail && (
            <div className="p-4 border-t border-border/50 space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-2 block">Delay Between Emails</label>
                <Select value={String(s.emailDelayMinutes)} onValueChange={v => setSettings(p => p ? { ...p, emailDelayMinutes: Number(v) } : p)}>
                  <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {[["1","1 minute"],["2","2 minutes"],["3","3 minutes"],["4","4 minutes"],["5","5 minutes"],["10","10 minutes"],["15","15 minutes"],["20","20 minutes"],["30","30 minutes"],["60","1 hour"]].map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1.5">Emails rotate through your active accounts with this gap between each send.</p>
              </div>

              {/* Follow-up sequence */}
              <div className={`p-3 rounded-xl border ${s.followUpEnabled ? "bg-blue-50 border-blue-200" : "bg-muted/20 border-border/40"}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <RefreshCw className={`w-4 h-4 ${s.followUpEnabled ? "text-blue-600" : "text-muted-foreground"}`} />
                    <div>
                      <div className="text-sm font-bold">Auto Follow-Up</div>
                      <div className="text-xs text-muted-foreground">Automatically re-email non-openers after X days</div>
                    </div>
                  </div>
                  <Switch checked={s.followUpEnabled} onCheckedChange={v => setSettings(p => p ? { ...p, followUpEnabled: v } : p)} />
                </div>
                {s.followUpEnabled && (
                  <div className="mt-2 flex items-center gap-3">
                    <label className="text-xs font-semibold text-muted-foreground whitespace-nowrap">Follow up after</label>
                    <Select value={String(s.followUpDays)} onValueChange={v => setSettings(p => p ? { ...p, followUpDays: Number(v) } : p)}>
                      <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {[["2","2 days"],["3","3 days"],["4","4 days"],["5","5 days"],["7","7 days"],["10","10 days"]].map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <span className="text-xs text-muted-foreground">if no open detected</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {s.autoReply && (
            <div className="p-4 border-t border-orange-200 bg-orange-50">
              <div className="flex items-start gap-2 text-orange-800">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <div className="text-xs">
                  <strong>IMAP required for auto-reply.</strong> Enable IMAP access in your Gmail settings (Settings → Forwarding and POP/IMAP → Enable IMAP), then toggle "IMAP Enabled" on each email account below. The system checks for replies every 30 minutes.
                </div>
              </div>
            </div>
          )}

          <div className="p-4 border-t border-border/50">
            <Button onClick={() => saveSettings({ ...s })} disabled={savingSettings} className="gap-2 font-semibold">
              {savingSettings ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {savingSettings ? "Saving…" : "Save Hunt Settings"}
            </Button>
          </div>
        </div>
      )}

      {/* Email Accounts */}
      <div className="rounded-xl border border-border/50 overflow-hidden">
        <div className="p-4 bg-muted/20 border-b border-border/50 flex items-center justify-between">
          <div>
            <h3 className="font-bold flex items-center gap-2"><Mail className="w-4 h-4 text-blue-600" /> Email Accounts</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Add multiple Gmail/Outlook accounts. Emails rotate through active accounts with your configured delay.</p>
          </div>
          <Button size="sm" onClick={() => {
            setNewAcct({ ...BLANK_ACCT, provider: "gmail", host: "smtp.gmail.com", port: 587, secure: false });
            setShowAddAccount(v => !v);
          }} className="gap-1.5 font-semibold">
            <Plus className="w-3.5 h-3.5" /> Add Account
          </Button>
        </div>

        {showAddAccount && (() => {
          const pi = PROVIDER_INFO[newAcct.provider] || PROVIDER_INFO.smtp;
          return (
          <div className="p-4 border-b border-border/50 bg-blue-50/50 space-y-4">
            <h4 className="text-sm font-bold">Add New Email Account</h4>

            {/* Free providers row */}
            <div>
              <p className="text-xs font-semibold text-green-700 mb-2">✦ Free providers (recommended — no App Password needed)</p>
              <div className="grid grid-cols-4 gap-2">
                {(["brevo","resend","sendgrid","mailjet"] as const).map(id => {
                  const info = PROVIDER_INFO[id];
                  return (
                    <button key={id} onClick={() => applyProviderPreset(id)}
                      className={`flex flex-col items-center gap-0.5 p-2.5 rounded-xl border-2 text-sm font-bold transition-all ${newAcct.provider === id ? "border-green-500 bg-green-50 text-green-700" : "border-border/50 hover:border-green-400/60 bg-white"}`}>
                      <span>{info.label}</span>
                      <span className="text-xs font-normal text-green-600">{info.free}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Other providers row */}
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-2">Other options</p>
              <div className="grid grid-cols-3 gap-2">
                {(["gmail","outlook","smtp"] as const).map(id => {
                  const info = PROVIDER_INFO[id];
                  return (
                    <button key={id} onClick={() => applyProviderPreset(id)}
                      className={`flex flex-col items-center gap-0.5 p-2 rounded-xl border-2 text-sm font-semibold transition-all ${newAcct.provider === id ? "border-primary bg-primary/5 text-primary" : "border-border/50 hover:border-primary/40 bg-white"}`}>
                      <span>{info.label}</span>
                      <span className="text-xs font-normal text-muted-foreground">{info.free}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Provider-specific setup card */}
            {["brevo","resend","sendgrid","mailjet"].includes(newAcct.provider) && (
              <div className="rounded-xl border-2 border-green-400 bg-green-50 p-4 space-y-2">
                <div className="flex items-center gap-2 font-bold text-green-900 text-sm">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  {pi.label} — {pi.free}, no credit card required
                </div>
                <ol className="text-xs text-green-800 space-y-1 ml-6 list-decimal">
                  {newAcct.provider === "brevo" && <>
                    <li>Sign up free at <a href="https://www.brevo.com" target="_blank" rel="noopener noreferrer" className="underline font-bold">brevo.com</a></li>
                    <li>Go to <strong>SMTP & API → Generate a new SMTP key</strong></li>
                    <li>Use your <strong>Brevo login email</strong> as the username</li>
                    <li>Paste the SMTP key as the password below</li>
                  </>}
                  {newAcct.provider === "resend" && <>
                    <li>Sign up free at <a href="https://resend.com" target="_blank" rel="noopener noreferrer" className="underline font-bold">resend.com</a></li>
                    <li>Go to <strong>API Keys → Create API Key</strong></li>
                    <li>Set username to exactly: <strong>resend</strong></li>
                    <li>Paste your API key as the password below</li>
                    <li>You must verify a sending domain (free)</li>
                  </>}
                  {newAcct.provider === "sendgrid" && <>
                    <li>Sign up free at <a href="https://sendgrid.com" target="_blank" rel="noopener noreferrer" className="underline font-bold">sendgrid.com</a></li>
                    <li>Go to <strong>Settings → API Keys → Create API Key</strong></li>
                    <li>Set username to exactly: <strong>apikey</strong></li>
                    <li>Paste your API key as the password below</li>
                  </>}
                  {newAcct.provider === "mailjet" && <>
                    <li>Sign up free at <a href="https://mailjet.com" target="_blank" rel="noopener noreferrer" className="underline font-bold">mailjet.com</a></li>
                    <li>Go to <strong>Account → API Keys</strong></li>
                    <li>Use the <strong>API Key</strong> as username and <strong>Secret Key</strong> as password</li>
                  </>}
                </ol>
                {pi.signupUrl && (
                  <a href={pi.signupUrl} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 mt-1 px-3 py-1.5 bg-green-600 text-white text-xs font-bold rounded-lg hover:bg-green-700 transition-colors">
                    Open {pi.label} Dashboard →
                  </a>
                )}
              </div>
            )}

            {newAcct.provider === "gmail" && (
              <div className="rounded-xl border-2 border-amber-400 bg-amber-50 p-4 space-y-2">
                <div className="flex items-center gap-2 font-bold text-amber-900 text-sm">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  Gmail requires an App Password — your regular password will NOT work
                </div>
                <ol className="text-xs text-amber-800 space-y-1 ml-6 list-decimal">
                  <li>Go to your Google Account → <strong>Security</strong></li>
                  <li>Make sure <strong>2-Step Verification is ON</strong></li>
                  <li>Go to <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noopener noreferrer" className="underline font-bold text-amber-900">myaccount.google.com/apppasswords</a></li>
                  <li>Create one named "DevStudio CRM" → copy the <strong>16-character code</strong></li>
                </ol>
                <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 mt-1 px-3 py-1.5 bg-amber-600 text-white text-xs font-bold rounded-lg hover:bg-amber-700 transition-colors">
                  Open Google App Passwords →
                </a>
              </div>
            )}

            {/* Fields */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">Label (nickname)</label>
                <Input value={newAcct.label} onChange={e => setNewAcct(p => ({ ...p, label: e.target.value }))} placeholder={`e.g. ${pi.label} Main`} />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">Sender Name</label>
                <Input value={newAcct.fromName} onChange={e => setNewAcct(p => ({ ...p, fromName: e.target.value }))} placeholder="DevStudio" />
              </div>
              <div className="col-span-2">
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">
                  Username / Email
                  {pi.userHint && <span className="ml-1.5 text-muted-foreground font-normal">({pi.userHint})</span>}
                </label>
                <Input type={["resend","sendgrid"].includes(newAcct.provider) ? "text" : "email"}
                  value={newAcct.user} onChange={e => setNewAcct(p => ({ ...p, user: e.target.value }))}
                  placeholder={newAcct.provider === "resend" ? "resend" : newAcct.provider === "sendgrid" ? "apikey" : newAcct.provider === "mailjet" ? "your-api-key" : "you@gmail.com"} />
              </div>
              <div className="col-span-2">
                <label className="text-xs font-semibold text-muted-foreground mb-1 block font-bold">{pi.passLabel}</label>
                <Input type="password" value={newAcct.password} onChange={e => setNewAcct(p => ({ ...p, password: e.target.value }))}
                  placeholder={pi.passHint} />
                {newAcct.provider === "gmail" && newAcct.password.replace(/\s/g, "").length > 0 && newAcct.password.replace(/\s/g, "").length !== 16 && (
                  <p className="text-xs text-red-600 mt-1">⚠ App Passwords are exactly 16 characters. You entered {newAcct.password.replace(/\s/g, "").length}.</p>
                )}
              </div>
              {newAcct.provider === "smtp" && (
                <>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground mb-1 block">SMTP Host</label>
                    <Input value={newAcct.host} onChange={e => setNewAcct(p => ({ ...p, host: e.target.value }))} placeholder="smtp.example.com" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground mb-1 block">Port</label>
                    <Input type="number" value={newAcct.port} onChange={e => setNewAcct(p => ({ ...p, port: Number(e.target.value) }))} />
                  </div>
                </>
              )}
            </div>
            <div className="flex gap-2 mt-2">
              <Button onClick={addAccount} disabled={addingAcct || !newAcct.user} className="gap-2 font-semibold">
                {addingAcct ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                {addingAcct ? "Adding…" : "Add Account"}
              </Button>
              <Button variant="outline" onClick={() => setShowAddAccount(false)}>Cancel</Button>
            </div>
          </div>
          );
        })()}

        {accounts.length === 0 ? (
          <div className="py-10 text-center text-muted-foreground">
            <Mail className="w-8 h-8 mx-auto mb-2 opacity-20" />
            <p className="text-sm">No email accounts yet. Add your first Gmail account above.</p>
          </div>
        ) : (
          <div className="divide-y divide-border/30">
            {accounts.map(acct => (
              <div key={acct.id}>
                <div className="p-4 flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${acct.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                    {(acct.label || acct.user).slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm flex items-center gap-2">
                      {acct.label || acct.user}
                      {acct.active ? <span className="text-xs text-green-700 bg-green-100 px-2 py-0.5 rounded-full font-semibold">Active</span> : <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">Inactive</span>}
                      {acct.imapEnabled && <span className="text-xs text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">IMAP ON</span>}
                      {acct.active && acct.lastError && (
                        <span className="text-xs text-red-700 bg-red-100 px-2 py-0.5 rounded-full font-semibold" title={acct.lastError}>
                          ⚠ Failing
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">{acct.user} · {acct.provider} · {acct.fromName}</div>
                    {acct.active && acct.lastError && (
                      <div className="text-xs text-red-600 mt-1">
                        Last health check failed{acct.lastErrorAt ? ` (${new Date(acct.lastErrorAt).toLocaleString()})` : ""}: {acct.lastError}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => testAccount(acct.id)} disabled={testingId === acct.id}>
                      {testingId === acct.id ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                      Test
                    </Button>
                    <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => { setEditAcct(acct); setEditPass(""); }}>
                      <Settings className="w-3 h-3" /> Edit
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive/60 hover:text-destructive" onClick={() => deleteAccount(acct.id)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
                {editAcct?.id === acct.id && (
                  <div className="p-4 border-t border-blue-100 bg-blue-50/40 space-y-3">
                    <h4 className="text-sm font-bold">Edit Account</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground mb-1 block">Label</label>
                        <Input value={editAcct.label} onChange={e => setEditAcct(p => p ? { ...p, label: e.target.value } : p)} />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground mb-1 block">Sender Name</label>
                        <Input value={editAcct.fromName} onChange={e => setEditAcct(p => p ? { ...p, fromName: e.target.value } : p)} />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground mb-1 block">From Email (optional)</label>
                        <Input value={editAcct.fromEmail} onChange={e => setEditAcct(p => p ? { ...p, fromEmail: e.target.value } : p)} placeholder="same as login if empty" />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground mb-1 block">New Password (leave blank to keep)</label>
                        <Input type="password" value={editPass} onChange={e => setEditPass(e.target.value)} placeholder="••••••••" />
                        {editPass && validateCredentials(editAcct.provider, editPass, editAcct.user) && (
                          <p className="text-xs text-red-600 mt-1">⚠ {validateCredentials(editAcct.provider, editPass, editAcct.user)}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Switch checked={editAcct.active} onCheckedChange={v => setEditAcct(p => p ? { ...p, active: v } : p)} />
                        <label className="text-sm font-medium">Active</label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch checked={editAcct.imapEnabled} onCheckedChange={v => setEditAcct(p => p ? { ...p, imapEnabled: v } : p)} />
                        <label className="text-sm font-medium">IMAP Enabled (for auto-reply)</label>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={saveEditAccount} disabled={savingAcct} className="gap-2 font-semibold">
                        {savingAcct ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Save
                      </Button>
                      <Button variant="outline" onClick={() => setEditAcct(null)}>Cancel</Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Data Sources — third-party API key pools */}
      <div className="rounded-xl border border-border/50 overflow-hidden">
        <div className="p-4 bg-muted/20 border-b border-border/50">
          <h3 className="font-bold flex items-center gap-2"><Globe className="w-4 h-4 text-blue-600" /> Data Sources</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Optional API keys to unlock more business directories. The hunter always uses free sources (OpenStreetMap, Yellow Pages, etc.) — adding keys here boosts the number of results per run.
          </p>
        </div>
        <div className="divide-y divide-border/30">
          {([
            { id: "foursquare", name: "Foursquare Places", desc: "Best for restaurants, retail & nightlife. 1,000 free calls/day.", signupUrl: "https://developer.foursquare.com/", label: "API Key" },
            { id: "tomtom",     name: "TomTom Search",    desc: "Strong global coverage across all business categories. 2,500 free calls/day.", signupUrl: "https://developer.tomtom.com/", label: "API Key" },
            { id: "here",       name: "HERE Places",      desc: "Excellent coverage in Europe, Africa & Asia. 1,000 free calls/day.", signupUrl: "https://developer.here.com/", label: "API Key" },
          ] as { id: string; name: string; desc: string; signupUrl: string; label: string }[]).map(src => {
            const st = poolStatus?.[src.id as keyof typeof poolStatus];
            const isOpen = openPool === src.id;
            return (
              <div key={src.id}>
                <div className="p-4 flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${st?.active ? "bg-green-100" : "bg-muted/40"}`}>
                    <Key className={`w-4 h-4 ${st?.active ? "text-green-600" : "text-muted-foreground"}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm flex items-center gap-2">
                      {src.name}
                      {st?.active
                        ? <span className="text-xs text-green-700 bg-green-100 px-2 py-0.5 rounded-full">{st.envFallback ? "via env" : `${st.count} key${st.count !== 1 ? "s" : ""}`} · active</span>
                        : <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">not configured</span>
                      }
                    </div>
                    <div className="text-xs text-muted-foreground">{src.desc}</div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <a href={src.signupUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline flex items-center gap-1"><ExternalLink className="w-3 h-3" />Get key</a>
                    <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => isOpen ? setOpenPool(null) : openPoolPanel(src.id)}>
                      {isOpen ? "Close" : "Manage"}
                    </Button>
                  </div>
                </div>
                {isOpen && (
                  <div className="px-4 pb-4 space-y-3 bg-muted/10 border-t border-border/30">
                    {/* Existing keys */}
                    <div className="pt-3 space-y-1">
                      {poolKeys.length > 0 ? poolKeys.map(k => (
                        <div key={k.id} className="flex items-center gap-2 text-sm">
                          <Key className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                          <span className="flex-1 font-mono text-xs text-muted-foreground">{k.maskedKey}</span>
                          <span className="text-xs text-muted-foreground">{k.label}</span>
                          <button className="text-xs text-destructive/70 hover:text-destructive" onClick={() => removePoolKey(src.id, k.id)}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )) : (
                        <p className="text-xs text-muted-foreground">
                          {st?.envFallback
                            ? "✓ Using a key from environment variables (read-only — manage it in Replit Secrets)."
                            : "No keys stored yet. Add one below to activate this source."}
                        </p>
                      )}
                    </div>
                    {/* Add new key */}
                    <div className="pt-2 space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          className="h-8 text-sm font-mono"
                          placeholder={`Paste ${src.label}`}
                          value={newPoolKey}
                          onChange={e => setNewPoolKey(e.target.value)}
                        />
                        <Input
                          className="h-8 text-sm"
                          placeholder="Label (optional)"
                          value={newPoolLabel}
                          onChange={e => setNewPoolLabel(e.target.value)}
                        />
                      </div>
                      <Button
                        size="sm" className="h-7 text-xs gap-1.5"
                        disabled={savingPool || !newPoolKey.trim()}
                        onClick={() => addPoolKey(src.id)}
                      >
                        {savingPool ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
                        Add Key
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Last Run Summary */}
      {status?.stats?.lastProspects?.length > 0 && (
        <div className="rounded-xl border border-border/50 overflow-hidden">
          <div className="p-4 bg-muted/20 border-b border-border/50">
            <h3 className="font-bold text-sm">Last Run Results</h3>
            <p className="text-xs text-muted-foreground">Hunted: {status.stats.hunted} · Scored: {status.stats.scored} · Emailed: {status.stats.emailed} · Errors: {status.stats.errors ?? 0}</p>
          </div>
          <div className="divide-y divide-border/30 max-h-60 overflow-y-auto">
            {status.stats.lastProspects.map((p: any, i: number) => (
              <div key={i} className="p-3 flex items-center gap-3 text-sm">
                <div className="w-7 h-7 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center flex-shrink-0">{(p.businessName || "?").slice(0, 2).toUpperCase()}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate">{p.businessName}</div>
                  <div className="text-xs text-muted-foreground">{p.city} · Score {p.score}/10</div>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  {p.scored && <span className="text-xs text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full">Scored</span>}
                  {p.emailed && <span className="text-xs text-green-700 bg-green-100 px-2 py-0.5 rounded-full">Emailed</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
