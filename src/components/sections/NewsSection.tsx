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
        const res = await fetch('http://localhost:8000/api/articles');
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
      <div className="max-w-[1200px] mx-auto px-4 md:px-8 mb-8 relative flex items-center justify-center">
        <h2 className="text-2xl md:text-3xl font-extrabold text-primary">Berita Terbaru</h2>
        <Link href="/berita" className="absolute right-4 md:right-8 text-gray-500 hover:text-primary font-medium text-sm transition-colors">
          Lihat Semua &gt;
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
                className="relative block w-[320px] h-[400px] md:w-[350px] md:h-[420px] rounded-2xl overflow-hidden group shadow-md hover:shadow-2xl transition-all duration-300"
              >
                {/* Background Image */}
                <Image 
                  src={(article.image && article.image.length > 0) ? article.image[0] : 'https://via.placeholder.com/400x300?text=No+Image'} 
                  alt={article.title}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                />
                
                {/* Dark overlay for better contrast if needed (optional) */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                {/* Content Box */}
                <div className="absolute bottom-3 left-3 right-3 bg-white rounded-xl p-5 pt-6 transition-transform duration-300 group-hover:-translate-y-2">
                  {/* Category Pill (Overlapping) */}
                  <div className="absolute -top-4 left-5 bg-[#f5efff] text-[#9333ea] px-3 py-1 rounded-lg text-xs font-bold shadow-sm border border-[#e9d5ff]">
                    BI SIANTAR
                  </div>

                  <h3 className="font-extrabold text-gray-900 text-[17px] leading-snug line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                    {article.title}
                  </h3>
                  
                  <p className="text-sm text-gray-500 line-clamp-2 mb-4 leading-relaxed">
                    {article.description}
                  </p>
                  
                  {/* Author & Date Footer */}
                  <div className="flex items-center gap-2 border-t border-gray-100 pt-3">
                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-[10px] font-bold shrink-0">
                      {article.author.charAt(0)}
                    </div>
                    <span className="text-xs font-semibold text-gray-700">{article.author}</span>
                    <span className="text-xs text-gray-400 mx-1">&bull;</span>
                    <span className="text-xs font-medium text-gray-500">
                      {new Date(article.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
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
