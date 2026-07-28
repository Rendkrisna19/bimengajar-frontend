'use client';

import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';

interface NewsItem {
  id: number;
  title: string;
  slug: string;
  author: string;
  description: string;
  content: string;
  category: string;
  image: string[];
  published_at: string;
}

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
const getImageUrl = (url: string) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return API.replace('/api', '') + url;
};

export default function AdminNewsPage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<NewsItem | null>(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    title: '',
    author: 'Admin BI',
    description: '',
    content: '',
    category: 'berita',
    images: [] as File[],
  });

  const fetchNews = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/news?all=true&category=berita`);
      const data = await res.json();
      if (data.status === 'success') setNews(data.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchNews(); }, []);

  const openCreate = () => {
    setEditItem(null);
    setForm({ title: '', author: 'Admin BI', description: '', content: '', category: 'berita', images: [] });
    setIsModalOpen(true);
  };

  const openEdit = (item: NewsItem) => {
    setEditItem(item);
    setForm({ title: item.title, author: item.author, description: item.description, content: item.content, category: item.category || 'berita', images: [] });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('title', form.title);
    formData.append('author', form.author);
    formData.append('description', form.description);
    formData.append('content', form.content);
    formData.append('category', 'berita');
    form.images.forEach(img => formData.append('images[]', img));

    const url = editItem
      ? `${API}/news/${editItem.id}`
      : `${API}/news`;

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
        body: formData,
      });
      const data = await res.json();
      if (data.status === 'success') {
        Swal.fire('Berhasil!', 'Berita berhasil disimpan.', 'success');
        setIsModalOpen(false);
        fetchNews();
      } else {
        Swal.fire('Gagal!', data.message || 'Terjadi kesalahan.', 'error');
      }
    } catch {
      Swal.fire('Error!', 'Tidak dapat terhubung ke server.', 'error');
    } finally { setSaving(false); }
  };

  const handleDelete = (id: number) => {
    Swal.fire({ title: 'Hapus?', text: 'Data akan dihapus permanen.', icon: 'warning', showCancelButton: true, confirmButtonColor: '#d33', cancelButtonColor: '#003366', confirmButtonText: 'Ya, Hapus' })
      .then(async (result) => {
        if (result.isConfirmed) {
          const token = localStorage.getItem('token');
          await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/news/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
          });
          fetchNews();
          Swal.fire('Terhapus!', 'Berita berhasil dihapus.', 'success');
        }
      });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Manajemen Berita</h1>
          <p className="text-sm text-gray-500 mt-1">Kelola berita yang diterbitkan oleh BI Mengajar</p>
        </div>
        <button onClick={openCreate}
          className="bg-primary hover:bg-blue-800 text-white font-bold py-2.5 px-5 rounded-xl shadow-md flex items-center gap-2 transition-colors"
        >
          <i className="fa-solid fa-plus"></i> Tambah Baru
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-primary">
                <th className="text-left px-6 py-4 font-semibold text-white text-sm w-24">Cover</th>
                <th className="text-left px-4 py-4 font-semibold text-white text-sm">Judul</th>
                <th className="text-left px-4 py-4 font-semibold text-white text-sm">Penulis</th>
                <th className="text-left px-4 py-4 font-semibold text-white text-sm">Tanggal</th>
                <th className="text-center px-4 py-4 font-semibold text-white text-sm">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {news.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-16 text-gray-400">Belum ada data berita.</td></tr>
              ) : news.map((item) => (
                <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="w-16 h-12 rounded-lg bg-gray-100 overflow-hidden relative border border-gray-200">
                      {item.image && item.image.length > 0 ? (
                        <img src={getImageUrl(item.image[0])} alt="Cover" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300"><i className="fa-regular fa-image"></i></div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4 font-medium text-gray-800 max-w-[250px]">
                    <p className="line-clamp-1">{item.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{item.description}</p>
                  </td>
                  <td className="px-4 py-4 text-gray-600">{item.author}</td>
                  <td className="px-4 py-4 text-gray-500">
                    {new Date(item.published_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-4 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => openEdit(item)} className="w-8 h-8 rounded-lg bg-blue-50 text-primary hover:bg-primary hover:text-white transition-colors flex items-center justify-center">
                        <i className="fa-solid fa-pen text-xs"></i>
                      </button>
                      <button onClick={() => handleDelete(item.id)} className="w-8 h-8 rounded-lg bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-colors flex items-center justify-center">
                        <i className="fa-solid fa-trash text-xs"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-800">{editItem ? 'Edit' : 'Tambah'} Berita</h2>
              <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 flex items-center justify-center">
                <i className="fa-solid fa-times text-sm"></i>
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Judul <span className="text-red-500">*</span></label>
                <input type="text" required value={form.title} onChange={e => setForm(f=>({...f, title: e.target.value}))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm"
                  placeholder="Masukkan judul berita"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Penulis</label>
                <input type="text" value={form.author} onChange={e => setForm(f=>({...f, author: e.target.value}))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Ringkasan / Deskripsi</label>
                <textarea rows={3} value={form.description} onChange={e => setForm(f=>({...f, description: e.target.value}))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm resize-none"
                  placeholder="Ringkasan singkat berita..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Konten Lengkap</label>
                <textarea rows={6} value={form.content} onChange={e => setForm(f=>({...f, content: e.target.value}))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm resize-none"
                  placeholder="Tulis konten lengkap di sini..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Gambar</label>
                <input type="file" multiple accept="image/*"
                  onChange={e => setForm(f => ({...f, images: Array.from(e.target.files || [])}))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none text-sm"
                />
                <p className="text-xs text-gray-400 mt-1">Anda bisa memilih lebih dari satu gambar.</p>
              </div>
              <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                <button type="button" onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors text-sm"
                >Batal</button>
                <button type="submit" disabled={saving}
                  className="px-5 py-2.5 rounded-xl bg-primary text-white font-bold hover:bg-blue-800 transition-colors text-sm disabled:opacity-50 shadow-md"
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
