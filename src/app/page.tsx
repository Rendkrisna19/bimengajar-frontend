'use client';

import { useEffect, useRef } from 'react';
import Navbar from "@/components/layout/Navbar";
import HeroSection from "@/components/sections/HeroSection";
import FeaturesSection from "@/components/sections/FeaturesSection";

import NewsSection from "@/components/sections/NewsSection";
import FloatingAction from "@/components/ui/FloatingAction";
import Footer from "@/components/layout/Footer";
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import dynamic from 'next/dynamic';

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

      {/* Combined Section for Menu Cepat & Statistik with Single Continuous 2.png Element Overlay */}
      <div className="relative overflow-hidden bg-gray-50 animate-on-scroll pt-8 pb-4">
        {/* Continuous Background Element 2.png spanning across Menu Cepat & Statistik */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          <img 
            src="/images/element/2.png" 
            alt="Menu Cepat & Statistik Background Element" 
            className="absolute inset-0 w-full h-full object-cover opacity-75 pointer-events-none z-0"
          />
        </div>

        <FeaturesSection />
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
