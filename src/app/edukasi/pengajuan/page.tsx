'use client';

import Navbar from "@/components/layout/Navbar";
import { useState, useEffect } from "react";
import Footer from "@/components/layout/Footer";
import { PengajuanForm } from "./types";
import { submitPengajuanEdukasi } from "./api";
import Swal from "sweetalert2";
import Link from "next/link";
import { useRouter } from "next/navigation";

const WILAYAH_KERJA = [
  'Pematangsiantar',
  'Simalungun',
  'Batubara',
  'Asahan',
  'Tanjungbalai',
  'Labuhanbatu Utara',
  'Labuhanbatu',
  'Labuhanbatu Selatan'
];

export default function PengajuanEdukasiPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    setIsAuthenticated(!!token);
  }, []);

  const [formData, setFormData] = useState<PengajuanForm>({
    jenis_pengajuan: 'mengunjungi',
    nama_kegiatan: '',
    tujuan_kegiatan: '',
    jumlah_peserta: '',
    deskripsi_kegiatan: '',
    tanggal_kegiatan: '',
    waktu_pelaksanaan: '',
    durasi: '',
    kota_kabupaten: '',
    lokasi_kegiatan: '',
    
    nama_pic: '',
    jabatan_pic: '',
    jenis_instansi: '',
    nama_instansi: '',
    alamat_instansi: '',
    email_pic: '',
    no_telp_pic: '',

    dokumen_proposal: null,
    dokumen_lainnya: null,
  });

  const steps = [
    { id: 1, label: 'Informasi Kegiatan' },
    { id: 2, label: 'Informasi Pemohon' },
    { id: 3, label: 'Dokumen Pendukung' },
    { id: 4, label: 'Konfirmasi' },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: 'dokumen_proposal' | 'dokumen_lainnya') => {
    if (e.target.files && e.target.files.length > 0) {
      setFormData(prev => ({ ...prev, [fieldName]: e.target.files![0] }));
    }
  };

  const nextStep = () => {
    if (step === 1) {
      if (
        !formData.nama_kegiatan ||
        !formData.tujuan_kegiatan ||
        !formData.jumlah_peserta ||
        !formData.deskripsi_kegiatan ||
        !formData.tanggal_kegiatan ||
        !formData.waktu_pelaksanaan ||
        !formData.durasi ||
        !formData.kota_kabupaten ||
        !formData.lokasi_kegiatan
      ) {
        Swal.fire('Data Belum Lengkap', 'Harap isi semua kolom informasi kegiatan termasuk Kota/Kabupaten yang ditandai bintang merah (*).', 'warning');
        return;
      }
    } else if (step === 2) {
      if (
        !formData.nama_pic ||
        !formData.jabatan_pic ||
        !formData.jenis_instansi ||
        !formData.nama_instansi ||
        !formData.alamat_instansi ||
        !formData.email_pic ||
        !formData.no_telp_pic
      ) {
        Swal.fire('Data Pemohon Belum Lengkap', 'Harap lengkapi semua data penanggung jawab dan instansi pemohon (*).', 'warning');
        return;
      }
    } else if (step === 3) {
      if (!formData.dokumen_proposal) {
        Swal.fire('Dokumen Proposal Wajib Upload', 'Unggah berkas Proposal Kegiatan dalam format PDF/DOC/ZIP.', 'warning');
        return;
      }
    }
    
    setStep(prev => Math.min(prev + 1, 4));
  };

  const prevStep = () => {
    setStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      Swal.fire('Akses Ditolak', 'Anda harus login terlebih dahulu untuk mengajukan kegiatan.', 'warning').then(() => {
        router.push('/login');
      });
      return;
    }

    if (!formData.dokumen_proposal) {
      Swal.fire('Proposal Belum Diunggah', 'Dokumen proposal kegiatan wajib diunggah.', 'warning');
      setStep(3);
      return;
    }

    try {
      setIsSubmitting(true);
      await submitPengajuanEdukasi(formData);
      
      Swal.fire({
        title: 'Berhasil!',
        text: 'Pengajuan kegiatan edukasi Anda berhasil dikirim.',
        icon: 'success',
        confirmButtonColor: '#003366'
      }).then(() => {
        router.push('/user/dashboard/riwayat');
      });
    } catch (error: any) {
      console.error(error);
      Swal.fire('Gagal', error.response?.data?.message || 'Terjadi kesalahan saat mengirim pengajuan. Pastikan semua data terisi dengan benar.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f8fafc] font-sans flex flex-col">
      <Navbar />

      {/* Top Banner Header - Standard App Page Header */}
      <section className="bg-primary text-white pt-32 pb-20 md:pt-36 md:pb-24 px-4 md:px-8 relative overflow-hidden border-b-4 border-[#fbbf24]">
        {/* Background Image /images/header.jpg */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <img 
            src="/images/header.jpg" 
            alt="Header Background" 
            className="w-full h-full object-cover object-center opacity-20 mix-blend-overlay"
          />
        </div>
        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-blue-200 mb-3 font-medium">
            <Link href="/" className="hover:text-white transition-colors">Beranda</Link>
            <span>&gt;</span>
            <Link href="/edukasi" className="hover:text-white transition-colors">Edukasi</Link>
            <span>&gt;</span>
            <span className="text-white font-semibold">Pengajuan Kegiatan</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-3 drop-shadow-md">
            Ajukan Kegiatan <span className="relative inline-block">Edukasi<span className="absolute left-0 bottom-0 w-full h-1.5 bg-[#fbbf24] rounded-full"></span></span>
          </h1>
          <p className="text-blue-100 max-w-2xl mx-auto text-sm md:text-base font-medium leading-relaxed drop-shadow-sm">
            Mau belajar langsung bersama Bank Indonesia? Datang ke kantor kami atau undang kami ke tempat Anda. Ajukan kegiatan dengan mudah melalui PLAT-BK.
          </p>
        </div>
      </section>
      
      <div className="px-4 md:px-8 max-w-7xl mx-auto pt-10 relative z-20 pb-20 flex-1 w-full">
        
        {/* Stepper Section - Matches Screenshot (4 Steps) */}
        <div className="w-full mb-10 overflow-x-auto pb-4 hide-scrollbar">
          <div className="flex items-center justify-between min-w-[650px] max-w-4xl mx-auto relative px-6">
            <div className="absolute top-5 left-10 right-10 h-[2px] bg-gray-200 -z-10"></div>
            {steps.map((s, idx) => (
              <div key={s.id} className="flex flex-col items-center gap-2 relative">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-4 border-white shadow-md transition-all duration-300 ${
                  step >= s.id ? 'bg-[#004f9e] text-white scale-110' : 'bg-gray-200 text-gray-400'
                }`}>
                  {step > s.id ? <i className="fa-solid fa-check text-xs"></i> : s.id}
                </div>
                <span className={`text-[12px] font-bold text-center ${step >= s.id ? 'text-[#004f9e]' : 'text-gray-400'}`}>
                  {s.label}
                </span>
                
                {idx !== 0 && step >= s.id && (
                  <div className="absolute top-5 right-1/2 w-full h-[2px] bg-[#004f9e] -z-10 transition-all duration-500"></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Main Content Area */}
        {isAuthenticated === false ? (
          <div className="flex flex-col items-center justify-center bg-white rounded-3xl shadow-xl border border-gray-100 p-12 text-center max-w-2xl mx-auto mt-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-[#004f9e]"></div>
            <div className="w-20 h-20 bg-blue-50 text-[#004f9e] rounded-full flex items-center justify-center text-3xl mb-6 shadow-inner">
              <i className="fa-solid fa-lock"></i>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">Akses Terbatas</h2>
            <p className="text-gray-500 mb-8 max-w-md text-sm">
              Silakan <span className="font-bold text-[#004f9e]">Login</span> terlebih dahulu untuk dapat mengajukan permintaan kegiatan edukasi Bank Indonesia.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <button onClick={() => router.push('/login')} className="px-8 py-3 rounded-xl bg-accent-red text-white font-bold hover:brightness-110 transition-all shadow-md text-sm">
                Masuk (Log In)
              </button>
              <button onClick={() => router.push('/register')} className="px-8 py-3 rounded-xl bg-white border border-gray-200 text-gray-700 font-bold hover:bg-gray-50 transition-all shadow-sm text-sm">
                Daftar Baru
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            
            {/* Form Area (Left Main) */}
            <div className="flex-1 bg-white rounded-3xl shadow-[0_10px_35px_rgba(0,0,0,0.05)] border border-gray-100 p-6 md:p-10 w-full relative">
            
            {/* Top Form Header with Jenis Kegiatan Dropdown/Pill */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-6 border-b border-gray-100">
              <div className="bg-gray-100 text-gray-700 text-xs sm:text-sm font-bold px-5 py-2.5 rounded-xl shadow-inner">
                {steps[step - 1].label}
              </div>

              <div className="flex items-center gap-2">
                <label className="text-xs font-bold text-gray-500 hidden sm:inline-block">Tipe Pengajuan:</label>
                <div className="relative">
                  <select
                    name="jenis_pengajuan"
                    value={formData.jenis_pengajuan}
                    onChange={(e) => setFormData(prev => ({ ...prev, jenis_pengajuan: e.target.value as 'mengunjungi' | 'dikunjungi' }))}
                    disabled={step > 1}
                    className="bg-accent-red text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl border-none outline-none shadow-md cursor-pointer appearance-none pr-8 hover:brightness-110 transition-all disabled:opacity-75 disabled:cursor-not-allowed"
                  >
                    <option value="mengunjungi" className="bg-white text-gray-800 font-medium">Ingin Mengunjungi BI</option>
                    <option value="dikunjungi" className="bg-white text-gray-800 font-medium">BI Mengunjungi Instansi Anda</option>
                  </select>
                  <i className="fa-solid fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-white text-xs pointer-events-none"></i>
                </div>
              </div>
            </div>

            {/* STEP 1: Informasi Kegiatan */}
            {step === 1 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in">
                {/* Column 1: Detail Kegiatan */}
                <div className="flex flex-col gap-5">
                  <div className="flex items-center gap-2 text-[#004f9e] font-bold text-sm mb-1 pb-2 border-b border-blue-50">
                    <i className="fa-regular fa-clipboard"></i>
                    <span>Detail Kegiatan</span>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-700">Nama Kegiatan <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      name="nama_kegiatan" 
                      value={formData.nama_kegiatan} 
                      onChange={handleInputChange} 
                      placeholder="Masukkan nama kegiatan" 
                      className="w-full bg-gray-50/50 text-gray-800 text-xs sm:text-sm rounded-xl px-4 py-3 outline-none transition-all border border-gray-200 focus:border-[#004f9e] focus:bg-white focus:ring-4 focus:ring-blue-50 shadow-sm"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-700">Tujuan Kegiatan <span className="text-red-500">*</span></label>
                    <textarea 
                      name="tujuan_kegiatan" 
                      value={formData.tujuan_kegiatan} 
                      onChange={handleInputChange} 
                      placeholder="Jelaskan tujuan kegiatan" 
                      rows={3}
                      className="w-full bg-gray-50/50 text-gray-800 text-xs sm:text-sm rounded-xl px-4 py-3 outline-none transition-all border border-gray-200 focus:border-[#004f9e] focus:bg-white focus:ring-4 focus:ring-blue-50 resize-none shadow-sm"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-700">Jumlah Peserta (Estimasi) <span className="text-red-500">*</span></label>
                    <input 
                      type="number" 
                      name="jumlah_peserta" 
                      value={formData.jumlah_peserta} 
                      onChange={handleInputChange} 
                      placeholder="Masukkan jumlah peserta" 
                      min="1" 
                      className="w-full bg-gray-50/50 text-gray-800 text-xs sm:text-sm rounded-xl px-4 py-3 outline-none transition-all border border-gray-200 focus:border-[#004f9e] focus:bg-white focus:ring-4 focus:ring-blue-50 shadow-sm"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-700">Deskripsi Kegiatan <span className="text-red-500">*</span></label>
                    <textarea 
                      name="deskripsi_kegiatan" 
                      value={formData.deskripsi_kegiatan} 
                      onChange={handleInputChange} 
                      placeholder="Jelaskan deskripsi kegiatan" 
                      rows={4}
                      className="w-full bg-gray-50/50 text-gray-800 text-xs sm:text-sm rounded-xl px-4 py-3 outline-none transition-all border border-gray-200 focus:border-[#004f9e] focus:bg-white focus:ring-4 focus:ring-blue-50 resize-none shadow-sm"
                    />
                  </div>
                </div>

                {/* Column 2: Informasi Pelaksanaan */}
                <div className="flex flex-col gap-5">
                  <div className="flex items-center gap-2 text-[#004f9e] font-bold text-sm mb-1 pb-2 border-b border-blue-50">
                    <i className="fa-regular fa-calendar-check"></i>
                    <span>Informasi Pelaksanaan</span>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-700">Tanggal Kegiatan <span className="text-red-500">*</span></label>
                    <input 
                      type="date" 
                      name="tanggal_kegiatan" 
                      value={formData.tanggal_kegiatan} 
                      onChange={handleInputChange} 
                      className="w-full bg-gray-50/50 text-gray-800 text-xs sm:text-sm rounded-xl px-4 py-3 outline-none transition-all border border-gray-200 focus:border-[#004f9e] focus:bg-white focus:ring-4 focus:ring-blue-50 shadow-sm"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-700">Waktu Pelaksanaan <span className="text-red-500">*</span></label>
                    <input 
                      type="time" 
                      name="waktu_pelaksanaan" 
                      value={formData.waktu_pelaksanaan} 
                      onChange={handleInputChange} 
                      className="w-full bg-gray-50/50 text-gray-800 text-xs sm:text-sm rounded-xl px-4 py-3 outline-none transition-all border border-gray-200 focus:border-[#004f9e] focus:bg-white focus:ring-4 focus:ring-blue-50 shadow-sm"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-700">Durasi <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <select 
                        name="durasi" 
                        value={formData.durasi} 
                        onChange={handleInputChange} 
                        className="w-full bg-gray-50/50 text-gray-800 text-xs sm:text-sm rounded-xl px-4 py-3 outline-none transition-all border border-gray-200 focus:border-[#004f9e] focus:bg-white focus:ring-4 focus:ring-blue-50 appearance-none shadow-sm cursor-pointer"
                      >
                        <option value="">Pilih durasi kegiatan</option>
                        <option value="1 Jam">1 Jam</option>
                        <option value="2 Jam">2 Jam</option>
                        <option value="3 Jam">3 Jam</option>
                        <option value="Setengah Hari (4 Jam)">Setengah Hari (4 Jam)</option>
                        <option value="Satu Hari Penuh (8 Jam)">Satu Hari Penuh (8 Jam)</option>
                      </select>
                      <i className="fa-solid fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-xs"></i>
                    </div>
                  </div>

                  {/* Kota / Kabupaten Field - REQUIRED Dropdown */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-700">Kota / Kabupaten <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <select 
                        name="kota_kabupaten" 
                        value={formData.kota_kabupaten} 
                        onChange={handleInputChange} 
                        required
                        className="w-full bg-gray-50/50 text-gray-800 text-xs sm:text-sm rounded-xl px-4 py-3 outline-none transition-all border border-gray-200 focus:border-[#004f9e] focus:bg-white focus:ring-4 focus:ring-blue-50 appearance-none shadow-sm cursor-pointer"
                      >
                        <option value="">Pilih Kota / Kabupaten</option>
                        {WILAYAH_KERJA.map((wil, idx) => (
                          <option key={idx} value={wil}>{wil}</option>
                        ))}
                      </select>
                      <i className="fa-solid fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-xs"></i>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-700">Lokasi Kegiatan <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      name="lokasi_kegiatan" 
                      value={formData.lokasi_kegiatan} 
                      onChange={handleInputChange} 
                      placeholder="Masukkan lokasi kegiatan (nama tempat/alamat)" 
                      className="w-full bg-gray-50/50 text-gray-800 text-xs sm:text-sm rounded-xl px-4 py-3 outline-none transition-all border border-gray-200 focus:border-[#004f9e] focus:bg-white focus:ring-4 focus:ring-blue-50 shadow-sm"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Informasi Pemohon */}
            {step === 2 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in">
                <div className="flex flex-col gap-5">
                  <div className="flex items-center gap-2 text-[#004f9e] font-bold text-sm mb-1 pb-2 border-b border-blue-50">
                    <i className="fa-solid fa-user-check"></i>
                    <span>Penanggung Jawab (PIC)</span>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-700">Nama Penanggung Jawab <span className="text-red-500">*</span></label>
                    <input type="text" name="nama_pic" value={formData.nama_pic} onChange={handleInputChange} placeholder="Masukkan nama lengkap" className="w-full bg-gray-50/50 text-gray-800 text-xs sm:text-sm rounded-xl px-4 py-3 outline-none transition-all border border-gray-200 focus:border-[#004f9e] focus:bg-white focus:ring-4 focus:ring-blue-50 shadow-sm" />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-700">Jabatan <span className="text-red-500">*</span></label>
                    <input type="text" name="jabatan_pic" value={formData.jabatan_pic} onChange={handleInputChange} placeholder="Masukkan jabatan" className="w-full bg-gray-50/50 text-gray-800 text-xs sm:text-sm rounded-xl px-4 py-3 outline-none transition-all border border-gray-200 focus:border-[#004f9e] focus:bg-white focus:ring-4 focus:ring-blue-50 shadow-sm" />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-700">Email <span className="text-red-500">*</span></label>
                    <input type="email" name="email_pic" value={formData.email_pic} onChange={handleInputChange} placeholder="Masukkan email aktif" className="w-full bg-gray-50/50 text-gray-800 text-xs sm:text-sm rounded-xl px-4 py-3 outline-none transition-all border border-gray-200 focus:border-[#004f9e] focus:bg-white focus:ring-4 focus:ring-blue-50 shadow-sm" />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-700">No. Telepon / WhatsApp <span className="text-red-500">*</span></label>
                    <input type="tel" name="no_telp_pic" value={formData.no_telp_pic} onChange={handleInputChange} placeholder="Contoh: 081234567890" className="w-full bg-gray-50/50 text-gray-800 text-xs sm:text-sm rounded-xl px-4 py-3 outline-none transition-all border border-gray-200 focus:border-[#004f9e] focus:bg-white focus:ring-4 focus:ring-blue-50 shadow-sm" />
                  </div>
                </div>

                <div className="flex flex-col gap-5">
                  <div className="flex items-center gap-2 text-[#004f9e] font-bold text-sm mb-1 pb-2 border-b border-blue-50">
                    <i className="fa-solid fa-[#004f9e] fa-building"></i>
                    <span>Informasi Instansi / Lembaga</span>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-700">Jenis Instansi <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <select name="jenis_instansi" value={formData.jenis_instansi} onChange={handleInputChange} className="w-full bg-gray-50/50 text-gray-800 text-xs sm:text-sm rounded-xl px-4 py-3 outline-none transition-all border border-gray-200 focus:border-[#004f9e] focus:bg-white focus:ring-4 focus:ring-blue-50 appearance-none shadow-sm cursor-pointer">
                        <option value="">Pilih jenis instansi</option>
                        <option value="Sekolah / Universitas">Sekolah / Universitas</option>
                        <option value="Instansi Pemerintah">Instansi Pemerintah</option>
                        <option value="Perusahaan Swasta">Perusahaan Swasta</option>
                        <option value="Komunitas / Organisasi">Komunitas / Organisasi</option>
                      </select>
                      <i className="fa-solid fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-xs"></i>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-700">Nama Instansi <span className="text-red-500">*</span></label>
                    <input type="text" name="nama_instansi" value={formData.nama_instansi} onChange={handleInputChange} placeholder="Masukkan nama instansi" className="w-full bg-gray-50/50 text-gray-800 text-xs sm:text-sm rounded-xl px-4 py-3 outline-none transition-all border border-gray-200 focus:border-[#004f9e] focus:bg-white focus:ring-4 focus:ring-blue-50 shadow-sm" />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-700">Alamat Lengkap Instansi <span className="text-red-500">*</span></label>
                    <textarea name="alamat_instansi" value={formData.alamat_instansi} onChange={handleInputChange} placeholder="Masukkan alamat lengkap instansi" rows={4} className="w-full bg-gray-50/50 text-gray-800 text-xs sm:text-sm rounded-xl px-4 py-3 outline-none transition-all border border-gray-200 focus:border-[#004f9e] focus:bg-white focus:ring-4 focus:ring-blue-50 resize-none shadow-sm" />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: Dokumen Pendukung */}
            {step === 3 && (
              <div className="flex flex-col gap-6 animate-fade-in max-w-2xl mx-auto w-full py-4">
                <div className="bg-blue-50/80 border border-blue-100 rounded-2xl p-4 flex items-start gap-3 text-xs sm:text-sm text-gray-700">
                  <i className="fa-solid fa-circle-info text-[#004f9e] text-base mt-0.5 shrink-0"></i>
                  <p className="leading-relaxed">
                    Format file proposal yang didukung adalah <strong>PDF, DOC, DOCX, atau ZIP</strong> dengan ukuran maksimal <strong>10MB</strong>. Unggah berkas proposal permohonan Anda dengan jelas.
                  </p>
                </div>
                
                {/* Upload File Proposal - WAJIB */}
                <div className="flex flex-col gap-2 bg-gray-50/60 border-2 border-dashed border-gray-300 hover:border-[#004f9e] rounded-2xl p-6 transition-all text-center">
                  <label className="text-sm font-bold text-gray-800 mb-1 cursor-pointer">
                    Upload Berkas Proposal Kegiatan <span className="text-red-500">* (Wajib)</span>
                  </label>
                  <p className="text-xs text-gray-400 mb-4">Pilih file PDF/DOCX proposal permohonan Anda</p>
                  
                  <input 
                    type="file" 
                    accept=".pdf,.doc,.docx,.zip"
                    onChange={(e) => handleFileChange(e, 'dokumen_proposal')}
                    className="w-full bg-white text-gray-800 text-xs sm:text-sm rounded-xl file:mr-4 file:py-2.5 file:px-5 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#004f9e] file:text-white hover:file:bg-blue-900 outline-none border border-gray-200 shadow-sm cursor-pointer" 
                  />
                  
                  {formData.dokumen_proposal && (
                    <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-xl text-xs text-green-700 font-semibold flex items-center justify-center gap-2">
                      <i className="fa-solid fa-file-circle-check text-green-600 text-sm"></i>
                      <span>{formData.dokumen_proposal.name}</span>
                    </div>
                  )}
                </div>

                {/* Upload Dokumen Pendukung Lain - Opsional */}
                <div className="flex flex-col gap-2 bg-gray-50/30 border border-gray-200 rounded-2xl p-5 text-left">
                  <label className="text-xs font-bold text-gray-700 mb-1">
                    Upload Dokumen Pendukung Lainnya <span className="text-gray-400 font-normal ml-1">(Opsional, e.g. RAB/Surat Pengantar)</span>
                  </label>
                  <input 
                    type="file" 
                    accept=".pdf,.doc,.docx,.zip"
                    onChange={(e) => handleFileChange(e, 'dokumen_lainnya')}
                    className="w-full bg-white text-gray-800 text-xs rounded-xl file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 outline-none border border-gray-200 shadow-sm cursor-pointer" 
                  />
                </div>
              </div>
            )}

            {/* STEP 4: Konfirmasi */}
            {step === 4 && (
              <div className="flex flex-col gap-6 animate-fade-in">
                <div className="bg-blue-50/70 border border-blue-100 rounded-2xl p-4 flex items-center gap-3 text-xs sm:text-sm text-gray-700">
                  <i className="fa-solid fa-circle-check text-[#004f9e] text-base shrink-0"></i>
                  <p>Periksa kembali data pengajuan Anda. Tekan <strong>Kirim Pengajuan</strong> jika data sudah lengkap dan benar.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs sm:text-sm">
                  <div className="bg-gray-50/70 border border-gray-200/80 rounded-2xl p-5 flex flex-col gap-3">
                    <h3 className="font-bold text-[#004f9e] border-b border-gray-200 pb-2 flex items-center gap-2">
                      <i className="fa-solid fa-circle-info"></i> Detail Kegiatan
                    </h3>
                    <p><strong>Nama Kegiatan:</strong> {formData.nama_kegiatan}</p>
                    <p><strong>Tujuan Kegiatan:</strong> {formData.tujuan_kegiatan}</p>
                    <p><strong>Jumlah Peserta:</strong> {formData.jumlah_peserta} Orang</p>
                    <p><strong>Tanggal:</strong> {formData.tanggal_kegiatan}</p>
                    <p><strong>Waktu & Durasi:</strong> {formData.waktu_pelaksanaan} ({formData.durasi})</p>
                    <p><strong>Kota / Kabupaten:</strong> <span className="font-bold text-primary">{formData.kota_kabupaten}</span></p>
                    <p><strong>Lokasi Kegiatan:</strong> {formData.lokasi_kegiatan}</p>
                  </div>

                  <div className="bg-gray-50/70 border border-gray-200/80 rounded-2xl p-5 flex flex-col gap-3">
                    <h3 className="font-bold text-[#004f9e] border-b border-gray-200 pb-2 flex items-center gap-2">
                      <i className="fa-solid fa-building"></i> Pemohon & Dokumen
                    </h3>
                    <p><strong>Tipe Pengajuan:</strong> {formData.jenis_pengajuan === 'mengunjungi' ? 'Mengunjungi BI' : 'BI Mengunjungi Instansi'}</p>
                    <p><strong>Penanggung Jawab:</strong> {formData.nama_pic} ({formData.jabatan_pic})</p>
                    <p><strong>Instansi:</strong> {formData.nama_instansi} ({formData.jenis_instansi})</p>
                    <p><strong>Alamat Instansi:</strong> {formData.alamat_instansi}</p>
                    <p><strong>Kontak PIC:</strong> {formData.no_telp_pic} | {formData.email_pic}</p>
                    <p className="flex items-center gap-2 text-green-700 font-semibold pt-1 border-t border-gray-200">
                      <i className="fa-solid fa-file-pdf text-red-500"></i> Proposal: {formData.dokumen_proposal?.name}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons (Bottom) */}
            <div className="mt-10 flex items-center justify-end gap-3 border-t border-gray-100 pt-6">
              {step > 1 && (
                <button 
                  type="button" 
                  onClick={prevStep} 
                  className="px-6 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-bold hover:bg-gray-50 transition-all text-xs sm:text-sm"
                >
                  Kembali
                </button>
              )}
              
              {step < 4 ? (
                <button 
                  type="button" 
                  onClick={nextStep} 
                  className="px-8 py-3 rounded-xl bg-[#fbbf24] hover:bg-yellow-500 text-gray-900 font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 text-xs sm:text-sm"
                >
                  <span>Selanjutnya</span>
                  <i className="fa-solid fa-chevron-right text-xs"></i>
                </button>
              ) : (
                <button 
                  type="button" 
                  onClick={handleSubmit} 
                  disabled={isSubmitting} 
                  className="px-8 py-3 rounded-xl bg-accent-red hover:brightness-110 text-white font-bold shadow-md transition-all flex items-center gap-2 text-xs sm:text-sm disabled:opacity-70"
                >
                  {isSubmitting ? <i className="fa-solid fa-circle-notch animate-spin"></i> : <i className="fa-solid fa-paper-plane"></i>}
                  <span>Kirim Pengajuan</span>
                </button>
              )}
            </div>

          </div>

          {/* Sidebar Area (Right Column) - ONLY WILAYAH KERJA AS REQUESTED */}
          <div className="w-full lg:w-[340px] shrink-0">
            <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-gray-100 p-6 sm:p-7 relative overflow-hidden">
              <div className="flex items-center gap-3.5 mb-4 pb-4 border-b border-gray-100">
                <div className="w-11 h-11 rounded-2xl bg-blue-50 text-[#004f9e] flex items-center justify-center text-xl shrink-0 shadow-inner">
                  <i className="fa-solid fa-location-dot"></i>
                </div>
                <div>
                  <h3 className="text-[#004f9e] font-extrabold text-base sm:text-lg tracking-tight">Wilayah Kerja</h3>
                </div>
              </div>

              <p className="text-gray-600 text-xs sm:text-[13px] leading-relaxed mb-5">
                Pengajuan kegiatan edukasi hanya untuk wilayah kerja Bank Indonesia Pematangsiantar, yaitu:
              </p>

              {/* Grid 2 Columns for Locations */}
              <div className="grid grid-cols-2 gap-2.5 mb-6">
                {WILAYAH_KERJA.map((wilayah, idx) => (
                  <div 
                    key={idx} 
                    className="flex items-center gap-2 bg-gray-50/80 border border-gray-100 rounded-xl px-3 py-2 text-xs font-semibold text-gray-700 hover:border-blue-200 transition-colors"
                  >
                    <i className="fa-solid fa-location-dot text-[#004f9e] text-[11px] shrink-0"></i>
                    <span className="truncate">{wilayah}</span>
                  </div>
                ))}
              </div>

              <div className="bg-blue-50/60 border border-blue-100/80 rounded-xl p-3.5 text-center">
                <p className="text-[11px] font-semibold text-[#004f9e] leading-snug">
                  Pengajuan di luar wilayah tersebut tidak dapat diproses.
                </p>
              </div>
            </div>
          </div>

        </div>
        )}
      </div>

      <Footer />
    </main>
  );
}
