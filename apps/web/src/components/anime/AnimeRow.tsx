import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { AnimeDto } from '@ankirab/shared';
import { AnimeCard } from './AnimeCard';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';

interface AnimeRowProps {
  title: string;
  icon?: React.ReactNode;
  animeList: AnimeDto[];
  viewAllLink?: string;
  watchlistIds?: Set<string>;
  onWatchlistToggle?: () => void;
}

export const AnimeRow: React.FC<AnimeRowProps> = ({
  title,
  icon,
  animeList,
  viewAllLink,
  watchlistIds,
  onWatchlistToggle
}) => {
  const rowRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (rowRef.current) {
      const scrollAmount = direction === 'left' ? -600 : 600;
      rowRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (!animeList || animeList.length === 0) return null;

  return (
    <section className="my-10">
      {/* Row Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          {icon && <div className="text-ankirab-cyan">{icon}</div>}
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-wide">
            {title}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {viewAllLink && (
            <Link
              to={viewAllLink}
              className="flex items-center gap-1 text-xs sm:text-sm font-semibold text-ankirab-cyan hover:text-cyan-300 transition mr-2"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}

          <button
            onClick={() => scroll('left')}
            className="p-1.5 rounded-lg bg-ankirab-surface border border-ankirab-border text-gray-300 hover:text-white hover:bg-ankirab-card transition"
            title="Scroll Left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="p-1.5 rounded-lg bg-ankirab-surface border border-ankirab-border text-gray-300 hover:text-white hover:bg-ankirab-card transition"
            title="Scroll Right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Horizontal Scrollable Row */}
      <div
        ref={rowRef}
        className="flex gap-4 overflow-x-auto no-scrollbar scroll-smooth pb-4 pt-1"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {animeList.map((anime) => (
          <div key={anime.id} className="min-w-[170px] max-w-[170px] sm:min-w-[210px] sm:max-w-[210px] flex-shrink-0">
            <AnimeCard
              anime={anime}
              inWatchlist={watchlistIds?.has(anime.id)}
              onWatchlistToggle={onWatchlistToggle}
            />
          </div>
        ))}
      </div>
    </section>
  );
};
