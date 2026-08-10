'use client';

import { useEffect, useRef } from 'react';
import Navbar from "@/components/layout/Navbar";
import HeroSection from "@/components/sections/HeroSection";
import FeaturesSection from "@/components/sections/FeaturesSection";
import StatsSection from "@/components/sections/StatsSection";

import NewsSection from "@/components/sections/NewsSection";
import FloatingAction from "@/components/ui/FloatingAction";
import Footer from "@/components/layout/Footer";
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import dynamic from 'next/dynamic';

// Dynamically import heavy below-the-fold sections to eliminate 143.1 KiB initial JS payload
const MapSection = dynamic(() => import("@/components/sections/MapSection"), {
  ssr: false,
  loading: () => (
    <div className="w-full min-h-[500px] bg-primary/90 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
    </div>
  ),
});

const TestimonialSection = dynamic(() => import("@/components/sections/TestimonialSection"), {
  ssr: false,
});

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
          ease: 'power3.out',
          scrollTrigger: {
            trigger: section,
            start: "top 85%", // Mulai animasi ketika bagian atas elemen mencapai 85% viewport
            toggleActions: "play none none reverse", // Play saat masuk, reverse HANYA ketika scroll naik ke atas elemen ini lagi
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
      
      <HeroSection />
      <div className="animate-on-scroll">
        <FeaturesSection />
      </div>
      <div className="animate-on-scroll">
        <StatsSection />
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
