'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import axios from '@/lib/axios';
import { MateriEdukasi } from '@/app/admin/materi-edukasi/types';

const getYouTubeVideoId = (url: string) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

export default function MateriEdukasiDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [materi, setMateri] = useState<MateriEdukasi | null>(null);
  const [related, setRelated] = useState<MateriEdukasi[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMateri = async () => {
      try {
        setLoading(true);
        // Fetch detail
        const res = await axios.get(`/materi-edukasi/${params.slug}`);
        const data = res.data.data;
        setMateri(data);

        // Fetch related articles (same category)
        if (data.kategori_materi_id) {
          const resRelated = await axios.get(`/materi-edukasi?kategori_id=${data.kategori_materi_id}&page=1`);
          // Filter out current article and limit to 4
          const filtered = resRelated.data.data.data
            .filter((item: MateriEdukasi) => item.id !== data.id)
            .slice(0, 4);
          setRelated(filtered);
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

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex flex-col font-sans">
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
      <main className="min-h-screen bg-gray-50 flex flex-col font-sans">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center pt-32 pb-20 text-center px-4">
          <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mb-6">
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
    <main className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navbar />

      {/* Header Biru Gelap */}
      <section className="bg-[#003366] text-white pt-32 pb-16 px-4 md:px-8">
        <div className="max-w-[1200px] mx-auto text-center md:text-left flex flex-col items-center md:items-start">
          <div className="flex items-center gap-2 text-sm text-blue-200 mb-6 font-medium">
            <Link href="/" className="hover:text-white transition-colors">Beranda</Link>
            <span>&gt;</span>
            <Link href="/edukasi" className="hover:text-white transition-colors">Edukasi</Link>
            <span>&gt;</span>
            <Link href="/edukasi/materi-edukasi" className="hover:text-white transition-colors">Materi</Link>
            <span>&gt;</span>
            <span className="text-white max-w-[200px] md:max-w-xs truncate">{materi.judul}</span>
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-6 leading-tight max-w-4xl text-center md:text-left">
            {materi.judul}
          </h1>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm font-medium">
            <div className="flex items-center gap-2 bg-white/10 px-4 py-1.5 rounded-full backdrop-blur-sm">
              <i className="fa-regular fa-calendar text-blue-200"></i>
              <span>{materi.created_at ? new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date(materi.created_at)) : '-'}</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 px-4 py-1.5 rounded-full backdrop-blur-sm">
              <i className="fa-solid fa-layer-group text-blue-200"></i>
              <span>{materi.kategori?.nama || 'Tanpa Kategori'}</span>
            </div>
            <div className="flex items-center gap-2 bg-blue-500/30 text-blue-100 px-4 py-1.5 rounded-full backdrop-blur-sm">
              <i className="fa-solid fa-tag text-blue-200"></i>
              <span>{materi.jenis_konten}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Konten Utama */}
      <section className="py-12 px-4 md:px-8 flex-1">
        <div className="max-w-[1200px] mx-auto flex flex-col lg:flex-row gap-10">
          
          {/* Bagian Kiri: Detail Artikel */}
          <article className="flex-1 bg-white rounded-2xl p-6 md:p-10 shadow-sm border border-gray-100">
            {/* Banner Slider (Thumbnail & Galeri) */}
            {(materi.thumbnail || (materi.images && materi.images.length > 0)) && (
              <div className="w-full mb-8">
                <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 scrollbar-hide">
                  {/* Thumbnail Utama */}
                  {materi.thumbnail && (
                    <div className="relative w-full shrink-0 h-[300px] md:h-[500px] snap-center rounded-xl overflow-hidden shadow-sm border border-gray-100">
                      <Image 
                        src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/storage/${materi.thumbnail}`} 
                        alt={materi.judul} 
                        fill 
                        className="object-cover"
                        priority
                        unoptimized
                      />
                    </div>
                  )}
                  {/* Galeri Ekstra */}
                  {materi.images?.map((img, idx) => (
                    <div key={idx} className="relative w-full shrink-0 h-[300px] md:h-[500px] snap-center rounded-xl overflow-hidden shadow-sm border border-gray-100 group">
                      <Image 
                        src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/storage/${img}`}
                        alt={`Galeri ${idx + 1}`}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500 cursor-pointer"
                        onClick={() => window.open(`${process.env.NEXT_PUBLIC_BACKEND_URL}/storage/${img}`, '_blank')}
                        unoptimized
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                        <i className="fa-solid fa-magnifying-glass-plus text-white text-3xl"></i>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Deskripsi Singkat */}
            {materi.deskripsi_singkat && (
              <div className="text-xl font-medium text-gray-700 leading-relaxed mb-8 border-l-4 border-[#003366] pl-6 py-2 bg-blue-50/50 rounded-r-xl">
                {materi.deskripsi_singkat}
              </div>
            )}
            
            {/* Teks HTML */}
            {materi.konten_teks && (
              <div 
                className="prose prose-lg max-w-none prose-blue prose-img:rounded-xl mb-10 text-gray-800"
                dangerouslySetInnerHTML={{ __html: materi.konten_teks }}
              ></div>
            )}

            {/* Media Tambahan (YouTube/Drive/Files) */}
            {((materi.link_youtube && materi.link_youtube.length > 0) || (materi.link_drive && materi.link_drive.length > 0) || materi.file_path || materi.link_eksternal) && (
              <div className="mt-12 pt-8 border-t border-gray-100">
                <h3 className="text-xl font-bold text-[#003366] mb-6 flex items-center gap-2">
                  <i className="fa-solid fa-photo-film"></i> Media & Tautan Terkait
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  {/* Eksternal Link Tunggal */}
                  {materi.link_eksternal && (
                    <a href={materi.link_eksternal} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 hover:border-[#003366] hover:shadow-md transition-all group bg-white">
                      <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center text-[#003366] group-hover:bg-[#003366] group-hover:text-white transition-colors">
                        <i className="fa-solid fa-arrow-up-right-from-square text-xl"></i>
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-gray-800 group-hover:text-[#003366] transition-colors">Link Eksternal</p>
                        <p className="text-xs text-gray-500 truncate">{materi.link_eksternal}</p>
                      </div>
                    </a>
                  )}
                  {/* File Lampiran Tunggal */}
                  {materi.file_path && (
                    <a href={`${process.env.NEXT_PUBLIC_BACKEND_URL}/storage/${materi.file_path}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 hover:border-[#003366] hover:shadow-md transition-all group bg-white">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-gray-700 group-hover:bg-[#003366] group-hover:text-white transition-colors">
                        <i className="fa-solid fa-file-arrow-down text-xl"></i>
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-gray-800 group-hover:text-[#003366] transition-colors">Unduh Lampiran</p>
                        <p className="text-xs text-gray-500">Berkas Pendukung</p>
                      </div>
                    </a>
                  )}
                  
                  {/* Drive & Other Links remain here */}
                  {materi.link_drive?.map((link, idx) => (
                    <a key={idx} href={link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 hover:border-green-500 hover:shadow-md transition-all group bg-white">
                      <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center text-green-600 group-hover:bg-green-600 group-hover:text-white transition-colors">
                        <i className="fa-brands fa-google-drive text-xl"></i>
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-gray-800 group-hover:text-green-700 transition-colors">Akses Google Drive</p>
                        <p className="text-xs text-gray-500 truncate">{link}</p>
                      </div>
                    </a>
                  ))}
                </div>

                {/* YouTube Embeds */}
                {materi.link_youtube && materi.link_youtube.length > 0 && (
                  <div className="mb-8 flex flex-col gap-6">
                    {materi.link_youtube.map((link, idx) => {
                      const videoId = getYouTubeVideoId(link);
                      if (videoId) {
                        return (
                          <div key={idx} className="w-full aspect-video rounded-xl overflow-hidden shadow-md">
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
                      return (
                        <a key={idx} href={link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 hover:border-red-500 hover:shadow-md transition-all group bg-white">
                          <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center text-red-500 group-hover:bg-red-500 group-hover:text-white transition-colors">
                            <i className="fa-brands fa-youtube text-xl"></i>
                          </div>
                          <div className="flex-1">
                            <p className="font-bold text-gray-800 group-hover:text-red-600 transition-colors">Tonton di YouTube</p>
                            <p className="text-xs text-gray-500 truncate">{link}</p>
                          </div>
                        </a>
                      );
                    })}
                  </div>
                )}


              </div>
            )}
          </article>

          {/* Bagian Kanan: Sidebar Rekomendasi */}
          <aside className="w-full lg:w-[350px] shrink-0">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-32">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-6 border-b border-gray-100 pb-4">
                <i className="fa-solid fa-list-ul text-[#003366]"></i> Baca Artikel Lainnya
              </h3>
              
              <div className="flex flex-col gap-5">
                {related.length > 0 ? (
                  related.map((rel) => (
                    <Link href={`/edukasi/materi-edukasi/${rel.slug}`} key={rel.id} className="group flex gap-4 items-start">
                      <div className="w-20 h-20 bg-gray-100 rounded-lg relative overflow-hidden shrink-0 border border-gray-100">
                        {rel.thumbnail ? (
                          <Image src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/storage/${rel.thumbnail}`} alt={rel.judul} fill className="object-cover group-hover:scale-110 transition-transform duration-300" unoptimized />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300">
                            <i className="fa-solid fa-image"></i>
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-bold text-gray-800 line-clamp-2 group-hover:text-[#003366] transition-colors mb-1 leading-snug">
                          {rel.judul}
                        </h4>
                        <div className="flex items-center gap-1 text-[11px] text-gray-500 font-medium">
                          <i className="fa-regular fa-calendar"></i>
                          {rel.created_at ? new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(rel.created_at)) : '-'}
                        </div>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    <i className="fa-regular fa-folder-open text-2xl mb-2 opacity-50"></i>
                    <p className="text-sm">Belum ada materi lain di kategori ini.</p>
                  </div>
                )}
              </div>
              
              {related.length > 0 && (
                <Link href="/edukasi/materi-edukasi" className="mt-8 block w-full py-2.5 bg-blue-50 hover:bg-blue-100 text-[#003366] font-bold text-sm text-center rounded-xl transition-colors">
                  Lihat Semua Aktivitas
                </Link>
              )}
            </div>
          </aside>

        </div>
      </section>
      
      <Footer />
    </main>
  );
}
