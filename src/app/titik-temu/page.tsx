'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import dynamic from 'next/dynamic';
import Swal from 'sweetalert2';
import API_URL from '@/lib/api';
import { useLanguage } from '@/contexts/LanguageContext';
import PageHeader from '@/components/ui/PageHeader';
import FloatingAction from '@/components/ui/FloatingAction';
import CustomSelect from '@/components/ui/CustomSelect';

const MapView = dynamic(() => import('@/components/PojokKoin/MapView'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-2xl">
      <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-b-4 border-primary"></div>
    </div>
  ),
});

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

const RADIUS_OPTIONS = [
  { value: 1, label: '1 KM', icon: 'fa-solid fa-location-dot' },
  { value: 3, label: '3 KM', icon: 'fa-solid fa-location-dot' },
  { value: 5, label: '5 KM', icon: 'fa-solid fa-location-dot' },
  { value: 10, label: '10 KM', icon: 'fa-solid fa-location-dot' },
  { value: 20, label: '20 KM', icon: 'fa-solid fa-location-dot' },
];

const USER_TYPE_OPTIONS = [
  { value: 'umkm', label: 'UMKM / Toko / Warung', icon: 'fa-solid fa-store' },
  { value: 'perorangan', label: 'Perorangan / Pribadi', icon: 'fa-solid fa-user' },
  { value: 'instansi', label: 'Instansi / Komunitas', icon: 'fa-solid fa-building' },
];

const USER_TYPE_LABELS: Record<string, Record<string, string>> = {
  perorangan: { ID: 'Perorangan', EN: 'Individual' },
  umkm: { ID: 'UMKM', EN: 'Small Business' },
  instansi: { ID: 'Instansi', EN: 'Institution' },
};

export default function TitikTemuPage() {
  const { lang, t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'search' | 'register'>('search');

  // STATE CARI UANG LOGAM
  const [searchLat, setSearchLat] = useState('');
  const [searchLng, setSearchLng] = useState('');
  const [searchAddress, setSearchAddress] = useState('');
  const [radius, setRadius] = useState<number>(5);
  const [results, setResults] = useState<CoinProvider[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>([2.9604, 99.0687]);

  // STATE DAFTAR LOKASI / MEMBUTUHKAN UANG LOGAM (Default: 'butuh')
  const [regName, setRegName] = useState('');
  const [regUserType, setRegUserType] = useState('umkm');
  const [regWhatsapp, setRegWhatsapp] = useState('');
  const [regAddress, setRegAddress] = useState('');
  const [regLat, setRegLat] = useState('');
  const [regLng, setRegLng] = useState('');
  const [regTotalCoins, setRegTotalCoins] = useState('');
  const [regDenominations, setRegDenominations] = useState<string[]>(['100', '200', '500', '1000']);
  const [regOpHours, setRegOpHours] = useState('');
  const [regNotes, setRegNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pinPos, setPinPos] = useState<[number, number] | null>(null);

  const fetchProvidersForLocation = async (latStr: string, lngStr: string, currentRadius: number) => {
    setIsSearching(true);
    setHasSearched(false);
    try {
      const res = await fetch(`${API_URL}/coin-providers?lat=${latStr}&lng=${lngStr}&radius=${currentRadius}`);
      const data = await res.json();
      if (data.status === 'success') {
        setResults(data.data);
        setMapCenter([parseFloat(latStr), parseFloat(lngStr)]);
      }
    } catch {
      Swal.fire(lang === 'ID' ? 'Gagal' : 'Failed', lang === 'ID' ? 'Gagal terhubung ke server.' : t('pk.swal.serverError'), 'error');
    } finally {
      setIsSearching(false);
      setHasSearched(true);
    }
  };

  const handleUseMyLocation = () => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      Swal.fire('Info', lang === 'ID' ? 'Fitur GPS tidak didukung di browser ini.' : t('pk.swal.gpsUnsupported'), 'info');
      return;
    }

    setIsLocating(true);

    const geoOptions: GeolocationPositionOptions = {
      enableHighAccuracy: false, // Low accuracy is faster and works reliably on PCs/laptops
      timeout: 8000,
      maximumAge: 60000,
    };

    const onSuccess = (pos: GeolocationPosition) => {
      setIsLocating(false);
      const lat = pos.coords.latitude.toFixed(6);
      const lng = pos.coords.longitude.toFixed(6);
      setSearchLat(lat);
      setSearchLng(lng);
      setSearchAddress(lang === 'ID' ? 'Lokasi GPS Saya' : 'My GPS Location');
      setMapCenter([pos.coords.latitude, pos.coords.longitude]);

      // Auto-trigger search so user sees results instantly
      fetchProvidersForLocation(lat, lng, radius);
    };

    const onError = (err: GeolocationPositionError) => {
      setIsLocating(false);
      if (err.code === err.PERMISSION_DENIED) {
        Swal.fire({
          icon: 'warning',
          title: lang === 'ID' ? 'Izin Lokasi Ditolak' : 'Location Permission Denied',
          text: lang === 'ID'
            ? 'Browser Anda memblokir akses lokasi. Izinkan lokasi pada setelan browser Anda atau ketik alamat manual.'
            : 'Please enable location permissions in your browser settings.',
        });
      } else {
        // Fallback to Pematang Siantar center if GPS hardware/wifi location times out
        const defaultLat = '2.9604';
        const defaultLng = '99.0687';
        setSearchLat(defaultLat);
        setSearchLng(defaultLng);
        setSearchAddress(lang === 'ID' ? 'Pematang Siantar (Default GPS)' : 'Pematang Siantar (Default GPS)');
        setMapCenter([2.9604, 99.0687]);

        Swal.fire({
          icon: 'info',
          title: lang === 'ID' ? 'Deteksi GPS Otomatis' : 'Default GPS Set',
          text: lang === 'ID'
            ? 'Menggunakan koordinat Pematang Siantar sebagai pusat lokasi.'
            : 'Using Pematang Siantar center location.',
          timer: 2000,
          showConfirmButton: false,
        });

        fetchProvidersForLocation(defaultLat, defaultLng, radius);
      }
    };

    navigator.geolocation.getCurrentPosition(onSuccess, onError, geoOptions);
  };

  const handleSearch = async () => {
    if (!searchLat || !searchLng) {
      // If user hasn't clicked GPS button yet, automatically trigger handleUseMyLocation
      handleUseMyLocation();
      return;
    }
    fetchProvidersForLocation(searchLat, searchLng, radius);
  };

  // Form Register GPS
  const handleRegGPS = () => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      Swal.fire('Info', 'GPS tidak didukung.', 'info');
      return;
    }

    const geoOptions: GeolocationPositionOptions = {
      enableHighAccuracy: false,
      timeout: 8000,
      maximumAge: 60000,
    };

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setRegLat(lat.toFixed(6));
        setRegLng(lng.toFixed(6));
        setPinPos([lat, lng]);
        setMapCenter([lat, lng]);
        Swal.fire({
          icon: 'success',
          title: 'Lokasi GPS Berhasil Diambil!',
          text: `Latitude: ${lat.toFixed(4)}, Longitude: ${lng.toFixed(4)}`,
          timer: 2000,
          showConfirmButton: false,
        });
      },
      (err) => {
        // Fallback to Siantar center
        const lat = 2.9604;
        const lng = 99.0687;
        setRegLat(lat.toFixed(6));
        setRegLng(lng.toFixed(6));
        setPinPos([lat, lng]);
        setMapCenter([lat, lng]);
        Swal.fire({
          icon: 'info',
          title: 'Lokasi GPS Set',
          text: 'Menggunakan koordinat pusat Pematang Siantar. Anda juga dapat mengeklik titik lokasi langsung di peta.',
          timer: 2500,
          showConfirmButton: false,
        });
      },
      geoOptions
    );
  };

  const handlePinSet = (lat: number, lng: number) => {
    setRegLat(lat.toFixed(6));
    setRegLng(lng.toFixed(6));
    setPinPos([lat, lng]);
  };

  const toggleDenomination = (val: string) => {
    if (regDenominations.includes(val)) {
      setRegDenominations(regDenominations.filter(d => d !== val));
    } else {
      setRegDenominations([...regDenominations, val]);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName || !regWhatsapp || !regAddress || !regLat || !regLng || !regTotalCoins) {
      Swal.fire('Perhatian', 'Mohon lengkapi semua kolom wajib (*)', 'warning');
      return;
    }
    if (regDenominations.length === 0) {
      Swal.fire('Perhatian', 'Pilih minimal satu pecahan uang logam!', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: `[Butuh Logam] ${regName}`,
        user_type: regUserType,
        whatsapp: regWhatsapp,
        address: regAddress,
        latitude: parseFloat(regLat),
        longitude: parseFloat(regLng),
        total_coins: parseInt(regTotalCoins, 10),
        denominations: regDenominations,
        operational_hours: regOpHours || null,
        notes: regNotes ? `(Membutuhkan Uang Logam) ${regNotes}` : 'Membutuhkan Uang Logam',
      };

      const res = await fetch(`${API_URL}/coin-providers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.status === 'success') {
        Swal.fire({
          icon: 'success',
          title: 'Pendaftaran Berhasil!',
          text: 'Permohonan kebutuhan uang logam Anda berhasil didaftarkan di Titik Temu BI Siantar.',
          confirmButtonColor: '#003366',
        });
        // Reset form
        setRegName('');
        setRegWhatsapp('');
        setRegAddress('');
        setRegLat('');
        setRegLng('');
        setRegTotalCoins('');
        setRegOpHours('');
        setRegNotes('');
        setPinPos(null);
        setActiveTab('search');
      } else {
        throw new Error(data.message || 'Gagal menyimpan data.');
      }
    } catch (err: any) {
      Swal.fire('Gagal', err.message || 'Terjadi kesalahan sistem saat mendaftar.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animated');
          }
        });
      },
      { threshold: 0.05 }
    );
    const elements = document.querySelectorAll('.animate-on-scroll');
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const inputCls = 'w-full p-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all bg-white';

  return (
    <main className="min-h-screen bg-[#f0f4f8]">
      <Navbar />

      {/* Header Section */}
      <PageHeader
        title={
          <div className="flex justify-center items-center my-1">
            <img 
              src="/images/menu-cepat/5.png" 
              alt="Titik Temu - Platform Sirkulasi Uang Logam" 
              className="h-16 sm:h-20 md:h-24 lg:h-28 max-w-full w-auto object-contain mx-auto hover:scale-105 transition-all duration-300"
              style={{
                filter: 'drop-shadow(0 0 2px #ffffff) drop-shadow(0 0 6px #ffffff) drop-shadow(0 0 12px rgba(255, 255, 255, 0.95)) drop-shadow(0 0 22px rgba(255, 255, 255, 0.8))'
              }}
            />
          </div>
        }
        description={
          lang === 'ID'
            ? 'Platform matching antara pihak yang membutuhkan dan memiliki uang logam, untuk meningkatkan sirkulasi uang logam di masyarakat.'
            : t('pk.subtitle')
        }
        breadcrumbs={[
          { label: lang === 'ID' ? 'Beranda' : 'Home', href: '/' },
          { label: lang === 'ID' ? 'Platform Sirkulasi Uang Logam' : t('pk.badge') }
        ]}
      />

      <div className="max-w-[1150px] mx-auto px-4 md:px-8 py-10 animate-on-scroll">

        {/* Navigation Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-white p-1.5 rounded-2xl shadow-sm border border-gray-200 flex gap-2 w-full max-w-lg">
            <button
              onClick={() => setActiveTab('search')}
              className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                activeTab === 'search'
                  ? 'bg-primary text-white shadow-md'
                  : 'text-gray-600 hover:text-primary hover:bg-gray-50'
              }`}
            >
              <i className="fa-solid fa-magnifying-glass-location"></i> Cari Uang Logam
            </button>
            <button
              onClick={() => setActiveTab('register')}
              className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                activeTab === 'register'
                  ? 'bg-primary text-white shadow-md'
                  : 'text-gray-600 hover:text-primary hover:bg-gray-50'
              }`}
            >
              <i className="fa-solid fa-hand-holding-dollar"></i> Membutuhkan Uang Logam
            </button>
          </div>
        </div>

        {/* TAB 1: CARI UANG LOGAM */}
        {activeTab === 'search' && (
          <div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
              <h2 className="font-bold text-gray-800 text-lg mb-4 flex items-center gap-2">
                <i className="fa-solid fa-sliders text-primary"></i> Cari Penyedia & Pemohon Uang Logam Terdekat
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div className="md:col-span-2">
                  <label className="text-xs font-bold text-gray-600 mb-1.5 block">Lokasi Pencarian</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      readOnly 
                      value={searchAddress || (searchLat && searchLng ? `${searchLat}, ${searchLng}` : '')} 
                      placeholder="Klik tombol GPS di kanan untuk mengambil lokasi Anda..." 
                      className={`${inputCls} flex-1 bg-gray-50 cursor-default`} 
                    />
                    <button 
                      onClick={handleUseMyLocation} 
                      disabled={isLocating}
                      className="bg-primary text-white px-4 py-3 rounded-xl font-bold text-sm hover:bg-blue-900 transition-all flex items-center gap-2 whitespace-nowrap shadow-sm disabled:opacity-70 cursor-pointer"
                    >
                      {isLocating ? (
                        <><i className="fa-solid fa-spinner fa-spin"></i> Memuat GPS...</>
                      ) : (
                        <><i className="fa-solid fa-location-crosshairs"></i> Lokasi GPS Saya</>
                      )}
                    </button>
                  </div>
                </div>
                <div>
                  {/* CustomSelect Component for Jangkauan Radius */}
                  <CustomSelect
                    label="Jangkauan Radius"
                    icon="fa-solid fa-[#003366] fa-ruler-combined"
                    options={RADIUS_OPTIONS}
                    value={radius}
                    onChange={(val) => setRadius(Number(val))}
                  />
                </div>
              </div>
              <button 
                onClick={handleSearch} 
                disabled={isSearching} 
                className="mt-4 w-full bg-accent-red hover:brightness-110 text-white font-bold py-3.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {isSearching
                  ? <><i className="fa-solid fa-spinner fa-spin"></i> Mencari Lokasi Terdekat...</>
                  : <><i className="fa-solid fa-magnifying-glass"></i> Cari Titik Temu Uang Logam</>}
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Maps */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden" style={{ height: '520px' }}>
                <MapView 
                  center={mapCenter} 
                  providers={results} 
                  searchMarker={searchLat && searchLng ? [parseFloat(searchLat), parseFloat(searchLng)] : null} 
                  radius={radius} 
                  mode="search" 
                  onPinSet={() => {}} 
                />
              </div>

              {/* Result List */}
              <div className="flex flex-col gap-4 max-h-[520px] overflow-y-auto pr-1">
                {!hasSearched && (
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center flex flex-col items-center justify-center h-full">
                    <i className="fa-solid fa-[#003366] fa-coins text-5xl text-blue-200 mb-4 block"></i>
                    <h3 className="font-bold text-gray-700 text-lg mb-1">Cari Titik Temu Terdekat</h3>
                    <p className="text-gray-400 text-sm max-w-sm">
                      Gunakan lokasi GPS Anda di atas untuk menemukan penyedia dan pemohon uang logam terdekat di sekitar Anda.
                    </p>
                  </div>
                )}
                {hasSearched && results.length === 0 && (
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center flex flex-col items-center justify-center h-full">
                    <i className="fa-solid fa-circle-xmark text-5xl text-red-200 mb-4 block"></i>
                    <p className="text-gray-500 font-bold text-lg mb-1">Tidak Ada Lokasi Ditemukan</p>
                    <p className="text-gray-400 text-sm">Tidak ditemukan penyedia dalam radius {radius} KM dari posisi Anda. Coba perbesar radius pencarian.</p>
                  </div>
                )}
                {results.map(p => (
                  <div key={p.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-extrabold text-lg shrink-0 shadow-sm">
                        {p.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="font-bold text-gray-800 text-base">{p.name}</h3>
                          <span className="text-[10px] font-bold bg-blue-50 text-primary px-2.5 py-0.5 rounded-full border border-blue-100">
                            {USER_TYPE_LABELS[p.user_type]?.[lang] || p.user_type}
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
                          <p className="text-xs text-gray-500 flex items-center gap-1 mb-2">
                            <i className="fa-regular fa-clock text-primary shrink-0"></i> {p.operational_hours}
                          </p>
                        )}
                        {p.notes && (
                          <p className="text-xs text-gray-600 bg-gray-50 p-2 rounded-lg italic border border-gray-100">
                            "{p.notes}"
                          </p>
                        )}
                      </div>
                    </div>
                    <a
                      href={`https://wa.me/${p.whatsapp.replace(/\D/g, '').replace(/^0/, '62')}?text=Halo%20${encodeURIComponent(p.name)}%2C%20saya%20tertarik%20untuk%20menukar%20uang%20logam%20melalui%20platform%20Titik%20Temu%20BI%20Siantar.`}
                      target="_blank" rel="noopener noreferrer"
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

        {/* TAB 2: MEMBUTUHKAN UANG LOGAM */}
        {activeTab === 'register' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
            <div className="border-b border-gray-100 pb-6 mb-6">
              <h2 className="text-xl font-extrabold text-[#003366] flex items-center gap-2">
                <i className="fa-solid fa-hand-holding-dollar text-primary"></i> Form Permohonan Membutuhkan Uang Logam
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Daftarkan diri, usaha (UMKM), atau instansi Anda yang **membutuhkan pasokan uang logam** untuk uang kembalian toko/kegiatan agar mudah ditemukan oleh masyarakat atau penyedia uang logam.
              </p>
            </div>

            <form onSubmit={handleRegisterSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Nama Lengkap / Nama Usaha <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={e => setRegName(e.target.value)}
                    placeholder="Contoh: Toko Berkah Jaya / Pak Ahmad"
                    className={inputCls}
                  />
                </div>

                <div>
                  {/* CustomSelect Component for Kategori Pendaftar */}
                  <CustomSelect
                    label="Kategori Pendaftar *"
                    options={USER_TYPE_OPTIONS}
                    value={regUserType}
                    onChange={(val) => setRegUserType(val)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Nomor WhatsApp (Aktif) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={regWhatsapp}
                    onChange={e => setRegWhatsapp(e.target.value)}
                    placeholder="Contoh: 08123456789"
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Total Estimasi Nominal Uang Logam (Rp) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={regTotalCoins}
                    onChange={e => setRegTotalCoins(e.target.value)}
                    placeholder="Contoh: 50000"
                    className={inputCls}
                  />
                </div>
              </div>

              {/* Pecahan */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2">
                  Pilihan Pecahan Uang Logam yang Dibutuhkan <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-3 flex-wrap">
                  {DENOMINATIONS.map(d => {
                    const isSelected = regDenominations.includes(d.value);
                    return (
                      <button
                        key={d.value}
                        type="button"
                        onClick={() => toggleDenomination(d.value)}
                        className={`px-4 py-2.5 rounded-xl text-sm font-bold border transition-all flex items-center gap-2 ${
                          isSelected
                            ? 'bg-primary text-white border-primary shadow-sm'
                            : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <i className={`fa-solid ${isSelected ? 'fa-square-check' : 'fa-square'} text-xs`}></i>
                        {d.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Jam Operasional / Waktu Pelayanan
                  </label>
                  <input
                    type="text"
                    value={regOpHours}
                    onChange={e => setRegOpHours(e.target.value)}
                    placeholder="Contoh: Senin - Sabtu (08.00 - 17.00 WIB)"
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Catatan Tambahan (Opsional)
                  </label>
                  <input
                    type="text"
                    value={regNotes}
                    onChange={e => setRegNotes(e.target.value)}
                    placeholder="Contoh: Membutuhkan pecahan 500 & 1.000 setiap hari"
                    className={inputCls}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Alamat Lengkap <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  value={regAddress}
                  onChange={e => setRegAddress(e.target.value)}
                  placeholder="Masukkan alamat toko/rumah lengkap..."
                  className={inputCls}
                />
              </div>

              {/* Map Coordinates Picker */}
              <div className="bg-gray-50 rounded-2xl p-5 border border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                  <div>
                    <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                      <i className="fa-solid fa-map-location-dot text-primary"></i> Penentuan Titik Koordinat Peta <span className="text-red-500">*</span>
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Klik pada peta atau tekan tombol GPS untuk menentukan titik lokasi Anda.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleRegGPS}
                    className="bg-primary text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-blue-900 transition-all shrink-0 flex items-center gap-1.5 shadow-sm"
                  >
                    <i className="fa-solid fa-location-crosshairs"></i> Gunakan Lokasi GPS Saya
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="text-[11px] font-bold text-gray-500 mb-1 block">Latitude</label>
                    <input type="text" readOnly value={regLat} placeholder="Klik di peta..." className={`${inputCls} bg-white`} />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-gray-500 mb-1 block">Longitude</label>
                    <input type="text" readOnly value={regLng} placeholder="Klik di peta..." className={`${inputCls} bg-white`} />
                  </div>
                </div>

                <div className="rounded-xl overflow-hidden border border-gray-200" style={{ height: '320px' }}>
                  <MapView
                    center={mapCenter}
                    providers={[]}
                    searchMarker={null}
                    radius={0}
                    mode="pin"
                    onPinSet={handlePinSet}
                    pinPosition={pinPos}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary hover:bg-blue-900 text-white font-bold py-4 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-base disabled:opacity-50"
              >
                {isSubmitting ? (
                  <><i className="fa-solid fa-spinner fa-spin"></i> Menyimpan Pendaftaran...</>
                ) : (
                  <><i className="fa-solid fa-paper-plane"></i> Daftarkan Lokasi Permohonan Logam</>
                )}
              </button>
            </form>
          </div>
        )}
      </div>

      <FloatingAction />
      <Footer />
    </main>
  );
}
