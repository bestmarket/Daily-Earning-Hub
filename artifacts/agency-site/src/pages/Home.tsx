import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/sections/Hero";
import BusinessProblems from "@/components/sections/BusinessProblems";
import Solutions from "@/components/sections/Solutions";
import Pricing from "@/components/sections/Pricing";
import HowItWorks from "@/components/sections/HowItWorks";
import WhyChooseUs from "@/components/sections/WhyChooseUs";
import FeaturedProjects from "@/components/sections/FeaturedProjects";
import FAQ from "@/components/sections/FAQ";
import FinalCTA from "@/components/sections/FinalCTA";
import Footer from "@/components/layout/Footer";
import WhatsAppButton from "@/components/layout/WhatsAppButton";
import LeadMagnetModal from "@/components/sections/LeadMagnetModal";

export default function Home() {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-background relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-accent/10 blur-[120px]" />
      </div>

      <Navbar />

      <main className="flex-1 relative z-10">
        <Hero />
        <BusinessProblems />
        <Solutions />
        <Pricing />
        <HowItWorks />
        <WhyChooseUs />
        <FeaturedProjects />
        <FAQ />
        <FinalCTA />
      </main>

      <Footer />
      <WhatsAppButton />
      <LeadMagnetModal />
    </div>
  );
}
