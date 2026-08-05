'use client';

import { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import dynamic from 'next/dynamic';
import Swal from 'sweetalert2';
import API_URL from '@/lib/api';
import { useLanguage } from '@/contexts/LanguageContext';
import PageHeader from '@/components/ui/PageHeader';
import FloatingAction from '@/components/ui/FloatingAction';

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

const RADIUS_OPTIONS = [1, 3, 5, 10, 20];

const USER_TYPE_LABELS: Record<string, Record<string, string>> = {
  perorangan: { ID: 'Perorangan', EN: 'Individual' },
  umkm: { ID: 'UMKM', EN: 'Small Business' },
  instansi: { ID: 'Instansi', EN: 'Institution' },
};

export default function PojokKoinPage() {
  const { lang, t } = useLanguage();
  // CARI STATE
  const [searchLat, setSearchLat] = useState('');
  const [searchLng, setSearchLng] = useState('');
  const [searchAddress, setSearchAddress] = useState('');
  const [radius, setRadius] = useState(5);
  const [results, setResults] = useState<CoinProvider[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>([2.9604, 99.0687]);

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) { Swal.fire('Info', t('pk.swal.gpsUnsupported'), 'info'); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setSearchLat(pos.coords.latitude.toFixed(6));
        setSearchLng(pos.coords.longitude.toFixed(6));
        setSearchAddress(lang === 'ID' ? 'Lokasi GPS saya' : 'My GPS Location');
        setMapCenter([pos.coords.latitude, pos.coords.longitude]);
      },
      () => Swal.fire(lang === 'ID' ? 'Gagal' : 'Failed', t('pk.swal.gpsError'), 'error')
    );
  };

  const handleSearch = async () => {
    if (!searchLat || !searchLng) { Swal.fire(lang === 'ID' ? 'Perhatian' : 'Warning', t('pk.swal.locNeeded'), 'warning'); return; }
    setIsSearching(true); setHasSearched(false);
    try {
      const res = await fetch(`${API_URL}/coin-providers?lat=${searchLat}&lng=${searchLng}&radius=${radius}`);
      const data = await res.json();
      if (data.status === 'success') { setResults(data.data); setMapCenter([parseFloat(searchLat), parseFloat(searchLng)]); }
    } catch { Swal.fire(lang === 'ID' ? 'Gagal' : 'Failed', t('pk.swal.serverError'), 'error'); }
    finally { setIsSearching(false); setHasSearched(true); }
  };



  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);

  const inputCls = 'w-full p-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all bg-white';

  return (
    <main className="min-h-screen bg-[#f0f4f8]">
      <Navbar />

      {/* Hero / Header Section using PageHeader Component */}
      <PageHeader
        title={
          <>
            {t('pk.title')} <span className="text-yellow-300">{t('pk.titleAccent')}</span>
          </>
        }
        description={t('pk.subtitle')}
        breadcrumbs={[
          { label: lang === 'ID' ? 'Beranda' : 'Home', href: '/' },
          { label: t('pk.badge') }
        ]}
      />

      <div className="max-w-[1100px] mx-auto px-4 md:px-8 py-10">

        {/* === KONTEN PENCARIAN === */}
        <div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
              <h2 className="font-bold text-gray-800 text-lg mb-4 flex items-center gap-2">
                <i className="fa-solid fa-sliders text-primary"></i> {t('pk.search.title')}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div className="md:col-span-2">
                  <label className="text-xs font-bold text-gray-600 mb-1 block">{t('pk.search.location')}</label>
                  <div className="flex gap-2">
                    <input type="text" readOnly value={searchAddress || (searchLat && searchLng ? `${searchLat}, ${searchLng}` : '')} placeholder={t('pk.search.locationPlaceholder')} className={`${inputCls} flex-1 bg-gray-50 cursor-default`} />
                    <button onClick={handleUseMyLocation} className="bg-primary text-white px-4 py-3 rounded-xl font-bold text-sm hover:bg-blue-800 hover:-translate-y-0.5 hover:shadow-lg transition-all flex items-center gap-2 whitespace-nowrap">
                      <i className="fa-solid fa-location-crosshairs"></i> {t('pk.search.gps')}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-600 mb-1 block">{t('pk.search.radius')}</label>
                  <select value={radius} onChange={e => setRadius(Number(e.target.value))} className={inputCls}>
                    {RADIUS_OPTIONS.map(r => <option key={r} value={r}>{r} KM</option>)}
                  </select>
                </div>
              </div>
              <button onClick={handleSearch} disabled={isSearching} className="mt-4 w-full bg-accent-red hover:brightness-110 text-white font-bold py-3.5 rounded-xl transition-all shadow-[0_6px_20px_rgba(237,27,36,0.4)] hover:-translate-y-1 flex items-center justify-center gap-2 disabled:opacity-70">
                {isSearching
                  ? <><i className="fa-solid fa-spinner fa-spin"></i> {t('pk.search.searching')}</>
                  : <><i className="fa-solid fa-magnifying-glass"></i> {t('pk.search.button')}</>}
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden" style={{ height: '500px' }}>
                <MapView center={mapCenter} providers={results} searchMarker={searchLat && searchLng ? [parseFloat(searchLat), parseFloat(searchLng)] : null} radius={radius} mode="search" onPinSet={() => {}} />
              </div>

              <div className="flex flex-col gap-4">
                {!hasSearched && (
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center">
                    <i className="fa-solid fa-coins text-5xl text-gray-200 mb-4 block"></i>
                    <p className="text-gray-400 font-medium">{t('pk.search.empty')}</p>
                  </div>
                )}
                {hasSearched && results.length === 0 && (
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center">
                    <i className="fa-solid fa-circle-xmark text-5xl text-red-200 mb-4 block"></i>
                    <p className="text-gray-500 font-bold text-lg mb-1">{t('pk.search.notFound')}</p>
                    <p className="text-gray-400 text-sm">{t('pk.search.notFoundDesc')} {radius} {t('pk.search.notFoundDesc2')}</p>
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
                          <span className="text-[10px] font-bold bg-blue-50 text-primary px-2 py-0.5 rounded-full border border-blue-100">
                            {USER_TYPE_LABELS[p.user_type]?.[lang] || p.user_type}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mb-2 flex items-center gap-1 truncate">
                          <i className="fa-solid fa-location-dot text-red-400 shrink-0"></i> {p.address}
                        </p>
                        {p.distance !== undefined && (
                          <p className="text-xs text-gray-400 mb-2 flex items-center gap-1">
                            <i className="fa-solid fa-route text-primary shrink-0"></i> {p.distance.toFixed(2)} {t('pk.search.distance')}
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
                      target="_blank" rel="noopener noreferrer"
                      className="mt-3 w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold py-2.5 rounded-xl transition-all text-sm shadow-sm"
                    >
                      <i className="fa-brands fa-whatsapp text-lg"></i> {t('pk.search.contact')}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      <FloatingAction />
      <Footer />
    </main>
  );
}
