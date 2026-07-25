'use client';

import Link from 'next/link';

export default function FeaturesSection() {
  const features = [
    {
      title: "Materi BI Mengajar",
      desc: "Pelajari kebanksentralan, QRIS, dan CBP Rupiah melalui video, infografis, modul, dan kuis interaktif.",
      icon: "fa-solid fa-building-columns",
      iconColor: "text-blue-600",
      iconBg: "bg-blue-600",
      hoverBg: "hover:bg-blue-600",
      link: "/edukasi"
    },
    {
      title: "Titik Temu",
      desc: "Mempertemukan yang kelebihan dan kekurangan uang logam agar rupiah selalu beredar.",
      icon: "fa-solid fa-coins",
      iconColor: "text-green-600",
      iconBg: "bg-green-600",
      hoverBg: "hover:bg-green-600",
      link: "/titik-temu"
    },
    {
      title: "Mitra Edukasi",
      desc: "Berkolaborasi bersama berbagai mitra untuk edukasi dan literasi keuangan masyarakat.",
      icon: "fa-solid fa-handshake",
      iconColor: "text-purple-600",
      iconBg: "bg-purple-600",
      hoverBg: "hover:bg-purple-600",
      link: "/mitra"
    },
    {
      title: "Pengajuan Kegiatan",
      desc: "Ajukan kunjungan ke BI atau minta BI Mengajar datang ke sekolah / instansi Anda.",
      icon: "fa-regular fa-paper-plane",
      iconColor: "text-orange-500",
      iconBg: "bg-orange-500",
      hoverBg: "hover:bg-orange-500",
      link: "/kunjungan"
    },
    {
      title: "Peta Edukasi",
      desc: "Lihat sebaran sekolah dan komunitas yang telah diedukasi oleh BI Siantar Mengajar.",
      icon: "fa-solid fa-map-location-dot",
      iconColor: "text-pink-600",
      iconBg: "bg-pink-600",
      hoverBg: "hover:bg-pink-600",
      link: "/peta"
    }
  ];

  return (
    <section className="relative z-20 -mt-24 md:-mt-32 pb-20 px-4 md:px-8">
      <div className="max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6">
          {features.map((feature, idx) => (
            <div 
              key={idx} 
              className={`group bg-white rounded-2xl p-6 md:p-8 shadow-[0_10px_30px_rgba(0,0,0,0.08)] border border-gray-100 flex flex-col h-full hover:-translate-y-2 transition-all duration-300 hover:shadow-[0_20px_40px_rgba(0,0,0,0.15)] cursor-pointer ${feature.hoverBg}`}
            >
              <div className="flex flex-col items-center text-center flex-1">
                {/* Icon Circle */}
                <div className={`w-16 h-16 rounded-full ${feature.iconBg} group-hover:bg-white/20 flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-all duration-300`}>
                  <i className={`${feature.icon} text-white text-2xl`}></i>
                </div>
                
                {/* Title */}
                <h3 className="text-lg font-bold text-primary mb-3 group-hover:text-white transition-colors duration-300">
                  {feature.title}
                </h3>
                
                {/* Description */}
                <p className="text-gray-500 group-hover:text-white/90 text-sm leading-relaxed mb-6 flex-1 transition-colors duration-300">
                  {feature.desc}
                </p>
                
                {/* Link */}
                <Link 
                  href={feature.link}
                  className={`mt-auto inline-flex items-center gap-2 font-bold ${feature.iconColor} group-hover:text-white text-sm group-hover:gap-3 transition-all duration-300`}
                >
                  Selengkapnya <i className="fa-solid fa-arrow-right"></i>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
