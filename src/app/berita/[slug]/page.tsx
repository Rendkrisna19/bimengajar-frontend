'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PageHeader from '@/components/ui/PageHeader';

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
  const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

  const getImageUrl = (url: string) => {
    if (!url) return 'https://via.placeholder.com/800x450?text=Gambar+tidak+tersedia';
    if (url.startsWith('http')) return url;
    return API.replace('/api', '') + url;
  };
  
  const [article, setArticle] = useState<Article | null>(null);
  const [otherArticles, setOtherArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;

    const fetchArticleDetail = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/news/${slug}`, {
          headers: { 'Accept': 'application/json' }
        });
        
        let data = null;
        if (res.ok) {
          data = await res.json();
        }

        if (data && data.status === 'success') {
          setArticle(data.data);
          
          // Fetch related items for sidebar
          const otherRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/news?category=berita`);
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
          { label: 'Detail Berita' }
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
                {/* Images */}
                {article.image && article.image.length > 0 && (
                  <div className="mb-8">
                    {/* Main Image */}
                    <div className="relative w-full h-[300px] md:h-[450px] rounded-2xl overflow-hidden mb-4 shadow-md bg-gray-100">
                      <Image 
                        src={getImageUrl(article.image[0])} 
                        alt={article.title}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                    {/* Thumbnail Gallery (if more than 1 image) */}
                    {article.image.length > 1 && (
                      <div className="flex gap-3 overflow-x-auto pb-2">
                        {article.image.slice(1).map((img, idx) => (
                          <div key={idx} className="relative min-w-[120px] h-[80px] rounded-lg overflow-hidden shadow-sm bg-gray-100">
                            <Image src={getImageUrl(img)} alt={`Gallery ${idx+1}`} fill className="object-cover" unoptimized />
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

            {/* Right: Sidebar / Related Items */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-sm sticky top-24">
                <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <i className="fa-solid fa-list text-primary"></i> 
                  Baca Berita Lainnya
                </h3>
                
                <div className="space-y-6">
                  {otherArticles.length > 0 ? (
                    otherArticles.map(other => (
                      <Link 
                        key={other.id} 
                        href={`/berita/${other.slug}`}
                        className="flex gap-4 group"
                      >
                        <div className="relative w-24 h-24 rounded-xl overflow-hidden shrink-0 shadow-sm">
                          <Image 
                            src={(other.image && other.image.length > 0) ? getImageUrl(other.image[0]) : 'https://via.placeholder.com/150'} 
                            alt={other.title}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                            unoptimized
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
