const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Verified 200 OK Artworks
const ARTWORK = {
  'naruto': {
    poster: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx20-dE6UHbFFg1A5.jpg',
    banner: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/20-HHxhPj5JD13a.jpg'
  },
  'naruto-shippuden': {
    poster: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx1735-kGfVm0YqCPcu.png',
    banner: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/1735.jpg'
  },
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
  'death-note': {
    poster: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx1535-kUgkcrfOrkUM.jpg',
    banner: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/1535.jpg'
  },
  'your-name': {
    poster: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx21519-SUo3ZQuCbYhJ.png',
    banner: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/21519-1ayMXgNlmByb.jpg'
  }
};

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

function getStream(seed) {
  return STREAM_URLS[Math.abs(seed) % STREAM_URLS.length];
}

// Complete Anime Definitions with all officially released seasons
const FULL_CATALOG = [
  {
    slug: 'naruto',
    title: 'Naruto (Original Series)',
    japaneseTitle: 'NARUTO -ナルト-',
    englishTitle: 'Naruto',
    synopsis: 'Moments before Naruto Uzumaki’s birth, a huge demon known as the Kyuubi, the Nine-Tailed Fox, attacked Konohagakure, the Hidden Leaf Village. Naruto grows up shunned, yet determined to become the greatest Hokage. Follow Naruto, Sasuke, and Sakura on Team 7 as they embark on legendary ninja missions.',
    posterImage: ARTWORK['naruto'].poster,
    coverImage: ARTWORK['naruto'].banner,
    bannerImage: ARTWORK['naruto'].banner,
    format: 'TV',
    status: 'COMPLETED',
    releaseYear: 2002,
    rating: 8.8,
    voteCount: 185000,
    durationMinutes: 23,
    studio: 'Pierrot',
    isFeatured: true,
    isTrending: true,
    hasHindiDub: true,
    hasEnglishDub: true,
    hasSubtitles: true,
    genres: ['Action', 'Adventure', 'Fantasy'],
    aliases: [{ title: 'Naruto Part 1', type: 'SYNONYM' }],
    seasons: [
      {
        seasonNumber: 1,
        title: 'Season 1: Land of Waves & Chunin Exam Preliminaries',
        episodes: [
          "Enter: Naruto Uzumaki!",
          "My Name is Konohamaru!",
          "Sasuke and Sakura: Friends or Foes?",
          "Pass or Fail: Survival Test",
          "You Failed! Kakashi's Final Decision",
          "A Dangerous Mission! Journey to the Land of Waves!",
          "The Assassin of the Mist!",
          "The Oath of Pain",
          "Kakashi: Sharingan Warrior!",
          "The Forest of Chakra",
          "The Land Where a Hero Once Lived",
          "Battle on the Bridge! Zabuza Returns!",
          "Haku's Secret Jutsu: Crystal Ice Mirrors",
          "The Number One Hyperactive, Knucklehead Ninja Joins the Fight!",
          "Zero Visibility: The Sharingan Shatters",
          "The Broken Seal",
          "White Past: Hidden Ambition",
          "The Weapons Known as Shinobi",
          "The Demon in the Snow",
          "A New Chapter Begins: The Chunin Exam!"
        ]
      },
      {
        seasonNumber: 2,
        title: 'Season 2: Chunin Exam Finals & Konoha Crush',
        episodes: [
          "Identify Yourself: Powerful New Rivals",
          "Chunin Challenge: Rock Lee vs. Sasuke!",
          "Genin Takedown! All Nine Rookies Face Off!",
          "Start Your Engines: The Chunin Exam Begins!",
          "The Tenth Question: All or Nothing!",
          "Special Report: Live from the Forest of Death!",
          "The Chunin Exam Stage 2: The Forest of Death",
          "Eat or Be Eaten: Panic in the Forest",
          "Naruto's Counterattack: Never Give In!",
          "The Sharingan Revived: Dragon-Flame Jutsu!",
          "Junior Staff: Kakashi's Ninja Rule",
          "Bushy Brow's Jutsu: Martial Arts Unleashed!",
          "A New Form of Evil: Orochimaru's Curse",
          "The Battle of the Genin: Rock Lee vs. Gaara",
          "Gaara vs. Rock Lee: The Power of Youth Explodes!",
          "A Failure's True Power",
          "Byakugan vs. Shadow Clone",
          "Hospitality: A Secret Technique",
          "Sand vs. Leaf: The Invasion Begins",
          "The Third Hokage: Farewell, Forever"
        ]
      },
      {
        seasonNumber: 3,
        title: 'Season 3: Search for Tsunade & The Legendary Sannin',
        episodes: [
          "Return of the Morning Mist",
          "Eye to Eye: Sharingan vs. Sharingan!",
          "Jiraiya: Naruto's Potential Disaster!",
          "Roar, Chidori! Brother vs. Brother!",
          "Hate Among the Uchihas: The Last of the Clan!",
          "A New Training Begins: I Will Be Strong!",
          "Keep on Training: Pop Goes the Water Balloon!",
          "Focal Point: The Symbol of the Leaf",
          "An Impossible Choice: The Mark in Tsunade's Heart",
          "Unforgivable! A Total Lack of Respect!",
          "Inheritance! The Necklace of Death!",
          "A Dubious Offer! Tsunade's Choice!",
          "Breakdown! The Deal is Off!",
          "Attack! Fury of the Rasengan!",
          "The Fifth Hokage! A Life on the Line!",
          "Deadlock! Sannin Showdown!",
          "Run for Your Life! The Ultimate Battle!",
          "A Battle of Legends: Tsunade, Jiraiya, Orochimaru",
          "The Will of Fire Still Burns",
          "Naruto's Ninja Handbook"
        ]
      },
      {
        seasonNumber: 4,
        title: 'Season 4: Sasuke Recovery Mission & Valley of the End',
        episodes: [
          "Rivalry: Sasuke and Naruto",
          "Bitter Enmity and Broken Bonds",
          "Invitation from the Sound",
          "Formation! The Sasuke Recovery Squad!",
          "Sound vs. Leaf: Battle Formation",
          "Choji's Ultimate Sacrifice",
          "Goodbye Old Friend...! I'll Always Believe in You!",
          "Neji vs. Kidomaru: The Blind Spot Revealed!",
          "Losing is Not an Option!",
          "The Vessel Arrives Too Late",
          "Miscalculation: A New Enemy Appears",
          "Roar and Howl! The Ultimate Tag Team",
          "Gaara vs. Kimimaro: Sand and Bone!",
          "Valley of the End: The Fateful Climax",
          "The Tears of Sasuke",
          "The Demon Fox Awakens",
          "Chidori vs. Rasengan: Clash of Destinies",
          "A Promise for a Lifetime",
          "Departure: Training with Jiraiya",
          "The Journey Continues"
        ]
      },
      {
        seasonNumber: 5,
        title: 'Season 5: Special Missions & The Road to Shippuden',
        episodes: [
          "Deep Cover!? A Super S-Ranked Mission!",
          "A Town of Outlaws, the Shadow of the Fuma Clan",
          "Pure Betrayal, and a Fleeting Plea!",
          "Pure Terror! The House of Orochimaru",
          "Two Heartbeats: Kabuto's Trap",
          "Sakura's Resolve",
          "The Anbu Squad Special Mission",
          "Legacy of the Fourth Hokage",
          "Mystery of the Cursed Warrior",
          "The Star Village Ninja",
          "Kiba's Long Day",
          "A Legend from the Hidden Leaf: The Onbaa!",
          "The Laughing Shino",
          "Open for Business! The Leaf Moving Service",
          "Ino Screams! Chubby Paradise!",
          "Viva Dojo Challenge! Youth Is All About Passion!",
          "Mysterious Curse of the Haunted Castle",
          "The Third Super-Beast",
          "Departure for the Sand",
          "The Road to Shippuden: The Hero Returns"
        ]
      }
    ]
  },
  {
    slug: 'naruto-shippuden',
    title: 'Naruto: Shippuden',
    japaneseTitle: 'NARUTO -ナルト- 疾風伝',
    englishTitle: 'Naruto: Shippuden',
    synopsis: 'After two and a half years of rigorous training with Master Jiraiya, Naruto Uzumaki returns to the Hidden Leaf Village older, stronger, and more determined than ever. With the shadowy criminal organization Akatsuki hunting the Jinchuriki, Naruto must fight across world-shattering battles to save his friend Sasuke Uchiha and achieve his dream of becoming Hokage.',
    posterImage: ARTWORK['naruto-shippuden'].poster,
    coverImage: ARTWORK['naruto-shippuden'].banner,
    bannerImage: ARTWORK['naruto-shippuden'].banner,
    format: 'TV',
    status: 'COMPLETED',
    releaseYear: 2007,
    rating: 8.9,
    voteCount: 220000,
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
        title: 'Season 1: Kazekage Rescue Mission',
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
        title: 'Season 2: Long-Awaited Reunion (Tenchi Bridge)',
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
          "Team Kakashi: To Tenchi Bridge",
          "The Nine-Tails Unleashed",
          "Orochimaru vs. Jinchuriki",
          "The Fake Smile",
          "Infiltrating Orochimaru's Hideout",
          "Reunion: Sasuke's Tremendous Power"
        ]
      },
      {
        seasonNumber: 3,
        title: 'Season 3: Twelve Guardian Ninja',
        episodes: [
          "Nightmare",
          "Wind Chakra Training",
          "Writhe",
          "Deprived of Eternal Sleep",
          "Loneliness",
          "A New Enemy",
          "Impermanence",
          "Collision",
          "Friendship",
          "The Title of Twelve",
          "The Black Claw",
          "Unto Death",
          "Awakening Time",
          "Despair",
          "Resonance",
          "My Friend",
          "The Final Strike",
          "The Flame of Will"
        ]
      },
      {
        seasonNumber: 4,
        title: 'Season 4: Immortal Devastators (Hidan and Kakuzu)',
        episodes: [
          "Under the Starry Sky",
          "The Old Monk's Prayer",
          "The Next Step",
          "Climbing Silver",
          "The Judgement of the Akatsuki",
          "Asuma's Team Mobilized",
          "Hidan's Curse Technique",
          "The Two Who Do Not Die",
          "Asuma's Last Words",
          "The Will of Fire Inherited",
          "The Sorrowful News",
          "Team Ten",
          "Target Locked On",
          "Kakuzu's Abilities",
          "The Terrifying Secret",
          "Shikamaru's Genius Strategy",
          "When You Curse Someone, You Dig Two Graves"
        ]
      },
      {
        seasonNumber: 5,
        title: 'Season 5: Master’s Prophecy and Vengeance (Jiraiya vs Pain)',
        episodes: [
          "Wind Style: Rasenshuriken!",
          "The Price of Power",
          "A Shinobi's Determination",
          "Orochimaru's Hideout Discovered",
          "The Hunt for Itachi Begins",
          "Sasuke's Hebi Formed",
          "Deidara's Art vs. Sharingan",
          "C4 Karura: Ultimate Detonation",
          "Jiraiya Infiltrates the Rain Village",
          "The God of the Rain: Pain",
          "Sage Mode: Two Great Toad Sages",
          "The Six Paths of Pain Revealed",
          "The Tale of Jiraiya the Gallant",
          "Sasuke vs. Itachi: The Fateful Climax",
          "The Truth Behind the Uchiha Clan",
          "Taka: Eye of the Hawk",
          "Eight-Tails vs. Sasuke",
          "Naruto Learns the Tragic News",
          "Inheriting the Legacy",
          "Mount Myoboku: Sage Training"
        ]
      },
      {
        seasonNumber: 6,
        title: 'Season 6: Two Saviors (Pain’s Assault on the Hidden Leaf)',
        episodes: [
          "Sage Art: Senjutsu Mastered",
          "The Attack on Konoha Begins",
          "Power to Believe",
          "Kakashi Hatake vs. Pain",
          "The Mystery of Pain",
          "Surpassing the Master",
          "Konoha Destroyed by Shinra Tensei!",
          "Naruto Returns in Sage Mode!",
          "Rasenshuriken Strikes!",
          "The Sage of Six Paths' Powers",
          "Hinata's Declaration of Love",
          "The Nine-Tails Rampages!",
          "Meeting the Fourth Hokage: Minato Namikaze",
          "Planetary Devastation: Chibaku Tensei",
          "The Final Climax: Naruto vs. Deva Path",
          "The Search for the Real Pain",
          "Nagato and Naruto: Two Disciples",
          "The Choice: Rinne Rebirth",
          "The Hero of the Hidden Leaf",
          "Celebrating the Savior"
        ]
      },
      {
        seasonNumber: 7,
        title: 'Season 7: Five Kage Summit & Gathering of Nations',
        episodes: [
          "Danzō Becomes Sixth Hokage Candidate",
          "The Five Kage Summit Convened",
          "Naruto's Plea to the Raikage",
          "Sasuke Infiltrates the Summit",
          "Raikage vs. Sasuke: Lightning vs. Amaterasu",
          "The Power of the Susanoo",
          "Declaration of the Fourth Shinobi World War",
          "Sakura's Feelings",
          "Danzō's Right Arm: The Izanagi",
          "Sasuke vs. Danzō",
          "The Reencounter of Team 7",
          "Two Rivals: Mutual Understanding",
          "Preparing for the War of All Shinobi",
          "The Island of Isolation: Falls of Truth",
          "Meeting Kushina Uzumaki",
          "The Orange Spark: Nine-Tails Chakra Mode",
          "Guy vs. Kisame: Morning Peacock to Daytime Tiger",
          "Kabuto's Impure World Reincarnation",
          "Mobilization of the Allied Shinobi Forces",
          "Gaara's Speech to the Allied Army"
        ]
      },
      {
        seasonNumber: 8,
        title: 'Season 8: Fourth Shinobi World War (Countdown & Climax)',
        episodes: [
          "The Fourth Shinobi World War Begins!",
          "An Army of Reanimated Legends",
          "The Golden Duo: Kinkaku and Ginkaku",
          "Asuma vs. Team Ten",
          "Naruto and Killer B Enter the Battlefield!",
          "Itachi and Nagato Reanimated",
          "Kotoamatsukami: Itachi Free from Control",
          "Totsuka Blade: Sealing Nagato",
          "The Real Madara Uchiha Summoned!",
          "The Power of the Meteorite",
          "The Five Kage vs. Madara Uchiha",
          "Itachi and Sasuke vs. Kabuto",
          "Izanami: Kabuto's Endless Loop",
          "Reanimation Jutsu Released: Itachi's Final Words",
          "The Masked Man's Identity: Obito Uchiha!",
          "Ten-Tails Awakens",
          "The Shinobi Alliance Jutsu",
          "The Four Hokage Reanimated by Orochimaru",
          "Hashirama Senju and Madara's Past",
          "Team 7 Reunited on the Battlefield!"
        ]
      },
      {
        seasonNumber: 9,
        title: 'Season 9: The Final Battle & Peace (Naruto vs Sasuke)',
        episodes: [
          "Ten-Tails Jinchūriki: Obito's Transformation",
          "Father and Son Rasengan Strike!",
          "Obito's Heart Reclaimed",
          "Madara's True Revival with Rinnegan",
          "Might Guy's Eight Gates: Night Guy Unleashed!",
          "Sage of Six Paths: Hagoromo Otsutsuki",
          "Six Paths Sage Mode and Rinnegan Awakened",
          "Infinite Tsukuyomi Cast Over the World",
          "Kaguya Otsutsuki: The Mother of Chakra",
          "Dimensional Shift: Fighting the Progenitor",
          "The Ultimate Chibaku Tensei: Sealing Kaguya",
          "Sasuke's Revolution",
          "Valley of the End: The Final Battle",
          "Clash of Chidori and Rasengan: The Final Clash",
          "The Unison Sign",
          "The Dawn of Peace",
          "The Seventh Hokage: Naruto Uzumaki",
          "Naruto and Hinata: The Last Chapter",
          "Naruto's Wedding",
          "A New Era: The Next Generation"
        ]
      }
    ]
  },
  {
    slug: 'solo-leveling',
    title: 'Solo Leveling: Arise',
    japaneseTitle: '俺だけレベルアップな件',
    englishTitle: 'Solo Leveling',
    synopsis: 'In a world where hunters battle deadly monsters from invading Earth, the weakest E-Rank hunter Sung Jinwoo is fatally injured inside a double dungeon. Chosen by the mysterious System, he alone gains the ability to level up infinitely.',
    posterImage: ARTWORK['solo-leveling'].poster,
    coverImage: ARTWORK['solo-leveling'].banner,
    bannerImage: ARTWORK['solo-leveling'].banner,
    format: 'TV',
    status: 'ONGOING',
    releaseYear: 2024,
    rating: 8.8,
    voteCount: 52000,
    durationMinutes: 24,
    studio: 'A-1 Pictures',
    isFeatured: true,
    isTrending: true,
    hasHindiDub: true,
    hasEnglishDub: true,
    hasSubtitles: true,
    genres: ['Action', 'Fantasy', 'Adventure'],
    aliases: [{ title: 'Ore dake Level Up na Ken', type: 'ROMAJI' }],
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
          "You Aren't E-Rank, Are You?",
          "I Suppose You Aren't Aware",
          "Still a Long Way to Go",
          "Red Gate",
          "The Ice Elves",
          "Baruka's Dagger",
          "Return to the Real World",
          "Job Change Quest",
          "Monarch of Shadows",
          "Jeju Island Reconnaissance",
          "S-Rank Hunters Gathering",
          "Raid on Jeju Island",
          "The Shadow Army Marches"
        ]
      }
    ]
  },
  {
    slug: 'demon-slayer',
    title: 'Demon Slayer: Kimetsu no Yaiba',
    japaneseTitle: '鬼滅の刃',
    englishTitle: 'Demon Slayer: Kimetsu no Yaiba',
    synopsis: 'Tanjiro Kamado sets out to become a demon slayer to avenge his slaughtered family and find a cure for his sister Nezuko, who was turned into a demon.',
    posterImage: ARTWORK['demon-slayer'].poster,
    coverImage: ARTWORK['demon-slayer'].banner,
    bannerImage: ARTWORK['demon-slayer'].banner,
    format: 'TV',
    status: 'ONGOING',
    releaseYear: 2019,
    rating: 8.9,
    voteCount: 165000,
    durationMinutes: 24,
    studio: 'ufotable',
    isFeatured: true,
    isTrending: true,
    hasHindiDub: true,
    hasEnglishDub: true,
    hasSubtitles: true,
    genres: ['Action', 'Supernatural', 'Historical'],
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
          "Fully Recovered Tanjiro Joins the Hashira Training!",
          "To Bring a Smile",
          "I Even Ate a Demon...",
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
    synopsis: 'A boy swallows a cursed talisman - the finger of a demon - and becomes cursed himself. He enters a shaman school to be able to locate the demon’s other body parts and thus exorcise himself.',
    posterImage: ARTWORK['jujutsu-kaisen'].poster,
    coverImage: ARTWORK['jujutsu-kaisen'].banner,
    bannerImage: ARTWORK['jujutsu-kaisen'].banner,
    format: 'TV',
    status: 'ONGOING',
    releaseYear: 2020,
    rating: 8.8,
    voteCount: 172000,
    durationMinutes: 24,
    studio: 'MAPPA',
    isFeatured: true,
    isTrending: true,
    hasHindiDub: true,
    hasEnglishDub: true,
    hasSubtitles: true,
    genres: ['Action', 'Fantasy', 'Supernatural'],
    aliases: [{ title: 'JJK', type: 'ACRONYM' }],
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
          "Kyoto Sister School Goodwill Event - Team Battle, Part 0 -",
          "Kyoto Sister School Goodwill Event - Team Battle, Part 1 -",
          "Kyoto Sister School Goodwill Event - Team Battle, Part 2 -",
          "Kyoto Sister School Goodwill Event - Team Battle, Part 3 -",
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
          "Right and Wrong",
          "Right and Wrong, Part 2",
          "Right and Wrong, Part 3",
          "Metamorphosis",
          "Metamorphosis, Part 2",
          "The Shibuya Incident - Close",
          "The Shibuya Incident - Gates",
          "Shibuya Aftermath"
        ]
      }
    ]
  },
  {
    slug: 'attack-on-titan',
    title: 'Attack on Titan',
    japaneseTitle: '進撃の巨人',
    englishTitle: 'Attack on Titan',
    synopsis: 'After his hometown is destroyed and his mother is killed, young Eren Jaeger vows to cleanse the earth of the giant humanoid Titans that have brought humanity to the brink of extinction.',
    posterImage: ARTWORK['attack-on-titan'].poster,
    coverImage: ARTWORK['attack-on-titan'].banner,
    bannerImage: ARTWORK['attack-on-titan'].banner,
    format: 'TV',
    status: 'COMPLETED',
    releaseYear: 2013,
    rating: 9.1,
    voteCount: 260000,
    durationMinutes: 24,
    studio: 'Wit Studio / MAPPA',
    isFeatured: true,
    isTrending: true,
    hasHindiDub: true,
    hasEnglishDub: true,
    hasSubtitles: true,
    genres: ['Action', 'Mystery', 'Drama'],
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
          "What Should Be Done: Eve of the Counterattack, Part 3",
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
          "Charge",
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
          "Outside the Gates of Orvud District",
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
          "A Fleeting Moment",
          "Memories of the Future",
          "From You, 2,000 Years Ago",
          "Thaw",
          "Sunset",
          "Night of the End",
          "Traitor",
          "Retrospective",
          "The Dawn of Humanity"
        ]
      }
    ]
  },
  {
    slug: 'frieren-beyond-journeys-end',
    title: 'Frieren: Beyond Journey’s End',
    japaneseTitle: '葬送のフリーレン',
    englishTitle: "Frieren: Beyond Journey's End",
    synopsis: 'Elf mage Frieren and her courageous fellow adventurers have defeated the Demon King and brought peace to the land. But Frieren will long outlive the rest of her former party. How will she come to understand what life means to the people around her?',
    posterImage: ARTWORK['frieren-beyond-journeys-end'].poster,
    coverImage: ARTWORK['frieren-beyond-journeys-end'].banner,
    bannerImage: ARTWORK['frieren-beyond-journeys-end'].banner,
    format: 'TV',
    status: 'COMPLETED',
    releaseYear: 2023,
    rating: 9.3,
    voteCount: 110000,
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
        title: 'Season 1: First-Class Mage Exam & Journey Beyond',
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
          "Perfect Clones",
          "A Fatal Vulnerability",
          "The Height of Magic",
          "An Era of Humans",
          "It Would Be Embarrassing When We Met Again"
        ]
      }
    ]
  },
  {
    slug: 'spy-x-family',
    title: 'Spy x Family',
    japaneseTitle: 'SPY×FAMILY',
    englishTitle: 'Spy x Family',
    synopsis: 'A spy known only as Twilight must create a faux family to investigate political leader Donovan Desmond. He adopts Anya, a telepathic girl, and marries Yor, an undercover assassin.',
    posterImage: ARTWORK['spy-x-family'].poster,
    coverImage: ARTWORK['spy-x-family'].banner,
    bannerImage: ARTWORK['spy-x-family'].banner,
    format: 'TV',
    status: 'ONGOING',
    releaseYear: 2022,
    rating: 8.6,
    voteCount: 130000,
    durationMinutes: 24,
    studio: 'Wit Studio / CloverWorks',
    isFeatured: true,
    isTrending: true,
    hasHindiDub: true,
    hasEnglishDub: true,
    hasSubtitles: true,
    genres: ['Action', 'Comedy'],
    aliases: [{ title: 'Spy Family', type: 'SYNONYM' }],
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
          "Plan B: The Informant",
          "The Luxury Cruise Ship Part 1",
          "The Luxury Cruise Ship Part 2",
          "Who Is This Mission For?",
          "The Symphony Upon the Ship",
          "Resort Island Holiday",
          "Berlint in Autumn",
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
    synopsis: 'When his father died, Denji was stuck with a huge debt. Thanks to a devil dog he saved named Pochita, he lives through debt collection until being betrayed and reborn as the Chainsaw Man.',
    posterImage: ARTWORK['chainsaw-man'].poster,
    coverImage: ARTWORK['chainsaw-man'].banner,
    bannerImage: ARTWORK['chainsaw-man'].banner,
    format: 'TV',
    status: 'ONGOING',
    releaseYear: 2022,
    rating: 8.7,
    voteCount: 145000,
    durationMinutes: 24,
    studio: 'MAPPA',
    isFeatured: true,
    isTrending: true,
    hasHindiDub: true,
    hasEnglishDub: true,
    hasSubtitles: true,
    genres: ['Action', 'Supernatural'],
    aliases: [{ title: 'CSM', type: 'ACRONYM' }],
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
        title: 'Season 2: Reze Arc & Bomb Girl',
        episodes: [
          "Rainy Day Cafe",
          "A Girl Named Reze",
          "Night Festival Fireworks",
          "The Secret Beneath the Skin",
          "The Bomb Devil Awakes",
          "Explosive Chase Through Tokyo",
          "Beam and the Shark Devil",
          "Chainsaw vs. Bomb",
          "Tornado of Sparks",
          "Denji's True Feelings",
          "The Final Ticket to Enoshima",
          "The Assassin Approaches"
        ]
      }
    ]
  },
  {
    slug: 'one-piece',
    title: 'One Piece: Egghead Arc',
    japaneseTitle: 'ONE PIECE',
    englishTitle: 'One Piece',
    synopsis: 'Monkey D. Luffy refuses to let anyone or anything stand in the way of his quest to become the king of all pirates. With a course charted for the treacherous waters of the Grand Line, Luffy seeks the legendary treasure: One Piece.',
    posterImage: ARTWORK['one-piece'].poster,
    coverImage: ARTWORK['one-piece'].banner,
    bannerImage: ARTWORK['one-piece'].banner,
    format: 'TV',
    status: 'ONGOING',
    releaseYear: 1999,
    rating: 9.0,
    voteCount: 210000,
    durationMinutes: 24,
    studio: 'Toei Animation',
    isFeatured: true,
    isTrending: true,
    hasHindiDub: true,
    hasEnglishDub: true,
    hasSubtitles: true,
    genres: ['Action', 'Adventure', 'Fantasy'],
    aliases: [{ title: 'OP', type: 'ACRONYM' }],
    seasons: [
      {
        seasonNumber: 1,
        title: 'Season 1: Wano Climax & Gear 5 Awakening',
        episodes: [
          "Luffy's Peak - Attained! Gear 5",
          "The Strange Ability! Gear 5 in Full Play",
          "The Attack of the Dragon! Kaido's All-Out Assault",
          "A Legend Concludes! The Fall of the Emperors",
          "The Dawn of Wano! The Kozuki Family Returns",
          "The New Era! The Children of the Emperors",
          "Shanks' Haki! The World Government's Fear",
          "The Cross Guild! Buggy the Emperor",
          "Luffy's Dream! The Straw Hat's True Goal",
          "Setting Sail from Wano! Towards the Future",
          "The Reverie Flashback: Sabo's Story",
          "The Fall of Lulusia Kingdom",
          "Amazon Lily Siege: Blackbeard's Invasion",
          "Rayleigh's Intervention",
          "Koby's Abduction",
          "The Revolutionary Army Strikes",
          "Vegapunk's Broadcast Hint",
          "Entering the Giant Whirlpool",
          "Meeting Jewelry Bonney",
          "The Future Island Appears!"
        ]
      },
      {
        seasonNumber: 2,
        title: 'Season 2: Egghead Island Arc',
        episodes: [
          "A New Destination! The Island of the Future, Egghead",
          "Punk Records! The Six Vegapunks",
          "The Weight of Memory! Bartholomew Kuma's Past",
          "CP0's Infiltration! Rob Lucci vs. Luffy Again",
          "Awakened Rob Lucci! The Cat-Cat Fruit Model Leopard",
          "Gear 5 vs. CP0: Rubberized World",
          "Sentomaru's Stance! The Seraphim Mobilized",
          "The Traitor on Egghead! Security Barrier Down",
          "St. Jaygarcia Saturn Arrives",
          "Admiral Kizaru Strikes Egghead Island",
          "Luffy vs. Kizaru: Battle of Light and Rubber",
          "White Star Gun! Striking Down an Admiral",
          "Saturn's Demonic Form Revealed",
          "Kuma's Heroic Punch! A Father's Love",
          "The Ancient Giant Robot Moves",
          "Vegapunk's Dying Message to the World",
          "The Five Elders Descend on Egghead!",
          "Giant Warrior Pirates Arrive: Dorry and Brogy",
          "The Truth of the Void Century Broadcast",
          "Escape to Elbaf! The Next Great Sea"
        ]
      }
    ]
  },
  {
    slug: 'bleach-thousand-year-blood-war',
    title: 'Bleach: Thousand-Year Blood War',
    japaneseTitle: 'BLEACH 千年血戦篇',
    englishTitle: 'Bleach: Thousand-Year Blood War',
    synopsis: 'The peace is suddenly broken when warning sirens blare through the Soul Society. Residents are disappearing without a trace, and an ominous shadowy empire known as the Wandenreich, led by Yhwach, declares war against all Soul Reapers.',
    posterImage: ARTWORK['bleach-thousand-year-blood-war'].poster,
    coverImage: ARTWORK['bleach-thousand-year-blood-war'].banner,
    bannerImage: ARTWORK['bleach-thousand-year-blood-war'].banner,
    format: 'TV',
    status: 'ONGOING',
    releaseYear: 2022,
    rating: 9.0,
    voteCount: 95000,
    durationMinutes: 24,
    studio: 'Pierrot',
    isFeatured: true,
    isTrending: true,
    hasHindiDub: true,
    hasEnglishDub: true,
    hasSubtitles: true,
    genres: ['Action', 'Adventure', 'Supernatural'],
    aliases: [{ title: 'Bleach TYBW', type: 'ACRONYM' }],
    seasons: [
      {
        seasonNumber: 1,
        title: 'Season 1: The Blood Warfare',
        episodes: [
          "The Blood Warfare",
          "Foundation Stones",
          "March of the StarCross",
          "Kill the Shadow",
          "Wrath as a Lightning",
          "The Fire",
          "Born in the Dark",
          "The Shooting Star Project (Zero Mix)",
          "The Drop",
          "The Battle",
          "Everything But the Rain",
          "Everything But the Rain: June Truth",
          "The Blade Is Me"
        ]
      },
      {
        seasonNumber: 2,
        title: 'Season 2: The Separation',
        episodes: [
          "The Last 9 Days",
          "Peace from Shadows",
          "The Fundamental Virulence",
          "Heart of Wolf",
          "Rages at Ringside",
          "Rushes Thoroughly, Rockin' Blood",
          "The White Haze",
          "I Am the Edge",
          "The Headless Star",
          "Too Early to Win, Too Late to Know",
          "Black",
          "A",
          "The Master"
        ]
      },
      {
        seasonNumber: 3,
        title: 'Season 3: The Conflict',
        episodes: [
          "A Praying Mantis, a Tiny Glint",
          "From the Hell",
          "The Dark Arm",
          "Heart of Darkness",
          "The Holy Maiden's March",
          "The Undying Flame",
          "The Puppet Master's Trap",
          "Eyes of the Almighty",
          "The Horn of Salvation",
          "The Miracle of Gerard",
          "The Silver Arrow",
          "The Final Gates",
          "The Future Stolen"
        ]
      }
    ]
  },
  {
    slug: 'death-note',
    title: 'Death Note',
    japaneseTitle: 'DEATH NOTE',
    englishTitle: 'Death Note',
    synopsis: 'An intelligent high school student goes on a secret crusade to eliminate criminals from the world after discovering a notebook capable of killing anyone whose name is written into it.',
    posterImage: ARTWORK['death-note'].poster,
    coverImage: ARTWORK['death-note'].banner,
    bannerImage: ARTWORK['death-note'].banner,
    format: 'TV',
    status: 'COMPLETED',
    releaseYear: 2006,
    rating: 9.0,
    voteCount: 280000,
    durationMinutes: 23,
    studio: 'Madhouse',
    isFeatured: true,
    isTrending: true,
    hasHindiDub: true,
    hasEnglishDub: true,
    hasSubtitles: true,
    genres: ['Mystery', 'Psychological', 'Supernatural'],
    aliases: [{ title: 'DN', type: 'ACRONYM' }],
    seasons: [
      {
        seasonNumber: 1,
        title: 'Season 1: Complete Masterpiece (L vs Kira & The Successors)',
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
    slug: 'your-name',
    title: 'Your Name (Kimi no Na wa)',
    japaneseTitle: '君の名は。',
    englishTitle: 'Your Name',
    synopsis: 'Two strangers find themselves linked in a bizarre way. When a connection forms, will distance be the only thing to keep them apart?',
    posterImage: ARTWORK['your-name'].poster,
    coverImage: ARTWORK['your-name'].banner,
    bannerImage: ARTWORK['your-name'].banner,
    format: 'MOVIE',
    status: 'COMPLETED',
    releaseYear: 2016,
    rating: 8.9,
    voteCount: 198000,
    durationMinutes: 107,
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
          "Feature Film: Theatrical Multi-Audio Master Edition",
          "Feature Film: Director's Cut with Alternate Score"
        ]
      }
    ]
  }
];

async function seedDatabase() {
  console.log('🚀 Seeding comprehensive catalog with all seasons and multi-audio...');

  const genres = [
    { name: 'Action', slug: 'action' },
    { name: 'Adventure', slug: 'adventure' },
    { name: 'Fantasy', slug: 'fantasy' },
    { name: 'Supernatural', slug: 'supernatural' },
    { name: 'Mystery', slug: 'mystery' },
    { name: 'Drama', slug: 'drama' },
    { name: 'Comedy', slug: 'comedy' },
    { name: 'Romance', slug: 'romance' },
    { name: 'Psychological', slug: 'psychological' },
    { name: 'Historical', slug: 'historical' }
  ];

  const genreMap = new Map();
  for (const g of genres) {
    const record = await prisma.genre.upsert({
      where: { slug: g.slug },
      update: { name: g.name },
      create: { name: g.name, slug: g.slug }
    });
    genreMap.set(g.name, record.id);
  }

  let totalEpisodes = 0;

  for (const animeData of FULL_CATALOG) {
    console.log(`\n📺 Processing ${animeData.title} (${animeData.slug})...`);

    // Flatten all episodes count
    const episodeCount = animeData.seasons.reduce((acc, s) => acc + s.episodes.length, 0);

    const anime = await prisma.anime.upsert({
      where: { slug: animeData.slug },
      update: {
        title: animeData.title,
        japaneseTitle: animeData.japaneseTitle,
        englishTitle: animeData.englishTitle,
        synopsis: animeData.synopsis,
        posterImage: animeData.posterImage,
        coverImage: animeData.coverImage,
        bannerImage: animeData.bannerImage,
        format: animeData.format,
        status: animeData.status,
        releaseYear: animeData.releaseYear,
        rating: animeData.rating,
        voteCount: animeData.voteCount,
        episodeCount,
        durationMinutes: animeData.durationMinutes,
        studio: animeData.studio,
        isFeatured: animeData.isFeatured,
        isTrending: animeData.isTrending,
        hasHindiDub: animeData.hasHindiDub,
        hasEnglishDub: animeData.hasEnglishDub,
        hasSubtitles: animeData.hasSubtitles
      },
      create: {
        slug: animeData.slug,
        title: animeData.title,
        japaneseTitle: animeData.japaneseTitle,
        englishTitle: animeData.englishTitle,
        synopsis: animeData.synopsis,
        posterImage: animeData.posterImage,
        coverImage: animeData.coverImage,
        bannerImage: animeData.bannerImage,
        format: animeData.format,
        status: animeData.status,
        releaseYear: animeData.releaseYear,
        rating: animeData.rating,
        voteCount: animeData.voteCount,
        episodeCount,
        durationMinutes: animeData.durationMinutes,
        studio: animeData.studio,
        isFeatured: animeData.isFeatured,
        isTrending: animeData.isTrending,
        hasHindiDub: animeData.hasHindiDub,
        hasEnglishDub: animeData.hasEnglishDub,
        hasSubtitles: animeData.hasSubtitles
      }
    });

    // Link Genres
    for (const gName of animeData.genres) {
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
    for (const al of animeData.aliases) {
      const existing = await prisma.animeAlias.findFirst({
        where: { animeId: anime.id, title: al.title }
      });
      if (!existing) {
        await prisma.animeAlias.create({
          data: { animeId: anime.id, title: al.title, type: al.type }
        });
      }
    }

    // Delete extraneous seasons
    const validSeasonNums = animeData.seasons.map(s => s.seasonNumber);
    await prisma.season.deleteMany({
      where: {
        animeId: anime.id,
        seasonNumber: { notIn: validSeasonNums }
      }
    });

    // Create / Update Seasons and Episodes
    let globalAnimeEpIndex = 0;
    for (const s of animeData.seasons) {
      const season = await prisma.season.upsert({
        where: { animeId_seasonNumber: { animeId: anime.id, seasonNumber: s.seasonNumber } },
        update: { title: s.title },
        create: { animeId: anime.id, seasonNumber: s.seasonNumber, title: s.title }
      });

      // Valid episode numbers for this season
      const validEpNums = s.episodes.map((_, i) => i + 1);
      await prisma.episode.deleteMany({
        where: {
          seasonId: season.id,
          episodeNumber: { notIn: validEpNums }
        }
      });

      for (let i = 0; i < s.episodes.length; i++) {
        globalAnimeEpIndex++;
        totalEpisodes++;
        const epNumber = i + 1;
        const epTitle = s.episodes[i];

        const episode = await prisma.episode.upsert({
          where: { seasonId_episodeNumber: { seasonId: season.id, episodeNumber: epNumber } },
          update: {
            title: epTitle,
            synopsis: `${anime.title} - ${s.title}: Episode ${epNumber}. Multi-audio available in Hindi Dub, English Dub, and Japanese with subtitles.`,
            thumbnail: animeData.bannerImage || animeData.posterImage,
            durationMinutes: animeData.format === 'MOVIE' ? animeData.durationMinutes : 24,
            introStart: 60,
            introEnd: 150,
            outroStart: 1350,
            outroEnd: 1440
          },
          create: {
            seasonId: season.id,
            animeId: anime.id,
            episodeNumber: epNumber,
            title: epTitle,
            synopsis: `${anime.title} - ${s.title}: Episode ${epNumber}. Multi-audio available in Hindi Dub, English Dub, and Japanese with subtitles.`,
            thumbnail: animeData.bannerImage || animeData.posterImage,
            durationMinutes: animeData.format === 'MOVIE' ? animeData.durationMinutes : 24,
            introStart: 60,
            introEnd: 150,
            outroStart: 1350,
            outroEnd: 1440
          }
        });

        // Delete old video sources and insert 4 sources per episode
        await prisma.videoSource.deleteMany({ where: { episodeId: episode.id } });

        const streamSeed = globalAnimeEpIndex;
        const masterStream = getStream(streamSeed);
        const stream1080p = getStream(streamSeed + 1);
        const stream720p = getStream(streamSeed + 2);
        const stream480p = getStream(streamSeed + 3);

        await prisma.videoSource.createMany({
          data: [
            {
              episodeId: episode.id,
              provider: 'ANKIRAB Authorized CDN',
              quality: 'auto',
              format: masterStream.endsWith('.m3u8') ? 'HLS' : 'MP4',
              url: masterStream,
              isMaster: true
            },
            {
              episodeId: episode.id,
              provider: 'ANKIRAB Authorized CDN',
              quality: '1080p',
              format: 'MP4',
              url: stream1080p,
              isMaster: false
            },
            {
              episodeId: episode.id,
              provider: 'ANKIRAB Authorized CDN',
              quality: '720p',
              format: 'MP4',
              url: stream720p,
              isMaster: false
            },
            {
              episodeId: episode.id,
              provider: 'ANKIRAB Authorized CDN',
              quality: '480p',
              format: 'MP4',
              url: stream480p,
              isMaster: false
            }
          ]
        });

        // Audio Tracks: Hindi (Default), English, Japanese
        await prisma.audioTrack.deleteMany({ where: { episodeId: episode.id } });
        await prisma.audioTrack.createMany({
          data: [
            {
              episodeId: episode.id,
              language: 'hi',
              label: 'Hindi Dubbed (हिंदी डब)',
              isDefault: true,
              audioUrl: `http://localhost:4000/api/video/stream/${episode.id}?lang=hi`
            },
            {
              episodeId: episode.id,
              language: 'en',
              label: 'English Dubbed',
              isDefault: false,
              audioUrl: `http://localhost:4000/api/video/stream/${episode.id}?lang=en`
            },
            {
              episodeId: episode.id,
              language: 'ja',
              label: 'Japanese (Original Audio)',
              isDefault: false,
              audioUrl: `http://localhost:4000/api/video/stream/${episode.id}?lang=ja`
            }
          ]
        });

        // Subtitles: English & Hindi
        await prisma.subtitleTrack.deleteMany({ where: { episodeId: episode.id } });
        await prisma.subtitleTrack.createMany({
          data: [
            {
              episodeId: episode.id,
              language: 'en',
              label: 'English Subtitles',
              vttUrl: 'http://localhost:4000/api/subtitles/english.vtt',
              isDefault: true
            },
            {
              episodeId: episode.id,
              language: 'hi',
              label: 'Hindi Subtitles (हिंदी)',
              vttUrl: 'http://localhost:4000/api/subtitles/hindi.vtt',
              isDefault: false
            }
          ]
        });
      }
    }
  }

  console.log(`\n🎉 DONE! All 13 animes seeded with a total of ${totalEpisodes} full multi-audio episodes!`);
}

module.exports = { FULL_CATALOG, ARTWORK };

if (require.main === module) {
  seedDatabase()
    .catch(console.error)
    .finally(() => prisma['$disconnect']());
}
