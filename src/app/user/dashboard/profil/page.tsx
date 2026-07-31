'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';

export default function UserDashboardProfil() {
  const router = useRouter();
  const [userName, setUserName] = useState('Randy Karna');
  const [userEmail, setUserEmail] = useState('');
  const [initials, setInitials] = useState('RK');

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setUserName(user.name || 'Pengguna');
        setUserEmail(user.email || '');
        if (user.name) {
          const names = user.name.split(' ');
          if (names.length >= 2) {
            setInitials((names[0][0] + names[names.length - 1][0]).toUpperCase());
          } else {
            setInitials(names[0].substring(0, 2).toUpperCase());
          }
        }
      } catch (e) {
        setUserName('Pengguna');
      }
    }
  }, []);

  const handleLogout = () => {
    Swal.fire({
      title: 'Yakin ingin keluar?',
      text: 'Anda akan keluar dari sesi akun ini.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, Keluar',
      cancelButtonText: 'Batal'
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/login');
      }
    });
  };

  const group1 = [
    { label: 'Informasi Akun', icon: 'fa-regular fa-id-card' },
    { label: 'Pengaturan Notifikasi', icon: 'fa-regular fa-bell' },
    { label: 'Ubah Password', icon: 'fa-solid fa-lock' },
  ];

  const group2 = [
    { label: 'Tentang BI-MENGAJAR', icon: 'fa-solid fa-circle-info' },
    { label: 'Kebijakan Privasi', icon: 'fa-solid fa-shield-halved' },
    { label: 'Bantuan & Dukungan', icon: 'fa-solid fa-circle-question' },
  ];

  return (
    <div className="flex flex-col gap-6 w-full max-w-md mx-auto">
      {/* Top Profile Card */}
      <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm flex items-center gap-4">
        {/* Avatar */}
        <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center text-lg font-bold text-white shadow-md border-2 border-white shrink-0">
          {initials}
        </div>
        
        {/* User Info */}
        <div className="flex flex-col gap-0.5">
          <h2 className="text-base font-bold text-slate-800 tracking-tight">{userName}</h2>
          <p className="text-xs text-slate-400 font-medium">Pelajar</p>
          <span className="inline-flex items-center gap-1 bg-yellow-50 text-yellow-700 px-2 py-0.5 rounded-full text-[9px] font-extrabold w-fit mt-1 border border-yellow-200">
            <i className="fa-solid fa-medal text-[9px]"></i> Anggota
          </span>
        </div>
      </div>

      {/* Menu Group 1 */}
      <div className="bg-white rounded-3xl border border-slate-100 p-4 shadow-sm flex flex-col gap-1">
        {group1.map((item) => (
          <button
            key={item.label}
            className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 transition-colors w-full text-left group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-primary flex items-center justify-center group-hover:scale-105 transition-transform">
                <i className={`${item.icon} text-sm`}></i>
              </div>
              <span className="text-xs font-bold text-slate-700">{item.label}</span>
            </div>
            <i className="fa-solid fa-chevron-right text-[10px] text-slate-300 group-hover:text-primary transition-colors"></i>
          </button>
        ))}
      </div>

      {/* Menu Group 2 */}
      <div className="bg-white rounded-3xl border border-slate-100 p-4 shadow-sm flex flex-col gap-1">
        {group2.map((item) => (
          <button
            key={item.label}
            className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 transition-colors w-full text-left group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-primary flex items-center justify-center group-hover:scale-105 transition-transform">
                <i className={`${item.icon} text-sm`}></i>
              </div>
              <span className="text-xs font-bold text-slate-700">{item.label}</span>
            </div>
            <i className="fa-solid fa-chevron-right text-[10px] text-slate-300 group-hover:text-primary transition-colors"></i>
          </button>
        ))}
      </div>

      {/* Logout button */}
      <button
        onClick={handleLogout}
        className="w-full py-3 border-2 border-primary/20 hover:border-red-500/30 hover:bg-red-50 text-primary hover:text-red-500 text-xs font-bold rounded-2xl transition-all flex items-center justify-center gap-2"
      >
        <i className="fa-solid fa-arrow-right-from-bracket"></i> Keluar
      </button>
    </div>
  );
}
