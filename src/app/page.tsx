import Navbar from "@/components/layout/Navbar";
import HeroSection from "@/components/sections/HeroSection";
import FeaturesSection from "@/components/sections/FeaturesSection";
import MapSection from "@/components/sections/MapSection";
import NewsSection from "@/components/sections/NewsSection";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <MapSection />
      <NewsSection />
    </main>
  );
}
