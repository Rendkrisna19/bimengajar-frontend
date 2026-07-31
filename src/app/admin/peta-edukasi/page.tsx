'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import dynamic from 'next/dynamic';

const LocationPickerMap = dynamic(() => import('@/components/admin/LocationPickerMap'), {
  ssr: false,
  loading: () => <div className="w-full h-[320px] bg-slate-100 flex items-center justify-center text-slate-400 font-semibold animate-pulse rounded-2xl">Loading Map...</div>
});

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

interface EdukasiLocation {
  id: number;
  name: string;
  category: string;
  year?: number | null;
  latitude: string;
  longitude: string;
  address: string | null;
  description: string | null;
  activities: string[] | null;
  photos: string[] | null;
}

export default function AdminPetaEdukasiPage() {
  const [locations, setLocations] = useState<EdukasiLocation[]>([]);
  const [view, setView] = useState<'list' | 'form'>('list'); // 'list' or 'form'
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    id: null as number | null,
    name: '',
    category: 'SD',
    year: new Date().getFullYear().toString(),
    latitude: '',
    longitude: '',
    address: '',
    description: '',
  });

  const [activities, setActivities] = useState<{title: string, description: string, photos: (File|string)[]}[]>([]);
  const [position, setPosition] = useState<[number, number] | null>(null);
  
  // Autocomplete state
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Filters, Sort, Pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('Semua');
  const [filterYear, setFilterYear] = useState('Semua');
  const [sortConfig, setSortConfig] = useState<{ key: 'name' | 'category', direction: 'asc' | 'desc' } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  useEffect(() => {
    fetchLocations();
  }, []);

  useEffect(() => {
    if (position) {
      setFormData(prev => ({ ...prev, latitude: position[0].toString(), longitude: position[1].toString() }));
    }
  }, [position]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterCategory, filterYear, itemsPerPage]);

  const fetchLocations = async () => {
    try {
      const res = await axios.get(`${API_URL}/locations`);
      setLocations(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSort = (key: 'name' | 'category') => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const filteredLocations = locations.filter(loc => {
    const matchesSearch = loc.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'Semua' || loc.category === filterCategory;
    const matchesYear = filterYear === 'Semua' || (loc.year && loc.year.toString() === filterYear);
    return matchesSearch && matchesCategory && matchesYear;
  });

  const sortedLocations = [...filteredLocations].sort((a, b) => {
    if (!sortConfig) return 0;
    const aVal = a[sortConfig.key].toLowerCase();
    const bVal = b[sortConfig.key].toLowerCase();
    if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedLocations.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedLocations.length / itemsPerPage);

  const categoryCounts = {
    'SD': locations.filter(l => l.category === 'SD').length,
    'SMP': locations.filter(l => l.category === 'SMP').length,
    'SMA/SMK': locations.filter(l => l.category === 'SMA/SMK').length,
    'PT': locations.filter(l => l.category === 'Perguruan Tinggi').length,
    'Komunitas': locations.filter(l => l.category === 'Komunitas').length,
  };

  const handleOpenForm = (loc: EdukasiLocation | null = null) => {
    if (loc) {
      setFormData({
        id: loc.id,
        name: loc.name,
        category: loc.category,
        year: loc.year ? loc.year.toString() : new Date().getFullYear().toString(),
        latitude: loc.latitude,
        longitude: loc.longitude,
        address: loc.address || '',
        description: loc.description || ''
      });
      setPosition([parseFloat(loc.latitude), parseFloat(loc.longitude)]);
      setActivities(loc.activities && loc.activities.length > 0 ? (loc.activities as any) : [{ title: '', description: '', photos: [] }]);
    } else {
      setFormData({ id: null, name: '', category: 'SD', year: new Date().getFullYear().toString(), latitude: '', longitude: '', address: '', description: '' });
      setPosition(null);
      setActivities([{ title: '', description: '', photos: [] }]);
    }
    setSuggestions([]);
    setView('form');
  };

  const handleSearchInput = async (value: string) => {
    setFormData(prev => ({ ...prev, name: value }));

    if (value.length < 3) {
      setSuggestions([]);
      return;
    }

    setIsSearching(true);
    try {
      // 1️⃣ Primary: devapi.sekolah.id
      const devRes = await axios.get('https://devapi.sekolah.id/v1/sekolah', {
        params: { q: value, kota: 'Pematang Siantar', limit: 5 },
      });
      if (devRes.data && (devRes.data.sekolahs || devRes.data.data)) {
        const list = devRes.data.sekolahs || devRes.data.data;
        setSuggestions(list);
        return;
      }
      throw new Error('Unexpected devapi response');
    } catch (devErr) {
      console.warn('devapi.sekolah.id failed, trying Photon API', devErr);
      try {
        // 2️⃣ Fallback: Photon (OpenStreetMap)
        const bbox = '98.95,2.90,99.12,3.02';
        const photonRes = await axios.get('https://photon.komoot.io/api/', {
          params: { q: value, bbox, limit: 5 },
        });
        if (photonRes.data && photonRes.data.features) {
          setSuggestions(photonRes.data.features);
          return;
        }
        throw new Error('Unexpected photon response');
      } catch (photonErr) {
        console.warn('Photon API failed, trying Nominatim', photonErr);
        try {
          // 3️⃣ Final fallback: Nominatim
          const nominatimRes = await axios.get('https://nominatim.openstreetmap.org/search', {
            params: {
              q: `${value} sekolah Pematang Siantar`,
              format: 'json',
              addressdetails: 1,
              limit: 5,
            },
            headers: { 'User-Agent': 'bi-mengajar-app/1.0 (https://bi-mengajar.id)' },
          });
          if (Array.isArray(nominatimRes.data)) {
            const normalized = nominatimRes.data.map((item: any) => ({
              name: item.display_name,
              latitude: item.lat,
              longitude: item.lon,
              properties: { name: item.display_name },
              geometry: { coordinates: [parseFloat(item.lon), parseFloat(item.lat)] },
            }));
            setSuggestions(normalized);
            return;
          }
          throw new Error('Unexpected Nominatim response');
        } catch (nominatimErr) {
          console.error('Autocomplete failed all providers', { devErr, photonErr, nominatimErr });
          Swal.fire({
            title: 'Pencarian tidak tersedia',
            text: 'Tidak dapat mengambil data lokasi. Silakan coba lagi nanti.',
            icon: 'warning',
            timer: 3000,
            showConfirmButton: false,
          });
        }
      }
    } finally {
      setIsSearching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!position) return Swal.fire('Error', 'Pilih titik lokasi di peta!', 'error');

    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } };
      
      const payload = new FormData();
      payload.append('name', formData.name);
      payload.append('category', formData.category);
      payload.append('year', formData.year);
      payload.append('latitude', formData.latitude);
      payload.append('longitude', formData.longitude);
      payload.append('address', formData.address);
      payload.append('description', formData.description);

      const actsJson = activities.map(a => ({
        title: a.title,
        description: a.description,
        photos: a.photos.filter(p => typeof p === 'string')
      }));
      payload.append('activities', JSON.stringify(actsJson));

      activities.forEach((act, idx) => {
        act.photos.forEach(photo => {
          if (photo instanceof File) {
            payload.append(`activities_photos_${idx}[]`, photo);
          }
        });
      });

      if (formData.id) {
        await axios.post(`${API_URL}/locations/${formData.id}`, payload, config);
        Swal.fire('Berhasil', 'Data lokasi diperbarui!', 'success');
      } else {
        await axios.post(`${API_URL}/locations`, payload, config);
        Swal.fire('Berhasil', 'Lokasi baru ditambahkan!', 'success');
      }
      
      setView('list');
      fetchLocations();
    } catch (err: any) {
      Swal.fire('Gagal', err.response?.data?.message || 'Terjadi kesalahan', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({ 
      title: 'Hapus Lokasi?', 
      text: "Data yang dihapus tidak bisa dikembalikan!", 
      icon: 'warning', 
      showCancelButton: true,
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal'
    });
    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`${API_URL}/locations/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        Swal.fire('Terhapus!', 'Data lokasi telah dihapus.', 'success');
        fetchLocations();
      } catch (err) {
        Swal.fire('Error', 'Gagal menghapus data', 'error');
      }
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {view === 'list' ? (
        /* ==========================================
           LIST VIEW LAYOUT
           ========================================== */
        <>
          {/* Dashboard Category Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { label: 'SD', count: categoryCounts['SD'], icon: 'fa-solid fa-graduation-cap' },
              { label: 'SMP', count: categoryCounts['SMP'], icon: 'fa-solid fa-book-open' },
              { label: 'SMA/SMK', count: categoryCounts['SMA/SMK'], icon: 'fa-solid fa-school' },
              { label: 'Perguruan Tinggi', count: categoryCounts['PT'], icon: 'fa-solid fa-university' },
              { label: 'Komunitas', count: categoryCounts['Komunitas'], icon: 'fa-solid fa-users' },
            ].map((item, idx) => (
              <div key={idx} className="bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-gray-800 text-left flex flex-col justify-center cursor-default group hover:bg-primary transition-all duration-300 hover:-translate-y-1 hover:shadow-md relative overflow-hidden min-h-[92px]">
                <h3 className="text-slate-400 dark:text-gray-400 group-hover:text-blue-100 text-xs font-bold uppercase tracking-wider transition-colors z-10 relative">{item.label}</h3>
                <p className="text-3xl font-extrabold text-primary group-hover:text-white mt-1.5 transition-colors z-10 relative leading-none">{item.count}</p>
                <div className="absolute right-4 bottom-2 text-slate-100 dark:text-gray-800 text-5xl opacity-80 group-hover:opacity-20 group-hover:scale-110 group-hover:text-white transition-all duration-300 pointer-events-none z-0">
                  <i className={item.icon}></i>
                </div>
              </div>
            ))}
          </div>

          {/* Main List Container */}
          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm p-6 border border-slate-100 dark:border-gray-800">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 border-b border-slate-100 dark:border-gray-700 pb-4 gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Manajemen Peta Edukasi</h2>
                <p className="text-slate-400 text-sm mt-1">Kelola sebaran lokasi sekolah dan komunitas BI Mengajar.</p>
              </div>
              <button 
                onClick={() => handleOpenForm()} 
                className="bg-primary hover:bg-blue-900 text-white px-5 py-3 rounded-xl font-bold flex items-center gap-2 shadow-md transition-all hover:-translate-y-0.5"
              >
                <i className="fa-solid fa-plus"></i> Tambah Lokasi
              </button>
            </div>

            {/* Filters bar */}
            <div className="flex flex-col md:flex-row gap-4 mb-5 justify-between items-stretch md:items-center">
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative w-full md:w-64">
                  <input 
                    type="text" 
                    placeholder="Cari nama instansi..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full p-2.5 pl-10 border border-slate-200 dark:border-gray-700 rounded-xl text-sm outline-none focus:border-primary/50 dark:bg-gray-800"
                  />
                  <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm"></i>
                </div>
                <select 
                  value={filterCategory} 
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="p-2.5 border border-slate-200 dark:border-gray-700 rounded-xl text-sm dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold cursor-pointer outline-none focus:border-primary/50"
                >
                  <option value="Semua">Semua Kategori</option>
                  <option value="SD">SD</option>
                  <option value="SMP">SMP</option>
                  <option value="SMA/SMK">SMA/SMK</option>
                  <option value="Perguruan Tinggi">Perguruan Tinggi</option>
                  <option value="Komunitas">Komunitas</option>
                </select>
                <select 
                  value={filterYear} 
                  onChange={(e) => setFilterYear(e.target.value)}
                  className="p-2.5 border border-slate-200 dark:border-gray-700 rounded-xl text-sm dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold cursor-pointer outline-none focus:border-primary/50"
                >
                  <option value="Semua">Semua Tahun</option>
                  <option value="2025">2025</option>
                  <option value="2026">2026</option>
                </select>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-500 font-semibold self-end md:self-auto">
                <span>Tampilkan</span>
                <select 
                  value={itemsPerPage} 
                  onChange={(e) => setItemsPerPage(Number(e.target.value))}
                  className="p-2 border border-slate-200 dark:border-gray-700 rounded-xl dark:bg-gray-800 cursor-pointer outline-none"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
                <span>baris</span>
              </div>
            </div>

            {/* List Table */}
            <div className="overflow-x-auto border border-slate-100 dark:border-gray-700 rounded-2xl shadow-inner bg-slate-50/20">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-primary text-white">
                    <th className="p-4 text-xs font-bold uppercase tracking-wider w-16 text-center">No.</th>
                    <th className="p-4 text-xs font-bold uppercase tracking-wider cursor-pointer hover:bg-blue-900 transition-colors w-1/3" onClick={() => handleSort('name')}>
                      Nama Instansi {sortConfig?.key === 'name' ? (sortConfig.direction === 'asc' ? ' ↑' : ' ↓') : ' ↕'}
                    </th>
                    <th className="p-4 text-xs font-bold uppercase tracking-wider cursor-pointer hover:bg-blue-900 transition-colors w-1/5" onClick={() => handleSort('category')}>
                      Kategori {sortConfig?.key === 'category' ? (sortConfig.direction === 'asc' ? ' ↑' : ' ↓') : ' ↕'}
                    </th>
                    <th className="p-4 text-xs font-bold uppercase tracking-wider w-1/3">Koordinat (Lat, Lng)</th>
                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="text-slate-600 dark:text-gray-300 text-sm font-semibold">
                  {currentItems.map((loc, idx) => (
                    <tr key={loc.id} className="border-b border-slate-50 dark:border-gray-800 hover:bg-slate-50/50 dark:hover:bg-gray-800/30 transition-colors">
                      <td className="p-4 text-slate-400 text-center">{indexOfFirstItem + idx + 1}</td>
                      <td className="p-4 text-slate-800 dark:text-gray-200 font-bold">{loc.name}</td>
                      <td className="p-4">
                        <span className="px-3 py-1 bg-blue-50/50 dark:bg-blue-900/30 text-primary dark:text-blue-300 border border-blue-100/50 dark:border-blue-800/50 rounded-lg text-xs font-bold shadow-sm">
                          {loc.category}
                        </span>
                      </td>
                      <td className="p-4 font-mono text-slate-400 text-xs">{loc.latitude}, {loc.longitude}</td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-4">
                          <button onClick={() => handleOpenForm(loc)} className="text-primary dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 transition-colors" title="Edit">
                            <i className="fa-solid fa-pen-to-square text-base"></i>
                          </button>
                          <button onClick={() => handleDelete(loc.id)} className="text-red-500 hover:text-red-700 transition-colors" title="Hapus">
                            <i className="fa-solid fa-trash-can text-base"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {currentItems.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-12 text-center text-slate-400 font-bold">Belum ada data atau tidak ada hasil pencarian.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 0 && (
              <div className="flex justify-between items-center mt-6">
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                  Menampilkan <span className="text-slate-800 dark:text-gray-200">{indexOfFirstItem + 1}</span> - <span className="text-slate-800 dark:text-gray-200">{Math.min(indexOfLastItem, sortedLocations.length)}</span> dari <span className="text-slate-800 dark:text-gray-200">{sortedLocations.length}</span> data
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
        </>
      ) : (
        /* ==========================================
           SPACIOUS DEDICATED FORM WORKSPACE LAYOUT
           ========================================== */
        <div className="flex flex-col gap-6 animate-fade-in">
          {/* Form Header / Breadcrumbs */}
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
                  <span>Peta Edukasi</span>
                  <span>/</span>
                  <span>{formData.id ? 'Edit Lokasi' : 'Tambah Lokasi'}</span>
                </div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-white mt-1">
                  {formData.id ? 'Edit Detail Lokasi' : 'Tambah Lokasi Baru'}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button 
                type="button" 
                onClick={() => setView('list')}
                className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-gray-700 text-slate-600 dark:text-gray-300 font-bold text-xs"
              >
                Batal
              </button>
              <button 
                onClick={handleSubmit} 
                disabled={isLoading}
                className="px-6 py-2.5 bg-primary hover:bg-blue-900 text-white font-bold rounded-xl text-xs disabled:opacity-50 flex items-center gap-2 shadow-md"
              >
                {isLoading ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-floppy-disk"></i>}
                Simpan Lokasi
              </button>
            </div>
          </div>

          {/* Form Content split in 2 columns */}
          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* LEFT COLUMN: Informasi Dasar & Peta (lg:col-span-5) */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              
              {/* Card 1: Informasi Dasar */}
              <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-slate-100 dark:border-gray-800 shadow-sm flex flex-col gap-5">
                <h4 className="font-bold text-slate-800 dark:text-white border-b border-slate-100 dark:border-gray-700 pb-3 flex items-center gap-2 text-sm uppercase tracking-wider">
                  <i className="fa-solid fa-circle-info text-primary"></i> Informasi Dasar
                </h4>
                
                <div className="flex flex-col gap-4">
                  {/* Name field with Autocomplete suggestions */}
                  <div className="relative">
                    <label className="block text-xs font-bold text-slate-600 dark:text-gray-300 mb-1.5 px-1 uppercase tracking-wider">Nama Sekolah / Instansi *</label>
                    <div className="relative group">
                      <input 
                        type="text" 
                        required 
                        value={formData.name} 
                        onChange={e => handleSearchInput(e.target.value)} 
                        className="w-full p-2.5 border border-slate-200 dark:border-gray-600 rounded-xl outline-none focus:border-primary/50 text-sm dark:bg-gray-700 text-slate-800 dark:text-white" 
                        placeholder="Ketik nama sekolah..." 
                      />
                      <div className="absolute right-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs">
                        {isSearching ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-magnifying-glass"></i>}
                      </div>
                    </div>

                    {suggestions.length > 0 && (
                      <ul className="absolute z-50 w-full bg-white dark:bg-gray-800 border border-slate-150 dark:border-gray-700 mt-1.5 rounded-xl shadow-xl max-h-60 overflow-y-auto">
                        {suggestions.map((s, i) => (
                          <li 
                            key={i} 
                            onClick={() => {
                              const name = s.name || s.properties?.name || '';
                              const lat = s.latitude || s.lat || s.geometry?.coordinates[1];
                              const lon = s.longitude || s.lon || s.geometry?.coordinates[0];
                              setFormData(prev => ({ ...prev, name }));
                              setPosition([lat, lon]);
                              setSuggestions([]);
                            }} 
                            className="p-3 hover:bg-slate-50 dark:hover:bg-gray-700 cursor-pointer border-b border-slate-100 dark:border-gray-700 last:border-0 transition-colors"
                          >
                            <div className="font-bold text-xs text-slate-800 dark:text-gray-200">{s.name || s.properties?.name}</div>
                            <div className="text-[10px] text-slate-400 mt-0.5">
                              {s.alamat || [s.street, s.city, s.state].filter(Boolean).join(', ')}
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* Category Field */}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-gray-300 mb-1.5 px-1 uppercase tracking-wider">Kategori *</label>
                    <select 
                      value={formData.category} 
                      onChange={e => setFormData({...formData, category: e.target.value})} 
                      className="w-full p-2.5 border border-slate-200 dark:border-gray-600 rounded-xl outline-none focus:border-primary/50 text-sm dark:bg-gray-700 cursor-pointer text-slate-800 dark:text-white"
                    >
                      <option value="SD">SD</option>
                      <option value="SMP">SMP</option>
                      <option value="SMA/SMK">SMA/SMK</option>
                      <option value="Perguruan Tinggi">Perguruan Tinggi</option>
                      <option value="Komunitas">Komunitas</option>
                    </select>
                  </div>

                  {/* Year Field */}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-gray-300 mb-1.5 px-1 uppercase tracking-wider">Tahun Kegiatan *</label>
                    <select 
                      value={formData.year} 
                      onChange={e => setFormData({...formData, year: e.target.value})} 
                      className="w-full p-2.5 border border-slate-200 dark:border-gray-600 rounded-xl outline-none focus:border-primary/50 text-sm dark:bg-gray-700 cursor-pointer text-slate-800 dark:text-white"
                    >
                      <option value="2025">2025</option>
                      <option value="2026">2026</option>
                    </select>
                  </div>

                  {/* Address Field */}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-gray-300 mb-1.5 px-1 uppercase tracking-wider">Alamat Lengkap</label>
                    <textarea 
                      value={formData.address} 
                      onChange={e => setFormData({...formData, address: e.target.value})} 
                      className="w-full p-2.5 border border-slate-200 dark:border-gray-600 rounded-xl outline-none focus:border-primary/50 text-sm dark:bg-gray-700 h-16 resize-none text-slate-800 dark:text-white" 
                      placeholder="Tulis alamat sekolah/instansi..."
                    />
                  </div>

                  {/* Description Field */}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-gray-300 mb-1.5 px-1 uppercase tracking-wider">Deskripsi Singkat</label>
                    <textarea 
                      value={formData.description} 
                      onChange={e => setFormData({...formData, description: e.target.value})} 
                      className="w-full p-2.5 border border-slate-200 dark:border-gray-600 rounded-xl outline-none focus:border-primary/50 text-sm dark:bg-gray-700 h-16 resize-none text-slate-800 dark:text-white" 
                      placeholder="Tulis deskripsi singkat..."
                    />
                  </div>
                </div>
              </div>

              {/* Card 2: Peta Lokasi */}
              <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-slate-100 dark:border-gray-800 shadow-sm flex flex-col gap-4">
                <h4 className="font-bold text-slate-800 dark:text-white border-b border-slate-100 dark:border-gray-700 pb-3 flex items-center gap-2 text-sm uppercase tracking-wider">
                  <i className="fa-solid fa-map-location-dot text-primary"></i> Titik Lokasi Peta
                </h4>
                
                {/* Map Panel Wrapper */}
                <div className="overflow-hidden rounded-2xl border border-slate-100 shadow-inner">
                  <LocationPickerMap position={position} setPosition={setPosition} />
                </div>
                
                {/* Coordinates Info badges */}
                <div className="flex gap-2 justify-center py-2 bg-slate-50 dark:bg-gray-800 rounded-xl border border-slate-150/40">
                  <div className="text-center px-4 border-r border-slate-200">
                    <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest">Latitude</span>
                    <span className="text-xs font-bold font-mono text-slate-700 dark:text-gray-200">{formData.latitude || 'Pilih di peta'}</span>
                  </div>
                  <div className="text-center px-4">
                    <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest">Longitude</span>
                    <span className="text-xs font-bold font-mono text-slate-700 dark:text-gray-200">{formData.longitude || 'Pilih di peta'}</span>
                  </div>
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN: Daftar Kegiatan & Galeri (lg:col-span-7) */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              
              {/* Card 3: Daftar Kegiatan */}
              <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-slate-100 dark:border-gray-800 shadow-sm flex flex-col gap-5">
                <div className="flex justify-between items-center border-b border-slate-100 dark:border-gray-700 pb-3">
                  <h4 className="font-bold text-slate-800 dark:text-white flex items-center gap-2 text-sm uppercase tracking-wider">
                    <i className="fa-solid fa-camera-retro text-primary"></i> Daftar Kegiatan & Galeri
                  </h4>
                  <button 
                    type="button" 
                    onClick={() => setActivities([...activities, {title: '', description: '', photos: []}])} 
                    className="text-xs bg-blue-50 hover:bg-blue-100 text-primary dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-blue-300 px-3.5 py-2 rounded-xl transition-all font-bold flex items-center gap-1"
                  >
                    <i className="fa-solid fa-plus text-[10px]"></i> Tambah Kegiatan
                  </button>
                </div>
                
                {/* Scrollable list of activity blocks */}
                <div className="flex flex-col gap-5 max-h-[750px] overflow-y-auto pr-1.5 custom-scrollbar">
                  {activities.map((act, idx) => (
                    <div key={idx} className="border border-slate-100 dark:border-gray-700 rounded-2xl p-5 bg-slate-50/30 dark:bg-gray-800/30 relative flex flex-col gap-4 group">
                      
                      {/* Delete activity button */}
                      <button 
                        type="button" 
                        onClick={() => setActivities(activities.filter((_, i) => i !== idx))} 
                        className="absolute top-4 right-4 text-slate-300 hover:text-red-500 transition-colors w-7 h-7 rounded-lg hover:bg-red-50 flex items-center justify-center border border-transparent hover:border-red-100" 
                        title="Hapus Kegiatan"
                      >
                        <i className="fa-solid fa-trash-can text-sm"></i>
                      </button>
                      
                      {/* Activity Title Input */}
                      <div className="pr-8 flex flex-col gap-1.5">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nama Kegiatan {idx + 1}</label>
                        <input 
                          type="text" 
                          value={act.title} 
                          onChange={e => {
                            const newActs = [...activities];
                            newActs[idx].title = e.target.value;
                            setActivities(newActs);
                          }} 
                          className="w-full p-2.5 border border-slate-200 dark:border-gray-600 rounded-xl dark:bg-gray-700 text-sm outline-none focus:border-primary/50 text-slate-800 dark:text-white" 
                          placeholder="Contoh: Sosialisasi QRIS" 
                        />
                      </div>
                      
                      {/* Activity Description Textarea */}
                      <div className="flex flex-col gap-1.5">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Detail Kegiatan</label>
                        <textarea 
                          value={act.description} 
                          onChange={e => {
                            const newActs = [...activities];
                            newActs[idx].description = e.target.value;
                            setActivities(newActs);
                          }} 
                          className="w-full p-2.5 border border-slate-200 dark:border-gray-600 rounded-xl dark:bg-gray-700 h-20 text-sm outline-none focus:border-primary/50 resize-none text-slate-800 dark:text-white" 
                          placeholder="Ceritakan detail kegiatan..."
                        />
                      </div>

                      {/* File Upload Block */}
                      <div className="flex flex-col gap-2">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Upload Galeri Foto</label>
                        
                        <div className="relative w-full">
                          <input 
                            type="file" 
                            multiple 
                            accept="image/*" 
                            onChange={e => {
                              if (e.target.files) {
                                const newActs = [...activities];
                                const newFiles = Array.from(e.target.files);
                                newActs[idx].photos = [...newActs[idx].photos, ...newFiles];
                                setActivities(newActs);
                              }
                            }} 
                            className="hidden" 
                            id={`file-upload-${idx}`}
                          />
                          <label 
                            htmlFor={`file-upload-${idx}`}
                            className="w-full py-3 px-4 border-2 border-dashed border-slate-200 hover:border-primary/40 rounded-xl bg-white dark:bg-gray-700 hover:bg-slate-50 flex items-center justify-center gap-2 cursor-pointer transition-all text-xs font-bold text-slate-500 hover:text-primary"
                          >
                            <i className="fa-regular fa-image text-sm"></i> Pilih File Gambar
                          </label>
                        </div>
                        
                        {/* Selected photos feedback badges */}
                        {act.photos.length > 0 && (
                          <div className="mt-1 flex flex-wrap gap-1.5 items-center bg-green-50/50 p-2.5 rounded-xl border border-green-150/40">
                            <span className="text-[10px] text-green-700 font-bold flex items-center gap-1">
                              <i className="fa-solid fa-circle-check"></i>
                              {act.photos.length} foto tersimpan:
                            </span>
                            <div className="flex flex-wrap gap-1">
                              {act.photos.map((p, pIdx) => (
                                <span key={pIdx} className="px-2 py-0.5 bg-green-100 text-green-700 text-[9px] font-bold rounded-md">
                                  {typeof p === 'string' ? 'Foto Server' : p.name.substring(0, 12) + '...'}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                    </div>
                  ))}
                  
                  {activities.length === 0 && (
                    <div className="text-center p-12 border-2 border-dashed border-slate-100 dark:border-gray-700 rounded-2xl text-slate-400 text-sm font-semibold flex flex-col items-center justify-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center">
                        <i className="fa-regular fa-folder-open text-lg"></i>
                      </div>
                      <span>Belum ada rincian kegiatan. Klik "Tambah Kegiatan" di atas.</span>
                    </div>
                  )}
                </div>
              </div>

            </div>

          </form>
        </div>
      )}
    </div>
  );
}
