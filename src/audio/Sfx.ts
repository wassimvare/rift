import type { PlayerSettings } from '../types/state.js';

type SoundId = 'dash' | 'pulsePush' | 'pulsePull' | 'hit' | 'perfect' | 'burst' | 'goal' | 'toggle';

export class Sfx {
  private context: AudioContext | null = null;

  constructor(private readonly settings: () => PlayerSettings) {}

  vibrate(ms = 20): void {
    if (this.settings().haptics && navigator.vibrate) navigator.vibrate(ms);
  }

  play(id: SoundId): void {
    if (!this.settings().audio) return;
    try {
      this.context ??= new AudioContext();
      if (this.context.state === 'suspended') void this.context.resume();
      const map: Record<SoundId, [number, number, OscillatorType, number]> = {
        dash: [170, 0.06, 'sawtooth', 0.035],
        pulsePush: [310, 0.09, 'sine', 0.035],
        pulsePull: [190, 0.11, 'triangle', 0.04],
        hit: [115, 0.045, 'square', 0.025],
        perfect: [520, 0.12, 'sawtooth', 0.05],
        burst: [80, 0.22, 'sawtooth', 0.06],
        goal: [410, 0.22, 'triangle', 0.055],
        toggle: [250, 0.045, 'sine', 0.025],
      };
      const [freq, duration, wave, peak] = map[id];
      const now = this.context.currentTime;
      const oscillator = this.context.createOscillator();
      const gain = this.context.createGain();
      oscillator.type = wave;
      oscillator.frequency.setValueAtTime(freq, now);
      if (id === 'burst') oscillator.frequency.exponentialRampToValueAtTime(45, now + duration);
      else if (id === 'perfect' || id === 'goal') {
        oscillator.frequency.exponentialRampToValueAtTime(freq * 1.7, now + duration);
      }
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(peak, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
      oscillator.connect(gain).connect(this.context.destination);
      oscillator.start(now);
      oscillator.stop(now + duration + 0.02);
    } catch (error) {
      void error;
    }
  }
}
