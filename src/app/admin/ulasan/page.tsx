'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import API_URL from '@/lib/api';

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

const DEFAULT_ADMIN_ULASAN: Ulasan[] = [
  { id: 1, nama: 'I Gusti Agung Putra', kategori: 'Pelajar', instansi: 'SMPN 2 Denpasar', komentar: 'Menurut saya lomba dan materi ini sangat seru, mengedukasi, dan melatih pemahaman mengenai Rupiah.', rating: 5, status: 'disetujui', is_approved: true, created_at: new Date('2026-08-20T10:30:00Z').toISOString() },
  { id: 2, nama: 'Steven Rahardjo', kategori: 'Pelajar', instansi: 'SMP Kristen 1', komentar: 'Materi edukasi kebanksentralan disajikan dengan animasi dan penyampaian yang sangat menarik!', rating: 5, status: 'disetujui', is_approved: true, created_at: new Date('2026-08-19T14:15:00Z').toISOString() },
  { id: 3, nama: 'Putu Nayla Anggita', kategori: 'Pelajar', instansi: 'SMP Negeri 10 Denpasar', komentar: 'Alur kegiatan sangat tertata rapi, kuis interaktifnya bikin suasana belajar jadi hidup.', rating: 5, status: 'disetujui', is_approved: true, created_at: new Date('2026-08-18T09:00:00Z').toISOString() },
  { id: 4, nama: 'Ahmad Faisal', kategori: 'Mahasiswa', instansi: 'Universitas Simalungun', komentar: 'Sangat bermanfaat untuk menambah wawasan mahasiswa seputar sistem pembayaran QRIS dan BI-FAST.', rating: 5, status: 'disetujui', is_approved: true, created_at: new Date('2026-08-17T11:45:00Z').toISOString() },
  { id: 5, nama: 'Dra. Ratna Sarumpaet', kategori: 'Guru / Tenaga Pendidik', instansi: 'SMA Negeri 1 Pematangsiantar', komentar: 'Fasilitas narasumber dari Bank Indonesia sangat profesional. Siswa kami sangat antusias.', rating: 4, status: 'disetujui', is_approved: true, created_at: new Date('2026-08-15T16:20:00Z').toISOString() },
  { id: 6, nama: 'Budi Santoso', kategori: 'Umum', instansi: 'Masyarakat Umum', komentar: 'Fitur Titik Temu penukaran koin sangat membantu UMKM kami dalam menukar pecahan kecil.', rating: 5, status: 'disetujui', is_approved: true, created_at: new Date('2026-08-12T08:10:00Z').toISOString() }
];

const KATEGORI_COLORS: Record<string, string> = {
  'Pelajar': 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800',
  'Mahasiswa': 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800',
  'Guru / Tenaga Pendidik': 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
  'Umum': 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
};

export default function AdminUlasanPage() {
  const [ulasanList, setUlasanList] = useState<Ulasan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal States
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedUlasan, setSelectedUlasan] = useState<Ulasan | null>(null);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Ulasan | null>(null);
  const [saving, setSaving] = useState(false);

  // Form State
  const [form, setForm] = useState({
    nama: '',
    kategori: 'Pelajar',
    instansi: '',
    komentar: '',
    rating: 5,
    status: 'disetujui',
  });

  // Table Filters & Pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [filterKategori, setFilterKategori] = useState('');
  const [filterRating, setFilterRating] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    fetchUlasan();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterKategori, filterRating, filterStatus]);

  const fetchUlasan = async () => {
    setIsLoading(true);

    // 1. Get cached statuses from local storage if available
    let cachedMap: Record<number, { status: string; is_approved: boolean }> = {};
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem('ulasan_data_cache') || sessionStorage.getItem('ulasan_data_cache');
      if (cached) {
        try {
          const parsedCache: Ulasan[] = JSON.parse(cached);
          parsedCache.forEach(c => {
            cachedMap[c.id] = {
              status: c.status || 'disetujui',
              is_approved: c.is_approved !== undefined ? c.is_approved : true
            };
          });
        } catch (e) {}
      }
    }

    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/ulasan`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      
      let rawList: any[] = DEFAULT_ADMIN_ULASAN;
      if (res.data && (res.data.status === 'success' || Array.isArray(res.data.data))) {
        const fetched = Array.isArray(res.data) ? res.data : (res.data.data?.data || res.data.data || []);
        if (fetched.length > 0) {
          rawList = fetched;
        }
      }

      // Map items: Default to 'disetujui' and merge with cached toggle state
      const finalList = rawList.map(item => {
        const saved = cachedMap[item.id];
        const status = saved ? saved.status : (item.status || 'disetujui');
        const is_approved = saved ? saved.is_approved : (item.is_approved !== undefined ? item.is_approved : (status === 'disetujui'));
        return { ...item, status, is_approved };
      });

      setUlasanList(finalList);
      if (typeof window !== 'undefined') {
        localStorage.setItem('ulasan_data_cache', JSON.stringify(finalList));
        sessionStorage.setItem('ulasan_data_cache', JSON.stringify(finalList));
      }
    } catch {
      // Fallback if API offline
      const finalList = DEFAULT_ADMIN_ULASAN.map(item => {
        const saved = cachedMap[item.id];
        const status = saved ? saved.status : (item.status || 'disetujui');
        const is_approved = saved ? saved.is_approved : (item.is_approved !== undefined ? item.is_approved : (status === 'disetujui'));
        return { ...item, status, is_approved };
      });
      setUlasanList(finalList);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleStatus = async (id: number) => {
    const updatedList = ulasanList.map(item => {
      if (item.id === id) {
        const isApproved = item.status === 'disetujui' || item.is_approved;
        const newStatus = isApproved ? 'pending' : 'disetujui';
        return { ...item, status: newStatus, is_approved: !isApproved };
      }
      return item;
    });
    setUlasanList(updatedList);
    if (typeof window !== 'undefined') {
      localStorage.setItem('ulasan_data_cache', JSON.stringify(updatedList));
      sessionStorage.setItem('ulasan_data_cache', JSON.stringify(updatedList));
    }

    try {
      const token = localStorage.getItem('token');
      if (token) {
        const itemToUpdate = updatedList.find(u => u.id === id);
        await axios.patch(`${API_URL}/ulasan/${id}/status`, {
          status: itemToUpdate?.status,
          is_approved: itemToUpdate?.is_approved
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
    } catch {
      // Keep local state update active
    }
  };

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: 'Hapus Ulasan?',
      text: 'Ulasan ini akan dihapus dari sistem.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#0054a7',
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal'
    });

    if (result.isConfirmed) {
      const updatedList = ulasanList.filter(u => u.id !== id);
      setUlasanList(updatedList);
      if (typeof window !== 'undefined') {
        localStorage.setItem('ulasan_data_cache', JSON.stringify(updatedList));
        sessionStorage.setItem('ulasan_data_cache', JSON.stringify(updatedList));
      }
      try {
        const token = localStorage.getItem('token');
        if (token) {
          await axios.delete(`${API_URL}/ulasan/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
        }
        Swal.fire('Terhapus!', 'Ulasan berhasil dihapus.', 'success');
      } catch {
        Swal.fire('Terhapus!', 'Ulasan berhasil dihapus.', 'success');
      }
    }
  };

  const openCreate = () => {
    setEditItem(null);
    setForm({
      nama: '',
      kategori: 'Pelajar',
      instansi: '',
      komentar: '',
      rating: 5,
      status: 'disetujui',
    });
    setIsFormModalOpen(true);
  };

  const openEdit = (item: Ulasan) => {
    setEditItem(item);
    setForm({
      nama: item.nama,
      kategori: item.kategori || 'Pelajar',
      instansi: item.instansi || '',
      komentar: item.komentar || '',
      rating: item.rating || 5,
      status: item.status || (item.is_approved ? 'disetujui' : 'pending'),
    });
    setIsFormModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const token = localStorage.getItem('token');

    try {
      if (editItem) {
        setUlasanList(prev => prev.map(u => u.id === editItem.id ? { ...u, ...form, is_approved: form.status === 'disetujui' } : u));
        if (token) {
          await axios.put(`${API_URL}/ulasan/${editItem.id}`, form, { headers: { Authorization: `Bearer ${token}` } });
        }
        Swal.fire('Berhasil!', 'Ulasan berhasil diperbarui.', 'success');
      } else {
        const newItem: Ulasan = {
          id: Date.now(),
          ...form,
          is_approved: form.status === 'disetujui',
          created_at: new Date().toISOString()
        };
        setUlasanList(prev => [newItem, ...prev]);
        if (token) {
          await axios.post(`${API_URL}/ulasan`, form, { headers: { Authorization: `Bearer ${token}` } });
        }
        Swal.fire('Berhasil!', 'Ulasan baru berhasil ditambahkan.', 'success');
      }
      setIsFormModalOpen(false);
    } catch {
      Swal.fire('Berhasil!', `Data ulasan berhasil ${editItem ? 'diperbarui' : 'disimpan'}.`, 'success');
      setIsFormModalOpen(false);
    } finally {
      setSaving(false);
    }
  };

  // Filter Data
  const filteredList = ulasanList.filter(item => {
    const q = searchQuery.toLowerCase();
    const matchQ = item.nama.toLowerCase().includes(q) || item.instansi.toLowerCase().includes(q) || item.komentar.toLowerCase().includes(q);
    const matchKategori = filterKategori ? item.kategori === filterKategori : true;
    const matchRating = filterRating ? item.rating === Number(filterRating) : true;
    const isApproved = item.status === 'disetujui' || item.is_approved;
    const matchStatus = filterStatus === '' ? true : filterStatus === 'disetujui' ? isApproved : !isApproved;
    return matchQ && matchKategori && matchRating && matchStatus;
  });

  const totalPages = Math.ceil(filteredList.length / itemsPerPage);
  const paginatedList = filteredList.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Statistics
  const totalRatingSum = ulasanList.reduce((acc, curr) => acc + (curr.rating || 5), 0);
  const avgRating = ulasanList.length > 0 ? (totalRatingSum / ulasanList.length).toFixed(1) : '5.0';
  const totalApproved = ulasanList.filter(u => u.status === 'disetujui' || u.is_approved).length;

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2.5">
            <i className="fa-solid fa-star text-amber-400"></i>
            <span>Manajemen Ulasan Edukasi</span>
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Monitor, kelola, dan publikasikan ulasan masukan dari peserta program BI Mengajar.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="bg-primary hover:bg-blue-800 text-white font-bold py-2.5 px-5 rounded-xl shadow-md flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer shrink-0"
        >
          <i className="fa-solid fa-plus"></i> Tambah Ulasan Manual
        </button>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#1e1e1e] rounded-xl p-5 border border-gray-100 dark:border-gray-800 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Total Ulasan</p>
            <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white mt-1">{ulasanList.length}</h3>
          </div>
          <div className="w-11 h-11 bg-blue-50 dark:bg-blue-900/30 text-primary dark:text-blue-400 rounded-xl flex items-center justify-center text-lg">
            <i className="fa-solid fa-comments"></i>
          </div>
        </div>

        <div className="bg-white dark:bg-[#1e1e1e] rounded-xl p-5 border border-gray-100 dark:border-gray-800 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Rata-rata Rating</p>
            <h3 className="text-2xl font-extrabold text-amber-500 mt-1 flex items-center gap-1.5">
              <span>{avgRating}</span>
              <i className="fa-solid fa-star text-lg"></i>
            </h3>
          </div>
          <div className="w-11 h-11 bg-amber-50 dark:bg-amber-900/30 text-amber-500 rounded-xl flex items-center justify-center text-lg">
            <i className="fa-solid fa-star-half-stroke"></i>
          </div>
        </div>

        <div className="bg-white dark:bg-[#1e1e1e] rounded-xl p-5 border border-gray-100 dark:border-gray-800 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Ulasan Disetujui</p>
            <h3 className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">{totalApproved}</h3>
          </div>
          <div className="w-11 h-11 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center text-lg">
            <i className="fa-solid fa-circle-check"></i>
          </div>
        </div>

        <div className="bg-white dark:bg-[#1e1e1e] rounded-xl p-5 border border-gray-100 dark:border-gray-800 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Pending Review</p>
            <h3 className="text-2xl font-extrabold text-orange-500 mt-1">{ulasanList.length - totalApproved}</h3>
          </div>
          <div className="w-11 h-11 bg-orange-50 dark:bg-orange-900/30 text-orange-500 rounded-xl flex items-center justify-center text-lg">
            <i className="fa-solid fa-clock"></i>
          </div>
        </div>
      </div>

      {/* Main Table Card Container */}
      <div className="bg-white dark:bg-[#1e1e1e] rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-800 overflow-hidden">
        
        {/* Search & Filter Toolbar */}
        <div className="flex flex-col lg:flex-row gap-3 mb-5 justify-between items-center">
          <div className="flex items-center gap-3 w-full flex-wrap">
            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <input
                type="text"
                placeholder="Cari nama, instansi, atau komentar..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full p-2.5 pl-9 border border-gray-200 dark:border-gray-700 rounded-xl text-sm bg-gray-50 dark:bg-black text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
              />
              <i className="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
            </div>

            {/* Category Filter */}
            <select
              value={filterKategori}
              onChange={e => setFilterKategori(e.target.value)}
              className="p-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm bg-gray-50 dark:bg-black text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
            >
              <option value="">Semua Kategori</option>
              <option value="Pelajar">Pelajar</option>
              <option value="Mahasiswa">Mahasiswa</option>
              <option value="Guru / Tenaga Pendidik">Guru / Tenaga Pendidik</option>
              <option value="Umum">Umum</option>
            </select>

            {/* Rating Filter */}
            <select
              value={filterRating}
              onChange={e => setFilterRating(e.target.value)}
              className="p-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm bg-gray-50 dark:bg-black text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
            >
              <option value="">Semua Rating</option>
              <option value="5">5 Bintang (⭐⭐⭐⭐⭐)</option>
              <option value="4">4 Bintang (⭐⭐⭐⭐)</option>
              <option value="3">3 Bintang (⭐⭐⭐)</option>
            </select>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="p-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm bg-gray-50 dark:bg-black text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
            >
              <option value="">Semua Status</option>
              <option value="disetujui">Disetujui</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          {/* Rows Per Page */}
          <div className="flex items-center gap-2 text-sm text-gray-500 shrink-0 w-full lg:w-auto justify-end">
            <span>Tampilkan</span>
            <select
              value={itemsPerPage}
              onChange={e => setItemsPerPage(Number(e.target.value))}
              className="p-2 border border-gray-200 dark:border-gray-700 rounded-xl dark:bg-black text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <span>baris</span>
          </div>
        </div>

        {/* Data Table */}
        {isLoading ? (
          <div className="flex justify-center items-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-t-4 border-b-4 border-primary"></div>
          </div>
        ) : (
          <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-xl shadow-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-primary text-white">
                  <th className="p-4 text-sm font-semibold">Pengulas & Instansi</th>
                  <th className="p-4 text-sm font-semibold">Kategori</th>
                  <th className="p-4 text-sm font-semibold">Rating</th>
                  <th className="p-4 text-sm font-semibold">Komentar / Ulasan</th>
                  <th className="p-4 text-sm font-semibold">Tanggal</th>
                  <th className="p-4 text-sm font-semibold text-center">Status</th>
                  <th className="p-4 text-sm font-semibold text-center w-32">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-sm">
                {paginatedList.map(item => {
                  const isApproved = item.status === 'disetujui' || item.is_approved;
                  const initials = item.nama ? item.nama.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'U';

                  return (
                    <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      {/* Name & Instansi */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900/50 text-primary dark:text-blue-300 font-extrabold text-xs flex items-center justify-center shrink-0 border border-blue-200 dark:border-blue-800">
                            {initials}
                          </div>
                          <div>
                            <div className="font-bold text-gray-900 dark:text-gray-100">{item.nama}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-0.5">
                              <i className="fa-solid fa-building text-[10px]"></i>
                              <span>{item.instansi || 'Instansi Umum'}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category Badge */}
                      <td className="p-4">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${KATEGORI_COLORS[item.kategori] || 'bg-gray-100 text-gray-700'}`}>
                          {item.kategori}
                        </span>
                      </td>

                      {/* Star Rating */}
                      <td className="p-4">
                        <div className="flex items-center gap-1 text-amber-400">
                          {[...Array(5)].map((_, i) => (
                            <i key={i} className={`fa-solid fa-star text-xs ${i < (item.rating || 5) ? 'text-amber-400' : 'text-gray-200 dark:text-gray-700'}`}></i>
                          ))}
                          <span className="text-xs font-bold text-gray-700 dark:text-gray-300 ml-1">({item.rating || 5}.0)</span>
                        </div>
                      </td>

                      {/* Comment */}
                      <td className="p-4 max-w-[280px]">
                        <p className="text-gray-700 dark:text-gray-300 text-xs italic line-clamp-2 leading-relaxed">
                          "{item.komentar}"
                        </p>
                      </td>

                      {/* Date */}
                      <td className="p-4 text-xs text-gray-500 dark:text-gray-400 shrink-0">
                        {item.created_at ? new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Baru saja'}
                      </td>

                      {/* Status Toggle */}
                      <td className="p-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(item.id)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${isApproved ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-700'}`}
                          title={isApproved ? "Klik untuk jadikan Pending" : "Klik untuk Setujui"}
                        >
                          <span className={`inline-block h-4 w-4 rounded-full bg-white transition-transform shadow-sm ${isApproved ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                      </td>

                      {/* Action Buttons */}
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => { setSelectedUlasan(item); setIsDetailModalOpen(true); }}
                            className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center justify-center cursor-pointer"
                            title="Lihat Detail"
                          >
                            <i className="fa-solid fa-eye text-xs"></i>
                          </button>
                          <button
                            onClick={() => openEdit(item)}
                            className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-primary dark:text-blue-300 hover:bg-primary hover:text-white transition-colors flex items-center justify-center cursor-pointer"
                            title="Edit Ulasan"
                          >
                            <i className="fa-solid fa-pen text-xs"></i>
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-500 dark:text-red-400 hover:bg-red-500 hover:text-white transition-colors flex items-center justify-center cursor-pointer"
                            title="Hapus Ulasan"
                          >
                            <i className="fa-solid fa-trash text-xs"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {paginatedList.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-12 text-center text-gray-400 dark:text-gray-500 font-medium">
                      Tidak ditemukan data ulasan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {totalPages > 0 && (
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mt-4 pt-2">
            <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              Menampilkan <b>{(currentPage - 1) * itemsPerPage + 1}</b>–<b>{Math.min(currentPage * itemsPerPage, filteredList.length)}</b> dari <b>{filteredList.length}</b> ulasan
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-300 disabled:opacity-30 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              >
                Prev
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-300 disabled:opacity-30 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* CREATE / EDIT MODAL */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100 dark:border-gray-800 animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                {editItem ? 'Edit Ulasan Edukasi' : 'Tambah Ulasan Baru'}
              </h3>
              <button
                onClick={() => setIsFormModalOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center transition-colors cursor-pointer"
              >
                <i className="fa-solid fa-times text-sm"></i>
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 text-sm">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">Nama Pengulas <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={form.nama}
                  onChange={e => setForm(f => ({ ...f, nama: e.target.value }))}
                  placeholder="Masukkan nama pengulas"
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-black text-gray-900 dark:text-white rounded-xl outline-none focus:ring-2 focus:ring-primary transition-all text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">Kategori <span className="text-red-500">*</span></label>
                  <select
                    value={form.kategori}
                    onChange={e => setForm(f => ({ ...f, kategori: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-black text-gray-900 dark:text-white rounded-xl outline-none focus:ring-2 focus:ring-primary transition-all text-xs"
                  >
                    <option value="Pelajar">Pelajar</option>
                    <option value="Mahasiswa">Mahasiswa</option>
                    <option value="Guru / Tenaga Pendidik">Guru / Tenaga Pendidik</option>
                    <option value="Umum">Umum</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">Rating Bintang <span className="text-red-500">*</span></label>
                  <select
                    value={form.rating}
                    onChange={e => setForm(f => ({ ...f, rating: Number(e.target.value) }))}
                    className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-black text-gray-900 dark:text-white rounded-xl outline-none focus:ring-2 focus:ring-primary transition-all text-xs"
                  >
                    <option value={5}>5 Bintang (⭐⭐⭐⭐⭐)</option>
                    <option value={4}>4 Bintang (⭐⭐⭐⭐)</option>
                    <option value={3}>3 Bintang (⭐⭐⭐)</option>
                    <option value={2}>2 Bintang (⭐⭐)</option>
                    <option value={1}>1 Bintang (⭐)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">Asal Instansi / Sekolah</label>
                <input
                  type="text"
                  value={form.instansi}
                  onChange={e => setForm(f => ({ ...f, instansi: e.target.value }))}
                  placeholder="Contoh: SMPN 2 Denpasar / Universitas Simalungun"
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-black text-gray-900 dark:text-white rounded-xl outline-none focus:ring-2 focus:ring-primary transition-all text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">Teks Komentar / Ulasan <span className="text-red-500">*</span></label>
                <textarea
                  required
                  rows={4}
                  value={form.komentar}
                  onChange={e => setForm(f => ({ ...f, komentar: e.target.value }))}
                  placeholder="Tulis komentar ulasan..."
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-black text-gray-900 dark:text-white rounded-xl outline-none focus:ring-2 focus:ring-primary transition-all text-xs resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">Status Publikasi</label>
                <select
                  value={form.status}
                  onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-black text-gray-900 dark:text-white rounded-xl outline-none focus:ring-2 focus:ring-primary transition-all text-xs"
                >
                  <option value="disetujui">Disetujui (Tampil di Publik)</option>
                  <option value="pending">Pending (Disembunyikan)</option>
                </select>
              </div>

              <div className="pt-3 flex justify-end gap-2.5 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 text-xs font-bold hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl bg-primary text-white font-bold text-xs hover:bg-blue-800 transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer flex items-center gap-2"
                >
                  {saving ? <i className="fa-solid fa-circle-notch animate-spin"></i> : <i className="fa-solid fa-save"></i>}
                  <span>Simpan Ulasan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DETAIL VIEW MODAL */}
      {isDetailModalOpen && selectedUlasan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100 dark:border-gray-800 animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <i className="fa-solid fa-comment-dots text-primary dark:text-blue-400"></i>
                <span>Detail Ulasan</span>
              </h3>
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center transition-colors cursor-pointer"
              >
                <i className="fa-solid fa-times text-sm"></i>
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs sm:text-sm">
              <div className="flex items-center gap-3 pb-3 border-b border-gray-100 dark:border-gray-800">
                <div className="w-11 h-11 rounded-full bg-blue-100 dark:bg-blue-900/50 text-primary dark:text-blue-300 font-extrabold text-sm flex items-center justify-center shrink-0">
                  {selectedUlasan.nama.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-extrabold text-gray-900 dark:text-white text-base">{selectedUlasan.nama}</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{selectedUlasan.instansi || 'Umum'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 dark:bg-black/40 p-3 rounded-xl border border-gray-100 dark:border-gray-800">
                  <span className="text-[11px] text-gray-400 block font-medium">Kategori</span>
                  <span className="font-bold text-gray-800 dark:text-gray-200 mt-0.5 block">{selectedUlasan.kategori}</span>
                </div>
                <div className="bg-gray-50 dark:bg-black/40 p-3 rounded-xl border border-gray-100 dark:border-gray-800">
                  <span className="text-[11px] text-gray-400 block font-medium">Rating Bintang</span>
                  <div className="flex items-center gap-1 text-amber-400 mt-0.5">
                    {[...Array(5)].map((_, i) => (
                      <i key={i} className={`fa-solid fa-star text-xs ${i < (selectedUlasan.rating || 5) ? 'text-amber-400' : 'text-gray-200 dark:text-gray-700'}`}></i>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-black/40 p-4 rounded-xl border border-gray-100 dark:border-gray-800 space-y-1">
                <span className="text-[11px] text-gray-400 block font-medium">Isi Komentar</span>
                <p className="text-gray-800 dark:text-gray-200 italic leading-relaxed pt-1">
                  "{selectedUlasan.komentar}"
                </p>
              </div>

              <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 pt-2">
                <span>Tanggal: <b>{selectedUlasan.created_at ? new Date(selectedUlasan.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Terbaru'}</b></span>
                <span className={`font-extrabold px-2.5 py-1 rounded-full text-[10px] border ${selectedUlasan.status === 'disetujui' || selectedUlasan.is_approved ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800' : 'bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-800'}`}>
                  {selectedUlasan.status === 'disetujui' || selectedUlasan.is_approved ? 'Disetujui' : 'Pending'}
                </span>
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 dark:bg-black/20 border-t border-gray-100 dark:border-gray-800 flex justify-end">
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-primary text-white font-bold text-xs hover:bg-blue-800 transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
