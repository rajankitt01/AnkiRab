const fs = require('fs');
const path = require('path');

const STREAM_POOL = [
  {
    master: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    r1080p: 'https://cdn.plyr.io/static/demo/View_From_A_Blue_Moon_Trailer-1080p.mp4',
    r720p: 'https://media.w3.org/2010/05/sintel/trailer.mp4',
    r480p: 'https://raw.githubusercontent.com/bower-media-samples/big-buck-bunny-480p-30s/master/video.mp4'
  },
  {
    master: 'https://media.w3.org/2010/05/sintel/trailer.mp4',
    r1080p: 'https://media.w3.org/2010/05/sintel/trailer.mp4',
    r720p: 'https://cdn.plyr.io/static/demo/View_From_A_Blue_Moon_Trailer-720p.mp4',
    r480p: 'https://raw.githubusercontent.com/bower-media-samples/big-buck-bunny-480p-30s/master/video.mp4'
  },
  {
    master: 'https://vjs.zencdn.net/v/oceans.mp4',
    r1080p: 'https://vjs.zencdn.net/v/oceans.mp4',
    r720p: 'https://filesamples.com/samples/video/mp4/sample_1280x720_surfing_with_audio.mp4',
    r480p: 'https://filesamples.com/samples/video/mp4/sample_960x400_ocean_with_audio.mp4'
  },
  {
    master: 'https://filesamples.com/samples/video/mp4/sample_1280x720_surfing_with_audio.mp4',
    r1080p: 'https://filesamples.com/samples/video/mp4/sample_1280x720_surfing_with_audio.mp4',
    r720p: 'https://filesamples.com/samples/video/mp4/sample_960x400_ocean_with_audio.mp4',
    r480p: 'https://filesamples.com/samples/video/mp4/sample_640x360_surfing_with_audio.mp4'
  },
  {
    master: 'https://devstreaming-cdn.apple.com/videos/streaming/examples/bipbop_4x3/bipbop_4x3_variant.m3u8',
    r1080p: 'https://devstreaming-cdn.apple.com/videos/streaming/examples/bipbop_16x9/bipbop_16x9_variant.m3u8',
    r720p: 'https://devstreaming-cdn.apple.com/videos/streaming/examples/bipbop_4x3/bipbop_4x3_variant.m3u8',
    r480p: 'https://media.w3.org/2010/05/sintel/trailer.mp4'
  },
  {
    master: 'https://filesamples.com/samples/video/mp4/sample_960x400_ocean_with_audio.mp4',
    r1080p: 'https://vjs.zencdn.net/v/oceans.mp4',
    r720p: 'https://filesamples.com/samples/video/mp4/sample_960x400_ocean_with_audio.mp4',
    r480p: 'https://filesamples.com/samples/video/mp4/sample_640x360_surfing_with_audio.mp4'
  },
  {
    master: 'https://devstreaming-cdn.apple.com/videos/streaming/examples/img_bipbop_adv_example_fmp4/master.m3u8',
    r1080p: 'https://cdn.plyr.io/static/demo/View_From_A_Blue_Moon_Trailer-1080p.mp4',
    r720p: 'https://devstreaming-cdn.apple.com/videos/streaming/examples/bipbop_16x9/bipbop_16x9_variant.m3u8',
    r480p: 'https://filesamples.com/samples/video/mp4/sample_640x360_surfing_with_audio.mp4'
  },
  {
    master: 'https://devstreaming-cdn.apple.com/videos/streaming/examples/bipbop_16x9/bipbop_16x9_variant.m3u8',
    r1080p: 'https://devstreaming-cdn.apple.com/videos/streaming/examples/bipbop_16x9/bipbop_16x9_variant.m3u8',
    r720p: 'https://devstreaming-cdn.apple.com/videos/streaming/examples/bipbop_4x3/bipbop_4x3_variant.m3u8',
    r480p: 'https://media.w3.org/2010/05/sintel/trailer.mp4'
  },
  {
    master: 'https://test-streams.mux.dev/test_001/stream.m3u8',
    r1080p: 'https://cdn.plyr.io/static/demo/View_From_A_Blue_Moon_Trailer-1080p.mp4',
    r720p: 'https://media.w3.org/2010/05/sintel/trailer.mp4',
    r480p: 'https://raw.githubusercontent.com/bower-media-samples/big-buck-bunny-480p-30s/master/video.mp4'
  },
  {
    master: 'https://raw.githubusercontent.com/bower-media-samples/big-buck-bunny-480p-30s/master/video.mp4',
    r1080p: 'https://vjs.zencdn.net/v/oceans.mp4',
    r720p: 'https://filesamples.com/samples/video/mp4/sample_1280x720_surfing_with_audio.mp4',
    r480p: 'https://raw.githubusercontent.com/bower-media-samples/big-buck-bunny-480p-30s/master/video.mp4'
  },
  {
    master: 'https://cdn.plyr.io/static/demo/View_From_A_Blue_Moon_Trailer-1080p.mp4',
    r1080p: 'https://cdn.plyr.io/static/demo/View_From_A_Blue_Moon_Trailer-1080p.mp4',
    r720p: 'https://cdn.plyr.io/static/demo/View_From_A_Blue_Moon_Trailer-720p.mp4',
    r480p: 'https://filesamples.com/samples/video/mp4/sample_640x360_surfing_with_audio.mp4'
  },
  {
    master: 'https://filesamples.com/samples/video/mp4/sample_640x360_surfing_with_audio.mp4',
    r1080p: 'https://vjs.zencdn.net/v/oceans.mp4',
    r720p: 'https://filesamples.com/samples/video/mp4/sample_960x400_ocean_with_audio.mp4',
    r480p: 'https://filesamples.com/samples/video/mp4/sample_640x360_surfing_with_audio.mp4'
  }
];

function getSources(animeIndex, epGlobalIndex) {
  const streamIdx = (animeIndex * 13 + epGlobalIndex * 7) % STREAM_POOL.length;
  const s = STREAM_POOL[streamIdx];
  const isMasterHls = s.master.endsWith('.m3u8');
  return [
    {
      provider: 'ANKIRAB Authorized CDN',
      quality: 'auto',
      format: isMasterHls ? 'HLS' : 'MP4',
      url: s.master,
      isMaster: true
    },
    {
      provider: 'ANKIRAB Authorized CDN',
      quality: '1080p',
      format: 'MP4',
      url: s.r1080p,
      isMaster: false
    },
    {
      provider: 'ANKIRAB Authorized CDN',
      quality: '720p',
      format: 'MP4',
      url: s.r720p,
      isMaster: false
    },
    {
      provider: 'ANKIRAB Authorized CDN',
      quality: '480p',
      format: 'MP4',
      url: s.r480p,
      isMaster: false
    }
  ];
}

const CATALOG_DATA = [
  {
    slug: 'solo-leveling',
    title: 'Solo Leveling: Arise',
    japaneseTitle: '俺だけレベルアップな件',
    englishTitle: 'Solo Leveling',
    synopsis: 'In a world where hunters, humans who possess magical abilities, battle deadly monsters from invading Earth, the weakest E-Rank hunter Sung Jinwoo is fatally injured inside a terrifying double dungeon. Chosen by the mysterious System, he alone gains the unique ability to level up infinitely.',
    posterImage: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx151807-it355ZgzquUd.png',
    coverImage: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/151807-37yfQA3ym8PA.jpg',
    bannerImage: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/151807-37yfQA3ym8PA.jpg',
    format: 'TV',
    status: 'ONGOING',
    releaseYear: 2024,
    rating: 8.7,
    voteCount: 42100,
    durationMinutes: 24,
    studio: 'A-1 Pictures',
    isFeatured: true,
    isTrending: true,
    hasHindiDub: true,
    hasEnglishDub: true,
    hasSubtitles: true,
    genres: ['Action', 'Fantasy', 'Adventure'],
    aliases: [
      { title: 'Ore dake Level Up na Ken', type: 'ROMAJI' },
      { title: 'Na Honjaman Level Up', type: 'KOREAN' }
    ],
    seasons: [
      {
        seasonNumber: 1,
        title: 'Season 1: Awakening Arc',
        episodes: [
          "I'm Used to It",
          "If I Had One More Chance",
          "It's Like a Game",
          "I've Gotta Get Stronger",
          "A Pretty Good Deal",
          "The Real Hunt Begins",
          "Let's See How Far I Can Go",
          "This Is Frustrating",
          "You've Been Hiding Your Skills",
          "What Is This, a Picnic?",
          "A Knight Who Defends an Empty Throne",
          "Arise"
        ]
      },
      {
        seasonNumber: 2,
        title: 'Season 2: Arise from the Shadow',
        episodes: [
          "A World Beyond Gates",
          "Red Gate Survival",
          "The Monarch of Shadows",
          "High Orc Shaman",
          "Return of the Shadow Monarch",
          "S-Rank Awakening",
          "Jeju Island Recon",
          "Giant Monarch Lurking",
          "Ant King Descends",
          "Army of Darkness",
          "The Final Awakening",
          "Monarchs' Arrival"
        ]
      }
    ]
  },
  {
    slug: 'demon-slayer',
    title: 'Demon Slayer: Kimetsu no Yaiba',
    japaneseTitle: '鬼滅の刃',
    englishTitle: 'Demon Slayer',
    synopsis: 'Tanjiro Kamado, a kind-hearted boy who sells charcoal for a living, finds his family slaughtered by a demon. To make matters worse, his younger sister Nezuko, the sole survivor, has been transformed into a demon herself. Tanjiro embarks on a dangerous journey to cure his sister and avenge his family.',
    posterImage: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx101922-WBsBl0ClmgYL.jpg',
    coverImage: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/101922-33MtJGsUSxga.jpg',
    bannerImage: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/101922-33MtJGsUSxga.jpg',
    format: 'TV',
    status: 'COMPLETED',
    releaseYear: 2019,
    rating: 8.9,
    voteCount: 98400,
    durationMinutes: 24,
    studio: 'ufotable',
    isFeatured: true,
    isTrending: true,
    hasHindiDub: true,
    hasEnglishDub: true,
    hasSubtitles: true,
    genres: ['Action', 'Supernatural', 'Fantasy', 'Adventure'],
    aliases: [{ title: 'Kimetsu no Yaiba', type: 'ROMAJI' }],
    seasons: [
      {
        seasonNumber: 1,
        title: 'Season 1: Tanjiro Kamado, Unwavering Resolve Arc',
        episodes: [
          "Cruelty",
          "Trainer Sakonji Urokodaki",
          "Sabito and Makomo",
          "Final Selection",
          "My Own Steel",
          "Swordsman Accompanying a Demon",
          "Muzan Kibutsuji",
          "The Smell of Enchanting Blood",
          "Temari Demon and Arrow Demon",
          "Together Forever",
          "Tsuzumi Mansion",
          "The Boar Bares Its Fangs, Zenitsu Sleeps",
          "Something More Important Than Life",
          "The House with the Wisteria Family Crest",
          "Mount Natagumo",
          "Letting Someone Else Go First",
          "You Must Master a Single Thing",
          "A Forged Bond",
          "Hinokami",
          "Pretend Family",
          "Against Corps Rules",
          "Master of the Mansion",
          "Hashira Meeting",
          "Rehabilitation Training",
          "Tsuguko, Kanao Tsuyuri",
          "New Mission"
        ]
      },
      {
        seasonNumber: 2,
        title: 'Season 2: Mugen Train & Entertainment District Arc',
        episodes: [
          "Flame Hashira Kyojuro Rengoku",
          "Deep Sleep",
          "Should Have Been",
          "Insult",
          "Move Forward!",
          "Akaza",
          "Set Your Heart Ablaze",
          "Sound Hashira Tengen Uzui",
          "Infiltrating the Entertainment District",
          "What Are You?",
          "Tonight",
          "Things Are Gonna Get Real Flashy!!",
          "Layered Memories",
          "Transformation",
          "Gathering",
          "Defeating an Upper Rank Demon",
          "Never Give Up",
          "No Matter How Many Lives"
        ]
      },
      {
        seasonNumber: 3,
        title: 'Season 3: Swordsmith Village Arc',
        episodes: [
          "Someone's Dream",
          "Yoriichi Type Zero",
          "A Sword from Over 300 Years Ago",
          "Thank You, Tokito-kun",
          "Bright Red Sword",
          "Aren't You Going to Become a Hashira?",
          "Awful Villain",
          "The Mu in Muichiro",
          "Mist Hashira Muichiro Tokito",
          "Love Hashira Mitsuri Kanroji",
          "A Connected Bond: Daybreak and First Light"
        ]
      },
      {
        seasonNumber: 4,
        title: 'Season 4: Hashira Training Arc',
        episodes: [
          "To Defeat Muzan Kibutsuji",
          "Water Hashira Giyu Tomioka's Pain",
          "Fully Recovered Tanjiro Joins the Hashira Training!!",
          "To Bring a Smile",
          "I Even Ate Demons...",
          "The Strongest of the Demon Slayer Corps",
          "Stone Hashira Gyomei Himejima",
          "The Hashira Unite"
        ]
      }
    ]
  },
  {
    slug: 'jujutsu-kaisen',
    title: 'Jujutsu Kaisen',
    japaneseTitle: '呪術廻戦',
    englishTitle: 'Jujutsu Kaisen',
    synopsis: 'Yuji Itadori is a boy with tremendous physical strength, though he lives a completely ordinary high school life. One day, to save a classmate attacked by curses, he eats the finger of Ryomen Sukuna, taking the curse into his own soul.',
    posterImage: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx113415-LHBAeoZDIsnF.jpg',
    coverImage: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/113415-jQBSkxWAAk83.jpg',
    bannerImage: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/113415-jQBSkxWAAk83.jpg',
    format: 'TV',
    status: 'COMPLETED',
    releaseYear: 2020,
    rating: 8.8,
    voteCount: 88700,
    durationMinutes: 24,
    studio: 'MAPPA',
    isFeatured: true,
    isTrending: true,
    hasHindiDub: true,
    hasEnglishDub: true,
    hasSubtitles: true,
    genres: ['Action', 'Supernatural', 'Fantasy'],
    aliases: [{ title: 'Sorcery Fight', type: 'ENGLISH' }],
    seasons: [
      {
        seasonNumber: 1,
        title: 'Season 1: Curse Womb & Kyoto Goodwill',
        episodes: [
          "Ryomen Sukuna",
          "For Myself",
          "Girl of Steel",
          "Curse Womb Must Die",
          "Curse Womb Must Die -II-",
          "After Rain",
          "Assault",
          "Boredom",
          "Small Fry and Reverse Retribution",
          "Idle Transfiguration",
          "Narrow-minded",
          "To You, Someday",
          "Tomorrow",
          "Kyoto Sister School Exchange Event - Group Battle 0 -",
          "Kyoto Sister School Exchange Event - Group Battle 1 -",
          "Kyoto Sister School Exchange Event - Group Battle 2 -",
          "Kyoto Sister School Exchange Event - Group Battle 3 -",
          "Sage",
          "Black Flash",
          "Nonstandard",
          "Jujutsu Koshien",
          "The Origin of Blind Obedience",
          "The Origin of Blind Obedience - 2 -",
          "Accomplices"
        ]
      },
      {
        seasonNumber: 2,
        title: 'Season 2: Hidden Inventory & Shibuya Incident',
        episodes: [
          "Hidden Inventory",
          "Hidden Inventory 2",
          "Hidden Inventory 3",
          "Hidden Inventory 4",
          "Premature Death",
          "It's Like That",
          "Evening Festival",
          "The Shibuya Incident",
          "Shibuya Incident - Gate, Open",
          "Pandemonium",
          "Seance",
          "Dull Knife",
          "Red Scale",
          "Fluctuations",
          "Fluctuations, Part 2",
          "Thunderclap",
          "Thunderclap, Part 2",
          "Right and Wrong",
          "Right and Wrong, Part 2",
          "Right and Wrong, Part 3",
          "Metamorphosis",
          "Metamorphosis, Part 2",
          "Shibuya Incident - Gate, Close"
        ]
      }
    ]
  },
  {
    slug: 'attack-on-titan',
    title: 'Attack on Titan',
    japaneseTitle: '進撃の巨人',
    englishTitle: 'Attack on Titan',
    synopsis: 'Centuries ago, mankind was slaughtered by monstrous humanoid creatures called Titans, forcing humans to hide in fear behind enormous concentric walls. What makes these giants truly terrifying is that their taste for human flesh is not born out of hunger but what appears to be out of pleasure.',
    posterImage: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx16498-buvcRTBx4NSm.jpg',
    coverImage: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/16498-8jpFCOcDmneX.jpg',
    bannerImage: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/16498-8jpFCOcDmneX.jpg',
    format: 'TV',
    status: 'COMPLETED',
    releaseYear: 2013,
    rating: 9.1,
    voteCount: 145000,
    durationMinutes: 24,
    studio: 'WIT Studio / MAPPA',
    isFeatured: true,
    isTrending: true,
    hasHindiDub: true,
    hasEnglishDub: true,
    hasSubtitles: true,
    genres: ['Action', 'Drama', 'Fantasy', 'Mystery'],
    aliases: [{ title: 'Shingeki no Kyojin', type: 'ROMAJI' }],
    seasons: [
      {
        seasonNumber: 1,
        title: 'Season 1: Fall of Shiganshina & Battle of Trost',
        episodes: [
          "To You, in 2000 Years: The Fall of Shiganshina, Part 1",
          "That Day: The Fall of Shiganshina, Part 2",
          "A Dim Light Amid Despair: Humanity's Comeback, Part 1",
          "The Night of the Closing Ceremony: Humanity's Comeback, Part 2",
          "First Battle: The Struggle for Trost, Part 1",
          "The World the Girl Saw: The Struggle for Trost, Part 2",
          "Small Blade: The Struggle for Trost, Part 3",
          "I Can Hear His Heartbeat: The Struggle for Trost, Part 4",
          "Whereabouts of His Left Arm: The Struggle for Trost, Part 5",
          "Response: The Struggle for Trost, Part 6",
          "Idol: The Struggle for Trost, Part 7",
          "Wound: The Struggle for Trost, Part 8",
          "Primal Desire: The Struggle for Trost, Part 9",
          "Can't Look into His Eyes Yet: Eve of the Counterattack, Part 1",
          "Special Operations Squad: Eve of the Counterattack, Part 2",
          "What Needs to be Done Now: Eve of the Counterattack, Part 3",
          "Female Titan: The 57th Exterior Scouting Mission, Part 1",
          "Forest of Giant Trees: The 57th Exterior Scouting Mission, Part 2",
          "Bite: The 57th Exterior Scouting Mission, Part 3",
          "Erwin Smith: The 57th Exterior Scouting Mission, Part 4",
          "Crushing Blow: The 57th Exterior Scouting Mission, Part 5",
          "The Defeated: The 57th Exterior Scouting Mission, Part 6",
          "Smile: Assault on Stohess, Part 1",
          "Mercy: Assault on Stohess, Part 2",
          "Wall: Assault on Stohess, Part 3"
        ]
      },
      {
        seasonNumber: 2,
        title: 'Season 2: Clash of the Titans',
        episodes: [
          "Beast Titan",
          "I'm Home",
          "Southwestward",
          "Soldier",
          "Historia",
          "Warrior",
          "Close Combat",
          "The Hunters",
          "Opening",
          "Children",
          "Strike a Blow",
          "Scream"
        ]
      },
      {
        seasonNumber: 3,
        title: 'Season 3: Uprising & Return to Shiganshina',
        episodes: [
          "Smoke Signal",
          "Pain",
          "Old Story",
          "Trust",
          "Reply",
          "Sin",
          "Wish",
          "Outside the Walls of Orvud District",
          "Ruler of the Walls",
          "Friends",
          "Bystander",
          "Night of the Battle to Retake the Wall",
          "The Town Where Everything Began",
          "Thunder Spears",
          "Descent",
          "Perfect Game",
          "Hero",
          "Midnight Sun",
          "The Basement",
          "That Day",
          "Attack Titan",
          "To the Other Side of the Wall"
        ]
      },
      {
        seasonNumber: 4,
        title: 'Season 4: The Final Season',
        episodes: [
          "The Other Side of the Sea",
          "Midnight Train",
          "The Door of Hope",
          "From One Hand to Another",
          "Declaration of War",
          "The War Hammer Titan",
          "Assault",
          "Assassin's Bullet",
          "Brave Volunteers",
          "A Sound Argument",
          "Deceiver",
          "Guides",
          "Children of the Forest",
          "Savagery",
          "Sole Salvation",
          "Above and Below",
          "Judgment",
          "Sneak Attack",
          "Two Brothers",
          "Memories of the Future",
          "From You, 2,000 Years Ago",
          "Thaw",
          "Sunset",
          "Pride",
          "Night of the End",
          "Traitor",
          "Retrospective",
          "The Dawn of Humanity"
        ]
      }
    ]
  },
  {
    slug: 'spy-x-family',
    title: 'Spy x Family',
    japaneseTitle: 'スパイファミリー',
    englishTitle: 'Spy x Family',
    synopsis: 'Master spy Twilight is unmatched at executing undercover missions. But when tasked with the impossible mission of investigating a foreign political leader, he must pose as a family man by adopting a telepathic orphan girl and marrying an undercover assassin.',
    posterImage: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx140960-Kb6R5nYQfjmP.jpg',
    coverImage: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/140960-Z7xSvkRxHKfj.jpg',
    bannerImage: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/140960-Z7xSvkRxHKfj.jpg',
    format: 'TV',
    status: 'COMPLETED',
    releaseYear: 2022,
    rating: 8.6,
    voteCount: 76500,
    durationMinutes: 24,
    studio: 'Wit Studio / CloverWorks',
    isFeatured: true,
    isTrending: true,
    hasHindiDub: true,
    hasEnglishDub: true,
    hasSubtitles: true,
    genres: ['Action', 'Comedy', 'Slice of Life'],
    aliases: [{ title: 'Spy Family', type: 'ENGLISH' }],
    seasons: [
      {
        seasonNumber: 1,
        title: 'Season 1: Operation Strix',
        episodes: [
          "Operation Strix",
          "Secure a Wife",
          "Prepare for the Interview",
          "The Prestigious School's Interview",
          "Will They Pass or Fail",
          "The Friendship Scheme",
          "The Target's Second Son",
          "The Counter-Secret Police Cover Operation",
          "Show Off How in Love You Are",
          "The Great Dodgeball Plan",
          "Stella",
          "Penguin Park",
          "Project Apple",
          "Disarm the Time Bomb",
          "A New Family Member",
          "Yor's Kitchen",
          "Carry Out the Griffin Plan",
          "Uncle the Private Tutor",
          "A Revenge Plot Against Desmond",
          "Investigate the General Hospital",
          "Nightfall",
          "The Underground Tennis Tournament",
          "The Unwavering Path",
          "The Role of a Mother and Wife",
          "First Contact"
        ]
      },
      {
        seasonNumber: 2,
        title: 'Season 2: Cruise Adventure Arc',
        episodes: [
          "Follow Mama and Papa",
          "Bond's Strategy to Stay Alive",
          "Mission and Family",
          "The Pastry of Knowledge",
          "Plan B Nightfall",
          "The Fearful Luxury Cruise",
          "Who is This Mission For?",
          "The Symphony Upon the Ship",
          "The Hand That Connects to the Future",
          "Enjoy the Resort to the Fullest",
          "Berlint's Greatest Detective",
          "Part of the Family"
        ]
      }
    ]
  },
  {
    slug: 'chainsaw-man',
    title: 'Chainsaw Man',
    japaneseTitle: 'チェンソーマン',
    englishTitle: 'Chainsaw Man',
    synopsis: 'Denji is a young man living in poverty with his chainsaw devil pet Pochita, doing whatever it takes to pay off his deceased father\'s massive debt to the yakuza. After being betrayed and slaughtered, he merges with Pochita to become the ultimate Chainsaw Man.',
    posterImage: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx127230-DdP4vAdssLoz.png',
    coverImage: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/127230-o8IRwCGVr9KW.jpg',
    bannerImage: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/127230-o8IRwCGVr9KW.jpg',
    format: 'TV',
    status: 'COMPLETED',
    releaseYear: 2022,
    rating: 8.6,
    voteCount: 82300,
    durationMinutes: 24,
    studio: 'MAPPA',
    isFeatured: true,
    isTrending: true,
    hasHindiDub: true,
    hasEnglishDub: true,
    hasSubtitles: true,
    genres: ['Action', 'Supernatural', 'Horror'],
    aliases: [{ title: 'CSM', type: 'ABBREVIATION' }],
    seasons: [
      {
        seasonNumber: 1,
        title: 'Season 1: Public Safety Arc',
        episodes: [
          "Dog & Chainsaw",
          "Arrival in Tokyo",
          "Meowy's Whereabouts",
          "Rescue",
          "Gun Devil",
          "Kill Denji",
          "The Taste of a Kiss",
          "Gunfire",
          "From Kyoto",
          "Bruised & Battered",
          "Mission Start",
          "Katana vs. Chainsaw"
        ]
      },
      {
        seasonNumber: 2,
        title: 'Season 2: Bomb Girl & Reze Arc',
        episodes: [
          "The Girl and the Typhoon",
          "Reze",
          "Night Swimming",
          "Spark of Terror",
          "Bomb Girl Awoken",
          "The Devil Hunters",
          "Shark Ride",
          "Explosive Love",
          "Café Rendezvous",
          "International Assassins",
          "Santa Claus Arrives",
          "Darkness in the Abyss"
        ]
      }
    ]
  },
  {
    slug: 'frieren-beyond-journeys-end',
    title: 'Frieren: Beyond Journey\'s End',
    japaneseTitle: '葬送のフリーレン',
    englishTitle: 'Frieren: Beyond Journey\'s End',
    synopsis: 'The demon king has been defeated, and the victorious hero party returns home before disbanding. The four—mage Frieren, hero Himmel, priest Heiter, and warrior Eisen—reminisce about their decade-long journey as the time to bid farewell arrives. But for elves, fifty years is just an instant.',
    posterImage: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx154587-qQTzQnEJJ3oB.jpg',
    coverImage: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/154587-ivXNJ23SM1xB.jpg',
    bannerImage: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/154587-ivXNJ23SM1xB.jpg',
    format: 'TV',
    status: 'COMPLETED',
    releaseYear: 2023,
    rating: 9.3,
    voteCount: 65400,
    durationMinutes: 24,
    studio: 'Madhouse',
    isFeatured: true,
    isTrending: true,
    hasHindiDub: true,
    hasEnglishDub: true,
    hasSubtitles: true,
    genres: ['Adventure', 'Drama', 'Fantasy'],
    aliases: [{ title: 'Sousou no Frieren', type: 'ROMAJI' }],
    seasons: [
      {
        seasonNumber: 1,
        title: 'Season 1: First-Class Mage Exam',
        episodes: [
          "The Journey's End",
          "It Didn't Have to Be Magic...",
          "Killing Magic",
          "The Land Where Souls Rest",
          "Phantoms of the Dead",
          "The Hero of the Village",
          "Like a Fairy Tale",
          "Frieren the Slayer",
          "Aura the Guillotine",
          "A Powerful Mage",
          "Winter in the Northern Lands",
          "A Real Hero",
          "Aversion to One's Own Kind",
          "Privilege of the Young",
          "Smells Like Trouble",
          "Long-Lived Friends",
          "Take Care",
          "First-Class Mage Exam",
          "Well-Laid Plans",
          "Necessary Killing",
          "The World of Magic",
          "Future Enemies",
          "Conquering the Labyrinth",
          "Perfect Replicas",
          "Fatal Vulnerability",
          "Height of Magic",
          "An Era of Humans",
          "It Would Be Embarrassing When We Met Again"
        ]
      },
      {
        seasonNumber: 2,
        title: 'Season 2: Northern Plateau Arc',
        episodes: [
          "The Northern Lands Departure",
          "Empire's Magic Academy",
          "A Journey of 1000 Leagues",
          "The Shadow of the Great Mage",
          "The Forgotten Spell",
          "Warrior's Oath",
          "Ancient Labyrinth",
          "A Promise to Himmel",
          "Golden Land El Dorado",
          "The Mage Macht",
          "Gold Transmutation",
          "The Flower Field Memories"
        ]
      }
    ]
  },
  {
    slug: 'death-note',
    title: 'Death Note',
    japaneseTitle: 'デスノート',
    englishTitle: 'Death Note',
    synopsis: 'A high-school student, Light Yagami, discovers a supernatural notebook that grants its user the ability to kill anyone whose name and face they know. Light embarks on a crusade to rid the world of criminals and become the god of a new world, pursued by the enigmatic detective L.',
    posterImage: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx1535-kUgkcrfOrkUM.jpg',
    coverImage: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/1535.jpg',
    bannerImage: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/1535.jpg',
    format: 'TV',
    status: 'COMPLETED',
    releaseYear: 2006,
    rating: 8.9,
    voteCount: 160000,
    durationMinutes: 23,
    studio: 'Madhouse',
    isFeatured: true,
    isTrending: true,
    hasHindiDub: true,
    hasEnglishDub: true,
    hasSubtitles: true,
    genres: ['Mystery', 'Psychological', 'Supernatural', 'Thriller'],
    aliases: [{ title: 'DN', type: 'ABBREVIATION' }],
    seasons: [
      {
        seasonNumber: 1,
        title: 'Season 1: Complete Masterpiece',
        episodes: [
          "Rebirth",
          "Confrontation",
          "Dealings",
          "Pursuit",
          "Tactics",
          "Unraveling",
          "Overcast",
          "Glare",
          "Encounter",
          "Doubt",
          "Assault",
          "Love",
          "Confession",
          "Friend",
          "Wager",
          "Decision",
          "Execution",
          "Ally",
          "Matsuda",
          "Makeshift",
          "Performance",
          "Guidance",
          "Frenzy",
          "Revival",
          "Silence",
          "Renewal",
          "Abduction",
          "Impatience",
          "Father",
          "Justice",
          "Transfer",
          "Selection",
          "Scorn",
          "Vigilance",
          "Malice",
          "1.28",
          "New World"
        ]
      }
    ]
  },
  {
    slug: 'bleach-thousand-year-blood-war',
    title: 'Bleach: Thousand-Year Blood War',
    japaneseTitle: 'BLEACH 千年血戦篇',
    englishTitle: 'Bleach: Thousand-Year Blood War',
    synopsis: 'The peace is suddenly broken when warning sirens blare through the Soul Society. Residents are disappearing without a trace and nobody knows who is behind it. Meanwhile, a dark shadow is also extending itself toward Ichigo and his friends in Karakura Town.',
    posterImage: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx116674-p3zK4PUX2Aag.jpg',
    coverImage: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/116674-l2YlIyJzvGSV.jpg',
    bannerImage: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/116674-l2YlIyJzvGSV.jpg',
    format: 'TV',
    status: 'COMPLETED',
    releaseYear: 2022,
    rating: 9.0,
    voteCount: 52000,
    durationMinutes: 24,
    studio: 'Pierrot',
    isFeatured: true,
    isTrending: true,
    hasHindiDub: true,
    hasEnglishDub: true,
    hasSubtitles: true,
    genres: ['Action', 'Adventure', 'Supernatural'],
    aliases: [{ title: 'Bleach: TYBW', type: 'ABBREVIATION' }],
    seasons: [
      {
        seasonNumber: 1,
        title: 'Season 1: The Blood Warfare',
        episodes: [
          "The Blood Warfare",
          "Foundation Stones",
          "March of the Starcross",
          "Kill The Shadow",
          "Wrath as a Lightning",
          "The Fire",
          "Born in the Dark",
          "The Shooting Star Project (Zero Mix)",
          "The Drop",
          "The Battle",
          "Everything But the Rain",
          "Everything But the Rain: June Truth",
          "The Blade and Me"
        ]
      },
      {
        seasonNumber: 2,
        title: 'Season 2: The Separation',
        episodes: [
          "The Last 9 Days",
          "Peace from Shadows",
          "Heart of Wolf",
          "Rages at Ringside",
          "White Haze",
          "The Headless Star",
          "Marching Out the Zombies",
          "Marching Out the Zombies 2",
          "Too Early to Win, Too Late to Know",
          "Master",
          "Black",
          "A",
          "The Dark Arm"
        ]
      },
      {
        seasonNumber: 3,
        title: 'Season 3: The Conflict',
        episodes: [
          "A Dark Cloud",
          "The Holy Emperor",
          "Gate to the Royal Realm",
          "Zero Squad Stand",
          "Divine Retribution",
          "Blade of the Soul King",
          "The Almighty",
          "The Miracle",
          "The Undefeated",
          "Awakened Blade",
          "Shattered World",
          "Final Arrow",
          "Soul King's Demise"
        ]
      }
    ]
  },
  {
    slug: 'naruto-shippuden',
    title: 'Naruto: Shippuden',
    japaneseTitle: 'NARUTO -ナルト- 疾風伝',
    englishTitle: 'Naruto: Shippuden',
    synopsis: 'Naruto Uzumaki, is a loud, hyperactive, adolescent ninja who constantly searches for approval and recognition, as well as to become Hokage, who is acknowledged as the leader and strongest of all ninja in the village.',
    posterImage: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx1735-kGfVm0YqCPcu.png',
    coverImage: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/1735.jpg',
    bannerImage: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/1735.jpg',
    format: 'TV',
    status: 'COMPLETED',
    releaseYear: 2007,
    rating: 8.7,
    voteCount: 140000,
    durationMinutes: 23,
    studio: 'Pierrot',
    isFeatured: true,
    isTrending: true,
    hasHindiDub: true,
    hasEnglishDub: true,
    hasSubtitles: true,
    genres: ['Action', 'Adventure', 'Fantasy'],
    aliases: [{ title: 'Naruto Shippuuden', type: 'ROMAJI' }],
    seasons: [
      {
        seasonNumber: 1,
        title: 'Season 1: Kazekage Rescue',
        episodes: [
          "Homecoming",
          "The Akatsuki Makes Its Move",
          "The Results of Training",
          "The Jinchuriki of the Sand",
          "The Kazekage Stands Tall",
          "Mission Cleared",
          "Run, Kankuro",
          "Team Kakashi Deployed",
          "The Jinchuriki's Tears",
          "Sealing Technique: Phantom Dragons",
          "The Medical Ninja's Student",
          "The Retired Granny's Determination",
          "A Meeting With Destiny",
          "Naruto's Growth",
          "The Secret Weapon is Called...",
          "The Secret of Jinchuriki",
          "The Death of Gaara!",
          "Charge Tactic! Button Hook Entry!!",
          "Traps Activated! Team Guy's Enemy",
          "Hiruko vs. Two Kunoichi!"
        ]
      },
      {
        seasonNumber: 2,
        title: 'Season 2: Immortal Devastators',
        episodes: [
          "Sasori's Real Face",
          "Chiyo's Secret Skills",
          "Father and Mother",
          "The Third Kazekage",
          "Three Minutes Between Life and Death",
          "10 Puppets vs. 100 Puppets",
          "Impossible Dream",
          "Beasts: Alive Again!",
          "Kakashi Enlightened!",
          "Aesthetic of an Instant",
          "The Next Kazekage",
          "The Secret Plan is Unleashed!",
          "The Target Appears",
          "The Akatsuki's Invincible Duo",
          "Shikamaru's Genius",
          "When You Curse Someone, You Dig Two Graves",
          "Wind Style: Rasenshuriken!",
          "The Price of Power",
          "Asuma's Last Words",
          "The Will of Fire Lives On"
        ]
      }
    ]
  },
  {
    slug: 'one-piece',
    title: 'One Piece: Egghead Arc',
    japaneseTitle: 'ワンピース エッグヘッド編',
    englishTitle: 'One Piece: Egghead Arc',
    synopsis: 'Monkey D. Luffy refuses to let anyone or anything stand in the way of his quest to become the king of all pirates. With a course charted for the treacherous waters of the Grand Line and beyond, this is one captain who\'ll never give up until he\'s claimed the greatest treasure on Earth: the Legendary One Piece!',
    posterImage: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx21-ELSYx3yMPcKM.jpg',
    coverImage: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/21-wf37VakJmZqs.jpg',
    bannerImage: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/21-wf37VakJmZqs.jpg',
    format: 'TV',
    status: 'ONGOING',
    releaseYear: 1999,
    rating: 8.9,
    voteCount: 175000,
    durationMinutes: 24,
    studio: 'Toei Animation',
    isFeatured: true,
    isTrending: true,
    hasHindiDub: true,
    hasEnglishDub: true,
    hasSubtitles: true,
    genres: ['Action', 'Adventure', 'Comedy', 'Fantasy'],
    aliases: [{ title: 'OP', type: 'ABBREVIATION' }],
    seasons: [
      {
        seasonNumber: 1,
        title: 'Season 1: Wano Climax & Gear 5 Awakening',
        episodes: [
          "Overwhelming Strength! The Straw Hats Come Together!",
          "The Decisive Battle! Onigashima Infiltration!",
          "Kaido's Trump Card! The Flying Six Appear!",
          "Tears of Regret! The Fate of the Akazaya!",
          "The Dragon and the Tiger! The Fierce Clash!",
          "Raging Sea! The Worst Generation Arrives!",
          "A Monster Battle! Luffy vs. Kaido!",
          "Big Mom's Rage! The Iron-Balloon Falls!",
          "Zoro's Fierce Strike! Enma's True Power!",
          "King of Hell! Zoro vs. King!",
          "Sanji's Awakening! The Science of Germa!",
          "Law and Kid! The Final Awakened Attack!",
          "The Fall of an Emperor! Big Mom Defeated!",
          "Luffy's Defeat?! The Tragic Intervention!",
          "The Drums of Liberation! Sun God Nika!",
          "Peak of Power! Gear 5 Unleashed!",
          "The Fist of Freedom! Kaido's Reckoning!",
          "Dawn of Wano! The Kozuki Clan Restored!",
          "New Emperors of the Sea!",
          "Setting Sail for the Future!"
        ]
      },
      {
        seasonNumber: 2,
        title: 'Season 2: Egghead Island Arc',
        episodes: [
          "A New Voyage! The Island of the Future!",
          "Dr. Vegapunk! The Genius of 500 Years!",
          "The Six Vegapunks! Punk Records Revealed!",
          "CP0 Arrives! Lucci's Vengeance!",
          "Gear 5 vs. Awakened Leopard!",
          "The Seraphim Attack! Unstoppable Weapons!",
          "The Frontier Dome Trapped!",
          "The Secret of Bartholomew Kuma!",
          "The Memory of Bonney!",
          "Admiral Kizaru Approaches Egghead!",
          "Five Elders Descend! Saint Jaygarcia Saturn!",
          "The Ancient Giant Robot Moves!",
          "Iron Giant's Apology!",
          "The Truth of the Void Century!",
          "Vegapunk's Worldwide Broadcast!",
          "The Sun God Returns!",
          "World Trembles! Message to Humanity!",
          "The Five Elders in Full Demon Form!",
          "The Escape from Future Island!",
          "Towards Elbaf, Land of Giants!"
        ]
      }
    ]
  },
  {
    slug: 'your-name',
    title: 'Your Name (Kimi no Na wa)',
    japaneseTitle: '君の名は。',
    englishTitle: 'Your Name.',
    synopsis: 'Mitsuha Miyamizu, a high school girl living in the town of Itomori, is fed up with her rural life. In Tokyo, Taki Tachibana lives a busy life as a high school student while working part-time. One day, Mitsuha wakes up in a room that is not hers and suddenly finds herself living the dream life in Tokyo—inside Taki\'s body!',
    posterImage: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx21519-SUo3ZQuCbYhJ.png',
    coverImage: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/21519-1ayMXgNlmByb.jpg',
    bannerImage: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/21519-1ayMXgNlmByb.jpg',
    format: 'MOVIE',
    status: 'COMPLETED',
    releaseYear: 2016,
    rating: 9.0,
    voteCount: 110000,
    durationMinutes: 106,
    studio: 'CoMix Wave Films',
    isFeatured: true,
    isTrending: true,
    hasHindiDub: true,
    hasEnglishDub: true,
    hasSubtitles: true,
    genres: ['Drama', 'Romance', 'Supernatural'],
    aliases: [{ title: 'Kimi no Na wa', type: 'ROMAJI' }],
    seasons: [
      {
        seasonNumber: 1,
        title: 'Feature Film Editions',
        episodes: [
          "Full Feature Film (Hindi & English Dub, Japanese Sub)",
          "Special Director's Cut & Orchestral Edition"
        ]
      }
    ]
  }
];

function generateFile() {
  const seedDataPath = path.resolve(__dirname, '../apps/api/prisma/seed-data.ts');
  const existing = fs.readFileSync(seedDataPath, 'utf8');

  const genresMatch = existing.slice(0, existing.indexOf('export const SEED_ANIMES'));
  const schedMatch = existing.slice(existing.indexOf('export const SEED_SCHEDULE'));

  let animeCount = 0;
  let totalEpisodes = 0;

  const generatedAnimes = CATALOG_DATA.map((anime, aIdx) => {
    animeCount++;
    let epGlobalIdx = 0;

    const seasons = anime.seasons.map((s) => {
      const episodes = s.episodes.map((epTitle, epIdx) => {
        epGlobalIdx++;
        totalEpisodes++;
        const epNum = epIdx + 1;
        const sources = getSources(aIdx, epGlobalIdx);
        return {
          episodeNumber: epNum,
          title: epTitle,
          synopsis: `${anime.title} - ${s.title}: Episode ${epNum}. Follow the thrilling narrative unfold with high stakes and stunning animation.`,
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

    // Flattened episodes for legacy compatibility
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

  console.log(`Generated ${animeCount} animes with a total of ${totalEpisodes} full episodes!`);
}

generateFile();
