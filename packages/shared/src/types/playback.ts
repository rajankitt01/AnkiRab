import { EpisodeDto, AudioTrackDto, SubtitleTrackDto, VideoSourceDto } from './anime';

export interface PlaybackSessionDto {
  episode: EpisodeDto;
  anime: {
    id: string;
    slug: string;
    title: string;
    posterImage: string;
    hasHindiDub: boolean;
    hasEnglishDub: boolean;
  };
  sources: VideoSourceDto[];
  audioTracks: AudioTrackDto[];
  subtitleTracks: SubtitleTrackDto[];
  progressSeconds?: number;
  intro?: {
    start: number;
    end: number;
  };
  outro?: {
    start: number;
    end: number;
  };
  nextEpisode?: {
    id: string;
    episodeNumber: number;
    title: string;
    thumbnail?: string | null;
  } | null;
  prevEpisode?: {
    id: string;
    episodeNumber: number;
    title: string;
    thumbnail?: string | null;
  } | null;
  providerNotice?: string;
}

export interface ProgressUpdatePayload {
  progressSeconds: number;
  durationSeconds: number;
  completed?: boolean;
}

export interface ScheduleItemDto {
  id: string;
  animeId: string;
  episodeNumber: number;
  airDate: string; // ISO string
  dayOfWeek: number; // 0 = Sunday, 1 = Monday ... 6 = Saturday
  timeString: string; // e.g. "18:30"
  timezone: string; // "UTC" or "Asia/Kolkata"
  isReleased: boolean;
  anime: {
    id: string;
    slug: string;
    title: string;
    posterImage: string;
    hasHindiDub: boolean;
    hasEnglishDub: boolean;
    format: string;
  };
}
