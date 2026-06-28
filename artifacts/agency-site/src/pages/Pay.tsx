import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Copy, CheckCircle2, ExternalLink, Bitcoin, Wallet, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL ??
  import.meta.env.BASE_URL.replace(/\/$/, "");

interface PaymentMethod {
  id: string;
  name: string;
  enabled: boolean;
  details: string;
}

interface SiteSettings {
  paymentMethods: PaymentMethod[];
  contact?: { whatsapp?: string; email?: string };
}

function isCrypto(id: string) {
  return id === "crypto_usdt" || id === "crypto_btc";
}

function cryptoUri(id: string, address: string) {
  if (id === "crypto_btc") return `bitcoin:${address}`;
  return address;
}

function cryptoLabel(id: string) {
  if (id === "crypto_btc") return "Bitcoin (BTC)";
  if (id === "crypto_usdt") return "USDT (TRC20 / ERC20)";
  return "Crypto";
}

function cryptoIcon(id: string) {
  if (id === "crypto_btc") return "₿";
  return "₮";
}

function paymentIcon(id: string) {
  const icons: Record<string, string> = {
    paypal: "🅿️",
    stripe: "💳",
    paystack: "🟢",
    flutterwave: "🦋",
    lemonsqueezy: "🍋",
    bank: "🏦",
    crypto_usdt: "₮",
    crypto_btc: "₿",
  };
  return icons[id] ?? "💰";
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const copy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      toast({ title: "Copied to clipboard!" });
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <Button variant="outline" size="sm" onClick={copy} className="gap-2 h-8 text-xs">
      {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
      {copied ? "Copied!" : "Copy"}
    </Button>
  );
}

function CryptoCard({ pm }: { pm: PaymentMethod }) {
  const address = pm.details.trim();
  const uri = cryptoUri(pm.id, address);

  return (
    <div className="rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-50 to-purple-50 overflow-hidden">
      <div className="p-5 border-b border-violet-100 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center text-xl font-bold text-violet-700">
          {cryptoIcon(pm.id)}
        </div>
        <div>
          <h3 className="font-bold text-sm">{cryptoLabel(pm.id)}</h3>
          <p className="text-xs text-muted-foreground">Scan QR or copy the wallet address</p>
        </div>
        <Badge className="ml-auto bg-violet-100 text-violet-700 border-violet-200">Crypto</Badge>
      </div>

      {address ? (
        <div className="p-5 flex flex-col sm:flex-row items-center gap-6">
          {/* QR Code */}
          <div className="flex-shrink-0 bg-white rounded-xl p-4 shadow-sm border border-violet-100">
            <QRCodeSVG
              value={uri}
              size={160}
              level="M"
              includeMargin={false}
              fgColor="#4c1d95"
            />
          </div>

          {/* Address + actions */}
          <div className="flex-1 min-w-0 space-y-3 w-full">
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-1.5">Wallet Address</p>
              <div className="bg-white/80 rounded-xl border border-violet-100 px-4 py-3 break-all font-mono text-sm text-foreground leading-relaxed">
                {address}
              </div>
            </div>
            <div className="flex gap-2">
              <CopyButton text={address} />
              <a href={uri} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm" className="gap-2 h-8 text-xs">
                  <Wallet className="w-3.5 h-3.5" /> Open Wallet
                </Button>
              </a>
            </div>
            {pm.id === "crypto_usdt" && (
              <p className="text-xs text-muted-foreground bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                ⚠️ Send only <strong>USDT</strong> to this address. Double-check the network (TRC20 or ERC20) matches your sending wallet.
              </p>
            )}
            {pm.id === "crypto_btc" && (
              <p className="text-xs text-muted-foreground bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                ⚠️ Send only <strong>Bitcoin (BTC)</strong> to this address. Sending other coins will result in permanent loss.
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="p-5 text-center text-sm text-muted-foreground">
          Wallet address not configured yet.
        </div>
      )}
    </div>
  );
}

function OnlineCard({ pm }: { pm: PaymentMethod }) {
  const hasLink = pm.details.startsWith("http");

  return (
    <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">
      <div className="p-5 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-xl">
          {paymentIcon(pm.id)}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-sm">{pm.name}</h3>
          {pm.details && !hasLink && (
            <p className="text-xs text-muted-foreground truncate mt-0.5">{pm.details}</p>
          )}
        </div>
        {hasLink ? (
          <a href={pm.details} target="_blank" rel="noopener noreferrer">
            <Button size="sm" className="gap-2 h-8 text-xs">
              Pay Now <ExternalLink className="w-3 h-3" />
            </Button>
          </a>
        ) : pm.details ? (
          <CopyButton text={pm.details} />
        ) : null}
      </div>
    </div>
  );
}

function BankCard({ pm }: { pm: PaymentMethod }) {
  return (
    <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 overflow-hidden">
      <div className="p-5 flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-xl flex-shrink-0">
          🏦
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-sm">Bank Transfer</h3>
          {pm.details ? (
            <div className="mt-2 bg-white/80 rounded-xl border border-blue-100 px-4 py-3">
              <p className="text-sm font-mono whitespace-pre-wrap break-all">{pm.details}</p>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground mt-1">Contact us for bank details.</p>
          )}
        </div>
        {pm.details && <CopyButton text={pm.details} />}
      </div>
    </div>
  );
}

export default function Pay() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [, navigate] = useLocation();

  useEffect(() => {
    fetch(`${API_BASE}/api/site-settings`)
      .then(r => r.json())
      .then(setSettings)
      .catch(() => setSettings(null))
      .finally(() => setLoading(false));
  }, []);

  const enabled = settings?.paymentMethods.filter(pm => pm.enabled) ?? [];
  const cryptoMethods = enabled.filter(pm => isCrypto(pm.id));
  const otherMethods = enabled.filter(pm => !isCrypto(pm.id));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30">
      {/* Header */}
      <div className="border-b border-border/40 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <button onClick={() => navigate("/")} className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-bold text-base">Payment Options</h1>
            <p className="text-xs text-muted-foreground">Choose your preferred payment method</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
        {loading ? (
          <div className="text-center py-16 text-muted-foreground">Loading payment options…</div>
        ) : enabled.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Wallet className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No payment methods available yet.</p>
            <p className="text-sm mt-1">Please contact us directly to arrange payment.</p>
          </div>
        ) : (
          <>
            {/* Crypto section */}
            {cryptoMethods.length > 0 && (
              <section className="space-y-4">
                <div className="flex items-center gap-2">
                  <Bitcoin className="w-4 h-4 text-violet-600" />
                  <h2 className="font-bold text-sm text-violet-700 uppercase tracking-wider">Crypto Payments</h2>
                </div>
                {cryptoMethods.map(pm => <CryptoCard key={pm.id} pm={pm} />)}
              </section>
            )}

            {/* Other methods section */}
            {otherMethods.length > 0 && (
              <section className="space-y-3">
                {cryptoMethods.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Copy className="w-4 h-4 text-muted-foreground" />
                    <h2 className="font-bold text-sm text-muted-foreground uppercase tracking-wider">Other Methods</h2>
                  </div>
                )}
                {otherMethods.map(pm =>
                  pm.id === "bank"
                    ? <BankCard key={pm.id} pm={pm} />
                    : <OnlineCard key={pm.id} pm={pm} />
                )}
              </section>
            )}

            {/* Contact footer */}
            <div className="rounded-2xl border border-border/40 bg-muted/30 p-5 text-center">
              <p className="text-sm text-muted-foreground">
                Having trouble? After payment, send your receipt to{" "}
                <a
                  href={`mailto:${settings?.contact?.email ?? "hello@devstudio.com"}`}
                  className="text-primary underline font-medium"
                >
                  {settings?.contact?.email ?? "hello@devstudio.com"}
                </a>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

