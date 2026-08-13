'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function NotFound() {
  useEffect(() => {
    // Inject DotLottie Player script for smooth rendering of public/images/lottie/404.json
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/@dotlottie/player-component@latest/dist/dotlottie-player.mjs';
    script.type = 'module';
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col font-sans selection:bg-primary selection:text-white">
      <Navbar />

      <main className="flex-1 flex items-center justify-center pt-28 pb-16 px-4 md:px-8 relative overflow-hidden">
        {/* Glowing Background Blobs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/20 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="max-w-3xl w-full mx-auto text-center relative z-10 flex flex-col items-center">
          
          {/* Lottie Container or Fallback Animated Graphic */}
          <div className="w-full max-w-md h-64 md:h-80 flex items-center justify-center mb-6 relative">
            <div className="w-full h-full flex items-center justify-center">
              {/* @ts-ignore */}
              <dotlottie-player
                src="/images/lottie/404.json"
                background="transparent"
                speed="1"
                style={{ width: '100%', height: '100%' }}
                loop
                autoplay
              >
                {/* Fallback Graphic if Lottie file is loading or missing */}
                <div className="relative flex flex-col items-center justify-center">
                  <span className="text-8xl md:text-9xl font-black bg-gradient-to-r from-blue-400 via-primary to-cyan-400 bg-clip-text text-transparent animate-pulse tracking-widest drop-shadow-2xl">
                    404
                  </span>
                  <div className="mt-2 bg-primary/30 backdrop-blur-md px-4 py-1.5 rounded-full border border-blue-400/30 text-xs font-bold uppercase tracking-widest text-blue-200 shadow-lg">
                    Halaman Tidak Ditemukan
                  </div>
                </div>
              {/* @ts-ignore */}
              </dotlottie-player>
            </div>
          </div>

          {/* Heading */}
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 leading-tight">
            Waduh! Halaman Yang Anda Cari <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
              Tidak Ditemukan
            </span>
          </h1>

          {/* Description */}
          <p className="text-slate-400 text-sm md:text-base max-w-lg mb-8 leading-relaxed">
            Halaman yang Anda tuju mungkin telah dipindahkan, dihapus, atau alamat URL yang dimasukkan kurang tepat. Mari kembali ke jalur yang benar!
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 w-full max-w-md">
            <Link
              href="/"
              className="w-full sm:w-auto px-8 py-3.5 bg-primary hover:bg-blue-600 text-white rounded-2xl font-bold text-sm transition-all duration-300 shadow-lg shadow-primary/30 hover:shadow-primary/50 hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
              <i className="fa-solid fa-house"></i>
              Kembali ke Beranda
            </Link>
            <Link
              href="/edukasi"
              className="w-full sm:w-auto px-6 py-3.5 bg-slate-800/80 hover:bg-slate-800 text-slate-200 hover:text-white rounded-2xl font-bold text-sm border border-slate-700/60 transition-all duration-300 hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
              <i className="fa-solid fa-graduation-cap"></i>
              Jelajahi Edukasi
            </Link>
          </div>

          {/* Additional Quick Navigation Links */}
          <div className="mt-12 pt-8 border-t border-slate-800/80 w-full max-w-lg flex items-center justify-around text-xs text-slate-400">
            <Link href="/titik-temu" className="hover:text-blue-400 transition-colors flex items-center gap-1.5">
              <i className="fa-solid fa-map-location-dot"></i> Titik Temu
            </Link>
            <span className="text-slate-700">•</span>
            <Link href="/berita" className="hover:text-blue-400 transition-colors flex items-center gap-1.5">
              <i className="fa-solid fa-newspaper"></i> Berita Terkini
            </Link>
            <span className="text-slate-700">•</span>
            <Link href="/tentang-kami" className="hover:text-blue-400 transition-colors flex items-center gap-1.5">
              <i className="fa-solid fa-circle-info"></i> Tentang Kami
            </Link>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
