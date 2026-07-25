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

export default function AdminBeritaPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
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

  const handleOpenModal = (art: Article | null = null) => {
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
    setIsModalOpen(true);
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
        Swal.fire('Berhasil', 'Artikel diperbarui!', 'success');
      } else {
        await axios.post(`${API_URL}/articles`, payload, config);
        Swal.fire('Berhasil', 'Artikel baru ditambahkan!', 'success');
      }
      
      setIsModalOpen(false);
      fetchArticles();
    } catch (err: any) {
      Swal.fire('Gagal', err.response?.data?.message || 'Terjadi kesalahan', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({ title: 'Hapus?', text: "Data tidak bisa dikembalikan!", icon: 'warning', showCancelButton: true });
    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`${API_URL}/articles/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        Swal.fire('Terhapus!', 'Artikel telah dihapus.', 'success');
        fetchArticles();
      } catch (err) {
        Swal.fire('Error', 'Gagal menghapus data', 'error');
      }
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-800">
        <div className="flex justify-between items-center mb-6 border-b border-gray-200 dark:border-gray-700 pb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Manajemen Berita & Artikel</h2>
            <p className="text-gray-500 text-sm mt-1">Kelola konten berita dan artikel BI Mengajar.</p>
          </div>
          <button onClick={() => handleOpenModal()} className="bg-primary hover:bg-blue-800 text-white px-5 py-2.5 rounded-lg font-bold flex items-center gap-2 shadow-md transition-all hover:-translate-y-0.5">
            <i className="fa-solid fa-plus"></i> Tambah Berita
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-4 justify-between items-center">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <input 
                type="text" 
                placeholder="Cari judul..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full p-2 pl-9 border border-gray-300 dark:border-gray-700 rounded-lg text-sm dark:bg-gray-800"
              />
              <i className="fa-solid fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
            <span>Tampilkan</span>
            <select 
              value={itemsPerPage} 
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              className="p-1.5 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-gray-800 cursor-pointer"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
            </select>
            <span>baris</span>
          </div>
        </div>

        <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-primary text-white">
                <th className="p-4 text-sm font-semibold w-16">Gambar</th>
                <th className="p-4 text-sm font-semibold">Judul Artikel</th>
                <th className="p-4 text-sm font-semibold">Penulis</th>
                <th className="p-4 text-sm font-semibold">Tanggal</th>
                <th className="p-4 text-sm font-semibold text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {currentItems.map((art) => (
                <tr key={art.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="p-4">
                    <div className="relative w-16 h-12 rounded overflow-hidden bg-gray-100">
                      <Image 
                        src={(art.image && art.image.length > 0) ? art.image[0] : 'https://via.placeholder.com/150'} 
                        alt={art.title} 
                        fill 
                        className="object-cover" 
                      />
                    </div>
                  </td>
                  <td className="p-4 font-semibold text-gray-800 dark:text-gray-200">
                    <div className="max-w-[200px] md:max-w-[300px] truncate">{art.title}</div>
                  </td>
                  <td className="p-4 text-gray-600 dark:text-gray-400">{art.author}</td>
                  <td className="p-4 text-gray-600 dark:text-gray-400">
                    {new Date(art.published_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-4">
                      <button onClick={() => handleOpenModal(art)} className="text-primary hover:text-blue-800 transition-colors" title="Edit">
                        <i className="fa-solid fa-pen-to-square text-lg"></i>
                      </button>
                      <button onClick={() => handleDelete(art.id)} className="text-red-500 hover:text-red-700 transition-colors" title="Hapus">
                        <i className="fa-solid fa-trash-can text-lg"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {currentItems.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-10 text-center text-gray-400 font-medium">Belum ada berita.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 0 && (
          <div className="flex justify-between items-center mt-6">
            <span className="text-sm text-gray-500 font-medium">
              Menampilkan <span className="font-bold text-gray-800 dark:text-gray-200">{indexOfFirstItem + 1}</span> - <span className="font-bold text-gray-800 dark:text-gray-200">{Math.min(indexOfLastItem, filteredArticles.length)}</span> dari <span className="font-bold text-gray-800 dark:text-gray-200">{filteredArticles.length}</span> data
            </span>
            <div className="flex gap-2">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-bold text-gray-600 dark:text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Prev
              </button>
              <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-bold text-gray-600 dark:text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center sticky top-0 bg-white dark:bg-gray-800 z-10">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white">{formData.id ? 'Edit Berita' : 'Tambah Berita Baru'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-red-500"><i className="fa-solid fa-xmark text-xl"></i></button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Judul Artikel *</label>
                <input 
                  type="text" 
                  required 
                  value={formData.title} 
                  onChange={e => setFormData({...formData, title: e.target.value})} 
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700" 
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Penulis *</label>
                  <input 
                    type="text" 
                    required 
                    value={formData.author} 
                    onChange={e => setFormData({...formData, author: e.target.value})} 
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Tanggal *</label>
                  <input 
                    type="date" 
                    required 
                    value={formData.published_at} 
                    onChange={e => setFormData({...formData, published_at: e.target.value})} 
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Upload Gambar (Bisa lebih dari 1)</label>
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
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" 
                />
                
                {/* Image Previews */}
                {(formData.existing_images.length > 0 || formData.new_images.length > 0) && (
                  <div className="mt-4 flex flex-wrap gap-3">
                    {/* Existing Images */}
                    {formData.existing_images.map((img, idx) => (
                      <div key={`existing-${idx}`} className="relative w-24 h-24 rounded-lg overflow-hidden group shadow-sm border border-gray-200">
                        <Image src={img} alt={`Gambar ${idx}`} fill className="object-cover" />
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

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Deskripsi Singkat</label>
                <textarea 
                  value={formData.description} 
                  onChange={e => setFormData({...formData, description: e.target.value})} 
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 h-20" 
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Konten Lengkap</label>
                <textarea 
                  value={formData.content} 
                  onChange={e => setFormData({...formData, content: e.target.value})} 
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 h-32" 
                ></textarea>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 dark:border-gray-700">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-gray-600 dark:text-gray-300 font-bold hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">Batal</button>
                <button type="submit" disabled={isLoading} className="bg-primary hover:bg-blue-800 text-white px-6 py-2.5 rounded-lg font-bold shadow-md transition-all flex items-center gap-2">
                  {isLoading ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-save"></i>}
                  Simpan Data
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
