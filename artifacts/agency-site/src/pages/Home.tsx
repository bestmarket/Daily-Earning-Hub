import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/sections/Hero";
import Stats from "@/components/sections/Stats";
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
import SocialProof from "@/components/layout/SocialProof";
import LeadMagnetModal from "@/components/sections/LeadMagnetModal";

export default function Home() {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-white">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <Stats />
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
      <SocialProof />
      <LeadMagnetModal />
    </div>
  );
}
