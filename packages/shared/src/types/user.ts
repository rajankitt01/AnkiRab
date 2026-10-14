import { UserRole, WatchStatus } from './anime';

export interface UserDto {
  id: string;
  email: string;
  username: string;
  displayName: string;
  avatarUrl?: string | null;
  role: UserRole;
  preferredAudio: string;
  preferredSubtitle: string;
  autoPlayNext: boolean;
  autoSkipIntro: boolean;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: UserDto;
  accessToken: string;
  refreshToken?: string;
}

export interface WatchlistItemDto {
  id: string;
  userId: string;
  animeId: string;
  status: WatchStatus;
  rating?: number | null;
  anime: {
    id: string;
    slug: string;
    title: string;
    posterImage: string;
    format: string;
    status: string;
    releaseYear: number;
    rating?: number | null;
    hasHindiDub: boolean;
    hasEnglishDub: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export interface WatchHistoryItemDto {
  id: string;
  userId: string;
  animeId: string;
  episodeId: string;
  progressSeconds: number;
  durationSeconds: number;
  completed: boolean;
  lastWatchedAt: string;
  anime: {
    id: string;
    slug: string;
    title: string;
    posterImage: string;
    bannerImage?: string | null;
  };
  episode: {
    id: string;
    episodeNumber: number;
    title: string;
    thumbnail?: string | null;
    seasonId: string;
  };
}
