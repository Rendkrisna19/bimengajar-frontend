// Live Room Multiplayer Synchronization & State Persistence Utility
import { LiveRoomSession, QuizItem } from './quizData';

const LIVE_SESSION_KEY = 'bi_quiz_active_live_session';

let broadcastChannel: BroadcastChannel | null = null;
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    broadcastChannel = new BroadcastChannel('bi_quiz_live_channel');
    broadcastChannel.onmessage = (event) => {
      if (event.data && event.data.type === 'QUIZ_SESSION_SYNC') {
        const session = event.data.session;
        if (session) {
          localStorage.setItem(LIVE_SESSION_KEY, JSON.stringify(session));
        } else {
          localStorage.removeItem(LIVE_SESSION_KEY);
        }
        window.dispatchEvent(new CustomEvent('quiz_session_update', { detail: session }));
      }
    };
  } catch (e) {
    console.warn('BroadcastChannel not supported or failed to initialize:', e);
  }
}

export function getActiveLiveSession(): LiveRoomSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(LIVE_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.error('Error reading live quiz session:', e);
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
    if (broadcastChannel) {
      broadcastChannel.postMessage({ type: 'QUIZ_SESSION_SYNC', session });
    }
  } catch (e) {
    console.error('Error saving live quiz session:', e);
  }
}

export function createLiveSession(quiz: QuizItem, pinCode: string, hostName = 'Edukator BI'): LiveRoomSession {
  const session: LiveRoomSession = {
    pin_code: pinCode,
    quiz_id: quiz.id,
    quiz_title: quiz.title,
    status: 'waiting',
    current_question_index: 0,
    host_name: hostName,
    participants: []
  };
  setActiveLiveSession(session);
  return session;
}

export function joinLiveSession(pinCode: string, nickname: string, avatar: string): { success: boolean; message?: string; session?: LiveRoomSession } {
  let current = getActiveLiveSession();
  const cleanPin = pinCode.trim();

  if (!cleanPin) {
    return {
      success: false,
      message: 'Silakan masukkan 6-digit Game PIN yang valid!'
    };
  }

  if (!current) {
    current = {
      pin_code: cleanPin,
      quiz_id: '1',
      quiz_title: 'Kuis Interaktif BI',
      status: 'waiting',
      current_question_index: 0,
      host_name: 'Edukator BI',
      participants: []
    };
  } else {
    current.pin_code = cleanPin;
    if (current.status === 'finished') {
      current.status = 'waiting';
    }
  }

  // Add participant to list if not already present
  const existingIdx = current.participants.findIndex(p => p.nickname.toLowerCase() === nickname.trim().toLowerCase());
  if (existingIdx === -1) {
    current.participants.push({
      id: `p-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      nickname: nickname.trim(),
      avatar,
      score: 0,
      streak: 0
    });
  } else {
    current.participants[existingIdx].avatar = avatar;
  }

  setActiveLiveSession(current);
  return { success: true, session: current };
}

export function startLiveSessionGame(pinCode?: string): boolean {
  let current = getActiveLiveSession();
  if (current) {
    current.status = 'playing';
    setActiveLiveSession(current);
    return true;
  }
  return false;
}

export function closeLiveSession(): void {
  const current = getActiveLiveSession();
  if (current) {
    current.status = 'finished';
    setActiveLiveSession(current);
  }
  setActiveLiveSession(null);
}
