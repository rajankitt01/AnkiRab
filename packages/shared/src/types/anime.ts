export type AnimeFormat = 'TV' | 'MOVIE' | 'OVA' | 'ONA' | 'SPECIAL';
export type AnimeStatus = 'ONGOING' | 'COMPLETED' | 'UPCOMING';
export type UserRole = 'USER' | 'MODERATOR' | 'ADMIN';
export type WatchStatus = 'WATCHING' | 'COMPLETED' | 'ON_HOLD' | 'DROPPED' | 'PLAN_TO_WATCH';

export interface GenreDto {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
}

export interface AnimeAliasDto {
  id: string;
  title: string;
  type: string; // 'ROMAJI' | 'ENGLISH' | 'NATIVE' | 'SYNONYM'
}

export interface AudioTrackDto {
  id: string;
  language: string; // 'hi', 'en', 'ja', etc.
  label: string; // 'Hindi Dub', 'English Dub', 'Japanese (Original)'
  isDefault: boolean;
  audioUrl?: string | null;
}

export interface SubtitleTrackDto {
  id: string;
  language: string; // 'en', 'hi', etc.
  label: string; // 'English Subtitles', 'Hindi Subtitles'
  vttUrl: string;
  isDefault: boolean;
}

export interface VideoSourceDto {
  id: string;
  provider: string; // 'demo', 'authorized-cdn', etc.
  quality: string; // '1080p', '720p', '480p', 'auto'
  format: string; // 'HLS' | 'MP4'
  url: string;
  isMaster: boolean;
}

export interface EpisodeDto {
  id: string;
  seasonId: string;
  seasonNumber?: number;
  episodeNumber: number;
  title: string;
  synopsis?: string | null;
  thumbnail?: string | null;
  durationMinutes?: number | null;
  introStart?: number | null;
  introEnd?: number | null;
  outroStart?: number | null;
  outroEnd?: number | null;
  airDate?: string | null;
  videoSources: VideoSourceDto[];
  audioTracks: AudioTrackDto[];
  subtitleTracks: SubtitleTrackDto[];
}

export interface SeasonDto {
  id: string;
  animeId: string;
  seasonNumber: number;
  title: string;
  episodes?: EpisodeDto[];
  _count?: {
    episodes: number;
  };
}

export interface AnimeDto {
  id: string;
  slug: string;
  title: string;
  japaneseTitle?: string | null;
  englishTitle?: string | null;
  synopsis: string;
  posterImage: string;
  coverImage?: string | null;
  bannerImage?: string | null;
  format: AnimeFormat;
  status: AnimeStatus;
  releaseYear: number;
  rating?: number | null; // e.g. 8.7
  voteCount?: number;
  episodeCount?: number | null;
  durationMinutes?: number | null;
  studio?: string | null;
  isFeatured: boolean;
  isTrending: boolean;
  hasHindiDub: boolean;
  hasEnglishDub: boolean;
  hasSubtitles: boolean;
  genres: GenreDto[];
  aliases?: AnimeAliasDto[];
  seasons?: SeasonDto[];
  createdAt: string;
  updatedAt: string;
}

export interface AnimeFilterQuery {
  page?: number;
  limit?: number;
  search?: string;
  genre?: string;
  format?: AnimeFormat;
  status?: AnimeStatus;
  audioLang?: string; // 'hi', 'en', 'ja'
  subLang?: string; // 'en', 'hi'
  year?: number;
  minRating?: number;
  sortBy?: 'popularity' | 'latest' | 'alphabetical' | 'rating';
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}
