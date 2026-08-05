'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function AboutPreviewSection() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAbouts = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/abouts`);
        const result = await res.json();
        if (result.status === 'success' && result.data && result.data.tentang_bi) {
          setData(result.data.tentang_bi);
        }
      } catch (error) {
        console.error('Failed to fetch about data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAbouts();
  }, []);

  // Helper to strip HTML tags for the preview text, and truncate to roughly ~250 chars
  const createPreviewText = (html: string) => {
    if (!html) return '';
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    const text = tempDiv.textContent || tempDiv.innerText || '';
    return text.length > 300 ? text.substring(0, 300) + '...' : text;
  };

  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    return `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'}/storage/${imagePath}`;
  };

  if (loading) {
    return (
      <section className="bg-white py-16 md:py-24 overflow-hidden relative border-y border-gray-100 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primary"></div>
      </section>
    );
  }

  if (!data) return null; // Don't show if no data

  return (
    <section className="bg-white py-16 md:py-24 overflow-hidden relative border-y border-gray-100">
      {/* Subtle Texture Background */}
      <div 
        className="absolute inset-0 w-full h-full opacity-[0.01] bg-no-repeat bg-center bg-cover pointer-events-none"
        style={{ backgroundImage: 'url(/images/element/2.png)' }}
      ></div>

      <div className="max-w-[1200px] mx-auto px-4 md:px-8 relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
        
        {/* Left Side: Graphic / Image */}
        <div className="flex-1 w-full max-w-lg flex justify-center relative order-2 md:order-1">
          <div className="relative w-full aspect-[4/3] bg-[#f2f6fa] rounded-3xl overflow-hidden shadow-lg border border-gray-100">
            {data.image ? (
              <img 
                src={getImageUrl(data.image)!} 
                alt={data.title}
                className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/600x450?text=Gambar+tidak+tersedia'; }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-300">
                <i className="fa-regular fa-image text-6xl"></i>
              </div>
            )}
          </div>
          
          {/* Floating Glows */}
          <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-yellow-400 rounded-full mix-blend-multiply opacity-20 blur-3xl z-[-1]"></div>
          <div className="absolute -top-8 -right-8 w-40 h-40 bg-primary rounded-full mix-blend-multiply opacity-20 blur-3xl z-[-1]"></div>
        </div>

        {/* Right Side: Text */}
        <div className="flex-1 text-center md:text-left max-w-xl order-1 md:order-2">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 text-primary text-sm font-bold mb-6 border border-blue-100">
            <i className="fa-solid fa-circle-info"></i> Tentang Kami
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-6 leading-tight tracking-tight">
            {data.title || 'Tentang Bank Indonesia'}
          </h2>
          <p className="text-gray-600 text-base md:text-lg leading-relaxed mb-8 text-justify md:text-left">
            {createPreviewText(data.content)}
          </p>
          <Link href="/tentang-kami" className="inline-flex items-center justify-center px-8 py-3.5 bg-primary text-white font-bold rounded hover:brightness-110 transition-all border-b-4 border-blue-900 active:border-b-0 active:translate-y-1 gap-2">
            Selengkapnya <i className="fa-solid fa-arrow-right text-sm"></i>
          </Link>
        </div>

      </div>
    </section>
  );
}
