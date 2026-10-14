import { create } from 'zustand';

interface PlayerState {
  audioLanguage: string; // 'hi', 'en', 'ja'
  subtitleLanguage: string; // 'en', 'hi', 'none'
  subtitlesEnabled: boolean;
  volume: number;
  isMuted: boolean;
  playbackRate: number;
  quality: string;
  autoPlayNext: boolean;
  autoSkipIntro: boolean;
  setAudioLanguage: (lang: string) => void;
  setSubtitleLanguage: (lang: string) => void;
  setSubtitlesEnabled: (enabled: boolean) => void;
  setVolume: (vol: number) => void;
  setIsMuted: (muted: boolean) => void;
  setPlaybackRate: (rate: number) => void;
  setQuality: (quality: string) => void;
  setAutoPlayNext: (val: boolean) => void;
  setAutoSkipIntro: (val: boolean) => void;
}

export const usePlayerStore = create<PlayerState>((set) => ({
  audioLanguage: localStorage.getItem('ankirab_pref_audio') || 'hi',
  subtitleLanguage: localStorage.getItem('ankirab_pref_sub') || 'en',
  subtitlesEnabled: true,
  volume: parseFloat(localStorage.getItem('ankirab_volume') || '0.8'),
  isMuted: false,
  playbackRate: 1,
  quality: 'auto',
  autoPlayNext: localStorage.getItem('ankirab_autoplay_next') !== 'false',
  autoSkipIntro: localStorage.getItem('ankirab_skip_intro') === 'true',

  setAudioLanguage: (lang: string) => {
    localStorage.setItem('ankirab_pref_audio', lang);
    set({ audioLanguage: lang });
  },

  setSubtitleLanguage: (lang: string) => {
    localStorage.setItem('ankirab_pref_sub', lang);
    set({ subtitleLanguage: lang, subtitlesEnabled: lang !== 'none' });
  },

  setSubtitlesEnabled: (enabled: boolean) => set({ subtitlesEnabled: enabled }),

  setVolume: (vol: number) => {
    localStorage.setItem('ankirab_volume', String(vol));
    set({ volume: vol, isMuted: vol === 0 });
  },

  setIsMuted: (muted: boolean) => set({ isMuted: muted }),
  setPlaybackRate: (rate: number) => set({ playbackRate: rate }),
  setQuality: (quality: string) => set({ quality }),
  setAutoPlayNext: (val: boolean) => {
    localStorage.setItem('ankirab_autoplay_next', String(val));
    set({ autoPlayNext: val });
  },
  setAutoSkipIntro: (val: boolean) => {
    localStorage.setItem('ankirab_skip_intro', String(val));
    set({ autoSkipIntro: val });
  }
}));
