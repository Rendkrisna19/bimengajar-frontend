'use client';

import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';

interface Mitra {
  id: number;
  logo: string;
  singkatan: string;
  nama_lengkap: string;
  kategori: string;
  lokasi: string;
  deskripsi: string;
  no_wa: string;
  status_persetujuan: string;
  is_active: boolean;
  created_at: string;
}

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
const getImageUrl = (url: string) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return API.replace('/api', '') + url;
};

export default function AdminMitraPage() {
  const [mitras, setMitras] = useState<Mitra[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Mitra | null>(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    singkatan: '',
    nama_lengkap: '',
    kategori: '',
    lokasi: '',
    deskripsi: '',
    no_wa: '',
    logo: null as File | null,
  });

  const fetchMitras = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/mitras?page=${page}&search=${search}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
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

  const openCreate = () => {
    setEditItem(null);
    setForm({ singkatan: '', nama_lengkap: '', kategori: '', lokasi: '', deskripsi: '', no_wa: '', logo: null });
    setIsModalOpen(true);
  };

  const openEdit = (item: Mitra) => {
    setEditItem(item);
    setForm({
      singkatan: item.singkatan,
      nama_lengkap: item.nama_lengkap,
      kategori: item.kategori,
      lokasi: item.lokasi,
      deskripsi: item.deskripsi,
      no_wa: item.no_wa,
      logo: null
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('singkatan', form.singkatan);
    formData.append('nama_lengkap', form.nama_lengkap);
    formData.append('kategori', form.kategori);
    formData.append('lokasi', form.lokasi);
    formData.append('deskripsi', form.deskripsi);
    formData.append('no_wa', form.no_wa);
    if (form.logo) formData.append('logo', form.logo);

    const url = editItem ? `${API}/mitras/${editItem.id}` : `${API}/mitras`;

    try {
      const res = await fetch(url, {
        method: 'POST', // using POST for FormData including files, backend uses POST for update too
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
        body: formData,
      });
      const data = await res.json();
      if (data.status === 'success') {
        Swal.fire('Berhasil!', 'Data mitra berhasil disimpan.', 'success');
        setIsModalOpen(false);
        fetchMitras();
      } else {
        Swal.fire('Gagal!', data.message || 'Terjadi kesalahan.', 'error');
      }
    } catch {
      Swal.fire('Error!', 'Tidak dapat terhubung ke server.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id: number) => {
    Swal.fire({
      title: 'Hapus Mitra?',
      text: 'Data mitra akan dihapus permanen.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#003366',
      confirmButtonText: 'Ya, Hapus'
    }).then(async (result) => {
      if (result.isConfirmed) {
        const token = localStorage.getItem('token');
        await fetch(`${API}/mitras/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
        });
        fetchMitras();
        Swal.fire('Terhapus!', 'Data mitra berhasil dihapus.', 'success');
      }
    });
  };

  const toggleStatus = async (id: number, field: string, value: any) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API}/mitras/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify({ [field]: value })
      });
      const data = await res.json();
      if (data.status === 'success') {
        fetchMitras(); // Refresh data
      } else {
        Swal.fire('Gagal', 'Tidak dapat mengubah status', 'error');
      }
    } catch (e) {
      console.error(e);
      Swal.fire('Error', 'Terjadi kesalahan jaringan', 'error');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Manajemen Mitra Edukasi</h1>
          <p className="text-sm text-gray-500 mt-1">Kelola data mitra dan persetujuan kolaborasi.</p>
        </div>
        <button onClick={openCreate}
          className="bg-primary hover:bg-blue-800 text-white font-bold py-2.5 px-5 rounded-xl shadow-md flex items-center gap-2 transition-colors"
        >
          <i className="fa-solid fa-plus"></i> Tambah Mitra
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex justify-end">
          <div className="relative">
            <input type="text" placeholder="Cari mitra..." value={search} onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
            <i className="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="bg-primary text-white">
                  <th className="px-4 py-3 w-16">Logo</th>
                  <th className="px-4 py-3">Nama Mitra</th>
                  <th className="px-4 py-3">Kategori & Lokasi</th>
                  <th className="px-4 py-3 text-center">Status Persetujuan</th>
                  <th className="px-4 py-3 text-center">Tampil di Web</th>
                  <th className="px-4 py-3 text-center w-24">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {mitras.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-10 text-gray-400">Belum ada data mitra.</td></tr>
                ) : mitras.map((mitra) => (
                  <tr key={mitra.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center p-1">
                        {mitra.logo ? (
                          <img src={getImageUrl(mitra.logo)} alt="Logo" className="w-full h-full object-contain" />
                        ) : (
                          <i className="fa-regular fa-handshake text-gray-400"></i>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-bold text-gray-800">{mitra.singkatan}</p>
                      <p className="text-xs text-gray-500">{mitra.nama_lengkap}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-primary">{mitra.kategori}</p>
                      <p className="text-xs text-gray-500"><i className="fa-solid fa-location-dot"></i> {mitra.lokasi}</p>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <select 
                        value={mitra.status_persetujuan}
                        onChange={(e) => toggleStatus(mitra.id, 'status_persetujuan', e.target.value)}
                        className={`text-xs font-bold rounded-full px-3 py-1 outline-none border cursor-pointer
                          ${mitra.status_persetujuan === 'diterima' ? 'bg-green-50 text-green-600 border-green-200' : 
                            mitra.status_persetujuan === 'ditolak' ? 'bg-red-50 text-red-600 border-red-200' : 
                            'bg-yellow-50 text-yellow-600 border-yellow-200'}`}
                      >
                        <option value="menunggu">Menunggu</option>
                        <option value="diterima">Diterima</option>
                        <option value="ditolak">Ditolak</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button 
                        onClick={() => toggleStatus(mitra.id, 'is_active', !mitra.is_active)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${mitra.is_active ? 'bg-green-500' : 'bg-gray-300'}`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${mitra.is_active ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => openEdit(mitra)} className="w-8 h-8 rounded-lg bg-blue-50 text-primary hover:bg-primary hover:text-white transition-colors flex items-center justify-center">
                          <i className="fa-solid fa-pen text-xs"></i>
                        </button>
                        <button onClick={() => handleDelete(mitra.id)} className="w-8 h-8 rounded-lg bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-colors flex items-center justify-center">
                          <i className="fa-solid fa-trash text-xs"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Pagination Bottom */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 flex justify-center gap-1">
            <button onClick={() => setPage(p => Math.max(p - 1, 1))} disabled={page === 1} className="px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50">Prev</button>
            <span className="px-3 py-1 text-sm font-bold">{page} / {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(p + 1, totalPages))} disabled={page === totalPages} className="px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50">Next</button>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <h2 className="text-lg font-bold text-gray-800">{editItem ? 'Edit Mitra' : 'Tambah Mitra'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 flex items-center justify-center">
                <i className="fa-solid fa-times"></i>
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Singkatan <span className="text-red-500">*</span></label>
                  <input type="text" required value={form.singkatan} onChange={e => setForm(f=>({...f, singkatan: e.target.value}))}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none focus:ring-1 focus:ring-primary text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Nama Lengkap <span className="text-red-500">*</span></label>
                  <input type="text" required value={form.nama_lengkap} onChange={e => setForm(f=>({...f, nama_lengkap: e.target.value}))}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none focus:ring-1 focus:ring-primary text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Kategori <span className="text-red-500">*</span></label>
                  <input type="text" required value={form.kategori} onChange={e => setForm(f=>({...f, kategori: e.target.value}))}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none focus:ring-1 focus:ring-primary text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Lokasi <span className="text-red-500">*</span></label>
                  <input type="text" required value={form.lokasi} onChange={e => setForm(f=>({...f, lokasi: e.target.value}))}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none focus:ring-1 focus:ring-primary text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nomor WA <span className="text-red-500">*</span></label>
                <input type="text" required value={form.no_wa} onChange={e => setForm(f=>({...f, no_wa: e.target.value}))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none focus:ring-1 focus:ring-primary text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Deskripsi</label>
                <textarea rows={4} value={form.deskripsi} onChange={e => setForm(f=>({...f, deskripsi: e.target.value}))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none focus:ring-1 focus:ring-primary text-sm resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Logo</label>
                <input type="file" accept="image/*" onChange={e => setForm(f=>({...f, logo: e.target.files?.[0] || null}))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none text-sm"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2 rounded-xl border text-gray-600 hover:bg-gray-50 text-sm font-medium"
                >Batal</button>
                <button type="submit" disabled={saving}
                  className="px-5 py-2 rounded-xl bg-primary text-white font-bold hover:bg-blue-800 disabled:opacity-50 text-sm shadow-md"
                >
                  {saving ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
