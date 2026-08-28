'use client';

import { useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Image from 'next/image';
import Link from 'next/link';

export default function PerpustakaanPage() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animated');
          }
        });
      },
      { threshold: 0.05 }
    );
    const elements = document.querySelectorAll('.animate-on-scroll');
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
  const stats = [
    { number: '8.650', label: 'Judul Buku Tercetak', icon: 'fa-solid fa-book' },
    { number: '9.245', label: 'Eksemplar Koleksi', icon: 'fa-solid fa-layer-group' },
    { number: '544', label: 'Koleksi Digital', icon: 'fa-solid fa-tablet-screen-button' },
    { number: '24/7', label: 'Akses iBI Library', icon: 'fa-solid fa-globe' }
  ];

  const programs = [
    {
      title: 'Bedah Buku',
      icon: 'fa-solid fa-book-open-reader',
      color: 'from-blue-600 to-indigo-700',
      badge: 'Rutin Tahunan',
      desc: 'Kegiatan literasi yang rutin dilaksanakan setiap tahun. Menjadi ruang bagi pemustaka untuk mengenal lebih dekat sebuah buku melalui pembahasan bersama narasumber dan peserta. Mendorong budaya berdiskusi, berpikir kritis, dan berbagi wawasan.'
    },
    {
      title: 'Lomba Literasi & Kreativitas',
      icon: 'fa-solid fa-award',
      color: 'from-amber-500 to-orange-600',
      badge: 'Kompetisi',
      desc: 'Berbagai lomba dan kegiatan kreatif yang berkaitan dengan literasi. Ditujukan untuk meningkatkan minat baca, kreativitas, serta partisipasi masyarakat, khususnya generasi muda.'
    },
    {
      title: 'KUPINTAR (Kuis Perpustakaan BI)',
      icon: 'fa-solid fa-gamepad',
      color: 'from-emerald-500 to-teal-600',
      badge: 'Instagram Interactive',
      desc: 'Program interaktif di media sosial Instagram dikemas dalam bentuk kuis ringan dan edukatif. Mengajak pengikut media sosial menguji pengetahuan sekaligus mendapat informasi baru seputar buku, literasi, dan Bank Indonesia.'
    },
    {
      title: 'LENTERA (Literasi & Edukasi)',
      icon: 'fa-solid fa-lightbulb',
      color: 'from-blue-500 to-cyan-600',
      badge: 'Kunjungan Sekolah',
      desc: 'Program yang membuka kesempatan bagi sekolah-sekolah untuk melakukan kunjungan edukatif ke Perpustakaan Bank Indonesia Pematangsiantar. Diisi dengan kegiatan literasi dan edukasi mengenai tugas serta peran Bank Indonesia.'
    },
    {
      title: 'Media Sosial @perpusbipematangsiantar',
      icon: 'fa-brands fa-instagram',
      color: 'from-pink-500 to-purple-600',
      badge: 'Info & Rekomendasi',
      desc: 'Aktif membagikan informasi koleksi, kegiatan literasi, kuis, rekomendasi buku, serta informasi menarik lainnya melalui media sosial Instagram (@perpusbipematangsiantar) sebagai kanal komunikasi utama.'
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-gray-800 font-sans selection:bg-primary selection:text-white">
      <Navbar />

      <main className="flex-grow pt-20 pb-20 relative overflow-hidden">
        {/* Decorative Background Element 2.png (80% opacity) */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <Image
            src="/images/element/2.png"
            alt="Background Element"
            fill
            sizes="100vw"
            className="object-cover opacity-80"
            priority={false}
          />
        </div>

        {/* HERO HEADER SECTION (Matching Edukasi & site base corporate blue branding) */}
        <section className="bg-primary text-white pt-28 pb-20 md:pt-36 md:pb-24 px-4 md:px-8 relative overflow-hidden border-b-4 border-[#fbbf24] mb-12">
          {/* Background Image /images/header.jpg with Opacity & Mix-Blend Overlay */}
          <div className="absolute inset-0 z-0 pointer-events-none">
            <Image
              src="/images/header.jpg"
              alt="Header Background"
              fill
              priority
              sizes="100vw"
              className="object-cover object-center opacity-25 mix-blend-overlay"
            />
          </div>

          <div className="max-w-[1400px] mx-auto relative z-10">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs md:text-sm font-medium text-blue-200 mb-4">
              <Link href="/" className="hover:text-white transition-colors">Beranda</Link>
              <span>&gt;</span>
              <span className="text-white font-semibold">Perpustakaan</span>
            </div>

            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
              <div className="max-w-3xl">
                <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight leading-tight mb-3 drop-shadow-md">
                  PROFIL PERPUSTAKAAN
                </h1>
                <h2 className="text-lg md:text-2xl font-bold text-yellow-300 tracking-wide mb-4 drop-shadow-sm">
                  KANTOR PERWAKILAN BANK INDONESIA PEMATANGSIANTAR
                </h2>
                <p className="text-sm md:text-base text-blue-100 max-w-2xl leading-relaxed font-medium">
                  Pusat informasi, pengetahuan, pembelajaran, dan literasi bagi pemustaka dalam mendukung pelaksanaan tugas dan fungsi Bank Indonesia.
                </p>
              </div>

              {/* Quick Info Badge Card (Square / Unrounded) */}
              <div className="bg-white/10 border border-white/20 p-6 text-white w-full lg:w-80 shrink-0 shadow-xl space-y-4">
                <div className="flex items-center gap-3 border-b border-white/15 pb-3">
                  <div className="w-10 h-10 bg-yellow-400/20 text-yellow-300 flex items-center justify-center font-bold shrink-0">
                    <i className="fa-solid fa-clock text-lg"></i>
                  </div>
                  <div>
                    <p className="text-[11px] text-blue-200 uppercase font-bold tracking-wider">Jam Operasional</p>
                    <p className="text-xs font-extrabold text-white">Senin – Jumat: 08.00 – 17.00 WIB</p>
                    <p className="text-[10px] text-yellow-300 font-semibold mt-0.5">Sabtu, Minggu & Hari Libur: Tutup</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-400/20 text-blue-300 flex items-center justify-center font-bold shrink-0">
                    <i className="fa-solid fa-location-dot text-lg"></i>
                  </div>
                  <div>
                    <p className="text-[11px] text-blue-200 uppercase font-bold tracking-wider">Lokasi</p>
                    <p className="text-xs font-bold text-white">Lantai 3 Gedung KPw BI Pematangsiantar</p>
                    <p className="text-[11px] text-blue-200/80">Jl. H. Adam Malik No. 1, Pematangsiantar</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* MAIN CONTENT CONTAINER */}
        <div className="relative z-10 max-w-[1400px] mx-auto px-4 md:px-8 space-y-16">
          
          {/* SECTION 1: GAMBARAN UMUM & FOTO PROFIL PERPUSTAKAAN */}
          <section className="bg-white/95 backdrop-blur-sm p-6 md:p-10 shadow-[0_10px_30px_rgba(0,51,102,0.06)] border border-blue-100/80 animate-on-scroll">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              
              {/* Featured Image Column */}
              <div className="lg:col-span-5">
                <div className="relative w-full h-[320px] md:h-[420px] overflow-hidden shadow-2xl border-4 border-white group">
                  <Image
                    src="/images/perpustakaan/image.jpeg"
                    alt="Perpustakaan KPw Bank Indonesia Pematangsiantar"
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 40vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#003366]/80 via-transparent to-transparent opacity-80"></div>
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <span className="bg-yellow-500 text-primary text-[10px] font-black px-2.5 py-1 uppercase tracking-wider mb-1 inline-block">
                      Fasilitas Ruang Baca
                    </span>
                    <p className="text-xs md:text-sm font-bold leading-snug drop-shadow-md">
                      Perpustakaan KPw Bank Indonesia Pematangsiantar
                    </p>
                  </div>
                </div>
              </div>

              {/* Text Description Column */}
              <div className="lg:col-span-7 space-y-4 text-gray-700">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-primary text-xs font-bold border border-blue-100">
                  <i className="fa-solid fa-building-columns"></i> Pusat Informasi & Literasi
                </div>
                <h2 className="text-2xl md:text-3xl font-extrabold text-[#003366] tracking-tight leading-tight">
                  Tentang Perpustakaan BI Pematangsiantar
                </h2>
                
                <p className="text-sm md:text-base leading-relaxed text-gray-600">
                  Perpustakaan Kantor Perwakilan Bank Indonesia Pematangsiantar berada di Jl. H. Adam Malik No. 1, Kota Pematangsiantar, Sumatera Utara. Perpustakaan berada di lantai 3 Gedung Kantor Perwakilan Bank Indonesia Pematangsiantar. Dengan Jam Operasional Senin–Jumat 08.00 –17.00 WIB Sabtu, Minggu & Hari Libur Nasional Tutup. Pemustaka dapat memanfaatkan fasilitas dan layanan perpustakaan selama jam operasional dengan tetap mengikuti ketentuan layanan yang berlaku.
                </p>
                <p className="text-sm md:text-base leading-relaxed text-gray-600">
                  Perpustakaan Kantor Perwakilan Bank Indonesia Pematangsiantar merupakan bagian dari ekosistem Perpustakaan Bank Indonesia yang hadir sebagai pusat informasi, pengetahuan, pembelajaran, dan literasi bagi pemustaka. Perpustakaan berperan dalam mendukung pelaksanaan tugas dan fungsi Bank Indonesia melalui penyediaan berbagai sumber informasi, koleksi, layanan, serta kegiatan literasi yang relevan dan berkualitas.
                </p>
                <p className="text-sm md:text-base leading-relaxed text-gray-600">
                  Sebagai perpustakaan khusus, koleksi dan layanan Perpustakaan Bank Indonesia Pematangsiantar dikembangkan untuk memenuhi kebutuhan informasi terkait bidang kebanksentralan, khususnya ekonomi moneter, stabilitas sistem keuangan, sistem pembayaran dan pengelolaan uang Rupiah, serta berbagai bidang pendukung seperti ekonomi, keuangan, hukum, manajemen, teknologi, pengembangan diri, dan pengetahuan umum. Tidak hanya menjadi tempat untuk membaca dan meminjam buku, perpustakaan hadir sebagai ruang belajar, pusat referensi, sarana riset, ruang berbagi pengetahuan, serta wadah interaksi dan pengembangan kompetensi bagi pemustaka.
                </p>
              </div>

            </div>
          </section>

          {/* SECTION 2: VISI & MISI */}
          <section className="space-y-6 animate-on-scroll">
            <div className="text-center max-w-2xl mx-auto">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-primary/10 text-primary text-xs font-bold mb-2 border border-primary/20">
                <i className="fa-solid fa-compass"></i> Arah &amp; Tujuan
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-[#003366]">Visi dan Misi Perpustakaan</h2>
              <p className="text-xs md:text-sm text-gray-500 mt-1">Landasan utama pengelolaan dan pelayanan Perpustakaan Bank Indonesia Pematangsiantar.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Card Visi */}
              <div className="bg-gradient-to-br from-[#003366] to-[#00264d] p-8 text-white shadow-xl relative overflow-hidden flex flex-col justify-between group border border-blue-800">
                <div className="absolute top-0 right-0 p-8 text-white/5 group-hover:text-white/10 transition-colors pointer-events-none">
                  <i className="fa-solid fa-eye text-9xl"></i>
                </div>
                <div className="relative z-10 space-y-4">
                  <div className="w-12 h-12 bg-yellow-400 text-primary flex items-center justify-center text-xl font-black shadow-lg">
                    <i className="fa-solid fa-eye"></i>
                  </div>
                  <h3 className="text-2xl font-black text-yellow-400 tracking-wide">VISI</h3>
                  <blockquote className="text-sm md:text-base leading-relaxed text-blue-50/95 italic font-medium border-l-4 border-yellow-400 pl-4 py-1">
                    “Menjadi pusat referensi dan informasi di bidang moneter, Stabilitas Sistem Keuangan (SSK), serta Sistem Pembayaran dan Pengelolaan Uang Rupiah (SP-PUR) terlengkap di Indonesia berbasis Teknologi Informasi dan Komunikasi.”
                  </blockquote>
                </div>
              </div>

              {/* Card Misi */}
              <div className="bg-gradient-to-br from-white to-blue-50/80 p-8 text-gray-800 shadow-lg border border-blue-100 flex flex-col justify-between group hover:border-primary/40 transition-colors">
                <div className="space-y-4">
                  <div className="w-12 h-12 bg-primary text-white flex items-center justify-center text-xl font-black shadow-lg">
                    <i className="fa-solid fa-bullseye"></i>
                  </div>
                  <h3 className="text-2xl font-black text-[#003366] tracking-wide">MISI</h3>
                  <blockquote className="text-sm md:text-base leading-relaxed text-gray-700 font-medium border-l-4 border-primary pl-4 py-1">
                    “Mendukung kebijakan Bank Indonesia dalam meningkatkan kualitas dan kompetensi sumber daya manusia berbasis pengetahuan melalui ketersediaan ragam koleksi perpustakaan yang dikelola secara profesional serta pelayanan prima yang diperkuat dengan pemanfaatan Teknologi Informasi dan Komunikasi.”
                  </blockquote>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 3: KOLEKSI & STATISTIK */}
          <section className="bg-[#003366] p-8 md:p-12 text-white shadow-2xl relative overflow-hidden animate-on-scroll">
            <div className="absolute right-0 bottom-0 pointer-events-none opacity-10">
              <i className="fa-solid fa-book-bookmark text-[250px] text-white"></i>
            </div>

            <div className="relative z-10 max-w-3xl mb-10 space-y-3">
              <span className="text-yellow-400 text-xs font-extrabold uppercase tracking-widest">Koleksi Terkini</span>
              <h2 className="text-2xl md:text-4xl font-extrabold text-white tracking-tight">Koleksi Perpustakaan Bank Indonesia</h2>
              <p className="text-sm md:text-base text-blue-100/90 leading-relaxed">
                Sebagai perpustakaan khusus, Perpustakaan Bank Indonesia Pematangsiantar menyediakan koleksi yang dikembangkan sesuai kebutuhan informasi pemustaka dan mendukung bidang tugas Bank Indonesia. Koleksi tersebut terus dikembangkan secara berkala agar tetap relevan, mutakhir, dan sesuai dengan kebutuhan informasi pemustaka.
              </p>
            </div>

            {/* Stats Counter Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 relative z-10">
              {stats.map((item, idx) => (
                <div key={idx} className="bg-white/10 p-5 border border-white/15 text-center flex flex-col items-center justify-center hover:bg-white/15 transition-all">
                  <div className="w-10 h-10 bg-yellow-400/20 text-yellow-300 flex items-center justify-center text-lg mb-3">
                    <i className={item.icon}></i>
                  </div>
                  <span className="text-2xl md:text-4xl font-black text-yellow-400 tracking-tight mb-1">{item.number}</span>
                  <span className="text-xs font-semibold text-blue-100">{item.label}</span>
                </div>
              ))}
            </div>
          </section>

          {/* SECTION 4: LAYANAN DIGITAL iBI LIBRARY */}
          <section className="bg-gradient-to-r from-blue-900 via-[#003366] to-indigo-900 p-8 md:p-12 text-white shadow-2xl border border-blue-700/50 relative overflow-hidden animate-on-scroll">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
              <div className="lg:col-span-8 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-400/20 text-yellow-300 text-xs font-bold border border-yellow-400/30">
                  <i className="fa-solid fa-laptop-code"></i> Perpustakaan Digital
                </div>
                <h2 className="text-2xl md:text-4xl font-extrabold text-white tracking-tight">
                  Akses Digital iBI Library
                </h2>
                <p className="text-sm md:text-base text-blue-100/90 leading-relaxed">
                  Sejalan dengan perkembangan teknologi dan kebutuhan masyarakat terhadap akses informasi yang cepat dan fleksibel, Perpustakaan Bank Indonesia juga menyediakan akses terhadap koleksi digital. Salah satu layanan yang dapat dimanfaatkan adalah <strong>iBI Library</strong>, yaitu layanan perpustakaan digital yang memungkinkan masyarakat mengakses berbagai koleksi buku elektronik melalui perangkat digital. Koleksi digital tersebut mencakup berbagai bidang, seperti ekonomi, perbankan, kebijakan moneter, keuangan, manajemen, pengembangan diri, dan berbagai referensi pendukung lainnya.
                </p>
                <p className="text-sm md:text-base text-blue-100/80 leading-relaxed">
                  Layanan digital ini dapat diakses secara umum sehingga masyarakat dapat memanfaatkan sumber informasi perpustakaan kapan saja dan dari mana saja sesuai dengan ketentuan layanan yang berlaku. Perpustakaan Kantor Perwakilan Bank Indonesia Pematangsiantar terus mengembangkan layanan yang tidak hanya berorientasi pada penyediaan koleksi, tetapi juga pada pengalaman dan kebutuhan pemustaka.
                </p>
              </div>

              {/* CTA Action Box */}
              <div className="lg:col-span-4 bg-white/10 p-6 border border-white/20 flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 bg-yellow-400 text-primary flex items-center justify-center text-3xl font-black shadow-lg">
                  <i className="fa-solid fa-book-bookmark"></i>
                </div>
                <h3 className="text-lg font-bold text-white">iBI Library Access</h3>
                <p className="text-xs text-blue-100/80">Login ke portal web iBI Library untuk membaca e-book pilihan secara langsung.</p>
                <a
                  href="https://web-ibilibrary.moco.co.id/login"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 px-6 bg-yellow-400 hover:bg-yellow-300 text-primary font-extrabold text-sm transition-all shadow-xl hover:shadow-2xl flex items-center justify-center gap-2 border-b-4 border-yellow-600 active:border-b-0 active:translate-y-1"
                >
                  <span>Akses iBI Library</span>
                  <i className="fa-solid fa-up-right-from-square text-xs"></i>
                </a>
                <span className="text-[10px] text-blue-200/70 truncate max-w-full">https://web-ibilibrary.moco.co.id/login</span>
              </div>
            </div>
          </section>

          {/* SECTION 5: PROGRAM LITERASI & KEGIATAN UNGGULAN */}
          <section className="space-y-8">
            <div className="text-center max-w-3xl mx-auto space-y-2">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-primary/10 text-primary text-xs font-bold border border-primary/20">
                <i className="fa-solid fa-calendar-star"></i> Program & Kegiatan
              </div>
              <h2 className="text-2xl md:text-4xl font-extrabold text-[#003366]">
                Kegiatan & Program Literasi Edukatif
              </h2>
              <p className="text-xs md:text-sm text-gray-500">
                Perpustakaan KPw BI Pematangsiantar menghadirkan berbagai kegiatan kreatif dan edukatif untuk meningkatkan interaksi serta memperluas manfaat bagi pemustaka.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {programs.map((prog, idx) => (
                <div
                  key={idx}
                  className="bg-white/95 backdrop-blur-sm p-6 border border-blue-100/80 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className={`w-12 h-12 bg-gradient-to-br ${prog.color} text-white flex items-center justify-center text-xl font-bold shadow-md`}>
                        <i className={prog.icon}></i>
                      </div>
                      <span className="text-[11px] font-bold text-primary bg-blue-50 border border-blue-100 px-3 py-1">
                        {prog.badge}
                      </span>
                    </div>

                    <h3 className="text-lg md:text-xl font-extrabold text-[#003366] group-hover:text-primary transition-colors">
                      {prog.title}
                    </h3>

                    <p className="text-xs md:text-sm text-gray-600 leading-relaxed">
                      {prog.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* SECTION 6: PENUTUP / HIGHLIGHT BANNER */}
          <section className="bg-gradient-to-r from-white via-blue-50/50 to-blue-100/50 p-8 md:p-12 border border-blue-200/70 shadow-lg text-center relative overflow-hidden">
            <div className="max-w-4xl mx-auto space-y-6 relative z-10">
              <div className="w-16 h-16 bg-primary text-yellow-400 flex items-center justify-center text-3xl font-black mx-auto shadow-md">
                <i className="fa-solid fa-graduation-cap"></i>
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-[#003366]">
                Ruang Untuk Belajar, Tumbuh, dan Berbagi Pengetahuan
              </h2>
              <p className="text-sm md:text-base text-gray-700 leading-relaxed font-medium">
                “Dengan koleksi yang beragam, akses informasi digital, kegiatan literasi yang interaktif, serta lingkungan yang mendukung proses belajar, perpustakaan menjadi ruang bagi siapa saja untuk membaca, belajar, mencari informasi, berbagi pengetahuan, dan mengembangkan diri.”
              </p>
              
              <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
                <a
                  href="https://instagram.com/perpusbipematangsiantar"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 bg-primary text-white font-bold text-sm hover:bg-blue-900 transition-colors shadow-md flex items-center gap-2"
                >
                  <i className="fa-brands fa-instagram text-lg"></i> Follow Instagram @perpusbipematangsiantar
                </a>
                <Link
                  href="/edukasi/materi-edukasi"
                  className="px-6 py-3 bg-white text-primary font-bold text-sm border border-blue-200 hover:bg-blue-50 transition-colors flex items-center gap-2"
                >
                  <i className="fa-solid fa-book-open"></i> Jelajahi Materi Edukasi
                </Link>
              </div>
            </div>
          </section>

        </div>
      </main>

      <Footer />
    </div>
  );
}
