import { IVideoProvider, PlaybackManifest } from './video.provider';
import { prisma } from '../../config/db';
import { AppError } from '../../middleware/errorHandler';

export class AuthorizedHlsProvider implements IVideoProvider {
  name = 'AuthorizedHlsProvider';

  async getPlaybackManifest(episodeId: string): Promise<PlaybackManifest> {
    const episode = await prisma.episode.findUnique({
      where: { id: episodeId },
      include: {
        videoSources: true,
        audioTracks: true,
        subtitleTracks: true
      }
    });

    if (!episode) {
      throw new AppError('Episode not found', 404);
    }

    if (!episode.videoSources || episode.videoSources.length === 0) {
      throw new AppError('No licensed video stream available for this episode', 404);
    }

    return {
      episodeId: episode.id,
      provider: 'ANKIRAB Authorized CDN',
      sources: episode.videoSources.map(vs => ({
        quality: vs.quality as any,
        format: vs.format as any,
        url: vs.url,
        isMaster: vs.isMaster
      })),
      audioTracks: episode.audioTracks.map(at => ({
        language: at.language,
        label: at.label,
        isDefault: at.isDefault,
        audioUrl: at.audioUrl || undefined
      })),
      subtitleTracks: episode.subtitleTracks.map(st => ({
        language: st.language,
        label: st.label,
        vttUrl: st.vttUrl,
        isDefault: st.isDefault
      })),
      skipTimestamps: {
        intro: episode.introStart != null && episode.introEnd != null
          ? { start: episode.introStart, end: episode.introEnd }
          : undefined,
        outro: episode.outroStart != null && episode.outroEnd != null
          ? { start: episode.outroStart, end: episode.outroEnd }
          : undefined
      }
    };
  }

  async generateSignedUrl(streamUrl: string): Promise<string> {
    return streamUrl;
  }

  async checkHealth(): Promise<{ status: 'healthy' | 'degraded' | 'down'; latencyMs: number }> {
    return { status: 'healthy', latencyMs: 12 };
  }
}
