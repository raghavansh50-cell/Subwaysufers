/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

class AudioEngine {
  private ctx: AudioContext | null = null;
  private musicInterval: any = null;
  private isMusicPlaying: boolean = false;
  private muted: boolean = false;
  private masterVolume: number = 0.3;

  private initContext() {
    if (!this.ctx) {
      // @ts-ignore
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setMuted(muted: boolean) {
    this.muted = muted;
    if (muted) {
      this.stopMusic();
    } else {
      this.startMusic();
    }
  }

  isMuted() {
    return this.muted;
  }

  playCoin() {
    if (this.muted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(987.77, now); // B5
    osc1.frequency.exponentialRampToValueAtTime(1318.51, now + 0.08); // E6

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1318.51, now);
    osc2.frequency.exponentialRampToValueAtTime(1975.53, now + 0.12); // B6

    gainNode.gain.setValueAtTime(this.masterVolume * 0.4, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(this.ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.16);
    osc2.stop(now + 0.16);
  }

  playJump() {
    if (this.muted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(600, now + 0.15);

    gainNode.gain.setValueAtTime(this.masterVolume * 0.6, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    osc.connect(gainNode);
    gainNode.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.2);
  }

  playSlide() {
    if (this.muted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * 0.25; // 0.25s duration
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    // Generate white noise
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1200, now);
    filter.frequency.exponentialRampToValueAtTime(150, now + 0.22);

    const gainNode = this.ctx.createGain();
    gainNode.gain.setValueAtTime(this.masterVolume * 0.5, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

    noise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.ctx.destination);

    noise.start(now);
    noise.stop(now + 0.26);
  }

  playCrash() {
    if (this.muted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    // White noise explosion
    const bufferSize = this.ctx.sampleRate * 0.4;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(300, now);
    filter.frequency.linearRampToValueAtTime(50, now + 0.35);

    const gainNode = this.ctx.createGain();
    gainNode.gain.setValueAtTime(this.masterVolume * 1.2, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

    // Low rumble frequency
    const osc = this.ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(80, now);
    osc.frequency.linearRampToValueAtTime(20, now + 0.35);

    const oscGain = this.ctx.createGain();
    oscGain.gain.setValueAtTime(this.masterVolume * 0.8, now);
    oscGain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

    noise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.ctx.destination);

    osc.connect(oscGain);
    oscGain.connect(this.ctx.destination);

    noise.start(now);
    osc.start(now);
    noise.stop(now + 0.4);
    osc.stop(now + 0.4);
  }

  playStumble() {
    if (this.muted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.linearRampToValueAtTime(80, now + 0.15);

    gainNode.gain.setValueAtTime(this.masterVolume * 0.5, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.18);

    osc.connect(gainNode);
    gainNode.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.18);
  }

  playPowerUp() {
    if (this.muted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.linearRampToValueAtTime(800, now + 0.3);

    const osc2 = this.ctx.createOscillator();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(300, now);
    osc2.frequency.linearRampToValueAtTime(1200, now + 0.3);

    gainNode.gain.setValueAtTime(this.masterVolume * 0.5, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

    osc.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(this.ctx.destination);

    osc.start(now);
    osc2.start(now);
    osc.stop(now + 0.35);
    osc2.stop(now + 0.35);
  }

  startMusic() {
    if (this.muted || this.isMusicPlaying) return;
    this.initContext();
    if (!this.ctx) return;

    this.isMusicPlaying = true;
    let step = 0;

    // Simple procedural sequencer playing a driving electronic baseline and drum tick
    const playSequencerStep = () => {
      if (!this.isMusicPlaying || !this.ctx || this.muted) return;

      const now = this.ctx.currentTime;

      // Drum kick on beats 0, 4, 8, 12 in 16 steps
      if (step % 4 === 0) {
        const osc = this.ctx.createOscillator();
        const gainNode = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(120, now);
        osc.frequency.exponentialRampToValueAtTime(0.01, now + 0.1);
        gainNode.gain.setValueAtTime(this.masterVolume * 0.7, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

        osc.connect(gainNode);
        gainNode.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.12);
      }

      // Snare-like noise tick on beats 2, 6, 10, 14
      if (step % 4 === 2) {
        const osc = this.ctx.createOscillator();
        const gainNode = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(250, now);
        gainNode.gain.setValueAtTime(this.masterVolume * 0.2, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

        osc.connect(gainNode);
        gainNode.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.05);
      }

      // Techno Bass notes loop
      const bassNotes = [55, 55, 65.41, 55, 73.42, 55, 65.41, 82.41, 55, 55, 65.41, 55, 73.42, 55, 82.41, 98.0];
      const noteFreq = bassNotes[step % bassNotes.length];

      const bassOsc = this.ctx.createOscillator();
      const bassGain = this.ctx.createGain();
      bassOsc.type = 'sawtooth';
      bassOsc.frequency.setValueAtTime(noteFreq, now);

      // Low pass filter to make it warmer
      const lpFilter = this.ctx.createBiquadFilter();
      lpFilter.type = 'lowpass';
      lpFilter.frequency.setValueAtTime(200, now);

      bassGain.gain.setValueAtTime(this.masterVolume * 0.22, now);
      bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      bassOsc.connect(lpFilter);
      lpFilter.connect(bassGain);
      bassGain.connect(this.ctx.destination);

      bassOsc.start(now);
      bassOsc.stop(now + 0.13);

      step++;
    };

    // 130 BPM -> 16th notes = 60 / 130 / 4 = 115.38 ms
    this.musicInterval = setInterval(playSequencerStep, 115);
  }

  stopMusic() {
    this.isMusicPlaying = false;
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
  }
}

export const audio = new AudioEngine();
