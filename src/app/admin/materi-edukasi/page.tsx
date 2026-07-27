'use client';

import { useState, useEffect, useRef } from 'react';
import axios from '@/lib/axios';
import Swal from 'sweetalert2';
import { MateriEdukasi, KategoriMateri } from './types';
import Image from 'next/image';

export default function MateriEdukasiPage() {
  const [materi, setMateri] = useState<MateriEdukasi[]>([]);
  const [kategori, setKategori] = useState<KategoriMateri[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [search, setSearch] = useState('');
  const [selectedKategori, setSelectedKategori] = useState('');
  const [selectedJenis, setSelectedJenis] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editData, setEditData] = useState<MateriEdukasi | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    kategori_materi_id: '',
    judul: '',
    deskripsi_singkat: '',
    jenis_konten: 'Artikel',
    link_eksternal: '',
    konten_teks: ''
  });
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  // Extra media state
  const [useYoutube, setUseYoutube] = useState(false);
  const [youtubeLinks, setYoutubeLinks] = useState<string[]>(['']);
  const [useDrive, setUseDrive] = useState(false);
  const [driveLinks, setDriveLinks] = useState<string[]>(['']);
  const [extraImages, setExtraImages] = useState<File[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const thumbInputRef = useRef<HTMLInputElement>(null);
  const extraImagesInputRef = useRef<HTMLInputElement>(null);

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
      // API returns paginated data, so data.data.data
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

  const openModal = (data: MateriEdukasi | null = null) => {
    if (data) {
      setEditData(data);
      setFormData({
        kategori_materi_id: data.kategori_materi_id.toString(),
        judul: data.judul,
        deskripsi_singkat: data.deskripsi_singkat || '',
        jenis_konten: data.jenis_konten,
        link_eksternal: data.link_eksternal || '',
        konten_teks: data.konten_teks || ''
      });
      setUseYoutube(data.link_youtube && data.link_youtube.length > 0 ? true : false);
      setYoutubeLinks(data.link_youtube?.length ? data.link_youtube : ['']);
      setUseDrive(data.link_drive && data.link_drive.length > 0 ? true : false);
      setDriveLinks(data.link_drive?.length ? data.link_drive : ['']);
    } else {
      setEditData(null);
      setFormData({
        kategori_materi_id: '',
        judul: '',
        deskripsi_singkat: '',
        jenis_konten: 'Artikel',
        link_eksternal: '',
        konten_teks: ''
      });
      setUseYoutube(false);
      setYoutubeLinks(['']);
      setUseDrive(false);
      setDriveLinks(['']);
    }
    setThumbnailFile(null);
    setUploadFile(null);
    setExtraImages([]);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditData(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.judul || !formData.kategori_materi_id) {
      return Swal.fire('Peringatan', 'Judul dan Kategori wajib diisi', 'warning');
    }

    try {
      setIsSubmitting(true);
      const payload = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        payload.append(key, value);
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
      if (editData) {
        // use POST with _method=PUT to support FormData parsing in Laravel
        payload.append('_method', 'POST'); 
        await axios.post(`/materi-edukasi/${editData.id}`, payload, {
          headers: { 
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          }
        });
        Swal.fire('Berhasil', 'Materi berhasil diperbarui', 'success');
      } else {
        await axios.post('/materi-edukasi', payload, {
          headers: { 
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          }
        });
        Swal.fire('Berhasil', 'Materi berhasil ditambahkan', 'success');
      }
      closeModal();
      fetchMateri();
    } catch (error: any) {
      console.error('Submit error:', error);
      Swal.fire('Error', error.response?.data?.message || 'Terjadi kesalahan saat menyimpan data', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

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
          <button onClick={fetchMateri} className="px-4 py-2.5 bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 rounded-lg shadow-sm font-medium hover:bg-gray-50 transition-colors flex items-center gap-2">
            <i className={`fa-solid fa-rotate-right ${loading ? 'animate-spin' : ''}`}></i>
          </button>
          <button onClick={() => openModal()} className="px-4 py-2.5 bg-primary text-white rounded-lg shadow-md font-medium hover:bg-blue-900 transition-colors flex items-center gap-2">
            <i className="fa-solid fa-plus"></i> Tambah Materi
          </button>
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
              className="pl-9 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-[#1e1e1e] w-64 focus:outline-none focus:border-primary"
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
            <thead className="bg-[#003366] text-white">
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
                            <Image src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/storage/${item.thumbnail}`} alt={item.judul} fill className="object-cover" unoptimized />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-[#1e1e1e] w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden my-8">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between sticky top-0 bg-white dark:bg-[#1e1e1e] z-10">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                {editData ? 'Edit Materi' : 'Tambah Materi'}
              </h3>
              <button 
                onClick={closeModal}
                className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Judul Materi <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    required
                    value={formData.judul}
                    onChange={(e) => setFormData({...formData, judul: e.target.value})}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-black text-gray-800 dark:text-white focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Kategori <span className="text-red-500">*</span>
                  </label>
                  <select 
                    required
                    value={formData.kategori_materi_id}
                    onChange={(e) => setFormData({...formData, kategori_materi_id: e.target.value})}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-black text-gray-800 dark:text-white focus:outline-none focus:border-primary"
                  >
                    <option value="">-- Pilih Kategori --</option>
                    {kategori.map(k => (
                      <option key={k.id} value={k.id}>{k.nama}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Jenis Konten <span className="text-red-500">*</span>
                  </label>
                  <select 
                    required
                    value={formData.jenis_konten}
                    onChange={(e) => setFormData({...formData, jenis_konten: e.target.value})}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-black text-gray-800 dark:text-white focus:outline-none focus:border-primary"
                  >
                    <option value="Artikel">Artikel</option>
                    <option value="Infografis">Infografis</option>
                    <option value="Video">Video</option>
                    <option value="E-Book">E-Book</option>
                    <option value="Presentasi">Presentasi</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Media Eksternal (Opsional)
                  </label>
                  <div className="flex gap-4 mb-2 mt-2">
                    <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                      <input type="checkbox" checked={useYoutube} onChange={(e) => setUseYoutube(e.target.checked)} className="rounded text-primary focus:ring-primary" />
                      YouTube
                    </label>
                    <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                      <input type="checkbox" checked={useDrive} onChange={(e) => setUseDrive(e.target.checked)} className="rounded text-primary focus:ring-primary" />
                      Google Drive
                    </label>
                  </div>
                </div>
              </div>

              {useYoutube && (
                <div className="mb-4 p-4 border border-red-100 dark:border-red-900/30 bg-red-50/50 dark:bg-red-900/10 rounded-xl">
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Link YouTube</label>
                    <button type="button" onClick={() => setYoutubeLinks([...youtubeLinks, ''])} className="text-xs text-red-600 hover:text-red-700 font-medium flex items-center gap-1">
                      <i className="fa-solid fa-plus"></i> Tambah Link
                    </button>
                  </div>
                  {youtubeLinks.map((link, idx) => (
                    <div key={idx} className="flex gap-2 mb-2">
                      <input 
                        type="url" value={link} placeholder="https://youtube.com/watch?v=..."
                        onChange={(e) => {
                          const newLinks = [...youtubeLinks];
                          newLinks[idx] = e.target.value;
                          setYoutubeLinks(newLinks);
                        }}
                        className="flex-1 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-black text-gray-800 dark:text-white focus:outline-none focus:border-red-400"
                      />
                      {youtubeLinks.length > 1 && (
                        <button type="button" onClick={() => setYoutubeLinks(youtubeLinks.filter((_, i) => i !== idx))} className="px-3 py-2 text-gray-400 hover:text-red-500 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-black">
                          <i className="fa-solid fa-trash"></i>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {useDrive && (
                <div className="mb-4 p-4 border border-blue-100 dark:border-blue-900/30 bg-blue-50/50 dark:bg-blue-900/10 rounded-xl">
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Link Google Drive</label>
                    <button type="button" onClick={() => setDriveLinks([...driveLinks, ''])} className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
                      <i className="fa-solid fa-plus"></i> Tambah Link
                    </button>
                  </div>
                  {driveLinks.map((link, idx) => (
                    <div key={idx} className="flex gap-2 mb-2">
                      <input 
                        type="url" value={link} placeholder="https://drive.google.com/..."
                        onChange={(e) => {
                          const newLinks = [...driveLinks];
                          newLinks[idx] = e.target.value;
                          setDriveLinks(newLinks);
                        }}
                        className="flex-1 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-black text-gray-800 dark:text-white focus:outline-none focus:border-blue-400"
                      />
                      {driveLinks.length > 1 && (
                        <button type="button" onClick={() => setDriveLinks(driveLinks.filter((_, i) => i !== idx))} className="px-3 py-2 text-gray-400 hover:text-red-500 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-black">
                          <i className="fa-solid fa-trash"></i>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Deskripsi Singkat
                </label>
                <textarea 
                  rows={2}
                  value={formData.deskripsi_singkat}
                  onChange={(e) => setFormData({...formData, deskripsi_singkat: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-black text-gray-800 dark:text-white focus:outline-none focus:border-primary"
                ></textarea>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Konten Teks (HTML / Opsional)
                </label>
                <textarea 
                  rows={4}
                  value={formData.konten_teks}
                  onChange={(e) => setFormData({...formData, konten_teks: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-black text-gray-800 dark:text-white focus:outline-none focus:border-primary font-mono text-sm"
                  placeholder="<p>Isi artikel...</p>"
                ></textarea>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Thumbnail Image
                  </label>
                  <input 
                    type="file" 
                    accept="image/png, image/jpeg, image/jpg"
                    onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)}
                    ref={thumbInputRef}
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-primary hover:file:bg-blue-100"
                  />
                  {editData?.thumbnail && !thumbnailFile && (
                    <p className="text-xs text-green-600 mt-1"><i className="fa-solid fa-check-circle"></i> File sudah ada</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    File Lampiran (PDF/MP4/Img)
                  </label>
                  <input 
                    type="file" 
                    onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                    ref={fileInputRef}
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-primary hover:file:bg-blue-100"
                  />
                  {editData?.file_path && !uploadFile && (
                    <p className="text-xs text-green-600 mt-1"><i className="fa-solid fa-check-circle"></i> File sudah ada</p>
                  )}
                </div>
              </div>

              <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Galeri / Beberapa Gambar (Opsional)
                  </label>
                  <button type="button" onClick={() => extraImagesInputRef.current?.click()} className="text-xs text-primary hover:text-blue-700 font-medium flex items-center gap-1">
                    <i className="fa-solid fa-plus"></i> Tambah Gambar
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
                
                {editData?.images && editData.images.length > 0 && extraImages.length === 0 && (
                   <p className="text-xs text-green-600 mb-2"><i className="fa-solid fa-check-circle"></i> {editData.images.length} Gambar sudah tersimpan sebelumnya. (Upload baru akan menggantikan yang lama)</p>
                )}

                {extraImages.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                    {extraImages.map((file, idx) => (
                      <div key={idx} className="relative group rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                        <img src={URL.createObjectURL(file)} alt="preview" className="w-full h-20 object-cover" />
                        <button type="button" onClick={() => setExtraImages(extraImages.filter((_, i) => i !== idx))} className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <i className="fa-solid fa-xmark text-xs"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
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
