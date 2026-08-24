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

const DEFAULT_CATEGORIES: KategoriMateri[] = [
  {
    id: 1,
    nama: 'Cinta, Bangga, Paham Rupiah',
    slug: 'cinta-bangga-paham-rupiah',
    logo: null
  },
  {
    id: 2,
    nama: 'Kebanksentralan',
    slug: 'kebanksentralan',
    logo: null
  },
  {
    id: 3,
    nama: 'Pelindungan Konsumen (PeKA)',
    slug: 'pelindungan-konsumen-peka',
    logo: null
  },
  {
    id: 4,
    nama: 'QRIS',
    slug: 'qris',
    logo: null
  }
];

export default function KategoriMateriModal({ isOpen, onClose }: KategoriMateriModalProps) {
  const [categories, setCategories] = useState<KategoriMateri[]>([]);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
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

  // Helper to format exact titles matching user screenshot
  const getFormattedCategories = (): KategoriMateri[] => {
    if (!categories || categories.length === 0) {
      return DEFAULT_CATEGORIES;
    }

    const nameMap: Record<string, string> = {
      'cbp rupiah': 'Cinta, Bangga, Paham Rupiah',
      'cinta, bangga, paham rupiah': 'Cinta, Bangga, Paham Rupiah',
      'cinta bangga paham rupiah': 'Cinta, Bangga, Paham Rupiah',
      'kebanksentralan': 'Kebanksentralan',
      'peka': 'Pelindungan Konsumen (PeKA)',
      'perlindungan konsumen': 'Pelindungan Konsumen (PeKA)',
      'pelindungan konsumen (peka)': 'Pelindungan Konsumen (PeKA)',
      'qris': 'QRIS'
    };

    const formatted = categories.map(cat => {
      const lower = cat.nama.toLowerCase().trim();
      return {
        ...cat,
        nama: nameMap[lower] || cat.nama
      };
    });

    const hasKebanksentralan = formatted.some(c => c.nama.toLowerCase().includes('kebanksentralan'));
    if (!hasKebanksentralan) {
      formatted.splice(1, 0, {
        id: 99,
        nama: 'Kebanksentralan',
        slug: 'kebanksentralan',
        logo: null
      });
    }

    // Sort to match exact screenshot order: CBP Rupiah -> Kebanksentralan -> PeKA -> QRIS
    const order = ['cinta, bangga, paham rupiah', 'kebanksentralan', 'pelindungan konsumen (peka)', 'qris'];
    formatted.sort((a, b) => {
      const idxA = order.indexOf(a.nama.toLowerCase());
      const idxB = order.indexOf(b.nama.toLowerCase());
      return (idxA !== -1 ? idxA : 99) - (idxB !== -1 ? idxB : 99);
    });

    return formatted.slice(0, 4);
  };

  if (!isOpen || !mounted) return null;

  const displayCategories = getFormattedCategories();

  const modalContent = (
    <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md overflow-y-auto">
      <div className="bg-[#f2f6fa] w-full max-w-6xl max-h-[90vh] rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.35)] flex flex-col relative border border-white/60 overflow-hidden animate-fade-in-up">
        
        {/* Background Element 2.png (80% Opacity) */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 rounded-3xl">
          <img 
            src="/images/element/2.png" 
            alt="Modal Background Element" 
            className="absolute inset-0 w-full h-full object-cover opacity-80 pointer-events-none z-0"
          />
        </div>

        {/* Header */}
        <div className="px-6 py-5 flex items-center justify-between border-b border-blue-100/80 bg-white/90 backdrop-blur-md rounded-t-3xl z-10 shrink-0 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
              <i className="fa-solid fa-graduation-cap text-xl text-primary"></i>
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-extrabold text-[#003366] tracking-tight">Edukasi BI Mengajar</h2>
              <p className="text-xs text-gray-500 font-medium">Pilihan topik dan materi kebanksentralan</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-red-500 transition-all duration-300 w-10 h-10 flex items-center justify-center rounded-full hover:bg-red-50 border border-transparent hover:border-red-100 shadow-xs"
          >
            <i className="fa-solid fa-xmark text-xl"></i>
          </button>
        </div>

        {/* Content - 4 Columns in 1 Row */}
        <div className="p-6 md:p-8 overflow-y-auto z-10 relative flex-1">
          {loading && categories.length === 0 ? (
            <div className="flex justify-center items-center py-20">
              <i className="fa-solid fa-circle-notch animate-spin text-4xl text-primary"></i>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
              {displayCategories.map((kategori) => (
                <Link 
                  href={`/edukasi/materi-edukasi?kategori=${kategori.slug}`} 
                  key={kategori.id}
                  onClick={onClose}
                  className="group bg-white/95 backdrop-blur-sm rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 border border-blue-100/80 hover:border-primary/50 flex flex-col h-full hover:-translate-y-2 relative"
                >
                  {/* Decorative top border accent on hover */}
                  <div className="h-1.5 w-full bg-gradient-to-r from-primary to-amber-400 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                  {/* Icon Area - Original Logo Kept Intact */}
                  <div className="p-5 md:p-6 flex items-center justify-center flex-1 relative z-10 bg-gradient-to-b from-white to-blue-50/40">
                    <div className="relative w-36 h-36 md:w-44 md:h-44 transition-transform duration-500 group-hover:scale-110 flex items-center justify-center drop-shadow-sm">
                      {kategori.logo ? (
                        <img 
                          src={getImageUrl(kategori.logo)}
                          alt={kategori.nama} 
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="w-full h-full bg-blue-50 rounded-full flex items-center justify-center text-blue-400">
                          <i className="fa-solid fa-book-open text-4xl"></i>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Title Area */}
                  <div className="bg-white px-4 py-4 text-center border-t border-blue-50 relative z-10 group-hover:bg-primary transition-all duration-300">
                    <h3 className="text-sm md:text-base font-extrabold text-[#003366] group-hover:text-white transition-colors">
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
