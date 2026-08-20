'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';

const translateText = (text: string | null, lang: 'ID' | 'EN'): string => {
  if (!text) return '';
  if (lang === 'ID') return text;

  const normalized = text.trim();

  // Title Translations
  if (normalized.includes('Edukasi untuk')) return 'Education for\nan Advanced Indonesia';
  if (normalized.includes('Kenali & Pahami')) return 'Know & Understand\nOur Rupiah';
  if (normalized.includes('Layanan Penukaran')) return 'Coin Exchange\nServices';

  // Subtitle Translations
  if (normalized.includes('Belajar, berkolaborasi')) {
    return 'Learn, collaborate, and contribute with Bank Indonesia for a society that Loves, is Proud of, and Understands the Rupiah.';
  }
  if (normalized.includes('Tingkatkan literasi')) {
    return 'Improve financial literacy and recognize the authenticity features of the Rupiah to maintain the nation\'s economic sovereignty.';
  }
  if (normalized.includes('Gunakan platform Pojok Koin')) {
    return 'Use the Coin Corner platform to easily exchange coins and help coin circulation in the community.';
  }

  // Button Text Translations
  if (normalized === 'Ajukan Edukasi') return 'Request Education';
  if (normalized === 'Jelajahi Materi') return 'Explore Materials';
  if (normalized === 'Cari Lokasi Penukaran') return 'Find Exchange Location';

  return text;
};

const DEFAULT_SLIDES = [
  {
    id: 1,
    title: 'Edukasi untuk\nIndonesia Maju',
    subtitle: 'Belajar, berkolaborasi, dan berkontribusi bersama Bank Indonesia untuk masyarakat yang Cinta, Bangga, dan Paham Rupiah.',
    button_primary_text: 'Ajukan Edukasi',
    button_primary_url: '/edukasi/pengajuan',
    button_secondary_text: 'Jelajahi Materi',
    button_secondary_url: '/edukasi/materi-edukasi',
    image: '/images/banner/hero1.png',
  }
];

let memoryHeroCache: any = null;

export default function HeroSection() {
  const { t, lang } = useLanguage();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const slideInterval = useRef<NodeJS.Timeout | null>(null);
  const [dynamicSlides, setDynamicSlides] = useState<any[]>(() => {
    if (memoryHeroCache) return memoryHeroCache;
    if (typeof window !== 'undefined') {
      const cached = sessionStorage.getItem('hero_banners_cache');
      if (cached) {
        try { return JSON.parse(cached); } catch (e) {}
      }
    }
    return DEFAULT_SLIDES;
  });

  useEffect(() => {
    let isMounted = true;
    const fetchHeroBanners = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
        const res = await fetch(`${apiUrl}/hero-banners?t=${Date.now()}`, { cache: 'no-store' });
        const data = await res.json();
        if (isMounted && data.status === 'success' && Array.isArray(data.data) && data.data.length > 0) {
          const mapped = data.data.map((item: any) => ({
            id: item.id,
            title: lang === 'EN' ? (item.title_en || translateText(item.title, 'EN')) : item.title,
            subtitle: lang === 'EN' ? (item.subtitle_en || translateText(item.subtitle, 'EN')) : item.subtitle,
            button_primary_text: lang === 'EN' ? (item.button_primary_text_en || translateText(item.button_primary_text, 'EN')) : item.button_primary_text,
            button_primary_url: item.button_primary_url,
            button_secondary_text: lang === 'EN' ? (item.button_secondary_text_en || translateText(item.button_secondary_text, 'EN')) : item.button_secondary_text,
            button_secondary_url: item.button_secondary_url,
            image: item.image_url || item.image || '/images/banner/hero1.png',
          }));
          memoryHeroCache = mapped;
          if (typeof window !== 'undefined') {
            sessionStorage.setItem('hero_banners_cache', JSON.stringify(mapped));
          }
          setDynamicSlides(mapped);
        }
      } catch (err) {
        console.error('Failed to fetch hero banners', err);
      }
    };
    fetchHeroBanners();
    return () => { isMounted = false; };
  }, [lang]);

  const slides = (dynamicSlides && dynamicSlides.length > 0) ? dynamicSlides : DEFAULT_SLIDES;

  const nextSlide = () => setCurrentSlide((prev) => (prev >= slides.length - 1 ? 0 : prev + 1));
  const prevSlide = () => setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));

  const startAutoPlay = () => {
    stopAutoPlay();
    if (slides.length > 1) {
      slideInterval.current = setInterval(nextSlide, 5000);
    }
  };

  const stopAutoPlay = () => {
    if (slideInterval.current) {
      clearInterval(slideInterval.current);
    }
  };

  useEffect(() => {
    startAutoPlay();
    return () => stopAutoPlay();
  }, [currentSlide, slides.length]);

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
    stopAutoPlay();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setStartX(clientX);
    setStartY(clientY);
  };

  const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return;
    const currentX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const currentY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const diffX = startX - currentX;
    const diffY = startY - currentY;
    
    // Only swipe horizontal slides if swipe movement is horizontal
    if (Math.abs(diffX) > 70 && Math.abs(diffX) > Math.abs(diffY) * 1.5) {
      if (diffX > 0) nextSlide();
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
      className="relative min-h-[80vh] lg:min-h-[85vh] bg-primary flex items-start overflow-hidden pt-28 md:pt-36 lg:pt-40 cursor-grab active:cursor-grabbing select-none"
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full relative z-10 flex flex-col justify-center h-full pb-12 lg:pb-16 flex-1">
        
        <div className="relative w-full overflow-hidden flex items-center min-h-[480px] lg:min-h-[450px]">
          {slides.length > 0 ? (
            <div 
              className="flex transition-transform duration-700 ease-in-out w-full"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {slides.map((slide, index) => (
                <div key={slide.id || index} className="w-full flex-shrink-0 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 items-center">
                  
                  {/* Text Content - Centered on mobile, Left on desktop */}
                  <div className="flex flex-col items-center lg:items-start text-center lg:text-left max-w-xl mx-auto lg:mx-0 px-2 mt-2 lg:mt-0 order-2 lg:order-1 w-full overflow-hidden">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight mb-3 lg:mb-5 whitespace-pre-line drop-shadow-md">
                      {slide.title}
                    </h1>
                    <p className="text-xs sm:text-sm md:text-base text-blue-100/90 mb-6 lg:mb-8 leading-relaxed font-medium px-2 lg:px-0 max-w-lg">
                      {slide.subtitle}
                    </p>
                    
                    <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4 w-full sm:w-auto px-4 sm:px-0">
                      {slide.button_primary_text && (
                        <Link href={slide.button_primary_url || '/edukasi/pengajuan'} className="w-full sm:w-auto px-5 sm:px-7 py-2.5 sm:py-3 bg-accent-red text-white text-xs sm:text-sm font-bold rounded transition-all text-center border-b-4 border-red-900 shadow-md shadow-accent-red/40 hover:brightness-110 active:border-b-0 active:translate-y-1">
                          {slide.button_primary_text}
                        </Link>
                      )}
                      {slide.button_secondary_text && (
                        <Link href={slide.button_secondary_url || '/edukasi/materi-edukasi'} className="w-full sm:w-auto px-5 sm:px-7 py-2.5 sm:py-3 bg-transparent border-2 border-b-4 border-white/50 text-white text-xs sm:text-sm font-bold rounded hover:bg-white/10 transition-all text-center backdrop-blur-sm hover:border-white hover:border-b-white active:border-b-2 active:translate-y-0.5">
                          {slide.button_secondary_text}
                        </Link>
                      )}
                    </div>
                  </div>

                  {/* Image - Real Image clipped directly with custom cut corner, no white background box, no text badge */}
                  <div className="relative w-full flex items-center justify-center order-1 lg:order-2 my-auto">
                    <div className="relative w-full max-w-[380px] lg:max-w-[420px] h-[240px] sm:h-[290px] lg:h-[340px] rounded-2xl rounded-tr-[4rem] rounded-br-[4rem] overflow-hidden group my-auto flex items-center justify-center">
                      <Image
                        src={slide.image}
                        alt="Banner Illustration"
                        fill
                        sizes="(max-width: 1024px) 100vw, 420px"
                        className="object-contain rounded-2xl rounded-tr-[4rem] rounded-br-[4rem] group-hover:scale-105 transition-transform duration-700"
                        priority={index === 0}
                        fetchPriority={index === 0 ? "high" : "auto"}
                        draggable={false}
                      />
                    </div>
                  </div>

                </div>
              ))}
            </div>
          ) : null}
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

      {/* Subtle Bottom-to-Top Black Gradient Overlay for enhanced contrast */}
      <div 
        className="absolute inset-x-0 bottom-0 h-44 md:h-60 bg-gradient-to-t from-black/45 via-black/15 to-transparent pointer-events-none z-0" 
        aria-hidden="true"
      />
    </section>
  );
}
