'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Image from 'next/image';
import Swal from 'sweetalert2';
import ParticleBackground from '@/components/ui/ParticleBackground';
import PageHeader from '@/components/ui/PageHeader';

interface Mitra {
  id: number;
  logo: string;
  singkatan: string;
  nama_lengkap: string;
  kategori: string;
  lokasi: string;
  deskripsi: string;
  no_wa: string;
}

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
const getImageUrl = (url: string) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return API.replace('/api', '') + url;
};

export default function MitraEdukasiPage() {
  const [mitras, setMitras] = useState<Mitra[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');

  // Modals state
  const [selectedMitra, setSelectedMitra] = useState<Mitra | null>(null);
  const [showCollabModal, setShowCollabModal] = useState(false);
  const [collabForm, setCollabForm] = useState({
    singkatan: '',
    nama_lengkap: '',
    kategori: '',
    lokasi: '',
    deskripsi: '',
    no_wa: '',
    logo: null as File | null,
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchMitras = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/mitras?page=${page}&search=${search}`);
      const data = await res.json();
      if (data.status === 'success') {
        setMitras(data.data.data || []);
        setTotalPages(data.data.last_page || 1);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMitras();
  }, [page, search]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const submitCollab = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const formData = new FormData();
    formData.append('singkatan', collabForm.singkatan);
    formData.append('nama_lengkap', collabForm.nama_lengkap);
    formData.append('kategori', collabForm.kategori);
    formData.append('lokasi', collabForm.lokasi);
    formData.append('deskripsi', collabForm.deskripsi);
    formData.append('no_wa', collabForm.no_wa);
    if (collabForm.logo) {
      formData.append('logo', collabForm.logo);
    }

    try {
      const res = await fetch(`${API}/mitras`, {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: formData,
      });
      const data = await res.json();
      if (data.status === 'success') {
        Swal.fire('Berhasil!', 'Pengajuan kolaborasi Anda telah dikirim dan menunggu persetujuan admin.', 'success');
        setShowCollabModal(false);
        setCollabForm({ singkatan: '', nama_lengkap: '', kategori: '', lokasi: '', deskripsi: '', no_wa: '', logo: null });
      } else {
        Swal.fire('Gagal', data.message || 'Terjadi kesalahan.', 'error');
      }
    } catch {
      Swal.fire('Error', 'Gagal terhubung ke server.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f2f6fa] flex flex-col font-sans">
      <Navbar />

      {/* Hero / Header Section */}
      <PageHeader 
        title="Jejaring Mitra Edukasi" 
        description="Temukan dan kenali berbagai mitra strategis Bank Indonesia yang turut berkolaborasi dalam meningkatkan literasi dan edukasi keuangan masyarakat di seluruh Indonesia."
        breadcrumbs={[
          { label: 'Beranda', href: '/' },
          { label: 'Mitra Edukasi' }
        ]}
      >
        {/* Search Bar (Floating over header) */}
        <div className="max-w-xl mx-auto relative group">
          <input 
            type="text" 
            placeholder="Cari nama mitra, singkatan, atau lokasi..." 
            value={search}
            onChange={handleSearch}
            className="w-full px-6 py-4 pl-14 bg-white rounded-2xl border-0 shadow-lg text-gray-800 focus:outline-none focus:ring-4 focus:ring-blue-400/50 transition-all text-lg"
          />
          <i className="fa-solid fa-search absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 text-xl group-focus-within:text-primary transition-colors"></i>
        </div>
      </PageHeader>

      {/* Main Content */}
      <section className="max-w-[1200px] mx-auto w-full px-4 md:px-8 py-16 flex-1">
        
        {/* Grid Mitra */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-primary"></div>
          </div>
        ) : mitras.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-3xl shadow-sm border border-gray-100">
            <i className="fa-regular fa-folder-open text-6xl text-gray-300 mb-4 block"></i>
            <h3 className="text-xl font-bold text-gray-700 mb-2">Mitra Tidak Ditemukan</h3>
            <p className="text-gray-500">Belum ada data mitra yang sesuai dengan pencarian Anda.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
            {mitras.map((mitra) => (
              <div key={mitra.id} className="bg-white rounded-3xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 border border-gray-100 transition-all duration-300 flex flex-col items-center text-center group">
                <div className="w-24 h-24 rounded-2xl bg-gray-50/50 border border-gray-100 overflow-hidden flex items-center justify-center mb-5 p-3 shadow-inner group-hover:scale-105 transition-transform">
                  {mitra.logo ? (
                    <img src={getImageUrl(mitra.logo)} alt={mitra.singkatan} className="w-full h-full object-contain mix-blend-multiply" />
                  ) : (
                    <i className="fa-solid fa-building-ngo text-4xl text-gray-300"></i>
                  )}
                </div>
                <h3 className="font-extrabold text-xl text-gray-800 mb-1 group-hover:text-primary transition-colors">{mitra.singkatan}</h3>
                <p className="text-xs font-medium text-gray-500 mb-4 line-clamp-1 px-2" title={mitra.nama_lengkap}>{mitra.nama_lengkap}</p>
                
                <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
                  <span className="text-[11px] text-primary bg-blue-50 px-3 py-1 rounded-full font-bold tracking-wide">{mitra.kategori}</span>
                  <span className="text-[11px] text-gray-600 bg-gray-100 px-3 py-1 rounded-full font-semibold flex items-center gap-1">
                    <i className="fa-solid fa-location-dot"></i> {mitra.lokasi}
                  </span>
                </div>
                
                <button 
                  onClick={() => setSelectedMitra(mitra)}
                  className="mt-auto w-full py-3 rounded-xl border-2 border-gray-100 text-gray-700 font-bold hover:bg-primary hover:border-primary hover:text-white transition-all duration-300"
                >
                  Lihat Profil
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mb-16">
            <button onClick={() => setPage(p => Math.max(p - 1, 1))} disabled={page === 1}
              className="w-10 h-10 rounded-xl flex items-center justify-center border border-gray-200 bg-white text-gray-600 hover:bg-primary hover:text-white disabled:opacity-40 transition-colors">
              <i className="fa-solid fa-chevron-left text-xs"></i>
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setPage(p)}
                className={`w-10 h-10 rounded-xl text-sm font-bold transition-colors ${page === p ? 'bg-primary text-white shadow-md' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>{p}</button>
            ))}
            <button onClick={() => setPage(p => Math.min(p + 1, totalPages))} disabled={page === totalPages}
              className="w-10 h-10 rounded-xl flex items-center justify-center border border-gray-200 bg-white text-gray-600 hover:bg-primary hover:text-white disabled:opacity-40 transition-colors">
              <i className="fa-solid fa-chevron-right text-xs"></i>
            </button>
          </div>
        )}

        {/* Ajukan Kolaborasi Banner */}
        <div className="bg-gradient-to-r from-primary to-blue-800 rounded-3xl shadow-xl overflow-hidden p-8 md:p-12 relative flex flex-col md:flex-row items-center justify-between gap-8 mt-10">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          <div className="relative z-10 md:w-2/3">
            <div className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-xs font-bold tracking-widest mb-4 border border-white/20">TERTarik Bergabung?</div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4 leading-tight">Mari Berkolaborasi dengan Bank Indonesia</h2>
            <p className="text-blue-100 text-lg">Punya komunitas atau lembaga pendidikan? Ajukan proposal kegiatan Anda dan mari bersama-sama membangun masyarakat yang lebih melek finansial.</p>
          </div>
          <div className="relative z-10 shrink-0">
            <button 
              onClick={() => setShowCollabModal(true)}
              className="px-8 py-4 bg-white text-primary font-extrabold rounded-2xl hover:scale-105 hover:shadow-lg transition-all duration-300 shadow-md flex items-center gap-3"
            >
              <i className="fa-solid fa-paper-plane"></i> Ajukan Kolaborasi
            </button>
          </div>
        </div>

      </section>

      <FloatingAction />
      <Footer />

      {/* Profil Modal */}
      {selectedMitra && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden relative animate-[fadeIn_0.2s_ease-out]">
            <button onClick={() => setSelectedMitra(null)} className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/10 hover:bg-black/20 rounded-full flex items-center justify-center text-gray-800 transition-colors backdrop-blur-md">
              <i className="fa-solid fa-times text-lg"></i>
            </button>
            
            <div className="bg-gradient-to-br from-blue-50 to-white p-10 flex flex-col items-center border-b border-gray-100 relative overflow-hidden">
               {/* decorative shapes */}
               <div className="absolute -top-10 -left-10 w-32 h-32 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-70"></div>
               <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-primary/10 rounded-full mix-blend-multiply filter blur-xl opacity-70"></div>
               
               <div className="relative w-32 h-32 rounded-2xl bg-white border border-gray-100 shadow-lg overflow-hidden flex items-center justify-center mb-6 p-4">
                  {selectedMitra.logo ? (
                    <img src={getImageUrl(selectedMitra.logo)} alt={selectedMitra.singkatan} className="w-full h-full object-contain" />
                  ) : (
                    <i className="fa-solid fa-building-ngo text-5xl text-gray-300"></i>
                  )}
                </div>
                <h3 className="font-extrabold text-3xl text-gray-800 text-center mb-2">{selectedMitra.singkatan}</h3>
                <p className="text-gray-500 text-center font-medium px-4">{selectedMitra.nama_lengkap}</p>
            </div>
            
            <div className="p-8 space-y-6">
              <div className="flex items-center gap-6">
                <div className="flex-1">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 flex items-center gap-2"><i className="fa-solid fa-tag text-primary"></i> Kategori</h4>
                  <p className="text-gray-800 font-bold">{selectedMitra.kategori}</p>
                </div>
                <div className="flex-1 border-l border-gray-100 pl-6">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 flex items-center gap-2"><i className="fa-solid fa-location-dot text-red-500"></i> Lokasi</h4>
                  <p className="text-gray-800 font-bold">{selectedMitra.lokasi}</p>
                </div>
              </div>
              <div className="pt-4 border-t border-gray-100">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2"><i className="fa-solid fa-circle-info text-blue-500"></i> Tentang Mitra</h4>
                <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                  <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{selectedMitra.deskripsi || 'Tidak ada deskripsi yang tersedia untuk mitra ini.'}</p>
                </div>
              </div>
            </div>
            
            <div className="p-6 bg-white border-t border-gray-100 flex justify-end">
              <a 
                href={`https://wa.me/${selectedMitra.no_wa.replace(/[^0-9]/g, '')}`} 
                target="_blank" 
                rel="noreferrer"
                className="w-full py-4 bg-[#25D366] hover:bg-[#1ebd5a] text-white font-extrabold text-lg rounded-xl shadow-lg shadow-green-200 transition-all duration-300 flex items-center justify-center gap-3 hover:-translate-y-1"
              >
                <i className="fa-brands fa-whatsapp text-2xl"></i> Hubungi via WhatsApp
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Ajukan Kolaborasi Modal */}
      {showCollabModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-gray-800">Form Pengajuan Kolaborasi</h2>
              <button onClick={() => setShowCollabModal(false)} className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 flex items-center justify-center">
                <i className="fa-solid fa-times"></i>
              </button>
            </div>

            <form onSubmit={submitCollab} className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Nama Singkatan <span className="text-red-500">*</span></label>
                  <input type="text" required value={collabForm.singkatan} onChange={e => setCollabForm(f=>({...f, singkatan: e.target.value}))}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                    placeholder="Contoh: GenBI"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Nama Lengkap <span className="text-red-500">*</span></label>
                  <input type="text" required value={collabForm.nama_lengkap} onChange={e => setCollabForm(f=>({...f, nama_lengkap: e.target.value}))}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                    placeholder="Contoh: Generasi Baru Indonesia"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Kategori <span className="text-red-500">*</span></label>
                  <input type="text" required value={collabForm.kategori} onChange={e => setCollabForm(f=>({...f, kategori: e.target.value}))}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                    placeholder="Contoh: Komunitas Mahasiswa"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Lokasi <span className="text-red-500">*</span></label>
                  <input type="text" required value={collabForm.lokasi} onChange={e => setCollabForm(f=>({...f, lokasi: e.target.value}))}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                    placeholder="Contoh: Jakarta"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nomor WhatsApp <span className="text-red-500">*</span></label>
                <input type="text" required value={collabForm.no_wa} onChange={e => setCollabForm(f=>({...f, no_wa: e.target.value}))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                  placeholder="Contoh: 08123456789"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Deskripsi Profil <span className="text-red-500">*</span></label>
                <textarea rows={4} required value={collabForm.deskripsi} onChange={e => setCollabForm(f=>({...f, deskripsi: e.target.value}))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none resize-none"
                  placeholder="Ceritakan tentang mitra/komunitas Anda..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Logo Mitra (Opsional)</label>
                <input type="file" accept="image/*"
                  onChange={e => setCollabForm(f => ({...f, logo: e.target.files?.[0] || null}))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setShowCollabModal(false)}
                  className="px-6 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
                >Batal</button>
                <button type="submit" disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-primary text-white font-bold hover:bg-blue-800 transition-colors disabled:opacity-50 shadow-md"
                >
                  {submitting ? 'Mengirim...' : 'Kirim Pengajuan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
