'use client';

import { useState, useEffect, useRef } from 'react';
import Navbar from '@/components/layout/Navbar';
import dynamic from 'next/dynamic';
import Swal from 'sweetalert2';
import API_URL from '@/lib/api';

// Leaflet is not SSR-compatible, load dynamically
const MapView = dynamic(() => import('@/components/PojokKoin/MapView'), { ssr: false, loading: () => (
  <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-2xl">
    <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-b-4 border-primary"></div>
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
  distance?: number;
}

const DENOMINATIONS = [
  { value: '100', label: 'Rp100' },
  { value: '200', label: 'Rp200' },
  { value: '500', label: 'Rp500' },
  { value: '1000', label: 'Rp1.000' },
];

const RADIUS_OPTIONS = [1, 3, 5, 10, 20];

const USER_TYPE_LABELS: Record<string, string> = {
  perorangan: 'Perorangan',
  umkm: 'UMKM',
  instansi: 'Instansi',
};

export default function PojokKoinPage() {
  const [activeTab, setActiveTab] = useState<'cari' | 'daftar'>('cari');

  // --- CARI STATE ---
  const [searchLat, setSearchLat] = useState('');
  const [searchLng, setSearchLng] = useState('');
  const [searchAddress, setSearchAddress] = useState('');
  const [radius, setRadius] = useState(5);
  const [results, setResults] = useState<CoinProvider[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>([2.9604, 99.0687]); // Pematangsiantar

  // --- DAFTAR STATE ---
  const [form, setForm] = useState({
    name: '',
    user_type: 'perorangan',
    whatsapp: '',
    address: '',
    latitude: '',
    longitude: '',
    total_coins: '',
    denominations: [] as string[],
    operational_hours: '',
    notes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pinLat, setPinLat] = useState<number | null>(null);
  const [pinLng, setPinLng] = useState<number | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [pinMapCenter, setPinMapCenter] = useState<[number, number]>([2.9604, 99.0687]);

  // Use browser GPS for searcher
  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      Swal.fire('Info', 'Browser Anda tidak mendukung GPS.', 'info');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setSearchLat(pos.coords.latitude.toFixed(6));
        setSearchLng(pos.coords.longitude.toFixed(6));
        setSearchAddress('Lokasi GPS saya');
        setMapCenter([pos.coords.latitude, pos.coords.longitude]);
      },
      () => Swal.fire('Gagal', 'Tidak dapat mengakses lokasi GPS.', 'error')
    );
  };

  const handleSearch = async () => {
    if (!searchLat || !searchLng) {
      Swal.fire('Perhatian', 'Harap tentukan lokasi Anda terlebih dahulu.', 'warning');
      return;
    }
    setIsSearching(true);
    setHasSearched(false);
    try {
      const res = await fetch(`${API_URL}/coin-providers?lat=${searchLat}&lng=${searchLng}&radius=${radius}`);
      const data = await res.json();
      if (data.status === 'success') {
        setResults(data.data);
        setMapCenter([parseFloat(searchLat), parseFloat(searchLng)]);
      }
    } catch {
      Swal.fire('Gagal', 'Tidak dapat menghubungi server.', 'error');
    } finally {
      setIsSearching(false);
      setHasSearched(true);
    }
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
    setPinLat(lat);
    setPinLng(lng);
    setPinMapCenter([lat, lng]);
    setForm(prev => ({ ...prev, latitude: lat.toFixed(6), longitude: lng.toFixed(6) }));
  };

  // Auto-detect GPS for registration form
  const handleAutoLocateForForm = () => {
    if (!navigator.geolocation) {
      Swal.fire('Info', 'Browser Anda tidak mendukung GPS.', 'info');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setPinLat(lat);
        setPinLng(lng);
        setPinMapCenter([lat, lng]);
        setForm(prev => ({ ...prev, latitude: lat.toFixed(6), longitude: lng.toFixed(6) }));
        setIsLocating(false);
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: 'Lokasi berhasil dideteksi!',
          showConfirmButton: false,
          timer: 2000,
        });
      },
      () => {
        setIsLocating(false);
        Swal.fire('Gagal', 'Tidak dapat mengakses GPS. Pastikan izin lokasi diaktifkan di browser Anda.', 'error');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.denominations.length === 0) {
      Swal.fire('Perhatian', 'Pilih minimal satu jenis pecahan koin.', 'warning');
      return;
    }
    if (!form.latitude || !form.longitude) {
      Swal.fire('Perhatian', 'Harap tentukan pin lokasi Anda pada peta.', 'warning');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/coin-providers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ ...form, total_coins: parseInt(form.total_coins) || 0 }),
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        Swal.fire('Berhasil! 🎉', 'Lokasi Anda berhasil didaftarkan dan dapat ditemukan oleh pencari koin.', 'success');
        setForm({ name: '', user_type: 'perorangan', whatsapp: '', address: '', latitude: '', longitude: '', total_coins: '', denominations: [], operational_hours: '', notes: '' });
        setPinLat(null);
        setPinLng(null);
      } else {
        const msg = data.message || Object.values(data.errors || {}).flat().join(', ');
        Swal.fire('Gagal', msg, 'error');
      }
    } catch {
      Swal.fire('Gagal', 'Tidak dapat menghubungi server.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);

  const inputCls = 'w-full p-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all bg-white';

  return (
    <main className="min-h-screen bg-[#f0f4f8]">
      <Navbar />

      {/* Hero */}
      <section className="bg-primary text-white pt-32 pb-20 md:pt-40 md:pb-28 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute -top-20 -left-20 w-96 h-96 bg-white rounded-full blur-[120px]"></div>
          <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-yellow-300 rounded-full blur-[120px]"></div>
        </div>
        <div className="max-w-[900px] mx-auto px-4 md:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/20 text-white text-xs font-bold px-4 py-2 rounded-full mb-6 border border-white/30 backdrop-blur-sm">
            <i className="fa-solid fa-coins text-yellow-300"></i>
            Platform Sirkulasi Uang Logam
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold mb-5 leading-tight">
            Pojok <span className="text-yellow-300">Koin</span>
          </h1>
          <p className="text-blue-100 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            Platform <em>matching</em> antara pihak yang membutuhkan dan memiliki uang logam, untuk meningkatkan sirkulasi koin di masyarakat.
          </p>
        </div>
      </section>

      {/* Tab Toggle */}
      <div className="max-w-[1100px] mx-auto px-4 md:px-8 -mt-8 relative z-20">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-2 flex gap-2 w-full max-w-md mx-auto">
          <button
            onClick={() => setActiveTab('cari')}
            className={`flex-1 py-3 px-6 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${activeTab === 'cari' ? 'bg-primary text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <i className="fa-solid fa-magnifying-glass"></i> Saya Membutuhkan
          </button>
          <button
            onClick={() => setActiveTab('daftar')}
            className={`flex-1 py-3 px-6 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${activeTab === 'daftar' ? 'bg-primary text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <i className="fa-solid fa-location-dot"></i> Saya Memiliki
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1100px] mx-auto px-4 md:px-8 py-10">

        {/* === TAB: CARI === */}
        {activeTab === 'cari' && (
          <div>
            {/* Filter Bar */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
              <h2 className="font-bold text-gray-800 text-lg mb-4 flex items-center gap-2">
                <i className="fa-solid fa-sliders text-primary"></i> Filter Pencarian
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div className="md:col-span-2">
                  <label className="text-xs font-bold text-gray-600 mb-1 block">LOKASI ANDA</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      readOnly
                      value={searchAddress || (searchLat && searchLng ? `${searchLat}, ${searchLng}` : '')}
                      placeholder="Gunakan GPS atau klik tombol di sebelah kanan"
                      className={`${inputCls} flex-1 bg-gray-50 cursor-default`}
                    />
                    <button
                      onClick={handleUseMyLocation}
                      className="bg-primary text-white px-4 py-3 rounded-xl font-bold text-sm hover:bg-blue-800 transition-colors flex items-center gap-2 whitespace-nowrap"
                    >
                      <i className="fa-solid fa-location-crosshairs"></i> GPS
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-600 mb-1 block">RADIUS PENCARIAN</label>
                  <select
                    value={radius}
                    onChange={e => setRadius(Number(e.target.value))}
                    className={inputCls}
                  >
                    {RADIUS_OPTIONS.map(r => (
                      <option key={r} value={r}>{r} KM</option>
                    ))}
                  </select>
                </div>
              </div>
              <button
                onClick={handleSearch}
                disabled={isSearching}
                className="mt-4 w-full bg-primary hover:bg-blue-800 text-white font-bold py-3.5 rounded-xl transition-all shadow-md hover:-translate-y-0.5 flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {isSearching
                  ? <><i className="fa-solid fa-spinner fa-spin"></i> Mencari...</>
                  : <><i className="fa-solid fa-magnifying-glass"></i> Cari Penyedia Koin</>}
              </button>
            </div>

            {/* Results */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Map */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden" style={{ height: '500px' }}>
                <MapView
                  center={mapCenter}
                  providers={results}
                  searchMarker={searchLat && searchLng ? [parseFloat(searchLat), parseFloat(searchLng)] : null}
                  radius={radius}
                  mode="search"
                  onPinSet={() => {}}
                />
              </div>

              {/* List */}
              <div className="flex flex-col gap-4">
                {!hasSearched && (
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center">
                    <i className="fa-solid fa-coins text-5xl text-gray-200 mb-4 block"></i>
                    <p className="text-gray-400 font-medium">Tentukan lokasi & radius, lalu klik "Cari" untuk menemukan penyedia koin terdekat.</p>
                  </div>
                )}

                {hasSearched && results.length === 0 && (
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center">
                    <i className="fa-solid fa-circle-xmark text-5xl text-red-200 mb-4 block"></i>
                    <p className="text-gray-500 font-bold text-lg mb-1">Tidak Ditemukan</p>
                    <p className="text-gray-400 text-sm">Tidak ada penyedia koin dalam radius {radius} KM dari lokasi Anda. Coba perluas radius pencarian.</p>
                  </div>
                )}

                {results.map(p => (
                  <div key={p.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-4">
                      {/* Avatar */}
                      <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-extrabold text-lg shrink-0 shadow-sm">
                        {p.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="font-bold text-gray-800 text-base">{p.name}</h3>
                          <span className="text-[10px] font-bold bg-blue-50 text-primary px-2 py-0.5 rounded-full border border-blue-100">
                            {USER_TYPE_LABELS[p.user_type]}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mb-2 flex items-center gap-1 truncate">
                          <i className="fa-solid fa-location-dot text-red-400 shrink-0"></i> {p.address}
                        </p>
                        {p.distance !== undefined && (
                          <p className="text-xs text-gray-400 mb-2 flex items-center gap-1">
                            <i className="fa-solid fa-route text-primary shrink-0"></i> {p.distance.toFixed(2)} KM dari lokasi Anda
                          </p>
                        )}
                        <div className="flex items-center gap-2 mb-3 flex-wrap">
                          <span className="text-xs font-bold text-green-700 bg-green-50 px-2.5 py-1 rounded-full border border-green-100 flex items-center gap-1">
                            <i className="fa-solid fa-coins"></i> {formatCurrency(p.total_coins)}
                          </span>
                          {p.denominations?.map(d => (
                            <span key={d} className="text-[10px] font-bold bg-yellow-50 text-yellow-700 px-2 py-0.5 rounded-full border border-yellow-100">
                              Rp{parseInt(d).toLocaleString('id-ID')}
                            </span>
                          ))}
                        </div>
                        {p.operational_hours && (
                          <p className="text-xs text-gray-500 flex items-center gap-1 mb-3">
                            <i className="fa-regular fa-clock text-primary shrink-0"></i> {p.operational_hours}
                          </p>
                        )}
                      </div>
                    </div>
                    <a
                      href={`https://wa.me/${p.whatsapp.replace(/\D/g, '').replace(/^0/, '62')}?text=Halo%20${encodeURIComponent(p.name)}%2C%20saya%20tertarik%20untuk%20menukar%20uang%20koin%20melalui%20platform%20Pojok%20Koin%20BI%20Siantar.`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold py-2.5 rounded-xl transition-all text-sm shadow-sm"
                    >
                      <i className="fa-brands fa-whatsapp text-lg"></i> Hubungi via WhatsApp
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* === TAB: DAFTAR === */}
        {activeTab === 'daftar' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Form */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
              <h2 className="font-bold text-gray-800 text-xl mb-2 flex items-center gap-2">
                <i className="fa-solid fa-location-dot text-primary"></i> Daftarkan Lokasi Anda
              </h2>
              <p className="text-sm text-gray-500 mb-6">Isi data di bawah agar lokasi Anda dapat ditemukan oleh pencari koin.</p>

              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                {/* Profil */}
                <fieldset className="flex flex-col gap-4">
                  <legend className="text-xs font-extrabold text-primary uppercase tracking-widest mb-1">Data Profil</legend>
                  <div>
                    <label className="text-xs font-bold text-gray-600 mb-1 block">Nama Instansi / Pemilik *</label>
                    <input type="text" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Contoh: Warung Bu Sari" className={inputCls} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-gray-600 mb-1 block">Jenis Pengguna *</label>
                      <select required value={form.user_type} onChange={e => setForm({...form, user_type: e.target.value})} className={inputCls}>
                        <option value="perorangan">Perorangan</option>
                        <option value="umkm">UMKM</option>
                        <option value="instansi">Instansi</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-600 mb-1 block">Nomor WhatsApp *</label>
                      <input type="tel" required value={form.whatsapp} onChange={e => setForm({...form, whatsapp: e.target.value})} placeholder="08xxxx" className={inputCls} />
                    </div>
                  </div>
                </fieldset>

                {/* Lokasi */}
                <fieldset className="flex flex-col gap-4">
                  <legend className="text-xs font-extrabold text-primary uppercase tracking-widest mb-1">Lokasi</legend>
                  <div>
                    <label className="text-xs font-bold text-gray-600 mb-1 block">Alamat Lengkap *</label>
                    <textarea required value={form.address} onChange={e => setForm({...form, address: e.target.value})} placeholder="Jl. Contoh No. 1, Pematangsiantar" rows={2} className={inputCls} />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-600 mb-2 block">
                      Titik Lokasi *
                      {pinLat && <span className="text-green-600 ml-2">✓ Lokasi terdeteksi</span>}
                    </label>
                    <button
                      type="button"
                      onClick={handleAutoLocateForForm}
                      disabled={isLocating}
                      className="w-full flex items-center justify-center gap-2 bg-primary text-white font-bold py-3 rounded-xl hover:bg-blue-800 transition-all disabled:opacity-70 mb-2"
                    >
                      {isLocating
                        ? <><i className="fa-solid fa-spinner fa-spin"></i> Mendeteksi lokasi...</>
                        : <><i className="fa-solid fa-location-crosshairs"></i> Gunakan Lokasi Saya Otomatis</>}
                    </button>
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                      <i className="fa-solid fa-circle-info text-primary"></i>
                      Atau klik langsung pada peta di sebelah kanan untuk menentukan titik secara manual.
                    </p>
                    {pinLat && (
                      <div className="mt-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-xs text-green-700 font-medium flex items-center gap-2">
                        <i className="fa-solid fa-circle-check"></i>
                        Koordinat: {pinLat.toFixed(5)}, {pinLng?.toFixed(5)}
                      </div>
                    )}
                  </div>
                </fieldset>

                {/* Stok */}
                <fieldset className="flex flex-col gap-4">
                  <legend className="text-xs font-extrabold text-primary uppercase tracking-widest mb-1">Ketersediaan Koin</legend>
                  <div>
                    <label className="text-xs font-bold text-gray-600 mb-1 block">Total Nominal Koin (Rp) *</label>
                    <input type="number" required min="0" value={form.total_coins} onChange={e => setForm({...form, total_coins: e.target.value})} placeholder="Contoh: 50000" className={inputCls} />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-600 mb-2 block">Pecahan yang Tersedia *</label>
                    <div className="grid grid-cols-4 gap-2">
                      {DENOMINATIONS.map(d => (
                        <label key={d.value} className={`flex items-center justify-center p-3 rounded-xl border-2 font-bold text-sm cursor-pointer transition-all select-none ${form.denominations.includes(d.value) ? 'border-primary bg-primary/10 text-primary' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                          <input type="checkbox" className="hidden" checked={form.denominations.includes(d.value)} onChange={() => handleDenominationToggle(d.value)} />
                          {d.label}
                        </label>
                      ))}
                    </div>
                  </div>
                </fieldset>

                {/* Opsional */}
                <fieldset className="flex flex-col gap-4">
                  <legend className="text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-1">Informasi Tambahan (Opsional)</legend>
                  <div>
                    <label className="text-xs font-bold text-gray-600 mb-1 block">Jam Operasional</label>
                    <input type="text" value={form.operational_hours} onChange={e => setForm({...form, operational_hours: e.target.value})} placeholder="Contoh: Senin–Sabtu, 08:00–17:00" className={inputCls} />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-600 mb-1 block">Catatan Khusus</label>
                    <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} placeholder="Misal: Hubungi terlebih dahulu sebelum datang" rows={2} className={inputCls} />
                  </div>
                </fieldset>

                <button type="submit" disabled={isSubmitting} className="w-full bg-primary hover:bg-blue-800 text-white font-bold py-4 rounded-xl transition-all shadow-md hover:-translate-y-0.5 flex items-center justify-center gap-2 disabled:opacity-70 text-base">
                  {isSubmitting
                    ? <><i className="fa-solid fa-spinner fa-spin"></i> Mendaftarkan...</>
                    : <><i className="fa-solid fa-location-dot"></i> Daftarkan Lokasi Saya</>}
                </button>
              </form>
            </div>

            {/* Peta untuk pin lokasi */}
            <div className="sticky top-24">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden" style={{ height: '600px' }}>
                <div className="bg-primary text-white text-xs font-bold px-4 py-3 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <i className="fa-solid fa-map-pin"></i>
                    Peta Lokasi
                  </span>
                  <span className="text-blue-200 font-normal">
                    {pinLat ? '📍 Lokasi ditandai' : 'Klik peta atau gunakan GPS'}
                  </span>
                </div>
                <div style={{ height: 'calc(100% - 40px)' }}>
                  <MapView
                    center={pinMapCenter}
                    providers={[]}
                    searchMarker={null}
                    radius={0}
                    mode="pin"
                    onPinSet={handlePinSet}
                    pinPosition={pinLat && pinLng ? [pinLat, pinLng] : null}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
