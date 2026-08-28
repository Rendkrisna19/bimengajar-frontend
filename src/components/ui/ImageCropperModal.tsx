'use client';

import React, { useState, useRef, useEffect } from 'react';

interface ImageCropperModalProps {
  isOpen: boolean;
  imageSrc: string | null;
  fileName?: string;
  onClose: () => void;
  onCropComplete: (croppedFile: File, previewUrl: string) => void;
}

export default function ImageCropperModal({
  isOpen,
  imageSrc,
  fileName = 'cropped_image.jpg',
  onClose,
  onCropComplete
}: ImageCropperModalProps) {
  const [aspectRatio, setAspectRatio] = useState<number>(16 / 9); // Default 16:9 for homepage banner/cards
  const [aspectLabel, setAspectLabel] = useState<string>('16:9 (Beranda)');
  const [zoom, setZoom] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  
  // Pan offsets
  const [offset, setOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Load image when imageSrc changes
  useEffect(() => {
    if (!imageSrc) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageSrc;
    img.onload = () => {
      imgRef.current = img;
      setZoom(1);
      setRotation(0);
      setOffset({ x: 0, y: 0 });
    };
  }, [imageSrc]);

  // Redraw canvas whenever crop parameters change
  useEffect(() => {
    if (!isOpen || !imgRef.current || !canvasRef.current) return;
    drawCanvas();
  }, [isOpen, imageSrc, aspectRatio, zoom, rotation, offset]);

  if (!isOpen || !imageSrc) return null;

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Viewport dimensions inside modal
    const viewWidth = 600;
    const viewHeight = 350;

    canvas.width = viewWidth;
    canvas.height = viewHeight;

    ctx.clearRect(0, 0, viewWidth, viewHeight);

    // Save context transform
    ctx.save();

    // Center origin
    ctx.translate(viewWidth / 2 + offset.x, viewHeight / 2 + offset.y);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(zoom, zoom);

    // Calculate base draw size keeping original aspect ratio
    let drawW = viewWidth * 0.8;
    let drawH = (img.height / img.width) * drawW;

    if (drawH > viewHeight * 0.8) {
      drawH = viewHeight * 0.8;
      drawW = (img.width / img.height) * drawH;
    }

    ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
    ctx.restore();

    // Draw Overlay Crop Box (Rule of Thirds Grid)
    drawCropOverlay(ctx, viewWidth, viewHeight);
  };

  const drawCropOverlay = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    let cropWidth = width * 0.85;
    let cropHeight = cropWidth / aspectRatio;

    if (cropHeight > height * 0.85) {
      cropHeight = height * 0.85;
      cropWidth = cropHeight * aspectRatio;
    }

    const cropX = (width - cropWidth) / 2;
    const cropY = (height - cropHeight) / 2;

    // Semi-transparent dark background outside crop area
    ctx.fillStyle = 'rgba(15, 23, 42, 0.65)';

    // Top
    ctx.fillRect(0, 0, width, cropY);
    // Bottom
    ctx.fillRect(0, cropY + cropHeight, width, height - (cropY + cropHeight));
    // Left
    ctx.fillRect(0, cropY, cropX, cropHeight);
    // Right
    ctx.fillRect(cropX + cropWidth, cropY, width - (cropX + cropWidth), cropHeight);

    // Crop Border
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(cropX, cropY, cropWidth, cropHeight);

    // Rule of Thirds Grid Lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.lineWidth = 1;
    ctx.beginPath();

    // Vertical lines
    ctx.moveTo(cropX + cropWidth / 3, cropY);
    ctx.lineTo(cropX + cropWidth / 3, cropY + cropHeight);
    ctx.moveTo(cropX + (cropWidth * 2) / 3, cropY);
    ctx.lineTo(cropX + (cropWidth * 2) / 3, cropY + cropHeight);

    // Horizontal lines
    ctx.moveTo(cropX, cropY + cropHeight / 3);
    ctx.lineTo(cropX + cropWidth, cropY + cropHeight / 3);
    ctx.moveTo(cropX, cropY + (cropHeight * 2) / 3);
    ctx.lineTo(cropX + cropWidth, cropY + (cropHeight * 2) / 3);

    ctx.stroke();
  };

  // Mouse Drag / Pan Handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    setOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch handlers for mobile
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - offset.x,
        y: e.touches[0].clientY - offset.y
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDragging || e.touches.length !== 1) return;
    setOffset({
      x: e.touches[0].clientX - dragStart.x,
      y: e.touches[0].clientY - dragStart.y
    });
  };

  // Confirm Crop & Generate Export Blob File
  const handleCropSave = () => {
    const img = imgRef.current;
    if (!img) return;

    // Export Canvas with HD resolution
    const exportCanvas = document.createElement('canvas');
    const targetW = 1200;
    const targetH = Math.round(targetW / aspectRatio);

    exportCanvas.width = targetW;
    exportCanvas.height = targetH;

    const ctx = exportCanvas.getContext('2d');
    if (!ctx) return;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Draw background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, targetW, targetH);

    ctx.save();
    ctx.translate(targetW / 2 + (offset.x * (targetW / 600)), targetH / 2 + (offset.y * (targetH / 350)));
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(zoom, zoom);

    let drawW = targetW * 0.95;
    let drawH = (img.height / img.width) * drawW;

    ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
    ctx.restore();

    exportCanvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], fileName.replace(/\.[^/.]+$/, "") + '.jpg', { type: 'image/jpeg' });
      const previewUrl = URL.createObjectURL(blob);
      onCropComplete(file, previewUrl);
      onClose();
    }, 'image/jpeg', 0.92);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 text-white shadow-2xl space-y-5 relative overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-500/20 text-sky-400 border border-sky-400/30 flex items-center justify-center text-lg">
              <i className="fa-solid fa-crop-simple"></i>
            </div>
            <div>
              <h3 className="text-lg font-black text-white">Potong &amp; Edit Gambar</h3>
              <p className="text-xs text-slate-400">Atur posisi dan rasio gambar agar tampil pas &amp; estetik di Beranda.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {/* Aspect Ratio Selector */}
        <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-950/60 p-2.5 rounded-2xl border border-slate-800/80">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider pl-1">Rasio Foto:</span>
          <div className="flex items-center gap-1.5">
            {[
              { label: '16:9 (Beranda)', val: 16 / 9 },
              { label: '4:3 (Berita)', val: 4 / 3 },
              { label: '1:1 (Persegi)', val: 1 },
              { label: 'Bebas', val: 3 / 2 },
            ].map((ratio) => (
              <button
                key={ratio.label}
                type="button"
                onClick={() => {
                  setAspectRatio(ratio.val);
                  setAspectLabel(ratio.label);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  aspectRatio === ratio.val
                    ? 'bg-sky-500 text-white shadow-md'
                    : 'bg-slate-800/80 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                {ratio.label}
              </button>
            ))}
          </div>
        </div>

        {/* Canvas Workspace */}
        <div 
          ref={containerRef}
          className="relative w-full h-[350px] bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 flex items-center justify-center cursor-grab active:cursor-grabbing shadow-inner"
        >
          <canvas
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleMouseUp}
            className="w-full h-full object-contain"
          />
          <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded-full border border-slate-700 text-[10px] font-bold text-sky-400 flex items-center gap-1">
            <i className="fa-solid fa-arrows-up-down-left-right"></i>
            <span>Geser gambar untuk menyesuaikan posisi</span>
          </div>
        </div>

        {/* Controls: Zoom & Rotate */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-950/60 p-3 rounded-2xl border border-slate-800/80">
          {/* Zoom Slider */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1">
              <i className="fa-solid fa-magnifying-glass-plus text-sky-400"></i> Zoom:
            </span>
            <input
              type="range"
              min={0.8}
              max={2.5}
              step={0.05}
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="w-full accent-sky-400 cursor-pointer"
            />
            <span className="text-xs font-mono font-bold text-sky-400 w-10 text-right">{Math.round(zoom * 100)}%</span>
          </div>

          {/* Rotation Controls */}
          <div className="flex items-center justify-end gap-2">
            <span className="text-xs font-bold text-slate-300">Putar Foto:</span>
            <button
              type="button"
              onClick={() => setRotation((prev) => (prev - 90) % 360)}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              title="Putar Kiri 90°"
            >
              <i className="fa-solid fa-rotate-left"></i> -90°
            </button>
            <button
              type="button"
              onClick={() => setRotation((prev) => (prev + 90) % 360)}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              title="Putar Kanan 90°"
            >
              <i className="fa-solid fa-rotate-right"></i> +90°
            </button>
            <button
              type="button"
              onClick={() => {
                setZoom(1);
                setRotation(0);
                setOffset({ x: 0, y: 0 });
              }}
              className="px-2.5 py-2 bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded-xl text-[11px] font-semibold transition-colors cursor-pointer"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end items-center gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-2xl text-xs transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleCropSave}
            className="px-6 py-2.5 bg-sky-500 hover:bg-sky-400 text-white font-black rounded-2xl text-xs transition-all shadow-lg flex items-center gap-2 cursor-pointer border-b-2 border-sky-700 active:border-b-0 active:translate-y-0.5"
          >
            <i className="fa-solid fa-check text-sm"></i>
            <span>Terapkan &amp; Potong Gambar</span>
          </button>
        </div>

      </div>
    </div>
  );
}
