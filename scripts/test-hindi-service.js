async function getHindiStreams(animeSlug, season, episode, isMovie = false) {
  const SLUG_MAP = {
    'demon-slayer': 'demon-slayer-kimetsu-no-yaiba',
    'naruto': 'naruto',
    'naruto-shippuden': 'naruto-shippuden',
    'solo-leveling': 'solo-leveling',
    'jujutsu-kaisen': 'jujutsu-kaisen',
    'attack-on-titan': 'attack-on-titan',
    'chainsaw-man': 'chainsaw-man',
    'spy-x-family': 'spy-x-family',
    'death-note': 'death-note',
    'frieren-beyond-journeys-end': 'frieren-beyond-journeys-end',
    'one-piece': 'one-piece',
    'bleach-thousand-year-blood-war': 'bleach-thousand-year-blood-war',
    'your-name': 'your-name'
  };

  const targetSlug = SLUG_MAP[animeSlug] || animeSlug;
  const mirrors = ['https://toonstream.us', 'https://animesalt.cx'];

  for (const base of mirrors) {
    const url = isMovie
      ? `${base}/movies/${targetSlug}/`
      : `${base}/episode/${targetSlug}-${season}x${episode}/`;

    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121 Safari/537.36',
          'Referer': `${base}/`
        },
        signal: AbortSignal.timeout(6000)
      });

      if (!res.ok) continue;
      const html = await res.text();

      const regex = /<iframe[^>]+(?:src|data-src)=["']([^"']+)["']/gi;
      const servers = [];
      let match;
      while ((match = regex.exec(html)) !== null) {
        let src = match[1].replace(/&#038;/g, '&');
        if (src.startsWith('//')) src = 'https:' + src;
        if (!servers.includes(src) && !src.includes('google') && !src.includes('facebook') && !src.includes('recaptcha')) {
          servers.push(src);
        }
      }

      if (servers.length > 0) {
        return {
          source: base,
          targetSlug,
          servers
        };
      }
    } catch (e) {
      // Continue to next mirror
    }
  }

  return null;
}

async function run() {
  console.log('Testing Naruto 1x1:');
  console.log(await getHindiStreams('naruto', 1, 1));

  console.log('Testing Demon Slayer 1x1:');
  console.log(await getHindiStreams('demon-slayer', 1, 1));

  console.log('Testing Your Name (Movie):');
  console.log(await getHindiStreams('your-name', 1, 1, true));
}

run();
