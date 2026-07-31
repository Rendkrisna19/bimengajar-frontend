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

  // --- Pojok Koin Hero ---
  'pk.badge': { ID: 'Platform Sirkulasi Uang Logam', EN: 'Coin Circulation Platform' },
  'pk.title': { ID: 'Pojok', EN: 'Coin' },
  'pk.titleAccent': { ID: 'Koin', EN: 'Corner' },
  'pk.subtitle': {
    ID: 'Platform matching antara pihak yang membutuhkan dan memiliki uang logam, untuk meningkatkan sirkulasi koin di masyarakat.',
    EN: 'A matching platform between those who need and those who have coins, to improve coin circulation in the community.',
  },

  // --- Tabs ---
  'pk.tab.need': { ID: 'Saya Membutuhkan', EN: 'I Need Coins' },
  'pk.tab.have': { ID: 'Saya Memiliki', EN: 'I Have Coins' },

  // --- Search Tab ---
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
    EN: 'KM from   your location. Try expanding the search radius.',
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
