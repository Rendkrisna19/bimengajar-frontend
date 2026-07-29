'use client';

import { useState, useEffect } from 'react';
import axios from '@/lib/axios';
import Swal from 'sweetalert2';
import Modal from '@/components/ui/Modal';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface Kegiatan {
  id: number;
  judul: string;
  deskripsi: string;
  tanggal_mulai: string;
  tanggal_selesai: string | null;
  lokasi: string;
  status: 'Terlaksana' | 'Belum Dilaksanakan';
  jenis_kegiatan: string;
  created_at: string;
}

export default function AdminKalenderPage() {
  const [kegiatan, setKegiatan] = useState<Kegiatan[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    judul: '',
    deskripsi: '',
    tanggal_mulai: '',
    tanggal_selesai: '',
    lokasi: '',
    status: 'Belum Dilaksanakan',
    jenis_kegiatan: 'Offline',
  });

  const fetchKegiatan = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/kalender');
      setKegiatan(res.data.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKegiatan();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      judul: '',
      deskripsi: '',
      tanggal_mulai: '',
      tanggal_selesai: '',
      lokasi: '',
      status: 'Belum Dilaksanakan',
      jenis_kegiatan: 'Offline',
    });
    setEditingId(null);
  };

  const openModalForCreate = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openModalForEdit = (item: Kegiatan) => {
    setFormData({
      judul: item.judul,
      deskripsi: item.deskripsi || '',
      tanggal_mulai: item.tanggal_mulai,
      tanggal_selesai: item.tanggal_selesai || '',
      lokasi: item.lokasi || '',
      status: item.status,
      jenis_kegiatan: item.jenis_kegiatan || 'Offline',
    });
    setEditingId(item.id);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      if (editingId) {
        await axios.put(`/kalender/${editingId}`, formData, { headers });
        Swal.fire('Berhasil!', 'Kegiatan berhasil diperbarui.', 'success');
      } else {
        await axios.post('/kalender', formData, { headers });
        Swal.fire('Berhasil!', 'Kegiatan berhasil ditambahkan.', 'success');
      }
      setIsModalOpen(false);
      fetchKegiatan();
    } catch (error) {
      console.error('Submit error:', error);
      Swal.fire('Error!', 'Gagal menyimpan data.', 'error');
    }
  };

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: 'Hapus Kegiatan?',
      text: 'Data yang dihapus tidak dapat dikembalikan!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal',
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`/kalender/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        Swal.fire('Terhapus!', 'Kegiatan berhasil dihapus.', 'success');
        fetchKegiatan();
      } catch (error) {
        Swal.fire('Error!', 'Gagal menghapus kegiatan.', 'error');
      }
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-white dark:bg-[#1e1e1e] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Daftar Kegiatan</h2>
          <button
            onClick={openModalForCreate}
            className="px-4 py-2 bg-[#003366] text-white text-sm font-semibold rounded-lg hover:bg-blue-900 transition-colors flex items-center gap-2"
          >
            <i className="fa-solid fa-plus"></i> Tambah Kegiatan
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <i className="fa-solid fa-circle-notch animate-spin text-3xl text-primary dark:text-blue-400"></i>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600 dark:text-gray-400">
              <thead className="bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 uppercase font-semibold text-xs border-b border-gray-200 dark:border-gray-800">
                <tr>
                  <th className="px-6 py-4">No</th>
                  <th className="px-6 py-4">Kegiatan</th>
                  <th className="px-6 py-4">Waktu</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {kegiatan.length > 0 ? (
                  kegiatan.map((item, index) => (
                    <tr key={item.id} className="hover:bg-blue-50/50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-6 py-4">{index + 1}</td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900 dark:text-gray-100">{item.judul}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                          <i className="fa-solid fa-location-dot"></i> {item.lokasi || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-800 dark:text-gray-200">
                          {format(new Date(item.tanggal_mulai), 'dd MMM yyyy', { locale: id })}
                        </div>
                        {item.tanggal_selesai && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            s/d {format(new Date(item.tanggal_selesai), 'dd MMM yyyy', { locale: id })}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${item.status === 'Terlaksana' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'}`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openModalForEdit(item)}
                            className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                            title="Edit"
                          >
                            <i className="fa-solid fa-pen-to-square"></i>
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center justify-center hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
                            title="Hapus"
                          >
                            <i className="fa-solid fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-gray-500 dark:text-gray-400">
                      Belum ada data kegiatan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? 'Edit Kegiatan' : 'Tambah Kegiatan'}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Judul Kegiatan <span className="text-red-500">*</span></label>
            <input
              type="text"
              name="judul"
              value={formData.judul}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366] transition-colors"
              placeholder="Contoh: Sosialisasi QRIS di Pasar Tradisional"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Tgl Mulai <span className="text-red-500">*</span></label>
              <input
                type="date"
                name="tanggal_mulai"
                value={formData.tanggal_mulai}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366] transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Tgl Selesai (Opsional)</label>
              <input
                type="date"
                name="tanggal_selesai"
                value={formData.tanggal_selesai}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366] transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Lokasi</label>
            <input
              type="text"
              name="lokasi"
              value={formData.lokasi}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366] transition-colors"
              placeholder="Contoh: Aula Desa Abiansemal"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Status <span className="text-red-500">*</span></label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366] transition-colors"
              >
                <option value="Belum Dilaksanakan">Belum Dilaksanakan</option>
                <option value="Terlaksana">Terlaksana</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Jenis Kegiatan</label>
              <select
                name="jenis_kegiatan"
                value={formData.jenis_kegiatan}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366] transition-colors"
              >
                <option value="Offline">Luring (Offline)</option>
                <option value="Online">Daring (Online)</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Deskripsi</label>
            <textarea
              name="deskripsi"
              value={formData.deskripsi}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366] transition-colors"
              placeholder="Tuliskan keterangan singkat kegiatan..."
            ></textarea>
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-5 py-2 rounded-lg font-semibold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg font-semibold text-white bg-[#003366] hover:bg-blue-900 transition-colors shadow-md"
            >
              Simpan Kegiatan
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
