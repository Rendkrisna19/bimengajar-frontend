'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getQuizScoresHistory, QuizHistoryRecord } from '@/lib/quizData';

export default function UserDashboardBeranda() {
  const [userName, setUserName] = useState('Pengguna');
  const [greeting, setGreeting] = useState('Selamat Pagi');
  const [currentDate, setCurrentDate] = useState('');
  const [leaderboard, setLeaderboard] = useState<QuizHistoryRecord[]>([]);

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
    } else if (hour >= 12 && hour < 15) {
      setGreeting('Selamat Siang');
    } else if (hour >= 15 && hour < 18) {
      setGreeting('Selamat Sore');
    } else {
      setGreeting('Selamat Malam');
    }

    // Format date in Indonesian
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    };
    setCurrentDate(new Date().toLocaleDateString('id-ID', options));

    // Load leaderboard scores
    const loadScores = () => {
      const history = getQuizScoresHistory();
      const sorted = [...history].sort((a, b) => b.score - a.score).slice(0, 5);
      setLeaderboard(sorted);
    };

    loadScores();
    window.addEventListener('quiz_scores_update', loadScores);
    return () => {
      window.removeEventListener('quiz_scores_update', loadScores);
    };
  }, []);

  return (
    <div className="flex flex-col gap-6 w-full font-sans">
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
                <p className="text-[10px] text-slate-400">Cinta, Bangga, &amp; Paham Rupiah</p>
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

      {/* Quiz & Leaderboard Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Available Quizzes */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <i className="fa-solid fa-gamepad text-primary"></i> Kuis Interaktif Tersedia
              </h3>
              <Link href="/user/dashboard/kuis" className="text-xs font-bold text-primary hover:underline">
                Lihat Semua Kuis <i className="fa-solid fa-arrow-right ml-1"></i>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Card 1 */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50/80 to-slate-50 border border-blue-100 flex flex-col justify-between gap-3 group hover:shadow-md transition-all">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-100 text-primary rounded-md">Kebanksentralan</span>
                  <h4 className="text-sm font-bold text-slate-900 leading-snug group-hover:text-primary transition-colors">
                    Kuis Kebanksentralan &amp; Peran Bank Indonesia
                  </h4>
                  <p className="text-xs text-slate-500 line-clamp-2">
                    Uji pengetahuanmu mengenai tugas pokok dan tujuan tunggal Bank Indonesia.
                  </p>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-blue-100/60 text-xs">
                  <span className="text-slate-400 font-medium"><i className="fa-regular fa-clock mr-1"></i>5 Menit</span>
                  <Link href="/user/dashboard/kuis" className="px-3 py-1.5 bg-primary text-white font-bold text-xs rounded-xl shadow-xs hover:bg-sky-700 transition-colors">
                    Mulai <i className="fa-solid fa-play text-[10px] ml-1"></i>
                  </Link>
                </div>
              </div>

              {/* Card 2 */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50/80 to-slate-50 border border-amber-100 flex flex-col justify-between gap-3 group hover:shadow-md transition-all">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-100 text-amber-900 rounded-md">CBP Rupiah</span>
                  <h4 className="text-sm font-bold text-slate-900 leading-snug group-hover:text-amber-700 transition-colors">
                    Kuis Cinta, Bangga, Paham Rupiah
                  </h4>
                  <p className="text-xs text-slate-500 line-clamp-2">
                    Kenali ciri keaslian Uang Rupiah dan prinsip 5J dalam merawat uang Rupiah.
                  </p>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-amber-100/60 text-xs">
                  <span className="text-slate-400 font-medium"><i className="fa-regular fa-clock mr-1"></i>5 Menit</span>
                  <Link href="/user/dashboard/kuis" className="px-3 py-1.5 bg-amber-500 text-white font-bold text-xs rounded-xl shadow-xs hover:bg-amber-600 transition-colors">
                    Mulai <i className="fa-solid fa-play text-[10px] ml-1"></i>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Leaderboard Skor Kuis Tertinggi */}
        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <i className="fa-solid fa-trophy text-amber-500"></i> Leaderboard Top Skor
            </h3>
            <Link href="/user/dashboard/kuis" className="text-[10px] font-bold px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-full hover:bg-amber-100 transition-colors">
              Lihat Kuis
            </Link>
          </div>

          <div className="space-y-2.5">
            {leaderboard.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">Belum ada skor kuis tercatat.</p>
            ) : (
              leaderboard.map((item, index) => {
                const rankIcons = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'];
                const rankBadges = [
                  'bg-amber-400 text-slate-900 border-amber-300',
                  'bg-slate-200 text-slate-800 border-slate-300',
                  'bg-amber-700/20 text-amber-900 border-amber-400/40',
                  'bg-slate-100 text-slate-600 border-slate-200',
                  'bg-slate-100 text-slate-600 border-slate-200'
                ];

                return (
                  <div key={item.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between gap-3 hover:bg-slate-100/80 transition-colors">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <span className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs border shrink-0 ${rankBadges[index] || rankBadges[3]}`}>
                        {rankIcons[index] || `#${index + 1}`}
                      </span>
                      <div className="overflow-hidden">
                        <h4 className="font-bold text-slate-800 text-xs truncate">{item.nickname}</h4>
                        <p className="text-[10px] text-slate-400 truncate">{item.quiz_title}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-black text-amber-600 block">{item.score.toLocaleString('id-ID')}</span>
                      <span className="text-[9px] text-slate-400 font-semibold">Poin</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
