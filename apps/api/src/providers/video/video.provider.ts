export interface StreamSource {
  quality: 'auto' | '1080p' | '720p' | '480p' | '360p';
  format: 'HLS' | 'MP4' | 'DASH';
  url: string;
  isMaster?: boolean;
}

export interface StreamAudio {
  language: string; // 'hi', 'en', 'ja'
  label: string;
  isDefault: boolean;
  audioUrl?: string;
}

export interface StreamSubtitle {
  language: string;
  label: string;
  vttUrl: string;
  isDefault: boolean;
}

export interface PlaybackManifest {
  episodeId: string;
  provider: string;
  sources: StreamSource[];
  audioTracks: StreamAudio[];
  subtitleTracks: StreamSubtitle[];
  skipTimestamps?: {
    intro?: { start: number; end: number };
    outro?: { start: number; end: number };
  };
  expiresAt?: string;
  signedToken?: string;
  notice?: string;
}

export interface IVideoProvider {
  name: string;
  getPlaybackManifest(episodeId: string, clientIp?: string): Promise<PlaybackManifest>;
  generateSignedUrl(streamUrl: string, ttlSeconds?: number): Promise<string>;
  checkHealth(): Promise<{ status: 'healthy' | 'degraded' | 'down'; latencyMs: number }>;
}
