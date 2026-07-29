'use client';

import { useEffect, useRef } from 'react';
import Navbar from "@/components/layout/Navbar";
import HeroSection from "@/components/sections/HeroSection";
import FeaturesSection from "@/components/sections/FeaturesSection";
import StatsSection from "@/components/sections/StatsSection";
import AboutPreviewSection from "@/components/sections/AboutPreviewSection";
import MapSection from "@/components/sections/MapSection";
import NewsSection from "@/components/sections/NewsSection";
import TestimonialSection from "@/components/sections/TestimonialSection";
import FloatingAction from "@/components/ui/FloatingAction";
import Footer from "@/components/layout/Footer";
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export default function Home() {
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    if (!containerRef.current) return;

    // Get all sections (excluding Navbar, FloatingAction, and Footer)
    // We select children by mapping over the DOM, or just applying a class to sections
    const sections = containerRef.current.querySelectorAll('.animate-on-scroll');

    sections.forEach((section) => {
      gsap.fromTo(
        section,
        { 
          y: 50, 
          opacity: 0 
        },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: section,
            start: "top 85%", // Mulai animasi ketika bagian atas elemen mencapai 85% viewport
            end: "bottom 15%", // Selesai ketika bagian bawah mencapai 15%
            toggleActions: "play reverse play reverse", // Animasi akan masuk & keluar saat discroll naik/turun
          }
        }
      );
    });

    return () => {
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

  return (
    <main ref={containerRef} className="min-h-screen bg-gray-50 relative" style={{ scrollBehavior: 'smooth' }}>
      <Navbar />
      
      {/* We wrap each section with a div class to target it for animation */}
      <div className="animate-on-scroll">
        <HeroSection />
      </div>
      <div className="animate-on-scroll">
        <FeaturesSection />
      </div>
      <div className="animate-on-scroll">
        <StatsSection />
      </div>
      <div className="animate-on-scroll">
        <AboutPreviewSection />
      </div>
      <div className="animate-on-scroll">
        <MapSection />
      </div>
      <div className="animate-on-scroll">
        <NewsSection />
      </div>
      <div className="animate-on-scroll">
        <TestimonialSection />
      </div>

      <FloatingAction />
      <Footer />
    </main>
  );
}
