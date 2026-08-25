'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import API_URL from '@/lib/api';

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
  created_at?: string;
}

interface Submission {
  id: number;
  test_id: number;
  nama_peserta: string;
  instansi: string;
  email: string;
  tanggal_bi_mengajar?: string;
  skor_total: number;
  skor_maksimal: number;
  detail_jawaban: any[];
  waktu_selesai: string;
  created_at: string;
  test?: PrePostTest;
}

export default function AdminPrePostTestPage() {
  const [activeTab, setActiveTab] = useState<'tests' | 'submissions'>('tests');
  const [tests, setTests] = useState<PrePostTest[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [summary, setSummary] = useState<{
    total_peserta: number;
    rata_rata_skor: number;
    total_lulus: number;
    persentase_lulus: number;
    top_5?: Submission[];
  }>({ total_peserta: 0, rata_rata_skor: 0, total_lulus: 0, persentase_lulus: 0, top_5: [] });
  
  const [loading, setLoading] = useState(true);

  // Modal States
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [editingTest, setEditingTest] = useState<PrePostTest | null>(null);
  const [savingTest, setSavingTest] = useState(false);

  // Form State for Test Builder
  const [testForm, setTestForm] = useState<{
    judul: string;
    tipe: 'pre-test' | 'post-test';
    deskripsi: string;
    is_active: boolean;
    slides: Slide[];
  }>({
    judul: '',
    tipe: 'pre-test',
    deskripsi: '',
    is_active: true,
    slides: [
      {
        id: 'slide-1',
        judul_slide: 'Slide 1: Pengenalan & Soal Dasar',
        deskripsi_slide: 'Materi dasar dan tugas utama Bank Indonesia',
        soal: [
          {
            id: 'q-1',
            pertanyaan: 'Apa tujuan utama Bank Indonesia?',
            skor: 25,
            pilihan: [
              'A. Mencapai dan memelihara kestabilan nilai Rupiah',
              'B. Menghimpun dana deposito berjangka',
              'C. Menyalurkan kredit KPR ritel',
              'D. Mengumpulkan pajak penghasilan'
            ],
            kunci_jawaban: 'A. Mencapai dan memelihara kestabilan nilai Rupiah'
          }
        ]
      }
    ]
  });

  const [activeSlideIndex, setActiveSlideIndex] = useState(0);

  // Submission Filters
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [searchSubmission, setSearchSubmission] = useState('');
  const [filterTestId, setFilterTestId] = useState<string>('');
  const [filterTanggal, setFilterTanggal] = useState<string>('');

  useEffect(() => {
    fetchTests();
    fetchSubmissions();
  }, []);

  const fetchTests = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/admin/pre-post-test`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (res.data && res.data.status === 'success') {
        setTests(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch tests', err);
    } fontally {
      setLoading(false);
    }
  };

  const fetchSubmissions = async () => {
    try {
      const token = localStorage.getItem('token');
      const params: any = {};
      if (filterTanggal) params.tanggal = filterTanggal;
      if (filterTestId) params.test_id = filterTestId;

      const res = await axios.get(`${API_URL}/admin/pre-post-test/submissions`, {
        params,
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (res.data && res.data.status === 'success') {
        setSubmissions(res.data.data || []);
        if (res.data.summary) setSummary(res.data.summary);
      }
    } catch (err) {
      console.error('Failed to fetch submissions', err);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, [filterTanggal, filterTestId]);

  const openCreateTest = () => {
    setEditingTest(null);
    setTestForm({
      judul: '',
      tipe: 'pre-test',
      deskripsi: '',
      is_active: true,
      slides: [
        {
          id: `slide-${Date.now()}`,
          judul_slide: 'Slide 1: Pengenalan & Soal Dasar',
          deskripsi_slide: '',
          soal: [
            {
              id: `q-${Date.now()}-1`,
              pertanyaan: '',
              skor: 25,
              pilihan: [
                'A. Pilihan Jawaban A',
                'B. Pilihan Jawaban B',
                'C. Pilihan Jawaban C',
                'D. Pilihan Jawaban D'
              ],
              kunci_jawaban: 'A. Pilihan Jawaban A'
            }
          ]
        }
      ]
    });
    setActiveSlideIndex(0);
    setIsTestModalOpen(true);
  };

  const openEditTest = (test: PrePostTest) => {
    setEditingTest(test);
    // Deep clone slides & soal to avoid reference sharing bugs
    const clonedSlides = Array.isArray(test.slides) && test.slides.length > 0
      ? test.slides.map(s => ({
          ...s,
          soal: Array.isArray(s.soal)
            ? s.soal.map(q => ({ ...q, pilihan: [...(q.pilihan || [])] }))
            : []
        }))
      : [
          {
            id: `slide-${Date.now()}`,
            judul_slide: 'Slide 1: Pengenalan',
            soal: []
          }
        ];

    setTestForm({
      judul: test.judul,
      tipe: test.tipe,
      deskripsi: test.deskripsi || '',
      is_active: test.is_active,
      slides: clonedSlides
    });
    setActiveSlideIndex(0);
    setIsTestModalOpen(true);
  };

  const handleSaveTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testForm.judul.trim()) {
      Swal.fire('Peringatan', 'Judul tes tidak boleh kosong!', 'warning');
      return;
    }

    setSavingTest(true);
    const token = localStorage.getItem('token');

    try {
      if (editingTest) {
        await axios.put(`${API_URL}/admin/pre-post-test/${editingTest.id}`, testForm, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        Swal.fire('Berhasil!', 'Tes berhasil diperbarui.', 'success');
      } else {
        await axios.post(`${API_URL}/admin/pre-post-test`, testForm, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        Swal.fire('Berhasil!', 'Tes baru berhasil dibuat.', 'success');
      }
      setIsTestModalOpen(false);
      fetchTests();
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'Gagal menyimpan data tes.', 'error');
    } finally {
      setSavingTest(false);
    }
  };

  const handleDeleteTest = async (id: number) => {
    const res = await Swal.fire({
      title: 'Hapus Tes Ini?',
      text: 'Seluruh slide dan soal di dalam tes ini akan dihapus.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal'
    });

    if (res.isConfirmed) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`${API_URL}/admin/pre-post-test/${id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        Swal.fire('Terhapus!', 'Tes telah dihapus.', 'success');
        fetchTests();
      } catch (err) {
        Swal.fire('Error', 'Gagal menghapus tes.', 'error');
      }
    }
  };

  const handleToggleTestActive = async (test: PrePostTest) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/admin/pre-post-test/${test.id}`, {
        is_active: !test.is_active
      }, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      fetchTests();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteSubmission = async (id: number) => {
    const res = await Swal.fire({
      title: 'Hapus Data Hasil Tes?',
      text: 'Data partisipasi peserta ini akan dihapus dari dashboard.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal'
    });

    if (res.isConfirmed) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`${API_URL}/admin/pre-post-test/submissions/${id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        Swal.fire('Terhapus!', 'Data hasil tes berhasil dihapus.', 'success');
        fetchSubmissions();
      } catch (err) {
        Swal.fire('Error', 'Gagal menghapus data.', 'error');
      }
    }
  };

  // Slide Manipulation Helpers
  const addSlide = () => {
    const newSlideId = `slide-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const newSlide: Slide = {
      id: newSlideId,
      judul_slide: `Slide ${testForm.slides.length + 1}: Judul Slide Baru`,
      deskripsi_slide: '',
      soal: [
        {
          id: `q-${Date.now()}-1`,
          pertanyaan: '',
          skor: 25,
          pilihan: ['A. Opsi 1', 'B. Opsi 2', 'C. Opsi 3', 'D. Opsi 4'],
          kunci_jawaban: 'A. Opsi 1'
        }
      ]
    };
    setTestForm(prev => ({
      ...prev,
      slides: [...prev.slides, newSlide]
    }));
    setActiveSlideIndex(testForm.slides.length);
  };

  const removeSlide = (idx: number) => {
    if (testForm.slides.length <= 1) {
      Swal.fire('Peringatan', 'Minimal harus ada 1 slide!', 'warning');
      return;
    }
    setTestForm(prev => {
      const updated = prev.slides.filter((_, i) => i !== idx);
      return { ...prev, slides: updated };
    });
    setActiveSlideIndex(Math.max(0, idx - 1));
  };

  // IMMUTABLE QUESTION MANIPULATION (FIXES THE COPY/SHARED REFERENCE BUG)
  const addQuestionToCurrentSlide = () => {
    const uniqueQId = `q-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    const newQ: Soal = {
      id: uniqueQId,
      pertanyaan: '',
      skor: 25,
      pilihan: ['A. Pilihan Jawaban A', 'B. Pilihan Jawaban B', 'C. Pilihan Jawaban C', 'D. Pilihan Jawaban D'],
      kunci_jawaban: 'A. Pilihan Jawaban A'
    };

    setTestForm(prev => {
      const updatedSlides = prev.slides.map((slide, sIdx) => {
        if (sIdx !== activeSlideIndex) return slide;
        const currentSoal = Array.isArray(slide.soal) ? slide.soal : [];
        return {
          ...slide,
          soal: [...currentSoal.map(q => ({ ...q, pilihan: [...q.pilihan] })), { ...newQ, pilihan: [...newQ.pilihan] }]
        };
      });
      return { ...prev, slides: updatedSlides };
    });
  };

  const removeQuestionFromCurrentSlide = (qIdx: number) => {
    setTestForm(prev => {
      const updatedSlides = prev.slides.map((slide, sIdx) => {
        if (sIdx !== activeSlideIndex) return slide;
        return {
          ...slide,
          soal: slide.soal.filter((_, i) => i !== qIdx)
        };
      });
      return { ...prev, slides: updatedSlides };
    });
  };

  const updateQuestionField = (qIdx: number, field: keyof Soal, value: any) => {
    setTestForm(prev => {
      const updatedSlides = prev.slides.map((slide, sIdx) => {
        if (sIdx !== activeSlideIndex) return slide;
        const updatedSoal = slide.soal.map((q, i) => {
          if (i !== qIdx) return q;
          return { ...q, [field]: value };
        });
        return { ...slide, soal: updatedSoal };
      });
      return { ...prev, slides: updatedSlides };
    });
  };

  const updateQuestionChoice = (qIdx: number, optIdx: number, value: string) => {
    setTestForm(prev => {
      const updatedSlides = prev.slides.map((slide, sIdx) => {
        if (sIdx !== activeSlideIndex) return slide;
        const updatedSoal = slide.soal.map((q, i) => {
          if (i !== qIdx) return q;
          const newPilihan = [...q.pilihan];
          newPilihan[optIdx] = value;
          return { ...q, pilihan: newPilihan };
        });
        return { ...slide, soal: updatedSoal };
      });
      return { ...prev, slides: updatedSlides };
    });
  };

  const filteredSubmissions = submissions.filter(s => {
    const matchSearch = s.nama_peserta.toLowerCase().includes(searchSubmission.toLowerCase()) || 
                        (s.instansi || '').toLowerCase().includes(searchSubmission.toLowerCase());
    return matchSearch;
  });

  // Calculate Top 5 from current submissions if summary.top_5 is not set
  const top5List = summary.top_5 && summary.top_5.length > 0 
    ? summary.top_5 
    : [...submissions].sort((a, b) => {
        const pctA = a.skor_maksimal > 0 ? (a.skor_total / a.skor_maksimal) : 0;
        const pctB = b.skor_maksimal > 0 ? (b.skor_total / b.skor_maksimal) : 0;
        return pctB - pctA;
      }).slice(0, 5);

  return (
    <div className="flex flex-col gap-6">
      {/* Page Title & Main Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2.5">
            <i className="fa-solid fa-square-poll-vertical text-primary dark:text-blue-400"></i>
            <span>Manajemen Pre-Test & Post-Test</span>
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Kelola lembar soal ber-slide dan pantau penampung data skor hasil tes peserta secara real-time.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={openCreateTest}
            className="bg-primary hover:bg-blue-800 text-white font-bold py-2.5 px-5 rounded-xl shadow-md flex items-center gap-2 transition-all cursor-pointer"
          >
            <i className="fa-solid fa-plus"></i> Buat Tes Baru
          </button>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex border-b border-gray-200 dark:border-gray-800 gap-4">
        <button
          onClick={() => setActiveTab('tests')}
          className={`pb-3 px-2 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${
            activeTab === 'tests'
              ? 'border-primary text-primary dark:text-blue-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
          }`}
        >
          <i className="fa-solid fa-list-check"></i>
          <span>Daftar Tes & Builder Slide ({tests.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('submissions')}
          className={`pb-3 px-2 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${
            activeTab === 'submissions'
              ? 'border-primary text-primary dark:text-blue-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
          }`}
        >
          <i className="fa-solid fa-table"></i>
          <span>Dashboard Penampung Data Skor ({submissions.length})</span>
        </button>
      </div>

      {/* TAB 1: DAFTAR TES */}
      {activeTab === 'tests' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {loading ? (
            <div className="col-span-full py-12 flex justify-center">
              <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-b-4 border-primary"></div>
            </div>
          ) : tests.map(test => {
            const totalSlides = Array.isArray(test.slides) ? test.slides.length : 0;
            const totalQuestions = Array.isArray(test.slides) 
              ? test.slides.reduce((acc, s) => acc + (s.soal ? s.soal.length : 0), 0)
              : 0;

            return (
              <div 
                key={test.id}
                className="bg-white dark:bg-[#1e1e1e] rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className={`text-xs font-extrabold px-3 py-1 uppercase rounded-full tracking-wider ${
                      test.tipe === 'pre-test' 
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300' 
                        : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                    }`}>
                      {test.tipe}
                    </span>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-gray-400">Status Aktif</span>
                      <button
                        onClick={() => handleToggleTestActive(test)}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer ${test.is_active ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-700'}`}
                      >
                        <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform ${test.is_active ? 'translate-x-4.5' : 'translate-x-0.5'}`} />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{test.judul}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-6">
                    {test.deskripsi || 'Tidak ada deskripsi.'}
                  </p>

                  <div className="grid grid-cols-2 gap-3 mb-6 bg-gray-50 dark:bg-black/30 p-3 rounded-xl border border-gray-100 dark:border-gray-800">
                    <div className="text-center">
                      <span className="text-[11px] text-gray-400 block font-medium">Jumlah Slide</span>
                      <span className="font-extrabold text-primary dark:text-blue-400 text-sm mt-0.5 block">{totalSlides} Slide</span>
                    </div>
                    <div className="text-center border-l border-gray-200 dark:border-gray-700">
                      <span className="text-[11px] text-gray-400 block font-medium">Total Soal</span>
                      <span className="font-extrabold text-amber-500 text-sm mt-0.5 block">{totalQuestions} Soal</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-100 dark:border-gray-800">
                  <button
                    onClick={() => openEditTest(test)}
                    className="px-4 py-2 bg-primary/10 text-primary dark:text-blue-300 hover:bg-primary hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <i className="fa-solid fa-pen"></i> Edit Soal & Slide
                  </button>
                  <button
                    onClick={() => handleDeleteTest(test.id)}
                    className="px-3 py-2 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    <i className="fa-solid fa-trash"></i>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: PENAMPUNG DATA SKOR HASIL TES */}
      {activeTab === 'submissions' && (
        <div className="flex flex-col gap-6">
          {/* Summary Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-[#1e1e1e] rounded-xl p-5 border border-gray-100 dark:border-gray-800 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500">Total Partisipan</p>
                <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white mt-1">{summary.total_peserta}</h3>
              </div>
              <div className="w-11 h-11 bg-blue-50 text-primary rounded-xl flex items-center justify-center text-lg">
                <i className="fa-solid fa-users"></i>
              </div>
            </div>

            <div className="bg-white dark:bg-[#1e1e1e] rounded-xl p-5 border border-gray-100 dark:border-gray-800 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500">Rata-rata Skor</p>
                <h3 className="text-2xl font-extrabold text-amber-500 mt-1">{summary.rata_rata_skor}</h3>
              </div>
              <div className="w-11 h-11 bg-amber-50 text-amber-500 rounded-xl flex items-center justify-center text-lg">
                <i className="fa-solid fa-chart-line"></i>
              </div>
            </div>

            <div className="bg-white dark:bg-[#1e1e1e] rounded-xl p-5 border border-gray-100 dark:border-gray-800 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500">Total Lulus (&ge; 60%)</p>
                <h3 className="text-2xl font-extrabold text-emerald-600 mt-1">{summary.total_lulus}</h3>
              </div>
              <div className="w-11 h-11 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center text-lg">
                <i className="fa-solid fa-circle-check"></i>
              </div>
            </div>

            <div className="bg-white dark:bg-[#1e1e1e] rounded-xl p-5 border border-gray-100 dark:border-gray-800 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500">Tingkat Kelulusan</p>
                <h3 className="text-2xl font-extrabold text-indigo-600 mt-1">{summary.persentase_lulus}%</h3>
              </div>
              <div className="w-11 h-11 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center text-lg">
                <i className="fa-solid fa-award"></i>
              </div>
            </div>
          </div>

          {/* TOP 5 RANKING LEADERBOARD WIDGET */}
          <div className="bg-gradient-to-br from-slate-900 via-primary to-blue-950 rounded-2xl p-6 text-white shadow-xl border border-blue-900/50">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 border-b border-blue-800/60 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 text-xl shadow-inner">
                  <i className="fa-solid fa-trophy"></i>
                </div>
                <div>
                  <h3 className="text-lg font-extrabold tracking-tight flex items-center gap-2">
                    <span>Top 5 Ranking Nilai Tertinggi</span>
                    <span className="text-[10px] bg-amber-400 text-slate-950 font-black px-2 py-0.5 rounded-full uppercase tracking-wider">Leaderboard</span>
                  </h3>
                  <p className="text-xs text-blue-200/80">Peserta dengan perolehan skor teratas pada pre-test & post-test</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {top5List.map((top, rankIdx) => {
                const percentage = top.skor_maksimal > 0 ? Math.round((top.skor_total / top.skor_maksimal) * 100) : 0;
                const rankBadges = [
                  { title: '#1 Juara Pertama', icon: 'fa-solid fa-crown', badgeColor: 'bg-amber-400 text-slate-950 font-black' },
                  { title: '#2 Runner Up', icon: 'fa-solid fa-medal', badgeColor: 'bg-slate-200 text-slate-900 font-bold' },
                  { title: '#3 Peringkat 3', icon: 'fa-solid fa-award', badgeColor: 'bg-amber-700 text-white font-bold' },
                  { title: `#4 Peringkat 4`, icon: 'fa-solid fa-star', badgeColor: 'bg-blue-400/30 text-blue-200 border border-blue-400/40' },
                  { title: `#5 Peringkat 5`, icon: 'fa-solid fa-star', badgeColor: 'bg-blue-400/30 text-blue-200 border border-blue-400/40' },
                ];
                const badge = rankBadges[rankIdx] || rankBadges[3];

                return (
                  <div key={top.id} className="bg-white/10 backdrop-blur-md border border-white/10 rounded-xl p-4 flex flex-col justify-between hover:bg-white/15 transition-all shadow-xs">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider shadow-xs flex items-center gap-1 ${badge.badgeColor}`}>
                          <i className={`${badge.icon} text-[10px]`}></i> Rank #{rankIdx + 1}
                        </span>
                        <span className="text-[10px] font-semibold text-blue-200/80">
                          {top.tanggal_bi_mengajar 
                            ? new Date(top.tanggal_bi_mengajar).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
                            : ''}
                        </span>
                      </div>

                      <h4 className="font-extrabold text-sm text-white line-clamp-1">{top.nama_peserta}</h4>
                      <p className="text-[11px] text-blue-200/80 line-clamp-1 mb-3">{top.instansi || 'Umum'}</p>

                      <div className="bg-black/30 p-2.5 rounded-lg border border-white/10 text-center mb-3">
                        <span className="text-[10px] text-blue-200 font-medium block">Skor Perolehan</span>
                        <span className="text-lg font-black text-amber-300 block">{top.skor_total} <span className="text-xs text-white opacity-70">/ {top.skor_maksimal}</span></span>
                        <span className="text-[10px] font-extrabold text-emerald-400">{percentage}%</span>
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedSubmission(top)}
                      className="w-full py-1.5 bg-white/15 hover:bg-white/25 text-white rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <i className="fa-solid fa-eye text-[10px]"></i> Lihat Jawaban
                    </button>
                  </div>
                );
              })}

              {top5List.length === 0 && (
                <div className="col-span-full py-8 text-center text-blue-200/60 text-xs font-medium">
                  Belum ada partisipan hasil tes yang tercatat.
                </div>
              )}
            </div>
          </div>

          {/* HISTORY TABLE AREA */}
          <div className="bg-white dark:bg-[#1e1e1e] rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className="flex flex-col md:flex-row gap-3 mb-5 justify-between items-center">
              <div>
                <h3 className="text-base font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                  <i className="fa-solid fa-clock-rotate-left text-primary"></i>
                  <span>Riwayat Seluruh Hasil Tes Peserta (History Table)</span>
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Daftar riwayat pengerjaan pre-test & post-test peserta</p>
              </div>

              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                <input
                  type="text"
                  placeholder="Cari nama peserta atau instansi..."
                  value={searchSubmission}
                  onChange={e => setSearchSubmission(e.target.value)}
                  className="w-full sm:w-56 p-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-xs bg-gray-50 dark:bg-black outline-none focus:ring-2 focus:ring-primary"
                />

                <select
                  value={filterTestId}
                  onChange={e => setFilterTestId(e.target.value)}
                  className="p-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-xs bg-gray-50 dark:bg-black outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Semua Judul Tes</option>
                  {tests.map(t => (
                    <option key={t.id} value={t.id}>{t.judul}</option>
                  ))}
                </select>

                {/* Filter Tanggal BI Mengajar */}
                <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-black px-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded-xl">
                  <span className="text-[11px] font-bold text-gray-500">Filter Tanggal:</span>
                  <input
                    type="date"
                    value={filterTanggal}
                    onChange={e => setFilterTanggal(e.target.value)}
                    className="bg-transparent text-xs outline-none font-semibold text-gray-800 dark:text-gray-200"
                  />
                  {filterTanggal && (
                    <button 
                      onClick={() => setFilterTanggal('')}
                      className="text-red-500 text-xs hover:text-red-700 font-bold ml-1"
                      title="Reset Filter Tanggal"
                    >
                      <i className="fa-solid fa-xmark"></i>
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-xl shadow-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-primary text-white text-xs font-semibold">
                    <th className="p-4">Peserta & Instansi</th>
                    <th className="p-4">Tanggal BI Mengajar</th>
                    <th className="p-4">Judul Tes</th>
                    <th className="p-4 text-center">Skor Total</th>
                    <th className="p-4 text-center">Persentase</th>
                    <th className="p-4 text-center w-28">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-xs">
                  {filteredSubmissions.map(sub => {
                    const percentage = sub.skor_maksimal > 0 ? Math.round((sub.skor_total / sub.skor_maksimal) * 100) : 0;
                    return (
                      <tr key={sub.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="p-4 font-bold text-gray-900 dark:text-gray-100">
                          {sub.nama_peserta}
                          <span className="block text-[11px] font-normal text-gray-500">{sub.instansi || 'Umum'}</span>
                        </td>
                        <td className="p-4 font-bold text-primary dark:text-blue-400">
                          {sub.tanggal_bi_mengajar 
                            ? new Date(sub.tanggal_bi_mengajar).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
                            : (sub.created_at ? new Date(sub.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-')}
                        </td>
                        <td className="p-4 text-gray-700 dark:text-gray-300">
                          {sub.test?.judul || 'Tes Edukasi'}
                        </td>
                        <td className="p-4 text-center font-extrabold text-primary text-sm">
                          {sub.skor_total} / {sub.skor_maksimal}
                        </td>
                        <td className="p-4 text-center">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            percentage >= 80 ? 'bg-emerald-100 text-emerald-700' : (percentage >= 60 ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700')
                          }`}>
                            {percentage}% ({percentage >= 60 ? 'Lulus' : 'Remidial'})
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => setSelectedSubmission(sub)}
                              className="w-7 h-7 rounded-lg bg-blue-50 text-primary hover:bg-primary hover:text-white flex items-center justify-center cursor-pointer"
                              title="Lihat Detail Jawaban"
                            >
                              <i className="fa-solid fa-eye text-xs"></i>
                            </button>
                            <button
                              onClick={() => handleDeleteSubmission(sub.id)}
                              className="w-7 h-7 rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white flex items-center justify-center cursor-pointer"
                              title="Hapus Result"
                            >
                              <i className="fa-solid fa-trash text-xs"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {filteredSubmissions.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-gray-400">
                        Belum ada data riwayat penampung hasil tes peserta untuk filter ini.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* REFINED MODAL: EDIT / CREATE TEST BUILDER */}
      {isTestModalOpen && (
        <div className="fixed inset-y-0 right-0 left-0 lg:left-64 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm p-4 md:p-8 overflow-y-auto">
          <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden border border-gray-100 dark:border-gray-800 flex flex-col my-auto max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="px-6 py-4 bg-primary text-white flex items-center justify-between shrink-0 shadow-md">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                  <i className="fa-solid fa-pen-to-square text-base"></i>
                </div>
                <div>
                  <h3 className="text-base font-bold">
                    {editingTest ? 'Edit Tes & Lembar Soal' : 'Buat Tes Baru'}
                  </h3>
                  <p className="text-[11px] text-blue-100/80">Pengaturan informasi tes dan penyusunan slide pertanyaan</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsTestModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer transition-colors"
              >
                <i className="fa-solid fa-times text-sm"></i>
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSaveTest} className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* Informational Header Box */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 dark:bg-black/30 p-5 rounded-2xl border border-gray-200/80 dark:border-gray-800">
                <div className="md:col-span-2 space-y-1">
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                    Judul Tes <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={testForm.judul}
                    onChange={e => setTestForm(f => ({ ...f, judul: e.target.value }))}
                    placeholder="Contoh: Pre-Test Literasi Kebanksentralan"
                    className="w-full px-3.5 py-2.5 border border-gray-300 dark:border-gray-700 rounded-xl text-xs bg-white dark:bg-black outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                    Tipe Tes <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={testForm.tipe}
                    onChange={e => setTestForm(f => ({ ...f, tipe: e.target.value as any }))}
                    className="w-full px-3.5 py-2.5 border border-gray-300 dark:border-gray-700 rounded-xl text-xs bg-white dark:bg-black outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 font-medium"
                  >
                    <option value="pre-test">Pre-Test</option>
                    <option value="post-test">Post-Test</option>
                  </select>
                </div>

                <div className="md:col-span-3 space-y-1">
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">Deskripsi Singkat</label>
                  <input
                    type="text"
                    value={testForm.deskripsi}
                    onChange={e => setTestForm(f => ({ ...f, deskripsi: e.target.value }))}
                    placeholder="Contoh: Petunjuk pengerjaan tes evaluasi pemahaman..."
                    className="w-full px-3.5 py-2.5 border border-gray-300 dark:border-gray-700 rounded-xl text-xs bg-white dark:bg-black outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              {/* SLIDE NAVIGATION AREA */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <i className="fa-solid fa-layer-group text-primary dark:text-blue-400"></i>
                    <h4 className="text-sm font-bold text-gray-800 dark:text-white">
                      Kelola Slide Multi-Step
                    </h4>
                  </div>

                  <button
                    type="button"
                    onClick={addSlide}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <i className="fa-solid fa-plus text-[10px]"></i> Tambah Slide Baru
                  </button>
                </div>

                {/* Slide Tabs Header */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-gray-200 dark:border-gray-800">
                  {testForm.slides.map((slide, sIdx) => (
                    <button
                      key={slide.id || sIdx}
                      type="button"
                      onClick={() => setActiveSlideIndex(sIdx)}
                      className={`px-4 py-2.5 rounded-xl text-xs font-bold shrink-0 transition-all flex items-center gap-2.5 cursor-pointer border ${
                        activeSlideIndex === sIdx
                          ? 'bg-primary text-white border-primary shadow-sm'
                          : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <span>Slide {sIdx + 1} ({slide.soal ? slide.soal.length : 0} Soal)</span>
                      {testForm.slides.length > 1 && (
                        <i 
                          onClick={(e) => { e.stopPropagation(); removeSlide(sIdx); }}
                          className="fa-solid fa-xmark text-xs opacity-60 hover:opacity-100 hover:text-red-300 transition-opacity"
                          title="Hapus Slide Ini"
                        ></i>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* ACTIVE SLIDE EDITOR CONTAINER */}
              {testForm.slides[activeSlideIndex] && (
                <div className="bg-blue-50/40 dark:bg-blue-950/20 p-5 rounded-2xl border border-blue-100 dark:border-blue-900/40 space-y-6">
                  
                  {/* Slide Meta Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                        Judul Slide {activeSlideIndex + 1}
                      </label>
                      <input
                        type="text"
                        value={testForm.slides[activeSlideIndex].judul_slide}
                        onChange={e => {
                          const val = e.target.value;
                          setTestForm(prev => {
                            const updated = [...prev.slides];
                            updated[activeSlideIndex] = { ...updated[activeSlideIndex], judul_slide: val };
                            return { ...prev, slides: updated };
                          });
                        }}
                        className="w-full px-3.5 py-2.5 border border-gray-300 dark:border-gray-700 rounded-xl text-xs bg-white dark:bg-black font-semibold outline-none focus:border-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                        Deskripsi Slide (Opsional)
                      </label>
                      <input
                        type="text"
                        value={testForm.slides[activeSlideIndex].deskripsi_slide || ''}
                        onChange={e => {
                          const val = e.target.value;
                          setTestForm(prev => {
                            const updated = [...prev.slides];
                            updated[activeSlideIndex] = { ...updated[activeSlideIndex], deskripsi_slide: val };
                            return { ...prev, slides: updated };
                          });
                        }}
                        placeholder="Petunjuk khusus untuk slide ini..."
                        className="w-full px-3.5 py-2.5 border border-gray-300 dark:border-gray-700 rounded-xl text-xs bg-white dark:bg-black outline-none focus:border-primary"
                      />
                    </div>
                  </div>

                  {/* QUESTION LIST FOR CURRENT SLIDE */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-primary dark:text-blue-400 uppercase tracking-wider">
                        Daftar Soal Pada Slide {activeSlideIndex + 1}
                      </span>
                      <button
                        type="button"
                        onClick={addQuestionToCurrentSlide}
                        className="px-3.5 py-1.5 bg-primary hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <i className="fa-solid fa-plus text-[10px]"></i> Tambah Soal Baru
                      </button>
                    </div>

                    {testForm.slides[activeSlideIndex].soal?.map((q, qIdx) => (
                      <div 
                        key={q.id || `q-key-${qIdx}`} 
                        className="bg-white dark:bg-[#121212] p-5 rounded-2xl border border-gray-200 dark:border-gray-800 space-y-4 shadow-xs"
                      >
                        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
                          <span className="text-xs font-extrabold text-primary flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[11px]">
                              {qIdx + 1}
                            </span>
                            <span>Soal #{qIdx + 1}</span>
                          </span>

                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-gray-500">Skor/Poin:</span>
                              <input
                                type="number"
                                value={q.skor}
                                onChange={e => updateQuestionField(qIdx, 'skor', Number(e.target.value))}
                                className="w-16 px-2.5 py-1 border border-gray-300 dark:border-gray-700 rounded-lg text-xs text-center font-extrabold text-amber-600 bg-amber-50/50 outline-none"
                              />
                            </div>

                            <button
                              type="button"
                              onClick={() => removeQuestionFromCurrentSlide(qIdx)}
                              className="w-7 h-7 rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                              title="Hapus Soal Ini"
                            >
                              <i className="fa-solid fa-trash text-xs"></i>
                            </button>
                          </div>
                        </div>

                        {/* Teks Pertanyaan */}
                        <div>
                          <label className="block text-[11px] font-bold text-gray-500 mb-1">Teks Pertanyaan Soal</label>
                          <textarea
                            rows={2}
                            value={q.pertanyaan}
                            onChange={e => updateQuestionField(qIdx, 'pertanyaan', e.target.value)}
                            className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-xl text-xs bg-gray-50 dark:bg-black font-medium outline-none focus:border-primary focus:bg-white transition-all"
                            placeholder="Tuliskan pertanyaan di sini..."
                          ></textarea>
                        </div>

                        {/* Pilihan Jawaban A, B, C, D */}
                        <div>
                          <label className="block text-[11px] font-bold text-gray-500 mb-2">Pilihan Jawaban (A, B, C, D)</label>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                            {q.pilihan.map((opt, optIdx) => (
                              <div key={optIdx} className="flex items-center gap-2">
                                <span className="text-xs font-bold text-gray-400 w-5 text-center">{String.fromCharCode(65 + optIdx)}:</span>
                                <input
                                  type="text"
                                  value={opt}
                                  onChange={e => updateQuestionChoice(qIdx, optIdx, e.target.value)}
                                  className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-xl text-xs bg-white dark:bg-black outline-none focus:border-primary"
                                />
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Kunci Jawaban Dropdown Selector */}
                        <div className="bg-emerald-50/80 dark:bg-emerald-950/40 p-3 rounded-xl border border-emerald-200 dark:border-emerald-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <span className="text-xs font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                            <i className="fa-solid fa-key text-emerald-600"></i> Kunci Jawaban yang Benar:
                          </span>
                          <select
                            value={q.kunci_jawaban}
                            onChange={e => updateQuestionField(qIdx, 'kunci_jawaban', e.target.value)}
                            className="p-2 border border-emerald-300 rounded-xl text-xs font-bold bg-white text-emerald-900 outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                          >
                            {q.pilihan.map((opt, i) => (
                              <option key={i} value={opt}>{opt}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Modal Footer Buttons */}
              <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsTestModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-bold text-xs hover:bg-gray-100 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={savingTest}
                  className="px-6 py-2.5 rounded-xl bg-primary hover:bg-blue-900 text-white font-extrabold text-xs shadow-md cursor-pointer flex items-center gap-2 border-b-4 border-yellow-500 active:border-b-0 active:translate-y-0.5 disabled:opacity-50"
                >
                  {savingTest ? <i className="fa-solid fa-spinner animate-spin"></i> : <i className="fa-solid fa-check"></i>}
                  <span>Simpan Data Tes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SUBMISSION DETAIL MODAL */}
      {selectedSubmission && (
        <div className="fixed inset-y-0 right-0 left-0 lg:left-64 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 md:p-8 overflow-y-auto">
          <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-100 dark:border-gray-800 my-auto">
            <div className="px-6 py-4 bg-primary text-white flex items-center justify-between">
              <h3 className="text-base font-bold flex items-center gap-2">
                <i className="fa-solid fa-clipboard-check"></i>
                <span>Detail Jawaban Peserta: {selectedSubmission.nama_peserta}</span>
              </h3>
              <button
                onClick={() => setSelectedSubmission(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer"
              >
                <i className="fa-solid fa-times"></i>
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs sm:text-sm">
              <div className="grid grid-cols-2 gap-3 bg-gray-50 dark:bg-black/40 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                <div>
                  <span className="text-[11px] text-gray-400 block font-medium">Nama Peserta</span>
                  <span className="font-bold text-gray-800 dark:text-gray-200 mt-0.5 block">{selectedSubmission.nama_peserta}</span>
                </div>
                <div>
                  <span className="text-[11px] text-gray-400 block font-medium">Tanggal BI Mengajar</span>
                  <span className="font-extrabold text-primary dark:text-blue-400 mt-0.5 block">
                    {selectedSubmission.tanggal_bi_mengajar 
                      ? new Date(selectedSubmission.tanggal_bi_mengajar).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
                      : (selectedSubmission.created_at ? new Date(selectedSubmission.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-')}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-gray-400 block font-medium">Instansi</span>
                  <span className="font-bold text-gray-800 dark:text-gray-200 mt-0.5 block">{selectedSubmission.instansi || 'Umum'}</span>
                </div>
                <div>
                  <span className="text-[11px] text-gray-400 block font-medium">Skor Perolehan</span>
                  <span className="font-extrabold text-primary text-base mt-0.5 block">
                    {selectedSubmission.skor_total} / {selectedSubmission.skor_maksimal}
                  </span>
                </div>
              </div>

              {/* Rincian Jawaban Soal */}
              <div className="space-y-3">
                <h4 className="font-bold text-gray-800 dark:text-white text-xs uppercase tracking-wider">
                  Evaluasi Pertanyaan & Kunci Jawaban
                </h4>

                {Array.isArray(selectedSubmission.detail_jawaban) && selectedSubmission.detail_jawaban.map((detail, idx) => (
                  <div key={idx} className={`p-3.5 rounded-xl border text-xs space-y-2 ${
                    detail.is_benar 
                      ? 'bg-emerald-50/50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-900/40' 
                      : 'bg-red-50/50 border-red-200 dark:bg-red-950/20 dark:border-red-900/40'
                  }`}>
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-gray-900 dark:text-white">Soal #{idx + 1}: {detail.pertanyaan}</span>
                      <span className={`px-2 py-0.5 rounded font-extrabold text-[10px] ${detail.is_benar ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
                        {detail.is_benar ? `+${detail.skor_diperoleh} Poin` : '0 Poin'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-gray-200/50">
                      <div>
                        <span className="text-[10px] text-gray-500 block">Jawaban Peserta:</span>
                        <span className={`font-semibold ${detail.is_benar ? 'text-emerald-700' : 'text-red-700'}`}>
                          {detail.jawaban_peserta}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-500 block">Kunci Jawaban Benar:</span>
                        <span className="font-semibold text-emerald-800">
                          {detail.kunci_jawaban}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 dark:bg-black/20 border-t border-gray-100 dark:border-gray-800 flex justify-end">
              <button
                onClick={() => setSelectedSubmission(null)}
                className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
