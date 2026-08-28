'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Script from 'next/script';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ name?: string; email?: string; password?: string }>({});
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFieldErrors({});

    if (password !== passwordConfirmation) {
      setFieldErrors({ password: 'Konfirmasi password tidak cocok dengan password di atas.' });
      setLoading(false);
      return;
    }

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
        if (data.requires_otp) {
          Swal.fire({
            title: 'Registrasi Berhasil!',
            text: 'Silakan cek email Anda untuk kode verifikasi OTP.',
            icon: 'success',
            showConfirmButton: true,
            confirmButtonText: 'Verifikasi OTP',
            confirmButtonColor: '#003366',
            background: '#ffffff',
          }).then(() => {
            router.push(`/verify-otp?email=${encodeURIComponent(email)}`);
          });
        } else {
          Swal.fire({
            title: 'Registrasi Berhasil!',
            text: 'Akun Anda telah dibuat. Silakan login untuk melanjutkan.',
            icon: 'success',
            showConfirmButton: false,
            timer: 1500,
            background: '#ffffff',
          }).then(() => {
            router.push('/login');
          });
        }
      } else if (res.status === 422) {
        const errors = data.errors || {};
        const newErrors: { name?: string; email?: string; password?: string } = {};

        if (errors.name) newErrors.name = errors.name[0];
        if (errors.email) newErrors.email = errors.email[0];
        if (errors.password) newErrors.password = errors.password[0];

        setFieldErrors(newErrors);

        if (errors.email) {
          Swal.fire({
            title: 'Email Sudah Terdaftar!',
            text: errors.email[0] || 'Email ini sudah terdaftar di sistem PLAT-BK. Silakan gunakan email lain atau langsung masuk ke akun Anda.',
            icon: 'warning',
            confirmButtonText: 'Masuk ke Halaman Login',
            showCancelButton: true,
            cancelButtonText: 'Gunakan Email Lain',
            confirmButtonColor: '#003366',
            cancelButtonColor: '#6b7280',
          }).then((result) => {
            if (result.isConfirmed) {
              router.push('/login');
            }
          });
        }
      } else {
        Swal.fire('Gagal', data.message || 'Terjadi kesalahan saat pendaftaran.', 'error');
      }
    } catch (err) {
      Swal.fire('Gagal', 'Tidak dapat terhubung ke server. Pastikan backend berjalan.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const inputBase = 'w-full bg-slate-50 text-gray-800 text-sm rounded-xl pl-11 pr-11 py-3.5 outline-none transition-all placeholder:text-gray-400 border font-medium';
  const inputNormal = `${inputBase} border-gray-200 focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 shadow-sm`;
  const inputError = `${inputBase} border-red-400 bg-red-50/50 focus:border-red-500 focus:bg-white text-red-700 focus:ring-4 focus:ring-red-500/10`;

  const LottiePlayer = 'lottie-player' as any;

  return (
    <main className="min-h-screen relative flex items-center justify-center p-4 md:p-6 bg-gradient-to-br from-[#001529] via-[#003366] to-[#001f3f] overflow-hidden font-sans">
      <Script src="https://unpkg.com/@lottiefiles/lottie-player@latest/dist/lottie-player.js" strategy="lazyOnload" />

      {/* Back to Home Button */}
      <Link 
        href="/" 
        className="absolute top-6 left-6 md:top-8 md:left-8 text-white bg-primary/90 hover:bg-primary backdrop-blur-md px-5 py-2.5 rounded-full border border-accent-yellow/50 text-xs md:text-sm font-bold transition-all flex items-center gap-2 shadow-lg hover:shadow-xl hover:-translate-y-0.5 z-30 group"
      >
        <i className="fa-solid fa-arrow-left text-xs text-accent-yellow group-hover:-translate-x-1 transition-transform"></i> Kembali ke Beranda
      </Link>

      {/* Main Split Glass Card */}
      <div className="w-full max-w-[980px] bg-white rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.4)] border border-white/20 relative z-10 overflow-hidden grid grid-cols-1 md:grid-cols-12 my-auto">
        
        {/* Left Side: Brand & Illustration (5 Columns) */}
        <div className="hidden md:flex md:col-span-5 flex-col justify-between p-8 lg:p-10 bg-primary text-white relative overflow-hidden">
          
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-[11px] font-bold text-yellow-300 uppercase tracking-wider mb-4">
              <i className="fa-solid fa-user-plus text-yellow-400"></i> Registrasi Akun
            </div>
            <h2 className="text-2xl lg:text-3xl font-extrabold text-white leading-tight tracking-tight">
              PLAT-BK
            </h2>
            <p className="text-xs lg:text-sm text-blue-100/80 mt-2 leading-relaxed">
              Bergabung bersama kami untuk meningkatkan literasi Cinta, Bangga, dan Paham Rupiah.
            </p>
          </div>

          {/* Lottie Animation Container */}
          <div className="w-full h-56 lg:h-64 flex items-center justify-center my-4 relative z-10">
            <LottiePlayer
              src="/images/lottie/login.json"
              background="transparent"
              speed="1"
              loop
              autoplay
              style={{ width: '100%', height: '100%' }}
            />
          </div>

          {/* Footer note in left panel */}
          <div className="relative z-10 border-t border-white/10 pt-4">
            <p className="text-[11px] text-blue-200/70 text-center font-medium">
              &copy; {new Date().getFullYear()} Bank Indonesia Pematangsiantar
            </p>
          </div>
        </div>

        {/* Right Side: Register Form (7 Columns) */}
        <div className="md:col-span-7 p-8 lg:p-12 flex flex-col justify-center bg-white">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="h-20 w-auto flex items-center justify-center mb-2">
              <Image
                src="/images/logo.png?v=2"
                alt="Logo PLAT-BK"
                width={250}
                height={80}
                className="h-full w-auto object-contain scale-[1.5] origin-center"
                priority
                unoptimized
              />
            </div>
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Daftar Akun Baru</h1>
            <p className="text-xs text-gray-500 mt-1 max-w-sm">
              Lengkapi data diri Anda di bawah ini untuk membuat akun platform PLAT-BK.
            </p>
          </div>

          <form onSubmit={handleRegister} className="flex flex-col gap-4">
            {/* Name Field */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-700 px-1">Nama Lengkap</label>
              <div className="relative group">
                <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors ${fieldErrors.name ? 'text-red-500' : 'text-gray-400 group-focus-within:text-primary'}`}>
                  <i className="fa-regular fa-user text-sm"></i>
                </div>
                <input
                  type="text"
                  placeholder="Masukkan nama lengkap Anda..."
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
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-700 px-1">Alamat Email</label>
              <div className="relative group">
                <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors ${fieldErrors.email ? 'text-red-500' : 'text-gray-400 group-focus-within:text-primary'}`}>
                  <i className="fa-regular fa-envelope text-sm"></i>
                </div>
                <input
                  type="email"
                  placeholder="Masukkan email Anda..."
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

            {/* Password Field with Toggle */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-700 px-1">Password</label>
              <div className="relative group">
                <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors ${fieldErrors.password ? 'text-red-500' : 'text-gray-400 group-focus-within:text-primary'}`}>
                  <i className="fa-solid fa-lock text-sm"></i>
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
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
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
                  tabIndex={-1}
                >
                  <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'} text-sm`}></i>
                </button>
              </div>
              {fieldErrors.password && (
                <p className="text-xs text-red-500 font-medium flex items-center gap-1 pl-1">
                  <i className="fa-solid fa-circle-exclamation"></i>
                  {fieldErrors.password}
                </p>
              )}
            </div>

            {/* Password Confirmation Field with Toggle */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-700 px-1">Konfirmasi Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary">
                  <i className="fa-solid fa-shield-check text-sm"></i>
                </div>
                <input
                  type={showPasswordConfirmation ? 'text' : 'password'}
                  placeholder="Ulangi password di atas..."
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                  required
                  minLength={8}
                  className={inputNormal}
                />
                <button
                  type="button"
                  onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
                  tabIndex={-1}
                >
                  <i className={`fa-solid ${showPasswordConfirmation ? 'fa-eye-slash' : 'fa-eye'} text-sm`}></i>
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-blue-900 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg hover:shadow-xl mt-2 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed hover:-translate-y-0.5 active:translate-y-0 border-b-4 border-accent-yellow active:border-b-0"
            >
              {loading ? (
                <>
                  <i className="fa-solid fa-circle-notch animate-spin text-accent-yellow"></i>
                  <span>Mendaftarkan...</span>
                </>
              ) : (
                <>
                  <span>Daftar Akun Sekarang</span>
                  <i className="fa-solid fa-arrow-right text-xs text-accent-yellow"></i>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center border-t border-gray-100 pt-4">
            <p className="text-xs text-gray-500">
              Sudah memiliki akun?{' '}
              <Link href="/login" className="text-primary font-bold hover:underline transition-all">
                Masuk di Sini
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
