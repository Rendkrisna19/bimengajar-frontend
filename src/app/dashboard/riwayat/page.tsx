'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function RiwayatPengajuanPage() {
  const [pengajuan, setPengajuan] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
          // Asumsi backend mengembalikan array di data.data atau langsung di data
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

  return (
    <div className="flex flex-col gap-8 w-full max-w-6xl">
      <div className="flex items-center gap-4">
        <h1 className="text-3xl font-bold text-white tracking-tight">Riwayat Pengajuan</h1>
        <div className="bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full text-xs font-semibold border border-blue-500/20">
          Edukasi
        </div>
      </div>

      <div className="bg-[#0A142A] rounded-3xl border border-white/5 p-8 shadow-lg relative overflow-hidden">
        {/* Subtle top reflection */}
        <div className="absolute top-0 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
        
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <i className="fa-solid fa-circle-notch animate-spin text-3xl text-primary mb-4"></i>
            <p className="text-gray-400">Memuat data riwayat...</p>
          </div>
        ) : pengajuan.length === 0 ? (
          <div className="bg-[#0f1b38]/50 border border-[#1a2b54] rounded-2xl flex flex-col items-center justify-center py-20 px-4 text-center relative z-10 backdrop-blur-sm">
            <div className="w-16 h-16 rounded-full bg-[#162447] flex items-center justify-center mb-4 border border-white/5 shadow-inner">
              <i className="fa-solid fa-file-invoice text-3xl text-gray-400"></i>
            </div>
            <p className="text-gray-300 font-medium text-lg">Belum ada riwayat pengajuan.</p>
            <p className="text-gray-500 text-sm mt-2 mb-6">Anda belum pernah mengajukan kegiatan edukasi.</p>
            <Link 
              href="/edukasi/pengajuan"
              className="bg-primary hover:bg-blue-600 text-white font-medium px-6 py-2.5 rounded-full transition-colors flex items-center gap-2"
            >
              <i className="fa-solid fa-plus"></i> Ajukan Sekarang
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-gray-400 text-sm">
                  <th className="py-4 px-4 font-semibold">Tanggal Diajukan</th>
                  <th className="py-4 px-4 font-semibold">Instansi</th>
                  <th className="py-4 px-4 font-semibold">Tema Kegiatan</th>
                  <th className="py-4 px-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="text-gray-300 text-sm">
                {pengajuan.map((item, idx) => (
                  <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-4 px-4">
                      {new Date(item.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric', month: 'long', year: 'numeric'
                      })}
                    </td>
                    <td className="py-4 px-4">
                      <p className="font-medium text-white">{item.nama_instansi}</p>
                      <p className="text-xs text-gray-500">{item.jenis_instansi}</p>
                    </td>
                    <td className="py-4 px-4">{item.tema_kegiatan}</td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                        item.status === 'disetujui' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                        item.status === 'ditolak' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                        'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                      }`}>
                        {item.status ? item.status.charAt(0).toUpperCase() + item.status.slice(1) : 'Menunggu'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
