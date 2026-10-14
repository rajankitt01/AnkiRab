import { prisma } from '../../config/db';
import { AppError } from '../../middleware/errorHandler';
import { DemoVideoProvider } from '../../providers/video/demo.provider';
import { AuthorizedHlsProvider } from '../../providers/video/hls.provider';
import { IVideoProvider } from '../../providers/video/video.provider';
import { PlaybackSessionDto, ProgressUpdatePayload } from '@ankirab/shared';

export class EpisodeService {
  private demoProvider = new DemoVideoProvider();
  private hlsProvider = new AuthorizedHlsProvider();

  async getEpisodeById(episodeId: string) {
    const episode = await prisma.episode.findUnique({
      where: { id: episodeId },
      include: {
        season: {
          include: {
            anime: true
          }
        },
        audioTracks: true,
        subtitleTracks: true,
        videoSources: true
      }
    });

    if (!episode) {
      throw new AppError('Episode not found', 404);
    }

    return episode;
  }

  async getPlaybackSession(episodeId: string, userId?: string): Promise<PlaybackSessionDto> {
    const episode = await prisma.episode.findUnique({
      where: { id: episodeId },
      include: {
        season: {
          include: {
            anime: true,
            episodes: {
              orderBy: { episodeNumber: 'asc' },
              select: {
                id: true,
                episodeNumber: true,
                title: true,
                thumbnail: true
              }
            }
          }
        },
        audioTracks: true,
        subtitleTracks: true,
        videoSources: true
      }
    });

    if (!episode) {
      throw new AppError('Episode not found', 404);
    }

    const { anime } = episode.season;
    const allEpisodes = episode.season.episodes;
    const currentIndex = allEpisodes.findIndex(e => e.id === episodeId);

    const prevEpisode = currentIndex > 0 ? allEpisodes[currentIndex - 1] : null;
    const nextEpisode = currentIndex < allEpisodes.length - 1 ? allEpisodes[currentIndex + 1] : null;

    // Determine provider: If episode has local video sources, use AuthorizedHlsProvider, else DemoProvider
    let provider: IVideoProvider = this.demoProvider;
    if (episode.videoSources && episode.videoSources.length > 0) {
      provider = this.hlsProvider;
    }

    const manifest = await provider.getPlaybackManifest(episode.id);

    // Fetch user progress if authenticated
    let progressSeconds = 0;
    if (userId) {
      const history = await prisma.watchHistory.findUnique({
        where: {
          userId_episodeId: {
            userId,
            episodeId
          }
        }
      });
      if (history) {
        progressSeconds = history.progressSeconds;
      }
    }

    return {
      episode: {
        id: episode.id,
        seasonId: episode.seasonId,
        episodeNumber: episode.episodeNumber,
        title: episode.title,
        synopsis: episode.synopsis,
        thumbnail: episode.thumbnail,
        durationMinutes: episode.durationMinutes,
        introStart: episode.introStart,
        introEnd: episode.introEnd,
        outroStart: episode.outroStart,
        outroEnd: episode.outroEnd,
        airDate: episode.airDate ? episode.airDate.toISOString() : null,
        videoSources: manifest.sources.map(s => ({
          id: s.url,
          provider: manifest.provider,
          quality: s.quality,
          format: s.format,
          url: s.url,
          isMaster: !!s.isMaster
        })),
        audioTracks: manifest.audioTracks.map(a => ({
          id: a.language,
          language: a.language,
          label: a.label,
          isDefault: a.isDefault,
          audioUrl: a.audioUrl
        })),
        subtitleTracks: manifest.subtitleTracks.map(s => ({
          id: s.language,
          language: s.language,
          label: s.label,
          vttUrl: s.vttUrl,
          isDefault: s.isDefault
        }))
      },
      anime: {
        id: anime.id,
        slug: anime.slug,
        title: anime.title,
        posterImage: anime.posterImage,
        hasHindiDub: anime.hasHindiDub,
        hasEnglishDub: anime.hasEnglishDub
      },
      sources: manifest.sources.map(s => ({
        id: s.url,
        provider: manifest.provider,
        quality: s.quality,
        format: s.format,
        url: s.url,
        isMaster: !!s.isMaster
      })),
      audioTracks: manifest.audioTracks.map(a => ({
        id: a.language,
        language: a.language,
        label: a.label,
        isDefault: a.isDefault,
        audioUrl: a.audioUrl
      })),
      subtitleTracks: manifest.subtitleTracks.map(s => ({
        id: s.language,
        language: s.language,
        label: s.label,
        vttUrl: s.vttUrl,
        isDefault: s.isDefault
      })),
      progressSeconds,
      intro: manifest.skipTimestamps?.intro,
      outro: manifest.skipTimestamps?.outro,
      nextEpisode,
      prevEpisode,
      providerNotice: manifest.notice
    };
  }

  async saveProgress(episodeId: string, userId: string, payload: ProgressUpdatePayload) {
    const episode = await prisma.episode.findUnique({
      where: { id: episodeId },
      select: { animeId: true, episodeNumber: true }
    });

    if (!episode) {
      throw new AppError('Episode not found', 404);
    }

    const completed =
      payload.completed ||
      (payload.durationSeconds > 0 && payload.progressSeconds / payload.durationSeconds > 0.88);

    const record = await prisma.watchHistory.upsert({
      where: {
        userId_episodeId: {
          userId,
          episodeId
        }
      },
      create: {
        userId,
        animeId: episode.animeId,
        episodeId,
        progressSeconds: payload.progressSeconds,
        durationSeconds: payload.durationSeconds,
        completed,
        lastWatchedAt: new Date()
      },
      update: {
        progressSeconds: payload.progressSeconds,
        durationSeconds: payload.durationSeconds,
        completed,
        lastWatchedAt: new Date()
      }
    });

    // Also update UserAnimeStatus currentEpisode & status
    await prisma.userAnimeStatus.upsert({
      where: {
        userId_animeId: {
          userId,
          animeId: episode.animeId
        }
      },
      create: {
        userId,
        animeId: episode.animeId,
        status: completed ? 'WATCHING' : 'WATCHING',
        currentEpisode: episode.episodeNumber
      },
      update: {
        currentEpisode: episode.episodeNumber,
        status: 'WATCHING'
      }
    });

    return record;
  }
}
