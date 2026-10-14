import { prisma } from '../../config/db';
import { AppError } from '../../middleware/errorHandler';
import { UpdateProfileInput, WatchStatus } from '@ankirab/shared';

export class UserService {
  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        avatarUrl: true,
        role: true,
        preferredAudio: true,
        preferredSubtitle: true,
        autoPlayNext: true,
        autoSkipIntro: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return user;
  }

  async updateProfile(userId: string, data: UpdateProfileInput) {
    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        displayName: data.displayName,
        avatarUrl: data.avatarUrl || null,
        preferredAudio: data.preferredAudio,
        preferredSubtitle: data.preferredSubtitle,
        autoPlayNext: data.autoPlayNext,
        autoSkipIntro: data.autoSkipIntro
      },
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        avatarUrl: true,
        role: true,
        preferredAudio: true,
        preferredSubtitle: true,
        autoPlayNext: true,
        autoSkipIntro: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return updated;
  }

  async getWatchlist(userId: string) {
    const list = await prisma.watchlist.findMany({
      where: { userId },
      include: {
        anime: {
          select: {
            id: true,
            slug: true,
            title: true,
            posterImage: true,
            format: true,
            status: true,
            releaseYear: true,
            rating: true,
            hasHindiDub: true,
            hasEnglishDub: true
          }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    return list.map(item => ({
      id: item.id,
      userId: item.userId,
      animeId: item.animeId,
      status: item.status as WatchStatus,
      rating: item.rating,
      anime: item.anime,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString()
    }));
  }

  async toggleWatchlist(userId: string, animeId: string, status: WatchStatus = 'PLAN_TO_WATCH') {
    const existing = await prisma.watchlist.findUnique({
      where: {
        userId_animeId: {
          userId,
          animeId
        }
      }
    });

    if (existing) {
      if (existing.status === status) {
        // Remove from watchlist
        await prisma.watchlist.delete({
          where: { id: existing.id }
        });
        return { action: 'removed', inWatchlist: false };
      } else {
        // Update status
        const updated = await prisma.watchlist.update({
          where: { id: existing.id },
          data: { status }
        });
        return { action: 'updated', inWatchlist: true, item: updated };
      }
    }

    const created = await prisma.watchlist.create({
      data: {
        userId,
        animeId,
        status
      }
    });

    return { action: 'added', inWatchlist: true, item: created };
  }

  async removeFromWatchlist(userId: string, animeId: string) {
    await prisma.watchlist.deleteMany({
      where: { userId, animeId }
    });
    return { success: true, message: 'Removed from watchlist' };
  }

  async getWatchHistory(userId: string) {
    const history = await prisma.watchHistory.findMany({
      where: { userId },
      include: {
        anime: {
          select: {
            id: true,
            slug: true,
            title: true,
            posterImage: true,
            bannerImage: true
          }
        },
        episode: {
          select: {
            id: true,
            episodeNumber: true,
            title: true,
            thumbnail: true,
            seasonId: true
          }
        }
      },
      orderBy: { lastWatchedAt: 'desc' },
      take: 20
    });

    return history.map(item => ({
      id: item.id,
      userId: item.userId,
      animeId: item.animeId,
      episodeId: item.episodeId,
      progressSeconds: item.progressSeconds,
      durationSeconds: item.durationSeconds,
      completed: item.completed,
      lastWatchedAt: item.lastWatchedAt.toISOString(),
      anime: item.anime,
      episode: item.episode
    }));
  }

  async updateAnimeStatus(userId: string, animeId: string, status: string, rating?: number) {
    const record = await prisma.userAnimeStatus.upsert({
      where: {
        userId_animeId: {
          userId,
          animeId
        }
      },
      create: {
        userId,
        animeId,
        status,
        rating
      },
      update: {
        status,
        rating
      }
    });

    return record;
  }

  async deleteAccount(userId: string) {
    await prisma.user.delete({
      where: { id: userId }
    });
    return { success: true, message: 'Account and associated data deleted permanently' };
  }
}
