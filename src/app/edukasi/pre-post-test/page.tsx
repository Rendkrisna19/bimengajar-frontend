'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PageHeader from '@/components/ui/PageHeader';
import CustomSelect from '@/components/ui/CustomSelect';
import Link from 'next/link';

interface Soal {
  id: string;
  pertanyaan: string;
  skor: number;
  pilihan: string[];
  kunci_jawaban: string;
}

interface Slide {
  id: string;
  judul_slide: string;
  deskripsi_slide?: string;
  soal: Soal[];
}

interface PrePostTest {
  id: number;
  judul: string;
  tipe: 'pre-test' | 'post-test';
  deskripsi?: string;
  slides: Slide[];
  is_active: boolean;
}

interface ResultData {
  submission_id: number;
  nama_peserta: string;
  tanggal_bi_mengajar?: string;
  skor_total: number;
  skor_maksimal: number;
  persentase: number;
  kategori_hasil: string;
  detail_evaluasi: any[];
}

export default function PrePostTestPage() {
  const [tests, setTests] = useState<PrePostTest[]>([]);
  const [loading, setLoading] = useState(true);

  // Quiz Runner States
  const [selectedTest, setSelectedTest] = useState<PrePostTest | null>(null);
  const [step, setStep] = useState<number>(0); // 0: Form Peserta, 1+: Slide 1, 2+: Slide 2...
  
  // Participant Form
  const [nama, setNama] = useState('');
  const [instansi, setInstansi] = useState('');
  const [email, setEmail] = useState('');
  const [tanggalBiMengajar, setTanggalBiMengajar] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  // Answers State: key = question_id, value = selected option string
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<ResultData | null>(null);

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/pre-post-test`, { cache: 'no-store' });
      const data = await res.json();
      if (data.status === 'success') {
        setTests(data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch pre/post tests:', err);
    } finally {
      setLoading(false);
    }
  };

  const startTest = (test: PrePostTest) => {
    setSelectedTest(test);
    setStep(0);
    setResult(null);
    setUserAnswers({});
  };

  const handleSelectAnswer = (questionId: string, optionText: string) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: optionText
    }));
  };

  const handleStartQuestions = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim()) {
      alert('Silakan isi nama Anda terlebih dahulu!');
      return;
    }
    if (!tanggalBiMengajar) {
      alert('Silakan pilih Tanggal BI Mengajar!');
      return;
    }
    setStep(1); // Move to Slide 1
  };

  const handleSubmitQuiz = async () => {
    if (!selectedTest) return;

    setSubmitting(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/pre-post-test/${selectedTest.id}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          nama_peserta: nama,
          instansi: instansi || 'Umum',
          email: email || '',
          tanggal_bi_mengajar: tanggalBiMengajar,
          jawaban_user: userAnswers
        })
      });

      const data = await res.json();
      if (res.ok && data.status === 'success') {
        setResult(data.data);
      } else {
        alert(data.message || 'Gagal mengirim jawaban.');
      }
    } catch (err) {
      console.error('Failed to submit quiz:', err);
      alert('Gagal mengirim jawaban tes. Silakan periksa koneksi Anda.');
    } finally {
      setSubmitting(false);
    }
  };

  const totalSlides = selectedTest ? (selectedTest.slides ? selectedTest.slides.length : 0) : 0;

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] text-slate-800 font-sans">
      <Navbar />

      {/* Clean Modern Page Header */}
      <PageHeader
        title={
          <>
            Pre &amp; Post Test <span className="text-yellow-300">BI Mengajar</span>
          </>
        }
        description="Uji dan ukur pemahaman Anda mengenai materi Kebanksentralan, Cinta Bangga Paham Rupiah, serta sistem pembayaran digital Bank Indonesia."
        breadcrumbs={[
          { label: 'Beranda', href: '/' },
          { label: 'Edukasi', href: '/edukasi' },
          { label: 'Pre & Post Test' }
        ]}
      />

      <main className="flex-grow py-10 md:py-16 relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          {/* LIST OF TESTS - Centered Layout */}
          {!selectedTest && (
            <div className="w-full">
              {loading ? (
                <div className="py-20 text-center flex flex-col items-center justify-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-3 border-sky-600 border-t-transparent"></div>
                  <p className="text-xs font-semibold text-slate-500 mt-3">Memuat modul tes...</p>
                </div>
              ) : tests.length === 0 ? (
                <div className="bg-white rounded-3xl p-10 text-center max-w-md mx-auto border border-slate-200/80 shadow-md">
                  <div className="w-16 h-16 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center text-3xl mx-auto mb-4">
                    <i className="fa-solid fa-clipboard-check"></i>
                  </div>
                  <h3 className="text-lg font-bold text-slate-800">Belum Ada Tes Tersedia</h3>
                  <p className="text-xs text-slate-500 mt-1">Saat ini modul Pre-Test & Post-Test belum dipublikasikan oleh edukator.</p>
                </div>
              ) : (
                /* Dynamic Centered Grid Layout */
                <div className={`grid gap-6 md:gap-8 justify-center ${
                  tests.length === 1 
                    ? 'max-w-xl mx-auto grid-cols-1' 
                    : 'grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto'
                }`}>
                  {tests.map((test) => (
                    <div
                      key={test.id}
                      className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col justify-between group relative overflow-hidden w-full"
                    >
                      {/* Subtle Header Accent */}
                      <div className="flex items-start justify-between gap-4 mb-6">
                        <div className="w-14 h-14 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center text-2xl border border-sky-100 group-hover:scale-105 group-hover:bg-sky-600 group-hover:text-white transition-all shadow-xs shrink-0">
                          <i className={test.tipe === 'pre-test' ? 'fa-solid fa-clipboard-question' : 'fa-solid fa-square-check'}></i>
                        </div>

                        <span className={`text-[11px] font-extrabold px-3.5 py-1 rounded-full uppercase tracking-wider border shadow-2xs ${
                          test.tipe === 'pre-test' 
                            ? 'bg-sky-50 text-sky-700 border-sky-200' 
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}>
                          {test.tipe}
                        </span>
                      </div>

                      <div className="flex-1">
                        <h2 className="text-xl font-extrabold text-slate-900 mb-2 leading-snug">{test.judul}</h2>
                        <p className="text-xs md:text-sm text-slate-600 leading-relaxed mb-6">
                          {test.deskripsi || 'Silakan ikuti tes ini untuk mengukur pemahaman materi kebanksentralan.'}
                        </p>

                        <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-500 mb-8 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                          <span className="flex items-center gap-1.5">
                            <i className="fa-solid fa-layer-group text-sky-600"></i>
                            {test.slides?.length || 0} Slide Multi-Step
                          </span>
                          <span className="text-slate-300">•</span>
                          <span className="flex items-center gap-1.5">
                            <i className="fa-solid fa-clock text-amber-500"></i>
                            Estimasi 5-10 Menit
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => startTest(test)}
                        className="w-full py-4 px-6 bg-primary hover:bg-sky-700 text-white font-extrabold text-sm rounded-2xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 border-b-4 border-yellow-500 active:border-b-0 active:translate-y-0.5 cursor-pointer"
                      >
                        <span>Mulai Tes Sekarang</span>
                        <i className="fa-solid fa-arrow-right text-xs text-yellow-300"></i>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ACTIVE QUIZ RUNNER */}
          {selectedTest && !result && (
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl overflow-hidden max-w-3xl mx-auto">
              
              {/* TOP HEADER BAR */}
              <div className="bg-gradient-to-r from-sky-900 via-primary to-blue-900 p-6 text-white relative">
                <div className="flex items-center justify-between mb-3">
                  <button
                    onClick={() => setSelectedTest(null)}
                    className="text-xs font-bold text-sky-200 hover:text-white flex items-center gap-1.5 cursor-pointer transition-colors bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-xs"
                  >
                    <i className="fa-solid fa-arrow-left"></i> Kembali
                  </button>

                  <span className="text-[11px] font-extrabold px-3 py-1 bg-white/20 rounded-full uppercase tracking-wider border border-white/20">
                    {selectedTest.tipe}
                  </span>
                </div>

                <h2 className="text-xl md:text-2xl font-extrabold mb-1 tracking-tight">{selectedTest.judul}</h2>
                <p className="text-xs text-sky-100/90 font-medium">{selectedTest.deskripsi}</p>

                {/* Progress Bar */}
                {step > 0 && (
                  <div className="mt-5">
                    <div className="flex justify-between text-[11px] font-bold text-sky-200 mb-1.5">
                      <span>Slide {step} dari {totalSlides}</span>
                      <span>{Math.round((step / totalSlides) * 100)}% Selesai</span>
                    </div>
                    <div className="w-full h-2 bg-blue-950/60 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-yellow-400 transition-all duration-500 rounded-full"
                        style={{ width: `${(step / totalSlides) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>

              {/* SLIDE CONTENT AREA */}
              <div className="p-5 sm:p-8 md:p-10">

                {/* STEP 0: FORM PESERTA */}
                {step === 0 && (
                  <form onSubmit={handleStartQuestions} className="space-y-6">
                    <div className="bg-sky-50/70 border border-sky-100 p-5 rounded-2xl">
                      <h3 className="font-bold text-sky-800 text-base mb-1 flex items-center gap-2">
                        <i className="fa-solid fa-user-pen text-sky-600"></i> Biodata Peserta &amp; Tanggal Kegiatan
                      </h3>
                      <p className="text-xs text-slate-600">
                        Isikan nama lengkap dan Tanggal BI Mengajar sebelum memulai soal tes.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Nama Lengkap Peserta <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={nama}
                          onChange={e => setNama(e.target.value)}
                          placeholder="Masukkan nama lengkap Anda..."
                          className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Tanggal BI Mengajar <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          required
                          value={tanggalBiMengajar}
                          onChange={e => setTanggalBiMengajar(e.target.value)}
                          className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 font-semibold transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Asal Instansi / Sekolah / Universitas
                        </label>
                        <input
                          type="text"
                          value={instansi}
                          onChange={e => setInstansi(e.target.value)}
                          placeholder="Contoh: SMA / Universitas / Umum"
                          className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Email (Opsional)
                        </label>
                        <input
                          type="email"
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          placeholder="alamat.email@gmail.com"
                          className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-4 bg-primary text-white font-extrabold text-sm rounded-2xl hover:bg-sky-700 shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all border-b-4 border-yellow-500 active:border-b-0 active:translate-y-0.5 mt-4"
                    >
                      <span>Mulai Lembar Soal (Slide 1)</span>
                      <i className="fa-solid fa-arrow-right text-yellow-300"></i>
                    </button>
                  </form>
                )}

                {/* STEP 1+: SLIDES OF QUESTIONS */}
                {step > 0 && step <= totalSlides && (
                  <div className="space-y-8">
                    {/* Slide Title */}
                    <div className="border-b border-slate-100 pb-4">
                      <h3 className="text-lg font-bold text-slate-900">
                        {selectedTest.slides[step - 1]?.judul_slide || `Slide ${step}`}
                      </h3>
                      {selectedTest.slides[step - 1]?.deskripsi_slide && (
                        <p className="text-xs text-slate-500 mt-1">
                          {selectedTest.slides[step - 1]?.deskripsi_slide}
                        </p>
                      )}
                    </div>

                    {/* Question List in Active Slide */}
                    <div className="space-y-6">
                      {selectedTest.slides[step - 1]?.soal?.map((q, qIdx) => (
                        <div key={q.id || qIdx} className="bg-slate-50/70 p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
                          <div className="flex justify-between items-start gap-4">
                            <h4 className="font-bold text-slate-900 text-sm md:text-base leading-relaxed">
                              <span className="text-sky-700 mr-1.5">{qIdx + 1}.</span> {q.pertanyaan}
                            </h4>
                            <span className="shrink-0 text-[11px] font-extrabold bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full border border-amber-200">
                              +{q.skor} Poin
                            </span>
                          </div>

                          {/* Options */}
                          <div className="space-y-2.5 pt-2">
                            {q.pilihan.map((opt, optIdx) => {
                              const isSelected = userAnswers[q.id] === opt;
                              return (
                                <button
                                  key={optIdx}
                                  type="button"
                                  onClick={() => handleSelectAnswer(q.id, opt)}
                                  className={`w-full text-left p-4 rounded-xl border text-xs md:text-sm transition-all flex items-center justify-between cursor-pointer ${
                                    isSelected
                                      ? 'bg-sky-50 border-sky-500 text-sky-900 font-bold shadow-xs'
                                      : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-100/50'
                                  }`}
                                >
                                  <span>{opt}</span>
                                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors shrink-0 ${
                                    isSelected ? 'border-sky-600 bg-sky-600 text-white' : 'border-slate-300'
                                  }`}>
                                    {isSelected && <i className="fa-solid fa-check text-[10px]"></i>}
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Navigation Bar */}
                    <div className="flex items-center justify-between pt-6 border-t border-slate-100 gap-3">
                      <button
                        type="button"
                        onClick={() => setStep(prev => prev - 1)}
                        className="px-5 py-3 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 cursor-pointer flex items-center gap-2"
                      >
                        <i className="fa-solid fa-arrow-left"></i> Kembali
                      </button>

                      {step < totalSlides ? (
                        <button
                          type="button"
                          onClick={() => setStep(prev => prev + 1)}
                          className="px-6 py-3 rounded-xl bg-primary text-white font-extrabold text-xs hover:bg-sky-700 cursor-pointer flex items-center gap-2 shadow-md border-b-4 border-yellow-500 active:border-b-0 active:translate-y-0.5"
                        >
                          <span>Lanjut ke Slide {step + 1}</span>
                          <i className="fa-solid fa-arrow-right text-yellow-300"></i>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={handleSubmitQuiz}
                          disabled={submitting}
                          className="px-6 sm:px-8 py-3.5 rounded-xl bg-emerald-600 text-white font-extrabold text-xs hover:bg-emerald-700 cursor-pointer flex items-center gap-2 shadow-lg border-b-4 border-emerald-800 active:border-b-0 active:translate-y-0.5 disabled:opacity-50"
                        >
                          {submitting ? (
                            <>
                              <i className="fa-solid fa-spinner animate-spin"></i>
                              <span>Mengirim &amp; Menghitung...</span>
                            </>
                          ) : (
                            <>
                              <i className="fa-solid fa-paper-plane"></i>
                              <span>Kirim Jawaban Test</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* FINAL RESULT CARD & PEMBAHASAN JAWABAN */}
          {result && (
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl overflow-hidden max-w-3xl mx-auto space-y-8 p-6 sm:p-8 md:p-10">
              
              {/* Score Header */}
              <div className="text-center space-y-4">
                <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center text-4xl mx-auto border border-emerald-100 shadow-inner">
                  <i className="fa-solid fa-trophy"></i>
                </div>

                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Hasil Evaluasi Tes</span>
                  <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mt-1">Selamat, {result.nama_peserta}!</h2>
                  {result.tanggal_bi_mengajar && (
                    <p className="text-xs font-semibold text-sky-700 mt-1">
                      <i className="fa-regular fa-calendar-check mr-1"></i> Tanggal BI Mengajar: {new Date(result.tanggal_bi_mengajar).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  )}
                  <p className="text-xs text-slate-600 mt-1">
                    Anda telah berhasil menyelesaikan {selectedTest?.judul}.
                  </p>
                </div>

                {/* Live Score Display Card */}
                <div className="bg-gradient-to-br from-sky-900 via-primary to-blue-900 text-white p-6 rounded-2xl max-w-sm mx-auto shadow-lg space-y-2">
                  <span className="text-xs font-bold text-sky-200 block uppercase tracking-wider">SKOR PEROLEHAN ANDA</span>
                  <div className="text-5xl font-black tracking-tight text-yellow-300">
                    {result.skor_total} <span className="text-xl font-medium text-white">/ {result.skor_maksimal}</span>
                  </div>
                  <div className="pt-2">
                    <span className="inline-block px-4 py-1.5 rounded-full bg-white/20 text-xs font-extrabold uppercase tracking-wide border border-white/20">
                      {result.kategori_hasil} ({result.persentase}%)
                    </span>
                  </div>
                </div>
              </div>

              {/* PEMBAHASAN PERTANYAAN & KUNCI JAWABAN */}
              <div className="space-y-4 pt-6 border-t border-slate-100">
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <i className="fa-solid fa-list-check text-sky-600"></i>
                  <span>Pembahasan Pertanyaan &amp; Kunci Jawaban</span>
                </h3>

                <div className="space-y-4">
                  {result.detail_evaluasi?.map((item, idx) => (
                    <div key={idx} className={`p-5 rounded-2xl border text-xs md:text-sm space-y-3 ${
                      item.is_benar ? 'bg-emerald-50/60 border-emerald-200' : 'bg-red-50/60 border-red-200'
                    }`}>
                      <div className="flex justify-between items-start gap-4">
                        <h4 className="font-bold text-slate-900 leading-relaxed">
                          {idx + 1}. {item.pertanyaan}
                        </h4>
                        <span className={`shrink-0 px-3 py-1 rounded-full text-xs font-extrabold ${
                          item.is_benar ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
                        }`}>
                          {item.is_benar ? `+${item.skor_diperoleh} Poin` : '0 Poin'}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-slate-200/60 text-xs">
                        <div className="p-3 bg-white/80 rounded-xl border border-slate-200/50">
                          <span className="text-[11px] text-slate-500 font-semibold block mb-0.5">Jawaban Anda:</span>
                          <span className={`font-bold ${item.is_benar ? 'text-emerald-700' : 'text-red-600'}`}>
                            {item.jawaban_peserta}
                          </span>
                        </div>

                        <div className="p-3 bg-white/80 rounded-xl border border-slate-200/50">
                          <span className="text-[11px] text-slate-500 font-semibold block mb-0.5">Kunci Jawaban Benar:</span>
                          <span className="font-bold text-emerald-800">
                            {item.kunci_jawaban}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => setSelectedTest(null)}
                  className="px-6 py-3.5 bg-primary text-white font-extrabold text-xs rounded-xl hover:bg-sky-700 shadow-md cursor-pointer transition-all border-b-4 border-yellow-500 active:border-b-0 active:translate-y-0.5"
                >
                  <i className="fa-solid fa-house mr-2"></i> Kembalikan ke Daftar Tes
                </button>
              </div>
            </div>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
}
