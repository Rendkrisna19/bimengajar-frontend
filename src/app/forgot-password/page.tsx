'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Script from 'next/script';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';

function ForgotPasswordContent() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const router = useRouter();

  const LottiePlayer = 'lottie-player' as any;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email) {
      setErrorMsg('Email wajib diisi.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      const data = await res.json();

      if (res.ok) {
        Swal.fire({
          title: 'Kode OTP Terkirim!',
          text: data.message || 'Silakan cek kotak masuk email Anda untuk mendapatkan kode OTP reset password.',
          icon: 'success',
          confirmButtonColor: '#003366',
          background: '#ffffff',
        }).then(() => {
          router.push(`/reset-password?email=${encodeURIComponent(email)}`);
        });
      } else {
        if (res.status === 422 && data.errors?.email) {
          setErrorMsg(data.errors.email[0]);
        } else {
          setErrorMsg(data.message || 'Gagal mengirim OTP reset password.');
        }
      }
    } catch (err) {
      setErrorMsg('Terjadi kesalahan jaringan. Silakan periksa koneksi Anda.');
    } finally {
      setLoading(false);
    }
  };

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

      {/* Back to Login Button */}
      <Link 
        href="/login" 
        className="absolute top-6 left-6 md:top-8 md:left-8 text-white bg-primary/90 hover:bg-primary backdrop-blur-md px-5 py-2.5 rounded-full border border-accent-yellow/50 text-xs md:text-sm font-bold transition-all flex items-center gap-2 shadow-lg hover:shadow-xl hover:-translate-y-0.5 z-30 group"
      >
        <i className="fa-solid fa-arrow-left text-xs text-accent-yellow group-hover:-translate-x-1 transition-transform"></i> Login
      </Link>

      {/* Main Split Glass Card */}
      <div className="w-full max-w-[960px] bg-white rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.4)] border border-white/20 relative z-10 overflow-hidden grid grid-cols-1 md:grid-cols-12 my-auto">
        
        {/* Left Side: Brand & Illustration (5 Columns) */}
        <div className="hidden md:flex md:col-span-5 flex-col justify-between p-8 lg:p-10 bg-primary text-white relative overflow-hidden">
          <div 
            className="absolute inset-0 w-full h-full opacity-15 bg-cover bg-center pointer-events-none"
            style={{ backgroundImage: 'url(/images/element/1.png)' }}
          ></div>
          
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-[11px] font-bold text-yellow-300 uppercase tracking-wider mb-4">
              <i className="fa-solid fa-key text-yellow-400"></i> Pemulihan Password
            </div>
            <h2 className="text-2xl lg:text-3xl font-extrabold text-white leading-tight tracking-tight">
              BI - MENGAJAR
            </h2>
            <p className="text-xs lg:text-sm text-blue-100/80 mt-2 leading-relaxed">
              Lupa kata sandi Anda? Jangan khawatir, kami akan membantu Anda mereset password dengan aman melalui verifikasi OTP.
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

          <div className="relative z-10 border-t border-white/10 pt-4">
            <p className="text-[11px] text-blue-200/70 text-center font-medium">
              &copy; {new Date().getFullYear()} Bank Indonesia Pematangsiantar
            </p>
          </div>
        </div>

        {/* Right Side: Email Form (7 Columns) */}
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
            <div className="w-12 h-12 bg-blue-50 text-primary rounded-2xl flex items-center justify-center text-xl mb-3 shadow-inner">
              <i className="fa-solid fa-key"></i>
            </div>
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Lupa Kata Sandi?</h1>
            <p className="text-xs text-gray-500 mt-1.5 max-w-sm">
              Masukkan alamat email akun terdaftar Anda. Kami akan mengirimkan 6 digit kode OTP verifikasi.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Email Field */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-700 px-1">Alamat Email Terdaftar</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary transition-colors">
                  <i className="fa-regular fa-envelope text-sm"></i>
                </div>
                <input
                  type="email"
                  placeholder="nama@email.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errorMsg) setErrorMsg('');
                  }}
                  required
                  className={`w-full pl-11 pr-4 py-3.5 bg-slate-50 border ${errorMsg ? 'border-red-400 focus:border-red-500 focus:ring-red-100' : 'border-gray-200 focus:border-accent-yellow focus:ring-accent-yellow/20'} rounded-2xl text-sm font-semibold text-gray-800 focus:bg-white focus:ring-4 outline-none transition-all placeholder:text-gray-400 shadow-sm`}
                />
              </div>
              {errorMsg && (
                <p className="text-xs text-red-500 font-medium flex items-center gap-1 pl-1">
                  <i className="fa-solid fa-circle-exclamation"></i>
                  {errorMsg}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !email}
              className="w-full bg-primary hover:bg-blue-900 text-white font-bold py-3.5 rounded-2xl transition-all shadow-lg hover:shadow-xl mt-2 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed hover:-translate-y-0.5 active:translate-y-0 border-b-4 border-accent-yellow active:border-b-0"
            >
              {loading ? (
                <>
                  <i className="fa-solid fa-circle-notch animate-spin text-accent-yellow"></i>
                  <span>Mengirim Kode OTP...</span>
                </>
              ) : (
                <>
                  <span>Kirim Kode OTP Reset</span>
                  <i className="fa-solid fa-paper-plane text-xs text-accent-yellow"></i>
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center border-t border-gray-100 pt-6">
            <p className="text-xs text-gray-500">
              Sudah ingat password Anda?{' '}
              <Link href="/login" className="font-extrabold text-primary hover:text-blue-700 transition-colors">
                Masuk di sini
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center w-full min-h-screen bg-[#002244] text-white">Memuat...</div>}>
      <ForgotPasswordContent />
    </Suspense>
  );
}
