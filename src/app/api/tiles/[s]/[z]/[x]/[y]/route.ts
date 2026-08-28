import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ s: string; z: string; x: string; y: string }> }
) {
  try {
    const { s, z, x, y } = await params;
    const cleanY = y.replace(/\.png$/, '');
    const cleanS = ['a', 'b', 'c'].includes(s) ? s : 'a';

    // High-performance OpenStreetMap Tiles (100% Free & Open Source, No API Key Required)
    const tileUrl = `https://${cleanS}.tile.openstreetmap.org/${z}/${x}/${cleanY}.png`;

    const res = await fetch(tileUrl, {
      headers: {
        'User-Agent': 'PLAT-BK-BI-Mengajar/1.0 (https://platbkbi.id)',
      },
      next: { revalidate: 31536000 }
    });

    if (!res.ok) {
      return new NextResponse('Error loading map tile', { status: res.status });
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
