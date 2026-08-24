'use client';

import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Image from 'next/image';
import Link from 'next/link';

export default function PerpustakaanPage() {
  const libraryResources = [
    {
      title: 'Katalog Digital BI Institute',
      desc: 'Akses ribuan koleksi literatur ekonomi, moneter, perbankan, dan kebanksentralan dari Perpustakaan Bank Indonesia.',
      icon: 'fa-solid fa-book-journal-whills',
      tag: 'Katalog Online',
      link: 'https://www.bi.go.id/id/bi-institute/perpustakaan/default.aspx',
    },
    {
      title: 'E-Journal Kebanksentralan',
      desc: 'Kumpulan jurnal ilmiah dan publikasi hasil riset ekonomi keuangan terkini dari para ahli dan peneliti Bank Indonesia.',
      icon: 'fa-solid fa-graduation-cap',
      tag: 'Publikasi Ilmiah',
      link: 'https://www.bi.go.id/id/bi-institute/perpustakaan/default.aspx',
    },
    {
      title: 'Laporan Kebijakan Moneter',
      desc: 'Dokumen dan laporan analisis perkembangan ekonomi macroprudential, sistem pembayaran, serta stabilitas keuangan nasional.',
      icon: 'fa-solid fa-file-invoice-dollar',
      tag: 'Laporan Resmi',
      link: 'https://www.bi.go.id/id/fungsi-utama/moneter/default.aspx',
    },
    {
      title: 'Pojok Baca & BI Corner',
      desc: 'Fasilitas pojok baca interaktif yang disediakan Bank Indonesia Pematangsiantar di berbagai universitas dan perpustakaan daerah.',
      icon: 'fa-solid fa-building-columns',
      tag: 'Fasilitas Fisik',
      link: '/edukasi/mitra',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-gray-800 font-sans">
      <Navbar />

      <main className="flex-grow pt-24 pb-16 relative overflow-hidden">
        {/* Decorative Background Element 2.png (75% opacity) */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <Image
            src="/images/element/2.png"
            alt="Background Element"
            fill
            className="object-cover opacity-75"
            priority
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 lg:px-8">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-[#001f3f] via-[#003366] to-[#004080] rounded-3xl p-8 md:p-12 text-white shadow-2xl relative overflow-hidden mb-12">
            <div className="absolute -right-12 -bottom-12 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="max-w-2xl relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-xs font-bold text-yellow-300 uppercase tracking-wider mb-4">
                <i className="fa-solid fa-book-bookmark text-yellow-400"></i> Literasi Kebanksentralan
              </div>
              <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight leading-tight mb-4">
                Perpustakaan Bank Indonesia
              </h1>
              <p className="text-sm md:text-base text-blue-100/90 leading-relaxed mb-6">
                Pusat referensi riset, jurnal kebanksentralan, dan buku literasi keuangan resmi KPw Bank Indonesia Pematangsiantar & BI Institute.
              </p>
              
              <div className="flex flex-wrap items-center gap-3">
                <a
                  href="https://www.bi.go.id/id/bi-institute/perpustakaan/default.aspx"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-accent-yellow hover:bg-yellow-400 text-primary font-extrabold px-6 py-3 rounded-xl text-sm transition-all shadow-lg hover:shadow-xl flex items-center gap-2 border-b-4 border-yellow-600 active:translate-y-0.5 active:border-b-0"
                >
                  <span>Kunjungi E-Library BI</span>
                  <i className="fa-solid fa-up-right-from-square text-xs"></i>
                </a>
                <Link
                  href="/edukasi/materi-edukasi"
                  className="bg-white/10 hover:bg-white/20 text-white font-bold px-6 py-3 rounded-xl text-sm backdrop-blur-md border border-white/20 transition-all flex items-center gap-2"
                >
                  <i className="fa-solid fa-folder-open"></i> Materi Edukasi BI
                </Link>
              </div>
            </div>
          </div>

          {/* Grid Resources */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Katalog & Layanan Perpustakaan</h2>
                <p className="text-sm text-gray-500 mt-1">Temukan berbagai sumber bahan bacaan dan hasil studi kebanksentralan.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {libraryResources.map((res, index) => (
                <div
                  key={index}
                  className="bg-white/90 backdrop-blur-md rounded-2xl p-6 border border-gray-200/80 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-blue-50 text-primary flex items-center justify-center text-xl font-bold group-hover:bg-primary group-hover:text-white transition-colors">
                        <i className={res.icon}></i>
                      </div>
                      <span className="text-[11px] font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                        {res.tag}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors">
                      {res.title}
                    </h3>
                    <p className="text-xs text-gray-600 leading-relaxed mb-6">
                      {res.desc}
                    </p>
                  </div>

                  <a
                    href={res.link}
                    target={res.link.startsWith('http') ? '_blank' : '_self'}
                    rel={res.link.startsWith('http') ? 'noopener noreferrer' : ''}
                    className="w-full py-2.5 px-4 bg-slate-100 hover:bg-primary hover:text-white text-gray-700 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 group-hover:shadow-md"
                  >
                    <span>Akses Layanan</span>
                    <i className="fa-solid fa-arrow-right text-[10px]"></i>
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
