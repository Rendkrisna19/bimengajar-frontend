'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';

interface Ulasan {
  id: number;
  nama: string;
  kategori: string;
  instansi: string;
  komentar: string;
  rating: number;
  created_at?: string;
}

export default function TestimonialSection() {
  const [ulasanList, setUlasanList] = useState<Ulasan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Nanti akan fetch dari /api/ulasan, sementara pakai dummy agar bisa dilihat desainnya
    const fetchUlasan = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/ulasan`);
        const data = await res.json();
        if (data.status === 'success') {
          setUlasanList(Array.isArray(data.data) ? data.data : data.data.data || []);
        }
      } catch (error) {
        console.error('Failed to fetch ulasan', error);
        // Fallback dummy data if API is not ready
        setUlasanList([
          { id: 1, nama: 'I GUSTI AGUNG PUTRA MA...', kategori: 'Pelajar', instansi: 'SMPN 2 DENPASAR', komentar: 'Menurut saya lomba ini sangat seru, mengedukasi, dan melatih kemampuan menghafal saya. saya harap...', rating: 5 },
          { id: 2, nama: 'Steven', kategori: 'Pelajar', instansi: 'SMP', komentar: 'lomba yang menarik', rating: 5 },
          { id: 3, nama: 'Putu Nayla Anggita Cahyani', kategori: 'Pelajar', instansi: 'SMP Negeri 10 Denpasar', komentar: 'Alur lomba yang menarik, materi lengkap', rating: 5 },
          { id: 4, nama: 'Ahmad Faisal', kategori: 'Mahasiswa', instansi: 'Universitas Simalungun', komentar: 'Sangat bermanfaat untuk menambah wawasan kebanksentralan', rating: 5 }
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchUlasan();
  }, []);

  const duplicatedUlasan = ulasanList.length > 0 ? [...ulasanList, ...ulasanList, ...ulasanList, ...ulasanList] : [];

  return (
    <section className="bg-white py-16 md:py-24 relative overflow-hidden">
      {/* Background Texture Element */}
      <div 
        className="absolute inset-0 w-full h-full opacity-[0.03] pointer-events-none mix-blend-multiply bg-repeat"
        style={{ backgroundImage: 'url(/images/element/2.png)', backgroundSize: '400px' }}
      ></div>

      <div className="max-w-[1400px] mx-auto px-4 md:px-8 relative">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 relative z-20 md:mr-[35%] lg:mr-[40%]">
          <div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#1a365d] mb-2">Ulasan</h2>
            <p className="text-gray-500 text-sm md:text-base">Apa kata mereka tentang edukasi BI Mengajar</p>
          </div>
          <Link href="/ulasan" className="mt-4 md:mt-0 text-sm text-gray-500 hover:text-primary transition-colors flex items-center gap-2">
            Lihat Semua &gt;
          </Link>
        </div>

        {/* Content Container */}
        <div className="relative flex items-center min-h-[400px]">
          
          {/* Carousel Track (Left side now, goes behind mascot) */}
          <div className="w-full md:w-[65%] lg:w-[65%] relative z-10 overflow-hidden rounded-r-3xl py-4">
            {loading ? (
               <div className="flex justify-center items-center h-48">
                 <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
               </div>
            ) : ulasanList.length === 0 ? (
               <div className="text-center text-gray-500 py-8">Belum ada ulasan.</div>
            ) : (
              <div 
                className="flex gap-6 animate-marquee hover:[animation-play-state:paused] w-max px-4"
                style={{ animationDuration: '60s' }} // Slower animation
              >
                {duplicatedUlasan.map((ulasan, idx) => (
                  <div 
                    key={`ulasan-${ulasan.id}-${idx}`}
                    className="w-[280px] md:w-[320px] shrink-0 bg-white border border-gray-100 rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:shadow-lg transition-shadow flex flex-col h-[280px] relative overflow-hidden group"
                  >
                    {/* Card Background Texture */}
                    <div 
                      className="absolute inset-0 w-full h-full opacity-[0.03] group-hover:opacity-[0.06] pointer-events-none transition-opacity duration-300"
                      style={{ backgroundImage: 'url(/images/element/2.png)', backgroundSize: '150px' }}
                    ></div>

                    {/* Stars and Date */}
                    <div className="flex justify-between items-start mb-4 relative z-10">
                      <div className="flex gap-1 text-[#fbbf24]">
                        {[...Array(5)].map((_, i) => (
                          <i key={i} className={`fa-solid fa-star ${i < ulasan.rating ? 'text-[#fbbf24]' : 'text-gray-200'}`}></i>
                        ))}
                      </div>
                      {ulasan.created_at && (
                        <span className="text-[11px] font-medium text-gray-400">
                          {new Date(ulasan.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </span>
                      )}
                    </div>
                    
                    {/* Comment */}
                    <p className="text-gray-600 text-sm md:text-base italic mb-6 line-clamp-4 flex-1 relative z-10">
                      "{ulasan.komentar}"
                    </p>
                    
                    {/* Author */}
                    <div className="mt-auto pt-4 border-t border-gray-50 relative z-10">
                      <h4 className="font-bold text-[#1a365d] text-sm md:text-base truncate">{ulasan.nama}</h4>
                      <p className="text-xs text-gray-500 mt-1 truncate">
                        {ulasan.kategori} - {ulasan.instansi}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Mascot Image (Right side, overlaying carousel) */}
          <div className="hidden md:block absolute right-[-5%] lg:right-0 bottom-0 z-20 w-[40%] lg:w-[35%] h-[120%] pointer-events-none flex items-end">
            <div className="relative w-full h-[500px]">
              <Image 
                src="/images/maskot-ulasan.png" 
                alt="Mascot" 
                fill
                className="object-contain object-bottom drop-shadow-2xl"
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
