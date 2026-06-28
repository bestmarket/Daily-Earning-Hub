import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Button } from "@/components/ui/button";

// --- Mini App Mockup Graphics ---

function BookingMockup() {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];
  const slots = [
    [true, false, true, true, false],
    [false, true, true, false, true],
    [true, true, false, false, true],
  ];
  return (
    <div className="w-full h-full bg-white rounded-xl border border-orange-100 overflow-hidden flex flex-col">
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-3 py-2 flex items-center justify-between">
        <span className="text-white text-[9px] font-bold">Table Reservations</span>
        <span className="text-orange-100 text-[8px]">June 2025</span>
      </div>
      <div className="p-2 flex-1">
        <div className="grid grid-cols-5 gap-1 mb-2">
          {days.map(d => <div key={d} className="text-[7px] text-center text-[#6B7280] font-semibold">{d}</div>)}
        </div>
        {slots.map((row, ri) => (
          <div key={ri} className="grid grid-cols-5 gap-1 mb-1">
            {row.map((booked, ci) => (
              <div key={ci} className={`rounded text-[7px] text-center py-0.5 font-medium ${booked ? "bg-orange-100 text-orange-600" : "bg-green-100 text-green-700"}`}>
                {booked ? "Full" : "Free"}
              </div>
            ))}
          </div>
        ))}
        <div className="mt-2 bg-orange-50 rounded-lg p-1.5 border border-orange-100">
          <div className="text-[8px] text-[#6B7280] mb-1">Auto SMS reminders sent</div>
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
            <span className="text-[8px] text-green-700 font-medium">38% fewer no-shows</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function RealEstateMockup() {
  const leads = [
    { name: "John D.", status: "Hot", score: 92 },
    { name: "Maria S.", status: "Warm", score: 74 },
    { name: "Alex T.", status: "New", score: 55 },
  ];
  return (
    <div className="w-full h-full bg-white rounded-xl border border-blue-100 overflow-hidden flex flex-col">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-2 flex items-center justify-between">
        <span className="text-white text-[9px] font-bold">Lead CRM</span>
        <span className="bg-white/20 text-white text-[7px] px-1.5 py-0.5 rounded-full">12 active</span>
      </div>
      <div className="p-2 flex-1">
        {leads.map((lead) => (
          <div key={lead.name} className="flex items-center gap-2 mb-1.5 bg-[#F8FAFC] rounded-lg p-1.5">
            <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-[8px] font-bold text-blue-600">{lead.name[0]}</div>
            <div className="flex-1 min-w-0">
              <div className="text-[8px] font-semibold text-[#111827]">{lead.name}</div>
              <div className="h-1 bg-[#E5E7EB] rounded-full mt-0.5">
                <div className="h-full bg-blue-400 rounded-full" style={{ width: `${lead.score}%` }} />
              </div>
            </div>
            <span className={`text-[7px] font-bold px-1 py-0.5 rounded ${lead.status === "Hot" ? "bg-red-100 text-red-600" : lead.status === "Warm" ? "bg-orange-100 text-orange-600" : "bg-blue-100 text-blue-600"}`}>
              {lead.status}
            </span>
          </div>
        ))}
        <div className="mt-1 text-center text-[8px] text-green-700 font-semibold bg-green-50 rounded py-1">
          ↑ 3x more leads captured
        </div>
      </div>
    </div>
  );
}

function FitnessMockup() {
  const classes = ["Yoga 7AM", "HIIT 9AM", "Spin 6PM"];
  const members = [28, 45, 19];
  return (
    <div className="w-full h-full bg-white rounded-xl border border-green-100 overflow-hidden flex flex-col">
      <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-3 py-2">
        <span className="text-white text-[9px] font-bold">Member Dashboard</span>
      </div>
      <div className="p-2 flex-1">
        <div className="grid grid-cols-2 gap-1.5 mb-2">
          <div className="bg-green-50 rounded-lg p-1.5 border border-green-100">
            <div className="text-[7px] text-[#6B7280]">Members</div>
            <div className="text-sm font-extrabold text-green-600">342</div>
          </div>
          <div className="bg-emerald-50 rounded-lg p-1.5 border border-emerald-100">
            <div className="text-[7px] text-[#6B7280]">Revenue</div>
            <div className="text-sm font-extrabold text-emerald-600">$8.4k</div>
          </div>
        </div>
        {classes.map((cls, i) => (
          <div key={cls} className="flex items-center gap-2 mb-1.5">
            <div className="text-[8px] text-[#111827] font-medium w-14">{cls}</div>
            <div className="flex-1 h-1.5 bg-[#E5E7EB] rounded-full">
              <div className="h-full bg-green-400 rounded-full" style={{ width: `${(members[i] / 50) * 100}%` }} />
            </div>
            <span className="text-[7px] text-[#6B7280]">{members[i]}/50</span>
          </div>
        ))}
        <div className="mt-1 text-center text-[8px] text-green-700 font-semibold bg-green-50 rounded py-1">
          ↓ 60% less admin work
        </div>
      </div>
    </div>
  );
}

function DentalMockup() {
  const appointments = [
    { name: "Sarah M.", time: "9:00 AM", type: "Cleaning" },
    { name: "James O.", time: "10:30 AM", type: "Check-up" },
    { name: "Priya K.", time: "2:00 PM", type: "Whitening" },
  ];
  return (
    <div className="w-full h-full bg-white rounded-xl border border-cyan-100 overflow-hidden flex flex-col">
      <div className="bg-gradient-to-r from-cyan-500 to-sky-500 px-3 py-2 flex items-center justify-between">
        <span className="text-white text-[9px] font-bold">Appointment System</span>
        <span className="text-cyan-100 text-[8px]">Today</span>
      </div>
      <div className="p-2 flex-1">
        {appointments.map((apt) => (
          <div key={apt.name} className="flex items-center gap-2 mb-1.5 border border-cyan-100 rounded-lg p-1.5 bg-cyan-50/40">
            <div className="w-1 h-8 rounded-full bg-cyan-400 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-[8px] font-bold text-[#111827]">{apt.name}</div>
              <div className="text-[7px] text-[#6B7280]">{apt.type}</div>
            </div>
            <div className="text-[7px] text-cyan-700 font-semibold">{apt.time}</div>
          </div>
        ))}
        <div className="flex items-center gap-1 mt-1 bg-sky-50 rounded px-1.5 py-1">
          <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
          <span className="text-[8px] text-green-700 font-medium">SMS reminders active</span>
        </div>
      </div>
    </div>
  );
}

function InventoryMockup() {
  const items = [
    { name: "Blue Denim Jacket", stock: 80, alert: false },
    { name: "White Sneakers", stock: 12, alert: true },
    { name: "Canvas Bag", stock: 45, alert: false },
  ];
  return (
    <div className="w-full h-full bg-white rounded-xl border border-purple-100 overflow-hidden flex flex-col">
      <div className="bg-gradient-to-r from-purple-500 to-violet-600 px-3 py-2 flex items-center justify-between">
        <span className="text-white text-[9px] font-bold">Inventory Dashboard</span>
        <span className="bg-red-400 text-white text-[7px] px-1.5 py-0.5 rounded-full">1 alert</span>
      </div>
      <div className="p-2 flex-1">
        {items.map((item) => (
          <div key={item.name} className="mb-1.5">
            <div className="flex justify-between items-center mb-0.5">
              <span className="text-[8px] text-[#111827] font-medium truncate flex-1">{item.name}</span>
              {item.alert && <span className="text-[7px] text-red-600 font-bold ml-1">⚠ Low</span>}
            </div>
            <div className="h-1.5 bg-[#E5E7EB] rounded-full">
              <div
                className={`h-full rounded-full ${item.alert ? "bg-red-400" : "bg-purple-400"}`}
                style={{ width: `${item.stock}%` }}
              />
            </div>
            <div className="text-[7px] text-[#6B7280] mt-0.5">{item.stock} units</div>
          </div>
        ))}
        <div className="text-center text-[8px] text-purple-700 font-semibold bg-purple-50 rounded py-1 mt-1">
          ↓ 80% fewer stockouts
        </div>
      </div>
    </div>
  );
}

function ElearningMockup() {
  const courses = [
    { name: "Business Fundamentals", progress: 72, students: 48 },
    { name: "Digital Marketing", progress: 45, students: 31 },
    { name: "Sales Mastery", progress: 90, students: 62 },
  ];
  return (
    <div className="w-full h-full bg-white rounded-xl border border-indigo-100 overflow-hidden flex flex-col">
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-3 py-2 flex items-center justify-between">
        <span className="text-white text-[9px] font-bold">Course Platform</span>
        <span className="bg-white/20 text-white text-[7px] px-1.5 py-0.5 rounded-full">3 courses</span>
      </div>
      <div className="p-2 flex-1">
        {courses.map((course) => (
          <div key={course.name} className="mb-2">
            <div className="flex justify-between items-center mb-0.5">
              <span className="text-[8px] font-semibold text-[#111827] truncate flex-1">{course.name}</span>
              <span className="text-[7px] text-indigo-600 font-bold ml-1">{course.progress}%</span>
            </div>
            <div className="h-1.5 bg-[#E5E7EB] rounded-full">
              <div className="h-full bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full" style={{ width: `${course.progress}%` }} />
            </div>
            <div className="text-[7px] text-[#6B7280] mt-0.5">{course.students} students enrolled</div>
          </div>
        ))}
        <div className="text-center text-[8px] text-indigo-700 font-semibold bg-indigo-50 rounded py-1">
          🎓 3 courses launched in month 1
        </div>
      </div>
    </div>
  );
}

// --- Project data ---
const projects = [
  {
    Mockup: BookingMockup,
    type: "Restaurant Booking System",
    industry: "Hospitality",
    problem: "Customers called in constantly for reservations, staff spent hours managing phone bookings and had no-shows with no way to follow up.",
    solution: "Custom online booking platform with automated SMS reminders, deposit payments, and admin dashboard for table management.",
    outcome: "38% more bookings, 70% fewer no-shows",
    tech: ["React", "Node.js", "Stripe", "SMS API"],
    buildTime: "2 weeks",
    topColor: "bg-orange-500",
    outcomeColor: "text-orange-600",
  },
  {
    Mockup: RealEstateMockup,
    type: "Real Estate Lead Portal",
    industry: "Real Estate",
    problem: "Agents lost track of leads from multiple sources. No centralised system, leads falling through the cracks every day.",
    solution: "Lead capture portal with CRM dashboard, automatic lead scoring, follow-up reminders, and WhatsApp integration.",
    outcome: "3x more qualified leads captured",
    tech: ["React", "PostgreSQL", "WhatsApp API"],
    buildTime: "2 weeks",
    topColor: "bg-blue-500",
    outcomeColor: "text-blue-600",
  },
  {
    Mockup: FitnessMockup,
    type: "Fitness Studio Membership",
    industry: "Health & Fitness",
    problem: "Manual membership tracking, cash payments, and no way to manage class bookings or cancellations online.",
    solution: "Full membership platform with class booking, subscription billing, member portal, and attendance tracking.",
    outcome: "60% reduction in admin time",
    tech: ["React", "Stripe Subscriptions", "PostgreSQL"],
    buildTime: "3 weeks",
    topColor: "bg-green-500",
    outcomeColor: "text-green-600",
  },
  {
    Mockup: DentalMockup,
    type: "Dental Clinic Appointments",
    industry: "Healthcare",
    problem: "Receptionists overwhelmed with calls. Patients couldn't book outside of office hours.",
    solution: "Online appointment booking with dentist selection, automated reminders, and patient history portal.",
    outcome: "Available 24/7, 45% drop in calls",
    tech: ["React", "Calendar API", "Email/SMS"],
    buildTime: "2 weeks",
    topColor: "bg-cyan-500",
    outcomeColor: "text-cyan-600",
  },
  {
    Mockup: InventoryMockup,
    type: "Retail Inventory Dashboard",
    industry: "Retail",
    problem: "Owner tracked inventory in spreadsheets. Frequent stockouts and no visibility across store locations.",
    solution: "Real-time inventory dashboard with low-stock alerts, supplier reorder automation, and multi-location support.",
    outcome: "Stockouts reduced by 80%",
    tech: ["React", "Node.js", "PostgreSQL"],
    buildTime: "2 weeks",
    topColor: "bg-purple-500",
    outcomeColor: "text-purple-600",
  },
  {
    Mockup: ElearningMockup,
    type: "E-Learning Platform",
    industry: "Education",
    problem: "Coach sold courses via PDFs and video links sent by email. No structure, no tracking, no way to scale.",
    solution: "Full course platform with video lessons, quizzes, progress tracking, certificate generation, and payment integration.",
    outcome: "Launched 3 new courses in first month",
    tech: ["React", "Video API", "Stripe", "PostgreSQL"],
    buildTime: "3 weeks",
    topColor: "bg-indigo-500",
    outcomeColor: "text-indigo-600",
  },
];

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

export default function FeaturedProjects() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const openLeadMagnet = () => window.dispatchEvent(new CustomEvent("open-lead-magnet"));

  return (
    <section className="py-24 md:py-32 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          ref={ref}
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block text-sm font-bold tracking-widest text-[#7C3AED] uppercase mb-4">
            Case Studies
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold mb-6 text-[#111827]">
            Businesses We've Helped<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7C3AED] to-[#6366F1]">
              With Custom Software
            </span>
          </h2>
          <p className="text-[#6B7280] text-lg max-w-xl mx-auto">
            Real problems. Real solutions. Real outcomes — with live app previews.
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          animate={inView ? "show" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {projects.map((project) => (
            <motion.div
              key={project.type}
              variants={item}
              className="group bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden card-premium flex flex-col"
            >
              {/* Colored top bar */}
              <div className={`h-1 ${project.topColor}`} />

              {/* App Mockup Preview */}
              <div className="relative h-44 bg-gradient-to-br from-[#F8FAFC] to-[#F3F4F6] p-3 border-b border-[#E5E7EB]">
                {/* Browser frame */}
                <div className="absolute top-2 left-3 right-3 bottom-2 bg-white rounded-xl shadow-md overflow-hidden border border-[#E5E7EB] flex flex-col">
                  {/* Browser chrome */}
                  <div className="h-5 bg-[#F8FAFC] border-b border-[#E5E7EB] flex items-center px-2 gap-1 flex-shrink-0">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                    <div className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                    <div className="flex-1 mx-2 h-3 bg-white rounded border border-[#E5E7EB]" />
                  </div>
                  {/* App content */}
                  <div className="flex-1 min-h-0">
                    <project.Mockup />
                  </div>
                </div>
                {/* Industry badge */}
                <div className="absolute top-3.5 right-4 bg-white border border-[#E5E7EB] text-[#6B7280] text-[9px] font-semibold px-2 py-0.5 rounded-full shadow-sm z-10">
                  {project.industry}
                </div>
              </div>

              {/* Card content */}
              <div className="p-5 flex flex-col flex-1">
                <h3 className="font-bold text-base text-[#111827] mb-3">{project.type}</h3>

                <div className="space-y-2.5 flex-1">
                  <div>
                    <div className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wide mb-1">Problem</div>
                    <p className="text-xs text-[#6B7280] leading-relaxed">{project.problem}</p>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wide mb-1">Solution</div>
                    <p className="text-xs text-[#6B7280] leading-relaxed">{project.solution}</p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-[#F3F4F6]">
                  <div className={`text-sm font-bold ${project.outcomeColor} mb-3 flex items-center gap-1.5`}>
                    <span className="w-4 h-4 rounded-full bg-current/10 flex items-center justify-center text-[10px]">✓</span>
                    {project.outcome}
                  </div>
                  <div className="flex items-center justify-between text-xs text-[#6B7280] mb-3">
                    <span className="font-medium">Built in {project.buildTime}</span>
                    <span className="text-right text-[10px]">{project.tech.join(" · ")}</span>
                  </div>
                  <Button
                    size="sm"
                    className="w-full text-xs h-8 btn-premium text-white font-semibold"
                    onClick={openLeadMagnet}
                  >
                    Build Something Similar
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
