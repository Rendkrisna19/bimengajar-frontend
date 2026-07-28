'use client';

import KalenderView from './KalenderView';

interface KalenderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function KalenderModal({ isOpen, onClose }: KalenderModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center px-4 py-6 bg-black/60 backdrop-blur-sm">
      <div className="bg-[#f0f4f8] w-full max-w-6xl max-h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden relative border border-white/40">
        
        {/* Motif Background (Subtle Songket) */}
        <div className="absolute top-0 right-0 w-full h-full opacity-5 pointer-events-none overflow-hidden mix-blend-multiply">
          {/* Large motif top right */}
          <svg className="absolute -top-20 -right-20 w-96 h-96 text-[#003366]" viewBox="0 0 40 40" fill="currentColor">
            <path d="M20 0 L24 10 L34 6 L28 16 L40 20 L28 24 L34 34 L24 30 L20 40 L16 30 L6 34 L12 24 L0 20 L12 16 L6 6 L16 10 Z"/>
          </svg>
          {/* Small motif bottom left */}
          <svg className="absolute bottom-10 left-10 w-40 h-40 text-[#003366]" viewBox="0 0 40 40" fill="currentColor">
            <path d="M20 0 L24 10 L34 6 L28 16 L40 20 L28 24 L34 34 L24 30 L20 40 L16 30 L6 34 L12 24 L0 20 L12 16 L6 6 L16 10 Z"/>
          </svg>
        </div>

        {/* Header */}
        <div className="px-8 py-5 flex items-center justify-between border-b border-gray-200/60 bg-white/50 backdrop-blur-md z-10 relative">
          <h2 className="text-2xl md:text-3xl font-extrabold text-[#003366] tracking-tight">Jadwal Kegiatan BI</h2>
          <button onClick={onClose} className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-500 hover:text-red-500 hover:bg-red-50 transition-colors shadow-sm border border-gray-100">
            <i className="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        {/* Body */}
        <div className="p-4 md:p-6 flex-1 overflow-y-auto z-10">
          <KalenderView />
        </div>
      </div>
    </div>
  );
}
