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
  const [activeTab, setActiveTab] = useState<'cari' | 'daftar'>('cari');

  // CARI STATE
  const [searchLat, setSearchLat] = useState('');
  const [searchLng, setSearchLng] = useState('');
  const [searchAddress, setSearchAddress] = useState('');
  const [radius, setRadius] = useState(5);
  const [results, setResults] = useState<CoinProvider[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>([2.9604, 99.0687]);

  // DAFTAR STATE
  const [form, setForm] = useState({
    name: '', user_type: 'perorangan', whatsapp: '', address: '',
    latitude: '', longitude: '', total_coins: '', denominations: [] as string[],
    operational_hours: '', notes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [pinLat, setPinLat] = useState<number | null>(null);
  const [pinLng, setPinLng] = useState<number | null>(null);
  const [pinMapCenter, setPinMapCenter] = useState<[number, number]>([2.9604, 99.0687]);

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

  const handleDenominationToggle = (val: string) => {
    setForm(prev => ({
      ...prev,
      denominations: prev.denominations.includes(val)
        ? prev.denominations.filter(d => d !== val)
        : [...prev.denominations, val],
    }));
  };

  const handlePinSet = (lat: number, lng: number) => {
    setPinLat(lat); setPinLng(lng);
    setPinMapCenter([lat, lng]);
    setForm(prev => ({ ...prev, latitude: lat.toFixed(6), longitude: lng.toFixed(6) }));
  };

  const handleAutoLocateForForm = () => {
    if (!navigator.geolocation) { Swal.fire('Info', t('pk.swal.gpsUnsupported'), 'info'); return; }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude; const lng = pos.coords.longitude;
        setPinLat(lat); setPinLng(lng); setPinMapCenter([lat, lng]);
        setForm(prev => ({ ...prev, latitude: lat.toFixed(6), longitude: lng.toFixed(6) }));
        setIsLocating(false);
        Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: t('pk.swal.gpsDetected'), showConfirmButton: false, timer: 2000 });
      },
      () => { setIsLocating(false); Swal.fire(lang === 'ID' ? 'Gagal' : 'Failed', t('pk.swal.gpsPermission'), 'error'); },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.denominations.length === 0) { Swal.fire(lang === 'ID' ? 'Perhatian' : 'Warning', t('pk.swal.denomNeeded'), 'warning'); return; }
    if (!form.latitude || !form.longitude) { Swal.fire(lang === 'ID' ? 'Perhatian' : 'Warning', t('pk.swal.pinNeeded'), 'warning'); return; }
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/coin-providers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ ...form, total_coins: parseInt(form.total_coins) || 0 }),
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        Swal.fire(t('pk.swal.successTitle'), t('pk.swal.success'), 'success');
        setForm({ name: '', user_type: 'perorangan', whatsapp: '', address: '', latitude: '', longitude: '', total_coins: '', denominations: [], operational_hours: '', notes: '' });
        setPinLat(null); setPinLng(null);
      } else {
        const msg = data.message || Object.values(data.errors || {}).flat().join(', ');
        Swal.fire(lang === 'ID' ? 'Gagal' : 'Failed', msg, 'error');
      }
    } catch { Swal.fire(lang === 'ID' ? 'Gagal' : 'Failed', t('pk.swal.serverError'), 'error'); }
    finally { setIsSubmitting(false); }
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

      {/* Tab Toggle */}
      <div className="max-w-[1100px] mx-auto px-4 md:px-8 -mt-8 relative z-20">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-2 flex gap-2 w-full max-w-md mx-auto">
          <button
            onClick={() => setActiveTab('cari')}
            className={`flex-1 py-3 px-6 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${activeTab === 'cari' ? 'bg-primary text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <i className="fa-solid fa-magnifying-glass"></i> {t('pk.tab.need')}
          </button>
          <button
            onClick={() => setActiveTab('daftar')}
            className={`flex-1 py-3 px-6 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${activeTab === 'daftar' ? 'bg-primary text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <i className="fa-solid fa-location-dot"></i> {t('pk.tab.have')}
          </button>
        </div>
      </div>

      <div className="max-w-[1100px] mx-auto px-4 md:px-8 py-10">

        {/* === TAB: CARI === */}
        {activeTab === 'cari' && (
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
                    <button onClick={handleUseMyLocation} className="bg-primary text-white px-4 py-3 rounded-xl font-bold text-sm hover:bg-blue-800 transition-colors flex items-center gap-2 whitespace-nowrap">
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
              <button onClick={handleSearch} disabled={isSearching} className="mt-4 w-full bg-primary hover:bg-blue-800 text-white font-bold py-3.5 rounded-xl transition-all shadow-md hover:-translate-y-0.5 flex items-center justify-center gap-2 disabled:opacity-70">
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
        )}

        {/* === TAB: DAFTAR === */}
        {activeTab === 'daftar' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
              <h2 className="font-bold text-gray-800 text-xl mb-2 flex items-center gap-2">
                <i className="fa-solid fa-location-dot text-primary"></i> {t('pk.reg.title')}
              </h2>
              <p className="text-sm text-gray-500 mb-6">{t('pk.reg.subtitle')}</p>

              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <fieldset className="flex flex-col gap-4">
                  <legend className="text-xs font-extrabold text-primary uppercase tracking-widest mb-1">{t('pk.reg.sectionProfile')}</legend>
                  <div>
                    <label className="text-xs font-bold text-gray-600 mb-1 block">{t('pk.reg.name')}</label>
                    <input type="text" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder={t('pk.reg.namePlaceholder')} className={inputCls} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-gray-600 mb-1 block">{t('pk.reg.type')}</label>
                      <select required value={form.user_type} onChange={e => setForm({ ...form, user_type: e.target.value })} className={inputCls}>
                        <option value="perorangan">{t('pk.reg.type.personal')}</option>
                        <option value="umkm">{t('pk.reg.type.umkm')}</option>
                        <option value="instansi">{t('pk.reg.type.instansi')}</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-600 mb-1 block">{t('pk.reg.whatsapp')}</label>
                      <input type="tel" required value={form.whatsapp} onChange={e => setForm({ ...form, whatsapp: e.target.value })} placeholder="08xxxx" className={inputCls} />
                    </div>
                  </div>
                </fieldset>

                <fieldset className="flex flex-col gap-4">
                  <legend className="text-xs font-extrabold text-primary uppercase tracking-widest mb-1">{t('pk.reg.sectionLocation')}</legend>
                  <div>
                    <label className="text-xs font-bold text-gray-600 mb-1 block">{t('pk.reg.address')}</label>
                    <textarea required value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder={t('pk.reg.addressPlaceholder')} rows={2} className={inputCls} />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-600 mb-2 block">
                      {t('pk.reg.pinLabel')}
                      {pinLat && <span className="text-green-600 ml-2">✓ {t('pk.reg.pinDetected')}</span>}
                    </label>
                    <button type="button" onClick={handleAutoLocateForForm} disabled={isLocating} className="w-full flex items-center justify-center gap-2 bg-primary text-white font-bold py-3 rounded-xl hover:bg-blue-800 transition-all disabled:opacity-70 mb-2">
                      {isLocating
                        ? <><i className="fa-solid fa-spinner fa-spin"></i> {t('pk.reg.locating')}</>
                        : <><i className="fa-solid fa-location-crosshairs"></i> {t('pk.reg.autoLocate')}</>}
                    </button>
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                      <i className="fa-solid fa-circle-info text-primary"></i> {t('pk.reg.pinHint')}
                    </p>
                    {pinLat && (
                      <div className="mt-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-xs text-green-700 font-medium flex items-center gap-2">
                        <i className="fa-solid fa-circle-check"></i>
                        {t('pk.reg.coordinates')} {pinLat.toFixed(5)}, {pinLng?.toFixed(5)}
                      </div>
                    )}
                  </div>
                </fieldset>

                <fieldset className="flex flex-col gap-4">
                  <legend className="text-xs font-extrabold text-primary uppercase tracking-widest mb-1">{t('pk.reg.sectionCoin')}</legend>
                  <div>
                    <label className="text-xs font-bold text-gray-600 mb-1 block">{t('pk.reg.totalCoin')}</label>
                    <input type="number" required min="0" value={form.total_coins} onChange={e => setForm({ ...form, total_coins: e.target.value })} placeholder={t('pk.reg.totalCoinPlaceholder')} className={inputCls} />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-600 mb-2 block">{t('pk.reg.denominations')}</label>
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

                <fieldset className="flex flex-col gap-4">
                  <legend className="text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-1">{t('pk.reg.sectionOptional')}</legend>
                  <div>
                    <label className="text-xs font-bold text-gray-600 mb-1 block">{t('pk.reg.hours')}</label>
                    <input type="text" value={form.operational_hours} onChange={e => setForm({ ...form, operational_hours: e.target.value })} placeholder={t('pk.reg.hoursPlaceholder')} className={inputCls} />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-600 mb-1 block">{t('pk.reg.notes')}</label>
                    <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder={t('pk.reg.notesPlaceholder')} rows={2} className={inputCls} />
                  </div>
                </fieldset>

                <button type="submit" disabled={isSubmitting} className="w-full bg-primary hover:bg-blue-800 text-white font-bold py-4 rounded-xl transition-all shadow-md hover:-translate-y-0.5 flex items-center justify-center gap-2 disabled:opacity-70 text-base">
                  {isSubmitting
                    ? <><i className="fa-solid fa-spinner fa-spin"></i> {t('pk.reg.submitting')}</>
                    : <><i className="fa-solid fa-location-dot"></i> {t('pk.reg.submit')}</>}
                </button>
              </form>
            </div>

            <div className="sticky top-24">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden" style={{ height: '600px' }}>
                <div className="bg-primary text-white text-xs font-bold px-4 py-3 flex items-center justify-between">
                  <span className="flex items-center gap-2"><i className="fa-solid fa-map-pin"></i> {t('pk.reg.mapTitle')}</span>
                  <span className="text-blue-200 font-normal">{pinLat ? `📍 ${t('pk.reg.mapMarked')}` : t('pk.reg.mapHint')}</span>
                </div>
                <div style={{ height: 'calc(100% - 40px)' }}>
                  <MapView center={pinMapCenter} providers={[]} searchMarker={null} radius={0} mode="pin" onPinSet={handlePinSet} pinPosition={pinLat && pinLng ? [pinLat, pinLng] : null} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <FloatingAction />
      <Footer />
    </main>
  );
}
