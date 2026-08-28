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

  // Prevent background scrolling when modal is active
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  const modalContent = (
    <div 
      className="fixed inset-0 z-[999999] flex items-center justify-center p-3 md:p-6 bg-slate-900/60 backdrop-blur-md overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="bg-[#f0f4f8] w-full max-w-6xl max-h-[92vh] md:max-h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden relative border border-white/40 my-auto animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-gray-200/60 bg-gradient-to-r from-sky-50/90 to-blue-50/50 backdrop-blur-md z-10 relative shrink-0">
          <div className="flex items-center gap-3">
            <h2 className="text-xl md:text-2xl font-extrabold text-slate-800 tracking-tight">Jadwal Kegiatan BI</h2>
            <Link 
              href="/kalender" 
              onClick={onClose} 
              className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-blue-800 bg-sky-100/80 px-3 py-1.5 rounded-full border border-sky-200 hover:bg-sky-200/80 transition-colors"
            >
              <span>Halaman Penuh</span>
              <i className="fa-solid fa-arrow-up-right-from-square text-[10px]"></i>
            </Link>
          </div>
          <button 
            onClick={onClose} 
            className="w-9 h-9 bg-white rounded-full flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors shadow-sm border border-gray-200 cursor-pointer"
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
