import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Calendar, Home, Dumbbell, Stethoscope, BarChart2, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

const projects = [
  {
    icon: Calendar,
    type: "Restaurant Booking System",
    industry: "Hospitality",
    problem: "Customers called in constantly for reservations, staff spent hours managing phone bookings and had no-shows with no way to follow up.",
    solution: "Custom online booking platform with automated SMS reminders, deposit payments, and admin dashboard for table management.",
    outcome: "38% more bookings, 70% fewer no-shows",
    tech: ["React", "Node.js", "Stripe", "SMS API"],
    buildTime: "2 weeks",
    color: "text-orange-400",
    bg: "bg-orange-400/10",
    border: "border-orange-400/20",
  },
  {
    icon: Home,
    type: "Real Estate Lead Portal",
    industry: "Real Estate",
    problem: "Agents lost track of leads from multiple sources. No centralised system, leads falling through the cracks every day.",
    solution: "Lead capture portal with CRM dashboard, automatic lead scoring, follow-up reminders, and WhatsApp integration.",
    outcome: "3x more qualified leads captured",
    tech: ["React", "PostgreSQL", "WhatsApp API"],
    buildTime: "2 weeks",
    color: "text-blue-400",
    bg: "bg-blue-400/10",
    border: "border-blue-400/20",
  },
  {
    icon: Dumbbell,
    type: "Fitness Studio Membership Platform",
    industry: "Health & Fitness",
    problem: "Manual membership tracking, cash payments, and no way to manage class bookings or cancellations online.",
    solution: "Full membership platform with class booking, subscription billing, member portal, and attendance tracking.",
    outcome: "60% reduction in admin time",
    tech: ["React", "Stripe Subscriptions", "PostgreSQL"],
    buildTime: "3 weeks",
    color: "text-green-400",
    bg: "bg-green-400/10",
    border: "border-green-400/20",
  },
  {
    icon: Stethoscope,
    type: "Dental Clinic Appointment System",
    industry: "Healthcare",
    problem: "Receptionists overwhelmed with appointment calls. Patients couldn't book outside of office hours.",
    solution: "Online appointment booking with dentist selection, service type, automated reminders, and patient history portal.",
    outcome: "Available 24/7, 45% drop in reception calls",
    tech: ["React", "Calendar API", "Email/SMS"],
    buildTime: "2 weeks",
    color: "text-cyan-400",
    bg: "bg-cyan-400/10",
    border: "border-cyan-400/20",
  },
  {
    icon: BarChart2,
    type: "Retail Inventory Dashboard",
    industry: "Retail",
    problem: "Owner tracked inventory in spreadsheets. Frequent stockouts, over-ordering, and no visibility across store locations.",
    solution: "Real-time inventory dashboard with low-stock alerts, supplier reorder automation, and multi-location support.",
    outcome: "Stockouts reduced by 80%",
    tech: ["React", "Node.js", "PostgreSQL"],
    buildTime: "2 weeks",
    color: "text-purple-400",
    bg: "bg-purple-400/10",
    border: "border-purple-400/20",
  },
  {
    icon: BookOpen,
    type: "E-Learning Platform",
    industry: "Education",
    problem: "Coach sold courses via PDFs and video links sent by email. No structure, no tracking, no way to scale.",
    solution: "Full course platform with video lessons, quizzes, progress tracking, certificate generation, and payment integration.",
    outcome: "Launched 3 new courses in first month",
    tech: ["React", "Video API", "Stripe", "PostgreSQL"],
    buildTime: "3 weeks",
    color: "text-indigo-400",
    bg: "bg-indigo-400/10",
    border: "border-indigo-400/20",
  },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};
const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function FeaturedProjects() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  const openLeadMagnet = () => {
    window.dispatchEvent(new CustomEvent("open-lead-magnet"));
  };

  return (
    <section className="py-24 md:py-32 relative">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          ref={ref}
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block text-sm font-semibold tracking-widest text-primary uppercase mb-4">
            Case Studies
          </span>
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Businesses We've Helped<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
              With Custom Software
            </span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Real problems. Real solutions. Real outcomes.
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
              className={`group rounded-2xl border ${project.border} bg-card/40 backdrop-blur-sm p-6 hover:bg-card/70 hover:-translate-y-1 transition-all duration-300 flex flex-col`}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-xl ${project.bg} flex items-center justify-center`}>
                  <project.icon className={`w-5 h-5 ${project.color}`} />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">{project.industry}</div>
                  <h3 className="font-semibold text-sm leading-tight">{project.type}</h3>
                </div>
              </div>

              <div className="space-y-3 flex-1">
                <div>
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Problem</div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{project.problem}</p>
                </div>
                <div>
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Solution</div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{project.solution}</p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-border/40">
                <div className={`text-sm font-bold ${project.color} mb-3`}>✓ {project.outcome}</div>
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                  <span>Built in {project.buildTime}</span>
                  <span>{project.tech.join(" · ")}</span>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="w-full text-xs h-8 border border-border/50 hover:border-primary/50 hover:bg-primary/10 transition-all"
                  onClick={openLeadMagnet}
                  data-testid={`button-project-${project.type.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  Build Something Similar
                </Button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
