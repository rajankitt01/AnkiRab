const fs = require('fs');
const path = require('path');

const STREAM_POOL = [
  {
    provider: 'ANKIRAB Adaptive HLS Master',
    format: 'HLS',
    quality: 'auto',
    url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8'
  },
  {
    provider: 'ANKIRAB Sintel Anime Action',
    format: 'MP4',
    quality: '720p',
    url: 'https://media.w3.org/2010/05/sintel/trailer.mp4'
  },
  {
    provider: 'ANKIRAB Apple fMP4 Stream',
    format: 'HLS',
    quality: 'auto',
    url: 'https://devstreaming-cdn.apple.com/videos/streaming/examples/img_bipbop_adv_example_fmp4/master.m3u8'
  },
  {
    provider: 'ANKIRAB Oceans Cinema 1080p',
    format: 'MP4',
    quality: '1080p',
    url: 'https://vjs.zencdn.net/v/oceans.mp4'
  },
  {
    provider: 'ANKIRAB Apple 16x9 HD Stream',
    format: 'HLS',
    quality: 'auto',
    url: 'https://devstreaming-cdn.apple.com/videos/streaming/examples/bipbop_16x9/bipbop_16x9_variant.m3u8'
  },
  {
    provider: 'ANKIRAB Blue Moon 1080p HD',
    format: 'MP4',
    quality: '1080p',
    url: 'https://cdn.plyr.io/static/demo/View_From_A_Blue_Moon_Trailer-1080p.mp4'
  },
  {
    provider: 'ANKIRAB Fast Paced Action HLS',
    format: 'HLS',
    quality: 'auto',
    url: 'https://test-streams.mux.dev/test_001/stream.m3u8'
  },
  {
    provider: 'ANKIRAB Surfing Action HD',
    format: 'MP4',
    quality: '720p',
    url: 'https://filesamples.com/samples/video/mp4/sample_1280x720_surfing_with_audio.mp4'
  },
  {
    provider: 'ANKIRAB Apple 4x3 Multi-Stream',
    format: 'HLS',
    quality: 'auto',
    url: 'https://devstreaming-cdn.apple.com/videos/streaming/examples/bipbop_4x3/bipbop_4x3_variant.m3u8'
  },
  {
    provider: 'ANKIRAB Blue Moon 720p HD',
    format: 'MP4',
    quality: '720p',
    url: 'https://cdn.plyr.io/static/demo/View_From_A_Blue_Moon_Trailer-720p.mp4'
  },
  {
    provider: 'ANKIRAB Coral Reef Cinematic',
    format: 'MP4',
    quality: '480p',
    url: 'https://filesamples.com/samples/video/mp4/sample_960x400_ocean_with_audio.mp4'
  },
  {
    provider: 'ANKIRAB Animation Classic 480p',
    format: 'MP4',
    quality: '480p',
    url: 'https://raw.githubusercontent.com/bower-media-samples/big-buck-bunny-480p-30s/master/video.mp4'
  }
];

function getVideoSourcesForEpisode(animeIdx, seasonNumber, episodeNumber) {
  const primaryIdx = (animeIdx * 7 + (seasonNumber - 1) * 3 + (episodeNumber - 1)) % STREAM_POOL.length;
  const primary = STREAM_POOL[primaryIdx];
  
  return [
    {
      provider: primary.provider,
      quality: primary.quality,
      format: primary.format,
      url: primary.url,
      isMaster: true
    },
    {
      provider: 'ANKIRAB Full HD 1080p',
      quality: '1080p',
      format: 'MP4',
      url: 'https://cdn.plyr.io/static/demo/View_From_A_Blue_Moon_Trailer-1080p.mp4',
      isMaster: false
    },
    {
      provider: 'ANKIRAB HD 720p',
      quality: '720p',
      format: 'MP4',
      url: 'https://media.w3.org/2010/05/sintel/trailer.mp4',
      isMaster: false
    },
    {
      provider: 'ANKIRAB SD 480p',
      quality: '480p',
      format: 'MP4',
      url: 'https://raw.githubusercontent.com/bower-media-samples/big-buck-bunny-480p-30s/master/video.mp4',
      isMaster: false
    }
  ];
}

const SEED_GENRES = [
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

const RAW_ANIMES = [
  {
    slug: 'solo-leveling',
    title: 'Solo Leveling: Arise',
    japaneseTitle: '俺だけレベルアップな件',
    englishTitle: 'Solo Leveling',
    synopsis: 'In a world where hunters must battle deadly monsters to protect humanity, Sung Jinwoo, notoriously known as the weakest hunter of all mankind, finds himself in a fatal double dungeon. On the brink of death, a mysterious quest window appears before him, granting him the unique ability to level up infinitely.',
    posterImage: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx151807-it355ZgzquUd.png',
    coverImage: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/151807-37yfQA3ym8PA.jpg',
    bannerImage: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/151807-37yfQA3ym8PA.jpg',
    format: 'TV',
    status: 'ONGOING',
    releaseYear: 2024,
    rating: 8.9,
    voteCount: 19400,
    episodeCount: 18,
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
    seasons: [
      {
        seasonNumber: 1,
        title: 'Season 1: Shadow Monarch Awakening',
        episodes: [
          { episodeNumber: 1, title: "I'm Used to It", synopsis: "E-Rank Hunter Sung Jinwoo enters a low-rank dungeon with a raiding party, encountering a hidden secondary lair fraught with terrifying stone god statues.", thumbnail: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/151807-37yfQA3ym8PA.jpg', durationMinutes: 24 },
          { episodeNumber: 2, title: 'If I Had One More Chance', synopsis: 'Faced with annihilation by the colossi of the Cartenon Temple, Jinwoo solves the dungeon Commandments as his final sacrifice unlocks a mysterious system.', thumbnail: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/151807-37yfQA3ym8PA.jpg', durationMinutes: 24 },
          { episodeNumber: 3, title: "It's Like a Game", synopsis: 'Jinwoo wakes up alive in a hospital bed. Floating system interfaces only visible to him instruct daily quests to train and awaken new power.', thumbnail: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/151807-37yfQA3ym8PA.jpg', durationMinutes: 24 },
          { episodeNumber: 4, title: "I've Gotta Get Stronger", synopsis: 'Jinwoo enters an isolated Subway Dungeon instance to test his growing parameters against demonic canines and the colossal Blue Poison-Fanged Kasaka.', thumbnail: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/151807-37yfQA3ym8PA.jpg', durationMinutes: 24 },
          { episodeNumber: 5, title: 'A Pretty Good Deal', synopsis: 'Jinwoo agrees to join Hwang Dongsuk\'s strike squad for a C-Rank dungeon excursion alongside rookie hunter Yoo Jinho.', thumbnail: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/151807-37yfQA3ym8PA.jpg', durationMinutes: 24 },
          { episodeNumber: 6, title: 'The Real Hunt Begins', synopsis: 'Trapped inside the giant arachnid boss chamber, Jinwoo eliminates the beast and receives a grim survival decree from the System.', thumbnail: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/151807-37yfQA3ym8PA.jpg', durationMinutes: 24 },
          { episodeNumber: 7, title: "Let's See How Far I Can Go", synopsis: 'Jinwoo acquires the recipe for the Elixir of Life to awaken his mother from Eternal Slumber and challenges the flaming gates of the Demon Castle.', thumbnail: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/151807-37yfQA3ym8PA.jpg', durationMinutes: 24 },
          { episodeNumber: 8, title: 'This Is Frustrating', synopsis: 'Jinwoo is reunited with surviving members of the Cartenon raid for a disciplinary dungeon raid under the supervision of Kang Taeshik.', thumbnail: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/151807-37yfQA3ym8PA.jpg', durationMinutes: 24 },
          { episodeNumber: 9, title: "You've Been Hiding Your Skills", synopsis: 'Kang Taeshik reveals his covert assassinations. Jinwoo unleashes his true awakened power to protect Song Chi-yul and Lee Joohee.', thumbnail: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/151807-37yfQA3ym8PA.jpg', durationMinutes: 24 },
          { episodeNumber: 10, title: 'What Is This, a Picnic?', synopsis: 'Jinwoo and Jinho complete dozens of dungeon raids to fulfill Jinho\'s guild license requirements while evading White Tiger Guild notice.', thumbnail: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/151807-37yfQA3ym8PA.jpg', durationMinutes: 24 },
          { episodeNumber: 11, title: 'A Knight Who Defends an Empty Throne', synopsis: 'Jinwoo undertakes his official Job Change Quest inside an ominous royal throne room, locking blades with the red-armored Blood-Red Commander Igris.', thumbnail: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/151807-37yfQA3ym8PA.jpg', durationMinutes: 24 },
          { episodeNumber: 12, title: 'Arise', synopsis: 'Pushed to the brink by an endless legion of armored knights, Jinwoo unlocks the Necromancy class and issues the legendary command: "Arise".', thumbnail: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/151807-37yfQA3ym8PA.jpg', durationMinutes: 24 }
        ]
      },
      {
        seasonNumber: 2,
        title: 'Season 2: Arise from the Shadow',
        episodes: [
          { episodeNumber: 1, title: 'A World Beyond Gates', synopsis: 'As high-ranking gates spawn across the peninsula, Jinwoo prepares to clear Red Gates alongside top Hunters Association elites.', thumbnail: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/151807-37yfQA3ym8PA.jpg', durationMinutes: 24 },
          { episodeNumber: 2, title: 'Red Gate Survival', synopsis: 'Jinwoo leads the trainees trapped inside a sub-zero snowy dimension, commanding Igris and newly drafted shadow soldiers against Ice Elves.', thumbnail: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/151807-37yfQA3ym8PA.jpg', durationMinutes: 24 },
          { episodeNumber: 3, title: 'Demon Castle Revisit', synopsis: 'With elevated stats, Jinwoo ascends the higher levels of the Demon Castle to gather ingredients for the Holy Water of Life.', thumbnail: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/151807-37yfQA3ym8PA.jpg', durationMinutes: 24 },
          { episodeNumber: 4, title: 'Jeju Island Shadows', synopsis: 'Ant monsters begin evolving wings and invading civilian shores. Japan and Korea organize an allied S-Rank raid strike force.', thumbnail: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/151807-37yfQA3ym8PA.jpg', durationMinutes: 24 },
          { episodeNumber: 5, title: "Monarch's Wrath", synopsis: 'The Ant King slaughters vanguard S-Rank hunters. Sung Jinwoo arrives via Shadow Exchange to turn the tide.', thumbnail: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/151807-37yfQA3ym8PA.jpg', durationMinutes: 24 },
          { episodeNumber: 6, title: 'Beru the Shadow Marshal', synopsis: 'Jinwoo defeats the Ant King and resurrects him as Beru, cementing his standing as humanity\'s supreme protector.', thumbnail: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/151807-37yfQA3ym8PA.jpg', durationMinutes: 24 }
        ]
      }
    ]
  },
  {
    slug: 'demon-slayer',
    title: 'Demon Slayer: Kimetsu no Yaiba',
    japaneseTitle: '鬼滅の刃',
    englishTitle: 'Demon Slayer',
    synopsis: 'After his family is slaughtered by demons and his sister Nezuko is transformed into one, Tanjiro Kamado joins the Demon Slayer Corps to avenge his kin and find a cure to turn Nezuko back into a human.',
    posterImage: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx101922-WBsBl0ClmgYL.jpg',
    coverImage: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/101922-33MtJGsUSxga.jpg',
    bannerImage: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/101922-33MtJGsUSxga.jpg',
    format: 'TV',
    status: 'ONGOING',
    releaseYear: 2019,
    rating: 8.8,
    voteCount: 42000,
    episodeCount: 20,
    durationMinutes: 24,
    studio: 'ufotable',
    isFeatured: true,
    isTrending: true,
    hasHindiDub: true,
    hasEnglishDub: true,
    hasSubtitles: true,
    genres: ['Action', 'Fantasy', 'Supernatural', 'Shounen'],
    aliases: [{ title: 'Blade of Demon Destruction', type: 'ENGLISH' }],
    seasons: [
      {
        seasonNumber: 1,
        title: 'Season 1: Unwavering Resolve Arc',
        episodes: [
          { episodeNumber: 1, title: 'Cruelty', synopsis: 'Tanjiro returns home to find his family slaughtered by demons and discovers Nezuko has been transformed into a bloodthirsty demon.', thumbnail: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/101922-33MtJGsUSxga.jpg', durationMinutes: 24 },
          { episodeNumber: 2, title: 'Trainer Sakonji Urokodaki', synopsis: 'Under Giyu Tomioka\'s instruction, Tanjiro and Nezuko journey to Mt. Sagiri to meet the former Water Hashira Sakonji Urokodaki.', thumbnail: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/101922-33MtJGsUSxga.jpg', durationMinutes: 24 },
          { episodeNumber: 3, title: 'Sabito and Makomo', synopsis: 'Tanjiro spends two grueling years training on Mt. Sagiri, receiving tutelage from the spirits of Sabito and Makomo.', thumbnail: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/101922-33MtJGsUSxga.jpg', durationMinutes: 24 },
          { episodeNumber: 4, title: 'Final Selection', synopsis: 'Tanjiro arrives at Mt. Fujikasane for the Final Selection exam, encountering the monstrous Hand Demon.', thumbnail: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/101922-33MtJGsUSxga.jpg', durationMinutes: 24 },
          { episodeNumber: 5, title: 'My Own Steel', synopsis: 'Having survived the Final Selection, Tanjiro chooses his own Tamahagane ore and receives his Demon Slayer Corps uniform.', thumbnail: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/101922-33MtJGsUSxga.jpg', durationMinutes: 24 },
          { episodeNumber: 6, title: 'Swordsman Accompanying a Demon', synopsis: 'Tanjiro receives his black Nichirin sword from swordsmith Hotaru Haganezuka and departs on his first official mission.', thumbnail: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/101922-33MtJGsUSxga.jpg', durationMinutes: 24 },
          { episodeNumber: 7, title: 'Muzan Kibutsuji', synopsis: 'Tanjiro reaches Asakusa Tokyo and catches the terrifying scent of Muzan Kibutsuji living disguised among humans.', thumbnail: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/101922-33MtJGsUSxga.jpg', durationMinutes: 24 },
          { episodeNumber: 8, title: 'The Scent of Enchanting Blood', synopsis: 'Demon physician Lady Tamayo and her assistant Yushiro shelter Tanjiro from Muzan\'s pursuing assassins Susamaru and Yahaba.', thumbnail: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/101922-33MtJGsUSxga.jpg', durationMinutes: 24 }
        ]
      },
      {
        seasonNumber: 2,
        title: 'Season 2: Mugen Train & Entertainment District',
        episodes: [
          { episodeNumber: 1, title: 'Flame Hashira Kyojuro Rengoku', synopsis: 'Tanjiro, Zenitsu, and Inosuke board the Mugen Train to rendezvous with Flame Hashira Kyojuro Rengoku.', thumbnail: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/101922-33MtJGsUSxga.jpg', durationMinutes: 24 },
          { episodeNumber: 2, title: 'Deep Sleep', synopsis: 'Lower Rank One demon Enmu uses Blood Demon Art to trap the demon slayers in sweet, intoxicating dreams.', thumbnail: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/101922-33MtJGsUSxga.jpg', durationMinutes: 24 },
          { episodeNumber: 3, title: 'Should Have Been', synopsis: 'Tanjiro makes the ultimate sacrifice in his dream to awaken and severs Enmu\'s neck with Hinokami Kagura.', thumbnail: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/101922-33MtJGsUSxga.jpg', durationMinutes: 24 },
          { episodeNumber: 4, title: "Akaza's Arrival", synopsis: 'Upper Rank Three Akaza appears out of the shadows, challenging Rengoku to an earth-shattering duel of fist and flame.', thumbnail: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/101922-33MtJGsUSxga.jpg', durationMinutes: 24 },
          { episodeNumber: 5, title: 'Sound Hashira Tengen Uzui', synopsis: 'Sound Hashira Tengen Uzui recruits Tanjiro and his comrades for an undercover infiltration of Yoshiwara.', thumbnail: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/101922-33MtJGsUSxga.jpg', durationMinutes: 24 },
          { episodeNumber: 6, title: 'Infiltration of the Red-Light District', synopsis: 'Tanjiro, Zenitsu, and Inosuke dress as courtesans to track Uzui\'s missing ninja wives across competing oiran houses.', thumbnail: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/101922-33MtJGsUSxga.jpg', durationMinutes: 24 },
          { episodeNumber: 7, title: 'Never Give Up', synopsis: 'Tanjiro and Tengen join forces in a climax against Upper Rank Six siblings Daki and Gyutaro.', thumbnail: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/101922-33MtJGsUSxga.jpg', durationMinutes: 24 }
        ]
      },
      {
        seasonNumber: 3,
        title: 'Season 3: Swordsmith Village Arc',
        episodes: [
          { episodeNumber: 1, title: "Someone's Dream", synopsis: 'Tanjiro travels to the hidden Swordsmith Village to repair his blade and encounters Love Hashira Mitsuri Kanroji.', thumbnail: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/101922-33MtJGsUSxga.jpg', durationMinutes: 24 },
          { episodeNumber: 2, title: 'Yoriichi Type Zero', synopsis: 'Tanjiro trains against an ancient six-armed mechanical combat doll modelled after the legendary Sun Breather.', thumbnail: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/101922-33MtJGsUSxga.jpg', durationMinutes: 24 },
          { episodeNumber: 3, title: 'A Sword from Over 300 Years Ago', synopsis: 'Tanjiro discovers a rust-covered ancestral blade inside the mechanical doll as Upper Rank demons infiltrate the village.', thumbnail: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/101922-33MtJGsUSxga.jpg', durationMinutes: 24 },
          { episodeNumber: 4, title: 'Thank You, Tokito-kun', synopsis: 'Mist Hashira Muichiro Tokito awakens his Slayer Mark and decapitates Upper Rank Five Gyokko in single combat.', thumbnail: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/101922-33MtJGsUSxga.jpg', durationMinutes: 24 },
          { episodeNumber: 5, title: 'A Connected Bond: Daybreak and First Light', synopsis: 'Tanjiro cuts down Hantengu at sunrise as Nezuko conquers the sun, changing the fate of all demons forever.', thumbnail: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/101922-33MtJGsUSxga.jpg', durationMinutes: 24 }
        ]
      }
    ]
  },
  {
    slug: 'jujutsu-kaisen',
    title: 'Jujutsu Kaisen',
    japaneseTitle: '呪術廻戦',
    englishTitle: 'Jujutsu Kaisen',
    synopsis: 'High school student Yuji Itadori swallows a cursed finger to save his friends, becoming the host of Ryomen Sukuna, the undisputed King of Curses. Guided by Satoru Gojo, Yuji enters Tokyo Jujutsu High.',
    posterImage: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx113415-LHBAeoZDIsnF.jpg',
    coverImage: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/113415-jQTojadLFNYC.jpg',
    bannerImage: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/113415-jQTojadLFNYC.jpg',
    format: 'TV',
    status: 'ONGOING',
    releaseYear: 2020,
    rating: 8.7,
    voteCount: 38000,
    episodeCount: 16,
    durationMinutes: 24,
    studio: 'MAPPA',
    isFeatured: true,
    isTrending: true,
    hasHindiDub: true,
    hasEnglishDub: true,
    hasSubtitles: true,
    genres: ['Action', 'Fantasy', 'Supernatural'],
    aliases: [{ title: 'JJK', type: 'SYNONYM' }],
    seasons: [
      {
        seasonNumber: 1,
        title: 'Season 1: Cursed Womb & Goodwill Event',
        episodes: [
          { episodeNumber: 1, title: 'Ryomen Sukuna', synopsis: 'Yuji Itadori encounters Megumi Fushiguro and ingests Sukuna\'s rotting finger to overcome a terrifying grade curse.', thumbnail: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/113415-jQTojadLFNYC.jpg', durationMinutes: 24 },
          { episodeNumber: 2, title: 'For Myself', synopsis: 'Gojo tests Yuji\'s cursed energy control at Jujutsu High and introduces him to Principal Yaga.', thumbnail: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/113415-jQTojadLFNYC.jpg', durationMinutes: 24 },
          { episodeNumber: 3, title: 'Girl of Steel', synopsis: 'Nobara Kugisaki joins the first-year team for a curse extermination mission in Roppongi.', thumbnail: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/113415-jQTojadLFNYC.jpg', durationMinutes: 24 },
          { episodeNumber: 4, title: 'Curse Womb Must Die', synopsis: 'The first-years are sent to Eishu Detention Center, where a Special Grade cursed womb has materialized.', thumbnail: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/113415-jQTojadLFNYC.jpg', durationMinutes: 24 },
          { episodeNumber: 5, title: 'Curse Womb Must Die -II-', synopsis: 'Sukuna rips out Yuji\'s heart and clashes with Megumi outside the facility.', thumbnail: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/113415-jQTojadLFNYC.jpg', durationMinutes: 24 },
          { episodeNumber: 6, title: 'After Rain', synopsis: 'While Yuji trains in secret with Gojo, Megumi and Nobara train with upperclassmen Maki, Toge, and Panda.', thumbnail: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/113415-jQTojadLFNYC.jpg', durationMinutes: 24 },
          { episodeNumber: 7, title: 'Assault', synopsis: 'Special Grade curse Jogo ambushes Gojo Satoru, who reveals the overwhelming majesty of his Domain Expansion: Unlimited Void.', thumbnail: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/113415-jQTojadLFNYC.jpg', durationMinutes: 24 },
          { episodeNumber: 8, title: 'Boredom', synopsis: 'Kyoto Jujutsu High students Aoi Todo and Mai Zenin arrive in Tokyo ahead of the sister school Goodwill Event.', thumbnail: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/113415-jQTojadLFNYC.jpg', durationMinutes: 24 }
        ]
      },
      {
        seasonNumber: 2,
        title: 'Season 2: Hidden Inventory & Shibuya Incident',
        episodes: [
          { episodeNumber: 1, title: 'Hidden Inventory', synopsis: 'Spring 2006: Satoru Gojo and Suguru Geto receive a mission to protect the Star Plasma Vessel Riko Amanai.', thumbnail: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/113415-jQTojadLFNYC.jpg', durationMinutes: 24 },
          { episodeNumber: 2, title: 'Premature Death', synopsis: 'Sorcerer Killer Toji Fushiguro breaches Jujutsu High security with the Inverted Spear of Heaven.', thumbnail: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/113415-jQTojadLFNYC.jpg', durationMinutes: 24 },
          { episodeNumber: 3, title: 'Gate Open: Shibuya', synopsis: 'October 31, 2019: A massive curtain drops over Shibuya, trapping thousands of civilians who demand Satoru Gojo.', thumbnail: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/113415-jQTojadLFNYC.jpg', durationMinutes: 24 },
          { episodeNumber: 4, title: 'Pandemonium', synopsis: 'Gojo battles Jogo, Hanami, and Choso inside the crowded subway before encountering the Prison Realm.', thumbnail: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/113415-jQTojadLFNYC.jpg', durationMinutes: 24 },
          { episodeNumber: 5, title: 'Metamorphosis', synopsis: 'Mahito triggers Idle Transfiguration across Shibuya while Yuji and Nanami fight through cursed hordes.', thumbnail: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/113415-jQTojadLFNYC.jpg', durationMinutes: 24 },
          { episodeNumber: 6, title: 'Thunderclap', synopsis: 'Sukuna awakens with 15 fingers and summons the Divine General Mahoraga in a catastrophic clash of domains.', thumbnail: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/113415-jQTojadLFNYC.jpg', durationMinutes: 24 },
          { episodeNumber: 7, title: 'Right and Wrong', synopsis: 'Aoi Todo joins Yuji against Mahito in a final dance of Black Flash and Boogie Woogie.', thumbnail: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/113415-jQTojadLFNYC.jpg', durationMinutes: 24 },
          { episodeNumber: 8, title: 'Yukari', synopsis: 'Kenjaku absorbs Mahito and unleashes the Culling Game, plunging Japan into supernatural anarchy.', thumbnail: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/113415-jQTojadLFNYC.jpg', durationMinutes: 24 }
        ]
      }
    ]
  },
  {
    slug: 'frieren-beyond-journeys-end',
    title: "Frieren: Beyond Journey's End",
    japaneseTitle: '葬送のフリーレン',
    englishTitle: "Frieren: Beyond Journey's End",
    synopsis: 'The demon king has been defeated, and the victorious hero party disbands. Decades later, elven mage Frieren witnesses the death of hero Himmel and embarks on a new voyage to understand the fleeting warmth of mortal hearts.',
    posterImage: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx154587-n2bGQYVoWWsq.png',
    coverImage: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/154587-iv4AHrAGrVvX.jpg',
    bannerImage: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/154587-iv4AHrAGrVvX.jpg',
    format: 'TV',
    status: 'COMPLETED',
    releaseYear: 2023,
    rating: 9.1,
    voteCount: 31000,
    episodeCount: 10,
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
        title: 'Season 1: Journey to Aureole',
        episodes: [
          { episodeNumber: 1, title: "The Journey's End", synopsis: 'After defeating the Demon King, Frieren observes the Era Meteors with her party and departs on a 50-year magical journey.', thumbnail: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/154587-iv4AHrAGrVvX.jpg', durationMinutes: 24 },
          { episodeNumber: 2, title: "It Didn't Have to Be Magic...", synopsis: 'Frieren visits the aging priest Heiter and adopts the brilliant orphaned war apprentice Fern.', thumbnail: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/154587-iv4AHrAGrVvX.jpg', durationMinutes: 24 },
          { episodeNumber: 3, title: 'Killing Magic', synopsis: 'Frieren and Fern visit a village protected by Qual the Elder, unsealing the demon to demonstrate the modern refinement of Zoltraak.', thumbnail: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/154587-iv4AHrAGrVvX.jpg', durationMinutes: 24 },
          { episodeNumber: 4, title: 'The Land Where Souls Rest', synopsis: 'Frieren unearths Flamme\'s magical grimoire in the woods, revealing that Aureole at the world\'s northern edge is where spirits congregate.', thumbnail: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/154587-iv4AHrAGrVvX.jpg', durationMinutes: 24 },
          { episodeNumber: 5, title: 'Phantoms of the Dead', synopsis: 'In the Einst Basin, the party encounters the Phantom Demon Einsam, which projects illusions of Himmel to lure travelers.', thumbnail: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/154587-iv4AHrAGrVvX.jpg', durationMinutes: 24 },
          { episodeNumber: 6, title: 'The Hero of the Village', synopsis: 'Warrior Stark, apprentice of Eisen, overcomes his cowardice to slay the Solar Dragon terrorizing the mountain pass.', thumbnail: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/154587-iv4AHrAGrVvX.jpg', durationMinutes: 24 }
        ]
      },
      {
        seasonNumber: 2,
        title: 'Season 2: First-Class Mage Exam',
        episodes: [
          { episodeNumber: 1, title: 'Like a Fairy Tale', synopsis: 'Frieren and Fern arrive in the holy city of Äußerst to challenge the Continental Magic Association\'s First-Class Mage Exam.', thumbnail: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/154587-iv4AHrAGrVvX.jpg', durationMinutes: 24 },
          { episodeNumber: 2, title: 'Privilege of the Chosen', synopsis: 'The examinees must capture the evasive Stille bird in the enchanted ruins, forming tense tactical alliances.', thumbnail: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/154587-iv4AHrAGrVvX.jpg', durationMinutes: 24 },
          { episodeNumber: 3, title: 'Mirror Demon Labyrinth', synopsis: 'In the second exam, the mages descend into the Tomb of the Ruin King where mirror clones mirror their exact magical repertoires.', thumbnail: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/154587-iv4AHrAGrVvX.jpg', durationMinutes: 24 },
          { episodeNumber: 4, title: 'The Era of Humans', synopsis: 'Frieren stands before Great Mage Serie for the final interview, continuing her timeless journey northward.', thumbnail: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/154587-iv4AHrAGrVvX.jpg', durationMinutes: 24 }
        ]
      }
    ]
  },
  {
    slug: 'attack-on-titan',
    title: 'Attack on Titan',
    japaneseTitle: '進撃の巨人',
    englishTitle: 'Attack on Titan',
    synopsis: 'After his hometown is destroyed and his mother is killed by Titans, Eren Yeager vows to cleanse the earth of the giant humanoids that have brought humanity to the brink of extinction.',
    posterImage: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx16498-buvcRTBx4NSm.jpg',
    coverImage: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/16498-73xxeRFKfpLp.jpg',
    bannerImage: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/16498-73xxeRFKfpLp.jpg',
    format: 'TV',
    status: 'COMPLETED',
    releaseYear: 2013,
    rating: 9.0,
    voteCount: 58000,
    episodeCount: 23,
    durationMinutes: 24,
    studio: 'WIT Studio',
    isFeatured: true,
    isTrending: false,
    hasHindiDub: true,
    hasEnglishDub: true,
    hasSubtitles: true,
    genres: ['Action', 'Drama', 'Fantasy', 'Mystery'],
    aliases: [{ title: 'Shingeki no Kyojin', type: 'ROMAJI' }],
    seasons: [
      {
        seasonNumber: 1,
        title: 'Season 1: Fall of Shiganshina & Battle for Trost',
        episodes: [
          { episodeNumber: 1, title: 'To You, in 2000 Years: The Fall of Shiganshina, Part 1', synopsis: 'Humanity lives peaceful lives behind 50-meter walls until the Colossal Titan appears and breaches Wall Maria.', thumbnail: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/16498-73xxeRFKfpLp.jpg', durationMinutes: 24 },
          { episodeNumber: 2, title: 'That Day: The Fall of Shiganshina, Part 2', synopsis: 'The Armored Titan shatters the inner gate. Eren, Mikasa, and Armin escape onto refugee boats bound for Wall Rose.', thumbnail: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/16498-73xxeRFKfpLp.jpg', durationMinutes: 24 },
          { episodeNumber: 3, title: "A Dim Light Amid Despair: Humanity's Comeback, Part 1", synopsis: 'Eren enlists in the 104th Cadet Corps under Instructor Keith Shadis, determined to join the Scout Regiment.', thumbnail: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/16498-73xxeRFKfpLp.jpg', durationMinutes: 24 },
          { episodeNumber: 4, title: 'The Night of the Closing Ceremony: Humanity\'s Comeback, Part 2', synopsis: 'The cadets graduate in the top ten, but the Colossal Titan suddenly reappears atop Wall Rose.', thumbnail: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/16498-73xxeRFKfpLp.jpg', durationMinutes: 24 },
          { episodeNumber: 5, title: 'First Battle: The Struggle for Trost, Part 1', synopsis: 'Eren rescues Armin from the throat of a Titan, getting swallowed in his place as the vanguard collapses.', thumbnail: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/16498-73xxeRFKfpLp.jpg', durationMinutes: 24 },
          { episodeNumber: 6, title: 'The World the Girl Saw: The Struggle for Trost, Part 2', synopsis: 'Mikasa recalls how Eren saved her from kidnappers, while a mysterious rogue Titan begins attacking its own kind.', thumbnail: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/16498-73xxeRFKfpLp.jpg', durationMinutes: 24 }
        ]
      },
      {
        seasonNumber: 2,
        title: 'Season 2: Clash of the Titans',
        episodes: [
          { episodeNumber: 1, title: 'Beast Titan', synopsis: 'Titans inexplicably appear inside Wall Rose, and the Survey Corps encounters a terrifying fur-covered Beast Titan.', thumbnail: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/16498-73xxeRFKfpLp.jpg', durationMinutes: 24 },
          { episodeNumber: 2, title: "I'm Home", synopsis: 'Sasha Braus rushes to her home village on horseback and saves a child from a slow-moving Titan using bow and arrow.', thumbnail: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/16498-73xxeRFKfpLp.jpg', durationMinutes: 24 },
          { episodeNumber: 3, title: 'Southwestward', synopsis: 'Scout squads search for the breach along Wall Rose under cover of moonlit night without finding any holes.', thumbnail: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/16498-73xxeRFKfpLp.jpg', durationMinutes: 24 },
          { episodeNumber: 4, title: 'Soldier', synopsis: 'Cornered inside the crumbling Utgard Castle tower, Ymir transforms into the Jaw Titan to defend Krista Lenz.', thumbnail: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/16498-73xxeRFKfpLp.jpg', durationMinutes: 24 },
          { episodeNumber: 5, title: 'Historia', synopsis: 'Krista reveals her true royal identity as Historia Reiss as the Scout Regiment arrives to rescue the survivors.', thumbnail: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/16498-73xxeRFKfpLp.jpg', durationMinutes: 24 },
          { episodeNumber: 6, title: 'Warrior', synopsis: 'Atop Wall Rose, Reiner Braun and Bertholdt Hoover casually make an unfathomable confession to Eren Yeager.', thumbnail: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/16498-73xxeRFKfpLp.jpg', durationMinutes: 24 }
        ]
      },
      {
        seasonNumber: 3,
        title: 'Season 3: Return to Shiganshina',
        episodes: [
          { episodeNumber: 1, title: 'Smoke Signal', synopsis: 'The Survey Corps goes into hiding inside the capital as the Military Police and Kenny the Ripper pursue Eren.', thumbnail: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/16498-73xxeRFKfpLp.jpg', durationMinutes: 24 },
          { episodeNumber: 2, title: 'Pain', synopsis: 'Levi clashes with Kenny in an acrobatic ODM gunfight through the streets of Stohess District.', thumbnail: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/16498-73xxeRFKfpLp.jpg', durationMinutes: 24 },
          { episodeNumber: 3, title: 'Sin', synopsis: 'In the crystal cavern beneath the chapel, Rod Reiss reveals how Grisha Yeager stole the Founding Titan.', thumbnail: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/16498-73xxeRFKfpLp.jpg', durationMinutes: 24 },
          { episodeNumber: 4, title: 'Wish', synopsis: 'Historia shatters the titan syringe and frees Eren, forcing Rod Reiss to ingest the spinal fluid himself.', thumbnail: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/16498-73xxeRFKfpLp.jpg', durationMinutes: 24 },
          { episodeNumber: 5, title: 'Hero', synopsis: 'Commander Erwin Smith leads a suicidal cavalry charge against the Beast Titan so Levi can strike from the flank.', thumbnail: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/16498-73xxeRFKfpLp.jpg', durationMinutes: 24 }
        ]
      },
      {
        seasonNumber: 4,
        title: 'Season 4: The Final Season',
        episodes: [
          { episodeNumber: 1, title: 'The Other Side of the Sea', synopsis: 'Across the ocean, the Marleyan military deploys Eldian Warrior candidates in the siege of Fort Slava.', thumbnail: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/16498-73xxeRFKfpLp.jpg', durationMinutes: 24 },
          { episodeNumber: 2, title: 'Midnight Train', synopsis: 'Reiner Braun returns to Liberio Internment Zone and reunites with his cousin Gabi and Warrior cadets.', thumbnail: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/16498-73xxeRFKfpLp.jpg', durationMinutes: 24 },
          { episodeNumber: 3, title: 'The Door of Hope', synopsis: 'Reiner recalls the secret mission to infiltrate Paradis Island nine years earlier and the loss of Marcel.', thumbnail: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/16498-73xxeRFKfpLp.jpg', durationMinutes: 24 },
          { episodeNumber: 4, title: 'From One Hand to Another', synopsis: 'Falco delivers letters for an injured soldier named Kruger, unaware he is secretly Eren Yeager.', thumbnail: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/16498-73xxeRFKfpLp.jpg', durationMinutes: 24 },
          { episodeNumber: 5, title: 'Declaration of War', synopsis: 'Willy Tybur declares war on Paradis Island in front of global ambassadors as Eren transforms beneath the stage.', thumbnail: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/16498-73xxeRFKfpLp.jpg', durationMinutes: 24 },
          { episodeNumber: 6, title: 'The War Hammer Titan', synopsis: 'The Scout Regiment launches a night raid on Liberio with thunder spears as Eren consumes the War Hammer Titan.', thumbnail: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/16498-73xxeRFKfpLp.jpg', durationMinutes: 24 }
        ]
      }
    ]
  },
  {
    slug: 'your-name',
    title: 'Your Name (Kimi no Na wa)',
    japaneseTitle: '君の名は。',
    englishTitle: 'Your Name',
    synopsis: 'Two high school students, rural girl Mitsuha and Tokyo boy Taki, suddenly begin intermittently swapping bodies across time, connected by an impending celestial catastrophe.',
    posterImage: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx21519-9D6vg47HsTaF.jpg',
    coverImage: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/21519-11f2Dyu1sTmW.jpg',
    bannerImage: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/21519-11f2Dyu1sTmW.jpg',
    format: 'MOVIE',
    status: 'COMPLETED',
    releaseYear: 2016,
    rating: 8.9,
    voteCount: 49000,
    episodeCount: 2,
    durationMinutes: 106,
    studio: 'CoMix Wave Films',
    isFeatured: true,
    isTrending: false,
    hasHindiDub: true,
    hasEnglishDub: true,
    hasSubtitles: true,
    genres: ['Romance', 'Drama', 'Supernatural'],
    aliases: [{ title: 'Kimi no Na wa', type: 'ROMAJI' }],
    seasons: [
      {
        seasonNumber: 1,
        title: 'Feature Film Edition',
        episodes: [
          { episodeNumber: 1, title: 'Full Feature Film (Hindi & English Dub, Japanese Sub)', synopsis: 'Taki Tachibana and Mitsuha Miyamizu discover their strange connection through handwritten diary entries before Taki journeys to Itomori to avert disaster.', thumbnail: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/21519-11f2Dyu1sTmW.jpg', durationMinutes: 106 },
          { episodeNumber: 2, title: 'Behind The Scenes & Radwimps Visual Commentary', synopsis: 'Director Makoto Shinkai and rock band RADWIMPS discuss the visual composition, soundtrack coordination, and watercolor architecture of Itomori.', thumbnail: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/21519-11f2Dyu1sTmW.jpg', durationMinutes: 45 }
        ]
      }
    ]
  },
  {
    slug: 'spy-x-family',
    title: 'Spy x Family',
    japaneseTitle: 'SPY×FAMILY',
    englishTitle: 'Spy x Family',
    synopsis: 'Master spy Twilight must disguise himself as psychiatrist Loid Forger, adopting telepathic daughter Anya and marrying deadly assassin Yor to prevent war between Ostania and Westalis.',
    posterImage: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx140960-Kb6R5nYQfjmP.jpg',
    coverImage: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/140960-Z7xSvkRxHKfj.jpg',
    bannerImage: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/140960-Z7xSvkRxHKfj.jpg',
    format: 'TV',
    status: 'ONGOING',
    releaseYear: 2022,
    rating: 8.6,
    voteCount: 33000,
    episodeCount: 12,
    durationMinutes: 24,
    studio: 'WIT Studio x CloverWorks',
    isFeatured: false,
    isTrending: true,
    hasHindiDub: true,
    hasEnglishDub: true,
    hasSubtitles: true,
    genres: ['Comedy', 'Action', 'Slice of Life'],
    aliases: [{ title: 'Spy Family', type: 'SYNONYM' }],
    seasons: [
      {
        seasonNumber: 1,
        title: 'Season 1: Operation Strix',
        episodes: [
          { episodeNumber: 1, title: 'Operation Strix', synopsis: 'Twilight creates the alias Loid Forger and adopts telepath Anya from an orphanage to infiltrate Eden Academy.', thumbnail: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/140960-Z7xSvkRxHKfj.jpg', durationMinutes: 24 },
          { episodeNumber: 2, title: 'Secure a Wife', synopsis: 'Loid meets city hall clerk Yor Briar, secretly an assassin known as the Thorn Princess, agreeing to a mutually beneficial marriage.', thumbnail: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/140960-Z7xSvkRxHKfj.jpg', durationMinutes: 24 },
          { episodeNumber: 3, title: 'Prepare for the Interview', synopsis: 'The newly formed Forger family attends classical concerts, art museums, and opera houses to rehearse appearing upper-class.', thumbnail: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/140960-Z7xSvkRxHKfj.jpg', durationMinutes: 24 },
          { episodeNumber: 4, title: "The Prestigious School's Interview", synopsis: 'The family navigates strict Housemaster Henry Henderson\'s high standards of elegance during the entrance interview.', thumbnail: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/140960-Z7xSvkRxHKfj.jpg', durationMinutes: 24 },
          { episodeNumber: 5, title: 'Will They Pass or Fail', synopsis: 'Loid charters an entire amusement castle to celebrate Anya\'s acceptance into Eden Academy with an elaborate spy rescue game.', thumbnail: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/140960-Z7xSvkRxHKfj.jpg', durationMinutes: 24 },
          { episodeNumber: 6, title: 'The Friendship Scheme', synopsis: 'On her first day at Eden Academy, Anya attempts to befriend target Donovan Desmond\'s arrogant second son, Damian.', thumbnail: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/140960-Z7xSvkRxHKfj.jpg', durationMinutes: 24 }
        ]
      },
      {
        seasonNumber: 2,
        title: 'Season 2: Cruise Adventure Arc',
        episodes: [
          { episodeNumber: 1, title: 'Follow Mama and Papa', synopsis: 'Anya and Bond attempt to assist Loid with domestic chores while Yor undertakes a high-stakes bodyguard mission aboard the Princess Lorelei luxury cruise ship.', thumbnail: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/140960-Z7xSvkRxHKfj.jpg', durationMinutes: 24 },
          { episodeNumber: 2, title: "Bond's Strategy to Stay Alive", synopsis: 'Precognitive dog Bond sees a dreadful vision of his own demise through Yor\'s cooking and mobilizes to prevent dinner disaster.', thumbnail: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/140960-Z7xSvkRxHKfj.jpg', durationMinutes: 24 },
          { episodeNumber: 3, title: 'Mission and Family', synopsis: 'Yor defends client Olka Gretcher from a network of hitmen lurking within the first-class staterooms.', thumbnail: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/140960-Z7xSvkRxHKfj.jpg', durationMinutes: 24 },
          { episodeNumber: 4, title: 'The Elegant Bondman', synopsis: 'Loid helps Anya decipher a covert treasure map in the ship\'s arcade while tracking bomb threats on the upper deck.', thumbnail: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/140960-Z7xSvkRxHKfj.jpg', durationMinutes: 24 },
          { episodeNumber: 5, title: 'Berlint in Love', synopsis: 'Nightfall and Franky embark on a humorous intelligence mission to obtain rare tennis tournament tickets.', thumbnail: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/140960-Z7xSvkRxHKfj.jpg', durationMinutes: 24 },
          { episodeNumber: 6, title: 'Part of the Family', synopsis: 'The Forgers enjoy fireworks on the resort island, recommitting to their unusual yet loving family bond.', thumbnail: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/140960-Z7xSvkRxHKfj.jpg', durationMinutes: 24 }
        ]
      }
    ]
  },
  {
    slug: 'chainsaw-man',
    title: 'Chainsaw Man',
    japaneseTitle: 'チェンソーマン',
    englishTitle: 'Chainsaw Man',
    synopsis: 'Denji makes a pact with his pet devil Pochita, reviving as Chainsaw Man to hunt deadly devils for Public Safety.',
    posterImage: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx127230-DdP4vAdssLoz.png',
    coverImage: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/127230-o8IRwCGVr9KW.jpg',
    bannerImage: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/127230-o8IRwCGVr9KW.jpg',
    format: 'TV',
    status: 'COMPLETED',
    releaseYear: 2022,
    rating: 8.5,
    voteCount: 24000,
    episodeCount: 10,
    durationMinutes: 24,
    studio: 'MAPPA',
    isFeatured: false,
    isTrending: true,
    hasHindiDub: true,
    hasEnglishDub: true,
    hasSubtitles: true,
    genres: ['Action', 'Supernatural', 'Thriller'],
    aliases: [],
    seasons: [
      {
        seasonNumber: 1,
        title: 'Season 1: Public Safety Arc',
        episodes: [
          { episodeNumber: 1, title: 'Dog & Chainsaw', synopsis: 'Denji and Pochita face an ambush from the Zombie Devil before forging a blood bond that awakens Chainsaw Man.', thumbnail: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/127230-o8IRwCGVr9KW.jpg', durationMinutes: 24 },
          { episodeNumber: 2, title: 'Arrival in Tokyo', synopsis: 'Makima introduces Denji to Aki Hayakawa, who tests the uncouth youth\'s suitability as a Public Safety Devil Hunter.', thumbnail: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/127230-o8IRwCGVr9KW.jpg', durationMinutes: 24 },
          { episodeNumber: 3, title: "Meowy's Whereabouts", synopsis: 'Blood Fiend Power promises Denji a favor if he helps rescue her pet cat Meowy from the monstrous Bat Devil.', thumbnail: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/127230-o8IRwCGVr9KW.jpg', durationMinutes: 24 },
          { episodeNumber: 4, title: 'Rescue', synopsis: 'Denji shreds the Bat Devil in midair and engages the Leech Devil until Aki unleashes the Fox Devil.', thumbnail: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/127230-o8IRwCGVr9KW.jpg', durationMinutes: 24 },
          { episodeNumber: 5, title: 'Gun Devil', synopsis: 'Special Division 4 begins tracking fragments of the Gun Devil into an abandoned hotel where spacetime warps.', thumbnail: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/127230-o8IRwCGVr9KW.jpg', durationMinutes: 24 },
          { episodeNumber: 6, title: 'Kill Denji', synopsis: 'Trapped on the infinite 8th floor by the Eternity Devil, the squad must decide whether to hand over Denji to escape.', thumbnail: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/127230-o8IRwCGVr9KW.jpg', durationMinutes: 24 }
        ]
      },
      {
        seasonNumber: 2,
        title: 'Season 2: Katana Man & Bomb Girl Arc',
        episodes: [
          { episodeNumber: 1, title: 'Taste of Kiss', synopsis: 'Himeno invites Denji to her apartment as the division faces an unprecedented assault by guns.', thumbnail: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/127230-o8IRwCGVr9KW.jpg', durationMinutes: 24 },
          { episodeNumber: 2, title: 'Mission Start', synopsis: 'Makima uses death penalty sacrifices in Kyoto to crush assailants from hundreds of miles away.', thumbnail: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/127230-o8IRwCGVr9KW.jpg', durationMinutes: 24 },
          { episodeNumber: 3, title: 'From Kyoto', synopsis: 'Master Kishibe arrives to train Denji and Power through brutal daily survival spars.', thumbnail: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/127230-o8IRwCGVr9KW.jpg', durationMinutes: 24 },
          { episodeNumber: 4, title: 'Katana vs Chainsaw', synopsis: 'Denji slices Katana Man in two on the subway car and extracts justice for Himeno.', thumbnail: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/127230-o8IRwCGVr9KW.jpg', durationMinutes: 24 }
        ]
      }
    ]
  },
  {
    slug: 'one-piece',
    title: 'One Piece: Egghead Arc',
    japaneseTitle: 'ワンピース',
    englishTitle: 'One Piece',
    synopsis: 'Monkey D. Luffy and his Straw Hat crew set sail across the Grand Line toward the Future Island of Egghead and the treasure of Gold Roger.',
    posterImage: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx21-ELSYx3yMPcKM.jpg',
    coverImage: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/21-wf37VakJmZqs.jpg',
    bannerImage: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/21-wf37VakJmZqs.jpg',
    format: 'TV',
    status: 'ONGOING',
    releaseYear: 1999,
    rating: 8.9,
    voteCount: 52000,
    episodeCount: 8,
    durationMinutes: 24,
    studio: 'Toei Animation',
    isFeatured: false,
    isTrending: true,
    hasHindiDub: true,
    hasEnglishDub: true,
    hasSubtitles: true,
    genres: ['Action', 'Adventure', 'Comedy', 'Shounen'],
    aliases: [{ title: 'OP', type: 'SYNONYM' }],
    seasons: [
      {
        seasonNumber: 1,
        title: 'Season 1: East Blue Saga',
        episodes: [
          { episodeNumber: 1, title: "I'm Luffy! The Man Who Will Become the Pirate King!", synopsis: 'Luffy bursts out of a wine barrel on Lady Alvida\'s pirate ship and befriends the timid cabin boy Koby.', thumbnail: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/21-wf37VakJmZqs.jpg', durationMinutes: 24 },
          { episodeNumber: 2, title: 'Enter the Great Swordsman! Pirate Hunter Roronoa Zoro!', synopsis: 'Luffy infiltrates the Marine base in Shells Town to rescue three-sword style swordsman Roronoa Zoro.', thumbnail: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/21-wf37VakJmZqs.jpg', durationMinutes: 24 },
          { episodeNumber: 3, title: "Morgan versus Luffy! Who's the Mysterious Pretty Girl?", synopsis: 'Luffy shatters Axe-Hand Morgan\'s bronze statue and frees the town with Zoro\'s sword dance.', thumbnail: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/21-wf37VakJmZqs.jpg', durationMinutes: 24 },
          { episodeNumber: 4, title: "Luffy's Past! Enter Red-Haired Shanks!", synopsis: 'Ten years ago in Windmill Village, young Luffy eats the Gum-Gum Fruit and Shanks sacrifices his left arm to save him.', thumbnail: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/21-wf37VakJmZqs.jpg', durationMinutes: 24 }
        ]
      },
      {
        seasonNumber: 2,
        title: 'Season 2: Egghead Future Island Arc',
        episodes: [
          { episodeNumber: 1, title: 'A New Island! Future Island Egghead', synopsis: 'The Thousand Sunny is swept into a mechanical vortex, and the Straw Hats enter the futuristic island 500 years ahead of its time.', thumbnail: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/21-wf37VakJmZqs.jpg', durationMinutes: 24 },
          { episodeNumber: 2, title: "Dr. Vegapunk's Six Satellites", synopsis: 'The crew meets Shaka, Lilith, and Edison, discovering the forgotten technology of the ancient Void Century kingdom.', thumbnail: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/21-wf37VakJmZqs.jpg', durationMinutes: 24 },
          { episodeNumber: 3, title: 'CP0 Infiltration! Rob Lucci Awakened', synopsis: 'Rob Lucci and Kaku arrive with Seraphim cyborgs to execute Dr. Vegapunk under World Government orders.', thumbnail: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/21-wf37VakJmZqs.jpg', durationMinutes: 24 },
          { episodeNumber: 4, title: 'Gear 5 Awakened! Legend of the Sun God', synopsis: 'Luffy activates Gear 5, laughing freely as his rubber limbs bounce through reality itself.', thumbnail: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/21-wf37VakJmZqs.jpg', durationMinutes: 24 }
        ]
      }
    ]
  },
  {
    slug: 'bleach-tybw',
    title: 'Bleach: Thousand-Year Blood War',
    japaneseTitle: 'BLEACH 千年血戦篇',
    englishTitle: 'Bleach: Thousand-Year Blood War',
    synopsis: 'When the Soul Society is invaded by the long-dormant Quincy empire known as the Wandenreich, Substitute Soul Reaper Ichigo Kurosaki enters the final holy war.',
    posterImage: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx116674-p3zK4PUX2Aag.jpg',
    coverImage: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/116674-l2YlIyJzvGSV.jpg',
    bannerImage: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/116674-l2YlIyJzvGSV.jpg',
    format: 'TV',
    status: 'ONGOING',
    releaseYear: 2022,
    rating: 9.0,
    voteCount: 23000,
    episodeCount: 8,
    durationMinutes: 24,
    studio: 'Pierrot',
    isFeatured: false,
    isTrending: true,
    hasHindiDub: true,
    hasEnglishDub: true,
    hasSubtitles: true,
    genres: ['Action', 'Supernatural', 'Shounen'],
    aliases: [{ title: 'Bleach TYBW', type: 'SYNONYM' }],
    seasons: [
      {
        seasonNumber: 1,
        title: 'Season 1: The Blood Warfare',
        episodes: [
          { episodeNumber: 1, title: 'The Blood Warfare', synopsis: 'A masked Quincy vanguard appears in Karakura Town, declaring war upon Soul Society and exterminating thousands of Hollows in Hueco Mundo.', thumbnail: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/116674-l2YlIyJzvGSV.jpg', durationMinutes: 24 },
          { episodeNumber: 2, title: 'Foundation Stones', synopsis: 'Ichigo, Chad, and Orihime travel into Hueco Mundo to rescue Nel and Arrancar survivors from Quilge Opie\'s Hunting Corps.', thumbnail: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/116674-l2YlIyJzvGSV.jpg', durationMinutes: 24 },
          { episodeNumber: 3, title: 'March of the Starcross', synopsis: 'Blue pillars of holy flame erupt throughout the Seireitei as the Sternritter begin their direct assault on the Gotei 13.', thumbnail: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/116674-l2YlIyJzvGSV.jpg', durationMinutes: 24 },
          { episodeNumber: 4, title: 'Kill The Shadow', synopsis: 'Captain Byakuya Kuchiki confronts As Nodt, whose terrifying Fear steals Byakuya\'s Senbonzakura Kageyoshi.', thumbnail: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/116674-l2YlIyJzvGSV.jpg', durationMinutes: 24 }
        ]
      },
      {
        seasonNumber: 2,
        title: 'Season 2: The Separation',
        episodes: [
          { episodeNumber: 1, title: 'The Last 9 Days', synopsis: 'Yhwach awakens his true powers and proclaims Uryu Ishida as his designated successor to the Wandenreich throne.', thumbnail: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/116674-l2YlIyJzvGSV.jpg', durationMinutes: 24 },
          { episodeNumber: 2, title: 'Peace from Shadows', synopsis: 'The Second Invasion begins as the Wandenreich swaps places with the shadows of the Seireitei itself.', thumbnail: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/116674-l2YlIyJzvGSV.jpg', durationMinutes: 24 },
          { episodeNumber: 3, title: 'The Fundamental Virulence', synopsis: 'Kisuke Urahara invents the Shin-eiyaku pill, restoring stolen Bankai back to Captain Hitsugaya and Soi Fon.', thumbnail: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/116674-l2YlIyJzvGSV.jpg', durationMinutes: 24 },
          { episodeNumber: 4, title: 'Too Early to Win, Too Late to Know', synopsis: 'Squad Zero engages Yhwach\'s Elite Schutzstaffel in the Soul King Palace with Senjumaru\'s loom.', thumbnail: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/116674-l2YlIyJzvGSV.jpg', durationMinutes: 24 }
        ]
      }
    ]
  },
  {
    slug: 'naruto-shippuden',
    title: 'Naruto: Shippuden',
    japaneseTitle: 'NARUTO -ナルト- 疾風伝',
    englishTitle: 'Naruto: Shippuden',
    synopsis: 'After two and a half years of training with Jiraiya, Naruto Uzumaki returns to Konohagakure to rescue Sasuke Uchiha and protect his village from the Akatsuki.',
    posterImage: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx1735-kGfVm0YqCPcu.png',
    coverImage: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/1735.jpg',
    bannerImage: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/1735.jpg',
    format: 'TV',
    status: 'COMPLETED',
    releaseYear: 2007,
    rating: 8.7,
    voteCount: 46000,
    episodeCount: 8,
    durationMinutes: 24,
    studio: 'Pierrot',
    isFeatured: false,
    isTrending: false,
    hasHindiDub: true,
    hasEnglishDub: true,
    hasSubtitles: true,
    genres: ['Action', 'Adventure', 'Shounen', 'Fantasy'],
    aliases: [{ title: 'Naruto 2', type: 'SYNONYM' }],
    seasons: [
      {
        seasonNumber: 1,
        title: 'Season 1: Kazekage Rescue Mission',
        episodes: [
          { episodeNumber: 1, title: 'Homecoming', synopsis: 'Naruto returns to the Hidden Leaf Village and greets Sakura, Konohamaru, and Master Kakashi atop the Hokage monument.', thumbnail: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/1735.jpg', durationMinutes: 24 },
          { episodeNumber: 2, title: 'The Akatsuki Makes Its Move', synopsis: 'Akatsuki members Deidara and Sasori bypass Hidden Sand defenses on giant clay birds to capture Kazekage Gaara.', thumbnail: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/1735.jpg', durationMinutes: 24 },
          { episodeNumber: 3, title: 'The Results of Training', synopsis: 'Kakashi tests Naruto and Sakura in the survival bell test to evaluate how much they have matured.', thumbnail: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/1735.jpg', durationMinutes: 24 },
          { episodeNumber: 4, title: 'The Jinchuriki of the Sand', synopsis: 'Gaara manipulates desert sand in high-altitude aerial battle against Deidara\'s explosive C3 sculpture.', thumbnail: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/1735.jpg', durationMinutes: 24 }
        ]
      },
      {
        seasonNumber: 2,
        title: 'Season 2: Immortal Akatsuki Arc',
        episodes: [
          { episodeNumber: 1, title: 'The New Target', synopsis: 'Team Kakashi tracks the immortal Akatsuki duo Hidan and Kakuzu into the Fire Temple ruins.', thumbnail: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/1735.jpg', durationMinutes: 24 },
          { episodeNumber: 2, title: 'Akatsuki Clashes', synopsis: 'Shikamaru Nara formulates tactical shadow traps while Asuma Sarutobi locks blades with Hidan.', thumbnail: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/1735.jpg', durationMinutes: 24 },
          { episodeNumber: 3, title: "Asuma's Final Lesson", synopsis: 'Asuma leaves his will of fire to Team 10 before passing into the peaceful beyond.', thumbnail: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/1735.jpg', durationMinutes: 24 },
          { episodeNumber: 4, title: 'Wind Style: Rasenshuriken', synopsis: 'Naruto completes his wind-nature transformation, unleashing the Rasenshuriken to destroy Kakuzu\'s hearts.', thumbnail: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/1735.jpg', durationMinutes: 24 }
        ]
      }
    ]
  },
  {
    slug: 'death-note',
    title: 'Death Note',
    japaneseTitle: 'デスノート',
    englishTitle: 'Death Note',
    synopsis: 'Genius student Light Yagami finds a supernatural notebook that kills anyone whose name is written in it, beginning a psychological game of cat-and-mouse with detective L.',
    posterImage: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx1535-kUgkcrfOrkUM.jpg',
    coverImage: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/1535.jpg',
    bannerImage: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/1535.jpg',
    format: 'TV',
    status: 'COMPLETED',
    releaseYear: 2006,
    rating: 8.8,
    voteCount: 47000,
    episodeCount: 8,
    durationMinutes: 24,
    studio: 'Madhouse',
    isFeatured: false,
    isTrending: false,
    hasHindiDub: true,
    hasEnglishDub: true,
    hasSubtitles: true,
    genres: ['Mystery', 'Psychological', 'Supernatural', 'Thriller'],
    aliases: [{ title: 'DN', type: 'SYNONYM' }],
    seasons: [
      {
        seasonNumber: 1,
        title: 'Season 1: Kira vs L',
        episodes: [
          { episodeNumber: 1, title: 'Rebirth', synopsis: 'Light Yagami discovers the Death Note in the school courtyard and tests its lethal rules on criminals.', thumbnail: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/1535.jpg', durationMinutes: 24 },
          { episodeNumber: 2, title: 'Confrontation', synopsis: 'Detective L uses death row inmate Lind L. Tailor on live TV in Kanto to confirm Kira\'s location and supernatural power.', thumbnail: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/1535.jpg', durationMinutes: 24 },
          { episodeNumber: 3, title: 'Deal', synopsis: 'Ryuk informs Light that someone is following him, offering the Shinigami Eyes in exchange for half of Light\'s remaining lifespan.', thumbnail: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/1535.jpg', durationMinutes: 24 },
          { episodeNumber: 4, title: 'Pursuit', synopsis: 'Light stages a bus hijacking to manipulate FBI agent Raye Penber into revealing his true badge and name.', thumbnail: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/1535.jpg', durationMinutes: 24 }
        ]
      },
      {
        seasonNumber: 2,
        title: 'Season 2: Silence & Successors',
        episodes: [
          { episodeNumber: 1, title: 'Doubt', synopsis: 'L isolates Light and Misa Amane under 24-hour video surveillance to verify the second Kira connection.', thumbnail: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/1535.jpg', durationMinutes: 24 },
          { episodeNumber: 2, title: 'Silence', synopsis: 'The church bells ring inside L\'s mind on the rainy rooftop before Rem acts to protect Misa.', thumbnail: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/1535.jpg', durationMinutes: 24 },
          { episodeNumber: 3, title: 'Inheritance', synopsis: 'Five years later, Wammy\'s House prodigies Near and Mello begin separate investigations into the second L.', thumbnail: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/1535.jpg', durationMinutes: 24 },
          { episodeNumber: 4, title: 'New World', synopsis: 'In the Yellow Box warehouse, Near exposes Teru Mikami\'s fake notebook, sealing the fate of Light Yagami.', thumbnail: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/1535.jpg', durationMinutes: 24 }
        ]
      }
    ]
  }
];

// Enrich animes with video sources
const SEED_ANIMES = RAW_ANIMES.map((anime, animeIdx) => {
  const allEpisodes = [];

  const seasons = anime.seasons.map((season) => {
    const episodes = season.episodes.map((ep) => {
      const videoSources = getVideoSourcesForEpisode(animeIdx, season.seasonNumber, ep.episodeNumber);
      const enrichedEp = {
        episodeNumber: ep.episodeNumber,
        title: ep.title,
        synopsis: ep.synopsis,
        thumbnail: ep.thumbnail,
        durationMinutes: ep.durationMinutes,
        introStart: 60,
        introEnd: 150,
        outroStart: (ep.durationMinutes * 60) - 90,
        outroEnd: (ep.durationMinutes * 60),
        videoSources
      };
      allEpisodes.push(enrichedEp);
      return enrichedEp;
    });

    return {
      seasonNumber: season.seasonNumber,
      title: season.title,
      episodes
    };
  });

  return {
    ...anime,
    seasons,
    episodes: allEpisodes // preserve flat episodes for compatibility
  };
});

const SEED_SCHEDULE = [
  { dayOfWeek: 0, episodeNumber: 13, timeString: '18:00', animeSlug: 'solo-leveling' },
  { dayOfWeek: 1, episodeNumber: 9, timeString: '19:30', animeSlug: 'demon-slayer' },
  { dayOfWeek: 2, episodeNumber: 7, timeString: '20:00', animeSlug: 'spy-x-family' },
  { dayOfWeek: 3, episodeNumber: 7, timeString: '17:30', animeSlug: 'frieren-beyond-journeys-end' },
  { dayOfWeek: 4, episodeNumber: 7, timeString: '21:00', animeSlug: 'chainsaw-man' },
  { dayOfWeek: 5, episodeNumber: 9, timeString: '19:00', animeSlug: 'jujutsu-kaisen' },
  { dayOfWeek: 6, episodeNumber: 7, timeString: '18:30', animeSlug: 'attack-on-titan' }
];

const fileHeader = `export interface SeedVideoSource {
  provider: string;
  quality: string;
  format: string;
  url: string;
  isMaster: boolean;
}

export interface SeedEpisodeData {
  episodeNumber: number;
  title: string;
  synopsis: string;
  thumbnail: string;
  durationMinutes: number;
  introStart: number;
  introEnd: number;
  outroStart: number;
  outroEnd: number;
  videoSources: SeedVideoSource[];
}

export interface SeedSeasonData {
  seasonNumber: number;
  title: string;
  episodes: SeedEpisodeData[];
}

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
  seasons: SeedSeasonData[];
  episodes: SeedEpisodeData[];
}
`;

const fileContent = `${fileHeader}
export const SEED_GENRES = ${JSON.stringify(SEED_GENRES, null, 2)};

export const SEED_ANIMES: SeedAnimeData[] = ${JSON.stringify(SEED_ANIMES, null, 2)};

export const SEED_SCHEDULE = ${JSON.stringify(SEED_SCHEDULE, null, 2)};
`;

fs.writeFileSync(path.join(__dirname, 'prisma', 'seed-data.ts'), fileContent, 'utf8');
console.log('✅ Generated prisma/seed-data.ts successfully with multi-season and unique video sources!');
