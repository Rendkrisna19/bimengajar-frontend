'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import Image from 'next/image';
import API_URL from '@/lib/api';

interface Article {
  id: number;
  title: string;
  slug: string;
  author: string;
  image: string[];
  description: string;
  content: string;
  published_at: string;
}

export default function AdminArtikelPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [view, setView] = useState<'list' | 'form'>('list');
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    id: null as number | null,
    title: '',
    author: 'Admin',
    existing_images: [] as string[],
    new_images: [] as File[],
    description: '',
    content: '',
    published_at: new Date().toISOString().slice(0, 10),
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  useEffect(() => {
    fetchArticles();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, itemsPerPage]);

  const fetchArticles = async () => {
    try {
      const res = await axios.get(`${API_URL}/articles?all=true`);
      if (res.data.status === 'success') {
        setArticles(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch articles', err);
    }
  };

  const filteredArticles = articles.filter(art => {
    return art.title.toLowerCase().includes(searchQuery.toLowerCase()) || art.author.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredArticles.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredArticles.length / itemsPerPage);

  const handleOpenForm = (art: Article | null = null) => {
    if (art) {
      setFormData({
        id: art.id,
        title: art.title,
        author: art.author,
        existing_images: art.image || [],
        new_images: [],
        description: art.description || '',
        content: art.content || '',
        published_at: art.published_at ? new Date(art.published_at).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
      });
    } else {
      setFormData({
        id: null,
        title: '',
        author: 'Admin',
        existing_images: [],
        new_images: [],
        description: '',
        content: '',
        published_at: new Date().toISOString().slice(0, 10),
      });
    }
    setView('form');
  };

  const removeExistingImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      existing_images: prev.existing_images.filter((_, i) => i !== index)
    }));
  };

  const removeNewImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      new_images: prev.new_images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const config = { 
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        } 
      };
      
      const payload = new FormData();
      payload.append('title', formData.title);
      payload.append('author', formData.author);
      payload.append('description', formData.description);
      payload.append('content', formData.content);
      payload.append('published_at', formData.published_at);
      
      formData.existing_images.forEach(img => {
        payload.append('existing_images[]', img);
      });
      
      formData.new_images.forEach(file => {
        payload.append('new_images[]', file);
      });

      if (formData.id) {
        await axios.post(`${API_URL}/articles/${formData.id}`, payload, config);
        Swal.fire({ title: 'Berhasil', text: 'Artikel diperbarui!', icon: 'success', showConfirmButton: false, timer: 1500 });
      } else {
        await axios.post(`${API_URL}/articles`, payload, config);
        Swal.fire({ title: 'Berhasil', text: 'Artikel baru ditambahkan!', icon: 'success', showConfirmButton: false, timer: 1500 });
      }
      
      setView('list');
      fetchArticles();
    } catch (err: any) {
      Swal.fire('Gagal', err.response?.data?.message || 'Terjadi kesalahan', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({ 
      title: 'Hapus?', 
      text: "Data tidak bisa dikembalikan!", 
      icon: 'warning', 
      showCancelButton: true,
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal'
    });
    
    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`${API_URL}/articles/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        Swal.fire({ title: 'Terhapus!', text: 'Artikel telah dihapus.', icon: 'success', showConfirmButton: false, timer: 1500 });
        fetchArticles();
      } catch (err) {
        Swal.fire('Error', 'Gagal menghapus data', 'error');
      }
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {view === 'list' ? (
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm p-6 border border-gray-100 dark:border-gray-800">
          <div className="flex justify-between items-center mb-6 border-b border-gray-200 dark:border-gray-700 pb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Manajemen Artikel</h2>
              <p className="text-gray-500 text-sm mt-1">Kelola konten artikel edukasi BI Mengajar.</p>
            </div>
            <button onClick={() => handleOpenForm()} className="bg-primary hover:bg-blue-800 text-white px-5 py-3 rounded-xl font-bold flex items-center gap-2 shadow-md transition-all hover:-translate-y-0.5">
              <i className="fa-solid fa-plus"></i> Tambah Artikel
            </button>
          </div>

          <div className="flex flex-col md:flex-row gap-4 mb-5 justify-between items-stretch md:items-center">
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative w-full md:w-64">
                <input 
                  type="text" 
                  placeholder="Cari judul..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full p-2.5 pl-10 border border-slate-200 dark:border-gray-700 rounded-xl text-sm outline-none focus:border-primary/50 dark:bg-gray-800"
                />
                <i className="fa-solid fa-search absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm"></i>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500 font-medium self-end md:self-auto">
              <span>Tampilkan</span>
              <select 
                value={itemsPerPage} 
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                className="p-2 border border-slate-200 dark:border-gray-700 rounded-xl dark:bg-gray-800 cursor-pointer outline-none"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
              </select>
              <span>baris</span>
            </div>
          </div>

          <div className="overflow-x-auto border border-gray-100 dark:border-gray-700 rounded-2xl shadow-inner bg-slate-50/20">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-primary text-white">
                  <th className="p-4 text-xs font-bold uppercase tracking-wider w-16 text-center">Gambar</th>
                  <th className="p-4 text-xs font-bold uppercase tracking-wider">Judul Artikel</th>
                  <th className="p-4 text-xs font-bold uppercase tracking-wider">Penulis</th>
                  <th className="p-4 text-xs font-bold uppercase tracking-wider">Tanggal</th>
                  <th className="p-4 text-xs font-bold uppercase tracking-wider text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="text-slate-600 dark:text-gray-300 text-sm font-semibold divide-y divide-gray-100 dark:divide-gray-800">
                {currentItems.map((art) => (
                  <tr key={art.id} className="hover:bg-slate-50/50 dark:hover:bg-gray-800/30 transition-colors">
                    <td className="p-4">
                      <div className="relative w-16 h-12 rounded overflow-hidden bg-gray-100 border border-slate-200">
                        <Image 
                          src={(art.image && art.image.length > 0) ? art.image[0] : 'https://via.placeholder.com/150'} 
                          alt={art.title} 
                          fill 
                          className="object-cover"
                          unoptimized 
                        />
                      </div>
                    </td>
                    <td className="p-4 text-slate-800 dark:text-gray-200 font-bold">
                      <div className="max-w-[200px] md:max-w-[300px] truncate">{art.title}</div>
                    </td>
                    <td className="p-4">{art.author}</td>
                    <td className="p-4">
                      {new Date(art.published_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-4">
                        <button onClick={() => handleOpenForm(art)} className="text-primary hover:text-blue-900 transition-colors" title="Edit">
                          <i className="fa-solid fa-pen-to-square text-base"></i>
                        </button>
                        <button onClick={() => handleDelete(art.id)} className="text-red-500 hover:text-red-700 transition-colors" title="Hapus">
                          <i className="fa-solid fa-trash-can text-base"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {currentItems.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-12 text-center text-slate-400 font-bold">Belum ada artikel.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 0 && (
            <div className="flex justify-between items-center mt-6">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                Menampilkan <span className="text-slate-800 dark:text-gray-200">{indexOfFirstItem + 1}</span> - <span className="text-slate-800 dark:text-gray-200">{Math.min(indexOfLastItem, filteredArticles.length)}</span> dari <span className="text-slate-800 dark:text-gray-200">{filteredArticles.length}</span> data
              </span>
              <div className="flex gap-2">
                <button 
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-slate-200 dark:border-gray-700 rounded-xl text-xs font-bold text-slate-500 dark:text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Prev
                </button>
                <button 
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-slate-200 dark:border-gray-700 rounded-xl text-xs font-bold text-slate-500 dark:text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-6 animate-fade-in">
          {/* Form Header */}
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-5 border border-slate-100 dark:border-gray-800 flex justify-between items-center shadow-sm">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setView('list')}
                className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-gray-800 text-slate-600 dark:text-gray-300 hover:text-primary dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-700 transition-all flex items-center justify-center border border-slate-100 dark:border-gray-700"
                title="Kembali ke Daftar"
              >
                <i className="fa-solid fa-arrow-left"></i>
              </button>
              <div>
                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-bold uppercase tracking-wider">
                  <span>Artikel Edukasi</span>
                  <span>/</span>
                  <span>{formData.id ? 'Edit Artikel' : 'Tambah Artikel'}</span>
                </div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-white mt-1">
                  {formData.id ? 'Edit Detail Artikel' : 'Tambah Artikel Baru'}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button 
                type="button" 
                onClick={() => setView('list')}
                className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-gray-700 text-slate-600 dark:text-gray-300 font-bold text-xs hover:bg-slate-50 dark:hover:bg-gray-800 transition-colors"
              >
                Batal
              </button>
              <button 
                onClick={handleSubmit} 
                disabled={isLoading}
                className="px-6 py-2.5 bg-primary hover:bg-blue-900 text-white font-bold rounded-xl text-xs disabled:opacity-50 flex items-center gap-2 shadow-md transition-all hover:-translate-y-0.5"
              >
                {isLoading ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-floppy-disk"></i>}
                Simpan Data
              </button>
            </div>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 rounded-3xl p-6 md:p-8 border border-slate-100 dark:border-gray-800 shadow-sm flex flex-col gap-6">
            
            <h4 className="font-bold text-slate-800 dark:text-white border-b border-slate-100 dark:border-gray-700 pb-3 flex items-center gap-2 text-sm uppercase tracking-wider">
              <i className="fa-regular fa-newspaper text-primary"></i> Detail Informasi Artikel
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
              <div className="flex flex-col gap-1.5">
                <label className="block text-xs font-bold text-slate-600 dark:text-gray-300 uppercase tracking-wider px-1">Judul Artikel *</label>
                <input 
                  type="text" 
                  required 
                  value={formData.title} 
                  onChange={e => setFormData({...formData, title: e.target.value})} 
                  className="w-full p-2.5 border border-slate-200 dark:border-gray-600 rounded-xl outline-none focus:border-primary/50 text-sm dark:bg-gray-700 text-slate-800 dark:text-white" 
                  placeholder="Masukkan judul artikel..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-1.5">
                  <label className="block text-xs font-bold text-slate-600 dark:text-gray-300 uppercase tracking-wider px-1">Penulis *</label>
                  <input 
                    type="text" 
                    required 
                    value={formData.author} 
                    onChange={e => setFormData({...formData, author: e.target.value})} 
                    className="w-full p-2.5 border border-slate-200 dark:border-gray-600 rounded-xl outline-none focus:border-primary/50 text-sm dark:bg-gray-700 text-slate-800 dark:text-white" 
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="block text-xs font-bold text-slate-600 dark:text-gray-300 uppercase tracking-wider px-1">Tanggal *</label>
                  <input 
                    type="date" 
                    required 
                    value={formData.published_at} 
                    onChange={e => setFormData({...formData, published_at: e.target.value})} 
                    className="w-full p-2.5 border border-slate-200 dark:border-gray-600 rounded-xl outline-none focus:border-primary/50 text-sm dark:bg-gray-700 text-slate-800 dark:text-white" 
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="block text-xs font-bold text-slate-600 dark:text-gray-300 uppercase tracking-wider px-1">Upload Gambar (Bisa lebih dari 1)</label>
                <div className="relative w-full">
                  <input 
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={e => {
                      if (e.target.files) {
                        setFormData({
                          ...formData,
                          new_images: [...formData.new_images, ...Array.from(e.target.files)]
                        });
                      }
                    }}
                    className="hidden" 
                    id="artikel-image-upload"
                  />
                  <label 
                    htmlFor="artikel-image-upload"
                    className="w-full py-3 px-4 border-2 border-dashed border-slate-200 hover:border-primary/40 rounded-xl bg-slate-50/50 dark:bg-gray-700 hover:bg-slate-50 flex items-center justify-center gap-2 cursor-pointer transition-all text-xs font-bold text-slate-500 hover:text-primary"
                  >
                    <i className="fa-regular fa-image text-sm"></i> Klik untuk Memilih File Gambar
                  </label>
                </div>
                
                {/* Image Previews */}
                {(formData.existing_images.length > 0 || formData.new_images.length > 0) && (
                  <div className="mt-3 flex flex-wrap gap-3 p-3 bg-slate-50 dark:bg-gray-800 rounded-xl border border-slate-100">
                    {/* Existing Images */}
                    {formData.existing_images.map((img, idx) => (
                      <div key={`existing-${idx}`} className="relative w-24 h-24 rounded-lg overflow-hidden group shadow-sm border border-slate-200">
                        <Image src={img} alt={`Gambar ${idx}`} fill className="object-cover" unoptimized />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[1px]">
                          <button 
                            type="button" 
                            onClick={() => removeExistingImage(idx)} 
                            className="bg-red-500 hover:bg-red-600 text-white w-8 h-8 rounded-full flex items-center justify-center transition-transform hover:scale-110"
                            title="Hapus gambar ini"
                          >
                            <i className="fa-solid fa-trash-can text-sm"></i>
                          </button>
                        </div>
                      </div>
                    ))}
                    
                    {/* New Images */}
                    {formData.new_images.map((file, idx) => (
                      <div key={`new-${idx}`} className="relative w-24 h-24 rounded-lg overflow-hidden group shadow-sm border border-green-200">
                        <Image src={URL.createObjectURL(file)} alt={`New Gambar ${idx}`} fill className="object-cover" />
                        <div className="absolute top-1 left-1 bg-green-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm z-10">Baru</div>
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[1px]">
                          <button 
                            type="button" 
                            onClick={() => removeNewImage(idx)} 
                            className="bg-red-500 hover:bg-red-600 text-white w-8 h-8 rounded-full flex items-center justify-center transition-transform hover:scale-110"
                            title="Batal upload"
                          >
                            <i className="fa-solid fa-trash-can text-sm"></i>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="block text-xs font-bold text-slate-600 dark:text-gray-300 uppercase tracking-wider px-1">Deskripsi Singkat</label>
                <textarea 
                  value={formData.description} 
                  onChange={e => setFormData({...formData, description: e.target.value})} 
                  className="w-full p-2.5 border border-slate-200 dark:border-gray-600 rounded-xl outline-none focus:border-primary/50 text-sm dark:bg-gray-700 h-20 resize-none text-slate-800 dark:text-white" 
                  placeholder="Tulis ringkasan artikel..."
                ></textarea>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="block text-xs font-bold text-slate-600 dark:text-gray-300 uppercase tracking-wider px-1">Konten Lengkap</label>
                <textarea 
                  value={formData.content} 
                  onChange={e => setFormData({...formData, content: e.target.value})} 
                  className="w-full p-2.5 border border-slate-200 dark:border-gray-600 rounded-xl outline-none focus:border-primary/50 text-sm dark:bg-gray-700 h-40 text-slate-800 dark:text-white" 
                  placeholder="Tulis konten artikel selengkapnya..."
                ></textarea>
              </div>
            </div>

          </form>
        </div>
      )}
    </div>
  );
}
