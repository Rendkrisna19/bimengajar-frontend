// Quiz Data Store & Helper Utilities

export interface QuizQuestion {
  id: string;
  question_text: string;
  image_url?: string;
  time_limit_seconds: number;
  points: number;
  options: {
    id: string;
    text: string;
    is_correct: boolean;
    color: 'red' | 'blue' | 'yellow' | 'green';
  }[];
  explanation?: string;
}

export interface QuizItem {
  id: string;
  title: string;
  slug: string;
  category: 'Kebanksentralan' | 'Cinta Bangga Paham Rupiah' | 'Sistem Pembayaran & QRIS' | 'Titik Temu Uang Logam';
  description: string;
  thumbnail: string;
  mode: 'solo' | 'multiplayer' | 'both';
  difficulty: 'Mudah' | 'Sedang' | 'Tantangan';
  total_questions: number;
  estimated_time_minutes: number;
  play_count: number;
  questions: QuizQuestion[];
  is_active: boolean;
  created_at: string;
}

export interface LiveRoomSession {
  pin_code: string;
  quiz_id: string;
  quiz_title: string;
  status: 'waiting' | 'playing' | 'finished';
  current_question_index: number;
  host_name: string;
  participants: {
    id: string;
    nickname: string;
    avatar: string;
    score: number;
    streak: number;
    last_answer_correct?: boolean;
  }[];
  quiz?: QuizItem;
}

// Preset Bank Indonesia Quizzes
export const INITIAL_QUIZZES: QuizItem[] = [
  {
    id: 'quiz-bi-1',
    title: 'Kuis Kebanksentralan & Peran Bank Indonesia',
    slug: 'kebanksentralan-bi',
    category: 'Kebanksentralan',
    description: 'Uji pengetahuanmu mengenai tugas pokok, tujuan tunggal, dan peran strategis Bank Indonesia sebagai bank sentral Republik Indonesia.',
    thumbnail: '/images/menu-cepat/1.png',
    mode: 'both',
    difficulty: 'Sedang',
    total_questions: 5,
    estimated_time_minutes: 5,
    play_count: 342,
    is_active: true,
    created_at: '2026-08-20',
    questions: [
      {
        id: 'q1',
        question_text: 'Apa tujuan tunggal Bank Indonesia sesuai UU Nomor 23 Tahun 1999 yang telah diubah terakhir dengan UU P2SK?',
        time_limit_seconds: 15,
        points: 1000,
        explanation: 'Tujuan tunggal Bank Indonesia adalah mencapai dan memelihara kestabilan nilai Rupiah terhadap barang/jasa dan mata uang negara lain.',
        options: [
          { id: 'opt-1-1', text: 'Mencetak uang sebanyak-banyaknya', is_correct: false, color: 'red' },
          { id: 'opt-1-2', text: 'Mencapai dan memelihara kestabilan nilai Rupiah', is_correct: true, color: 'blue' },
          { id: 'opt-1-3', text: 'Memberikan pinjaman langsung kepada masyarakat', is_correct: false, color: 'yellow' },
          { id: 'opt-1-4', text: 'Mengatur tarif pajak penerimaan negara', is_correct: false, color: 'green' }
        ]
      },
      {
        id: 'q2',
        question_text: 'Kantor Perwakilan Bank Indonesia Pematangsiantar mencakup wilayah kerja berapa Kabupaten/Kota di Sumatera Utara?',
        time_limit_seconds: 15,
        points: 1000,
        explanation: 'KPw BI Pematangsiantar menaungi 8 wilayah kerja di wilayah Sisi Batas Labuhan (Siantar, Simalungun, Batubara, Asahan, Tanjungbalai, Labuhanbatu, Labuhanbatu Utara, Labuhanbatu Selatan).',
        options: [
          { id: 'opt-2-1', text: '3 Kabupaten/Kota', is_correct: false, color: 'red' },
          { id: 'opt-2-2', text: '5 Kabupaten/Kota', is_correct: false, color: 'blue' },
          { id: 'opt-2-3', text: '8 Kabupaten/Kota (Sisi Batas Labuhan)', is_correct: true, color: 'yellow' },
          { id: 'opt-2-4', text: '12 Kabupaten/Kota', is_correct: false, color: 'green' }
        ]
      },
      {
        id: 'q3',
        question_text: 'Siapakah Gubernur Bank Indonesia yang menjabat saat ini?',
        time_limit_seconds: 15,
        points: 1000,
        explanation: 'Perry Warjiyo adalah Gubernur Bank Indonesia yang menjabat sejak tahun 2018 dan kembali terpilih untuk periode kedua.',
        options: [
          { id: 'opt-3-1', text: 'Perry Warjiyo', is_correct: true, color: 'red' },
          { id: 'opt-3-2', text: 'Sri Mulyani Indrawati', is_correct: false, color: 'blue' },
          { id: 'opt-3-3', text: 'Agus Martowardojo', is_correct: false, color: 'yellow' },
          { id: 'opt-3-4', text: 'Darmin Nasution', is_correct: false, color: 'green' }
        ]
      },
      {
        id: 'q4',
        question_text: 'Tiga pilar utama tugas Bank Indonesia mencakup hal-hal berikut, KECUALI:',
        time_limit_seconds: 20,
        points: 1000,
        explanation: 'Tiga pilar BI: 1) Kebijakan Moneter, 2) Memelihara Stabilitas Sistem Keuangan, 3) Memelihara Kelancaran Sistem Pembayaran.',
        options: [
          { id: 'opt-4-1', text: 'Menetapkan dan melaksanakan kebijakan moneter', is_correct: false, color: 'red' },
          { id: 'opt-4-2', text: 'Memelihara stabilitas sistem keuangan', is_correct: false, color: 'blue' },
          { id: 'opt-4-3', text: 'Menentukan suku bunga kredit semua bank komersial', is_correct: true, color: 'yellow' },
          { id: 'opt-4-4', text: 'Mengatur dan menjaga kelancaran sistem pembayaran', is_correct: false, color: 'green' }
        ]
      },
      {
        id: 'q5',
        question_text: 'Kapan Bank Indonesia resmi didirikan menggantikan De Javasche Bank (DJB)?',
        time_limit_seconds: 15,
        points: 1000,
        explanation: 'Bank Indonesia didirikan pada 1 Juli 1953 berdasarkan UU No. 11 Tahun 1953.',
        options: [
          { id: 'opt-5-1', text: '17 Agustus 1945', is_correct: false, color: 'red' },
          { id: 'opt-5-2', text: '1 Juli 1953', is_correct: true, color: 'blue' },
          { id: 'opt-5-3', text: '10 November 1965', is_correct: false, color: 'yellow' },
          { id: 'opt-5-4', text: '21 Mei 1998', is_correct: false, color: 'green' }
        ]
      }
    ]
  },
  {
    id: 'quiz-bi-2',
    title: 'Kuis Cinta, Bangga, Paham (CBP) Rupiah',
    slug: 'cbp-rupiah',
    category: 'Cinta Bangga Paham Rupiah',
    description: 'Pelajari prinsip 3D (Dilihat, Diterawang, Diraba) dan makna Rupiah sebagai simbol kedaulatan Negara Kesatuan Republik Indonesia.',
    thumbnail: '/images/menu-cepat/2.png',
    mode: 'both',
    difficulty: 'Mudah',
    total_questions: 4,
    estimated_time_minutes: 4,
    play_count: 512,
    is_active: true,
    created_at: '2026-08-22',
    questions: [
      {
        id: 'q2-1',
        question_text: 'Apa kepanjangan dari 3D dalam mengenali keaslian uang Rupiah kartal?',
        time_limit_seconds: 15,
        points: 1000,
        explanation: 'Metode sederhana mengenali keaslian uang Rupiah adalah 3D: Dilihat, Diraba, dan Diterawang.',
        options: [
          { id: 'opt-21-1', text: 'Dilihat, Didengar, Dirasakan', is_correct: false, color: 'red' },
          { id: 'opt-21-2', text: 'Dilihat, Diraba, Diterawang', is_correct: true, color: 'blue' },
          { id: 'opt-21-3', text: 'Disimpan, Dilipat, Diremas', is_correct: false, color: 'yellow' },
          { id: 'opt-21-4', text: 'Dihitung, Difoto, Diarsip', is_correct: false, color: 'green' }
        ]
      },
      {
        id: 'q2-2',
        question_text: 'Berikut ini adalah bentuk perilaku "Cinta Rupiah" dalam merawat uang fisik, KECUALI:',
        time_limit_seconds: 15,
        points: 1000,
        explanation: 'Merawat Rupiah dilakukan dengan 5 Jangan: Jangan dilipat, Jangan dicoret, Jangan diremas, Jangan dibasahi, dan Jangan distapler.',
        options: [
          { id: 'opt-22-1', text: 'Tidak melipat uang Rupiah', is_correct: false, color: 'red' },
          { id: 'opt-22-2', text: 'Menyimpan uang secara rapi di dompet', is_correct: false, color: 'blue' },
          { id: 'opt-22-3', text: 'Mencoret-coret uang kertas dengan pulpen', is_correct: true, color: 'yellow' },
          { id: 'opt-22-4', text: 'Tidak menghekter/menstapler uang kertas', is_correct: false, color: 'green' }
        ]
      },
      {
        id: 'q2-3',
        question_text: 'Paham Rupiah ditunjukkan melalui perilaku bertransaksi bijak, yaitu:',
        time_limit_seconds: 15,
        points: 1000,
        explanation: 'Paham Rupiah mencakup bertransaksi bijak, berbelanja sesuai kebutuhan, serta rajin berinvestasi dan menabung.',
        options: [
          { id: 'opt-23-1', text: 'Berbelanja secara konsumtif berlebihan', is_correct: false, color: 'red' },
          { id: 'opt-23-2', text: 'Berbelanja sesuai kebutuhan dan berinvestasi', is_correct: true, color: 'blue' },
          { id: 'opt-23-3', text: 'Menolak transaksi pembayaran nontunai', is_correct: false, color: 'yellow' },
          { id: 'opt-23-4', text: 'Menimbun uang tunai dalam jumlah besar di rumah', is_correct: false, color: 'green' }
        ]
      },
      {
        id: 'q2-4',
        question_text: 'Sesuai UU Mata Uang No. 7 Tahun 2011, setiap transaksi pembayaran di wilayah NKRI wajib menggunakan:',
        time_limit_seconds: 15,
        points: 1000,
        explanation: 'Rupiah adalah satu-satunya alat pembayaran yang sah di seluruh wilayah NKRI.',
        options: [
          { id: 'opt-24-1', text: 'Mata uang Dolar AS (USD)', is_correct: false, color: 'red' },
          { id: 'opt-24-2', text: 'Mata uang Rupiah (IDR)', is_correct: true, color: 'blue' },
          { id: 'opt-24-3', text: 'Emas murni atau perak', is_correct: false, color: 'yellow' },
          { id: 'opt-24-4', text: 'Bebas menggunakan mata uang asing manapun', is_correct: false, color: 'green' }
        ]
      }
    ]
  },
  {
    id: 'quiz-bi-3',
    title: 'Kuis QRIS & Digital Payment BI',
    slug: 'qris-digital-payment',
    category: 'Sistem Pembayaran & QRIS',
    description: 'Uji wawasanmu tentang QRIS (Quick Response Code Indonesian Standard) dan transformasi pembayaran digital di Indonesia.',
    thumbnail: '/images/menu-cepat/3.png',
    mode: 'both',
    difficulty: 'Sedang',
    total_questions: 4,
    estimated_time_minutes: 4,
    play_count: 289,
    is_active: true,
    created_at: '2026-08-24',
    questions: [
      {
        id: 'q3-1',
        question_text: 'Apa slogan utama QRIS yang dicanangkan oleh Bank Indonesia?',
        time_limit_seconds: 15,
        points: 1000,
        explanation: 'Slogan QRIS: "Cepat, Murah, Mudah, Aman, dan Handal" (CEMUMUAH).',
        options: [
          { id: 'opt-31-1', text: 'Bayar Sekarang Nanti Gratis', is_correct: false, color: 'red' },
          { id: 'opt-31-2', text: 'Cepat, Murah, Mudah, Aman, dan Handal (CEMUMUAH)', is_correct: true, color: 'blue' },
          { id: 'opt-31-3', text: 'Satu Kode untuk Semua Bank Saja', is_correct: false, color: 'yellow' },
          { id: 'opt-31-4', text: 'Bebas Biaya Tanpa Batas', is_correct: false, color: 'green' }
        ]
      },
      {
        id: 'q3-2',
        question_text: 'Fitur QRIS TUNTAS memungkinkan pengguna untuk melakukan apa saja?',
        time_limit_seconds: 20,
        points: 1000,
        explanation: 'QRIS TUNTAS memfasilitasi 3 fungsi utama: Tarik Tunai, Transfer, dan Setor Tunai.',
        options: [
          { id: 'opt-32-1', text: 'Tarik Tunai, Transfer, dan Setor Tunai', is_correct: true, color: 'red' },
          { id: 'opt-32-2', text: 'Tukar Uang Asing secara gratis', is_correct: false, color: 'blue' },
          { id: 'opt-32-3', text: 'Pinjaman online tanpa agunan', is_correct: false, color: 'yellow' },
          { id: 'opt-32-4', text: 'Bayar tol tanpa kartu fisik saja', is_correct: false, color: 'green' }
        ]
      },
      {
        id: 'q3-3',
        question_text: 'Kapan QRIS resmi diluncurkan secara nasional oleh Bank Indonesia?',
        time_limit_seconds: 15,
        points: 1000,
        explanation: 'QRIS diluncurkan tepat pada Hari Kemerdekaan RI ke-74 pada 17 Agustus 2019.',
        options: [
          { id: 'opt-33-1', text: '17 Agustus 2019', is_correct: true, color: 'red' },
          { id: 'opt-33-2', text: '1 Januari 2020', is_correct: false, color: 'blue' },
          { id: 'opt-33-3', text: '17 Agustus 2021', is_correct: false, color: 'yellow' },
          { id: 'opt-33-4', text: '28 Oktober 2022', is_correct: false, color: 'green' }
        ]
      },
      {
        id: 'q3-4',
        question_text: 'Apa kepanjangan resmi dari singkatan QRIS?',
        time_limit_seconds: 15,
        points: 1000,
        explanation: 'QRIS adalah singkatan dari Quick Response Code Indonesian Standard.',
        options: [
          { id: 'opt-34-1', text: 'Quick Response Indonesian System', is_correct: false, color: 'red' },
          { id: 'opt-34-2', text: 'Quick Response Code Indonesian Standard', is_correct: true, color: 'blue' },
          { id: 'opt-34-3', text: 'Quality Rapid Indonesian Service', is_correct: false, color: 'yellow' },
          { id: 'opt-34-4', text: 'Quick Real-time Indonesian Settlement', is_correct: false, color: 'green' }
        ]
      }
    ]
  }
];

// Helper to calculate quiz score based on time & correctness
export function calculateQuestionScore(
  isCorrect: boolean,
  timeTakenSeconds: number,
  timeLimitSeconds: number,
  basePoints: number = 1000,
  streakCount: number = 0
): { points: number; bonus: number; total: number } {
  if (!isCorrect) return { points: 0, bonus: 0, total: 0 };

  const speedRatio = Math.max(0, (timeLimitSeconds - timeTakenSeconds) / timeLimitSeconds);
  const points = Math.round(basePoints * (0.5 + 0.5 * speedRatio));
  const bonus = streakCount > 1 ? Math.min(streakCount * 100, 500) : 0;

  return { points, bonus, total: points + bonus };
}

// Helper to generate 6-digit Game PIN
export function generateGamePin(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Preset Avatars for Players
export const PLAYER_AVATARS = [
  { id: 'avatar-1', label: 'Rupiah Star', icon: 'fa-solid fa-coins', color: 'bg-yellow-400 text-slate-900' },
  { id: 'avatar-2', label: 'BI Eagle', icon: 'fa-solid fa-feather-pointed', color: 'bg-sky-500 text-white' },
  { id: 'avatar-3', label: 'QRIS Hero', icon: 'fa-solid fa-qrcode', color: 'bg-red-500 text-white' },
  { id: 'avatar-4', label: 'Smart Scholar', icon: 'fa-solid fa-graduation-cap', color: 'bg-emerald-500 text-white' },
  { id: 'avatar-5', label: 'Coin Collector', icon: 'fa-solid fa-piggy-bank', color: 'bg-purple-500 text-white' },
  { id: 'avatar-6', label: 'Central Banker', icon: 'fa-solid fa-building-columns', color: 'bg-primary text-white' }
];

export interface QuizHistoryRecord {
  id: string;
  quiz_id?: string;
  quiz_title: string;
  nickname: string;
  avatar?: string;
  score: number;
  total_questions: number;
  correct_answers?: number;
  mode: 'solo' | 'multiplayer';
  date: string;
}

export const INITIAL_SCORE_HISTORY: QuizHistoryRecord[] = [
  {
    id: 'score-1',
    quiz_title: 'Kuis Kebanksentralan & Peran Bank Indonesia',
    nickname: 'Budi Pratama',
    avatar: 'fa-solid fa-graduation-cap',
    score: 4850,
    total_questions: 5,
    correct_answers: 5,
    mode: 'multiplayer',
    date: '2026-08-28'
  },
  {
    id: 'score-2',
    quiz_title: 'Kuis Cinta, Bangga, Paham (CBP) Rupiah',
    nickname: 'Siti Rahma',
    avatar: 'fa-solid fa-coins',
    score: 4300,
    total_questions: 4,
    correct_answers: 4,
    mode: 'solo',
    date: '2026-08-28'
  },
  {
    id: 'score-3',
    quiz_title: 'Kuis Edukasi QRIS & Sistem Pembayaran Digital',
    nickname: 'Muhammad Rizky',
    avatar: 'fa-solid fa-qrcode',
    score: 3850,
    total_questions: 4,
    correct_answers: 3,
    mode: 'multiplayer',
    date: '2026-08-27'
  },
  {
    id: 'score-4',
    quiz_title: 'Kuis Kebanksentralan & Peran Bank Indonesia',
    nickname: 'Andi Wijaya',
    avatar: 'fa-solid fa-feather-pointed',
    score: 3500,
    total_questions: 5,
    correct_answers: 4,
    mode: 'solo',
    date: '2026-08-27'
  },
  {
    id: 'score-5',
    quiz_title: 'Kuis Titik Temu Uang Logam & Kas Keliling',
    nickname: 'Dewi Lestari',
    avatar: 'fa-solid fa-piggy-bank',
    score: 3100,
    total_questions: 4,
    correct_answers: 3,
    mode: 'solo',
    date: '2026-08-26'
  }
];

export function getQuizScoresHistory(): QuizHistoryRecord[] {
  if (typeof window === 'undefined') return INITIAL_SCORE_HISTORY;
  try {
    const saved = localStorage.getItem('bi_quiz_scores_history');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Gagal memuat history kuis:', e);
  }
  return INITIAL_SCORE_HISTORY;
}

export function saveQuizScoreRecord(record: QuizHistoryRecord): QuizHistoryRecord[] {
  const current = getQuizScoresHistory();
  const updated = [record, ...current];
  try {
    localStorage.setItem('bi_quiz_scores_history', JSON.stringify(updated));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('quiz_scores_update'));

      // Asynchronously send to Laravel Backend Database
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
      fetch(`${apiUrl}/quiz-results`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          quiz_id: record.quiz_id,
          quiz_title: record.quiz_title,
          nickname: record.nickname,
          avatar: record.avatar,
          mode: record.mode,
          score: record.score,
          correct_answers: record.correct_answers || 0,
          total_questions: record.total_questions,
        })
      }).catch(err => console.log('Backend sync notice:', err));
    }
  } catch (e) {
    console.error('Gagal menyimpan record skor:', e);
  }
  return updated;
}

export function clearQuizScoresHistory(): void {
  try {
    localStorage.removeItem('bi_quiz_scores_history');
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('quiz_scores_update'));

      // Asynchronously clear from Backend DB
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
      fetch(`${apiUrl}/quiz-results`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
        }
      }).catch(err => console.log('Backend sync notice:', err));
    }
  } catch (e) {
    console.error('Gagal menghapus history skor:', e);
  }
}

export async function fetchQuizzesFromApi(): Promise<QuizItem[]> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
    const res = await fetch(`${apiUrl}/quizzes`, { cache: 'no-store' });
    if (res.ok) {
      const json = await res.json();
      if (json.status === 'success' && Array.isArray(json.data) && json.data.length > 0) {
        return json.data.map((q: any) => ({
          id: String(q.id),
          title: q.title,
          slug: q.title.toLowerCase().replace(/\s+/g, '-'),
          category: q.category || 'Kebanksentralan',
          description: q.description || '',
          thumbnail: q.icon || '/images/menu-cepat/1.png',
          mode: q.mode || 'both',
          difficulty: q.difficulty || 'Sedang',
          total_questions: q.questions ? q.questions.length : 4,
          estimated_time_minutes: q.estimated_time_minutes || 5,
          play_count: 100,
          is_active: Boolean(q.is_active),
          created_at: q.created_at || '2026-08-28',
          questions: (q.questions || []).map((quest: any) => ({
            id: String(quest.id),
            question_text: quest.question_text,
            time_limit_seconds: quest.time_limit_seconds || 15,
            points: 1000,
            explanation: quest.explanation || '',
            options: quest.options || []
          }))
        }));
      }
    }
  } catch (e) {
    console.warn('Fallback to INITIAL_QUIZZES:', e);
  }
  return INITIAL_QUIZZES;
}

export async function fetchScoresFromApi(): Promise<QuizHistoryRecord[]> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
    const res = await fetch(`${apiUrl}/quiz-results`, { cache: 'no-store' });
    if (res.ok) {
      const json = await res.json();
      if (json.status === 'success' && Array.isArray(json.data)) {
        return json.data.map((item: any) => ({
          id: String(item.id),
          quiz_id: String(item.quiz_id || ''),
          quiz_title: item.quiz_title,
          nickname: item.nickname,
          avatar: item.avatar || 'fa-solid fa-user-astronaut',
          score: item.score,
          total_questions: item.total_questions || 4,
          correct_answers: item.correct_answers || 0,
          mode: item.mode || 'solo',
          date: item.created_at ? item.created_at.substring(0, 10) : '2026-08-28'
        }));
      }
    }
  } catch (e) {
    console.warn('Fallback to local storage scores:', e);
  }
  return getQuizScoresHistory();
}
