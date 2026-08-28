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
      image: '/images/menu-cepat/1.png',
      link: '/edukasi/materi-edukasi'
    },
    {
      title: t('features.game'),
      image: '/images/menu-cepat/2.jpg',
      link: '/user/dashboard/kuis'
    },
    {
      title: t('features.pengajuan'),
      image: '/images/menu-cepat/3.png',
      link: '/edukasi/pengajuan'
    },
    {
      title: t('features.mitra'),
      image: '/images/menu-cepat/4.png',
      link: '/edukasi/mitra'
    },
    {
      title: t('features.titikTemu'),
      image: '/images/menu-cepat/5.png',
      link: '/titik-temu'
    },
    {
      title: t('features.kalender'),
      image: '/images/menu-cepat/6.png',
      link: '/kalender'
    }
  ];

  return (
    <section className="relative z-20 pt-8 md:pt-12 pb-16 px-4 md:px-8">
      <div className="max-w-[1400px] mx-auto">
        {/* Header matching user reference design */}
        <div className="flex flex-col items-center justify-center mb-10">
          <div className="flex items-center gap-3">
            <span className="text-[#f59e0b] text-xl font-bold">❖</span>
            <h2 className="text-2xl md:text-4xl font-extrabold text-center text-[#0a2540] tracking-tight drop-shadow-sm">
              {t('features.title')}
            </h2>
            <span className="text-[#f59e0b] text-xl font-bold">❖</span>
          </div>
          <div className="w-12 h-1 bg-[#f59e0b] rounded-full mt-2"></div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
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

            const cardContent = (
              <div className="flex flex-col items-center text-center flex-1 relative z-10 justify-between h-full py-2">
                {/* Icon Image */}
                <div className="mb-4 transition-all duration-300 w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 relative group-hover:scale-105 shrink-0 flex items-center justify-center">
                  <Image 
                    src={feature.image} 
                    alt={feature.title} 
                    fill 
                    sizes="(max-width: 768px) 120px, 144px" 
                    className="object-contain drop-shadow-lg" 
                  />
                </div>
                
                {/* Title and Blue Accent Line */}
                <div className="w-full flex flex-col items-center">
                  <h3 className="text-sm sm:text-base font-bold text-[#0a2540] group-hover:text-primary transition-colors duration-300 tracking-tight leading-tight">
                    {feature.title}
                  </h3>
                  <div className="w-8 h-1 bg-[#005bb5] rounded-full mt-2.5 transition-all duration-300 group-hover:w-12 group-hover:bg-primary"></div>
                </div>
              </div>
            );

            return onClickHandler ? (
              <div 
                key={idx} 
                onClick={onClickHandler}
                className="group relative overflow-hidden bg-white/95 backdrop-blur-sm rounded-2xl md:rounded-3xl p-5 md:p-6 shadow-[0_8px_25px_rgba(0,0,0,0.06)] border border-white/80 flex flex-col h-full hover:-translate-y-2 transition-all duration-300 hover:shadow-[0_15px_35px_rgba(0,57,117,0.15)] cursor-pointer z-10"
              >
                {cardContent}
              </div>
            ) : (
              <Link 
                href={feature.link}
                key={idx} 
                className="group relative overflow-hidden bg-white/95 backdrop-blur-sm rounded-2xl md:rounded-3xl p-5 md:p-6 shadow-[0_8px_25px_rgba(0,0,0,0.06)] border border-white/80 flex flex-col h-full hover:-translate-y-2 transition-all duration-300 hover:shadow-[0_15px_35px_rgba(0,57,117,0.15)] cursor-pointer z-10"
              >
                {cardContent}
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
