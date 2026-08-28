'use client';

import React, { useState, useEffect } from 'react';
import { INITIAL_QUIZZES, QuizItem, QuizQuestion, generateGamePin, LiveRoomSession, getQuizScoresHistory, clearQuizScoresHistory, QuizHistoryRecord, fetchQuizzesFromApi, fetchScoresFromApi } from '@/lib/quizData';
import { getActiveLiveSession, createLiveSession, startLiveSessionGame, closeLiveSession, syncActiveSessionFromApi } from '@/lib/quizLiveSession';
import Swal from 'sweetalert2';
import CustomSelect from '@/components/ui/CustomSelect';

export default function AdminKuisPage() {
  const [quizzes, setQuizzes] = useState<QuizItem[]>(INITIAL_QUIZZES);
  const [activeTab, setActiveTab] = useState<'quizzes' | 'live-rooms' | 'leaderboard'>('quizzes');
  const [scoresHistory, setScoresHistory] = useState<QuizHistoryRecord[]>([]);
  const [searchHistoryQuery, setSearchHistoryQuery] = useState('');
  
  // Quiz Form Modal State (Create / Edit)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<QuizItem | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<QuizItem['category']>('Kebanksentralan');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState<QuizItem['difficulty']>('Sedang');
  const [mode, setMode] = useState<QuizItem['mode']>('both');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);

  // Question Form State inside Quiz Modal
  const [qText, setQText] = useState('');
  const [qTimeLimit, setQTimeLimit] = useState(15);
  const [qExplanation, setQExplanation] = useState('');
  const [optRed, setOptRed] = useState('');
  const [optBlue, setOptBlue] = useState('');
  const [optYellow, setOptYellow] = useState('');
  const [optGreen, setOptGreen] = useState('');
  const [correctColor, setCorrectColor] = useState<'red' | 'blue' | 'yellow' | 'green'>('blue');

  // Live Room Control State
  const [activeSession, setActiveSession] = useState<LiveRoomSession | null>(null);

  useEffect(() => {
    // Load initial active session from storage & API
    const current = getActiveLiveSession();
    if (current) setActiveSession(current);
    syncActiveSessionFromApi().then(sess => {
      if (sess) setActiveSession(sess);
    });

    // Load quizzes & score history from API / local fallback
    const loadData = async () => {
      const apiQuizzes = await fetchQuizzesFromApi();
      if (apiQuizzes && apiQuizzes.length > 0) setQuizzes(apiQuizzes);
      const apiScores = await fetchScoresFromApi();
      if (apiScores) setScoresHistory(apiScores);
    };
    loadData();

    const handleUpdate = async () => {
      const updated = await syncActiveSessionFromApi();
      setActiveSession(updated);
    };

    window.addEventListener('quiz_session_update', handleUpdate);
    window.addEventListener('quiz_scores_update', loadData);
    window.addEventListener('storage', handleUpdate);
    const interval = setInterval(handleUpdate, 600);

    return () => {
      window.removeEventListener('quiz_session_update', handleUpdate);
      window.removeEventListener('quiz_scores_update', loadData);
      window.removeEventListener('storage', handleUpdate);
      clearInterval(interval);
    };
  }, []);

  const CATEGORY_OPTIONS = [
    { value: 'Kebanksentralan', label: 'Kebanksentralan', icon: 'fa-solid fa-building-columns' },
    { value: 'Cinta Bangga Paham Rupiah', label: 'Cinta Bangga Paham Rupiah', icon: 'fa-solid fa-coins' },
    { value: 'Sistem Pembayaran & QRIS', label: 'Sistem Pembayaran & QRIS', icon: 'fa-solid fa-qrcode' },
    { value: 'Titik Temu Uang Logam', label: 'Titik Temu Uang Logam', icon: 'fa-solid fa-[#0054a7] fa-hand-holding-dollar' }
  ];

  const DIFFICULTY_OPTIONS = [
    { value: 'Mudah', label: 'Mudah (Pemula)' },
    { value: 'Sedang', label: 'Sedang (Menengah)' },
    { value: 'Tantangan', label: 'Tantangan (Lanjutan)' }
  ];

  const handleOpenAddModal = () => {
    setEditingQuiz(null);
    setTitle('');
    setCategory('Kebanksentralan');
    setDescription('');
    setDifficulty('Sedang');
    setMode('both');
    setQuestions([]);
    resetQuestionForm();
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (quiz: QuizItem) => {
    setEditingQuiz(quiz);
    setTitle(quiz.title);
    setCategory(quiz.category);
    setDescription(quiz.description);
    setDifficulty(quiz.difficulty);
    setMode(quiz.mode);
    setQuestions(quiz.questions || []);
    resetQuestionForm();
    setIsModalOpen(true);
  };

  const resetQuestionForm = () => {
    setQText('');
    setQTimeLimit(15);
    setQExplanation('');
    setOptRed('');
    setOptBlue('');
    setOptYellow('');
    setOptGreen('');
    setCorrectColor('blue');
  };

  const handleAddQuestionToQuiz = () => {
    if (!qText.trim()) {
      Swal.fire('Peringatan', 'Silakan isi teks pertanyaan soal!', 'warning');
      return;
    }
    if (!optRed.trim() || !optBlue.trim() || !optYellow.trim() || !optGreen.trim()) {
      Swal.fire('Peringatan', 'Silakan isi ke-4 opsi pilihan jawaban!', 'warning');
      return;
    }

    const newQ: QuizQuestion = {
      id: `q-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      question_text: qText,
      time_limit_seconds: Number(qTimeLimit),
      points: 1000,
      explanation: qExplanation,
      options: [
        { id: `opt-r-${Date.now()}`, text: optRed, is_correct: correctColor === 'red', color: 'red' },
        { id: `opt-b-${Date.now()}`, text: optBlue, is_correct: correctColor === 'blue', color: 'blue' },
        { id: `opt-y-${Date.now()}`, text: optYellow, is_correct: correctColor === 'yellow', color: 'yellow' },
        { id: `opt-g-${Date.now()}`, text: optGreen, is_correct: correctColor === 'green', color: 'green' }
      ]
    };

    setQuestions(prev => [...prev, newQ]);
    resetQuestionForm();
    Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Soal berhasil ditambahkan ke draft!', showConfirmButton: false, timer: 1500 });
  };

  const handleDeleteQuestion = (qId: string) => {
    setQuestions(prev => prev.filter(q => q.id !== qId));
  };

  const handleSaveQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      Swal.fire('Error', 'Judul kuis tidak boleh kosong!', 'error');
      return;
    }
    if (questions.length === 0) {
      Swal.fire('Peringatan', 'Kuis harus memiliki minimal 1 soal pertanyaan!', 'warning');
      return;
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
    const payload = {
      title,
      category,
      description,
      difficulty,
      mode,
      estimated_time_minutes: Math.ceil(questions.reduce((acc, curr) => acc + curr.time_limit_seconds, 0) / 60),
      questions
    };

    try {
      if (editingQuiz) {
        await fetch(`${apiUrl}/quizzes/${editingQuiz.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify(payload)
        });
        Swal.fire('Berhasil!', 'Kuis berhasil diperbarui di database.', 'success');
      } else {
        await fetch(`${apiUrl}/quizzes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify(payload)
        });
        Swal.fire('Berhasil!', 'Kuis baru berhasil dibuat dan disimpan ke database.', 'success');
      }

      const updatedList = await fetchQuizzesFromApi();
      setQuizzes(updatedList);
    } catch (err) {
      console.error('Save quiz error:', err);
      if (editingQuiz) {
        setQuizzes(prev => prev.map(q => q.id === editingQuiz.id ? { ...q, ...payload, total_questions: questions.length, questions } : q));
      } else {
        const newQuiz: QuizItem = {
          id: `quiz-bi-${Date.now()}`,
          ...payload,
          slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          thumbnail: '/images/menu-cepat/1.png',
          total_questions: questions.length,
          play_count: 0,
          is_active: true,
          created_at: new Date().toISOString().split('T')[0]
        };
        setQuizzes(prev => [newQuiz, ...prev]);
      }
      Swal.fire('Berhasil!', 'Kuis disimpan.', 'success');
    }

    setIsModalOpen(false);
  };

  const handleDeleteQuiz = (id: string) => {
    Swal.fire({
      title: 'Hapus Kuis Ini?',
      text: 'Kuis dan seluruh bank soal di dalamnya akan dihapus secara permanen dari database.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Ya, Hapus!'
    }).then(async res => {
      if (res.isConfirmed) {
        try {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
          await fetch(`${apiUrl}/quizzes/${id}`, { method: 'DELETE', headers: { 'Accept': 'application/json' } });
          const updatedList = await fetchQuizzesFromApi();
          setQuizzes(updatedList);
          Swal.fire('Dihapus!', 'Kuis telah dihapus dari database.', 'success');
        } catch (e) {
          setQuizzes(prev => prev.filter(q => q.id !== id));
          Swal.fire('Dihapus!', 'Kuis telah dihapus.', 'success');
        }
      }
    });
  };

  // Launch Live Multiplayer Room
  const handleLaunchLiveRoom = (quiz: QuizItem) => {
    const pin = generateGamePin();
    const session = createLiveSession(quiz, pin, 'Edukator BI');
    setActiveSession(session);
    setActiveTab('live-rooms');
    Swal.fire({
      icon: 'success',
      title: `Live Room Diluncurkan!`,
      html: `<p>Game PIN: <strong style="font-size: 1.5rem; color: #0054a7;">${pin}</strong></p><p style="font-size: 0.85rem;">Bagikan PIN 6-digit ini kepada seluruh peserta kuis!</p>`,
      confirmButtonText: 'Buka Kontrol Host'
    });
  };

  const handleStartGameLive = () => {
    if (!activeSession) return;
    const ok = startLiveSessionGame();
    if (ok) {
      const updated = getActiveLiveSession();
      if (updated) setActiveSession(updated);
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: '🎮 Live Game Dimulai!',
        showConfirmButton: false,
        timer: 1500
      });
    }
  };

  const handleCloseLiveRoom = () => {
    closeLiveSession();
    setActiveSession(null);
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'info',
      title: 'Live Room Berhasil Ditutup!',
      showConfirmButton: false,
      timer: 1500
    });
  };

  const handleClearHistory = () => {
    Swal.fire({
      title: 'Hapus Semua Riwayat Poin?',
      text: 'Seluruh riwayat perolehan poin kuis peserta akan dibersihkan.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Ya, Hapus Semua',
      cancelButtonText: 'Batal'
    }).then((result) => {
      if (result.isConfirmed) {
        clearQuizScoresHistory();
        setScoresHistory([]);
        Swal.fire('Dihapus!', 'Riwayat poin kuis berhasil dibersihkan.', 'success');
      }
    });
  };

  const sortedHistory = [...scoresHistory].sort((a, b) => b.score - a.score);

  const filteredHistory = sortedHistory.filter(item => {
    const q = searchHistoryQuery.toLowerCase();
    return item.nickname.toLowerCase().includes(q) || item.quiz_title.toLowerCase().includes(q);
  });

  return (
    <div className="p-6 md:p-10 space-y-8 font-sans max-w-[1400px] mx-auto">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-sky-50 text-sky-700 text-xs font-bold rounded-full border border-sky-200">
            <i className="fa-solid fa-gamepad"></i> CMS Bank Soal &amp; Live Room BI
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            Kelola Kuis Interaktif BI
          </h1>
          <p className="text-xs md:text-sm text-slate-500">
            Buat, edit kuis kebanksentralan, luncurkan Live Room Multiplayer, dan pantau riwayat poin peserta.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={handleOpenAddModal}
            className="w-full md:w-auto px-6 py-3.5 bg-primary hover:bg-sky-700 text-white font-extrabold text-xs rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 border-b-4 border-yellow-500 active:border-b-0 active:translate-y-0.5 cursor-pointer"
          >
            <i className="fa-solid fa-plus text-yellow-300"></i>
            <span>Buat Kuis Baru</span>
          </button>
        </div>
      </div>

      {/* TABS */}
      <div className="flex bg-slate-200/70 p-1.5 rounded-2xl w-full max-w-2xl border border-slate-300/60 overflow-x-auto">
        <button
          onClick={() => setActiveTab('quizzes')}
          className={`flex-1 py-2.5 px-4 text-xs font-extrabold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'quizzes' ? 'bg-primary text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <i className="fa-solid fa-layer-group mr-2"></i> Daftar Kuis ({quizzes.length})
        </button>
        <button
          onClick={() => setActiveTab('live-rooms')}
          className={`flex-1 py-2.5 px-4 text-xs font-extrabold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'live-rooms' ? 'bg-primary text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <i className="fa-solid fa-tower-broadcast mr-2"></i> Live Room Host Panel
        </button>
        <button
          onClick={() => setActiveTab('leaderboard')}
          className={`flex-1 py-2.5 px-4 text-xs font-extrabold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'leaderboard' ? 'bg-primary text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <i className="fa-solid fa-trophy mr-2"></i> Leaderboard &amp; Riwayat Poin ({scoresHistory.length})
        </button>
      </div>

      {/* TAB 1: QUIZ TABLE / GRID */}
      {activeTab === 'quizzes' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map((quiz) => (
            <div
              key={quiz.id}
              className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-6"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold px-3 py-1 bg-sky-50 text-sky-700 rounded-full border border-sky-200">
                    {quiz.category}
                  </span>
                  <span className="text-xs font-bold text-slate-500">
                    {quiz.total_questions} Soal
                  </span>
                </div>

                <h3 className="text-lg font-extrabold text-slate-900 leading-snug">{quiz.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{quiz.description}</p>
              </div>

              <div className="pt-4 border-t border-slate-100 space-y-3">
                {/* Launch Live Game Button */}
                <button
                  onClick={() => handleLaunchLiveRoom(quiz)}
                  className="w-full py-3 bg-gradient-to-r from-sky-900 to-primary text-white font-extrabold text-xs rounded-xl shadow-sm hover:brightness-110 flex items-center justify-center gap-2 cursor-pointer border-b-2 border-yellow-400"
                >
                  <i className="fa-solid fa-bolt text-yellow-300"></i>
                  <span>Luncurkan Live Room (Game PIN)</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEditModal(quiz)}
                    className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <i className="fa-solid fa-pen-to-square text-sky-600"></i> Edit Soal
                  </button>
                  <button
                    onClick={() => handleDeleteQuiz(quiz.id)}
                    className="p-2.5 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                  >
                    <i className="fa-solid fa-trash"></i>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: LIVE ROOM HOST PANEL */}
      {activeTab === 'live-rooms' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 md:p-8 shadow-sm space-y-6">
          {!activeSession ? (
            <div className="py-16 text-center text-slate-400 space-y-3">
              <i className="fa-solid fa-tower-broadcast text-5xl text-slate-300"></i>
              <h3 className="text-lg font-bold text-slate-700">Belum Ada Live Room yang Aktif</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Pilih kuis di tab "Daftar Kuis" dan klik <strong>"Luncurkan Live Room"</strong> untuk menghasilkan 6-Digit Game PIN.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Host Room Status Bar */}
              <div className="bg-gradient-to-r from-sky-900 via-primary to-blue-900 p-6 rounded-3xl text-white flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-yellow-300 uppercase tracking-widest">Ruangan Live Kuis BI</span>
                  <h2 className="text-2xl font-black">{activeSession.quiz_title}</h2>
                  <span className="text-xs text-sky-200">Host: {activeSession.host_name}</span>
                </div>

                <div className="bg-white/10 p-4 rounded-2xl border border-white/20 text-center">
                  <span className="text-[10px] text-sky-200 uppercase font-bold block">6-DIGIT GAME PIN</span>
                  <span className="text-4xl font-black text-yellow-300 tracking-[0.2em]">{activeSession.pin_code}</span>
                </div>
              </div>

              {/* Joined Participants Lobby */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                    <i className="fa-solid fa-users text-sky-600"></i>
                    <span>Peserta Terhubung ({activeSession.participants.length})</span>
                  </h4>
                  <span className="text-xs text-slate-500">Status: <strong className="text-emerald-600 uppercase">{activeSession.status}</strong></span>
                </div>

                {activeSession.participants.length === 0 ? (
                  <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-300 rounded-2xl text-slate-400 space-y-2">
                    <i className="fa-solid fa-user-clock text-3xl text-sky-500 animate-pulse"></i>
                    <p className="text-xs font-bold text-slate-600">Belum ada peserta yang bergabung ke ruangan ini.</p>
                    <p className="text-[11px] text-slate-400">Bagikan PIN <strong>{activeSession.pin_code}</strong> kepada peserta untuk mulai bergabung.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {activeSession.participants.map((p) => (
                      <div key={p.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-sky-500 text-white flex items-center justify-center text-sm font-bold shadow-xs">
                          <i className="fa-solid fa-user"></i>
                        </div>
                        <div className="min-w-0">
                          <span className="text-xs font-bold text-slate-800 truncate block">{p.nickname}</span>
                          <span className="text-[10px] font-semibold text-amber-600">{p.score} Poin</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-100 flex gap-4">
                <button
                  onClick={handleStartGameLive}
                  disabled={activeSession.status === 'playing'}
                  className={`px-6 py-3 font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer border-b-4 ${
                    activeSession.status === 'playing'
                      ? 'bg-slate-300 border-slate-400 text-slate-500 cursor-not-allowed'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-800'
                  }`}
                >
                  <i className="fa-solid fa-play"></i>
                  <span>{activeSession.status === 'playing' ? 'Game Sedang Berlangsung' : 'Mulai Game Live Sekarang'}</span>
                </button>
                <button
                  onClick={handleCloseLiveRoom}
                  className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Tutup Live Room
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: LEADERBOARD & RIWAYAT POIN */}
      {activeTab === 'leaderboard' && (
        <div className="space-y-6">
          {/* Top 3 Podium Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Top 1 Gold */}
            {sortedHistory[0] ? (
              <div className="bg-gradient-to-br from-amber-400 via-amber-500 to-yellow-600 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden flex flex-col justify-between">
                <div className="absolute right-3 top-3 opacity-20 text-6xl font-black">🥇</div>
                <div>
                  <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-extrabold tracking-wider uppercase">
                    Peringkat #1 - Juara Emas
                  </span>
                  <h3 className="text-xl font-extrabold mt-3">{sortedHistory[0].nickname}</h3>
                  <p className="text-xs text-amber-100 mt-1 line-clamp-1">{sortedHistory[0].quiz_title}</p>
                </div>
                <div className="mt-6 flex items-baseline justify-between border-t border-white/20 pt-3">
                  <span className="text-xs opacity-90">Total Poin</span>
                  <span className="text-2xl font-black">{sortedHistory[0].score.toLocaleString('id-ID')}</span>
                </div>
              </div>
            ) : (
              <div className="bg-slate-100 rounded-3xl p-6 text-slate-400 text-center flex items-center justify-center text-xs font-bold">Belum Ada Data #1</div>
            )}

            {/* Top 2 Silver */}
            {sortedHistory[1] ? (
              <div className="bg-gradient-to-br from-slate-600 via-slate-700 to-slate-800 rounded-3xl p-6 text-white shadow-md relative overflow-hidden flex flex-col justify-between">
                <div className="absolute right-3 top-3 opacity-20 text-6xl font-black">🥈</div>
                <div>
                  <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-extrabold tracking-wider uppercase">
                    Peringkat #2 - Juara Perak
                  </span>
                  <h3 className="text-xl font-extrabold mt-3">{sortedHistory[1].nickname}</h3>
                  <p className="text-xs text-slate-300 mt-1 line-clamp-1">{sortedHistory[1].quiz_title}</p>
                </div>
                <div className="mt-6 flex items-baseline justify-between border-t border-white/20 pt-3">
                  <span className="text-xs opacity-90">Total Poin</span>
                  <span className="text-2xl font-black">{sortedHistory[1].score.toLocaleString('id-ID')}</span>
                </div>
              </div>
            ) : (
              <div className="bg-slate-100 rounded-3xl p-6 text-slate-400 text-center flex items-center justify-center text-xs font-bold">Belum Ada Data #2</div>
            )}

            {/* Top 3 Bronze */}
            {sortedHistory[2] ? (
              <div className="bg-gradient-to-br from-amber-700 via-amber-800 to-yellow-900 rounded-3xl p-6 text-white shadow-md relative overflow-hidden flex flex-col justify-between">
                <div className="absolute right-3 top-3 opacity-20 text-6xl font-black">🥉</div>
                <div>
                  <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-extrabold tracking-wider uppercase">
                    Peringkat #3 - Juara Perunggu
                  </span>
                  <h3 className="text-xl font-extrabold mt-3">{sortedHistory[2].nickname}</h3>
                  <p className="text-xs text-amber-200 mt-1 line-clamp-1">{sortedHistory[2].quiz_title}</p>
                </div>
                <div className="mt-6 flex items-baseline justify-between border-t border-white/20 pt-3">
                  <span className="text-xs opacity-90">Total Poin</span>
                  <span className="text-2xl font-black">{sortedHistory[2].score.toLocaleString('id-ID')}</span>
                </div>
              </div>
            ) : (
              <div className="bg-slate-100 rounded-3xl p-6 text-slate-400 text-center flex items-center justify-center text-xs font-bold">Belum Ada Data #3</div>
            )}
          </div>

          {/* Table Controls */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <i className="fa-solid fa-list-check text-primary"></i> Tabel Riwayat Poin Perolehan Peserta
                </h3>
                <p className="text-xs text-slate-500">Daftar akumulasi poin hasil pengerjaan kuis peserta (Solo &amp; Live Room Multiplayer).</p>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <input
                    type="text"
                    placeholder="Cari peserta / kuis..."
                    value={searchHistoryQuery}
                    onChange={(e) => setSearchHistoryQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-primary transition-colors"
                  />
                  <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
                </div>

                <button
                  onClick={handleClearHistory}
                  className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-bold transition-colors border border-red-200 shrink-0 cursor-pointer"
                >
                  <i className="fa-solid fa-trash-can mr-1.5"></i> Hapus Riwayat
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-200/80">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-100/80 text-slate-800 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3.5 px-4">#</th>
                    <th className="py-3.5 px-4">Nama / Nickname</th>
                    <th className="py-3.5 px-4">Judul Kuis</th>
                    <th className="py-3.5 px-4">Mode</th>
                    <th className="py-3.5 px-4 text-center">Jawaban Benar</th>
                    <th className="py-3.5 px-4 text-right">Poin Perolehan</th>
                    <th className="py-3.5 px-4 text-center">Tanggal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredHistory.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        Tidak ada data riwayat poin yang ditemukan.
                      </td>
                    </tr>
                  ) : (
                    filteredHistory.map((item, idx) => (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-slate-400">{idx + 1}</td>
                        <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center text-xs shadow-xs">
                            <i className={item.avatar || 'fa-solid fa-user'}></i>
                          </div>
                          <span>{item.nickname}</span>
                        </td>
                        <td className="py-3.5 px-4 font-medium text-slate-700">{item.quiz_title}</td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            item.mode === 'multiplayer' 
                              ? 'bg-purple-100 text-purple-700 border border-purple-200' 
                              : 'bg-blue-100 text-blue-700 border border-blue-200'
                          }`}>
                            {item.mode === 'multiplayer' ? 'Live Room' : 'Solo'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center font-bold text-slate-700">
                          {item.correct_answers !== undefined ? `${item.correct_answers} / ${item.total_questions}` : `${item.total_questions} Soal`}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <span className="font-extrabold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/80">
                            ⚡ {item.score.toLocaleString('id-ID')} Poin
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center text-slate-400 font-medium">
                          {item.date}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT QUIZ MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[999999] bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-3xl w-full p-6 md:p-8 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl relative">
            
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-800 cursor-pointer text-lg"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>

            <h3 className="text-xl font-extrabold text-slate-900 border-b border-slate-100 pb-4">
              {editingQuiz ? 'Edit Kuis Interaktif' : 'Buat Kuis Baru'}
            </h3>

            <form onSubmit={handleSaveQuiz} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Judul Kuis <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="Contoh: Kuis Edukasi Cinta Bangga Paham Rupiah"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <CustomSelect
                    label="Kategori Kuis"
                    options={CATEGORY_OPTIONS}
                    value={category}
                    onChange={val => setCategory(val)}
                  />
                </div>

                <div>
                  <CustomSelect
                    label="Tingkat Kesulitan"
                    options={DIFFICULTY_OPTIONS}
                    value={difficulty}
                    onChange={val => setDifficulty(val)}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Deskripsi Singkat</label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Deskripsi singkat kuis..."
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  ></textarea>
                </div>
              </div>

              {/* QUESTION INPUT SECTION */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
                <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                  <i className="fa-solid fa-[#0054a7] fa-circle-plus text-sky-600"></i>
                  <span>Input Pertanyaan Soal Kuis</span>
                </h4>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Teks Pertanyaan Soal</label>
                    <input
                      type="text"
                      value={qText}
                      onChange={e => setQText(e.target.value)}
                      placeholder="Tulis soal pertanyaan di sini..."
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-primary"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Batas Waktu (Detik)</label>
                      <input
                        type="number"
                        min={5}
                        max={120}
                        value={qTimeLimit}
                        onChange={e => setQTimeLimit(Number(e.target.value))}
                        className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Kunci Jawaban Benar</label>
                      <select
                        value={correctColor}
                        onChange={e => setCorrectColor(e.target.value as any)}
                        className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                      >
                        <option value="red">Opsi 1 (Merah)</option>
                        <option value="blue">Opsi 2 (Biru)</option>
                        <option value="yellow">Opsi 3 (Kuning)</option>
                        <option value="green">Opsi 4 (Hijau)</option>
                      </select>
                    </div>
                  </div>

                  {/* 4 COLOR OPTIONS */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1">
                    <input
                      type="text"
                      value={optRed}
                      onChange={e => setOptRed(e.target.value)}
                      placeholder="Opsi Merah (Opsi 1)"
                      className="px-3 py-2 bg-red-50 border border-red-200 rounded-xl text-xs text-red-900 font-semibold"
                    />
                    <input
                      type="text"
                      value={optBlue}
                      onChange={e => setOptBlue(e.target.value)}
                      placeholder="Opsi Biru (Opsi 2)"
                      className="px-3 py-2 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 font-semibold"
                    />
                    <input
                      type="text"
                      value={optYellow}
                      onChange={e => setOptYellow(e.target.value)}
                      placeholder="Opsi Kuning (Opsi 3)"
                      className="px-3 py-2 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 font-semibold"
                    />
                    <input
                      type="text"
                      value={optGreen}
                      onChange={e => setOptGreen(e.target.value)}
                      placeholder="Opsi Hijau (Opsi 4)"
                      className="px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Penjelasan Pembahasan (Opsional)</label>
                    <input
                      type="text"
                      value={qExplanation}
                      onChange={e => setQExplanation(e.target.value)}
                      placeholder="Penjelasan yang muncul setelah soal dijawab..."
                      className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleAddQuestionToQuiz}
                    className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    + Tambahkan Soal Ini ke Daftar
                  </button>
                </div>
              </div>

              {/* DRAFT QUESTIONS LIST */}
              <div className="space-y-2">
                <span className="text-xs font-extrabold text-slate-700 block">Daftar Soal Kuis ({questions.length}):</span>
                {questions.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">Belum ada soal. Silakan tambahkan soal di atas.</p>
                ) : (
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                    {questions.map((q, idx) => (
                      <div key={q.id} className="p-3 bg-white border border-slate-200 rounded-xl text-xs flex justify-between items-center gap-3">
                        <span className="font-semibold text-slate-800 truncate">{idx + 1}. {q.question_text}</span>
                        <button
                          type="button"
                          onClick={() => handleDeleteQuestion(q.id)}
                          className="text-red-500 hover:text-red-700 font-bold px-2 py-1"
                        >
                          <i className="fa-solid fa-trash"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-100 flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-3 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-primary text-white font-extrabold text-xs shadow-md border-b-4 border-yellow-500 active:border-b-0 active:translate-y-0.5"
                >
                  Simpan &amp; Terbitkan Kuis
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
