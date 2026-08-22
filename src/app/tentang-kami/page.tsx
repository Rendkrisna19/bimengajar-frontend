'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';
import gsap from 'gsap';
import PageHeader from '@/components/ui/PageHeader';
import { useLanguage } from '@/contexts/LanguageContext';

export default function TentangKamiPage() {
  const { t, lang } = useLanguage();
  const [activeTab, setActiveTab] = useState('tentang_bi');
  const [data, setData] = useState<any>({});
  const [loading, setLoading] = useState(true);

  // GSAP Refs
  const contentRef = useRef<HTMLDivElement>(null);
  const gridsRef = useRef<HTMLDivElement>(null);

  const tabs = [
    { id: 'tentang_bi', label: t('about.tab.tentang_bi') },
    { id: 'tujuan', label: t('about.tab.tujuan') },
    { id: 'visi_misi', label: t('about.tab.visi_misi') },
  ];

  useEffect(() => {
    const fetchAbouts = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/abouts`);
        const result = await res.json();
        if (result.status === 'success') {
          setData(result.data);
        }
      } catch (error) {
        console.error('Failed to fetch about data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAbouts();
  }, []);

  useEffect(() => {
    if (!loading) {
      if (contentRef.current) {
        gsap.fromTo(contentRef.current,
          { y: 50, opacity: 0 },
          { y: 0, opacity: 1, duration: 1, ease: 'power3.out' }
        );
      }
      
      if (gridsRef.current) {
        gsap.fromTo(gridsRef.current.children,
          { y: 40, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8, stagger: 0.15, ease: 'power3.out', delay: 0.3 }
        );
      }
    }
  }, [loading, activeTab]);

  const rawData = data[activeTab] || {
    title: t('about.noDataTitle'),
    content: t('about.noDataContent'),
    image: null
  };

  // Baca title_en & content_en dari DB jika lang === 'EN'
  const displayTitle = (lang === 'EN' && rawData.title_en) ? rawData.title_en : rawData.title;
  const displayContent = (lang === 'EN' && rawData.content_en) ? rawData.content_en : rawData.content;

  const statItems = [
    { icon: 'fa-solid fa-building-columns', text: t('about.stat1') },
    { icon: 'fa-regular fa-calendar', text: t('about.stat2') },
    { icon: 'fa-solid fa-shield-halved', text: t('about.stat3') },
    { icon: 'fa-solid fa-users-viewfinder', text: t('about.stat4') },
  ];

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col relative overflow-hidden" style={{ scrollBehavior: 'smooth' }}>
      {/* Overall Background Texture 2.png */}
      <img 
        src="/images/element/7.png" 
        alt="Tentang Kami Page Background Element" 
        className="fixed inset-0 w-full h-full object-cover opacity-75 pointer-events-none z-0"
      />

      <Navbar />
      
      {/* Header Section with PageHeader */}
      <PageHeader
        title={t('about.badge')}
        breadcrumbs={[
          { label: t('nav.home'), href: '/' },
          { label: t('about.badge') }
        ]}
      >
        {/* Tabs */}
        <div className="flex justify-center max-w-[1200px] mx-auto gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 max-w-[220px] text-center py-3 px-4 font-bold text-sm md:text-base border-b-4 transition-all duration-300 rounded-t-xl cursor-pointer ${
                activeTab === tab.id
                  ? 'border-accent-yellow text-white bg-accent-red'
                  : 'border-white/20 text-white/90 bg-white/10 hover:text-white hover:bg-white/20'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </PageHeader>

      <div className="max-w-[1200px] mx-auto w-full px-4 md:px-8 -mt-24 relative z-10 pb-20 flex-1">
        {/* Content Area */}
        <div ref={contentRef} className="bg-white/95 backdrop-blur-md rounded-3xl p-6 md:p-10 shadow-2xl border border-white flex flex-col md:flex-row items-center gap-8 md:gap-12 min-h-[420px]">
          {loading ? (
            <div className="w-full h-full flex items-center justify-center min-h-[300px]">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              {/* Image Left - Asymmetrical Curved Cut Corner with Floating Value Badge */}
              <div className="w-full md:w-1/2 relative h-[280px] md:h-[380px] rounded-2xl rounded-tr-[4.5rem] rounded-br-[4.5rem] overflow-hidden bg-gray-100 border border-gray-100 flex shrink-0 shadow-xl group my-auto">
                {rawData.image ? (
                  <img 
                    src={rawData.image} 
                    alt={displayTitle} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 flex-col gap-3">
                    <i className="fa-regular fa-image text-4xl"></i>
                    <p className="text-sm">{t('about.noImage')}</p>
                  </div>
                )}

                {/* Subtle Inner Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20 pointer-events-none"></div>

                {/* Floating Value Badge (Top Right as in Reference Image) */}
                <div className="absolute top-4 right-6 bg-primary/95 text-white backdrop-blur-md px-4 py-2 rounded-xl shadow-lg border border-white/20 flex items-center gap-2.5 text-xs md:text-sm font-bold z-10">
                  <div className="w-7 h-7 rounded-lg bg-accent-yellow text-primary flex items-center justify-center font-black shrink-0 shadow-sm">
                    <i className="fa-solid fa-award"></i>
                  </div>
                  <div>
                    <p className="text-[10px] text-blue-200 uppercase tracking-wider font-semibold leading-none">Bank Sentral</p>
                    <p className="text-xs md:text-sm font-extrabold text-white leading-tight">KPw BI Pematangsiantar</p>
                  </div>
                </div>
              </div>

              {/* Text Right */}
              <div className="w-full md:w-1/2 flex flex-col justify-center">
                <h2 className="text-3xl font-extrabold text-[#1a365d] mb-6">{displayTitle}</h2>
                <div 
                  className="text-gray-600 leading-relaxed space-y-4 mb-8 whitespace-pre-line text-lg"
                >
                  {displayContent}
                </div>
                
                <div className="mt-auto">
                  <a 
                    href="https://www.bi.go.id" 
                    target="_blank" 
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-2 bg-accent-yellow text-primary hover:brightness-110 font-bold px-8 py-3.5 rounded transition-all duration-300 text-sm border-b-4 border-yellow-600 active:border-b-0 active:translate-y-1"
                  >
                    {t('about.readMore')} <i className="fa-solid fa-arrow-right"></i>
                  </a>
                </div>
              </div>
            </>
          )}
        </div>

        {/* 4 Grids Statistics/Info */}
        <div ref={gridsRef} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mt-12">
          {statItems.map((item, idx) => (
            <div 
              key={idx} 
              className="relative overflow-hidden group bg-accent-red border border-accent-red-dark rounded-3xl p-8 flex flex-col items-center justify-center text-center hover:bg-primary transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,51,102,0.2)] cursor-default"
            >
              {/* Background Element 1.png for each grid item, visible only on hover */}
              <div 
                className="absolute inset-0 w-full h-full opacity-0 group-hover:opacity-20 transition-opacity duration-500 pointer-events-none mix-blend-overlay"
                style={{ backgroundImage: 'url(/images/element/1.png)', backgroundSize: 'cover', backgroundPosition: 'center' }}
              ></div>
              
              <div className="relative z-10 w-20 h-20 rounded-2xl bg-white/20 group-hover:bg-white/30 flex items-center justify-center mb-6 transition-colors duration-500 shadow-sm group-hover:shadow-none">
                <i className={`${item.icon} text-3xl text-white transition-colors duration-500`}></i>
              </div>
              <p className="font-extrabold text-white transition-colors duration-500 text-base leading-snug relative z-10">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </main>
  );
}
