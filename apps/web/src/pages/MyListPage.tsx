import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { userService } from '../services/auth.service';
import { WatchlistItemDto, WatchStatus } from '@ankirab/shared';
import { Bookmark, Play, Trash2, Star, CheckCircle } from 'lucide-react';
import { useToastStore } from '../store/toastStore';

export const MyListPage: React.FC = () => {
  const { addToast } = useToastStore();
  const [items, setItems] = useState<WatchlistItemDto[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | WatchStatus>('ALL');
  const [isLoading, setIsLoading] = useState(true);

  const fetchWatchlist = async () => {
    try {
      setIsLoading(true);
      const list = await userService.getWatchlist();
      setItems(list);
    } catch {
      addToast('Failed to load watchlist', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWatchlist();
  }, []);

  const handleRemove = async (animeId: string, title: string) => {
    try {
      await userService.removeFromWatchlist(animeId);
      setItems((prev) => prev.filter((i) => i.animeId !== animeId));
      addToast(`Removed "${title}" from your watchlist`, 'info');
    } catch {
      addToast('Failed to remove item', 'error');
    }
  };

  const filteredItems = items.filter((item) => {
    if (selectedFilter === 'ALL') return true;
    return item.status === selectedFilter;
  });

  const filterTabs: { label: string; value: 'ALL' | WatchStatus }[] = [
    { label: 'All Titles', value: 'ALL' },
    { label: 'Watching', value: 'WATCHING' },
    { label: 'Plan to Watch', value: 'PLAN_TO_WATCH' },
    { label: 'Completed', value: 'COMPLETED' },
    { label: 'On Hold', value: 'ON_HOLD' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-white tracking-wide flex items-center gap-3">
            <Bookmark className="w-7 h-7 text-ankirab-purple" />
            <span>My Anime List</span>
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Manage your personal watchlist, track completed shows, and resume playback.
          </p>
        </div>

        <span className="text-xs text-gray-400 font-semibold px-3 py-1.5 bg-ankirab-card border border-ankirab-border rounded-xl">
          {items.length} Saved {items.length === 1 ? 'Anime' : 'Animes'}
        </span>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 mb-8">
        {filterTabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setSelectedFilter(tab.value)}
            className={`py-2 px-4 rounded-xl text-xs sm:text-sm font-semibold transition whitespace-nowrap ${
              selectedFilter === tab.value
                ? 'bg-ankirab-purple text-white shadow-md shadow-ankirab-purple/30'
                : 'bg-ankirab-card border border-ankirab-border text-gray-300 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Watchlist Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="aspect-[3/4] bg-ankirab-card rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filteredItems.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="group relative flex flex-col bg-ankirab-card border border-ankirab-border rounded-2xl overflow-hidden hover:border-ankirab-purple/60 transition-all shadow-lg"
            >
              {/* Poster */}
              <Link to={`/anime/${item.anime.slug}`} className="relative aspect-[3/4] w-full overflow-hidden bg-ankirab-surface">
                <img
                  src={item.anime.posterImage}
                  alt={item.anime.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />

                {/* Status Badge */}
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-black/75 backdrop-blur-md text-ankirab-cyan border border-white/10">
                  {item.status.replace('_', ' ')}
                </div>

                {/* Delete button */}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleRemove(item.animeId, item.anime.title);
                  }}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-black/75 text-gray-400 hover:text-rose-400 hover:bg-black transition"
                  title="Remove from list"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>

                {/* Rating */}
                {item.anime.rating && (
                  <div className="absolute bottom-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded bg-black/75 text-amber-400 text-xs font-bold">
                    <Star className="w-3 h-3 fill-amber-400" />
                    <span>{item.anime.rating.toFixed(1)}</span>
                  </div>
                )}
              </Link>

              {/* Title & Actions */}
              <div className="p-3 flex flex-col justify-between flex-1 gap-2">
                <div>
                  <Link
                    to={`/anime/${item.anime.slug}`}
                    className="font-semibold text-sm text-white hover:text-ankirab-cyan line-clamp-1 transition"
                  >
                    {item.anime.title}
                  </Link>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {item.anime.releaseYear} • {item.anime.format}
                  </p>
                </div>

                <Link
                  to={`/anime/${item.anime.slug}`}
                  className="w-full py-1.5 px-2 bg-ankirab-surface hover:bg-ankirab-purple/20 text-ankirab-cyan text-xs font-semibold rounded-lg text-center transition flex items-center justify-center gap-1"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>Watch Now</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-ankirab-card border border-ankirab-border rounded-2xl p-12 text-center text-gray-400">
          <Bookmark className="w-10 h-10 text-gray-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white mb-1">Your watchlist is empty</h3>
          <p className="text-xs sm:text-sm mb-6">Explore the anime catalog and add titles to start tracking your progress.</p>
          <Link
            to="/catalog"
            className="px-5 py-2.5 bg-ankirab-purple text-white rounded-xl text-sm font-semibold hover:bg-purple-600 transition"
          >
            Browse Anime Catalog
          </Link>
        </div>
      )}
    </div>
  );
};
