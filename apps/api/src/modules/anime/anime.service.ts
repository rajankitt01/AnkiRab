import { prisma } from '../../config/db';
import { AnimeFilterQuery, PaginatedResult, AnimeDto, GenreDto } from '@ankirab/shared';
import { AppError } from '../../middleware/errorHandler';

export class AnimeService {
  async listAnime(filter: AnimeFilterQuery): Promise<PaginatedResult<AnimeDto>> {
    const page = filter.page || 1;
    const limit = filter.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (filter.search) {
      const q = filter.search.trim();
      where.OR = [
        { title: { contains: q } },
        { englishTitle: { contains: q } },
        { japaneseTitle: { contains: q } },
        { synopsis: { contains: q } }
      ];
    }

    if (filter.format) {
      where.format = filter.format;
    }

    if (filter.status) {
      where.status = filter.status;
    }

    if (filter.year) {
      where.releaseYear = filter.year;
    }

    if (filter.minRating) {
      where.rating = { gte: filter.minRating };
    }

    if (filter.genre) {
      where.genres = {
        some: {
          genre: {
            slug: filter.genre.toLowerCase()
          }
        }
      };
    }

    if (filter.audioLang) {
      if (filter.audioLang === 'hi') {
        where.hasHindiDub = true;
      } else if (filter.audioLang === 'en') {
        where.hasEnglishDub = true;
      }
    }

    if (filter.subLang) {
      where.hasSubtitles = true;
    }

    let orderBy: any = { rating: 'desc' };
    if (filter.sortBy === 'latest') {
      orderBy = { releaseYear: filter.sortOrder || 'desc' };
    } else if (filter.sortBy === 'alphabetical') {
      orderBy = { title: filter.sortOrder || 'asc' };
    } else if (filter.sortBy === 'rating') {
      orderBy = { rating: filter.sortOrder || 'desc' };
    } else if (filter.sortBy === 'popularity') {
      orderBy = [{ isFeatured: 'desc' }, { voteCount: 'desc' }, { rating: 'desc' }];
    }

    const [total, animes] = await Promise.all([
      prisma.anime.count({ where }),
      prisma.anime.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          genres: {
            include: {
              genre: true
            }
          },
          aliases: true
        }
      })
    ]);

    const mapped = animes.map(a => this.mapAnimeDto(a));

    return {
      data: mapped,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1
      }
    };
  }

  async getFeaturedAnime(): Promise<AnimeDto[]> {
    const list = await prisma.anime.findMany({
      where: { isFeatured: true },
      take: 6,
      include: {
        genres: { include: { genre: true } },
        aliases: true
      }
    });
    return list.map(a => this.mapAnimeDto(a));
  }

  async getTrendingAnime(): Promise<AnimeDto[]> {
    const list = await prisma.anime.findMany({
      where: { isTrending: true },
      take: 12,
      include: {
        genres: { include: { genre: true } },
        aliases: true
      }
    });
    return list.map(a => this.mapAnimeDto(a));
  }

  async getPopularAnime(): Promise<AnimeDto[]> {
    const list = await prisma.anime.findMany({
      take: 12,
      orderBy: { rating: 'desc' },
      include: {
        genres: { include: { genre: true } },
        aliases: true
      }
    });
    return list.map(a => this.mapAnimeDto(a));
  }

  async getRecentlyAdded(): Promise<AnimeDto[]> {
    const list = await prisma.anime.findMany({
      take: 12,
      orderBy: { createdAt: 'desc' },
      include: {
        genres: { include: { genre: true } },
        aliases: true
      }
    });
    return list.map(a => this.mapAnimeDto(a));
  }

  async getByAudioLanguage(lang: 'hi' | 'en'): Promise<AnimeDto[]> {
    const where = lang === 'hi' ? { hasHindiDub: true } : { hasEnglishDub: true };
    const list = await prisma.anime.findMany({
      where,
      take: 12,
      orderBy: { rating: 'desc' },
      include: {
        genres: { include: { genre: true } },
        aliases: true
      }
    });
    return list.map(a => this.mapAnimeDto(a));
  }

  async getAnimeBySlug(slug: string): Promise<AnimeDto> {
    const anime = await prisma.anime.findUnique({
      where: { slug },
      include: {
        genres: {
          include: {
            genre: true
          }
        },
        aliases: true,
        seasons: {
          include: {
            episodes: {
              select: {
                id: true,
                seasonId: true,
                episodeNumber: true,
                title: true,
                synopsis: true,
                thumbnail: true,
                durationMinutes: true,
                introStart: true,
                introEnd: true,
                outroStart: true,
                outroEnd: true,
                airDate: true,
                videoSources: true,
                audioTracks: true,
                subtitleTracks: true
              },
              orderBy: { episodeNumber: 'asc' }
            }
          },
          orderBy: { seasonNumber: 'asc' }
        }
      }
    });

    if (!anime) {
      throw new AppError(`Anime "${slug}" not found`, 404);
    }

    return this.mapAnimeDto(anime);
  }

  async getAnimeSeasons(slug: string) {
    const anime = await prisma.anime.findUnique({
      where: { slug },
      select: {
        id: true,
        slug: true,
        title: true,
        seasons: {
          include: {
            episodes: {
              orderBy: { episodeNumber: 'asc' },
              include: {
                audioTracks: true,
                subtitleTracks: true,
                videoSources: true
              }
            }
          },
          orderBy: { seasonNumber: 'asc' }
        }
      }
    });

    if (!anime) {
      throw new AppError('Anime not found', 404);
    }

    return anime.seasons;
  }

  async getRelatedAnime(slug: string): Promise<AnimeDto[]> {
    const current = await prisma.anime.findUnique({
      where: { slug },
      include: { genres: true }
    });

    if (!current) {
      throw new AppError('Anime not found', 404);
    }

    const genreIds = current.genres.map(g => g.genreId);

    const related = await prisma.anime.findMany({
      where: {
        id: { not: current.id },
        genres: {
          some: {
            genreId: { in: genreIds }
          }
        }
      },
      take: 6,
      include: {
        genres: { include: { genre: true } },
        aliases: true
      }
    });

    return related.map(a => this.mapAnimeDto(a));
  }

  async getAllGenres(): Promise<GenreDto[]> {
    const genres = await prisma.genre.findMany({
      orderBy: { name: 'asc' }
    });
    return genres.map(g => ({
      id: g.id,
      name: g.name,
      slug: g.slug,
      description: g.description
    }));
  }

  private mapAnimeDto(anime: any): AnimeDto {
    return {
      id: anime.id,
      slug: anime.slug,
      title: anime.title,
      japaneseTitle: anime.japaneseTitle,
      englishTitle: anime.englishTitle,
      synopsis: anime.synopsis,
      posterImage: anime.posterImage,
      coverImage: anime.coverImage,
      bannerImage: anime.bannerImage,
      format: anime.format as any,
      status: anime.status as any,
      releaseYear: anime.releaseYear,
      rating: anime.rating,
      voteCount: anime.voteCount,
      episodeCount: anime.episodeCount,
      durationMinutes: anime.durationMinutes,
      studio: anime.studio,
      isFeatured: anime.isFeatured,
      isTrending: anime.isTrending,
      hasHindiDub: anime.hasHindiDub,
      hasEnglishDub: anime.hasEnglishDub,
      hasSubtitles: anime.hasSubtitles,
      genres: (anime.genres || []).map((ag: any) => ({
        id: ag.genre ? ag.genre.id : ag.id,
        name: ag.genre ? ag.genre.name : ag.name,
        slug: ag.genre ? ag.genre.slug : ag.slug,
        description: ag.genre ? ag.genre.description : ag.description
      })),
      aliases: anime.aliases?.map((al: any) => ({
        id: al.id,
        title: al.title,
        type: al.type
      })),
      seasons: anime.seasons?.map((s: any) => ({
        id: s.id,
        animeId: s.animeId,
        seasonNumber: s.seasonNumber,
        title: s.title,
        episodes: s.episodes?.map((e: any) => ({
          ...e,
          airDate: e.airDate ? e.airDate.toISOString() : null
        })),
        _count: s._count
      })),
      createdAt: anime.createdAt.toISOString(),
      updatedAt: anime.updatedAt.toISOString()
    };
  }
}
