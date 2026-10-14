const titles = [
  'Solo Leveling',
  'Demon Slayer: Kimetsu no Yaiba',
  'Jujutsu Kaisen',
  'Frieren: Beyond Journey\'s End',
  'Attack on Titan',
  'Your Name.',
  'SPY x FAMILY',
  'Chainsaw Man',
  'One Piece',
  'Bleach: Thousand-Year Blood War',
  'Naruto: Shippuden',
  'Death Note'
];

const query = `
query ($search: String) {
  Media(search: $search, type: ANIME) {
    id
    title { english romaji }
    coverImage { extraLarge large medium }
    bannerImage
  }
}
`;

async function fetchImages() {
  const results = {};
  for (const t of titles) {
    try {
      const res = await fetch('https://graphql.anilist.co', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, variables: { search: t } })
      });
      const data = await res.json();
      const m = data.data?.Media;
      results[t] = {
        title: m?.title?.english || m?.title?.romaji,
        poster: m?.coverImage?.extraLarge || m?.coverImage?.large,
        banner: m?.bannerImage || m?.coverImage?.large
      };
      console.log(t, '->', results[t].poster);
    } catch (e) {
      console.error('Error for', t, e.message);
    }
  }
  console.log('RESULTS_START');
  console.log(JSON.stringify(results, null, 2));
  console.log('RESULTS_END');
}

fetchImages();
