'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { getImageUrl } from '@/lib/api';

interface KategoriMateri {
  id: number;
  nama: string;
  slug: string;
  logo: string | null;
}

interface KategoriMateriModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export default function KategoriMateriModal({ isOpen, onClose }: KategoriMateriModalProps) {
  const [categories, setCategories] = useState<KategoriMateri[]>([]);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Pre-fetch categories on mount
    fetchCategories();
    return () => setMounted(false);
  }, []);

  const fetchCategories = () => {
    fetch(`${API}/kategori-materi`)
      .then(res => res.json())
      .then(data => {
        setCategories(data.data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    if (isOpen) {
      if (categories.length === 0) {
        setLoading(true);
      }
      fetchCategories();
    }
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#f0f4f8] w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col relative border border-white/50 animate-fade-in-up">
        
        {/* Header */}
        <div className="px-6 py-5 flex items-center justify-between border-b border-gray-200/60 bg-white/80 backdrop-blur-md rounded-t-2xl z-10 shrink-0">
          <div className="flex-1"></div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-800 tracking-tight text-center flex-1">Edukasi BI Mengajar</h2>
          <div className="flex-1 flex justify-end">
            <button 
              onClick={onClose} 
              className="text-gray-400 hover:text-gray-700 transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
            >
              <i className="fa-solid fa-xmark text-lg"></i>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 md:p-10 overflow-y-auto z-10 relative flex-1 bg-[#f0f4f8] rounded-b-2xl">
          {loading && categories.length === 0 ? (
            <div className="flex justify-center items-center py-20">
              <i className="fa-solid fa-circle-notch animate-spin text-4xl text-primary"></i>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {categories.map((kategori) => (
                <Link 
                  href={`/edukasi/materi-edukasi?kategori=${kategori.slug}`} 
                  key={kategori.id}
                  onClick={onClose}
                  className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col h-full hover:-translate-y-2 relative"
                >
                  {/* Icon Area */}
                  <div className="p-4 md:p-6 flex items-center justify-center flex-1 relative z-10">
                    <div className="relative w-44 h-44 md:w-56 md:h-56 transition-transform duration-500 group-hover:scale-105 flex items-center justify-center">
                      {kategori.logo ? (
                        <img 
                          src={getImageUrl(kategori.logo)}
                          alt={kategori.nama} 
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="w-full h-full bg-blue-50 rounded-full flex items-center justify-center text-blue-300">
                          <i className="fa-solid fa-book-open text-5xl"></i>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Title Area */}
                  <div className="bg-white px-4 py-5 text-center border-t border-gray-50 relative z-10 group-hover:bg-[#f8fafc] transition-colors">
                    <h3 className="text-lg font-bold text-[#003366] group-hover:text-primary transition-colors">
                      {kategori.nama}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
