import { HeroSection } from "@/components/landing/HeroSection";
import { BenefitsSection } from "@/components/landing/BenefitsSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { WhoIsThisForSection } from "@/components/landing/WhoIsThisForSection";
import { LearnSection } from "@/components/landing/LearnSection";
import { Footer } from "@/components/landing/Footer";

export default function Home() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <BenefitsSection variant="first" />
      <FeaturesSection />
      <BenefitsSection variant="second" />
      <WhoIsThisForSection />
      <LearnSection />
      <Footer />
    </div>
  );
}
