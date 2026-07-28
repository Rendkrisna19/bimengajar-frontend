import Link from 'next/link';

export default function Header() {
  return (
    <section className="bg-primary text-white pt-32 pb-24 md:pt-40 md:pb-32 relative overflow-hidden">
      <div className="max-w-[1200px] mx-auto px-4 md:px-8 relative z-10 text-center">
        <div className="flex items-center justify-center gap-2 text-sm text-blue-200 mb-6 font-medium">
          <Link href="/" className="hover:text-white transition-colors">Beranda</Link>
          <span className="text-[10px]">&gt;</span>
          <Link href="/edukasi" className="hover:text-white transition-colors">Edukasi</Link>
          <span className="text-[10px]">&gt;</span>
          <span className="text-white">Pengajuan Kegiatan</span>
        </div>
        
        <h1 className="text-3xl md:text-5xl font-extrabold mb-5 tracking-tight">Ajukan Kegiatan Edukasi</h1>
        <p className="text-blue-100/90 max-w-2xl mx-auto text-base md:text-lg leading-relaxed">
          Ajukan permintaan kegiatan edukasi atau sosialisasi yang akan diadakan oleh Bank Indonesia di instansi Anda.
        </p>
      </div>
      
      {/* Background Elements & Scattered Motif Songket */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2 opacity-[0.07]"></div>
        <div className="absolute bottom-0 right-0 w-[30rem] h-[30rem] bg-white rounded-full blur-[120px] translate-x-1/3 translate-y-1/3 opacity-[0.07]"></div>
        
        {/* Scattered Songket Stars (Bright Colors) */}
        {/* Motif 1: Middle Center (Besar, transparan) */}
        <svg className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] text-white opacity-5" viewBox="0 0 40 40" fill="currentColor">
          <path d="M20 0 L24 10 L34 6 L28 16 L40 20 L28 24 L34 34 L24 30 L20 40 L16 30 L6 34 L12 24 L0 20 L12 16 L6 6 L16 10 Z"/>
          <path d="M20 12 L28 20 L20 28 L12 20 Z" fill="#003366" />
        </svg>

        {/* Motif 2: Top Right (Gold) */}
        <svg className="absolute top-[15%] right-[15%] w-12 h-12 text-yellow-400 opacity-60 animate-pulse" viewBox="0 0 40 40" fill="currentColor">
          <path d="M20 0 L24 10 L34 6 L28 16 L40 20 L28 24 L34 34 L24 30 L20 40 L16 30 L6 34 L12 24 L0 20 L12 16 L6 6 L16 10 Z"/>
          <path d="M20 14 L26 20 L20 26 L14 20 Z" fill="#003366" />
        </svg>

        {/* Motif 3: Bottom Left (Cyan/Light Blue) */}
        <svg className="absolute bottom-[20%] left-[10%] w-10 h-10 text-cyan-400 opacity-70" viewBox="0 0 40 40" fill="currentColor">
          <path d="M20 0 L24 10 L34 6 L28 16 L40 20 L28 24 L34 34 L24 30 L20 40 L16 30 L6 34 L12 24 L0 20 L12 16 L6 6 L16 10 Z"/>
          <path d="M20 14 L26 20 L20 26 L14 20 Z" fill="#003366" />
        </svg>
      </div>
    </section>
  );
}
