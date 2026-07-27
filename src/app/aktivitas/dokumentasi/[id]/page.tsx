'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

interface DokItem {
  id: number;
  nama_kegiatan: string;
  kategori: string;
  deskripsi: string;
  tanggal_kegiatan: string;
  posted_by: string;
  images: string[];
  video_urls: string[];
}

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

function getEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes('youtube.com') || u.hostname.includes('youtu.be')) {
      const vid = u.searchParams.get('v') || u.pathname.split('/').filter(Boolean).pop();
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

export default function DokumentasiDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const [dok, setDok] = useState<DokItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [activePhoto, setActivePhoto] = useState(0);

  useEffect(() => {
    if (!id) return;
    const fetch_ = async () => {
      try {
        const res = await fetch(`${API}/dokumentasi/${id}`);
        const data = await res.json();
        if (data.status === 'success') setDok(data.data);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetch_();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primary"></div>
    </div>
  );

  if (!dok) return (
    <main className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        <i className="fa-regular fa-images text-6xl text-gray-300"></i>
        <h1 className="text-2xl font-bold text-gray-600">Dokumentasi tidak ditemukan</h1>
        <Link href="/aktivitas" className="bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-800 transition-colors">
          Kembali ke Aktivitas
        </Link>
      </div>
      <Footer />
    </main>
  );

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navbar />

      {/* Header */}
      <section className="bg-primary text-white pt-32 pb-16 md:pt-40 md:pb-20 relative overflow-hidden">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 relative z-10">
          <div className="flex items-center gap-2 text-sm text-blue-200 mb-6">
            <Link href="/" className="hover:text-white transition-colors">Beranda</Link>
            <span>&gt;</span>
            <Link href="/aktivitas" className="hover:text-white transition-colors">Aktivitas</Link>
            <span>&gt;</span>
            <span className="text-white font-medium">Dokumentasi</span>
          </div>
          <div className="flex items-start gap-4 flex-wrap">
            <span className="bg-white/20 text-white text-sm font-bold px-3 py-1.5 rounded-full border border-white/30">
              {dok.kategori}
            </span>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold mt-4 mb-4 leading-tight">{dok.nama_kegiatan}</h1>
          <div className="flex flex-wrap items-center gap-4 text-blue-100 text-sm">
            <span className="flex items-center gap-2">
              <i className="fa-regular fa-calendar"></i>
              {new Date(dok.tanggal_kegiatan).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
            <span className="flex items-center gap-2">
              <i className="fa-solid fa-user-pen"></i>
              {dok.posted_by}
            </span>
            {dok.images && dok.images.length > 0 && (
              <span className="flex items-center gap-2">
                <i className="fa-regular fa-images"></i>
                {dok.images.length} Foto
              </span>
            )}
            {dok.video_urls && dok.video_urls.length > 0 && (
              <span className="flex items-center gap-2">
                <i className="fa-brands fa-youtube"></i>
                {dok.video_urls.length} Video
              </span>
            )}
          </div>
        </div>
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-[100px] translate-x-1/3 -translate-y-1/3"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full blur-[80px] -translate-x-1/2 translate-y-1/2"></div>
        </div>
      </section>

      {/* Content */}
      <section className="max-w-[1200px] mx-auto w-full px-4 md:px-8 py-12 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">

            {/* Deskripsi */}
            {dok.deskripsi && (
              <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-sm">
                <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <i className="fa-solid fa-align-left text-primary"></i> Deskripsi Kegiatan
                </h2>
                <p className="text-gray-600 leading-relaxed whitespace-pre-line">{dok.deskripsi}</p>
              </div>
            )}

            {/* Photo Gallery */}
            {dok.images && dok.images.length > 0 && (
              <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-sm">
                <h2 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2">
                  <i className="fa-regular fa-images text-primary"></i> Galeri Foto
                  <span className="text-sm font-normal text-gray-400 ml-2">({dok.images.length} foto)</span>
                </h2>

                {/* Main Photo */}
                <div className="relative w-full rounded-xl overflow-hidden bg-gray-100 mb-4" style={{paddingTop: '56.25%'}}>
                  <img
                    src={dok.images[activePhoto]}
                    alt={`${dok.nama_kegiatan} - foto ${activePhoto + 1}`}
                    className="absolute inset-0 w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/800x450?text=Gambar+tidak+tersedia'; }}
                  />
                  {dok.images.length > 1 && (
                    <>
                      <button
                        onClick={() => setActivePhoto(p => Math.max(p - 1, 0))}
                        disabled={activePhoto === 0}
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 disabled:opacity-30 transition-all"
                      >
                        <i className="fa-solid fa-chevron-left"></i>
                      </button>
                      <button
                        onClick={() => setActivePhoto(p => Math.min(p + 1, dok.images.length - 1))}
                        disabled={activePhoto === dok.images.length - 1}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 disabled:opacity-30 transition-all"
                      >
                        <i className="fa-solid fa-chevron-right"></i>
                      </button>
                      <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                        {activePhoto + 1} / {dok.images.length}
                      </div>
                    </>
                  )}
                </div>

                {/* Thumbnail strip */}
                {dok.images.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {dok.images.map((img, i) => (
                      <button
                        key={i}
                        onClick={() => setActivePhoto(i)}
                        className={`relative shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-all ${activePhoto === i ? 'border-primary shadow-md scale-105' : 'border-gray-200 hover:border-gray-400'}`}
                      >
                        <img
                          src={img}
                          alt={`thumb-${i}`}
                          className="w-full h-full object-cover"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Videos */}
            {dok.video_urls && dok.video_urls.length > 0 && (
              <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-sm">
                <h2 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2">
                  <i className="fa-brands fa-youtube text-red-500"></i> Video Kegiatan
                  <span className="text-sm font-normal text-gray-400 ml-2">({dok.video_urls.length} video)</span>
                </h2>
                <div className="space-y-6">
                  {dok.video_urls.map((url, i) => {
                    const embed = getEmbedUrl(url);
                    return embed ? (
                      <div key={i}>
                        <div className="relative w-full rounded-xl overflow-hidden border border-gray-100 shadow-sm" style={{paddingTop: '56.25%'}}>
                          <iframe
                            src={embed}
                            className="absolute inset-0 w-full h-full"
                            allowFullScreen
                            title={`Video ${i + 1} - ${dok.nama_kegiatan}`}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          />
                        </div>
                        {dok.video_urls.length > 1 && (
                          <p className="text-xs text-gray-400 mt-2 text-center">Video {i + 1} dari {dok.video_urls.length}</p>
                        )}
                      </div>
                    ) : (
                      <a key={i} href={url} target="_blank" rel="noreferrer"
                        className="flex items-center gap-2 text-primary hover:underline text-sm">
                        <i className="fa-solid fa-link"></i> {url}
                      </a>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Info Card */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h3 className="font-bold text-gray-800 mb-4 text-base">Informasi Kegiatan</h3>
              <ul className="space-y-4">
                <li className="flex gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-primary flex items-center justify-center shrink-0">
                    <i className="fa-solid fa-tag text-sm"></i>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Kategori</p>
                    <p className="text-sm font-semibold text-gray-800">{dok.kategori}</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-primary flex items-center justify-center shrink-0">
                    <i className="fa-regular fa-calendar text-sm"></i>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Tanggal Kegiatan</p>
                    <p className="text-sm font-semibold text-gray-800">
                      {new Date(dok.tanggal_kegiatan).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-primary flex items-center justify-center shrink-0">
                    <i className="fa-solid fa-user-pen text-sm"></i>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Diposting oleh</p>
                    <p className="text-sm font-semibold text-gray-800">{dok.posted_by}</p>
                  </div>
                </li>
                {dok.images && dok.images.length > 0 && (
                  <li className="flex gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 text-primary flex items-center justify-center shrink-0">
                      <i className="fa-regular fa-images text-sm"></i>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">Total Foto</p>
                      <p className="text-sm font-semibold text-gray-800">{dok.images.length} Foto</p>
                    </div>
                  </li>
                )}
                {dok.video_urls && dok.video_urls.length > 0 && (
                  <li className="flex gap-3">
                    <div className="w-9 h-9 rounded-xl bg-red-50 text-red-500 flex items-center justify-center shrink-0">
                      <i className="fa-brands fa-youtube text-sm"></i>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">Total Video</p>
                      <p className="text-sm font-semibold text-gray-800">{dok.video_urls.length} Video</p>
                    </div>
                  </li>
                )}
              </ul>
            </div>

            {/* Back Button */}
            <Link href="/aktivitas?tab=dokumentasi"
              className="w-full flex items-center justify-center gap-2 py-3 px-5 rounded-xl border-2 border-primary text-primary font-bold hover:bg-primary hover:text-white transition-all duration-300"
            >
              <i className="fa-solid fa-arrow-left"></i> Kembali ke Aktivitas
            </Link>
          </div>

        </div>
      </section>

      <Footer />
    </main>
  );
}
