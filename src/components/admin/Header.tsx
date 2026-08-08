'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useTheme } from '@/components/ThemeProvider';
import { useNotifications } from '@/contexts/NotificationContext';

interface HeaderProps {
  toggleSidebar: () => void;
}

export default function Header({ toggleSidebar }: HeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const isDarkMode = theme === 'dark';
  const { pendingCount, notifications, refreshNotifications } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
        {/* Dark/Light Mode Toggle */}
        <button 
          onClick={toggleTheme}
          className="w-10 h-10 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative"
          title="Ganti Tema"
        >
          <i className={`fa-solid ${isDarkMode ? 'fa-sun text-yellow-500' : 'fa-moon text-gray-600'} text-lg transition-all duration-300 ${isDarkMode ? 'rotate-180 scale-110' : 'rotate-0 scale-100'}`} />
        </button>

        {/* Notification Bell Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setIsOpen(!isOpen)}
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
          {isOpen && (
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
                      onClick={() => setIsOpen(false)}
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
                  onClick={() => setIsOpen(false)}
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

        {/* User Profile Info */}
        <div className="flex items-center gap-3 cursor-pointer p-1 pr-3 rounded-full hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border border-transparent dark:border-gray-800">
          <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm overflow-hidden border-2 border-white dark:border-gray-700 shadow-sm">
             A
          </div>
          <div className="hidden md:flex flex-col">
            <span className="text-[13px] font-bold text-gray-800 dark:text-gray-100">Administrator</span>
            <span className="text-[11px] text-green-500 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" /> Online
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}