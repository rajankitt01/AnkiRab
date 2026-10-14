export interface SeedAnimeData {
  slug: string;
  title: string;
  japaneseTitle: string;
  englishTitle: string;
  synopsis: string;
  posterImage: string;
  coverImage: string;
  bannerImage: string;
  format: string;
  status: string;
  releaseYear: number;
  rating: number;
  voteCount: number;
  episodeCount: number;
  durationMinutes: number;
  studio: string;
  isFeatured: boolean;
  isTrending: boolean;
  hasHindiDub: boolean;
  hasEnglishDub: boolean;
  hasSubtitles: boolean;
  genres: string[];
  aliases: { title: string; type: string }[];
  episodes: {
    episodeNumber: number;
    title: string;
    synopsis: string;
    thumbnail: string;
    durationMinutes: number;
    introStart: number;
    introEnd: number;
    outroStart: number;
    outroEnd: number;
  }[];
}

export const SEED_GENRES = [
  { name: 'Action', slug: 'action', description: 'Fast-paced thrilling combat and dynamic battles' },
  { name: 'Adventure', slug: 'adventure', description: 'Journeys across mysterious worlds and uncharted lands' },
  { name: 'Comedy', slug: 'comedy', description: 'Humorous storylines and lighthearted entertainment' },
  { name: 'Drama', slug: 'drama', description: 'Deep character-driven emotional conflicts and narrative depth' },
  { name: 'Fantasy', slug: 'fantasy', description: 'Magic, mythical beings, and otherworldly realms' },
  { name: 'Isekai', slug: 'isekai', description: 'Protagonists transported or reincarnated into parallel worlds' },
  { name: 'Mystery', slug: 'mystery', description: 'Cryptic enigmas, investigations, and puzzling truths' },
  { name: 'Romance', slug: 'romance', description: 'Heartfelt relationships, love stories, and emotional bonds' },
  { name: 'Sci-Fi', slug: 'sci-fi', description: 'Futuristic technologies, cyberpunk aesthetics, and space adventures' },
  { name: 'Shounen', slug: 'shounen', description: 'High-energy determination, friendship, and heroic ascension' },
  { name: 'Slice of Life', slug: 'slice-of-life', description: 'Charming, authentic everyday experiences and human warmth' },
  { name: 'Sports', slug: 'sports', description: 'High-stakes athletic competition and teamwork' },
  { name: 'Supernatural', slug: 'supernatural', description: 'Curses, spirits, paranormal phenomena, and occult powers' },
  { name: 'Thriller', slug: 'thriller', description: 'Intense suspense, psychological stakes, and cliffhangers' }
];

export const SEED_ANIMES: SeedAnimeData[] = [
  {
    slug: 'solo-leveling',
    title: 'Solo Leveling: Arise',
    japaneseTitle: '俺だけレベルアップな件',
    englishTitle: 'Solo Leveling',
    synopsis: 'In a world where hunters must battle deadly monsters to protect humanity, Sung Jinwoo, notoriously known as the weakest hunter of all mankind, finds himself in a fatal double dungeon. On the brink of death, a mysterious quest window appears before him, granting him the unique ability to level up infinitely.',
    posterImage: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1600&auto=format&fit=crop',
    bannerImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1600&auto=format&fit=crop',
    format: 'TV',
    status: 'ONGOING',
    releaseYear: 2024,
    rating: 8.9,
    voteCount: 14200,
    episodeCount: 12,
    durationMinutes: 24,
    studio: 'A-1 Pictures',
    isFeatured: true,
    isTrending: true,
    hasHindiDub: true,
    hasEnglishDub: true,
    hasSubtitles: true,
    genres: ['Action', 'Fantasy', 'Adventure', 'Supernatural'],
    aliases: [
      { title: 'Na Honjaman Rebeleop', type: 'ROMAJI' },
      { title: 'Ore dake Level Up na Ken', type: 'JAPANESE' }
    ],
    episodes: [
      {
        episodeNumber: 1,
        title: 'I\'m Used to It',
        synopsis: 'E-Rank Hunter Sung Jinwoo enters a low-rank dungeon with a raiding party, but the group encounters a hidden secondary lair fraught with terrifying stone god statues.',
        thumbnail: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500&auto=format&fit=crop',
        durationMinutes: 24,
        introStart: 85,
        introEnd: 175,
        outroStart: 1320,
        outroEnd: 1410
      },
      {
        episodeNumber: 2,
        title: 'If I Had One More Chance',
        synopsis: 'Faced with annihilation by the colossi of the Cartenon Temple, Jinwoo solves the dungeon Commandments as his final sacrifice unlocks a mysterious system.',
        thumbnail: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=500&auto=format&fit=crop',
        durationMinutes: 24,
        introStart: 70,
        introEnd: 160,
        outroStart: 1330,
        outroEnd: 1420
      },
      {
        episodeNumber: 3,
        title: 'It\'s Like a Game',
        synopsis: 'Jinwoo wakes up alive in a hospital bed. Floating system interfaces only visible to him instruct daily quests to train and awaken new power.',
        thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&auto=format&fit=crop',
        durationMinutes: 24,
        introStart: 60,
        introEnd: 150,
        outroStart: 1315,
        outroEnd: 1405
      }
    ]
  },
  {
    slug: 'demon-slayer',
    title: 'Demon Slayer: Kimetsu no Yaiba',
    japaneseTitle: '鬼滅の刃',
    englishTitle: 'Demon Slayer',
    synopsis: 'After his family is brutally murdered and his younger sister Nezuko turned into a demon, Tanjiro Kamado embarks on a relentless quest to join the Demon Slayer Corps and restore his sister\'s humanity.',
    posterImage: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=1600&auto=format&fit=crop',
    bannerImage: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=1600&auto=format&fit=crop',
    format: 'TV',
    status: 'COMPLETED',
    releaseYear: 2019,
    rating: 8.8,
    voteCount: 28900,
    episodeCount: 26,
    durationMinutes: 24,
    studio: 'ufotable',
    isFeatured: true,
    isTrending: true,
    hasHindiDub: true,
    hasEnglishDub: true,
    hasSubtitles: true,
    genres: ['Action', 'Fantasy', 'Shounen', 'Supernatural'],
    aliases: [{ title: 'Blade of Demon Destruction', type: 'ENGLISH' }],
    episodes: [
      {
        episodeNumber: 1,
        title: 'Cruelty',
        synopsis: 'Tanjiro returns home from town to discover an unspeakable tragedy. When Nezuko attacks him with demonic fangs, a swordsman named Giyu Tomioka intervenes.',
        thumbnail: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=500&auto=format&fit=crop',
        durationMinutes: 24,
        introStart: 60,
        introEnd: 150,
        outroStart: 1320,
        outroEnd: 1410
      },
      {
        episodeNumber: 2,
        title: 'Trainer Sakonji Urokodaki',
        synopsis: 'Guided by Tomioka\'s advice, Tanjiro carries Nezuko toward Mount Sagiri to seek training under the former Water Hashira Sakonji Urokodaki.',
        thumbnail: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=500&auto=format&fit=crop',
        durationMinutes: 24,
        introStart: 65,
        introEnd: 155,
        outroStart: 1330,
        outroEnd: 1420
      }
    ]
  },
  {
    slug: 'jujutsu-kaisen',
    title: 'Jujutsu Kaisen',
    japaneseTitle: '呪術廻戦',
    englishTitle: 'Jujutsu Kaisen: Sorcery Fight',
    synopsis: 'Yuji Itadori, a high school student with extraordinary physical prowess, swallows the finger of Sukuna, the King of Curses, to save friends. He is transferred to Tokyo Prefectural Jujutsu High School to eradicate cursed spirits.',
    posterImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1600&auto=format&fit=crop',
    bannerImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1600&auto=format&fit=crop',
    format: 'TV',
    status: 'COMPLETED',
    releaseYear: 2020,
    rating: 8.7,
    voteCount: 22100,
    episodeCount: 24,
    durationMinutes: 24,
    studio: 'MAPPA',
    isFeatured: true,
    isTrending: true,
    hasHindiDub: true,
    hasEnglishDub: true,
    hasSubtitles: true,
    genres: ['Action', 'Supernatural', 'Fantasy', 'Shounen'],
    aliases: [{ title: 'JJK', type: 'SYNONYM' }],
    episodes: [
      {
        episodeNumber: 1,
        title: 'Ryomen Sukuna',
        synopsis: 'Yuji Itadori lives normally with his grandfather until an occult research club unleashes high-grade cursed spirits at his school.',
        thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop',
        durationMinutes: 24,
        introStart: 55,
        introEnd: 145,
        outroStart: 1320,
        outroEnd: 1410
      }
    ]
  },
  {
    slug: 'frieren-beyond-journeys-end',
    title: 'Frieren: Beyond Journey\'s End',
    japaneseTitle: '葬送のフリーレン',
    englishTitle: 'Frieren: Beyond Journey\'s End',
    synopsis: 'The demon king has been defeated, and the victorious hero party disbands. As an elf whose lifespan spans thousands of years, Frieren promises to visit her mortal human companions, only to realize the impermanence of mortal life.',
    posterImage: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1600&auto=format&fit=crop',
    bannerImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1600&auto=format&fit=crop',
    format: 'TV',
    status: 'COMPLETED',
    releaseYear: 2023,
    rating: 9.1,
    voteCount: 31000,
    episodeCount: 28,
    durationMinutes: 24,
    studio: 'Madhouse',
    isFeatured: true,
    isTrending: false,
    hasHindiDub: true,
    hasEnglishDub: true,
    hasSubtitles: true,
    genres: ['Fantasy', 'Adventure', 'Drama', 'Slice of Life'],
    aliases: [{ title: 'Sousou no Frieren', type: 'ROMAJI' }],
    episodes: [
      {
        episodeNumber: 1,
        title: 'The Journey\'s End',
        synopsis: 'After a ten-year adventure, the Hero Party watches the Era Meteor Shower. Decades later, Frieren returns for the funeral of Himmel the Hero.',
        thumbnail: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=500&auto=format&fit=crop',
        durationMinutes: 24,
        introStart: 45,
        introEnd: 135,
        outroStart: 1330,
        outroEnd: 1410
      }
    ]
  },
  {
    slug: 'attack-on-titan',
    title: 'Attack on Titan: Final Season',
    japaneseTitle: '進撃の巨人',
    englishTitle: 'Attack on Titan',
    synopsis: 'After his hometown is destroyed and his mother is killed, young Eren Jaeger vows to cleanse the earth of the giant humanoid Titans that have brought humanity to the brink of extinction.',
    posterImage: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=600&auto=format&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=1600&auto=format&fit=crop',
    bannerImage: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=1600&auto=format&fit=crop',
    format: 'TV',
    status: 'COMPLETED',
    releaseYear: 2023,
    rating: 9.0,
    voteCount: 45000,
    episodeCount: 88,
    durationMinutes: 24,
    studio: 'MAPPA',
    isFeatured: false,
    isTrending: true,
    hasHindiDub: false,
    hasEnglishDub: true,
    hasSubtitles: true,
    genres: ['Action', 'Drama', 'Mystery', 'Fantasy'],
    aliases: [{ title: 'Shingeki no Kyojin', type: 'ROMAJI' }],
    episodes: [
      {
        episodeNumber: 1,
        title: 'To You, in 2000 Years: The Fall of Shiganshina',
        synopsis: 'The Colossal Titan shatters Wall Maria, shattering a century of human peace.',
        thumbnail: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=500&auto=format&fit=crop',
        durationMinutes: 24,
        introStart: 70,
        introEnd: 160,
        outroStart: 1320,
        outroEnd: 1400
      }
    ]
  },
  {
    slug: 'your-name',
    title: 'Your Name (Kimi no Na wa)',
    japaneseTitle: '君の名は。',
    englishTitle: 'Your Name.',
    synopsis: 'Two teenagers share a profound, magical connection upon discovering they are swapping bodies across space and time.',
    posterImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1600&auto=format&fit=crop',
    bannerImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1600&auto=format&fit=crop',
    format: 'MOVIE',
    status: 'COMPLETED',
    releaseYear: 2016,
    rating: 8.9,
    voteCount: 38000,
    episodeCount: 1,
    durationMinutes: 106,
    studio: 'CoMix Wave Films',
    isFeatured: true,
    isTrending: false,
    hasHindiDub: true,
    hasEnglishDub: true,
    hasSubtitles: true,
    genres: ['Romance', 'Drama', 'Supernatural'],
    aliases: [{ title: 'Kimi no Na wa', type: 'ROMAJI' }],
    episodes: [
      {
        episodeNumber: 1,
        title: 'Full Feature Film',
        synopsis: 'Mitsuha and Taki awaken to discover their identities intertwined across comet-lit skies.',
        thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&auto=format&fit=crop',
        durationMinutes: 106,
        introStart: 0,
        introEnd: 0,
        outroStart: 6100,
        outroEnd: 6360
      }
    ]
  },
  {
    slug: 'spy-x-family',
    title: 'Spy x Family',
    japaneseTitle: 'SPY×FAMILY',
    englishTitle: 'Spy x Family',
    synopsis: 'A master spy nicknamed Twilight creates an undercover family for Operation Strix, unknowingly marrying an assassin and adopting a telepathic daughter.',
    posterImage: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=600&auto=format&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=1600&auto=format&fit=crop',
    bannerImage: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=1600&auto=format&fit=crop',
    format: 'TV',
    status: 'ONGOING',
    releaseYear: 2022,
    rating: 8.6,
    voteCount: 19500,
    episodeCount: 25,
    durationMinutes: 24,
    studio: 'WIT Studio & CloverWorks',
    isFeatured: false,
    isTrending: true,
    hasHindiDub: true,
    hasEnglishDub: true,
    hasSubtitles: true,
    genres: ['Comedy', 'Action', 'Slice of Life'],
    aliases: [{ title: 'Spy Family', type: 'SYNONYM' }],
    episodes: [
      {
        episodeNumber: 1,
        title: 'Operation Strix',
        synopsis: 'Twilight adopts Anya from an orphanage without realizing she can read minds.',
        thumbnail: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=500&auto=format&fit=crop',
        durationMinutes: 24,
        introStart: 45,
        introEnd: 135,
        outroStart: 1320,
        outroEnd: 1410
      }
    ]
  },
  {
    slug: 'chainsaw-man',
    title: 'Chainsaw Man',
    japaneseTitle: 'チェンソーマン',
    englishTitle: 'Chainsaw Man',
    synopsis: 'Denji makes a pact with his pet devil Pochita, reviving as Chainsaw Man to hunt deadly devils for Public Safety.',
    posterImage: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=600&auto=format&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=1600&auto=format&fit=crop',
    bannerImage: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=1600&auto=format&fit=crop',
    format: 'TV',
    status: 'COMPLETED',
    releaseYear: 2022,
    rating: 8.5,
    voteCount: 21000,
    episodeCount: 12,
    durationMinutes: 24,
    studio: 'MAPPA',
    isFeatured: false,
    isTrending: true,
    hasHindiDub: true,
    hasEnglishDub: true,
    hasSubtitles: true,
    genres: ['Action', 'Supernatural', 'Thriller'],
    aliases: [],
    episodes: [
      {
        episodeNumber: 1,
        title: 'Dog & Chainsaw',
        synopsis: 'Denji and Pochita face an ambush from the Zombie Devil before forging a blood bond.',
        thumbnail: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=500&auto=format&fit=crop',
        durationMinutes: 24,
        introStart: 30,
        introEnd: 120,
        outroStart: 1330,
        outroEnd: 1410
      }
    ]
  }
];

export const SEED_SCHEDULE = [
  { dayOfWeek: 0, episodeNumber: 13, timeString: '18:00', animeSlug: 'solo-leveling' },
  { dayOfWeek: 1, episodeNumber: 27, timeString: '19:30', animeSlug: 'demon-slayer' },
  { dayOfWeek: 2, episodeNumber: 26, timeString: '20:00', animeSlug: 'spy-x-family' },
  { dayOfWeek: 3, episodeNumber: 29, timeString: '17:30', animeSlug: 'frieren-beyond-journeys-end' },
  { dayOfWeek: 4, episodeNumber: 13, timeString: '21:00', animeSlug: 'chainsaw-man' },
  { dayOfWeek: 5, episodeNumber: 25, timeString: '19:00', animeSlug: 'jujutsu-kaisen' },
  { dayOfWeek: 6, episodeNumber: 89, timeString: '18:30', animeSlug: 'attack-on-titan' }
];
