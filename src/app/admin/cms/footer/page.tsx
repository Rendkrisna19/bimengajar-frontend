'use client';

import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';

interface FooterFormData {
  deskripsi: string;
  alamat: string;
  telepon: string;
  email: string;
  instagram_url: string;
  youtube_url: string;
  facebook_url: string;
  twitter_url: string;
  tiktok_url: string;
  copyright_text: string;
}

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export default function CmsFooterPage() {
  const [formData, setFormData] = useState<FooterFormData>({
    deskripsi: '',
    alamat: '',
    telepon: '',
    email: '',
    instagram_url: '',
    youtube_url: '',
    facebook_url: '',
    twitter_url: '',
    tiktok_url: '',
    copyright_text: ''
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchFooterSettings();
  }, []);

  const fetchFooterSettings = async () => {
    try {
      const res = await fetch(`${API}/footer-settings`);
      const resData = await res.json();
      if (resData && resData.data) {
        setFormData({
          deskripsi: resData.data.deskripsi || '',
          alamat: resData.data.alamat || '',
          telepon: resData.data.telepon || '',
          email: resData.data.email || '',
          instagram_url: resData.data.instagram_url || '',
          youtube_url: resData.data.youtube_url || '',
          facebook_url: resData.data.facebook_url || '',
          twitter_url: resData.data.twitter_url || '',
          tiktok_url: resData.data.tiktok_url || '',
          copyright_text: resData.data.copyright_text || ''
        });
      }
    } catch (err) {
      console.error('Error fetching footer settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/footer-settings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (res.ok) {
        Swal.fire({
          icon: 'success',
          title: 'Berhasil Disimpan!',
          text: 'Pengaturan footer website berhasil diperbarui.',
          confirmButtonColor: '#003366',
          timer: 2000
        });
      } else {
        throw new Error(data.message || 'Gagal memperbarui footer.');
      }
    } catch (err: any) {
      Swal.fire({
        icon: 'error',
        title: 'Gagal Menyimpan',
        text: err.message || 'Terjadi kesalahan sistem saat menyimpan data footer.',
        confirmButtonColor: '#003366'
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <i className="fa-solid fa-circle-notch animate-spin text-4xl text-primary"></i>
          <p className="text-sm font-medium text-gray-500">Memuat data pengaturan footer...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Header Page */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-[#003366] dark:text-blue-400 tracking-tight flex items-center gap-2.5">
            <i className="fa-solid fa-table-columns text-primary"></i> CMS Pengaturan Footer
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Kelola teks deskripsi, kontak resmi, tautan media sosial, dan hak cipta di bagian footer utama.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            const form = document.getElementById('footer-form') as HTMLFormElement;
            if (form) form.requestSubmit();
          }}
          disabled={submitting}
          className="px-6 py-2.5 bg-primary text-white font-bold text-sm rounded-xl shadow-md hover:bg-blue-900 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 shrink-0"
        >
          {submitting ? (
            <>
              <i className="fa-solid fa-spinner animate-spin"></i> Menyimpan...
            </>
          ) : (
            <>
              <i className="fa-solid fa-floppy-disk"></i> Simpan Perubahan
            </>
          )}
        </button>
      </div>

      <form id="footer-form" onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: Informasi Utama Footer */}
        <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 space-y-6">
          <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-800 pb-4">
            <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-primary dark:text-blue-400 flex items-center justify-center font-bold">
              <i className="fa-solid fa-align-left text-lg"></i>
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-gray-800 dark:text-gray-100">Deskripsi & Teks Utama</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">Teks ringkasan tentang BI Mengajar yang muncul di bawah logo footer</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2">
                Deskripsi Footer <span className="text-red-500">*</span>
              </label>
              <textarea
                name="deskripsi"
                rows={3}
                value={formData.deskripsi}
                onChange={handleChange}
                placeholder="Contoh: Mewujudkan masyarakat yang Cinta, Bangga, dan Paham Rupiah melalui edukasi yang berkelanjutan."
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#121212] text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-primary focus:bg-white dark:focus:bg-[#1a1a1a] transition-all duration-200 text-sm"
                required
              />
              <p className="text-xs text-gray-400 mt-1">
                Tulis deskripsi singkat yang dapat disesuaikan kapan saja untuk kebutuhan branding BI Mengajar.
              </p>
            </div>
          </div>
        </div>

        {/* Section 2: Informasi Kontak */}
        <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 space-y-6">
          <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-800 pb-4">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <i className="fa-solid fa-address-book text-lg"></i>
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-gray-800 dark:text-gray-100">Informasi Kontak Kantor</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">Alamat fisik, nomor telepon, dan email resmi yang ditampilkan pada kolom Kontak</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2">
                Alamat Lengkap
              </label>
              <textarea
                name="alamat"
                rows={2}
                value={formData.alamat}
                onChange={handleChange}
                placeholder="Jl. H. Adam Malik No. 1, Pematangsiantar, Sumatera Utara"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#121212] text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-primary focus:bg-white dark:focus:bg-[#1a1a1a] transition-all duration-200 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2">
                Nomor Telepon
              </label>
              <input
                type="text"
                name="telepon"
                value={formData.telepon}
                onChange={handleChange}
                placeholder="(0622) 22100"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#121212] text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-primary focus:bg-white dark:focus:bg-[#1a1a1a] transition-all duration-200 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2">
                Email Resmi
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="pematangsiantar@bi.go.id"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#121212] text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-primary focus:bg-white dark:focus:bg-[#1a1a1a] transition-all duration-200 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Media Sosial & Copyright */}
        <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 space-y-6">
          <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-800 pb-4">
            <div className="w-9 h-9 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              <i className="fa-solid fa-share-nodes text-lg"></i>
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-gray-800 dark:text-gray-100">Media Sosial & Hak Cipta</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">Tautan ke platform sosial media dan teks hak cipta (copyright)</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2 flex items-center gap-2">
                <i className="fa-brands fa-instagram text-pink-500"></i> Instagram URL
              </label>
              <input
                type="url"
                name="instagram_url"
                value={formData.instagram_url}
                onChange={handleChange}
                placeholder="https://instagram.com/bank_indonesia_pematangsiantar"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#121212] text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-primary focus:bg-white dark:focus:bg-[#1a1a1a] transition-all duration-200 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2 flex items-center gap-2">
                <i className="fa-brands fa-youtube text-red-500"></i> YouTube URL
              </label>
              <input
                type="url"
                name="youtube_url"
                value={formData.youtube_url}
                onChange={handleChange}
                placeholder="https://youtube.com/@bank_indonesia"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#121212] text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-primary focus:bg-white dark:focus:bg-[#1a1a1a] transition-all duration-200 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2 flex items-center gap-2">
                <i className="fa-brands fa-facebook-f text-blue-600"></i> Facebook URL
              </label>
              <input
                type="url"
                name="facebook_url"
                value={formData.facebook_url}
                onChange={handleChange}
                placeholder="https://facebook.com/BankIndonesia"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#121212] text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-primary focus:bg-white dark:focus:bg-[#1a1a1a] transition-all duration-200 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2 flex items-center gap-2">
                <i className="fa-brands fa-x-twitter text-gray-800 dark:text-gray-100"></i> Twitter / X URL
              </label>
              <input
                type="url"
                name="twitter_url"
                value={formData.twitter_url}
                onChange={handleChange}
                placeholder="https://x.com/bank_indonesia"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#121212] text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-primary focus:bg-white dark:focus:bg-[#1a1a1a] transition-all duration-200 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2 flex items-center gap-2">
                <i className="fa-brands fa-tiktok text-gray-900 dark:text-gray-100"></i> TikTok URL
              </label>
              <input
                type="url"
                name="tiktok_url"
                value={formData.tiktok_url}
                onChange={handleChange}
                placeholder="https://tiktok.com/@bank_indonesia"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#121212] text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-primary focus:bg-white dark:focus:bg-[#1a1a1a] transition-all duration-200 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2 flex items-center gap-2">
                <i className="fa-solid fa-copyright text-gray-500"></i> Teks Copyright
              </label>
              <input
                type="text"
                name="copyright_text"
                value={formData.copyright_text}
                onChange={handleChange}
                placeholder="Bank Indonesia Pematangsiantar. Hak Cipta Dilindungi."
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#121212] text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-primary focus:bg-white dark:focus:bg-[#1a1a1a] transition-all duration-200 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Action Button Container */}
        <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-200 dark:border-gray-800">
          <button
            type="submit"
            disabled={submitting}
            className="px-8 py-3 bg-primary text-white font-bold text-base rounded-xl shadow-lg hover:bg-blue-900 transition-all duration-200 flex items-center gap-3 disabled:opacity-50"
          >
            {submitting ? (
              <>
                <i className="fa-solid fa-spinner animate-spin text-lg"></i> Menyimpan Perubahan...
              </>
            ) : (
              <>
                <i className="fa-solid fa-floppy-disk text-lg"></i> Simpan Pengaturan Footer
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
