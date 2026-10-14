const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

const ARTWORK = {
  'solo-leveling': {
    poster: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx151807-it355ZgzquUd.png',
    banner: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/151807-37yfQA3ym8PA.jpg'
  },
  'demon-slayer': {
    poster: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx101922-WBsBl0ClmgYL.jpg',
    banner: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/101922-33MtJGsUSxga.jpg'
  },
  'jujutsu-kaisen': {
    poster: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx113415-LHBAeoZDIsnF.jpg',
    banner: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/113415-jQBSkxWAAk83.jpg'
  },
  'attack-on-titan': {
    poster: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx16498-buvcRTBx4NSm.jpg',
    banner: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/16498-8jpFCOcDmneX.jpg'
  },
  'frieren-beyond-journeys-end': {
    poster: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx154587-qQTzQnEJJ3oB.jpg',
    banner: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/154587-ivXNJ23SM1xB.jpg'
  },
  'spy-x-family': {
    poster: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx140960-Kb6R5nYQfjmP.jpg',
    banner: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/140960-Z7xSvkRxHKfj.jpg'
  },
  'chainsaw-man': {
    poster: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx127230-DdP4vAdssLoz.png',
    banner: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/127230-o8IRwCGVr9KW.jpg'
  },
  'one-piece': {
    poster: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx21-ELSYx3yMPcKM.jpg',
    banner: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/21-wf37VakJmZqs.jpg'
  },
  'bleach-thousand-year-blood-war': {
    poster: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx116674-p3zK4PUX2Aag.jpg',
    banner: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/116674-l2YlIyJzvGSV.jpg'
  },
  'naruto-shippuden': {
    poster: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx1735-kGfVm0YqCPcu.png',
    banner: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/1735.jpg'
  },
  'death-note': {
    poster: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx1535-kUgkcrfOrkUM.jpg',
    banner: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/1535.jpg'
  },
  'your-name': {
    poster: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx21519-SUo3ZQuCbYhJ.png',
    banner: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/21519-1ayMXgNlmByb.jpg'
  }
};

async function updateDB() {
  console.log('🖼️ Updating database artwork for all 12 animes...');
  for (const [slug, art] of Object.entries(ARTWORK)) {
    const updated = await prisma.anime.updateMany({
      where: { slug },
      data: {
        posterImage: art.poster,
        bannerImage: art.banner,
        coverImage: art.banner
      }
    });

    // Also update episode thumbnails to use the verified banner/poster
    const anime = await prisma.anime.findUnique({ where: { slug }, select: { id: true } });
    if (anime) {
      await prisma.episode.updateMany({
        where: { animeId: anime.id },
        data: {
          thumbnail: art.banner || art.poster
        }
      });
    }

    console.log(`Updated ${slug}: ${updated.count} record(s)`);
  }

  // Also update build-full-catalog.js so future seeds keep the verified URLs
  const catPath = path.resolve(__dirname, 'build-full-catalog.js');
  let catContent = fs.readFileSync(catPath, 'utf8');
  for (const [slug, art] of Object.entries(ARTWORK)) {
    const slugIdx = catContent.indexOf(`slug: '${slug}'`);
    if (slugIdx !== -1) {
      const posterMatch = catContent.indexOf(`posterImage: '`, slugIdx);
      if (posterMatch !== -1 && posterMatch - slugIdx < 1000) {
        const posterEnd = catContent.indexOf(`'`, posterMatch + 14);
        catContent = catContent.slice(0, posterMatch + 14) + art.poster + catContent.slice(posterEnd);
      }
      const bannerMatch = catContent.indexOf(`bannerImage: '`, slugIdx);
      if (bannerMatch !== -1 && bannerMatch - slugIdx < 1000) {
        const bannerEnd = catContent.indexOf(`'`, bannerMatch + 14);
        catContent = catContent.slice(0, bannerMatch + 14) + art.banner + catContent.slice(bannerEnd);
      }
      const coverMatch = catContent.indexOf(`coverImage: '`, slugIdx);
      if (coverMatch !== -1 && coverMatch - slugIdx < 1000) {
        const coverEnd = catContent.indexOf(`'`, coverMatch + 13);
        catContent = catContent.slice(0, coverMatch + 13) + art.banner + catContent.slice(coverEnd);
      }
    }
  }
  fs.writeFileSync(catPath, catContent, 'utf8');

  console.log('✅ All artwork updated successfully in database and catalog source!');
}

updateDB()
  .catch((e) => console.error(e))
  .finally(() => prisma['$disconnect']());
