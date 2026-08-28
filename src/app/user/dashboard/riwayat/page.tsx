'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

type StatusType = 'Semua' | 'Disetujui' | 'Ditolak' | 'Diproses';

export default function UserDashboardRiwayat() {
  const [pengajuan, setPengajuan] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<StatusType>('Semua');

  useEffect(() => {
    const fetchRiwayat = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/pengajuan-edukasi`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });
        const data = await res.json();
        if (res.ok) {
          setPengajuan(data.data || data || []);
        }
      } catch (err) {
        console.error('Gagal mengambil riwayat:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRiwayat();
  }, []);

  const getFilteredData = () => {
    if (activeTab === 'Semua') return pengajuan;
    if (activeTab === 'Disetujui') return pengajuan.filter(p => p.status === 'disetujui');
    if (activeTab === 'Ditolak') return pengajuan.filter(p => p.status === 'ditolak');
    if (activeTab === 'Diproses') return pengajuan.filter(p => p.status !== 'disetujui' && p.status !== 'ditolak');
    return pengajuan;
  };

  const filteredList = getFilteredData();

  const tabOptions: StatusType[] = ['Semua', 'Disetujui', 'Ditolak', 'Diproses'];

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Tabs */}
      <div className="flex bg-slate-100 p-1.5 rounded-2xl w-full max-w-xl border border-slate-200 overflow-x-auto custom-scrollbar gap-1">
        {tabOptions.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 text-center py-2 px-3 text-xs font-extrabold rounded-xl transition-all whitespace-nowrap ${
              activeTab === tab
                ? 'bg-[#fbbf24] text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content Container */}
      <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm min-h-[300px] flex flex-col justify-center">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-10">
            <i className="fa-solid fa-circle-notch animate-spin text-2xl text-primary mb-3"></i>
            <p className="text-slate-400 text-xs font-semibold">Memuat data riwayat...</p>
          </div>
        ) : filteredList.length === 0 ? (
          /* Empty State matching design */
          <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4 text-slate-400">
              <i className="fa-regular fa-clipboard text-2xl"></i>
            </div>
            <h4 className="text-slate-700 font-extrabold text-base">Belum ada riwayat pengajuan.</h4>
            <p className="text-slate-400 text-xs mt-1 max-w-xs leading-relaxed">
              Riwayat pengajuanmu akan muncul di sini setelah kamu mulai mengajukan.
            </p>
            <Link 
              href="/edukasi/pengajuan"
              className="mt-6 bg-[#fbbf24] hover:bg-yellow-500 text-white text-xs font-bold px-6 py-2.5 rounded-xl transition-all inline-flex items-center gap-1.5 shadow-sm"
            >
              <i className="fa-solid fa-plus text-[10px]"></i> Ajukan Sekarang
            </Link>
          </div>
        ) : (
          /* Card list style (optimized for mobile app container) */
          <div className="w-full">
            <div className="flex flex-col gap-4">
              {filteredList.map((item, idx) => (
                <div key={idx} className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 flex flex-col gap-3">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold text-slate-400">
                      {new Date(item.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric', month: 'long', year: 'numeric'
                      })}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold border ${
                      item.status === 'disetujui' ? 'bg-green-50 text-green-700 border-green-200' :
                      item.status === 'ditolak' ? 'bg-red-50 text-red-700 border-red-200' :
                      'bg-yellow-50 text-yellow-700 border-yellow-200'
                    }`}>
                      {item.status ? item.status.charAt(0).toUpperCase() + item.status.slice(1) : 'Menunggu'}
                    </span>
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-800">{item.nama_instansi}</h5>
                    <p className="text-[10px] text-slate-400 mt-0.5">{item.jenis_instansi}</p>
                  </div>
                  <div className="pt-2 border-t border-slate-100 flex flex-col gap-0.5">
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Tema Kegiatan</span>
                    <span className="text-xs text-slate-600 font-medium">{item.tema_kegiatan}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
