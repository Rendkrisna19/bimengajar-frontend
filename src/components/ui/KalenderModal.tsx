'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import KalenderView from './KalenderView';

interface KalenderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function KalenderModal({ isOpen, onClose }: KalenderModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!isOpen || !mounted) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[999999] flex items-center justify-center p-3 md:p-6 bg-black/70 backdrop-blur-md overflow-y-auto">
      <div className="bg-[#f0f4f8] w-full max-w-6xl max-h-[92vh] md:max-h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden relative border border-white/40 my-auto animate-fade-in-up">
        
        {/* Header */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-gray-200/60 bg-white/80 backdrop-blur-md z-10 relative shrink-0">
          <div className="flex items-center gap-3">
            <h2 className="text-xl md:text-2xl font-extrabold text-[#003366] tracking-tight">Jadwal Kegiatan BI</h2>
            <Link 
              href="/kalender" 
              onClick={onClose} 
              className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-200 hover:bg-blue-100 transition-colors"
            >
              <span>Halaman Penuh</span>
              <i className="fa-solid fa-arrow-up-right-from-square text-[10px]"></i>
            </Link>
          </div>
          <button 
            onClick={onClose} 
            className="w-9 h-9 bg-white rounded-full flex items-center justify-center text-gray-500 hover:text-red-500 hover:bg-red-50 transition-colors shadow-sm border border-gray-200"
            aria-label="Tutup Modal Kalender"
          >
            <i className="fa-solid fa-xmark text-base"></i>
          </button>
        </div>

        {/* Body */}
        <div className="p-3 md:p-5 flex-1 overflow-y-auto z-10">
          <KalenderView />
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
