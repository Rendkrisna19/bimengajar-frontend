'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Script from 'next/script';
import ParticleBackground from '@/components/ui/ParticleBackground';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ name?: string; email?: string; password?: string }>({});
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFieldErrors({});

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ name, email, password, password_confirmation: passwordConfirmation })
      });

      const data = await res.json();

      if (res.ok) {
        Swal.fire({
          title: 'Registrasi Berhasil!',
          text: 'Akun Anda telah dibuat. Silakan login untuk melanjutkan pengajuan kegiatan.',
          icon: 'success',
          confirmButtonColor: '#003366',
          background: '#ffffff',
        }).then(() => {
          router.push('/login');
        });
      } else if (res.status === 422) {
        // Validation Error
        const errors = data.errors || {};
        const newErrors: { name?: string; email?: string; password?: string } = {};

        if (errors.name) newErrors.name = errors.name[0];
        if (errors.email) newErrors.email = errors.email[0];
        if (errors.password) newErrors.password = errors.password[0];

        setFieldErrors(newErrors);
      } else {
        Swal.fire('Gagal', data.message || 'Terjadi kesalahan saat pendaftaran.', 'error');
      }
    } catch (err) {
      Swal.fire('Gagal', 'Tidak dapat terhubung ke server. Pastikan backend berjalan.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const inputBase = 'w-full bg-gray-50 text-gray-800 text-sm rounded-xl pl-11 pr-4 py-3.5 outline-none transition-all placeholder:text-gray-400 shadow-sm border';
  const inputNormal = `${inputBase} border-gray-200 focus:border-primary focus:bg-white`;
  const inputError = `${inputBase} border-red-400 bg-red-50 focus:border-red-500 focus:bg-red-50 text-red-700`;

  const LottiePlayer = 'lottie-player' as any;

  return (
    <main className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden bg-slate-50">
      <Script src="https://unpkg.com/@lottiefiles/lottie-player@latest/dist/lottie-player.js" strategy="lazyOnload" />
      <ParticleBackground />

      <div className="absolute inset-0 pointer-events-none opacity-[0.03] hidden md:block">
         <div className="absolute top-[20%] left-0 w-[20%] h-px bg-gradient-to-r from-primary to-transparent transform -rotate-12"></div>
         <div className="absolute top-[20%] right-0 w-[20%] h-px bg-gradient-to-l from-primary to-transparent transform rotate-12"></div>
         <div className="absolute bottom-[20%] left-0 w-[20%] h-px bg-gradient-to-r from-accent-warning to-transparent transform rotate-12"></div>
         <div className="absolute bottom-[20%] right-0 w-[20%] h-px bg-gradient-to-l from-accent-warning to-transparent transform -rotate-12"></div>
      </div>

      <Link href="/" className="absolute top-8 left-8 text-gray-500 hover:text-primary transition-colors flex items-center gap-2 font-medium z-20">
        <i className="fa-solid fa-arrow-left"></i> Kembali ke Beranda
      </Link>

      {/* Split Pane Card Container */}
      <div className="w-full max-w-[920px] bg-white border border-gray-100 rounded-3xl shadow-[0_20px_50px_rgba(0,51,102,0.08)] relative z-10 overflow-hidden grid grid-cols-1 md:grid-cols-2 my-8">
        
        {/* Left Side: Lottie Animation (hidden on mobile, flex on desktop) */}
        <div className="hidden md:flex flex-col items-center justify-center p-10 bg-slate-50/50 border-r border-gray-100 relative">
          <div className="absolute inset-0 opacity-[0.02] pointer-events-none"
               style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #003366 1px, transparent 0)', backgroundSize: '16px 16px' }}>
          </div>
          <div className="w-full max-w-[360px] h-[360px] flex items-center justify-center relative z-10">
            <LottiePlayer
              src="/images/lottie/login.json"
              background="transparent"
              speed="1"
              loop
              autoplay
              style={{ width: '100%', height: '100%' }}
            />
          </div>
          <div className="text-center mt-4 relative z-10">
            <h3 className="text-base font-extrabold text-primary tracking-wider uppercase">BI-MENGAJAR</h3>
            <p className="text-xs text-slate-400 mt-1.5 max-w-[260px] leading-relaxed mx-auto">
              Mari bersama-sama belajar dan berbagi kecintaan, kebanggaan, serta kepahaman tentang Rupiah.
            </p>
          </div>
        </div>

        {/* Right Side: Register Form */}
        <div className="p-8 md:p-10 flex flex-col justify-center">
          <div className="flex flex-col items-center mb-8">
            <div className="mb-6">
              <Image
                src="/images/logo.png"
                alt="Logo BI Mengajar"
                width={160}
                height={50}
                className="h-10 w-auto object-contain"
                priority
              />
            </div>
            <h1 className="text-xl font-bold text-gray-800 tracking-tight">Daftar Akun Baru</h1>
            <p className="text-xs text-gray-500 mt-1.5 text-center">
              Silakan buat akun untuk mengajukan kegiatan edukasi di BI Mengajar.
            </p>
          </div>

          <form onSubmit={handleRegister} className="flex flex-col gap-4">
            {/* Name Field */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-600 px-1">Nama Lengkap</label>
              <div className="relative group">
                <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors ${fieldErrors.name ? 'text-red-400' : 'text-gray-400 group-focus-within:text-primary'}`}>
                  <i className="fa-regular fa-user"></i>
                </div>
                <input
                  type="text"
                  placeholder="Masukkan nama lengkap..."
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (fieldErrors.name) setFieldErrors(prev => ({ ...prev, name: undefined }));
                  }}
                  required
                  className={fieldErrors.name ? inputError : inputNormal}
                />
              </div>
              {fieldErrors.name && (
                <p className="text-xs text-red-500 font-medium flex items-center gap-1 pl-1">
                  <i className="fa-solid fa-circle-exclamation"></i>
                  {fieldErrors.name}
                </p>
              )}
            </div>

            {/* Email Field */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-600 px-1">Alamat Email</label>
              <div className="relative group">
                <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors ${fieldErrors.email ? 'text-red-400' : 'text-gray-400 group-focus-within:text-primary'}`}>
                  <i className="fa-regular fa-envelope"></i>
                </div>
                <input
                  type="email"
                  placeholder="Masukkan email valid..."
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (fieldErrors.email) setFieldErrors(prev => ({ ...prev, email: undefined }));
                  }}
                  required
                  className={fieldErrors.email ? inputError : inputNormal}
                />
              </div>
              {fieldErrors.email && (
                <p className="text-xs text-red-500 font-medium flex items-center gap-1 pl-1">
                  <i className="fa-solid fa-circle-exclamation"></i>
                  {fieldErrors.email}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-600 px-1">Password</label>
              <div className="relative group">
                <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors ${fieldErrors.password ? 'text-red-400' : 'text-gray-400 group-focus-within:text-primary'}`}>
                  <i className="fa-solid fa-lock"></i>
                </div>
                <input
                  type="password"
                  placeholder="Buat password (min. 8 karakter)..."
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (fieldErrors.password) setFieldErrors(prev => ({ ...prev, password: undefined }));
                  }}
                  required
                  minLength={8}
                  className={fieldErrors.password ? inputError : inputNormal}
                />
              </div>
              {fieldErrors.password && (
                <p className="text-xs text-red-500 font-medium flex items-center gap-1 pl-1">
                  <i className="fa-solid fa-circle-exclamation"></i>
                  {fieldErrors.password}
                </p>
              )}
            </div>

            {/* Password Confirmation Field */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-600 px-1">Konfirmasi Password</label>
              <div className="relative group">
                <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors text-gray-400 group-focus-within:text-primary`}>
                  <i className="fa-solid fa-lock"></i>
                </div>
                <input
                  type="password"
                  placeholder="Ulangi password..."
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                  required
                  minLength={8}
                  className={inputNormal}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-blue-900 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg hover:shadow-xl mt-2 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed hover:-translate-y-0.5"
            >
              {loading ? <i className="fa-solid fa-circle-notch animate-spin"></i> : 'Daftar Sekarang'}
            </button>
          </form>

          <div className="mt-6 text-center border-t border-gray-100 pt-5">
            <p className="text-xs text-gray-500">
              Sudah punya akun?{' '}
              <Link href="/login" className="text-primary font-bold hover:underline transition-all">
                Login di sini
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
