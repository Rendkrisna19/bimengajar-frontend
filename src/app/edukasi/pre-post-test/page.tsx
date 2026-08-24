'use client';

import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Image from 'next/image';
import Link from 'next/link';

export default function PrePostTestPage() {
  const tests = [
    {
      title: 'Pre-Test Literasi Keuangan & Cinta Rupiah',
      desc: 'Uji pemahaman awal Anda mengenai Bank Indonesia, ciri keaslian Rupiah, dan transaksi pembayaran non-tunai sebelum mengikuti sesi edukasi.',
      type: 'Pre-Test',
      icon: 'fa-solid fa-clipboard-question',
      badgeColor: 'bg-blue-100 text-blue-800',
      link: '/user/dashboard/kuis',
    },
    {
      title: 'Post-Test Evaluasi Kegiatan BI Mengajar',
      desc: 'Evaluasi peningkatan pemahaman Anda setelah menyelesaikan materi edukasi BI Mengajar dan dapatkan sertifikat apresiasi partisipasi.',
      type: 'Post-Test',
      icon: 'fa-solid fa-square-check',
      badgeColor: 'bg-emerald-100 text-emerald-800',
      link: '/user/dashboard/kuis',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-gray-800 font-sans">
      <Navbar />

      <main className="flex-grow pt-24 pb-16 relative overflow-hidden">
        {/* Decorative Background Element 1.png (75% opacity) */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <Image
            src="/images/element/1.png"
            alt="Background Element"
            fill
            className="object-cover opacity-75"
            priority
          />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 lg:px-8">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-bold text-primary uppercase tracking-wider mb-3">
              <i className="fa-solid fa-list-check"></i> Evaluasi Pembelajaran
            </span>
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight mb-3">
              Pre / Post Test BI Mengajar
            </h1>
            <p className="text-sm text-gray-600 leading-relaxed">
              Silakan selesaikan tes di bawah ini untuk mengukur pemahaman materi Cinta, Bangga, dan Paham Rupiah.
            </p>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {tests.map((test, index) => (
              <div
                key={index}
                className="bg-white/90 backdrop-blur-md rounded-3xl p-8 border border-gray-200/80 shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-primary text-white flex items-center justify-center text-2xl shadow-md">
                      <i className={test.icon}></i>
                    </div>
                    <span className={`text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider ${test.badgeColor}`}>
                      {test.type}
                    </span>
                  </div>

                  <h2 className="text-xl font-bold text-gray-900 mb-3">{test.title}</h2>
                  <p className="text-xs md:text-sm text-gray-600 leading-relaxed mb-8">
                    {test.desc}
                  </p>
                </div>

                <Link
                  href={test.link}
                  className="w-full py-3.5 px-6 bg-primary hover:bg-blue-900 text-white font-bold text-sm rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 border-b-4 border-yellow-500 active:border-b-0 active:translate-y-0.5"
                >
                  <span>Mulai Tes Sekarang</span>
                  <i className="fa-solid fa-arrow-right text-xs text-yellow-400"></i>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
