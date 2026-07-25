'use client';
import { useState } from 'react';
import Sidebar from '@/components/admin/Sidebar';
import Header from '@/components/admin/Header';
import { ThemeProvider } from '@/components/ThemeProvider';

import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <ThemeProvider>
      <div className={`flex h-screen bg-white dark:bg-[#121212] transition-colors duration-300 overflow-hidden ${inter.className}`}>
        {/* Sidebar Nempel Tanpa Jarak, tanpa border kanan agar menyatu */}
        <Sidebar isCollapsed={isSidebarCollapsed} toggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />
        
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col h-screen overflow-hidden bg-gray-50 dark:bg-[#121212]">
          <Header 
            toggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
          />
          
          <main className="flex-1 overflow-y-auto p-4 md:p-6 text-gray-800 dark:text-gray-100">
            {children}
          </main>
          
          <footer className="py-4 px-6 text-center text-sm font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-[#1e1e1e] transition-colors shadow-[0_-1px_2px_rgba(0,0,0,0.02)]">
            &copy; {new Date().getFullYear()} BI Mengajar Siantar. All rights reserved.
          </footer>
        </div>
      </div>
    </ThemeProvider>
  );
}
