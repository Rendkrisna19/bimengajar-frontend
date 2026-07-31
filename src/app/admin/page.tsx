'use client';
import { useState, useEffect } from 'react';

export default function DashboardPage() {
  const [data, setData] = useState({
    pengajuan_kunjungan: 0,
    konten_edukasi: 0,
    berita_aktif: 0,
    kunjungan_web: 8920,
    tren_pengajuan: Array(12).fill(0),
    proporsi_materi: [] as {name: string, value: number}[]
  });

  const [realtimeVisits, setRealtimeVisits] = useState(8920);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
        const res = await fetch(`${API}/dashboard`, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });
        
        const json = await res.json();
        if (json.status === 'success' && json.data) {
          setData(json.data);
          
          // Try to get saved visits from localStorage to persist the "real-time" increment
          const savedVisits = localStorage.getItem('bi_web_visits');
          if (savedVisits && parseInt(savedVisits) > json.data.kunjungan_web) {
            setRealtimeVisits(parseInt(savedVisits));
          } else {
            setRealtimeVisits(json.data.kunjungan_web);
          }
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };

    fetchData();
  }, []);

  // Simulate real-time web visits
  useEffect(() => {
    const interval = setInterval(() => {
      // Randomly decide whether to increment (simulate unpredictable real visits)
      if (Math.random() > 0.4) {
        setRealtimeVisits(prev => {
          const next = prev + Math.floor(Math.random() * 3) + 1;
          localStorage.setItem('bi_web_visits', next.toString());
          return next;
        });
      }
    }, 4500); // Every 4.5 seconds

    return () => clearInterval(interval);
  }, []);

  const stats = [
    { title: "Pengajuan Kunjungan", value: data.pengajuan_kunjungan.toLocaleString('id-ID'), trend: "+12.5%", icon: "fa-solid fa-users", color: "text-blue-600", bg: "bg-blue-100 dark:bg-blue-900/30" },
    { title: "Konten Edukasi", value: data.konten_edukasi.toLocaleString('id-ID'), trend: "+5.2%", icon: "fa-solid fa-book-open", color: "text-yellow-600", bg: "bg-yellow-100 dark:bg-yellow-900/30" },
    { title: "Berita Aktif", value: data.berita_aktif.toLocaleString('id-ID'), trend: "-2.1%", icon: "fa-regular fa-newspaper", color: "text-purple-600", bg: "bg-purple-100 dark:bg-purple-900/30" },
    { title: "Kunjungan Web", value: realtimeVisits.toLocaleString('id-ID'), trend: "+24.8%", icon: "fa-solid fa-globe", color: "text-green-600", bg: "bg-green-100 dark:bg-green-900/30" },
  ];
  return (
    <div className="flex flex-col gap-6 w-full h-full px-2 relative overflow-visible">
      {/* Dashboard Top-Right Ornament (5.png) */}
      <div 
        className="absolute -top-24 -right-10 w-[320px] h-64 opacity-[0.38] dark:opacity-[0.25] pointer-events-none bg-no-repeat bg-right-top z-0 mix-blend-multiply dark:mix-blend-normal"
        style={{ backgroundImage: 'url(/images/element/5.png)', backgroundSize: 'contain' }}
      ></div>

      {/* Header Info */}
      <div className="flex items-center justify-between relative z-10">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Dashboard Analytics</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Ringkasan data operasional BI Mengajar Siantar.</p>
        </div>
        <div className="hidden sm:flex items-center gap-2">
          <select className="bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 text-xs rounded-lg px-3 py-2 outline-none shadow-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-[#2a2a2a] transition-colors">
            <option value="">Semua Hari</option>
            {[...Array(31)].map((_, i) => <option key={i} value={i+1}>{i+1}</option>)}
          </select>
          <select className="bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 text-xs rounded-lg px-3 py-2 outline-none shadow-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-[#2a2a2a] transition-colors">
            <option value="">Semua Bulan</option>
            {['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'].map((m, i) => <option key={i} value={i+1}>{m}</option>)}
          </select>
          <select className="bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 text-xs rounded-lg px-3 py-2 outline-none shadow-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-[#2a2a2a] transition-colors">
            <option value="">Semua Tahun</option>
            <option value="2026">2026</option>
            <option value="2025">2025</option>
            <option value="2024">2024</option>
          </select>
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
              <div className={`px-2.5 py-1 rounded-full text-xs font-bold ${stat.trend.startsWith('+') ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
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
        
        {/* Line Chart Simulation (CSS Based) */}
        <div className="lg:col-span-2 bg-white dark:bg-[#1e1e1e] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-bold text-gray-800 dark:text-white">Tren Pengajuan Edukasi</h3>
            <select className="bg-gray-50 dark:bg-[#252525] border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-lg px-3 py-1.5 outline-none">
              <option>Tahun Ini</option>
            </select>
          </div>
          <div className="relative h-64 w-full flex items-end justify-between gap-2 px-2 pb-6 pt-10 border-b border-l border-gray-200 dark:border-gray-700">
            {/* Y Axis Labels */}
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
            
            {/* CSS Bar Chart Simulation */}
            {data.tren_pengajuan.map((h: number, i: number) => {
              const max = Math.max(...data.tren_pengajuan, 10);
              const percentage = (h / max) * 100;
              return (
              <div key={i} className="relative w-full flex justify-center group h-full items-end">
                <div 
                  className="w-full max-w-[24px] bg-primary/20 dark:bg-blue-900/40 rounded-t-sm hover:bg-primary dark:hover:bg-blue-500 transition-colors relative cursor-pointer"
                  style={{ height: `${percentage}%` }}
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                    {h}
                  </div>
                </div>
                {/* X Axis Labels */}
                <div className="absolute -bottom-6 text-[10px] text-gray-400 font-medium">
                  {['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'][i]}
                </div>
              </div>
            )})}
          </div>
        </div>

        {/* Donut Chart Simulation (CSS Based) */}
        <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 flex flex-col">
          <h3 className="text-base font-bold text-gray-800 dark:text-white mb-6">Proporsi Kategori Edukasi</h3>
          
          <div className="flex-1 flex flex-col items-center justify-center">
            {/* CSS Conic Gradient Donut */}
            <div className="relative w-40 h-40 rounded-full flex items-center justify-center shadow-inner" 
                 style={{ 
                   background: data.proporsi_materi.length > 0 
                     ? (() => {
                         let currentPercent = 0;
                         const colors = ['#003366', '#eab308', '#f97316', '#3b82f6', '#22c55e', '#a855f7'];
                         const total = data.proporsi_materi.reduce((sum, item) => sum + item.value, 0);
                         if (total === 0) return 'gray';
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
                 <span className="text-[10px] text-gray-500">Total Konten</span>
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
                )
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
