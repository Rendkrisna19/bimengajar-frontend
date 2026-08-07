import React, { useRef } from 'react';
import { LocationFormData, ActivityForm } from '../types';
import dynamic from 'next/dynamic';

const MapSection = dynamic(() => import('./MapSection'), { ssr: false });

interface LocationDetailProps {
  formData: LocationFormData;
  setFormData: React.Dispatch<React.SetStateAction<LocationFormData>>;
  activities: ActivityForm[];
  setActivities: React.Dispatch<React.SetStateAction<ActivityForm[]>>;
  position: [number, number] | null;
  setPosition: (pos: [number, number]) => void;
  suggestions: any[];
  isSearching: boolean;
  setSuggestions: React.Dispatch<React.SetStateAction<any[]>>;
  handleSearchInput: (val: string) => void;
  handleSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  onCancel: () => void;
}

export const LocationDetail: React.FC<LocationDetailProps> = ({
  formData, setFormData,
  activities, setActivities,
  position, setPosition,
  suggestions, isSearching, setSuggestions,
  handleSearchInput,
  handleSubmit,
  isLoading,
  onCancel
}) => {
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleSelectSuggestion = (loc: any) => {
    setFormData(prev => ({
      ...prev,
      name: loc.name,
      latitude: loc.latitude.toString(),
      longitude: loc.longitude.toString()
    }));
    setPosition([parseFloat(loc.latitude), parseFloat(loc.longitude)]);
    setSuggestions([]);
  };

  const handleActivityChange = (index: number, field: string, value: string) => {
    const newActs = [...activities];
    (newActs[index] as any)[field] = value;
    setActivities(newActs);
  };

  const handleFileChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      const newActs = [...activities];
      newActs[index].photos = [...newActs[index].photos, ...filesArray];
      setActivities(newActs);
    }
  };

  const removeActivityPhoto = (actIndex: number, photoIndex: number) => {
    const newActs = [...activities];
    newActs[actIndex].photos.splice(photoIndex, 1);
    setActivities(newActs);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full bg-slate-50 dark:bg-gray-900 overflow-hidden">
      <div className="flex-none p-4 lg:p-6 lg:pb-0">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
              {formData.id ? 'Edit Data Edukasi' : 'Tambah Data Edukasi'}
            </h1>
            <p className="text-slate-500 dark:text-gray-400 text-sm mt-1">Lengkapi informasi institusi dan titik koordinat.</p>
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <button type="button" onClick={onCancel} className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl font-bold text-slate-500 bg-white border-2 border-slate-200 hover:bg-slate-50 dark:bg-gray-800 dark:border-gray-700">
              Kembali
            </button>
            <button type="submit" disabled={isLoading} className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl font-bold text-white bg-primary hover:bg-blue-900 disabled:opacity-50">
              {isLoading ? 'Menyimpan...' : 'Simpan Data'}
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 lg:p-6 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
          {/* Kolom Kiri */}
          <div className="space-y-6 flex flex-col h-full">
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-gray-700 flex-1 flex flex-col">
              <h2 className="text-sm font-bold text-primary dark:text-blue-400 mb-6 flex items-center gap-2">
                <i className="fa-solid fa-circle-info"></i> INFORMASI DASAR
              </h2>
              
              <div className="space-y-5 flex-1 overflow-y-auto pr-2">
                <div className="relative">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-2">Provinsi *</label>
                  <select required className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-gray-700 border border-slate-200 focus:border-primary/50"
                    value={formData.province} 
                    onChange={(e) => {
                      const prov = e.target.value;
                      setFormData({ ...formData, province: prov });
                      
                      const provinceCoordinates: Record<string, [number, number]> = {
                        'Aceh': [4.6951, 96.7494],
                        'Sumatera Utara': [2.1154, 99.5451],
                        'Sumatera Barat': [-0.7399, 100.8000],
                        'Riau': [0.2933, 101.7068],
                        'Jambi': [-1.6101, 103.6131],
                        'Sumatera Selatan': [-3.3194, 103.9144],
                        'Bengkulu': [-3.7928, 102.2608],
                        'Lampung': [-4.5586, 105.4068],
                        'Bangka Belitung': [-2.7411, 106.4406],
                        'Kepulauan Riau': [3.9456, 108.1429]
                      };
                      if (provinceCoordinates[prov]) setPosition(provinceCoordinates[prov]);
                    }}>
                    <option value="" disabled>Pilih Provinsi</option>
                    <option value="Aceh">Aceh</option>
                    <option value="Sumatera Utara">Sumatera Utara</option>
                    <option value="Sumatera Barat">Sumatera Barat</option>
                    <option value="Riau">Riau</option>
                    <option value="Jambi">Jambi</option>
                    <option value="Sumatera Selatan">Sumatera Selatan</option>
                    <option value="Lampung">Lampung</option>
                    <option value="Bengkulu">Bengkulu</option>
                    <option value="Bangka Belitung">Bangka Belitung</option>
                    <option value="Kepulauan Riau">Kepulauan Riau</option>
                  </select>
                </div>

                <div className="relative">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-2">Nama Sekolah / Instansi *</label>
                  <input
                    required
                    type="text"
                    placeholder="Ketik nama sekolah..."
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-gray-700 border border-slate-200 focus:border-primary/50"
                    value={formData.name}
                    onChange={(e) => handleSearchInput(e.target.value)}
                  />
                  {isSearching && <i className="fa-solid fa-spinner fa-spin absolute right-4 top-[38px] text-blue-500"></i>}
                  
                  {suggestions.length > 0 && (
                    <div className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 border rounded-xl shadow-xl max-h-60 overflow-y-auto">
                      {suggestions.map((loc, idx) => (
                        <div key={idx} onClick={() => handleSelectSuggestion(loc)} className="p-3 hover:bg-blue-50 dark:hover:bg-gray-700 cursor-pointer">
                          <p className="font-bold text-sm text-slate-800 dark:text-white">{loc.name}</p>
                          <p className="text-xs text-slate-500">{loc.address || loc.province}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-2">Kategori *</label>
                    <select required className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-gray-700 border border-slate-200 focus:border-primary/50"
                      value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}>
                      <option value="SD">SD</option>
                      <option value="SMP">SMP</option>
                      <option value="SMA/SMK">SMA/SMK</option>
                      <option value="Perguruan Tinggi">Perguruan Tinggi</option>
                      <option value="Komunitas">Komunitas</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-2">Tahun *</label>
                    <select required className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-gray-700 border border-slate-200 focus:border-primary/50"
                      value={formData.year} onChange={(e) => setFormData({ ...formData, year: e.target.value })}>
                      {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-2">Alamat Lengkap</label>
                  <textarea
                    rows={2}
                    placeholder="Tulis alamat..."
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-gray-700 border border-slate-200"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Kolom Kanan */}
          <div className="space-y-6 flex flex-col h-full">
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-1 overflow-hidden shadow-sm border border-slate-100 dark:border-gray-700 flex-1 relative min-h-[300px]">
              <MapSection position={position} setPosition={setPosition} />
              {!position && (
                <div className="absolute inset-0 bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm z-20 flex items-center justify-center">
                  <button 
                    type="button" 
                    onClick={() => setPosition([0.5, 101.5])} // Default center of Sumatera
                    className="bg-primary hover:bg-blue-900 transition-all text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-primary/30 flex items-center gap-3 animate-bounce hover:animate-none cursor-pointer"
                  >
                    <i className="fa-solid fa-map-location-dot"></i> Klik untuk Memilih Titik Lokasi
                  </button>
                </div>
              )}
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-gray-700 flex-1 flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-sm font-bold text-primary dark:text-blue-400 flex items-center gap-2">
                  <i className="fa-solid fa-camera"></i> KEGIATAN & GALERI
                </h2>
                <button type="button" onClick={() => setActivities([...activities, { title: '', description: '', photos: [] }])} className="px-4 py-1.5 bg-blue-50 text-primary text-xs font-bold rounded-lg hover:bg-blue-100">
                  + Tambah
                </button>
              </div>

              <div className="space-y-4 flex-1 overflow-y-auto pr-2">
                {activities.map((act, actIdx) => (
                  <div key={actIdx} className="p-5 border border-slate-200 dark:border-gray-700 rounded-2xl relative">
                    <button type="button" onClick={() => setActivities(activities.filter((_, i) => i !== actIdx))} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg bg-red-50 text-red-500 hover:bg-red-100">
                      <i className="fa-regular fa-trash-can"></i>
                    </button>
                    
                    <div className="space-y-4">
                      <input type="text" placeholder="Nama Kegiatan..." value={act.title} onChange={e => handleActivityChange(actIdx, 'title', e.target.value)} className="w-full pr-12 px-4 py-2 border rounded-xl" />
                      <textarea rows={2} placeholder="Detail Kegiatan..." value={act.description} onChange={e => handleActivityChange(actIdx, 'description', e.target.value)} className="w-full px-4 py-2 border rounded-xl" />
                      
                      <div className="border border-dashed rounded-xl p-4">
                        <input type="file" multiple accept="image/*" className="hidden" ref={el => { fileInputRefs.current[actIdx] = el; }} onChange={e => handleFileChange(actIdx, e)} />
                        <button type="button" onClick={() => fileInputRefs.current[actIdx]?.click()} className="w-full py-2 bg-slate-50 text-slate-500 font-bold rounded-lg text-sm hover:bg-slate-100">
                          <i className="fa-solid fa-image mr-2"></i> Pilih Gambar
                        </button>
                        
                        {act.photos.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {act.photos.map((p, pIdx) => (
                              <div key={pIdx} className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-md flex items-center gap-2">
                                {typeof p === 'string' ? 'Foto Server' : p.name.substring(0, 10) + '...'}
                                <button type="button" onClick={() => removeActivityPhoto(actIdx, pIdx)}><i className="fa-solid fa-xmark"></i></button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};
