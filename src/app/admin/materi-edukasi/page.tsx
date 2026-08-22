'use client';

import { useState, useEffect } from 'react';
import axios from '@/lib/axios';
import Swal from 'sweetalert2';
import { MateriEdukasi, KategoriMateri } from './types';
import Image from 'next/image';
import Link from 'next/link';

export default function MateriEdukasiPage() {
  const [materi, setMateri] = useState<MateriEdukasi[]>([]);
  const [kategori, setKategori] = useState<KategoriMateri[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [search, setSearch] = useState('');
  const [selectedKategori, setSelectedKategori] = useState('');
  const [selectedJenis, setSelectedJenis] = useState('');

  const fetchKategori = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/kategori-materi', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setKategori(res.data.data);
    } catch (error) {
      console.error('Error fetching kategori:', error);
    }
  };

  const fetchMateri = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (selectedKategori) params.append('kategori_id', selectedKategori);
      if (selectedJenis) params.append('jenis_konten', selectedJenis);
      
      const token = localStorage.getItem('token');
      const res = await axios.get(`/materi-edukasi?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMateri(res.data.data.data || []); 
    } catch (error) {
      console.error('Error fetching materi:', error);
      Swal.fire('Error', 'Gagal memuat data materi', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKategori();
    fetchMateri();
  }, [search, selectedKategori, selectedJenis]);

  const handleDelete = (id: number) => {
    Swal.fire({
      title: 'Hapus Materi?',
      text: 'Materi yang dihapus tidak dapat dikembalikan!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#003366',
      confirmButtonText: 'Ya, Hapus!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const token = localStorage.getItem('token');
          await axios.delete(`/materi-edukasi/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          Swal.fire('Terhapus!', 'Materi telah dihapus.', 'success');
          fetchMateri();
        } catch (error: any) {
          Swal.fire('Error', error.response?.data?.message || 'Gagal menghapus materi', 'error');
        }
      }
    });
  };

  return (
    <div className="w-full">
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Daftar Materi Edukasi</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Kelola konten edukasi untuk Pojok Koin.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchMateri} className="px-4 py-2.5 bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 rounded-lg shadow-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors flex items-center gap-2">
            <i className={`fa-solid fa-rotate-right ${loading ? 'animate-spin' : ''}`}></i>
          </button>
          <Link href="/admin/materi-edukasi/create" className="px-4 py-2.5 bg-primary text-white rounded-lg shadow-md font-medium hover:bg-blue-900 transition-colors flex items-center gap-2">
            <i className="fa-solid fa-plus"></i> Tambah Materi
          </Link>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <i className="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
            <input 
              type="text" 
              placeholder="Cari judul materi..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-[#1e1e1e] w-64 focus:outline-none focus:border-primary text-gray-800 dark:text-white"
            />
          </div>
          <select 
            value={selectedKategori}
            onChange={(e) => setSelectedKategori(e.target.value)}
            className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-[#1e1e1e] focus:outline-none focus:border-primary text-gray-600 dark:text-gray-300"
          >
            <option value="">Semua Kategori</option>
            {kategori.map(k => (
              <option key={k.id} value={k.id}>{k.nama}</option>
            ))}
          </select>
          <select 
            value={selectedJenis}
            onChange={(e) => setSelectedJenis(e.target.value)}
            className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-[#1e1e1e] focus:outline-none focus:border-primary text-gray-600 dark:text-gray-300"
          >
            <option value="">Semua Jenis Konten</option>
            <option value="Artikel">Artikel</option>
            <option value="Infografis">Infografis</option>
            <option value="Video">Video</option>
            <option value="E-Book">E-Book</option>
            <option value="Presentasi">Presentasi</option>
          </select>
        </div>
      </div>

      <div className="bg-white dark:bg-[#1e1e1e] rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-primary text-white">
              <tr>
                <th className="px-5 py-4 font-semibold w-16 text-center">No.</th>
                <th className="px-5 py-4 font-semibold">Judul Materi</th>
                <th className="px-5 py-4 font-semibold">Kategori</th>
                <th className="px-5 py-4 font-semibold">Jenis</th>
                <th className="px-5 py-4 font-semibold w-32 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-gray-500">
                    <i className="fa-solid fa-circle-notch animate-spin text-2xl text-primary mb-2"></i>
                    <p>Memuat data...</p>
                  </td>
                </tr>
              ) : materi.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-gray-500">
                    Tidak ada data materi.
                  </td>
                </tr>
              ) : (
                materi.map((item, index) => (
                  <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-5 py-4 text-center text-gray-600 dark:text-gray-400">{index + 1}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {item.thumbnail ? (
                          <div className="w-12 h-12 rounded-lg overflow-hidden relative shrink-0">
                            <Image src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/storage/${item.thumbnail}`} alt={item.judul} fill sizes="48px" className="object-cover" />
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 shrink-0">
                            <i className="fa-solid fa-image"></i>
                          </div>
                        )}
                        <div>
                          <span className="font-bold text-gray-800 dark:text-gray-200 line-clamp-1">{item.judul}</span>
                          <span className="text-[12px] text-gray-500 line-clamp-1">{item.deskripsi_singkat}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-900/30 text-primary dark:text-blue-300 text-xs font-semibold">
                        {item.kategori?.nama || '-'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="px-2.5 py-1 rounded-md bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300 text-xs font-semibold">
                        {item.jenis_konten}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Link 
                          href={`/admin/materi-edukasi/edit/${item.id}`}
                          className="w-8 h-8 rounded-lg bg-orange-50 dark:bg-orange-900/30 text-orange-500 dark:text-orange-400 flex items-center justify-center hover:bg-orange-500 hover:text-white transition-colors"
                          title="Edit"
                        >
                          <i className="fa-solid fa-pen-to-square"></i>
                        </Link>
                        <button 
                          onClick={() => handleDelete(item.id)}
                          className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-500 dark:text-red-400 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors"
                          title="Hapus"
                        >
                          <i className="fa-solid fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
