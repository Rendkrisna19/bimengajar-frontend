import Image from 'next/image';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-white text-[#003366] pt-16 pb-8 border-t border-gray-100 relative overflow-hidden">
      {/* Background Texture Element */}
      <div 
        className="absolute inset-0 w-full h-full opacity-5 pointer-events-none mix-blend-multiply bg-repeat"
        style={{ backgroundImage: 'url(/images/element/3.png)', backgroundSize: '500px' }}
      ></div>

      <div className="max-w-[1400px] mx-auto px-4 md:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12 mb-12">
          
          {/* Logo & Tagline */}
          <div className="lg:col-span-1 flex flex-col gap-4">
            <Link href="/" className="flex flex-col items-start shrink-0 group">
              <div className="h-24 w-auto flex items-center justify-start py-2">
                <Image 
                  src="/images/logo.png?v=2" 
                  alt="Logo BI Mengajar" 
                  width={300} 
                  height={100} 
                  className="h-full w-auto object-contain scale-[1.6] origin-left transition-transform group-hover:scale-[1.7]" 
                  priority
                  unoptimized
                />
              </div>
              <span className="text-[11px] font-extrabold text-[#003366] tracking-tight mt-2 leading-none" style={{ fontFamily: 'var(--font-plus-jakarta)' }}>
                by Kantor Perwakilan Bank Indonesia Pematangsiantar
              </span>
            </Link>
            <p className="text-gray-600 text-sm leading-relaxed mt-1">
              Mewujudkan masyarakat yang Cinta, Bangga, dan Paham Rupiah melalui edukasi yang berkelanjutan.
            </p>
          </div>

          {/* Tautan */}
          <div>
            <h3 className="font-bold text-lg mb-6 text-[#003366] tracking-wide">Tautan</h3>
            <ul className="flex flex-col gap-3">
              <li><Link href="/" className="text-gray-600 hover:text-primary transition-colors text-sm font-medium">Beranda</Link></li>
              <li><Link href="/tentang-kami" className="text-gray-600 hover:text-primary transition-colors text-sm font-medium">Tentang Kami</Link></li>
              <li><Link href="/edukasi" className="text-gray-600 hover:text-primary transition-colors text-sm font-medium">Edukasi</Link></li>
              <li><Link href="/titik-temu" className="text-gray-600 hover:text-primary transition-colors text-sm font-medium">Pojok Koin</Link></li>
              <li><Link href="/berita" className="text-gray-600 hover:text-primary transition-colors text-sm font-medium">Aktivitas</Link></li>
            </ul>
          </div>

          {/* Bantuan */}
          <div>
            <h3 className="font-bold text-lg mb-6 text-[#003366] tracking-wide">Bantuan</h3>
            <ul className="flex flex-col gap-3">
              <li><Link href="/faq" className="text-gray-600 hover:text-primary transition-colors text-sm font-medium">FAQ</Link></li>
              <li><Link href="/panduan" className="text-gray-600 hover:text-primary transition-colors text-sm font-medium">Panduan</Link></li>
              <li><Link href="/kebijakan-privasi" className="text-gray-600 hover:text-primary transition-colors text-sm font-medium">Kebijakan Privasi</Link></li>
              <li><Link href="/syarat-ketentuan" className="text-gray-600 hover:text-primary transition-colors text-sm font-medium">Syarat & Ketentuan</Link></li>
            </ul>
          </div>

          {/* Kontak */}
          <div>
            <h3 className="font-bold text-lg mb-6 text-[#003366] tracking-wide">Kontak</h3>
            <ul className="flex flex-col gap-4">
              <li className="flex items-start gap-3 text-gray-600">
                <i className="fa-solid fa-location-dot mt-1 text-primary"></i>
                <span className="text-sm leading-relaxed">Jl. M.H. Thamrin No. 2<br />Jakarta 10350</span>
              </li>
              <li className="flex items-center gap-3 text-gray-600">
                <i className="fa-solid fa-phone text-primary"></i>
                <span className="text-sm">(021) 3861 811</span>
              </li>
              <li className="flex items-center gap-3 text-gray-600">
                <i className="fa-solid fa-envelope text-primary"></i>
                <span className="text-sm">bi@bi.go.id</span>
              </li>
            </ul>
          </div>

          {/* Ikuti Kami */}
          <div>
            <h3 className="font-bold text-lg mb-6 text-[#003366] tracking-wide">Ikuti Kami</h3>
            <div className="flex items-center gap-4">
              <a href="#" aria-label="Kunjungi Instagram Bank Indonesia" className="w-10 h-10 rounded-full bg-[#f0f4f8] flex items-center justify-center text-[#003366] hover:bg-primary hover:text-white transition-all duration-300 text-lg shadow-sm border border-gray-100">
                <i className="fa-brands fa-instagram"></i>
              </a>
              <a href="#" aria-label="Kunjungi YouTube Bank Indonesia" className="w-10 h-10 rounded-full bg-[#f0f4f8] flex items-center justify-center text-[#003366] hover:bg-primary hover:text-white transition-all duration-300 text-lg shadow-sm border border-gray-100">
                <i className="fa-brands fa-youtube"></i>
              </a>
              <a href="#" aria-label="Kunjungi Facebook Bank Indonesia" className="w-10 h-10 rounded-full bg-[#f0f4f8] flex items-center justify-center text-[#003366] hover:bg-primary hover:text-white transition-all duration-300 text-lg shadow-sm border border-gray-100">
                <i className="fa-brands fa-facebook-f"></i>
              </a>
              <a href="#" aria-label="Kunjungi Twitter Bank Indonesia" className="w-10 h-10 rounded-full bg-[#f0f4f8] flex items-center justify-center text-[#003366] hover:bg-primary hover:text-white transition-all duration-300 text-lg shadow-sm border border-gray-100">
                <i className="fa-brands fa-x-twitter"></i>
              </a>
              <a href="#" aria-label="Kunjungi TikTok Bank Indonesia" className="w-10 h-10 rounded-full bg-[#f0f4f8] flex items-center justify-center text-[#003366] hover:bg-primary hover:text-white transition-all duration-300 text-lg shadow-sm border border-gray-100">
                <i className="fa-brands fa-tiktok"></i>
              </a>
            </div>
          </div>

        </div>

        {/* Copyright */}
        <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} Bank Indonesia. Hak Cipta Dilindungi.
          </p>
          <div className="flex gap-4">
            <span className="text-gray-500 text-sm font-medium">Indonesia Maju</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
