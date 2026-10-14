import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AnimeDto } from '@ankirab/shared';
import { Play, Info, Star, ChevronLeft, ChevronRight, Volume2, Sparkles } from 'lucide-react';

interface AnimeHeroProps {
  featuredList: AnimeDto[];
}

export const AnimeHero: React.FC<AnimeHeroProps> = ({ featuredList }) => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (featuredList.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredList.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [featuredList.length]);

  if (!featuredList || featuredList.length === 0) return null;

  const current = featuredList[currentIndex];
  const bgImage = current.bannerImage || current.coverImage || current.posterImage;

  const handlePlayClick = () => {
    if (current.seasons && current.seasons.length > 0 && current.seasons[0].episodes && current.seasons[0].episodes.length > 0) {
      navigate(`/watch/${current.seasons[0].episodes[0].id}`);
    } else {
      navigate(`/anime/${current.slug}`);
    }
  };

  return (
    <div className="relative w-full h-[520px] sm:h-[600px] lg:h-[650px] overflow-hidden bg-ankirab-darkest">
      {/* Background Banner with layered cinematic gradient masks */}
      <div className="absolute inset-0">
        <img
          src={bgImage}
          alt={current.title}
          className="w-full h-full object-cover object-center filter brightness-90 transition-all duration-1000 transform scale-105"
        />
        {/* Left-to-right fade for readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-ankirab-darkest via-ankirab-darkest/85 to-transparent" />
        {/* Bottom fade into main content */}
        <div className="absolute inset-0 bg-gradient-to-t from-ankirab-darkest via-ankirab-darkest/40 to-transparent" />
        {/* Subtle accent glow */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-ankirab-purple/15 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Hero Content Container */}
      <div className="relative max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
        <div className="max-w-2xl space-y-4">
          
          {/* Top Metadata Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold bg-ankirab-purple/30 border border-ankirab-purple/50 text-purple-200 rounded-full backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-ankirab-cyan" />
              <span>FEATURED SPOTLIGHT</span>
            </span>

            {current.hasHindiDub && (
              <span className="px-2.5 py-1 text-xs font-bold bg-amber-500/20 border border-amber-500/40 text-amber-300 rounded-full backdrop-blur-md">
                🇮🇳 Hindi Dubbed Available
              </span>
            )}

            {current.hasEnglishDub && (
              <span className="px-2.5 py-1 text-xs font-bold bg-blue-500/20 border border-blue-500/40 text-blue-300 rounded-full backdrop-blur-md">
                English Dubbed
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-none drop-shadow-lg">
            {current.title}
          </h1>

          {/* Quick info badges: Rating, Year, Format */}
          <div className="flex items-center gap-3 text-sm text-gray-300">
            {current.rating && (
              <span className="flex items-center gap-1 font-bold text-amber-400 bg-black/50 px-2 py-0.5 rounded border border-amber-400/20">
                <Star className="w-4 h-4 fill-amber-400" />
                {current.rating.toFixed(1)}
              </span>
            )}
            <span className="font-semibold text-white">{current.releaseYear}</span>
            <span className="px-2 py-0.5 text-xs bg-ankirab-surface border border-ankirab-border rounded font-medium">
              {current.format}
            </span>
            <span className="text-gray-400 capitalize">{current.status.toLowerCase()}</span>
            {current.studio && (
              <span className="hidden sm:inline text-gray-400">• Studio {current.studio}</span>
            )}
          </div>

          {/* Genres */}
          <div className="flex flex-wrap gap-2">
            {current.genres.map((g) => (
              <Link
                key={g.id}
                to={`/catalog?genre=${g.slug}`}
                className="text-xs text-gray-300 bg-ankirab-card/70 hover:bg-ankirab-surface hover:text-white px-2.5 py-1 rounded-md border border-ankirab-border/50 transition"
              >
                {g.name}
              </Link>
            ))}
          </div>

          {/* Synopsis */}
          <p className="text-sm sm:text-base text-gray-300 line-clamp-3 leading-relaxed max-w-xl drop-shadow">
            {current.synopsis}
          </p>

          {/* CTA Buttons */}
          <div className="flex items-center gap-4 pt-3">
            <button
              onClick={handlePlayClick}
              className="flex items-center gap-2.5 px-6 py-3 rounded-xl bg-gradient-to-r from-ankirab-purple to-indigo-600 hover:from-purple-600 hover:to-indigo-500 text-white font-bold shadow-lg shadow-ankirab-purple/30 hover:scale-105 transition transform"
            >
              <Play className="w-5 h-5 fill-white" />
              <span>Play Now</span>
            </button>

            <Link
              to={`/anime/${current.slug}`}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-ankirab-card/80 hover:bg-ankirab-card border border-ankirab-border text-gray-200 hover:text-white font-semibold backdrop-blur-md transition"
            >
              <Info className="w-5 h-5 text-ankirab-cyan" />
              <span>View Details</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Hero Carousel Navigation Arrows */}
      {featuredList.length > 1 && (
        <div className="absolute right-6 bottom-6 flex items-center gap-2 z-20">
          <button
            onClick={() => setCurrentIndex((prev) => (prev === 0 ? featuredList.length - 1 : prev - 1))}
            className="p-2.5 rounded-full bg-black/60 hover:bg-black/80 text-white border border-ankirab-border transition"
            title="Previous"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-1.5 px-2">
            {featuredList.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-2 rounded-full transition-all ${
                  idx === currentIndex ? 'w-6 bg-ankirab-cyan' : 'w-2 bg-gray-600 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>

          <button
            onClick={() => setCurrentIndex((prev) => (prev + 1) % featuredList.length)}
            className="p-2.5 rounded-full bg-black/60 hover:bg-black/80 text-white border border-ankirab-border transition"
            title="Next"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
};
