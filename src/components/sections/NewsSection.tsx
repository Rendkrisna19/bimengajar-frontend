'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { getImageUrl } from '@/lib/api';

import GallerySection from './GallerySection';

interface ContentItem {
  id: number;
  title: string;
  slug: string;
  author: string;
  image: string[];
  description: string;
  published_at: string;
}

const getCardImage = (imgData: any): string => {
  try {
    let img = imgData;
    if (typeof img === 'string') {
      try { 
        img = JSON.parse(img); 
      } catch { 
        return getImageUrl(img); 
      }
    }
    if (Array.isArray(img) && img.length > 0) {
      return getImageUrl(img[0]);
    }
    if (typeof img === 'string' && img.trim()) {
      return getImageUrl(img);
    }
    return '/images/banner/hero1.png';
  } catch (e) {
    return '/images/banner/hero1.png';
  }
};

export default function NewsSection() {
  const { t, lang } = useLanguage();
  const [articles, setArticles] = useState<ContentItem[]>([]);
  const [newsList, setNewsList] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resArticles, resNews] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/articles`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/news`)
        ]);
        
        const dataArticles = await resArticles.json();
        const dataNews = await resNews.json();
        
        if (dataArticles.status === 'success') {
          setArticles(Array.isArray(dataArticles.data) ? dataArticles.data : dataArticles.data.data || []);
        }
        if (dataNews.status === 'success') {
          setNewsList(Array.isArray(dataNews.data) ? dataNews.data : dataNews.data.data || []);
        }
      } catch (error) {
        console.error('Failed to fetch content', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const duplicatedArticles = articles.length > 0 ? [...articles, ...articles, ...articles] : [];
  const duplicatedNews = newsList.length > 0 ? [...newsList, ...newsList, ...newsList] : [];

  return (
    <section className="bg-[#f2f6fa] py-16 overflow-hidden relative">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 mb-8 flex items-center justify-between relative z-10">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800">{t('news.articlesTitle')}</h2>
        <Link href="/artikel" className="bg-accent-yellow text-white hover:brightness-110 font-bold text-sm transition-all py-2 px-5 rounded flex items-center gap-2 border-b-4 border-yellow-600 active:border-b-0 active:translate-y-1 mt-1">
          {t('news.viewAll')} <i className="fa-solid fa-arrow-right text-xs"></i>
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-32 relative z-10">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : articles.length === 0 ? (
        <div className="text-center text-gray-500 py-8 relative z-10">{t('news.noArticles')}</div>
      ) : (
        <div className="relative w-full flex z-10">
          <div className={`flex gap-6 w-max px-4 pb-8 ${articles.length >= 4 ? 'animate-marquee hover:[animation-play-state:paused]' : 'mx-auto'}`}>
            {(articles.length >= 4 ? duplicatedArticles : articles).map((article, idx) => (
              <Link 
                key={`article-${article.id}-${idx}`}
                href={`/artikel/${article.slug}`}
                className="w-[320px] md:w-[380px] bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col group hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden"
              >
                <div className="relative w-full h-[220px] overflow-hidden bg-gray-100">
                  <Image 
                    src={getCardImage(article.image)}
                    alt={article.title}
                    fill
                    sizes="(max-width: 768px) 320px, 380px"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute top-4 left-4 bg-primary text-white px-4 py-1.5 rounded-full text-[10px] font-bold shadow-sm uppercase tracking-wider border-b-[3px] border-blue-900 z-10">
                    {t('news.articleBadge')}
                  </div>
                </div>
                
                <div className="p-6 flex flex-col flex-1">
                  <h3 className="font-bold text-gray-900 text-lg leading-snug line-clamp-2 mb-3 group-hover:text-primary transition-colors">
                    {article.title}
                  </h3>
                  
                  <div className="flex items-center gap-2 text-xs text-gray-500 font-medium mb-4">
                    <i className="fa-regular fa-calendar"></i>
                    {new Date(article.published_at).toLocaleDateString(lang === 'ID' ? 'id-ID' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
                  
                  <p className="text-sm text-gray-500 line-clamp-2 mb-6 leading-relaxed flex-1">
                    {article.description}
                  </p>
                  
                  <div className="mt-auto">
                    <span className="inline-flex items-center gap-2 bg-accent-red text-white text-sm font-bold px-4 py-2 rounded hover:brightness-110 transition-all border-b-4 border-accent-red-dark active:border-b-0 active:translate-y-1">
                      {t('news.readMore')} <i className="fa-solid fa-chevron-right text-[10px]"></i>
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* DOKUMENTASI & GALERI SECTION (RIGHT BETWEEN ARTIKEL AND BERITA) */}
      <div className="my-6">
        <GallerySection />
      </div>

      {/* BERITA SECTION */}
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 mb-8 mt-12 flex items-center justify-between relative z-10">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800">{t('news.newsTitle')}</h2>
        <Link href="/berita" className="bg-accent-yellow text-white hover:brightness-110 font-bold text-sm transition-all py-2 px-5 rounded flex items-center gap-2 border-b-4 border-yellow-600 active:border-b-0 active:translate-y-1 mt-1">
          {t('news.viewAll')} <i className="fa-solid fa-arrow-right text-xs"></i>
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-32 relative z-10">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : newsList.length === 0 ? (
        <div className="text-center text-gray-500 py-8 relative z-10">{t('news.noNews')}</div>
      ) : (
        <div className="relative w-full flex z-10 overflow-hidden">
          <div 
            className={`flex gap-6 w-max px-4 pb-8 ${newsList.length >= 4 ? 'animate-marquee hover:[animation-play-state:paused]' : 'mx-auto'}`}
            style={{ animationDirection: newsList.length >= 4 ? 'reverse' : 'normal' }}
          >
            {(newsList.length >= 4 ? duplicatedNews : newsList).map((news, idx) => (
              <Link 
                key={`news-${news.id}-${idx}`}
                href={`/berita/${news.slug}`}
                className="w-[320px] md:w-[380px] shrink-0 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col group hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden"
              >
                <div className="relative w-full h-[220px] overflow-hidden bg-gray-100">
                  <img 
                    src={getCardImage(news.image)}
                    alt={news.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => { (e.target as HTMLImageElement).src = '/images/banner/hero1.png'; }}
                  />
                  <div className="absolute top-4 left-4 bg-primary text-white px-4 py-1.5 rounded-full text-[10px] font-bold shadow-sm uppercase tracking-wider border-b-[3px] border-blue-900">
                    {t('news.newsBadge')}
                  </div>
                </div>
                
                <div className="p-6 flex flex-col flex-1">
                  <h3 className="font-bold text-gray-900 text-lg leading-snug line-clamp-2 mb-3 group-hover:text-primary transition-colors">
                    {news.title}
                  </h3>
                  
                  <div className="flex items-center gap-2 text-xs text-gray-500 font-medium mb-4">
                    <i className="fa-regular fa-calendar"></i>
                    {new Date(news.published_at).toLocaleDateString(lang === 'ID' ? 'id-ID' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
                  
                  <p className="text-sm text-gray-500 line-clamp-2 mb-6 leading-relaxed flex-1">
                    {news.description}
                  </p>
                  
                  <div className="mt-auto">
                    <span className="inline-flex items-center gap-2 bg-accent-red text-white text-sm font-bold px-4 py-2 rounded hover:brightness-110 transition-all border-b-4 border-accent-red-dark active:border-b-0 active:translate-y-1">
                      {t('news.readMore')} <i className="fa-solid fa-chevron-right text-[10px]"></i>
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
