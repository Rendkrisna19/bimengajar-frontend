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
import { getImageUrl } from '@/lib/api';

const getYouTubeVideoId = (url: string) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

interface HeadingItem {
  id: string;
  text: string;
  level: number;
}

export default function MateriEdukasiDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [materi, setMateri] = useState<MateriEdukasi | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const [processedContent, setProcessedContent] = useState('');
  const [headings, setHeadings] = useState<HeadingItem[]>([]);
  const [activeHeadingId, setActiveHeadingId] = useState<string>('');

  useEffect(() => {
    const fetchMateri = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`/materi-edukasi/${params.slug}`);
        const data = res.data.data;
        setMateri(data);

        // Process HTML to extract real headings for TOC and inject IDs
        if (data.konten_teks) {
          let rawHTML = data.konten_teks;
          // Replace non-breaking spaces with normal spaces to allow natural wrapping
          rawHTML = rawHTML.replace(/&nbsp;/g, ' ').replace(/\u00A0/g, ' ');
          
          const div = document.createElement('div');
          div.innerHTML = rawHTML;
          const rawElements = Array.from(div.querySelectorAll('h1, h2, h3'));
          const extracted: HeadingItem[] = [];

          let count = 0;
          rawElements.forEach((elem) => {
            const rawText = (elem.textContent || '').trim();
            // Filter: text length 2-85 chars & not full paragraph multi-sentence
            const isTitleLength = rawText.length >= 2 && rawText.length <= 85;
            const sentenceCount = (rawText.match(/\.\s+[A-Z]/g) || []).length;
            const isNotParagraph = sentenceCount === 0;

            if (isTitleLength && isNotParagraph) {
              const headingId = elem.id || `materi-heading-${count++}`;
              elem.id = headingId;
              extracted.push({
                id: headingId,
                text: rawText,
                level: parseInt(elem.tagName.replace('H', '')),
              });
            }
          });

          setHeadings(extracted);
          setProcessedContent(div.innerHTML);
        } else {
          setProcessedContent('');
          setHeadings([]);
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

  useEffect(() => {
    if (headings.length === 0) return;
    
    const handleScroll = () => {
      const headingElements = headings
        .map((h) => document.getElementById(h.id))
        .filter(Boolean) as HTMLElement[];

      let currentActiveId = '';
      for (const elem of headingElements) {
        const rect = elem.getBoundingClientRect();
        if (rect.top <= 160) {
          currentActiveId = elem.id;
        }
      }

      if (currentActiveId) {
        setActiveHeadingId(currentActiveId);
      } else if (headings.length > 0) {
        setActiveHeadingId(headings[0].id);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
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
      const headerOffset = 110;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f4f7f9] flex flex-col font-sans">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center pt-32 pb-20">
          <i className="fa-solid fa-circle-notch animate-spin text-4xl text-primary mb-4"></i>
          <p className="text-slate-500 font-medium">Memuat materi edukasi...</p>
        </div>
        <Footer />
      </main>
    );
  }

  if (!materi) {
    return (
      <main className="min-h-screen bg-[#f4f7f9] flex flex-col font-sans">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center pt-32 pb-20 text-center px-4">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm">
            <i className="fa-solid fa-file-circle-xmark text-3xl text-gray-400"></i>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Materi Tidak Ditemukan</h1>
          <p className="text-gray-500 mb-6">Maaf, materi yang Anda cari mungkin telah dihapus atau URL tidak valid.</p>
          <button onClick={() => router.push('/edukasi/materi-edukasi')} className="px-6 py-2.5 bg-primary text-white rounded-full font-semibold hover:bg-blue-900 transition-colors shadow-sm">
            Kembali ke Daftar Materi
          </button>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f4f7f9] flex flex-col font-sans text-gray-800 relative">
      <Navbar />

      {/* Decorative Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[10%] -left-20 w-96 h-96 bg-primary/5 rounded-full blur-[100px]"></div>
        <div className="absolute top-[50%] -right-20 w-[450px] h-[450px] bg-blue-100/10 rounded-full blur-[120px]"></div>
        <div 
          className="absolute inset-0 w-full h-full opacity-[0.04] bg-repeat"
          style={{ backgroundImage: 'url(/images/element/2.png)', backgroundSize: '360px' }}
        ></div>
      </div>

      <section className="pt-28 md:pt-36 pb-16 px-4 sm:px-6 lg:px-8 flex-1 relative z-10">
        <div className="max-w-7xl mx-auto">
          
          {/* Breadcrumb Navigation */}
          <nav className="flex items-center gap-2 text-xs md:text-sm text-slate-500 mb-6 font-medium">
            <Link href="/" className="hover:text-primary transition-colors">Beranda</Link>
            <span className="text-slate-300">/</span>
            <Link href="/edukasi/materi-edukasi" className="hover:text-primary transition-colors">Materi Edukasi</Link>
            <span className="text-slate-300">/</span>
            <span className="text-slate-800 font-semibold truncate max-w-[200px] sm:max-w-[350px]">{materi.judul}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* KIRI: Konten Utama */}
            <article className="lg:col-span-8 min-w-0 w-full bg-white rounded-2xl md:rounded-3xl p-6 md:p-10 shadow-sm border border-gray-100">
              
              {/* Meta & Category Tags */}
              <div className="flex flex-wrap items-center gap-2.5 mb-4">
                {materi.kategori?.nama && (
                  <span className="px-3 py-1 bg-blue-50 text-primary font-bold text-xs rounded-full border border-blue-100">
                    {materi.kategori.nama}
                  </span>
                )}
                <span className="px-2.5 py-1 bg-slate-100 text-slate-600 font-semibold text-xs rounded-full">
                  {materi.jenis_konten || 'Artikel'}
                </span>
                {materi.created_at && (
                  <span className="text-xs text-slate-400 font-medium ml-auto flex items-center gap-1.5">
                    <i className="fa-regular fa-calendar"></i>
                    {new Date(materi.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                )}
              </div>

              {/* Judul Materi */}
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-6 leading-snug">
                {materi.judul}
              </h1>
              
              {/* Thumbnail Banner Slider */}
              {(() => {
                const allImages: string[] = [];
                if (materi.thumbnail) allImages.push(materi.thumbnail);
                if (materi.images && materi.images.length > 0) allImages.push(...materi.images);
                
                if (allImages.length === 0) return null;

                return (
                  <div className="w-full mb-8 relative group">
                    <div className="relative w-full h-[260px] sm:h-[360px] md:h-[420px] rounded-2xl overflow-hidden shadow-xs border border-gray-100 bg-gray-50 flex items-center justify-center">
                      {/* Slides */}
                      {allImages.map((img, idx) => (
                        <div 
                          key={idx} 
                          className={`absolute inset-0 w-full h-full transition-opacity duration-500 select-none ${
                            idx === activeImageIndex ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                          }`}
                        >
                          <img 
                            src={getImageUrl(img)} 
                            alt={`${materi.judul} - Slide ${idx + 1}`} 
                            className="w-full h-full object-contain sm:object-cover cursor-pointer"
                            onClick={() => window.open(getImageUrl(img), '_blank')}
                            onError={(e) => { (e.target as HTMLImageElement).src = '/images/banner/hero1.png'; }}
                          />
                        </div>
                      ))}

                      {/* Navigation Arrows */}
                      {allImages.length > 1 && (
                        <>
                          <button 
                            type="button"
                            onClick={() => setActiveImageIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1))}
                            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm border border-gray-200/60 flex items-center justify-center text-gray-800 hover:bg-white hover:text-primary hover:scale-105 active:scale-95 transition-all shadow-md z-30 cursor-pointer"
                          >
                            <i className="fa-solid fa-chevron-left text-xs"></i>
                          </button>
                          <button 
                            type="button"
                            onClick={() => setActiveImageIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1))}
                            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm border border-gray-200/60 flex items-center justify-center text-gray-800 hover:bg-white hover:text-primary hover:scale-105 active:scale-95 transition-all shadow-md z-30 cursor-pointer"
                          >
                            <i className="fa-solid fa-chevron-right text-xs"></i>
                          </button>

                          {/* Dots Indicator */}
                          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-30 bg-black/30 backdrop-blur-sm px-3 py-1.5 rounded-full">
                            {allImages.map((_, idx) => (
                              <button
                                key={idx}
                                type="button"
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

              {/* Konten Teks HTML (Preserve CKEditor Typography) */}
              {processedContent && (
                <div 
                  className="prose max-w-none text-slate-700 leading-relaxed mb-8"
                  dangerouslySetInnerHTML={{ __html: processedContent }}
                ></div>
              )}
              
              {/* Konten Teks Fallback jika tidak pakai Rich Text */}
              {!processedContent && materi.deskripsi_singkat && (
                <p className="text-slate-700 leading-relaxed mb-8 text-[15px] md:text-base">
                  {materi.deskripsi_singkat}
                </p>
              )}

              {/* Video Youtube Paling Bawah */}
              {materi.link_youtube && materi.link_youtube.length > 0 && (
                <div className="mt-10 pt-8 border-t border-gray-100">
                  <h3 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
                    <i className="fa-brands fa-youtube text-red-600"></i> Video Terkait
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {materi.link_youtube.map((link, idx) => {
                      const videoId = getYouTubeVideoId(link);
                      if (videoId) {
                        return (
                          <div key={idx} className="w-full aspect-video rounded-xl overflow-hidden shadow-xs bg-black">
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
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <i className="fa-solid fa-paperclip text-slate-500 text-sm"></i> Lampiran & Tautan Lainnya
                  </h3>
                  <div className="flex flex-wrap gap-2.5">
                    {materi.file_path && (
                      <a href={`${process.env.NEXT_PUBLIC_BACKEND_URL}/storage/${materi.file_path}`} target="_blank" rel="noopener noreferrer" className="px-4 py-2.5 rounded-xl border border-gray-200 hover:border-primary hover:bg-blue-50/50 text-slate-700 hover:text-primary font-semibold text-xs transition-all flex items-center gap-2 shadow-xs">
                        <i className="fa-solid fa-file-arrow-down text-primary"></i> Unduh Berkas
                      </a>
                    )}
                    {materi.link_eksternal && (
                      <a href={materi.link_eksternal} target="_blank" rel="noopener noreferrer" className="px-4 py-2.5 rounded-xl border border-gray-200 hover:border-primary hover:bg-blue-50/50 text-slate-700 hover:text-primary font-semibold text-xs transition-all flex items-center gap-2 shadow-xs">
                        <i className="fa-solid fa-arrow-up-right-from-square text-primary"></i> Link Eksternal
                      </a>
                    )}
                    {materi.link_drive?.map((link, idx) => (
                      <a key={idx} href={link} target="_blank" rel="noopener noreferrer" className="px-4 py-2.5 rounded-xl border border-gray-200 hover:border-green-600 hover:bg-green-50/50 text-slate-700 hover:text-green-700 font-semibold text-xs transition-all flex items-center gap-2 shadow-xs">
                        <i className="fa-brands fa-google-drive text-green-600"></i> Akses G-Drive
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </article>

            {/* KANAN: Sidebar */}
            <aside className="lg:col-span-4 min-w-0 w-full space-y-6">
              
              {/* Widget Konten Artikel / Table of Contents */}
              {headings.length > 0 && (
                <div className="bg-white rounded-2xl p-5 md:p-6 shadow-sm border border-gray-100 sticky top-28">
                  <div className="flex items-center gap-2.5 pb-3.5 mb-3.5 border-b border-gray-100">
                    <div className="w-7 h-7 rounded-lg bg-blue-50 text-primary flex items-center justify-center font-bold text-xs">
                      <i className="fa-solid fa-list-ul"></i>
                    </div>
                    <h3 className="text-[15px] font-bold text-gray-900">
                      Konten Artikel
                    </h3>
                  </div>

                  <nav className="max-h-[calc(100vh-220px)] overflow-y-auto pr-1.5 space-y-1.5 custom-scrollbar">
                    {headings.map((heading, idx) => {
                      const isActive = heading.id === activeHeadingId;
                      return (
                        <button 
                          key={idx}
                          onClick={() => scrollToHeading(heading.id)}
                          className={`w-full text-left text-[13.5px] leading-snug transition-all px-3.5 py-2.5 rounded-xl flex items-start gap-2.5 group cursor-pointer ${
                            isActive 
                              ? 'font-bold text-primary bg-blue-50/80 border-l-[3px] border-primary shadow-xs' 
                              : 'font-normal text-slate-600 hover:text-gray-900 hover:bg-slate-50'
                          } ${heading.level === 3 ? 'pl-7' : heading.level === 2 ? 'pl-5' : 'pl-3.5'}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 transition-colors ${
                            isActive ? 'bg-primary' : 'bg-slate-300 group-hover:bg-slate-500'
                          }`} />
                          <span className="flex-1 text-left whitespace-normal break-normal">{heading.text}</span>
                        </button>
                      );
                    })}
                  </nav>
                </div>
              )}

              {/* Widget Bagikan Artikel */}
              <div className="bg-white rounded-2xl p-5 md:p-6 shadow-sm border border-gray-100">
                <h3 className="text-[15px] font-bold text-gray-900 mb-3.5 flex items-center gap-2">
                  <i className="fa-solid fa-share-nodes text-slate-400 text-sm"></i>
                  Bagikan Artikel
                </h3>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => handleShare('whatsapp')} className="w-9 h-9 rounded-xl bg-[#25D366] text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xs cursor-pointer" title="WhatsApp">
                    <i className="fa-brands fa-whatsapp text-base"></i>
                  </button>
                  <button onClick={() => handleShare('facebook')} className="w-9 h-9 rounded-xl bg-[#1877F2] text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xs cursor-pointer" title="Facebook">
                    <i className="fa-brands fa-facebook-f text-base"></i>
                  </button>
                  <button onClick={() => handleShare('telegram')} className="w-9 h-9 rounded-xl bg-[#229ED9] text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xs cursor-pointer" title="Telegram">
                    <i className="fa-brands fa-telegram text-base"></i>
                  </button>
                  <button onClick={() => handleShare('linkedin')} className="w-9 h-9 rounded-xl bg-[#0A66C2] text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xs cursor-pointer" title="LinkedIn">
                    <i className="fa-brands fa-linkedin-in text-base"></i>
                  </button>
                  <button onClick={() => handleShare('twitter')} className="w-9 h-9 rounded-xl bg-black text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xs cursor-pointer" title="X / Twitter">
                    <i className="fa-brands fa-x-twitter text-base"></i>
                  </button>
                  <button onClick={() => handleShare('copy')} className="w-9 h-9 rounded-xl bg-slate-600 text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xs cursor-pointer" title="Salin Link">
                    <i className="fa-solid fa-link text-sm"></i>
                  </button>
                </div>
              </div>

            </aside>

          </div>
        </div>
      </section>
      
      <FloatingAction />
      <Footer />
    </main>
  );
}

