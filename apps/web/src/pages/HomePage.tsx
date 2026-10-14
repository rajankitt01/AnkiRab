import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { animeService } from '../services/anime.service';
import { userService } from '../services/auth.service';
import { AnimeHero } from '../components/anime/AnimeHero';
import { AnimeRow } from '../components/anime/AnimeRow';
import { useAuthStore } from '../store/authStore';
import { AnimeDto, WatchHistoryItemDto, WatchlistItemDto } from '@ankirab/shared';
import {
  Flame,
  TrendingUp,
  Sparkles,
  Clock,
  Compass,
  Languages,
  PlayCircle,
  Subtitles
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const { isAuthenticated } = useAuthStore();

  const [featured, setFeatured] = useState<AnimeDto[]>([]);
  const [trending, setTrending] = useState<AnimeDto[]>([]);
  const [popular, setPopular] = useState<AnimeDto[]>([]);
  const [recent, setRecent] = useState<AnimeDto[]>([]);
  const [hindiDubbed, setHindiDubbed] = useState<AnimeDto[]>([]);
  const [englishDubbed, setEnglishDubbed] = useState<AnimeDto[]>([]);
  const [history, setHistory] = useState<WatchHistoryItemDto[]>([]);
  const [watchlistIds, setWatchlistIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [featData, trendData, popData, recData, hiData, enData] = await Promise.all([
        animeService.getFeatured(),
        animeService.getTrending(),
        animeService.getPopular(),
        animeService.getRecentlyAdded(),
        animeService.getHindiDubbed(),
        animeService.getEnglishDubbed()
      ]);

      setFeatured(featData);
      setTrending(trendData);
      setPopular(popData);
      setRecent(recData);
      setHindiDubbed(hiData);
      setEnglishDubbed(enData);

      if (isAuthenticated) {
        const [watchItems, historyItems] = await Promise.all([
          userService.getWatchlist().catch(() => []),
          userService.getWatchHistory().catch(() => [])
        ]);
        setWatchlistIds(new Set(watchItems.map((w: WatchlistItemDto) => w.animeId)));
        setHistory(historyItems);
      }
    } catch (err) {
      console.error('Failed to load homepage data', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [isAuthenticated]);

  return (
    <div className="min-h-screen pb-16">
      {/* Featured Anime Hero Carousel */}
      <AnimeHero featuredList={featured} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        
        {/* Continue Watching Row (For logged in users) */}
        {isAuthenticated && history.length > 0 && (
          <section className="my-8">
            <div className="flex items-center gap-2.5 mb-4">
              <PlayCircle className="w-5 h-5 text-ankirab-cyan" />
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-wide">
                Continue Watching
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {history.slice(0, 4).map((item) => {
                const progressPct =
                  item.durationSeconds > 0
                    ? Math.min(100, (item.progressSeconds / item.durationSeconds) * 100)
                    : 0;

                return (
                  <Link
                    key={item.id}
                    to={`/watch/${item.episodeId}`}
                    className="group flex flex-col bg-ankirab-card border border-ankirab-border rounded-xl overflow-hidden hover:border-ankirab-purple transition"
                  >
                    <div className="relative aspect-video w-full overflow-hidden bg-ankirab-surface">
                      <img
                        src={item.episode.thumbnail || item.anime.posterImage}
                        alt={item.anime.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                      {/* Play glyph overlay */}
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                        <PlayCircle className="w-10 h-10 text-white fill-ankirab-purple/80" />
                      </div>
                      {/* Progress bar */}
                      <div className="absolute inset-x-0 bottom-0 h-1 bg-gray-700">
                        <div
                          className="h-full bg-ankirab-cyan transition-all"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    </div>

                    <div className="p-3">
                      <p className="font-semibold text-sm text-white line-clamp-1 group-hover:text-ankirab-cyan transition">
                        {item.anime.title}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Episode {item.episode.episodeNumber}: {item.episode.title}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* Quick Genre Filter Bar */}
        <div className="py-4 my-4 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-xs uppercase tracking-wider font-bold text-gray-400 mr-2 flex items-center gap-1">
            <Compass className="w-3.5 h-3.5 text-ankirab-cyan" />
            <span>Popular Genres:</span>
          </span>
          {['Action', 'Fantasy', 'Romance', 'Shounen', 'Isekai', 'Sci-Fi', 'Comedy', 'Supernatural'].map((g) => (
            <Link
              key={g}
              to={`/catalog?genre=${g.toLowerCase()}`}
              className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-ankirab-surface border border-ankirab-border hover:border-ankirab-purple hover:bg-ankirab-card hover:text-white text-gray-300 transition whitespace-nowrap"
            >
              {g}
            </Link>
          ))}
        </div>

        {/* Trending Anime Row */}
        <AnimeRow
          title="Trending Anime"
          icon={<Flame className="w-6 h-6 text-rose-500" />}
          animeList={trending}
          viewAllLink="/catalog?status=ONGOING"
          watchlistIds={watchlistIds}
          onWatchlistToggle={loadData}
        />

        {/* Hindi Dubbed Anime Row (Special Brand Feature) */}
        <div className="p-6 my-10 rounded-2xl bg-gradient-to-r from-amber-500/10 via-ankirab-card to-ankirab-surface border border-amber-500/30">
          <AnimeRow
            title="Hindi Dubbed Anime (हिन्दी डब)"
            icon={<Languages className="w-6 h-6 text-amber-400" />}
            animeList={hindiDubbed}
            viewAllLink="/catalog?audioLang=hi"
            watchlistIds={watchlistIds}
            onWatchlistToggle={loadData}
          />
        </div>

        {/* Popular Anime Row */}
        <AnimeRow
          title="Popular Classics & Blockbusters"
          icon={<TrendingUp className="w-6 h-6 text-ankirab-cyan" />}
          animeList={popular}
          viewAllLink="/catalog?sortBy=popularity"
          watchlistIds={watchlistIds}
          onWatchlistToggle={loadData}
        />

        {/* English Dubbed Anime Row */}
        <AnimeRow
          title="English Dubbed Releases"
          icon={<Sparkles className="w-6 h-6 text-blue-400" />}
          animeList={englishDubbed}
          viewAllLink="/catalog?audioLang=en"
          watchlistIds={watchlistIds}
          onWatchlistToggle={loadData}
        />

        {/* Recently Added Row */}
        <AnimeRow
          title="Recently Added & Updated"
          icon={<Clock className="w-6 h-6 text-purple-400" />}
          animeList={recent}
          viewAllLink="/catalog?sortBy=latest"
          watchlistIds={watchlistIds}
          onWatchlistToggle={loadData}
        />
      </main>
    </div>
  );
};
