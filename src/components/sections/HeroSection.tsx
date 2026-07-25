'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import Image from 'next/image';

export default function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const [imgError, setImgError] = useState(false);
  
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      
      // Animate background overlay
      tl.to(overlayRef.current, { opacity: 0.65, duration: 1.5 })
      // Entrance animations for Left Column
      .fromTo('.hero-badge', 
        { x: -30, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.8 },
        '-=1'
      )
      .fromTo('.hero-title',
        { x: -40, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.8 },
        '-=0.6'
      )
      .fromTo('.hero-subtitle',
        { x: -30, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.8 },
        '-=0.6'
      )
      .fromTo('.hero-actions',
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8 },
        '-=0.6'
      )
      // Entrance animation for Right Column (Coin)
      .fromTo('.floating-coin-container',
        { scale: 0.5, opacity: 0, rotation: -15 },
        { scale: 1, opacity: 1, rotation: 0, duration: 1, ease: 'back.out(1.5)' },
        '-=1'
      );

      // Continuous Floating Animation for the Coin using GSAP
      gsap.to('.floating-coin', {
        y: -25,
        rotation: 5,
        duration: 2.5,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: 1 // Start after entrance animation
      });

    }, containerRef);
    
    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="relative min-h-screen flex items-center justify-center overflow-hidden pt-28 pb-20 bg-gray-900">
      
      {/* Background Image */}
      <div className="absolute inset-0 z-0 w-full h-full">
        <Image 
          src="/images/banner/hero2.png" 
          alt="Banner BI Mengajar"
          fill
          priority
          className="object-cover object-center opacity-40"
        />
      </div>

      {/* Dark Overlay (Semi-transparent) */}
      <div 
        ref={overlayRef}
        className="absolute inset-0 bg-gradient-to-r from-primary/95 to-primary/70 z-10"
      ></div>

      <div className="max-w-7xl mx-auto px-6 w-full relative z-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        
        {/* LEFT COLUMN: Text Content */}
        <div className="flex flex-col items-start text-left pt-10 lg:pt-0">
          
          <h1 className="hero-title text-5xl md:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.1] mb-6 drop-shadow-lg uppercase">
            BI Mengajar <br/>
            <span className="bg-blue-600 text-white px-3 py-1 inline-block mt-2">Siantar</span>
          </h1>
          
          <p className="hero-subtitle text-lg md:text-xl text-gray-100 mb-10 max-w-lg leading-relaxed drop-shadow-md font-medium">
            Platform edukasi kebanksentralan terpadu. Akses materi, ajukan kunjungan, dan manfaatkan layanan titik temu penukaran uang logam dengan mudah.
          </p>
          
          <div className="hero-actions flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <button className="w-full sm:w-auto px-10 py-4 bg-gradient-to-r from-primary to-blue-400 text-white font-bold rounded-full hover:to-blue-300 transition-all shadow-[0_10px_20px_rgba(0,51,102,0.3)] hover:shadow-[0_15px_25px_rgba(0,51,102,0.4)] hover:-translate-y-1 flex items-center justify-center gap-3 text-lg">
              Mulai Belajar <i className="fa-solid fa-chevron-right text-sm font-bold"></i>
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: Floating Image */}
        <div className="floating-coin-container hidden lg:flex items-center justify-center relative w-full h-[600px]">
          {/* Efek Cahaya di belakang gambar (Putih) */}
          <div className="absolute w-[400px] h-[400px] bg-white/20 rounded-full blur-[100px] -z-10"></div>
          
          <div className="floating-coin relative w-full max-w-[550px] aspect-square">
            {!imgError ? (
              <Image 
                src="/images/coin.png" 
                alt="Uang Logam 3D"
                fill
                className="object-contain drop-shadow-2xl"
                priority
                onError={() => setImgError(true)}
              />
            ) : (
              // Fallback UI jika gambar coin.png belum ada
              <div className="w-full h-full flex flex-col items-center justify-center bg-white/10 backdrop-blur-md rounded-full border border-white/20 shadow-2xl">
                <i className="fa-solid fa-coins text-8xl text-accent-warning mb-4 drop-shadow-lg"></i>
                <span className="text-white text-sm opacity-80">(Silakan upload /images/coin.png)</span>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Scroll Down Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
        <span className="text-white/70 text-xs font-semibold tracking-widest uppercase">Scroll</span>
        <i className="fa-solid fa-arrow-down text-white/70"></i>
      </div>
    </section>
  );
}
