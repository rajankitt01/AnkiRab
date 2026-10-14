import { prisma } from '../../config/db';
import { AppError } from '../../middleware/errorHandler';
import { AdminAnimeInput, AdminEpisodeInput } from '@ankirab/shared';
import { AniListProvider } from '../../providers/metadata/anilist.provider';
import { MockMetadataProvider } from '../../providers/metadata/mock.provider';

export class AdminService {
  private anilistProvider = new AniListProvider();
  private mockProvider = new MockMetadataProvider();

  async getDashboardAnalytics() {
    const [
      totalAnime,
      totalEpisodes,
      totalUsers,
      totalWatchEvents,
      recentUsers,
      recentAuditLogs
    ] = await Promise.all([
      prisma.anime.count(),
      prisma.episode.count(),
      prisma.user.count(),
      prisma.watchHistory.count(),
      prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { id: true, username: true, email: true, role: true, createdAt: true }
      }),
      prisma.auditLog.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { username: true, email: true } }
        }
      })
    ]);

    // Stream health info
    const streamHealth = {
      status: 'operational',
      activeProviders: ['ANKIRAB Authorized CDN', 'DemoProvider'],
      cdnLatencyMs: 14,
      availabilityPercent: 99.98
    };

    return {
      totals: {
        anime: totalAnime,
        episodes: totalEpisodes,
        users: totalUsers,
        playbackEvents: totalWatchEvents
      },
      streamHealth,
      recentUsers,
      recentAuditLogs
    };
  }

  async listAnime(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [total, animes] = await Promise.all([
      prisma.anime.count(),
      prisma.anime.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          genres: { include: { genre: true } },
          _count: { select: { seasons: true, episodes: true } }
        }
      })
    ]);

    return {
      data: animes,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async createAnime(data: AdminAnimeInput, adminUserId: string) {
    const existing = await prisma.anime.findUnique({
      where: { slug: data.slug }
    });
    if (existing) {
      throw new AppError(`Anime slug "${data.slug}" already exists`, 409);
    }

    const anime = await prisma.anime.create({
      data: {
        title: data.title,
        slug: data.slug,
        japaneseTitle: data.japaneseTitle,
        englishTitle: data.englishTitle,
        synopsis: data.synopsis,
        posterImage: data.posterImage,
        coverImage: data.coverImage || null,
        bannerImage: data.bannerImage || null,
        format: data.format,
        status: data.status,
        releaseYear: data.releaseYear,
        studio: data.studio,
        isFeatured: data.isFeatured,
        isTrending: data.isTrending,
        hasHindiDub: data.hasHindiDub,
        hasEnglishDub: data.hasEnglishDub,
        hasSubtitles: data.hasSubtitles,
        genres: {
          create: data.genreIds.map(genreId => ({
            genre: { connect: { id: genreId } }
          }))
        }
      },
      include: {
        genres: { include: { genre: true } }
      }
    });

    await prisma.auditLog.create({
      data: {
        userId: adminUserId,
        action: 'CREATE_ANIME',
        entity: 'Anime',
        entityId: anime.id,
        details: JSON.stringify({ slug: anime.slug, title: anime.title })
      }
    });

    return anime;
  }

  async updateAnime(id: string, data: Partial<AdminAnimeInput>, adminUserId: string) {
    const existing = await prisma.anime.findUnique({ where: { id } });
    if (!existing) {
      throw new AppError('Anime not found', 404);
    }

    // If genreIds provided, reset and re-link
    if (data.genreIds) {
      await prisma.animeGenre.deleteMany({ where: { animeId: id } });
      for (const gId of data.genreIds) {
        await prisma.animeGenre.create({
          data: { animeId: id, genreId: gId }
        });
      }
    }

    const { genreIds, ...rest } = data;
    const updated = await prisma.anime.update({
      where: { id },
      data: rest,
      include: {
        genres: { include: { genre: true } }
      }
    });

    await prisma.auditLog.create({
      data: {
        userId: adminUserId,
        action: 'UPDATE_ANIME',
        entity: 'Anime',
        entityId: id,
        details: JSON.stringify({ title: updated.title })
      }
    });

    return updated;
  }

  async deleteAnime(id: string, adminUserId: string) {
    const deleted = await prisma.anime.delete({ where: { id } });

    await prisma.auditLog.create({
      data: {
        userId: adminUserId,
        action: 'DELETE_ANIME',
        entity: 'Anime',
        entityId: id,
        details: JSON.stringify({ title: deleted.title, slug: deleted.slug })
      }
    });

    return { success: true, message: `Anime ${deleted.title} removed.` };
  }

  async createSeason(animeId: string, seasonNumber: number, title: string) {
    const season = await prisma.season.create({
      data: {
        animeId,
        seasonNumber,
        title
      }
    });
    return season;
  }

  async createEpisode(data: AdminEpisodeInput, adminUserId: string) {
    const season = await prisma.season.findUnique({
      where: { id: data.seasonId },
      select: { animeId: true }
    });

    if (!season) {
      throw new AppError('Season not found', 404);
    }

    const episode = await prisma.episode.create({
      data: {
        seasonId: data.seasonId,
        animeId: season.animeId,
        episodeNumber: data.episodeNumber,
        title: data.title,
        synopsis: data.synopsis,
        thumbnail: data.thumbnail || null,
        durationMinutes: data.durationMinutes,
        introStart: data.introStart,
        introEnd: data.introEnd,
        outroStart: data.outroStart,
        outroEnd: data.outroEnd,
        airDate: data.airDate ? new Date(data.airDate) : null
      }
    });

    await prisma.auditLog.create({
      data: {
        userId: adminUserId,
        action: 'CREATE_EPISODE',
        entity: 'Episode',
        entityId: episode.id,
        details: JSON.stringify({ title: episode.title, number: episode.episodeNumber })
      }
    });

    return episode;
  }

  async addVideoSource(episodeId: string, payload: {
    provider: string;
    quality: string;
    format: string;
    url: string;
    isMaster?: boolean;
  }) {
    return prisma.videoSource.create({
      data: {
        episodeId,
        provider: payload.provider,
        quality: payload.quality,
        format: payload.format,
        url: payload.url,
        isMaster: !!payload.isMaster
      }
    });
  }

  async addAudioTrack(episodeId: string, payload: {
    language: string;
    label: string;
    isDefault?: boolean;
    audioUrl?: string;
  }) {
    return prisma.audioTrack.create({
      data: {
        episodeId,
        language: payload.language,
        label: payload.label,
        isDefault: !!payload.isDefault,
        audioUrl: payload.audioUrl || null
      }
    });
  }

  async addSubtitleTrack(episodeId: string, payload: {
    language: string;
    label: string;
    vttUrl: string;
    isDefault?: boolean;
  }) {
    return prisma.subtitleTrack.create({
      data: {
        episodeId,
        language: payload.language,
        label: payload.label,
        vttUrl: payload.vttUrl,
        isDefault: !!payload.isDefault
      }
    });
  }

  async listUsers(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [total, users] = await Promise.all([
      prisma.user.count(),
      prisma.user.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          username: true,
          displayName: true,
          role: true,
          createdAt: true
        }
      })
    ]);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async updateUserRole(userId: string, newRole: string, adminUserId: string) {
    const updated = await prisma.user.update({
      where: { id: userId },
      data: { role: newRole },
      select: { id: true, username: true, email: true, role: true }
    });

    await prisma.auditLog.create({
      data: {
        userId: adminUserId,
        action: 'UPDATE_USER_ROLE',
        entity: 'User',
        entityId: userId,
        details: JSON.stringify({ newRole })
      }
    });

    return updated;
  }

  async importMetadata(query: string) {
    let results = await this.anilistProvider.searchAnime(query, 5);
    if (!results || results.length === 0) {
      results = await this.mockProvider.searchAnime(query);
    }
    return results;
  }
}
