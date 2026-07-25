'use client';

import React, { useEffect, useState } from 'react';

export default function DashboardPage() {
  const [userName, setUserName] = useState('');
  const [greeting, setGreeting] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [greetingIcon, setGreetingIcon] = useState('fa-moon'); // Default moon

  useEffect(() => {
    // Get user from local storage
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setUserName(user.name || 'Pengguna');
      } catch (e) {
        setUserName('Pengguna');
      }
    }

    // Determine greeting based on time
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      setGreeting('Selamat Pagi');
      setGreetingIcon('fa-sun');
    } else if (hour >= 12 && hour < 15) {
      setGreeting('Selamat Siang');
      setGreetingIcon('fa-sun');
    } else if (hour >= 15 && hour < 18) {
      setGreeting('Selamat Sore');
      setGreetingIcon('fa-cloud-sun');
    } else {
      setGreeting('Selamat Malam');
      setGreetingIcon('fa-moon');
    }

    // Format date in Indonesian (e.g., Minggu, 26 Juli 2026)
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    };
    setCurrentDate(new Date().toLocaleDateString('id-ID', options));
  }, []);

  return (
    <div className="flex flex-col gap-8 w-full max-w-6xl">
      <h1 className="text-3xl font-bold text-white tracking-tight">Dasbor</h1>

      {/* Top Cards Section */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-6">
        
        {/* LEFT CARD: Welcome */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1c5f9b] via-[#103a6b] to-[#0a2347] p-8 md:p-10 shadow-2xl border border-blue-400/20 flex flex-col md:flex-row gap-8 justify-between group">
          {/* Decorative glow */}
          <div className="absolute top-0 left-0 w-full h-full bg-blue-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none blur-3xl"></div>
          
          <div className="flex flex-col z-10 relative max-w-sm">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full text-sm font-medium text-blue-100 border border-white/10 w-fit mb-6">
              <i className={`fa-solid ${greetingIcon} text-blue-300`}></i> {currentDate}
            </div>
            
            <h2 className="text-4xl md:text-5xl font-extrabold text-white leading-tight tracking-tight mb-4 drop-shadow-sm">
              {greeting},<br />{userName}.
            </h2>
            
            <p className="text-blue-100/80 text-sm md:text-base leading-relaxed">
              Selamat datang kembali di <strong className="text-white">BI-TEACH</strong> — ruang belajarmu untuk Cinta, Bangga, dan Paham Rupiah.
            </p>
          </div>

          {/* Right Info Boxes */}
          <div className="flex flex-col gap-4 z-10 relative w-full md:w-auto min-w-[200px] justify-center">
            {/* Box 1 */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 shadow-inner">
              <p className="text-[10px] font-bold tracking-widest text-blue-200/70 uppercase mb-1">Peran Kamu</p>
              <p className="text-lg font-bold text-white">Pelajar</p>
            </div>
            {/* Box 2 */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 shadow-inner relative overflow-hidden">
              <div className="absolute -right-4 -bottom-4 opacity-20">
                <i className="fa-solid fa-star text-5xl text-yellow-400"></i>
              </div>
              <p className="text-[10px] font-bold tracking-widest text-blue-200/70 uppercase mb-1">Misi Hari Ini</p>
              <p className="text-lg font-bold text-white flex items-center justify-between">
                Belajar Rupiah
                <i className="fa-solid fa-sparkles text-blue-300 text-sm ml-2"></i>
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT CARD: Laman BI-TEACH */}
        <div className="relative overflow-hidden rounded-3xl bg-[#091533] border border-white/5 p-8 flex flex-col justify-between shadow-xl group">
          {/* Background pattern (simulated with CSS gradients) */}
          <div className="absolute inset-0 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity duration-500" 
               style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}>
          </div>
          {/* Subtle glow right */}
          <div className="absolute top-1/2 right-0 -translate-y-1/2 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="flex justify-between items-start z-10 relative">
            {/* Logo placeholder */}
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/20">
               <i className="fa-solid fa-building-columns text-2xl text-[#091533]"></i>
            </div>
            
            <div className="inline-flex items-center gap-1.5 bg-[#0d1f4a] px-3 py-1 rounded-full border border-blue-500/20 text-xs font-medium text-blue-200">
              <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
              Laman Resmi
            </div>
          </div>

          <div className="flex items-end justify-between z-10 relative mt-16">
            <div>
              <h3 className="text-2xl font-bold text-white mb-1">Laman BI-TEACH</h3>
              <p className="text-gray-400 text-sm">Cinta, Bangga, & Paham Rupiah.</p>
            </div>
            <a 
              href="/" 
              target="_blank" 
              rel="noreferrer"
              className="bg-[#124b89] hover:bg-[#1a5b9e] text-white text-sm font-medium px-5 py-2.5 rounded-full transition-colors flex items-center gap-2 shadow-lg"
            >
              Kunjungi Laman <i className="fa-solid fa-arrow-up-right-from-square text-[11px]"></i>
            </a>
          </div>
        </div>
      </div>

      {/* BOTTOM SECTION: Quizzes */}
      <div className="mt-4 bg-[#0A142A] rounded-3xl border border-white/5 p-8 shadow-lg relative overflow-hidden">
        {/* Subtle top reflection */}
        <div className="absolute top-0 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
        
        <div className="flex items-center justify-between mb-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="inline-flex items-center gap-2 bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full text-xs font-semibold border border-blue-500/20">
              <i className="fa-solid fa-gamepad"></i> Quiz Interaktif
            </div>
            <h3 className="text-xl font-bold text-white">Quiz Tersedia</h3>
          </div>
          <span className="text-gray-500 text-sm font-medium">0 pilihan</span>
        </div>

        {/* Empty State Box */}
        <div className="bg-[#0f1b38]/50 border border-[#1a2b54] rounded-2xl flex flex-col items-center justify-center py-20 px-4 text-center relative z-10 backdrop-blur-sm">
          <div className="w-16 h-16 rounded-full bg-[#162447] flex items-center justify-center mb-4 border border-white/5 shadow-inner">
            <i className="fa-regular fa-circle-question text-3xl text-gray-400"></i>
          </div>
          <p className="text-gray-300 font-medium text-lg">Belum ada quiz yang tersedia saat ini.</p>
          <p className="text-gray-500 text-sm mt-1">Cek lagi nanti, ya! <i className="fa-solid fa-sparkles text-xs opacity-50 ml-1"></i></p>
        </div>
      </div>

    </div>
  );
}
