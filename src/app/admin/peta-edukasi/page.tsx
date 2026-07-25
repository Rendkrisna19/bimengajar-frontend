'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import dynamic from 'next/dynamic';

const LocationPickerMap = dynamic(() => import('@/components/admin/LocationPickerMap'), {
  ssr: false,
  loading: () => <div className="w-full h-[300px] bg-gray-100 flex items-center justify-center">Loading Map...</div>
});

const API_URL = 'http://localhost:8000/api';

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
  const [isModalOpen, setIsModalOpen] = useState(false);
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

  const handleOpenModal = (loc: EdukasiLocation | null = null) => {
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
    setIsModalOpen(true);
  };

  const handleSearchInput = async (value: string) => {
    // Update name field while typing
    setFormData(prev => ({ ...prev, name: value }));

    // Minimum characters before searching
    if (value.length < 3) {
      setSuggestions([]);
      return;
    }

    setIsSearching(true);
    try {
      // 1️⃣ Primary: devapi.sekolah.id (restricted to Pematang Siantar)
      const devRes = await axios.get('https://devapi.sekolah.id/v1/sekolah', {
        params: { q: value, kota: 'Pematang Siantar', limit: 5 },
      });
      if (devRes.data && (devRes.data.sekolahs || devRes.data.data)) {
        const list = devRes.data.sekolahs || devRes.data.data;
        setSuggestions(list);
        return; // success – skip fallbacks
      }
      // Unexpected shape – trigger fallback
      throw new Error('Unexpected devapi response');
    } catch (devErr) {
      console.warn('devapi.sekolah.id failed, trying Photon API', devErr);
      try {
        // 2️⃣ Fallback: Photon (OpenStreetMap) with bounding box for Pematang Siantar
        const bbox = '98.95,2.90,99.12,3.02'; // minLon,minLat,maxLon,maxLat
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
          // 3️⃣ Final fallback: Nominatim (free, global) – include keyword "sekolah"
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
          // All providers failed – log and show gentle warning to user
          console.error('Autocomplete failed all providers', {
            devErr,
            photonErr,
            nominatimErr,
          });
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
      
      setIsModalOpen(false);
      fetchLocations();
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
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'SD', count: categoryCounts['SD'] },
          { label: 'SMP', count: categoryCounts['SMP'] },
          { label: 'SMA/SMK', count: categoryCounts['SMA/SMK'] },
          { label: 'Perguruan Tinggi', count: categoryCounts['PT'] },
          { label: 'Komunitas', count: categoryCounts['Komunitas'] },
        ].map((item, idx) => (
          <div key={idx} className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-800 text-center flex flex-col justify-center items-center cursor-default group hover:bg-primary transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
            <h3 className="text-gray-500 dark:text-gray-400 group-hover:text-blue-100 text-xs font-bold uppercase tracking-wider transition-colors">{item.label}</h3>
            <p className="text-3xl font-bold text-primary group-hover:text-white mt-2 transition-colors">{item.count}</p>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-800">
        <div className="flex justify-between items-center mb-6 border-b border-gray-200 dark:border-gray-700 pb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Manajemen Peta Edukasi</h2>
            <p className="text-gray-500 text-sm mt-1">Kelola sebaran lokasi sekolah dan komunitas BI Mengajar.</p>
          </div>
          <button onClick={() => handleOpenModal()} className="bg-primary hover:bg-blue-800 text-white px-5 py-2.5 rounded-lg font-bold flex items-center gap-2 shadow-md transition-all hover:-translate-y-0.5">
            <i className="fa-solid fa-plus"></i> Tambah Lokasi
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-4 justify-between items-center">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <input 
                type="text" 
                placeholder="Cari nama instansi..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full p-2 pl-9 border border-gray-300 dark:border-gray-700 rounded-lg text-sm dark:bg-gray-800"
              />
              <i className="fa-solid fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
            </div>
            <select 
              value={filterCategory} 
              onChange={(e) => setFilterCategory(e.target.value)}
              className="p-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium cursor-pointer"
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
              className="p-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium cursor-pointer"
            >
              <option value="Semua">Semua Tahun</option>
              <option value="2025">2025</option>
              <option value="2026">2026</option>
            </select>
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
              <option value={50}>50</option>
            </select>
            <span>baris</span>
          </div>
        </div>

        <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-primary text-white">
                <th className="p-4 text-sm font-semibold w-16 text-center">No.</th>
                <th className="p-4 text-sm font-semibold cursor-pointer hover:bg-blue-800 transition-colors w-1/3" onClick={() => handleSort('name')}>
                  Nama Instansi {sortConfig?.key === 'name' ? (sortConfig.direction === 'asc' ? ' ↑' : ' ↓') : ' ↕'}
                </th>
                <th className="p-4 text-sm font-semibold cursor-pointer hover:bg-blue-800 transition-colors w-1/5" onClick={() => handleSort('category')}>
                  Kategori {sortConfig?.key === 'category' ? (sortConfig.direction === 'asc' ? ' ↑' : ' ↓') : ' ↕'}
                </th>
                <th className="p-4 text-sm font-semibold w-1/3">Koordinat (Lat, Lng)</th>
                <th className="p-4 text-sm font-semibold text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((loc, idx) => (
                <tr key={loc.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="p-4 text-sm font-medium text-gray-500 text-center">{indexOfFirstItem + idx + 1}</td>
                  <td className="p-4 text-sm font-bold text-gray-800 dark:text-gray-200">{loc.name}</td>
                  <td className="p-4 text-sm"><span className="px-3 py-1 bg-gray-50 dark:bg-gray-800 text-primary border border-gray-200 dark:border-gray-700 rounded-lg text-xs font-bold shadow-sm">{loc.category}</span></td>
                  <td className="p-4 text-sm text-gray-500 font-mono">{loc.latitude}, {loc.longitude}</td>
                  <td className="p-4 text-sm">
                    <div className="flex items-center justify-center gap-4">
                      <button onClick={() => handleOpenModal(loc)} className="text-primary hover:text-blue-800 transition-colors" title="Edit"><i className="fa-solid fa-pen-to-square text-lg"></i></button>
                      <button onClick={() => handleDelete(loc.id)} className="text-red-500 hover:text-red-700 transition-colors" title="Hapus"><i className="fa-solid fa-trash-can text-lg"></i></button>
                    </div>
                  </td>
                </tr>
              ))}
              {currentItems.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-10 text-center text-gray-400 font-medium">Belum ada data atau tidak ada hasil pencarian.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 0 && (
          <div className="flex justify-between items-center mt-6">
            <span className="text-sm text-gray-500 font-medium">
              Menampilkan <span className="font-bold text-gray-800 dark:text-gray-200">{indexOfFirstItem + 1}</span> - <span className="font-bold text-gray-800 dark:text-gray-200">{Math.min(indexOfLastItem, sortedLocations.length)}</span> dari <span className="font-bold text-gray-800 dark:text-gray-200">{sortedLocations.length}</span> data
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
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center sticky top-0 bg-white dark:bg-gray-800 z-10">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white">{formData.id ? 'Edit Lokasi' : 'Tambah Lokasi Baru'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-red-500"><i className="fa-solid fa-xmark text-xl"></i></button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="flex flex-col gap-6">
                <div>
                  <h4 className="font-bold text-gray-800 dark:text-white mb-4 border-b border-gray-200 dark:border-gray-700 pb-2"><i className="fa-solid fa-circle-info text-primary mr-2"></i>Informasi Dasar</h4>
                  <div className="flex flex-col gap-4">
                    <div className="relative">
                      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Nama Sekolah / Instansi *</label>
                      <div className="relative">
                        <input 
                          type="text" 
                          required 
                          value={formData.name} 
                          onChange={e => handleSearchInput(e.target.value)} 
                          className="w-full p-2 pl-3 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700" 
                          placeholder="Ketik nama sekolah... (Otomatis deteksi di peta)" 
                        />
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                          {isSearching ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-search"></i>}
                        </div>
                      </div>

                      {suggestions.length > 0 && (
                        <ul className="absolute z-50 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 mt-1 rounded-lg shadow-xl max-h-60 overflow-y-auto">
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
                              className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-100 dark:border-gray-700 last:border-0"
                            >
                              <div className="font-bold text-sm text-gray-800 dark:text-gray-200">{s.name || s.properties?.name}</div>
                              <div className="text-xs text-gray-500">
                                {s.alamat || [s.street, s.city, s.state].filter(Boolean).join(', ')}
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Kategori *</label>
                      <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700">
                        <option value="SD">SD</option>
                        <option value="SMP">SMP</option>
                        <option value="SMA/SMK">SMA/SMK</option>
                        <option value="Perguruan Tinggi">Perguruan Tinggi</option>
                        <option value="Komunitas">Komunitas</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Tahun Kegiatan *</label>
                      <select value={formData.year} onChange={e => setFormData({...formData, year: e.target.value})} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700">
                        <option value="2025">2025</option>
                        <option value="2026">2026</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Deskripsi Singkat Tempat</label>
                      <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 h-20" placeholder="Opsional..."></textarea>
                    </div>
                  </div>
                </div>

                <div className="mt-2">
                  <h4 className="font-bold text-gray-800 dark:text-white mb-4 border-b border-gray-200 dark:border-gray-700 pb-2"><i className="fa-solid fa-map-location-dot text-primary mr-2"></i>Peta Lokasi</h4>
                  <LocationPickerMap position={position} setPosition={setPosition} />
                  <div className="mt-2 flex gap-4 text-xs font-mono text-gray-500 bg-gray-50 dark:bg-gray-800 p-2 rounded">
                    <span>Lat: {formData.latitude || 'Belum dipilih'}</span>
                    <span>Lng: {formData.longitude || 'Belum dipilih'}</span>
                  </div>
                </div>
              </div>

              {/* Form Kolom Kanan: Daftar Kegiatan (Bisa Lebih Dari 1) */}
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center mb-2 border-b border-gray-200 dark:border-gray-700 pb-2">
                  <h4 className="font-bold text-gray-800 dark:text-white"><i className="fa-solid fa-camera-retro text-primary mr-2"></i>Daftar Kegiatan & Galeri</h4>
                  <button type="button" onClick={() => setActivities([...activities, {title: '', description: '', photos: []}])} className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200 px-3 py-1.5 rounded transition-colors font-medium">
                    <i className="fa-solid fa-plus mr-1"></i> Tambah Kegiatan
                  </button>
                </div>
                
                <div className="flex flex-col gap-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                  {activities.map((act, idx) => (
                    <div key={idx} className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 bg-white dark:bg-gray-800 relative">
                      <button type="button" onClick={() => setActivities(activities.filter((_, i) => i !== idx))} className="absolute top-4 right-4 text-red-500 hover:text-red-700" title="Hapus Kegiatan">
                        <i className="fa-solid fa-trash-can"></i>
                      </button>
                      
                      <div className="mb-3 pr-8">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nama Kegiatan {idx + 1}</label>
                        <input type="text" value={act.title} onChange={e => {
                          const newActs = [...activities];
                          newActs[idx].title = e.target.value;
                          setActivities(newActs);
                        }} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 text-sm" placeholder="Contoh: Sosialisasi QRIS" />
                      </div>
                      
                      <div className="mb-3">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Detail Kegiatan</label>
                        <textarea value={act.description} onChange={e => {
                          const newActs = [...activities];
                          newActs[idx].description = e.target.value;
                          setActivities(newActs);
                        }} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 h-16 text-sm" placeholder="Kegiatan berjalan lancar..."></textarea>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Upload Galeri Foto (Bisa Banyak)</label>
                        <input type="file" multiple accept="image/*" onChange={e => {
                          if (e.target.files) {
                            const newActs = [...activities];
                            const newFiles = Array.from(e.target.files);
                            newActs[idx].photos = [...newActs[idx].photos, ...newFiles];
                            setActivities(newActs);
                          }
                        }} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                        
                        {/* Photo Preview / Existing Photos count */}
                        {act.photos.length > 0 && (
                          <div className="mt-2 text-xs text-green-600 bg-green-50 p-2 rounded">
                            <i className="fa-solid fa-check-circle mr-1"></i> {act.photos.length} foto dipilih / tersimpan.
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {activities.length === 0 && (
                    <div className="text-center p-8 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl text-gray-400 text-sm">
                      Belum ada rincian kegiatan.<br/>Klik "Tambah Kegiatan" di atas.
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="col-span-1 lg:col-span-2 pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3 mt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 font-medium">Batal</button>
                <button type="submit" disabled={isLoading} className="px-8 py-2 bg-primary hover:bg-blue-800 text-white font-bold rounded-lg disabled:opacity-50 flex items-center gap-2 shadow-md">
                  {isLoading ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-paper-plane"></i>}
                  Simpan Lokasi & Kegiatan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
