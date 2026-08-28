'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PageHeader from '@/components/ui/PageHeader';
import { getImageUrl } from '@/lib/api';

interface Article {
  id: number;
  title: string;
  slug: string;
  author: string;
  image: string[];
  description: string;
  content: string;
  published_at: string;
  category?: string;
}

export default function ArticleDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [article, setArticle] = useState<Article | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [otherArticles, setOtherArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;

    const fetchArticleDetail = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/articles/${slug}`, {
          headers: { 'Accept': 'application/json' }
        });
        
        let data = null;
        if (res.ok) {
          data = await res.json();
        }

        if (data && data.status === 'success') {
          setArticle(data.data);
          setSelectedImageIndex(0);
          
          // Fetch related items for sidebar
          const otherRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/articles`);
          const otherData = await otherRes.json();
          
          if (otherData.status === 'success') {
            const arr = Array.isArray(otherData.data) ? otherData.data : (otherData.data.data || []);
            const filtered = arr.filter((a: Article) => a.slug !== slug).slice(0, 4);
            setOtherArticles(filtered);
          }
        }
      } catch (error) {
        console.error('Failed to fetch details', error);
      } finally {
        setLoading(false);
      }
    };

    fetchArticleDetail();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-[#f2f6fa]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primary"></div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-[#f2f6fa]">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Konten Tidak Ditemukan</h1>
        <Link href="/aktivitas" className="bg-primary text-white px-6 py-2 rounded-full hover:bg-blue-800 transition-colors">
          Kembali ke Aktivitas
        </Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#f2f6fa]">
      <Navbar />
      
      {/* Header Section */}
      <PageHeader 
        title={article.title}
        breadcrumbs={[
          { label: 'Beranda', href: '/' },
          { label: 'Aktivitas', href: '/aktivitas' },
          { label: 'Detail Artikel' }
        ]}
      >
        <div className="flex justify-center items-center gap-4 text-blue-100 text-sm md:text-base font-medium mt-2">
          <span className="flex items-center gap-2">
            <i className="fa-regular fa-calendar"></i>
            {new Date(article.published_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
          </span>
          <span>|</span>
          <span className="flex items-center gap-2">
            <i className="fa-solid fa-user-pen"></i>
            Oleh {article.author}
          </span>
        </div>
      </PageHeader>

      {/* Main Content */}
      <section className="py-12 md:py-16">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            
            {/* Left: Article Content */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-3xl shadow-sm p-6 md:p-10 border border-gray-100">
                {/* Interactive Images Gallery */}
                {article.image && article.image.length > 0 && (
                  <div className="mb-8">
                    {/* Main Image Banner */}
                    <div className="relative w-full h-[300px] md:h-[480px] rounded-2xl overflow-hidden mb-4 shadow-md bg-gray-900 group flex items-center justify-center">
                      {/* Blurred Background to handle any aspect ratio seamlessly */}
                      <Image 
                        src={getImageUrl(article.image[selectedImageIndex] || article.image[0])} 
                        alt=""
                        fill
                        className="object-cover blur-2xl opacity-40 scale-105 pointer-events-none"
                      />
                      <Image 
                        src={getImageUrl(article.image[selectedImageIndex] || article.image[0])} 
                        alt={article.title}
                        fill
                        priority
                        sizes="(max-width: 1024px) 100vw, 800px"
                        className="object-contain transition-all duration-300 z-10"
                      />

                      {/* Arrow Navigation (if multiple images) */}
                      {article.image.length > 1 && (
                        <>
                          <button
                            type="button"
                            onClick={() => setSelectedImageIndex(prev => (prev === 0 ? article.image.length - 1 : prev - 1))}
                            className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/75 transition-colors shadow-md z-10"
                            title="Gambar Sebelumnya"
                          >
                            <i className="fa-solid fa-chevron-left"></i>
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedImageIndex(prev => (prev === article.image.length - 1 ? 0 : prev + 1))}
                            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/75 transition-colors shadow-md z-10"
                            title="Gambar Selanjutnya"
                          >
                            <i className="fa-solid fa-chevron-right"></i>
                          </button>
                          <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1 rounded-full z-10">
                            {selectedImageIndex + 1} / {article.image.length} Foto
                          </div>
                        </>
                      )}
                    </div>

                    {/* Clickable Thumbnail Gallery */}
                    {article.image.length > 1 && (
                      <div className="flex gap-3 overflow-x-auto pb-2 pt-1">
                        {article.image.map((img, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setSelectedImageIndex(idx)}
                            className={`relative shrink-0 w-24 h-16 md:w-32 md:h-20 rounded-xl overflow-hidden shadow-sm transition-all duration-200 cursor-pointer ${
                              selectedImageIndex === idx
                                ? 'ring-4 ring-primary scale-105 opacity-100 shadow-md'
                                : 'opacity-70 hover:opacity-100 hover:scale-102 border-2 border-transparent'
                            }`}
                          >
                            <Image 
                              src={getImageUrl(img)} 
                              alt={`Galeri ${idx + 1}`} 
                              fill
                              sizes="128px"
                              className="object-cover" 
                            />
                            {selectedImageIndex === idx && (
                              <div className="absolute inset-0 border-2 border-primary rounded-xl pointer-events-none z-10"></div>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Content */}
                <div className="prose max-w-none prose-lg prose-headings:text-primary prose-a:text-blue-600">
                  {article.description && (
                    <div 
                      className="text-xl font-medium text-gray-700 leading-relaxed mb-6 italic border-l-4 border-primary pl-4"
                      dangerouslySetInnerHTML={{ __html: article.description }}
                    />
                  )}
                  
                  {article.content ? (
                    <div 
                      className="text-gray-600 leading-relaxed text-justify space-y-4"
                      dangerouslySetInnerHTML={{ __html: article.content }}
                    />
                  ) : (
                    <div className="text-gray-600 leading-relaxed italic text-justify">
                      Konten artikel ini sedang dalam tahap penyusunan.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Sidebar / Related Items */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-sm sticky top-24">
                <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <i className="fa-solid fa-list text-primary"></i> 
                  Baca Artikel Lainnya
                </h3>
                
                <div className="space-y-6">
                  {otherArticles.length > 0 ? (
                    otherArticles.map(other => (
                      <Link 
                        key={other.id} 
                        href={`/artikel/${other.slug}`}
                        className="flex gap-4 group"
                      >
                        <div className="relative w-24 h-24 rounded-xl overflow-hidden shrink-0 shadow-sm">
                          <Image 
                            src={(other.image && other.image.length > 0) ? getImageUrl(other.image[0]) : '/images/banner/hero1.png'} 
                            alt={other.title}
                            fill
                            sizes="96px"
                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        </div>
                        <div className="flex flex-col justify-center">
                          <h4 className="font-bold text-gray-800 text-sm line-clamp-2 mb-1 group-hover:text-primary transition-colors">
                            {other.title}
                          </h4>
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <i className="fa-regular fa-calendar"></i>
                            {new Date(other.published_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-4">Belum ada artikel lainnya.</p>
                  )}
                </div>
                
                <Link 
                  href="/aktivitas" 
                  className="mt-8 block w-full text-center bg-blue-50 text-primary font-bold py-3 rounded-xl hover:bg-primary hover:text-white transition-colors"
                >
                  Lihat Semua Aktivitas
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
