import Link from 'next/link';

export default function Header() {
  return (
    <section className="bg-primary text-white pt-32 pb-24 md:pt-40 md:pb-32 relative overflow-hidden">
      <div className="max-w-[1200px] mx-auto px-4 md:px-8 relative z-10 text-center">
        <div className="flex items-center justify-center gap-2 text-sm text-blue-200 mb-6 font-medium">
          <Link href="/" className="hover:text-white transition-colors">Beranda</Link>
          <span className="text-[10px]">&gt;</span>
          <span className="cursor-default">Edukasi</span>
          <span className="text-[10px]">&gt;</span>
          <span className="text-white">Pengajuan Kegiatan</span>
        </div>
        
        <h1 className="text-3xl md:text-5xl font-extrabold mb-5 tracking-tight">Ajukan Kegiatan Edukasi</h1>
        <p className="text-blue-100/90 max-w-2xl mx-auto text-base md:text-lg leading-relaxed">
          Ajukan permintaan kegiatan edukasi atau sosialisasi yang akan diadakan oleh Bank Indonesia di instansi Anda.
        </p>
      </div>
      
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-[0.07] pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-[30rem] h-[30rem] bg-white rounded-full blur-[120px] translate-x-1/3 translate-y-1/3"></div>
      </div>
    </section>
  );
}
