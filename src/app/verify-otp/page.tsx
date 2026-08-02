'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Script from 'next/script';
import { useRouter, useSearchParams } from 'next/navigation';
import Swal from 'sweetalert2';

export default function VerifyOtpPage() {
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
    // Allow pasting full code
    if (value.length > 1) {
      const pasted = value.slice(0, 6).split('');
      for (let i = 0; i < pasted.length; i++) {
        newOtp[i] = pasted[i];
      }
      setOtp(newOtp);
      // Focus last filled input
      const lastIndex = pasted.length < 6 ? pasted.length : 5;
      inputRefs.current[lastIndex]?.focus();
      return;
    }

    newOtp[index] = value;
    setOtp(newOtp);

    // Auto focus next
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
        // Automatically log them in by saving token
        if (data.token) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          
          Swal.fire({
            title: 'Verifikasi Berhasil!',
            text: 'Akun Anda telah berhasil diverifikasi.',
            icon: 'success',
            showConfirmButton: false,
            timer: 1500,
          }).then(() => {
            if (data.user.role === 'admin') {
              router.push('/admin');
            } else {
              router.push('/edukasi/pengajuan');
            }
          });
        }
      } else {
        Swal.fire('Gagal', data.message || 'Kode OTP salah atau sudah kedaluwarsa.', 'error');
      }
    } catch (err) {
      Swal.fire('Gagal', 'Tidak dapat terhubung ke server.', 'error');
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
        Swal.fire('Terkirim!', 'Kode OTP baru telah dikirim ke email Anda.', 'success');
        setCountdown(60); // 60 seconds cooldown
      } else {
        Swal.fire('Gagal', data.message || 'Gagal mengirim ulang OTP.', 'error');
      }
    } catch (err) {
      Swal.fire('Gagal', 'Tidak dapat terhubung ke server.', 'error');
    } finally {
      setResendLoading(false);
    }
  };

  if (!email) return null;

  return (
    <main className="min-h-screen relative flex items-center justify-center p-4 bg-slate-50">
      <Link href="/login" className="absolute top-8 left-8 text-gray-500 hover:text-[#002a5c] transition-colors flex items-center gap-2 font-medium z-20">
        <i className="fa-solid fa-arrow-left"></i> Kembali ke Login
      </Link>

      <div className="w-full max-w-[500px] bg-white rounded-3xl shadow-xl p-10 relative z-10 border border-gray-100">
        <div className="flex flex-col items-center mb-8">
          <Image
            src="/images/logo.png"
            alt="Logo BI Mengajar"
            width={160}
            height={50}
            className="h-12 w-auto object-contain mb-6"
            priority
          />
          <div className="w-16 h-16 bg-blue-50 text-[#002a5c] rounded-full flex items-center justify-center text-2xl mb-4">
            <i className="fa-regular fa-envelope-open"></i>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Verifikasi Email</h1>
          <p className="text-sm text-gray-500 mt-2 text-center leading-relaxed">
            Kami telah mengirimkan 6 digit kode OTP ke email<br/>
            <strong className="text-gray-800">{email}</strong>
          </p>
        </div>

        <form onSubmit={handleVerify} className="flex flex-col gap-6">
          <div className="flex justify-center gap-2 sm:gap-3">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => { inputRefs.current[index] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-bold text-[#002a5c] bg-gray-50 border border-gray-200 rounded-xl focus:border-[#002a5c] focus:ring-2 focus:ring-[#002a5c]/20 outline-none transition-all shadow-sm"
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={loading || otp.join('').length !== 6}
            className="w-full bg-[#002a5c] hover:bg-blue-900 text-white font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-xl mt-4 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? <i className="fa-solid fa-circle-notch animate-spin"></i> : 'Verifikasi Sekarang'}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-gray-100 pt-6">
          <p className="text-sm text-gray-500">
            Belum menerima email?{' '}
            {countdown > 0 ? (
              <span className="text-gray-400 font-medium">Kirim ulang dalam {countdown}s</span>
            ) : (
              <button 
                onClick={handleResend}
                disabled={resendLoading}
                className="text-[#002a5c] font-bold hover:underline transition-all"
              >
                {resendLoading ? 'Mengirim...' : 'Kirim ulang OTP'}
              </button>
            )}
          </p>
        </div>
      </div>
    </main>
  );
}
