'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
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
    if (pathname === '/user/dashboard/kuis') return 'Kuis';
    if (pathname === '/user/dashboard/riwayat') return 'Riwayat Pengajuan';
    if (pathname === '/user/dashboard/profil') return 'Profil';
    return 'BI-MENGAJAR';
  };

  const navItems = [
    { label: 'Beranda', href: '/user/dashboard', icon: 'fa-solid fa-house' },
    { label: 'Kuis', href: '/user/dashboard/kuis', icon: 'fa-solid fa-file-lines' },
    { label: 'Riwayat', href: '/user/dashboard/riwayat', icon: 'fa-solid fa-clock-rotate-left' },
    { label: 'Profil', href: '/user/dashboard/profil', icon: 'fa-solid fa-user' },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center">
      {/* Centered Mobile App Container (exactly like the mobile screens layout on all viewports) */}
      <div className="w-full max-w-md min-h-screen bg-slate-50 flex flex-col relative shadow-xl border-x border-slate-200/50 pb-20">
        
        {/* Mobile-Style Top Header Bar */}
        <header className="sticky top-0 z-40 bg-white border-b border-slate-100/80 px-5 h-16 flex items-center justify-between shrink-0">
          <h1 className="text-lg font-extrabold text-primary tracking-tight">
            {getHeaderTitle()}
          </h1>

          <div className="flex items-center gap-3">
            {/* Notification Bell */}
            <button className="w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:text-primary hover:bg-slate-50 transition-colors relative border border-slate-100">
              <i className="fa-regular fa-bell text-base"></i>
              <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-red-500 rounded-full"></span>
            </button>
            
            {/* Profile Avatar */}
            <Link 
              href="/user/dashboard/profil" 
              className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-white shadow-sm border-2 border-white cursor-pointer hover:scale-105 transition-transform"
            >
              {initials}
            </Link>
          </div>
        </header>

        {/* Main Content Viewport */}
        <main className="flex-1 overflow-y-auto px-5 py-6">
          {children}
        </main>

        {/* Mobile Bottom Bar (sticky inside the phone viewport container) */}
        <nav className="absolute bottom-0 left-0 right-0 h-16 bg-white border-t border-slate-100 flex items-center justify-around px-2 z-40 shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.label}
                href={item.href}
                className="flex-1 flex justify-center py-1"
              >
                <div 
                  className={`flex flex-col items-center justify-center w-16 py-1.5 rounded-2xl transition-all ${
                    isActive 
                      ? 'bg-blue-50/80 text-primary scale-105' 
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
        
      </div>
    </div>
  );
}
