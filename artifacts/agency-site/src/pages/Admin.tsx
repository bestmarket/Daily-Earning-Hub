import { useState, useEffect } from "react";
import { Link } from "wouter";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import {
  Save, Lock, DollarSign, CreditCard, MessageSquare, Sparkles, RefreshCw,
  ChevronDown, ChevronUp, AlertTriangle, Mail, Send, Target, Plus, Trash2,
  CheckCircle2, Clock, Wrench, ExternalLink, Calculator, Brain, TrendingUp, Users,
  Key, Eye, EyeOff, ShieldCheck, Zap, Package, Link2, Copy,
} from "lucide-react";
import { toast as sonnerToast } from "sonner";
import API_BASE from "@/lib/api";
const ADMIN_TOKEN = "devstudio-admin";
const LS_KEY = "devstudio_site_settings";

const DEFAULT_SETTINGS = {
  pricing: [
    { id: "starter", name: "Starter", price: "$299", description: "Perfect for small businesses", features: ["Landing Page", "Contact Form", "Mobile Friendly", "1 Revision"], popular: false },
    { id: "pro", name: "Pro", price: "$799", description: "For growing businesses", features: ["Up to 5 Pages", "Booking System", "Admin Dashboard", "Payment Integration", "3 Revisions"], popular: true },
    { id: "enterprise", name: "Enterprise", price: "$1,999", description: "Full custom software", features: ["Unlimited Pages", "Custom Features", "AI Integration", "Priority Support", "Unlimited Revisions"], popular: false },
  ],
  paymentMethods: [
    { id: "paypal", name: "PayPal", enabled: true, details: "" },
    { id: "stripe", name: "Stripe", enabled: false, details: "" },
    { id: "bank", name: "Bank Transfer", enabled: true, details: "" },
    { id: "crypto", name: "Crypto", enabled: false, details: "" },
  ],
  contact: { whatsapp: "+1234567890", email: "hello@devstudio.com", whatsappDisplay: "+1 (234) 567-890" },
  hero: { headline: "We Build Software That Helps Your Business Get More Customers & Save Time.", subheadline: "From booking systems and customer portals to AI-powered tools and SaaS platforms — we build custom software that grows your revenue.", ctaPrimary: "Get My Free Business Tool Idea", ctaSecondary: "View Examples" },
};

type PricingPlan = {
  id: string;
  name: string;
  price: string;
  description: string;
  features: string[];
  popular: boolean;
};

type PaymentMethod = {
  id: string;
  name: string;
  enabled: boolean;
  details: string;
};

type SiteSettings = {
  pricing: PricingPlan[];
  paymentMethods: PaymentMethod[];
  contact: { whatsapp: string; email: string; whatsappDisplay: string };
  hero: { headline: string; subheadline: string; ctaPrimary: string; ctaSecondary: string };
};

function Section({ title, icon, children, defaultOpen = true }: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-3 font-semibold text-base">
          {icon}
          {title}
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>
      {open && <div className="px-5 pb-5 border-t border-border/40 pt-5">{children}</div>}
    </div>
  );
}

export default function Admin() {
  const { toast } = useToast();
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [apiToken, setApiToken] = useState<string | null>(() => localStorage.getItem("ds_api_token"));
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState<string | null>(null);
  const [apiOffline, setApiOffline] = useState(false);
  const loginMutation = useAdminLogin();

  const login = () => {
    if (password === "devstudio-admin" || password === ADMIN_TOKEN) {
      setAuthed(true);
      loadSettings();
      loginMutation.mutate({ data: { password } }, {
        onSuccess: (data) => {
          setApiToken(data.token);
          localStorage.setItem("ds_api_token", data.token);
        },
      });
    } else {
      toast({ title: "Wrong password", description: "Try: devstudio-admin", variant: "destructive" });
    }
  };

  const loadSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/site-settings`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setSettings(data);
      setApiOffline(false);
    } catch {
      setApiOffline(true);
      const stored = localStorage.getItem(LS_KEY);
      setSettings(stored ? JSON.parse(stored) : DEFAULT_SETTINGS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authed) loadSettings();
  }, [authed]);

  const saveLocally = (updated: SiteSettings) => {
    localStorage.setItem(LS_KEY, JSON.stringify(updated));
    toast({ title: "Saved locally", description: "Changes are saved in this browser. Connect an API server to persist across devices." });
  };

  const savePricing = async () => {
    if (!settings) return;
    setSaving("pricing");
    if (apiOffline) { saveLocally(settings); setSaving(null); return; }
    try {
      const res = await fetch(`${API_BASE}/api/admin/site-settings/pricing`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${ADMIN_TOKEN}` },
        body: JSON.stringify(settings.pricing),
      });
      if (!res.ok) throw new Error();
      toast({ title: "Pricing saved!" });
    } catch {
      toast({ title: "Failed to save pricing", variant: "destructive" });
    } finally {
      setSaving(null);
    }
  };

  const savePayments = async () => {
    if (!settings) return;
    setSaving("payments");
    if (apiOffline) { saveLocally(settings); setSaving(null); return; }
    try {
      const res = await fetch(`${API_BASE}/api/admin/site-settings/payment-methods`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${ADMIN_TOKEN}` },
        body: JSON.stringify(settings.paymentMethods),
      });
      if (!res.ok) throw new Error();
      toast({ title: "Payment methods saved!" });
    } catch {
      toast({ title: "Failed to save payment methods", variant: "destructive" });
    } finally {
      setSaving(null);
    }
  };

  const saveContact = async () => {
    if (!settings) return;
    setSaving("contact");
    if (apiOffline) { saveLocally(settings); setSaving(null); return; }
    try {
      const res = await fetch(`${API_BASE}/api/admin/site-settings/contact`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${ADMIN_TOKEN}` },
        body: JSON.stringify(settings.contact),
      });
      if (!res.ok) throw new Error();
      toast({ title: "Contact info saved!" });
    } catch {
      toast({ title: "Failed to save contact info", variant: "destructive" });
    } finally {
      setSaving(null);
    }
  };

  const saveHero = async () => {
    if (!settings) return;
    setSaving("hero");
    if (apiOffline) { saveLocally(settings); setSaving(null); return; }
    try {
      const res = await fetch(`${API_BASE}/api/admin/site-settings/hero`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${ADMIN_TOKEN}` },
        body: JSON.stringify(settings.hero),
      });
      if (!res.ok) throw new Error();
      toast({ title: "Hero content saved!" });
    } catch {
      toast({ title: "Failed to save hero content", variant: "destructive" });
    } finally {
      setSaving(null);
    }
  };

  const updatePlan = (idx: number, field: keyof PricingPlan, value: string | boolean | string[]) => {
    if (!settings) return;
    const pricing = [...settings.pricing];
    pricing[idx] = { ...pricing[idx], [field]: value };
    setSettings({ ...settings, pricing });
  };

  const updatePayment = (idx: number, field: keyof PaymentMethod, value: string | boolean) => {
    if (!settings) return;
    const methods = [...settings.paymentMethods];
    methods[idx] = { ...methods[idx], [field]: value };
    setSettings({ ...settings, paymentMethods: methods });
  };

  if (!authed) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="w-full max-w-sm rounded-2xl border border-border/60 bg-card p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <Lock className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-xl font-bold">Admin Panel</h1>
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
            <Button className="w-full" onClick={login}>
              <Lock className="mr-2 w-4 h-4" /> Login
            </Button>
          </div>
          <p className="text-xs text-center text-muted-foreground">Default: devstudio-admin</p>
        </div>
      </div>
    );
  }

  if (loading || !settings) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <RefreshCw className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="border-b border-border/60 bg-card/50 backdrop-blur sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-primary" />
            <div>
              <h1 className="font-bold text-base">DevStudio Admin</h1>
              <p className="text-xs text-muted-foreground">Site Control Panel</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={loadSettings}>
              <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={() => window.open("/", "_blank")}>
              View Site ↗
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* Offline banner */}
        {apiOffline && (
          <div className="flex items-start gap-3 rounded-xl border border-yellow-300 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
            <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0 text-yellow-600" />
            <div>
              <span className="font-semibold">No API server connected.</span>{" "}
              Changes you save here are stored in this browser only and won't affect other visitors. To make changes live for everyone, deploy the API server and set <code className="bg-yellow-100 px-1 rounded">VITE_API_BASE_URL</code> in Vercel.
            </div>
          </div>
        )}

        {/* Pricing Plans */}
        <Section title="Pricing Plans" icon={<DollarSign className="w-5 h-5 text-primary" />}>
          <div className="space-y-6">
            {settings.pricing.map((plan, idx) => (
              <div key={plan.id} className="rounded-lg border border-border/50 p-4 space-y-4">
                <div className="flex items-center gap-3">
                  <Badge variant={plan.popular ? "default" : "secondary"}>{plan.popular ? "Most Popular" : "Standard"}</Badge>
                  <span className="font-semibold">{plan.name}</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Plan Name</label>
                    <Input value={plan.name} onChange={(e) => updatePlan(idx, "name", e.target.value)} />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Price (e.g. $299)</label>
                    <Input value={plan.price} onChange={(e) => updatePlan(idx, "price", e.target.value)} />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Description</label>
                  <Input value={plan.description} onChange={(e) => updatePlan(idx, "description", e.target.value)} />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Features (one per line)</label>
                  <Textarea
                    rows={4}
                    value={plan.features.join("\n")}
                    onChange={(e) => updatePlan(idx, "features", e.target.value.split("\n").filter(Boolean))}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={plan.popular}
                    onCheckedChange={(v) => updatePlan(idx, "popular", v)}
                  />
                  <label className="text-sm">Mark as Most Popular</label>
                </div>
              </div>
            ))}
            <Button onClick={savePricing} disabled={saving === "pricing"}>
              {saving === "pricing" ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Save Pricing
            </Button>
          </div>
        </Section>

        {/* Payment Methods */}
        <Section title="Payment Methods" icon={<CreditCard className="w-5 h-5 text-primary" />}>
          <div className="space-y-3">
            {settings.paymentMethods.map((pm, idx) => (
              <div key={pm.id} className="flex items-center gap-4 rounded-lg border border-border/50 p-4">
                <Switch
                  checked={pm.enabled}
                  onCheckedChange={(v) => updatePayment(idx, "enabled", v)}
                />
                <div className="w-28 font-medium text-sm">{pm.name}</div>
                <Input
                  className="flex-1"
                  placeholder="Details (e.g. PayPal email, bank info)"
                  value={pm.details}
                  onChange={(e) => updatePayment(idx, "details", e.target.value)}
                />
                <Badge variant={pm.enabled ? "default" : "secondary"}>
                  {pm.enabled ? "Active" : "Disabled"}
                </Badge>
              </div>
            ))}
            <Button onClick={savePayments} disabled={saving === "payments"}>
              {saving === "payments" ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Save Payment Methods
            </Button>
          </div>
        </Section>

        {/* Hero Content */}
        <Section title="Hero Section Content" icon={<Sparkles className="w-5 h-5 text-primary" />} defaultOpen={false}>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Main Headline</label>
              <Textarea
                rows={3}
                value={settings.hero.headline}
                onChange={(e) => setSettings({ ...settings, hero: { ...settings.hero, headline: e.target.value } })}
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Sub-headline</label>
              <Textarea
                rows={3}
                value={settings.hero.subheadline}
                onChange={(e) => setSettings({ ...settings, hero: { ...settings.hero, subheadline: e.target.value } })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Primary CTA Button</label>
                <Input value={settings.hero.ctaPrimary} onChange={(e) => setSettings({ ...settings, hero: { ...settings.hero, ctaPrimary: e.target.value } })} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Secondary CTA Button</label>
                <Input value={settings.hero.ctaSecondary} onChange={(e) => setSettings({ ...settings, hero: { ...settings.hero, ctaSecondary: e.target.value } })} />
              </div>
            </div>
            <Button onClick={saveHero} disabled={saving === "hero"}>
              {saving === "hero" ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Save Hero Content
            </Button>
          </div>
        </Section>

        {/* AI Client Hunter CRM */}
        <div className="rounded-2xl border-2 border-primary/30 bg-gradient-to-r from-purple-50 to-indigo-50 p-5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#6366F1] flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-200">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-extrabold text-lg text-[#111827]">AI Client Hunter</h3>
                <span className="text-xs font-bold bg-purple-600 text-white px-2 py-0.5 rounded-full">NEW</span>
              </div>
              <p className="text-sm text-[#6B7280] mb-3">
                Your private AI-powered sales engine. Find prospects, analyze websites, generate personalized emails, WhatsApp messages, LinkedIn pitches, and full proposals — all in one place.
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                {["AI Website Analyzer","Proposal Generator","Email Outreach","WhatsApp Generator","LinkedIn Pitches","Follow-up Engine","CRM Pipeline"].map(f => (
                  <span key={f} className="text-xs bg-white border border-purple-200 text-purple-700 font-semibold px-2 py-0.5 rounded-full">{f}</span>
                ))}
              </div>
              <a href="/admin/crm">
                <Button className="btn-premium text-white font-bold gap-2">
                  <Sparkles className="w-4 h-4" /> Open AI Client Hunter
                </Button>
              </a>
            </div>
          </div>
        </div>

        {/* Free Tools Links */}
        <Section title="Free Tools" icon={<Wrench className="w-5 h-5 text-primary" />} defaultOpen={true}>
          <p className="text-sm text-muted-foreground mb-4">
            Quick links to all 7 free business tools on your site. Share these with prospects to generate leads.
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { label: "ROI Calculator", icon: <DollarSign className="w-4 h-4 text-purple-600" />, hash: "roi", desc: "Shows annual cost of manual work" },
              { label: "Project Cost Estimator", icon: <Calculator className="w-4 h-4 text-green-600" />, hash: "cost", desc: "Instant price estimate by features" },
              { label: "Business Software Quiz", icon: <Brain className="w-4 h-4 text-indigo-600" />, hash: "quiz", desc: "Recommends the right software" },
              { label: "Break-Even Calculator", icon: <Target className="w-4 h-4 text-amber-600" />, hash: "breakeven", desc: "Payback period & churn cost" },
              { label: "Lost Leads Calculator", icon: <Users className="w-4 h-4 text-rose-600" />, hash: "leads", desc: "Revenue lost to slow responses" },
              { label: "Productivity Audit", icon: <Clock className="w-4 h-4 text-teal-600" />, hash: "productivity", desc: "Real cost of admin tasks" },
              { label: "Revenue Growth Projector", icon: <TrendingUp className="w-4 h-4 text-purple-600" />, hash: "revenue", desc: "12-month revenue comparison" },
            ].map((tool) => (
              <a
                key={tool.hash}
                href={`/free-tools`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-xl border border-border/50 hover:border-primary/40 hover:bg-primary/5 transition-all group"
              >
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                  {tool.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-foreground">{tool.label}</div>
                  <div className="text-xs text-muted-foreground truncate">{tool.desc}</div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary flex-shrink-0" />
              </a>
            ))}
          </div>
          <div className="mt-4 flex gap-3">
            <Link href="/free-tools">
              <Button variant="outline" className="gap-2">
                <Wrench className="w-4 h-4" /> Open Free Tools Page
              </Button>
            </Link>
            <Button
              variant="ghost"
              className="gap-2 text-muted-foreground"
              onClick={() => { navigator.clipboard.writeText(window.location.origin + "/free-tools"); toast({ title: "Link copied!", description: "Free Tools page URL copied to clipboard." }); }}
            >
              Copy Link
            </Button>
          </div>
        </Section>

        {/* API Keys */}
        <ApiKeysSection adminToken={ADMIN_TOKEN} />

        {/* Email Outreach */}
        <EmailOutreachSection />

        {/* Software Catalog */}
        {apiToken && <SoftwareCatalogSection apiToken={apiToken} />}

        {/* Custom Requests */}
        {apiToken && <CustomRequestsSection apiToken={apiToken} />}

        {/* Waitlist Signups */}
        {apiToken && <WaitlistSection apiToken={apiToken} />}

        {/* Contact Info */}
        <Section title="Contact & WhatsApp" icon={<MessageSquare className="w-5 h-5 text-primary" />} defaultOpen={false}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">WhatsApp Number (with +)</label>
                <Input
                  placeholder="+15550000000"
                  value={settings.contact.whatsapp}
                  onChange={(e) => setSettings({ ...settings, contact: { ...settings.contact, whatsapp: e.target.value } })}
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">WhatsApp Display</label>
                <Input
                  placeholder="+1 (555) 000-0000"
                  value={settings.contact.whatsappDisplay}
                  onChange={(e) => setSettings({ ...settings, contact: { ...settings.contact, whatsappDisplay: e.target.value } })}
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Email Address</label>
              <Input
                type="email"
                value={settings.contact.email}
                onChange={(e) => setSettings({ ...settings, contact: { ...settings.contact, email: e.target.value } })}
              />
            </div>
            <Button onClick={saveContact} disabled={saving === "contact"}>
              {saving === "contact" ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Save Contact Info
            </Button>
          </div>
        </Section>

      </div>
    </div>
  );
}

// ─── Software Catalog Section ────────────────────────────────────────────────

function SoftwareCatalogSection({ apiToken }: { apiToken: string }) {
  const queryClient = useQueryClient();
  const requestOptions = { request: { headers: { Authorization: `Bearer ${apiToken}` } } };
  const { data: tools } = useListTools({}, requestOptions);
  const deleteTool = useDeleteTool(requestOptions);
  const createTool = useCreateTool(requestOptions);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newTool, setNewTool] = useState({ name: "", description: "", category: "Make Money Online", price: "", status: "available" });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createTool.mutate({
      data: { name: newTool.name, description: newTool.description, category: newTool.category, price: Number(newTool.price), status: newTool.status as "available" | "coming_soon" | "beta" },
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListToolsQueryKey() });
        setIsAddOpen(false);
        setNewTool({ name: "", description: "", category: "Make Money Online", price: "", status: "available" });
        sonnerToast.success("Tool created");
      },
    });
  };

  const handleDelete = (id: number) => {
    if (!confirm("Delete this tool?")) return;
    deleteTool.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListToolsQueryKey() });
        sonnerToast.success("Tool deleted");
      },
    });
  };

  return (
    <Section title="Software Catalog" icon={<Package className="w-5 h-5 text-primary" />} defaultOpen={false}>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-muted-foreground">{tools?.length || 0} products in catalog. Manage your software offerings.</p>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1.5 font-semibold"><Plus className="w-4 h-4" /> Add Tool</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader><DialogTitle>Add New Tool</DialogTitle></DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 pt-4">
              <Input placeholder="Tool name" value={newTool.name} onChange={e => setNewTool({ ...newTool, name: e.target.value })} required />
              <Textarea placeholder="Description" value={newTool.description} onChange={e => setNewTool({ ...newTool, description: e.target.value })} required />
              <Select value={newTool.category} onValueChange={v => setNewTool({ ...newTool, category: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Make Money Online", "Grow on Social Media", "Start a SaaS", "Lead Generation", "Sell Digital Products", "Business Growth"].map(c => (
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
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tool</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tools?.map(tool => (
            <TableRow key={tool.id}>
              <TableCell>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center text-sm">{tool.emoji || "🚀"}</div>
                  <span className="font-semibold text-sm">{tool.name}</span>
                </div>
              </TableCell>
              <TableCell><Badge variant="outline" className="text-xs">{tool.category}</Badge></TableCell>
              <TableCell className="font-mono text-sm">${tool.price}</TableCell>
              <TableCell>
                <Badge className={tool.status === "available" ? "bg-green-100 text-green-700 border-green-200 hover:bg-green-100" : "bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-100"}>
                  {tool.status.replace("_", " ")}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="sm" className="text-destructive h-7 text-xs" onClick={() => handleDelete(tool.id)}>
                  <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {(!tools || tools.length === 0) && (
            <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground text-sm">No tools yet. Add your first product.</TableCell></TableRow>
          )}
        </TableBody>
      </Table>
    </Section>
  );
}

// ─── Custom Requests Section ──────────────────────────────────────────────────

function CustomRequestsSection({ apiToken }: { apiToken: string }) {
  const queryClient = useQueryClient();
  const requestOptions = { request: { headers: { Authorization: `Bearer ${apiToken}` } } };
  const { data: customRequests } = useGetAdminCustomRequests({ query: { enabled: !!apiToken } }, requestOptions);
  const updateCustomRequest = useUpdateCustomRequest(requestOptions);

  const handleUpdateStatus = (id: number, status: string) => {
    updateCustomRequest.mutate({ id, data: { status: status as "new" | "contacted" | "quoted" | "paid" | "delivered" | "cancelled" } }, {
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
    <Section title="Custom Requests" icon={<MessageSquare className="w-5 h-5 text-primary" />} defaultOpen={false}>
      <p className="text-sm text-muted-foreground mb-4">{customRequests?.length || 0} inbound requests for custom software builds.</p>
      <div className="overflow-x-auto rounded-xl border border-border/50">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Client Info</TableHead>
              <TableHead>Type & Budget</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Payment</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customRequests?.map(req => (
              <TableRow key={req.id}>
                <TableCell>
                  <div className="font-semibold text-sm">{req.name || "Anonymous"}</div>
                  <div className="text-xs text-muted-foreground">{req.email}</div>
                  {req.whatsapp && <div className="text-xs text-primary/80 mt-0.5">WA: {req.whatsapp}</div>}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-xs">{req.businessType || "N/A"}</Badge>
                  <div className="text-xs text-muted-foreground mt-1">{req.budget || "Not sure"}</div>
                </TableCell>
                <TableCell className="max-w-[200px]">
                  <div className="text-xs text-muted-foreground truncate" title={req.description}>{req.description}</div>
                </TableCell>
                <TableCell>
                  <Select value={req.status} onValueChange={val => handleUpdateStatus(req.id, val)}>
                    <SelectTrigger className="w-[130px] h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["new", "contacted", "quoted", "paid", "delivered", "cancelled"].map(s => (
                        <SelectItem key={s} value={s} className="text-xs capitalize">{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <div className="space-y-1.5">
                    <Input placeholder="Amount ($)" className="h-7 w-24 text-xs" defaultValue={req.paymentAmount?.toString() || ""} onBlur={e => handleUpdatePayment(req.id, e.target.value, req.paymentMethod || "")} />
                    <Input placeholder="Method" className="h-7 w-24 text-xs" defaultValue={req.paymentMethod || ""} onBlur={e => handleUpdatePayment(req.id, req.paymentAmount?.toString() || "", e.target.value)} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {(!customRequests || customRequests.length === 0) && (
              <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground text-sm">No custom requests yet.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </Section>
  );
}

// ─── Waitlist Section ─────────────────────────────────────────────────────────

function WaitlistSection({ apiToken }: { apiToken: string }) {
  const requestOptions = { request: { headers: { Authorization: `Bearer ${apiToken}` } } };
  const { data: waitlist } = useGetAdminWaitlist({ query: { enabled: !!apiToken } }, requestOptions);

  return (
    <Section title="Waitlist & Software Signups" icon={<Users className="w-5 h-5 text-primary" />} defaultOpen={false}>
      <p className="text-sm text-muted-foreground mb-4">{waitlist?.length || 0} signups from the software catalog waitlist and purchase requests.</p>
      <div className="overflow-x-auto rounded-xl border border-border/50">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Tool</TableHead>
              <TableHead>Message</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {waitlist?.map(entry => (
              <TableRow key={entry.id}>
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
              <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground text-sm">No signups yet.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </Section>
  );
}

// ─── API Keys Section ─────────────────────────────────────────────────────────

type KeyStatus = { masked: string; set: boolean };
type KeyStatuses = Record<string, KeyStatus>;

const KEY_GROUPS = [
  {
    label: "AI / Gemini",
    icon: <Brain className="w-5 h-5 text-purple-500" />,
    color: "from-purple-50 to-indigo-50 border-purple-200",
    desc: "Powers AI recommendations, SEO checker, business name generator & website grader.",
    keys: [
      { key: "GEMINI_API_KEY", label: "Gemini API Key", hint: "Get from console.cloud.google.com → APIs & Services → Credentials" },
    ],
  },
  {
    label: "Stripe Payments",
    icon: <CreditCard className="w-5 h-5 text-blue-500" />,
    color: "from-blue-50 to-cyan-50 border-blue-200",
    desc: "Accept card payments. Get keys from dashboard.stripe.com → Developers → API Keys.",
    keys: [
      { key: "STRIPE_SECRET_KEY", label: "Secret Key", hint: "Starts with sk_live_ or sk_test_" },
      { key: "STRIPE_PUBLISHABLE_KEY", label: "Publishable Key", hint: "Starts with pk_live_ or pk_test_" },
    ],
  },
  {
    label: "PayPal",
    icon: <Zap className="w-5 h-5 text-amber-500" />,
    color: "from-amber-50 to-yellow-50 border-amber-200",
    desc: "Accept PayPal payments. Get keys from developer.paypal.com → My Apps & Credentials.",
    keys: [
      { key: "PAYPAL_CLIENT_ID", label: "Client ID", hint: "From PayPal Developer Dashboard" },
      { key: "PAYPAL_SECRET", label: "Client Secret", hint: "From PayPal Developer Dashboard" },
    ],
  },
];

function ApiKeysSection({ adminToken }: { adminToken: string }) {
  const { toast } = useToast();
  const [statuses, setStatuses] = useState<KeyStatuses>({});
  const [values, setValues] = useState<Record<string, string>>({});
  const [visible, setVisible] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dirtyKeys, setDirtyKeys] = useState<Set<string>>(new Set());

  const authHeader = { Authorization: `Bearer ${adminToken}` };

  useEffect(() => {
    fetch(`${API_BASE}/api/admin/api-keys`, { headers: authHeader })
      .then((r) => r.json())
      .then((data: KeyStatuses) => { setStatuses(data); setLoading(false); })
      .catch(() => { setLoading(false); });
  }, []);

  const handleChange = (key: string, val: string) => {
    setValues((v) => ({ ...v, [key]: val }));
    setDirtyKeys((d) => new Set(d).add(key));
  };

  const handleSave = async () => {
    const toSave: Record<string, string> = {};
    for (const k of dirtyKeys) {
      if (values[k]?.trim()) toSave[k] = values[k].trim();
    }
    if (!Object.keys(toSave).length) { toast({ title: "No new keys to save", variant: "destructive" }); return; }
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/api-keys`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader },
        body: JSON.stringify(toSave),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      toast({ title: `Saved: ${data.saved.join(", ")}` });
      setValues({});
      setDirtyKeys(new Set());
      const fresh = await fetch(`${API_BASE}/api/admin/api-keys`, { headers: authHeader }).then((r) => r.json());
      setStatuses(fresh);
    } catch {
      toast({ title: "Failed to save API keys", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleClear = async (key: string) => {
    if (!confirm(`Remove the stored ${key}?`)) return;
    try {
      await fetch(`${API_BASE}/api/admin/api-keys/${key}`, { method: "DELETE", headers: authHeader });
      toast({ title: `${key} removed` });
      setStatuses((s) => ({ ...s, [key]: { masked: "", set: false } }));
    } catch {
      toast({ title: "Failed to remove key", variant: "destructive" });
    }
  };

  const hasDirty = dirtyKeys.size > 0 && [...dirtyKeys].some((k) => values[k]?.trim());

  return (
    <Section title="API Keys" icon={<Key className="w-5 h-5 text-primary" />} defaultOpen={false}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Stored securely in your database. Keys are never shown in full after saving.
          </p>
          <Button onClick={handleSave} disabled={saving || !hasDirty} size="sm" className="gap-2">
            {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
            {saving ? "Saving…" : "Save Keys"}
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-10">
            <RefreshCw className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          KEY_GROUPS.map((group) => (
            <div key={group.label} className={`rounded-xl border bg-gradient-to-br ${group.color} p-4 space-y-3`}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/70 border border-white flex items-center justify-center shadow-sm">
                  {group.icon}
                </div>
                <div>
                  <h4 className="font-bold text-sm">{group.label}</h4>
                  <p className="text-xs text-muted-foreground">{group.desc}</p>
                </div>
              </div>

              {group.keys.map(({ key, label, hint }) => {
                const status = statuses[key];
                const isSet = status?.set;
                const inputVal = values[key] ?? "";
                const show = visible[key];
                return (
                  <div key={key} className="bg-white/80 rounded-lg border border-white p-3 space-y-2 shadow-sm">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                        <Key className="w-3 h-3 text-muted-foreground" /> {label}
                      </label>
                      {isSet ? (
                        <Badge className="bg-green-100 text-green-700 border-green-200 text-xs gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Active
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs text-muted-foreground">Not set</Badge>
                      )}
                    </div>
                    {isSet && (
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/30 rounded-lg border border-border/40">
                        <span className="font-mono text-xs text-muted-foreground flex-1">{status.masked}</span>
                        <button
                          className="text-xs text-destructive/70 hover:text-destructive font-medium flex items-center gap-1"
                          onClick={() => handleClear(key)}
                        >
                          <Trash2 className="w-3 h-3" /> Remove
                        </button>
                      </div>
                    )}
                    <div className="relative">
                      <Input
                        type={show ? "text" : "password"}
                        placeholder={isSet ? "Enter new key to replace…" : "Paste your key here…"}
                        value={inputVal}
                        onChange={(e) => handleChange(key, e.target.value)}
                        className="pr-10 font-mono text-sm h-9"
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        onClick={() => setVisible((v) => ({ ...v, [key]: !v[key] }))}
                      >
                        {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground">{hint}</p>
                  </div>
                );
              })}
            </div>
          ))
        )}
      </div>
    </Section>
  );
}

// ─── Types ───────────────────────────────────────────────────────────────────

interface Lead {
  id: number;
  name: string;
  email: string;
  company: string;
  role: string;
  service: string;
  note: string;
  status: "new" | "contacted" | "replied" | "converted";
  addedAt: string;
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
  const [emailTemplate, setEmailTemplate] = useState(
    () => localStorage.getItem("ds_email_template") || DEFAULT_TEMPLATE
  );
  const [newLead, setNewLead] = useState({ name: "", email: "", company: "", role: "", service: "", note: "" });
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [composing, setComposing] = useState<Lead | null>(null);
  const [composedEmail, setComposedEmail] = useState("");

  const saveLeads = (updated: Lead[]) => {
    setLeads(updated);
    localStorage.setItem("ds_leads", JSON.stringify(updated));
  };

  const addLead = () => {
    if (!newLead.email) return;
    const lead: Lead = { ...newLead, id: Date.now(), status: "new", addedAt: new Date().toISOString() };
    saveLeads([lead, ...leads]);
    setNewLead({ name: "", email: "", company: "", role: "", service: "", note: "" });
    setIsAddOpen(false);
  };

  const removeLead = (id: number) => {
    if (confirm("Remove this lead?")) saveLeads(leads.filter((l) => l.id !== id));
  };

  const updateLeadStatus = (id: number, status: Lead["status"]) => {
    saveLeads(leads.map((l) => (l.id === id ? { ...l, status } : l)));
  };

  const composeEmail = (lead: Lead) => {
    const body = emailTemplate
      .replace(/\{\{name\}\}/g, lead.name || "there")
      .replace(/\{\{service\}\}/g, lead.service || "[Service]")
      .replace(/\{\{company\}\}/g, lead.company || "your company");
    setComposedEmail(body);
    setComposing(lead);
  };

  const openMailto = (lead: Lead) => {
    const subject = encodeURIComponent(`Custom Software for ${lead.company || "Your Business"}`);
    const body = encodeURIComponent(composedEmail);
    window.open(`mailto:${lead.email}?subject=${subject}&body=${body}`, "_blank");
    updateLeadStatus(lead.id, "contacted");
    setComposing(null);
  };

  const statusCounts = {
    new: leads.filter((l) => l.status === "new").length,
    contacted: leads.filter((l) => l.status === "contacted").length,
    replied: leads.filter((l) => l.status === "replied").length,
    converted: leads.filter((l) => l.status === "converted").length,
  };

  return (
    <Section title="Email Outreach" icon={<Mail className="w-5 h-5 text-primary" />} defaultOpen={false}>
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "New Leads", count: statusCounts.new, color: "text-blue-600", bg: "bg-blue-50 border-blue-100", icon: <Target className="w-4 h-4" /> },
            { label: "Contacted", count: statusCounts.contacted, color: "text-yellow-600", bg: "bg-yellow-50 border-yellow-100", icon: <Mail className="w-4 h-4" /> },
            { label: "Replied", count: statusCounts.replied, color: "text-purple-600", bg: "bg-purple-50 border-purple-100", icon: <RefreshCw className="w-4 h-4" /> },
            { label: "Converted", count: statusCounts.converted, color: "text-green-600", bg: "bg-green-50 border-green-100", icon: <CheckCircle2 className="w-4 h-4" /> },
          ].map((s) => (
            <div key={s.label} className={`flex items-center gap-3 p-3 rounded-xl border ${s.bg}`}>
              <div className={s.color}>{s.icon}</div>
              <div>
                <div className={`text-2xl font-extrabold ${s.color}`}>{s.count}</div>
                <div className="text-xs font-semibold text-muted-foreground">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Lead List */}
          <div className="lg:col-span-2 rounded-xl border border-border/50 overflow-hidden">
            <div className="p-4 border-b border-border/50 bg-muted/20 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold flex items-center gap-2"><Target className="w-4 h-4 text-primary" /> Prospects</h3>
                <p className="text-xs text-muted-foreground">{leads.length} leads tracked</p>
              </div>
              <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="gap-1.5 font-semibold"><Plus className="w-4 h-4" /> Add Lead</Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader><DialogTitle>Add New Lead</DialogTitle></DialogHeader>
                  <div className="space-y-3 mt-2">
                    {[
                      { key: "name", placeholder: "Contact name", label: "Name" },
                      { key: "email", placeholder: "email@company.com", label: "Email *" },
                      { key: "company", placeholder: "Company name", label: "Company" },
                      { key: "role", placeholder: "CEO, Founder, Manager…", label: "Role" },
                      { key: "service", placeholder: "Booking system, CRM, dashboard…", label: "Service to pitch" },
                    ].map((f) => (
                      <div key={f.key}>
                        <label className="text-xs font-semibold text-muted-foreground mb-1 block">{f.label}</label>
                        <Input
                          placeholder={f.placeholder}
                          value={(newLead as any)[f.key]}
                          onChange={(e) => setNewLead((p) => ({ ...p, [f.key]: e.target.value }))}
                        />
                      </div>
                    ))}
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground mb-1 block">Note</label>
                      <Textarea placeholder="Any context about this lead…" value={newLead.note} onChange={(e) => setNewLead((p) => ({ ...p, note: e.target.value }))} rows={2} />
                    </div>
                    <Button onClick={addLead} className="w-full font-semibold" disabled={!newLead.email}>Add Lead</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {leads.length === 0 ? (
              <div className="py-14 text-center text-muted-foreground">
                <Target className="w-10 h-10 mx-auto mb-3 opacity-20" />
                <p className="font-medium text-sm">No leads yet. Add your first prospect.</p>
              </div>
            ) : (
              <div className="divide-y divide-border/40">
                {leads.map((lead) => (
                  <div key={lead.id} className="p-4 flex items-start gap-3 hover:bg-muted/20 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm flex items-center justify-center shrink-0">
                      {(lead.name || lead.email).slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm">{lead.name || "—"}</span>
                        <span className="text-xs text-muted-foreground">{lead.email}</span>
                        {lead.company && <Badge variant="outline" className="text-xs h-5">{lead.company}</Badge>}
                      </div>
                      {lead.service && <p className="text-xs text-primary/80 font-medium mt-0.5">Pitch: {lead.service}</p>}
                      {lead.note && <p className="text-xs text-muted-foreground mt-0.5 truncate">{lead.note}</p>}
                    </div>
                    <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                      <Select value={lead.status} onValueChange={(v) => updateLeadStatus(lead.id, v as Lead["status"])}>
                        <SelectTrigger className={`w-[110px] h-7 text-xs font-semibold ${
                          lead.status === "converted" ? "text-green-700 border-green-200 bg-green-50" :
                          lead.status === "replied" ? "text-purple-700 border-purple-200 bg-purple-50" :
                          lead.status === "contacted" ? "text-yellow-700 border-yellow-200 bg-yellow-50" :
                          "text-blue-700 border-blue-200 bg-blue-50"
                        }`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">🔵 New</SelectItem>
                          <SelectItem value="contacted">📧 Contacted</SelectItem>
                          <SelectItem value="replied">💬 Replied</SelectItem>
                          <SelectItem value="converted">✅ Converted</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button size="sm" variant="outline" className="h-7 px-2 text-xs gap-1" onClick={() => composeEmail(lead)}>
                        <Send className="w-3 h-3" /> Email
                      </Button>
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive/60 hover:text-destructive" onClick={() => removeLead(lead.id)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Email Template / Composer */}
          <div className="space-y-4">
            {composing ? (
              <div className="rounded-xl border border-primary/30 overflow-hidden">
                <div className="p-4 border-b border-border/50 bg-primary/5">
                  <h3 className="text-sm font-bold flex items-center gap-2"><Mail className="w-4 h-4 text-primary" /> Email to {composing.name || composing.email}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Edit before sending</p>
                </div>
                <div className="p-4 space-y-3">
                  <Textarea value={composedEmail} onChange={(e) => setComposedEmail(e.target.value)} rows={12} className="text-xs font-mono resize-none" />
                  <div className="flex gap-2">
                    <Button className="flex-1 font-semibold gap-2" onClick={() => openMailto(composing)}>
                      <Send className="w-4 h-4" /> Open in Email App
                    </Button>
                    <Button variant="outline" onClick={() => setComposing(null)}>Cancel</Button>
                  </div>
                  <p className="text-xs text-muted-foreground text-center">Opens your email client with the message pre-filled</p>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-border/50 overflow-hidden">
                <div className="p-4 border-b border-border/50 bg-muted/20">
                  <h3 className="text-sm font-bold flex items-center gap-2"><Mail className="w-4 h-4 text-primary" /> Email Template</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Uses {"{{name}}"}, {"{{service}}"}, {"{{company}}"} tokens. Auto-saved.</p>
                </div>
                <div className="p-4 space-y-3">
                  <Textarea
                    value={emailTemplate}
                    onChange={(e) => { setEmailTemplate(e.target.value); localStorage.setItem("ds_email_template", e.target.value); }}
                    rows={14}
                    className="text-xs font-mono resize-none"
                    placeholder="Write your outreach email template here…"
                  />
                  <p className="text-xs text-muted-foreground">Click <strong>Email</strong> next to any lead to compose and send.</p>
                </div>
              </div>
            )}

            <div className="rounded-xl border border-border/50 p-4 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Outreach Tips</h4>
              {[
                { icon: <Target className="w-3.5 h-3.5 text-blue-500" />, tip: 'Find prospects by searching LinkedIn for your niche + "Founder" or "Owner"' },
                { icon: <AlertTriangle className="w-3.5 h-3.5 text-yellow-500" />, tip: 'Add a personal note about their business to boost reply rates' },
                { icon: <Clock className="w-3.5 h-3.5 text-purple-500" />, tip: 'Send Tue–Thu, 8–10am for highest open rates' },
                { icon: <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />, tip: 'Follow up once after 3 days — most deals close on follow-up' },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-2">
                  <div className="mt-0.5 shrink-0">{item.icon}</div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.tip}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}
