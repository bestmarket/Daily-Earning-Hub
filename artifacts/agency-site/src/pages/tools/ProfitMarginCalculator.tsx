import { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import WhatsAppButton from "@/components/layout/WhatsAppButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, TrendingUp, DollarSign, BarChart3, ChevronDown, ChevronUp, RefreshCw } from "lucide-react";

function useSEOMeta(title: string, desc: string) {
  useEffect(() => {
    document.title = title;
    let m = document.querySelector('meta[name="description"]');
    if (!m) { m = document.createElement("meta"); m.setAttribute("name", "description"); document.head.appendChild(m); }
    m.setAttribute("content", desc);
  }, []);
}

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-[#E5E7EB] rounded-xl overflow-hidden">
      <button className="w-full flex items-center justify-between p-4 text-left font-semibold text-[#111827]" onClick={() => setOpen(!open)}>
        {q}{open ? <ChevronUp className="w-4 h-4 flex-shrink-0 text-[#6B7280]" /> : <ChevronDown className="w-4 h-4 flex-shrink-0 text-[#6B7280]" />}
      </button>
      {open && <div className="px-4 pb-4 text-sm text-[#6B7280] leading-relaxed">{a}</div>}
    </div>
  );
}

function Calc({ title, color, bg, children }: { title: string; color: string; bg: string; children: React.ReactNode }) {
  return (
    <div className={`${bg} border rounded-2xl overflow-hidden`} style={{ borderColor: color + "40" }}>
      <div className="px-5 py-4 font-bold text-sm" style={{ color }}>{title}</div>
      <div className="p-5 space-y-4 bg-white">{children}</div>
    </div>
  );
}

function Row({ label, value, big, color }: { label: string; value: string; big?: boolean; color?: string }) {
  return (
    <div className="flex justify-between items-center py-1.5 border-b border-[#F3F4F6] last:border-0">
      <span className="text-sm text-[#6B7280]">{label}</span>
      <span className={`font-extrabold ${big ? "text-xl" : "text-base"}`} style={{ color: color || "#111827" }}>{value}</span>
    </div>
  );
}

function NumberInput({ label, value, onChange, prefix = "$", suffix = "" }: { label: string; value: number; onChange: (v: number) => void; prefix?: string; suffix?: string }) {
  return (
    <div>
      <label className="text-xs font-semibold text-[#6B7280] mb-1.5 block">{label}</label>
      <div className="relative">
        {prefix && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#9CA3AF] font-medium">{prefix}</span>}
        <Input
          type="number" min={0} step={0.01} value={value}
          onChange={e => onChange(Number(e.target.value))}
          className={`h-10 text-sm ${prefix ? "pl-7" : ""} ${suffix ? "pr-10" : ""}`}
        />
        {suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[#9CA3AF] font-medium">{suffix}</span>}
      </div>
    </div>
  );
}

export default function ProfitMarginCalculator() {
  useSEOMeta(
    "Free Profit Margin Calculator — Gross & Net Profit Calculator | DevStudio",
    "Calculate gross profit margin, net profit margin, markup percentage, and break-even point instantly. Free online profit margin calculator for businesses. No sign-up required."
  );

  // Calculator 1: Gross/Net Margin
  const [revenue, setRevenue] = useState(10000);
  const [cogs, setCogs] = useState(4000);
  const [expenses, setExpenses] = useState(2000);

  const grossProfit = revenue - cogs;
  const grossMargin = revenue > 0 ? (grossProfit / revenue) * 100 : 0;
  const netProfit = grossProfit - expenses;
  const netMargin = revenue > 0 ? (netProfit / revenue) * 100 : 0;

  // Calculator 2: Markup to Margin
  const [cost, setCost] = useState(50);
  const [markup, setMarkup] = useState(50);
  const sellPrice = cost * (1 + markup / 100);
  const marginFromMarkup = sellPrice > 0 ? ((sellPrice - cost) / sellPrice) * 100 : 0;

  // Calculator 3: Selling Price
  const [itemCost, setItemCost] = useState(30);
  const [desiredMargin, setDesiredMargin] = useState(40);
  const suggestedPrice = desiredMargin < 100 ? itemCost / (1 - desiredMargin / 100) : 0;
  const suggestedMarkup = itemCost > 0 ? ((suggestedPrice - itemCost) / itemCost) * 100 : 0;

  // Calculator 4: Break-even
  const [fixedCosts, setFixedCosts] = useState(5000);
  const [salePrice, setSalePrice] = useState(100);
  const [varCost, setVarCost] = useState(40);
  const contribution = salePrice - varCost;
  const breakEvenUnits = contribution > 0 ? Math.ceil(fixedCosts / contribution) : 0;
  const breakEvenRevenue = breakEvenUnits * salePrice;

  const marginColor = (m: number) => m >= 20 ? "#16A34A" : m >= 10 ? "#D97706" : "#DC2626";

  return (
    <div className="min-h-[100dvh] flex flex-col bg-white">
      <Navbar />
      <main className="flex-1 pt-24 pb-20">
        <div className="bg-gradient-to-b from-teal-50 to-white border-b border-[#E5E7EB] py-14">
          <div className="container mx-auto px-4 md:px-6 text-center max-w-3xl">
            <div className="inline-flex items-center gap-2 text-xs font-bold tracking-widest text-teal-600 uppercase bg-teal-50 border border-teal-200 px-3 py-1.5 rounded-full mb-5">
              <TrendingUp className="w-3.5 h-3.5" /> Free Business Tool
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-[#111827] mb-4 leading-tight">
              Free Profit Margin Calculator<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-600">Gross, Net, Markup & Break-Even</span>
            </h1>
            <p className="text-[#6B7280] text-lg max-w-2xl mx-auto">
              4 free business profit calculators in one. Calculate gross & net margin, convert markup to margin, find the right selling price, and calculate your break-even point.
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 md:px-6 max-w-5xl py-10 space-y-8">

          {/* 1. Gross & Net Margin */}
          <div className="bg-white border border-[#E5E7EB] rounded-2xl shadow-sm overflow-hidden">
            <div className="p-5 bg-gradient-to-r from-teal-600 to-emerald-600 text-white">
              <h2 className="text-xl font-extrabold">1. Gross & Net Profit Margin Calculator</h2>
              <p className="text-teal-100 text-sm mt-1">See exactly how much profit you keep from each dollar of revenue</p>
            </div>
            <div className="p-6 grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <NumberInput label="Total Revenue (Sales)" value={revenue} onChange={setRevenue} />
                <NumberInput label="Cost of Goods Sold (COGS)" value={cogs} onChange={setCogs} />
                <NumberInput label="Operating Expenses (Rent, Salaries, etc.)" value={expenses} onChange={setExpenses} />
              </div>
              <div className="space-y-3">
                <div className="bg-[#F8FAFC] rounded-xl p-4 space-y-3">
                  <Row label="Total Revenue" value={`$${revenue.toLocaleString()}`} />
                  <Row label="Cost of Goods Sold" value={`-$${cogs.toLocaleString()}`} color="#DC2626" />
                  <Row label="Gross Profit" value={`$${grossProfit.toLocaleString()}`} big color={marginColor(grossMargin)} />
                  <Row label="Gross Margin" value={`${grossMargin.toFixed(1)}%`} big color={marginColor(grossMargin)} />
                </div>
                <div className="bg-[#F8FAFC] rounded-xl p-4 space-y-3">
                  <Row label="Operating Expenses" value={`-$${expenses.toLocaleString()}`} color="#DC2626" />
                  <Row label="Net Profit" value={`$${netProfit.toLocaleString()}`} big color={marginColor(netMargin)} />
                  <Row label="Net Margin" value={`${netMargin.toFixed(1)}%`} big color={marginColor(netMargin)} />
                </div>
                <div className={`rounded-xl p-3 text-sm text-center font-semibold ${netMargin >= 20 ? "bg-green-50 text-green-800" : netMargin >= 10 ? "bg-yellow-50 text-yellow-800" : "bg-red-50 text-red-700"}`}>
                  {netMargin >= 20 ? "✓ Healthy profit margin" : netMargin >= 10 ? "⚠ Below average — room to improve" : netMargin >= 0 ? "⚠ Low margin — review your costs" : "✗ Operating at a loss"}
                </div>
              </div>
            </div>
          </div>

          {/* 2. Markup to Margin */}
          <div className="bg-white border border-[#E5E7EB] rounded-2xl shadow-sm overflow-hidden">
            <div className="p-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
              <h2 className="text-xl font-extrabold">2. Markup to Margin Converter</h2>
              <p className="text-blue-100 text-sm mt-1">Convert between markup percentage and profit margin</p>
            </div>
            <div className="p-6 grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <NumberInput label="Cost Price" value={cost} onChange={setCost} />
                <NumberInput label="Markup Percentage" value={markup} onChange={setMarkup} prefix="" suffix="%" />
              </div>
              <div className="bg-[#F8FAFC] rounded-xl p-5 space-y-3">
                <Row label="Cost Price" value={`$${cost.toFixed(2)}`} />
                <Row label="Markup" value={`${markup}%`} />
                <Row label="Selling Price" value={`$${sellPrice.toFixed(2)}`} big color="#2563EB" />
                <Row label="Profit Amount" value={`$${(sellPrice - cost).toFixed(2)}`} color="#16A34A" />
                <Row label="Profit Margin" value={`${marginFromMarkup.toFixed(1)}%`} big color={marginColor(marginFromMarkup)} />
              </div>
            </div>
          </div>

          {/* 3. Selling Price */}
          <div className="bg-white border border-[#E5E7EB] rounded-2xl shadow-sm overflow-hidden">
            <div className="p-5 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
              <h2 className="text-xl font-extrabold">3. Selling Price Calculator</h2>
              <p className="text-purple-100 text-sm mt-1">Find the right price to hit your target profit margin</p>
            </div>
            <div className="p-6 grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <NumberInput label="Cost of Product/Service" value={itemCost} onChange={setItemCost} />
                <NumberInput label="Target Profit Margin" value={desiredMargin} onChange={setDesiredMargin} prefix="" suffix="%" />
              </div>
              <div className="bg-[#F8FAFC] rounded-xl p-5 space-y-3">
                <Row label="Your Cost" value={`$${itemCost.toFixed(2)}`} />
                <Row label="Target Margin" value={`${desiredMargin}%`} />
                <Row label="Suggested Selling Price" value={`$${suggestedPrice.toFixed(2)}`} big color="#7C3AED" />
                <Row label="Profit Per Sale" value={`$${(suggestedPrice - itemCost).toFixed(2)}`} color="#16A34A" />
                <Row label="Equivalent Markup" value={`${suggestedMarkup.toFixed(1)}%`} color="#2563EB" />
              </div>
            </div>
          </div>

          {/* 4. Break-Even */}
          <div className="bg-white border border-[#E5E7EB] rounded-2xl shadow-sm overflow-hidden">
            <div className="p-5 bg-gradient-to-r from-amber-500 to-orange-500 text-white">
              <h2 className="text-xl font-extrabold">4. Break-Even Point Calculator</h2>
              <p className="text-amber-100 text-sm mt-1">How many units do you need to sell to cover all your costs?</p>
            </div>
            <div className="p-6 grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <NumberInput label="Fixed Costs Per Month (Rent, Salaries, etc.)" value={fixedCosts} onChange={setFixedCosts} />
                <NumberInput label="Selling Price Per Unit" value={salePrice} onChange={setSalePrice} />
                <NumberInput label="Variable Cost Per Unit (Materials, Packaging, etc.)" value={varCost} onChange={setVarCost} />
              </div>
              <div className="space-y-3">
                <div className="bg-[#F8FAFC] rounded-xl p-5 space-y-3">
                  <Row label="Contribution Per Unit" value={`$${contribution.toFixed(2)}`} color={contribution > 0 ? "#16A34A" : "#DC2626"} />
                  <Row label="Break-Even Units" value={breakEvenUnits > 0 ? `${breakEvenUnits.toLocaleString()} units` : "N/A"} big color="#D97706" />
                  <Row label="Break-Even Revenue" value={breakEvenRevenue > 0 ? `$${breakEvenRevenue.toLocaleString()}` : "N/A"} big color="#D97706" />
                </div>
                {breakEvenUnits > 0 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-800">
                    You need to sell <strong>{breakEvenUnits} units</strong> per month to cover all costs. Every unit sold above that is pure profit.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="bg-gradient-to-r from-teal-600 to-emerald-600 rounded-2xl p-8 text-center text-white">
            <h3 className="text-2xl font-extrabold mb-2">Want to Automate Your Business Financials?</h3>
            <p className="text-teal-100 mb-6">We build custom dashboards with real-time profit tracking, invoicing, expense management, and financial reports.</p>
            <Button size="lg" className="bg-white text-teal-700 hover:bg-teal-50 font-bold shadow-xl" onClick={() => window.dispatchEvent(new CustomEvent("open-lead-magnet"))}>
              Build My Business Dashboard <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>

          {/* Reference table */}
          <div className="bg-white border border-[#E5E7EB] rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 bg-[#F8FAFC] border-b border-[#E5E7EB]">
              <h3 className="font-bold text-[#111827]">Profit Margin Benchmarks by Industry</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="bg-[#F8FAFC] text-xs text-[#6B7280] font-bold uppercase">{["Industry","Gross Margin","Net Margin","Rating"].map(h => <th key={h} className="px-4 py-3 text-left">{h}</th>)}</tr></thead>
                <tbody className="divide-y divide-[#F3F4F6]">
                  {[
                    ["Software / SaaS", "70–85%", "20–40%", "🟢 Excellent"],
                    ["Consulting", "60–80%", "15–30%", "🟢 Excellent"],
                    ["E-commerce (retail)", "30–50%", "2–10%", "🟡 Low net"],
                    ["Restaurant", "60–70%", "3–9%", "🟡 Low net"],
                    ["Manufacturing", "20–40%", "5–15%", "🟡 Medium"],
                    ["Construction", "15–25%", "2–8%", "🔴 Low"],
                    ["Grocery / Supermarket", "25–35%", "1–3%", "🔴 Very low"],
                  ].map(row => <tr key={row[0]} className="hover:bg-[#F8FAFC]">{row.map((cell, i) => <td key={i} className="px-4 py-3 text-[#374151]">{cell}</td>)}</tr>)}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-extrabold text-center text-[#111827] mb-6">Profit Margin Calculator FAQ</h2>
            <div className="space-y-3">
              {[
                { q: "What is a good profit margin?", a: "It depends on your industry. For retail, 2-10% net margin is typical. For services and software, 20-40%+ is common. As a rule of thumb: below 5% is thin, 10-20% is solid, and above 30% is excellent." },
                { q: "What's the difference between gross and net profit margin?", a: "Gross margin = (Revenue – Cost of Goods Sold) / Revenue. It measures production efficiency. Net margin includes ALL expenses (rent, salaries, marketing, taxes) and shows your actual bottom-line profit." },
                { q: "What's the difference between markup and margin?", a: "Markup is calculated on cost: (Selling Price – Cost) / Cost. Margin is calculated on revenue: (Selling Price – Cost) / Selling Price. A 50% markup gives you a 33% margin — they're different numbers." },
                { q: "How do I increase my profit margin?", a: "You can increase margin by: (1) raising prices, (2) reducing COGS through better suppliers or processes, (3) reducing operating expenses, (4) focusing on higher-margin products/services, or (5) automating tasks to reduce labor costs." },
                { q: "How does this help with pricing?", a: "Use Calculator 3 (Selling Price Calculator) — enter your cost and your target margin, and it tells you exactly what to charge. This ensures you never underprice your products or services." },
              ].map(faq => <FAQItem key={faq.q} q={faq.q} a={faq.a} />)}
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}
