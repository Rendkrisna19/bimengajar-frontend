'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import gsap from 'gsap';

export default function Navbar() {
  const navbarRef = useRef<HTMLElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const [lang, setLang] = useState('ID');
  const [imgError, setImgError] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    let lastScrollY = window.scrollY;
    
    const handleScroll = () => {
      if (!navbarRef.current) return;
      const currentScrollY = window.scrollY;
      
      // Jangan jalankan animasi sembunyi jika menu mobile sedang terbuka
      if (isMobileOpen) return;
      
      if (currentScrollY > 50) {
        if (currentScrollY > lastScrollY) {
          gsap.to(navbarRef.current, { y: '-150%', duration: 0.4, ease: 'power2.out' });
        } else {
          gsap.to(navbarRef.current, { y: '0%', duration: 0.4, ease: 'power2.out' });
        }
      } else {
        gsap.to(navbarRef.current, { y: '0%', duration: 0.4, ease: 'power2.out' });
      }
      lastScrollY = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isMobileOpen]);

  // Animasi untuk mobile menu
  useEffect(() => {
    if (isMobileOpen && mobileMenuRef.current) {
      gsap.fromTo(mobileMenuRef.current, 
        { y: -20, opacity: 0, scale: 0.95 },
        { y: 0, opacity: 1, scale: 1, duration: 0.3, ease: 'power2.out' }
      );
    }
  }, [isMobileOpen]);

  const menuItems = [
    { name: 'Beranda', icon: 'fa-solid fa-house', href: '/' },
    { name: 'Edukasi', icon: 'fa-solid fa-book-open', href: '/edukasi', dropdown: true },
    { name: 'Titik Temu', icon: 'fa-solid fa-coins', href: '/titik-temu' },
    { name: 'Kalender', icon: 'fa-regular fa-calendar-check', href: '/kalender' },
    { name: 'Kunjungan', icon: 'fa-solid fa-building-circle-arrow-right', href: '/kunjungan' },
    { name: 'Berita', icon: 'fa-regular fa-newspaper', href: '/berita' },
  ];

  return (
    <header 
      ref={navbarRef}
      className="fixed top-4 md:top-6 left-0 right-0 z-50 px-4 md:px-8 font-sans w-full transition-all duration-300"
    >
      {/* ======================= */}
      {/* DESKTOP LAYOUT (xl up)  */}
      {/* ======================= */}
      <div className="hidden xl:flex items-center justify-between w-full max-w-7xl mx-auto">
        {/* KIRI - Ganti Bahasa (Left Pill) */}
        <button 
          onClick={() => setLang(lang === 'ID' ? 'EN' : 'ID')}
          className="flex-shrink-0 flex items-center gap-2.5 px-5 py-2.5 bg-white/90 backdrop-blur-md shadow-lg rounded-full border border-white/50 text-sm font-semibold text-gray-700 hover:text-primary transition-colors hover:shadow-xl hover:-translate-y-0.5 whitespace-nowrap"
        >
          <div className="w-4 h-4 rounded-full overflow-hidden relative shadow-sm border border-gray-200 shrink-0">
            <Image 
              src={lang === 'ID' ? '/images/bendera/indonesia.png' : '/images/bendera/inggris.svg'} 
              alt={`Bendera ${lang}`}
              fill
              className="object-cover"
            />
          </div>
          <span className="flex items-center gap-1.5">
            Ganti Bahasa <span className="text-gray-400 font-normal">({lang})</span>
          </span>
        </button>

        {/* TENGAH - Logo & Menu (Center Pill) */}
        <nav className="flex-shrink-0 flex items-center gap-6 px-4 py-2 bg-white/90 backdrop-blur-md shadow-lg rounded-full border border-white/50 mx-4">
          <Link href="/" className="flex items-center pl-2 shrink-0">
            {!imgError ? (
              <Image 
                src="/images/logo.png" 
                alt="Logo BI Mengajar" 
                width={120} 
                height={40} 
                className="h-8 w-auto object-contain"
                priority
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="flex items-center gap-2 px-3 py-1 bg-primary text-white font-bold rounded-full text-xs">
                <i className="fa-solid fa-building-columns"></i> BI
              </div>
            )}
          </Link>

          <div className="w-px h-6 bg-gray-200 mx-1 shrink-0"></div>

          <div className="flex items-center gap-5 pr-4 shrink-0">
            {menuItems.map((item, idx) => (
              <div key={idx} className="relative group shrink-0">
                <Link 
                  href={item.href} 
                  className="flex items-center gap-1.5 text-gray-700 font-semibold hover:text-primary transition-colors py-2 text-[13px] whitespace-nowrap"
                >
                  {item.name}
                  {item.dropdown && (
                    <i className="fa-solid fa-chevron-down text-[9px] text-gray-400 group-hover:text-primary transition-colors mt-0.5"></i>
                  )}
                </Link>
                <div className="absolute bottom-0 left-0 h-[2px] bg-primary w-0 group-hover:w-full transition-all duration-300 ease-out rounded-full"></div>
              </div>
            ))}
          </div>
        </nav>

        {/* KANAN - Log In (Right Pill) */}
        <Link 
          href="/login" 
          className="flex-shrink-0 px-6 py-2.5 bg-white/90 backdrop-blur-md shadow-lg rounded-full border border-white/50 text-sm font-bold text-gray-800 hover:text-primary transition-all hover:shadow-xl hover:-translate-y-0.5 flex items-center gap-2 whitespace-nowrap"
        >
          <i className="fa-solid fa-user-lock text-primary"></i> Log In
        </Link>
      </div>

      {/* ================================== */}
      {/* MOBILE / TABLET LAYOUT (< xl)      */}
      {/* ================================== */}
      <div className="flex xl:hidden items-center justify-between w-full">
        {/* Mobile Logo Pill */}
        <Link href="/" className="px-4 py-2 bg-white/95 backdrop-blur-md shadow-lg rounded-full border border-white/50 flex-shrink-0 z-50">
          {!imgError ? (
            <Image 
              src="/images/logo.png" 
              alt="Logo BI Mengajar" 
              width={100} 
              height={32} 
              className="h-7 w-auto object-contain"
              priority
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="flex items-center gap-2 px-3 py-1 bg-primary text-white font-bold rounded-full text-xs">
              <i className="fa-solid fa-building-columns"></i> BI
            </div>
          )}
        </Link>

        {/* Mobile Actions Pill */}
        <div className="flex items-center gap-3 px-3 py-2 bg-white/95 backdrop-blur-md shadow-lg rounded-full border border-white/50 flex-shrink-0 z-50">
          <button 
            onClick={() => setLang(lang === 'ID' ? 'EN' : 'ID')}
            className="w-6 h-6 rounded-full overflow-hidden relative shadow-sm border border-gray-200 shrink-0 hover:opacity-80 transition-opacity"
          >
            <Image 
              src={lang === 'ID' ? '/images/bendera/indonesia.png' : '/images/bendera/inggris.svg'} 
              alt={`Bendera ${lang}`}
              fill
              className="object-cover"
            />
          </button>
          
          <div className="w-px h-5 bg-gray-200"></div>
          
          <button 
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="w-8 h-8 flex items-center justify-center text-gray-800 hover:text-primary transition-colors"
          >
            <i className={`fa-solid ${isMobileOpen ? 'fa-xmark text-xl' : 'fa-bars text-lg'}`}></i>
          </button>
        </div>
      </div>

      {/* ================================== */}
      {/* MOBILE MENU DROPDOWN               */}
      {/* ================================== */}
      {isMobileOpen && (
        <div 
          ref={mobileMenuRef}
          className="xl:hidden absolute top-20 left-4 right-4 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/50 p-6 flex flex-col gap-6 z-40"
        >
          <div className="flex flex-col gap-4">
            {menuItems.map((item, idx) => (
              <Link 
                key={idx}
                href={item.href} 
                onClick={() => setIsMobileOpen(false)}
                className="flex items-center justify-between text-gray-700 font-semibold hover:text-primary transition-colors text-base border-b border-gray-100 pb-3"
              >
                <span className="flex items-center gap-3">
                  <i className={`${item.icon} text-primary/70 w-5 text-center`}></i>
                  {item.name}
                </span>
                {item.dropdown && (
                  <i className="fa-solid fa-chevron-down text-[10px] text-gray-400"></i>
                )}
              </Link>
            ))}
          </div>

          <Link 
            href="/login" 
            onClick={() => setIsMobileOpen(false)}
            className="w-full py-3.5 bg-primary text-white text-center font-bold rounded-xl shadow-md hover:bg-blue-900 transition-colors flex items-center justify-center gap-2"
          >
            <i className="fa-solid fa-user-lock"></i> Log In ke Dashboard
          </Link>
        </div>
      )}

    </header>
  );
}
