'use client';

import { useState, useRef, useEffect } from 'react';
import axios from '@/lib/axios';
import Swal from 'sweetalert2';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { KategoriMateri } from '../types';
import RichTextEditor from '@/components/ui/RichTextEditor';

export default function CreateMateriEdukasiPage() {
  const router = useRouter();
  const [kategori, setKategori] = useState<KategoriMateri[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    kategori_materi_id: '',
    judul: '',
    deskripsi_singkat: '',
    jenis_konten: 'Artikel',
    link_eksternal: '',
    konten_teks: ''
  });
  
  const [selectedFont, setSelectedFont] = useState('Plus Jakarta Sans');
  
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  const [useYoutube, setUseYoutube] = useState(false);
  const [youtubeLinks, setYoutubeLinks] = useState<string[]>(['']);
  
  const [useDrive, setUseDrive] = useState(false);
  const [driveLinks, setDriveLinks] = useState<string[]>(['']);
  
  const [extraImages, setExtraImages] = useState<File[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const thumbInputRef = useRef<HTMLInputElement>(null);
  const extraImagesInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
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
    fetchKategori();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.judul || !formData.kategori_materi_id) {
      return Swal.fire('Peringatan', 'Judul dan Kategori wajib diisi', 'warning');
    }

    try {
      setIsSubmitting(true);
      const payload = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'konten_teks' && value) {
          const formattedContent = `<div style="font-family: '${selectedFont}', sans-serif;" data-font="${selectedFont}">${value}</div>`;
          payload.append(key, formattedContent);
        } else {
          payload.append(key, value);
        }
      });

      if (thumbnailFile) {
        payload.append('thumbnail', thumbnailFile);
      }
      if (uploadFile) {
        payload.append('file_upload', uploadFile);
      }
      if (useYoutube) {
        youtubeLinks.forEach(link => {
          if (link.trim()) payload.append('link_youtube[]', link);
        });
      }
      if (useDrive) {
        driveLinks.forEach(link => {
          if (link.trim()) payload.append('link_drive[]', link);
        });
      }
      extraImages.forEach(file => {
        payload.append('images[]', file);
      });

      const token = localStorage.getItem('token');
      await axios.post('/materi-edukasi', payload, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });
      
      Swal.fire('Berhasil', 'Materi berhasil ditambahkan', 'success').then(() => {
        router.push('/admin/materi-edukasi');
      });
    } catch (error: any) {
      console.error('Submit error:', error);
      if (error.response?.status === 413) {
        Swal.fire({
          icon: 'error',
          title: 'Ukuran Terlalu Besar (413)',
          text: 'Ukuran file/gambar yang Anda unggah atau tempel melebihi batas maksimal server. Mohon kompres atau gunakan gambar dengan ukuran lebih kecil (maks 10MB).',
        });
      } else {
        Swal.fire('Error', error.response?.data?.message || 'Terjadi kesalahan saat menyimpan data', 'error');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto pb-10">
      <div className="mb-6 flex items-center gap-4">
        <Link href="/admin/materi-edukasi" className="w-10 h-10 bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-gray-800 rounded-lg flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
          <i className="fa-solid fa-arrow-left"></i>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Tambah Materi Baru</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Buat materi edukasi baru dengan editor lengkap.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6 md:p-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Judul Materi <span className="text-red-500">*</span>
              </label>
              <input 
                type="text" 
                required
                value={formData.judul}
                onChange={(e) => setFormData({...formData, judul: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-black text-gray-800 dark:text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                placeholder="Masukkan judul materi..."
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Kategori <span className="text-red-500">*</span>
              </label>
              <select 
                required
                value={formData.kategori_materi_id}
                onChange={(e) => setFormData({...formData, kategori_materi_id: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-black text-gray-800 dark:text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
              >
                <option value="">-- Pilih Kategori --</option>
                {kategori.map(k => (
                  <option key={k.id} value={k.id}>{k.nama}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Jenis Konten <span className="text-red-500">*</span>
              </label>
              <select 
                required
                value={formData.jenis_konten}
                onChange={(e) => setFormData({...formData, jenis_konten: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-black text-gray-800 dark:text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
              >
                <option value="Artikel">Artikel</option>
                <option value="Infografis">Infografis</option>
                <option value="Video">Video</option>
                <option value="E-Book">E-Book</option>
                <option value="Presentasi">Presentasi</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Media Eksternal (Opsional)
              </label>
              <div className="flex gap-6 h-[46px] items-center px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-black">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={useYoutube} 
                    onChange={(e) => {
                      setUseYoutube(e.target.checked);
                      if (e.target.checked && (!youtubeLinks || youtubeLinks.length === 0)) {
                        setYoutubeLinks(['']);
                      }
                    }} 
                    className="w-4 h-4 rounded text-primary focus:ring-primary border-gray-300 dark:border-gray-600" 
                  />
                  YouTube
                </label>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={useDrive} 
                    onChange={(e) => {
                      setUseDrive(e.target.checked);
                      if (e.target.checked && (!driveLinks || driveLinks.length === 0)) {
                        setDriveLinks(['']);
                      }
                    }} 
                    className="w-4 h-4 rounded text-primary focus:ring-primary border-gray-300 dark:border-gray-600" 
                  />
                  Google Drive
                </label>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Deskripsi Singkat <span className="text-gray-400 font-normal">(Opsional)</span>
            </label>
            <textarea 
              rows={2}
              value={formData.deskripsi_singkat}
              onChange={(e) => setFormData({...formData, deskripsi_singkat: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-black text-gray-800 dark:text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
              placeholder="Tuliskan rangkuman singkat dari materi ini..."
            ></textarea>
          </div>

          <div className="mb-8">
            <div className="mb-4 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-blue-50/60 dark:bg-blue-900/10 p-4 rounded-2xl border border-blue-100 dark:border-blue-800">
              <div>
                <label className="block text-sm font-bold text-gray-800 dark:text-gray-200">
                  <i className="fa-solid fa-font text-primary mr-1.5"></i> Font Utama Materi Edukasi
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Pilih gaya font utama untuk tampilan materi di Landing Page & Detail Edukasi.
                </p>
              </div>
              <select 
                value={selectedFont}
                onChange={(e) => setSelectedFont(e.target.value)}
                style={{ fontFamily: selectedFont }}
                className="px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-black text-gray-900 dark:text-white font-bold text-sm focus:outline-none focus:border-primary shrink-0 cursor-pointer shadow-xs"
              >
                <option value="Plus Jakarta Sans" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Plus Jakarta Sans (Default)</option>
                <option value="Poppins" style={{ fontFamily: 'Poppins, sans-serif' }}>Poppins (Modern & Friendly)</option>
                <option value="Inter" style={{ fontFamily: 'Inter, sans-serif' }}>Inter (Clean Tech)</option>
                <option value="Montserrat" style={{ fontFamily: 'Montserrat, sans-serif' }}>Montserrat (Elegant Heading)</option>
                <option value="Outfit" style={{ fontFamily: 'Outfit, sans-serif' }}>Outfit (Minimalist)</option>
                <option value="Playfair Display" style={{ fontFamily: 'Playfair Display, serif' }}>Playfair Display (Classic Serif)</option>
                <option value="Merriweather" style={{ fontFamily: 'Merriweather, serif' }}>Merriweather (Warm Serif)</option>
                <option value="Caveat" style={{ fontFamily: 'Caveat, cursive' }}>Caveat (Handwriting)</option>
                <option value="Cinzel" style={{ fontFamily: 'Cinzel, serif' }}>Cinzel (Roman Luxury)</option>
                <option value="Oswald" style={{ fontFamily: 'Oswald, sans-serif' }}>Oswald (Bold Impact)</option>
                <option value="Fira Code" style={{ fontFamily: 'Fira Code, monospace' }}>Fira Code (Monospace)</option>
                <option value="Roboto" style={{ fontFamily: 'Roboto, sans-serif' }}>Roboto</option>
                <option value="Open Sans" style={{ fontFamily: 'Open Sans, sans-serif' }}>Open Sans</option>
                <option value="Lato" style={{ fontFamily: 'Lato, sans-serif' }}>Lato</option>
              </select>
            </div>

            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Konten Artikel Lengkap <span className="text-gray-400 font-normal">(Opsional)</span>
            </label>
            <RichTextEditor 
              value={formData.konten_teks}
              onChange={(val) => setFormData({...formData, konten_teks: val})}
              placeholder="Tulis konten artikel di sini..."
            />
          </div>

          {useYoutube && (
            <div className="mb-6 p-5 border border-red-100 dark:border-red-900/30 bg-red-50/50 dark:bg-red-900/10 rounded-2xl">
              <div className="flex justify-between items-center mb-4">
                <label className="block text-sm font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                  <i className="fa-brands fa-youtube text-red-600"></i> Link YouTube
                </label>
                <button type="button" onClick={() => setYoutubeLinks([...youtubeLinks, ''])} className="px-3 py-1.5 rounded-lg bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 text-xs font-bold hover:bg-red-200 dark:hover:bg-red-800 transition-colors flex items-center gap-1">
                  <i className="fa-solid fa-plus"></i> Tambah Link
                </button>
              </div>
              <div className="space-y-3">
                {youtubeLinks.map((link, idx) => (
                  <div key={idx} className="flex gap-3">
                    <input 
                      type="url" value={link} placeholder="https://youtube.com/watch?v=..."
                      onChange={(e) => {
                        const newLinks = [...youtubeLinks];
                        newLinks[idx] = e.target.value;
                        setYoutubeLinks(newLinks);
                      }}
                      className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-black text-gray-800 dark:text-white focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400"
                    />
                    {youtubeLinks.length > 1 && (
                      <button type="button" onClick={() => setYoutubeLinks(youtubeLinks.filter((_, i) => i !== idx))} className="w-11 h-11 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-black transition-colors">
                        <i className="fa-solid fa-trash"></i>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {useDrive && (
            <div className="mb-6 p-5 border border-blue-100 dark:border-blue-900/30 bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl">
              <div className="flex justify-between items-center mb-4">
                <label className="block text-sm font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                  <i className="fa-brands fa-google-drive text-blue-600"></i> Link Google Drive
                </label>
                <button type="button" onClick={() => setDriveLinks([...driveLinks, ''])} className="px-3 py-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 text-xs font-bold hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors flex items-center gap-1">
                  <i className="fa-solid fa-plus"></i> Tambah Link
                </button>
              </div>
              <div className="space-y-3">
                {driveLinks.map((link, idx) => (
                  <div key={idx} className="flex gap-3">
                    <input 
                      type="url" value={link} placeholder="https://drive.google.com/..."
                      onChange={(e) => {
                        const newLinks = [...driveLinks];
                        newLinks[idx] = e.target.value;
                        setDriveLinks(newLinks);
                      }}
                      className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-black text-gray-800 dark:text-white focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
                    />
                    {driveLinks.length > 1 && (
                      <button type="button" onClick={() => setDriveLinks(driveLinks.filter((_, i) => i !== idx))} className="w-11 h-11 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-black transition-colors">
                        <i className="fa-solid fa-trash"></i>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="p-5 bg-gray-50 dark:bg-gray-800/30 rounded-2xl border border-gray-100 dark:border-gray-800">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                <i className="fa-regular fa-image text-primary mr-1"></i> Thumbnail Image
              </label>
              <input 
                type="file" 
                accept="image/png, image/jpeg, image/jpg"
                onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)}
                ref={thumbInputRef}
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-white dark:file:bg-black file:text-primary file:border file:border-gray-200 dark:file:border-gray-700 hover:file:bg-gray-50 dark:hover:file:bg-gray-900 file:cursor-pointer"
              />
            </div>
            <div className="p-5 bg-gray-50 dark:bg-gray-800/30 rounded-2xl border border-gray-100 dark:border-gray-800">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                <i className="fa-solid fa-file-arrow-up text-primary mr-1"></i> File Lampiran (PDF/Lainnya)
              </label>
              <input 
                type="file" 
                onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                ref={fileInputRef}
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-white dark:file:bg-black file:text-primary file:border file:border-gray-200 dark:file:border-gray-700 hover:file:bg-gray-50 dark:hover:file:bg-gray-900 file:cursor-pointer"
              />
            </div>
          </div>

          <div className="mb-8 p-5 bg-gray-50 dark:bg-gray-800/30 rounded-2xl border border-gray-100 dark:border-gray-800">
            <div className="flex justify-between items-center mb-4">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                <i className="fa-solid fa-images text-primary mr-1"></i> Galeri Tambahan (Slider)
              </label>
              <button type="button" onClick={() => extraImagesInputRef.current?.click()} className="px-4 py-2 rounded-xl bg-white dark:bg-black border border-gray-200 dark:border-gray-700 text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors flex items-center gap-2">
                <i className="fa-solid fa-upload"></i> Pilih Gambar
              </button>
              <input 
                type="file" multiple accept="image/png, image/jpeg, image/jpg" ref={extraImagesInputRef} className="hidden"
                onChange={(e) => {
                  if (e.target.files) {
                    setExtraImages([...extraImages, ...Array.from(e.target.files)]);
                  }
                  e.target.value = '';
                }}
              />
            </div>

            {extraImages.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 mt-4">
                {extraImages.map((file, idx) => (
                  <div key={idx} className="relative group rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm aspect-square">
                    <img src={URL.createObjectURL(file)} alt="preview" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => setExtraImages(extraImages.filter((_, i) => i !== idx))} className="absolute top-2 right-2 w-7 h-7 bg-red-500/90 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm shadow-md">
                      <i className="fa-solid fa-xmark text-sm"></i>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl text-gray-400 dark:text-gray-500">
                <i className="fa-regular fa-image text-3xl mb-2"></i>
                <p className="text-sm">Belum ada gambar ditambahkan</p>
              </div>
            )}
          </div>
          
          <div className="flex gap-4 pt-4 border-t border-gray-100 dark:border-gray-800">
            <Link 
              href="/admin/materi-edukasi"
              className="px-6 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Batal
            </Link>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 rounded-xl bg-primary text-white font-bold hover:bg-blue-900 transition-all shadow-md disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <><i className="fa-solid fa-circle-notch animate-spin"></i> Menyimpan...</>
              ) : (
                <><i className="fa-solid fa-paper-plane"></i> Publikasikan Materi</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
