'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [initials, setInitials] = useState('U');

  useEffect(() => {
    // Auth check
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (!token || !userStr) {
      router.push('/login');
      return;
    }

    try {
      const user = JSON.parse(userStr);
      if (user.role !== 'user') {
        router.push('/admin');
        return;
      }

      // Generate initials from name
      if (user.name) {
        const names = user.name.split(' ');
        if (names.length >= 2) {
          setInitials((names[0][0] + names[names.length - 1][0]).toUpperCase());
        } else {
          setInitials(names[0].substring(0, 2).toUpperCase());
        }
      }
    } catch (e) {
      router.push('/login');
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-[#070F24] text-gray-100 font-sans selection:bg-blue-500/30">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 bg-[#0A132B]/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
          
          {/* Left: Logo & Nav Links */}
          <div className="flex items-center gap-10">
            <Link href="/dashboard" className="text-xl font-bold tracking-wider text-white">
              BI-TEACH
            </Link>
            
            <nav className="hidden md:flex items-center gap-2">
              <Link 
                href="/dashboard"
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname === '/dashboard' 
                    ? 'bg-white/10 text-white' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <i className="fa-solid fa-house text-xs"></i> Dasbor
              </Link>
              <Link 
                href="/dashboard/kuis"
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname?.includes('/kuis') 
                    ? 'bg-white/10 text-white' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <i className="fa-regular fa-circle-question text-xs"></i> Kuis
              </Link>
              <Link 
                href="/dashboard/riwayat"
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname?.includes('/riwayat') 
                    ? 'bg-white/10 text-white' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <i className="fa-solid fa-file-lines text-xs"></i> Riwayat Pengajuan
              </Link>
            </nav>
          </div>

          {/* Right: Profile Avatar */}
          <div className="flex items-center gap-4">
            <button 
              onClick={() => {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                router.push('/login');
              }}
              className="text-xs text-gray-400 hover:text-white transition-colors mr-2"
            >
              Logout
            </button>
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center text-xs font-bold text-white shadow-lg border border-white/10 cursor-pointer hover:opacity-90 transition-opacity">
              {initials}
            </div>
          </div>
          
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1400px] mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  );
}
