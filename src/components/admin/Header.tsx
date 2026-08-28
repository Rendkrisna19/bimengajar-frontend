'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Swal from 'sweetalert2';
import { useTheme } from '@/components/ThemeProvider';
import { useNotifications } from '@/contexts/NotificationContext';
import { getImageUrl } from '@/lib/api';

interface HeaderProps {
  toggleSidebar: () => void;
}

interface UserProfile {
  id?: number;
  name: string;
  email: string;
  role?: string;
  foto_profil?: string | null;
}

export default function Header({ toggleSidebar }: HeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const isDarkMode = theme === 'dark';
  const { pendingCount, notifications, refreshNotifications } = useNotifications();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const loadUser = async () => {
    // Read from localStorage first for immediate rendering
    const stored = localStorage.getItem('user');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch (e) {
        console.error(e);
      }
    }

    // Fetch fresh user data from API
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });
        const data = await res.json();
        if (data.status === 'success' && data.user) {
          setUser(data.user);
          localStorage.setItem('user', JSON.stringify(data.user));
        }
      }
    } catch (e) {
      console.error('Error fetching user profile:', e);
    }
  };

  useEffect(() => {
    loadUser();

    // Event listener for profile update across components
    const handleUserUpdate = () => loadUser();
    window.addEventListener('user-updated', handleUserUpdate);

    // Close dropdowns on outside click
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('user-updated', handleUserUpdate);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    setIsProfileOpen(false);
    const result = await Swal.fire({
      title: 'Konfirmasi Keluar',
      text: 'Apakah Anda yakin ingin keluar dari Admin?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#003366',
      confirmButtonText: 'Ya, Keluar',
      cancelButtonText: 'Batal'
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/logout`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json'
            }
          });
        }
      } catch (err) {
        console.error('Logout error:', err);
      } finally {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
  };

  const getInitial = (name?: string) => {
    if (!name) return 'A';
    return name.charAt(0).toUpperCase();
  };

  return (
    <header className="h-16 bg-white dark:bg-[#1e1e1e] flex items-center justify-between px-4 lg:px-6 shrink-0 transition-colors shadow-sm relative z-30">
      <div className="flex items-center gap-4">
        <button 
          onClick={toggleSidebar}
          className="w-10 h-10 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          title="Toggle Sidebar"
        >
          <i className="fa-solid fa-bars text-lg" />
        </button>

        <div className="hidden md:flex items-center bg-gray-50 dark:bg-gray-800/50 px-4 py-2 rounded-full border border-gray-100 dark:border-gray-800 focus-within:border-primary/50 transition-colors">
          <i className="fa-solid fa-magnifying-glass text-gray-400 text-sm" />
          <input 
            type="text" 
            placeholder="Cari..." 
            className="bg-transparent border-none outline-none ml-2 text-sm text-gray-700 dark:text-gray-200 w-48 placeholder:text-gray-400"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        {/* Link to Public Website */}
        <Link
          href="/"
          target="_blank"
          className="px-3 py-1.5 rounded-full text-xs font-semibold text-[#003366] dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 border border-blue-200 dark:border-blue-800 transition-all flex items-center gap-2 shadow-xs"
          title="Lihat Website Beranda (Tab Baru)"
        >
          <i className="fa-solid fa-globe text-sm"></i>
          <span className="hidden sm:inline">Lihat Website</span>
        </Link>

        {/* Dark/Light Mode Toggle */}
        <button 
          onClick={toggleTheme}
          className="w-10 h-10 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative"
          title="Ganti Tema"
        >
          <i className={`fa-solid ${isDarkMode ? 'fa-sun text-yellow-500' : 'fa-moon text-gray-600'} text-lg transition-all duration-300 ${isDarkMode ? 'rotate-180 scale-110' : 'rotate-0 scale-100'}`} />
        </button>

        {/* Notification Bell Dropdown */}
        <div className="relative" ref={notifRef}>
          <button 
            onClick={() => { setIsNotifOpen(!isNotifOpen); setIsProfileOpen(false); }}
            className="w-10 h-10 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative"
            title="Notifikasi Pengajuan"
          >
            <i className="fa-regular fa-bell text-xl" />
            {pendingCount > 0 && (
              <span className="absolute top-1 right-1 px-1.5 py-0.5 bg-red-500 text-white font-extrabold text-[10px] rounded-full border-2 border-white dark:border-gray-800 animate-pulse shadow-sm min-w-[18px] text-center leading-none">
                {pendingCount}
              </span>
            )}
          </button>

          {/* Dropdown Popup */}
          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-[#1e1e1e] rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              {/* Dropdown Header */}
              <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/70 dark:bg-gray-800/30">
                <div>
                  <h3 className="font-bold text-sm text-gray-800 dark:text-white flex items-center gap-2">
                    <span>Pengajuan Kunjungan</span>
                    {pendingCount > 0 && (
                      <span className="px-2 py-0.5 bg-red-500 text-white text-[10px] font-extrabold rounded-full">
                        {pendingCount} Baru
                      </span>
                    )}
                  </h3>
                  <p className="text-[11px] text-gray-400 mt-0.5">Memuat otomatis setiap 10 detik</p>
                </div>
                <button 
                  onClick={() => refreshNotifications()}
                  className="text-gray-400 hover:text-primary transition-colors p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-xs"
                  title="Perbarui Notifikasi"
                >
                  <i className="fa-solid fa-rotate"></i>
                </button>
              </div>

              {/* Notifications List */}
              <div className="max-h-80 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800 custom-scrollbar">
                {notifications.length === 0 ? (
                  <div className="py-8 px-4 text-center">
                    <div className="w-12 h-12 rounded-full bg-green-50 dark:bg-green-900/20 text-green-500 flex items-center justify-center mx-auto mb-2 text-lg">
                      <i className="fa-solid fa-check"></i>
                    </div>
                    <p className="text-xs font-bold text-gray-700 dark:text-gray-300">Tidak ada pengajuan baru</p>
                    <p className="text-[11px] text-gray-400 mt-1">Semua pengajuan kunjungan telah diproses.</p>
                  </div>
                ) : (
                  notifications.map((item) => (
                    <Link
                      key={item.id}
                      href="/admin/kunjungan"
                      onClick={() => setIsNotifOpen(false)}
                      className="p-3.5 flex items-start gap-3 hover:bg-blue-50/50 dark:hover:bg-gray-800/40 transition-colors group block"
                    >
                      <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-primary dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                        <i className="fa-solid fa-building-circle-arrow-right text-sm"></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <h4 className="text-xs font-bold text-gray-900 dark:text-white truncate">
                            {item.nama_instansi}
                          </h4>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 rounded uppercase shrink-0">
                            {item.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-600 dark:text-gray-300 line-clamp-1">
                          {item.tema_kegiatan}
                        </p>
                        <div className="flex items-center gap-2 text-[10px] text-gray-400 mt-1">
                          <span><i className="fa-solid fa-user-tie text-[9px] mr-1"></i>{item.nama_pic}</span>
                          <span>•</span>
                          <span><i className="fa-regular fa-calendar text-[9px] mr-1"></i>{new Date(item.tanggal_kegiatan).toLocaleDateString('id-ID')}</span>
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </div>

              {/* Dropdown Footer */}
              <div className="p-2.5 border-t border-gray-100 dark:border-gray-800 text-center bg-gray-50/50 dark:bg-gray-800/20">
                <Link
                  href="/admin/kunjungan"
                  onClick={() => setIsNotifOpen(false)}
                  className="text-xs font-bold text-primary dark:text-blue-400 hover:underline inline-flex items-center gap-1.5"
                >
                  <span>Lihat Semua Pengajuan Kunjungan</span>
                  <i className="fa-solid fa-arrow-right text-[10px]"></i>
                </Link>
              </div>
            </div>
          )}
        </div>

        <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1 md:mx-2" />

        {/* User Profile Info & Dropdown */}
        <div className="relative" ref={profileRef}>
          <div 
            onClick={() => { setIsProfileOpen(!isProfileOpen); setIsNotifOpen(false); }}
            className="flex items-center gap-3 cursor-pointer p-1 pr-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border border-transparent dark:border-gray-800 select-none"
          >
            <div className="w-9 h-9 rounded-full bg-[#003366] flex items-center justify-center text-white font-bold text-sm overflow-hidden border-2 border-white dark:border-gray-700 shadow-sm relative shrink-0">
              {user?.foto_profil ? (
                <img 
                  src={getImageUrl(user.foto_profil)} 
                  alt={user.name} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{getInitial(user?.name)}</span>
              )}
            </div>
            <div className="hidden md:flex flex-col text-left">
              <span className="text-[13px] font-bold text-gray-800 dark:text-gray-100 max-w-[140px] truncate">
                {user?.name || 'Administrator'}
              </span>
              <span className="text-[11px] text-green-500 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Online
              </span>
            </div>
            <i className={`fa-solid fa-chevron-down text-xs text-gray-400 hidden md:block transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`}></i>
          </div>

          {/* Profile Dropdown Menu */}
          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-[#1e1e1e] rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              <div className="p-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-800/30 flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-[#003366] text-white font-bold text-base flex items-center justify-center overflow-hidden shrink-0 border-2 border-white dark:border-gray-700 shadow-xs">
                  {user?.foto_profil ? (
                    <img 
                      src={getImageUrl(user.foto_profil)} 
                      alt={user.name} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>{getInitial(user?.name)}</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-sm text-gray-900 dark:text-white truncate">
                    {user?.name || 'Administrator'}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {user?.email || 'admin@plat-bk.com'}
                  </p>
                  <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-extrabold bg-blue-100 dark:bg-blue-900/50 text-[#003366] dark:text-blue-300 rounded-md capitalize">
                    {user?.role || 'Admin'}
                  </span>
                </div>
              </div>

              <div className="p-2 space-y-1">
                <Link
                  href="/admin/profil"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                >
                  <i className="fa-solid fa-user-pen text-base text-primary dark:text-blue-400 w-5 text-center"></i>
                  <span>Edit Profil</span>
                </Link>

                <Link
                  href="/"
                  target="_blank"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                >
                  <i className="fa-solid fa-globe text-base text-green-500 w-5 text-center"></i>
                  <span>Lihat Website</span>
                </Link>

                <div className="border-t border-gray-100 dark:border-gray-800 my-1"></div>

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-3 py-2.5 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-colors w-full text-left"
                >
                  <i className="fa-solid fa-right-from-bracket text-base text-red-500 w-5 text-center"></i>
                  <span>Keluar dari System</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}