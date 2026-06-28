import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search, Plus, Globe, Mail, Phone, Trash2, Star, ChevronRight,
  BarChart3, Send, MessageCircle, Linkedin, RefreshCw, CheckCircle2,
  AlertTriangle, Clock, TrendingUp, Users, Target, Sparkles, Download,
  X, Copy, Check, Building, ArrowRight, Zap, LayoutDashboard,
} from "lucide-react";
import API_BASE from "@/lib/api";

// ─── Types ───────────────────────────────────────────────────────────────────

type LeadStatus = "new" | "contacted" | "waiting" | "proposal_sent" | "meeting" | "negotiating" | "won" | "lost" | "archive";
type Priority = "low" | "medium" | "high";

interface Prospect {
  id: number;
  businessName: string;
  ownerName: string;
  category: string;
  website: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  facebook: string;
  instagram: string;
  linkedin: string;
  status: LeadStatus;
  priority: Priority;
  expectedValue: number;
  probability: number;
  nextFollowUp: string;
  notes: string;
  addedAt: string;
  analysis?: WebsiteAnalysis;
  generatedEmail?: { subject: string; body: string };
  generatedWhatsApp?: string;
  generatedLinkedIn?: string;
  proposal?: ProposalData;
}

interface WebsiteAnalysis {
  websiteScore: number;
  leadScore: number;
  conversionScore: number;
  mobileScore: number;
  seoScore: number;
  growthPotential: number;
  checks: Record<string, boolean>;
  issues: { title: string; description: string; priority: string }[];
  opportunities: { title: string; impact: string; effort: string }[];
  recommendedFeatures: string[];
  projectType: string;
  estimatedValue: { min: number; max: number };
  deliveryWeeks: { min: number; max: number };
  summary: string;
}

interface ProposalData {
  sections: {
    executiveSummary: string;
    situation: string;
    problems: string[];
    solution: string;
    features: { name: string; desc: string }[];
    benefits: string[];
    timeline: { week: string; task: string }[];
    investment: string;
    whyUs: string[];
    nextSteps: string[];
  };
}

// ─── Constants ───────────────────────────────────────────────────────────────

const STORAGE_KEY = "ds_crm_prospects";
const AGENCY_NAME = "DevStudio";

const STATUS_CONFIG: Record<LeadStatus, { label: string; color: string; bg: string; border: string }> = {
  new:           { label: "New",            color: "text-blue-700",   bg: "bg-blue-50",   border: "border-blue-200" },
  contacted:     { label: "Contacted",      color: "text-yellow-700", bg: "bg-yellow-50", border: "border-yellow-200" },
  waiting:       { label: "Waiting",        color: "text-orange-700", bg: "bg-orange-50", border: "border-orange-200" },
  proposal_sent: { label: "Proposal Sent",  color: "text-purple-700", bg: "bg-purple-50", border: "border-purple-200" },
  meeting:       { label: "Meeting Set",    color: "text-indigo-700", bg: "bg-indigo-50", border: "border-indigo-200" },
  negotiating:   { label: "Negotiating",    color: "text-pink-700",   bg: "bg-pink-50",   border: "border-pink-200" },
  won:           { label: "Won ✓",          color: "text-green-700",  bg: "bg-green-50",  border: "border-green-200" },
  lost:          { label: "Lost",           color: "text-red-700",    bg: "bg-red-50",    border: "border-red-200" },
  archive:       { label: "Archive",        color: "text-gray-600",   bg: "bg-gray-50",   border: "border-gray-200" },
};

const CATEGORIES = [
  "Restaurant", "School", "Church", "Hospital", "Real Estate", "Hotel",
  "Salon", "Lawyer", "Accountant", "Construction", "Supermarket",
  "Pharmacy", "Gym", "Car Dealer", "Bakery", "Clinic", "Dentist",
  "Auto Repair", "Travel Agency", "Insurance", "Consultant", "Other",
];

const CHECK_LABELS: Record<string, string> = {
  responsiveDesign: "Responsive Design", sslCertificate: "SSL Certificate",
  modernUI: "Modern UI", whatsappButton: "WhatsApp Button",
  contactForm: "Contact Form", bookingSystem: "Booking System",
  onlineOrdering: "Online Ordering", paymentIntegration: "Payment Integration",
  customerPortal: "Customer Portal", membershipArea: "Membership Area",
  blog: "Blog / Content", seoBasics: "SEO Basics", analytics: "Analytics",
  socialMedia: "Social Media Links", emailCapture: "Email Capture",
  liveChat: "Live Chat", aiChatbot: "AI Chatbot",
  callToAction: "Call-to-Action", trustElements: "Trust Elements",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function loadProspects(): Prospect[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch { return []; }
}

function saveProspects(data: Prospect[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

async function callCRM(endpoint: string, body: object) {
  const base = API_BASE.replace("/agency-site", "");
  const r = await fetch(`${base}/api/crm/${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(`API error ${r.status}`);
  return r.json();
}

function ScoreBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-muted-foreground font-medium">{label}</span>
        <span className="font-bold" style={{ color }}>{value}/100</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8 }}
        />
      </div>
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <Button size="sm" variant="ghost" className="h-7 w-7 p-0"
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}>
      {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
    </Button>
  );
}

function LoadingSpinner({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center gap-3 py-10">
      <div className="w-10 h-10 rounded-full border-3 border-primary border-t-transparent animate-spin" />
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
  );
}

// ─── Dashboard ───────────────────────────────────────────────────────────────

function Dashboard({ prospects }: { prospects: Prospect[] }) {
  const stats = {
    total: prospects.length,
    contacted: prospects.filter(p => p.status === "contacted" || p.status === "waiting").length,
    proposals: prospects.filter(p => p.status === "proposal_sent").length,
    won: prospects.filter(p => p.status === "won").length,
    pipeline: prospects.filter(p => !["lost","archive"].includes(p.status)).reduce((s, p) => s + (p.expectedValue || 0), 0),
    analyzed: prospects.filter(p => p.analysis).length,
    emails: prospects.filter(p => p.generatedEmail).length,
    whatsapp: prospects.filter(p => p.generatedWhatsApp).length,
  };
  const convRate = stats.total > 0 ? Math.round((stats.won / stats.total) * 100) : 0;

  const cards = [
    { label: "Total Prospects", value: stats.total, icon: <Users className="w-5 h-5" />, color: "text-blue-600", bg: "bg-blue-50 border-blue-100" },
    { label: "Analyzed", value: stats.analyzed, icon: <BarChart3 className="w-5 h-5" />, color: "text-purple-600", bg: "bg-purple-50 border-purple-100" },
    { label: "Emails Generated", value: stats.emails, icon: <Mail className="w-5 h-5" />, color: "text-indigo-600", bg: "bg-indigo-50 border-indigo-100" },
    { label: "Proposals Sent", value: stats.proposals, icon: <Send className="w-5 h-5" />, color: "text-orange-600", bg: "bg-orange-50 border-orange-100" },
    { label: "Projects Won", value: stats.won, icon: <CheckCircle2 className="w-5 h-5" />, color: "text-green-600", bg: "bg-green-50 border-green-100" },
    { label: "Conversion Rate", value: `${convRate}%`, icon: <TrendingUp className="w-5 h-5" />, color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-100" },
    { label: "Pipeline Value", value: `$${stats.pipeline.toLocaleString()}`, icon: <Target className="w-5 h-5" />, color: "text-amber-600", bg: "bg-amber-50 border-amber-100" },
    { label: "WhatsApp Msgs", value: stats.whatsapp, icon: <MessageCircle className="w-5 h-5" />, color: "text-green-700", bg: "bg-green-50 border-green-100" },
  ];

  const pipeline = Object.entries(STATUS_CONFIG).map(([key, cfg]) => ({
    key, label: cfg.label, count: prospects.filter(p => p.status === key).length,
    value: prospects.filter(p => p.status === key).reduce((s, p) => s + (p.expectedValue || 0), 0),
    ...cfg,
  })).filter(s => !["archive"].includes(s.key));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {cards.map(c => (
          <div key={c.label} className={`flex items-center gap-3 p-4 rounded-xl border ${c.bg}`}>
            <div className={c.color}>{c.icon}</div>
            <div>
              <div className={`text-2xl font-extrabold ${c.color}`}>{c.value}</div>
              <div className="text-xs text-muted-foreground font-semibold">{c.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border/50 overflow-hidden">
        <div className="p-4 border-b border-border/50 bg-muted/20">
          <h3 className="font-bold text-sm">Sales Pipeline</h3>
        </div>
        <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-3">
          {pipeline.map(s => (
            <div key={s.key} className={`rounded-xl p-3 border ${s.border} ${s.bg}`}>
              <div className={`text-xs font-bold uppercase tracking-wide mb-1 ${s.color}`}>{s.label}</div>
              <div className={`text-2xl font-extrabold ${s.color}`}>{s.count}</div>
              {s.value > 0 && <div className={`text-xs mt-0.5 ${s.color} opacity-70`}>${s.value.toLocaleString()}</div>}
            </div>
          ))}
        </div>
      </div>

      {prospects.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-20" />
          <p className="font-semibold text-lg">Your AI Sales Engine is Ready</p>
          <p className="text-sm mt-1">Add a prospect, then use AI to analyze their website, generate proposals and emails in seconds.</p>
        </div>
      )}
    </div>
  );
}

// ─── Add/Edit Prospect Dialog ────────────────────────────────────────────────

const EMPTY_PROSPECT = {
  businessName: "", ownerName: "", category: "", website: "", email: "",
  phone: "", country: "", city: "", facebook: "", instagram: "", linkedin: "",
  status: "new" as LeadStatus, priority: "medium" as Priority,
  expectedValue: 0, probability: 50, nextFollowUp: "", notes: "",
};

function AddProspectDialog({ onAdd, editData, onClose }: {
  onAdd: (p: Omit<Prospect, "id" | "addedAt">) => void;
  editData?: Prospect | null;
  onClose?: () => void;
}) {
  const [form, setForm] = useState(editData ? { ...editData } : { ...EMPTY_PROSPECT });
  const [open, setOpen] = useState(!!editData);

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = () => {
    if (!form.businessName.trim()) return;
    onAdd(form as any);
    setForm({ ...EMPTY_PROSPECT });
    setOpen(false);
    onClose?.();
  };

  useEffect(() => { if (editData) { setForm({ ...editData }); setOpen(true); } }, [editData]);

  return (
    <Dialog open={open} onOpenChange={v => { setOpen(v); if (!v) onClose?.(); }}>
      {!editData && (
        <DialogTrigger asChild>
          <Button className="gap-2 font-semibold"><Plus className="w-4 h-4" /> Add Prospect</Button>
        </DialogTrigger>
      )}
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{editData ? "Edit Prospect" : "Add New Prospect"}</DialogTitle></DialogHeader>
        <div className="grid grid-cols-2 gap-3 mt-2">
          {[
            { k: "businessName", l: "Business Name *", p: "e.g. Mario's Pizza" },
            { k: "ownerName", l: "Owner / Contact Name", p: "e.g. Mario Rossi" },
            { k: "email", l: "Email", p: "owner@business.com" },
            { k: "phone", l: "Phone / WhatsApp", p: "+1 555 000 0000" },
            { k: "website", l: "Website", p: "https://website.com" },
            { k: "country", l: "Country", p: "e.g. United States" },
            { k: "city", l: "City", p: "e.g. New York" },
            { k: "facebook", l: "Facebook", p: "facebook.com/page" },
            { k: "instagram", l: "Instagram", p: "@handle" },
            { k: "linkedin", l: "LinkedIn", p: "linkedin.com/company/..." },
          ].map(f => (
            <div key={f.k} className={f.k === "website" || f.k === "businessName" ? "col-span-2" : ""}>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">{f.l}</label>
              <Input value={(form as any)[f.k]} onChange={e => set(f.k, e.target.value)} placeholder={f.p} />
            </div>
          ))}
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">Category</label>
            <Select value={form.category} onValueChange={v => set("category", v)}>
              <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
              <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">Status</label>
            <Select value={form.status} onValueChange={v => set("status", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{Object.entries(STATUS_CONFIG).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">Priority</label>
            <Select value={form.priority} onValueChange={v => set("priority", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="high">🔴 High</SelectItem>
                <SelectItem value="medium">🟡 Medium</SelectItem>
                <SelectItem value="low">🟢 Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">Expected Value ($)</label>
            <Input type="number" value={form.expectedValue} onChange={e => set("expectedValue", Number(e.target.value))} placeholder="0" />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">Win Probability (%)</label>
            <Input type="number" min={0} max={100} value={form.probability} onChange={e => set("probability", Number(e.target.value))} />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">Next Follow-up Date</label>
            <Input type="date" value={form.nextFollowUp} onChange={e => set("nextFollowUp", e.target.value)} />
          </div>
          <div className="col-span-2">
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">Notes</label>
            <Textarea value={form.notes} onChange={e => set("notes", e.target.value)} rows={3} placeholder="Meeting notes, special requests, pricing notes…" />
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <Button onClick={handleSubmit} className="flex-1 font-semibold" disabled={!form.businessName.trim()}>
            {editData ? "Save Changes" : "Add Prospect"}
          </Button>
          <Button variant="outline" onClick={() => { setOpen(false); onClose?.(); }}>Cancel</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Analysis Panel ───────────────────────────────────────────────────────────

function AnalysisPanel({ prospect, onUpdate }: { prospect: Prospect; onUpdate: (p: Prospect) => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const analyze = async () => {
    setLoading(true); setError("");
    try {
      const data = await callCRM("analyze-website", {
        website: prospect.website,
        businessName: prospect.businessName,
        category: prospect.category,
      });
      onUpdate({ ...prospect, analysis: data });
    } catch (e: any) {
      setError(e.message);
    } finally { setLoading(false); }
  };

  const a = prospect.analysis;

  if (loading) return <LoadingSpinner text="AI is analyzing the business website…" />;

  if (!a) return (
    <div className="text-center py-12">
      <BarChart3 className="w-12 h-12 mx-auto mb-4 text-primary/30" />
      <h3 className="font-bold text-lg mb-2">AI Website Analysis</h3>
      <p className="text-muted-foreground text-sm mb-6 max-w-sm mx-auto">
        Get a full digital audit — scores, issues, opportunities, and recommended solutions for {prospect.businessName}.
      </p>
      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
      <Button onClick={analyze} className="gap-2 btn-premium text-white font-bold">
        <Sparkles className="w-4 h-4" /> Run AI Analysis
      </Button>
    </div>
  );

  const scoreColor = (v: number) => v >= 70 ? "#16A34A" : v >= 40 ? "#D97706" : "#DC2626";

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-bold text-lg">{prospect.businessName} — Website Report</h3>
          <p className="text-sm text-muted-foreground mt-1">{a.summary}</p>
        </div>
        <Button size="sm" variant="outline" onClick={analyze} className="gap-1.5 flex-shrink-0">
          <RefreshCw className="w-3.5 h-3.5" /> Re-analyze
        </Button>
      </div>

      {/* Scores */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Website Score", v: a.websiteScore },
          { label: "Lead Generation", v: a.leadScore },
          { label: "Conversion", v: a.conversionScore },
          { label: "Mobile Experience", v: a.mobileScore },
          { label: "SEO Score", v: a.seoScore },
          { label: "Growth Potential", v: a.growthPotential },
        ].map(s => (
          <div key={s.label} className="rounded-xl border border-border/50 p-3 text-center">
            <div className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1">{s.label}</div>
            <div className="text-3xl font-extrabold" style={{ color: scoreColor(s.v) }}>{s.v}</div>
            <div className="text-[10px] text-muted-foreground">/100</div>
          </div>
        ))}
      </div>

      {/* Feature Checklist */}
      <div className="rounded-xl border border-border/50 overflow-hidden">
        <div className="p-3 bg-muted/20 border-b border-border/50">
          <h4 className="text-sm font-bold">Feature Checklist</h4>
        </div>
        <div className="p-4 grid grid-cols-2 md:grid-cols-3 gap-2">
          {Object.entries(a.checks).map(([k, v]) => (
            <div key={k} className={`flex items-center gap-2 text-xs px-3 py-2 rounded-lg ${v ? "bg-green-50 text-green-800" : "bg-red-50 text-red-700"}`}>
              {v ? <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" /> : <X className="w-3.5 h-3.5 flex-shrink-0" />}
              {CHECK_LABELS[k] || k}
            </div>
          ))}
        </div>
      </div>

      {/* Issues */}
      {a.issues.length > 0 && (
        <div className="rounded-xl border border-border/50 overflow-hidden">
          <div className="p-3 bg-muted/20 border-b border-border/50">
            <h4 className="text-sm font-bold">Issues Found ({a.issues.length})</h4>
          </div>
          <div className="divide-y divide-border/30">
            {a.issues.map((issue, i) => (
              <div key={i} className="p-3 flex items-start gap-3">
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 mt-0.5 ${
                  issue.priority === "high" ? "bg-red-100 text-red-700" :
                  issue.priority === "medium" ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"
                }`}>{issue.priority}</span>
                <div>
                  <div className="text-sm font-semibold">{issue.title}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{issue.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Opportunities */}
      {a.opportunities.length > 0 && (
        <div className="rounded-xl border border-border/50 overflow-hidden">
          <div className="p-3 bg-muted/20 border-b border-border/50">
            <h4 className="text-sm font-bold">Revenue Opportunities</h4>
          </div>
          <div className="divide-y divide-border/30">
            {a.opportunities.map((op, i) => (
              <div key={i} className="p-3 flex items-start gap-3">
                <Zap className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-semibold">{op.title}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{op.impact}</div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ml-auto font-medium ${
                  op.effort === "low" ? "bg-green-100 text-green-700" :
                  op.effort === "medium" ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"
                }`}>{op.effort} effort</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Project Estimate */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-4">
        <h4 className="font-bold text-sm text-purple-900 mb-3">Project Estimate</h4>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <div className="text-xs text-muted-foreground">Type</div>
            <div className="font-bold text-sm mt-1">{a.projectType}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Est. Value</div>
            <div className="font-bold text-sm mt-1 text-purple-700">${a.estimatedValue.min.toLocaleString()} – ${a.estimatedValue.max.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Delivery</div>
            <div className="font-bold text-sm mt-1">{a.deliveryWeeks.min}–{a.deliveryWeeks.max} weeks</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Outreach Panel ──────────────────────────────────────────────────────────

function OutreachPanel({ prospect, onUpdate }: { prospect: Prospect; onUpdate: (p: Prospect) => void }) {
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [loadingWA, setLoadingWA] = useState(false);
  const [loadingLI, setLoadingLI] = useState(false);
  const [loadingFollowup, setLoadingFollowup] = useState(false);
  const [followupDay, setFollowupDay] = useState("3");
  const [followup, setFollowup] = useState<{ subject: string; body: string } | null>(null);
  const [error, setError] = useState("");

  const issues = prospect.analysis?.issues.slice(0, 3).map(i => i.title).join(", ") || "";
  const opportunities = prospect.analysis?.opportunities.slice(0, 2).map(o => o.title).join(", ") || "";

  const genEmail = async () => {
    setLoadingEmail(true); setError("");
    try {
      const data = await callCRM("generate-email", {
        businessName: prospect.businessName, ownerName: prospect.ownerName,
        category: prospect.category, website: prospect.website,
        issues, opportunities, agencyName: AGENCY_NAME,
      });
      onUpdate({ ...prospect, generatedEmail: data });
    } catch (e: any) { setError(e.message); }
    finally { setLoadingEmail(false); }
  };

  const genWA = async () => {
    setLoadingWA(true); setError("");
    try {
      const data = await callCRM("generate-whatsapp", {
        businessName: prospect.businessName, category: prospect.category,
        opportunities, agencyName: AGENCY_NAME,
      });
      onUpdate({ ...prospect, generatedWhatsApp: data.message });
    } catch (e: any) { setError(e.message); }
    finally { setLoadingWA(false); }
  };

  const genLI = async () => {
    setLoadingLI(true); setError("");
    try {
      const data = await callCRM("generate-linkedin", {
        businessName: prospect.businessName, ownerName: prospect.ownerName,
        category: prospect.category, agencyName: AGENCY_NAME,
      });
      onUpdate({ ...prospect, generatedLinkedIn: data.message });
    } catch (e: any) { setError(e.message); }
    finally { setLoadingLI(false); }
  };

  const genFollowup = async () => {
    setLoadingFollowup(true); setError("");
    try {
      const data = await callCRM("generate-followup", {
        businessName: prospect.businessName, ownerName: prospect.ownerName,
        day: followupDay, agencyName: AGENCY_NAME,
        previousContext: `Sent cold email about custom software for their ${prospect.category} business`,
      });
      setFollowup(data);
    } catch (e: any) { setError(e.message); }
    finally { setLoadingFollowup(false); }
  };

  return (
    <div className="space-y-5">
      {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</div>}

      {/* Email */}
      <div className="rounded-xl border border-border/50 overflow-hidden">
        <div className="p-4 border-b border-border/50 bg-muted/20 flex items-center justify-between">
          <h4 className="font-bold text-sm flex items-center gap-2"><Mail className="w-4 h-4 text-primary" /> Cold Email</h4>
          <div className="flex gap-2">
            {prospect.generatedEmail && <CopyButton text={`Subject: ${prospect.generatedEmail.subject}\n\n${prospect.generatedEmail.body}`} />}
            <Button size="sm" variant="outline" onClick={genEmail} disabled={loadingEmail} className="h-7 text-xs gap-1">
              {loadingEmail ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
              {prospect.generatedEmail ? "Regenerate" : "Generate"}
            </Button>
            {prospect.generatedEmail && prospect.email && (
              <Button size="sm" className="h-7 text-xs gap-1" onClick={() => window.open(`mailto:${prospect.email}?subject=${encodeURIComponent(prospect.generatedEmail!.subject)}&body=${encodeURIComponent(prospect.generatedEmail!.body)}`, "_blank")}>
                <Send className="w-3 h-3" /> Send
              </Button>
            )}
          </div>
        </div>
        {loadingEmail ? <LoadingSpinner text="Crafting personalized email…" /> : prospect.generatedEmail ? (
          <div className="p-4 space-y-3">
            <div className="bg-muted/30 rounded-lg p-3">
              <div className="text-xs font-bold text-muted-foreground mb-1">SUBJECT</div>
              <div className="text-sm font-semibold">{prospect.generatedEmail.subject}</div>
            </div>
            <Textarea value={prospect.generatedEmail.body} onChange={e => onUpdate({ ...prospect, generatedEmail: { ...prospect.generatedEmail!, body: e.target.value } })} rows={10} className="text-sm font-mono" />
          </div>
        ) : <div className="p-6 text-center text-sm text-muted-foreground">Click Generate to create a personalized email for {prospect.businessName}</div>}
      </div>

      {/* WhatsApp */}
      <div className="rounded-xl border border-border/50 overflow-hidden">
        <div className="p-4 border-b border-border/50 bg-muted/20 flex items-center justify-between">
          <h4 className="font-bold text-sm flex items-center gap-2"><MessageCircle className="w-4 h-4 text-green-600" /> WhatsApp Message</h4>
          <div className="flex gap-2">
            {prospect.generatedWhatsApp && <CopyButton text={prospect.generatedWhatsApp} />}
            <Button size="sm" variant="outline" onClick={genWA} disabled={loadingWA} className="h-7 text-xs gap-1">
              {loadingWA ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
              {prospect.generatedWhatsApp ? "Regenerate" : "Generate"}
            </Button>
            {prospect.generatedWhatsApp && prospect.phone && (
              <Button size="sm" className="h-7 text-xs gap-1 bg-green-600 hover:bg-green-700 text-white" onClick={() => window.open(`https://wa.me/${prospect.phone.replace(/\D/g,"")}?text=${encodeURIComponent(prospect.generatedWhatsApp!)}`, "_blank")}>
                <MessageCircle className="w-3 h-3" /> Open WA
              </Button>
            )}
          </div>
        </div>
        {loadingWA ? <LoadingSpinner text="Writing WhatsApp message…" /> : prospect.generatedWhatsApp ? (
          <div className="p-4">
            <Textarea value={prospect.generatedWhatsApp} onChange={e => onUpdate({ ...prospect, generatedWhatsApp: e.target.value })} rows={5} className="text-sm" />
          </div>
        ) : <div className="p-6 text-center text-sm text-muted-foreground">Generate a short, human WhatsApp message</div>}
      </div>

      {/* LinkedIn */}
      <div className="rounded-xl border border-border/50 overflow-hidden">
        <div className="p-4 border-b border-border/50 bg-muted/20 flex items-center justify-between">
          <h4 className="font-bold text-sm flex items-center gap-2"><Linkedin className="w-4 h-4 text-blue-700" /> LinkedIn Message</h4>
          <div className="flex gap-2">
            {prospect.generatedLinkedIn && <CopyButton text={prospect.generatedLinkedIn} />}
            <Button size="sm" variant="outline" onClick={genLI} disabled={loadingLI} className="h-7 text-xs gap-1">
              {loadingLI ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
              {prospect.generatedLinkedIn ? "Regenerate" : "Generate"}
            </Button>
          </div>
        </div>
        {loadingLI ? <LoadingSpinner text="Writing LinkedIn connection message…" /> : prospect.generatedLinkedIn ? (
          <div className="p-4">
            <Textarea value={prospect.generatedLinkedIn} onChange={e => onUpdate({ ...prospect, generatedLinkedIn: e.target.value })} rows={3} className="text-sm" />
            <div className="text-xs text-muted-foreground mt-2">{prospect.generatedLinkedIn.length}/300 characters</div>
          </div>
        ) : <div className="p-6 text-center text-sm text-muted-foreground">Generate a 300-char LinkedIn connection request</div>}
      </div>

      {/* Follow-up */}
      <div className="rounded-xl border border-border/50 overflow-hidden">
        <div className="p-4 border-b border-border/50 bg-muted/20 flex items-center justify-between">
          <h4 className="font-bold text-sm flex items-center gap-2"><Clock className="w-4 h-4 text-orange-600" /> Follow-up Generator</h4>
          <div className="flex items-center gap-2">
            <Select value={followupDay} onValueChange={setFollowupDay}>
              <SelectTrigger className="w-24 h-7 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="3">Day 3</SelectItem>
                <SelectItem value="7">Day 7</SelectItem>
                <SelectItem value="14">Day 14</SelectItem>
                <SelectItem value="30">Day 30</SelectItem>
              </SelectContent>
            </Select>
            <Button size="sm" variant="outline" onClick={genFollowup} disabled={loadingFollowup} className="h-7 text-xs gap-1">
              {loadingFollowup ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
              Generate
            </Button>
            {followup && <CopyButton text={`Subject: ${followup.subject}\n\n${followup.body}`} />}
          </div>
        </div>
        {loadingFollowup ? <LoadingSpinner text="Writing follow-up…" /> : followup ? (
          <div className="p-4 space-y-3">
            <div className="bg-muted/30 rounded-lg p-3">
              <div className="text-xs font-bold text-muted-foreground mb-1">SUBJECT</div>
              <div className="text-sm font-semibold">{followup.subject}</div>
            </div>
            <Textarea value={followup.body} onChange={e => setFollowup({ ...followup, body: e.target.value })} rows={6} className="text-sm" />
          </div>
        ) : <div className="p-6 text-center text-sm text-muted-foreground">Generate follow-up messages for Day 3, 7, 14, or 30</div>}
      </div>
    </div>
  );
}

// ─── Proposal Panel ──────────────────────────────────────────────────────────

function ProposalPanel({ prospect, onUpdate }: { prospect: Prospect; onUpdate: (p: Prospect) => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const generate = async () => {
    setLoading(true); setError("");
    try {
      const a = prospect.analysis;
      const data = await callCRM("generate-proposal", {
        businessName: prospect.businessName, category: prospect.category,
        website: prospect.website, agencyName: AGENCY_NAME,
        issues: a?.issues.map(i => i.title).join(", ") || "",
        features: a?.recommendedFeatures.join(", ") || "",
        estimatedValue: a ? `$${a.estimatedValue.min.toLocaleString()} – $${a.estimatedValue.max.toLocaleString()}` : "",
      });
      onUpdate({ ...prospect, proposal: data });
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  const p = prospect.proposal?.sections;

  if (loading) return <LoadingSpinner text="AI is generating your proposal…" />;

  if (!p) return (
    <div className="text-center py-12">
      <Download className="w-12 h-12 mx-auto mb-4 text-primary/30" />
      <h3 className="font-bold text-lg mb-2">AI Proposal Generator</h3>
      <p className="text-muted-foreground text-sm mb-4 max-w-sm mx-auto">
        Generate a full professional proposal for {prospect.businessName}. Run AI Analysis first for best results.
      </p>
      {!prospect.analysis && <p className="text-amber-600 text-xs mb-4">Tip: Run Website Analysis first for a more accurate proposal.</p>}
      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
      <Button onClick={generate} className="gap-2 btn-premium text-white font-bold">
        <Sparkles className="w-4 h-4" /> Generate Proposal
      </Button>
    </div>
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-lg">Proposal — {prospect.businessName}</h3>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={generate} className="gap-1.5">
            <RefreshCw className="w-3.5 h-3.5" /> Regenerate
          </Button>
          <Button size="sm" onClick={() => window.print()} className="gap-1.5">
            <Download className="w-3.5 h-3.5" /> Print/PDF
          </Button>
        </div>
      </div>

      {[
        { title: "Executive Summary", content: <p className="text-sm leading-relaxed">{p.executiveSummary}</p> },
        { title: "Current Digital Situation", content: <p className="text-sm leading-relaxed">{p.situation}</p> },
        { title: "Problems We Found", content: <ul className="space-y-2">{p.problems.map((pb, i) => <li key={i} className="flex items-start gap-2 text-sm"><AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />{pb}</li>)}</ul> },
        { title: "Our Recommended Solution", content: <p className="text-sm leading-relaxed">{p.solution}</p> },
        { title: "Key Features", content: <div className="grid sm:grid-cols-2 gap-2">{p.features.map((f, i) => <div key={i} className="flex items-start gap-2 p-3 bg-primary/5 rounded-lg"><CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" /><div><div className="text-sm font-semibold">{f.name}</div><div className="text-xs text-muted-foreground">{f.desc}</div></div></div>)}</div> },
        { title: "Business Benefits", content: <ul className="space-y-2">{p.benefits.map((b, i) => <li key={i} className="flex items-center gap-2 text-sm"><TrendingUp className="w-4 h-4 text-green-600 flex-shrink-0" />{b}</li>)}</ul> },
        { title: "Delivery Timeline", content: <div className="space-y-2">{p.timeline.map((t, i) => <div key={i} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg"><div className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded flex-shrink-0">{t.week}</div><div className="text-sm">{t.task}</div></div>)}</div> },
        { title: "Investment", content: <p className="text-sm leading-relaxed">{p.investment}</p> },
        { title: "Why Choose DevStudio", content: <ul className="space-y-2">{p.whyUs.map((w, i) => <li key={i} className="flex items-start gap-2 text-sm"><Star className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />{w}</li>)}</ul> },
        { title: "Next Steps", content: <div className="space-y-2">{p.nextSteps.map((s, i) => <div key={i} className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg"><div className="w-6 h-6 rounded-full bg-green-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">{i + 1}</div><div className="text-sm">{s}</div></div>)}</div> },
      ].map(section => (
        <div key={section.title} className="rounded-xl border border-border/50 overflow-hidden">
          <div className="p-3 bg-muted/20 border-b border-border/50">
            <h4 className="font-bold text-sm">{section.title}</h4>
          </div>
          <div className="p-4">{section.content}</div>
        </div>
      ))}
    </div>
  );
}

// ─── Prospect Detail ─────────────────────────────────────────────────────────

function ProspectDetail({ prospect, onUpdate, onDelete, onBack }: {
  prospect: Prospect;
  onUpdate: (p: Prospect) => void;
  onDelete: () => void;
  onBack: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const cfg = STATUS_CONFIG[prospect.status];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-1"><ChevronRight className="w-4 h-4 rotate-180" /> Back</Button>
        <div className="flex-1">
          <h2 className="font-extrabold text-xl">{prospect.businessName}</h2>
          <div className="flex items-center gap-2 mt-1">
            <Badge className={`${cfg.bg} ${cfg.color} ${cfg.border} border text-xs`}>{cfg.label}</Badge>
            {prospect.category && <span className="text-xs text-muted-foreground">{prospect.category}</span>}
            {prospect.priority === "high" && <span className="text-xs font-bold text-red-600">🔴 High Priority</span>}
          </div>
        </div>
        <Button size="sm" variant="outline" onClick={() => setEditing(true)}>Edit</Button>
        <Button size="sm" variant="ghost" className="text-destructive/70 hover:text-destructive" onClick={onDelete}><Trash2 className="w-4 h-4" /></Button>
      </div>

      {/* Quick info */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Website", value: prospect.website, href: prospect.website, icon: <Globe className="w-3.5 h-3.5" /> },
          { label: "Email", value: prospect.email, href: `mailto:${prospect.email}`, icon: <Mail className="w-3.5 h-3.5" /> },
          { label: "Phone", value: prospect.phone, href: `tel:${prospect.phone}`, icon: <Phone className="w-3.5 h-3.5" /> },
          { label: "Expected Value", value: prospect.expectedValue ? `$${prospect.expectedValue.toLocaleString()}` : "—", icon: <Target className="w-3.5 h-3.5" /> },
        ].map(item => item.value ? (
          <div key={item.label} className="rounded-xl border border-border/50 p-3">
            <div className="text-xs text-muted-foreground flex items-center gap-1 mb-1">{item.icon}{item.label}</div>
            {item.href && item.value ? (
              <a href={item.href} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-primary hover:underline truncate block">{item.value}</a>
            ) : <div className="text-sm font-semibold truncate">{item.value}</div>}
          </div>
        ) : null)}
      </div>

      {/* Status + follow-up */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold text-muted-foreground mb-1 block">Pipeline Status</label>
          <Select value={prospect.status} onValueChange={v => onUpdate({ ...prospect, status: v as LeadStatus })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{Object.entries(STATUS_CONFIG).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        {prospect.nextFollowUp && (
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">Next Follow-up</label>
            <div className="flex items-center gap-2 p-2 border border-border/50 rounded-lg text-sm">
              <Clock className="w-4 h-4 text-orange-500" />
              {new Date(prospect.nextFollowUp).toLocaleDateString()}
            </div>
          </div>
        )}
      </div>

      {prospect.notes && (
        <div className="rounded-xl border border-border/50 p-4">
          <div className="text-xs font-bold text-muted-foreground mb-2">NOTES</div>
          <p className="text-sm leading-relaxed">{prospect.notes}</p>
        </div>
      )}

      <Tabs defaultValue="analysis">
        <TabsList className="w-full">
          <TabsTrigger value="analysis" className="flex-1">AI Analysis</TabsTrigger>
          <TabsTrigger value="outreach" className="flex-1">Outreach</TabsTrigger>
          <TabsTrigger value="proposal" className="flex-1">Proposal</TabsTrigger>
        </TabsList>
        <TabsContent value="analysis" className="mt-4"><AnalysisPanel prospect={prospect} onUpdate={onUpdate} /></TabsContent>
        <TabsContent value="outreach" className="mt-4"><OutreachPanel prospect={prospect} onUpdate={onUpdate} /></TabsContent>
        <TabsContent value="proposal" className="mt-4"><ProposalPanel prospect={prospect} onUpdate={onUpdate} /></TabsContent>
      </Tabs>

      {editing && <AddProspectDialog onAdd={p => { onUpdate({ ...prospect, ...p }); setEditing(false); }} editData={prospect} onClose={() => setEditing(false)} />}
    </div>
  );
}

// ─── Prospect List ────────────────────────────────────────────────────────────

function ProspectList({ prospects, onSelect, onDelete, onUpdate }: {
  prospects: Prospect[];
  onSelect: (p: Prospect) => void;
  onDelete: (id: number) => void;
  onUpdate: (p: Prospect) => void;
}) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const filtered = prospects.filter(p => {
    const q = search.toLowerCase();
    const matchSearch = !q || p.businessName.toLowerCase().includes(q) || p.email.toLowerCase().includes(q) || p.city.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
    const matchStatus = statusFilter === "all" || p.status === statusFilter;
    const matchCat = categoryFilter === "all" || p.category === categoryFilter;
    return matchSearch && matchStatus && matchCat;
  });

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search business, email, city…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36"><SelectValue placeholder="All statuses" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {Object.entries(STATUS_CONFIG).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-36"><SelectValue placeholder="All categories" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-14 text-muted-foreground">
          <Building className="w-10 h-10 mx-auto mb-3 opacity-20" />
          <p className="font-medium">{prospects.length === 0 ? "No prospects yet." : "No results match your filters."}</p>
        </div>
      ) : (
        <div className="divide-y divide-border/40 rounded-xl border border-border/50 overflow-hidden">
          {filtered.map(p => {
            const cfg = STATUS_CONFIG[p.status];
            return (
              <div key={p.id} className="p-4 flex items-start gap-4 hover:bg-muted/20 transition-colors group">
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary font-bold text-sm flex items-center justify-center flex-shrink-0">
                  {p.businessName.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0 cursor-pointer" onClick={() => onSelect(p)}>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm">{p.businessName}</span>
                    <Badge className={`${cfg.bg} ${cfg.color} ${cfg.border} border text-xs h-5`}>{cfg.label}</Badge>
                    {p.priority === "high" && <span className="text-xs text-red-600 font-bold">🔴</span>}
                    {p.analysis && <span className="text-xs text-purple-600 font-bold">✓ Analyzed</span>}
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground flex-wrap">
                    {p.category && <span>{p.category}</span>}
                    {p.city && <span>{p.city}{p.country ? `, ${p.country}` : ""}</span>}
                    {p.website && <span className="text-primary truncate max-w-32">{p.website}</span>}
                    {p.expectedValue > 0 && <span className="text-green-700 font-semibold">${p.expectedValue.toLocaleString()}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="ghost" className="h-8 px-3 text-xs gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => onSelect(p)}>
                    <Sparkles className="w-3 h-3" /> Open
                  </Button>
                  <Select value={p.status} onValueChange={v => onUpdate({ ...p, status: v as LeadStatus })}>
                    <SelectTrigger className={`w-[110px] h-7 text-xs font-semibold ${cfg.color} ${cfg.bg} ${cfg.border} border`} onClick={e => e.stopPropagation()}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>{Object.entries(STATUS_CONFIG).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent>
                  </Select>
                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive/50 hover:text-destructive" onClick={() => onDelete(p.id)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Main CRM Page ────────────────────────────────────────────────────────────

export default function CRM() {
  const [prospects, setProspects] = useState<Prospect[]>(loadProspects);
  const [selected, setSelected] = useState<Prospect | null>(null);
  const [view, setView] = useState<"dashboard" | "prospects" | "detail">("dashboard");

  const persist = useCallback((updated: Prospect[]) => {
    setProspects(updated);
    saveProspects(updated);
  }, []);

  const addProspect = (data: Omit<Prospect, "id" | "addedAt">) => {
    const p: Prospect = { ...data, id: Date.now(), addedAt: new Date().toISOString() };
    persist([p, ...prospects]);
  };

  const updateProspect = (p: Prospect) => {
    const updated = prospects.map(x => x.id === p.id ? p : x);
    persist(updated);
    if (selected?.id === p.id) setSelected(p);
  };

  const deleteProspect = (id: number) => {
    if (!confirm("Remove this prospect?")) return;
    persist(prospects.filter(p => p.id !== id));
    if (selected?.id === id) { setSelected(null); setView("prospects"); }
  };

  const openDetail = (p: Prospect) => {
    setSelected(p);
    setView("detail");
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#7C3AED] to-[#6366F1] text-white px-6 py-5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold">AI Client Hunter</h1>
              <p className="text-purple-200 text-xs">Your private agency sales engine</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-right text-xs text-purple-200 mr-2 hidden sm:block">
              <div className="font-bold text-white">{prospects.length} prospects</div>
              <div>${prospects.filter(p => !["lost","archive"].includes(p.status)).reduce((s, p) => s + (p.expectedValue || 0), 0).toLocaleString()} pipeline</div>
            </div>
            <AddProspectDialog onAdd={addProspect} />
          </div>
        </div>
      </div>

      {/* Nav */}
      <div className="bg-white border-b border-border/50 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex gap-0">
            {[
              { key: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
              { key: "prospects", label: `Prospects (${prospects.length})`, icon: <Users className="w-4 h-4" /> },
            ].map(tab => (
              <button key={tab.key} onClick={() => setView(tab.key as any)}
                className={`flex items-center gap-2 px-4 py-3.5 text-sm font-semibold border-b-2 transition-colors ${
                  view === tab.key || (view === "detail" && tab.key === "prospects")
                    ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
                }`}>
                {tab.icon}{tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <AnimatePresence mode="wait">
          {view === "dashboard" && (
            <motion.div key="dashboard" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <Dashboard prospects={prospects} />
              {prospects.length > 0 && (
                <div className="mt-6 text-center">
                  <Button onClick={() => setView("prospects")} variant="outline" className="gap-2">
                    View All Prospects <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </motion.div>
          )}
          {view === "prospects" && (
            <motion.div key="prospects" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <ProspectList prospects={prospects} onSelect={openDetail} onDelete={deleteProspect} onUpdate={updateProspect} />
            </motion.div>
          )}
          {view === "detail" && selected && (
            <motion.div key="detail" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
              <ProspectDetail
                prospect={prospects.find(p => p.id === selected.id) || selected}
                onUpdate={updateProspect}
                onDelete={() => deleteProspect(selected.id)}
                onBack={() => setView("prospects")}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
