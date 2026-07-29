'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import KalenderModal from './KalenderModal';

export default function FloatingAction() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isKalenderOpen, setIsKalenderOpen] = useState(false);

  const handleCollabClick = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      Swal.fire({
        title: 'Akses Dibatasi',
        text: 'Anda harus register atau login terlebih dahulu untuk mengajukan kegiatan.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Login Sekarang',
        cancelButtonText: 'Batal',
        confirmButtonColor: '#003366',
      }).then((result) => {
        if (result.isConfirmed) {
          router.push('/login');
        }
      });
    } else {
      router.push('/edukasi/pengajuan');
    }
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-[99] flex flex-col items-center gap-3">
        {/* Expanded Sub-buttons */}
        {isOpen && (
          <div className="flex flex-col items-center gap-3 animate-fade-in-up">
            {/* Button 1: Kalender Kegiatan */}
            <div className="relative group/btn">
              {/* Tooltip */}
              <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-white text-gray-800 text-xs font-bold rounded-lg shadow-lg opacity-0 invisible group-hover/btn:opacity-100 group-hover/btn:visible transition-all whitespace-nowrap border border-gray-100">
                Kalender Kegiatan
                <div className="absolute top-1/2 -right-1 -translate-y-1/2 w-2 h-2 bg-white rotate-45 border-r border-t border-gray-100"></div>
              </div>
              <button
                onClick={() => {
                  setIsKalenderOpen(true);
                  setIsOpen(false);
                }}
                className="flex items-center justify-center w-12 h-12 bg-white text-primary hover:bg-primary hover:text-white rounded-full shadow-lg transition-all duration-300 hover:scale-105 border border-gray-100"
              >
                <i className="fa-regular fa-calendar-days text-lg"></i>
              </button>
            </div>

            {/* Button 2: Ajukan Kegiatan */}
            <div className="relative group/btn">
              {/* Tooltip */}
              <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-white text-gray-800 text-xs font-bold rounded-lg shadow-lg opacity-0 invisible group-hover/btn:opacity-100 group-hover/btn:visible transition-all whitespace-nowrap border border-gray-100">
                Ajukan Kegiatan Edukasi
                <div className="absolute top-1/2 -right-1 -translate-y-1/2 w-2 h-2 bg-white rotate-45 border-r border-t border-gray-100"></div>
              </div>
              <button
                onClick={handleCollabClick}
                className="flex items-center justify-center w-12 h-12 bg-white text-primary hover:bg-primary hover:text-white rounded-full shadow-lg transition-all duration-300 hover:scale-105 border border-gray-100"
              >
                <i className="fa-solid fa-file-invoice text-lg"></i>
              </button>
            </div>

            {/* Button 3: Materi Edukasi */}
            <div className="relative group/btn">
              {/* Tooltip */}
              <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-white text-gray-800 text-xs font-bold rounded-lg shadow-lg opacity-0 invisible group-hover/btn:opacity-100 group-hover/btn:visible transition-all whitespace-nowrap border border-gray-100">
                Materi Edukasi
                <div className="absolute top-1/2 -right-1 -translate-y-1/2 w-2 h-2 bg-white rotate-45 border-r border-t border-gray-100"></div>
              </div>
              <button
                onClick={() => {
                  router.push('/edukasi/materi-edukasi');
                  setIsOpen(false);
                }}
                className="flex items-center justify-center w-12 h-12 bg-white text-primary hover:bg-primary hover:text-white rounded-full shadow-lg transition-all duration-300 hover:scale-105 border border-gray-100"
              >
                <i className="fa-solid fa-book-open text-lg"></i>
              </button>
            </div>
          </div>
        )}

        {/* Master Floating Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-full shadow-[0_10px_25px_rgba(0,51,102,0.3)] transition-all duration-300 hover:scale-105 text-white ${isOpen ? 'bg-red-500 hover:bg-red-600' : 'bg-primary hover:bg-blue-900'}`}
          aria-label="Menu Layanan Cepat"
        >
          <div className={`transition-transform duration-300 ${isOpen ? 'rotate-45' : 'rotate-0'}`}>
            <i className="fa-solid fa-plus text-xl md:text-2xl"></i>
          </div>
        </button>
      </div>

      {/* Render Calendar Modal */}
      <KalenderModal isOpen={isKalenderOpen} onClose={() => setIsKalenderOpen(false)} />
    </>
  );
}
