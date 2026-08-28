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
            start: "top 88%",
            once: true, // Run animation once to keep scroll thread 100% lightweight & smooth
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

      {/* Menu Cepat Section with section.png Background Element (70% Opacity) */}
      <div className="relative overflow-hidden bg-sky-50/30 animate-on-scroll pt-8 pb-8">
        {/* Continuous Background Element section.png (70% Opacity) */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          <img 
            src="/images/element/section.png" 
            alt="Menu Cepat Background Section" 
            className="absolute inset-0 w-full h-full object-cover opacity-70 pointer-events-none z-0"
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
