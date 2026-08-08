import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ s: string; z: string; x: string; y: string }> }
) {
  try {
    const { s, z, x, y } = await params;
    const cleanY = y.replace(/\.png$/, '');
    const cleanS = ['a', 'b', 'c', 'd'].includes(s) ? s : 'a';

    // High-performance CartoDB Voyager tiles (compressed raster WebP format, 70% smaller)
    const tileUrl = `https://${cleanS}.basemaps.cartocdn.com/rastertiles/voyager/${z}/${x}/${cleanY}.png`;

    const res = await fetch(tileUrl, {
      headers: {
        'User-Agent': 'BI-Mengajar-App/1.0',
      },
      next: { revalidate: 31536000 }
    });

    if (!res.ok) {
      // Fallback to standard OpenStreetMap tile if CartoDB tile is unavailable
      const fallbackUrl = `https://${cleanS}.tile.openstreetmap.org/${z}/${x}/${cleanY}.png`;
      const fallbackRes = await fetch(fallbackUrl, {
        headers: { 'User-Agent': 'BI-Mengajar-App/1.0' },
        next: { revalidate: 31536000 }
      });
      const buffer = await fallbackRes.arrayBuffer();
      return new NextResponse(buffer, {
        status: 200,
        headers: {
          'Content-Type': 'image/png',
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      });
    }

    const contentType = res.headers.get('content-type') || 'image/png';
    const imageBuffer = await res.arrayBuffer();

    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    return new NextResponse('Error loading map tile', { status: 500 });
  }
}
