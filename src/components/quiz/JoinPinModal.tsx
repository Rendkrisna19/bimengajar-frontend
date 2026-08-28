'use client';

import React, { useState, useEffect } from 'react';
import { PLAYER_AVATARS } from '@/lib/quizData';
import { getActiveLiveSession } from '@/lib/quizLiveSession';

interface JoinPinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJoin: (pinCode: string, nickname: string, avatarId: string) => void;
}

export default function JoinPinModal({ isOpen, onClose, onJoin }: JoinPinModalProps) {
  const [pinCode, setPinCode] = useState('');
  const [nickname, setNickname] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(PLAYER_AVATARS[0].id);
  const [activeSessionPin, setActiveSessionPin] = useState<string | null>(null);

  useEffect(() => {
    const session = getActiveLiveSession();
    if (session && session.pin_code) {
      setActiveSessionPin(session.pin_code);
      setPinCode(session.pin_code);
    }
  }, []);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pinCode.trim() || pinCode.length < 6) {
      alert('Masukkan 6-Digit Game PIN yang valid!');
      return;
    }
    if (!nickname.trim()) {
      alert('Silakan isi nama / nickname Anda!');
      return;
    }
    onJoin(pinCode.trim(), nickname.trim(), selectedAvatar);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 sm:p-8 text-white shadow-2xl space-y-6 relative overflow-hidden">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
        >
          <i className="fa-solid fa-xmark text-sm"></i>
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-gradient-to-tr from-sky-500 to-primary text-white rounded-2xl flex items-center justify-center text-3xl mx-auto shadow-lg border border-sky-400/30">
            <i className="fa-solid fa-[#0054a7] fa-gamepad"></i>
          </div>
          <h3 className="text-2xl font-black text-white tracking-tight">Gabung Live Game Kuis</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Masukkan 6-Digit Game PIN yang dibagikan oleh Edukator BI / Host Live Room.
          </p>
          {activeSessionPin && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 text-emerald-300 text-[11px] font-bold rounded-full border border-emerald-500/30 animate-pulse">
              <i className="fa-solid fa-circle-check"></i> Live Room Aktif Ditemukan: <strong>{activeSessionPin}</strong>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Game PIN Input */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
              6-Digit Game PIN <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              maxLength={6}
              value={pinCode}
              onChange={(e) => setPinCode(e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="Contoh: 839201"
              className="w-full text-center tracking-[0.3em] font-black text-2xl py-3 px-4 bg-slate-800/90 border border-slate-700 rounded-2xl text-yellow-400 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
            />
          </div>

          {/* Nickname Input */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
              Nama / Nickname Peserta <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              maxLength={20}
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="Masukkan nama / alias kamu..."
              className="w-full py-3 px-4 bg-slate-800/90 border border-slate-700 rounded-2xl text-sm font-bold text-slate-100 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
            />
          </div>

          {/* Avatar Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-2 uppercase tracking-wider">
              Pilih Avatar Karakter BI:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {PLAYER_AVATARS.map((av) => {
                const isSelected = selectedAvatar === av.id;
                return (
                  <button
                    key={av.id}
                    type="button"
                    onClick={() => setSelectedAvatar(av.id)}
                    className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-yellow-400 bg-yellow-400/10 text-yellow-400 font-bold shadow-md'
                        : 'border-slate-800 bg-slate-800/50 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg ${av.color} flex items-center justify-center text-sm shadow-xs`}>
                      <i className={av.icon}></i>
                    </div>
                    <span className="text-[10px] truncate max-w-full font-semibold">{av.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-primary hover:bg-sky-600 text-white font-black text-sm rounded-2xl transition-all shadow-xl flex items-center justify-center gap-2 cursor-pointer border-b-4 border-yellow-400 active:border-b-0 active:translate-y-0.5"
          >
            <span>Gabung ke Live Room</span>
            <i className="fa-solid fa-arrow-right"></i>
          </button>
        </form>
      </div>
    </div>
  );
}
