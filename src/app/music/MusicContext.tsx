// src/app/music/MusicContext.tsx
// App-wide background music: a single <audio> element, MUTED by default. Plays
// through the playlist (seed tracks + admin uploads). Unmute is a user gesture,
// which also satisfies browser autoplay-with-sound policies.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { SEED_SONGS } from "./seed";
import { getUploadedSongs } from "./storage";
import type { Song } from "./types";

interface MusicContextValue {
  songs: Song[];
  current: Song | null;
  muted: boolean;
  playing: boolean;
  toggleMuted: () => void;
  next: () => void;
  refreshSongs: () => Promise<void>;
}

const MusicContext = createContext<MusicContextValue | null>(null);
const MUTE_KEY = "street-champz-music-muted";

export function MusicProvider({ children }: { children: ReactNode }) {
  const [songs, setSongs] = useState<Song[]>(SEED_SONGS);
  const [index, setIndex] = useState(0);
  const [muted, setMuted] = useState(true); // muted by default
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // restore the user's prior mute choice (still defaults to muted if unset)
  useEffect(() => {
    try {
      if (localStorage.getItem(MUTE_KEY) === "false") setMuted(false);
    } catch {
      /* ignore */
    }
  }, []);

  const refreshSongs = useCallback(async () => {
    const uploaded = await getUploadedSongs();
    setSongs([...SEED_SONGS, ...uploaded]);
  }, []);

  useEffect(() => {
    void refreshSongs();
  }, [refreshSongs]);

  // create the audio element once
  useEffect(() => {
    const audio = new Audio();
    audio.loop = false;
    audio.muted = true;
    audio.preload = "auto";
    audioRef.current = audio;
    const onEnded = () => setIndex((i) => (i + 1) % Math.max(1, songs.length));
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    return () => {
      audio.pause();
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // load current track when index/songs change
  const current = songs[index] ?? null;
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !current) return;
    if (audio.src !== current.url && !audio.src.endsWith(current.url)) {
      audio.src = current.url;
    }
    // attempt muted autoplay (allowed); ignore rejection
    audio.muted = muted;
    audio.play().catch(() => {});
  }, [current, muted]);

  const toggleMuted = useCallback(() => {
    setMuted((m) => {
      const nextMuted = !m;
      const audio = audioRef.current;
      if (audio) {
        audio.muted = nextMuted;
        // unmuting is a user gesture → safe to (re)start with sound
        if (!nextMuted) audio.play().catch(() => {});
      }
      try {
        localStorage.setItem(MUTE_KEY, String(nextMuted));
      } catch {
        /* ignore */
      }
      return nextMuted;
    });
  }, []);

  const next = useCallback(() => {
    setIndex((i) => (i + 1) % Math.max(1, songs.length));
  }, [songs.length]);

  const value = useMemo<MusicContextValue>(
    () => ({ songs, current, muted, playing, toggleMuted, next, refreshSongs }),
    [songs, current, muted, playing, toggleMuted, next, refreshSongs],
  );

  return <MusicContext.Provider value={value}>{children}</MusicContext.Provider>;
}

export function useMusic(): MusicContextValue {
  const ctx = useContext(MusicContext);
  if (!ctx) throw new Error("useMusic must be used within a MusicProvider");
  return ctx;
}
