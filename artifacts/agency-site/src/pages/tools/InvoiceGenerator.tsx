import { useState, useEffect, useRef } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import WhatsAppButton from "@/components/layout/WhatsAppButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Download, Printer, FileText, CheckCircle2, ArrowRight, ChevronDown, ChevronUp } from "lucide-react";

function useSEOMeta(title: string, desc: string) {
  useEffect(() => {
    document.title = title;
    let m = document.querySelector('meta[name="description"]');
    if (!m) { m = document.createElement("meta"); m.setAttribute("name", "description"); document.head.appendChild(m); }
    m.setAttribute("content", desc);
  }, []);
}

interface LineItem { id: number; description: string; qty: number; rate: number; }

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

export default function InvoiceGenerator() {
  useSEOMeta(
    "Free Invoice Generator — Create & Download Professional Invoices | DevStudio",
    "Create professional invoices online for free. Add your business details, line items, and taxes. Download as PDF instantly. No sign-up, no watermark, completely free invoice maker."
  );

  const [from, setFrom] = useState({ name: "", address: "", email: "", phone: "" });
  const [to, setTo] = useState({ name: "", address: "", email: "" });
  const [invoice, setInvoice] = useState({ number: `INV-${String(Date.now()).slice(-4)}`, date: new Date().toISOString().split("T")[0], due: "", currency: "USD", notes: "", terms: "Payment due within 30 days." });
  const [items, setItems] = useState<LineItem[]>([{ id: 1, description: "", qty: 1, rate: 0 }]);
  const [tax, setTax] = useState(0);
  const [discount, setDiscount] = useState(0);

  const subtotal = items.reduce((s, i) => s + i.qty * i.rate, 0);
  const discountAmt = subtotal * (discount / 100);
  const taxAmt = (subtotal - discountAmt) * (tax / 100);
  const total = subtotal - discountAmt + taxAmt;

  const addItem = () => setItems(prev => [...prev, { id: Date.now(), description: "", qty: 1, rate: 0 }]);
  const removeItem = (id: number) => setItems(prev => prev.filter(i => i.id !== id));
  const updateItem = (id: number, k: keyof LineItem, v: any) => setItems(prev => prev.map(i => i.id === id ? { ...i, [k]: v } : i));

  const cur = invoice.currency === "USD" ? "$" : invoice.currency === "EUR" ? "€" : invoice.currency === "GBP" ? "£" : invoice.currency;
  const fmt = (n: number) => `${cur}${n.toFixed(2)}`;

  const handlePrint = () => window.print();

  return (
    <div className="min-h-[100dvh] flex flex-col bg-white">
      <Navbar />
      <main className="flex-1 pt-24 pb-20">
        <div className="bg-gradient-to-b from-green-50 to-white border-b border-[#E5E7EB] py-14">
          <div className="container mx-auto px-4 md:px-6 text-center max-w-3xl">
            <div className="inline-flex items-center gap-2 text-xs font-bold tracking-widest text-green-600 uppercase bg-green-50 border border-green-200 px-3 py-1.5 rounded-full mb-5">
              <FileText className="w-3.5 h-3.5" /> Free Tool
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-[#111827] mb-4 leading-tight">
              Free Invoice Generator —<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600">Create & Download PDF Invoices</span>
            </h1>
            <p className="text-[#6B7280] text-lg max-w-2xl mx-auto">
              Create professional invoices online in minutes. Add your details, line items, tax, and discounts. Print or download as PDF — free, no sign-up, no watermark.
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 md:px-6 max-w-4xl py-10 space-y-6">

          {/* Invoice Builder */}
          <div className="bg-white border border-[#E5E7EB] rounded-2xl shadow-sm overflow-hidden print:shadow-none print:border-none" id="invoice-preview">

            {/* Header */}
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 text-white flex flex-col sm:flex-row justify-between gap-4">
              <div>
                <div className="text-2xl font-extrabold mb-1">INVOICE</div>
                <div className="text-green-100 text-sm">
                  <Input className="bg-transparent border-green-400/50 text-white placeholder:text-green-200 h-7 text-sm w-36 inline-block" placeholder="INV-0001" value={invoice.number} onChange={e => setInvoice(p => ({ ...p, number: e.target.value }))} />
                </div>
              </div>
              <div className="text-right space-y-1">
                <div className="text-xs text-green-200">DATE</div>
                <Input type="date" value={invoice.date} onChange={e => setInvoice(p => ({ ...p, date: e.target.value }))} className="bg-transparent border-green-400/50 text-white h-7 text-sm w-40" />
                <div className="text-xs text-green-200 mt-2">DUE DATE</div>
                <Input type="date" value={invoice.due} onChange={e => setInvoice(p => ({ ...p, due: e.target.value }))} className="bg-transparent border-green-400/50 text-white h-7 text-sm w-40" placeholder="Optional" />
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* From / To */}
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <div className="text-xs font-extrabold text-[#9CA3AF] uppercase tracking-widest mb-3">From (Your Business)</div>
                  <div className="space-y-2">
                    <Input placeholder="Your Name / Business Name" value={from.name} onChange={e => setFrom(p => ({ ...p, name: e.target.value }))} />
                    <Textarea placeholder="Address" value={from.address} onChange={e => setFrom(p => ({ ...p, address: e.target.value }))} rows={2} />
                    <Input placeholder="Email" type="email" value={from.email} onChange={e => setFrom(p => ({ ...p, email: e.target.value }))} />
                    <Input placeholder="Phone" value={from.phone} onChange={e => setFrom(p => ({ ...p, phone: e.target.value }))} />
                  </div>
                </div>
                <div>
                  <div className="text-xs font-extrabold text-[#9CA3AF] uppercase tracking-widest mb-3">Bill To (Client)</div>
                  <div className="space-y-2">
                    <Input placeholder="Client Name / Company" value={to.name} onChange={e => setTo(p => ({ ...p, name: e.target.value }))} />
                    <Textarea placeholder="Client Address" value={to.address} onChange={e => setTo(p => ({ ...p, address: e.target.value }))} rows={2} />
                    <Input placeholder="Client Email" type="email" value={to.email} onChange={e => setTo(p => ({ ...p, email: e.target.value }))} />
                  </div>
                </div>
              </div>

              {/* Line Items */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="text-xs font-extrabold text-[#9CA3AF] uppercase tracking-widest">Line Items</div>
                  <div className="flex items-center gap-2">
                    <select value={invoice.currency} onChange={e => setInvoice(p => ({ ...p, currency: e.target.value }))} className="text-xs border border-[#E5E7EB] rounded-lg px-2 py-1">
                      <option>USD</option><option>EUR</option><option>GBP</option><option>NGN</option><option>CAD</option><option>AUD</option>
                    </select>
                  </div>
                </div>
                <div className="border border-[#E5E7EB] rounded-xl overflow-hidden">
                  <div className="grid grid-cols-12 gap-2 px-4 py-2 bg-[#F8FAFC] text-xs font-bold text-[#6B7280] uppercase">
                    <div className="col-span-6">Description</div>
                    <div className="col-span-2 text-center">Qty</div>
                    <div className="col-span-2 text-center">Rate</div>
                    <div className="col-span-1 text-right">Amount</div>
                    <div className="col-span-1" />
                  </div>
                  {items.map(item => (
                    <div key={item.id} className="grid grid-cols-12 gap-2 px-4 py-2 border-t border-[#F3F4F6] items-center">
                      <div className="col-span-6">
                        <Input className="h-8 text-sm" placeholder="Service or product description" value={item.description} onChange={e => updateItem(item.id, "description", e.target.value)} />
                      </div>
                      <div className="col-span-2">
                        <Input className="h-8 text-sm text-center" type="number" min={0} value={item.qty} onChange={e => updateItem(item.id, "qty", Number(e.target.value))} />
                      </div>
                      <div className="col-span-2">
                        <Input className="h-8 text-sm text-center" type="number" min={0} step={0.01} value={item.rate} onChange={e => updateItem(item.id, "rate", Number(e.target.value))} />
                      </div>
                      <div className="col-span-1 text-right text-sm font-semibold">{fmt(item.qty * item.rate)}</div>
                      <div className="col-span-1 flex justify-center">
                        {items.length > 1 && <button onClick={() => removeItem(item.id)} className="text-[#9CA3AF] hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>}
                      </div>
                    </div>
                  ))}
                  <div className="px-4 py-2 border-t border-[#F3F4F6]">
                    <Button variant="ghost" size="sm" onClick={addItem} className="text-green-600 hover:text-green-700 gap-1.5 text-xs">
                      <Plus className="w-3.5 h-3.5" /> Add Line Item
                    </Button>
                  </div>
                </div>
              </div>

              {/* Totals */}
              <div className="flex justify-end">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between text-sm"><span className="text-[#6B7280]">Subtotal</span><span className="font-semibold">{fmt(subtotal)}</span></div>
                  <div className="flex items-center justify-between text-sm gap-2">
                    <span className="text-[#6B7280]">Discount (%)</span>
                    <Input type="number" min={0} max={100} value={discount} onChange={e => setDiscount(Number(e.target.value))} className="h-7 w-16 text-sm text-center" />
                    <span className="font-semibold text-red-600">-{fmt(discountAmt)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm gap-2">
                    <span className="text-[#6B7280]">Tax (%)</span>
                    <Input type="number" min={0} max={100} value={tax} onChange={e => setTax(Number(e.target.value))} className="h-7 w-16 text-sm text-center" />
                    <span className="font-semibold">+{fmt(taxAmt)}</span>
                  </div>
                  <div className="border-t border-[#E5E7EB] pt-2 flex justify-between text-base font-extrabold">
                    <span>Total Due</span><span className="text-green-700">{fmt(total)}</span>
                  </div>
                </div>
              </div>

              {/* Notes & Terms */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-[#9CA3AF] uppercase tracking-widest mb-2 block">Notes</label>
                  <Textarea placeholder="Thank you for your business!" value={invoice.notes} onChange={e => setInvoice(p => ({ ...p, notes: e.target.value }))} rows={3} className="text-sm" />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#9CA3AF] uppercase tracking-widest mb-2 block">Payment Terms</label>
                  <Textarea value={invoice.terms} onChange={e => setInvoice(p => ({ ...p, terms: e.target.value }))} rows={3} className="text-sm" />
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 print:hidden">
            <Button onClick={handlePrint} className="gap-2 flex-1 h-11 font-bold bg-green-600 hover:bg-green-700 text-white">
              <Printer className="w-4 h-4" /> Print / Save as PDF
            </Button>
            <Button variant="outline" onClick={handlePrint} className="gap-2 h-11">
              <Download className="w-4 h-4" /> Download PDF
            </Button>
          </div>
          <p className="text-xs text-center text-[#9CA3AF] print:hidden">To save as PDF: Click Print → Choose "Save as PDF" as the printer destination.</p>

          <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-8 text-center text-white print:hidden">
            <h3 className="text-2xl font-extrabold mb-2">Need a Custom Invoicing System?</h3>
            <p className="text-green-100 mb-6">We build custom invoicing dashboards, payment portals, and client billing systems for businesses like yours.</p>
            <Button size="lg" className="bg-white text-green-700 hover:bg-green-50 font-bold shadow-xl" onClick={() => window.dispatchEvent(new CustomEvent("open-lead-magnet"))}>
              Build My Custom Billing System <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>

          <div className="print:hidden">
            <h2 className="text-2xl font-extrabold text-center text-[#111827] mb-6">Invoice Generator FAQ</h2>
            <div className="space-y-3">
              {[
                { q: "Is this invoice generator completely free?", a: "Yes — 100% free, no sign-up, no watermark, no limits on how many invoices you create." },
                { q: "How do I save my invoice as a PDF?", a: "Click 'Print / Save as PDF', then in the print dialog, change the destination/printer to 'Save as PDF'. This works in Chrome, Firefox, Edge, and Safari." },
                { q: "Can I add my company logo?", a: "Currently the tool doesn't support image uploads. For branded invoices with your logo, contact us — we build custom invoicing systems with full branding." },
                { q: "What currencies are supported?", a: "USD, EUR, GBP, NGN, CAD, and AUD. Select your currency from the dropdown in the line items section." },
                { q: "Are my invoice details saved?", a: "Invoice details are stored only in your browser session and are not saved to any server. For a system that saves client history and sends invoices automatically, contact us about a custom solution." },
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
