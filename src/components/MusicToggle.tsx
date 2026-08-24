import { useCallback, useEffect, useRef, useState } from "react";
import {
  AUDIO_TRACKS,
  getAudioTrack,
  isMusicCut,
  subscribeAudioTrack,
  type AudioTrack,
} from "@/lib/audio";

const TRACKS: AudioTrack[] = ["theme", "water", "boss"];

export function MusicToggle() {
  const [enabled, setEnabled] = useState(false);
  const enabledRef = useRef(false);
  const themeRef = useRef<HTMLAudioElement>(null);
  const waterRef = useRef<HTMLAudioElement>(null);
  const bossRef = useRef<HTMLAudioElement>(null);

  // Each track has its own <audio>; only the active one plays, the rest are paused.
  const syncAudio = useCallback(() => {
    const track = getAudioTrack();
    const wantPlay = enabledRef.current && !isMusicCut();
    const refs = [themeRef, waterRef, bossRef] as const;
    TRACKS.forEach((key, i) => {
      const audio = refs[i]?.current;
      if (!audio) return;
      if (key === track && wantPlay) {
        audio.volume = 0.6;
        audio.loop = true;
        void audio.play().catch(() => {});
      } else {
        audio.pause();
      }
    });
  }, []);

  useEffect(() => {
    syncAudio();
    return subscribeAudioTrack(syncAudio);
  }, [syncAudio]);

  const toggle = () => {
    enabledRef.current = !enabledRef.current;
    setEnabled(enabledRef.current);
    syncAudio();
  };

  return (
    <>
      <audio ref={themeRef} src={AUDIO_TRACKS.theme} loop preload="none" />
      <audio ref={waterRef} src={AUDIO_TRACKS.water} loop preload="none" />
      <audio ref={bossRef} src={AUDIO_TRACKS.boss} loop preload="none" />
      <button
        type="button"
        onClick={toggle}
        aria-pressed={enabled}
        aria-label={enabled ? "Mute pixel vibe music" : "Play pixel vibe music"}
        className="pixel-btn fixed bottom-4 left-4 z-50 bg-secondary px-3 py-3 text-sm text-foreground"
        title={enabled ? "Mute music" : "Play music"}
      >
        {enabled ? "♪ ON" : "♪ OFF"}
      </button>
    </>
  );
}
