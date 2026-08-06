/**
 * Centralized API base URL.
 * Set NEXT_PUBLIC_API_URL in your .env.local for local dev,
 * and in your hosting environment variables for production.
 *
 * Example .env.local:
 *   NEXT_PUBLIC_API_URL=http://localhost:8000/api
 *
 * Example production:
 *   NEXT_PUBLIC_API_URL=https://api.bi-mengajar.id/api
 */
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export function getImageUrl(url: string | null | undefined): string {
  if (!url) return '/images/banner/hero1.png';

  // Fix legacy URLs with missing port 8000 (e.g. http://localhost/storage/...)
  if (url.startsWith('http://localhost/storage/')) {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
    return url.replace('http://localhost/storage/', `${backendUrl}/storage/`);
  }

  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

  if (url.startsWith('/storage/')) {
    return `${backendUrl}${url}`;
  }

  if (url.startsWith('storage/')) {
    return `${backendUrl}/${url}`;
  }

  if (url.startsWith('dummy-images/')) {
    return '/images/banner/hero1.png';
  }

  if (url.startsWith('/')) {
    return url;
  }

  return `${backendUrl}/${url}`;
}

export default API_URL;
