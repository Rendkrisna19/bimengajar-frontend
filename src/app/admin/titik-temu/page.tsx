'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import dynamic from 'next/dynamic';
import API_URL from '@/lib/api';

const MapView = dynamic(() => import('@/components/PojokKoin/MapView'), { ssr: false, loading: () => (
  <div className="w-full h-64 flex items-center justify-center bg-gray-100 rounded-xl">
    <div className="animate-spin rounded-full h-8 w-8 border-t-4 border-primary"></div>
  </div>
)});

interface CoinProvider {
  id: number;
  name: string;
  user_type: string;
  whatsapp: string;
  address: string;
  latitude: number;
  longitude: number;
  total_coins: number;
  denominations: string[];
  operational_hours: string | null;
  notes: string | null;
  is_active: boolean;
}

const USER_TYPE_LABELS: Record<string, string> = {
  perorangan: 'Perorangan',
  umkm: 'UMKM',
  instansi: 'Instansi',
};

const USER_TYPE_COLORS: Record<string, string> = {
  perorangan: 'bg-purple-50 text-purple-700 border-purple-100',
  umkm: 'bg-orange-50 text-orange-700 border-orange-100',
  instansi: 'bg-blue-50 text-blue-700 border-blue-100',
};

const DENOMINATIONS = [
  { value: '100', label: 'Rp100' },
  { value: '200', label: 'Rp200' },
  { value: '500', label: 'Rp500' },
  { value: '1000', label: 'Rp1.000' },
];

export default function AdminTitikTemuPage() {
  const [providers, setProviders] = useState<CoinProvider[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<CoinProvider | null>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Form states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<CoinProvider | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '', user_type: 'perorangan', whatsapp: '', address: '',
    latitude: '', longitude: '', total_coins: '', denominations: [] as string[],
    operational_hours: '', notes: '',
  });

  useEffect(() => {
    fetchProviders();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterType, filterStatus]);

  const fetchProviders = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get(`${API_URL}/coin-providers?all=true`);
      if (res.data.status === 'success') setProviders(res.data.data);
    } catch { console.error('Failed to fetch'); }
    finally { setIsLoading(false); }
  };

  const handleToggle = async (id: number) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`${API_URL}/coin-providers/${id}/toggle`, {}, { headers: { Authorization: `Bearer ${token}` } });
      fetchProviders();
    } catch {
      Swal.fire('Error', 'Gagal mengubah status.', 'error');
    }
  };

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({ title: 'Hapus Titik Temu?', text: 'Data tidak bisa dikembalikan!', icon: 'warning', showCancelButton: true, confirmButtonColor: '#d33', cancelButtonColor: '#0054a7' });
    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`${API_URL}/coin-providers/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        Swal.fire('Terhapus!', 'Data telah dihapus.', 'success');
        fetchProviders();
      } catch { Swal.fire('Error', 'Gagal menghapus.', 'error'); }
    }
  };

  const openCreate = () => {
    setEditItem(null);
    setForm({
      name: '', user_type: 'perorangan', whatsapp: '', address: '',
      latitude: '', longitude: '', total_coins: '', denominations: [],
      operational_hours: '', notes: '',
    });
    setIsFormModalOpen(true);
  };

  const openEdit = (item: CoinProvider) => {
    setEditItem(item);
    setForm({
      name: item.name,
      user_type: item.user_type,
      whatsapp: item.whatsapp,
      address: item.address,
      latitude: item.latitude.toString(),
      longitude: item.longitude.toString(),
      total_coins: item.total_coins.toString(),
      denominations: item.denominations || [],
      operational_hours: item.operational_hours || '',
      notes: item.notes || '',
    });
    setIsFormModalOpen(true);
  };

  const handleDenominationToggle = (val: string) => {
    setForm(prev => ({
      ...prev,
      denominations: prev.denominations.includes(val)
        ? prev.denominations.filter(d => d !== val)
        : [...prev.denominations, val],
    }));
  };

  const handlePinSet = (lat: number, lng: number) => {
    setForm(prev => ({ ...prev, latitude: lat.toFixed(6), longitude: lng.toFixed(6) }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.denominations.length === 0) { Swal.fire('Perhatian', 'Pilih minimal satu pecahan koin.', 'warning'); return; }
    if (!form.latitude || !form.longitude) { Swal.fire('Perhatian', 'Tentukan lokasi pada peta (koordinat tidak boleh kosong).', 'warning'); return; }

    setSaving(true);
    const token = localStorage.getItem('token');
    
    try {
      const payload = { ...form, total_coins: parseInt(form.total_coins) || 0 };
      
      let res;
      if (editItem) {
        res = await axios.put(`${API_URL}/coin-providers/${editItem.id}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        res = await axios.post(`${API_URL}/coin-providers`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      
      if (res.data.status === 'success') {
        Swal.fire('Berhasil!', `Data titik temu berhasil ${editItem ? 'diperbarui' : 'disimpan'}.`, 'success');
        setIsFormModalOpen(false);
        fetchProviders();
      } else {
        Swal.fire('Gagal!', res.data.message || 'Terjadi kesalahan.', 'error');
      }
    } catch {
      Swal.fire('Error!', 'Tidak dapat terhubung ke server.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const filtered = providers.filter(p => {
    const q = searchQuery.toLowerCase();
    const matchQ = p.name.toLowerCase().includes(q) || p.address.toLowerCase().includes(q);
    const matchType = filterType ? p.user_type === filterType : true;
    const matchStatus = filterStatus === '' ? true : filterStatus === 'aktif' ? p.is_active : !p.is_active;
    return matchQ && matchType && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Manajemen Titik Temu</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Monitor dan kelola data penyedia koin Titik Temu.</p>
        </div>
        <button onClick={openCreate}
          className="bg-primary hover:bg-blue-800 text-white font-bold py-2.5 px-5 rounded-xl shadow-md flex items-center gap-2 transition-colors"
        >
          <i className="fa-solid fa-plus"></i> Tambah Titik Temu
        </button>
      </div>

      <div className="bg-white dark:bg-[#1e1e1e] rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-800 overflow-hidden">
        
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-3 mb-4 justify-between items-center">
          <div className="flex items-center gap-3 w-full flex-wrap">
            <div className="relative w-full md:w-64">
              <input
                type="text"
                placeholder="Cari nama / alamat..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full p-2 pl-9 border border-gray-200 dark:border-gray-700 rounded-lg text-sm dark:bg-gray-800 text-gray-800 dark:text-white outline-none focus:ring-1 focus:ring-primary focus:border-primary"
              />
              <i className="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
            </div>
            <select value={filterType} onChange={e => setFilterType(e.target.value)} className="p-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm dark:bg-gray-800 text-gray-800 dark:text-white outline-none focus:ring-1 focus:ring-primary focus:border-primary">
              <option value="">Semua Tipe</option>
              <option value="perorangan">Perorangan</option>
              <option value="umkm">UMKM</option>
              <option value="instansi">Instansi</option>
            </select>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="p-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm dark:bg-gray-800 text-gray-800 dark:text-white outline-none focus:ring-1 focus:ring-primary focus:border-primary">
              <option value="">Semua Status</option>
              <option value="aktif">Aktif</option>
              <option value="nonaktif">Nonaktif</option>
            </select>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>Tampilkan</span>
            <select value={itemsPerPage} onChange={e => setItemsPerPage(Number(e.target.value))} className="p-1.5 border border-gray-200 dark:border-gray-700 rounded-lg dark:bg-gray-800 text-gray-800 dark:text-white outline-none focus:ring-1 focus:ring-primary focus:border-primary">
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <span>baris</span>
          </div>
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-primary text-white">
                  <th className="p-4 text-sm font-semibold">Nama</th>
                  <th className="p-4 text-sm font-semibold">Tipe</th>
                  <th className="p-4 text-sm font-semibold">WhatsApp</th>
                  <th className="p-4 text-sm font-semibold">Stok Koin</th>
                  <th className="p-4 text-sm font-semibold">Pecahan</th>
                  <th className="p-4 text-sm font-semibold text-center">Status</th>
                  <th className="p-4 text-sm font-semibold text-center w-32">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-sm">
                {paginated.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="p-4">
                      <div className="font-bold text-gray-800 dark:text-gray-200">{p.name}</div>
                      <div className="text-xs text-gray-400 truncate max-w-[160px]"><i className="fa-solid fa-location-dot"></i> {p.address}</div>
                    </td>
                    <td className="p-4">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${USER_TYPE_COLORS[p.user_type]}`}>
                        {USER_TYPE_LABELS[p.user_type]}
                      </span>
                    </td>
                    <td className="p-4 text-gray-600 dark:text-gray-400">{p.whatsapp}</td>
                    <td className="p-4 font-bold text-green-700">{formatCurrency(p.total_coins)}</td>
                    <td className="p-4">
                      <div className="flex gap-1 flex-wrap">
                        {p.denominations?.map(d => (
                          <span key={d} className="text-[10px] font-bold bg-yellow-50 text-yellow-700 px-1.5 py-0.5 rounded border border-yellow-100">Rp{parseInt(d).toLocaleString('id-ID')}</span>
                        ))}
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleToggle(p.id)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${p.is_active ? 'bg-green-500' : 'bg-gray-300'}`}
                      >
                        <span className={`inline-block h-4 w-4 rounded-full bg-white transition-transform shadow-sm ${p.is_active ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => { setSelectedProvider(p); setIsModalOpen(true); }} className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center justify-center" title="Detail">
                          <i className="fa-solid fa-eye text-xs"></i>
                        </button>
                        <button onClick={() => openEdit(p)} className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-primary dark:text-blue-300 hover:bg-primary hover:text-white transition-colors flex items-center justify-center" title="Edit">
                          <i className="fa-solid fa-pen text-xs"></i>
                        </button>
                        <button onClick={() => handleDelete(p.id)} className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-500 dark:text-red-400 hover:bg-red-500 hover:text-white transition-colors flex items-center justify-center" title="Hapus">
                          <i className="fa-solid fa-trash text-xs"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {paginated.length === 0 && (
                  <tr><td colSpan={7} className="p-10 text-center text-gray-400 font-medium">Belum ada data Titik Temu.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 0 && (
          <div className="flex justify-between items-center mt-4">
            <span className="text-sm text-gray-500">
              Menampilkan <b>{(currentPage - 1) * itemsPerPage + 1}</b>–<b>{Math.min(currentPage * itemsPerPage, filtered.length)}</b> dari <b>{filtered.length}</b> data
            </span>
            <div className="flex gap-2">
              <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1} className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-bold text-gray-600 disabled:opacity-30 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">Prev</button>
              <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-bold text-gray-600 disabled:opacity-30 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">Next</button>
            </div>
          </div>
        )}
      </div>

      {/* CREATE / EDIT Modal */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-hidden">
          <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] flex flex-col">
            <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-800 dark:text-white">{editItem ? 'Edit Titik Temu' : 'Tambah Titik Temu'}</h2>
              <button onClick={() => setIsFormModalOpen(false)} className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center transition-colors">
                <i className="fa-solid fa-times"></i>
              </button>
            </div>

            <div className="overflow-y-auto flex-1 p-6">
              <form id="titik-temu-form" onSubmit={handleSave} className="space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Bagian Kiri: Info Profil & Kontak */}
                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Nama Titik Temu <span className="text-red-500">*</span></label>
                      <input type="text" required value={form.name} onChange={e => setForm(f=>({...f, name: e.target.value}))} placeholder="Contoh: Toko Kopi Sejahtera"
                        className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-black text-gray-800 dark:text-white rounded-xl outline-none focus:ring-1 focus:ring-primary text-sm"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Tipe <span className="text-red-500">*</span></label>
                        <select required value={form.user_type} onChange={e => setForm(f=>({...f, user_type: e.target.value}))}
                          className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-black text-gray-800 dark:text-white rounded-xl outline-none focus:ring-1 focus:ring-primary text-sm"
                        >
                          <option value="perorangan">Perorangan</option>
                          <option value="umkm">UMKM</option>
                          <option value="instansi">Instansi</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">WhatsApp <span className="text-red-500">*</span></label>
                        <input type="tel" required value={form.whatsapp} onChange={e => setForm(f=>({...f, whatsapp: e.target.value}))} placeholder="08xxxxxxxx"
                          className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-black text-gray-800 dark:text-white rounded-xl outline-none focus:ring-1 focus:ring-primary text-sm"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Total Koin (Rp) <span className="text-red-500">*</span></label>
                      <input type="number" required min="0" value={form.total_coins} onChange={e => setForm(f=>({...f, total_coins: e.target.value}))} placeholder="Contoh: 150000"
                        className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-black text-gray-800 dark:text-white rounded-xl outline-none focus:ring-1 focus:ring-primary text-sm"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Pecahan Tersedia <span className="text-red-500">*</span></label>
                      <div className="grid grid-cols-4 gap-2">
                        {DENOMINATIONS.map(d => (
                          <label key={d.value} className={`flex items-center justify-center p-2 rounded-lg border font-bold text-xs cursor-pointer transition-all select-none ${form.denominations.includes(d.value) ? 'border-primary bg-primary/10 text-primary' : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-gray-300'}`}>
                            <input type="checkbox" className="hidden" checked={form.denominations.includes(d.value)} onChange={() => handleDenominationToggle(d.value)} />
                            {d.label}
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Jam Operasional</label>
                      <input type="text" value={form.operational_hours} onChange={e => setForm(f=>({...f, operational_hours: e.target.value}))} placeholder="Senin - Jumat, 08.00 - 17.00"
                        className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-black text-gray-800 dark:text-white rounded-xl outline-none focus:ring-1 focus:ring-primary text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Catatan</label>
                      <textarea rows={2} value={form.notes} onChange={e => setForm(f=>({...f, notes: e.target.value}))} placeholder="Catatan tambahan..."
                        className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-black text-gray-800 dark:text-white rounded-xl outline-none focus:ring-1 focus:ring-primary text-sm resize-none"
                      />
                    </div>
                  </div>

                  {/* Bagian Kanan: Lokasi & Peta */}
                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Alamat Lengkap <span className="text-red-500">*</span></label>
                      <textarea required rows={2} value={form.address} onChange={e => setForm(f=>({...f, address: e.target.value}))} placeholder="Alamat lengkap..."
                        className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-black text-gray-800 dark:text-white rounded-xl outline-none focus:ring-1 focus:ring-primary text-sm resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 flex justify-between">
                        <span>Titik Lokasi (Koordinat) <span className="text-red-500">*</span></span>
                        {(form.latitude && form.longitude) && <span className="text-green-600 text-xs">✓ Titik Terpilih</span>}
                      </label>
                      <div className="flex gap-2 mb-2">
                        <input type="text" readOnly value={form.latitude} placeholder="Latitude" className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-500" />
                        <input type="text" readOnly value={form.longitude} placeholder="Longitude" className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-500" />
                      </div>
                      <div className="rounded-xl overflow-hidden border border-gray-200 h-[280px]">
                        <MapView 
                          mapId={`admin-create-map`}
                          center={form.latitude && form.longitude ? [parseFloat(form.latitude), parseFloat(form.longitude)] : [2.9604, 99.0687]} 
                          providers={[]} 
                          searchMarker={null} 
                          radius={0} 
                          mode="pin" 
                          onPinSet={handlePinSet} 
                          pinPosition={form.latitude && form.longitude ? [parseFloat(form.latitude), parseFloat(form.longitude)] : null} 
                        />
                      </div>
                      <p className="text-xs text-gray-400 mt-2"><i className="fa-solid fa-circle-info text-primary"></i> Geser peta dan klik untuk menentukan koordinat lokasi secara otomatis.</p>
                    </div>
                  </div>
                </div>
              </form>
            </div>
            
            <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3 bg-gray-50 dark:bg-[#121212] rounded-b-2xl">
              <button type="button" onClick={() => setIsFormModalOpen(false)}
                className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 text-sm font-medium transition-colors"
              >Batal</button>
              <button type="submit" form="titik-temu-form" disabled={saving}
                className="px-6 py-2.5 rounded-xl bg-primary text-white font-bold hover:bg-blue-800 disabled:opacity-50 text-sm shadow-md transition-colors flex items-center gap-2"
              >
                {saving ? <><i className="fa-solid fa-circle-notch animate-spin"></i> Menyimpan...</> : <><i className="fa-solid fa-save"></i> Simpan Titik Temu</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail View Modal */}
      {isModalOpen && selectedProvider && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center sticky top-0 bg-white dark:bg-gray-800 z-10">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white">Detail Titik Temu</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-red-500"><i className="fa-solid fa-xmark text-xl"></i></button>
            </div>
            <div className="p-6 flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-gray-500 font-medium">Nama:</span><p className="font-bold text-gray-800">{selectedProvider.name}</p></div>
                <div><span className="text-gray-500 font-medium">Tipe:</span><p className="font-bold text-gray-800">{USER_TYPE_LABELS[selectedProvider.user_type]}</p></div>
                <div><span className="text-gray-500 font-medium">WhatsApp:</span><p className="font-bold text-gray-800">{selectedProvider.whatsapp}</p></div>
                <div><span className="text-gray-500 font-medium">Stok Koin:</span><p className="font-bold text-green-700">{formatCurrency(selectedProvider.total_coins)}</p></div>
                <div className="col-span-2"><span className="text-gray-500 font-medium">Alamat:</span><p className="font-bold text-gray-800">{selectedProvider.address}</p></div>
                {selectedProvider.operational_hours && <div className="col-span-2"><span className="text-gray-500 font-medium">Jam Operasional:</span><p className="font-bold text-gray-800">{selectedProvider.operational_hours}</p></div>}
                {selectedProvider.notes && <div className="col-span-2"><span className="text-gray-500 font-medium">Catatan:</span><p className="text-gray-700">{selectedProvider.notes}</p></div>}
              </div>
              <div className="rounded-xl overflow-hidden" style={{ height: '280px' }}>
                <MapView
                  mapId={`admin-detail-map-${selectedProvider.id}`}
                  center={[selectedProvider.latitude, selectedProvider.longitude]}
                  providers={[selectedProvider]}
                  searchMarker={null}
                  radius={0}
                  mode="pin"
                  onPinSet={() => {}}
                  pinPosition={[selectedProvider.latitude, selectedProvider.longitude]}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
