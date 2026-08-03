'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Script from 'next/script';
import { useRouter, useSearchParams } from 'next/navigation';
import Swal from 'sweetalert2';

function VerifyOtpContent() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!email) {
      router.push('/login');
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

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpCode = otp.join('');
    
    if (otpCode.length !== 6) {
      Swal.fire('Error', 'Silakan masukkan 6 digit kode OTP.', 'error');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email, otp: otpCode })
      });

      const data = await res.json();

      if (res.ok) {
        if (data.token) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          
          Swal.fire({
            title: 'Verifikasi Berhasil!',
            text: 'Akun Anda telah berhasil diverifikasi.',
            icon: 'success',
            showConfirmButton: false,
            timer: 1500
          }).then(() => {
            const user = data.user;
            if (user.role === 'admin') {
              router.push('/admin');
            } else {
              router.push('/user/dashboard');
            }
          });
        } else {
          Swal.fire('Berhasil', 'Akun berhasil diverifikasi. Silakan login.', 'success').then(() => {
            router.push('/login');
          });
        }
      } else {
        Swal.fire('Gagal', data.message || 'OTP tidak valid atau kadaluarsa', 'error');
      }
    } catch (err) {
      Swal.fire('Error', 'Gagal memverifikasi OTP. Coba lagi nanti.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    
    setResendLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/resend-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      const data = await res.json();

      if (res.ok) {
        Swal.fire('Berhasil', 'Kode OTP baru telah dikirim ke email Anda.', 'success');
        setCountdown(60); 
      } else {
        Swal.fire('Gagal', data.message || 'Gagal mengirim ulang OTP', 'error');
      }
    } catch (err) {
      Swal.fire('Error', 'Gagal mengirim ulang OTP. Coba lagi nanti.', 'error');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <>
      <div className="hidden lg:flex w-1/2 relative bg-[#003366] overflow-hidden flex-col items-center justify-center p-12">
        <div className="absolute inset-0 bg-[url('/images/element/1.png')] opacity-10 bg-cover bg-center"></div>
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-[#fbbf24] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        
        <div className="relative z-10 text-center flex flex-col items-center">
          <Link href="/">
            <div className="bg-white p-4 rounded-2xl shadow-2xl mb-8 inline-block transform hover:scale-105 transition-transform duration-300">
              <Image src="/images/logo/logo-bi-2.png" alt="Logo BI" width={180} height={60} priority className="h-auto w-auto" />
            </div>
          </Link>
          <h1 className="text-4xl font-extrabold text-white mb-6 leading-tight">
            Verifikasi Akun
          </h1>
          <p className="text-blue-100 text-lg max-w-md mx-auto leading-relaxed">
            Kode OTP telah dikirimkan ke email Anda. Silakan periksa kotak masuk atau folder spam.
          </p>
        </div>

        <div className="absolute bottom-10 left-10 w-20 h-20 border-4 border-white/10 rounded-full"></div>
        <div className="absolute top-20 right-20 w-12 h-12 border-4 border-[#fbbf24]/20 rounded-full"></div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 relative bg-gray-50">
        
        <div className="absolute top-6 left-6 lg:hidden z-10">
          <Link href="/">
            <Image src="/images/logo/logo-bi-2.png" alt="Logo BI" width={120} height={40} className="h-auto w-auto" />
          </Link>
        </div>

        <div className="w-full max-w-md relative z-10 mt-12 lg:mt-0">
          <div className="bg-white rounded-[2rem] p-8 md:p-10 shadow-[0_10px_40px_rgba(0,0,0,0.04)] border border-gray-100">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-blue-50 text-[#003366] rounded-full flex items-center justify-center text-2xl mx-auto mb-4">
                <i className="fa-solid fa-shield-halved"></i>
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-[#1a365d] mb-2">Verifikasi OTP</h2>
              <p className="text-gray-500 text-sm">
                Masukkan 6 digit kode yang dikirim ke:<br />
                <span className="font-bold text-[#003366]">{email}</span>
              </p>
            </div>

            <form onSubmit={handleVerify} className="space-y-8">
              
              <div className="flex justify-between gap-2 md:gap-3">
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
                    className="w-12 h-14 md:w-14 md:h-16 text-center text-2xl font-extrabold text-[#003366] bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-[#fbbf24] focus:ring-4 focus:ring-[#fbbf24]/20 outline-none transition-all shadow-sm"
                  />
                ))}
              </div>

              <button
                type="submit"
                disabled={loading || otp.join('').length !== 6}
                className="w-full bg-[#003366] text-white font-bold rounded-xl px-4 py-4 hover:bg-[#002244] focus:ring-4 focus:ring-blue-500/30 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
              >
                {loading ? (
                  <><i className="fa-solid fa-circle-notch animate-spin"></i> Memverifikasi...</>
                ) : (
                  <>Verifikasi Sekarang <i className="fa-solid fa-arrow-right"></i></>
                )}
              </button>
            </form>

            <div className="mt-8 text-center border-t border-gray-100 pt-6">
              <p className="text-sm text-gray-600 mb-2">Belum menerima kode?</p>
              <button
                type="button"
                onClick={handleResend}
                disabled={resendLoading || countdown > 0}
                className="text-[#fbbf24] font-bold text-sm hover:text-yellow-500 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {resendLoading ? 'Mengirim...' : countdown > 0 ? `Kirim ulang dalam ${countdown}s` : 'Kirim Ulang Kode'}
              </button>
            </div>
            
          </div>
        </div>
      </div>
    </>
  );
}

export default function VerifyOtpPage() {
  return (
    <main className="min-h-screen flex font-sans bg-gray-50">
      <Suspense fallback={<div className="flex items-center justify-center w-full min-h-screen">Loading...</div>}>
        <VerifyOtpContent />
      </Suspense>
    </main>
  );
}
