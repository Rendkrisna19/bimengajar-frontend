import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  const imagesDir = path.join(process.cwd(), 'public', 'images');
  const results: string[] = [];

  let sharp: any = null;
  try {
    sharp = require('next/dist/compiled/sharp');
    results.push('Successfully loaded Next.js bundled sharp!');
  } catch (e: any) {
    try {
      sharp = require('sharp');
      results.push('Successfully loaded sharp!');
    } catch (e2: any) {
      results.push('Failed to load sharp: ' + e2.message);
    }
  }

  function getLargeImages(dir: string): string[] {
    let files: string[] = [];
    if (!fs.existsSync(dir)) return files;
    const items = fs.readdirSync(dir, { withFileTypes: true });
    for (const item of items) {
      const fullPath = path.join(dir, item.name);
      if (item.isDirectory()) {
        files = files.concat(getLargeImages(fullPath));
      } else if (/\.(png|jpg|jpeg)$/i.test(item.name)) {
        const stat = fs.statSync(fullPath);
        if (stat.size > 200 * 1024) { // > 200KB
          files.push(fullPath);
        }
      }
    }
    return files;
  }

  const largeFiles = getLargeImages(imagesDir);
  results.push(`Found ${largeFiles.length} files > 200KB`);

  if (sharp) {
    for (const filePath of largeFiles) {
      try {
        const beforeSize = fs.statSync(filePath).size;
        const ext = path.extname(filePath).toLowerCase();
        const buffer = fs.readFileSync(filePath);
        let outputBuffer: Buffer;

        if (ext === '.png') {
          outputBuffer = await sharp(buffer)
            .resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true })
            .png({ quality: 80, compressionLevel: 9, palette: true })
            .toBuffer();
        } else {
          outputBuffer = await sharp(buffer)
            .resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true })
            .jpeg({ quality: 80, progressive: true })
            .toBuffer();
        }

        const afterSize = outputBuffer.length;
        if (afterSize < beforeSize) {
          fs.writeFileSync(filePath, outputBuffer);
          results.push(`Compressed ${path.relative(imagesDir, filePath)}: ${(beforeSize/1024).toFixed(0)}KB -> ${(afterSize/1024).toFixed(0)}KB`);
        } else {
          results.push(`Skipped ${path.relative(imagesDir, filePath)}`);
        }
      } catch (err: any) {
        results.push(`Error on ${path.relative(imagesDir, filePath)}: ${err.message}`);
      }
    }
  }

  return NextResponse.json({ results });
}
