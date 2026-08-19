'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Script from 'next/script';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFieldErrors({});

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (res.ok && data.token) {
        localStorage.setItem('token', data.token);
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
        }

        const role = data.user?.role || 'user';
        const dest = role === 'admin' ? '/admin' : '/user/dashboard';
        const msg = role === 'admin' ? 'Selamat datang di Dashboard Admin.' : `Selamat datang, ${data.user?.name || 'Pengguna'}!`;

        Swal.fire({
          title: 'Login Berhasil!',
          text: msg,
          icon: 'success',
          showConfirmButton: false,
          timer: 1500,
          background: '#ffffff',
        }).then(() => {
          router.push(dest);
        });
      } else if (res.status === 422) {
        const errors = data.errors || {};
        const newErrors: { email?: string; password?: string } = {};

        if (errors.email) {
          newErrors.email = errors.email[0];
        }
        if (errors.password) {
          newErrors.password = errors.password[0];
        }
        if (!errors.email && !errors.password) {
          newErrors.password = 'Password yang Anda masukkan salah.';
        }

        setFieldErrors(newErrors);
      } else if (res.status === 403 && data.requires_otp) {
        Swal.fire({
          title: 'Verifikasi Diperlukan',
          text: data.message || 'Silakan verifikasi akun Anda terlebih dahulu.',
          icon: 'warning',
          showConfirmButton: true,
          confirmButtonText: 'Verifikasi Sekarang',
          confirmButtonColor: '#1C3281',
          background: '#ffffff',
        }).then(() => {
          router.push(`/verify-otp?email=${encodeURIComponent(data.email)}`);
        });
      } else {
        Swal.fire('Gagal', data.message || 'Email atau password salah.', 'error');
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
    <main className="min-h-screen relative flex items-center justify-center p-4 md:p-6 bg-[#002244] overflow-hidden font-sans">
      <Script src="https://unpkg.com/@lottiefiles/lottie-player@latest/dist/lottie-player.js" strategy="lazyOnload" />

      {/* Decorative Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Glow Spheres */}
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-blue-400/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-1/4 -right-20 w-[30rem] h-[30rem] bg-accent-yellow/15 rounded-full blur-[140px]"></div>
        
        {/* Songket Motif Overlay */}
        <div 
          className="absolute inset-0 w-full h-full opacity-15 bg-repeat bg-center pointer-events-none"
          style={{ backgroundImage: 'url(/images/element/1.png)', backgroundSize: '350px' }}
        ></div>
      </div>

      {/* Back to Home Button */}
      <Link 
        href="/" 
        className="absolute top-6 left-6 md:top-8 md:left-8 text-white bg-primary/90 hover:bg-primary backdrop-blur-md px-5 py-2.5 rounded-full border border-accent-yellow/50 text-xs md:text-sm font-bold transition-all flex items-center gap-2 shadow-lg hover:shadow-xl hover:-translate-y-0.5 z-30 group"
      >
        <i className="fa-solid fa-arrow-left text-xs text-accent-yellow group-hover:-translate-x-1 transition-transform"></i> Kembali ke Beranda
      </Link>

      {/* Main Split Glass Card */}
      <div className="w-full max-w-[960px] bg-white rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.4)] border border-white/20 relative z-10 overflow-hidden grid grid-cols-1 md:grid-cols-12 my-auto">
        
        {/* Left Side: Brand & Illustration (5 Columns) */}
        <div className="hidden md:flex md:col-span-5 flex-col justify-between p-8 lg:p-10 bg-primary text-white relative overflow-hidden">
          {/* Subtle songket background inside left panel */}
          <div 
            className="absolute inset-0 w-full h-full opacity-15 bg-cover bg-center pointer-events-none"
            style={{ backgroundImage: 'url(/images/element/1.png)' }}
          ></div>
          
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-[11px] font-bold text-yellow-300 uppercase tracking-wider mb-4">
              <i className="fa-solid fa-shield-halved text-yellow-400"></i> Portal Resmi BI
            </div>
            <h2 className="text-2xl lg:text-3xl font-extrabold text-white leading-tight tracking-tight">
              BI - MENGAJAR
            </h2>
            <p className="text-xs lg:text-sm text-blue-100/80 mt-2 leading-relaxed">
              Cinta, Bangga, Paham Rupiah bersama Bank Indonesia Kantor Perwakilan Pematangsiantar.
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

        {/* Right Side: Login Form (7 Columns) */}
        <div className="md:col-span-7 p-8 lg:p-12 flex flex-col justify-center bg-white">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="h-20 w-auto flex items-center justify-center mb-2">
              <Image
                src="/images/logo.png?v=2"
                alt="Logo BI Mengajar"
                width={250}
                height={80}
                className="h-full w-auto object-contain scale-[1.5] origin-center"
                priority
                unoptimized
              />
            </div>
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Masuk ke Akun Anda</h1>
            <p className="text-xs text-gray-500 mt-1.5 max-w-sm">
              Silakan masukkan kredensial akun Anda untuk mengakses dashboard dan layanan BI Mengajar.
            </p>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-5">
            {/* Email Field */}
            <div className="flex flex-col gap-1.5">
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
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center px-1">
                <label className="text-xs font-bold text-gray-700">Password</label>
                <Link href="/forgot-password" className="text-xs font-bold text-primary hover:text-blue-700 transition-colors">
                  Lupa Password?
                </Link>
              </div>
              <div className="relative group">
                <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors ${fieldErrors.password ? 'text-red-500' : 'text-gray-400 group-focus-within:text-primary'}`}>
                  <i className="fa-solid fa-lock text-sm"></i>
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Masukkan password..."
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (fieldErrors.password) setFieldErrors(prev => ({ ...prev, password: undefined }));
                  }}
                  required
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

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-blue-900 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg hover:shadow-xl mt-2 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed hover:-translate-y-0.5 active:translate-y-0 border-b-4 border-accent-yellow active:border-b-0"
            >
              {loading ? (
                <>
                  <i className="fa-solid fa-circle-notch animate-spin text-accent-yellow"></i>
                  <span>Memproses...</span>
                </>
              ) : (
                <>
                  <span>Masuk ke Dashboard</span>
                  <i className="fa-solid fa-arrow-right text-xs text-accent-yellow"></i>
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center border-t border-gray-100 pt-5">
            <p className="text-xs text-gray-500">
              Belum punya akun?{' '}
              <Link href="/register" className="text-primary font-bold hover:underline transition-all">
                Daftar Akun Baru
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

