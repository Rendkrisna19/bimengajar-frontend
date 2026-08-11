'use client';

import { useState, useEffect, useRef } from 'react';
import Swal from 'sweetalert2';
import { getImageUrl } from '@/lib/api';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export default function AdminProfilPage() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirm_password: '',
    role: '',
  });

  const [currentPhoto, setCurrentPhoto] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });
      const data = await res.json();
      if (data.status === 'success' && data.user) {
        const u = data.user;
        setForm({
          name: u.name || '',
          email: u.email || '',
          password: '',
          confirm_password: '',
          role: u.role || 'admin',
        });
        setCurrentPhoto(u.foto_profil || null);
        localStorage.setItem('user', JSON.stringify(u));
        window.dispatchEvent(new Event('user-updated'));
      }
    } catch (e) {
      console.error(e);
      Swal.fire('Error', 'Gagal memuat data profil', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        Swal.fire('Ukuran Terlalu Besar', 'Maksimal ukuran foto adalah 2MB', 'warning');
        return;
      }
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name.trim() || !form.email.trim()) {
      Swal.fire('Peringatan', 'Nama dan Email wajib diisi.', 'warning');
      return;
    }

    if (form.password && form.password.length < 6) {
      Swal.fire('Peringatan', 'Password minimal 6 karakter.', 'warning');
      return;
    }

    if (form.password && form.password !== form.confirm_password) {
      Swal.fire('Peringatan', 'Konfirmasi password tidak cocok.', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('email', form.email);
      if (form.password) {
        formData.append('password', form.password);
      }
      if (photoFile) {
        formData.append('foto_profil', photoFile);
      }

      const res = await fetch(`${API}/profile`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        body: formData,
      });

      const data = await res.json();

      if (res.ok && data.status === 'success') {
        Swal.fire({
          title: 'Berhasil!',
          text: 'Profil berhasil diperbarui.',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false,
        });

        const updatedUser = data.user;
        setCurrentPhoto(updatedUser.foto_profil || null);
        setPhotoFile(null);
        setPhotoPreview(null);
        setForm((prev) => ({ ...prev, password: '', confirm_password: '' }));

        localStorage.setItem('user', JSON.stringify(updatedUser));
        window.dispatchEvent(new Event('user-updated'));
      } else {
        Swal.fire('Gagal', data.message || 'Terjadi kesalahan saat menyimpan profil.', 'error');
      }
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'Terjadi masalah pada server.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const displayPhoto = photoPreview || (currentPhoto ? getImageUrl(currentPhoto) : null);

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto w-full">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <i className="fa-solid fa-user-pen text-primary dark:text-blue-400"></i>
          <span>Pengaturan Profil Admin</span>
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Kelola informasi nama lengkap, email, foto profil, dan kata sandi akun Anda.
        </p>
      </div>

      {loading ? (
        <div className="bg-white dark:bg-[#1e1e1e] p-12 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 text-center">
          <i className="fa-solid fa-circle-notch animate-spin text-4xl text-primary mb-3"></i>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Memuat data profil...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Photo Card Left */}
          <div className="md:col-span-1">
            <div className="bg-white dark:bg-[#1e1e1e] p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm text-center flex flex-col items-center sticky top-20">
              <h3 className="font-bold text-gray-900 dark:text-white text-base mb-4">Foto Profil</h3>

              <div className="relative group mb-4">
                <div className="w-36 h-36 rounded-full bg-[#003366] text-white font-bold text-4xl flex items-center justify-center overflow-hidden border-4 border-white dark:border-gray-800 shadow-lg relative">
                  {displayPhoto ? (
                    <img 
                      src={displayPhoto} 
                      alt={form.name} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>{form.name ? form.name.charAt(0).toUpperCase() : 'A'}</span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-xs font-semibold cursor-pointer gap-1"
                >
                  <i className="fa-solid fa-camera text-xl"></i>
                  <span>Ganti Foto</span>
                </button>
              </div>

              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange}
                accept="image/jpeg,image/png,image/jpg,image/webp" 
                className="hidden" 
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-blue-50 dark:bg-blue-900/30 text-primary dark:text-blue-400 font-bold text-xs rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors inline-flex items-center gap-2"
              >
                <i className="fa-solid fa-upload"></i>
                <span>Unggah Foto Baru</span>
              </button>

              <p className="text-[11px] text-gray-400 mt-3">
                Format: JPG, PNG, WEBP. Maks: 2MB.
              </p>

              <div className="w-full border-t border-gray-100 dark:border-gray-800 my-4"></div>

              <div className="w-full text-left">
                <div className="text-xs text-gray-400 font-medium mb-1">Role Akun</div>
                <div className="inline-block px-3 py-1 bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 font-bold text-xs rounded-lg uppercase">
                  {form.role || 'Administrator'}
                </div>
              </div>
            </div>
          </div>

          {/* Form Card Right */}
          <div className="md:col-span-2">
            <div className="bg-white dark:bg-[#1e1e1e] p-6 lg:p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4 border-b border-gray-100 dark:border-gray-800 pb-3 flex items-center gap-2">
                    <i className="fa-solid fa-id-card text-primary dark:text-blue-400"></i>
                    <span>Informasi Pribadi</span>
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                        Nama Lengkap <span className="text-red-500">*</span>
                      </label>
                      <input 
                        type="text" 
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="Masukkan nama lengkap Anda"
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-primary transition-colors"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                        Alamat Email <span className="text-red-500">*</span>
                      </label>
                      <input 
                        type="email" 
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="contoh@bimengajar.com"
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-primary transition-colors"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4 border-b border-gray-100 dark:border-gray-800 pb-3 flex items-center gap-2">
                    <i className="fa-solid fa-lock text-amber-500"></i>
                    <span>Keamanan & Password (Opsional)</span>
                  </h3>

                  <p className="text-xs text-gray-400 mb-4">
                    Kosongkan kolom password di bawah ini jika Anda tidak ingin mengubah password akun.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                        Password Baru
                      </label>
                      <input 
                        type="password" 
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        placeholder="Password baru (min. 6 digit)"
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-primary transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                        Konfirmasi Password Baru
                      </label>
                      <input 
                        type="password" 
                        value={form.confirm_password}
                        onChange={(e) => setForm({ ...form, confirm_password: e.target.value })}
                        placeholder="Ulangi password baru"
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-primary transition-colors"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100 dark:border-gray-800">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-3 bg-[#003366] text-white font-bold text-sm rounded-xl hover:bg-opacity-95 transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
                  >
                    {submitting ? (
                      <>
                        <i className="fa-solid fa-circle-notch animate-spin"></i>
                        <span>Menyimpan...</span>
                      </>
                    ) : (
                      <>
                        <i className="fa-solid fa-floppy-disk"></i>
                        <span>Simpan Perubahan</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
