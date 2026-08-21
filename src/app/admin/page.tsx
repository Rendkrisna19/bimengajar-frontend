'use client';
import { useState, useEffect, useCallback } from 'react';

interface DailyVisit {
  day: number;
  count: number;
  real_count: number;
}

export default function DashboardPage() {
  const [selectedHari, setSelectedHari] = useState<string>('');
  const [selectedBulan, setSelectedBulan] = useState<string>(new Date().getMonth() + 1 + '');
  const [selectedTahun, setSelectedTahun] = useState<string>(new Date().getFullYear() + '');
  const [chartMode, setChartMode] = useState<'dailyVisits' | 'trenPengajuan'>('dailyVisits');

  const [data, setData] = useState({
    pengajuan_kunjungan: 0,
    konten_edukasi: 0,
    berita_aktif: 0,
    kunjungan_web: 8920,
    tren_pengajuan: Array(12).fill(0),
    kunjungan_harian: [] as DailyVisit[],
    proporsi_materi: [] as {name: string, value: number}[]
  });

  const fetchData = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
      
      const queryParams = new URLSearchParams();
      if (selectedHari) queryParams.append('hari', selectedHari);
      if (selectedBulan) queryParams.append('bulan', selectedBulan);
      if (selectedTahun) queryParams.append('tahun', selectedTahun);

      const res = await fetch(`${API}/dashboard?${queryParams.toString()}`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      
      const json = await res.json();
      if (json.status === 'success' && json.data) {
        setData(json.data);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  }, [selectedHari, selectedBulan, selectedTahun]);

  // Initial fetch and fetch when filters change
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Real-time live polling every 8 seconds for visitor counts & stats
  useEffect(() => {
    const interval = setInterval(() => {
      fetchData();
    }, 8000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const resetFilters = () => {
    setSelectedHari('');
    setSelectedBulan(new Date().getMonth() + 1 + '');
    setSelectedTahun(new Date().getFullYear() + '');
  };

  const stats = [
    { title: "Pengajuan Kunjungan", value: data.pengajuan_kunjungan.toLocaleString('id-ID'), trend: "+12.5%", icon: "fa-solid fa-users", color: "text-blue-600", bg: "bg-blue-100 dark:bg-blue-900/30" },
    { title: "Konten Edukasi", value: data.konten_edukasi.toLocaleString('id-ID'), trend: "+5.2%", icon: "fa-solid fa-book-open", color: "text-yellow-600", bg: "bg-yellow-100 dark:bg-yellow-900/30" },
    { title: "Berita Aktif", value: data.berita_aktif.toLocaleString('id-ID'), trend: "-2.1%", icon: "fa-regular fa-newspaper", color: "text-purple-600", bg: "bg-purple-100 dark:bg-purple-900/30" },
    { title: "Kunjungan Web Real-Time", value: data.kunjungan_web.toLocaleString('id-ID'), trend: "● Live", icon: "fa-solid fa-globe", color: "text-green-600", bg: "bg-green-100 dark:bg-green-900/30" },
  ];

  const namaBulanList = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];

  return (
    <div className="flex flex-col gap-6 w-full h-full px-2 relative overflow-visible">
      {/* Dashboard Top-Right Ornament (5.png) */}
      <div 
        className="absolute -top-24 -right-10 w-[320px] h-64 opacity-[0.38] dark:opacity-[0.25] pointer-events-none bg-no-repeat bg-right-top z-0 mix-blend-multiply dark:mix-blend-normal"
        style={{ backgroundImage: 'url(/images/element/5.png)', backgroundSize: 'contain' }}
      ></div>

      {/* Header Info & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10 bg-white dark:bg-[#1e1e1e] p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-3 py-1 rounded-full mb-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Analytics Real-Time
          </div>
          <h1 className="text-2xl font-extrabold text-gray-800 dark:text-white tracking-tight">Dashboard Analytics</h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">Ringkasan data operasional dan grafik kunjungan web harian BI Mengajar.</p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Hari */}
          <select 
            value={selectedHari}
            onChange={(e) => setSelectedHari(e.target.value)}
            className="bg-gray-50 dark:bg-[#252525] border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-xs font-bold rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-primary cursor-pointer transition-colors"
          >
            <option value="">Semua Hari</option>
            {[...Array(31)].map((_, i) => <option key={i} value={i+1}>Tanggal {i+1}</option>)}
          </select>

          {/* Bulan */}
          <select 
            value={selectedBulan}
            onChange={(e) => setSelectedBulan(e.target.value)}
            className="bg-gray-50 dark:bg-[#252525] border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-xs font-bold rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-primary cursor-pointer transition-colors"
          >
            <option value="">Semua Bulan</option>
            {namaBulanList.map((m, i) => <option key={i} value={i+1}>{m}</option>)}
          </select>

          {/* Tahun */}
          <select 
            value={selectedTahun}
            onChange={(e) => setSelectedTahun(e.target.value)}
            className="bg-gray-50 dark:bg-[#252525] border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-xs font-bold rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-primary cursor-pointer transition-colors"
          >
            <option value="">Semua Tahun</option>
            <option value="2026">2026</option>
            <option value="2025">2025</option>
            <option value="2024">2024</option>
          </select>

          {/* Reset Filter Button */}
          {(selectedHari || selectedBulan !== (new Date().getMonth() + 1 + '') || selectedTahun !== (new Date().getFullYear() + '')) && (
            <button 
              onClick={resetFilters}
              className="bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-300 text-xs font-bold px-3 py-2 rounded-xl transition-all flex items-center gap-1 border border-red-200 dark:border-red-800"
              title="Reset Filter"
            >
              <i className="fa-solid fa-rotate-left"></i> Reset
            </button>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white dark:bg-[#1e1e1e] p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color}`}>
                <i className={`${stat.icon} text-xl`}></i>
              </div>
              <div className={`px-2.5 py-1 rounded-full text-xs font-bold ${stat.trend.includes('Live') ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300 animate-pulse' : (stat.trend.startsWith('+') ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400')}`}>
                {stat.trend}
              </div>
            </div>
            <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">{stat.title}</h3>
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white mt-1">{stat.value}</h2>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Real-Time Daily Visits / Monthly Trend Bar Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-[#1e1e1e] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 flex flex-col">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-base font-bold text-gray-800 dark:text-white flex items-center gap-2">
                <i className="fa-solid fa-chart-simple text-primary"></i>
                {chartMode === 'dailyVisits' ? 'Kunjungan Web Per Hari (Real-Time)' : 'Tren Pengajuan Edukasi (Per Bulan)'}
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                {chartMode === 'dailyVisits' ? `Grafik total pengunjung per tanggal (${selectedBulan ? namaBulanList[parseInt(selectedBulan)-1] : 'Bulan Ini'} ${selectedTahun || ''})` : 'Grafik jumlah pengajuan edukasi per bulan'}
              </p>
            </div>

            {/* Mode Switcher */}
            <div className="flex bg-gray-100 dark:bg-[#252525] p-1 rounded-xl">
              <button
                onClick={() => setChartMode('dailyVisits')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${chartMode === 'dailyVisits' ? 'bg-primary text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-800'}`}
              >
                Kunjungan Harian
              </button>
              <button
                onClick={() => setChartMode('trenPengajuan')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${chartMode === 'trenPengajuan' ? 'bg-primary text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-800'}`}
              >
                Tren Pengajuan
              </button>
            </div>
          </div>

          {/* Render Daily Visits Bar Chart */}
          {chartMode === 'dailyVisits' ? (
            <div className="relative h-64 w-full flex items-end justify-between gap-1 sm:gap-1.5 px-2 pb-6 pt-10 border-b border-l border-gray-200 dark:border-gray-700 flex-1">
              {/* Y Axis Labels */}
              <div className="absolute left-0 top-0 bottom-6 -ml-8 flex flex-col justify-between text-[10px] text-gray-400 h-full py-2">
                {(() => {
                  const maxCount = Math.max(...data.kunjungan_harian.map(item => item.count), 50);
                  return (
                    <>
                      <span>{maxCount}</span>
                      <span>{Math.round(maxCount * 0.75)}</span>
                      <span>{Math.round(maxCount * 0.5)}</span>
                      <span>{Math.round(maxCount * 0.25)}</span>
                      <span>0</span>
                    </>
                  );
                })()}
              </div>
              
              {/* Daily Bar Chart Items */}
              {data.kunjungan_harian.length > 0 ? (
                data.kunjungan_harian.map((item: DailyVisit, i: number) => {
                  const maxCount = Math.max(...data.kunjungan_harian.map(d => d.count), 50);
                  const percentage = Math.max((item.count / maxCount) * 100, 4);
                  const isToday = selectedBulan === (new Date().getMonth() + 1 + '') && item.day === new Date().getDate();

                  return (
                    <div key={i} className="relative w-full flex flex-col justify-end items-center group h-full">
                      <div 
                        className={`w-full max-w-[18px] sm:max-w-[22px] rounded-t-sm transition-all duration-300 relative cursor-pointer ${
                          isToday 
                            ? 'bg-green-500 dark:bg-green-400 shadow-[0_0_12px_rgba(34,197,94,0.6)] animate-pulse' 
                            : 'bg-primary/80 dark:bg-blue-500 hover:bg-primary dark:hover:bg-blue-400'
                        }`}
                        style={{ height: `${percentage}%` }}
                      >
                        {/* Tooltip on Hover */}
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] font-bold px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-30 whitespace-nowrap shadow-lg">
                          Tgl {item.day}: {item.count} Kunjungan
                        </div>
                      </div>
                      {/* X Axis Date Label */}
                      <div className={`absolute -bottom-6 text-[9px] sm:text-[10px] font-semibold ${isToday ? 'text-green-600 dark:text-green-400 font-extrabold' : 'text-gray-400'}`}>
                        {item.day}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                  Tidak ada data kunjungan.
                </div>
              )}
            </div>
          ) : (
            /* Render Monthly Tren Pengajuan Chart */
            <div className="relative h-64 w-full flex items-end justify-between gap-2 px-2 pb-6 pt-10 border-b border-l border-gray-200 dark:border-gray-700 flex-1">
              <div className="absolute left-0 top-0 bottom-6 -ml-8 flex flex-col justify-between text-[10px] text-gray-400 h-full py-2">
                {(() => {
                  const max = Math.max(...data.tren_pengajuan, 10);
                  return (
                    <>
                      <span>{max}</span>
                      <span>{Math.round(max * 0.75)}</span>
                      <span>{Math.round(max * 0.5)}</span>
                      <span>{Math.round(max * 0.25)}</span>
                      <span>0</span>
                    </>
                  );
                })()}
              </div>
              
              {data.tren_pengajuan.map((h: number, i: number) => {
                const max = Math.max(...data.tren_pengajuan, 10);
                const percentage = (h / max) * 100;
                return (
                  <div key={i} className="relative w-full flex justify-center group h-full items-end">
                    <div 
                      className="w-full max-w-[24px] bg-accent-yellow/80 dark:bg-yellow-600 rounded-t-sm hover:bg-accent-yellow transition-colors relative cursor-pointer"
                      style={{ height: `${percentage}%` }}
                    >
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-30">
                        {h} Pengajuan
                      </div>
                    </div>
                    <div className="absolute -bottom-6 text-[10px] text-gray-400 font-medium">
                      {['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'][i]}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Donut Chart (Proporsi Kategori Edukasi) */}
        <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 flex flex-col">
          <h3 className="text-base font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
            <i className="fa-solid fa-chart-pie text-accent-yellow"></i>
            Proporsi Kategori Edukasi
          </h3>
          
          <div className="flex-1 flex flex-col items-center justify-center">
            {/* Conic Gradient Donut */}
            <div className="relative w-40 h-40 rounded-full flex items-center justify-center shadow-inner" 
                 style={{ 
                   background: data.proporsi_materi.length > 0 
                     ? (() => {
                         let currentPercent = 0;
                         const colors = ['#003366', '#eab308', '#f97316', '#3b82f6', '#22c55e', '#a855f7'];
                         const total = data.proporsi_materi.reduce((sum, item) => sum + item.value, 0);
                         if (total === 0) return '#f3f4f6';
                         const gradientParts = data.proporsi_materi.map((item, idx) => {
                           const percent = (item.value / total) * 100;
                           const start = currentPercent;
                           currentPercent += percent;
                           return `${colors[idx % colors.length]} ${start}% ${currentPercent}%`;
                         });
                         return `conic-gradient(${gradientParts.join(', ')})`;
                       })()
                     : '#f3f4f6'
                 }}>
               <div className="absolute w-24 h-24 bg-white dark:bg-[#1e1e1e] rounded-full flex flex-col items-center justify-center shadow-lg">
                 <span className="text-2xl font-bold text-gray-800 dark:text-white">
                   {data.proporsi_materi.reduce((sum, item) => sum + item.value, 0)}
                 </span>
                 <span className="text-[10px] text-gray-500 font-medium">Total Konten</span>
               </div>
            </div>

            <div className="w-full mt-8 flex flex-col gap-3">
              {data.proporsi_materi.map((item, idx) => {
                const colors = ['bg-primary', 'bg-[#eab308]', 'bg-[#f97316]', 'bg-blue-500', 'bg-green-500', 'bg-purple-500'];
                const total = data.proporsi_materi.reduce((sum, item) => sum + item.value, 0);
                const percent = total > 0 ? Math.round((item.value / total) * 100) : 0;
                return (
                  <div key={idx} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className={`w-3 h-3 rounded-full ${colors[idx % colors.length]}`}></span>
                      <span className="text-gray-600 dark:text-gray-300 font-medium truncate max-w-[120px]" title={item.name}>{item.name}</span>
                    </div>
                    <span className="font-bold text-gray-800 dark:text-white">{percent}%</span>
                  </div>
                );
              })}
              {data.proporsi_materi.length === 0 && (
                <div className="text-center text-sm text-gray-400">Belum ada data kategori.</div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
