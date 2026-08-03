'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import gsap from 'gsap';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Navbar() {
  const navbarRef = useRef<HTMLElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const { lang, setLang } = useLanguage();
  const [imgError, setImgError] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [openMobileDropdown, setOpenMobileDropdown] = useState<string | null>(null);
  const [user, setUser] = useState<{name: string, role: string} | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (e) {}
    }
  }, []);

  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsScrolled(currentScrollY > 50);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
    { name: 'Tentang Kami', icon: 'fa-solid fa-circle-info', href: '/tentang-kami' },
    { 
      name: 'Edukasi', 
      icon: 'fa-solid fa-book-open', 
      href: '/edukasi',
      dropdown: true,
      subItems: [
        { name: 'Pengajuan Kegiatan', href: '/edukasi/pengajuan' },
        { name: 'Materi Edukasi', href: '/edukasi/materi-edukasi' },
        { name: 'Mitra Edukasi', href: '/edukasi/mitra' }
      ]
    },
    { name: 'Titik Temu', icon: 'fa-solid fa-coins', href: '/titik-temu' },
    { name: 'Aktivitas', icon: 'fa-solid fa-chart-line', href: '/aktivitas' },
  ];

  return (
    <header 
      ref={navbarRef}
      className={`fixed left-0 right-0 z-50 px-4 md:px-8 font-sans w-full transition-all duration-300 ${
        isScrolled
          ? 'top-4 md:top-6' // keep the same top margin as normal
          : 'top-4 md:top-6'
      }`}
    >
      {/* ======================= */}
      {/* DESKTOP LAYOUT (xl up)  */}
      {/* ======================= */}
      <div className="hidden xl:flex items-center justify-between w-full max-w-7xl mx-auto">
        {/* KIRI - Ganti Bahasa (Left Pill) */}
        <button 
          onClick={() => setLang(lang === 'ID' ? 'EN' : 'ID')}
          className={`flex-shrink-0 flex items-center gap-2.5 px-5 py-2.5 rounded-full text-sm font-semibold transition-all whitespace-nowrap group ${
            isScrolled
              ? 'bg-[#fbbf24] text-white shadow-md hover:bg-yellow-500 hover:-translate-y-0.5'
              : 'bg-white/90 backdrop-blur-md shadow-lg border border-white/50 text-gray-700 hover:text-primary hover:border-[#fbbf24] hover:shadow-xl hover:-translate-y-0.5'
          }`}
        >
          <div className="w-4 h-4 rounded-full overflow-hidden relative shadow-sm border border-gray-200 group-hover:border-[#fbbf24] transition-colors shrink-0">
            <Image 
              src={lang === 'ID' ? '/images/bendera/indonesia.png' : '/images/bendera/inggris.svg'} 
              alt={`Bendera ${lang}`}
              fill
              sizes="16px"
              className="object-cover"
            />
          </div>
          <span className="flex items-center gap-1.5">
            Ganti Bahasa <span className={`font-normal ${isScrolled ? 'text-white/80' : 'text-gray-400'}`}>({lang})</span>
          </span>
        </button>

        {/* TENGAH - Logo & Menu (Center Pill) */}
        <nav className={`flex-shrink-0 flex items-center gap-6 px-4 py-2 rounded-full mx-4 transition-all ${
          isScrolled 
            ? 'bg-[#fbbf24] text-white shadow-md' 
            : 'bg-white/90 backdrop-blur-md shadow-lg border border-white/50'
        }`}>
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

          <div className={`w-px h-6 mx-1 shrink-0 transition-colors ${isScrolled ? 'bg-white/40' : 'bg-gray-200'}`}></div>

          <div className="flex items-center gap-5 pr-4 shrink-0">
            {menuItems.map((item, idx) => (
              <div key={idx} className="relative group shrink-0">
                <Link 
                  href={item.href} 
                  className={`flex items-center gap-1.5 font-semibold transition-colors py-2 text-[13px] whitespace-nowrap ${
                    isScrolled ? 'text-white hover:text-white/80' : 'text-gray-700 hover:text-primary'
                  }`}
                >
                  {item.name}
                  {item.dropdown && (
                    <i className={`fa-solid fa-chevron-down text-[9px] transition-colors mt-0.5 ${
                      isScrolled ? 'text-white/80 group-hover:text-white' : 'text-gray-400 group-hover:text-primary'
                    }`}></i>
                  )}
                </Link>
                <div className={`absolute bottom-0 left-0 h-[2px] w-0 group-hover:w-full transition-all duration-300 ease-out rounded-full ${
                  isScrolled ? 'bg-white shadow-none' : 'bg-[#fbbf24] shadow-[0_0_5px_rgba(251,191,36,0.5)]'
                }`}></div>
                
                {/* Dropdown Menu */}
                {item.dropdown && item.subItems && (
                  <div className="absolute top-full left-0 mt-2 w-48 bg-white/95 backdrop-blur-md rounded-xl shadow-xl border border-white/50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 py-2 z-50 flex flex-col translate-y-2 group-hover:translate-y-0">
                    {item.subItems.map((sub, sIdx) => (
                      <Link 
                        key={sIdx} 
                        href={sub.href}
                        className="px-4 py-2 text-[13px] font-medium text-gray-700 hover:text-primary hover:bg-[#fbbf24]/10 transition-colors flex items-center gap-2"
                      >
                        {sub.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </nav>

        {/* KANAN - Log In / Profile (Right Pill) */}
        {user ? (
          <div className="relative group shrink-0">
            <Link 
              href={user.role === 'admin' ? '/admin' : '/user/dashboard'} 
              className={`flex-shrink-0 px-5 py-1.5 rounded-full text-sm font-bold flex items-center gap-3 whitespace-nowrap cursor-pointer transition-all ${
                isScrolled
                  ? 'bg-[#fbbf24] text-white hover:bg-yellow-500 shadow-md hover:-translate-y-0.5'
                  : 'bg-white/90 backdrop-blur-md shadow-lg border border-white/50 text-gray-800 hover:text-primary hover:shadow-xl hover:-translate-y-0.5'
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs ${
                isScrolled ? 'bg-white text-primary' : 'bg-primary text-white'
              }`}>
                {user.name.substring(0, 2).toUpperCase()}
              </div>
              {user.name.split(' ')[0]}
            </Link>
            
            {/* Dropdown Profile */}
            <div className="absolute top-full right-0 mt-2 w-56 bg-white/95 backdrop-blur-md rounded-xl shadow-xl border border-white/50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 py-2 z-50 flex flex-col translate-y-2 group-hover:translate-y-0">
              <div className="px-4 py-2 border-b border-gray-100 mb-1">
                <p className="text-xs text-gray-500">Masuk sebagai</p>
                <p className="text-sm font-bold text-gray-800 truncate">{user.name}</p>
              </div>
              
              <Link 
                href={user.role === 'admin' ? '/admin' : '/user/dashboard'} 
                className="px-4 py-2 text-[13px] font-medium text-gray-700 hover:text-primary hover:bg-blue-50/50 transition-colors flex items-center gap-2"
              >
                <i className="fa-solid fa-house w-4 text-center"></i> Dashboard
              </Link>
              
              {user.role !== 'admin' && (
                <Link 
                  href="/user/dashboard/riwayat" 
                  className="px-4 py-2 text-[13px] font-medium text-gray-700 hover:text-primary hover:bg-blue-50/50 transition-colors flex items-center gap-2"
                >
                  <i className="fa-solid fa-file-invoice w-4 text-center"></i> Riwayat Pengajuan
                </Link>
              )}
              
              <button 
                onClick={() => {
                  localStorage.removeItem('token');
                  localStorage.removeItem('user');
                  window.location.href = '/login';
                }}
                className="w-full text-left px-4 py-2 text-[13px] font-medium text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2 border-t border-gray-100 mt-1 pt-2"
              >
                <i className="fa-solid fa-arrow-right-from-bracket w-4 text-center"></i> Logout
              </button>
            </div>
          </div>
        ) : (
          <Link 
            href="/login" 
            className={`flex-shrink-0 px-6 py-2.5 rounded-full text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              isScrolled
                ? 'bg-[#fbbf24] text-white hover:bg-yellow-500 shadow-md hover:-translate-y-0.5'
                : 'bg-white/90 backdrop-blur-md shadow-lg border border-white/50 text-gray-800 hover:text-primary hover:shadow-xl hover:-translate-y-0.5'
            }`}
          >
            <i className={`fa-solid fa-user-lock drop-shadow-md ${isScrolled ? 'text-white' : 'text-[#fbbf24]'}`}></i> Log In
          </Link>
        )}
      </div>

      {/* ================================== */}
      {/* MOBILE / TABLET LAYOUT (< xl)      */}
      {/* ================================== */}
      <div className="flex xl:hidden items-center justify-between w-full">
        {/* Mobile Logo Pill */}
        <Link href="/" className={`px-4 py-2 rounded-full flex-shrink-0 z-50 transition-all ${
          isScrolled ? 'bg-[#fbbf24] shadow-md' : 'bg-white/95 backdrop-blur-md shadow-lg border border-white/50'
        }`}>
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
        <div className={`flex items-center gap-3 px-3 py-2 rounded-full flex-shrink-0 z-50 transition-all ${
          isScrolled ? 'bg-[#fbbf24] text-white shadow-md' : 'bg-white/95 backdrop-blur-md shadow-lg border border-white/50 text-gray-800'
        }`}>
          <button 
            onClick={() => setLang(lang === 'ID' ? 'EN' : 'ID')}
            className="w-6 h-6 rounded-full overflow-hidden relative shadow-sm border border-gray-200 shrink-0 hover:opacity-80 transition-opacity"
          >
            <Image 
              src={lang === 'ID' ? '/images/bendera/indonesia.png' : '/images/bendera/inggris.svg'} 
              alt={`Bendera ${lang}`}
              fill
              sizes="24px"
              className="object-cover"
            />
          </button>
          
          <div className={`w-px h-5 transition-colors ${isScrolled ? 'bg-white/40' : 'bg-gray-200'}`}></div>
          
          <button 
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className={`w-8 h-8 flex items-center justify-center transition-colors ${
              isScrolled ? 'text-white hover:text-white/80' : 'text-gray-800 hover:text-primary'
            }`}
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
          className="xl:hidden absolute top-20 left-4 right-4 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/50 p-5 flex flex-col gap-4 z-[100] max-h-[80vh] overflow-y-auto"
        >
          <div className="flex flex-col gap-3">
            {menuItems.map((item, idx) => (
              <div key={idx} className="flex flex-col">
                <div 
                  className={`flex items-center justify-between text-gray-700 font-semibold transition-colors text-base border-b border-gray-100 pb-2 ${item.dropdown && openMobileDropdown === item.name ? 'text-primary border-primary/20' : 'hover:text-primary'}`}
                >
                  <Link 
                    href={item.dropdown ? '#' : item.href} 
                    onClick={(e) => {
                      if (item.dropdown) {
                        e.preventDefault();
                        setOpenMobileDropdown(openMobileDropdown === item.name ? null : item.name);
                      } else {
                        setIsMobileOpen(false);
                      }
                    }}
                    className="flex items-center gap-3 flex-1"
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${item.dropdown && openMobileDropdown === item.name ? 'bg-blue-50 text-primary' : 'bg-gray-50 text-gray-500'}`}>
                      <i className={`${item.icon} text-sm`}></i>
                    </div>
                    {item.name}
                  </Link>
                  {item.dropdown && (
                    <button 
                      onClick={() => setOpenMobileDropdown(openMobileDropdown === item.name ? null : item.name)}
                      className="p-2 text-gray-400 hover:text-primary transition-colors"
                    >
                      <i className={`fa-solid fa-chevron-down transition-transform duration-300 ${openMobileDropdown === item.name ? 'rotate-180 text-primary' : ''}`}></i>
                    </button>
                  )}
                </div>
                
                {/* Mobile Dropdown */}
                {item.dropdown && item.subItems && openMobileDropdown === item.name && (
                  <div className="flex flex-col gap-1 mt-2 mb-2 animate-fade-in-down">
                    <div className="ml-4 pl-4 border-l-2 border-blue-100 flex flex-col gap-2 py-2">
                      {item.subItems.map((sub, sIdx) => (
                        <Link 
                          key={sIdx} 
                          href={sub.href}
                          onClick={() => setIsMobileOpen(false)}
                          className="text-sm font-medium text-gray-600 hover:text-primary hover:bg-blue-50 py-2 px-3 rounded-xl transition-colors w-full block"
                        >
                          {sub.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {user ? (
            <div className="flex flex-col gap-2 border-t border-gray-100 pt-4 mt-1">
              <div className="flex items-center gap-3 mb-3 px-2">
                <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold shadow-sm">
                  {user.name.substring(0, 2).toUpperCase()}
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Masuk sebagai</span>
                  <span className="text-sm font-bold text-gray-800 line-clamp-1">{user.name}</span>
                </div>
              </div>
              <div className={`grid ${user.role === 'admin' ? 'grid-cols-1' : 'grid-cols-2'} gap-2`}>
                <Link 
                  href={user.role === 'admin' ? '/admin' : '/user/dashboard'} 
                  onClick={() => setIsMobileOpen(false)}
                  className="w-full py-2.5 bg-blue-50/50 text-blue-700 text-center font-semibold rounded-xl hover:bg-blue-100 transition-colors flex flex-col items-center justify-center gap-1 border border-blue-100/50"
                >
                  <i className="fa-solid fa-house text-[16px]"></i>
                  <span className="text-[11px]">Dashboard</span>
                </Link>
                {user.role !== 'admin' && (
                  <Link 
                    href="/user/dashboard/riwayat" 
                    onClick={() => setIsMobileOpen(false)}
                    className="w-full py-2.5 bg-blue-50/50 text-blue-700 text-center font-semibold rounded-xl hover:bg-blue-100 transition-colors flex flex-col items-center justify-center gap-1 border border-blue-100/50"
                  >
                    <i className="fa-solid fa-file-invoice text-[16px]"></i>
                    <span className="text-[11px]">Riwayat</span>
                  </Link>
                )}
              </div>
              <button 
                onClick={() => {
                  localStorage.removeItem('token');
                  localStorage.removeItem('user');
                  window.location.href = '/login';
                }}
                className="w-full py-2.5 mt-1 bg-red-50 text-red-600 text-center font-semibold rounded-xl hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
              >
                <i className="fa-solid fa-arrow-right-from-bracket"></i> Logout
              </button>
            </div>
          ) : (
            <Link 
              href="/login" 
              onClick={() => setIsMobileOpen(false)}
              className="w-full py-3.5 bg-primary text-white text-center font-bold rounded-xl shadow-md hover:bg-blue-900 transition-colors flex items-center justify-center gap-2"
            >
              <i className="fa-solid fa-user-lock"></i> Log In ke Dashboard
            </Link>
          )}
        </div>
      )}

    </header>
  );
}
