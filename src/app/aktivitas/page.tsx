'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PageHeader from '@/components/ui/PageHeader';
import KalenderView from '@/components/ui/KalenderView';

interface Article {
  id: number;
  title: string;
  slug: string;
  author: string;
  image: string[];
  description: string;
  published_at: string;
}

interface NewsItem {
  id: number;
  title: string;
  slug: string;
  author: string;
  image: string[];
  description: string;
  published_at: string;
  category: string;
}

interface DokItem {
  id: number;
  nama_kegiatan: string;
  kategori: string;
  deskripsi: string;
  tanggal_kegiatan: string;
  posted_by: string;
  images: string[];
  video_urls: string[];
}

const TABS = [
  { id: 'artikel', label: 'Artikel' },
  { id: 'berita', label: 'Berita' },
  { id: 'dokumentasi', label: 'Dokumentasi' },
  { id: 'kalender', label: 'Kalender Kegiatan' },
];

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
const PER_PAGE = 9;

export default function AktivitasPage() {
  const [activeTab, setActiveTab] = useState('artikel');
  const [articles, setArticles] = useState<Article[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [dokumentasi, setDokumentasi] = useState<DokItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [artPage, setArtPage] = useState(1);
  const [newsPage, setNewsPage] = useState(1);
  const gridRef = useRef<HTMLDivElement>(null);

  const getImageUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return API.replace('/api', '') + url;
  };

  // Reset page when tab changes
  useEffect(() => { setPage(1); setArtPage(1); setNewsPage(1); }, [activeTab]);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const fetchData = async () => {
      try {
        if (activeTab === 'artikel') {
          const res = await fetch(`${API}/articles?all=true`);
          const data = await res.json();
          if (data.status === 'success' && isMounted) setArticles(data.data);
        } else if (activeTab === 'berita') {
          const res = await fetch(`${API}/news?all=true&category=berita`);
          const data = await res.json();
          if (data.status === 'success' && isMounted) setNews(data.data);
        } else if (activeTab === 'dokumentasi') {
          const res = await fetch(`${API}/dokumentasi?per_page=${PER_PAGE}&page=${page}`);
          const data = await res.json();
          if (data.status === 'success' && isMounted) {
            setDokumentasi(data.data.data || []);
            setTotalPages(data.data.last_page || 1);
          }
        }
      } catch (error) {
        console.error(error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    
    fetchData();

    return () => {
      isMounted = false;
    };
  }, [activeTab, page]);

  // Artikel client-side pagination
  const artPerPage = 8;
  const artTotalPages = Math.ceil(articles.length / artPerPage);
  const artItems = articles.slice((artPage - 1) * artPerPage, artPage * artPerPage);
  const newsPerPage = 8;
  const newsTotalPages = Math.ceil(news.length / newsPerPage);
  const newsItems = news.slice((newsPage - 1) * newsPerPage, newsPage * newsPerPage);

  const renderPagination = (cur: number, total: number, onSet: any) =>
    total > 1 ? (
      <div className="flex justify-center gap-2 mt-8">
        <button onClick={() => onSet((c: number) => Math.max(c - 1, 1))} disabled={cur === 1}
          className="w-10 h-10 rounded-xl flex items-center justify-center border border-gray-200 bg-white text-gray-600 hover:bg-primary hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
          <i className="fa-solid fa-chevron-left text-xs"></i>
        </button>
        {Array.from({ length: total }, (_, i) => i + 1).map(p => (
          <button key={p} onClick={() => onSet(p)}
            className={`w-10 h-10 rounded-xl text-sm font-bold transition-colors ${cur === p ? 'bg-primary text-white shadow-md' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>{p}</button>
        ))}
        <button onClick={() => onSet((c: number) => Math.min(c + 1, total))} disabled={cur === total}
          className="w-10 h-10 rounded-xl flex items-center justify-center border border-gray-200 bg-white text-gray-600 hover:bg-primary hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
          <i className="fa-solid fa-chevron-right text-xs"></i>
        </button>
      </div>
    ) : null;

  const renderArtikel = () => (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {artItems.length === 0 ? (
          <div className="col-span-4 text-center text-gray-400 py-20 bg-white rounded-2xl border border-gray-100 animate-fade-in-up">
            <i className="fa-regular fa-newspaper text-5xl mb-4 block"></i>
            <p>Belum ada artikel yang diterbitkan.</p>
          </div>
        ) : artItems.map((article, idx) => (
          <Link key={article.id} href={`/berita/${article.slug}`}
            style={{ animationDelay: `${idx * 60}ms` }}
            className="animate-fade-in-up block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group border border-gray-100"
          >
            <div className="relative h-48 w-full overflow-hidden">
              <Image src={(article.image && article.image.length > 0) ? article.image[0] : 'https://via.placeholder.com/400x300?text=No+Image'}
                alt={article.title} fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
              <div className="absolute top-3 left-3 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full">ARTIKEL</div>
            </div>
            <div className="p-5">
              <p className="text-xs text-gray-400 mb-2 flex items-center gap-1"><i className="fa-regular fa-calendar"></i>
                {new Date(article.published_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
              <h3 className="font-bold text-gray-800 text-base mb-2 line-clamp-2 group-hover:text-primary transition-colors">{article.title}</h3>
              <p className="text-sm text-gray-500 line-clamp-2">{article.description}</p>
            </div>
          </Link>
        ))}
      </div>
      {renderPagination(artPage, artTotalPages, setArtPage as any)}
    </>
  );

  const renderBerita = () => (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {newsItems.length === 0 ? (
          <div className="col-span-4 text-center text-gray-400 py-20 bg-white rounded-2xl border border-gray-100 animate-fade-in-up">
            <i className="fa-solid fa-bullhorn text-5xl mb-4 block"></i>
            <p>Belum ada berita yang diterbitkan.</p>
          </div>
        ) : newsItems.map((item, idx) => (
          <Link href={`/berita/${item.slug}`} key={item.id} 
            style={{ animationDelay: `${idx * 60}ms` }}
            className="animate-fade-in-up block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group border border-gray-100">
            <div className="relative h-48 w-full overflow-hidden bg-gray-100">
              {item.image && item.image.length > 0 ? (
                <img src={getImageUrl(item.image[0])} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                     onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300?text=Gambar+tidak+tersedia'; }} />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300"><i className="fa-regular fa-image text-5xl"></i></div>
              )}
              <div className="absolute top-3 left-3 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">BERITA</div>
            </div>
            <div className="p-5">
              <p className="text-xs text-gray-400 mb-2 flex items-center gap-1"><i className="fa-regular fa-calendar"></i>
                {new Date(item.published_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
              <h3 className="font-bold text-gray-800 text-base mb-2 line-clamp-2 group-hover:text-primary transition-colors">{item.title}</h3>
              <p className="text-sm text-gray-500 line-clamp-2">{item.description}</p>
            </div>
          </Link>
        ))}
      </div>
      {renderPagination(newsPage, newsTotalPages, setNewsPage as any)}
    </>
  );

  const renderDokumentasi = () => (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {dokumentasi.length === 0 ? (
          <div className="col-span-3 text-center text-gray-400 py-20 bg-white rounded-2xl border border-gray-100 animate-fade-in-up">
            <i className="fa-regular fa-images text-5xl mb-4 block"></i>
            <p>Belum ada dokumentasi kegiatan.</p>
          </div>
        ) : dokumentasi.map((item, idx) => (
          <Link href={`/aktivitas/dokumentasi/${item.id}`} key={item.id} 
            style={{ animationDelay: `${idx * 60}ms` }}
            className="animate-fade-in-up block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group border border-gray-100">
            <div className="relative h-52 w-full overflow-hidden bg-gray-100">
              {item.images && item.images.length > 0 ? (
                <img src={getImageUrl(item.images[0])} alt={item.nama_kegiatan} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                     onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300?text=Gambar+tidak+tersedia'; }} />
              ) : item.video_urls && item.video_urls.length > 0 ? (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900 text-white gap-2">
                  <i className="fa-brands fa-youtube text-5xl text-red-500"></i>
                  <span className="text-xs text-gray-300">{item.video_urls.length} video tersedia</span>
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300"><i className="fa-regular fa-image text-5xl"></i></div>
              )}
              <div className="absolute top-3 left-3"><span className="bg-primary text-white text-xs font-bold px-2.5 py-1 rounded-full">{item.kategori}</span></div>
              {item.images && item.images.length > 1 && (
                <div className="absolute top-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded-full">+{item.images.length - 1} foto</div>
              )}
              {item.video_urls && item.video_urls.length > 0 && (
                <div className="absolute bottom-3 right-3 bg-red-600/90 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                  <i className="fa-brands fa-youtube"></i> {item.video_urls.length} video
                </div>
              )}
            </div>
            <div className="p-5">
              <h3 className="font-bold text-gray-800 text-base mb-1 line-clamp-1 group-hover:text-primary transition-colors">{item.nama_kegiatan}</h3>
              <p className="text-sm text-gray-500 line-clamp-2 mb-3">{item.deskripsi || '-'}</p>
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span className="flex items-center gap-1"><i className="fa-regular fa-calendar"></i>
                  {new Date(item.tanggal_kegiatan).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
                <span className="flex items-center gap-1"><i className="fa-solid fa-user-pen"></i> {item.posted_by}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
      {renderPagination(page, totalPages, setPage as any)}
    </>
  );

  const renderKalender = () => (
    <div className="w-full">
      <KalenderView />
    </div>
  );

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navbar />

      {/* Header with PageHeader Component */}
      <PageHeader
        title="Aktivitas"
        description="Temukan berbagai artikel, berita terkini, dokumentasi kegiatan, dan kalender program BI Mengajar."
        breadcrumbs={[
          { label: 'Beranda', href: '/' },
          { label: 'Aktivitas' }
        ]}
      >
        <div className="flex gap-2 flex-wrap justify-center">
          {TABS.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`py-2.5 px-6 rounded-xl font-bold text-sm transition-all duration-300 ${activeTab === tab.id ? 'bg-white text-primary shadow-lg' : 'text-white bg-white/10 hover:bg-white/20 border border-white/20'}`}
            >{tab.label}</button>
          ))}
        </div>
      </PageHeader>

      {/* Content Area */}
      <section className="max-w-[1200px] mx-auto w-full px-4 md:px-8 -mt-16 relative z-20 pb-20 flex-1">
        {loading ? (
          <div className="flex justify-center items-center py-32">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primary"></div>
          </div>
        ) : (
          <>
            {activeTab === 'artikel' && renderArtikel()}
            {activeTab === 'berita' && renderBerita()}
            {activeTab === 'dokumentasi' && renderDokumentasi()}
            {activeTab === 'kalender' && renderKalender()}
          </>
        )}
      </section>

      <Footer />
    </main>
  );
}
