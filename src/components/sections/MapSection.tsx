'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import dynamic from 'next/dynamic';
import Link from 'next/link';

// Dynamically import Leaflet Map to avoid SSR errors
const LeafletMap = dynamic(() => import('@/components/ui/LeafletMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[450px] bg-gray-100 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  )
});

export default function MapSection() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Intersection Observer to trigger GSAP when scrolled into view
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          gsap.fromTo('.map-text-anim', 
            { y: 40, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.8, stagger: 0.2, ease: 'power3.out' }
          );
          gsap.fromTo('.map-container-anim',
            { y: 60, opacity: 0 },
            { y: 0, opacity: 1, duration: 1, ease: 'power3.out', delay: 0.4 }
          );
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={containerRef} className="relative bg-primary py-24 md:py-32 px-4 md:px-8 overflow-hidden">
      {/* Texture Motif Background */}
      <div 
        className="absolute inset-0 w-full h-full opacity-20 mix-blend-overlay bg-no-repeat bg-center bg-cover pointer-events-none z-0"
        style={{ backgroundImage: 'url(/images/element/1.png)' }}
      ></div>

      {/* Background Ornaments (Subtle Glows) */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-[100px] pointer-events-none z-0"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-300/10 rounded-full blur-[120px] pointer-events-none z-0"></div>

      <div className="max-w-[1200px] mx-auto relative z-10">
        
        {/* Intro Text / Rupiah Content */}
        <div className="text-center mb-16 max-w-4xl mx-auto">
          <h2 className="map-text-anim text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 tracking-tight opacity-0">
            Cinta, Bangga, Paham <span className="bg-[#fbbf24] text-primary px-4 py-1 inline-block mt-2 shadow-[0_4px_15px_rgba(251,191,36,0.3)] rounded-lg">Rupiah</span>
          </h2>
          <p className="map-text-anim text-gray-300 text-lg md:text-xl leading-relaxed opacity-0 max-w-3xl mx-auto">
            Uang Rupiah bukan sekadar alat pembayaran, melainkan simbol kedaulatan negara. Bersama BI Mengajar Siantar, kita sebarkan semangat kebanksentralan ke seluruh penjuru daerah.
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: Map Container (8 columns) */}
          <div className="xl:col-span-8 map-container-anim opacity-0">
            <div className="bg-white rounded-[2rem] p-4 md:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.3)] relative">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 ml-2">
                <h3 className="text-2xl md:text-3xl font-bold text-primary">Peta Edukasi BI Mengajar</h3>
                
                {/* Year Filter for Map */}
                <select className="bg-gray-50 border border-gray-200 text-gray-700 font-bold rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-primary shadow-sm cursor-pointer">
                  <option value="2026">Tahun 2026</option>
                  <option value="2025">Tahun 2025</option>
                </select>
              </div>
              
              {/* The Map */}
              <div className="rounded-2xl overflow-hidden shadow-inner bg-gray-100 relative border border-gray-200">
                <LeafletMap />
              </div>

              {/* Legend & Action Button */}
              <div className="mt-6 flex flex-col lg:flex-row items-center justify-between gap-6 bg-gray-50 p-4 md:p-5 rounded-xl border border-gray-100">
                
                {/* Legends */}
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 md:gap-6 text-sm font-bold text-primary">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-md bg-[#2563eb] flex items-center justify-center shadow-sm">
                      <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                    </div> 
                    SD
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-md bg-[#16a34a] flex items-center justify-center shadow-sm">
                      <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                    </div> 
                    SMP
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-md bg-[#f97316] flex items-center justify-center shadow-sm">
                      <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                    </div> 
                    SMA/SMK
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-md bg-[#9333ea] flex items-center justify-center shadow-sm">
                      <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                    </div> 
                    PT
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-md bg-[#e11d48] flex items-center justify-center shadow-sm">
                      <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                    </div> 
                    Komunitas
                  </div>
                </div>

                {/* Action Button */}
                <Link 
                  href="/peta"
                  className="w-full lg:w-auto px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-blue-900 hover:shadow-lg hover:-translate-y-1 transition-all text-center shrink-0 flex items-center justify-center gap-2 text-sm"
                >
                  Lihat Peta Lengkap <i className="fa-solid fa-arrow-right"></i>
                </Link>
              </div>
            </div>
          </div>

          {/* RIGHT: Stats Grid (4 columns) */}
          <div className="xl:col-span-4 flex flex-col gap-4 map-container-anim opacity-0">
            {/* Sekolah Teredukasi - Blue */}
            <div className="bg-primary rounded-xl p-5 shadow-lg flex items-center gap-4 h-full min-h-[100px] transform hover:scale-[1.02] transition-transform duration-300 border border-white/10">
              <div className="text-white text-4xl shrink-0 w-16 text-center">
                <i className="fa-solid fa-graduation-cap"></i>
              </div>
              <div className="text-white">
                <h4 className="text-2xl font-bold leading-tight">128+</h4>
                <p className="text-sm font-medium mt-0.5 text-blue-100">Sekolah Teredukasi</p>
              </div>
            </div>
            
            {/* Peserta Edukasi - Yellow */}
            <div className="bg-[#fbbf24] rounded-xl p-5 shadow-lg flex items-center gap-4 h-full min-h-[100px] transform hover:scale-[1.02] transition-transform duration-300 border border-[#fbbf24]/50">
              <div className="text-white text-4xl shrink-0 w-16 text-center">
                <i className="fa-solid fa-users"></i>
              </div>
              <div className="text-white">
                <h4 className="text-2xl font-bold leading-tight">25.000+</h4>
                <p className="text-sm font-medium mt-0.5 text-white/90">Peserta Edukasi</p>
              </div>
            </div>

            {/* Kegiatan Terlaksana - Blue */}
            <div className="bg-primary rounded-xl p-5 shadow-lg flex items-center gap-4 h-full min-h-[100px] transform hover:scale-[1.02] transition-transform duration-300 border border-white/10">
              <div className="text-white text-4xl shrink-0 w-16 text-center">
                <i className="fa-regular fa-calendar-check"></i>
              </div>
              <div className="text-white">
                <h4 className="text-2xl font-bold leading-tight">85+</h4>
                <p className="text-sm font-medium mt-0.5 text-blue-100">Kegiatan Terlaksana</p>
              </div>
            </div>

            {/* Program Inovasi - Yellow */}
            <div className="bg-[#fbbf24] rounded-xl p-5 shadow-lg flex items-center gap-4 h-full min-h-[100px] transform hover:scale-[1.02] transition-transform duration-300 border border-[#fbbf24]/50">
              <div className="text-white text-4xl shrink-0 w-16 text-center">
                <i className="fa-regular fa-lightbulb"></i>
              </div>
              <div className="text-white">
                <h4 className="text-2xl font-bold leading-tight">10+</h4>
                <p className="text-sm font-medium mt-0.5 text-white/90">Program Inovasi</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
