'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';

export default function HeroSection() {
  const { t, lang } = useLanguage();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const slideInterval = useRef<NodeJS.Timeout | null>(null);

  const slides = [
    {
      id: 0,
      title: t('hero.slide1.title'),
      subtitle: t('hero.slide1.subtitle'),
      image: '/images/banner/hero1.png',
    },
    {
      id: 1,
      title: t('hero.slide2.title'),
      subtitle: t('hero.slide2.subtitle'),
      image: '/images/banner/hero2.png',
    },
    {
      id: 2,
      title: t('hero.slide3.title'),
      subtitle: t('hero.slide3.subtitle'),
      image: '/images/banner/hero3.png',
    },
  ];

  const nextSlide = () => setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  const prevSlide = () => setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));

  const startAutoPlay = () => {
    stopAutoPlay();
    slideInterval.current = setInterval(nextSlide, 5000);
  };

  const stopAutoPlay = () => {
    if (slideInterval.current) {
      clearInterval(slideInterval.current);
    }
  };

  useEffect(() => {
    startAutoPlay();
    return () => stopAutoPlay();
  }, [currentSlide]);

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
    stopAutoPlay();
    setStartX('touches' in e ? e.touches[0].clientX : e.clientX);
  };

  const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return;
    const currentX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const diff = startX - currentX;
    
    if (Math.abs(diff) > 50) {
      if (diff > 0) nextSlide();
      else prevSlide();
      setIsDragging(false);
    }
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    startAutoPlay();
  };

  return (
    <section 
      className="relative min-h-[90vh] lg:min-h-screen bg-primary flex items-start overflow-hidden pt-32 md:pt-40 lg:pt-48 cursor-grab active:cursor-grabbing select-none"
      onMouseDown={handleDragStart}
      onMouseMove={handleDragMove}
      onMouseUp={handleDragEnd}
      onMouseLeave={handleDragEnd}
      onTouchStart={handleDragStart}
      onTouchMove={handleDragMove}
      onTouchEnd={handleDragEnd}
    >
      {/* Decorative background elements & Scattered Motif Songket */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-white rounded-full blur-[120px] opacity-10"></div>
        <div className="absolute bottom-1/4 right-0 w-80 h-80 bg-blue-300 rounded-full blur-[100px] opacity-10"></div>

        <div 
          className="absolute inset-0 w-full h-full opacity-5 bg-no-repeat bg-center bg-cover"
          style={{ backgroundImage: 'url(/images/element/1.png)' }}
        ></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full relative z-10 flex flex-col justify-center h-full pb-16 lg:pb-20 flex-1">
        
        <div className="relative w-full overflow-hidden flex items-center min-h-[550px] lg:min-h-[500px]">
          <div 
            className="flex transition-transform duration-700 ease-in-out w-full"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {slides.map((slide) => (
              <div key={slide.id} className="w-full flex-shrink-0 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                
                {/* Text Content - Centered on mobile, Left on desktop */}
                <div className="flex flex-col items-center lg:items-start text-center lg:text-left max-w-xl mx-auto lg:mx-0 px-2 mt-4 lg:mt-0 order-2 lg:order-1 w-full overflow-hidden">
                  <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight mb-4 lg:mb-6 whitespace-pre-line drop-shadow-md">
                    {slide.title}
                  </h1>
                  <p className="text-sm sm:text-base md:text-lg text-blue-100 mb-8 lg:mb-10 leading-relaxed font-medium px-4 lg:px-0">
                    {slide.subtitle}
                  </p>
                  
                  <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4 w-full sm:w-auto px-4 sm:px-0">
                    <Link href="/edukasi/pengajuan" className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-3.5 bg-accent-yellow text-primary font-bold rounded transition-all text-center border-b-4 border-yellow-600 hover:brightness-110 active:border-b-0 active:translate-y-1">
                      {t('hero.btnRequest')}
                    </Link>
                    <Link href="/edukasi/materi-edukasi" className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-3.5 bg-transparent border-2 border-b-4 border-white/50 text-white font-bold rounded hover:bg-white/10 transition-all text-center backdrop-blur-sm hover:border-white hover:border-b-white active:border-b-2 active:translate-y-0.5">
                      {t('hero.btnExplore')}
                    </Link>
                  </div>
                </div>

                {/* Image - Placed above text on mobile */}
                <div className="relative w-full h-[250px] sm:h-[350px] lg:h-[500px] flex items-center justify-center pointer-events-none order-1 lg:order-2">
                  <Image
                    src={slide.image}
                    alt="Banner Illustration"
                    fill
                    className="object-contain"
                    priority={slide.id === 0}
                    draggable={false}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="absolute bottom-10 left-6 lg:left-10 flex items-center gap-3 z-20">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentSlide(idx);
              }}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                currentSlide === idx ? 'w-8 bg-white' : 'w-2.5 bg-white/30 hover:bg-white/50'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>

      </div>
    </section>
  );
}
