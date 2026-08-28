'use client';

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import API_URL from '@/lib/api';

interface DailyVisit {
  day: number;
  count: number;
  real_count: number;
}

interface TestSubmission {
  id: number;
  test_id: number;
  nama_peserta: string;
  instansi: string;
  email: string;
  tanggal_bi_mengajar?: string;
  skor_total: number;
  skor_maksimal: number;
  detail_jawaban: any[];
  waktu_selesai: string;
  created_at: string;
  test?: {
    id: number;
    judul: string;
    tipe: string;
  };
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
    proporsi_materi: [] as { name: string; value: number }[]
  });

  // Pre-Post Test States for Main Admin Dashboard
  const [submissions, setSubmissions] = useState<TestSubmission[]>([]);
  const [top5Submissions, setTop5Submissions] = useState<TestSubmission[]>([]);
  const [selectedSubmissionModal, setSelectedSubmissionModal] = useState<TestSubmission | null>(null);
  const [searchSubmission, setSearchSubmission] = useState('');

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
          Authorization: `Bearer ${token}`,
          Accept: 'application/json'
        }
      });

      const json = await res.json();
      if (json.status === 'success' && json.data) {
        setData(json.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  }, [selectedHari, selectedBulan, selectedTahun]);

  const fetchPrePostTestData = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/admin/pre-post-test/submissions`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (res.data && res.data.status === 'success') {
        const list: TestSubmission[] = res.data.data || [];
        setSubmissions(list);

        if (res.data.summary && res.data.summary.top_5 && res.data.summary.top_5.length > 0) {
          setTop5Submissions(res.data.summary.top_5);
        } else {
          // Fallback calculate top 5
          const sorted = [...list].sort((a, b) => {
            const pctA = a.skor_maksimal > 0 ? a.skor_total / a.skor_maksimal : 0;
            const pctB = b.skor_maksimal > 0 ? b.skor_total / b.skor_maksimal : 0;
            return pctB - pctA;
          });
          setTop5Submissions(sorted.slice(0, 5));
        }
      }
    } catch (err) {
      console.error('Error fetching pre-post-test submissions for dashboard:', err);
    }
  }, []);

  // Initial fetch and fetch when filters change
  useEffect(() => {
    fetchData();
    fetchPrePostTestData();
  }, [fetchData, fetchPrePostTestData]);

  // Real-time live polling every 8 seconds for visitor counts & stats
  useEffect(() => {
    const interval = setInterval(() => {
      fetchData();
      fetchPrePostTestData();
    }, 8000);
    return () => clearInterval(interval);
  }, [fetchData, fetchPrePostTestData]);

  const resetFilters = () => {
    setSelectedHari('');
    setSelectedBulan(new Date().getMonth() + 1 + '');
    setSelectedTahun(new Date().getFullYear() + '');
  };

  const stats = [
    { title: 'Pengajuan Kunjungan', value: data.pengajuan_kunjungan.toLocaleString('id-ID'), trend: '+12.5%', icon: 'fa-solid fa-users', color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30' },
    { title: 'Konten Edukasi', value: data.konten_edukasi.toLocaleString('id-ID'), trend: '+5.2%', icon: 'fa-solid fa-book-open', color: 'text-yellow-600', bg: 'bg-yellow-100 dark:bg-yellow-900/30' },
    { title: 'Berita Aktif', value: data.berita_aktif.toLocaleString('id-ID'), trend: '-2.1%', icon: 'fa-regular fa-newspaper', color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-900/30' },
    { title: 'Kunjungan Web Real-Time', value: data.kunjungan_web.toLocaleString('id-ID'), trend: '● Live', icon: 'fa-solid fa-globe', color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/30' }
  ];

  const namaBulanList = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

  const filteredHistory = submissions.filter(s =>
    s.nama_peserta.toLowerCase().includes(searchSubmission.toLowerCase()) ||
    (s.instansi || '').toLowerCase().includes(searchSubmission.toLowerCase())
  );

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
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">Ringkasan data operasional, grafik kunjungan web, dan statistik Pre-Post Test BI Mengajar.</p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Hari */}
          <select
            value={selectedHari}
            onChange={e => setSelectedHari(e.target.value)}
            className="bg-gray-50 dark:bg-[#252525] border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-xs font-bold rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-primary cursor-pointer transition-colors"
          >
            <option value="">Semua Hari</option>
            {[...Array(31)].map((_, i) => (
              <option key={i} value={i + 1}>
                Tanggal {i + 1}
              </option>
            ))}
          </select>

          {/* Bulan */}
          <select
            value={selectedBulan}
            onChange={e => setSelectedBulan(e.target.value)}
            className="bg-gray-50 dark:bg-[#252525] border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-xs font-bold rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-primary cursor-pointer transition-colors"
          >
            <option value="">Semua Bulan</option>
            {namaBulanList.map((m, i) => (
              <option key={i} value={i + 1}>
                {m}
              </option>
            ))}
          </select>

          {/* Tahun */}
          <select
            value={selectedTahun}
            onChange={e => setSelectedTahun(e.target.value)}
            className="bg-gray-50 dark:bg-[#252525] border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-xs font-bold rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-primary cursor-pointer transition-colors"
          >
            <option value="">Semua Tahun</option>
            <option value="2026">2026</option>
            <option value="2025">2025</option>
            <option value="2024">2024</option>
          </select>

          {/* Reset Filter Button */}
          {(selectedHari || selectedBulan !== new Date().getMonth() + 1 + '' || selectedTahun !== new Date().getFullYear() + '') && (
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
              <div className={`px-2.5 py-1 rounded-full text-xs font-bold ${stat.trend.includes('Live') ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300 animate-pulse' : stat.trend.startsWith('+') ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
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
                {chartMode === 'dailyVisits' ? `Grafik total pengunjung per tanggal (${selectedBulan ? namaBulanList[parseInt(selectedBulan) - 1] : 'Bulan Ini'} ${selectedTahun || ''})` : 'Grafik jumlah pengajuan edukasi per bulan'}
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
                  const isToday = selectedBulan === new Date().getMonth() + 1 + '' && item.day === new Date().getDate();

                  return (
                    <div key={i} className="relative w-full flex flex-col justify-end items-center group h-full">
                      <div
                        className={`w-full max-w-[18px] sm:max-w-[22px] rounded-t-sm transition-all duration-300 relative cursor-pointer ${
                          isToday ? 'bg-green-500 dark:bg-green-400 shadow-[0_0_12px_rgba(34,197,94,0.6)] animate-pulse' : 'bg-primary/80 dark:bg-blue-500 hover:bg-primary dark:hover:bg-blue-400'
                        }`}
                        style={{ height: `${percentage}%` }}
                      >
                        {/* Tooltip on Hover */}
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] font-bold px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-30 whitespace-nowrap shadow-lg">
                          Tgl {item.day}: {item.count} Kunjungan
                        </div>
                      </div>
                      {/* X Axis Date Label */}
                      <div className={`absolute -bottom-6 text-[9px] sm:text-[10px] font-semibold ${isToday ? 'text-green-600 dark:text-green-400 font-extrabold' : 'text-gray-400'}`}>{item.day}</div>
                    </div>
                  );
                })
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">Tidak ada data kunjungan.</div>
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
                    <div className="w-full max-w-[24px] bg-accent-yellow/80 dark:bg-yellow-600 rounded-t-sm hover:bg-accent-yellow transition-colors relative cursor-pointer" style={{ height: `${percentage}%` }}>
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-30">
                        {h} Pengajuan
                      </div>
                    </div>
                    <div className="absolute -bottom-6 text-[10px] text-gray-400 font-medium">{['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'][i]}</div>
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
            <div
              className="relative w-40 h-40 rounded-full flex items-center justify-center shadow-inner"
              style={{
                background:
                  data.proporsi_materi.length > 0
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
              }}
            >
              <div className="absolute w-24 h-24 bg-white dark:bg-[#1e1e1e] rounded-full flex flex-col items-center justify-center shadow-lg">
                <span className="text-2xl font-bold text-gray-800 dark:text-white">{data.proporsi_materi.reduce((sum, item) => sum + item.value, 0)}</span>
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
                      <span className="text-gray-600 dark:text-gray-300 font-medium truncate max-w-[120px]" title={item.name}>
                        {item.name}
                      </span>
                    </div>
                    <span className="font-bold text-gray-800 dark:text-white">{percent}%</span>
                  </div>
                );
              })}
              {data.proporsi_materi.length === 0 && <div className="text-center text-sm text-gray-400">Belum ada data kategori.</div>}
            </div>
          </div>
        </div>
      </div>

      {/* TOP 5 RANKING NILAI TERTINGGI LEADERBOARD */}
      <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 dark:border-gray-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700/50 flex items-center justify-center text-amber-500 text-xl shadow-xs">
              <i className="fa-solid fa-trophy"></i>
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
                <span>Top 5 Ranking Nilai Tertinggi (Pre/Post Test)</span>
                <span className="text-[10px] bg-amber-500 text-white font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">Leaderboard</span>
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Grafik &amp; daftar peserta dengan perolehan skor teratas pada kegiatan edukasi</p>
            </div>
          </div>
        </div>

        {top5Submissions.length > 0 ? (
          <div className="space-y-6">
            {/* Horizontal Bar Chart for Top 5 */}
            <div className="space-y-3.5 bg-slate-50 dark:bg-gray-800/50 p-5 rounded-2xl border border-gray-100 dark:border-gray-700/60">
              <h4 className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                <i className="fa-solid fa-chart-simple text-primary"></i> Grafik Skor Teratas
              </h4>
              <div className="space-y-3">
                {top5Submissions.map((top, rankIdx) => {
                  const percentage = top.skor_maksimal > 0 ? Math.round((top.skor_total / top.skor_maksimal) * 100) : 0;
                  const rankColors = [
                    'from-amber-400 to-amber-500',
                    'from-slate-400 to-slate-500',
                    'from-amber-600 to-amber-700',
                    'from-sky-400 to-blue-500',
                    'from-sky-400 to-blue-500'
                  ];
                  const color = rankColors[rankIdx] || rankColors[3];

                  return (
                    <div key={top.id} className="space-y-1">
                      <div className="flex justify-between items-center text-xs font-bold">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-[10px] text-gray-700 dark:text-gray-200 shrink-0 font-extrabold">
                            #{rankIdx + 1}
                          </span>
                          <span className="text-gray-800 dark:text-gray-200 font-bold truncate">{top.nama_peserta}</span>
                          <span className="text-[10px] text-gray-400 font-normal truncate hidden sm:inline">({top.instansi || 'Umum'})</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs font-black text-gray-900 dark:text-white">{top.skor_total} <span className="text-[10px] text-gray-400 font-normal">/ {top.skor_maksimal}</span></span>
                          <span className="text-xs font-extrabold text-primary min-w-[36px] text-right">{percentage}%</span>
                        </div>
                      </div>
                      <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${color} rounded-full transition-all duration-700`}
                          style={{ width: `${Math.max(5, percentage)}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Grid List Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {top5Submissions.map((top, rankIdx) => {
                const percentage = top.skor_maksimal > 0 ? Math.round((top.skor_total / top.skor_maksimal) * 100) : 0;
                const rankBadges = [
                  { icon: 'fa-solid fa-crown', badgeColor: 'bg-amber-100 text-amber-800 border-amber-300' },
                  { icon: 'fa-solid fa-medal', badgeColor: 'bg-slate-100 text-slate-800 border-slate-300' },
                  { icon: 'fa-solid fa-award', badgeColor: 'bg-amber-50 text-amber-900 border-amber-400' },
                  { icon: 'fa-solid fa-star', badgeColor: 'bg-sky-50 text-sky-800 border-sky-200' },
                  { icon: 'fa-solid fa-star', badgeColor: 'bg-sky-50 text-sky-800 border-sky-200' }
                ];
                const badge = rankBadges[rankIdx] || rankBadges[3];

                return (
                  <div key={top.id} className="bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-700/60 rounded-xl p-4 flex flex-col justify-between hover:border-primary/40 transition-all shadow-2xs">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-extrabold border flex items-center gap-1 ${badge.badgeColor}`}>
                          <i className={`${badge.icon} text-[10px]`}></i> Rank #{rankIdx + 1}
                        </span>
                        <span className="text-[10px] font-semibold text-gray-400">
                          {top.tanggal_bi_mengajar ? new Date(top.tanggal_bi_mengajar).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) : ''}
                        </span>
                      </div>

                      <h4 className="font-extrabold text-sm text-gray-900 dark:text-white line-clamp-1">{top.nama_peserta}</h4>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-1 mb-3">{top.instansi || 'Umum'}</p>

                      <div className="bg-white dark:bg-gray-900 p-2.5 rounded-lg border border-gray-100 dark:border-gray-700 text-center mb-3">
                        <span className="text-[10px] text-gray-400 font-medium block">Skor Perolehan</span>
                        <span className="text-lg font-black text-gray-900 dark:text-white block">
                          {top.skor_total} <span className="text-xs text-gray-400 font-normal">/ {top.skor_maksimal}</span>
                        </span>
                        <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400">{percentage}%</span>
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedSubmissionModal(top)}
                      className="w-full py-1.5 bg-white dark:bg-gray-800 hover:bg-primary hover:text-white text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
                    >
                      <i className="fa-solid fa-eye text-[10px]"></i> Detail Jawaban
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="py-12 bg-slate-50 dark:bg-gray-800/40 border border-dashed border-gray-200 dark:border-gray-700 rounded-2xl flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-500 flex items-center justify-center mb-3 text-xl">
              <i className="fa-solid fa-trophy"></i>
            </div>
            <h4 className="text-gray-800 dark:text-gray-200 font-bold text-sm">Belum ada data skor hasil tes yang tercatat.</h4>
            <p className="text-gray-400 text-xs mt-1">Data ranking Pre/Post test peserta akan otomatis muncul di sini setelah tes dilakukan.</p>
          </div>
        )}
      </div>

      {/* HISTORY TABLE HASIL TES (PRE-POST TEST) */}
      <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="flex flex-col md:flex-row gap-3 mb-5 justify-between items-center">
          <div>
            <h3 className="text-base font-extrabold text-gray-800 dark:text-white flex items-center gap-2">
              <i className="fa-solid fa-clock-rotate-left text-primary"></i>
              <span>Riwayat Hasil Pre-Test & Post-Test Peserta</span>
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Tabel riwayat nilai dan evaluasi pengerjaan peserta secara keseluruhan</p>
          </div>

          <div className="w-full md:w-auto">
            <input
              type="text"
              placeholder="Cari nama peserta atau instansi..."
              value={searchSubmission}
              onChange={e => setSearchSubmission(e.target.value)}
              className="w-full sm:w-64 p-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-xs bg-gray-50 dark:bg-black outline-none focus:ring-2 focus:ring-primary font-medium"
            />
          </div>
        </div>

        <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-xl shadow-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-primary text-white text-xs font-semibold">
                <th className="p-4">Peserta & Instansi</th>
                <th className="p-4">Tanggal BI Mengajar</th>
                <th className="p-4">Judul Tes</th>
                <th className="p-4 text-center">Skor Total</th>
                <th className="p-4 text-center">Persentase</th>
                <th className="p-4 text-center w-28">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-xs">
              {filteredHistory.map(sub => {
                const percentage = sub.skor_maksimal > 0 ? Math.round((sub.skor_total / sub.skor_maksimal) * 100) : 0;
                return (
                  <tr key={sub.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="p-4 font-bold text-gray-900 dark:text-gray-100">
                      {sub.nama_peserta}
                      <span className="block text-[11px] font-normal text-gray-500">{sub.instansi || 'Umum'}</span>
                    </td>
                    <td className="p-4 font-bold text-primary dark:text-blue-400">
                      {sub.tanggal_bi_mengajar
                        ? new Date(sub.tanggal_bi_mengajar).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
                        : sub.created_at
                        ? new Date(sub.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
                        : '-'}
                    </td>
                    <td className="p-4 text-gray-700 dark:text-gray-300">{sub.test?.judul || 'Tes Edukasi'}</td>
                    <td className="p-4 text-center font-extrabold text-primary text-sm">
                      {sub.skor_total} / {sub.skor_maksimal}
                    </td>
                    <td className="p-4 text-center">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          percentage >= 80 ? 'bg-emerald-100 text-emerald-700' : percentage >= 60 ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {percentage}% ({percentage >= 60 ? 'Lulus' : 'Remidial'})
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => setSelectedSubmissionModal(sub)}
                        className="px-3 py-1.5 rounded-lg bg-blue-50 text-primary hover:bg-primary hover:text-white text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1"
                      >
                        <i className="fa-solid fa-eye text-xs"></i> Detail
                      </button>
                    </td>
                  </tr>
                );
              })}

              {filteredHistory.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-400">
                    Belum ada data riwayat pengerjaan tes peserta.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* SUBMISSION DETAIL MODAL */}
      {selectedSubmissionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 md:p-8 overflow-y-auto">
          <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-100 dark:border-gray-800 my-auto">
            <div className="px-6 py-4 bg-primary text-white flex items-center justify-between">
              <h3 className="text-base font-bold flex items-center gap-2">
                <i className="fa-solid fa-clipboard-check"></i>
                <span>Detail Jawaban Peserta: {selectedSubmissionModal.nama_peserta}</span>
              </h3>
              <button
                onClick={() => setSelectedSubmissionModal(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer"
              >
                <i className="fa-solid fa-times"></i>
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs sm:text-sm">
              <div className="grid grid-cols-2 gap-3 bg-gray-50 dark:bg-black/40 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                <div>
                  <span className="text-[11px] text-gray-400 block font-medium">Nama Peserta</span>
                  <span className="font-bold text-gray-800 dark:text-gray-200 mt-0.5 block">{selectedSubmissionModal.nama_peserta}</span>
                </div>
                <div>
                  <span className="text-[11px] text-gray-400 block font-medium">Tanggal BI Mengajar</span>
                  <span className="font-extrabold text-primary dark:text-blue-400 mt-0.5 block">
                    {selectedSubmissionModal.tanggal_bi_mengajar
                      ? new Date(selectedSubmissionModal.tanggal_bi_mengajar).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
                      : selectedSubmissionModal.created_at
                      ? new Date(selectedSubmissionModal.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
                      : '-'}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-gray-400 block font-medium">Instansi</span>
                  <span className="font-bold text-gray-800 dark:text-gray-200 mt-0.5 block">{selectedSubmissionModal.instansi || 'Umum'}</span>
                </div>
                <div>
                  <span className="text-[11px] text-gray-400 block font-medium">Skor Perolehan</span>
                  <span className="font-extrabold text-primary text-base mt-0.5 block">
                    {selectedSubmissionModal.skor_total} / {selectedSubmissionModal.skor_maksimal}
                  </span>
                </div>
              </div>

              {/* Rincian Jawaban Soal */}
              <div className="space-y-3">
                <h4 className="font-bold text-gray-800 dark:text-white text-xs uppercase tracking-wider">Evaluasi Pertanyaan & Kunci Jawaban</h4>

                {Array.isArray(selectedSubmissionModal.detail_jawaban) &&
                  selectedSubmissionModal.detail_jawaban.map((detail, idx) => (
                    <div key={idx} className={`p-3.5 rounded-xl border text-xs space-y-2 ${detail.is_benar ? 'bg-emerald-50/50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-900/40' : 'bg-red-50/50 border-red-200 dark:bg-red-950/20 dark:border-red-900/40'}`}>
                      <div className="flex justify-between items-start">
                        <span className="font-bold text-gray-900 dark:text-white">
                          Soal #{idx + 1}: {detail.pertanyaan}
                        </span>
                        <span className={`px-2 py-0.5 rounded font-extrabold text-[10px] ${detail.is_benar ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
                          {detail.is_benar ? `+${detail.skor_diperoleh} Poin` : '0 Poin'}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-gray-200/50">
                        <div>
                          <span className="text-[10px] text-gray-500 block">Jawaban Peserta:</span>
                          <span className={`font-semibold ${detail.is_benar ? 'text-emerald-700' : 'text-red-700'}`}>{detail.jawaban_peserta}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-gray-500 block">Kunci Jawaban Benar:</span>
                          <span className="font-semibold text-emerald-800">{detail.kunci_jawaban}</span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 dark:bg-black/20 border-t border-gray-100 dark:border-gray-800 flex justify-end">
              <button onClick={() => setSelectedSubmissionModal(null)} className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold cursor-pointer">
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
