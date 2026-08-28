'use client';

import React, { useState, useEffect, useRef } from 'react';
import { QuizItem, QuizQuestion, calculateQuestionScore, PLAYER_AVATARS, saveQuizScoreRecord } from '@/lib/quizData';
import { quizAudio, BGM_TRACKS } from '@/lib/quizAudio';
import { getActiveLiveSession, syncActiveSessionFromApi, updateParticipantScoreInSession } from '@/lib/quizLiveSession';

function triggerVictoryConfetti() {
  if (typeof window === 'undefined') return;
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.top = '0';
  container.style.left = '0';
  container.style.width = '100vw';
  container.style.height = '100vh';
  container.style.pointerEvents = 'none';
  container.style.zIndex = '9999999';
  document.body.appendChild(container);

  const colors = ['#f59e0b', '#10b981', '#3b82f6', '#ec4899', '#8b5cf6', '#eab308'];
  for (let i = 0; i < 70; i++) {
    const particle = document.createElement('div');
    const size = Math.random() * 8 + 6;
    const color = colors[Math.floor(Math.random() * colors.length)];
    const left = Math.random() * 100;
    const duration = Math.random() * 2 + 1.5;
    const delay = Math.random() * 0.5;

    particle.style.position = 'absolute';
    particle.style.top = '-20px';
    particle.style.left = `${left}%`;
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    particle.style.backgroundColor = color;
    particle.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
    particle.style.transform = `rotate(${Math.random() * 360}deg)`;
    particle.style.transition = `all ${duration}s ease-out ${delay}s`;

    container.appendChild(particle);

    setTimeout(() => {
      particle.style.top = `${Math.random() * 60 + 40}%`;
      particle.style.left = `${left + (Math.random() * 30 - 15)}%`;
      particle.style.opacity = '0';
      particle.style.transform = `rotate(${Math.random() * 720}deg) scale(0.5)`;
    }, 50);
  }

  setTimeout(() => {
    if (container.parentNode) {
      container.parentNode.removeChild(container);
    }
  }, 3500);
}

interface QuizPlayerModalProps {
  quiz: QuizItem;
  mode: 'solo' | 'multiplayer';
  pinCode?: string;
  userNickname?: string;
  onClose: () => void;
  onFinish?: (score: number, totalQuestions: number) => void;
}

export default function QuizPlayerModal({
  quiz,
  mode,
  pinCode,
  userNickname = 'Peserta BI',
  onClose,
  onFinish
}: QuizPlayerModalProps) {
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  
  // Quiz Start & Lobby State
  const [isGameStarted, setIsGameStarted] = useState<boolean>(false);
  const [countdownNum, setCountdownNum] = useState<number | null>(null);
  const [liveSessionStatus, setLiveSessionStatus] = useState<'waiting' | 'playing' | 'finished'>('waiting');
  const [connectedParticipants, setConnectedParticipants] = useState<any[]>([]);

  // Timer & Scoring States
  const [timeLeft, setTimeLeft] = useState<number>(quiz.questions[0]?.time_limit_seconds || 15);
  const [totalScore, setTotalScore] = useState<number>(0);
  const [streakCount, setStreakCount] = useState<number>(0);
  const [lastEarnedPoints, setLastEarnedPoints] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, { selectedOptionId: string; isCorrect: boolean; timeTaken: number; points: number }>>({});
  const [isFinished, setIsFinished] = useState<boolean>(false);

  // Audio Control States
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [currentTrack, setCurrentTrack] = useState<string>('upbeat');
  const [showAudioMenu, setShowAudioMenu] = useState<boolean>(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const autoNextTimerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  // Refs to avoid stale closures in the polling syncRoom function
  const isGameStartedRef = useRef<boolean>(false);
  const countdownNumRef = useRef<number | null>(null);
  const gameStartCalledRef = useRef<boolean>(false);

  const currentQ: QuizQuestion | undefined = quiz.questions[currentIdx];

  const triggerAutoNext = () => {
    if (autoNextTimerRef.current) clearTimeout(autoNextTimerRef.current);
    autoNextTimerRef.current = setTimeout(() => {
      handleNextQuestion();
    }, 1200);
  };

  const handleStartGame = () => {
    if (gameStartCalledRef.current) return; // guard double-fire
    gameStartCalledRef.current = true;
    countdownNumRef.current = 3;
    setCountdownNum(3);
    quizAudio.playCorrectSound();

    let count = 3;
    const cdInterval = setInterval(() => {
      count -= 1;
      if (count <= 0) {
        clearInterval(cdInterval);
        countdownNumRef.current = null;
        setCountdownNum(null);
        isGameStartedRef.current = true;
        setIsGameStarted(true);
      } else {
        countdownNumRef.current = count;
        setCountdownNum(count);
        quizAudio.playTickSound();
      }
    }, 800);
  };

  // Sync Live Room session for Multiplayer – runs once, reads state via refs
  useEffect(() => {
    if (mode !== 'multiplayer') return;

    const syncRoom = async () => {
      const session = (await syncActiveSessionFromApi()) || getActiveLiveSession();
      if (session) {
        setLiveSessionStatus(session.status);
        setConnectedParticipants([...(session.participants || [])]);

        // Trigger game start when host presses "Mulai" – use refs, not state closure
        if (
          session.status === 'playing' &&
          !isGameStartedRef.current &&
          countdownNumRef.current === null &&
          !gameStartCalledRef.current
        ) {
          handleStartGame();
        }
      } else {
        setLiveSessionStatus('waiting');
      }
    };

    syncRoom();
    window.addEventListener('quiz_session_update', syncRoom);
    window.addEventListener('storage', syncRoom);
    // Poll every 500ms for fast cross-browser / cross-device DB sync
    const interval = setInterval(syncRoom, 500);

    return () => {
      window.removeEventListener('quiz_session_update', syncRoom);
      window.removeEventListener('storage', syncRoom);
      clearInterval(interval);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  // Start Timer & Audio on mount / question change
  useEffect(() => {
    if (!isGameStarted || isFinished || !currentQ) return;

    // Reset states for question
    setSelectedOptionId(null);
    setIsAnswered(false);
    setIsCorrect(null);
    setTimeLeft(currentQ.time_limit_seconds);
    startTimeRef.current = Date.now();

    // Start BGM if not played
    quizAudio.playBGM(currentTrack);

    // Timer Interval
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleTimeOut();
          return 0;
        }
        if (prev <= 5) {
          quizAudio.playTickSound();
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (autoNextTimerRef.current) clearTimeout(autoNextTimerRef.current);
    };
  }, [isGameStarted, currentIdx, isFinished]);

  // Clean up BGM on unmount
  useEffect(() => {
    return () => {
      quizAudio.stopBGM();
      if (autoNextTimerRef.current) clearTimeout(autoNextTimerRef.current);
    };
  }, []);

  const handleTimeOut = () => {
    if (isAnswered) return;
    setIsAnswered(true);
    setIsCorrect(false);
    setStreakCount(0);
    setLastEarnedPoints(0);
    quizAudio.playWrongSound();

    if (currentQ) {
      setUserAnswers(prev => ({
        ...prev,
        [currentQ.id]: { selectedOptionId: '', isCorrect: false, timeTaken: currentQ.time_limit_seconds, points: 0 }
      }));
    }

    if (mode === 'multiplayer' && pinCode && userNickname) {
      updateParticipantScoreInSession(pinCode, userNickname, totalScore, 0);
    }

    triggerAutoNext();
  };

  const handleSelectOption = (option: { id: string; text: string; is_correct: boolean }) => {
    if (isAnswered || !currentQ) return;
    if (timerRef.current) clearInterval(timerRef.current);

    const timeTaken = Math.min(
      currentQ.time_limit_seconds,
      Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000))
    );

    setSelectedOptionId(option.id);
    setIsAnswered(true);

    let newTotalScore = totalScore;
    let newStreak = 0;

    if (option.is_correct) {
      setIsCorrect(true);
      newStreak = streakCount + 1;
      setStreakCount(newStreak);

      const scoreResult = calculateQuestionScore(
        true,
        timeTaken,
        currentQ.time_limit_seconds,
        currentQ.points || 1000,
        newStreak
      );

      newTotalScore = totalScore + scoreResult.total;
      setLastEarnedPoints(scoreResult.total);
      setTotalScore(newTotalScore);
      quizAudio.playCorrectSound();

      setUserAnswers(prev => ({
        ...prev,
        [currentQ.id]: { selectedOptionId: option.id, isCorrect: true, timeTaken, points: scoreResult.total }
      }));
    } else {
      setIsCorrect(false);
      setStreakCount(0);
      setLastEarnedPoints(0);
      quizAudio.playWrongSound();

      setUserAnswers(prev => ({
        ...prev,
        [currentQ.id]: { selectedOptionId: option.id, isCorrect: false, timeTaken, points: 0 }
      }));
    }

    if (mode === 'multiplayer' && pinCode && userNickname) {
      updateParticipantScoreInSession(pinCode, userNickname, newTotalScore, newStreak);
    }

    triggerAutoNext();
  };

  const handleNextQuestion = () => {
    if (currentIdx + 1 < quiz.questions.length) {
      setCurrentIdx(prev => prev + 1);
    } else {
      finishGame();
    }
  };

  const finishGame = () => {
    setIsFinished(true);
    quizAudio.stopBGM();
    quizAudio.playVictoryFanfare();

    // Trigger Custom Confetti
    triggerVictoryConfetti();

    if (mode === 'multiplayer' && pinCode && userNickname) {
      updateParticipantScoreInSession(pinCode, userNickname, totalScore, streakCount);
    }

    // Save score record to persistent score history
    saveQuizScoreRecord({
      id: `score-${Date.now()}`,
      quiz_id: quiz.id,
      quiz_title: quiz.title,
      nickname: userNickname || 'Peserta BI',
      score: totalScore,
      total_questions: quiz.questions.length,
      correct_answers: Object.values(userAnswers).filter(a => a.isCorrect).length,
      mode: mode,
      date: new Date().toISOString().split('T')[0]
    });

    if (onFinish) {
      onFinish(totalScore, quiz.questions.length);
    }
  };

  const handleToggleMute = () => {
    const muted = quizAudio.toggleMute();
    setIsMuted(muted);
  };

  const handleChangeTrack = (trackId: string) => {
    setCurrentTrack(trackId);
    quizAudio.playBGM(trackId);
    setShowAudioMenu(false);
  };

  const OPTION_STYLES = [
    { bg: 'bg-red-500 hover:bg-red-600 border-red-700 text-white', icon: 'fa-solid fa-play rotate-[-90deg]' },
    { bg: 'bg-blue-600 hover:bg-blue-700 border-blue-800 text-white', icon: 'fa-solid fa-diamond' },
    { bg: 'bg-amber-500 hover:bg-amber-600 border-amber-700 text-white', icon: 'fa-solid fa-circle' },
    { bg: 'bg-emerald-600 hover:bg-emerald-700 border-emerald-800 text-white', icon: 'fa-solid fa-square' }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col justify-between overflow-y-auto animate-in fade-in duration-200 text-white font-sans">
      
      {/* TOP STATUS BAR */}
      <div className="bg-slate-900/90 border-b border-slate-800 px-4 sm:px-8 py-3 flex items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all border border-slate-700 flex items-center gap-1.5 cursor-pointer"
          >
            <i className="fa-solid fa-xmark text-sm"></i> Keluar
          </button>

          <div className="hidden sm:flex flex-col">
            <span className="text-[11px] text-slate-400 font-semibold">{quiz.title}</span>
            {pinCode && (
              <span className="text-[10px] font-extrabold text-amber-400">PIN Live: {pinCode}</span>
            )}
          </div>
        </div>

        {/* User Badge & Score */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-full border border-slate-700">
            <i className="fa-solid fa-user text-sky-400 text-xs"></i>
            <span className="text-xs font-bold text-slate-200">{userNickname}</span>
          </div>

          <div className="bg-amber-400/20 border border-amber-400/40 text-amber-300 px-4 py-1.5 rounded-full flex items-center gap-2">
            <i className="fa-solid fa-bolt text-amber-400"></i>
            <span className="text-sm font-black tracking-wide">{totalScore.toLocaleString('id-ID')} Poin</span>
          </div>

          {/* AUDIO CONTROLLER TOOLBAR */}
          <div className="relative">
            <button
              onClick={() => setShowAudioMenu(!showAudioMenu)}
              className={`p-2.5 rounded-xl border transition-all flex items-center justify-center cursor-pointer ${
                isMuted
                  ? 'bg-red-500/20 border-red-500/50 text-red-400'
                  : 'bg-sky-500/20 border-sky-500/50 text-sky-300 hover:bg-sky-500/30'
              }`}
              title="Pengaturan Musik & Suara"
            >
              <i className={isMuted ? 'fa-solid fa-volume-xmark text-base' : 'fa-solid fa-music text-base'}></i>
            </button>

            {/* Audio Dropdown */}
            {showAudioMenu && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-3 z-50 text-xs space-y-2">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="font-extrabold text-slate-300">🎵 Audio & Musik</span>
                  <button
                    onClick={handleToggleMute}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold ${
                      isMuted ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
                    }`}
                  >
                    {isMuted ? 'Unmute' : 'Mute Sound'}
                  </button>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 block font-semibold">Pilih Musik Latar (BGM):</span>
                  {BGM_TRACKS.map(t => (
                    <button
                      key={t.id}
                      onClick={() => handleChangeTrack(t.id)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between cursor-pointer transition-colors ${
                        currentTrack === t.id && !isMuted
                          ? 'bg-sky-600 text-white font-bold'
                          : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <span>{t.title}</span>
                      {currentTrack === t.id && !isMuted && <i className="fa-solid fa-check text-xs"></i>}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* GAMEPLAY CONTAINER */}
      {!isGameStarted && !isFinished ? (
        /* LOBI SIAP BERMAIN (START SCREEN) */
        <div className="flex-1 flex flex-col items-center justify-center max-w-xl w-full mx-auto p-6 text-center space-y-6 overflow-y-auto my-auto">
          {countdownNum !== null ? (
            <div className="flex flex-col items-center justify-center space-y-4 animate-in zoom-in-75 duration-200">
              <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 text-slate-950 flex items-center justify-center text-6xl font-black shadow-2xl border-4 border-white/20 animate-bounce">
                {countdownNum}
              </div>
              <h3 className="text-xl font-extrabold text-white tracking-wide uppercase">Siap-Siap...</h3>
            </div>
          ) : (
            <>
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center text-4xl shadow-2xl border-2 border-white/20">
                <i className="fa-solid fa-gamepad text-white"></i>
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-sky-400">{quiz.category}</span>
                <h2 className="text-2xl sm:text-3xl font-black text-white mt-1 leading-tight">{quiz.title}</h2>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed max-w-md mx-auto">
                  {quiz.description}
                </p>
              </div>

              <div className="w-full bg-slate-900/90 border border-slate-800 p-5 rounded-3xl space-y-4 shadow-xl">
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">Jumlah Soal</span>
                    <span className="text-lg font-black text-sky-400">{quiz.questions.length} Soal</span>
                  </div>
                  <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">Estimasi</span>
                    <span className="text-lg font-black text-amber-400">{quiz.estimated_time_minutes} Menit</span>
                  </div>
                  <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">Tingkat</span>
                    <span className="text-sm font-black text-emerald-400 mt-1 block">{quiz.difficulty}</span>
                  </div>
                </div>

                {/* Multiplayer Joined Participants list preview */}
                {mode === 'multiplayer' && (
                  <div className="pt-3 border-t border-slate-800 space-y-3 text-left">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-extrabold text-slate-200 flex items-center gap-1.5">
                        <i className="fa-solid fa-users text-sky-400"></i>
                        Ruang Tunggu Peserta ({connectedParticipants.length})
                      </span>
                      <span className="px-2.5 py-0.5 bg-yellow-400/20 text-yellow-300 font-black rounded-full border border-yellow-400/30 text-[11px] tracking-wider">
                        PIN: {pinCode}
                      </span>
                    </div>

                    {/* Participant Avatar Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-36 overflow-y-auto pr-1">
                      {connectedParticipants.map(p => (
                        <div key={p.id} className="px-3 py-2 bg-slate-800/90 rounded-xl border border-slate-700 text-xs text-sky-200 font-semibold flex items-center gap-2 shadow-xs">
                          <div className="w-6 h-6 rounded-lg bg-sky-500/20 text-sky-300 border border-sky-400/30 flex items-center justify-center text-[10px]">
                            <i className="fa-solid fa-user-astronaut"></i>
                          </div>
                          <span className="truncate font-bold text-slate-100">{p.nickname}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 px-2">
                  <span>Pemain Saya: <strong className="text-amber-300">{userNickname}</strong></span>
                  {mode === 'multiplayer' && <span className="text-emerald-400 font-extrabold flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span> Live Sync No-Reload</span>}
                </div>
              </div>

              {mode === 'multiplayer' ? (
                <div className="w-full py-4 bg-sky-950/80 border border-sky-500/40 rounded-2xl p-4 text-center space-y-2">
                  <div className="flex items-center justify-center gap-2 text-sky-300 font-black text-sm uppercase tracking-wider">
                    <i className="fa-solid fa-spinner fa-spin text-amber-400"></i>
                    <span>MENUNGGU ADMIN MEMULAI KUIS...</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Kuis akan otomatis dimulai serentak untuk seluruh peserta saat Host menekan <strong>"Mulai Game Live"</strong> di Admin Panel.
                  </p>
                </div>
              ) : (
                <button
                  onClick={handleStartGame}
                  className="w-full py-4 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm sm:text-base rounded-2xl transition-all shadow-xl flex items-center justify-center gap-3 cursor-pointer border-b-4 border-amber-600 active:border-b-0 active:translate-y-0.5"
                >
                  <i className="fa-solid fa-play text-lg"></i>
                  <span>MULAI KUIS SEKARANG</span>
                </button>
              )}
            </>
          )}
        </div>
      ) : !isFinished && currentQ ? (
        <div className="flex-1 flex flex-col justify-between max-w-4xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto">
          
          {/* TIMER & STREAK HEADER */}
          <div className="space-y-2.5">
            <div className="flex justify-between items-center text-xs font-bold text-slate-300">
              <span className="bg-slate-800/90 text-white font-extrabold px-3 py-1.5 rounded-xl border border-slate-700/80 shadow-xs flex items-center gap-2">
                <i className="fa-solid fa-list-check text-sky-400"></i> Soal {currentIdx + 1} dari {quiz.questions.length}
              </span>
              
              {streakCount > 1 && (
                <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3 py-1.5 rounded-xl animate-pulse flex items-center gap-1.5">
                  <i className="fa-solid fa-fire text-amber-400"></i> Streak {streakCount}x Combo!
                </span>
              )}

              <span className={`px-3.5 py-1.5 rounded-xl border font-black flex items-center gap-1.5 shadow-xs ${
                timeLeft <= 5 ? 'bg-red-500/20 border-red-500/50 text-red-400 animate-bounce' : 'bg-slate-800/90 border-slate-700/80 text-sky-300'
              }`}>
                <i className="fa-solid fa-clock text-amber-400"></i> {timeLeft} Detik
              </span>
            </div>

            {/* Progress Bar Timer */}
            <div className="w-full h-2.5 bg-slate-800/90 rounded-full overflow-hidden border border-slate-700/80">
              <div
                className={`h-full transition-all duration-1000 ease-linear rounded-full ${
                  timeLeft <= 5 ? 'bg-red-500' : 'bg-gradient-to-r from-sky-400 to-amber-400'
                }`}
                style={{ width: `${(timeLeft / currentQ.time_limit_seconds) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* QUESTION BOX */}
          <div className="bg-slate-900/90 border border-slate-800 p-5 sm:p-8 rounded-3xl shadow-2xl text-center space-y-4 relative overflow-hidden max-h-[42vh] overflow-y-auto">
            <div className="absolute top-3 right-4 px-3 py-1 rounded-xl bg-slate-800/90 border border-slate-700/80 text-amber-400 font-extrabold text-xs sm:text-sm tracking-wider z-20 flex items-center gap-1.5 shadow-xs">
              <i className="fa-solid fa-hashtag text-amber-400"></i> {currentIdx + 1}
            </div>

            <h2 className="text-base sm:text-2xl font-black text-white leading-relaxed tracking-tight relative z-10 pt-4">
              {currentQ.question_text}
            </h2>

            {currentQ.image_url && (
              <div className="relative w-full max-h-44 rounded-2xl overflow-hidden my-2 border border-slate-700 mx-auto max-w-md">
                <img src={currentQ.image_url} alt="Question Graphic" className="w-full h-full object-cover" />
              </div>
            )}
          </div>

          {/* OPTIONS GRID (QUIZIZZ 4-COLOR TILES) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {currentQ.options.map((opt, optIdx) => {
              const style = OPTION_STYLES[optIdx % OPTION_STYLES.length];
              const isThisSelected = selectedOptionId === opt.id;
              
              let stateClass = style.bg;
              if (isAnswered) {
                if (opt.is_correct) {
                  stateClass = 'bg-emerald-600 border-emerald-400 ring-4 ring-emerald-400/50 scale-[1.02] text-white';
                } else if (isThisSelected && !opt.is_correct) {
                  stateClass = 'bg-red-600/60 border-red-500 line-through opacity-70 text-white';
                } else {
                  stateClass = 'bg-slate-800/60 border-slate-700 opacity-40 text-slate-400';
                }
              }

              return (
                <button
                  key={opt.id}
                  disabled={isAnswered}
                  onClick={() => handleSelectOption(opt)}
                  className={`p-5 sm:p-6 rounded-2xl border-b-4 font-bold text-sm sm:text-base text-left transition-all duration-200 flex items-center gap-4 cursor-pointer active:translate-y-1 ${stateClass}`}
                >
                  <div className="w-9 h-9 rounded-xl bg-black/20 flex items-center justify-center shrink-0 text-base">
                    <i className={style.icon}></i>
                  </div>
                  <span className="flex-1 leading-snug">{opt.text}</span>
                  {isAnswered && opt.is_correct && (
                    <i className="fa-solid fa-circle-check text-xl text-yellow-300 shrink-0"></i>
                  )}
                </button>
              );
            })}
          </div>

          {/* ANSWER FEEDBACK OVERLAY BAR */}
          {isAnswered && (
            <div className={`p-5 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 animate-in slide-in-from-bottom-4 duration-200 ${
              isCorrect ? 'bg-emerald-950/80 border-emerald-600/80 text-emerald-200' : 'bg-red-950/80 border-red-600/80 text-red-200'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 ${
                  isCorrect ? 'bg-emerald-500 text-slate-900' : 'bg-red-500 text-white'
                }`}>
                  <i className={isCorrect ? 'fa-solid fa-check' : 'fa-solid fa-xmark'}></i>
                </div>
                <div>
                  <h4 className="font-extrabold text-sm sm:text-base">
                    {isCorrect ? `Luar Biasa! Benar (+${lastEarnedPoints} Poin)` : 'Jawaban Kurang Tepat!'}
                  </h4>
                    <p className="text-xs opacity-90 leading-relaxed mt-0.5 max-w-xl flex items-start gap-1">
                      <i className="fa-solid fa-lightbulb text-amber-400 text-sm shrink-0 mt-0.5"></i>
                      <span>{currentQ.explanation}</span>
                    </p>
                </div>
              </div>

              <button
                onClick={handleNextQuestion}
                className="w-full sm:w-auto px-6 py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer border-b-4 border-amber-600 active:border-b-0 active:translate-y-0.5 shrink-0"
              >
                <span>{currentIdx + 1 < quiz.questions.length ? 'Soal Berikutnya' : 'Lihat Hasil Kuis'}</span>
                <i className="fa-solid fa-arrow-right"></i>
              </button>
            </div>
          )}
        </div>
      ) : (
        /* VICTORY & SUMMARY SCREEN */
        <div className="flex-1 flex flex-col items-center justify-center max-w-xl w-full mx-auto p-4 sm:p-6 space-y-4 text-center overflow-y-auto my-auto py-6">
          
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-tr from-amber-400 to-yellow-300 text-slate-950 rounded-2xl flex items-center justify-center text-3xl sm:text-4xl shadow-xl mx-auto border-2 border-white/20 animate-bounce shrink-0">
            <i className="fa-solid fa-trophy"></i>
          </div>

          <div>
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-amber-400">Kuis Selesai!</span>
            <h2 className="text-2xl sm:text-3xl font-black text-white mt-0.5">Selamat, {userNickname}!</h2>
            <p className="text-[11px] sm:text-xs text-slate-400 mt-1 max-w-md mx-auto leading-relaxed">
              Kamu telah menyelesaikan {quiz.title}. Poinmu berhasil dicatat!
            </p>
          </div>

          {/* Score Display Card */}
          <div className="w-full bg-slate-900/90 border border-slate-800 p-4 sm:p-5 rounded-3xl shadow-xl space-y-3">
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700">
                <span className="text-[10px] text-slate-400 font-bold block uppercase">Total Poin</span>
                <span className="text-2xl sm:text-3xl font-black text-amber-400">{totalScore.toLocaleString('id-ID')}</span>
              </div>

              <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700">
                <span className="text-[10px] text-slate-400 font-bold block uppercase">Jawaban Benar</span>
                <span className="text-2xl sm:text-3xl font-black text-emerald-400">
                  {Object.values(userAnswers).filter(a => a.isCorrect).length} <span className="text-xs font-normal text-slate-400">/ {quiz.questions.length}</span>
                </span>
              </div>
            </div>

            {/* Answers Review List */}
            <div className="space-y-1.5 text-left pt-1">
              <span className="text-[11px] font-extrabold text-slate-400 block">Review Jawaban Soal:</span>
              <div className="max-h-32 sm:max-h-40 overflow-y-auto space-y-1.5 pr-1">
                {quiz.questions.map((q, idx) => {
                  const ans = userAnswers[q.id];
                  return (
                    <div key={q.id} className="p-2.5 bg-slate-800/60 rounded-xl border border-slate-700/60 text-[11px] flex justify-between items-center gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 ${
                          ans?.isCorrect ? 'bg-emerald-500 text-slate-950' : 'bg-red-500 text-white'
                        }`}>
                          {idx + 1}
                        </span>
                        <span className="truncate text-slate-200 font-medium">{q.question_text}</span>
                      </div>
                      <span className={`font-bold shrink-0 text-[10px] ${ans?.isCorrect ? 'text-emerald-400' : 'text-red-400'}`}>
                        {ans?.isCorrect ? `+${ans.points}` : '0 Poin'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full py-3.5 bg-primary hover:bg-sky-600 text-white font-black text-xs sm:text-sm rounded-2xl transition-all shadow-xl cursor-pointer border-b-4 border-yellow-400 active:border-b-0 active:translate-y-0.5 shrink-0"
          >
            Selesai &amp; Kembali ke Dashboard
          </button>
        </div>
      )}
    </div>
  );
}
