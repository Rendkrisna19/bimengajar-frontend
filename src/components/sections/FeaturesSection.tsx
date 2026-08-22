'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '@/contexts/LanguageContext';
import { useState } from 'react';
import KalenderModal from '@/components/ui/KalenderModal';
import KategoriMateriModal from '@/components/ui/KategoriMateriModal';

export default function FeaturesSection() {
  const { t } = useLanguage();
  const [isKalenderOpen, setIsKalenderOpen] = useState(false);
  const [isKategoriMateriOpen, setIsKategoriMateriOpen] = useState(false);

  const features = [
    {
      title: t('features.materi'),
      image: '/images/menu-cepat/1.jpeg',
      link: '/edukasi/materi-edukasi'
    },
    {
      title: t('features.game'),
      image: '/images/menu-cepat/2.jpeg',
      link: '/game'
    },
    {
      title: t('features.pengajuan'),
      image: '/images/menu-cepat/3.jpeg',
      link: '/edukasi/pengajuan'
    },
    {
      title: t('features.mitra'),
      image: '/images/menu-cepat/4.jpeg',
      link: '/edukasi/mitra'
    },
    {
      title: t('features.titikTemu'),
      image: '/images/menu-cepat/5.jpeg',
      link: '/titik-temu'
    },
    {
      title: t('features.kalender'),
      image: '/images/menu-cepat/6.jpeg',
      link: '/kalender'
    }
  ];

  return (
    <section className="relative z-20 pt-10 md:pt-14 pb-16 px-4 md:px-8">
      <div className="max-w-[1400px] mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-800 mb-8 drop-shadow-sm">
          {t('features.title')}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-5">
          {features.map((feature, idx) => {
            
            // Logika untuk onClick card
            let onClickHandler = undefined;
            if (feature.link === '/kalender') {
              onClickHandler = () => setIsKalenderOpen(true);
            } else if (feature.link === '/edukasi/materi-edukasi') {
              onClickHandler = (e: any) => {
                e.preventDefault();
                setIsKategoriMateriOpen(true);
              };
            }

            return onClickHandler ? (
              <div 
                key={idx} 
                onClick={onClickHandler}
                className="group relative overflow-hidden bg-white rounded-2xl p-5 md:p-6 shadow-[0_10px_30px_rgba(0,0,0,0.08)] border border-gray-100 flex flex-col h-full hover:-translate-y-2 transition-all duration-300 hover:shadow-[0_20px_40px_rgba(0,0,0,0.15)] cursor-pointer hover:bg-primary z-10"
              >
                <div className="flex flex-col items-center text-center flex-1 relative z-10 justify-center">
                  {/* Icon */}
                  <div className="mb-4 transition-all duration-300 w-24 h-24 relative group-hover:scale-110">
                    <Image src={feature.image} alt={feature.title} fill sizes="96px" className="object-contain drop-shadow-md" />
                  </div>
                  
                  {/* Title */}
                  <h3 className="text-sm font-bold text-gray-800 group-hover:text-white transition-colors duration-300">
                    {feature.title}
                  </h3>
                </div>
              </div>
            ) : (
              <Link 
                href={feature.link}
                key={idx} 
                className="group relative overflow-hidden bg-white rounded-2xl p-5 md:p-6 shadow-[0_10px_30px_rgba(0,0,0,0.08)] border border-gray-100 flex flex-col h-full hover:-translate-y-2 transition-all duration-300 hover:shadow-[0_20px_40px_rgba(0,0,0,0.15)] cursor-pointer hover:bg-primary z-10"
              >
                <div className="flex flex-col items-center text-center flex-1 relative z-10 justify-center">
                  {/* Icon */}
                  <div className="mb-4 transition-all duration-300 w-24 h-24 relative group-hover:scale-110">
                    <Image src={feature.image} alt={feature.title} fill sizes="96px" className="object-contain drop-shadow-md" />
                  </div>
                  
                  {/* Title */}
                  <h3 className="text-sm font-bold text-gray-800 group-hover:text-white transition-colors duration-300">
                    {feature.title}
                  </h3>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
      <KalenderModal isOpen={isKalenderOpen} onClose={() => setIsKalenderOpen(false)} />
      <KategoriMateriModal isOpen={isKategoriMateriOpen} onClose={() => setIsKategoriMateriOpen(false)} />
    </section>
  );
}
