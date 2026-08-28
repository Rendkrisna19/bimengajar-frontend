'use client';
import { useState } from 'react';
import Sidebar from '@/components/admin/Sidebar';
import Header from '@/components/admin/Header';
import { ThemeProvider } from '@/components/ThemeProvider';
import { NotificationProvider } from '@/contexts/NotificationContext';

import { Plus_Jakarta_Sans } from 'next/font/google';

const plusJakartaSans = Plus_Jakarta_Sans({ subsets: ['latin'] });

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <ThemeProvider>
      <NotificationProvider>
        <div className={`flex h-screen bg-white dark:bg-[#121212] transition-colors duration-300 overflow-hidden ${plusJakartaSans.className}`}>
          {/* Sidebar Nempel Tanpa Jarak, tanpa border kanan agar menyatu */}
          <Sidebar isCollapsed={isSidebarCollapsed} toggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />
          
          {/* Main Content Area */}
          <div className="flex-1 flex flex-col h-screen overflow-hidden bg-white dark:bg-[#121212] relative">
            <div 
              className="absolute inset-0 opacity-[0.05] dark:opacity-[0.03] pointer-events-none bg-no-repeat bg-right-bottom"
              style={{ backgroundImage: 'url("/images/element/2.png")', backgroundSize: '50%' }} 
            ></div>
            <div className="flex-1 flex flex-col overflow-hidden relative">
              <Header 
                toggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
              />
              
              <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-6 text-gray-800 dark:text-gray-100">
                {children}
              </main>
              
              <footer className="py-4 px-6 text-center text-sm font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-[#1e1e1e] transition-colors shadow-[0_-1px_2px_rgba(0,0,0,0.02)]">
                &copy; {new Date().getFullYear()} BI Mengajar Siantar. All rights reserved.
              </footer>
            </div>
          </div>

        </div>
      </NotificationProvider>
    </ThemeProvider>
  );
}
