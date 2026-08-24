'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

import { getImageUrl } from '@/lib/api';

interface DokItem {
  id: number;
  nama_kegiatan: string;
  kategori: string;
  deskripsi?: string;
  tanggal_kegiatan: string;
  posted_by: string;
  images: string[];
  video_urls?: string[];
}

function getEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes('youtube.com') || u.hostname.includes('youtu.be')) {
      const vid = u.searchParams.get('v') || u.pathname.split('/').pop();
      return `https://www.youtube.com/embed/${vid}`;
    }
    if (u.hostname.includes('drive.google.com')) {
      const match = u.pathname.match(/\/d\/([^/]+)/);
      if (match) return `https://drive.google.com/file/d/${match[1]}/preview`;
    }
    return url;
  } catch {
    return null;
  }
}

export default function GallerySection() {
  const [items, setItems] = useState<DokItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Selected documentation item for preview modal
  const [selectedItem, setSelectedItem] = useState<DokItem | null>(null);
  const [currentImgIndex, setCurrentImgIndex] = useState<number>(0);

  useEffect(() => {
    // Quick cache check first for instant loading
    if (typeof window !== 'undefined') {
      const cached = sessionStorage.getItem('gallery_landing_cache');
      if (cached) {
        try {
          setItems(JSON.parse(cached));
          setLoading(false);
        } catch (e) {}
      }
    }

    const fetchGallery = async () => {
      try {
        const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
        const res = await fetch(`${API}/dokumentasi?per_page=8`);
        const data = await res.json();
        if (data.status === 'success') {
          const list = data.data?.data || data.data || [];
          setItems(list);
          if (typeof window !== 'undefined') {
            sessionStorage.setItem('gallery_landing_cache', JSON.stringify(list));
          }
        }
      } catch (err) {
        console.error("Failed to fetch gallery:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchGallery();
  }, []);

  const openModal = (item: DokItem) => {
    setSelectedItem(item);
    setCurrentImgIndex(0);
  };

  return (
    <section className="py-12 md:py-16 bg-[#f2f6fa] text-[#0a2540] relative overflow-hidden">
      
      {/* Background Element section.png (100% Opacity) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <img 
          src="/images/element/section.png" 
          alt="Dokumentasi Background Element" 
          className="absolute inset-0 w-full h-full object-cover opacity-100 pointer-events-none z-0"
        />
      </div>

      <div className="max-w-[1400px] mx-auto px-4 md:px-8 relative z-10">
        
        {/* Header Bar - Bright Blue Text & Standout Button */}
        <div className="flex items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-[#003975] tracking-tight drop-shadow-sm">
              Dokumentasi Kegiatan BI Mengajar
            </h2>
            <p className="text-sm text-[#004f9e] mt-1 font-semibold">
              Kumpulan dokumentasi foto & video kegiatan edukasi kebanksentralan.
            </p>
          </div>

          <Link 
            href="/aktivitas"
            className="text-sm font-extrabold text-white bg-[#003975] hover:bg-[#00264d] px-5 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-1.5 shrink-0 border border-blue-400/30"
          >
            Lihat Semua &gt;
          </Link>
        </div>

        {/* Gallery Grid */}
        {loading && items.length === 0 ? (
          <div className="h-44 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
          </div>
        ) : items.length === 0 ? (
          /* Fallback Sample Gallery Items if DB is empty */
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
            {[
              { id: 1, title: 'Sosialisasi QRIS Pasar', kat: 'Sosialisasi', img: 'https://images.unsplash.com/photo-1556742049-0a679246c5a7?auto=format&fit=crop&w=800&q=80' },
              { id: 2, title: 'Seminar CBP Rupiah', kat: 'Seminar', img: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=800&q=80' },
              { id: 3, title: 'Kunjungan Kebanksentralan', kat: 'Kunjungan', img: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80' },
              { id: 4, title: 'Workshop Penukaran Koin', kat: 'Workshop', img: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=800&q=80' },
            ].map((sample) => (
              <div 
                key={sample.id} 
                className="relative h-48 md:h-56 rounded-2xl overflow-hidden shadow-md bg-white/10 group cursor-pointer border border-white/10"
              >
                <img 
                  src={sample.img} 
                  alt={sample.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3">
                  <span className="bg-black/60 text-white text-[10px] font-bold px-2.5 py-1 rounded-md backdrop-blur-sm">
                    {sample.kat}
                  </span>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-90 transition-opacity flex flex-col justify-end p-4">
                  <span className="text-xs font-bold text-white">{sample.title}</span>
                  <span className="text-[10px] text-gray-200">Kegiatan BI Mengajar</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
            {items.slice(0, 4).map((item) => {
              const imgPath = item.images && item.images.length > 0 ? item.images[0] : '';
              const fullImgUrl = getImageUrl(imgPath);
              const imgCount = item.images?.length || 0;
              const videoCount = item.video_urls?.length || 0;

              return (
                <div 
                  key={item.id} 
                  onClick={() => openModal(item)}
                  className="relative h-48 md:h-56 rounded-2xl overflow-hidden shadow-lg bg-white/10 group cursor-pointer border border-white/10"
                >
                  <img 
                    src={fullImgUrl} 
                    alt={item.nama_kegiatan}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => { (e.target as HTMLImageElement).src = '/images/banner/hero1.png'; }}
                  />
                  <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
                    <span className="bg-black/60 text-white text-[10px] font-bold px-2.5 py-1 rounded-md backdrop-blur-sm">
                      {item.kategori || 'Kegiatan'}
                    </span>
                  </div>

                  {imgCount > 1 && (
                    <div className="absolute top-3 right-3 bg-black/60 text-white text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-sm">
                      +{imgCount - 1} foto
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent opacity-90 transition-opacity flex flex-col justify-end p-4">
                    <h4 className="text-xs md:text-sm font-bold text-white line-clamp-1">
                      {item.nama_kegiatan}
                    </h4>
                    <div className="flex items-center justify-between text-[10px] text-gray-300 mt-1">
                      <span>{new Date(item.tanggal_kegiatan).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      {videoCount > 0 && (
                        <span className="text-red-400 font-bold flex items-center gap-1">
                          <i className="fa-brands fa-youtube"></i> Video
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* Lightbox / Preview Modal - Premium Blue Theme */}
      {selectedItem && (
        <div 
          className="fixed inset-0 z-[9999] bg-[#001d3d]/80 backdrop-blur-md flex items-center justify-center p-4 md:p-6 overflow-y-auto"
          onClick={() => setSelectedItem(null)}
        >
          <div 
            className="relative bg-gradient-to-b from-[#003366] via-[#004f9e] to-[#00264d] text-white rounded-3xl overflow-hidden border border-blue-400/30 shadow-[0_25px_60px_rgba(0,0,0,0.4)] w-full max-w-4xl max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-5 md:p-6 border-b border-blue-300/20 flex items-start justify-between bg-[#001d3d]/40 shrink-0">
              <div>
                <span className="text-[11px] font-extrabold text-[#00264d] bg-amber-400 px-3 py-1 rounded-full shadow-sm">
                  {selectedItem.kategori}
                </span>
                <h3 className="text-xl md:text-2xl font-extrabold text-white mt-2 drop-shadow-sm tracking-tight">
                  {selectedItem.nama_kegiatan}
                </h3>
                <p className="text-xs text-blue-200/90 mt-1 font-medium flex items-center gap-1.5">
                  <i className="fa-regular fa-calendar text-amber-400"></i>
                  {new Date(selectedItem.tanggal_kegiatan).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
              
              <button 
                onClick={() => setSelectedItem(null)}
                className="w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-red-500 transition-all duration-300 shrink-0 shadow-sm border border-white/10"
              >
                <i className="fa-solid fa-xmark text-lg"></i>
              </button>
            </div>

            {/* Modal Body */}
            <div className="overflow-y-auto p-5 md:p-6 space-y-6 flex-1">
              
              {/* Photo Carousel Slider */}
              {selectedItem.images && selectedItem.images.length > 0 && (
                <div className="relative bg-[#001833]/80 rounded-2xl overflow-hidden border border-blue-300/20 group flex items-center justify-center min-h-[260px] max-h-[52vh] shadow-inner">
                  <img 
                    src={getImageUrl(selectedItem.images[currentImgIndex])} 
                    alt={`Foto ${currentImgIndex + 1}`}
                    className="max-w-full max-h-[52vh] object-contain mx-auto"
                    onError={(e) => { (e.target as HTMLImageElement).src = '/images/banner/hero1.png'; }}
                  />

                  {/* Previous / Next Arrow Buttons */}
                  {selectedItem.images.length > 1 && (
                    <>
                      <button
                        onClick={() => setCurrentImgIndex((prev) => (prev > 0 ? prev - 1 : selectedItem.images.length - 1))}
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-[#001d3d]/80 text-white flex items-center justify-center hover:bg-amber-400 hover:text-[#00264d] transition-all shadow-lg border border-white/10"
                      >
                        <i className="fa-solid fa-chevron-left text-sm"></i>
                      </button>
                      
                      <button
                        onClick={() => setCurrentImgIndex((prev) => (prev < selectedItem.images.length - 1 ? prev + 1 : 0))}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-[#001d3d]/80 text-white flex items-center justify-center hover:bg-amber-400 hover:text-[#00264d] transition-all shadow-lg border border-white/10"
                      >
                        <i className="fa-solid fa-chevron-right text-sm"></i>
                      </button>

                      <div className="absolute bottom-3 inset-x-0 flex justify-center gap-1.5 z-10">
                        {selectedItem.images.map((_, idx) => (
                          <button
                            key={idx}
                            onClick={() => setCurrentImgIndex(idx)}
                            className={`h-2 rounded-full transition-all ${
                              currentImgIndex === idx ? 'w-6 bg-amber-400' : 'w-2 bg-white/40'
                            }`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Description */}
              {selectedItem.deskripsi && (
                <div className="text-blue-50 text-sm leading-relaxed bg-[#001d3d]/50 p-4 md:p-5 rounded-2xl border border-blue-300/20 shadow-sm font-medium">
                  {selectedItem.deskripsi}
                </div>
              )}

              {/* YouTube / Video Links Below Carousel */}
              {selectedItem.video_urls && selectedItem.video_urls.length > 0 && (
                <div className="space-y-3 pt-2">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <i className="fa-brands fa-youtube text-red-400 text-lg"></i>
                    Video Dokumentasi ({selectedItem.video_urls.length})
                  </h4>

                  <div className="space-y-4">
                    {selectedItem.video_urls.map((url, i) => {
                      const embed = getEmbedUrl(url);
                      return embed ? (
                        <div key={i} className="relative w-full rounded-2xl overflow-hidden border border-blue-300/20 shadow-md bg-black" style={{ paddingTop: '56.25%' }}>
                          <iframe 
                            src={embed} 
                            className="absolute inset-0 w-full h-full" 
                            allowFullScreen 
                            title={`Video ${i+1}`} 
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                          />
                        </div>
                      ) : (
                        <a 
                          key={i} 
                          href={url} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="flex items-center gap-2 text-xs text-blue-200 bg-[#001d3d]/50 p-3 rounded-xl hover:bg-[#001d3d] transition-colors border border-blue-300/20"
                        >
                          <i className="fa-solid fa-link text-amber-400"></i> {url}
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </section>
  );
}
