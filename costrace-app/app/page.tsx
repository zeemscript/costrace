import { PricingSection } from "@/components/landing/cta-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { Footer } from "@/components/landing/footer";
import { HeroSection } from "@/components/landing/hero-section";
import { HowItWorksSection } from "@/components/landing/how-it-works-section";
import { Navbar } from "@/components/landing/navbar";
import { ProvidersSection } from "@/components/landing/providers-section";
import { SdkShowcaseSection } from "@/components/landing/sdk-showcase-section";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <Navbar />
      <main>
        <HeroSection />
        <ProvidersSection />
        <FeaturesSection />
        <HowItWorksSection />
        <SdkShowcaseSection />
        <PricingSection />
      </main>
      <Footer />
    </div>
  );
}
