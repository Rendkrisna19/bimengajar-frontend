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

export default function AdminPojokKoinPage() {
  const [providers, setProviders] = useState<CoinProvider[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<CoinProvider | null>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    fetchProviders();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterType, filterStatus]);

  const fetchProviders = async () => {
    try {
      const res = await axios.get(`${API_URL}/coin-providers?all=true`);
      if (res.data.status === 'success') setProviders(res.data.data);
    } catch { console.error('Failed to fetch'); }
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
    const result = await Swal.fire({ title: 'Hapus?', text: 'Data tidak bisa dikembalikan!', icon: 'warning', showCancelButton: true });
    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`${API_URL}/coin-providers/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        Swal.fire('Terhapus!', 'Data telah dihapus.', 'success');
        fetchProviders();
      } catch { Swal.fire('Error', 'Gagal menghapus.', 'error'); }
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
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-800">
        <div className="flex justify-between items-center mb-6 border-b border-gray-200 dark:border-gray-700 pb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Manajemen Pojok Koin</h2>
            <p className="text-gray-500 text-sm mt-1">Monitor dan kelola data pendaftar penyedia koin.</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-extrabold text-primary">{providers.length}</div>
            <div className="text-xs text-gray-500 font-medium">Total Penyedia</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-3 mb-4 justify-between items-center">
          <div className="flex items-center gap-3 w-full flex-wrap">
            <div className="relative w-full md:w-64">
              <input
                type="text"
                placeholder="Cari nama / alamat..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full p-2 pl-9 border border-gray-300 dark:border-gray-700 rounded-lg text-sm dark:bg-gray-800"
              />
              <i className="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
            </div>
            <select value={filterType} onChange={e => setFilterType(e.target.value)} className="p-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm dark:bg-gray-800">
              <option value="">Semua Tipe</option>
              <option value="perorangan">Perorangan</option>
              <option value="umkm">UMKM</option>
              <option value="instansi">Instansi</option>
            </select>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="p-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm dark:bg-gray-800">
              <option value="">Semua Status</option>
              <option value="aktif">Aktif</option>
              <option value="nonaktif">Nonaktif</option>
            </select>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>Tampilkan</span>
            <select value={itemsPerPage} onChange={e => setItemsPerPage(Number(e.target.value))} className="p-1.5 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-gray-800">
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <span>baris</span>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-primary text-white">
                <th className="p-4 text-sm font-semibold">Nama</th>
                <th className="p-4 text-sm font-semibold">Tipe</th>
                <th className="p-4 text-sm font-semibold">WhatsApp</th>
                <th className="p-4 text-sm font-semibold">Stok Koin</th>
                <th className="p-4 text-sm font-semibold">Pecahan</th>
                <th className="p-4 text-sm font-semibold">Koordinat</th>
                <th className="p-4 text-sm font-semibold text-center">Status</th>
                <th className="p-4 text-sm font-semibold text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {paginated.map(p => (
                <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="p-4">
                    <div className="font-bold text-gray-800 dark:text-gray-200 text-sm">{p.name}</div>
                    <div className="text-xs text-gray-400 truncate max-w-[160px]">{p.address}</div>
                  </td>
                  <td className="p-4">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${USER_TYPE_COLORS[p.user_type]}`}>
                      {USER_TYPE_LABELS[p.user_type]}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-gray-600 dark:text-gray-400">{p.whatsapp}</td>
                  <td className="p-4 text-sm font-bold text-green-700">{formatCurrency(p.total_coins)}</td>
                  <td className="p-4">
                    <div className="flex gap-1 flex-wrap">
                      {p.denominations?.map(d => (
                        <span key={d} className="text-[10px] font-bold bg-yellow-50 text-yellow-700 px-1.5 py-0.5 rounded border border-yellow-100">Rp{parseInt(d).toLocaleString('id-ID')}</span>
                      ))}
                    </div>
                  </td>
                  <td className="p-4 text-xs text-gray-500">
                    <div>{p.latitude.toFixed(4)}</div>
                    <div>{p.longitude.toFixed(4)}</div>
                  </td>
                  <td className="p-4 text-center">
                    <button
                      onClick={() => handleToggle(p.id)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${p.is_active ? 'bg-green-500' : 'bg-gray-300'}`}
                    >
                      <span className={`inline-block h-4 w-4 rounded-full bg-white transition-transform shadow-sm ${p.is_active ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                    <div className="text-[10px] mt-1 font-bold text-gray-500">{p.is_active ? 'Aktif' : 'Nonaktif'}</div>
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-4">
                      <button onClick={() => { setSelectedProvider(p); setIsModalOpen(true); }} className="text-primary hover:text-blue-800 transition-colors" title="Detail">
                        <i className="fa-solid fa-eye text-lg"></i>
                      </button>
                      <button onClick={() => handleDelete(p.id)} className="text-red-500 hover:text-red-700 transition-colors" title="Hapus">
                        <i className="fa-solid fa-trash-can text-lg"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {paginated.length === 0 && (
                <tr><td colSpan={8} className="p-10 text-center text-gray-400 font-medium">Belum ada data penyedia koin.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 0 && (
          <div className="flex justify-between items-center mt-4">
            <span className="text-sm text-gray-500">
              Menampilkan <b>{(currentPage - 1) * itemsPerPage + 1}</b>–<b>{Math.min(currentPage * itemsPerPage, filtered.length)}</b> dari <b>{filtered.length}</b> data
            </span>
            <div className="flex gap-2">
              <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1} className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-bold text-gray-600 disabled:opacity-30 hover:bg-gray-50 transition-colors">Prev</button>
              <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-bold text-gray-600 disabled:opacity-30 hover:bg-gray-50 transition-colors">Next</button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {isModalOpen && selectedProvider && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center sticky top-0 bg-white dark:bg-gray-800 z-10">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white">Detail Penyedia Koin</h3>
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
                  center={[selectedProvider.latitude, selectedProvider.longitude]}
                  providers={[selectedProvider]}
                  searchMarker={null}
                  radius={0}
                  mode="search"
                  onPinSet={() => {}}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
