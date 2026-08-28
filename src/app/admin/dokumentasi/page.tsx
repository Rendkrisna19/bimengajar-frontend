'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Swal from 'sweetalert2';
import API, { getImageUrl } from '@/lib/api';
import { compressImageFile } from '@/lib/imageCompressor';

interface DokItem {
  id: number;
  nama_kegiatan: string;
  kategori: string;
  deskripsi: string;
  tanggal_kegiatan: string;
  posted_by: string;
  images: string[];
  video_urls: string[];
  created_at: string;
}

interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

const KATEGORI_LIST = [
  'Sosialisasi', 'Seminar', 'Workshop', 'Pameran',
  'Kunjungan', 'Pelatihan', 'Forum Diskusi', 'Lainnya',
];

function getEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url);
    // YouTube
    if (u.hostname.includes('youtube.com') || u.hostname.includes('youtu.be')) {
      const vid = u.searchParams.get('v') || u.pathname.split('/').pop();
      return `https://www.youtube.com/embed/${vid}`;
    }
    // Google Drive
    if (u.hostname.includes('drive.google.com')) {
      const match = u.pathname.match(/\/d\/([^/]+)/);
      if (match) return `https://drive.google.com/file/d/${match[1]}/preview`;
    }
    return url;
  } catch {
    return null;
  }
}

export default function AdminDokumentasiPage() {
  const [items, setItems] = useState<DokItem[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({ current_page: 1, last_page: 1, per_page: 9, total: 0 });
  const [loading, setLoading] = useState(true);
  const [filterKat, setFilterKat] = useState('');
  const [page, setPage] = useState(1);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<DokItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [previewItem, setPreviewItem] = useState<DokItem | null>(null);

  // Form states
  const [form, setForm] = useState({
    nama_kegiatan: '',
    kategori: '',
    deskripsi: '',
    tanggal_kegiatan: '',
    posted_by: '',
    video_url_input: '',
    video_urls: [] as string[],
  });

  // Multi-image management state
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [removedImageIndices, setRemovedImageIndices] = useState<number[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);

  const clearImageState = () => {
    newImagePreviews.forEach(url => URL.revokeObjectURL(url));
    setExistingImages([]);
    setRemovedImageIndices([]);
    setNewImages([]);
    setNewImagePreviews([]);
  };

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const kat = filterKat ? `&kategori=${encodeURIComponent(filterKat)}` : '';
      const res = await fetch(`${API}/dokumentasi?per_page=9&page=${page}${kat}`);
      const data = await res.json();
      if (data.status === 'success') {
        setItems(data.data.data || []);
        setMeta({
          current_page: data.data.current_page,
          last_page: data.data.last_page,
          per_page: data.data.per_page,
          total: data.data.total,
        });
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [page, filterKat]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const openCreate = () => {
    setEditItem(null);
    clearImageState();
    setForm({ nama_kegiatan: '', kategori: '', deskripsi: '', tanggal_kegiatan: '', posted_by: '', video_url_input: '', video_urls: [] });
    setIsModalOpen(true);
  };

  const openEdit = (item: DokItem) => {
    setEditItem(item);
    clearImageState();
    setExistingImages(item.images || []);
    setForm({
      nama_kegiatan: item.nama_kegiatan,
      kategori: item.kategori,
      deskripsi: item.deskripsi || '',
      tanggal_kegiatan: item.tanggal_kegiatan ? item.tanggal_kegiatan.substring(0, 10) : '',
      posted_by: item.posted_by,
      video_url_input: '',
      video_urls: item.video_urls || [],
    });
    setIsModalOpen(true);
  };

  const handleSelectFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const fileArray = Array.from(files).filter(f => f.type.startsWith('image/'));
    if (fileArray.length === 0) return;

    const compressed = await Promise.all(
      fileArray.map(f => compressImageFile(f, 1600, 1600, 0.85))
    );

    setNewImages(prev => [...prev, ...compressed]);
    const previews = compressed.map(f => URL.createObjectURL(f));
    setNewImagePreviews(prev => [...prev, ...previews]);
  };

  const handleRemoveNewImage = (idx: number) => {
    if (newImagePreviews[idx]) {
      URL.revokeObjectURL(newImagePreviews[idx]);
    }
    setNewImages(prev => prev.filter((_, i) => i !== idx));
    setNewImagePreviews(prev => prev.filter((_, i) => i !== idx));
  };

  const handleToggleRemoveExisting = (idx: number) => {
    setRemovedImageIndices(prev =>
      prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
    );
  };

  const addVideoUrl = () => {
    const url = form.video_url_input.trim();
    if (!url) return;
    if (!getEmbedUrl(url)) {
      Swal.fire('URL Tidak Valid', 'Masukkan URL YouTube atau Google Drive yang valid.', 'warning');
      return;
    }
    setForm(f => ({ ...f, video_urls: [...f.video_urls, url], video_url_input: '' }));
  };

  const removeVideoUrl = (idx: number) => {
    setForm(f => ({ ...f, video_urls: f.video_urls.filter((_, i) => i !== idx) }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nama_kegiatan || !form.kategori || !form.tanggal_kegiatan) {
      Swal.fire('Data Kurang', 'Nama kegiatan, kategori, dan tanggal wajib diisi.', 'warning');
      return;
    }
    setSaving(true);
    const token = localStorage.getItem('token');
    const fd = new FormData();
    fd.append('nama_kegiatan', form.nama_kegiatan);
    fd.append('kategori', form.kategori);
    fd.append('deskripsi', form.deskripsi);
    fd.append('tanggal_kegiatan', form.tanggal_kegiatan);
    fd.append('posted_by', form.posted_by || 'Admin BI');
    fd.append('video_urls', JSON.stringify(form.video_urls));

    if (editItem && removedImageIndices.length > 0) {
      fd.append('remove_images', JSON.stringify(removedImageIndices));
    }

    newImages.forEach(img => fd.append('images[]', img));

    const url = editItem ? `${API}/dokumentasi/${editItem.id}` : `${API}/dokumentasi`;
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
        body: fd,
      });
      const data = await res.json();
      if (data.status === 'success') {
        Swal.fire('Berhasil!', 'Dokumentasi berhasil disimpan.', 'success');
        setIsModalOpen(false);
        fetchItems();
      } else {
        Swal.fire('Gagal!', data.message || 'Terjadi kesalahan.', 'error');
      }
    } catch { Swal.fire('Error!', 'Tidak dapat terhubung ke server.', 'error'); }
    finally { setSaving(false); }
  };

  const handleDelete = (id: number) => {
    Swal.fire({ title: 'Hapus dokumentasi ini?', text: 'Foto & data akan dihapus permanen.', icon: 'warning', showCancelButton: true, confirmButtonColor: '#d33', cancelButtonColor: '#003366', confirmButtonText: 'Ya, Hapus' })
      .then(async (r) => {
        if (!r.isConfirmed) return;
        const token = localStorage.getItem('token');
        await fetch(`${API}/dokumentasi/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' } });
        fetchItems();
        Swal.fire('Terhapus!', 'Dokumentasi berhasil dihapus.', 'success');
      });
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Manajemen Dokumentasi</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Kelola foto dan video dokumentasi kegiatan BI Mengajar</p>
        </div>
        <button onClick={openCreate} className="bg-primary hover:bg-blue-800 text-white font-bold py-2.5 px-5 rounded-xl shadow-md flex items-center gap-2 transition-colors">
          <i className="fa-solid fa-plus"></i> Tambah Dokumentasi
        </button>
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <button onClick={() => { setFilterKat(''); setPage(1); }} className={`py-2 px-4 rounded-xl text-sm font-semibold transition-colors ${filterKat === '' ? 'bg-primary text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>Semua</button>
        {KATEGORI_LIST.map(k => (
          <button key={k} onClick={() => { setFilterKat(k); setPage(1); }} className={`py-2 px-4 rounded-xl text-sm font-semibold transition-colors ${filterKat === k ? 'bg-primary text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>{k}</button>
        ))}
      </div>

      {/* Stats */}
      <p className="text-sm text-gray-400 mb-4">Total: <strong className="text-gray-700">{meta.total}</strong> dokumentasi</p>

      {/* Grid Cards */}
      {loading ? (
        <div className="flex justify-center items-center h-40"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div></div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 text-gray-400 bg-white dark:bg-[#1e1e1e] rounded-2xl border border-gray-100 dark:border-gray-800">
          <i className="fa-regular fa-images text-5xl mb-4 block"></i>
          <p>Belum ada dokumentasi. Klik "Tambah Dokumentasi" untuk memulai.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map(item => (
            <div key={item.id} className="bg-white dark:bg-[#1e1e1e] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden hover:shadow-lg transition-shadow group">
              {/* Thumbnail */}
              <div className="relative h-44 bg-gray-100 overflow-hidden">
                {item.images && item.images.length > 0 ? (
                  <img
                    src={getImageUrl(item.images)}
                    alt={item.nama_kegiatan}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => { (e.target as HTMLImageElement).src = '/images/banner/hero1.png'; }}
                  />
                ) : item.video_urls && item.video_urls.length > 0 ? (
                  <div className="w-full h-full flex items-center justify-center bg-gray-800">
                    <i className="fa-brands fa-youtube text-5xl text-red-500"></i>
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300"><i className="fa-regular fa-image text-4xl"></i></div>
                )}
                <div className="absolute top-3 left-3 z-10">
                  <span className="bg-primary text-white text-xs font-bold px-2.5 py-1 rounded-full">{item.kategori}</span>
                </div>
                {item.images && item.images.length > 1 && (
                  <div className="absolute top-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded-full z-10">+{item.images.length - 1} foto</div>
                )}
                {item.video_urls && item.video_urls.length > 0 && (
                  <div className="absolute bottom-3 right-3 bg-red-600 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                    <i className="fa-brands fa-youtube"></i> {item.video_urls.length} video
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-4">
                <h3 className="font-bold text-gray-800 dark:text-white text-sm mb-1 line-clamp-1">{item.nama_kegiatan}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">{item.deskripsi || '-'}</p>
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span className="flex items-center gap-1"><i className="fa-regular fa-calendar"></i>
                    {new Date(item.tanggal_kegiatan).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                  <span className="flex items-center gap-1"><i className="fa-solid fa-user-pen"></i> {item.posted_by}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="px-4 pb-4 flex gap-2">
                <button onClick={() => setPreviewItem(item)} className="flex-1 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-xs font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-1">
                  <i className="fa-regular fa-eye"></i> Preview
                </button>
                <button onClick={() => openEdit(item)} className="flex-1 py-2 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-primary dark:text-blue-300 text-xs font-semibold hover:bg-primary hover:text-white transition-colors flex items-center justify-center gap-1">
                  <i className="fa-solid fa-pen"></i> Edit
                </button>
                <button onClick={() => handleDelete(item.id)} className="flex-1 py-2 rounded-xl bg-red-50 dark:bg-red-900/30 text-red-500 dark:text-red-400 text-xs font-semibold hover:bg-red-500 hover:text-white transition-colors flex items-center justify-center gap-1">
                  <i className="fa-solid fa-trash"></i> Hapus
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {meta.last_page > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          <button onClick={() => setPage(p => Math.max(p - 1, 1))} disabled={page === 1}
            className="w-10 h-10 rounded-xl flex items-center justify-center border border-gray-200 text-gray-600 hover:bg-primary hover:text-white hover:border-primary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          ><i className="fa-solid fa-chevron-left text-xs"></i></button>

          {Array.from({ length: meta.last_page }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => setPage(p)}
              className={`w-10 h-10 rounded-xl text-sm font-bold transition-colors ${page === p ? 'bg-primary text-white shadow-md' : 'border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
            >{p}</button>
          ))}

          <button onClick={() => setPage(p => Math.min(p + 1, meta.last_page))} disabled={page === meta.last_page}
            className="w-10 h-10 rounded-xl flex items-center justify-center border border-gray-200 text-gray-600 hover:bg-primary hover:text-white hover:border-primary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          ><i className="fa-solid fa-chevron-right text-xs"></i></button>
        </div>
      )}

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between shrink-0">
              <h2 className="text-lg font-bold text-gray-800 dark:text-white">{editItem ? 'Edit' : 'Tambah'} Dokumentasi</h2>
              <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center"><i className="fa-solid fa-times text-sm"></i></button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSave} className="overflow-y-auto p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Nama Kegiatan <span className="text-red-500">*</span></label>
                  <input type="text" required value={form.nama_kegiatan} onChange={e => setForm(f => ({...f, nama_kegiatan: e.target.value}))}
                    className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-black text-gray-800 dark:text-white rounded-xl focus:ring-2 focus:ring-primary outline-none text-sm"
                    placeholder="Contoh: Sosialisasi QRIS 2025"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Kategori <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <select required value={form.kategori} onChange={e => setForm(f => ({...f, kategori: e.target.value}))}
                      className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-black text-gray-800 dark:text-white rounded-xl focus:ring-2 focus:ring-primary outline-none text-sm appearance-none"
                    >
                      <option value="">Pilih kategori...</option>
                      {KATEGORI_LIST.map(k => <option key={k} value={k}>{k}</option>)}
                    </select>
                    <i className="fa-solid fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none"></i>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Tanggal Kegiatan <span className="text-red-500">*</span></label>
                  <input type="date" required value={form.tanggal_kegiatan} onChange={e => setForm(f => ({...f, tanggal_kegiatan: e.target.value}))}
                    className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-black text-gray-800 dark:text-white rounded-xl focus:ring-2 focus:ring-primary outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Di-posting oleh</label>
                  <input type="text" value={form.posted_by} onChange={e => setForm(f => ({...f, posted_by: e.target.value}))}
                    className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-black text-gray-800 dark:text-white rounded-xl focus:ring-2 focus:ring-primary outline-none text-sm"
                    placeholder="Admin BI"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Deskripsi Kegiatan</label>
                <textarea rows={3} value={form.deskripsi} onChange={e => setForm(f => ({...f, deskripsi: e.target.value}))}
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-black text-gray-800 dark:text-white rounded-xl focus:ring-2 focus:ring-primary outline-none text-sm resize-none"
                  placeholder="Deskripsikan kegiatan secara singkat..."
                />
              </div>

              {/* Upload Multi Foto */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Upload Foto <span className="text-xs text-gray-400">(Bisa pilih beberapa gambar sekaligus)</span>
                  </label>
                  <span className="text-xs text-primary font-semibold">
                    Total: {existingImages.length - removedImageIndices.length + newImages.length} foto
                  </span>
                </div>

                {/* File picker button area */}
                <div className="relative border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-primary dark:hover:border-primary rounded-xl p-4 text-center bg-blue-50/50 dark:bg-gray-900/50 transition-colors cursor-pointer group">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={e => { handleSelectFiles(e.target.files); e.target.value = ''; }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="flex flex-col items-center justify-center gap-1 pointer-events-none">
                    <i className="fa-solid fa-cloud-arrow-up text-2xl text-primary group-hover:scale-110 transition-transform"></i>
                    <p className="text-xs font-bold text-gray-700 dark:text-gray-200">Klik di sini untuk memilih / menambah foto</p>
                    <p className="text-[11px] text-gray-400">Format JPG, PNG, WEBP max 5MB/foto</p>
                  </div>
                </div>

                {/* Photo Previews Grid */}
                {(existingImages.length > 0 || newImagePreviews.length > 0) && (
                  <div className="space-y-2 mt-3">
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Daftar Foto:</p>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-56 overflow-y-auto p-1 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800">

                      {/* Existing Images */}
                      {existingImages.map((img, i) => {
                        const isRemoved = removedImageIndices.includes(i);
                        return (
                          <div key={`existing-${i}`} className={`relative h-20 rounded-lg overflow-hidden border transition-all group ${isRemoved ? 'border-red-400 opacity-40 grayscale' : 'border-gray-200 dark:border-gray-700'}`}>
                            <img src={getImageUrl(img)} alt={`foto-lama-${i+1}`} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = '/images/banner/hero1.png'; }} />
                            <span className="absolute top-1 left-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded font-bold">{i + 1}</span>
                            {isRemoved && (
                              <span className="absolute inset-0 flex items-center justify-center bg-red-900/60 text-white font-bold text-[10px]">
                                Dihapus
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={() => handleToggleRemoveExisting(i)}
                              title={isRemoved ? "Batal Hapus" : "Hapus Foto Ini"}
                              className={`absolute top-1 right-1 w-5 h-5 rounded-full text-[10px] flex items-center justify-center transition-all ${isRemoved ? 'bg-green-600 text-white' : 'bg-red-500/80 text-white hover:bg-red-600'}`}
                            >
                              <i className={`fa-solid ${isRemoved ? 'fa-undo' : 'fa-times'}`}></i>
                            </button>
                          </div>
                        );
                      })}

                      {/* New Images */}
                      {newImagePreviews.map((preview, i) => (
                        <div key={`new-${i}`} className="relative h-20 rounded-lg overflow-hidden border-2 border-green-400 dark:border-green-500 group">
                          <img src={preview} alt={`foto-baru-${i+1}`} className="w-full h-full object-cover" />
                          <span className="absolute top-1 left-1 bg-green-600 text-white text-[9px] px-1.5 py-0.5 rounded font-bold">Baru</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveNewImage(i)}
                            title="Hapus foto baru ini"
                            className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center hover:bg-red-600 transition-all shadow"
                          >
                            <i className="fa-solid fa-times"></i>
                          </button>
                        </div>
                      ))}

                    </div>
                  </div>
                )}
              </div>

              {/* Link Video */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Link Video <span className="text-xs text-gray-400">(YouTube / Google Drive)</span></label>
                <div className="flex gap-2">
                  <input type="url" value={form.video_url_input} onChange={e => setForm(f => ({...f, video_url_input: e.target.value}))}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addVideoUrl(); }}}
                    className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-black text-gray-800 dark:text-white rounded-xl focus:ring-2 focus:ring-primary outline-none text-sm"
                    placeholder="https://youtube.com/watch?v=..."
                  />
                  <button type="button" onClick={addVideoUrl} className="px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-blue-800 transition-colors shrink-0">
                    <i className="fa-solid fa-plus"></i> Tambah
                  </button>
                </div>
                {form.video_urls.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {form.video_urls.map((url, i) => (
                      <div key={i} className="flex items-center gap-2 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl px-3 py-2">
                        <i className={`${url.includes('youtube') || url.includes('youtu.be') ? 'fa-brands fa-youtube text-red-500' : 'fa-brands fa-google-drive text-blue-500'} text-sm`}></i>
                        <span className="text-xs text-gray-600 dark:text-gray-300 flex-1 truncate">{url}</span>
                        <button type="button" onClick={() => removeVideoUrl(i)} className="text-red-400 hover:text-red-600 text-xs shrink-0"><i className="fa-solid fa-times"></i></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer Buttons */}
              <div className="flex justify-end gap-3 pt-2 border-t border-gray-100 dark:border-gray-800">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm">Batal</button>
                <button type="submit" disabled={saving} className="px-5 py-2.5 rounded-xl bg-primary text-white font-bold hover:bg-blue-800 transition-colors text-sm disabled:opacity-50 shadow-md">
                  {saving ? <><i className="fa-solid fa-circle-notch animate-spin mr-1"></i>Menyimpan...</> : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={() => setPreviewItem(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-5 border-b border-gray-100 flex items-start justify-between shrink-0">
              <div>
                <span className="text-xs font-bold text-primary bg-blue-50 px-2 py-1 rounded-full">{previewItem.kategori}</span>
                <h2 className="text-lg font-bold text-gray-800 mt-2">{previewItem.nama_kegiatan}</h2>
                <div className="flex items-center gap-4 text-xs text-gray-400 mt-1">
                  <span><i className="fa-regular fa-calendar mr-1"></i>{new Date(previewItem.tanggal_kegiatan).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  <span><i className="fa-solid fa-user-pen mr-1"></i>{previewItem.posted_by}</span>
                </div>
              </div>
              <button onClick={() => setPreviewItem(null)} className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 flex items-center justify-center shrink-0"><i className="fa-solid fa-times text-sm"></i></button>
            </div>
            <div className="overflow-y-auto p-6 space-y-6">
              {previewItem.deskripsi && <p className="text-gray-600 leading-relaxed text-sm">{previewItem.deskripsi}</p>}

              {/* Photos */}
              {previewItem.images && previewItem.images.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-700 mb-3 text-sm"><i className="fa-regular fa-images mr-2 text-primary"></i>Foto ({previewItem.images.length})</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {previewItem.images.map((img, i) => (
                      <a key={i} href={getImageUrl(img)} target="_blank" rel="noreferrer" className="relative h-32 rounded-xl overflow-hidden border border-gray-100 block hover:opacity-90 transition-opacity">
                        <img src={getImageUrl(img)} alt={`foto-${i+1}`} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = '/images/banner/hero1.png'; }} />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Videos */}
              {previewItem.video_urls && previewItem.video_urls.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-700 mb-3 text-sm"><i className="fa-brands fa-youtube mr-2 text-red-500"></i>Video ({previewItem.video_urls.length})</h3>
                  <div className="space-y-4">
                    {previewItem.video_urls.map((url, i) => {
                      const embed = getEmbedUrl(url);
                      return embed ? (
                        <div key={i} className="relative w-full rounded-xl overflow-hidden border border-gray-100" style={{paddingTop: '56.25%'}}>
                          <iframe src={embed} className="absolute inset-0 w-full h-full" allowFullScreen title={`video-${i+1}`} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" />
                        </div>
                      ) : (
                        <a key={i} href={url} target="_blank" rel="noreferrer" className="block text-sm text-primary underline">{url}</a>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

