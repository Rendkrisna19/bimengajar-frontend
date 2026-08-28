'use client';

import React, { createContext, useContext, useState } from 'react';

type Lang = 'ID' | 'EN';

interface LanguageContextType {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
}

// Translation dictionary
const translations: Record<string, Record<Lang, string>> = {
  // --- Navbar ---
  'nav.switchLang': { ID: 'Ganti Bahasa', EN: 'Switch Language' },
  'nav.home': { ID: 'Beranda', EN: 'Home' },
  'nav.about': { ID: 'Tentang Kami', EN: 'About Us' },
  'nav.edukasi': { ID: 'Edukasi', EN: 'Education' },
  'nav.pengajuan': { ID: 'Pengajuan kegiatan PLAT-BK', EN: 'Activity Request' },
  'nav.materi': { ID: 'Materi Edukasi', EN: 'Educational Materials' },
  'nav.mitra': { ID: 'Mitra Edukasi', EN: 'Education Partners' },
  'nav.titikTemu': { ID: 'Titik Temu', EN: 'Coin Corner' },
  'nav.aktivitas': { ID: 'Aktivitas', EN: 'Activities' },
  'nav.perpustakaan': { ID: 'Perpustakaan', EN: 'Library' },
  'nav.gameKuis': { ID: 'Game & Kuis', EN: 'Games & Quizzes' },
  'nav.prePostTest': { ID: 'Pre/Post Test PLAT-BK', EN: 'Pre/Post Test PLAT-BK' },
  'nav.login': { ID: 'Masuk', EN: 'Login' },
  'nav.logout': { ID: 'Keluar', EN: 'Logout' },
  'nav.loggedInAs': { ID: 'Masuk sebagai', EN: 'Logged in as' },
  'nav.history': { ID: 'Riwayat Pengajuan', EN: 'Submission History' },
  'nav.dashboard': { ID: 'Dashboard', EN: 'Dashboard' },

  // --- Hero Section ---
  'hero.slide1.title': { ID: 'Cinta, Bangga, Paham Rupiah', EN: 'Love, Pride, Understanding of Rupiah' },
  'hero.slide1.subtitle': {
    ID: 'Uang Rupiah bukan sekadar alat pembayaran, melainkan simbol kedaulatan negara. Bersama PLAT-BK Siantar, kita sebarkan semangat kebanksentralan ke seluruh penjuru daerah.',
    EN: 'Rupiah currency is not merely a means of payment, but a symbol of national sovereignty. Together with PLAT-BK Siantar, we spread the central banking spirit across every region.'
  },
  'hero.slide2.title': { ID: 'Kenali & Pahami\nRupiah Kita', EN: 'Know & Understand\nOur Rupiah' },
  'hero.slide2.subtitle': {
    ID: 'Tingkatkan literasi keuangan dan kenali ciri keaslian Rupiah demi menjaga kedaulatan ekonomi bangsa.',
    EN: 'Improve financial literacy and recognize the authenticity features of the Rupiah to maintain the nation\'s economic sovereignty.'
  },
  'hero.slide3.title': { ID: 'Layanan Penukaran\nUang Logam', EN: 'Coin Exchange\nServices' },
  'hero.slide3.subtitle': {
    ID: 'Gunakan platform Titik Temu untuk menukarkan uang logam dengan mudah dan bantu sirkulasi logam di masyarakat.',
    EN: 'Use the Titik Temu platform to easily exchange coins and help coin circulation in the community.'
  },
  'hero.btnRequest': { ID: 'Ajukan Edukasi', EN: 'Request Education' },
  'hero.btnExplore': { ID: 'Jelajahi Materi', EN: 'Explore Materials' },

  // --- Menu Cepat / Features ---
  'features.title': { ID: 'Menu Cepat', EN: 'Quick Actions' },
  'features.materi': { ID: 'Materi Edukasi', EN: 'Educational Materials' },
  'features.game': { ID: 'Game & Kuis', EN: 'Games & Quizzes' },
  'features.pengajuan': { ID: 'Ajukan Kegiatan', EN: 'Request Activity' },
  'features.mitra': { ID: 'Mitra Edukasi', EN: 'Education Partners' },
  'features.titikTemu': { ID: 'Titik Temu', EN: 'Coin Corner' },
  'features.kalender': { ID: 'Kalender Kegiatan', EN: 'Activity Calendar' },

  // --- About Section & Page ---
  'about.badge': { ID: 'Tentang Kami', EN: 'About Us' },
  'about.defaultTitle': { ID: 'Tentang Bank Indonesia', EN: 'About Bank Indonesia' },
  'about.readMore': { ID: 'Selengkapnya', EN: 'Read More' },
  'about.tab.tentang_bi': { ID: 'Tentang BI', EN: 'About BI' },
  'about.tab.tujuan': { ID: 'Tujuan', EN: 'Objectives' },
  'about.tab.visi_misi': { ID: 'Visi & Misi', EN: 'Vision & Mission' },
  'about.stat1': { ID: 'Bank Sentral Republik Indonesia', EN: 'Central Bank of the Republic of Indonesia' },
  'about.stat2': { ID: 'Berdiri Sejak 1 Juli 1953', EN: 'Established Since July 1, 1953' },
  'about.stat3': { ID: 'Independen dalam Menjalankan Tugas', EN: 'Independent in Executing Duties' },
  'about.stat4': { ID: 'Untuk Stabilitas dan Kesejahteraan Bangsa', EN: 'For National Stability and Prosperity' },
  'about.noImage': { ID: 'Tidak ada gambar', EN: 'No image available' },
  'about.noDataTitle': { ID: 'Data belum tersedia', EN: 'Data not available yet' },
  'about.noDataContent': { ID: 'Admin belum mengisi konten untuk bagian ini.', EN: 'Admin has not filled in content for this section yet.' },

  // --- Map Section ---
  'map.title': { ID: 'Peta Edukasi PLAT-BK', EN: 'PLAT-BK Educational Map' },
  'map.year2026': { ID: 'Tahun 2026', EN: 'Year 2026' },
  'map.year2025': { ID: 'Tahun 2025', EN: 'Year 2025' },
  'map.legend.sd': { ID: 'SD', EN: 'Elementary' },
  'map.legend.smp': { ID: 'SMP', EN: 'Junior High' },
  'map.legend.sma': { ID: 'SMA/SMK', EN: 'Senior High' },
  'map.legend.pt': { ID: 'PT', EN: 'University' },
  'map.legend.komunitas': { ID: 'Komunitas', EN: 'Community' },
  'map.stat.schools': { ID: 'Sekolah Teredukasi', EN: 'Educated Schools' },
  'map.stat.participants': { ID: 'Peserta Edukasi', EN: 'Education Participants' },
  'map.stat.events': { ID: 'Kegiatan Terlaksana', EN: 'Completed Activities' },
  'map.stat.innovations': { ID: 'Program Inovasi', EN: 'Innovation Programs' },

  // --- News & Articles Section ---
  'news.articlesTitle': { ID: 'Artikel Terbaru', EN: 'Latest Articles' },
  'news.newsTitle': { ID: 'Berita Terkini', EN: 'Latest News' },
  'news.viewAll': { ID: 'Lihat Semua', EN: 'View All' },
  'news.readMore': { ID: 'Baca Selengkapnya', EN: 'Read More' },
  'news.articleBadge': { ID: 'Artikel', EN: 'Article' },
  'news.newsBadge': { ID: 'Berita', EN: 'News' },
  'news.noArticles': { ID: 'Belum ada artikel.', EN: 'No articles available yet.' },
  'news.noNews': { ID: 'Belum ada berita.', EN: 'No news available yet.' },

  // --- Testimonial Section ---
  'testi.title': { ID: 'Ulasan', EN: 'Testimonials' },
  'testi.subtitle': { ID: 'Apa kata mereka tentang edukasi PLAT-BK', EN: 'What they say about PLAT-BK education' },
  'testi.viewAll': { ID: 'Lihat Semua', EN: 'View All' },
  'testi.noUlasan': { ID: 'Belum ada ulasan.', EN: 'No testimonials available yet.' },

  // --- Titik Temu ---
  'pk.badge': { ID: 'Platform Sirkulasi Uang Logam', EN: 'Coin Circulation Platform' },
  'pk.title': { ID: 'Titik', EN: 'Meeting' },
  'pk.titleAccent': { ID: 'Temu', EN: 'Point' },
  'pk.subtitle': {
    ID: 'Platform matching antara pihak yang membutuhkan dan memiliki uang logam, untuk meningkatkan sirkulasi logam di masyarakat.',
    EN: 'A matching platform between those who need and those who have coins, to improve coin circulation in the community.',
  },
  'pk.tab.need': { ID: 'Saya Membutuhkan', EN: 'I Need Coins' },
  'pk.tab.have': { ID: 'Saya Memiliki', EN: 'I Have Coins' },
  'pk.search.title': { ID: 'Filter Pencarian', EN: 'Search Filter' },
  'pk.search.location': { ID: 'LOKASI ANDA', EN: 'YOUR LOCATION' },
  'pk.search.locationPlaceholder': {
    ID: 'Gunakan GPS atau klik tombol di sebelah kanan',
    EN: 'Use GPS or click the button on the right',
  },
  'pk.search.gps': { ID: 'GPS', EN: 'GPS' },
  'pk.search.radius': { ID: 'RADIUS PENCARIAN', EN: 'SEARCH RADIUS' },
  'pk.search.button': { ID: 'Cari Penyedia Koin', EN: 'Find Coin Providers' },
  'pk.search.searching': { ID: 'Mencari...', EN: 'Searching...' },
  'pk.search.empty': {
    ID: 'Tentukan lokasi & radius, lalu klik "Cari" untuk menemukan penyedia koin terdekat.',
    EN: 'Set your location & radius, then click "Find" to discover nearby coin providers.',
  },
  'pk.search.notFound': { ID: 'Tidak Ditemukan', EN: 'Not Found' },
  'pk.search.notFoundDesc': {
    ID: 'Tidak ada penyedia koin dalam radius',
    EN: 'No coin providers found within',
  },
  'pk.search.notFoundDesc2': {
    ID: 'KM dari lokasi Anda. Coba perluas radius pencarian.',
    EN: 'KM from your location. Try expanding the search radius.',
  },
  'pk.search.contact': { ID: 'Hubungi via WhatsApp', EN: 'Contact via WhatsApp' },
  'pk.search.distance': { ID: 'KM dari lokasi Anda', EN: 'KM from your location' },

  // --- Register Tab ---
  'pk.reg.title': { ID: 'Daftarkan Lokasi Anda', EN: 'Register Your Location' },
  'pk.reg.subtitle': {
    ID: 'Isi data di bawah agar lokasi Anda dapat ditemukan oleh pencari koin.',
    EN: 'Fill in the form below so your location can be found by coin seekers.',
  },
  'pk.reg.sectionProfile': { ID: 'Data Profil', EN: 'Profile Data' },
  'pk.reg.name': { ID: 'Nama Instansi / Pemilik *', EN: 'Institution / Owner Name *' },
  'pk.reg.namePlaceholder': { ID: 'Contoh: Warung Bu Sari', EN: 'Example: Sari\'s Store' },
  'pk.reg.type': { ID: 'Jenis Pengguna *', EN: 'User Type *' },
  'pk.reg.type.personal': { ID: 'Perorangan', EN: 'Individual' },
  'pk.reg.type.umkm': { ID: 'UMKM', EN: 'Small Business' },
  'pk.reg.type.instansi': { ID: 'Instansi', EN: 'Institution' },
  'pk.reg.whatsapp': { ID: 'Nomor WhatsApp *', EN: 'WhatsApp Number *' },
  'pk.reg.sectionLocation': { ID: 'Lokasi', EN: 'Location' },
  'pk.reg.address': { ID: 'Alamat Lengkap *', EN: 'Full Address *' },
  'pk.reg.addressPlaceholder': {
    ID: 'Jl. Contoh No. 1, Pematangsiantar',
    EN: '1 Example St., Pematangsiantar',
  },
  'pk.reg.pinLabel': { ID: 'Titik Lokasi *', EN: 'Location Pin *' },
  'pk.reg.pinDetected': { ID: 'Lokasi terdeteksi', EN: 'Location detected' },
  'pk.reg.autoLocate': { ID: 'Gunakan Lokasi Saya Otomatis', EN: 'Use My Location Automatically' },
  'pk.reg.locating': { ID: 'Mendeteksi lokasi...', EN: 'Detecting location...' },
  'pk.reg.pinHint': {
    ID: 'Atau klik langsung pada peta di sebelah kanan untuk menentukan titik secara manual.',
    EN: 'Or click directly on the map on the right to set the pin manually.',
  },
  'pk.reg.coordinates': { ID: 'Koordinat:', EN: 'Coordinates:' },
  'pk.reg.sectionCoin': { ID: 'Ketersediaan Koin', EN: 'Coin Availability' },
  'pk.reg.totalCoin': { ID: 'Total Nominal Koin (Rp) *', EN: 'Total Coin Amount (IDR) *' },
  'pk.reg.totalCoinPlaceholder': { ID: 'Contoh: 50000', EN: 'Example: 50000' },
  'pk.reg.denominations': { ID: 'Pecahan yang Tersedia *', EN: 'Available Denominations *' },
  'pk.reg.sectionOptional': { ID: 'Informasi Tambahan (Opsional)', EN: 'Additional Information (Optional)' },
  'pk.reg.hours': { ID: 'Jam Operasional', EN: 'Operational Hours' },
  'pk.reg.hoursPlaceholder': { ID: 'Contoh: Senin–Sabtu, 08:00–17:00', EN: 'Example: Mon–Sat, 08:00–17:00' },
  'pk.reg.notes': { ID: 'Catatan Khusus', EN: 'Special Notes' },
  'pk.reg.notesPlaceholder': {
    ID: 'Misal: Hubungi terlebih dahulu sebelum datang',
    EN: 'E.g.: Please contact before visiting',
  },
  'pk.reg.submit': { ID: 'Daftarkan Lokasi Saya', EN: 'Register My Location' },
  'pk.reg.submitting': { ID: 'Mendaftarkan...', EN: 'Registering...' },
  'pk.reg.mapTitle': { ID: 'Peta Lokasi', EN: 'Location Map' },
  'pk.reg.mapMarked': { ID: 'Lokasi ditandai', EN: 'Location marked' },
  'pk.reg.mapHint': { ID: 'Klik peta atau gunakan GPS', EN: 'Click map or use GPS' },

  // --- Swal messages ---
  'pk.swal.gpsUnsupported': { ID: 'Browser Anda tidak mendukung GPS.', EN: 'Your browser does not support GPS.' },
  'pk.swal.gpsError': { ID: 'Tidak dapat mengakses lokasi GPS.', EN: 'Cannot access GPS location.' },
  'pk.swal.locNeeded': { ID: 'Harap tentukan lokasi Anda terlebih dahulu.', EN: 'Please set your location first.' },
  'pk.swal.serverError': { ID: 'Tidak dapat menghubungi server.', EN: 'Cannot connect to server.' },
  'pk.swal.denomNeeded': { ID: 'Pilih minimal satu jenis pecahan koin.', EN: 'Please select at least one coin denomination.' },
  'pk.swal.pinNeeded': { ID: 'Harap tentukan pin lokasi Anda pada peta.', EN: 'Please set a location pin on the map.' },
  'pk.swal.success': { ID: 'Lokasi Anda berhasil didaftarkan dan dapat ditemukan oleh pencari koin.', EN: 'Your location has been registered and can now be found by coin seekers.' },
  'pk.swal.successTitle': { ID: 'Berhasil! 🎉', EN: 'Success! 🎉' },
  'pk.swal.gpsDetected': { ID: 'Lokasi berhasil dideteksi!', EN: 'Location detected successfully!' },
  'pk.swal.gpsPermission': { ID: 'Tidak dapat mengakses GPS. Pastikan izin lokasi diaktifkan di browser Anda.', EN: 'Cannot access GPS. Make sure location permission is enabled in your browser.' },
};

const LanguageContext = createContext<LanguageContextType>({
  lang: 'ID',
  setLang: () => {},
  t: (key: string) => key,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>('ID');

  const t = (key: string): string => {
    return translations[key]?.[lang] ?? key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
