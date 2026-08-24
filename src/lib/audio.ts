export type AudioTrack = "theme" | "water" | "boss";

export const AUDIO_TRACKS: Record<AudioTrack, string> = {
  theme: "/robloxeur-pixel-245147.mp3",
  water: "/water.mp3",
  boss: "/boss battle.mp3",
};

let currentTrack: AudioTrack = "theme";
let cut = false;
const listeners = new Set<() => void>();

export function getAudioTrack(): AudioTrack {
  return currentTrack;
}

export function isMusicCut(): boolean {
  return cut;
}

export function setAudioTrack(track: AudioTrack) {
  if (track === currentTrack) return;
  currentTrack = track;
  listeners.forEach((l) => l());
}

/** Mute/stop the music (used during the dive fall). */
export function setMusicCut(value: boolean) {
  if (cut === value) return;
  cut = value;
  listeners.forEach((l) => l());
}

export function subscribeAudioTrack(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Short procedural coin blip (no asset file needed). */
export function playCoinSound() {
  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    const now = ctx.currentTime;
    const notes = [880, 1318.5];
    notes.forEach((freq, i) => {
      const start = now + i * 0.07;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "square";
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.12, start + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.12);
      osc.connect(gain).connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.15);
    });
  } catch {
    /* ignore audio failures */
  }
}

/** Short procedural splash (used when diving into the water). */
export function playSplashSound() {
  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    const now = ctx.currentTime;
    const len = Math.floor(ctx.sampleRate * 0.35);
    const buffer = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < len; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / len);
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(1900, now);
    filter.frequency.exponentialRampToValueAtTime(380, now + 0.3);
    filter.Q.value = 1.2;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
    source.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    source.start(now);
  } catch {
    /* ignore audio failures */
  }
}

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    audioCtx = audioCtx ?? new AudioContext();
    if (audioCtx.state === "suspended") void audioCtx.resume();
    return audioCtx;
  } catch {
    return null;
  }
}

/** Short procedural explosion burst (no asset file needed). */
export function playKillSound() {
  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    const now = ctx.currentTime;
    const len = Math.floor(ctx.sampleRate * 0.5);
    const buffer = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < len; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2);
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(3200, now);
    filter.frequency.exponentialRampToValueAtTime(180, now + 0.5);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.8, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
    source.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    source.start(now);
  } catch {
    /* ignore audio failures */
  }
}
