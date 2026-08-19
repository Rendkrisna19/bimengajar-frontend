'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function AboutPreviewSection() {
  const { t, lang } = useLanguage();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAbouts = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/abouts`);
        const result = await res.json();
        if (result.status === 'success' && result.data && result.data.tentang_bi) {
          setData(result.data.tentang_bi);
        }
      } catch (error) {
        console.error('Failed to fetch about data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAbouts();
  }, []);

  const createPreviewText = (html: string) => {
    if (!html) return '';
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    const text = tempDiv.textContent || tempDiv.innerText || '';
    return text.length > 300 ? text.substring(0, 300) + '...' : text;
  };

  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    return `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'}/storage/${imagePath}`;
  };

  if (loading) {
    return (
      <section className="bg-white py-16 md:py-24 overflow-hidden relative border-y border-gray-100 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primary"></div>
      </section>
    );
  }

  if (!data) return null;

  // Baca kolom Bahasa Inggris (title_en & content_en) jika lang === 'EN'
  const displayTitle = (lang === 'EN' && data.title_en) ? data.title_en : (data.title || t('about.defaultTitle'));
  const rawContent = (lang === 'EN' && data.content_en) ? data.content_en : data.content;
  const displayContent = createPreviewText(rawContent);

  return (
    <section className="bg-white py-16 md:py-24 overflow-hidden relative border-y border-gray-100">
      <div 
        className="absolute inset-0 w-full h-full opacity-[0.01] bg-no-repeat bg-center bg-cover pointer-events-none"
        style={{ backgroundImage: 'url(/images/element/2.png)' }}
      ></div>

      <div className="max-w-[1200px] mx-auto px-4 md:px-8 relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
        {/* Left Side: Graphic / Image */}
        <div className="flex-1 w-full max-w-lg flex justify-center relative order-2 md:order-1 my-auto">
          <div className="relative w-full aspect-[4/3] bg-[#f2f6fa] rounded-2xl rounded-tr-[4.5rem] rounded-br-[4.5rem] overflow-hidden shadow-xl border border-gray-100 group">
            {data.image ? (
              <Image 
                src={getImageUrl(data.image)!} 
                alt={displayTitle}
                fill
                sizes="(max-width: 768px) 100vw, 600px"
                className="object-cover group-hover:scale-105 transition-transform duration-700"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-300">
                <i className="fa-regular fa-image text-6xl"></i>
              </div>
            )}

            {/* Subtle Inner Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20 pointer-events-none"></div>

            {/* Floating Value Badge */}
            <div className="absolute top-4 right-6 bg-primary/95 text-white backdrop-blur-md px-4 py-2 rounded-xl shadow-lg border border-white/20 flex items-center gap-2.5 text-xs font-bold z-10">
              <div className="w-7 h-7 rounded-lg bg-accent-yellow text-primary flex items-center justify-center font-black shrink-0 shadow-sm">
                <i className="fa-solid fa-building-columns"></i>
              </div>
              <div>
                <p className="text-[10px] text-blue-200 uppercase tracking-wider font-semibold leading-none">Bank Sentral</p>
                <p className="text-xs font-extrabold text-white leading-tight">KPw BI Pematangsiantar</p>
              </div>
            </div>
          </div>
          
          <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-yellow-400 rounded-full mix-blend-multiply opacity-20 blur-3xl z-[-1]"></div>
          <div className="absolute -top-8 -right-8 w-40 h-40 bg-primary rounded-full mix-blend-multiply opacity-20 blur-3xl z-[-1]"></div>
        </div>

        {/* Right Side: Text */}
        <div className="flex-1 text-center md:text-left max-w-xl order-1 md:order-2">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 text-primary text-sm font-bold mb-6 border border-blue-100">
            <i className="fa-solid fa-circle-info"></i> {t('about.badge')}
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-6 leading-tight tracking-tight">
            {displayTitle}
          </h2>
          <p className="text-gray-600 text-base md:text-lg leading-relaxed mb-8 text-justify md:text-left">
            {displayContent}
          </p>
          <Link href="/tentang-kami" className="inline-flex items-center justify-center px-8 py-3.5 bg-primary text-white font-bold rounded hover:brightness-110 transition-all border-b-4 border-blue-900 active:border-b-0 active:translate-y-1 gap-2">
            {t('about.readMore')} <i className="fa-solid fa-arrow-right text-sm"></i>
          </Link>
        </div>
      </div>
    </section>
  );
}
