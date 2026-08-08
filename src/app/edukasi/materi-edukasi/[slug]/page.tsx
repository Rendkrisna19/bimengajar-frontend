'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import axios from '@/lib/axios';
import { MateriEdukasi } from '@/app/admin/materi-edukasi/types';
import Swal from 'sweetalert2';
import FloatingAction from '@/components/ui/FloatingAction';

const getYouTubeVideoId = (url: string) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

// Hook for Table of Contents
function useHeadings(contentHtml: string) {
  const [headings, setHeadings] = useState<{ id: string; text: string; level: number }[]>([]);

  useEffect(() => {
    if (!contentHtml) return;
    // Create a temporary div to parse HTML
    const div = document.createElement('div');
    div.innerHTML = contentHtml;
    const elements = Array.from(div.querySelectorAll('h1, h2, h3'));
    
    const parsedHeadings = elements.map((elem, index) => {
      // Add id if missing to allow scrolling
      if (!elem.id) {
        elem.id = `heading-${index}`;
      }
      return {
        id: elem.id,
        text: elem.textContent || '',
        level: parseInt(elem.tagName.replace('H', '')),
      };
    });
    setHeadings(parsedHeadings);
  }, [contentHtml]);

  return headings;
}

export default function MateriEdukasiDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [materi, setMateri] = useState<MateriEdukasi | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Content state for TOC processing
  const [processedContent, setProcessedContent] = useState('');
  const headings = useHeadings(processedContent);

  useEffect(() => {
    const fetchMateri = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`/materi-edukasi/${params.slug}`);
        const data = res.data.data;
        setMateri(data);

        // Process HTML to add IDs to headings for TOC
        if (data.konten_teks) {
          const div = document.createElement('div');
          div.innerHTML = data.konten_teks;
          const elements = Array.from(div.querySelectorAll('h1, h2, h3'));
          elements.forEach((elem, index) => {
            if (!elem.id) elem.id = `heading-${index}`;
          });
          setProcessedContent(div.innerHTML);
        }

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (params.slug) {
      fetchMateri();
    }
  }, [params.slug]);

  const [activeHeadingId, setActiveHeadingId] = useState<string>('');

  useEffect(() => {
    if (headings.length === 0) return;
    
    const handleScroll = () => {
      const headingElements = headings
        .map((h) => document.getElementById(h.id))
        .filter(Boolean) as HTMLElement[];

      let currentActiveId = '';
      for (const elem of headingElements) {
        const rect = elem.getBoundingClientRect();
        if (rect.top <= 140) {
          currentActiveId = elem.id;
        }
      }

      if (currentActiveId) {
        setActiveHeadingId(currentActiveId);
      } else if (headings.length > 0) {
        setActiveHeadingId(headings[0].id);
      }
    };

    window.addEventListener('scroll', handleScroll);
    setTimeout(handleScroll, 100);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [headings]);

  const handleShare = (platform: string) => {
    const url = window.location.href;
    const text = materi ? `Baca materi edukasi: ${materi.judul}` : '';
    
    let shareUrl = '';
    switch (platform) {
      case 'whatsapp': shareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text + ' ' + url)}`; break;
      case 'facebook': shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`; break;
      case 'telegram': shareUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`; break;
      case 'linkedin': shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`; break;
      case 'twitter': shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`; break;
      case 'copy':
        navigator.clipboard.writeText(url);
        Swal.fire({ title: 'Tersalin!', text: 'Link berhasil disalin ke clipboard.', icon: 'success', timer: 1500, showConfirmButton: false });
        return;
    }
    
    if (shareUrl) window.open(shareUrl, '_blank');
  };

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f0f4f8] flex flex-col font-sans">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center pt-32 pb-20">
          <i className="fa-solid fa-circle-notch animate-spin text-4xl text-[#003366] mb-4"></i>
          <p className="text-gray-500 font-medium">Memuat materi...</p>
        </div>
        <Footer />
      </main>
    );
  }

  if (!materi) {
    return (
      <main className="min-h-screen bg-[#f0f4f8] flex flex-col font-sans">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center pt-32 pb-20 text-center px-4">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm">
            <i className="fa-solid fa-file-circle-xmark text-3xl text-gray-400"></i>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Materi Tidak Ditemukan</h1>
          <p className="text-gray-500 mb-6">Maaf, materi yang Anda cari mungkin telah dihapus atau URL tidak valid.</p>
          <button onClick={() => router.push('/edukasi/materi-edukasi')} className="px-6 py-2 bg-[#003366] text-white rounded-full font-semibold hover:bg-blue-900 transition-colors">
            Kembali ke Daftar Materi
          </button>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f4f7f9] flex flex-col font-sans text-gray-800 relative overflow-hidden">
      <Navbar />

      {/* Decorative Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {/* Soft glowing blur blobs */}
        <div className="absolute top-[10%] -left-20 w-96 h-96 bg-[#003366]/5 rounded-full blur-[100px]"></div>
        <div className="absolute top-[50%] -right-20 w-[450px] h-[450px] bg-blue-100/10 rounded-full blur-[120px]"></div>
        
        {/* Repeating Motif Accent (Watermark Pattern) */}
        <div 
          className="absolute inset-0 w-full h-full opacity-[0.05] bg-repeat"
          style={{ backgroundImage: 'url(/images/element/2.png)', backgroundSize: '360px' }}
        ></div>

      </div>

      <section className="pt-32 pb-16 px-4 md:px-8 flex-1 relative z-10">
        <div className="max-w-[1200px] mx-auto flex flex-col lg:flex-row gap-8">
          
          {/* KIRI: Konten Utama */}
          <article className="flex-1 bg-white rounded-[24px] p-6 md:p-10 shadow-sm border border-gray-100 overflow-hidden">
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-6 leading-tight">
              {materi.judul}
            </h1>
            
            {/* Thumbnail Banner Slider */}
            {(() => {
              const allImages = [];
              if (materi.thumbnail) allImages.push(materi.thumbnail);
              if (materi.images && materi.images.length > 0) allImages.push(...materi.images);
              
              if (allImages.length === 0) return null;

              return (
                <div className="w-full mb-8 relative group">
                  <div className="relative w-full h-[300px] md:h-[480px] rounded-2xl overflow-hidden shadow-md border border-gray-100 bg-gray-50">
                    {/* Slides */}
                    <div 
                      className="flex h-full transition-transform duration-500 ease-out"
                      style={{ transform: `translateX(-${(activeImageIndex * 100) / allImages.length}%)`, width: `${allImages.length * 100}%` }}
                    >
                      {allImages.map((img, idx) => (
                        <div key={idx} className="relative h-full select-none" style={{ width: `${100 / allImages.length}%` }}>
                          <Image 
                            src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/storage/${img}`} 
                            alt={`${materi.judul} - Slide ${idx + 1}`} 
                            fill 
                            sizes="(max-width: 768px) 100vw, 800px"
                            className="object-cover cursor-pointer"
                            onClick={() => window.open(`${process.env.NEXT_PUBLIC_BACKEND_URL}/storage/${img}`, '_blank')}
                            priority={idx === 0}
                          />
                        </div>
                      ))}
                    </div>

                    {/* Navigation Arrows */}
                    {allImages.length > 1 && (
                      <>
                        <button 
                          onClick={() => setActiveImageIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1))}
                          className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/80 backdrop-blur-sm border border-gray-200/50 flex items-center justify-center text-gray-800 hover:bg-white hover:text-primary hover:scale-105 active:scale-95 transition-all shadow-md z-30 cursor-pointer"
                        >
                          <i className="fa-solid fa-chevron-left text-sm"></i>
                        </button>
                        <button 
                          onClick={() => setActiveImageIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1))}
                          className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/80 backdrop-blur-sm border border-gray-200/50 flex items-center justify-center text-gray-800 hover:bg-white hover:text-primary hover:scale-105 active:scale-95 transition-all shadow-md z-30 cursor-pointer"
                        >
                          <i className="fa-solid fa-chevron-right text-sm"></i>
                        </button>

                        {/* Dots Indicator */}
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-30 bg-black/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                          {allImages.map((_, idx) => (
                            <button
                              key={idx}
                              onClick={() => setActiveImageIndex(idx)}
                              className={`w-2 h-2 rounded-full transition-all cursor-pointer ${idx === activeImageIndex ? 'bg-white w-4' : 'bg-white/50'}`}
                            ></button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* Konten Teks HTML */}
            {processedContent && (
              <div 
                className="prose prose-lg max-w-none prose-blue prose-headings:text-gray-900 prose-p:text-gray-600 prose-img:rounded-xl mb-12 text-[15px] md:text-base leading-relaxed"
                dangerouslySetInnerHTML={{ __html: processedContent }}
              ></div>
            )}
            
            {/* Konten Teks Fallback jika tidak pakai Rich Text */}
            {!processedContent && materi.deskripsi_singkat && (
              <p className="text-gray-600 leading-relaxed mb-12 text-lg">
                {materi.deskripsi_singkat}
              </p>
            )}

            {/* Video Youtube Paling Bawah (Grid 3 Kolom) */}
            {materi.link_youtube && materi.link_youtube.length > 0 && (
              <div className="mt-12 pt-8 border-t border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <i className="fa-brands fa-youtube text-red-600"></i> Video Terkait
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {materi.link_youtube.map((link, idx) => {
                    const videoId = getYouTubeVideoId(link);
                    if (videoId) {
                      return (
                        <div key={idx} className="w-full aspect-video rounded-xl overflow-hidden shadow-md bg-black">
                          <iframe
                            width="100%"
                            height="100%"
                            src={`https://www.youtube.com/embed/${videoId}`}
                            title={`YouTube video player ${idx}`}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          ></iframe>
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
              </div>
            )}

            {/* Lampiran File / Drive */}
            {((materi.link_drive && materi.link_drive.length > 0) || materi.file_path || materi.link_eksternal) && (
              <div className="mt-8 pt-8 border-t border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <i className="fa-solid fa-paperclip text-gray-500"></i> Lampiran & Tautan Lainnya
                </h3>
                <div className="flex flex-wrap gap-3">
                  {materi.file_path && (
                    <a href={`${process.env.NEXT_PUBLIC_BACKEND_URL}/storage/${materi.file_path}`} target="_blank" rel="noopener noreferrer" className="px-4 py-2.5 rounded-lg border border-gray-200 hover:border-[#003366] hover:bg-blue-50 text-gray-700 hover:text-[#003366] font-semibold text-sm transition-all flex items-center gap-2">
                      <i className="fa-solid fa-file-arrow-down"></i> Unduh Berkas
                    </a>
                  )}
                  {materi.link_eksternal && (
                    <a href={materi.link_eksternal} target="_blank" rel="noopener noreferrer" className="px-4 py-2.5 rounded-lg border border-gray-200 hover:border-[#003366] hover:bg-blue-50 text-gray-700 hover:text-[#003366] font-semibold text-sm transition-all flex items-center gap-2">
                      <i className="fa-solid fa-arrow-up-right-from-square"></i> Link Eksternal
                    </a>
                  )}
                  {materi.link_drive?.map((link, idx) => (
                    <a key={idx} href={link} target="_blank" rel="noopener noreferrer" className="px-4 py-2.5 rounded-lg border border-gray-200 hover:border-green-600 hover:bg-green-50 text-gray-700 hover:text-green-600 font-semibold text-sm transition-all flex items-center gap-2">
                      <i className="fa-brands fa-google-drive"></i> Akses G-Drive
                    </a>
                  ))}
                </div>
              </div>
            )}
          </article>

          {/* KANAN: Sidebar */}
          <aside className="w-full lg:w-[320px] shrink-0 space-y-6">
            
            {/* Widget Konten Artikel */}
            {headings.length > 0 && (
              <div className="bg-white rounded-[20px] p-6 shadow-sm border border-gray-100 sticky top-32">
                <h3 className="text-[17px] font-extrabold text-gray-900 mb-4">
                  Konten Artikel
                </h3>
                <div className="relative pl-0 py-1">
                  {/* Continuous thin vertical line track */}
                  <div className="absolute left-[3px] top-0 bottom-0 w-[1.5px] bg-gray-100 rounded-full"></div>
                  
                  <div className="space-y-3.5 relative z-10">
                    {headings.map((heading, idx) => {
                      const isActive = heading.id === activeHeadingId;
                      return (
                        <button 
                          key={idx}
                          onClick={() => scrollToHeading(heading.id)}
                          className={`block text-left text-[13.5px] leading-snug hover:text-[#003366] transition-all relative pl-5 py-0.5 border-l-2 -ml-[1px] ${
                            isActive 
                              ? 'font-bold text-[#003366] border-[#003366]' 
                              : 'font-medium text-gray-400 border-transparent hover:text-gray-700'
                          } ${heading.level === 2 ? 'pl-7' : heading.level === 3 ? 'pl-9' : ''}`}
                        >
                          {heading.text}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Widget Bagikan Artikel */}
            <div className="bg-white rounded-[20px] p-6 shadow-sm border border-gray-100">
              <h3 className="text-[17px] font-extrabold text-gray-900 mb-4">
                Bagikan Artikel
              </h3>
              <div className="flex flex-wrap gap-2.5">
                <button onClick={() => handleShare('whatsapp')} className="w-10 h-10 rounded-full bg-[#25D366] text-white flex items-center justify-center hover:scale-110 transition-transform shadow-sm">
                  <i className="fa-brands fa-whatsapp text-lg"></i>
                </button>
                <button onClick={() => handleShare('facebook')} className="w-10 h-10 rounded-full bg-[#1877F2] text-white flex items-center justify-center hover:scale-110 transition-transform shadow-sm">
                  <i className="fa-brands fa-facebook-f text-lg"></i>
                </button>
                <button onClick={() => handleShare('telegram')} className="w-10 h-10 rounded-full bg-[#229ED9] text-white flex items-center justify-center hover:scale-110 transition-transform shadow-sm">
                  <i className="fa-brands fa-telegram text-lg"></i>
                </button>
                <button onClick={() => handleShare('linkedin')} className="w-10 h-10 rounded-full bg-[#0A66C2] text-white flex items-center justify-center hover:scale-110 transition-transform shadow-sm">
                  <i className="fa-brands fa-linkedin-in text-lg"></i>
                </button>
                <button onClick={() => handleShare('twitter')} className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center hover:scale-110 transition-transform shadow-sm">
                  <i className="fa-brands fa-x-twitter text-lg"></i>
                </button>
                <button onClick={() => handleShare('copy')} className="w-10 h-10 rounded-full bg-gray-500 text-white flex items-center justify-center hover:scale-110 transition-transform shadow-sm">
                  <i className="fa-solid fa-link text-lg"></i>
                </button>
              </div>
            </div>

          </aside>

        </div>
      </section>
      
      <FloatingAction />
      <Footer />
    </main>
  );
}
