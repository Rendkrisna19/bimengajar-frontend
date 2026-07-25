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

export default API_URL;
