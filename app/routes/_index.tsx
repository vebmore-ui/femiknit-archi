import { AgeGroupSection } from "@/components/AgeGroupSection";
import { FestiveFeature } from "@/components/FestiveFeature";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { HeroCarousel } from "@/components/HeroCarousel";
import { MandalaDivider } from "@/components/Motifs";
import { FAQSection } from "@/components/FAQSection";
import { WhatsAppUpdatesSection } from "@/components/WhatsAppUpdatesSection";
import { GenderProductShowcase } from "@/components/GenderProductShowcase";
import { TrustBadges } from "@/components/TrustBadges";
import { FloatingCart } from "@/components/FloatingCart";

export default function Home() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-white">
      <Header />
      <HeroCarousel />
      <MandalaDivider label="Curated for every celebration" />
      <GenderProductShowcase />
      <AgeGroupSection />
      <FestiveFeature />
      <TrustBadges />
      <WhatsAppUpdatesSection />
      <FAQSection />
      <Footer />
      <FloatingCart />
    </main>
  );
}
