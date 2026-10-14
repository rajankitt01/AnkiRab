async function queryAnilist(title) {
  const query = `
    query ($search: String) {
      Media(search: $search, type: ANIME) {
        id
        title { romaji english native }
        bannerImage
        coverImage { extraLarge large }
      }
    }
  `;
  try {
    const res = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ query, variables: { search: title } })
    });
    const data = await res.json();
    return data.data ? data.data.Media : null;
  } catch (e) {
    console.error('Error fetching', title, e.message);
    return null;
  }
}

async function run() {
  const animes = [
    'Solo Leveling',
    'Demon Slayer: Kimetsu no Yaiba',
    'Jujutsu Kaisen',
    'Attack on Titan',
    'Frieren: Beyond Journey\'s End',
    'Spy x Family',
    'Chainsaw Man',
    'One Piece',
    'Bleach: Thousand-Year Blood War',
    'Naruto: Shippuden',
    'Death Note',
    'Your Name'
  ];

  for (const name of animes) {
    const res = await queryAnilist(name);
    console.log(name, ':');
    if (res) {
      console.log('  cover:', res.coverImage?.extraLarge || res.coverImage?.large);
      console.log('  banner:', res.bannerImage);
    } else {
      console.log('  NOT FOUND');
    }
  }
}

run();
