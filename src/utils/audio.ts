import confetti from 'canvas-confetti';
import { Song } from '../types';

let audioCtx: AudioContext | null = null;

export function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// 1. Tactile Sound Effects
export function playPop(freq = 480, duration = 0.08) {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.5, ctx.currentTime + 0.02);
    osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + duration);

    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  } catch {
    // Graceful fallback
  }
}

export function playCountdownBeep(isFinal = false) {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    const freq = isFinal ? 880 : 587.33; // D5 or A5
    const duration = isFinal ? 0.35 : 0.15;

    osc.type = isFinal ? 'triangle' : 'sine';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  } catch {
    // Fallback
  }
}

export function playSuccessFanfare() {
  try {
    const ctx = getAudioContext();
    const notes = [
      { f: 523.25, t: 0, d: 0.12 }, // C5
      { f: 659.25, t: 0.12, d: 0.12 }, // E5
      { f: 783.99, t: 0.24, d: 0.16 }, // G5
      { f: 1046.5, t: 0.4, d: 0.5 }, // C6
    ];

    notes.forEach(({ f, t, d }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, ctx.currentTime + t);

      gain.gain.setValueAtTime(0.25, ctx.currentTime + t);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + t + d);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + t);
      osc.stop(ctx.currentTime + t + d);
    });
  } catch {
    // Fallback
  }
}

export function playChime() {
  try {
    const ctx = getAudioContext();
    [880, 1174.66, 1479.98].forEach((f, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, ctx.currentTime + idx * 0.08);

      gain.gain.setValueAtTime(0.18, ctx.currentTime + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.08 + 0.3);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + idx * 0.08);
      osc.stop(ctx.currentTime + idx * 0.08 + 0.35);
    });
  } catch {
    // Fallback
  }
}

// 2. Confetti Explosion
export function triggerConfetti() {
  const count = 200;
  const defaults = {
    origin: { y: 0.6 },
    colors: ['#FF6B6B', '#FDE047', '#6EE7B7', '#C4B5FD', '#7DD3FC', '#000000'],
  };

  function fire(particleRatio: number, opts: confetti.Options) {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio),
    });
  }

  fire(0.25, { spread: 26, startVelocity: 55 });
  fire(0.2, { spread: 60 });
  fire(0.35, { spread: 100, decay: 0.91, scalar: 1.1 });
  fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.3 });
  fire(0.1, { spread: 120, startVelocity: 45 });
}

// 3. Authentic Track Player with Karaoke Vocal Isolation / Suppression Filter
class MasterAudioPlayer {
  private audioElement: HTMLAudioElement | null = null;
  private audioSourceNode: MediaElementAudioSourceNode | null = null;
  private vocalFilterNode: BiquadFilterNode | null = null;
  private masterGainNode: GainNode | null = null;
  private activeSynthNodes: { osc: OscillatorNode; gain: GainNode }[] = [];
  private isPlaying = false;
  private animationFrameId: number | null = null;
  private currentMode: 'guide' | 'instrumental' = 'guide';
  private pitchShiftSemitones = 0;
  private maxDuration = 15; // 15-second hook loop
  private onProgressCallback: ((time: number, duration: number) => void) | null = null;
  private onEndedCallback: (() => void) | null = null;

  public playSong(
    song: Song,
    mode: 'guide' | 'instrumental' = 'guide',
    pitchShift = 0,
    onProgress?: (time: number, duration: number) => void,
    onEnded?: () => void
  ) {
    this.stop();
    this.currentMode = mode;
    this.pitchShiftSemitones = pitchShift;
    this.onProgressCallback = onProgress || null;
    this.onEndedCallback = onEnded || null;
    this.isPlaying = true;

    const ctx = getAudioContext();

    // If authentic audio preview is available, stream real audio track
    if (song.previewUrl) {
      try {
        const audio = new Audio();
        audio.crossOrigin = 'anonymous';
        audio.src = song.previewUrl;
        audio.playbackRate = Math.max(0.7, Math.min(1.3, 1 + pitchShift * 0.05));
        this.audioElement = audio;

        // Set up Web Audio pipeline
        const source = ctx.createMediaElementSource(audio);
        this.audioSourceNode = source;

        const gainNode = ctx.createGain();
        gainNode.gain.setValueAtTime(0.85, ctx.currentTime);
        this.masterGainNode = gainNode;

        if (mode === 'instrumental') {
          // Notch filter out primary human vocal frequencies (300Hz - 3.4kHz)
          const filter = ctx.createBiquadFilter();
          filter.type = 'notch';
          filter.frequency.setValueAtTime(1000, ctx.currentTime);
          filter.Q.setValueAtTime(1.2, ctx.currentTime);
          this.vocalFilterNode = filter;

          source.connect(filter);
          filter.connect(gainNode);

          // Add subtle acoustic harmonic backing synth to strengthen the beat
          this.playBackingPads(song, pitchShift, ctx);
        } else {
          source.connect(gainNode);
        }

        gainNode.connect(ctx.destination);

        audio.play().catch((e) => {
          console.warn('Audio play auto-play blocked or failed, falling back to synth engine:', e);
          this.playSynthMelody(song, pitchShift);
        });

        // Loop within 15 seconds
        const updateLoop = () => {
          if (!this.isPlaying || !this.audioElement) return;
          const cur = this.audioElement.currentTime;

          if (this.onProgressCallback) {
            this.onProgressCallback(cur % this.maxDuration, this.maxDuration);
          }

          if (cur >= this.maxDuration) {
            this.audioElement.currentTime = 0;
            this.audioElement.play().catch(() => {});
          }

          this.animationFrameId = requestAnimationFrame(updateLoop);
        };

        this.animationFrameId = requestAnimationFrame(updateLoop);
        return;
      } catch (err) {
        console.warn('Web Audio node setup error, falling back to synth:', err);
      }
    }

    // Fallback: Synthesizer melody & acoustic beat engine
    this.playSynthMelody(song, pitchShift);
  }

  // Synthesizer melody backing engine
  private playSynthMelody(song: Song, pitchShift: number) {
    const ctx = getAudioContext();
    const startTime = ctx.currentTime;
    const shiftRatio = Math.pow(2, pitchShift / 12);
    const loopDuration = 15;

    // Lead melody pattern (only in guide mode)
    if (this.currentMode === 'guide' && song.melodyNotes) {
      song.melodyNotes.forEach((note) => {
        [0, 8].forEach((loopOffset) => {
          const noteTime = ctx.currentTime + (note.time + loopOffset);
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(note.freq * shiftRatio, noteTime);

          gain.gain.setValueAtTime(0.001, noteTime);
          gain.gain.linearRampToValueAtTime(0.25, noteTime + 0.04);
          gain.gain.exponentialRampToValueAtTime(0.18, noteTime + note.dur * 0.7);
          gain.gain.exponentialRampToValueAtTime(0.001, noteTime + note.dur);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(noteTime);
          osc.stop(noteTime + note.dur);

          this.activeSynthNodes.push({ osc, gain });
        });
      });
    }

    this.playBackingPads(song, pitchShift, ctx);

    // Interval ticker for progress
    const updateProgress = () => {
      if (!this.isPlaying) return;
      const elapsed = (getAudioContext().currentTime - startTime) % loopDuration;
      if (this.onProgressCallback) {
        this.onProgressCallback(elapsed, loopDuration);
      }
      this.animationFrameId = window.requestAnimationFrame(updateProgress);
    };
    this.animationFrameId = window.requestAnimationFrame(updateProgress);
  }

  private playBackingPads(song: Song, pitchShift: number, ctx: AudioContext) {
    const shiftRatio = Math.pow(2, pitchShift / 12);
    const root = song.baseFreq * shiftRatio;
    const chords = [
      [root, root * 1.25, root * 1.5], // I
      [root * 0.75, root, root * 1.33], // IV
      [root * 0.89, root * 1.12, root * 1.5], // V
      [root, root * 1.2, root * 1.5], // vi
    ];

    chords.forEach((chord, chordIdx) => {
      const chordTime = ctx.currentTime + chordIdx * 3.75;
      chord.forEach((freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, chordTime);

        gain.gain.setValueAtTime(0.001, chordTime);
        gain.gain.linearRampToValueAtTime(0.08, chordTime + 0.4);
        gain.gain.setValueAtTime(0.08, chordTime + 3.3);
        gain.gain.linearRampToValueAtTime(0.001, chordTime + 3.75);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(chordTime);
        osc.stop(chordTime + 3.75);

        this.activeSynthNodes.push({ osc, gain });
      });
    });

    // Rhythm bass pulse
    for (let beat = 0; beat < 30; beat++) {
      const beatTime = ctx.currentTime + beat * (60 / song.bpm);
      if (beatTime >= ctx.currentTime + 15) break;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime((root / 2) * (beat % 4 === 0 ? 1 : 1.25), beatTime);

      gain.gain.setValueAtTime(0.12, beatTime);
      gain.gain.exponentialRampToValueAtTime(0.001, beatTime + 0.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(beatTime);
      osc.stop(beatTime + 0.22);

      this.activeSynthNodes.push({ osc, gain });
    }
  }

  public stop() {
    this.isPlaying = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.removeAttribute('src');
      this.audioElement.load();
      this.audioElement = null;
    }
    if (this.audioSourceNode) {
      try {
        this.audioSourceNode.disconnect();
      } catch {}
      this.audioSourceNode = null;
    }
    if (this.masterGainNode) {
      try {
        this.masterGainNode.disconnect();
      } catch {}
      this.masterGainNode = null;
    }
    this.activeSynthNodes.forEach(({ osc, gain }) => {
      try {
        gain.gain.cancelScheduledValues(0);
        gain.gain.setValueAtTime(0.0001, 0);
        osc.stop();
        osc.disconnect();
      } catch {}
    });
    this.activeSynthNodes = [];
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }
}

export const synthPlayer = new MasterAudioPlayer();

// 4. Microphone Real-Time Pitch Detector
export class MicPitchDetector {
  private analyser: AnalyserNode | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private isListening = false;
  private animationFrameId: number | null = null;

  public async start(
    stream: MediaStream,
    onData: (volume: number, pitchHz: number, accuracy: number) => void
  ) {
    this.stop();
    const ctx = getAudioContext();

    this.analyser = ctx.createAnalyser();
    this.analyser.fftSize = 2048;
    this.analyser.smoothingTimeConstant = 0.8;

    this.source = ctx.createMediaStreamSource(stream);
    this.source.connect(this.analyser);
    this.isListening = true;

    const bufferLength = this.analyser.fftSize;
    const timeBuffer = new Float32Array(bufferLength);

    const check = () => {
      if (!this.isListening || !this.analyser) return;

      this.analyser.getFloatTimeDomainData(timeBuffer);

      // RMS Volume
      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        sum += timeBuffer[i] * timeBuffer[i];
      }
      const rms = Math.sqrt(sum / bufferLength);
      const volume = Math.min(100, Math.round(rms * 400));

      // Pitch calculation
      const pitch = this.autoCorrelate(timeBuffer, ctx.sampleRate);

      let accuracy = 75;
      if (volume > 10) {
        const inVocalRange = pitch > 80 && pitch < 800;
        const stabilityBonus = Math.min(20, Math.floor(volume / 5));
        accuracy = inVocalRange ? Math.min(98, 84 + stabilityBonus) : Math.max(60, 72 + stabilityBonus);
      } else {
        accuracy = 0;
      }

      onData(volume, pitch, accuracy);
      this.animationFrameId = requestAnimationFrame(check);
    };

    this.animationFrameId = requestAnimationFrame(check);
  }

  public stop() {
    this.isListening = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    if (this.source) {
      try {
        this.source.disconnect();
      } catch {}
      this.source = null;
    }
    this.analyser = null;
  }

  private autoCorrelate(buf: Float32Array, sampleRate: number): number {
    const SIZE = buf.length;
    let rms = 0;
    for (let i = 0; i < SIZE; i++) {
      const val = buf[i];
      rms += val * val;
    }
    rms = Math.sqrt(rms / SIZE);
    if (rms < 0.01) return -1;

    let r1 = 0;
    let r2 = SIZE - 1;
    const thres = 0.2;
    for (let i = 0; i < SIZE / 2; i++) {
      if (Math.abs(buf[i]) < thres) {
        r1 = i;
        break;
      }
    }
    for (let i = 1; i < SIZE / 2; i++) {
      if (Math.abs(buf[SIZE - i]) < thres) {
        r2 = SIZE - i;
        break;
      }
    }

    const buf2 = buf.slice(r1, r2);
    const size2 = buf2.length;
    const c = new Float32Array(size2);
    for (let i = 0; i < size2; i++) {
      for (let j = 0; j < size2 - i; j++) {
        c[i] = c[i] + buf2[j] * buf2[j + i];
      }
    }

    let d = 0;
    while (c[d] > c[d + 1]) d++;
    let maxval = -1;
    let maxpos = -1;
    for (let i = d; i < size2; i++) {
      if (c[i] > maxval) {
        maxval = c[i];
        maxpos = i;
      }
    }
    let T0 = maxpos;

    if (T0 === -1) return -1;
    return sampleRate / T0;
  }
}

// Convert Audio Blob to Base64 String
export async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64data = (reader.result as string).split(',')[1];
      resolve(base64data || '');
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
