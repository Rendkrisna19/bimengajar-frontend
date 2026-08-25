'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Image from 'next/image';
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
    <div className="min-h-screen flex flex-col bg-slate-50 text-gray-800 font-sans">
      <Navbar />

      {/* HERO HEADER SECTION WITH /images/header.jpg */}
      <section className="bg-primary text-white pt-32 pb-20 md:pt-40 md:pb-24 relative overflow-hidden border-b-4 border-[#fbbf24]">
        {/* Background Image /images/header.jpg with 20% Opacity */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <img
            src="/images/header.jpg"
            alt="Header Background"
            className="w-full h-full object-cover object-center opacity-20 mix-blend-overlay"
          />
        </div>

        <div className="max-w-[1200px] mx-auto px-4 md:px-8 relative z-10 text-center">
          <div className="flex items-center justify-center gap-2 text-sm text-blue-200 mb-5 font-medium">
            <Link href="/" className="hover:text-white transition-colors">Beranda</Link>
            <span className="text-[10px]">&gt;</span>
            <Link href="/edukasi" className="hover:text-white transition-colors">Edukasi</Link>
            <span className="text-[10px]">&gt;</span>
            <span className="text-white font-semibold">Pre &amp; Post Test</span>
          </div>
          
          <h1 className="text-3xl md:text-5xl font-extrabold mb-4 tracking-tight drop-shadow-md">
            Pre &amp; Post Test BI Mengajar
          </h1>
          <p className="text-blue-100/95 max-w-2xl mx-auto text-base md:text-lg leading-relaxed font-medium drop-shadow-sm">
            Uji dan ukur pemahaman Anda mengenai materi Kebanksentralan, Cinta Bangga Paham Rupiah, serta sistem pembayaran digital Bank Indonesia.
          </p>
        </div>
      </section>

      <main className="flex-grow py-12 md:py-16 relative overflow-hidden">
        {/* Background Element 1.png */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <Image
            src="/images/element/1.png"
            alt="Background Element"
            fill
            className="object-cover opacity-60 mix-blend-overlay"
            priority
          />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 lg:px-8">
          
          {/* LIST OF TESTS (Visible when no test is actively selected) */}
          {!selectedTest && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {loading ? (
                <div className="col-span-full py-16 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primary mx-auto"></div>
                </div>
              ) : tests.map((test) => (
                <div
                  key={test.id}
                  className="bg-white/95 backdrop-blur-md rounded-3xl p-8 border border-gray-200 shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col justify-between group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full pointer-events-none"></div>

                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <div className="w-14 h-14 rounded-2xl bg-primary text-white flex items-center justify-center text-2xl shadow-md group-hover:scale-110 transition-transform">
                        <i className={test.tipe === 'pre-test' ? 'fa-solid fa-clipboard-question' : 'fa-solid fa-square-check'}></i>
                      </div>
                      <span className={`text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider ${
                        test.tipe === 'pre-test' ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {test.tipe}
                      </span>
                    </div>

                    <h2 className="text-xl font-extrabold text-gray-900 mb-3">{test.judul}</h2>
                    <p className="text-xs md:text-sm text-gray-600 leading-relaxed mb-6">
                      {test.deskripsi || 'Silakan ikuti tes ini untuk mengukur pemahaman materi.'}
                    </p>

                    <div className="flex items-center gap-4 text-xs font-semibold text-gray-500 mb-8 bg-gray-50 p-3 rounded-xl border border-gray-100">
                      <span><i className="fa-solid fa-layer-group text-primary mr-1"></i> {test.slides?.length || 0} Slide Multi-Step</span>
                      <span>•</span>
                      <span><i className="fa-solid fa-clock text-amber-500 mr-1"></i> Estimasi 5-10 Menit</span>
                    </div>
                  </div>

                  <button
                    onClick={() => startTest(test)}
                    className="w-full py-4 px-6 bg-primary hover:bg-blue-900 text-white font-extrabold text-sm rounded-2xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 border-b-4 border-yellow-500 active:border-b-0 active:translate-y-0.5 cursor-pointer"
                  >
                    <span>Mulai Tes Sekarang</span>
                    <i className="fa-solid fa-arrow-right text-xs text-yellow-400"></i>
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* ACTIVE QUIZ RUNNER */}
          {selectedTest && !result && (
            <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-gray-200 shadow-2xl overflow-hidden max-w-3xl mx-auto">
              
              {/* TOP HEADER BAR */}
              <div className="bg-primary p-6 text-white relative">
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={() => setSelectedTest(null)}
                    className="text-xs font-bold text-blue-200 hover:text-white flex items-center gap-1.5 cursor-pointer"
                  >
                    <i className="fa-solid fa-arrow-left"></i> Batal & Kembali
                  </button>

                  <span className="text-xs font-extrabold px-3 py-1 bg-white/20 rounded-full uppercase tracking-wider">
                    {selectedTest.tipe}
                  </span>
                </div>

                <h2 className="text-xl md:text-2xl font-extrabold mb-1">{selectedTest.judul}</h2>
                <p className="text-xs text-blue-100 opacity-90">{selectedTest.deskripsi}</p>

                {/* Progress Bar */}
                {step > 0 && (
                  <div className="mt-5">
                    <div className="flex justify-between text-[11px] font-bold text-blue-200 mb-1.5">
                      <span>Slide {step} dari {totalSlides}</span>
                      <span>{Math.round((step / totalSlides) * 100)}% Selesai</span>
                    </div>
                    <div className="w-full h-2 bg-blue-950/50 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-accent-yellow transition-all duration-500 rounded-full"
                        style={{ width: `${(step / totalSlides) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>

              {/* SLIDE CONTENT AREA */}
              <div className="p-6 md:p-10">

                {/* STEP 0: FORM PESERTA */}
                {step === 0 && (
                  <form onSubmit={handleStartQuestions} className="space-y-6">
                    <div className="bg-blue-50/70 border border-blue-100 p-5 rounded-2xl">
                      <h3 className="font-bold text-primary text-base mb-1 flex items-center gap-2">
                        <i className="fa-solid fa-user-pen"></i> Biodata Peserta & Tanggal Kegiatan
                      </h3>
                      <p className="text-xs text-gray-600">
                        Isikan nama, asal instansi, dan Tanggal BI Mengajar sebelum memulai tes.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-gray-700 mb-1.5">
                          Nama Lengkap Peserta <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={nama}
                          onChange={e => setNama(e.target.value)}
                          placeholder="Contoh: Ahmad Faisal"
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1.5">
                          Tanggal BI Mengajar <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          required
                          value={tanggalBiMengajar}
                          onChange={e => setTanggalBiMengajar(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 font-semibold"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1.5">
                          Asal Instansi / Sekolah / Universitas
                        </label>
                        <input
                          type="text"
                          value={instansi}
                          onChange={e => setInstansi(e.target.value)}
                          placeholder="Contoh: SMA Negeri 1 Pematangsiantar"
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-gray-700 mb-1.5">
                          Email (Opsional)
                        </label>
                        <input
                          type="email"
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          placeholder="alamat.email@gmail.com"
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-4 bg-primary text-white font-extrabold text-sm rounded-xl hover:bg-blue-900 shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all border-b-4 border-yellow-500 active:border-b-0 active:translate-y-0.5"
                    >
                      <span>Mulai Lembar Soal (Slide 1)</span>
                      <i className="fa-solid fa-arrow-right text-yellow-400"></i>
                    </button>
                  </form>
                )}

                {/* STEP 1+: SLIDES OF QUESTIONS */}
                {step > 0 && step <= totalSlides && (
                  <div className="space-y-8">
                    {/* Slide Title */}
                    <div className="border-b border-gray-100 pb-4">
                      <h3 className="text-lg font-bold text-gray-900">
                        {selectedTest.slides[step - 1]?.judul_slide || `Slide ${step}`}
                      </h3>
                      {selectedTest.slides[step - 1]?.deskripsi_slide && (
                        <p className="text-xs text-gray-500 mt-1">
                          {selectedTest.slides[step - 1]?.deskripsi_slide}
                        </p>
                      )}
                    </div>

                    {/* Question List in Active Slide */}
                    <div className="space-y-8">
                      {selectedTest.slides[step - 1]?.soal?.map((q, qIdx) => (
                        <div key={q.id || qIdx} className="bg-slate-50/80 p-6 rounded-2xl border border-gray-200/80 shadow-xs space-y-4">
                          <div className="flex justify-between items-start gap-4">
                            <h4 className="font-bold text-gray-900 text-sm md:text-base leading-relaxed">
                              <span className="text-primary mr-1.5">{qIdx + 1}.</span> {q.pertanyaan}
                            </h4>
                            <span className="shrink-0 text-[11px] font-extrabold bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full">
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
                                      ? 'bg-primary/10 border-primary text-primary font-bold shadow-xs'
                                      : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-100'
                                  }`}
                                >
                                  <span>{opt}</span>
                                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                                    isSelected ? 'border-primary bg-primary text-white' : 'border-gray-300'
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
                    <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                      <button
                        type="button"
                        onClick={() => setStep(prev => prev - 1)}
                        className="px-5 py-3 rounded-xl border border-gray-300 text-gray-700 font-bold text-xs hover:bg-gray-100 cursor-pointer flex items-center gap-2"
                      >
                        <i className="fa-solid fa-arrow-left"></i> Kembali
                      </button>

                      {step < totalSlides ? (
                        <button
                          type="button"
                          onClick={() => setStep(prev => prev + 1)}
                          className="px-6 py-3 rounded-xl bg-primary text-white font-extrabold text-xs hover:bg-blue-900 cursor-pointer flex items-center gap-2 shadow-md border-b-4 border-yellow-500 active:border-b-0 active:translate-y-0.5"
                        >
                          <span>Lanjut ke Slide {step + 1}</span>
                          <i className="fa-solid fa-arrow-right text-yellow-400"></i>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={handleSubmitQuiz}
                          disabled={submitting}
                          className="px-8 py-3.5 rounded-xl bg-emerald-600 text-white font-extrabold text-xs hover:bg-emerald-700 cursor-pointer flex items-center gap-2 shadow-lg border-b-4 border-emerald-800 active:border-b-0 active:translate-y-0.5 disabled:opacity-50"
                        >
                          {submitting ? (
                            <>
                              <i className="fa-solid fa-spinner animate-spin"></i>
                              <span>Mengirim & Menghitung Skor...</span>
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
            <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-gray-200 shadow-2xl overflow-hidden max-w-3xl mx-auto space-y-8 p-8 md:p-10">
              
              {/* Score Header */}
              <div className="text-center space-y-4">
                <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-4xl mx-auto shadow-inner">
                  <i className="fa-solid fa-trophy"></i>
                </div>

                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Hasil Evaluasi Tes</span>
                  <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mt-1">Selamat, {result.nama_peserta}!</h2>
                  {result.tanggal_bi_mengajar && (
                    <p className="text-xs font-semibold text-primary mt-1">
                      <i className="fa-regular fa-calendar-check mr-1"></i> Tanggal BI Mengajar: {new Date(result.tanggal_bi_mengajar).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  )}
                  <p className="text-xs text-gray-600 mt-1">
                    Anda telah berhasil menyelesaikan {selectedTest?.judul}.
                  </p>
                </div>

                {/* Live Score Display Card */}
                <div className="bg-gradient-to-br from-primary to-blue-900 text-white p-6 rounded-2xl max-w-sm mx-auto shadow-lg space-y-2">
                  <span className="text-xs font-bold text-blue-200 block uppercase tracking-wider">SKOR PEROLEHAN ANDA</span>
                  <div className="text-5xl font-black tracking-tight text-accent-yellow">
                    {result.skor_total} <span className="text-xl font-medium text-white">/ {result.skor_maksimal}</span>
                  </div>
                  <div className="pt-2">
                    <span className="inline-block px-4 py-1.5 rounded-full bg-white/20 text-xs font-extrabold uppercase tracking-wide">
                      {result.kategori_hasil} ({result.persentase}%)
                    </span>
                  </div>
                </div>
              </div>

              {/* PEMBAHASAN PERTANYAAN & KUNCI JAWABAN */}
              <div className="space-y-4 pt-6 border-t border-gray-100">
                <h3 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
                  <i className="fa-solid fa-list-check text-primary"></i>
                  <span>Pembahasan Pertanyaan & Kunci Jawaban</span>
                </h3>

                <div className="space-y-4">
                  {result.detail_evaluasi?.map((item, idx) => (
                    <div key={idx} className={`p-5 rounded-2xl border text-xs md:text-sm space-y-3 ${
                      item.is_benar ? 'bg-emerald-50/60 border-emerald-200' : 'bg-red-50/60 border-red-200'
                    }`}>
                      <div className="flex justify-between items-start gap-4">
                        <h4 className="font-bold text-gray-900 leading-relaxed">
                          {idx + 1}. {item.pertanyaan}
                        </h4>
                        <span className={`shrink-0 px-3 py-1 rounded-full text-xs font-extrabold ${
                          item.is_benar ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
                        }`}>
                          {item.is_benar ? `+${item.skor_diperoleh} Poin` : '0 Poin'}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-gray-200/60 text-xs">
                        <div className="p-3 bg-white/80 rounded-xl border border-gray-200/50">
                          <span className="text-[11px] text-gray-500 font-semibold block mb-0.5">Jawaban Anda:</span>
                          <span className={`font-bold ${item.is_benar ? 'text-emerald-700' : 'text-red-600'}`}>
                            {item.jawaban_peserta}
                          </span>
                        </div>

                        <div className="p-3 bg-white/80 rounded-xl border border-gray-200/50">
                          <span className="text-[11px] text-gray-500 font-semibold block mb-0.5">Kunci Jawaban Benar:</span>
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
              <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => setSelectedTest(null)}
                  className="px-6 py-3.5 bg-primary text-white font-extrabold text-xs rounded-xl hover:bg-blue-900 shadow-md cursor-pointer transition-all border-b-4 border-yellow-500 active:border-b-0 active:translate-y-0.5"
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
