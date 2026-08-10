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

export default function HeroSection() {
  const { t, lang } = useLanguage();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const slideInterval = useRef<NodeJS.Timeout | null>(null);
  const [dynamicSlides, setDynamicSlides] = useState<any[]>(DEFAULT_SLIDES);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchHeroBanners = async () => {
      try {
        setLoading(true);
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
        const res = await fetch(`${apiUrl}/hero-banners`);
        const data = await res.json();
        if (data.status === 'success' && data.data) {
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
          setDynamicSlides(mapped);
        }
      } catch (err) {
        console.error('Failed to fetch hero banners', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHeroBanners();
  }, [lang]);

  const slides = dynamicSlides;

  const nextSlide = () => setCurrentSlide((prev) => (prev >= slides.length - 1 ? 0 : prev + 1));
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
  }, [currentSlide, slides.length]);

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
          {slides.length > 0 ? (
            <div 
              className="flex transition-transform duration-700 ease-in-out w-full"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {slides.map((slide, index) => (
                <div key={slide.id || index} className="w-full flex-shrink-0 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                  
                  {/* Text Content - Centered on mobile, Left on desktop */}
                  <div className="flex flex-col items-center lg:items-start text-center lg:text-left max-w-xl mx-auto lg:mx-0 px-2 mt-4 lg:mt-0 order-2 lg:order-1 w-full overflow-hidden">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight mb-4 lg:mb-6 whitespace-pre-line drop-shadow-md">
                      {slide.title}
                    </h1>
                    <p className="text-sm sm:text-base md:text-lg text-blue-100 mb-8 lg:mb-10 leading-relaxed font-medium px-4 lg:px-0">
                      {slide.subtitle}
                    </p>
                    
                    <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4 w-full sm:w-auto px-4 sm:px-0">
                      {slide.button_primary_text && (
                        <Link href={slide.button_primary_url || '/edukasi/pengajuan'} className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-3.5 bg-accent-red text-white font-bold rounded transition-all text-center border-b-4 border-red-900 shadow-md shadow-accent-red/40 hover:brightness-110 active:border-b-0 active:translate-y-1">
                          {slide.button_primary_text}
                        </Link>
                      )}
                      {slide.button_secondary_text && (
                        <Link href={slide.button_secondary_url || '/edukasi/materi-edukasi'} className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-3.5 bg-transparent border-2 border-b-4 border-white/50 text-white font-bold rounded hover:bg-white/10 transition-all text-center backdrop-blur-sm hover:border-white hover:border-b-white active:border-b-2 active:translate-y-0.5">
                          {slide.button_secondary_text}
                        </Link>
                      )}
                    </div>
                  </div>

                  {/* Image - Placed above text on mobile */}
                  <div className="relative w-full h-[250px] sm:h-[350px] lg:h-[500px] flex items-center justify-center pointer-events-none order-1 lg:order-2">
                    <Image
                      src={slide.image}
                      alt="Banner Illustration"
                      fill
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      className="object-contain"
                      priority={index === 0}
                      fetchPriority={index === 0 ? "high" : "auto"}
                      draggable={false}
                    />
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
    </section>
  );
}
