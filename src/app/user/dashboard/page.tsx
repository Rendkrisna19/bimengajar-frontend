'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function UserDashboardBeranda() {
  const [userName, setUserName] = useState('Pengguna');
  const [greeting, setGreeting] = useState('Selamat Pagi');
  const [currentDate, setCurrentDate] = useState('');
  const [greetingIcon, setGreetingIcon] = useState('fa-sun');

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

    // Format date in Indonesian
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    };
    setCurrentDate(new Date().toLocaleDateString('id-ID', options));
  }, []);

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Date badge and welcome layout */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#003366] to-[#002244] p-6 md:p-8 text-white shadow-md border border-blue-900/10">
        {/* Motif background building */}
        <div className="absolute right-4 bottom-0 opacity-10 pointer-events-none">
          <i className="fa-solid fa-building-columns text-[150px] md:text-[200px]"></i>
        </div>
        
        <div className="relative z-10 flex flex-col gap-4">
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm px-3.5 py-1 rounded-full text-xs font-semibold w-fit">
            <i className="fa-regular fa-calendar"></i> {currentDate}
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight leading-tight">
              {greeting},<br />
              <span className="capitalize">{userName.toLowerCase()}</span>.
            </h1>
            <p className="text-blue-100/90 text-xs md:text-sm mt-3 max-w-md leading-relaxed">
              Selamat datang kembali di <strong>PLATFORM EDUKASI</strong> — ruang belajarmu untuk Cinta, Bangga, dan Paham Rupiah.
            </p>
          </div>
        </div>
      </div>

      {/* Row Cards (Peran, Misi, Laman) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Peran */}
        <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-primary">
              <i className="fa-solid fa-user-graduate text-base"></i>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Peran Kamu</p>
              <p className="text-sm font-bold text-slate-800">Pelajar</p>
            </div>
          </div>
          <i className="fa-solid fa-chevron-right text-xs text-slate-300"></i>
        </div>

        {/* Misi */}
        <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-primary">
              <i className="fa-solid fa-bullseye text-base"></i>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Misi Hari Ini</p>
              <p className="text-sm font-bold text-slate-800">Belajar Rupiah</p>
            </div>
          </div>
          <i className="fa-solid fa-chevron-right text-xs text-slate-300"></i>
        </div>

        <div className="flex flex-col justify-between p-5 bg-white rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden group">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-primary">
                <i className="fa-solid fa-building-columns text-base"></i>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">Laman Utama Platform</p>
                <p className="text-[10px] text-slate-400">Cinta, Bangga, & Paham Rupiah</p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 px-2 py-0.5 rounded-full text-[9px] font-extrabold border border-green-200">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
              Laman Resmi
            </span>
          </div>
          <Link 
            href="/" 
            target="_blank" 
            className="w-full text-center bg-primary hover:bg-[#002244] text-white text-xs font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-sm"
          >
            Kunjungi Laman <i className="fa-solid fa-arrow-up-right-from-square text-[10px]"></i>
          </Link>
        </div>
      </div>

      {/* Quiz Section */}
      <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <i className="fa-solid fa-gamepad text-primary"></i> Quiz Tersedia
          </h3>
          <Link href="/user/dashboard/kuis" className="text-xs font-bold text-primary hover:underline">
            Lihat Semua
          </Link>
        </div>

        {/* Empty State matching design */}
        <div className="bg-slate-50/50 border border-slate-100 rounded-2xl flex flex-col items-center justify-center py-10 px-4 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
            <i className="fa-regular fa-circle-question text-xl text-slate-400"></i>
          </div>
          <p className="text-slate-700 font-bold text-sm">Belum ada quiz yang tersedia saat ini.</p>
          <p className="text-slate-400 text-xs mt-0.5">Quiz baru akan segera hadir. Tetap semangat belajar!</p>
        </div>
      </div>
    </div>
  );
}
