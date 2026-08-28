'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';

export default function UserDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [initials, setInitials] = useState('RK');
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');

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

      if (user.name) {
        setUserName(user.name);
        setUserEmail(user.email || '');
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

  // Determine top bar title based on route
  const getHeaderTitle = () => {
    if (pathname === '/user/dashboard/kuis') return 'Kuis Interaktif';
    if (pathname === '/user/dashboard/riwayat') return 'Riwayat Pengajuan';
    if (pathname === '/user/dashboard/profil') return 'Profil Saya';
    return 'Dashboard Peserta';
  };

  const navItems = [
    { label: 'Beranda', href: '/user/dashboard', icon: 'fa-solid fa-house' },
    { label: 'Kuis Interaktif', href: '/user/dashboard/kuis', icon: 'fa-solid fa-gamepad' },
    { label: 'Riwayat', href: '/user/dashboard/riwayat', icon: 'fa-solid fa-clock-rotate-left' },
    { label: 'Profil', href: '/user/dashboard/profil', icon: 'fa-solid fa-user' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-slate-100/90 text-slate-800 font-sans flex flex-col justify-between">
      
      {/* TOP DESKTOP & MOBILE NAVIGATION HEADER */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-4">
          
          {/* Brand Logo & Page Title */}
          <div className="flex items-center gap-3 md:gap-4">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center text-white shadow-md border border-sky-400/30 group-hover:scale-105 transition-transform">
                <Image
                  src="/images/logo.png?v=2"
                  alt="Logo PLAT-BK"
                  width={36}
                  height={36}
                  className="w-7 h-7 object-contain"
                  priority
                  unoptimized
                />
              </div>
              <div className="hidden sm:flex flex-col">
                <span className="font-bold text-sm text-primary tracking-tight leading-none">PLATFORM</span>
                <span className="text-[10px] text-slate-400 font-medium mt-0.5">Dashboard Edukasi</span>
              </div>
            </Link>

            <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>

            <h1 className="text-base sm:text-lg font-bold text-slate-800 tracking-tight">
              {getHeaderTitle()}
            </h1>
          </div>

          {/* DESKTOP NAVIGATION TABS */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/80">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                    isActive
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <i className={`${item.icon} text-sm ${isActive ? 'text-yellow-300' : 'text-slate-400'}`}></i>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* USER AVATAR & QUICK ACTIONS */}
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-semibold transition-colors"
            >
              <i className="fa-solid fa-arrow-left text-xs"></i>
              <span>Ke Landing Page</span>
            </Link>

            {/* Profile Avatar Badge */}
            <div className="flex items-center gap-2 bg-slate-50 p-1 pr-3 rounded-full border border-slate-200/80">
              <Link 
                href="/user/dashboard/profil" 
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-white shadow-sm border-2 border-white cursor-pointer hover:scale-105 transition-transform"
              >
                {initials}
              </Link>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-bold text-slate-800 leading-none truncate max-w-[110px]">{userName}</span>
                <span className="text-[10px] font-medium text-sky-700 mt-0.5">Peserta BI</span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
              title="Keluar / Logout"
            >
              <i className="fa-solid fa-right-from-bracket text-base"></i>
            </button>
          </div>
        </div>
      </header>

      {/* MAIN RESPONSIVE CONTENT VIEWPORT */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 mb-20 md:mb-8">
        {children}
      </main>

      {/* MOBILE BOTTOM NAVIGATION BAR (md:hidden) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-md border-t border-slate-200 flex items-center justify-around px-2 z-40 shadow-lg">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.label}
              href={item.href}
              className="flex-1 flex justify-center py-1"
            >
              <div 
                className={`flex flex-col items-center justify-center w-16 py-1 rounded-2xl transition-all ${
                  isActive 
                    ? 'bg-sky-50 text-primary scale-105 font-black' 
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <i className={`${item.icon} text-base`}></i>
                <span className="text-[9px] font-extrabold mt-0.5 tracking-tight">{item.label}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* FOOTER FOR DESKTOP */}
      <footer className="hidden md:block py-6 bg-white border-t border-slate-200/80 text-center text-xs font-semibold text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <span>&copy; {new Date().getFullYear()} Bank Indonesia Pematangsiantar - Platform Edukasi.</span>
          <span className="text-sky-800 font-bold">Cinta, Bangga, Paham Rupiah</span>
        </div>
      </footer>

    </div>
  );
}
