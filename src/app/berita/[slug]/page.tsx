'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/layout/Navbar';

interface Article {
  id: number;
  title: string;
  slug: string;
  author: string;
  image: string[];
  description: string;
  content: string;
  published_at: string;
}

export default function ArticleDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  
  const [article, setArticle] = useState<Article | null>(null);
  const [otherArticles, setOtherArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;

    const fetchArticleDetail = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/articles/${slug}`);
        const data = await res.json();
        if (data.status === 'success') {
          setArticle(data.data);
        }
        
        // Fetch other articles for sidebar
        const otherRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/articles`);
        const otherData = await otherRes.json();
        if (otherData.status === 'success') {
          // Filter out current article and take top 4
          const filtered = otherData.data.filter((a: Article) => a.slug !== slug).slice(0, 4);
          setOtherArticles(filtered);
        }
      } catch (error) {
        console.error('Failed to fetch article details', error);
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
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Artikel Tidak Ditemukan</h1>
        <Link href="/berita" className="bg-primary text-white px-6 py-2 rounded-full hover:bg-blue-800 transition-colors">
          Kembali ke Blog
        </Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#f2f6fa]">
      <Navbar />
      
      {/* Header Section */}
      <section className="bg-primary text-white pt-32 pb-16 md:pt-40 md:pb-24 relative overflow-hidden">
        <div className="max-w-[1000px] mx-auto px-4 md:px-8 relative z-10 text-center">
          <div className="flex items-center justify-center gap-2 text-sm text-blue-200 mb-6">
            <Link href="/" className="hover:text-white transition-colors">Beranda</Link>
            <span>&gt;</span>
            <Link href="/berita" className="hover:text-white transition-colors">Blog</Link>
            <span>&gt;</span>
            <span className="text-white font-medium">Detail Berita</span>
          </div>
          
          <h1 className="text-3xl md:text-5xl font-extrabold mb-6 leading-tight max-w-4xl mx-auto">{article.title}</h1>
          
          <div className="flex items-center justify-center gap-4 text-blue-100 text-sm md:text-base font-medium">
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
        </div>
        
        {/* Background Elements */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-[120px] translate-x-1/3 translate-y-1/3"></div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 md:py-16">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            
            {/* Left: Article Content */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-3xl shadow-sm p-6 md:p-10 border border-gray-100">
                {/* Images */}
                {article.image && article.image.length > 0 && (
                  <div className="mb-8">
                    {/* Main Image */}
                    <div className="relative w-full h-[300px] md:h-[450px] rounded-2xl overflow-hidden mb-4 shadow-md">
                      <Image 
                        src={article.image[0]} 
                        alt={article.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    {/* Thumbnail Gallery (if more than 1 image) */}
                    {article.image.length > 1 && (
                      <div className="flex gap-3 overflow-x-auto pb-2">
                        {article.image.slice(1).map((img, idx) => (
                          <div key={idx} className="relative min-w-[120px] h-[80px] rounded-lg overflow-hidden shadow-sm">
                            <Image src={img} alt={`Gallery ${idx+1}`} fill className="object-cover" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Content */}
                <div className="prose max-w-none prose-lg prose-headings:text-primary prose-a:text-blue-600">
                  <p className="text-xl font-medium text-gray-700 leading-relaxed mb-6 italic border-l-4 border-primary pl-4">
                    {article.description}
                  </p>
                  
                  <div className="text-gray-600 leading-relaxed whitespace-pre-line text-justify">
                    {article.content || "Konten artikel ini sedang dalam tahap penyusunan."}
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Sidebar / Berita Lainnya */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-3xl shadow-sm p-6 md:p-8 border border-gray-100 sticky top-24">
                <h3 className="text-xl font-bold text-gray-800 mb-6 border-b-2 border-gray-100 pb-3 relative">
                  Berita Lainnya
                  <span className="absolute bottom-[-2px] left-0 w-16 h-0.5 bg-primary"></span>
                </h3>
                
                <div className="flex flex-col gap-6">
                  {otherArticles.length > 0 ? (
                    otherArticles.map(other => (
                      <Link 
                        key={other.id} 
                        href={`/berita/${other.slug}`}
                        className="flex gap-4 group"
                      >
                        <div className="relative w-24 h-24 rounded-xl overflow-hidden shrink-0 shadow-sm">
                          <Image 
                            src={(other.image && other.image.length > 0) ? other.image[0] : 'https://via.placeholder.com/150'} 
                            alt={other.title}
                            fill
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
                    <p className="text-sm text-gray-500 text-center py-4">Belum ada berita lainnya.</p>
                  )}
                </div>
                
                <Link 
                  href="/berita" 
                  className="mt-8 block w-full text-center bg-blue-50 text-primary font-bold py-3 rounded-xl hover:bg-primary hover:text-white transition-colors"
                >
                  Lihat Semua Berita
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>
    </main>
  );
}
