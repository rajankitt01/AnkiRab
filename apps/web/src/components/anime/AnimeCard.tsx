import React from 'react';
import { Link } from 'react-router-dom';
import { AnimeDto } from '@ankirab/shared';
import { Star, Play, Bookmark, Check } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { userService } from '../../services/auth.service';
import { useToastStore } from '../../store/toastStore';

interface AnimeCardProps {
  anime: AnimeDto;
  inWatchlist?: boolean;
  onWatchlistToggle?: () => void;
}

export const AnimeCard: React.FC<AnimeCardProps> = ({ anime, inWatchlist = false, onWatchlistToggle }) => {
  const { isAuthenticated, openLoginModal } = useAuthStore();
  const { addToast } = useToastStore();
  const [isSaved, setIsSaved] = React.useState(inWatchlist);
  const [isSaving, setIsSaving] = React.useState(false);

  React.useEffect(() => {
    setIsSaved(inWatchlist);
  }, [inWatchlist]);

  const handleWatchlistClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      openLoginModal();
      return;
    }

    try {
      setIsSaving(true);
      const res = await userService.toggleWatchlist(anime.id, 'PLAN_TO_WATCH');
      const action = (res as any).data?.action;
      const savedNow = action === 'added' || action === 'updated';
      setIsSaved(savedNow);
      addToast(
        savedNow ? `Added "${anime.title}" to your watchlist` : `Removed "${anime.title}" from watchlist`,
        'success'
      );
      if (onWatchlistToggle) onWatchlistToggle();
    } catch {
      addToast('Failed to update watchlist', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="group relative flex flex-col bg-ankirab-card border border-ankirab-border/60 rounded-2xl overflow-hidden hover:border-ankirab-purple/50 transition-all duration-300 hover:shadow-xl hover:shadow-ankirab-purple/10 hover:-translate-y-1">
      {/* Poster Image Container */}
      <Link to={`/anime/${anime.slug}`} className="relative aspect-[3/4] w-full overflow-hidden bg-ankirab-surface">
        <img
          src={anime.posterImage}
          alt={anime.title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-ankirab-darkest via-transparent to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />

        {/* Top Badges: Format & Languages */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1 pointer-events-none">
          <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-black/70 backdrop-blur-md text-white border border-white/10 rounded-md">
            {anime.format}
          </span>

          <div className="flex items-center gap-1">
            {anime.hasHindiDub && (
              <span className="px-1.5 py-0.5 text-[9px] font-extrabold bg-amber-500/90 text-black rounded shadow" title="Hindi Dubbed">
                HI-DUB
              </span>
            )}
            {anime.hasEnglishDub && (
              <span className="px-1.5 py-0.5 text-[9px] font-extrabold bg-blue-500/90 text-white rounded shadow" title="English Dubbed">
                EN-DUB
              </span>
            )}
          </div>
        </div>

        {/* Hover Action Overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-[2px]">
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-ankirab-purple to-ankirab-cyan flex items-center justify-center shadow-lg shadow-ankirab-purple/40 text-white transform group-hover:scale-110 transition-transform">
            <Play className="w-6 h-6 fill-white ml-0.5" />
          </div>
        </div>

        {/* Watchlist Toggle Button (Top-Right) */}
        <button
          onClick={handleWatchlistClick}
          disabled={isSaving}
          title={isSaved ? 'In Watchlist' : 'Add to Watchlist'}
          className={`absolute bottom-3 right-3 z-10 w-8 h-8 rounded-full flex items-center justify-center transition backdrop-blur-md ${
            isSaved
              ? 'bg-ankirab-purple text-white shadow-md shadow-ankirab-purple/30'
              : 'bg-black/60 text-gray-300 hover:text-white hover:bg-black/80'
          }`}
        >
          {isSaved ? <Check className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
        </button>

        {/* Rating Badge (Bottom Left) */}
        {anime.rating ? (
          <div className="absolute bottom-3 left-3 flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-md text-xs font-semibold text-amber-400 border border-amber-400/20">
            <Star className="w-3.5 h-3.5 fill-amber-400" />
            <span>{anime.rating.toFixed(1)}</span>
          </div>
        ) : null}
      </Link>

      {/* Card Body */}
      <div className="p-3.5 flex flex-col flex-1 justify-between gap-2">
        <div>
          <Link
            to={`/anime/${anime.slug}`}
            className="font-semibold text-sm text-gray-100 group-hover:text-ankirab-cyan line-clamp-1 transition-colors"
            title={anime.title}
          >
            {anime.title}
          </Link>
          
          <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
            <span>{anime.releaseYear}</span>
            <span>•</span>
            <span className="capitalize">{anime.status.toLowerCase()}</span>
            {anime.episodeCount && (
              <>
                <span>•</span>
                <span>{anime.episodeCount} eps</span>
              </>
            )}
          </div>
        </div>

        {/* Genres tag list */}
        {anime.genres && anime.genres.length > 0 && (
          <div className="flex flex-wrap gap-1 text-[11px] text-gray-400">
            {anime.genres.slice(0, 2).map((g) => (
              <span key={g.id} className="px-1.5 py-0.5 bg-ankirab-surface rounded text-gray-300">
                {g.name}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
