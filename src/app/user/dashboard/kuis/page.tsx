'use client';

import React, { useState } from 'react';

export default function UserDashboardKuis() {
  const [activeTab, setActiveTab] = useState<'tersedia' | 'selesai'>('tersedia');

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Top Banner Ayo Uji Pemahamanmu */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#003366] to-[#002244] p-6 md:p-8 text-white shadow-md border border-blue-900/10 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex flex-col gap-2 max-w-md relative z-10">
          <h2 className="text-xl md:text-2xl font-extrabold tracking-tight">Ayo Uji Pemahamanmu!</h2>
          <p className="text-blue-100/90 text-xs md:text-sm leading-relaxed">
            Kerjakan quiz seru dan tingkatkan pemahamanmu tentang Rupiah.
          </p>
        </div>
        <div className="w-16 h-16 md:w-20 md:h-20 bg-white/10 rounded-2xl flex items-center justify-center text-yellow-400 relative z-10 border border-white/10 shadow-inner">
          <i className="fa-solid fa-trophy text-3xl md:text-4xl"></i>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-100 p-1.5 rounded-2xl w-full max-w-sm border border-slate-200">
        <button
          onClick={() => setActiveTab('tersedia')}
          className={`flex-1 text-center py-2 text-xs font-extrabold rounded-xl transition-all ${
            activeTab === 'tersedia'
              ? 'bg-primary text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Tersedia
        </button>
        <button
          onClick={() => setActiveTab('selesai')}
          className={`flex-1 text-center py-2 text-xs font-extrabold rounded-xl transition-all ${
            activeTab === 'selesai'
              ? 'bg-primary text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Selesai
        </button>
      </div>

      {/* Content based on Active Tab */}
      <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm flex flex-col gap-6">
        {activeTab === 'tersedia' ? (
          /* Empty State Tersedia */
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4 text-slate-400">
              <i className="fa-regular fa-folder-open text-2xl"></i>
            </div>
            <h4 className="text-slate-700 font-extrabold text-base">Belum ada quiz yang tersedia saat ini.</h4>
            <p className="text-slate-400 text-xs mt-1 max-w-xs leading-relaxed">
              Quiz baru akan segera hadir. Tetap semangat belajar!
            </p>
          </div>
        ) : (
          /* Empty State Selesai */
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4 text-slate-400">
              <i className="fa-solid fa-list-check text-2xl"></i>
            </div>
            <h4 className="text-slate-700 font-extrabold text-base">Belum ada quiz yang Anda selesaikan.</h4>
            <p className="text-slate-400 text-xs mt-1 max-w-xs leading-relaxed">
              Selesaikan quiz di tab "Tersedia" untuk melihat riwayat nilai Anda di sini.
            </p>
          </div>
        )}
      </div>

      {/* Tips Belajar Card */}
      <div className="flex items-start gap-4 p-5 bg-blue-50/50 rounded-3xl border border-blue-100/50 shadow-sm">
        <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-primary shrink-0">
          <i className="fa-regular fa-lightbulb text-lg"></i>
        </div>
        <div className="flex flex-col gap-1">
          <h4 className="text-xs font-extrabold text-slate-800">Tips Belajar</h4>
          <p className="text-slate-500 text-xs leading-relaxed">
            Rutin mengerjakan quiz dapat membantumu memahami materi dengan lebih baik.
          </p>
        </div>
      </div>
    </div>
  );
}
