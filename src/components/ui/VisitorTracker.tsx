'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function VisitorTracker() {
  const pathname = usePathname();

  useEffect(() => {
    // Ignore tracking for admin routes
    if (pathname.startsWith('/admin') || pathname.startsWith('/user')) {
      return;
    }

    const trackVisit = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
        await fetch(`${apiUrl}/track-visit`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ page: pathname }),
        });
      } catch (err) {
        // Silently catch tracking errors
      }
    };

    trackVisit();
  }, [pathname]);

  return null;
}
