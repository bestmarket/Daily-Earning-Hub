import { useEffect, useState } from "react";
import { useParams } from "wouter";
import API_BASE from "@/lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Analysis {
  websiteScore?: number;
  leadScore?: number;
  conversionScore?: number;
  mobileScore?: number;
  seoScore?: number;
  growthPotential?: number;
  summary?: string;
  projectType?: string;
  estimatedValue?: { min: number; max: number };
  deliveryWeeks?: { min: number; max: number };
  recommendedFeatures?: string[];
  issues?: { title: string; description: string; priority: "high" | "medium" | "low" }[];
  opportunities?: { title: string; impact: string; effort: string }[];
  checks?: Record<string, boolean>;
}

interface Report {
  reportId: string;
  businessName: string;
  website: string;
  analysisData: Analysis;
  reportUrl: string;
  createdAt: string | null;
  totalViews: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function ScoreRing({ score, label, color }: { score: number; label: string; color: string }) {
  const pct = Math.max(0, Math.min(100, score ?? 0));
  const radius = 30;
  const circ = 2 * Math.PI * radius;
  const dash = (pct / 100) * circ;
  return (
    <div className="flex flex-col items-center gap-2">
      <svg width="80" height="80" viewBox="0 0 80 80">
        <circle cx="40" cy="40" r={radius} fill="none" stroke="#e5e7eb" strokeWidth="8" />
        <circle
          cx="40" cy="40" r={radius} fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          transform="rotate(-90 40 40)"
        />
        <text x="40" y="45" textAnchor="middle" fontSize="16" fontWeight="700" fill="#111">{pct}</text>
      </svg>
      <span style={{ fontSize: 12, color: "#6b7280", fontWeight: 600, textAlign: "center" }}>{label}</span>
    </div>
  );
}

function ProgressBar({ value, color }: { value: number; color: string }) {
  return (
    <div style={{ background: "#f3f4f6", borderRadius: 99, height: 8, overflow: "hidden", flex: 1 }}>
      <div style={{ width: `${Math.max(0, Math.min(100, value ?? 0))}%`, background: color, height: "100%", borderRadius: 99, transition: "width 0.8s ease" }} />
    </div>
  );
}

const CHECK_LABELS: Record<string, string> = {
  responsiveDesign: "Mobile Responsive",
  sslCertificate: "SSL Certificate (HTTPS)",
  modernUI: "Modern Design",
  whatsappButton: "WhatsApp Button",
  contactForm: "Contact Form",
  bookingSystem: "Booking System",
  onlineOrdering: "Online Ordering",
  paymentIntegration: "Payment Integration",
  customerPortal: "Customer Portal",
  membershipArea: "Membership Area",
  blog: "Blog / Content",
  seoBasics: "SEO Basics",
  analytics: "Analytics Tracking",
  socialMedia: "Social Media Links",
  emailCapture: "Email Capture",
  liveChat: "Live Chat",
  aiChatbot: "AI Chatbot",
  callToAction: "Clear Call-to-Action",
  trustElements: "Trust Elements",
};

const PRIORITY_COLORS = { high: "#ef4444", medium: "#f59e0b", low: "#10b981" };
const PRIORITY_BG = { high: "#fef2f2", medium: "#fffbeb", low: "#f0fdf4" };

// ─── Main component ───────────────────────────────────────────────────────────

export default function Report() {
  const params = useParams<{ reportId: string }>();
  const reportId = params.reportId;

  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!reportId) return;
    fetch(`${API_BASE}/api/reports/${reportId}`)
      .then(async (r) => {
        if (r.status === 404) { setNotFound(true); return; }
        const data = await r.json();
        setReport(data);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [reportId]);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8f9fa" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 48, height: 48, border: "4px solid #e5e7eb", borderTopColor: "#6d28d9", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
          <p style={{ color: "#6b7280", fontFamily: "Georgia, serif" }}>Loading your report…</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  if (notFound || !report) {
    return (
      <div style={{ minHeight: "100vh", background: "#f8f9fa", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center", maxWidth: 400, padding: 32 }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🔍</div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "#111", marginBottom: 8, fontFamily: "Georgia, serif" }}>Report Not Found</h1>
          <p style={{ color: "#6b7280", lineHeight: 1.6 }}>This report doesn't exist or the link may have expired. Please contact us for your free website analysis.</p>
          <a href="/" style={{ display: "inline-block", marginTop: 24, background: "#6d28d9", color: "#fff", padding: "12px 24px", borderRadius: 8, textDecoration: "none", fontWeight: 700, fontSize: 14 }}>Visit Our Website</a>
        </div>
      </div>
    );
  }

  const a = report.analysisData || {};
  const checks = a.checks || {};
  const presentFeatures = Object.entries(checks).filter(([, v]) => v).map(([k]) => k);
  const missingFeatures = Object.entries(checks).filter(([, v]) => !v).map(([k]) => k);
  const overallScore = a.websiteScore ?? 0;
  const scoreColor = overallScore >= 70 ? "#10b981" : overallScore >= 40 ? "#f59e0b" : "#ef4444";
  const formattedDate = report.createdAt ? new Date(report.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "";
  const valueMin = a.estimatedValue?.min ?? 0;
  const valueMax = a.estimatedValue?.max ?? 0;
  const weekMin = a.deliveryWeeks?.min ?? 0;
  const weekMax = a.deliveryWeeks?.max ?? 0;
  const contactHref = "/custom-request";

  return (
    <div style={{ fontFamily: "Georgia, serif", background: "#f8f9fa", minHeight: "100vh", color: "#1a1a2e" }}>

      {/* ── Hero header ── */}
      <div style={{ background: "linear-gradient(135deg, #4c1d95 0%, #6d28d9 50%, #4f46e5 100%)", color: "#fff", padding: "0 0 0 0" }}>
        <div style={{ maxWidth: 860, margin: "0 auto", padding: "40px 24px 48px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, opacity: 0.85 }}>
            <div style={{ width: 36, height: 36, background: "rgba(255,255,255,0.2)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>📊</div>
            <span style={{ fontSize: 13, letterSpacing: 2, textTransform: "uppercase", fontFamily: "sans-serif", fontWeight: 600 }}>Free Website Analysis Report</span>
          </div>
          <h1 style={{ fontSize: "clamp(26px, 5vw, 42px)", fontWeight: 700, margin: "0 0 10px", lineHeight: 1.2 }}>
            {report.businessName}
          </h1>
          {report.website && (
            <a href={report.website.startsWith("http") ? report.website : `https://${report.website}`} target="_blank" rel="noopener noreferrer"
              style={{ color: "rgba(255,255,255,0.7)", fontSize: 14, textDecoration: "none", fontFamily: "sans-serif" }}>
              🔗 {report.website}
            </a>
          )}
          <div style={{ display: "flex", gap: 16, marginTop: 24, flexWrap: "wrap" }}>
            <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: 10, padding: "10px 16px", fontFamily: "sans-serif" }}>
              <div style={{ fontSize: 22, fontWeight: 800 }}>{overallScore}<span style={{ fontSize: 14, opacity: 0.8 }}>/100</span></div>
              <div style={{ fontSize: 11, opacity: 0.8, letterSpacing: 1, textTransform: "uppercase" }}>Website Score</div>
            </div>
            <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: 10, padding: "10px 16px", fontFamily: "sans-serif" }}>
              <div style={{ fontSize: 22, fontWeight: 800 }}>{a.issues?.length ?? 0}</div>
              <div style={{ fontSize: 11, opacity: 0.8, letterSpacing: 1, textTransform: "uppercase" }}>Issues Found</div>
            </div>
            <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: 10, padding: "10px 16px", fontFamily: "sans-serif" }}>
              <div style={{ fontSize: 22, fontWeight: 800 }}>{a.opportunities?.length ?? 0}</div>
              <div style={{ fontSize: 11, opacity: 0.8, letterSpacing: 1, textTransform: "uppercase" }}>Opportunities</div>
            </div>
            {formattedDate && (
              <div style={{ background: "rgba(255,255,255,0.12)", borderRadius: 10, padding: "10px 16px", fontFamily: "sans-serif" }}>
                <div style={{ fontSize: 14, fontWeight: 700 }}>{formattedDate}</div>
                <div style={{ fontSize: 11, opacity: 0.8, letterSpacing: 1, textTransform: "uppercase" }}>Report Date</div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "32px 24px 80px" }}>

        {/* ── Executive summary ── */}
        {a.summary && (
          <div style={{ background: "#fff", borderRadius: 16, padding: "28px 32px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", marginBottom: 24 }}>
            <h2 style={{ fontSize: 14, textTransform: "uppercase", letterSpacing: 2, color: "#6d28d9", margin: "0 0 12px", fontFamily: "sans-serif", fontWeight: 700 }}>Executive Summary</h2>
            <p style={{ margin: 0, lineHeight: 1.8, fontSize: 16, color: "#374151" }}>{a.summary}</p>
          </div>
        )}

        {/* ── Score cards ── */}
        <div style={{ background: "#fff", borderRadius: 16, padding: "28px 32px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", marginBottom: 24 }}>
          <h2 style={{ fontSize: 14, textTransform: "uppercase", letterSpacing: 2, color: "#6d28d9", margin: "0 0 24px", fontFamily: "sans-serif", fontWeight: 700 }}>Performance Scores</h2>
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap", justifyContent: "center", marginBottom: 28 }}>
            <ScoreRing score={a.websiteScore ?? 0} label="Website" color="#6d28d9" />
            <ScoreRing score={a.leadScore ?? 0} label="Lead Gen" color="#4f46e5" />
            <ScoreRing score={a.conversionScore ?? 0} label="Conversion" color="#10b981" />
            <ScoreRing score={a.mobileScore ?? 0} label="Mobile" color="#f59e0b" />
            <ScoreRing score={a.seoScore ?? 0} label="SEO" color="#3b82f6" />
            <ScoreRing score={a.growthPotential ?? 0} label="Growth" color="#ec4899" />
          </div>
          {/* Score bars */}
          <div style={{ display: "grid", gap: 12 }}>
            {[
              { label: "Website Quality", value: a.websiteScore ?? 0, color: "#6d28d9" },
              { label: "Lead Generation", value: a.leadScore ?? 0, color: "#4f46e5" },
              { label: "Conversion Rate", value: a.conversionScore ?? 0, color: "#10b981" },
              { label: "Mobile Experience", value: a.mobileScore ?? 0, color: "#f59e0b" },
              { label: "SEO Optimisation", value: a.seoScore ?? 0, color: "#3b82f6" },
              { label: "Growth Potential", value: a.growthPotential ?? 0, color: "#ec4899" },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 12, fontFamily: "sans-serif" }}>
                <span style={{ fontSize: 13, color: "#374151", minWidth: 140 }}>{label}</span>
                <ProgressBar value={value} color={color} />
                <span style={{ fontSize: 13, fontWeight: 700, color, minWidth: 36, textAlign: "right" }}>{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Issues found ── */}
        {(a.issues?.length ?? 0) > 0 && (
          <div style={{ background: "#fff", borderRadius: 16, padding: "28px 32px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", marginBottom: 24 }}>
            <h2 style={{ fontSize: 14, textTransform: "uppercase", letterSpacing: 2, color: "#ef4444", margin: "0 0 20px", fontFamily: "sans-serif", fontWeight: 700 }}>⚠ Issues Found</h2>
            <div style={{ display: "grid", gap: 12 }}>
              {a.issues!.map((issue, i) => (
                <div key={i} style={{ background: PRIORITY_BG[issue.priority] || "#fef2f2", borderLeft: `4px solid ${PRIORITY_COLORS[issue.priority] || "#ef4444"}`, borderRadius: "0 10px 10px 0", padding: "14px 18px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, fontFamily: "sans-serif" }}>
                    <span style={{ fontWeight: 700, color: "#111", fontSize: 14 }}>{issue.title}</span>
                    <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, background: PRIORITY_COLORS[issue.priority], color: "#fff", padding: "2px 8px", borderRadius: 99 }}>{issue.priority}</span>
                  </div>
                  <p style={{ margin: 0, color: "#4b5563", fontSize: 13, lineHeight: 1.6, fontFamily: "sans-serif" }}>{issue.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Revenue opportunities ── */}
        {(a.opportunities?.length ?? 0) > 0 && (
          <div style={{ background: "#fff", borderRadius: 16, padding: "28px 32px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", marginBottom: 24 }}>
            <h2 style={{ fontSize: 14, textTransform: "uppercase", letterSpacing: 2, color: "#10b981", margin: "0 0 20px", fontFamily: "sans-serif", fontWeight: 700 }}>💡 Revenue Opportunities</h2>
            <div style={{ display: "grid", gap: 12 }}>
              {a.opportunities!.map((opp, i) => (
                <div key={i} style={{ background: "#f0fdf4", borderLeft: "4px solid #10b981", borderRadius: "0 10px 10px 0", padding: "14px 18px" }}>
                  <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4, fontFamily: "sans-serif" }}>{opp.title}</div>
                  <div style={{ display: "flex", gap: 12, fontFamily: "sans-serif", fontSize: 12, color: "#6b7280" }}>
                    <span>Impact: <strong style={{ color: "#10b981" }}>{opp.impact}</strong></span>
                    <span>Effort: <strong>{opp.effort}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Feature checklist ── */}
        {Object.keys(checks).length > 0 && (
          <div style={{ background: "#fff", borderRadius: 16, padding: "28px 32px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", marginBottom: 24 }}>
            <h2 style={{ fontSize: 14, textTransform: "uppercase", letterSpacing: 2, color: "#6d28d9", margin: "0 0 20px", fontFamily: "sans-serif", fontWeight: 700 }}>✓ Feature Checklist</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 10 }}>
              {Object.entries(checks).map(([key, present]) => (
                <div key={key} style={{ display: "flex", alignItems: "center", gap: 10, fontFamily: "sans-serif", fontSize: 13, padding: "8px 12px", borderRadius: 8, background: present ? "#f0fdf4" : "#fef2f2" }}>
                  <span style={{ fontSize: 16, flexShrink: 0 }}>{present ? "✅" : "❌"}</span>
                  <span style={{ color: present ? "#166534" : "#991b1b" }}>{CHECK_LABELS[key] || key}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Growth recommendations ── */}
        {(a.recommendedFeatures?.length ?? 0) > 0 && (
          <div style={{ background: "#fff", borderRadius: 16, padding: "28px 32px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", marginBottom: 24 }}>
            <h2 style={{ fontSize: 14, textTransform: "uppercase", letterSpacing: 2, color: "#6d28d9", margin: "0 0 20px", fontFamily: "sans-serif", fontWeight: 700 }}>🚀 Growth Recommendations</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 10 }}>
              {a.recommendedFeatures!.map((feat, i) => (
                <div key={i} style={{ background: "#f5f3ff", borderLeft: "3px solid #6d28d9", borderRadius: "0 8px 8px 0", padding: "10px 14px", fontFamily: "sans-serif", fontSize: 13, color: "#4c1d95", fontWeight: 600 }}>
                  {feat}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Project estimate ── */}
        {(valueMax > 0 || weekMax > 0) && (
          <div style={{ background: "#fff", borderRadius: 16, padding: "28px 32px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", marginBottom: 24 }}>
            <h2 style={{ fontSize: 14, textTransform: "uppercase", letterSpacing: 2, color: "#6d28d9", margin: "0 0 20px", fontFamily: "sans-serif", fontWeight: 700 }}>💰 Project Estimate</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 16 }}>
              {a.projectType && (
                <div style={{ background: "#f5f3ff", borderRadius: 12, padding: "20px 24px", textAlign: "center" }}>
                  <div style={{ fontSize: 13, color: "#6b7280", fontFamily: "sans-serif", marginBottom: 8 }}>Project Type</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: "#4c1d95", fontFamily: "sans-serif" }}>{a.projectType}</div>
                </div>
              )}
              {valueMax > 0 && (
                <div style={{ background: "#f0fdf4", borderRadius: 12, padding: "20px 24px", textAlign: "center" }}>
                  <div style={{ fontSize: 13, color: "#6b7280", fontFamily: "sans-serif", marginBottom: 8 }}>Estimated Value</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: "#166534", fontFamily: "sans-serif" }}>${valueMin.toLocaleString()} – ${valueMax.toLocaleString()}</div>
                </div>
              )}
              {weekMax > 0 && (
                <div style={{ background: "#eff6ff", borderRadius: 12, padding: "20px 24px", textAlign: "center" }}>
                  <div style={{ fontSize: 13, color: "#6b7280", fontFamily: "sans-serif", marginBottom: 8 }}>Delivery Time</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: "#1d4ed8", fontFamily: "sans-serif" }}>{weekMin}–{weekMax} weeks</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── CTA ── */}
        <div style={{ background: "linear-gradient(135deg, #4c1d95 0%, #6d28d9 60%, #4f46e5 100%)", borderRadius: 20, padding: "40px 32px", textAlign: "center", color: "#fff" }}>
          <h2 style={{ fontSize: "clamp(20px, 4vw, 32px)", fontWeight: 800, margin: "0 0 12px" }}>Ready to Improve Your Website?</h2>
          <p style={{ fontSize: 16, opacity: 0.85, margin: "0 0 32px", lineHeight: 1.6, fontFamily: "sans-serif" }}>
            We've identified specific improvements that could significantly grow your revenue.<br />Let's build them together.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <a href={contactHref}
              style={{ background: "#fff", color: "#6d28d9", padding: "14px 28px", borderRadius: 12, textDecoration: "none", fontWeight: 800, fontSize: 15, fontFamily: "sans-serif", boxShadow: "0 4px 16px rgba(0,0,0,0.15)" }}>
              📋 Request Proposal
            </a>
            <a href={contactHref}
              style={{ background: "rgba(255,255,255,0.15)", color: "#fff", padding: "14px 28px", borderRadius: 12, textDecoration: "none", fontWeight: 700, fontSize: 15, fontFamily: "sans-serif", border: "2px solid rgba(255,255,255,0.3)" }}>
              📅 Book Consultation
            </a>
            <a href="mailto:hello@devstudio.com"
              style={{ background: "rgba(255,255,255,0.1)", color: "#fff", padding: "14px 28px", borderRadius: 12, textDecoration: "none", fontWeight: 700, fontSize: 15, fontFamily: "sans-serif", border: "2px solid rgba(255,255,255,0.25)" }}>
              ✉ Reply by Email
            </a>
          </div>
          <p style={{ margin: "24px 0 0", fontSize: 13, opacity: 0.65, fontFamily: "sans-serif" }}>
            Prepared exclusively by <strong>DevStudio</strong> · Free of charge · No commitment required
          </p>
        </div>

      </div>
    </div>
  );
}
