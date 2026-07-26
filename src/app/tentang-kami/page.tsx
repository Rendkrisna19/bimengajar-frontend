'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';

export default function TentangKamiPage() {
  const [activeTab, setActiveTab] = useState('tentang_bi');
  const [data, setData] = useState<any>({});
  const [loading, setLoading] = useState(true);

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
    <main className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      
      {/* Header Section with Navy Background */}
      <div className="bg-primary text-white pt-32 pb-40 px-4 md:px-8">
        <h1 className="text-3xl md:text-5xl font-extrabold text-center mb-10 drop-shadow-md">Tentang Kami</h1>

        {/* Tabs */}
        <div className="flex justify-center max-w-[1200px] mx-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 max-w-[220px] text-center py-3 px-4 font-bold text-sm md:text-base border-b-4 transition-all duration-300 rounded-t-xl ${
                activeTab === tab.id
                  ? 'border-white text-white'
                  : 'border-transparent text-white hover:bg-white/20'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto w-full px-4 md:px-8 -mt-24 relative z-10 pb-20 flex-1">
        {/* Content Area */}
        <div className="bg-white rounded-2xl p-6 md:p-10 shadow-2xl border border-gray-100 flex flex-col md:flex-row gap-8 md:gap-12 min-h-[400px]">
          {loading ? (
            <div className="w-full h-full flex items-center justify-center min-h-[300px]">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              {/* Image Left */}
              <div className="w-full md:w-1/2 relative h-[250px] md:h-auto rounded-xl overflow-hidden bg-gray-100 border border-gray-200 flex shrink-0">
                {currentData.image ? (
                  <img 
                    src={currentData.image} 
                    alt={currentData.title} 
                    className="w-full h-full object-cover" 
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
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{currentData.title}</h2>
                <div 
                  className="text-gray-600 leading-relaxed space-y-4 mb-8 whitespace-pre-line"
                >
                  {currentData.content}
                </div>
                
                <div className="mt-auto">
                  <a 
                    href="https://www.bi.go.id" 
                    target="_blank" 
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 bg-primary text-white hover:bg-blue-800 font-bold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-sm"
                  >
                    Selengkapnya <i className="fa-solid fa-arrow-right"></i>
                  </a>
                </div>
              </div>
            </>
          )}
        </div>

        {/* 4 Grids Statistics/Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mt-12">
          {statItems.map((item, idx) => (
            <div 
              key={idx} 
              className="group bg-white border border-gray-200 rounded-2xl p-6 flex flex-col items-center justify-center text-center hover:bg-primary transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,51,102,0.2)] cursor-default"
            >
              <div className="w-16 h-16 rounded-full bg-blue-50 group-hover:bg-white/20 flex items-center justify-center mb-4 transition-colors duration-300">
                <i className={`${item.icon} text-2xl text-primary group-hover:text-white transition-colors duration-300`}></i>
              </div>
              <p className="font-extrabold text-gray-800 group-hover:text-white transition-colors duration-300 text-sm leading-snug">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </main>
  );
}
