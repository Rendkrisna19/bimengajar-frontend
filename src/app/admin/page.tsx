'use client';

export default function DashboardPage() {
  const stats = [
    { title: "Pengajuan Kunjungan", value: "1,245", trend: "+12.5%", icon: "fa-solid fa-users", color: "text-blue-600", bg: "bg-blue-100 dark:bg-blue-900/30" },
    { title: "Konten Edukasi", value: "128", trend: "+5.2%", icon: "fa-solid fa-book-open", color: "text-yellow-600", bg: "bg-yellow-100 dark:bg-yellow-900/30" },
    { title: "Berita Aktif", value: "84", trend: "-2.1%", icon: "fa-regular fa-newspaper", color: "text-purple-600", bg: "bg-purple-100 dark:bg-purple-900/30" },
    { title: "Kunjungan Web", value: "8,920", trend: "+24.8%", icon: "fa-solid fa-globe", color: "text-green-600", bg: "bg-green-100 dark:bg-green-900/30" },
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
        <button className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm font-semibold text-primary dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors">
          <i className="fa-solid fa-download"></i> Export Laporan
        </button>
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
            <h3 className="text-base font-bold text-gray-800 dark:text-white">Tren Kunjungan Website</h3>
            <select className="bg-gray-50 dark:bg-[#252525] border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-lg px-3 py-1.5 outline-none">
              <option>Tahun Ini</option>
              <option>Bulan Ini</option>
            </select>
          </div>
          <div className="relative h-64 w-full flex items-end justify-between gap-2 px-2 pb-6 pt-10 border-b border-l border-gray-200 dark:border-gray-700">
            {/* Y Axis Labels */}
            <div className="absolute left-0 top-0 bottom-6 -ml-8 flex flex-col justify-between text-[10px] text-gray-400 h-full py-2">
              <span>100</span><span>75</span><span>50</span><span>25</span><span>0</span>
            </div>
            
            {/* CSS Bar Chart Simulation */}
            {[40, 70, 45, 90, 65, 85, 55, 75, 40, 60, 80, 50].map((h, i) => (
              <div key={i} className="relative w-full flex justify-center group h-full items-end">
                <div 
                  className="w-full max-w-[24px] bg-primary/20 dark:bg-blue-900/40 rounded-t-sm hover:bg-primary dark:hover:bg-blue-500 transition-colors relative cursor-pointer"
                  style={{ height: `${h}%` }}
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                    {h}k
                  </div>
                </div>
                {/* X Axis Labels */}
                <div className="absolute -bottom-6 text-[10px] text-gray-400 font-medium">
                  {['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'][i]}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Donut Chart Simulation (CSS Based) */}
        <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 flex flex-col">
          <h3 className="text-base font-bold text-gray-800 dark:text-white mb-6">Proporsi Kategori Edukasi</h3>
          
          <div className="flex-1 flex flex-col items-center justify-center">
            {/* CSS Conic Gradient Donut */}
            <div className="relative w-40 h-40 rounded-full flex items-center justify-center shadow-inner" 
                 style={{ background: 'conic-gradient(#003366 0% 45%, #eab308 45% 75%, #f97316 75% 100%)' }}>
               <div className="absolute w-24 h-24 bg-white dark:bg-[#1e1e1e] rounded-full flex flex-col items-center justify-center shadow-lg">
                 <span className="text-2xl font-bold text-gray-800 dark:text-white">128</span>
                 <span className="text-[10px] text-gray-500">Total Konten</span>
               </div>
            </div>

            <div className="w-full mt-8 flex flex-col gap-3">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-primary"></span>
                  <span className="text-gray-600 dark:text-gray-300 font-medium">Kebanksentralan</span>
                </div>
                <span className="font-bold text-gray-800 dark:text-white">45%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-accent-warning"></span>
                  <span className="text-gray-600 dark:text-gray-300 font-medium">QRIS</span>
                </div>
                <span className="font-bold text-gray-800 dark:text-white">30%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-accent-cta"></span>
                  <span className="text-gray-600 dark:text-gray-300 font-medium">CBP Rupiah</span>
                </div>
                <span className="font-bold text-gray-800 dark:text-white">25%</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
