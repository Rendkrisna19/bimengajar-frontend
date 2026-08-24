'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function PWAInstaller() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  useEffect(() => {
    // 1. Register Service Worker
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('PWA ServiceWorker registered with scope:', registration.scope);
          })
          .catch((error) => {
            console.error('PWA ServiceWorker registration failed:', error);
          });
      });
    }

    // 2. Listen to beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Hanya tampilkan di perangkat mobile / Android / tablet kecil (< 768px atau mobile UA)
      const isMobileDevice = 
        typeof window !== 'undefined' &&
        (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
          window.innerWidth < 768);

      if (isMobileDevice) {
        setShowInstallBanner(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to install prompt: ${outcome}`);
    setDeferredPrompt(null);
    setShowInstallBanner(false);
  };

  if (!showInstallBanner) return null;

  return (
    <div className="md:hidden fixed bottom-6 left-4 right-4 bg-primary/95 text-white backdrop-blur-xl p-4 rounded-2xl shadow-2xl border border-white/20 z-50 animate-bounce-short flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-white p-1 shrink-0 shadow-md flex items-center justify-center overflow-hidden">
          <Image 
            src="/images/logo.png" 
            alt="Logo BI Mengajar App" 
            width={48} 
            height={48} 
            className="w-full h-full object-contain"
          />
        </div>
        <div>
          <h4 className="font-extrabold text-sm text-white leading-tight">Install BI Mengajar</h4>
          <p className="text-[11px] text-blue-100/90 leading-tight">Pasang aplikasi di HP/Android Anda untuk akses lebih cepat!</p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={handleInstallClick}
          className="bg-accent-yellow hover:bg-yellow-400 text-primary font-black px-4 py-2 rounded-xl text-xs shadow-md transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
        >
          <i className="fa-solid fa-download"></i> Install
        </button>
        <button
          onClick={() => setShowInstallBanner(false)}
          className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 flex items-center justify-center text-xs transition-colors cursor-pointer"
          aria-label="Tutup"
        >
          <i className="fa-solid fa-xmark"></i>
        </button>
      </div>
    </div>
  );
}
