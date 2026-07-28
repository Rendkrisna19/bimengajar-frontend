'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Swal from 'sweetalert2';

export default function TentangKamiAdmin() {
  const [activeTab, setActiveTab] = useState('tentang_bi');
  const [data, setData] = useState({
    title: '',
    content: '',
    image: null as File | null,
    preview: ''
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const tabs = [
    { id: 'tentang_bi', label: 'Tentang BI' },
    { id: 'tujuan', label: 'Tujuan' },
    { id: 'visi_misi', label: 'Visi & Misi' },
  ];

  const fetchData = async (type: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/abouts`);
      const result = await res.json();
      if (result.status === 'success' && result.data[type]) {
        setData({
          title: result.data[type].title || '',
          content: result.data[type].content || '',
          image: null,
          preview: result.data[type].image || ''
        });
      } else {
        setData({ title: '', content: '', image: null, preview: '' });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(activeTab);
  }, [activeTab]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setData({
        ...data,
        image: file,
        preview: URL.createObjectURL(file)
      });
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('content', data.content);
      if (data.image) {
        formData.append('image', data.image);
      }

      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/abouts/${activeTab}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: formData
      });

      const result = await res.json();
      if (result.status === 'success') {
        Swal.fire('Berhasil!', 'Data berhasil disimpan', 'success');
        fetchData(activeTab);
      } else {
        Swal.fire('Gagal!', result.message || 'Terjadi kesalahan', 'error');
      }
    } catch (error) {
      Swal.fire('Error!', 'Tidak dapat terhubung ke server', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Manajemen Tentang Kami</h1>

      <div className="bg-white dark:bg-[#1e1e1e] rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden mb-6">
        <div className="flex border-b border-gray-200 dark:border-gray-800">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-4 text-center font-semibold text-sm transition-colors ${activeTab === tab.id ? 'bg-primary text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <form onSubmit={handleSave} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Judul</label>
                <input
                  type="text"
                  required
                  value={data.title}
                  onChange={(e) => setData({ ...data, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none bg-white dark:bg-black text-gray-800 dark:text-white"
                  placeholder="Contoh: Tentang Bank Indonesia"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Konten / Deskripsi</label>
                <textarea
                  required
                  rows={6}
                  value={data.content}
                  onChange={(e) => setData({ ...data, content: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none bg-white dark:bg-black text-gray-800 dark:text-white"
                  placeholder="Masukkan deskripsi lengkap..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Gambar</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg outline-none bg-white dark:bg-black text-gray-800 dark:text-white"
                />
                {data.preview && (
                  <div className="mt-4 relative w-[300px] h-[200px] border border-gray-200 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center">
                    <img src={data.preview} alt="Preview" className="max-w-full max-h-full object-contain" />
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-4 border-t border-gray-100">
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-primary hover:bg-blue-800 text-white font-bold py-2 px-6 rounded-lg shadow-md disabled:opacity-50 transition-colors"
                >
                  {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
