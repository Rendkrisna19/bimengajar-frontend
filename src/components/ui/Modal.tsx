'use client';

import { ReactNode, useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  maxWidth?: string;
}

export default function Modal({ isOpen, onClose, title, children, maxWidth = 'max-w-2xl' }: ModalProps) {
  // Prevent background scrolling when modal is open
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

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[999999] flex items-center justify-center p-4 pt-24 md:pt-28 bg-slate-900/70 backdrop-blur-md"
      onClick={onClose}
    >
      <div 
        className={`bg-white dark:bg-[#1e1e1e] rounded-3xl shadow-2xl w-full ${maxWidth} flex flex-col overflow-hidden max-h-[82vh] border border-slate-100 animate-in fade-in zoom-in-95 duration-200 my-auto`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-sky-50/80 to-blue-50/40 dark:bg-gray-900 shrink-0 relative z-20">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white pr-4">{title}</h3>
          <button 
            onClick={onClose}
            className="text-slate-500 hover:text-white hover:bg-red-500 transition-all w-9 h-9 flex items-center justify-center rounded-full shadow-sm border border-slate-200 dark:hover:bg-red-900/30 cursor-pointer text-base font-bold shrink-0 z-30"
            title="Tutup Modal"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>
        <div className="p-6 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
