'use client';

import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';

export default function FloatingAction() {
  const router = useRouter();

  const handleClick = () => {
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
    <div className="fixed bottom-6 right-6 z-50 group">
      {/* Tooltip */}
      <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-white text-gray-800 text-sm font-semibold rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap border border-gray-100">
        Ajukan Kegiatan Edukasi
        <div className="absolute top-1/2 -right-1 -translate-y-1/2 w-2 h-2 bg-white rotate-45 border-r border-t border-gray-100"></div>
      </div>
      
      {/* Button */}
      <button
        onClick={handleClick}
        className="flex items-center justify-center w-14 h-14 md:w-16 md:h-16 bg-primary text-white rounded-full shadow-[0_10px_25px_rgba(0,51,102,0.3)] hover:bg-blue-900 transition-all duration-300 hover:scale-105"
        aria-label="Ajukan Kegiatan Edukasi"
      >
        <div className="relative flex items-center justify-center">
          <i className="fa-solid fa-file-invoice text-xl md:text-2xl"></i>
          <div className="absolute -bottom-1 -right-2 bg-white text-primary rounded-full w-4 h-4 md:w-5 md:h-5 flex items-center justify-center text-[10px] md:text-xs font-bold border-2 border-white shadow-sm">
            <i className="fa-solid fa-plus"></i>
          </div>
        </div>
      </button>
    </div>
  );
}
