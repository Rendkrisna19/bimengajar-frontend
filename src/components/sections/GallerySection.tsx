'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

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

  // Prevent background scrolling when modal is active
  useEffect(() => {
    if (selectedItem) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [selectedItem]);

  // ESC key listener to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedItem(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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
    <section className="py-12 md:py-16 bg-primary text-white relative overflow-hidden">
      {/* Background Overlay */}
      <img 
        src="/images/element/1.png" 
        alt="Gallery Background Element" 
        className="absolute inset-0 w-full h-full object-cover opacity-75 mix-blend-overlay pointer-events-none z-0"
      />

      <div className="max-w-[1400px] mx-auto px-4 md:px-8 relative z-10">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight drop-shadow-sm">
              Dokumentasi Kegiatan BI Mengajar
            </h2>
            <p className="text-sm text-blue-100/90 mt-1 font-semibold">
              Kumpulan dokumentasi foto & video kegiatan edukasi kebanksentralan.
            </p>
          </div>

          <Link 
            href="/aktivitas"
            className="bg-accent-yellow text-white hover:brightness-110 font-bold text-sm transition-all py-2.5 px-6 rounded flex items-center gap-2 border-b-4 border-yellow-600 shadow-md shadow-accent-yellow/30 active:border-b-0 active:translate-y-1 shrink-0"
          >
            Lihat Semua <i className="fa-solid fa-arrow-right text-xs"></i>
          </Link>
        </div>

        {/* Gallery Grid */}
        {loading && items.length === 0 ? (
          <div className="h-44 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
          </div>
        ) : items.length === 0 ? (
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
                <div className="absolute inset-x-0 bottom-0 bg-black/75 backdrop-blur-sm p-3.5 flex flex-col justify-end z-10 border-t border-white/10">
                  <span className="text-xs font-bold text-white line-clamp-1">{sample.title}</span>
                  <span className="text-[10px] text-gray-300 mt-0.5">Kegiatan BI Mengajar</span>
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
                  <Image 
                    src={fullImgUrl} 
                    alt={item.nama_kegiatan}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 300px"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap z-10">
                    <span className="bg-black/60 text-white text-[10px] font-bold px-2.5 py-1 rounded-md backdrop-blur-sm">
                      {item.kategori || 'Kegiatan'}
                    </span>
                  </div>

                  {imgCount > 1 && (
                    <div className="absolute top-3 right-3 bg-black/60 text-white text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-sm">
                      +{imgCount - 1} foto
                    </div>
                  )}

                  <div className="absolute inset-x-0 bottom-0 bg-black/75 backdrop-blur-sm p-3.5 flex flex-col justify-end z-10 border-t border-white/10">
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

      {/* Lightbox / Preview Modal - High Z-index & Top Padded to prevent navbar overlay */}
      {selectedItem && (
        <div 
          className="fixed inset-0 z-[999999] bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-4 md:p-6 pt-24 md:pt-28"
          onClick={() => setSelectedItem(null)}
        >
          <div 
            className="relative bg-white text-slate-800 rounded-3xl overflow-hidden border border-slate-100 shadow-[0_25px_60px_rgba(0,0,0,0.3)] w-full max-w-3xl max-h-[82vh] flex flex-col animate-in fade-in zoom-in-95 duration-200 my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 md:p-6 border-b border-slate-100 flex items-start justify-between bg-gradient-to-r from-sky-50/90 via-blue-50/50 to-indigo-50/60 shrink-0 relative z-20">
              <div className="pr-4">
                <span className="text-[11px] font-extrabold text-sky-700 bg-sky-100/90 border border-sky-200/80 px-3 py-1 rounded-full shadow-2xs inline-block">
                  {selectedItem.kategori}
                </span>
                <h3 className="text-lg md:text-2xl font-bold text-slate-800 mt-2 tracking-tight leading-snug">
                  {selectedItem.nama_kegiatan}
                </h3>
                <p className="text-xs text-slate-500 mt-1 font-medium flex items-center gap-1.5">
                  <i className="fa-regular fa-calendar-check text-sky-600"></i>
                  {new Date(selectedItem.tanggal_kegiatan).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
              
              <button 
                onClick={() => setSelectedItem(null)}
                className="w-10 h-10 rounded-full bg-white text-slate-500 hover:text-white hover:bg-red-500 hover:rotate-90 transition-all duration-200 flex items-center justify-center shrink-0 shadow-md border border-slate-200 cursor-pointer text-lg font-bold z-30"
                title="Tutup Modal"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            {/* Modal Body */}
            <div className="overflow-y-auto p-4 md:p-6 space-y-5 flex-1">
              
              {/* Photo Carousel Slider */}
              {selectedItem.images && selectedItem.images.length > 0 && (
                <div className="relative bg-slate-900 rounded-2xl overflow-hidden border border-slate-100 group flex items-center justify-center min-h-[240px] max-h-[44vh] shadow-inner">
                  <img 
                    src={getImageUrl(selectedItem.images[currentImgIndex])} 
                    alt={`Foto ${currentImgIndex + 1}`}
                    className="max-w-full max-h-[44vh] object-contain mx-auto"
                    onError={(e) => { (e.target as HTMLImageElement).src = '/images/banner/hero1.png'; }}
                  />

                  {/* Arrow Buttons */}
                  {selectedItem.images.length > 1 && (
                    <>
                      <button
                        onClick={() => setCurrentImgIndex((prev) => (prev > 0 ? prev - 1 : selectedItem.images.length - 1))}
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 text-slate-800 flex items-center justify-center hover:bg-sky-600 hover:text-white transition-all shadow-md border border-slate-100 cursor-pointer z-10"
                      >
                        <i className="fa-solid fa-chevron-left text-xs"></i>
                      </button>
                      
                      <button
                        onClick={() => setCurrentImgIndex((prev) => (prev < selectedItem.images.length - 1 ? prev + 1 : 0))}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 text-slate-800 flex items-center justify-center hover:bg-sky-600 hover:text-white transition-all shadow-md border border-slate-100 cursor-pointer z-10"
                      >
                        <i className="fa-solid fa-chevron-right text-xs"></i>
                      </button>

                      <div className="absolute bottom-3 inset-x-0 flex justify-center gap-1.5 z-10">
                        {selectedItem.images.map((_, idx) => (
                          <button
                            key={idx}
                            onClick={() => setCurrentImgIndex(idx)}
                            className={`h-2 rounded-full transition-all cursor-pointer ${
                              currentImgIndex === idx ? 'w-6 bg-sky-500' : 'w-2 bg-white/60'
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
                <div className="text-slate-700 text-sm leading-relaxed bg-sky-50/60 p-4 md:p-5 rounded-2xl border border-sky-100 font-normal">
                  {selectedItem.deskripsi}
                </div>
              )}

              {/* Video Documentation */}
              {selectedItem.video_urls && selectedItem.video_urls.length > 0 && (
                <div className="space-y-3 pt-1">
                  <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <i className="fa-brands fa-youtube text-red-500 text-lg"></i>
                    Video Dokumentasi ({selectedItem.video_urls.length})
                  </h4>

                  <div className="space-y-4">
                    {selectedItem.video_urls.map((url, i) => {
                      const embed = getEmbedUrl(url);
                      return embed ? (
                        <div key={i} className="relative w-full rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-black" style={{ paddingTop: '56.25%' }}>
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
                          className="flex items-center gap-2 text-xs text-slate-700 bg-sky-50/60 p-3 rounded-xl hover:bg-sky-100 transition-colors border border-sky-100"
                        >
                          <i className="fa-solid fa-link text-sky-600"></i> {url}
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
