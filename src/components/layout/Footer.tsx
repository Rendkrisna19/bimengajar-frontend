import Image from 'next/image';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-primary text-white pt-16 pb-8 border-t-4 border-blue-400 relative overflow-hidden">
      {/* Background Texture Element */}
      <div 
        className="absolute inset-0 w-full h-full opacity-10 pointer-events-none mix-blend-overlay bg-repeat"
        style={{ backgroundImage: 'url(/images/element/3.png)', backgroundSize: '500px' }}
      ></div>

      <div className="max-w-[1400px] mx-auto px-4 md:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12 mb-12">
          
          {/* Logo & Tagline */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            <Link href="/">
              <div className="relative w-[220px] h-[60px]">
                <Image 
                  src="/images/logo.png" 
                  alt="Bank Indonesia" 
                  fill 
                  className="object-contain object-left brightness-0 invert" 
                />
              </div>
            </Link>
            <p className="text-blue-100 text-sm leading-relaxed">
              Mewujudkan masyarakat yang Cinta, Bangga, dan Paham Rupiah melalui edukasi yang berkelanjutan.
            </p>
          </div>

          {/* Tautan */}
          <div>
            <h3 className="font-bold text-lg mb-6 text-white tracking-wide">Tautan</h3>
            <ul className="flex flex-col gap-3">
              <li><Link href="/" className="text-blue-100 hover:text-white transition-colors text-sm font-medium">Beranda</Link></li>
              <li><Link href="/tentang-kami" className="text-blue-100 hover:text-white transition-colors text-sm font-medium">Tentang Kami</Link></li>
              <li><Link href="/edukasi" className="text-blue-100 hover:text-white transition-colors text-sm font-medium">Edukasi</Link></li>
              <li><Link href="/titik-temu" className="text-blue-100 hover:text-white transition-colors text-sm font-medium">Pojok Koin</Link></li>
              <li><Link href="/berita" className="text-blue-100 hover:text-white transition-colors text-sm font-medium">Aktivitas</Link></li>
            </ul>
          </div>

          {/* Bantuan */}
          <div>
            <h3 className="font-bold text-lg mb-6 text-white tracking-wide">Bantuan</h3>
            <ul className="flex flex-col gap-3">
              <li><Link href="/faq" className="text-blue-100 hover:text-white transition-colors text-sm font-medium">FAQ</Link></li>
              <li><Link href="/panduan" className="text-blue-100 hover:text-white transition-colors text-sm font-medium">Panduan</Link></li>
              <li><Link href="/kebijakan-privasi" className="text-blue-100 hover:text-white transition-colors text-sm font-medium">Kebijakan Privasi</Link></li>
              <li><Link href="/syarat-ketentuan" className="text-blue-100 hover:text-white transition-colors text-sm font-medium">Syarat & Ketentuan</Link></li>
            </ul>
          </div>

          {/* Kontak */}
          <div>
            <h3 className="font-bold text-lg mb-6 text-white tracking-wide">Kontak</h3>
            <ul className="flex flex-col gap-4">
              <li className="flex items-start gap-3 text-blue-100">
                <i className="fa-solid fa-location-dot mt-1 text-blue-300"></i>
                <span className="text-sm leading-relaxed">Jl. M.H. Thamrin No. 2<br />Jakarta 10350</span>
              </li>
              <li className="flex items-center gap-3 text-blue-100">
                <i className="fa-solid fa-phone text-blue-300"></i>
                <span className="text-sm">(021) 3861 811</span>
              </li>
              <li className="flex items-center gap-3 text-blue-100">
                <i className="fa-solid fa-envelope text-blue-300"></i>
                <span className="text-sm">bi@bi.go.id</span>
              </li>
            </ul>
          </div>

          {/* Ikuti Kami */}
          <div>
            <h3 className="font-bold text-lg mb-6 text-white tracking-wide">Ikuti Kami</h3>
            <div className="flex items-center gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white hover:text-primary transition-all duration-300 text-lg">
                <i className="fa-brands fa-instagram"></i>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white hover:text-primary transition-all duration-300 text-lg">
                <i className="fa-brands fa-youtube"></i>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white hover:text-primary transition-all duration-300 text-lg">
                <i className="fa-brands fa-facebook-f"></i>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white hover:text-primary transition-all duration-300 text-lg">
                <i className="fa-brands fa-x-twitter"></i>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white hover:text-primary transition-all duration-300 text-lg">
                <i className="fa-brands fa-tiktok"></i>
              </a>
            </div>
          </div>

        </div>

        {/* Copyright */}
        <div className="border-t border-white/20 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-blue-200 text-sm">
            &copy; {new Date().getFullYear()} Bank Indonesia. Hak Cipta Dilindungi.
          </p>
          <div className="flex gap-4">
            <span className="text-blue-200 text-sm">Indonesia Maju</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
