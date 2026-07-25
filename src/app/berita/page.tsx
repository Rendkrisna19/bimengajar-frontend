'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { gsap } from 'gsap';
import Navbar from '@/components/layout/Navbar';

interface Article {
  id: number;
  title: string;
  slug: string;
  author: string;
  image: string[];
  description: string;
  published_at: string;
}

export default function BlogPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8; // 4x2 grid

  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/articles?all=true');
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

  // GSAP Animation whenever currentItems changes
  useEffect(() => {
    if (!loading && gridRef.current) {
      const cards = gridRef.current.querySelectorAll('.article-card');
      if (cards.length > 0) {
        gsap.fromTo(
          cards,
          { opacity: 0, y: 50 },
          { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power2.out' }
        );
      }
    }
  }, [loading, currentPage, articles]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = articles.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(articles.length / itemsPerPage);

  return (
    <main className="min-h-screen bg-[#f2f6fa]">
      <Navbar />
      
      {/* Header Section */}
      <section className="bg-primary text-white pt-32 pb-16 md:pt-40 md:pb-24 relative overflow-hidden">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 relative z-10 text-center">
          <div className="flex items-center justify-center gap-2 text-sm text-blue-200 mb-4">
            <Link href="/" className="hover:text-white transition-colors">Beranda</Link>
            <span>&gt;</span>
            <span className="text-white font-medium">Blog</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Berita & Artikel</h1>
          <p className="text-blue-100 max-w-2xl mx-auto text-lg">Ikuti perkembangan terbaru dan informasi edukatif seputar program BI Mengajar di Kota Pematangsiantar.</p>
        </div>
        {/* Background Elements */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-[120px] translate-x-1/3 translate-y-1/3"></div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primary"></div>
            </div>
          ) : articles.length === 0 ? (
            <div className="text-center text-gray-500 py-16 text-xl">Belum ada berita yang diterbitkan.</div>
          ) : (
            <>
              {/* 4x2 Grid */}
              <div ref={gridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {currentItems.map((article) => (
                  <Link 
                    key={article.id} 
                    href={`/berita/${article.slug}`}
                    className="article-card block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group border border-gray-100"
                  >
                    <div className="relative h-48 w-full overflow-hidden">
                      <Image 
                        src={(article.image && article.image.length > 0) ? article.image[0] : 'https://via.placeholder.com/400x300?text=No+Image'} 
                        alt={article.title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute top-4 left-4 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                        BI SIANTAR
                      </div>
                    </div>
                    <div className="p-5">
                      <div className="flex items-center text-xs text-gray-500 mb-3 gap-2">
                        <span className="flex items-center gap-1"><i className="fa-regular fa-calendar"></i> {new Date(article.published_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      </div>
                      <h3 className="font-bold text-gray-800 text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">{article.title}</h3>
                      <p className="text-sm text-gray-600 line-clamp-2">{article.description}</p>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2">
                  <button 
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="w-10 h-10 rounded-full flex items-center justify-center border border-gray-300 text-gray-600 hover:bg-primary hover:text-white hover:border-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <i className="fa-solid fa-chevron-left"></i>
                  </button>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors ${currentPage === page ? 'bg-primary text-white shadow-md' : 'border border-gray-300 text-gray-600 hover:bg-gray-100'}`}
                    >
                      {page}
                    </button>
                  ))}

                  <button 
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="w-10 h-10 rounded-full flex items-center justify-center border border-gray-300 text-gray-600 hover:bg-primary hover:text-white hover:border-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <i className="fa-solid fa-chevron-right"></i>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </main>
  );
}
