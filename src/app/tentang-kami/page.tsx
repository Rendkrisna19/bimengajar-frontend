'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';
import gsap from 'gsap';

export default function TentangKamiPage() {
  const [activeTab, setActiveTab] = useState('tentang_bi');
  const [data, setData] = useState<any>({});
  const [loading, setLoading] = useState(true);

  // GSAP Refs
  const headerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const gridsRef = useRef<HTMLDivElement>(null);

  const tabs = [
    { id: 'tentang_bi', label: 'Tentang BI' },
    { id: 'tujuan', label: 'Tujuan' },
    { id: 'visi_misi', label: 'Visi & Misi' },
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

  // GSAP Initial Animations
  useEffect(() => {
    if (headerRef.current) {
      gsap.fromTo(headerRef.current.children, 
        { y: 30, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 1, stagger: 0.2, ease: 'power3.out' }
      );
    }
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

  const currentData = data[activeTab] || {
    title: 'Data belum tersedia',
    content: 'Admin belum mengisi konten untuk bagian ini.',
    image: null
  };

  const statItems = [
    { icon: 'fa-solid fa-building-columns', text: 'Bank Sentral Republik Indonesia' },
    { icon: 'fa-regular fa-calendar', text: 'Berdiri Sejak 1 Juli 1953' },
    { icon: 'fa-solid fa-shield-halved', text: 'Independen dalam Menjalankan Tugas' },
    { icon: 'fa-solid fa-users-viewfinder', text: 'Untuk Stabilitas dan Kesejahteraan Bangsa' },
  ];

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col relative overflow-hidden" style={{ scrollBehavior: 'smooth' }}>
      {/* Overall Background Texture (Grid area) */}
      <div 
        className="fixed inset-0 w-full h-full opacity-[0.05] pointer-events-none z-0 mix-blend-multiply bg-repeat"
        style={{ backgroundImage: 'url(/images/element/2.png)', backgroundSize: '400px' }}
      ></div>

      <Navbar />
      
      {/* Header Section with Navy Background */}
      <div className="bg-primary text-white pt-32 pb-40 px-4 md:px-8 relative overflow-hidden" ref={headerRef}>
        {/* Header Background Element 1.png */}
        <div 
          className="absolute inset-0 w-full h-full opacity-10 pointer-events-none mix-blend-overlay"
          style={{ backgroundImage: 'url(/images/element/1.png)', backgroundSize: 'cover', backgroundPosition: 'center' }}
        ></div>

        <div className="relative z-10">
          <h1 className="text-3xl md:text-5xl font-extrabold text-center mb-10 drop-shadow-md">Tentang Kami</h1>

          {/* Tabs */}
          <div className="flex justify-center max-w-[1200px] mx-auto gap-2">
            {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 max-w-[220px] text-center py-3 px-4 font-bold text-sm md:text-base border-b-4 transition-all duration-300 rounded-t-xl ${
                activeTab === tab.id
                  ? 'border-[#fbbf24] text-[#fbbf24] bg-white/20'
                  : 'border-white/20 text-white/90 bg-white/10 hover:text-white hover:bg-white/20'
              }`}
            >
              {tab.label}
            </button>
          ))}
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto w-full px-4 md:px-8 -mt-24 relative z-10 pb-20 flex-1">
        {/* Content Area */}
        <div ref={contentRef} className="bg-white/90 backdrop-blur-md rounded-3xl p-6 md:p-10 shadow-2xl border border-white flex flex-col md:flex-row gap-8 md:gap-12 min-h-[400px]">
          {loading ? (
            <div className="w-full h-full flex items-center justify-center min-h-[300px]">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              {/* Image Left */}
              <div className="w-full md:w-1/2 relative h-[250px] md:h-[400px] rounded-2xl overflow-hidden bg-gray-100 border border-gray-100 flex shrink-0 shadow-inner group">
                {currentData.image ? (
                  <img 
                    src={currentData.image} 
                    alt={currentData.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 flex-col gap-3">
                    <i className="fa-regular fa-image text-4xl"></i>
                    <p className="text-sm">Tidak ada gambar</p>
                  </div>
                )}
              </div>

              {/* Text Right */}
              <div className="w-full md:w-1/2 flex flex-col justify-center">
                <h2 className="text-3xl font-extrabold text-[#1a365d] mb-6">{currentData.title}</h2>
                <div 
                  className="text-gray-600 leading-relaxed space-y-4 mb-8 whitespace-pre-line text-lg"
                >
                  {currentData.content}
                </div>
                
                <div className="mt-auto">
                  <a 
                    href="https://www.bi.go.id" 
                    target="_blank" 
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 bg-[#fbbf24] text-white hover:bg-yellow-500 font-bold px-8 py-3.5 rounded-xl shadow-[0_4px_14px_rgba(251,191,36,0.3)] hover:shadow-[0_10px_20px_rgba(251,191,36,0.4)] hover:-translate-y-1 transition-all duration-300 text-sm"
                  >
                    Selengkapnya <i className="fa-solid fa-arrow-right"></i>
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
              className="relative overflow-hidden group bg-white border border-gray-100 rounded-3xl p-8 flex flex-col items-center justify-center text-center hover:bg-primary transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,51,102,0.2)] cursor-default"
            >
              {/* Background Element 1.png for each grid item, visible only on hover */}
              <div 
                className="absolute inset-0 w-full h-full opacity-0 group-hover:opacity-20 transition-opacity duration-500 pointer-events-none mix-blend-overlay"
                style={{ backgroundImage: 'url(/images/element/1.png)', backgroundSize: 'cover', backgroundPosition: 'center' }}
              ></div>
              
              <div className="relative z-10 w-20 h-20 rounded-2xl bg-blue-50 group-hover:bg-white/20 flex items-center justify-center mb-6 transition-colors duration-500 shadow-sm group-hover:shadow-none">
                <i className={`${item.icon} text-3xl text-primary group-hover:text-white transition-colors duration-500`}></i>
              </div>
              <p className="font-extrabold text-[#1a365d] group-hover:text-white transition-colors duration-500 text-base leading-snug relative z-10">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </main>
  );
}
