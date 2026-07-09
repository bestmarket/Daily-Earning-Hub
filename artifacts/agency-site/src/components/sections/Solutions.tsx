import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Calendar, ShoppingCart, Users, Bot, Calculator, MapPin, Crown, CreditCard, Target, BarChart2, Package, BookOpen, LayoutDashboard, DollarSign, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

// ─── Mini Mockup Components ───────────────────────────────────────────────────

function BookingMockup() {
  return (
    <div className="w-full h-full bg-white flex flex-col">
      <div className="bg-blue-600 px-2 py-1.5 flex items-center justify-between">
        <span className="text-white text-[8px] font-bold">Book Appointment</span>
        <span className="text-blue-200 text-[7px]">June 2025</span>
      </div>
      <div className="p-2 flex-1">
        <div className="grid grid-cols-7 gap-0.5 mb-1.5">
          {["M","T","W","T","F","S","S"].map((d,i)=><div key={i} className="text-[6px] text-center text-[#9CA3AF] font-bold">{d}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-0.5 mb-2">
          {[...Array(7)].map((_,i)=>(
            <div key={i} className={`text-[7px] text-center py-0.5 rounded ${i===2?"bg-blue-500 text-white font-bold":i===4||i===6?"bg-[#F3F4F6] text-[#9CA3AF]":"text-[#374151] hover:bg-blue-50"}`}>{i+9}</div>
          ))}
        </div>
        <div className="space-y-1">
          {["09:00 AM","10:30 AM","02:00 PM"].map((t,i)=>(
            <div key={t} className={`flex items-center justify-between px-1.5 py-1 rounded text-[7px] border ${i===0?"bg-blue-50 border-blue-200 text-blue-700 font-semibold":"border-[#E5E7EB] text-[#6B7280]"}`}>
              <span>{t}</span>
              <span className={i===0?"text-blue-600 font-bold":"text-green-600"}>{i===0?"Booked":"Free"}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function RestaurantMockup() {
  const items = [
    { name: "Jollof Rice", price: "$12", img: "🍛" },
    { name: "Suya Platter", price: "$18", img: "🍖" },
    { name: "Zobo Drink", price: "$4", img: "🥤" },
  ];
  return (
    <div className="w-full h-full bg-white flex flex-col">
      <div className="bg-orange-500 px-2 py-1.5 flex items-center gap-1.5">
        <span className="text-lg">🍽️</span>
        <span className="text-white text-[8px] font-bold">Online Menu</span>
      </div>
      <div className="p-1.5 flex-1 space-y-1">
        {items.map(item=>(
          <div key={item.name} className="flex items-center gap-1.5 border border-[#F3F4F6] rounded-lg p-1">
            <span className="text-base">{item.img}</span>
            <div className="flex-1 min-w-0">
              <div className="text-[8px] font-semibold text-[#111827] truncate">{item.name}</div>
              <div className="text-[7px] text-orange-600 font-bold">{item.price}</div>
            </div>
            <button className="w-4 h-4 bg-orange-500 text-white rounded-full text-[10px] flex items-center justify-center font-bold leading-none">+</button>
          </div>
        ))}
        <div className="bg-orange-50 border border-orange-200 rounded px-1.5 py-1 flex items-center justify-between">
          <span className="text-[7px] text-orange-700 font-semibold">Cart (2)</span>
          <span className="text-[7px] font-bold text-orange-700">$30.00</span>
        </div>
      </div>
    </div>
  );
}

function CustomerPortalMockup() {
  const orders = [
    { id: "#1042", status: "Delivered", color: "bg-green-100 text-green-700" },
    { id: "#1041", status: "In Transit", color: "bg-blue-100 text-blue-700" },
    { id: "#1039", status: "Processing", color: "bg-yellow-100 text-yellow-700" },
  ];
  return (
    <div className="w-full h-full bg-white flex flex-col">
      <div className="bg-purple-600 px-2 py-1.5 flex items-center gap-1">
        <div className="w-4 h-4 rounded-full bg-purple-300 flex items-center justify-center text-[8px] font-bold text-purple-900">J</div>
        <span className="text-white text-[8px] font-bold">My Orders</span>
      </div>
      <div className="p-2 flex-1 space-y-1.5">
        {orders.map(o=>(
          <div key={o.id} className="flex items-center justify-between border border-[#F3F4F6] rounded-lg px-2 py-1.5">
            <div>
              <div className="text-[8px] font-bold text-[#111827]">{o.id}</div>
              <div className="text-[7px] text-[#6B7280]">View details →</div>
            </div>
            <span className={`text-[7px] font-bold px-1.5 py-0.5 rounded-full ${o.color}`}>{o.status}</span>
          </div>
        ))}
        <div className="flex gap-1">
          <button className="flex-1 text-[7px] bg-purple-600 text-white py-1 rounded-lg font-semibold">Track Order</button>
          <button className="flex-1 text-[7px] border border-[#E5E7EB] text-[#6B7280] py-1 rounded-lg">Support</button>
        </div>
      </div>
    </div>
  );
}

function AIMockup() {
  const messages = [
    { from: "user", text: "I need a quote for catering 50 people" },
    { from: "bot", text: "Great! For 50 guests our buffet package starts at $850. Want to book a date?" },
    { from: "user", text: "Yes, Saturday the 14th" },
  ];
  return (
    <div className="w-full h-full bg-white flex flex-col">
      <div className="bg-cyan-600 px-2 py-1.5 flex items-center gap-1.5">
        <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse" />
        <span className="text-white text-[8px] font-bold">AI Assistant • Online</span>
      </div>
      <div className="p-1.5 flex-1 space-y-1 overflow-hidden">
        {messages.map((m,i)=>(
          <div key={i} className={`flex ${m.from==="user"?"justify-end":"justify-start"}`}>
            <div className={`max-w-[75%] px-1.5 py-1 rounded-lg text-[7px] leading-tight ${m.from==="user"?"bg-cyan-500 text-white":"bg-[#F3F4F6] text-[#374151]"}`}>
              {m.text}
            </div>
          </div>
        ))}
        <div className="flex items-center gap-1 border border-[#E5E7EB] rounded px-1.5 py-1 mt-1">
          <span className="text-[7px] text-[#9CA3AF] flex-1">Type a message…</span>
          <div className="w-3 h-3 bg-cyan-500 rounded-full flex items-center justify-center">
            <span className="text-white text-[8px] leading-none">↑</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function QuoteMockup() {
  return (
    <div className="w-full h-full bg-white flex flex-col">
      <div className="bg-green-600 px-2 py-1.5">
        <span className="text-white text-[8px] font-bold">Instant Quote Calculator</span>
      </div>
      <div className="p-2 flex-1">
        <div className="space-y-2">
          <div>
            <div className="text-[7px] text-[#6B7280] mb-0.5">Service Type</div>
            <div className="border border-[#E5E7EB] rounded text-[7px] text-[#374151] px-1.5 py-1 flex justify-between">
              <span>Deep Cleaning</span><span className="text-[#9CA3AF]">▾</span>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-[7px] text-[#6B7280] mb-0.5">
              <span>Rooms</span><span className="text-green-700 font-bold">3</span>
            </div>
            <div className="h-1.5 bg-[#E5E7EB] rounded-full">
              <div className="h-full w-[60%] bg-green-500 rounded-full" />
            </div>
          </div>
          <div>
            <div className="text-[7px] text-[#6B7280] mb-0.5">Add-ons</div>
            {["Window cleaning","Carpet steam"].map(a=>(
              <div key={a} className="flex items-center gap-1 mb-0.5">
                <div className="w-2.5 h-2.5 bg-green-100 border border-green-300 rounded flex items-center justify-center">
                  <span className="text-green-600 text-[7px]">✓</span>
                </div>
                <span className="text-[7px] text-[#374151]">{a}</span>
              </div>
            ))}
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-1.5 text-center">
            <div className="text-[7px] text-[#6B7280]">Your Estimate</div>
            <div className="text-sm font-extrabold text-green-700">$240</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DirectoryMockup() {
  const listings = [
    { name: "Apex Plumbers", rating: "4.9", cat: "Plumbing" },
    { name: "CleanCo Cleaners", rating: "4.7", cat: "Cleaning" },
    { name: "ProFix Electric", rating: "4.8", cat: "Electrical" },
  ];
  return (
    <div className="w-full h-full bg-white flex flex-col">
      <div className="bg-pink-600 px-2 py-1.5">
        <span className="text-white text-[8px] font-bold">Business Directory</span>
      </div>
      <div className="p-2 flex-1">
        <div className="border border-[#E5E7EB] rounded px-1.5 py-1 flex items-center gap-1 mb-2">
          <span className="text-[#9CA3AF] text-[8px]">🔍</span>
          <span className="text-[7px] text-[#9CA3AF]">Search services…</span>
        </div>
        <div className="space-y-1.5">
          {listings.map(l=>(
            <div key={l.name} className="flex items-center gap-1.5 border border-[#F3F4F6] rounded-lg p-1.5">
              <div className="w-5 h-5 bg-pink-100 rounded-lg flex items-center justify-center text-[9px]">🏢</div>
              <div className="flex-1 min-w-0">
                <div className="text-[8px] font-semibold text-[#111827] truncate">{l.name}</div>
                <div className="text-[7px] text-[#9CA3AF]">{l.cat}</div>
              </div>
              <div className="text-[7px] text-yellow-500 font-bold">★{l.rating}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MembershipMockup() {
  return (
    <div className="w-full h-full bg-white flex flex-col">
      <div className="bg-gradient-to-r from-yellow-500 to-amber-500 px-2 py-1.5 flex items-center justify-between">
        <span className="text-white text-[8px] font-bold">Member Hub</span>
        <span className="bg-white/30 text-white text-[7px] px-1.5 py-0.5 rounded-full font-bold">GOLD</span>
      </div>
      <div className="p-2 flex-1">
        <div className="bg-gradient-to-br from-yellow-50 to-amber-50 border border-yellow-200 rounded-xl p-2 mb-2 text-center">
          <div className="text-[7px] text-[#6B7280] mb-0.5">Your Plan</div>
          <div className="text-sm font-extrabold text-yellow-600">Gold — $29/mo</div>
          <div className="text-[7px] text-[#6B7280]">Renews Jul 15</div>
        </div>
        <div className="space-y-1">
          {["✓ Unlimited Classes","✓ Priority Booking","✓ Guest Passes (×2)","✓ Members-only Content"].map(p=>(
            <div key={p} className="text-[7px] text-[#374151] flex items-center gap-1">
              <span className="text-yellow-500">{p.slice(0,1)}</span>
              <span>{p.slice(2)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SubscriptionMockup() {
  return (
    <div className="w-full h-full bg-white flex flex-col">
      <div className="bg-violet-600 px-2 py-1.5">
        <span className="text-white text-[8px] font-bold">Choose Your Plan</span>
      </div>
      <div className="p-1.5 flex-1 space-y-1.5">
        {[
          { name: "Starter", price: "$9", color: "border-[#E5E7EB]", badge: "" },
          { name: "Pro", price: "$29", color: "border-violet-400 ring-1 ring-violet-400", badge: "Popular" },
          { name: "Business", price: "$79", color: "border-[#E5E7EB]", badge: "" },
        ].map(plan=>(
          <div key={plan.name} className={`relative flex items-center justify-between border rounded-xl px-2 py-1.5 ${plan.color}`}>
            {plan.badge && <span className="absolute -top-1.5 right-2 bg-violet-500 text-white text-[6px] font-bold px-1 py-0.5 rounded-full">{plan.badge}</span>}
            <div>
              <div className="text-[8px] font-bold text-[#111827]">{plan.name}</div>
              <div className="text-[7px] text-[#6B7280]">per month</div>
            </div>
            <div className="text-sm font-extrabold text-violet-600">{plan.price}</div>
          </div>
        ))}
        <button className="w-full bg-violet-600 text-white text-[7px] font-bold py-1.5 rounded-lg">Get Started →</button>
      </div>
    </div>
  );
}

function LeadGenMockup() {
  return (
    <div className="w-full h-full bg-white flex flex-col">
      <div className="bg-red-600 px-2 py-1.5">
        <span className="text-white text-[8px] font-bold">Lead Capture Form</span>
      </div>
      <div className="p-2 flex-1">
        <div className="space-y-1.5">
          {["Full Name","Business Email","Phone Number"].map(f=>(
            <div key={f}>
              <div className="text-[7px] text-[#6B7280] mb-0.5">{f}</div>
              <div className="border border-[#E5E7EB] rounded px-1.5 py-1 text-[7px] text-[#9CA3AF]">Enter {f.toLowerCase()}…</div>
            </div>
          ))}
          <div>
            <div className="text-[7px] text-[#6B7280] mb-0.5">Budget Range</div>
            <div className="h-1.5 bg-[#E5E7EB] rounded-full">
              <div className="h-full w-[55%] bg-red-400 rounded-full" />
            </div>
            <div className="flex justify-between text-[6px] text-[#9CA3AF] mt-0.5"><span>$0</span><span>$10k+</span></div>
          </div>
          <button className="w-full bg-red-600 text-white text-[7px] font-bold py-1.5 rounded-lg mt-1">
            Get My Free Estimate →
          </button>
        </div>
      </div>
    </div>
  );
}

function CRMMockup() {
  const stages = [
    { name: "New", count: 5, color: "bg-blue-500" },
    { name: "Qualified", count: 3, color: "bg-yellow-500" },
    { name: "Won", count: 2, color: "bg-green-500" },
  ];
  return (
    <div className="w-full h-full bg-white flex flex-col">
      <div className="bg-blue-700 px-2 py-1.5 flex items-center justify-between">
        <span className="text-white text-[8px] font-bold">CRM Pipeline</span>
        <span className="text-blue-200 text-[7px]">10 deals</span>
      </div>
      <div className="p-1.5 flex-1">
        <div className="grid grid-cols-3 gap-1 h-full">
          {stages.map(s=>(
            <div key={s.name} className="flex flex-col gap-1">
              <div className="flex items-center gap-0.5 mb-0.5">
                <div className={`w-1.5 h-1.5 rounded-full ${s.color}`} />
                <span className="text-[6px] font-bold text-[#6B7280]">{s.name}</span>
                <span className={`ml-auto text-[6px] font-bold text-white px-0.5 rounded ${s.color}`}>{s.count}</span>
              </div>
              {[...Array(Math.min(s.count,3))].map((_,i)=>(
                <div key={i} className="bg-[#F8FAFC] border border-[#E5E7EB] rounded p-1">
                  <div className="text-[6px] font-semibold text-[#374151]">Lead #{i+1}</div>
                  <div className="text-[6px] text-[#9CA3AF]">${(i+1)*500}</div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function InventoryMockup() {
  const items = [
    { name: "Blue Sneakers", qty: 42, status: "OK" },
    { name: "Red Cap", qty: 8, status: "Low" },
    { name: "White Tee", qty: 0, status: "Out" },
  ];
  return (
    <div className="w-full h-full bg-white flex flex-col">
      <div className="bg-emerald-600 px-2 py-1.5 flex items-center justify-between">
        <span className="text-white text-[8px] font-bold">Inventory</span>
        <span className="bg-red-400 text-white text-[6px] px-1 py-0.5 rounded-full font-bold">2 alerts</span>
      </div>
      <div className="p-1.5 flex-1">
        <div className="grid grid-cols-3 gap-1 mb-1.5 text-[6px] font-bold text-[#9CA3AF] uppercase">
          <span>Item</span><span className="text-center">Qty</span><span className="text-right">Status</span>
        </div>
        {items.map(item=>(
          <div key={item.name} className="grid grid-cols-3 gap-1 mb-1 items-center border-b border-[#F3F4F6] pb-1">
            <span className="text-[7px] text-[#374151] font-medium truncate">{item.name}</span>
            <span className="text-[7px] text-center font-bold text-[#111827]">{item.qty}</span>
            <span className={`text-[6px] text-right font-bold ${item.status==="OK"?"text-green-600":item.status==="Low"?"text-yellow-600":"text-red-600"}`}>{item.status}</span>
          </div>
        ))}
        <div className="bg-emerald-50 border border-emerald-100 rounded px-1.5 py-1 text-center mt-1">
          <span className="text-[7px] text-emerald-700 font-semibold">↓ 80% fewer stockouts</span>
        </div>
      </div>
    </div>
  );
}

function CourseMockup() {
  const lessons = [
    { title: "Intro to Business", done: true },
    { title: "Market Research", done: true },
    { title: "Sales Funnels", done: false },
    { title: "Scaling Up", done: false },
  ];
  return (
    <div className="w-full h-full bg-white flex flex-col">
      <div className="bg-indigo-600 px-2 py-1.5 flex items-center justify-between">
        <span className="text-white text-[8px] font-bold">Course Player</span>
        <span className="text-indigo-200 text-[7px]">50% done</span>
      </div>
      <div className="p-1.5 flex-1">
        <div className="h-1.5 bg-[#E5E7EB] rounded-full mb-2">
          <div className="h-full w-1/2 bg-indigo-500 rounded-full" />
        </div>
        <div className="space-y-1">
          {lessons.map((l,i)=>(
            <div key={l.title} className={`flex items-center gap-1.5 px-1.5 py-1 rounded-lg ${i===2?"bg-indigo-50 border border-indigo-200":""}`}>
              <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center flex-shrink-0 ${l.done?"bg-indigo-500 border-indigo-500":"border-[#E5E7EB]"}`}>
                {l.done && <span className="text-white text-[7px]">✓</span>}
              </div>
              <span className={`text-[7px] ${i===2?"font-bold text-indigo-700":l.done?"text-[#9CA3AF] line-through":"text-[#374151]"}`}>{l.title}</span>
            </div>
          ))}
        </div>
        <div className="mt-1.5 bg-indigo-600 text-white text-[7px] font-bold py-1 rounded-lg text-center">▶ Continue Lesson</div>
      </div>
    </div>
  );
}

function AdminDashMockup() {
  return (
    <div className="w-full h-full bg-white flex flex-col">
      <div className="bg-slate-700 px-2 py-1.5 flex items-center gap-1.5">
        <div className="grid grid-cols-2 gap-0.5 w-3 h-3">
          {[...Array(4)].map((_,i)=><div key={i} className="bg-white/60 rounded-sm" />)}
        </div>
        <span className="text-white text-[8px] font-bold">Admin Dashboard</span>
      </div>
      <div className="p-1.5 flex-1">
        <div className="grid grid-cols-2 gap-1 mb-1.5">
          {[
            { label: "Revenue", val: "$24k", color: "text-green-600" },
            { label: "Users", val: "1,482", color: "text-blue-600" },
            { label: "Orders", val: "342", color: "text-purple-600" },
            { label: "Tickets", val: "12", color: "text-red-600" },
          ].map(m=>(
            <div key={m.label} className="bg-[#F8FAFC] border border-[#E5E7EB] rounded-lg p-1.5">
              <div className="text-[6px] text-[#9CA3AF]">{m.label}</div>
              <div className={`text-xs font-extrabold ${m.color}`}>{m.val}</div>
            </div>
          ))}
        </div>
        <div className="bg-[#F8FAFC] border border-[#E5E7EB] rounded-lg p-1.5">
          <div className="text-[6px] text-[#9CA3AF] mb-1">Revenue This Week</div>
          <div className="flex items-end gap-0.5 h-6">
            {[40,60,50,80,70,90,85].map((h,i)=>(
              <div key={i} className={`flex-1 rounded-sm ${i===5?"bg-slate-600":"bg-slate-200"}`} style={{height:`${h}%`}} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function PaymentMockup() {
  return (
    <div className="w-full h-full bg-white flex flex-col">
      <div className="bg-green-700 px-2 py-1.5 flex items-center justify-between">
        <span className="text-white text-[8px] font-bold">Invoice #1042</span>
        <span className="bg-green-400 text-white text-[6px] px-1.5 py-0.5 rounded-full font-bold">PAID</span>
      </div>
      <div className="p-2 flex-1">
        <div className="space-y-1 mb-2">
          {[
            { item: "Web Design", price: "$400" },
            { item: "SEO Setup", price: "$150" },
            { item: "Hosting (1yr)", price: "$120" },
          ].map(i=>(
            <div key={i.item} className="flex justify-between text-[7px]">
              <span className="text-[#374151]">{i.item}</span>
              <span className="font-bold text-[#111827]">{i.price}</span>
            </div>
          ))}
        </div>
        <div className="border-t border-[#E5E7EB] pt-1.5 flex justify-between mb-2">
          <span className="text-[8px] font-bold text-[#374151]">Total</span>
          <span className="text-sm font-extrabold text-green-700">$670</span>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-1.5 flex items-center gap-1.5">
          <span className="text-green-500 text-sm">💳</span>
          <div>
            <div className="text-[7px] font-bold text-green-700">Payment Received</div>
            <div className="text-[6px] text-[#6B7280]">via Stripe • Jun 15</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AppointmentMockup() {
  const staff = [
    { name: "Dr. Amy", slots: [true, false, true] },
    { name: "Dr. Ben", slots: [false, true, false] },
  ];
  const times = ["9AM", "11AM", "2PM"];
  return (
    <div className="w-full h-full bg-white flex flex-col">
      <div className="bg-amber-600 px-2 py-1.5">
        <span className="text-white text-[8px] font-bold">Staff Scheduler</span>
      </div>
      <div className="p-2 flex-1">
        <div className="grid grid-cols-4 gap-1 mb-1">
          <div className="text-[6px] text-[#9CA3AF]" />
          {times.map(t=><div key={t} className="text-[6px] text-center text-[#9CA3AF] font-bold">{t}</div>)}
        </div>
        {staff.map(s=>(
          <div key={s.name} className="grid grid-cols-4 gap-1 mb-1 items-center">
            <div className="text-[7px] font-semibold text-[#374151] truncate">{s.name}</div>
            {s.slots.map((booked,i)=>(
              <div key={i} className={`h-5 rounded text-center flex items-center justify-center text-[6px] font-bold ${booked?"bg-amber-100 text-amber-700 border border-amber-300":"bg-green-100 text-green-700 border border-green-200"}`}>
                {booked?"Busy":"Open"}
              </div>
            ))}
          </div>
        ))}
        <button className="w-full bg-amber-600 text-white text-[7px] font-bold py-1.5 rounded-lg mt-1">Book Appointment →</button>
      </div>
    </div>
  );
}

// ─── Solution data ────────────────────────────────────────────────────────────

const solutions = [
  { Mockup: BookingMockup, icon: Calendar, name: "Booking Systems", benefit: "Let customers book 24/7. Reduce no-shows with auto reminders.", time: "1–2 weeks", price: "$299", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100", topBar: "bg-blue-600" },
  { Mockup: RestaurantMockup, icon: ShoppingCart, name: "Restaurant Ordering", benefit: "Online menu, ordering, and table management in one place.", time: "2 weeks", price: "$399", color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-100", topBar: "bg-orange-500" },
  { Mockup: CustomerPortalMockup, icon: Users, name: "Customer Portals", benefit: "Give customers a self-service hub to track orders, invoices & support.", time: "1–2 weeks", price: "$499", color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-100", topBar: "bg-purple-600" },
  { Mockup: AIMockup, icon: Bot, name: "AI Assistants", benefit: "AI chatbot that handles enquiries, bookings, and support 24/7.", time: "1–2 weeks", price: "$699", color: "text-cyan-600", bg: "bg-cyan-50", border: "border-cyan-100", topBar: "bg-cyan-600" },
  { Mockup: QuoteMockup, icon: Calculator, name: "Quote Calculators", benefit: "Let customers get instant quotes — more leads, less back-and-forth.", time: "1 week", price: "$199", color: "text-green-600", bg: "bg-green-50", border: "border-green-100", topBar: "bg-green-600" },
  { Mockup: DirectoryMockup, icon: MapPin, name: "Business Directories", benefit: "A searchable directory for your industry or local area.", time: "1–2 weeks", price: "$299", color: "text-pink-600", bg: "bg-pink-50", border: "border-pink-100", topBar: "bg-pink-600" },
  { Mockup: MembershipMockup, icon: Crown, name: "Membership Platforms", benefit: "Sell memberships with gated content, perks, and renewals.", time: "2 weeks", price: "$799", color: "text-yellow-600", bg: "bg-yellow-50", border: "border-yellow-100", topBar: "bg-yellow-500" },
  { Mockup: SubscriptionMockup, icon: CreditCard, name: "Subscription Websites", benefit: "Recurring billing, plan management, and subscriber dashboards.", time: "1–2 weeks", price: "$599", color: "text-violet-600", bg: "bg-violet-50", border: "border-violet-100", topBar: "bg-violet-600" },
  { Mockup: LeadGenMockup, icon: Target, name: "Lead Generation Systems", benefit: "Capture, qualify, and follow up with leads automatically.", time: "1–2 weeks", price: "$299", color: "text-red-600", bg: "bg-red-50", border: "border-red-100", topBar: "bg-red-600" },
  { Mockup: CRMMockup, icon: BarChart2, name: "CRM Dashboards", benefit: "Track customers, deals, and follow-ups in one clear dashboard.", time: "1–2 weeks", price: "$499", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100", topBar: "bg-blue-700" },
  { Mockup: InventoryMockup, icon: Package, name: "Inventory Systems", benefit: "Real-time stock tracking, low-stock alerts, and order management.", time: "2 weeks", price: "$399", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100", topBar: "bg-emerald-600" },
  { Mockup: CourseMockup, icon: BookOpen, name: "Course Platforms", benefit: "Sell online courses with video, quizzes, and certificates.", time: "2 weeks", price: "$699", color: "text-indigo-600", bg: "bg-indigo-50", border: "border-indigo-100", topBar: "bg-indigo-600" },
  { Mockup: AdminDashMockup, icon: LayoutDashboard, name: "Admin Dashboards", benefit: "A central command center to run and monitor your entire business.", time: "1–2 weeks", price: "$349", color: "text-slate-600", bg: "bg-slate-50", border: "border-slate-100", topBar: "bg-slate-700" },
  { Mockup: PaymentMockup, icon: DollarSign, name: "Payment Systems", benefit: "Accept payments online with invoicing, receipts, and reports.", time: "1–2 weeks", price: "$299", color: "text-green-600", bg: "bg-green-50", border: "border-green-100", topBar: "bg-green-700" },
  { Mockup: AppointmentMockup, icon: Clock, name: "Appointment Systems", benefit: "Staff scheduling, client appointments, and calendar syncing.", time: "1 week", price: "$249", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100", topBar: "bg-amber-600" },
];

const container = { hidden: {}, show: { transition: { staggerChildren: 0.04 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } };

export default function Solutions() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const openLeadMagnet = () => window.dispatchEvent(new CustomEvent("open-lead-magnet"));

  return (
    <section id="solutions" className="py-24 md:py-32 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          ref={ref}
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block text-sm font-bold tracking-widest text-[#7C3AED] uppercase mb-4">
            What We Build
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold mb-6 leading-tight text-[#111827]">
            Solutions Built<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7C3AED] to-[#6366F1]">
              For Businesses Like Yours
            </span>
          </h2>
          <p className="text-[#6B7280] text-lg max-w-2xl mx-auto">
            Every solution is custom-built for your business. No templates. No generic code. Your business, your software.
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          animate={inView ? "show" : "hidden"}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4"
        >
          {solutions.map((solution) => (
            <motion.div
              key={solution.name}
              variants={item}
              className={`group bg-white rounded-2xl border ${solution.border} overflow-hidden card-premium flex flex-col`}
            >
              {/* Coloured top strip */}
              <div className={`h-0.5 ${solution.topBar}`} />

              {/* Mini app mockup preview */}
              <div className="h-36 bg-[#F8FAFC] border-b border-[#E5E7EB] overflow-hidden relative">
                {/* Tiny browser chrome */}
                <div className="absolute inset-0 flex flex-col">
                  <div className="h-4 bg-white border-b border-[#E5E7EB] flex items-center px-1.5 gap-0.5 flex-shrink-0">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                    <div className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                    <div className="flex-1 mx-1 h-2 bg-[#F3F4F6] rounded border border-[#E5E7EB]" />
                  </div>
                  <div className="flex-1 min-h-0">
                    <solution.Mockup />
                  </div>
                </div>
              </div>

              {/* Card text */}
              <div className="p-4 flex flex-col flex-1">
                <div className={`w-8 h-8 rounded-lg ${solution.bg} flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform duration-200`}>
                  <solution.icon className={`w-4 h-4 ${solution.color}`} />
                </div>
                <h3 className="font-bold text-sm mb-1 text-[#111827]">{solution.name}</h3>
                <p className="text-xs text-[#6B7280] leading-relaxed flex-1 mb-3">{solution.benefit}</p>
                <div className="flex items-center justify-between text-xs mb-3">
                  <span className="text-[#9CA3AF]">{solution.time}</span>
                  <span className="font-bold text-[#7C3AED]">{solution.price}</span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full text-xs h-8 border-[#E5E7EB] text-[#6B7280] hover:border-[#7C3AED] hover:bg-[#7C3AED] hover:text-white transition-all duration-200"
                  onClick={openLeadMagnet}
                >
                  Get This Built
                </Button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
