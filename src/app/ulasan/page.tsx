'use client';

import { useState, useEffect, useRef } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import gsap from 'gsap';

interface Ulasan {
  id: number;
  nama: string;
  kategori: string;
  instansi: string;
  komentar: string;
  rating: number;
  status?: string;
  is_approved?: boolean;
  created_at?: string;
}

const DEFAULT_ULASAN: Ulasan[] = [
  { id: 1, nama: 'I GUSTI AGUNG PUTRA MA...', kategori: 'Pelajar', instansi: 'SMPN 2 DENPASAR', komentar: 'Menurut saya lomba ini sangat seru, mengedukasi, dan melatih kemampuan menghafal saya. saya harap...', rating: 5, status: 'disetujui', created_at: new Date().toISOString() },
  { id: 2, nama: 'Steven', kategori: 'Pelajar', instansi: 'SMP', komentar: 'lomba yang menarik', rating: 5, status: 'disetujui', created_at: new Date().toISOString() },
  { id: 3, nama: 'Putu Nayla Anggita Cahyani', kategori: 'Pelajar', instansi: 'SMP Negeri 10 Denpasar', komentar: 'Alur lomba yang menarik, materi lengkap', rating: 5, status: 'disetujui', created_at: new Date().toISOString() },
  { id: 4, nama: 'Ahmad Faisal', kategori: 'Mahasiswa', instansi: 'Universitas Simalungun', komentar: 'Sangat bermanfaat untuk menambah wawasan kebanksentralan', rating: 5, status: 'disetujui', created_at: new Date().toISOString() }
];

export default function UlasanPage() {
  const filterActiveUlasan = (list: Ulasan[]) => {
    return list.filter((u: any) => {
      if (u.status === 'pending' || u.status === 'nonaktif' || u.is_approved === false) {
        return false;
      }
      return u.status === 'disetujui' || u.is_approved === true || (!u.status && u.is_approved === undefined);
    });
  };

  const [ulasanList, setUlasanList] = useState<Ulasan[]>(DEFAULT_ULASAN);
  const [loading, setLoading] = useState(true);
  
  // GSAP Refs
  const headerRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Form state
  const [nama, setNama] = useState('');
  const [kategori, setKategori] = useState('');
  const [instansi, setInstansi] = useState('');
  const [komentar, setKomentar] = useState('');
  const [rating, setRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const fetchUlasan = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/ulasan`, { cache: 'no-store' });
      const data = await res.json();
      if (data.status === 'success') {
        const list = Array.isArray(data.data) ? data.data : data.data.data || [];
        if (list.length > 0) {
          const approved = filterActiveUlasan(list);
          setUlasanList(approved);
        }
      }
    } catch (error) {
      console.error('Error fetching ulasan:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUlasan();

    // GSAP Intro Animations
    if (headerRef.current) {
      gsap.fromTo(headerRef.current.children, 
        { y: 30, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 1, stagger: 0.2, ease: 'power3.out' }
      );
    }
    
    if (formRef.current) {
      gsap.fromTo(formRef.current,
        { x: -50, opacity: 0 },
        { x: 0, opacity: 1, duration: 1, delay: 0.3, ease: 'power3.out' }
      );
    }

    if (listRef.current) {
      gsap.fromTo(listRef.current,
        { x: 50, opacity: 0 },
        { x: 0, opacity: 1, duration: 1, delay: 0.5, ease: 'power3.out' }
      );
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccess(false);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/ulasan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ nama, kategori, instansi, komentar, rating, status: 'disetujui' })
      });
      
      const data = await res.json();
      if (res.ok && (data.status === 'success' || data.data)) {
        setSuccess(true);
        setNama('');
        setKategori('');
        setInstansi('');
        setKomentar('');
        setRating(5);
        
        const newItem: Ulasan = data.data || {
          id: Date.now(),
          nama,
          kategori,
          instansi,
          komentar,
          rating,
          status: 'disetujui',
          created_at: new Date().toISOString()
        };

        setUlasanList(prev => [newItem, ...prev]);
        fetchUlasan(); // Refresh from backend
      } else {
        alert(data.message || 'Gagal mengirim ulasan.');
      }
    } catch (error) {
      console.error('Failed to submit', error);
      alert('Gagal mengirim ulasan. Silakan periksa koneksi internet Anda.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col relative overflow-hidden">
      
      {/* Background Element 2.png for entire page/grid area */}
      <div 
        className="fixed inset-0 w-full h-full opacity-[0.05] pointer-events-none z-0 mix-blend-multiply bg-repeat"
        style={{ backgroundImage: 'url(/images/element/2.png)', backgroundSize: '400px' }}
      ></div>

      <Navbar />

      {/* Header Spacer */}
      <div className="pt-32 pb-16 bg-primary relative overflow-hidden border-b-4 border-[#fbbf24]" ref={headerRef}>
        {/* Background Image /images/header.jpg with 20% Opacity */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <img
            src="/images/header.jpg"
            alt="Header Background"
            className="w-full h-full object-cover object-center opacity-20 mix-blend-overlay"
          />
        </div>
        
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 text-center relative z-10">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 drop-shadow-md">Ulasan Edukasi</h1>
          <p className="text-gray-200 text-lg drop-shadow-sm font-medium">Bagikan pengalaman Anda dan lihat apa kata mereka tentang program BI Mengajar.</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 max-w-[1400px] mx-auto px-4 md:px-8 py-16 w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative z-10">
        
        {/* LEFT: Form Ulasan */}
        <div ref={formRef} className="lg:col-span-4 bg-primary p-8 text-white border border-blue-800 shadow-xl relative overflow-hidden">
          {/* Form Background Element 1.png */}
          <div 
            className="absolute inset-0 w-full h-full opacity-30 pointer-events-none mix-blend-overlay"
            style={{ backgroundImage: 'url(/images/element/1.png)', backgroundSize: 'cover' }}
          ></div>

          <div className="relative z-10">
            <h3 className="text-2xl font-bold text-white mb-6">Tulis Ulasan Anda</h3>
            
            {success && (
              <div className="mb-6 p-4 bg-green-500/20 border border-green-400 text-green-100 text-sm font-medium backdrop-blur-sm">
                Terima kasih! Ulasan Anda berhasil dikirim dan ditayangkan.
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div>
                <label className="block text-sm font-semibold text-blue-100 mb-1.5">Nama Lengkap</label>
                <input 
                  type="text" 
                  required
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 text-white placeholder-blue-200/50 px-4 py-3 text-sm outline-none focus:border-white focus:bg-white/20 transition-all"
                  placeholder="Masukkan nama"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-blue-100 mb-1.5">Kategori</label>
                <select 
                  required
                  value={kategori}
                  onChange={(e) => setKategori(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 text-white px-4 py-3 text-sm outline-none focus:border-white focus:bg-white/20 transition-all [&>option]:text-gray-900"
                >
                  <option value="" disabled>Pilih Kategori</option>
                  <option value="Pelajar">Pelajar</option>
                  <option value="Mahasiswa">Mahasiswa</option>
                  <option value="Guru / Tenaga Pendidik">Guru / Tenaga Pendidik</option>
                  <option value="Umum">Umum</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-blue-100 mb-1.5">Asal Instansi / Sekolah</label>
                <input 
                  type="text" 
                  required
                  value={instansi}
                  onChange={(e) => setInstansi(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 text-white placeholder-blue-200/50 px-4 py-3 text-sm outline-none focus:border-white focus:bg-white/20 transition-all"
                  placeholder="Contoh: SMPN 1 Siantar"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-blue-100 mb-1.5">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button 
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="text-3xl transition-transform hover:scale-125 focus:outline-none"
                    >
                      <i className={`fa-solid fa-star ${star <= rating ? 'text-[#fbbf24] drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]' : 'text-blue-900/50'}`}></i>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-blue-100 mb-1.5">Komentar</label>
                <textarea 
                  required
                  value={komentar}
                  onChange={(e) => setKomentar(e.target.value)}
                  rows={4}
                  className="w-full bg-white/10 border border-white/20 text-white placeholder-blue-200/50 px-4 py-3 text-sm outline-none focus:border-white focus:bg-white/20 transition-all resize-none"
                  placeholder="Bagikan pendapat Anda..."
                ></textarea>
              </div>

              <button 
                type="submit" 
                disabled={submitting}
                className="mt-4 w-full bg-white text-primary font-extrabold py-3.5 hover:bg-gray-100 shadow-[0_4px_15px_rgba(0,0,0,0.2)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.3)] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {submitting ? 'Mengirim...' : 'Kirim Ulasan'}
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT: Daftar Ulasan */}
        <div ref={listRef} className="lg:col-span-8 bg-white/95 backdrop-blur-md p-8 border border-gray-200 shadow-xl relative z-10 flex flex-col h-[760px] overflow-hidden">
          <style>{`
            @keyframes marquee-up {
              0% { transform: translateY(0); }
              100% { transform: translateY(-50%); }
            }
            @keyframes marquee-down {
              0% { transform: translateY(-50%); }
              100% { transform: translateY(0); }
            }
            .animate-marquee-up {
              animation: marquee-up 60s linear infinite;
            }
            .animate-marquee-down {
              animation: marquee-down 60s linear infinite;
            }
          `}</style>
          
          <h3 className="text-2xl font-extrabold text-[#1a365d] mb-6 border-b border-gray-100 pb-4 shrink-0">Ulasan Terbaru</h3>
          
          {loading ? (
            <div className="flex justify-center items-center flex-1">
              <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primary"></div>
            </div>
          ) : ulasanList.length === 0 ? (
            <div className="flex justify-center items-center flex-1">
              <div className="text-center text-gray-500 py-10 px-6 w-full bg-gray-50 border border-gray-100 border-dashed">
                Belum ada ulasan disetujui. Jadilah yang pertama!
              </div>
            </div>
          ) : (
            <div className="flex-1 relative overflow-hidden -mx-4 px-4 mask-vertical-faded">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
                {/* Column 1: Up */}
                <div className="h-full relative overflow-hidden">
                  <div className="flex flex-col gap-6 w-full absolute animate-marquee-up hover:[animation-play-state:paused]">
                    {[...ulasanList, ...ulasanList, ...ulasanList, ...ulasanList].filter((_, i) => i % 2 === 0).map((ulasan, idx) => (
                      <div key={`col1-${ulasan.id}-${idx}`} className="bg-white border border-gray-100 p-6 shadow-sm hover:shadow-lg transition-shadow flex flex-col hover:-translate-y-1 duration-300">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex gap-1 text-[#fbbf24] text-sm">
                            {[...Array(5)].map((_, i) => (
                              <i key={i} className={`fa-solid fa-star ${i < ulasan.rating ? 'text-[#fbbf24]' : 'text-gray-200'}`}></i>
                            ))}
                          </div>
                          {ulasan.created_at && (
                            <span className="text-[11px] font-semibold text-gray-400 bg-gray-50 px-2 py-1">
                              {new Date(ulasan.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 text-sm italic mb-6 leading-relaxed">
                          "{ulasan.komentar}"
                        </p>
                        <div className="border-t border-gray-50 pt-4 mt-auto">
                          <h4 className="font-bold text-[#1a365d] text-base truncate">{ulasan.nama}</h4>
                          <p className="text-xs font-medium text-gray-500 mt-1 truncate">
                            {ulasan.kategori} <span className="mx-1 text-gray-300">•</span> {ulasan.instansi}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Column 2: Down */}
                <div className="h-full relative overflow-hidden hidden md:block">
                  <div className="flex flex-col gap-6 w-full absolute animate-marquee-down hover:[animation-play-state:paused]">
                    {[...ulasanList, ...ulasanList, ...ulasanList, ...ulasanList].filter((_, i) => i % 2 !== 0).map((ulasan, idx) => (
                      <div key={`col2-${ulasan.id}-${idx}`} className="bg-white border border-gray-100 p-6 shadow-sm hover:shadow-lg transition-shadow flex flex-col hover:-translate-y-1 duration-300">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex gap-1 text-[#fbbf24] text-sm">
                            {[...Array(5)].map((_, i) => (
                              <i key={i} className={`fa-solid fa-star ${i < ulasan.rating ? 'text-[#fbbf24]' : 'text-gray-200'}`}></i>
                            ))}
                          </div>
                          {ulasan.created_at && (
                            <span className="text-[11px] font-semibold text-gray-400 bg-gray-50 px-2 py-1">
                              {new Date(ulasan.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 text-sm italic mb-6 leading-relaxed">
                          "{ulasan.komentar}"
                        </p>
                        <div className="border-t border-gray-50 pt-4 mt-auto">
                          <h4 className="font-bold text-[#1a365d] text-base truncate">{ulasan.nama}</h4>
                          <p className="text-xs font-medium text-gray-500 mt-1 truncate">
                            {ulasan.kategori} <span className="mx-1 text-gray-300">•</span> {ulasan.instansi}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Global Style for fade mask */}
      <style>{`
        .mask-vertical-faded {
          -webkit-mask-image: linear-gradient(to bottom, transparent, black 5%, black 95%, transparent);
          mask-image: linear-gradient(to bottom, transparent, black 5%, black 95%, transparent);
        }
      `}</style>
      
      <Footer />
    </main>
  );
}
