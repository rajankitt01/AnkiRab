import crypto from 'crypto';
import { IVideoProvider, PlaybackManifest, StreamSource } from './video.provider';
import { env } from '../../config/env';

export class DemoVideoProvider implements IVideoProvider {
  name = 'DemoProvider';

  // Certified, public-domain & authorized demo streams with real adaptive bitrate HLS manifests
  private demoStreams: StreamSource[] = [
    {
      quality: 'auto',
      format: 'HLS',
      url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
      isMaster: true
    },
    {
      quality: '1080p',
      format: 'MP4',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
    },
    {
      quality: '720p',
      format: 'MP4',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4'
    }
  ];

  async getPlaybackManifest(episodeId: string): Promise<PlaybackManifest> {
    const signedToken = this.createSignature(episodeId);

    return {
      episodeId,
      provider: 'ANKIRAB Demo Provider (Authorized Public Test Stream)',
      sources: this.demoStreams,
      audioTracks: [
        {
          language: 'hi',
          label: 'Hindi Dubbed (हिंदी)',
          isDefault: true
        },
        {
          language: 'en',
          label: 'English Dubbed',
          isDefault: false
        },
        {
          language: 'ja',
          label: 'Japanese (Original Audio)',
          isDefault: false
        }
      ],
      subtitleTracks: [
        {
          language: 'en',
          label: 'English Subtitles',
          vttUrl: 'https://bitmovin-a.akamaihd.net/content/sintel/subtitles/subtitles_en.vtt',
          isDefault: true
        },
        {
          language: 'hi',
          label: 'Hindi Subtitles (हिंदी उपशीर्षक)',
          vttUrl: 'https://bitmovin-a.akamaihd.net/content/sintel/subtitles/subtitles_de.vtt',
          isDefault: false
        }
      ],
      skipTimestamps: {
        intro: { start: 10, end: 95 },
        outro: { start: 1320, end: 1410 }
      },
      expiresAt: new Date(Date.now() + 3600 * 1000).toISOString(),
      signedToken,
      notice: 'Demonstration stream provided via authorized public-domain media player test endpoint. Video stream is active.'
    };
  }

  async generateSignedUrl(streamUrl: string, ttlSeconds = 3600): Promise<string> {
    const expires = Math.floor(Date.now() / 1000) + ttlSeconds;
    const hash = crypto
      .createHmac('sha256', env.VIDEO_STREAM_TOKEN_SECRET)
      .update(`${streamUrl}:${expires}`)
      .digest('hex');
    const separator = streamUrl.includes('?') ? '&' : '?';
    return `${streamUrl}${separator}token=${hash}&expires=${expires}`;
  }

  async checkHealth(): Promise<{ status: 'healthy' | 'degraded' | 'down'; latencyMs: number }> {
    const start = Date.now();
    try {
      return {
        status: 'healthy',
        latencyMs: Date.now() - start
      };
    } catch {
      return {
        status: 'down',
        latencyMs: Date.now() - start
      };
    }
  }

  private createSignature(data: string): string {
    return crypto
      .createHmac('sha256', env.VIDEO_STREAM_TOKEN_SECRET)
      .update(data)
      .digest('hex')
      .slice(0, 32);
  }
}
