// Live Room Multiplayer Synchronization & Database Persistence Utility
// Integrates Laravel API (quiz_sessions table) + BroadcastChannel & localStorage
import { LiveRoomSession, QuizItem } from './quizData';
import API_URL from './api';

const LIVE_SESSION_KEY = 'bi_quiz_active_live_session';
const CHANNEL_NAME = 'bi_quiz_live_channel';

// ──────────────────────────────────────────────
// BroadcastChannel (cross-tab sync)
// ──────────────────────────────────────────────
let broadcastChannel: BroadcastChannel | null = null;

function getBroadcastChannel(): BroadcastChannel | null {
  if (typeof window === 'undefined') return null;
  if (!broadcastChannel && 'BroadcastChannel' in window) {
    try {
      broadcastChannel = new BroadcastChannel(CHANNEL_NAME);
    } catch {
      broadcastChannel = null;
    }
  }
  return broadcastChannel;
}

// Listen for messages from other tabs
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    const ch = new BroadcastChannel(CHANNEL_NAME);
    ch.onmessage = (event) => {
      if (event.data && event.data.type === 'QUIZ_SESSION_SYNC') {
        const session = event.data.session as LiveRoomSession | null;
        try {
          if (session) {
            localStorage.setItem(LIVE_SESSION_KEY, JSON.stringify(session));
          } else {
            localStorage.removeItem(LIVE_SESSION_KEY);
          }
        } catch {}
        window.dispatchEvent(new CustomEvent('quiz_session_update', { detail: session }));
      }
    };
  } catch {}
}

// ──────────────────────────────────────────────
// Local Storage CRUD helpers
// ──────────────────────────────────────────────

export function getActiveLiveSession(): LiveRoomSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(LIVE_SESSION_KEY);
    return raw ? (JSON.parse(raw) as LiveRoomSession) : null;
  } catch {
    return null;
  }
}

export function setActiveLiveSession(session: LiveRoomSession | null): void {
  if (typeof window === 'undefined') return;
  try {
    if (session) {
      localStorage.setItem(LIVE_SESSION_KEY, JSON.stringify(session));
    } else {
      localStorage.removeItem(LIVE_SESSION_KEY);
    }
    window.dispatchEvent(new CustomEvent('quiz_session_update', { detail: session }));
    const ch = getBroadcastChannel();
    if (ch) {
      ch.postMessage({ type: 'QUIZ_SESSION_SYNC', session });
    }
  } catch (e) {
    console.error('Error saving live quiz session:', e);
  }
}

// ──────────────────────────────────────────────
// API Sync Helper (Database Polling)
// ──────────────────────────────────────────────

export async function syncActiveSessionFromApi(): Promise<LiveRoomSession | null> {
  try {
    const res = await fetch(`${API_URL}/quiz-sessions/active`, { cache: 'no-store' });
    if (res.ok) {
      const json = await res.json();
      if (json.status === 'success') {
        const serverSession = json.data as LiveRoomSession | null;
        const currentLocal = getActiveLiveSession();
        
        // Prevent infinite event loop: only update local state if session data actually changed
        if (JSON.stringify(serverSession) !== JSON.stringify(currentLocal)) {
          setActiveLiveSession(serverSession);
        }
        return serverSession;
      }
    }
  } catch (e) {
    // Silent catch for offline or local testing
  }
  return getActiveLiveSession();
}

// ──────────────────────────────────────────────
// Session Lifecycle (API + Database Persistence)
// ──────────────────────────────────────────────

/**
 * Host: Launch Live Room and save to quiz_sessions table in Database
 */
export function createLiveSession(quiz: QuizItem, pinCode: string, hostName = 'Edukator BI'): LiveRoomSession {
  try {
    localStorage.removeItem(LIVE_SESSION_KEY);
  } catch {}

  const session: LiveRoomSession = {
    pin_code: pinCode,
    quiz_id: String(quiz.id),
    quiz_title: quiz.title,
    status: 'waiting',
    current_question_index: 0,
    host_name: hostName,
    participants: [],
  };

  setActiveLiveSession(session);

  // Sync to Laravel API / DB asynchronously
  fetch(`${API_URL}/quiz-sessions/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({
      quiz_id: quiz.id,
      pin_code: pinCode,
      host_name: hostName,
    }),
  })
    .then((res) => res.json())
    .then((json) => {
      if (json.status === 'success' && json.data) {
        setActiveLiveSession(json.data);
      }
    })
    .catch((err) => console.warn('Could not sync room to DB server:', err));

  return session;
}

/**
 * Participant: Join a live session via PIN code (validated directly in DB quiz_sessions table)
 */
export async function joinLiveSession(
  pinCode: string,
  nickname: string,
  avatar: string
): Promise<{ success: boolean; message?: string; session?: LiveRoomSession }> {
  const cleanPin = pinCode.trim();
  const cleanNick = nickname.trim();

  if (!cleanPin || cleanPin.length < 6) {
    return { success: false, message: 'Masukkan 6-digit Game PIN yang valid!' };
  }
  if (!cleanNick) {
    return { success: false, message: 'Nickname tidak boleh kosong!' };
  }

  // Primary validation with 5s timeout: query Laravel API /quiz-sessions/join directly against database table
  const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
  const timeoutId = controller ? setTimeout(() => controller.abort(), 5000) : null;

  try {
    const res = await fetch(`${API_URL}/quiz-sessions/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        pin_code: cleanPin,
        nickname: cleanNick,
        avatar,
      }),
      signal: controller ? controller.signal : undefined,
    });

    if (timeoutId) clearTimeout(timeoutId);

    const json = await res.json();
    if (!res.ok || json.status === 'error') {
      return {
        success: false,
        message: json.message || 'Game PIN tidak valid/ditemukan di server atau Nickname sudah terpakai!',
      };
    }

    if (json.status === 'success' && json.data) {
      setActiveLiveSession(json.data);
      return { success: true, session: json.data };
    }
  } catch (err) {
    if (timeoutId) clearTimeout(timeoutId);
    console.warn('Backend API connection warning, attempting local fallback:', err);
  }

  // Offline / Local fallback
  let current = getActiveLiveSession();
  if (current) {
    if (current.pin_code.trim() !== cleanPin) {
      return {
        success: false,
        message: `PIN tidak valid! PIN yang aktif adalah ${current.pin_code}. Minta PIN yang benar dari Host.`,
      };
    }
    if (current.status === 'finished') {
      return { success: false, message: 'Sesi kuis ini sudah selesai. Minta Host untuk membuka sesi baru.' };
    }
    const duplicateIdx = current.participants.findIndex(
      (p) => p.nickname.toLowerCase().trim() === cleanNick.toLowerCase()
    );
    if (duplicateIdx !== -1) {
      return {
        success: false,
        message: `Nickname "${cleanNick}" sudah dipakai pemain lain di room ini! Gunakan nama berbeda.`,
      };
    }
  } else {
    current = {
      pin_code: cleanPin,
      quiz_id: '1',
      quiz_title: 'Kuis Interaktif BI',
      status: 'waiting',
      current_question_index: 0,
      host_name: 'Edukator BI',
      participants: [],
    };
  }

  // Add participant locally
  current.participants.push({
    id: `p-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    nickname: cleanNick,
    avatar,
    score: 0,
    streak: 0,
  });

  setActiveLiveSession(current);
  return { success: true, session: current };
}

/**
 * Host: Mark session as 'playing' in DB table
 */
export function startLiveSessionGame(): boolean {
  const current = getActiveLiveSession();
  if (!current) return false;

  current.status = 'playing';
  setActiveLiveSession(current);

  fetch(`${API_URL}/quiz-sessions/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({ pin_code: current.pin_code }),
  })
    .then((res) => res.json())
    .then((json) => {
      if (json.status === 'success' && json.data) {
        setActiveLiveSession(json.data);
      }
    })
    .catch((err) => console.warn('Could not sync start to DB server:', err));

  return true;
}

/**
 * Host: Close live session in DB table
 */
export function closeLiveSession(): void {
  const current = getActiveLiveSession();
  const pin = current ? current.pin_code : null;

  if (current) {
    const finished = { ...current, status: 'finished' as const };
    try {
      localStorage.setItem(LIVE_SESSION_KEY, JSON.stringify(finished));
    } catch {}
    const ch = getBroadcastChannel();
    if (ch) {
      ch.postMessage({ type: 'QUIZ_SESSION_SYNC', session: finished });
    }
    window.dispatchEvent(new CustomEvent('quiz_session_update', { detail: finished }));
  }

  try {
    localStorage.removeItem(LIVE_SESSION_KEY);
  } catch {}

  const ch = getBroadcastChannel();
  if (ch) {
    ch.postMessage({ type: 'QUIZ_SESSION_SYNC', session: null });
  }
  window.dispatchEvent(new CustomEvent('quiz_session_update', { detail: null }));

  // Post close to Laravel API
  fetch(`${API_URL}/quiz-sessions/close`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({ pin_code: pin }),
  }).catch(() => {});
}
