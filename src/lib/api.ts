/**
 * Centralized API base URL and Image URL resolver.
 * Set NEXT_PUBLIC_API_URL and NEXT_PUBLIC_BACKEND_URL in your .env.local for local dev.
 */
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001/api';

export function getImageUrl(input: any): string {
  if (!input) return '/images/banner/hero1.png';

  let raw = input;

  // If input is an array, take the first non-empty element
  if (Array.isArray(raw)) {
    if (raw.length === 0) return '/images/banner/hero1.png';
    raw = raw[0];
  }

  // If input is a string that might be JSON encoded array or string
  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    if (!trimmed || trimmed === 'null' || trimmed === '[]' || trimmed === 'undefined' || trimmed === '[""]') {
      return '/images/banner/hero1.png';
    }

    if (trimmed.startsWith('[') || trimmed.startsWith('{') || (trimmed.startsWith('"') && trimmed.endsWith('"'))) {
      try {
        const parsed = JSON.parse(trimmed);
        return getImageUrl(parsed);
      } catch (e) {
        // Not valid JSON, continue with string processing
      }
    }
    raw = trimmed;
  }

  if (typeof raw !== 'string' || !raw) {
    return '/images/banner/hero1.png';
  }

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8001';

  // Fix dummy or placeholder paths
  if (raw.startsWith('dummy-images/') || raw === '[' || raw === ']') {
    return '/images/banner/hero1.png';
  }

  // Rewrite localhost / 127.0.0.1 URLs on port 8000 or missing port to the active backend URL
  if (
    raw.startsWith('http://localhost:8000/storage/') || 
    raw.startsWith('http://127.0.0.1:8000/storage/') || 
    raw.startsWith('http://localhost/storage/') ||
    raw.startsWith('http://127.0.0.1/storage/')
  ) {
    return raw.replace(/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?\/storage\//, `${backendUrl}/storage/`);
  }

  // If it's a full remote URL (e.g. https://images.unsplash.com, or already matching backendUrl)
  if (raw.startsWith('http://') || raw.startsWith('https://')) {
    return raw;
  }

  if (raw.startsWith('/storage/')) {
    return `${backendUrl}${raw}`;
  }

  if (raw.startsWith('storage/')) {
    return `${backendUrl}/${raw}`;
  }

  if (raw.startsWith('/images/')) {
    return raw;
  }

  if (raw.startsWith('/')) {
    return `${backendUrl}${raw}`;
  }

  return `${backendUrl}/storage/${raw}`;
}

export default API_URL;
