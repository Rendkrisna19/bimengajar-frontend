'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Script from 'next/script';
import { useRouter, useSearchParams } from 'next/navigation';
import Swal from 'sweetalert2';

function ResetPasswordContent() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const LottiePlayer = 'lottie-player' as any;

  useEffect(() => {
    if (!email) {
      router.push('/forgot-password');
    }
  }, [email, router]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return;

    const newOtp = [...otp];
    if (value.length > 1) {
      const pasted = value.slice(0, 6).split('');
      for (let i = 0; i < pasted.length; i++) {
        newOtp[i] = pasted[i];
      }
      setOtp(newOtp);
      const lastIndex = pasted.length < 6 ? pasted.length : 5;
      inputRefs.current[lastIndex]?.focus();
      return;
    }

    newOtp[index] = value;
    setOtp(newOtp);

    if (value !== '' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      setErrorMsg('Silakan masukkan 6 digit kode OTP secara lengkap.');
      return;
    }

    if (password.length < 8) {
      setErrorMsg('Password minimal harus 8 karakter.');
      return;
    }

    if (password !== passwordConfirmation) {
      setErrorMsg('Konfirmasi password tidak cocok.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          email,
          otp: otpCode,
          password,
          password_confirmation: passwordConfirmation
        })
      });

      const data = await res.json();

      if (res.ok) {
        Swal.fire({
          title: 'Password Berhasil Diperbarui!',
          text: 'Kata sandi akun Anda telah diperbarui ke database. Silakan masuk menggunakan password baru.',
          icon: 'success',
          confirmButtonColor: '#003366',
          background: '#ffffff',
        }).then(() => {
          router.push('/login');
        });
      } else {
        if (data.errors) {
          const firstError = Object.values(data.errors)[0] as string[];
          setErrorMsg(firstError[0] || 'Gagal memperbarui password.');
        } else {
          setErrorMsg(data.message || 'Gagal memperbarui password.');
        }
      }
    } catch (err) {
      setErrorMsg('Terjadi kesalahan koneksi server. Coba lagi nanti.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0 || resendLoading) return;
    
    setResendLoading(true);
    setErrorMsg('');

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
          title: 'Kode Dikirim!',
          text: 'Kode OTP baru telah dikirimkan ke email Anda.',
          icon: 'success',
          background: '#ffffff',
        });
        setCountdown(60); 
      } else {
        setErrorMsg(data.message || 'Gagal mengirim ulang OTP');
      }
    } catch (err) {
      setErrorMsg('Gagal terhubung ke server.');
    } finally {
      setResendLoading(false);
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

      {/* Back Button */}
      <Link 
        href="/forgot-password" 
        className="absolute top-6 left-6 md:top-8 md:left-8 text-white bg-primary/90 hover:bg-primary backdrop-blur-md px-5 py-2.5 rounded-full border border-accent-yellow/50 text-xs md:text-sm font-bold transition-all flex items-center gap-2 shadow-lg hover:shadow-xl hover:-translate-y-0.5 z-30 group"
      >
        <i className="fa-solid fa-arrow-left text-xs text-accent-yellow group-hover:-translate-x-1 transition-transform"></i> Kembali
      </Link>

      {/* Main Split Glass Card */}
      <div className="w-full max-w-[980px] bg-white rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.4)] border border-white/20 relative z-10 overflow-hidden grid grid-cols-1 md:grid-cols-12 my-auto">
        
        {/* Left Side: Brand & Illustration (5 Columns) */}
        <div className="hidden md:flex md:col-span-5 flex-col justify-between p-8 lg:p-10 bg-primary text-white relative overflow-hidden">
          <div 
            className="absolute inset-0 w-full h-full opacity-15 bg-cover bg-center pointer-events-none"
            style={{ backgroundImage: 'url(/images/element/1.png)' }}
          ></div>
          
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-[11px] font-bold text-yellow-300 uppercase tracking-wider mb-4">
              <i className="fa-solid fa-lock text-yellow-400"></i> Reset Password OTP
            </div>
            <h2 className="text-2xl lg:text-3xl font-extrabold text-white leading-tight tracking-tight">
              BI - MENGAJAR
            </h2>
            <p className="text-xs lg:text-sm text-blue-100/80 mt-2 leading-relaxed">
              Masukkan 6 digit kode OTP dan buat kata sandi baru yang kuat untuk mengamankan akun Anda.
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

        {/* Right Side: Reset Password Form (7 Columns) */}
        <div className="md:col-span-7 p-8 lg:p-10 flex flex-col justify-center bg-white">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="h-12 w-44 flex items-center justify-center overflow-hidden mb-2">
              <Image
                src="/images/logo.png?v=2"
                alt="Logo BI Mengajar"
                width={180}
                height={180}
                className="w-full h-auto object-contain scale-[1.1] origin-center"
                priority
                unoptimized
              />
            </div>
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Buat Password Baru</h1>
            <p className="text-xs text-gray-500 mt-1 max-w-sm">
              Kode OTP dikirim ke <span className="font-bold text-primary">{email || 'email Anda'}</span>
            </p>
          </div>

          <form onSubmit={handleResetPassword} className="space-y-4">
            
            {/* OTP Input Section */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-700 text-center">Kode OTP 6 Digit</label>
              <div className="flex justify-center gap-2">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    type="text"
                    maxLength={1}
                    value={digit}
                    ref={(el) => {
                      inputRefs.current[index] = el;
                    }}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-10 h-12 text-center text-xl font-extrabold text-primary bg-slate-50 border border-gray-200 rounded-xl focus:bg-white focus:border-accent-yellow focus:ring-4 focus:ring-accent-yellow/20 outline-none transition-all shadow-sm"
                  />
                ))}
              </div>
            </div>

            {/* New Password Field */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-700 px-1">Password Baru</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary transition-colors">
                  <i className="fa-solid fa-lock text-sm"></i>
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Minimal 8 karakter..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-11 pr-11 py-3 bg-slate-50 border border-gray-200 focus:border-accent-yellow focus:ring-accent-yellow/20 rounded-xl text-sm font-semibold text-gray-800 focus:bg-white focus:ring-4 outline-none transition-all placeholder:text-gray-400 shadow-sm"
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
            </div>

            {/* Confirm Password Field */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-700 px-1">Konfirmasi Password Baru</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary transition-colors">
                  <i className="fa-solid fa-shield-halved text-sm"></i>
                </div>
                <input
                  type={showPasswordConfirmation ? 'text' : 'password'}
                  placeholder="Ketik ulang password..."
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                  required
                  className="w-full pl-11 pr-11 py-3 bg-slate-50 border border-gray-200 focus:border-accent-yellow focus:ring-accent-yellow/20 rounded-xl text-sm font-semibold text-gray-800 focus:bg-white focus:ring-4 outline-none transition-all placeholder:text-gray-400 shadow-sm"
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

            {errorMsg && (
              <p className="text-xs text-red-500 font-medium flex items-center gap-1 pl-1">
                <i className="fa-solid fa-circle-exclamation"></i>
                {errorMsg}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || otp.join('').length !== 6 || !password || !passwordConfirmation}
              className="w-full bg-primary hover:bg-blue-900 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg hover:shadow-xl mt-2 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed hover:-translate-y-0.5 active:translate-y-0 border-b-4 border-accent-yellow active:border-b-0 text-sm"
            >
              {loading ? (
                <>
                  <i className="fa-solid fa-circle-notch animate-spin text-accent-yellow"></i>
                  <span>Memperbarui Password...</span>
                </>
              ) : (
                <>
                  <span>Simpan Password Baru</span>
                  <i className="fa-solid fa-check text-xs text-accent-yellow"></i>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center border-t border-gray-100 pt-4">
            <p className="text-xs text-gray-500 mb-1">Belum menerima kode OTP?</p>
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={resendLoading || countdown > 0}
              className="text-amber-600 font-bold text-xs hover:text-amber-700 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {resendLoading ? 'Mengirim...' : countdown > 0 ? `Kirim ulang dalam ${countdown}s` : 'Kirim Ulang Kode OTP'}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center w-full min-h-screen bg-[#002244] text-white">Memuat...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
