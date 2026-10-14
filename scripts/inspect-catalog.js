const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const animes = await prisma.anime.findMany({
    select: {
      id: true,
      slug: true,
      title: true,
      episodeCount: true,
      hasHindiDub: true,
      hasEnglishDub: true,
      seasons: {
        orderBy: { seasonNumber: 'asc' },
        select: {
          id: true,
          seasonNumber: true,
          title: true,
          _count: { select: { episodes: true } }
        }
      }
    }
  });

  console.log('=== CURRENT ANIME & SEASONS IN DATABASE ===');
  for (const a of animes) {
    console.log(`\n📺 ${a.title} (${a.slug}) - Total Episodes: ${a.episodeCount}`);
    console.log(`   Dubs: Hindi=${a.hasHindiDub}, English=${a.hasEnglishDub}`);
    console.log(`   Seasons (${a.seasons.length}):`);
    for (const s of a.seasons) {
      console.log(`     Season ${s.seasonNumber}: "${s.title}" (${s._count.episodes} eps)`);
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma['$disconnect']());
