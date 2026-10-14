import { prisma } from '../../config/db';
import { AppError } from '../../middleware/errorHandler';
import { DemoVideoProvider } from '../../providers/video/demo.provider';
import { AuthorizedHlsProvider } from '../../providers/video/hls.provider';
import { IVideoProvider } from '../../providers/video/video.provider';
import { PlaybackSessionDto, PlaybackServerDto, ProgressUpdatePayload } from '@ankirab/shared';

import { env } from '../../config/env';

export const ANIME_TMDB_MAP: Record<
  string,
  {
    tmdbId: number;
    malId: number;
    isMovie?: boolean;
    seasonMalIds?: Record<number, number>;
  }
> = {
  'solo-leveling': {
    tmdbId: 125940,
    malId: 52299,
    seasonMalIds: {
      1: 52299,
      2: 58567
    }
  },
  'demon-slayer': {
    tmdbId: 85937,
    malId: 38000,
    seasonMalIds: {
      1: 38000,
      2: 49776,
      3: 51019,
      4: 55701
    }
  },
  'jujutsu-kaisen': {
    tmdbId: 95479,
    malId: 40748,
    seasonMalIds: {
      1: 40748,
      2: 51009
    }
  },
  'attack-on-titan': {
    tmdbId: 1429,
    malId: 16498,
    seasonMalIds: {
      1: 16498,
      2: 25777,
      3: 35760,
      4: 40028
    }
  },
  'frieren-beyond-journeys-end': {
    tmdbId: 209867,
    malId: 52991
  },
  'spy-x-family': {
    tmdbId: 120089,
    malId: 50265,
    seasonMalIds: {
      1: 50265,
      2: 53887
    }
  },
  'chainsaw-man': {
    tmdbId: 114410,
    malId: 44511,
    seasonMalIds: {
      1: 44511,
      2: 57574
    }
  },
  'one-piece': {
    tmdbId: 37854,
    malId: 21
  },
  'bleach-thousand-year-blood-war': {
    tmdbId: 30984,
    malId: 41467,
    seasonMalIds: {
      1: 41467,
      2: 53998,
      3: 56784
    }
  },
  'naruto': {
    tmdbId: 46260,
    malId: 20
  },
  'naruto-shippuden': {
    tmdbId: 31910,
    malId: 1735
  },
  'death-note': {
    tmdbId: 13916,
    malId: 1535
  },
  'your-name': {
    tmdbId: 372058,
    malId: 32281,
    isMovie: true
  }
};

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
    const seasonNumber = episode.season.seasonNumber || 1;
    const episodeNumber = episode.episodeNumber || 1;
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

    // Build real anime series streaming servers
    const baseUrl = env.API_BASE_URL || 'http://localhost:4000';
    const tmdbInfo = ANIME_TMDB_MAP[anime.slug];
    const malId = tmdbInfo?.malId || 20;
    const tmdbId = tmdbInfo?.tmdbId || 31910;

    // Calculate cumulative episode number for continuous long-running anime (Naruto, Shippuden, One Piece)
    const precedingEpisodesCount = await prisma.episode.count({
      where: {
        season: {
          animeId: anime.id,
          seasonNumber: { lt: seasonNumber }
        }
      }
    });
    const cumulativeEpisodeNumber = precedingEpisodesCount + episodeNumber;

    // Resolve target MAL ID and episode number for VidLink
    const hasSeasonSpecificMal = Boolean(tmdbInfo?.seasonMalIds?.[seasonNumber]);
    const seasonMalId = tmdbInfo?.seasonMalIds?.[seasonNumber] || malId;
    const targetEpisodeNumber = hasSeasonSpecificMal ? episodeNumber : cumulativeEpisodeNumber;

    const servers: PlaybackServerDto[] = [];

    // Server 1: Extracted Real Hindi Dubbed Stream API (ToonStream / Hindi Anime VIP)
    servers.push({
      id: 'ankirab-hindi-stream',
      name: 'Server 1: 🇮🇳 ⚡ AnkiRab Hindi Dub (हिंदी डब VIP)',
      badge: 'Hindi Dub VIP',
      type: 'embed',
      url: `${baseUrl}/api/hindi/player?episodeId=${episode.id}&slug=${anime.slug}&season=${seasonNumber}&ep=${episodeNumber}`,
      isDefault: true
    });

    // Server 2: VidLink Real Anime Stream (Multi-Dub: Hindi / English / Japanese)
    if (malId) {
      servers.push({
        id: 'vidlink-anime',
        name: 'Server 2: ⚡ VidLink Anime HD (Dual Audio Dub/Sub)',
        badge: 'Multi-Dub HD',
        type: 'embed',
        url: `https://vidlink.pro/anime/${seasonMalId}/${targetEpisodeNumber}/dub?fallback=true&primaryColor=8b5cf6`
      });
    }

    // Server 3, 4, 5: Real Series Stream Engines (VidSrc, 2Embed, EmbedSu)
    if (tmdbInfo) {
      if (tmdbInfo.isMovie) {
        servers.push({
          id: 'vidsrc',
          name: 'Server 3: 🎬 VidSrc Cinema HD',
          badge: 'Fast VIP',
          type: 'embed',
          url: `https://vidsrc.sh/embed/movie?tmdb=${tmdbId}`
        });
        servers.push({
          id: '2embed',
          name: 'Server 4: 🌐 2Embed Ultra Mirror',
          badge: 'Mirror',
          type: 'embed',
          url: `https://2embed.cc/embed/${tmdbId}`
        });
        servers.push({
          id: 'embedsu',
          name: 'Server 5: 🍿 EmbedSu Stream Cloud',
          badge: 'Fast CDN',
          type: 'embed',
          url: `https://embed.su/embed/movie/${tmdbId}`
        });
      } else {
        servers.push({
          id: 'vidsrc',
          name: 'Server 3: 🎬 VidSrc Cinema HD',
          badge: 'Fast VIP',
          type: 'embed',
          url: `https://vidsrc.sh/embed/tv?tmdb=${tmdbId}&season=${seasonNumber}&episode=${episodeNumber}`
        });
        servers.push({
          id: '2embed',
          name: 'Server 4: 🌐 2Embed Ultra Mirror',
          badge: 'Mirror',
          type: 'embed',
          url: `https://2embed.cc/embedtv/${tmdbId}&s=${seasonNumber}&e=${episodeNumber}`
        });
        servers.push({
          id: 'embedsu',
          name: 'Server 5: 🍿 EmbedSu Stream Cloud',
          badge: 'Fast CDN',
          type: 'embed',
          url: `https://embed.su/embed/tv/${tmdbId}/${seasonNumber}/${episodeNumber}`
        });
      }
    }

    // Server 6: Direct Multi-Audio HLS Core Stream
    servers.push({
      id: 'ankirab-hls',
      name: 'Server 6: 📺 AnkiRab Core Player (Direct HLS)',
      badge: 'HLS Master',
      type: 'hls',
      url: `${baseUrl}/api/video/hls/${episode.id}/master.m3u8?lang=hi`
    });

    const multiAudioSources = [
      {
        id: `${episode.id}-hls-hi`,
        provider: 'ANKIRAB Multi-Audio Master',
        quality: 'auto',
        format: 'HLS',
        url: `${baseUrl}/api/video/hls/${episode.id}/master.m3u8?lang=hi`,
        isMaster: true
      },
      {
        id: `${episode.id}-stream-hi`,
        provider: 'ANKIRAB Direct Hindi Dub',
        quality: '1080p',
        format: 'MP4',
        url: `${baseUrl}/api/video/stream/${episode.id}?lang=hi`,
        isMaster: false
      },
      {
        id: `${episode.id}-stream-en`,
        provider: 'ANKIRAB Direct English Dub',
        quality: '1080p',
        format: 'MP4',
        url: `${baseUrl}/api/video/stream/${episode.id}?lang=en`,
        isMaster: false
      },
      {
        id: `${episode.id}-stream-ja`,
        provider: 'ANKIRAB Direct Japanese Sub',
        quality: '1080p',
        format: 'MP4',
        url: `${baseUrl}/api/video/stream/${episode.id}?lang=ja`,
        isMaster: false
      }
    ];

    const audioTracks = [
      {
        id: 'hi',
        language: 'hi',
        label: 'Hindi Dubbed (हिंदी डब)',
        isDefault: true,
        audioUrl: `${baseUrl}/api/video/stream/${episode.id}?lang=hi`
      },
      {
        id: 'en',
        language: 'en',
        label: 'English Dubbed',
        isDefault: false,
        audioUrl: `${baseUrl}/api/video/stream/${episode.id}?lang=en`
      },
      {
        id: 'ja',
        language: 'ja',
        label: 'Japanese (Original Audio)',
        isDefault: false,
        audioUrl: `${baseUrl}/api/video/stream/${episode.id}?lang=ja`
      }
    ];

    const subtitleTracks = [
      {
        id: 'en',
        language: 'en',
        label: 'English Subtitles',
        vttUrl: `${baseUrl}/api/subtitles/english.vtt`,
        isDefault: true
      },
      {
        id: 'hi',
        language: 'hi',
        label: 'Hindi Subtitles (हिंदी)',
        vttUrl: `${baseUrl}/api/subtitles/hindi.vtt`,
        isDefault: false
      }
    ];

    return {
      episode: {
        id: episode.id,
        seasonId: episode.seasonId,
        seasonNumber,
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
        videoSources: multiAudioSources,
        audioTracks,
        subtitleTracks
      },
      anime: {
        id: anime.id,
        slug: anime.slug,
        title: anime.title,
        posterImage: anime.posterImage,
        hasHindiDub: anime.hasHindiDub,
        hasEnglishDub: anime.hasEnglishDub,
        tmdbId: tmdbInfo?.tmdbId
      },
      sources: multiAudioSources,
      servers,
      realStreamUrl: servers[0]?.url,
      audioTracks,
      subtitleTracks,
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
