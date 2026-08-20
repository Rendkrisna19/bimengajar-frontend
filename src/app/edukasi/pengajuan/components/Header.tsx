import Link from 'next/link';

export default function Header() {
  return (
    <section className="bg-primary text-white pt-32 pb-24 md:pt-40 md:pb-32 relative overflow-hidden border-b-4 border-[#fbbf24]">
      {/* Background Image /images/header.jpg with 20% Opacity */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <img
          src="/images/header.jpg"
          alt="Header Background"
          className="w-full h-full object-cover object-center opacity-20 mix-blend-overlay"
        />
      </div>

      <div className="max-w-[1200px] mx-auto px-4 md:px-8 relative z-10 text-center">
        <div className="flex items-center justify-center gap-2 text-sm text-blue-200 mb-6 font-medium">
          <Link href="/" className="hover:text-white transition-colors">Beranda</Link>
          <span className="text-[10px]">&gt;</span>
          <Link href="/edukasi" className="hover:text-white transition-colors">Edukasi</Link>
          <span className="text-[10px]">&gt;</span>
          <span className="text-white font-semibold">Pengajuan Kegiatan</span>
        </div>
        
        <h1 className="text-3xl md:text-5xl font-extrabold mb-5 tracking-tight drop-shadow-md">Ajukan Kegiatan Edukasi</h1>
        <p className="text-blue-100/95 max-w-2xl mx-auto text-base md:text-lg leading-relaxed font-medium drop-shadow-sm">
          Ajukan permintaan kegiatan edukasi atau sosialisasi yang akan diadakan oleh Bank Indonesia di instansi Anda.
        </p>
      </div>
    </section>
  );
}
