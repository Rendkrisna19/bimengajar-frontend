'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface FooterData {
  deskripsi: string;
  alamat: string;
  telepon: string;
  email: string;
  instagram_url: string;
  youtube_url: string;
  facebook_url: string;
  twitter_url: string;
  tiktok_url: string;
  copyright_text: string;
}

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

const DEFAULT_FOOTER: FooterData = {
  deskripsi: 'Mewujudkan masyarakat yang Cinta, Bangga, dan Paham Rupiah melalui edukasi yang berkelanjutan.',
  alamat: 'Jl. H. Adam Malik No. 1, Pematangsiantar, Sumatera Utara',
  telepon: '(0622) 22100',
  email: 'pematangsiantar@bi.go.id',
  instagram_url: 'https://instagram.com/bank_indonesia_pematangsiantar',
  youtube_url: 'https://youtube.com',
  facebook_url: 'https://facebook.com',
  twitter_url: 'https://x.com',
  tiktok_url: 'https://tiktok.com',
  copyright_text: 'Bank Indonesia Pematangsiantar. Hak Cipta Dilindungi.',
};

export default function Footer() {
  const [data, setData] = useState<FooterData>(DEFAULT_FOOTER);

  useEffect(() => {
    fetch(`${API}/footer-settings`)
      .then((res) => res.json())
      .then((resData) => {
        if (resData && resData.data) {
          setData({
            ...DEFAULT_FOOTER,
            ...resData.data
          });
        }
      })
      .catch((err) => console.error('Failed fetching footer settings:', err));
  }, []);

  return (
    <footer className="bg-gradient-to-b from-white via-blue-50/50 to-blue-100/40 text-[#003366] pt-16 pb-8 border-t border-blue-100/60 relative overflow-hidden">
      {/* Decorative Element 7.png on the right edge */}
      <div className="absolute right-0 bottom-0 top-0 pointer-events-none z-0 overflow-hidden flex items-end justify-end">
        <img 
          src="/images/element/7.png" 
          alt="Footer Decorative Element 7" 
          className="h-full w-auto max-w-[450px] md:max-w-[650px] object-contain object-right-bottom opacity-75 pointer-events-none z-0"
        />
      </div>

      {/* Subtle Blue Ambient Glow */}
      <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-blue-400/10 rounded-full blur-[100px] pointer-events-none z-0"></div>

      <div className="max-w-[1400px] mx-auto px-4 md:px-8 relative z-10">
        {/* 4 Kolom: Logo & Deskripsi, Tautan, Kontak, Ikuti Kami (Tanpa Bantuan) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-12">
          
          {/* Logo & Tagline & Deskripsi */}
          <div className="flex flex-col gap-4">
            <Link href="/" className="flex items-end gap-3.5 shrink-0 py-1 group cursor-pointer">
              <div className="h-14 w-auto flex items-center justify-start shrink-0">
                <Image 
                  src="/images/logo.png?v=2" 
                  alt="Logo BI Mengajar" 
                  width={200} 
                  height={58} 
                  className="h-full w-auto object-contain transition-transform duration-300 group-hover:scale-105" 
                  priority
                  unoptimized
                />
              </div>
              <div className="flex flex-col text-left leading-tight tracking-tight pb-1" style={{ fontFamily: 'var(--font-plus-jakarta)' }}>
                <span className="whitespace-nowrap text-[11px] font-bold text-gray-700">by Kantor Perwakilan Bank Indonesia</span>
                <span className="text-primary font-black text-[13px] whitespace-nowrap -mt-0.5">Pematangsiantar</span>
              </div>
            </Link>
            <p className="text-gray-600 text-sm leading-relaxed mt-1">
              {data.deskripsi}
            </p>
          </div>

          {/* Tautan Navigasi */}
          <div>
            <h3 className="font-bold text-lg mb-6 text-[#003366] tracking-wide">Tautan</h3>
            <ul className="flex flex-col gap-3">
              <li><Link href="/" className="text-gray-600 hover:text-primary transition-colors text-sm font-medium">Beranda</Link></li>
              <li><Link href="/tentang-kami" className="text-gray-600 hover:text-primary transition-colors text-sm font-medium">Tentang Kami</Link></li>
              <li><Link href="/edukasi" className="text-gray-600 hover:text-primary transition-colors text-sm font-medium">Edukasi</Link></li>
              <li><Link href="/titik-temu" className="text-gray-600 hover:text-primary transition-colors text-sm font-medium">Pojok Koin</Link></li>
              <li><Link href="/berita" className="text-gray-600 hover:text-primary transition-colors text-sm font-medium">Aktivitas</Link></li>
            </ul>
          </div>

          {/* Kontak (Dynamic) */}
          <div>
            <h3 className="font-bold text-lg mb-6 text-[#003366] tracking-wide">Kontak</h3>
            <ul className="flex flex-col gap-4">
              {data.alamat && (
                <li className="flex items-start gap-3 text-gray-600">
                  <i className="fa-solid fa-location-dot mt-1 text-primary shrink-0"></i>
                  <span className="text-sm leading-relaxed whitespace-pre-line">{data.alamat}</span>
                </li>
              )}
              {data.telepon && (
                <li className="flex items-center gap-3 text-gray-600">
                  <i className="fa-solid fa-phone text-primary shrink-0"></i>
                  <span className="text-sm">{data.telepon}</span>
                </li>
              )}
              {data.email && (
                <li className="flex items-center gap-3 text-gray-600">
                  <i className="fa-solid fa-envelope text-primary shrink-0"></i>
                  <span className="text-sm">{data.email}</span>
                </li>
              )}
            </ul>
          </div>

          {/* Ikuti Kami (Dynamic Social Media) */}
          <div>
            <h3 className="font-bold text-lg mb-6 text-[#003366] tracking-wide">Ikuti Kami</h3>
            <div className="flex items-center gap-3 flex-wrap">
              {data.instagram_url && (
                <a 
                  href={data.instagram_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  aria-label="Instagram Bank Indonesia" 
                  className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#003366] hover:bg-primary hover:text-white transition-all duration-300 text-lg shadow-sm border border-blue-100"
                >
                  <i className="fa-brands fa-instagram"></i>
                </a>
              )}
              {data.youtube_url && (
                <a 
                  href={data.youtube_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  aria-label="YouTube Bank Indonesia" 
                  className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#003366] hover:bg-primary hover:text-white transition-all duration-300 text-lg shadow-sm border border-blue-100"
                >
                  <i className="fa-brands fa-youtube"></i>
                </a>
              )}
              {data.facebook_url && (
                <a 
                  href={data.facebook_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  aria-label="Facebook Bank Indonesia" 
                  className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#003366] hover:bg-primary hover:text-white transition-all duration-300 text-lg shadow-sm border border-blue-100"
                >
                  <i className="fa-brands fa-facebook-f"></i>
                </a>
              )}
              {data.twitter_url && (
                <a 
                  href={data.twitter_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  aria-label="Twitter X Bank Indonesia" 
                  className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#003366] hover:bg-primary hover:text-white transition-all duration-300 text-lg shadow-sm border border-blue-100"
                >
                  <i className="fa-brands fa-x-twitter"></i>
                </a>
              )}
              {data.tiktok_url && (
                <a 
                  href={data.tiktok_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  aria-label="TikTok Bank Indonesia" 
                  className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#003366] hover:bg-primary hover:text-white transition-all duration-300 text-lg shadow-sm border border-blue-100"
                >
                  <i className="fa-brands fa-tiktok"></i>
                </a>
              )}
            </div>
          </div>

        </div>

        {/* Copyright */}
        <div className="border-t border-blue-200/60 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-600 text-sm">
            &copy; {new Date().getFullYear()} {data.copyright_text || 'Bank Indonesia. Hak Cipta Dilindungi.'}
          </p>
          <div className="flex gap-4">
            <span className="text-primary font-bold text-sm">Indonesia Maju</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
