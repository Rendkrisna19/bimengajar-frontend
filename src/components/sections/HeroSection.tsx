'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { getImageUrl } from '@/lib/api';

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

const isVideoFile = (urlOrName: string | null) => {
  if (!urlOrName) return false;
  return /\.(mp4|webm|ogg|mov|quicktime)($|\?)/i.test(urlOrName) || urlOrName.startsWith('data:video');
};

const DEFAULT_SLIDES = [
  {
    id: 1,
    title: 'Platform Belajar\ndan Kolaborasi',
    subtitle: 'PLAT-BK hadir sebagai ruang belajar dan kolaborasi yang diinisiasi oleh Bank Indonesia Pematangsiantar untuk meningkatkan literasi dan pemahaman masyarakat mengenai peran, fungsi, serta kebijakan Bank Indonesia sebagai bank sentral. Melalui edukasi dan kolaborasi, PLAT-BK mendorong terbentuknya masyarakat yang lebih memahami ekonomi dan ikut berkontribusi dalam mewujudkan Indonesia yang maju.',
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
  const [isMounted, setIsMounted] = useState(false);
  const [dynamicSlides, setDynamicSlides] = useState<any[]>(DEFAULT_SLIDES);

  useEffect(() => {
    setIsMounted(true);
    if (memoryHeroCache) {
      setDynamicSlides(memoryHeroCache);
    } else if (typeof window !== 'undefined') {
      const cached = sessionStorage.getItem('hero_banners_cache');
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setDynamicSlides(parsed);
          }
        } catch (e) {}
      }
    }

    let isApiActive = true;
    const fetchHeroBanners = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001/api';
        const res = await fetch(`${apiUrl}/hero-banners?t=${Date.now()}`, { cache: 'no-store' });
        const data = await res.json();
        if (isApiActive && data.status === 'success' && Array.isArray(data.data) && data.data.length > 0) {
          const mapped = data.data.map((item: any) => ({
            id: item.id,
            title: lang === 'EN' ? (item.title_en || translateText(item.title, 'EN')) : item.title,
            subtitle: lang === 'EN' ? (item.subtitle_en || translateText(item.subtitle, 'EN')) : item.subtitle,
            button_primary_text: lang === 'EN' ? (item.button_primary_text_en || translateText(item.button_primary_text, 'EN')) : item.button_primary_text,
            button_primary_url: item.button_primary_url,
            button_secondary_text: lang === 'EN' ? (item.button_secondary_text_en || translateText(item.button_secondary_text, 'EN')) : item.button_secondary_text,
            button_secondary_url: item.button_secondary_url,
            image: getImageUrl(item.image_url || item.image || '/images/banner/hero1.png'),
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
    return () => { isApiActive = false; };
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
      className="relative min-h-[85vh] bg-gradient-to-br from-[#0062c4] via-[#0054a7] to-[#003c78] flex flex-col justify-center items-center overflow-hidden pt-28 md:pt-36 pb-12 cursor-grab active:cursor-grabbing select-none"
      onMouseDown={handleDragStart}
      onMouseMove={handleDragMove}
      onMouseUp={handleDragEnd}
      onMouseLeave={handleDragEnd}
      onTouchStart={handleDragStart}
      onTouchMove={handleDragMove}
      onTouchEnd={handleDragEnd}
    >
      {/* Decorative background elements & Soft Ambient Shadows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-24 -left-20 w-[500px] h-[500px] bg-white/10 rounded-full blur-[130px]"></div>
        <div className="absolute bottom-1/4 -right-20 w-[450px] h-[450px] bg-sky-300/15 rounded-full blur-[120px]"></div>
        <div className="absolute top-1/2 left-1/3 w-[350px] h-[350px] bg-blue-400/10 rounded-full blur-[100px]"></div>

        {/* Background Element 1.png Overlay */}
        <img 
          src="/images/element/1.png" 
          alt="Hero Background Element" 
          className="absolute inset-0 w-full h-full object-cover opacity-75 mix-blend-overlay pointer-events-none z-0"
        />
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 w-full relative z-10 flex flex-col items-center justify-center text-center">
        
        <div className="relative w-full overflow-hidden flex items-center justify-center min-h-[480px]">
          {slides.length > 0 ? (
            <div 
              className="flex transition-transform duration-700 ease-in-out w-full"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {slides.map((slide, index) => (
                <div key={slide.id || index} className="w-full flex-shrink-0 flex flex-col items-center justify-center text-center px-2">
                  
                  {/* Media Container (Image or Video) at Top Center */}
                  <div className="relative mb-6 sm:mb-8 flex items-center justify-center">
                    <div className="relative w-44 h-44 sm:w-56 sm:h-56 md:w-64 md:h-64 bg-white/95 rounded-[2.5rem] shadow-2xl border-4 border-white/40 overflow-hidden flex items-center justify-center p-3 sm:p-4 group backdrop-blur-md">
                      {isVideoFile(slide.image) ? (
                        <video
                          src={slide.image}
                          autoPlay
                          loop
                          muted
                          playsInline
                          preload="metadata"
                          className="w-full h-full object-cover rounded-2xl"
                        />
                      ) : (
                        <div className="relative w-full h-full">
                          <Image
                            src={slide.image}
                            alt={slide.title || 'Plat-BK'}
                            fill
                            priority={index === 0}
                            sizes="(max-width: 640px) 176px, (max-width: 768px) 224px, 256px"
                            className="object-contain p-2 group-hover:scale-105 transition-transform duration-700"
                            draggable={false}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Centered Title */}
                  <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight mb-4 max-w-4xl mx-auto drop-shadow-md whitespace-pre-line">
                    {slide.title}
                  </h1>

                  {/* Centered Subtitle */}
                  <p className="text-xs sm:text-sm md:text-base text-blue-100/90 leading-relaxed max-w-3xl mx-auto mb-8 font-medium px-2 sm:px-4">
                    {slide.subtitle}
                  </p>
                  
                  {/* Centered Action Buttons */}
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 w-full sm:w-auto px-4 mb-4">
                    {slide.button_primary_text && (
                      <Link href={slide.button_primary_url || '/edukasi/pengajuan'} className="w-full sm:w-auto px-7 py-3 sm:py-3.5 bg-accent-red text-white text-xs sm:text-sm font-bold rounded-full transition-all text-center border-b-4 border-red-900 shadow-lg shadow-accent-red/40 hover:brightness-110 active:border-b-0 active:translate-y-1 flex items-center justify-center gap-2">
                        <span>{slide.button_primary_text}</span>
                        <i className="fa-solid fa-chevron-right text-xs"></i>
                      </Link>
                    )}
                    {slide.button_secondary_text && (
                      <Link href={slide.button_secondary_url || '/edukasi/materi-edukasi'} className="w-full sm:w-auto px-7 py-3 sm:py-3.5 bg-white/10 hover:bg-white/20 border-2 border-white/60 text-white text-xs sm:text-sm font-bold rounded-full transition-all text-center backdrop-blur-md hover:border-white active:translate-y-0.5 flex items-center justify-center gap-2">
                        <span>{slide.button_secondary_text}</span>
                        <i className="fa-solid fa-chevron-right text-xs"></i>
                      </Link>
                    )}
                  </div>

                </div>
              ))}
            </div>
          ) : null}
        </div>

        {/* Centered Slide Dots Indicator */}
        <div className="flex items-center justify-center gap-2.5 mt-6 z-20">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentSlide(idx);
              }}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                currentSlide === idx ? 'w-8 bg-white' : 'w-2.5 bg-white/40 hover:bg-white/70'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>

      </div>

      {/* Subtle Bottom-to-Top Black Gradient Overlay */}
      <div 
        className="absolute inset-x-0 bottom-0 h-44 md:h-60 bg-gradient-to-t from-black/45 via-black/15 to-transparent pointer-events-none z-0" 
        aria-hidden="true"
      />
    </section>
  );
}

