import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://platbkbi.id';

  const routes = [
    '',
    '/tentang-kami',
    '/edukasi/materi-edukasi',
    '/edukasi/game-kuis',
    '/edukasi/pengajuan-kegiatan',
    '/perpustakaan',
    '/titik-temu',
    '/berita',
    '/artikel',
    '/ulasan',
    '/aktivitas',
    '/kalender',
    '/pre-post-test',
  ];

  const staticSitemap: MetadataRoute.Sitemap = routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'daily' : 'weekly',
    priority: route === '' ? 1.0 : 0.8,
  }));

  return staticSitemap;
}
