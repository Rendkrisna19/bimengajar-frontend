import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  const imagesDir = path.join(process.cwd(), 'public', 'images');

  function getLargeImages(dir: string): { relativePath: string; sizeKB: number }[] {
    let files: { relativePath: string; sizeKB: number }[] = [];
    if (!fs.existsSync(dir)) return files;
    const items = fs.readdirSync(dir, { withFileTypes: true });
    for (const item of items) {
      const fullPath = path.join(dir, item.name);
      if (item.isDirectory()) {
        files = files.concat(getLargeImages(fullPath));
      } else if (/\.(png|jpg|jpeg)$/i.test(item.name)) {
        const stat = fs.statSync(fullPath);
        if (stat.size > 200 * 1024) { // > 200KB
          const rel = '/' + path.relative(path.join(process.cwd(), 'public'), fullPath).replace(/\\/g, '/');
          files.push({
            relativePath: rel,
            sizeKB: Math.round(stat.size / 1024)
          });
        }
      }
    }
    return files;
  }

  const files = getLargeImages(imagesDir);

  return NextResponse.json({
    status: 'success',
    files,
    total: files.length
  });
}

export async function POST(request: Request) {
  try {
    const { relativePath, base64Data } = await request.json();
    if (!relativePath || !base64Data) {
      return NextResponse.json({ success: false, error: 'Missing parameters' }, { status: 400 });
    }

    const cleanPath = relativePath.startsWith('/') ? relativePath.slice(1) : relativePath;
    const fullPath = path.join(process.cwd(), 'public', cleanPath);

    if (!fs.existsSync(fullPath)) {
      return NextResponse.json({ success: false, error: 'File not found' }, { status: 404 });
    }

    const beforeStat = fs.statSync(fullPath);
    const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return NextResponse.json({ success: false, error: 'Invalid base64 data' }, { status: 400 });
    }

    const buffer = Buffer.from(matches[2], 'base64');
    if (buffer.length < beforeStat.size) {
      fs.writeFileSync(fullPath, buffer);
      return NextResponse.json({
        success: true,
        beforeKB: Math.round(beforeStat.size / 1024),
        afterKB: Math.round(buffer.length / 1024)
      });
    }

    return NextResponse.json({
      success: true,
      skipped: true,
      message: 'Compressed size was not smaller than original'
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
