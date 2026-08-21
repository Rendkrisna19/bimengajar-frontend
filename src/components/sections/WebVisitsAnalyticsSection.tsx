'use client';

import { useState, useMemo } from 'react';

// Beautiful realistic dummy datasets for each year matching the reference screenshot
const DUMMY_DATA_BY_YEAR: Record<string, {
  total: number;
  bulanIni: number;
  rataRata: number;
  pertumbuhan: number;
  monthly: number[];
}> = {
  '2026': {
    total: 71087,
    bulanIni: 2743,
    rataRata: 8886,
    pertumbuhan: -83.2,
    // Waves peaking smoothly around 28,500 in June, dropping, then rising again in October
    monthly: [1200, 2800, 5400, 12800, 21500, 28500, 10200, 2743, 8900, 16400, 12800, 6200]
  },
  '2025': {
    total: 94250,
    bulanIni: 7850,
    rataRata: 7854,
    pertumbuhan: 14.8,
    monthly: [2500, 4200, 7800, 11400, 16800, 22400, 18900, 14500, 19800, 24500, 17200, 9400]
  },
  '2027': {
    total: 128400,
    bulanIni: 10700,
    rataRata: 10700,
    pertumbuhan: 26.4,
    monthly: [4200, 8500, 14200, 21000, 27800, 34200, 26500, 21400, 29800, 36500, 31200, 18400]
  }
};

export default function WebVisitsAnalyticsSection() {
  const [selectedTahun, setSelectedTahun] = useState<string>('2026');
  const [hoveredPoint, setHoveredPoint] = useState<{ label: string; val: number; x: number; y: number } | null>(null);

  // Active dataset based on selected year
  const activeData = DUMMY_DATA_BY_YEAR[selectedTahun] || DUMMY_DATA_BY_YEAR['2026'];

  const monthLabels = [
    'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
    'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
  ];

  const currentMonthFull = useMemo(() => {
    const monthFullNames = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    return `${monthFullNames[new Date().getMonth()]} ${selectedTahun}`;
  }, [selectedTahun]);

  // Chart smooth curve points calculation
  const chartData = useMemo(() => {
    const vals = activeData.monthly;

    const maxVal = Math.max(...vals, 1000);
    const yMax = 30000;
    const yAxisStep = 7500; // 30,000 / 4 = 7,500

    const width = 800;
    const height = 220;
    const paddingY = 20;

    const points = vals.map((val, idx) => {
      const x = vals.length > 1 ? (idx / (vals.length - 1)) * width : width / 2;
      const y = height - paddingY - ((val / yMax) * (height - paddingY * 2));
      return { x, y, val, label: monthLabels[idx] };
    });

    if (points.length <= 1) {
      return { pathD: '', areaD: '', points, yMax, yAxisStep };
    }

    // Smooth cubic bezier spline for natural curve
    let pathD = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cpX = (p0.x + p1.x) / 2;
      pathD += ` C ${cpX} ${p0.y}, ${cpX} ${p1.y}, ${p1.x} ${p1.y}`;
    }

    const first = points[0];
    const last = points[points.length - 1];
    const areaD = `${pathD} L ${last.x} ${height} L ${first.x} ${height} Z`;

    return { pathD, areaD, points, yMax, yAxisStep };
  }, [activeData, selectedTahun]);

  return (
    <section className="py-16 bg-[#f8fafc] font-sans border-t border-gray-100">
      <div className="max-w-[1200px] mx-auto px-4 md:px-8">
        
        {/* Header Title Bar */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
              Statistik Kunjungan
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Statistik pengunjung website BI Mengajar
            </p>
          </div>
          <button className="text-sm font-semibold text-gray-600 hover:text-primary transition-colors flex items-center gap-1">
            Selengkapnya &gt;
          </button>
        </div>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          
          {/* Card 1: Total Kunjungan */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm relative flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-500">Total Kunjungan</span>
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-sm">
                <i className="fa-solid fa-user-group"></i>
              </div>
            </div>
            <div>
              <h3 className="text-3xl font-extrabold text-gray-900">
                {activeData.total.toLocaleString('id-ID')}
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                Menampilkan total pengunjung selama 12 bulan terakhir
              </p>
            </div>
          </div>

          {/* Card 2: Kunjungan Bulan Ini (Active Border) */}
          <div className="bg-white rounded-2xl p-6 border-2 border-blue-600 shadow-sm relative flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-600">Kunjungan Bulan Ini</span>
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-sm">
                <i className="fa-regular fa-eye"></i>
              </div>
            </div>
            <div>
              <h3 className="text-3xl font-extrabold text-gray-900">
                {activeData.bulanIni.toLocaleString('id-ID')}
              </h3>
              <p className="text-xs text-gray-500 font-medium mt-1">
                {currentMonthFull}
              </p>
            </div>
          </div>

          {/* Card 3: Rata-rata Bulanan */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm relative flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-500">Rata-rata Bulanan</span>
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-sm">
                <i className="fa-solid fa-chart-column"></i>
              </div>
            </div>
            <div>
              <h3 className="text-3xl font-extrabold text-gray-900">
                {activeData.rataRata.toLocaleString('id-ID')}
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                / bulan
              </p>
            </div>
          </div>

          {/* Card 4: Tren Pertumbuhan */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm relative flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-500">Tren Pertumbuhan</span>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm ${
                activeData.pertumbuhan >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-500'
              }`}>
                <i className={`fa-solid ${activeData.pertumbuhan >= 0 ? 'fa-arrow-trend-up' : 'fa-arrow-trend-down'}`}></i>
              </div>
            </div>
            <div>
              <h3 className={`text-3xl font-extrabold ${activeData.pertumbuhan >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                {activeData.pertumbuhan >= 0 ? `+${activeData.pertumbuhan}%` : `${activeData.pertumbuhan}%`}
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                {activeData.pertumbuhan >= 0 ? 'Meningkat vs bulan lalu' : 'Menurun vs bulan lalu'}
              </p>
            </div>
          </div>

        </div>

        {/* Main Chart Container Card */}
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm relative">
          
          {/* Header inside Chart Card */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base md:text-lg font-bold text-gray-900">
              Analisis Pengunjung ({selectedTahun})
            </h3>
            
            {/* Year Selector Pills */}
            <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
              {['2025', '2026', '2027'].map((yr) => {
                const isSelected = selectedTahun === yr;
                return (
                  <button
                    key={yr}
                    onClick={() => setSelectedTahun(yr)}
                    className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
                      isSelected 
                        ? 'bg-blue-600 text-white shadow-sm' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {yr}
                  </button>
                );
              })}
            </div>
          </div>

          {/* SVG Smooth Curve Area Chart */}
          <div className="relative w-full">
            
            {/* Hover Tooltip */}
            {hoveredPoint && (
              <div 
                className="absolute bg-gray-900 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-lg pointer-events-none z-30 transform -translate-x-1/2 -translate-y-full mb-2"
                style={{ left: `${(hoveredPoint.x / 800) * 100}%`, top: `${(hoveredPoint.y / 220) * 100}%` }}
              >
                {hoveredPoint.label}: <span className="text-blue-400">{hoveredPoint.val.toLocaleString('id-ID')}</span> Visit
              </div>
            )}

            <div className="flex items-stretch gap-4">
              
              {/* Y-Axis Labels */}
              <div className="flex flex-col justify-between text-xs text-gray-400 font-medium py-1 text-right select-none w-14 shrink-0">
                <span>30,000</span>
                <span>22,500</span>
                <span>15,000</span>
                <span>7,500</span>
                <span>0</span>
              </div>

              {/* Chart SVG */}
              <div className="flex-1 relative">
                <svg 
                  viewBox="0 0 800 220" 
                  className="w-full h-64 md:h-72 overflow-visible"
                  preserveAspectRatio="none"
                >
                  <defs>
                    {/* Soft Blue Area Fill Gradient matching exact screenshot */}
                    <linearGradient id="blue-area-gradient-dummy" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.30" />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.02" />
                    </linearGradient>
                  </defs>

                  {/* Dotted Horizontal Grid Lines */}
                  <line x1="0" y1="20" x2="800" y2="20" stroke="#f1f5f9" strokeDasharray="3 3" />
                  <line x1="0" y1="65" x2="800" y2="65" stroke="#f1f5f9" strokeDasharray="3 3" />
                  <line x1="0" y1="110" x2="800" y2="110" stroke="#f1f5f9" strokeDasharray="3 3" />
                  <line x1="0" y1="155" x2="800" y2="155" stroke="#f1f5f9" strokeDasharray="3 3" />
                  <line x1="0" y1="200" x2="800" y2="200" stroke="#e2e8f0" />

                  {/* Gradient Area Fill */}
                  {chartData.areaD && (
                    <path d={chartData.areaD} fill="url(#blue-area-gradient-dummy)" />
                  )}

                  {/* Main Smooth Blue Curve Line */}
                  {chartData.pathD && (
                    <path 
                      d={chartData.pathD} 
                      fill="none" 
                      stroke="#1d4ed8" 
                      strokeWidth="3.5" 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                    />
                  )}

                  {/* Interactive Points */}
                  {chartData.points.map((pt, idx) => (
                    <g key={idx}>
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r="5"
                        fill="#ffffff"
                        stroke="#1d4ed8"
                        strokeWidth="3"
                        className="cursor-pointer transition-transform duration-200 hover:scale-150"
                        onMouseEnter={() => setHoveredPoint(pt)}
                        onMouseLeave={() => setHoveredPoint(null)}
                      />
                    </g>
                  ))}
                </svg>

                {/* X-Axis Month Labels */}
                <div className="flex justify-between items-center text-xs text-gray-500 font-medium pt-3 border-t border-gray-100">
                  {chartData.points.map((pt, i) => (
                    <span key={i} className="text-center font-medium">
                      {pt.label}
                    </span>
                  ))}
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
