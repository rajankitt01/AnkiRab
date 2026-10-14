import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { SEED_GENRES, SEED_ANIMES, SEED_SCHEDULE } from './seed-data';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting ANKIRAB database seed...');

  // 1. Create Genres
  console.log('📁 Seeding genres...');
  const genreMap = new Map<string, string>();
  for (const g of SEED_GENRES) {
    const genre = await prisma.genre.upsert({
      where: { slug: g.slug },
      update: { name: g.name, description: g.description },
      create: { name: g.name, slug: g.slug, description: g.description }
    });
    genreMap.set(g.name, genre.id);
  }

  // 2. Create Admin and Demo User
  console.log('👤 Seeding accounts...');
  const adminPassword = await bcrypt.hash('AdminSecurePass123!', 10);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@ankirab.com' },
    update: { role: 'ADMIN' },
    create: {
      email: 'admin@ankirab.com',
      username: 'admin',
      displayName: 'ANKIRAB Administrator',
      passwordHash: adminPassword,
      role: 'ADMIN',
      preferredAudio: 'hi',
      preferredSubtitle: 'en',
      emailVerified: true
    }
  });

  const demoUserPassword = await bcrypt.hash('DemoUserPass123!', 10);
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@ankirab.com' },
    update: {},
    create: {
      email: 'demo@ankirab.com',
      username: 'otakurider',
      displayName: 'Aryan Sharma',
      passwordHash: demoUserPassword,
      role: 'USER',
      preferredAudio: 'hi',
      preferredSubtitle: 'en',
      emailVerified: true
    }
  });

  // 3. Seed Anime, Seasons, Episodes, Streams
  console.log('🎬 Seeding anime catalog...');
  const animeMap = new Map<string, string>();
  const firstEpisodeMap = new Map<string, string>();

  for (const a of SEED_ANIMES) {
    const anime = await prisma.anime.upsert({
      where: { slug: a.slug },
      update: {
        title: a.title,
        japaneseTitle: a.japaneseTitle,
        englishTitle: a.englishTitle,
        synopsis: a.synopsis,
        posterImage: a.posterImage,
        coverImage: a.coverImage,
        bannerImage: a.bannerImage,
        format: a.format,
        status: a.status,
        releaseYear: a.releaseYear,
        rating: a.rating,
        voteCount: a.voteCount,
        episodeCount: a.episodeCount,
        durationMinutes: a.durationMinutes,
        studio: a.studio,
        isFeatured: a.isFeatured,
        isTrending: a.isTrending,
        hasHindiDub: a.hasHindiDub,
        hasEnglishDub: a.hasEnglishDub,
        hasSubtitles: a.hasSubtitles
      },
      create: {
        slug: a.slug,
        title: a.title,
        japaneseTitle: a.japaneseTitle,
        englishTitle: a.englishTitle,
        synopsis: a.synopsis,
        posterImage: a.posterImage,
        coverImage: a.coverImage,
        bannerImage: a.bannerImage,
        format: a.format,
        status: a.status,
        releaseYear: a.releaseYear,
        rating: a.rating,
        voteCount: a.voteCount,
        episodeCount: a.episodeCount,
        durationMinutes: a.durationMinutes,
        studio: a.studio,
        isFeatured: a.isFeatured,
        isTrending: a.isTrending,
        hasHindiDub: a.hasHindiDub,
        hasEnglishDub: a.hasEnglishDub,
        hasSubtitles: a.hasSubtitles
      }
    });

    animeMap.set(a.slug, anime.id);

    // Link Genres
    for (const gName of a.genres) {
      const gId = genreMap.get(gName);
      if (gId) {
        await prisma.animeGenre.upsert({
          where: { animeId_genreId: { animeId: anime.id, genreId: gId } },
          update: {},
          create: { animeId: anime.id, genreId: gId }
        });
      }
    }

    // Link Aliases
    for (const al of a.aliases) {
      const existing = await prisma.animeAlias.findFirst({
        where: { animeId: anime.id, title: al.title }
      });
      if (!existing) {
        await prisma.animeAlias.create({
          data: { animeId: anime.id, title: al.title, type: al.type }
        });
      }
    }

    // Clean up any old seasons not in seed
    const validSeasonNumbers = a.seasons.map(s => s.seasonNumber);
    await prisma.season.deleteMany({
      where: {
        animeId: anime.id,
        seasonNumber: { notIn: validSeasonNumbers }
      }
    });

    // Create Seasons and their respective Episodes
    for (const s of a.seasons) {
      const season = await prisma.season.upsert({
        where: { animeId_seasonNumber: { animeId: anime.id, seasonNumber: s.seasonNumber } },
        update: { title: s.title },
        create: { animeId: anime.id, seasonNumber: s.seasonNumber, title: s.title }
      });

      // Clean up any extraneous episodes not in this season
      const validEpNumbers = s.episodes.map(e => e.episodeNumber);
      await prisma.episode.deleteMany({
        where: {
          seasonId: season.id,
          episodeNumber: { notIn: validEpNumbers }
        }
      });

      // Create or update Episodes
      for (const ep of s.episodes) {
        const episode = await prisma.episode.upsert({
          where: { seasonId_episodeNumber: { seasonId: season.id, episodeNumber: ep.episodeNumber } },
          update: {
            title: ep.title,
            synopsis: ep.synopsis,
            thumbnail: ep.thumbnail,
            durationMinutes: ep.durationMinutes,
            introStart: ep.introStart,
            introEnd: ep.introEnd,
            outroStart: ep.outroStart,
            outroEnd: ep.outroEnd
          },
          create: {
            seasonId: season.id,
            animeId: anime.id,
            episodeNumber: ep.episodeNumber,
            title: ep.title,
            synopsis: ep.synopsis,
            thumbnail: ep.thumbnail,
            durationMinutes: ep.durationMinutes,
            introStart: ep.introStart,
            introEnd: ep.introEnd,
            outroStart: ep.outroStart,
            outroEnd: ep.outroEnd
          }
        });

        if (s.seasonNumber === 1 && ep.episodeNumber === 1) {
          firstEpisodeMap.set(a.slug, episode.id);
        }

        // Add UNIQUE video sources for this specific episode (different video stream per episode)
        await prisma.videoSource.deleteMany({ where: { episodeId: episode.id } });
        for (const vs of ep.videoSources) {
          await prisma.videoSource.create({
            data: {
              episodeId: episode.id,
              provider: vs.provider,
              quality: vs.quality,
              format: vs.format,
              url: vs.url,
              isMaster: vs.isMaster
            }
          });
        }

        // Add verified audio tracks (Hindi, English, Japanese)
        await prisma.audioTrack.deleteMany({ where: { episodeId: episode.id } });
        if (a.hasHindiDub) {
          await prisma.audioTrack.create({
            data: { episodeId: episode.id, language: 'hi', label: 'Hindi Dubbed (हिंदी)', isDefault: true }
          });
        }
        if (a.hasEnglishDub) {
          await prisma.audioTrack.create({
            data: { episodeId: episode.id, language: 'en', label: 'English Dubbed', isDefault: !a.hasHindiDub }
          });
        }
        await prisma.audioTrack.create({
          data: { episodeId: episode.id, language: 'ja', label: 'Japanese (Original)', isDefault: false }
        });

        // Add verified local WebVTT subtitle tracks (no CORS/403 errors)
        await prisma.subtitleTrack.deleteMany({ where: { episodeId: episode.id } });
        await prisma.subtitleTrack.create({
          data: {
            episodeId: episode.id,
            language: 'en',
            label: 'English Subtitles',
            vttUrl: 'http://localhost:4000/api/subtitles/english.vtt',
            isDefault: true
          }
        });
        await prisma.subtitleTrack.create({
          data: {
            episodeId: episode.id,
            language: 'hi',
            label: 'Hindi Subtitles (हिंदी)',
            vttUrl: 'http://localhost:4000/api/subtitles/hindi.vtt',
            isDefault: false
          }
        });
      }
    }
  }

  // 4. Seed Schedules
  console.log('📅 Seeding weekly schedule...');
  const now = new Date();
  for (const s of SEED_SCHEDULE) {
    const aId = animeMap.get(s.animeSlug);
    if (aId) {
      const airDate = new Date(now.getTime() + (s.dayOfWeek * 24 * 3600 * 1000));
      await prisma.releaseSchedule.create({
        data: {
          animeId: aId,
          episodeNumber: s.episodeNumber,
          airDate,
          dayOfWeek: s.dayOfWeek,
          timeString: s.timeString,
          timezone: 'Asia/Kolkata',
          isReleased: false
        }
      });
    }
  }

  // 5. Seed Demo User Watchlist & History
  console.log('📌 Seeding demo user watchlist & watch progress...');
  const soloLevelingId = animeMap.get('solo-leveling');
  const demonSlayerId = animeMap.get('demon-slayer');
  const frierenId = animeMap.get('frieren-beyond-journeys-end');

  if (soloLevelingId) {
    await prisma.watchlist.upsert({
      where: { userId_animeId: { userId: demoUser.id, animeId: soloLevelingId } },
      update: {},
      create: { userId: demoUser.id, animeId: soloLevelingId, status: 'WATCHING', rating: 9 }
    });

    const ep1Id = firstEpisodeMap.get('solo-leveling');
    if (ep1Id) {
      await prisma.watchHistory.upsert({
        where: { userId_episodeId: { userId: demoUser.id, episodeId: ep1Id } },
        update: {},
        create: {
          userId: demoUser.id,
          animeId: soloLevelingId,
          episodeId: ep1Id,
          progressSeconds: 480,
          durationSeconds: 1440,
          completed: false
        }
      });
    }
  }

  if (demonSlayerId) {
    await prisma.watchlist.upsert({
      where: { userId_animeId: { userId: demoUser.id, animeId: demonSlayerId } },
      update: {},
      create: { userId: demoUser.id, animeId: demonSlayerId, status: 'COMPLETED', rating: 10 }
    });
  }

  if (frierenId) {
    await prisma.watchlist.upsert({
      where: { userId_animeId: { userId: demoUser.id, animeId: frierenId } },
      update: {},
      create: { userId: demoUser.id, animeId: frierenId, status: 'PLAN_TO_WATCH' }
    });
  }

  console.log('✅ ANKIRAB database seeded successfully!');
  console.log('🔑 Admin Credentials: email: admin@ankirab.com | password: AdminSecurePass123!');
  console.log('👤 Demo User Credentials: email: demo@ankirab.com | password: DemoUserPass123!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
