'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

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

  const getImageUrl = (path: string) => {
    if (!path) return '/images/banner/hero1.png';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:8000';
    return `${baseUrl}/storage${cleanPath}`;
  };

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
      
      {/* Background Texture Overlay */}
      <div 
        className="absolute inset-0 w-full h-full opacity-10 mix-blend-overlay bg-no-repeat bg-center bg-cover pointer-events-none z-0"
        style={{ backgroundImage: 'url(/images/element/1.png)' }}
      ></div>

      <div className="max-w-[1400px] mx-auto px-4 md:px-8 relative z-10">
        
        {/* Simple Clean Header Bar */}
        <div className="flex items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Dokumentasi Kegiatan BI Mengajar
            </h2>
            <p className="text-sm text-blue-100/80 mt-1 font-medium">
              Kumpulan dokumentasi foto & video kegiatan edukasi kebanksentralan.
            </p>
          </div>

          <Link 
            href="/aktivitas"
            className="text-sm font-semibold text-white hover:underline flex items-center gap-1 shrink-0"
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
            {[1, 2, 3, 4].map((idx) => (
              <div 
                key={idx} 
                className="relative h-48 md:h-56 rounded-2xl overflow-hidden shadow-md bg-white/10 group cursor-pointer"
              >
                <img 
                  src={`/images/banner/hero${idx > 3 ? 1 : idx}.png`} 
                  alt="Dokumentasi BI Mengajar"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-90 transition-opacity flex flex-col justify-end p-4">
                  <span className="text-xs font-bold text-white">Sosialisasi QRIS</span>
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

      {/* Lightbox / Preview Modal (Full Screen Overlay z-[9999] with backdrop blur) */}
      {selectedItem && (
        <div 
          className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 md:p-6 overflow-y-auto"
          onClick={() => setSelectedItem(null)}
        >
          <div 
            className="relative bg-gray-900 rounded-3xl overflow-hidden border border-white/20 shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-5 border-b border-white/10 flex items-start justify-between bg-black/40 shrink-0">
              <div>
                <span className="text-[11px] font-bold text-blue-400 bg-blue-500/20 px-2.5 py-1 rounded-full border border-blue-400/30">
                  {selectedItem.kategori}
                </span>
                <h3 className="text-lg md:text-xl font-bold text-white mt-2">
                  {selectedItem.nama_kegiatan}
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  <i className="fa-regular fa-calendar mr-1"></i>
                  {new Date(selectedItem.tanggal_kegiatan).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
              
              <button 
                onClick={() => setSelectedItem(null)}
                className="w-9 h-9 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-red-600 transition-colors shrink-0"
              >
                <i className="fa-solid fa-times text-sm"></i>
              </button>
            </div>

            {/* Modal Body (Scrollable if videos present) */}
            <div className="overflow-y-auto p-5 md:p-6 space-y-6 flex-1">
              
              {/* Photo Carousel Slider */}
              {selectedItem.images && selectedItem.images.length > 0 && (
                <div className="relative bg-black rounded-2xl overflow-hidden group flex items-center justify-center min-h-[250px] max-h-[50vh]">
                  <img 
                    src={getImageUrl(selectedItem.images[currentImgIndex])} 
                    alt={`Foto ${currentImgIndex + 1}`}
                    className="max-w-full max-h-[50vh] object-contain mx-auto"
                    onError={(e) => { (e.target as HTMLImageElement).src = '/images/banner/hero1.png'; }}
                  />

                  {/* Previous / Next Arrow Buttons for Multi-photo */}
                  {selectedItem.images.length > 1 && (
                    <>
                      <button
                        onClick={() => setCurrentImgIndex((prev) => (prev > 0 ? prev - 1 : selectedItem.images.length - 1))}
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-white hover:text-black transition-all shadow-lg"
                      >
                        <i className="fa-solid fa-chevron-left text-sm"></i>
                      </button>
                      
                      <button
                        onClick={() => setCurrentImgIndex((prev) => (prev < selectedItem.images.length - 1 ? prev + 1 : 0))}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-white hover:text-black transition-all shadow-lg"
                      >
                        <i className="fa-solid fa-chevron-right text-sm"></i>
                      </button>

                      <div className="absolute bottom-3 inset-x-0 flex justify-center gap-1.5 z-10">
                        {selectedItem.images.map((_, idx) => (
                          <button
                            key={idx}
                            onClick={() => setCurrentImgIndex(idx)}
                            className={`h-2 rounded-full transition-all ${
                              currentImgIndex === idx ? 'w-6 bg-blue-500' : 'w-2 bg-white/50'
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
                <div className="text-gray-300 text-sm leading-relaxed bg-white/5 p-4 rounded-2xl border border-white/10">
                  {selectedItem.deskripsi}
                </div>
              )}

              {/* YouTube / Video Links Below Carousel */}
              {selectedItem.video_urls && selectedItem.video_urls.length > 0 && (
                <div className="space-y-3 pt-2">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <i className="fa-brands fa-youtube text-red-500 text-base"></i>
                    Video Dokumentasi ({selectedItem.video_urls.length})
                  </h4>

                  <div className="space-y-4">
                    {selectedItem.video_urls.map((url, i) => {
                      const embed = getEmbedUrl(url);
                      return embed ? (
                        <div key={i} className="relative w-full rounded-2xl overflow-hidden border border-white/15 shadow-md bg-black" style={{ paddingTop: '56.25%' }}>
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
                          className="flex items-center gap-2 text-xs text-blue-400 bg-white/5 p-3 rounded-xl hover:bg-white/10 transition-colors"
                        >
                          <i className="fa-solid fa-link"></i> {url}
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
