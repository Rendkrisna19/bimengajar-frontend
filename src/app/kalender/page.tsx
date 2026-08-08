'use client';

import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import KalenderView from '@/components/ui/KalenderView';
import PageHeader from '@/components/ui/PageHeader';

export default function KalenderPage() {
  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      {/* Header Section */}
      <PageHeader
        title="Jadwal Kegiatan BI"
        description="Agenda lengkap dan jadwal pelaksanaan kegiatan edukasi kebanksentralan Bank Indonesia Pematangsiantar."
        breadcrumbs={[
          { label: 'Beranda', href: '/' },
          { label: 'Jadwal Kegiatan BI' }
        ]}
      />

      {/* Calendar Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 w-full flex-1 -mt-20 relative z-20">
        <KalenderView />
      </section>

      <Footer />
    </main>
  );
}
