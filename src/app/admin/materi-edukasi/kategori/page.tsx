'use client';

import { useState, useEffect } from 'react';
import axios from '@/lib/axios';
import Swal from 'sweetalert2';
import { getImageUrl } from '@/lib/api';
import { KategoriMateri } from '../types';

export default function KategoriMateriPage() {
  const [kategori, setKategori] = useState<KategoriMateri[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editData, setEditData] = useState<KategoriMateri | null>(null);
  
  // Form state
  const [formData, setFormData] = useState<{nama: string, logo: File | null}>({
    nama: '',
    logo: null
  });

  const fetchKategori = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/kategori-materi');
      setKategori(res.data.data);
    } catch (error) {
      console.error('Error fetching kategori:', error);
      Swal.fire('Error', 'Gagal memuat data kategori materi', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKategori();
  }, []);

  const openModal = (data: KategoriMateri | null = null) => {
    if (data) {
      setEditData(data);
      setFormData({
        nama: data.nama,
        logo: null
      });
    } else {
      setEditData(null);
      setFormData({
        nama: '',
        logo: null
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditData(null);
    setFormData({ nama: '', logo: null });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama) {
      return Swal.fire('Peringatan', 'Nama kategori wajib diisi', 'warning');
    }

    try {
      setIsSubmitting(true);
      
      const payload = new FormData();
      payload.append('nama', formData.nama);
      if (formData.logo) {
        payload.append('logo', formData.logo);
      }
      
      if (editData) {
        await axios.post(`/kategori-materi/${editData.id}`, payload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        Swal.fire('Berhasil', 'Kategori berhasil diperbarui', 'success');
      } else {
        await axios.post('/kategori-materi', payload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        Swal.fire('Berhasil', 'Kategori berhasil ditambahkan', 'success');
      }
      closeModal();
      fetchKategori();
    } catch (error: any) {
      console.error('Submit error:', error);
      Swal.fire('Error', error.response?.data?.message || 'Terjadi kesalahan saat menyimpan data', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id: number) => {
    Swal.fire({
      title: 'Hapus Kategori?',
      text: 'Kategori yang dihapus tidak dapat dikembalikan!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#003366',
      confirmButtonText: 'Ya, Hapus!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`/kategori-materi/${id}`);
          Swal.fire('Terhapus!', 'Kategori telah dihapus.', 'success');
          fetchKategori();
        } catch (error: any) {
          Swal.fire('Error', error.response?.data?.message || 'Gagal menghapus kategori', 'error');
        }
      }
    });
  };

  return (
    <div className="w-full">
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Kategori Materi</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Kelola daftar kategori untuk materi edukasi.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchKategori} className="px-4 py-2.5 bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 rounded-lg shadow-sm font-medium hover:bg-gray-50 transition-colors flex items-center gap-2">
            <i className={`fa-solid fa-rotate-right ${loading ? 'animate-spin' : ''}`}></i>
          </button>
          <button onClick={() => openModal()} className="px-4 py-2.5 bg-primary text-white rounded-lg shadow-md font-medium hover:bg-blue-900 transition-colors flex items-center gap-2">
            <i className="fa-solid fa-plus"></i> Tambah Kategori
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-[#1e1e1e] rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#003366] text-white">
              <tr>
                <th className="px-5 py-4 font-semibold w-16 text-center">No.</th>
                <th className="px-5 py-4 font-semibold w-20 text-center">Logo</th>
                <th className="px-5 py-4 font-semibold">Nama Kategori</th>
                <th className="px-5 py-4 font-semibold">Slug</th>
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
              ) : kategori.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-gray-500">
                    Tidak ada data kategori.
                  </td>
                </tr>
              ) : (
                kategori.map((item, index) => (
                  <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-5 py-4 text-center text-gray-600 dark:text-gray-400">{index + 1}</td>
                    <td className="px-5 py-4 text-center">
                      {item.logo ? (
                        <div className="w-12 h-12 relative mx-auto bg-gray-50 rounded-lg p-1 border border-gray-100 flex items-center justify-center">
                          <img src={getImageUrl(item.logo)} alt={item.nama} className="max-w-full max-h-full object-contain" />
                        </div>
                      ) : (
                        <div className="w-12 h-12 mx-auto bg-gray-100 text-gray-400 rounded-lg flex items-center justify-center border border-gray-200">
                          <i className="fa-solid fa-image"></i>
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-medium text-gray-800 dark:text-gray-200">{item.nama}</span>
                    </td>
                    <td className="px-5 py-4 text-gray-500">{item.slug}</td>
                    <td className="px-5 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => openModal(item)}
                          className="w-8 h-8 rounded-lg bg-orange-50 text-orange-500 flex items-center justify-center hover:bg-orange-500 hover:text-white transition-colors"
                          title="Edit"
                        >
                          <i className="fa-solid fa-pen-to-square"></i>
                        </button>
                        <button 
                          onClick={() => handleDelete(item.id)}
                          className="w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors"
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

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-[#1e1e1e] w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-slide-up">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                {editData ? 'Edit Kategori' : 'Tambah Kategori'}
              </h3>
              <button 
                onClick={closeModal}
                className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Nama Kategori <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  required
                  value={formData.nama}
                  onChange={(e) => setFormData({...formData, nama: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-black text-gray-800 dark:text-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  placeholder="Misal: Keuangan Inklusif"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Logo Kategori {editData && <span className="text-gray-400 font-normal">(Opsional)</span>} {!editData && <span className="text-gray-400 font-normal">(Opsional)</span>}
                </label>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => setFormData({...formData, logo: e.target.files ? e.target.files[0] : null})}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-black text-gray-800 dark:text-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
              
              <div className="flex gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={closeModal}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-primary text-white font-bold hover:bg-blue-900 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? <i className="fa-solid fa-circle-notch animate-spin"></i> : <i className="fa-solid fa-save"></i>}
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
