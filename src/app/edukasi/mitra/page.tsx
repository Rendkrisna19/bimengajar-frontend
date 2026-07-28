'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Image from 'next/image';
import Swal from 'sweetalert2';
import ParticleBackground from '@/components/ui/ParticleBackground';

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
    <main className="min-h-screen bg-gray-50 flex flex-col font-sans relative">
      <ParticleBackground />
      <Navbar />

      <section className="max-w-[1200px] mx-auto w-full px-4 md:px-8 pt-32 pb-20 flex-1 relative z-10">
        
        {/* Header & Search */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-primary mb-2">Mitra Edukasi</h1>
            <p className="text-gray-600">Temukan mitra edukasi Bank Indonesia di seluruh Indonesia.</p>
          </div>
          <div className="w-full md:w-auto relative">
            <input 
              type="text" 
              placeholder="Cari mitra..." 
              value={search}
              onChange={handleSearch}
              className="w-full md:w-72 px-4 py-2.5 pl-10 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary shadow-sm bg-white"
            />
            <i className="fa-solid fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
          </div>
        </div>

        {/* Grid Mitra */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
          </div>
        ) : mitras.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
            <p className="text-gray-500">Belum ada data mitra.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {mitras.map((mitra) => (
              <div key={mitra.id} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md border border-gray-100 transition-all flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-full bg-gray-50 border border-gray-100 overflow-hidden flex items-center justify-center mb-4 p-2 shadow-inner">
                  {mitra.logo ? (
                    <img src={getImageUrl(mitra.logo)} alt={mitra.singkatan} className="w-full h-full object-contain" />
                  ) : (
                    <i className="fa-regular fa-handshake text-3xl text-gray-400"></i>
                  )}
                </div>
                <h3 className="font-bold text-xl text-gray-800">{mitra.singkatan}</h3>
                <p className="text-sm font-medium text-gray-500 mb-2">({mitra.nama_lengkap})</p>
                <p className="text-xs text-primary bg-blue-50 px-3 py-1 rounded-full font-semibold mb-3">{mitra.kategori}</p>
                <p className="text-sm text-gray-600 mb-6 flex items-center gap-1"><i className="fa-solid fa-location-dot text-gray-400"></i> {mitra.lokasi}</p>
                
                <button 
                  onClick={() => setSelectedMitra(mitra)}
                  className="mt-auto w-full py-2.5 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
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
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Ajukan Kolaborasi</h2>
            <p className="text-gray-600">Ingin berkolaborasi dengan Bank Indonesia? Ajukan proposal kegiatan Anda di sini.</p>
          </div>
          <button 
            onClick={() => setShowCollabModal(true)}
            className="whitespace-nowrap px-6 py-3 bg-white border-2 border-primary text-primary font-bold rounded-xl hover:bg-primary hover:text-white transition-colors"
          >
            Ajukan Kolaborasi
          </button>
        </div>

      </section>

      <Footer />

      {/* Profil Modal */}
      {selectedMitra && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden relative">
            <div className="absolute top-4 right-4 z-10">
              <button onClick={() => setSelectedMitra(null)} className="w-8 h-8 bg-black/10 hover:bg-black/20 rounded-full flex items-center justify-center text-gray-700 transition-colors">
                <i className="fa-solid fa-times"></i>
              </button>
            </div>
            
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 flex flex-col items-center border-b border-gray-100">
               <div className="w-24 h-24 rounded-full bg-white border-4 border-white shadow-md overflow-hidden flex items-center justify-center mb-4 p-2">
                  {selectedMitra.logo ? (
                    <img src={getImageUrl(selectedMitra.logo)} alt={selectedMitra.singkatan} className="w-full h-full object-contain" />
                  ) : (
                    <i className="fa-regular fa-handshake text-4xl text-gray-400"></i>
                  )}
                </div>
                <h3 className="font-bold text-2xl text-gray-800 text-center">{selectedMitra.singkatan}</h3>
                <p className="text-gray-600 text-center font-medium">({selectedMitra.nama_lengkap})</p>
            </div>
            
            <div className="p-8 space-y-4">
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Kategori</h4>
                <p className="text-gray-800 font-medium">{selectedMitra.kategori}</p>
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Lokasi</h4>
                <p className="text-gray-800 font-medium"><i className="fa-solid fa-location-dot text-primary mr-1"></i> {selectedMitra.lokasi}</p>
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Deskripsi</h4>
                <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{selectedMitra.deskripsi || 'Tidak ada deskripsi.'}</p>
              </div>
            </div>
            
            <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end">
              <a 
                href={`https://wa.me/${selectedMitra.no_wa.replace(/[^0-9]/g, '')}`} 
                target="_blank" 
                rel="noreferrer"
                className="px-6 py-2.5 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl shadow-md transition-colors flex items-center gap-2"
              >
                <i className="fa-brands fa-whatsapp text-lg"></i> Hubungi Mitra
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
