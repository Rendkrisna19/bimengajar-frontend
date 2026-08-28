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

/**
 * Extract thumbnail URL for documentation items.
 * If images are present, returns the main image URL.
 * If only video_urls (YouTube or Google Drive) are present, extracts and returns the video thumbnail.
 */
export function getDocThumbnail(item: { images?: any; video_urls?: any }): string {
  if (!item) return '/images/banner/hero1.png';

  // 1. Check images array
  let rawImgs = item.images;
  if (typeof rawImgs === 'string') {
    try {
      rawImgs = JSON.parse(rawImgs);
    } catch {}
  }
  if (Array.isArray(rawImgs) && rawImgs.length > 0 && rawImgs[0]) {
    const imgUrl = getImageUrl(rawImgs[0]);
    if (imgUrl && imgUrl !== '/images/banner/hero1.png') {
      return imgUrl;
    }
  }

  // 2. Check video_urls array
  let rawVideos = item.video_urls;
  if (typeof rawVideos === 'string') {
    try {
      rawVideos = JSON.parse(rawVideos);
    } catch {
      rawVideos = [rawVideos];
    }
  }

  if (Array.isArray(rawVideos) && rawVideos.length > 0) {
    for (const v of rawVideos) {
      if (!v || typeof v !== 'string') continue;
      const urlStr = v.trim();

      // YouTube Match
      const ytMatch = urlStr.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
      if (ytMatch && ytMatch[1]) {
        return `https://img.youtube.com/vi/${ytMatch[1]}/hqdefault.jpg`;
      }

      // Google Drive Match
      const driveMatch = urlStr.match(/\/d\/([^/]+)/) || urlStr.match(/[?&]id=([^&]+)/);
      if (driveMatch && driveMatch[1]) {
        return `https://drive.google.com/thumbnail?id=${driveMatch[1]}&sz=w800`;
      }
    }
  }

  return '/images/banner/hero1.png';
}

export default API_URL;
