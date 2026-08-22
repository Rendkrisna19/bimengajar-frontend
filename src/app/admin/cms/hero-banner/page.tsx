'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Swal from 'sweetalert2';

interface HeroBannerItem {
  id: number;
  title: string;
  title_en?: string | null;
  subtitle: string;
  subtitle_en?: string | null;
  button_primary_text: string | null;
  button_primary_text_en?: string | null;
  button_primary_url: string | null;
  button_secondary_text: string | null;
  button_secondary_text_en?: string | null;
  button_secondary_url: string | null;
  image: string | null;
  image_url: string | null;
  is_active: boolean;
  order: number;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export default function AdminHeroBannerPage() {
  const [banners, setBanners] = useState<HeroBannerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState<HeroBannerItem | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [subtitleEn, setSubtitleEn] = useState('');
  const [buttonPrimaryText, setButtonPrimaryText] = useState('Ajukan Edukasi');
  const [buttonPrimaryTextEn, setButtonPrimaryTextEn] = useState('Request Education');
  const [buttonPrimaryUrl, setButtonPrimaryUrl] = useState('/edukasi/pengajuan');
  const [buttonSecondaryText, setButtonSecondaryText] = useState('Jelajahi Materi');
  const [buttonSecondaryTextEn, setButtonSecondaryTextEn] = useState('Explore Materials');
  const [buttonSecondaryUrl, setButtonSecondaryUrl] = useState('/edukasi/materi-edukasi');
  const [order, setOrder] = useState<number>(1);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/hero-banners?all=true`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Accept': 'application/json'
        }
      });
      const data = await res.json();
      if (data.status === 'success') {
        setBanners(data.data || []);
      }
    } catch (err) {
      console.error(err);
      Swal.fire('Gagal', 'Tidak dapat mengambil data Hero Banner', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const openAddModal = () => {
    setEditingBanner(null);
    setTitle('');
    setTitleEn('');
    setSubtitle('');
    setSubtitleEn('');
    setButtonPrimaryText('Ajukan Edukasi');
    setButtonPrimaryTextEn('Request Education');
    setButtonPrimaryUrl('/edukasi/pengajuan');
    setButtonSecondaryText('Jelajahi Materi');
    setButtonSecondaryTextEn('Explore Materials');
    setButtonSecondaryUrl('/edukasi/materi-edukasi');
    setOrder(banners.length + 1);
    setIsActive(true);
    setImageFile(null);
    setImagePreview(null);
    setShowModal(true);
  };

  const openEditModal = (banner: HeroBannerItem) => {
    setEditingBanner(banner);
    setTitle(banner.title);
    setTitleEn(banner.title_en || '');
    setSubtitle(banner.subtitle);
    setSubtitleEn(banner.subtitle_en || '');
    setButtonPrimaryText(banner.button_primary_text || '');
    setButtonPrimaryTextEn(banner.button_primary_text_en || '');
    setButtonPrimaryUrl(banner.button_primary_url || '');
    setButtonSecondaryText(banner.button_secondary_text || '');
    setButtonSecondaryTextEn(banner.button_secondary_text_en || '');
    setButtonSecondaryUrl(banner.button_secondary_url || '');
    setOrder(banner.order || 1);
    setIsActive(banner.is_active);
    setImageFile(null);
    setImagePreview(banner.image_url || null);
    setShowModal(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        Swal.fire('Ukuran Terlalu Besar', 'Ukuran berkas gambar maksimal adalah 5MB. Silakan pilih gambar yang lebih kecil.', 'warning');
        e.target.value = '';
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !subtitle) {
      Swal.fire('Perhatian', 'Judul dan Subjudul wajib diisi', 'warning');
      return;
    }

    if (imageFile && imageFile.size > 5 * 1024 * 1024) {
      Swal.fire('Ukuran Terlalu Besar', 'Ukuran gambar maksimal adalah 5MB.', 'warning');
      return;
    }

    try {
      setSubmitting(true);
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('title', title);
      if (titleEn) formData.append('title_en', titleEn);
      formData.append('subtitle', subtitle);
      if (subtitleEn) formData.append('subtitle_en', subtitleEn);
      formData.append('button_primary_text', buttonPrimaryText);
      if (buttonPrimaryTextEn) formData.append('button_primary_text_en', buttonPrimaryTextEn);
      formData.append('button_primary_url', buttonPrimaryUrl);
      formData.append('button_secondary_text', buttonSecondaryText);
      if (buttonSecondaryTextEn) formData.append('button_secondary_text_en', buttonSecondaryTextEn);
      formData.append('button_secondary_url', buttonSecondaryUrl);
      formData.append('order', order.toString());
      formData.append('is_active', isActive ? '1' : '0');

      if (imageFile) {
        formData.append('image', imageFile);
      }

      const url = editingBanner
        ? `${API_BASE}/hero-banners/${editingBanner.id}`
        : `${API_BASE}/hero-banners`;

      const res = await fetch(url, {
        method: 'POST', // POST used for form-data in Laravel
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Accept': 'application/json'
        },
        body: formData
      });

      if (res.status === 413) {
        Swal.fire('Ukuran Terlalu Besar', 'Ukuran berkas gambar terlalu besar untuk server (Maksimal 5MB). Silakan gunakan gambar yang lebih kecil.', 'error');
        return;
      }

      const contentType = res.headers.get('content-type');
      let data: any = {};
      if (contentType && contentType.includes('application/json')) {
        data = await res.json();
      } else {
        const rawText = await res.text();
        console.error('Non-JSON server response:', rawText);
        Swal.fire('Gagal', `Terjadi kesalahan pada server (Status ${res.status}).`, 'error');
        return;
      }

      if (res.ok && data.status === 'success') {
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('hero_banners_cache');
        }
        Swal.fire('Berhasil', data.message || 'Data berhasil disimpan', 'success');
        setShowModal(false);
        fetchBanners();
      } else {
        Swal.fire('Gagal', data.message || 'Gagal menyimpan data', 'error');
      }
    } catch (err) {
      console.error(err);
      Swal.fire('Gagal', 'Terjadi kesalahan sistem saat menyimpan data', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (id: number) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/hero-banners/${id}/toggle`, {
        method: 'PATCH',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Accept': 'application/json'
        }
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        if (typeof window !== 'undefined') sessionStorage.removeItem('hero_banners_cache');
        fetchBanners();
      } else {
        Swal.fire('Gagal', data.message || 'Gagal mengubah status', 'error');
      }
    } catch (err) {
      console.error(err);
      Swal.fire('Gagal', 'Tidak terhubung ke server', 'error');
    }
  };

  const handleDelete = (id: number) => {
    Swal.fire({
      title: 'Hapus Hero Banner?',
      text: 'Tindakan ini tidak dapat dibatalkan.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#003366',
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const token = localStorage.getItem('token');
          const res = await fetch(`${API_BASE}/hero-banners/${id}`, {
            method: 'DELETE',
            headers: {
              'Authorization': token ? `Bearer ${token}` : '',
              'Accept': 'application/json'
            }
          });
          const data = await res.json();
          if (res.ok && data.status === 'success') {
            if (typeof window !== 'undefined') sessionStorage.removeItem('hero_banners_cache');
            Swal.fire('Terhapus!', 'Hero Banner berhasil dihapus.', 'success');
            fetchBanners();
          } else {
            Swal.fire('Gagal', data.message || 'Gagal menghapus data', 'error');
          }
        } catch (err) {
          Swal.fire('Gagal', 'Tidak terhubung ke server', 'error');
        }
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-[#1e1e1e] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold text-primary dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full mb-2">
            <i className="fa-solid fa-sliders"></i> Content Management System
          </div>
          <h1 className="text-2xl font-extrabold text-gray-800 dark:text-white tracking-tight">
            Kelola Hero Banner
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Atur judul, subjudul, ilustrasi gambar, dan tombol aksi untuk slide Hero Section di Beranda Utama.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="bg-primary hover:bg-blue-900 text-white font-bold px-5 py-3 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-sm shrink-0"
        >
          <i className="fa-solid fa-plus"></i> Tambah Banner Baru
        </button>
      </div>

      {/* Table Section */}
      <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
          </div>
        ) : banners.length === 0 ? (
          <div className="text-center py-16 px-4">
            <i className="fa-solid fa-images text-5xl text-gray-300 dark:text-gray-600 mb-3 block"></i>
            <h3 className="text-lg font-bold text-gray-700 dark:text-gray-200">Belum ada Hero Banner</h3>
            <p className="text-sm text-gray-400 max-w-md mx-auto mt-1">
              Klik tombol "Tambah Banner Baru" untuk menambahkan slide gambar & konten hero section di beranda.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-primary text-white text-xs font-bold uppercase tracking-wider">
                  <th className="p-4 text-center w-16">Urutan</th>
                  <th className="p-4">Banner / Ilustrasi</th>
                  <th className="p-4">Judul & Subjudul</th>
                  <th className="p-4">Tombol Aksi</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-sm">
                {banners.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                    <td className="p-4 text-center font-bold text-gray-500">
                      #{item.order}
                    </td>
                    <td className="p-4">
                      <div className="relative w-24 h-16 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shrink-0">
                        {item.image_url ? (
                          <img
                            src={item.image_url}
                            alt={item.title}
                            className="w-full h-full object-contain p-1"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                            Tidak ada
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-4 max-w-xs">
                      <h4 className="font-bold text-gray-800 dark:text-white line-clamp-1 whitespace-pre-line">
                        {item.title}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mt-1">
                        {item.subtitle}
                      </p>
                    </td>
                    <td className="p-4 text-xs space-y-1">
                      {item.button_primary_text && (
                        <div className="inline-block bg-yellow-50 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 font-medium px-2.5 py-1 rounded border border-yellow-200 dark:border-yellow-800 mr-1">
                          1: {item.button_primary_text}
                        </div>
                      )}
                      {item.button_secondary_text && (
                        <div className="inline-block bg-blue-50 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 font-medium px-2.5 py-1 rounded border border-blue-200 dark:border-blue-800">
                          2: {item.button_secondary_text}
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleToggle(item.id)}
                        className={`px-3 py-1 rounded-full text-xs font-bold transition-all border ${
                          item.is_active
                            ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800'
                            : 'bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700'
                        }`}
                      >
                        {item.is_active ? '● Aktif' : '○ Nonaktif'}
                      </button>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openEditModal(item)}
                          className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 transition-colors"
                          title="Edit Banner"
                        >
                          <i className="fa-solid fa-pen-to-square"></i>
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 transition-colors"
                          title="Hapus Banner"
                        >
                          <i className="fa-solid fa-trash-can"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Form Add/Edit */}
      {showModal && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-hidden animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#1e1e1e] rounded-3xl max-w-2xl w-full max-h-[90vh] shadow-2xl border border-gray-100 dark:border-gray-800 flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between shrink-0 bg-primary text-white">
              <h2 className="text-base font-bold flex items-center gap-2">
                <i className="fa-solid fa-sliders"></i>
                <span>{editingBanner ? 'Edit Hero Banner' : 'Tambah Hero Banner Baru'}</span>
              </h2>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            {/* Scrollable Form Content */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 md:p-8 space-y-5 text-sm custom-scrollbar">
              {/* Title & Title EN */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Judul Banner (Bahasa Indonesia) <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={2}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Contoh: Edukasi untuk\nIndonesia yang Maju"
                    required
                    className="w-full p-3 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Judul Banner (English) <span className="text-gray-400 font-normal">(Opsional)</span>
                  </label>
                  <textarea
                    rows={2}
                    value={titleEn}
                    onChange={(e) => setTitleEn(e.target.value)}
                    placeholder="Example: Education for\nan Advanced Indonesia"
                    className="w-full p-3 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* Subtitle & Subtitle EN */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Subjudul / Deskripsi (Bahasa Indonesia) <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    placeholder="Masukkan deskripsi singkat banner..."
                    required
                    className="w-full p-3 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Subjudul / Deskripsi (English) <span className="text-gray-400 font-normal">(Opsional)</span>
                  </label>
                  <textarea
                    rows={3}
                    value={subtitleEn}
                    onChange={(e) => setSubtitleEn(e.target.value)}
                    placeholder="Enter short banner description in English..."
                    className="w-full p-3 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* Grid 2 Columns for Buttons */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Button Primary */}
                <div className="p-4 bg-yellow-50/50 dark:bg-yellow-900/10 rounded-2xl border border-yellow-100 dark:border-yellow-900/30 space-y-3">
                  <h4 className="text-xs font-bold text-yellow-800 dark:text-yellow-400 uppercase tracking-wider">Tombol Utama (Kuning)</h4>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 mb-1">Teks Tombol (ID)</label>
                    <input
                      type="text"
                      value={buttonPrimaryText}
                      onChange={(e) => setButtonPrimaryText(e.target.value)}
                      placeholder="Ajukan Edukasi"
                      className="w-full p-2.5 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:border-primary mb-2"
                    />
                    <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 mb-1">Teks Tombol (EN)</label>
                    <input
                      type="text"
                      value={buttonPrimaryTextEn}
                      onChange={(e) => setButtonPrimaryTextEn(e.target.value)}
                      placeholder="Request Education"
                      className="w-full p-2.5 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 mb-1">Link URL</label>
                    <input
                      type="text"
                      value={buttonPrimaryUrl}
                      onChange={(e) => setButtonPrimaryUrl(e.target.value)}
                      placeholder="/edukasi/pengajuan"
                      className="w-full p-2.5 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>

                {/* Button Secondary */}
                <div className="p-4 bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-900/30 space-y-3">
                  <h4 className="text-xs font-bold text-blue-800 dark:text-blue-400 uppercase tracking-wider">Tombol Kedua (Transparan)</h4>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 mb-1">Teks Tombol (ID)</label>
                    <input
                      type="text"
                      value={buttonSecondaryText}
                      onChange={(e) => setButtonSecondaryText(e.target.value)}
                      placeholder="Jelajahi Materi"
                      className="w-full p-2.5 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:border-primary mb-2"
                    />
                    <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 mb-1">Teks Tombol (EN)</label>
                    <input
                      type="text"
                      value={buttonSecondaryTextEn}
                      onChange={(e) => setButtonSecondaryTextEn(e.target.value)}
                      placeholder="Explore Materials"
                      className="w-full p-2.5 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 mb-1">Link URL</label>
                    <input
                      type="text"
                      value={buttonSecondaryUrl}
                      onChange={(e) => setButtonSecondaryUrl(e.target.value)}
                      placeholder="/edukasi/materi-edukasi"
                      className="w-full p-2.5 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>
              </div>

              {/* Order & Status & Image Upload */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Urutan Slide</label>
                  <input
                    type="number"
                    min="1"
                    value={order}
                    onChange={(e) => setOrder(parseInt(e.target.value) || 1)}
                    className="w-full p-2.5 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="isActiveCheck"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-5 h-5 accent-primary rounded cursor-pointer"
                  />
                  <label htmlFor="isActiveCheck" className="text-xs font-bold text-gray-700 dark:text-gray-300 cursor-pointer">
                    Aktifkan Slide Ini
                  </label>
                </div>
              </div>

              {/* Image File Upload */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Gambar / Ilustrasi Banner
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full p-2.5 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-100 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-primary file:text-white cursor-pointer"
                />
                {imagePreview && (
                  <div className="mt-3 relative w-32 h-20 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-50 p-1">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-contain" />
                  </div>
                )}
              </div>

              {/* Modal Footer Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-bold text-xs hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-primary text-white font-bold text-xs hover:bg-blue-900 transition-colors shadow-md flex items-center gap-2 disabled:opacity-70 cursor-pointer"
                >
                  {submitting ? <i className="fa-solid fa-circle-notch animate-spin"></i> : <i className="fa-solid fa-check"></i>}
                  Simpan Banner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
