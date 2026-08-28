// Royalty-Free Quiz Audio Manager & Web Audio Synthesizer

export const BGM_TRACKS = [
  {
    id: 'upbeat',
    title: '🎵 Upbeat Quiz Lounge',
    url: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=game-music-7408.mp3'
  },
  {
    id: 'energetic',
    title: '⚡ Energetic Competition',
    url: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a816bf.mp3?filename=fun-quiz-10874.mp3'
  },
  {
    id: 'chill',
    title: '☕ Soft Educational Study',
    url: 'https://cdn.pixabay.com/download/audio/2021/08/09/audio_845377f809.mp3?filename=lively-meadow-11231.mp3'
  }
];

class QuizAudioManager {
  private bgmAudio: HTMLAudioElement | null = null;
  private isMuted: boolean = false;
  private currentBgmId: string = 'upbeat';

  constructor() {
    if (typeof window !== 'undefined') {
      this.bgmAudio = new Audio();
      this.bgmAudio.loop = true;
      this.bgmAudio.volume = 0.35;
    }
  }

  public playBGM(trackId?: string) {
    if (typeof window === 'undefined' || this.isMuted) return;
    try {
      const selectedTrack = BGM_TRACKS.find(t => t.id === (trackId || this.currentBgmId)) || BGM_TRACKS[0];
      this.currentBgmId = selectedTrack.id;
      if (this.bgmAudio) {
        this.bgmAudio.src = selectedTrack.url;
        this.bgmAudio.play().catch(() => {
          // Auto-play policy handling
        });
      }
    } catch (e) {
      console.warn('Audio play error:', e);
    }
  }

  public stopBGM() {
    if (this.bgmAudio) {
      this.bgmAudio.pause();
      this.bgmAudio.currentTime = 0;
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.stopBGM();
    } else {
      this.playBGM();
    }
    return this.isMuted;
  }

  public getMutedState(): boolean {
    return this.isMuted;
  }

  // Web Audio Synth Sound Effects (Zero External Asset Failures)
  public playCorrectSound() {
    if (this.isMuted || typeof window === 'undefined') return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const now = ctx.currentTime;

      // Note 1 (E5)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(659.25, now);
      gain1.gain.setValueAtTime(0.3, now);
      gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.2);

      // Note 2 (G#5)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(830.61, now + 0.1);
      gain2.gain.setValueAtTime(0.4, now + 0.1);
      gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.1);
      osc2.stop(now + 0.4);

      // Note 3 (B5 - High chime)
      const osc3 = ctx.createOscillator();
      const gain3 = ctx.createGain();
      osc3.type = 'sine';
      osc3.frequency.setValueAtTime(987.77, now + 0.2);
      gain3.gain.setValueAtTime(0.5, now + 0.2);
      gain3.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      osc3.connect(gain3);
      gain3.connect(ctx.destination);
      osc3.start(now + 0.2);
      osc3.stop(now + 0.6);
    } catch (e) {
      // Fallback
    }
  }

  public playWrongSound() {
    if (this.isMuted || typeof window === 'undefined') return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now); // A3
      osc.frequency.linearRampToValueAtTime(130, now + 0.3); // Buzz down
      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.35);
    } catch (e) {
      // Fallback
    }
  }

  public playTickSound() {
    if (this.isMuted || typeof window === 'undefined') return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.05);
    } catch (e) {
      // Fallback
    }
  }

  public playVictoryFanfare() {
    if (this.isMuted || typeof window === 'undefined') return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const now = ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6

      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const startTime = now + idx * 0.12;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, startTime);
        gain.gain.setValueAtTime(0.3, startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.4);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + 0.4);
      });
    } catch (e) {
      // Fallback
    }
  }
}

export const quizAudio = new QuizAudioManager();
