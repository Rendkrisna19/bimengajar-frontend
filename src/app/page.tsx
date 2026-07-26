import Navbar from "@/components/layout/Navbar";
import HeroSection from "@/components/sections/HeroSection";
import FeaturesSection from "@/components/sections/FeaturesSection";
import StatsSection from "@/components/sections/StatsSection";
import MapSection from "@/components/sections/MapSection";
import NewsSection from "@/components/sections/NewsSection";
import FloatingAction from "@/components/ui/FloatingAction";
import Footer from "@/components/layout/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 relative">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <StatsSection />
      <NewsSection />
      <MapSection />
      <FloatingAction />
      <Footer />
    </main>
  );
}
