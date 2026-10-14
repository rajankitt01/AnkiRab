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

    // Create Season 1
    const season = await prisma.season.upsert({
      where: { animeId_seasonNumber: { animeId: anime.id, seasonNumber: 1 } },
      update: { title: 'Season 1' },
      create: { animeId: anime.id, seasonNumber: 1, title: 'Season 1' }
    });

    // Create Episodes
    for (const ep of a.episodes) {
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

      if (ep.episodeNumber === 1) {
        firstEpisodeMap.set(a.slug, episode.id);
      }

      // Add default video source
      const existingSrc = await prisma.videoSource.findFirst({
        where: { episodeId: episode.id }
      });
      if (!existingSrc) {
        await prisma.videoSource.create({
          data: {
            episodeId: episode.id,
            provider: 'ANKIRAB Demo Provider',
            quality: 'auto',
            format: 'HLS',
            url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
            isMaster: true
          }
        });
      }

      // Add Audio Tracks
      const existingAudio = await prisma.audioTrack.findFirst({
        where: { episodeId: episode.id }
      });
      if (!existingAudio) {
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
      }

      // Add Subtitle Tracks
      const existingSub = await prisma.subtitleTrack.findFirst({
        where: { episodeId: episode.id }
      });
      if (!existingSub) {
        await prisma.subtitleTrack.create({
          data: {
            episodeId: episode.id,
            language: 'en',
            label: 'English Subtitles',
            vttUrl: 'https://bitmovin-a.akamaihd.net/content/sintel/subtitles/subtitles_en.vtt',
            isDefault: true
          }
        });
        await prisma.subtitleTrack.create({
          data: {
            episodeId: episode.id,
            language: 'hi',
            label: 'Hindi Subtitles (हिंदी)',
            vttUrl: 'https://bitmovin-a.akamaihd.net/content/sintel/subtitles/subtitles_de.vtt',
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
