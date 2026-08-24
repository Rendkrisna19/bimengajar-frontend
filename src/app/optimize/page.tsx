'use client';

import { useState, useEffect } from 'react';

export default function OptimizeImagesPage() {
  const [logs, setLogs] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const addLog = (msg: string) => {
    setLogs(prev => [...prev, msg]);
  };

  const startOptimization = async () => {
    setIsProcessing(true);
    addLog('Scanning public/images directory...');

    try {
      const res = await fetch('/api/optimize-images');
      const data = await res.json();
      const files: { relativePath: string; sizeKB: number }[] = data.files || [];

      addLog(`Found ${files.length} large images (>300KB). Starting compression...`);

      for (const file of files) {
        addLog(`Processing ${file.relativePath} (${file.sizeKB} KB)...`);
        
        try {
          const base64Compressed = await compressImage(file.relativePath);
          const saveRes = await fetch('/api/optimize-images', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              relativePath: file.relativePath,
              base64Data: base64Compressed
            })
          });
          const saveResult = await saveRes.json();
          if (saveResult.success) {
            addLog(`✅ SUCCESS: ${file.relativePath}: ${saveResult.beforeKB} KB ➔ ${saveResult.afterKB} KB`);
          } else {
            addLog(`❌ FAILED to save ${file.relativePath}: ${saveResult.error}`);
          }
        } catch (itemErr: any) {
          addLog(`❌ ERROR processing ${file.relativePath}: ${itemErr.message}`);
        }
      }

      addLog('🎉 All images processed successfully!');
    } catch (err: any) {
      addLog(`CRITICAL ERROR: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const compressImage = (url: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        // Resize max dimension to 1920px for HD clarity
        const maxDim = 1920;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        const isPng = url.toLowerCase().endsWith('.png');
        // Quality settings: JPEG @ 0.80, PNG @ 0.82
        const mimeType = isPng ? 'image/png' : 'image/jpeg';
        const quality = isPng ? 0.82 : 0.80;

        const dataUrl = canvas.toDataURL(mimeType, quality);
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error(`Failed to load image from ${url}`));
      img.src = url + '?t=' + Date.now();
    });
  };

  return (
    <main className="p-8 max-w-4xl mx-auto font-sans">
      <h1 className="text-2xl font-bold mb-4">Image Optimization Tool</h1>
      <button 
        onClick={startOptimization} 
        disabled={isProcessing}
        className="px-6 py-3 bg-blue-600 text-white font-bold rounded-lg disabled:opacity-50 mb-6"
      >
        {isProcessing ? 'Optimizing Images...' : 'Start Image Compression'}
      </button>

      <div className="bg-gray-900 text-green-400 p-4 rounded-xl font-mono text-sm h-96 overflow-y-auto space-y-1">
        {logs.length === 0 ? <p className="text-gray-500">Click button above to start optimization...</p> : null}
        {logs.map((log, idx) => (
          <div key={idx}>{log}</div>
        ))}
      </div>
    </main>
  );
}
