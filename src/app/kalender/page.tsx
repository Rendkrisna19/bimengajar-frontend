'use client';

import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import KalenderView from '@/components/ui/KalenderView';
import Breadcrumb from '@/components/ui/Breadcrumb';

export default function KalenderPage() {
  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      {/* Hero Banner Section */}
      <section className="bg-primary text-white pt-32 pb-16 relative overflow-hidden">
        {/* Decorative Background */}
        <div className="absolute inset-0 pointer-events-none opacity-10 mix-blend-overlay bg-repeat" style={{ backgroundImage: 'url(/images/element/1.png)', backgroundSize: '300px' }}></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <Breadcrumb items={[{ label: 'Beranda', href: '/' }, { label: 'Jadwal Kegiatan BI' }]} />
          
          <div className="mt-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
                Jadwal Kegiatan BI
              </h1>
              <p className="text-blue-100 text-base md:text-lg mt-3 max-w-2xl font-medium">
                Agenda lengkap dan jadwal pelaksanaan kegiatan edukasi kebanksentralan Bank Indonesia Pematang Siantar.
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 flex items-center gap-4 shrink-0">
              <div className="w-12 h-12 rounded-xl bg-accent-yellow text-primary flex items-center justify-center font-bold text-xl shadow-md">
                <i className="fa-solid fa-calendar-days"></i>
              </div>
              <div>
                <div className="text-xs text-blue-200 font-semibold uppercase">Agenda Terjadwal</div>
                <div className="text-lg font-bold">Setiap Bulan</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Calendar Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 w-full flex-1 -mt-8 relative z-20">
        <KalenderView />
      </section>

      <Footer />
    </main>
  );
}
