'use client';

import Navbar from "@/components/layout/Navbar";
import { useState } from "react";
import Header from "./components/Header";
import { PengajuanForm } from "./types";
import { submitPengajuanEdukasi } from "./api";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";

export default function PengajuanEdukasiPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<PengajuanForm>({
    jenis_instansi: '',
    nama_instansi: '',
    alamat_instansi: '',
    nama_pic: '',
    jabatan_pic: '',
    email_pic: '',
    no_telp_pic: '',
    tema_kegiatan: '',
    deskripsi_kegiatan: '',
    jumlah_peserta: '',
    tanggal_kegiatan: '',
    waktu_mulai: '',
    waktu_selesai: '',
    lokasi_kegiatan: '',
    dokumen_proposal: null,
  });

  const steps = [
    { id: 1, label: 'Data Instansi' },
    { id: 2, label: 'Tema & Kegiatan' },
    { id: 3, label: 'Waktu & Lokasi' },
    { id: 4, label: 'Unggah Dokumen' },
    { id: 5, label: 'Konfirmasi' },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFormData(prev => ({ ...prev, dokumen_proposal: e.target.files![0] }));
    }
  };

  const nextStep = () => {
    // Basic validation
    if (step === 1) {
      if (!formData.jenis_instansi || !formData.nama_instansi || !formData.alamat_instansi || !formData.nama_pic || !formData.jabatan_pic || !formData.email_pic || !formData.no_telp_pic) {
        Swal.fire('Data Belum Lengkap', 'Harap isi semua bidang yang ditandai bintang merah (*).', 'warning');
        return;
      }
    } else if (step === 2) {
      if (!formData.tema_kegiatan || !formData.jumlah_peserta || !formData.deskripsi_kegiatan) {
        Swal.fire('Data Belum Lengkap', 'Harap lengkapi tema, jumlah peserta, dan deskripsi kegiatan.', 'warning');
        return;
      }
    } else if (step === 3) {
      if (!formData.tanggal_kegiatan || !formData.waktu_mulai || !formData.waktu_selesai || !formData.lokasi_kegiatan) {
        Swal.fire('Data Belum Lengkap', 'Harap isi tanggal, waktu, dan lokasi kegiatan.', 'warning');
        return;
      }
    } else if (step === 4) {
      if (!formData.dokumen_proposal) {
        Swal.fire('Dokumen Diperlukan', 'Harap unggah proposal kegiatan sebelum melanjutkan.', 'warning');
        return;
      }
    }
    
    setStep(prev => Math.min(prev + 1, 5));
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

    try {
      setIsSubmitting(true);
      await submitPengajuanEdukasi(formData);
      
      Swal.fire({
        title: 'Berhasil!',
        text: 'Pengajuan kegiatan edukasi Anda berhasil dikirim.',
        icon: 'success',
        confirmButtonColor: '#003366'
      }).then(() => {
        router.push('/');
      });
    } catch (error: any) {
      console.error(error);
      Swal.fire('Gagal', error.response?.data?.message || 'Terjadi kesalahan saat mengirim pengajuan. Pastikan semua data terisi dengan benar.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f2f6fa] pb-20 font-sans">
      <Navbar />
      <Header />
      
      <div className="px-4 md:px-8 max-w-7xl mx-auto pt-12 relative z-20">
        {/* Stepper Section */}
        <div className="w-full mb-10 overflow-x-auto pb-6 hide-scrollbar">
          <div className="flex items-center justify-between min-w-[700px] relative px-4">
            <div className="absolute top-5 left-4 right-4 h-[2px] bg-gray-200 -z-10"></div>
            {steps.map((s, idx) => (
              <div key={s.id} className="flex flex-col items-center gap-3 relative w-1/5">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-[3px] border-white shadow-md transition-all duration-300 ${
                  step >= s.id ? 'bg-primary text-white scale-110' : 'bg-gray-100 text-gray-400'
                }`}>
                  {step > s.id ? <i className="fa-solid fa-check"></i> : s.id}
                </div>
                <span className={`text-[13px] font-bold text-center ${step >= s.id ? 'text-primary' : 'text-gray-400'}`}>
                  {s.label}
                </span>
                
                {idx !== 0 && step >= s.id && (
                  <div className="absolute top-5 right-1/2 w-full h-[2px] bg-primary -z-10 transition-all duration-500"></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Form Area */}
          <div className="flex-1 bg-white rounded-[2rem] shadow-[0_10px_40px_rgba(0,51,102,0.04)] border border-gray-100 p-8 md:p-10 w-full relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/50 rounded-full blur-3xl -z-10 -translate-y-1/2 translate-x-1/4"></div>
            
            <h2 className="text-[17px] font-bold text-primary mb-8 border-b border-gray-100 pb-4">
              {steps[step - 1].label}
            </h2>
            
            <div className="flex flex-col gap-10 min-h-[350px]">
              
              {/* STEP 1: Data Instansi */}
              {step === 1 && (
                <div className="flex flex-col md:flex-row gap-10 animate-fade-in">
                  <div className="flex-1 flex flex-col gap-6">
                    <div className="flex flex-col gap-2">
                      <label className="text-[13px] font-bold text-gray-800 ml-1">Jenis Instansi <span className="text-red-500">*</span></label>
                      <div className="relative group">
                        <select name="jenis_instansi" value={formData.jenis_instansi} onChange={handleInputChange} className="w-full bg-white text-gray-800 text-sm rounded-xl px-4 py-3.5 outline-none transition-all border border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 appearance-none shadow-sm cursor-pointer">
                          <option value="">Pilih jenis instansi</option>
                          <option value="Sekolah">Sekolah / Universitas</option>
                          <option value="Pemerintah">Instansi Pemerintah</option>
                          <option value="Swasta">Perusahaan Swasta</option>
                          <option value="Komunitas">Komunitas / Masyarakat</option>
                        </select>
                        <i className="fa-solid fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-xs group-focus-within:text-primary transition-colors"></i>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-[13px] font-bold text-gray-800 ml-1">Nama Instansi <span className="text-red-500">*</span></label>
                      <input type="text" name="nama_instansi" value={formData.nama_instansi} onChange={handleInputChange} placeholder="Masukkan nama instansi" className="w-full bg-white text-gray-800 text-sm rounded-xl px-4 py-3.5 outline-none transition-all border border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 shadow-sm placeholder:text-gray-400" />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-[13px] font-bold text-gray-800 ml-1">Alamat Instansi <span className="text-red-500">*</span></label>
                      <textarea name="alamat_instansi" value={formData.alamat_instansi} onChange={handleInputChange} placeholder="Masukkan alamat lengkap" rows={5} className="w-full bg-white text-gray-800 text-sm rounded-xl px-4 py-3.5 outline-none transition-all border border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 resize-none shadow-sm placeholder:text-gray-400"></textarea>
                    </div>
                  </div>
                  <div className="flex-1 flex flex-col gap-6">
                    <h3 className="text-[15px] font-bold text-primary mb-1 border-b border-gray-100 pb-3">Penanggung Jawab</h3>
                    <div className="flex flex-col gap-2">
                      <label className="text-[13px] font-bold text-gray-800 ml-1">Nama Penanggung Jawab <span className="text-red-500">*</span></label>
                      <input type="text" name="nama_pic" value={formData.nama_pic} onChange={handleInputChange} placeholder="Masukkan nama lengkap" className="w-full bg-white text-gray-800 text-sm rounded-xl px-4 py-3.5 outline-none transition-all border border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 shadow-sm placeholder:text-gray-400" />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-[13px] font-bold text-gray-800 ml-1">Jabatan <span className="text-red-500">*</span></label>
                      <input type="text" name="jabatan_pic" value={formData.jabatan_pic} onChange={handleInputChange} placeholder="Masukkan jabatan" className="w-full bg-white text-gray-800 text-sm rounded-xl px-4 py-3.5 outline-none transition-all border border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 shadow-sm placeholder:text-gray-400" />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-[13px] font-bold text-gray-800 ml-1">Email <span className="text-red-500">*</span></label>
                      <input type="email" name="email_pic" value={formData.email_pic} onChange={handleInputChange} placeholder="Masukkan email" className="w-full bg-white text-gray-800 text-sm rounded-xl px-4 py-3.5 outline-none transition-all border border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 shadow-sm placeholder:text-gray-400" />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-[13px] font-bold text-gray-800 ml-1">No. Telepon / WhatsApp <span className="text-red-500">*</span></label>
                      <div className="flex shadow-sm rounded-xl focus-within:ring-4 focus-within:ring-primary/10 transition-all">
                        <div className="bg-gray-50 border border-gray-200 border-r-0 rounded-l-xl px-4 py-3.5 text-sm font-bold text-gray-700 flex items-center justify-center shrink-0">+62</div>
                        <input type="tel" name="no_telp_pic" value={formData.no_telp_pic} onChange={handleInputChange} placeholder="Masukkan nomor telepon" className="w-full bg-white text-gray-800 text-sm rounded-r-xl px-4 py-3.5 outline-none transition-all border border-gray-200 border-l-0 focus:border-primary placeholder:text-gray-400" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: Tema & Kegiatan */}
              {step === 2 && (
                <div className="flex flex-col md:flex-row gap-10 animate-fade-in">
                  <div className="flex-1 flex flex-col gap-6">
                    <div className="flex flex-col gap-2">
                      <label className="text-[13px] font-bold text-gray-800 ml-1">Tema Kegiatan <span className="text-red-500">*</span></label>
                      <input type="text" name="tema_kegiatan" value={formData.tema_kegiatan} onChange={handleInputChange} placeholder="Contoh: Sosialisasi QRIS dan CBP Rupiah" className="w-full bg-white text-gray-800 text-sm rounded-xl px-4 py-3.5 outline-none transition-all border border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 shadow-sm placeholder:text-gray-400" />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-[13px] font-bold text-gray-800 ml-1">Jumlah Peserta <span className="text-red-500">*</span></label>
                      <input type="number" name="jumlah_peserta" value={formData.jumlah_peserta} onChange={handleInputChange} placeholder="Perkiraan jumlah peserta" min="1" className="w-full bg-white text-gray-800 text-sm rounded-xl px-4 py-3.5 outline-none transition-all border border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 shadow-sm placeholder:text-gray-400" />
                    </div>
                  </div>
                  <div className="flex-1 flex flex-col gap-6">
                    <div className="flex flex-col gap-2">
                      <label className="text-[13px] font-bold text-gray-800 ml-1">Deskripsi Kegiatan <span className="text-red-500">*</span></label>
                      <textarea name="deskripsi_kegiatan" value={formData.deskripsi_kegiatan} onChange={handleInputChange} placeholder="Jelaskan secara singkat tujuan dan rincian kegiatan..." rows={5} className="w-full bg-white text-gray-800 text-sm rounded-xl px-4 py-3.5 outline-none transition-all border border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 resize-none shadow-sm placeholder:text-gray-400"></textarea>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: Waktu & Lokasi */}
              {step === 3 && (
                <div className="flex flex-col md:flex-row gap-10 animate-fade-in">
                  <div className="flex-1 flex flex-col gap-6">
                    <div className="flex flex-col gap-2">
                      <label className="text-[13px] font-bold text-gray-800 ml-1">Tanggal Kegiatan <span className="text-red-500">*</span></label>
                      <input type="date" name="tanggal_kegiatan" value={formData.tanggal_kegiatan} onChange={handleInputChange} className="w-full bg-white text-gray-800 text-sm rounded-xl px-4 py-3.5 outline-none transition-all border border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 shadow-sm" />
                    </div>
                    <div className="flex gap-4">
                      <div className="flex-1 flex flex-col gap-2">
                        <label className="text-[13px] font-bold text-gray-800 ml-1">Waktu Mulai <span className="text-red-500">*</span></label>
                        <input type="time" name="waktu_mulai" value={formData.waktu_mulai} onChange={handleInputChange} className="w-full bg-white text-gray-800 text-sm rounded-xl px-4 py-3.5 outline-none transition-all border border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 shadow-sm" />
                      </div>
                      <div className="flex-1 flex flex-col gap-2">
                        <label className="text-[13px] font-bold text-gray-800 ml-1">Waktu Selesai <span className="text-red-500">*</span></label>
                        <input type="time" name="waktu_selesai" value={formData.waktu_selesai} onChange={handleInputChange} className="w-full bg-white text-gray-800 text-sm rounded-xl px-4 py-3.5 outline-none transition-all border border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 shadow-sm" />
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 flex flex-col gap-6">
                    <div className="flex flex-col gap-2">
                      <label className="text-[13px] font-bold text-gray-800 ml-1">Lokasi Kegiatan <span className="text-red-500">*</span></label>
                      <textarea name="lokasi_kegiatan" value={formData.lokasi_kegiatan} onChange={handleInputChange} placeholder="Nama gedung, ruangan, alamat lengkap..." rows={5} className="w-full bg-white text-gray-800 text-sm rounded-xl px-4 py-3.5 outline-none transition-all border border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 resize-none shadow-sm placeholder:text-gray-400"></textarea>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: Unggah Dokumen */}
              {step === 4 && (
                <div className="flex flex-col gap-6 animate-fade-in max-w-2xl mx-auto w-full">
                  <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 flex gap-3 text-sm text-gray-700">
                    <i className="fa-solid fa-circle-info text-primary mt-0.5"></i>
                    <p>Silakan unggah dokumen proposal kegiatan atau surat permohonan resmi dari instansi Anda. Pastikan format file adalah <strong>PDF</strong> dan ukuran maksimal <strong>5MB</strong>.</p>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <label className="text-[13px] font-bold text-gray-800 ml-1">Dokumen Proposal (PDF) <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <input 
                        type="file" 
                        accept="application/pdf"
                        onChange={handleFileChange}
                        className="w-full bg-white text-gray-800 text-sm rounded-xl file:mr-4 file:py-3.5 file:px-6 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-gray-50 file:text-primary hover:file:bg-gray-100 outline-none transition-all border border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 shadow-sm cursor-pointer file:cursor-pointer" 
                      />
                    </div>
                    {formData.dokumen_proposal && (
                      <p className="text-xs text-green-600 mt-2 font-medium flex items-center gap-1">
                        <i className="fa-solid fa-check-circle"></i> File terpilih: {formData.dokumen_proposal.name}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* STEP 5: Konfirmasi */}
              {step === 5 && (
                <div className="flex flex-col gap-8 animate-fade-in">
                  <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 flex gap-3 text-sm text-gray-700">
                    <i className="fa-solid fa-circle-check text-primary mt-0.5"></i>
                    <p>Pastikan semua data yang Anda masukkan sudah benar sebelum mengirim pengajuan.</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50/50 border border-gray-100 rounded-2xl p-6">
                      <h3 className="font-bold text-gray-800 mb-5 flex items-center gap-2">
                        <i className="fa-solid fa-building text-primary"></i> Data Instansi & PIC
                      </h3>
                      <div className="flex flex-col gap-4">
                        <div>
                          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Nama Instansi</p>
                          <p className="text-[13px] font-medium text-gray-800">{formData.nama_instansi} <span className="text-gray-500 font-normal">({formData.jenis_instansi})</span></p>
                        </div>
                        <div>
                          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Alamat Lengkap</p>
                          <p className="text-[13px] font-medium text-gray-800 leading-relaxed">{formData.alamat_instansi}</p>
                        </div>
                        <div className="pt-4 border-t border-gray-200/60 mt-1">
                          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Penanggung Jawab (PIC)</p>
                          <p className="text-[13px] font-medium text-gray-800">{formData.nama_pic} <span className="text-gray-500 font-normal">({formData.jabatan_pic})</span></p>
                        </div>
                        <div>
                          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Kontak PIC</p>
                          <p className="text-[13px] font-medium text-gray-800">+62{formData.no_telp_pic} <span className="text-gray-300 mx-1">|</span> {formData.email_pic}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50/50 border border-gray-100 rounded-2xl p-6">
                      <h3 className="font-bold text-gray-800 mb-5 flex items-center gap-2">
                        <i className="fa-solid fa-calendar-check text-primary"></i> Detail Kegiatan
                      </h3>
                      <div className="flex flex-col gap-4">
                        <div>
                          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Tema Kegiatan</p>
                          <p className="text-[13px] font-medium text-gray-800">{formData.tema_kegiatan}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Tanggal</p>
                            <p className="text-[13px] font-medium text-gray-800">{formData.tanggal_kegiatan}</p>
                          </div>
                          <div>
                            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Waktu</p>
                            <p className="text-[13px] font-medium text-gray-800">{formData.waktu_mulai} - {formData.waktu_selesai}</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Lokasi & Peserta</p>
                          <p className="text-[13px] font-medium text-gray-800">{formData.lokasi_kegiatan} <span className="text-gray-400">({formData.jumlah_peserta} Orang)</span></p>
                        </div>
                        <div className="pt-4 border-t border-gray-200/60 mt-1">
                          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Dokumen Proposal</p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <i className="fa-solid fa-file-pdf text-red-500 text-lg"></i>
                            <p className="text-[13px] font-medium text-gray-800 line-clamp-1">{formData.dokumen_proposal?.name || '-'}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Navigation Buttons */}
            <div className="mt-12 flex items-center justify-center md:justify-end gap-4 border-t border-gray-100 pt-8">
              {step > 1 && (
                <button type="button" onClick={prevStep} className="px-10 py-3.5 rounded-xl border border-gray-200 text-gray-700 font-bold hover:bg-gray-50 hover:border-gray-300 transition-all text-sm w-full md:w-auto">
                  Kembali
                </button>
              )}
              
              {step < 5 ? (
                <button type="button" onClick={nextStep} className="px-10 py-3.5 rounded-xl bg-primary text-white font-bold shadow-lg hover:shadow-xl hover:bg-blue-900 transition-all flex items-center justify-center gap-2 text-sm hover:-translate-y-0.5 w-full md:w-auto">
                  Selanjutnya <i className="fa-solid fa-arrow-right"></i>
                </button>
              ) : (
                <button type="button" onClick={handleSubmit} disabled={isSubmitting} className="px-10 py-3.5 rounded-xl bg-green-600 text-white font-bold shadow-lg hover:shadow-xl hover:bg-green-700 transition-all flex items-center justify-center gap-2 text-sm hover:-translate-y-0.5 w-full md:w-auto disabled:opacity-70 disabled:cursor-not-allowed">
                  {isSubmitting ? <i className="fa-solid fa-circle-notch animate-spin"></i> : <i className="fa-solid fa-paper-plane"></i>}
                  Kirim Pengajuan
                </button>
              )}
            </div>
          </div>

          {/* Sidebar Area */}
          <div className="w-full lg:w-[320px] xl:w-[340px] flex flex-col gap-5 shrink-0">
            {/* Card 1: Tentang */}
            <div className="bg-white rounded-3xl shadow-[0_5px_20px_rgba(0,51,102,0.03)] border border-gray-100 p-7">
              <h3 className="text-primary font-bold text-[16px] mb-3">Tentang Pengajuan Kegiatan</h3>
              <p className="text-gray-500 text-[13px] leading-relaxed">
                Form ini digunakan untuk mengajukan kegiatan edukasi Bank Indonesia secara online. Pastikan data yang Anda isi sudah benar.
              </p>
            </div>

            {/* Card 2: Persyaratan */}
            <div className="bg-white rounded-3xl shadow-[0_5px_20px_rgba(0,51,102,0.03)] border border-gray-100 p-7">
              <div className="flex items-center gap-4 mb-5 pb-4 border-b border-gray-50">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-primary flex items-center justify-center text-xl shrink-0">
                  <i className="fa-solid fa-clipboard-list"></i>
                </div>
                <div>
                  <h3 className="text-primary font-bold text-[16px]">Persyaratan</h3>
                </div>
              </div>
              <ul className="flex flex-col gap-3.5">
                <li className="flex items-center gap-3 text-[13px] font-medium text-gray-600">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] shrink-0 ${step >= 4 ? 'bg-green-100 text-green-600' : 'bg-primary/10 text-primary'}`}>
                    <i className="fa-solid fa-check"></i>
                  </div>
                  Proposal kegiatan (PDF)
                </li>
                <li className="flex items-center gap-3 text-[13px] font-medium text-gray-600">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] shrink-0 ${step >= 1 ? 'bg-green-100 text-green-600' : 'bg-primary/10 text-primary'}`}>
                    <i className="fa-solid fa-check"></i>
                  </div>
                  Data instansi & PIC
                </li>
                <li className="flex items-center gap-3 text-[13px] font-medium text-gray-600">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] shrink-0 ${step >= 3 ? 'bg-green-100 text-green-600' : 'bg-primary/10 text-primary'}`}>
                    <i className="fa-solid fa-check"></i>
                  </div>
                  Jadwal & Lokasi
                </li>
              </ul>
            </div>

            {/* Card 3: Estimasi Proses */}
            <div className="bg-white rounded-3xl shadow-[0_5px_20px_rgba(0,51,102,0.03)] border border-gray-100 p-7">
              <div className="flex items-center gap-4 mb-5 pb-4 border-b border-gray-50">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-primary flex items-center justify-center text-xl shrink-0">
                  <i className="fa-regular fa-clock"></i>
                </div>
                <div>
                  <h3 className="text-primary font-bold text-[16px]">Estimasi Proses</h3>
                </div>
              </div>
              <div className="flex flex-col gap-6 relative ml-3 pl-4 border-l-2 border-gray-100">
                <div className="relative">
                  <div className="absolute -left-[21.5px] top-1 w-3 h-3 rounded-full bg-primary ring-4 ring-white"></div>
                  <div className="flex justify-between items-center text-[13px]">
                    <span className="font-bold text-gray-800">1 Hari</span>
                    <span className="text-gray-500 font-medium">Verifikasi</span>
                  </div>
                </div>
                <div className="relative">
                  <div className="absolute -left-[21.5px] top-1 w-3 h-3 rounded-full bg-primary ring-4 ring-white"></div>
                  <div className="flex justify-between items-center text-[13px]">
                    <span className="font-bold text-gray-800">2 Hari</span>
                    <span className="text-gray-500 font-medium">Penjadwalan</span>
                  </div>
                </div>
                <div className="relative">
                  <div className="absolute -left-[21.5px] top-1 w-3 h-3 rounded-full bg-primary ring-4 ring-white"></div>
                  <div className="flex justify-between items-center text-[13px]">
                    <span className="font-bold text-gray-800">Konfirmasi</span>
                    <span className="text-gray-500 font-medium">Kegiatan</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 4: Butuh Bantuan */}
            <div className="bg-white rounded-3xl shadow-[0_5px_20px_rgba(0,51,102,0.03)] border border-gray-100 p-7 flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-full bg-blue-50 text-primary flex items-center justify-center text-2xl mb-4 shadow-inner">
                <i className="fa-solid fa-headset"></i>
              </div>
              <h3 className="text-primary font-bold text-[16px] mb-2">Butuh Bantuan?</h3>
              <p className="text-gray-500 text-[13px] mb-6 leading-relaxed">
                Hubungi kami untuk informasi lebih lanjut terkait pengajuan kegiatan edukasi.
              </p>
              <button type="button" className="w-full py-3 rounded-xl border border-gray-200 text-gray-700 font-bold hover:bg-gray-50 hover:border-gray-300 transition-colors text-[13px] flex items-center justify-center gap-2 shadow-sm">
                <i className="fa-regular fa-comment-dots text-primary"></i> Hubungi Kami
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
