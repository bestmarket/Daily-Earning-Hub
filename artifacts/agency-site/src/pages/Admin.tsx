import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Save, Lock, DollarSign, CreditCard, MessageSquare, Sparkles, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";

const API_BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const ADMIN_TOKEN = "devstudio-admin";

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
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState<string | null>(null);

  const login = () => {
    if (password === "devstudio-admin" || password === ADMIN_TOKEN) {
      setAuthed(true);
      loadSettings();
    } else {
      toast({ title: "Wrong password", description: "Try: devstudio-admin", variant: "destructive" });
    }
  };

  const loadSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/site-settings`);
      const data = await res.json();
      setSettings(data);
    } catch {
      toast({ title: "Failed to load settings", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authed) loadSettings();
  }, [authed]);

  const savePricing = async () => {
    if (!settings) return;
    setSaving("pricing");
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
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
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

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">

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
