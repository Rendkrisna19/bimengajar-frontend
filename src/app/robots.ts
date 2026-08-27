import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://platbkbi.id';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/', '/reset-password', '/verify-otp', '/user/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
