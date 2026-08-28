'use client';

import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';

export default function EdukasiPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const headerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Header Animation
    if (headerRef.current) {
      const headerElements = headerRef.current.children;
      gsap.fromTo(
        headerElements,
        { opacity: 0, y: -30 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power3.out' }
      );
    }

    // Grid Animation
    if (gridRef.current) {
      const cards = gridRef.current.children;
      gsap.fromTo(
        cards,
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power3.out', delay: 0.2 }
      );
    }
  }, []);

  const edukasiMenus = [
    {
      id: 'materi',
      title: 'Materi Edukasi',
      description: 'Kumpulan materi seputar kebanksentralan, sistem pembayaran, Rupiah, QRIS, dan lainnya.',
      icon: 'fa-solid fa-book-open',
      link: '/edukasi/materi-edukasi',
      buttonText: 'Lihat Materi',
      color: 'blue'
    },
    {
      id: 'game',
      title: 'Game & Kuis',
      description: 'Belajar sambil bermain dengan game dan kuis interaktif yang seru dan menyenangkan.',
      icon: 'fa-solid fa-gamepad',
      link: '/user/dashboard/kuis',
      buttonText: 'Main Sekarang',
      color: 'green'
    },
    {
      id: 'pengajuan',
      title: 'Ajukan Kegiatan',
      description: 'Ajukan permintaan kegiatan edukasi dan sosialisasi secara langsung bersama Bank Indonesia.',
      icon: 'fa-solid fa-file-signature',
      link: '/edukasi/pengajuan',
      buttonText: 'Ajukan Sekarang',
      color: 'orange'
    },
    {
      id: 'mitra',
      title: 'Mitra Edukasi',
      description: 'Temukan berbagai mitra edukasi Bank Indonesia yang tersebar di seluruh Indonesia.',
      icon: 'fa-solid fa-users-viewfinder',
      link: '/edukasi/mitra',
      buttonText: 'Lihat Mitra',
      color: 'purple'
    }
  ];

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navbar />

      {/* Header Section */}
      <section className="bg-primary text-white pt-32 pb-40 px-4 md:px-8 relative overflow-hidden border-b-4 border-[#fbbf24]">
        {/* Background Image /images/header.jpg with 20% Opacity */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <img
            src="/images/header.jpg"
            alt="Header Background"
            className="w-full h-full object-cover object-center opacity-20 mix-blend-overlay"
          />
        </div>

        <div ref={headerRef} className="max-w-[1200px] mx-auto relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 text-sm text-blue-200 mb-4">
              <Link href="/" className="hover:text-white transition-colors">Beranda</Link>
              <span>&gt;</span>
              <span className="text-white font-medium">Edukasi</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4 drop-shadow-md">Edukasi</h1>
            <p className="text-blue-100 max-w-xl text-lg leading-relaxed">
              Temukan berbagai media pembelajaran interaktif dan ajukan kegiatan edukasi seputar Bank Indonesia.
            </p>
          </div>
          
          <div className="w-full md:w-[400px]">
            <div className="relative group">
              <input 
                type="text" 
                placeholder="Cari edukasi..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder:text-blue-200 rounded-2xl px-6 py-4 outline-none focus:bg-white focus:text-gray-800 focus:placeholder:text-gray-400 transition-all duration-300 shadow-lg"
              />
              <button className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-blue-200 group-focus-within:text-primary transition-colors">
                <i className="fa-solid fa-magnifying-glass text-lg"></i>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Grid Content Area */}
      <section className="px-4 md:px-8 max-w-[1200px] mx-auto -mt-24 relative z-20 w-full pb-20 flex-1">
        <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {edukasiMenus.map((menu) => (
            <div 
              key={menu.id}
              className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 flex flex-col items-center text-center group hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 relative overflow-hidden"
            >
              {/* Decorative background blob on hover */}
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-gray-50 rounded-full group-hover:scale-150 transition-transform duration-700 -z-10"></div>
              
              <div className="w-20 h-20 rounded-2xl bg-blue-50 text-primary flex items-center justify-center text-3xl mb-6 group-hover:bg-primary group-hover:text-white transition-colors duration-300 shadow-sm">
                <i className={menu.icon}></i>
              </div>
              
              <h2 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary transition-colors">
                {menu.title}
              </h2>
              
              <p className="text-gray-500 text-sm leading-relaxed mb-8 flex-1">
                {menu.description}
              </p>
              
              <Link 
                href={menu.link}
                className="w-full flex items-center justify-center py-3.5 rounded-xl bg-accent-red text-white font-bold border-b-4 border-accent-red-dark hover:brightness-110 active:border-b-0 active:translate-y-1 transition-all shadow-sm"
              >
                {menu.buttonText}
              </Link>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  );
}
