'use client';

import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';

export default function FeaturesSection() {
  const { lang, t } = useLanguage();

  const features = [
    {
      title: lang === 'ID' ? 'Materi Edukasi' : 'Education Materials',
      desc: lang === 'ID' ? 'Kumpulan materi seputar Bank Indonesia' : 'Collection of materials about Bank Indonesia',
      icon: 'fa-solid fa-book-open',
      link: '/edukasi/materi-edukasi'
    },
    {
      title: lang === 'ID' ? 'Game & Kuis' : 'Games & Quizzes',
      desc: lang === 'ID' ? 'Belajar seru dengan game interaktif' : 'Fun learning with interactive games',
      icon: 'fa-solid fa-gamepad',
      link: '/game'
    },
    {
      title: lang === 'ID' ? 'Ajukan Kegiatan' : 'Request Activity',
      desc: lang === 'ID' ? 'Ajukan sosialisasi bersama Bank Indonesia' : 'Request socialization with Bank Indonesia',
      icon: 'fa-solid fa-file-signature',
      link: '/pengajuan'
    },
    {
      title: lang === 'ID' ? 'Mitra Edukasi' : 'Education Partners',
      desc: lang === 'ID' ? 'Temukan mitra edukasi Bank Indonesia' : 'Find Bank Indonesia education partners',
      icon: 'fa-solid fa-users',
      link: '/mitra'
    },
    {
      title: lang === 'ID' ? 'Pojok Koin' : 'Coin Corner',
      desc: lang === 'ID' ? 'Temukan lokasi tukar uang logam' : 'Find coin exchange locations',
      icon: 'fa-solid fa-map-location-dot',
      link: '/titik-temu'
    },
    {
      title: lang === 'ID' ? 'Kalender Kegiatan' : 'Activity Calendar',
      desc: lang === 'ID' ? 'Lihat jadwal kegiatan edukasi terbaru' : 'View the latest education activity schedule',
      icon: 'fa-regular fa-calendar-days',
      link: '/kalender'
    }
  ];

  return (
    <section className="relative z-20 -mt-24 md:-mt-28 pb-20 px-4 md:px-8">
      <div className="max-w-[1400px] mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-100 mb-8 drop-shadow-sm">
          {lang === 'ID' ? 'Menu Cepat' : 'Quick Actions'}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-5">
          {features.map((feature, idx) => (
            <Link 
              href={feature.link}
              key={idx} 
              className="group bg-white rounded-2xl p-5 md:p-6 shadow-[0_10px_30px_rgba(0,0,0,0.08)] border border-gray-100 flex flex-col h-full hover:-translate-y-2 transition-all duration-300 hover:shadow-[0_20px_40px_rgba(0,0,0,0.15)] cursor-pointer hover:bg-primary"
            >
              <div className="flex flex-col items-center text-center flex-1">
                {/* Icon */}
                <div className="mb-4 transition-all duration-300">
                  <i className={`${feature.icon} text-4xl text-gray-700 group-hover:text-white group-hover:scale-110 transition-all duration-300`}></i>
                </div>
                
                {/* Title */}
                <h3 className="text-base font-bold text-gray-800 mb-2 group-hover:text-white transition-colors duration-300">
                  {feature.title}
                </h3>
                
                {/* Description */}
                <p className="text-gray-500 group-hover:text-white/90 text-xs leading-relaxed transition-colors duration-300">
                  {feature.desc}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
