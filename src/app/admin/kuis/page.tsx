'use client';

import React, { useState, useEffect } from 'react';
import { INITIAL_QUIZZES, QuizItem, QuizQuestion, generateGamePin, LiveRoomSession } from '@/lib/quizData';
import { getActiveLiveSession, createLiveSession, startLiveSessionGame, closeLiveSession } from '@/lib/quizLiveSession';
import Swal from 'sweetalert2';
import CustomSelect from '@/components/ui/CustomSelect';

export default function AdminKuisPage() {
  const [quizzes, setQuizzes] = useState<QuizItem[]>(INITIAL_QUIZZES);
  const [activeTab, setActiveTab] = useState<'quizzes' | 'live-rooms'>('quizzes');
  
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
    // Load initial active session from storage
    const current = getActiveLiveSession();
    if (current) setActiveSession(current);

    const handleUpdate = () => {
      const updated = getActiveLiveSession();
      setActiveSession(updated);
    };

    window.addEventListener('quiz_session_update', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    const interval = setInterval(handleUpdate, 1000);

    return () => {
      window.removeEventListener('quiz_session_update', handleUpdate);
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

  const handleSaveQuiz = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      Swal.fire('Error', 'Judul kuis tidak boleh kosong!', 'error');
      return;
    }
    if (questions.length === 0) {
      Swal.fire('Peringatan', 'Kuis harus memiliki minimal 1 soal pertanyaan!', 'warning');
      return;
    }

    if (editingQuiz) {
      setQuizzes(prev => prev.map(q => q.id === editingQuiz.id ? {
        ...q,
        title,
        category,
        description,
        difficulty,
        mode,
        total_questions: questions.length,
        estimated_time_minutes: Math.ceil(questions.reduce((acc, curr) => acc + curr.time_limit_seconds, 0) / 60),
        questions
      } : q));
      Swal.fire('Berhasil!', 'Kuis berhasil diperbarui.', 'success');
    } else {
      const newQuiz: QuizItem = {
        id: `quiz-bi-${Date.now()}`,
        title,
        slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        category,
        description,
        thumbnail: '/images/menu-cepat/1.png',
        mode,
        difficulty,
        total_questions: questions.length,
        estimated_time_minutes: Math.ceil(questions.reduce((acc, curr) => acc + curr.time_limit_seconds, 0) / 60),
        play_count: 0,
        questions,
        is_active: true,
        created_at: new Date().toISOString().split('T')[0]
      };
      setQuizzes(prev => [newQuiz, ...prev]);
      Swal.fire('Berhasil!', 'Kuis baru berhasil dibuat dan diterbitkan.', 'success');
    }

    setIsModalOpen(false);
  };

  const handleDeleteQuiz = (id: string) => {
    Swal.fire({
      title: 'Hapus Kuis Ini?',
      text: 'Kuis dan seluruh bank soal di dalamnya akan dihapus.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Ya, Hapus!'
    }).then(res => {
      if (res.isConfirmed) {
        setQuizzes(prev => prev.filter(q => q.id !== id));
        Swal.fire('Dihapus!', 'Kuis telah dihapus.', 'success');
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
    startLiveSessionGame(activeSession.pin_code);
    const updated = getActiveLiveSession();
    if (updated) setActiveSession(updated);
    Swal.fire({
      icon: 'success',
      title: 'Live Room Dimulai!',
      text: 'Soal sinkron telah aktif. Seluruh peserta yang bergabung akan masuk ke permainan secara serentak!'
    });
  };

  const handleCloseLiveRoom = () => {
    Swal.fire({
      title: 'Tutup Live Room?',
      text: 'Sesi kuis live akan dihentikan dan seluruh peserta akan keluar dari ruangan.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, Tutup Room',
      confirmButtonColor: '#ef4444'
    }).then(res => {
      if (res.isConfirmed) {
        closeLiveSession();
        setActiveSession(null);
        Swal.fire('Tutup Live Room', 'Live Room berhasil ditutup.', 'info');
      }
    });
  };

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
            Buat, edit kuis kebanksentralan, serta luncurkan Live Room Multiplayer dengan 6-Digit Game PIN.
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
      <div className="flex bg-slate-200/70 p-1.5 rounded-2xl w-full max-w-md border border-slate-300/60">
        <button
          onClick={() => setActiveTab('quizzes')}
          className={`flex-1 py-2.5 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${
            activeTab === 'quizzes' ? 'bg-primary text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <i className="fa-solid fa-layer-group mr-2"></i> Daftar Kuis ({quizzes.length})
        </button>
        <button
          onClick={() => setActiveTab('live-rooms')}
          className={`flex-1 py-2.5 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${
            activeTab === 'live-rooms' ? 'bg-primary text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <i className="fa-solid fa-tower-broadcast mr-2"></i> Live Room Host Panel
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
