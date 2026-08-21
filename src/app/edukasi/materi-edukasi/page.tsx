'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';
import Image from 'next/image';
import axios from '@/lib/axios';
import { KategoriMateri, MateriEdukasi } from '@/app/admin/materi-edukasi/types';
import PageHeader from '@/components/ui/PageHeader';
import FloatingAction from '@/components/ui/FloatingAction';

const stripHtml = (html: string) => {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/\u00A0/g, ' ').trim();
};

function MateriEdukasiContent() {
  const searchParams = useSearchParams();
  const kategoriParam = searchParams.get('kategori');

  const [kategori, setKategori] = useState<KategoriMateri[]>([]);
  const [materi, setMateri] = useState<MateriEdukasi[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [selectedKategori, setSelectedKategori] = useState<string[]>([]);
  const [selectedJenis, setSelectedJenis] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [sort, setSort] = useState('Terbaru');

  const jenisKontenList = ['Artikel', 'Infografis', 'Video', 'E-Book', 'Presentasi'];

  useEffect(() => {
    const fetchKategori = async () => {
      try {
        const res = await axios.get('/kategori-materi');
        setKategori(res.data.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchKategori();
  }, []);

  useEffect(() => {
    if (kategoriParam && kategori.length > 0) {
      const match = kategori.find(
        (k) => k.slug.toLowerCase() === kategoriParam.toLowerCase() || k.id.toString() === kategoriParam
      );
      if (match) {
        setSelectedKategori([match.id.toString()]);
      }
    }
  }, [kategoriParam, kategori]);

  const fetchMateri = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      
      if (selectedKategori.length > 0) {
        params.append('kategori_id', selectedKategori[0]); // Backend API initially structured for 1 ID
      }

      if (selectedJenis.length > 0) {
        params.append('jenis_konten', selectedJenis.join(','));
      }
      
      params.append('page', page.toString());
      
      const res = await axios.get(`/materi-edukasi?${params.toString()}`);
      setMateri(res.data.data.data || []);
      setTotalPages(res.data.data.last_page || 1);
      setTotalItems(res.data.data.total || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMateri();
  }, [search, selectedKategori, selectedJenis, page, sort]);

  const handleKategoriChange = (id: string) => {
    if (selectedKategori.includes(id)) {
      setSelectedKategori(selectedKategori.filter(k => k !== id));
    } else {
      setSelectedKategori([id]);
    }
    setPage(1);
  };

  const handleJenisChange = (jenis: string) => {
    if (selectedJenis.includes(jenis)) {
      setSelectedJenis(selectedJenis.filter(j => j !== jenis));
    } else {
      setSelectedJenis([...selectedJenis, jenis]);
    }
    setPage(1);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchMateri();
  };

  const resetFilters = () => {
    setSelectedKategori([]);
    setSelectedJenis([]);
    setSearch('');
    setPage(1);
  };

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col font-sans relative overflow-hidden">
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

      <PageHeader 
        title="Materi Edukasi" 
        description="Kumpulan materi terpercaya untuk menambah pengetahuan seputar Bank Indonesia."
        breadcrumbs={[
          { label: 'Beranda', href: '/' },
          { label: 'Edukasi', href: '/edukasi' },
          { label: 'Materi Edukasi' }
        ]}
      />

      <div className="pt-12 pb-16 px-4 md:px-8 max-w-[1400px] mx-auto w-full flex-1 z-10">

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filter */}
          <aside className="w-full lg:w-64 shrink-0">
            {/* Kategori */}
            <div className="mb-8">
              <h3 className="font-bold text-gray-800 mb-4">Kategori</h3>
              <div className="flex flex-col gap-3">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${selectedKategori.length === 0 ? 'bg-[#003366] border-[#003366]' : 'border-gray-300 group-hover:border-[#003366]'}`}>
                    {selectedKategori.length === 0 && <i className="fa-solid fa-check text-white text-[10px]"></i>}
                  </div>
                  <input type="checkbox" className="hidden" checked={selectedKategori.length === 0} onChange={() => setSelectedKategori([])} />
                  <span className={`text-sm ${selectedKategori.length === 0 ? 'font-semibold text-gray-900' : 'text-gray-600 group-hover:text-gray-900'}`}>Semua Kategori</span>
                </label>
                {kategori.map(kat => (
                  <label key={kat.id} className="flex items-center gap-3 cursor-pointer group">
                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${selectedKategori.includes(kat.id.toString()) ? 'bg-[#003366] border-[#003366]' : 'border-gray-300 group-hover:border-[#003366]'}`}>
                      {selectedKategori.includes(kat.id.toString()) && <i className="fa-solid fa-check text-white text-[10px]"></i>}
                    </div>
                    <input type="checkbox" className="hidden" checked={selectedKategori.includes(kat.id.toString())} onChange={() => handleKategoriChange(kat.id.toString())} />
                    <span className={`text-sm ${selectedKategori.includes(kat.id.toString()) ? 'font-semibold text-gray-900' : 'text-gray-600 group-hover:text-gray-900'}`}>{kat.nama}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Jenis Konten */}
            <div className="mb-8">
              <h3 className="font-bold text-gray-800 mb-4">Jenis Konten</h3>
              <div className="flex flex-col gap-3">
                {jenisKontenList.map(jenis => (
                  <label key={jenis} className="flex items-center gap-3 cursor-pointer group">
                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${selectedJenis.includes(jenis) ? 'bg-[#003366] border-[#003366]' : 'border-gray-300 group-hover:border-[#003366]'}`}>
                      {selectedJenis.includes(jenis) && <i className="fa-solid fa-check text-white text-[10px]"></i>}
                    </div>
                    <input type="checkbox" className="hidden" checked={selectedJenis.includes(jenis)} onChange={() => handleJenisChange(jenis)} />
                    <span className={`text-sm ${selectedJenis.includes(jenis) ? 'font-semibold text-gray-900' : 'text-gray-600 group-hover:text-gray-900'}`}>{jenis}</span>
                  </label>
                ))}
              </div>
            </div>

            <button 
              onClick={resetFilters}
              className="w-full py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 transition-colors text-sm"
            >
              Reset Filter
            </button>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Top Bar (Stats, Search, & Sort) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <p className="text-sm text-gray-600">
                Menampilkan <span className="font-semibold">{materi.length}</span> dari <span className="font-semibold">{totalItems}</span> materi
              </p>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <form onSubmit={handleSearchSubmit} className="relative group flex-1 sm:flex-initial">
                  <input 
                    type="text" 
                    placeholder="Cari materi..." 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full sm:w-64 px-4 py-2 pr-10 rounded-lg border border-gray-200 focus:border-[#003366] focus:ring-1 focus:ring-[#003366] transition-all bg-white text-sm shadow-sm"
                  />
                  <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-[#003366] transition-colors">
                    <i className="fa-solid fa-magnifying-glass text-sm"></i>
                  </button>
                </form>

                <select 
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:border-[#003366]"
                >
                  <option value="Terbaru">Terbaru</option>
                  <option value="Terlama">Terlama</option>
                </select>
              </div>
            </div>

            {/* Grid */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <i className="fa-solid fa-circle-notch animate-spin text-4xl text-[#003366] mb-4"></i>
                <p className="text-gray-500">Memuat materi...</p>
              </div>
            ) : materi.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <i className="fa-solid fa-folder-open text-3xl text-gray-400"></i>
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">Materi Tidak Ditemukan</h3>
                <p className="text-gray-500 max-w-md">Tidak ada materi edukasi yang sesuai dengan kriteria pencarian dan filter Anda.</p>
                <button onClick={resetFilters} className="mt-6 px-6 py-2 bg-[#fbbf24] text-white rounded-full text-sm font-semibold hover:bg-yellow-500 transition-colors shadow-sm">
                  Reset Filter
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {materi.map((item) => (
                  <div key={item.id} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_10px_30px_rgba(0,0,0,0.08)] transition-all flex flex-col group h-full">
                    <div className="h-48 bg-gray-100 relative overflow-hidden shrink-0">
                      {item.thumbnail ? (
                        <Image src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/storage/${item.thumbnail}`} alt={item.judul} fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 400px" className="object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-200">
                          <i className="fa-solid fa-image text-4xl"></i>
                        </div>
                      )}
                      <div className="absolute top-3 left-3">
                        <span className="px-3 py-1 bg-white/95 backdrop-blur shadow-sm text-[11px] font-bold text-gray-800 rounded-full">
                          {item.jenis_konten}
                        </span>
                      </div>
                    </div>
                    <div className="p-5 flex flex-col flex-1">
                      <div className="mb-3">
                        <span className="text-xs font-semibold text-[#003366] uppercase tracking-wider">{item.kategori?.nama}</span>
                      </div>
                      <h3 
                        style={(() => {
                          const matchFont = item.konten_teks?.match(/data-font="([^"]+)"/) || item.konten_teks?.match(/font-family:\s*'([^']+)'/);
                          return matchFont && matchFont[1] ? { fontFamily: `'${matchFont[1]}', sans-serif` } : undefined;
                        })()}
                        className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-[#003366] transition-colors"
                      >
                        {item.judul}
                      </h3>
                      <p className="text-sm text-gray-500 line-clamp-3 mb-6 flex-1">{item.deskripsi_singkat || stripHtml(item.konten_teks || '')}</p>
                      
                      <Link href={`/edukasi/materi-edukasi/${item.slug}`} className="w-full py-2.5 rounded-xl bg-[#fbbf24] text-center font-bold text-white text-sm hover:bg-yellow-500 shadow-sm transition-all block">
                        {item.jenis_konten === 'Video' ? 'Tonton' : 'Baca Selengkapnya'}
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {!loading && totalPages > 1 && (
              <div className="flex justify-center mt-12 gap-2">
                <button 
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="w-10 h-10 rounded-lg flex items-center justify-center border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <i className="fa-solid fa-chevron-left text-xs"></i>
                </button>
                
                {[...Array(totalPages)].map((_, i) => {
                  // Simple pagination logic (show current, +-2)
                  if (i + 1 === 1 || i + 1 === totalPages || (i + 1 >= page - 1 && i + 1 <= page + 1)) {
                    return (
                      <button 
                        key={i} 
                        onClick={() => setPage(i + 1)}
                        className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold transition-colors ${page === i + 1 ? 'bg-[#fbbf24] text-white border-transparent shadow-md' : 'border border-gray-200 text-gray-700 hover:bg-gray-50'}`}
                      >
                        {i + 1}
                      </button>
                    );
                  }
                  if (i + 1 === page - 2 || i + 1 === page + 2) {
                    return <div key={i} className="w-10 h-10 flex items-center justify-center text-gray-400">...</div>;
                  }
                  return null;
                })}

                <button 
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="w-10 h-10 rounded-lg flex items-center justify-center border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <i className="fa-solid fa-chevron-right text-xs"></i>
                </button>
              </div>
            )}
            
          </div>
        </div>
      </div>
      
      <FloatingAction />
      <Footer />
    </main>
  );
}

export default function MateriEdukasiUserPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <i className="fa-solid fa-circle-notch animate-spin text-4xl text-[#003366]"></i>
      </div>
    }>
      <MateriEdukasiContent />
    </Suspense>
  );
}
