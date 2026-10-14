const fs = require('fs');
const path = require('path');
const { FULL_CATALOG } = require('./generate-comprehensive-catalog.js');

const STREAM_URLS = [
  'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
  'https://media.w3.org/2010/05/sintel/trailer.mp4',
  'https://devstreaming-cdn.apple.com/videos/streaming/examples/img_bipbop_adv_example_fmp4/master.m3u8',
  'https://vjs.zencdn.net/v/oceans.mp4',
  'https://devstreaming-cdn.apple.com/videos/streaming/examples/bipbop_16x9/bipbop_16x9_variant.m3u8',
  'https://cdn.plyr.io/static/demo/View_From_A_Blue_Moon_Trailer-1080p.mp4',
  'https://test-streams.mux.dev/test_001/stream.m3u8',
  'https://filesamples.com/samples/video/mp4/sample_1280x720_surfing_with_audio.mp4',
  'https://devstreaming-cdn.apple.com/videos/streaming/examples/bipbop_4x3/bipbop_4x3_variant.m3u8',
  'https://cdn.plyr.io/static/demo/View_From_A_Blue_Moon_Trailer-720p.mp4',
  'https://filesamples.com/samples/video/mp4/sample_960x400_ocean_with_audio.mp4',
  'https://raw.githubusercontent.com/bower-media-samples/big-buck-bunny-480p-30s/master/video.mp4'
];

function getSources(seed) {
  const s0 = STREAM_URLS[Math.abs(seed) % STREAM_URLS.length];
  const s1 = STREAM_URLS[Math.abs(seed + 1) % STREAM_URLS.length];
  const s2 = STREAM_URLS[Math.abs(seed + 2) % STREAM_URLS.length];
  const s3 = STREAM_URLS[Math.abs(seed + 3) % STREAM_URLS.length];
  return [
    {
      provider: 'ANKIRAB Authorized CDN',
      quality: 'auto',
      format: s0.endsWith('.m3u8') ? 'HLS' : 'MP4',
      url: s0,
      isMaster: true
    },
    {
      provider: 'ANKIRAB Authorized CDN',
      quality: '1080p',
      format: 'MP4',
      url: s1,
      isMaster: false
    },
    {
      provider: 'ANKIRAB Authorized CDN',
      quality: '720p',
      format: 'MP4',
      url: s2,
      isMaster: false
    },
    {
      provider: 'ANKIRAB Authorized CDN',
      quality: '480p',
      format: 'MP4',
      url: s3,
      isMaster: false
    }
  ];
}

const seedDataPath = path.resolve(__dirname, '../apps/api/prisma/seed-data.ts');
const existing = fs.readFileSync(seedDataPath, 'utf8');

const genresMatch = existing.slice(0, existing.indexOf('export const SEED_ANIMES'));
const schedMatch = existing.slice(existing.indexOf('export const SEED_SCHEDULE'));

let totalEpisodes = 0;
const generatedAnimes = FULL_CATALOG.map((anime, aIdx) => {
  let epGlobalIdx = 0;
  const seasons = anime.seasons.map((s) => {
    const episodes = s.episodes.map((epTitle, epIdx) => {
      epGlobalIdx++;
      totalEpisodes++;
      const epNum = epIdx + 1;
      const sources = getSources(aIdx * 17 + epGlobalIdx * 3);
      return {
        episodeNumber: epNum,
        title: epTitle,
        synopsis: `${anime.title} - ${s.title}: Episode ${epNum}. Multi-audio available in Hindi Dub, English Dub, and Japanese with subtitles.`,
        thumbnail: anime.bannerImage || anime.posterImage,
        durationMinutes: anime.format === 'MOVIE' ? anime.durationMinutes : 24,
        introStart: 60,
        introEnd: 150,
        outroStart: 1350,
        outroEnd: 1440,
        videoSources: sources
      };
    });

    return {
      seasonNumber: s.seasonNumber,
      title: s.title,
      episodes
    };
  });

  const allEpisodes = seasons.flatMap((s) => s.episodes);
  return {
    ...anime,
    episodeCount: allEpisodes.length,
    seasons,
    episodes: allEpisodes
  };
});

const animesOutput = 'export const SEED_ANIMES: SeedAnimeData[] = ' + JSON.stringify(generatedAnimes, null, 2) + ';\n\n';
const fullContent = genresMatch + animesOutput + schedMatch;
fs.writeFileSync(seedDataPath, fullContent, 'utf8');

console.log(`✅ Synced seed-data.ts with ${generatedAnimes.length} animes and ${totalEpisodes} full multi-audio episodes!`);
