'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';

interface Article {
  id: number;
  title: string;
  slug: string;
  author: string;
  image: string[];
  description: string;
  published_at: string;
}

export default function NewsSection() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/articles`);
        const data = await res.json();
        if (data.status === 'success') {
          setArticles(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch articles', error);
      } finally {
        setLoading(false);
      }
    };
    fetchArticles();
  }, []);

  // We duplicate the array to make the infinite scroll smooth
  const duplicatedArticles = articles.length > 0 ? [...articles, ...articles, ...articles] : [];

  return (
    <section className="bg-[#f2f6fa] py-16 overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 mb-8 flex items-center justify-between">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Artikel Terbaru</h2>
        <Link href="/berita" className="border border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-primary font-semibold text-sm transition-colors py-2 px-5 rounded-lg shadow-sm flex items-center gap-2">
          Lihat Semua <i className="fa-solid fa-arrow-right text-xs"></i>
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : articles.length === 0 ? (
        <div className="text-center text-gray-500 py-8">Belum ada berita.</div>
      ) : (
        /* Infinite Carousel Container */
        <div className="relative w-full flex">
          {/* The scrolling track */}
          <div className="flex gap-6 animate-marquee hover:[animation-play-state:paused] w-max px-4 pb-8">
            {duplicatedArticles.map((article, idx) => (
              <Link 
                key={`${article.id}-${idx}`}
                href={`/berita/${article.slug}`}
                className="w-[320px] md:w-[380px] bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col group hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden"
              >
                {/* Image Section */}
                <div className="relative w-full h-[220px] overflow-hidden bg-gray-100">
                  <Image 
                    src={(article.image && article.image.length > 0) ? article.image[0] : 'https://via.placeholder.com/400x300?text=No+Image'} 
                    alt={article.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Badge */}
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-gray-700 px-3 py-1.5 rounded-full text-[10px] font-bold shadow-sm uppercase tracking-wider">
                    Informasi
                  </div>
                </div>
                
                {/* Content Section */}
                <div className="p-6 flex flex-col flex-1">
                  <h3 className="font-bold text-gray-900 text-lg leading-snug line-clamp-2 mb-3 group-hover:text-primary transition-colors">
                    {article.title}
                  </h3>
                  
                  <div className="flex items-center gap-2 text-xs text-gray-500 font-medium mb-4">
                    <i className="fa-regular fa-calendar"></i>
                    {new Date(article.published_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
                  
                  <p className="text-sm text-gray-500 line-clamp-2 mb-6 leading-relaxed flex-1">
                    {article.description}
                  </p>
                  
                  {/* Button Baca Selengkapnya */}
                  <div className="mt-auto">
                    <span className="inline-flex items-center gap-2 border border-gray-200 text-gray-700 text-sm font-semibold px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                      Baca Selengkapnya <i className="fa-solid fa-chevron-right text-[10px]"></i>
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
