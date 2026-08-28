'use client';

import React, { useState, useEffect } from 'react';
import { INITIAL_QUIZZES, QuizItem, getQuizScoresHistory, QuizHistoryRecord, fetchQuizzesFromApi, fetchScoresFromApi, saveQuizScoreRecord } from '@/lib/quizData';
import { joinLiveSession } from '@/lib/quizLiveSession';
import QuizPlayerModal from '@/components/quiz/QuizPlayerModal';
import JoinPinModal from '@/components/quiz/JoinPinModal';
import CustomSelect from '@/components/ui/CustomSelect';
import Swal from 'sweetalert2';

export default function UserDashboardKuis() {
  const [quizzes, setQuizzes] = useState<QuizItem[]>(INITIAL_QUIZZES);
  const [activeTab, setActiveTab] = useState<'tersedia' | 'selesai'>('tersedia');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');

  // Quiz Modal States
  const [activeQuiz, setActiveQuiz] = useState<QuizItem | null>(null);
  const [quizMode, setQuizMode] = useState<'solo' | 'multiplayer'>('solo');
  const [activePin, setActivePin] = useState<string | undefined>(undefined);
  const [userNickname, setUserNickname] = useState<string>('Peserta BI');
  const [isPinModalOpen, setIsPinModalOpen] = useState<boolean>(false);

  // History State
  const [history, setHistory] = useState<QuizHistoryRecord[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const apiQuizzes = await fetchQuizzesFromApi();
      if (apiQuizzes && apiQuizzes.length > 0) setQuizzes(apiQuizzes);
      const apiScores = await fetchScoresFromApi();
      if (apiScores) setHistory(apiScores);
    };
    loadData();
    window.addEventListener('quiz_scores_update', loadData);
    return () => {
      window.removeEventListener('quiz_scores_update', loadData);
    };
  }, []);

  const CATEGORY_OPTIONS = [
    { value: 'Semua', label: 'Semua Kategori', icon: 'fa-solid fa-layer-group' },
    { value: 'Kebanksentralan', label: 'Kebanksentralan', icon: 'fa-solid fa-building-columns' },
    { value: 'Cinta Bangga Paham Rupiah', label: 'Cinta Bangga Paham Rupiah', icon: 'fa-solid fa-coins' },
    { value: 'Sistem Pembayaran & QRIS', label: 'Sistem Pembayaran & QRIS', icon: 'fa-solid fa-qrcode' }
  ];

  const filteredQuizzes = quizzes.filter(q => {
    if (selectedCategory === 'Semua') return true;
    return q.category === selectedCategory;
  });

  const handleStartSolo = (quiz: QuizItem) => {
    setActiveQuiz(quiz);
    setQuizMode('solo');
    setActivePin(undefined);
  };

  const handleJoinPinSubmit = async (pinCode: string, nickname: string, avatarId: string) => {
    const result = await joinLiveSession(pinCode, nickname, avatarId);
    
    if (!result.success || !result.session) {
      Swal.fire({
        icon: 'error',
        title: 'Gagal Bergabung!',
        text: result.message || 'Game PIN tidak valid atau Live Room sudah ditutup.',
        confirmButtonText: 'Coba Lagi',
        confirmButtonColor: '#0054a7'
      });
      return; // keep modal open — do NOT close
    }

    const session = result.session;
    setIsPinModalOpen(false);
    setUserNickname(nickname);
    setActivePin(pinCode);

    // Pick target quiz from session object or fallback to matching quiz/first quiz
    const targetQuiz = session?.quiz || quizzes.find(q => String(q.id) === String(session?.quiz_id)) || quizzes[0];
    if (!targetQuiz) {
      Swal.fire({ icon: 'warning', title: 'Kuis tidak ditemukan', text: 'Silakan muat ulang halaman.' });
      return;
    }
    setActiveQuiz(targetQuiz);
    setQuizMode('multiplayer');
  };

  const handleQuizFinish = (score: number, totalQuestions: number) => {
    if (!activeQuiz) return;
    const newItem: QuizHistoryRecord = {
      id: `h-${Date.now()}`,
      quiz_id: activeQuiz.id,
      quiz_title: activeQuiz.title,
      nickname: userNickname || 'Peserta BI',
      score,
      total_questions: totalQuestions,
      correct_answers: Math.round((score / (totalQuestions * 1000 || 1)) * totalQuestions),
      mode: quizMode,
      date: new Date().toISOString().split('T')[0]
    };
    saveQuizScoreRecord(newItem);
    setHistory(prev => [newItem, ...prev]);
  };

  return (
    <div className="flex flex-col gap-6 w-full font-sans">
      
      {/* HERO BANNER & JOIN PIN TRIGGER */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-sky-900 via-primary to-blue-900 p-6 md:p-8 text-white shadow-xl border border-sky-700/50 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex flex-col gap-2 max-w-lg relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-400/20 text-yellow-300 text-xs font-bold rounded-full w-fit border border-yellow-400/30">
            <i className="fa-solid fa-gamepad"></i> Platform Kuis Interaktif BI
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight drop-shadow-sm">Ayo Uji Pemahamanmu!</h2>
          <p className="text-sky-100/90 text-xs md:text-sm leading-relaxed">
            Mainkan kuis seru tentang Kebanksentralan, QRIS, dan Cinta Bangga Paham Rupiah. Nikmati musik latar interaktif dan kumpulkan poin!
          </p>
        </div>

        {/* Join Live Room PIN CTA Button */}
        <div className="flex flex-col sm:flex-row items-center gap-3 relative z-10 shrink-0 w-full sm:w-auto">
          <button
            onClick={() => setIsPinModalOpen(true)}
            className="w-full sm:w-auto px-6 py-4 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black text-xs rounded-2xl transition-all shadow-xl flex items-center justify-center gap-2 cursor-pointer border-b-4 border-yellow-600 active:border-b-0 active:translate-y-0.5"
          >
            <i className="fa-solid fa-key text-base"></i>
            <span>Gabung Live Game (PIN)</span>
          </button>
        </div>
      </div>

      {/* TOOLBAR: TABS & CATEGORY FILTER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs">
        
        {/* Main Tabs */}
        <div className="flex bg-slate-100 p-1.5 rounded-2xl w-full sm:w-auto border border-slate-200">
          <button
            onClick={() => setActiveTab('tersedia')}
            className={`flex-1 sm:px-6 py-2 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${
              activeTab === 'tersedia'
                ? 'bg-primary text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <i className="fa-solid fa-list-ul mr-1.5"></i> Kuis Tersedia
          </button>
          <button
            onClick={() => setActiveTab('selesai')}
            className={`flex-1 sm:px-6 py-2 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${
              activeTab === 'selesai'
                ? 'bg-primary text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <i className="fa-solid fa-clock-rotate-left mr-1.5"></i> Riwayat Skor
          </button>
        </div>

        {/* Category Dropdown Filter */}
        {activeTab === 'tersedia' && (
          <div className="w-full sm:w-64">
            <CustomSelect
              options={CATEGORY_OPTIONS}
              value={selectedCategory}
              onChange={(val) => setSelectedCategory(val)}
              placeholder="Pilih Kategori Kuis..."
            />
          </div>
        )}
      </div>

      {/* CONTENT GRID BASED ON TAB */}
      {activeTab === 'tersedia' ? (
        filteredQuizzes.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center shadow-xs">
            <div className="w-16 h-16 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mx-auto mb-3 text-2xl">
              <i className="fa-solid fa-filter-circle-xmark"></i>
            </div>
            <h4 className="text-slate-800 font-extrabold text-base">Tidak Ada Kuis untuk Kategori Ini</h4>
            <p className="text-slate-500 text-xs mt-1">Silakan pilih kategori kuis lainnya di atas.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredQuizzes.map((quiz) => (
              <div
                key={quiz.id}
                className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between group relative overflow-hidden"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span className="text-[11px] font-extrabold px-3 py-1 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
                      {quiz.category}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-400">
                      <i className="fa-solid fa-users text-sky-600 mr-1"></i> {quiz.play_count}x dimainkan
                    </span>
                  </div>

                  <h3 className="text-lg font-extrabold text-slate-900 mb-2 leading-snug group-hover:text-primary transition-colors">
                    {quiz.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed mb-6">
                    {quiz.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-500 bg-slate-50 p-3 rounded-2xl border border-slate-100 mb-6">
                    <span><i className="fa-solid fa-[#0054a7] fa-circle-question text-sky-600 mr-1"></i> {quiz.total_questions} Soal</span>
                    <span>•</span>
                    <span><i className="fa-solid fa-clock text-amber-500 mr-1"></i> {quiz.estimated_time_minutes} Mins</span>
                    <span>•</span>
                    <span className="text-emerald-700 font-bold">{quiz.difficulty}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleStartSolo(quiz)}
                    className="w-full py-3.5 px-4 bg-primary hover:bg-sky-700 text-white font-extrabold text-xs rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 border-b-4 border-yellow-500 active:border-b-0 active:translate-y-0.5 cursor-pointer"
                  >
                    <i className="fa-solid fa-play text-yellow-300"></i>
                    <span>Mainkan Kuis (Solo)</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        /* HISTORY TAB */
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <i className="fa-solid fa-trophy text-amber-500"></i>
            <span>Riwayat Perolehan Poin Kuis Anda</span>
          </h3>

          {history.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <i className="fa-regular fa-clock text-4xl block mb-2"></i>
              <p className="text-xs font-semibold">Belum ada riwayat kuis yang diselesaikan.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"
                >
                  <div className="space-y-1">
                    <h4 className="font-bold text-slate-900 text-sm">{item.quiz_title}</h4>
                    <span className="text-xs text-slate-500">
                      Diselesaikan pada {new Date(item.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                  </div>

                  <div className="bg-amber-400/20 text-amber-900 border border-amber-300 px-4 py-2 rounded-xl flex items-center gap-2 shrink-0">
                    <i className="fa-solid fa-bolt text-amber-600"></i>
                    <span className="text-sm font-extrabold">{item.score.toLocaleString('id-ID')} Poin</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* QUIZ PLAYER MODAL */}
      {activeQuiz && (
        <QuizPlayerModal
          quiz={activeQuiz}
          mode={quizMode}
          pinCode={activePin}
          userNickname={userNickname}
          onClose={() => setActiveQuiz(null)}
          onFinish={handleQuizFinish}
        />
      )}

      {/* JOIN LIVE ROOM PIN MODAL */}
      <JoinPinModal
        isOpen={isPinModalOpen}
        onClose={() => setIsPinModalOpen(false)}
        onJoin={handleJoinPinSubmit}
      />
    </div>
  );
}
