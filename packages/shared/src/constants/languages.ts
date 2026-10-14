export interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
  badge: string;
}

export const AUDIO_LANGUAGES: LanguageOption[] = [
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', badge: 'HI-DUB' },
  { code: 'en', name: 'English', nativeName: 'English', badge: 'EN-DUB' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', badge: 'JA-ORIG' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', badge: 'TA-DUB' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', badge: 'TE-DUB' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', badge: 'ES-DUB' }
];

export const SUBTITLE_LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English Subtitles', nativeName: 'English', badge: 'EN-SUB' },
  { code: 'hi', name: 'Hindi Subtitles', nativeName: 'हिन्दी', badge: 'HI-SUB' },
  { code: 'ja', name: 'Japanese Closed Captions', nativeName: '日本語', badge: 'JA-CC' },
  { code: 'es', name: 'Spanish Subtitles', nativeName: 'Español', badge: 'ES-SUB' },
  { code: 'fr', name: 'French Subtitles', nativeName: 'Français', badge: 'FR-SUB' }
];

export const ANIME_GENRES = [
  'Action',
  'Adventure',
  'Comedy',
  'Drama',
  'Fantasy',
  'Isekai',
  'Mecha',
  'Mystery',
  'Psychological',
  'Romance',
  'Sci-Fi',
  'Shounen',
  'Slice of Life',
  'Sports',
  'Supernatural',
  'Thriller'
] as const;

export type GenreType = (typeof ANIME_GENRES)[number];
