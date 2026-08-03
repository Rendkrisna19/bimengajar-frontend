'use client';

import { useLanguage } from '@/contexts/LanguageContext';

export default function StatsSection() {
  const { lang } = useLanguage();

  const stats = [
    {
      value: '150+',
      label: lang === 'ID' ? 'Kegiatan Edukasi' : 'Education Activities',
      icon: 'fa-solid fa-users',
    },
    {
      value: '10.000+',
      label: lang === 'ID' ? 'Peserta' : 'Participants',
      icon: 'fa-regular fa-user',
    },
    {
      value: '40+',
      label: lang === 'ID' ? 'Mitra Edukasi' : 'Education Partners',
      icon: 'fa-regular fa-handshake',
    },
    {
      value: '80+',
      label: lang === 'ID' ? 'Materi Edukasi' : 'Education Materials',
      icon: 'fa-regular fa-file-lines',
    }
  ];

  return (
    <section className="relative z-10 bg-gray-50 pt-10 pb-20 px-4 md:px-8 overflow-hidden">
      {/* Texture Motif Background */}
      <div 
        className="absolute inset-0 w-full h-full opacity-[0.1] bg-no-repeat bg-center bg-cover pointer-events-none"
        style={{ backgroundImage: 'url(/images/element/2.png)' }}
      ></div>

      <div className="max-w-[1400px] mx-auto relative z-10">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-800 mb-8 drop-shadow-sm">
          {lang === 'ID' ? 'Statistik Edukasi' : 'Education Statistics'}
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {stats.map((stat, idx) => {
            const isYellow = idx % 2 !== 0;
            const bgClass = isYellow ? 'bg-[#fbbf24]' : 'bg-primary';
            const shadowHoverClass = isYellow ? 'hover:shadow-[0_20px_40px_rgba(251,191,36,0.4)]' : 'hover:shadow-[0_20px_40px_rgba(0,51,102,0.3)]';
            const iconBg = isYellow ? 'bg-white/30 group-hover:bg-white/40' : 'bg-white/10 group-hover:bg-white/20';
            const textColor = 'text-white';
            const subTextColor = isYellow ? 'text-white/90' : 'text-blue-100';

            return (
              <div 
                key={idx} 
                className={`group ${bgClass} rounded-2xl p-6 shadow-[0_10px_20px_rgba(0,0,0,0.05)] flex items-center gap-6 hover:-translate-y-2 ${shadowHoverClass} transition-all duration-300 cursor-default`}
              >
                <div className={`w-16 h-16 rounded-full flex items-center justify-center shrink-0 transition-colors duration-300 ${iconBg}`}>
                  <i className={`${stat.icon} text-2xl ${textColor}`}></i>
                </div>
                <div>
                  <h3 className={`text-3xl font-extrabold mb-1 ${textColor}`}>{stat.value}</h3>
                  <p className={`text-sm font-medium ${subTextColor}`}>{stat.label}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
