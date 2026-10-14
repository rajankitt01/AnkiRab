import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { animeService } from '../services/anime.service';
import { userService } from '../services/auth.service';
import { useAuthStore } from '../store/authStore';
import { useToastStore } from '../store/toastStore';
import { usePlayerStore } from '../store/playerStore';
import { AnimeDto, WatchlistItemDto } from '@ankirab/shared';
import { AnimeCard } from '../components/anime/AnimeCard';
import {
  Play,
  Bookmark,
  Share2,
  Star,
  Check,
  Calendar,
  Layers,
  Sparkles,
  Languages,
  Subtitles,
  Building2,
  Clock,
  ArrowRight
} from 'lucide-react';

export const AnimeDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, openLoginModal } = useAuthStore();
  const { addToast } = useToastStore();
  const { audioLanguage, setAudioLanguage } = usePlayerStore();

  const [anime, setAnime] = useState<AnimeDto | null>(null);
  const [related, setRelated] = useState<AnimeDto[]>([]);
  const [selectedSeasonIdx, setSelectedSeasonIdx] = useState(0);
  const [inWatchlist, setInWatchlist] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;

    const fetchDetails = async () => {
      try {
        setIsLoading(true);
        const [animeData, relatedData] = await Promise.all([
          animeService.getBySlug(slug),
          animeService.getRelated(slug).catch(() => [])
        ]);

        setAnime(animeData);
        setRelated(relatedData);

        if (isAuthenticated) {
          const list = await userService.getWatchlist().catch(() => []);
          const found = list.some((item: WatchlistItemDto) => item.animeId === animeData.id);
          setInWatchlist(found);
        }
      } catch (err) {
        console.error('Failed to load anime details', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetails();
  }, [slug, isAuthenticated]);

  const handleWatchlistToggle = async () => {
    if (!isAuthenticated) {
      openLoginModal();
      return;
    }
    if (!anime) return;

    try {
      const res = await userService.toggleWatchlist(anime.id, 'PLAN_TO_WATCH');
      const action = (res as any).data?.action;
      const isNowSaved = action === 'added' || action === 'updated';
      setInWatchlist(isNowSaved);
      addToast(
        isNowSaved ? `Added "${anime.title}" to your watchlist` : `Removed from watchlist`,
        'success'
      );
    } catch {
      addToast('Failed to update watchlist', 'error');
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      addToast('Link copied to clipboard!', 'info');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-ankirab-purple border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!anime) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
        <h2 className="text-2xl font-bold text-white mb-2">Anime Not Found</h2>
        <p className="text-gray-400 text-sm mb-6">The requested anime could not be found in our catalog.</p>
        <Link to="/catalog" className="px-5 py-2.5 bg-ankirab-purple text-white rounded-xl font-semibold">
          Browse Catalog
        </Link>
      </div>
    );
  }

  const currentSeason = anime.seasons && anime.seasons[selectedSeasonIdx];
  const firstEpisode = currentSeason?.episodes && currentSeason.episodes[0];

  return (
    <div className="min-h-screen pb-16">
      
      {/* Backdrop Cover Banner */}
      <div className="relative w-full h-[320px] sm:h-[420px] overflow-hidden bg-ankirab-darkest">
        <img
          src={anime.bannerImage || anime.coverImage || anime.posterImage}
          alt={anime.title}
          referrerPolicy="no-referrer"
          onError={(e) => {
            const target = e.currentTarget;
            if (anime.posterImage && target.src !== anime.posterImage) {
              target.src = anime.posterImage;
            }
          }}
          className="w-full h-full object-cover filter brightness-75"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ankirab-darkest via-ankirab-darkest/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-ankirab-darkest via-ankirab-darkest/50 to-transparent" />
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-44 relative z-10">
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Left Column: Poster & Quick Info */}
          <div className="w-full md:w-72 flex-shrink-0 flex flex-col items-center md:items-start">
            <div className="w-56 sm:w-64 md:w-full aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl border-2 border-ankirab-border/80 bg-ankirab-card">
              <img
                src={anime.posterImage}
                alt={anime.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Action Buttons */}
            <div className="w-full flex flex-col gap-2.5 mt-5">
              {firstEpisode && (
                <button
                  onClick={() => navigate(`/watch/${firstEpisode.id}`)}
                  className="w-full py-3.5 bg-gradient-to-r from-ankirab-purple to-indigo-600 hover:from-purple-600 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-ankirab-purple/30 flex items-center justify-center gap-2 transition transform hover:scale-[1.02]"
                >
                  <Play className="w-5 h-5 fill-white" />
                  <span>Start Watching Ep 1</span>
                </button>
              )}

              {/* Preferred Audio Language Picker */}
              <div className="w-full flex items-center justify-between p-2.5 bg-ankirab-card border border-ankirab-border rounded-xl">
                <span className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
                  <Languages className="w-3.5 h-3.5 text-ankirab-purple" />
                  Audio:
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setAudioLanguage('hi');
                      addToast('Preferred audio set to Hindi Dubbed', 'info');
                    }}
                    className={`text-[11px] font-bold px-2 py-0.5 rounded transition ${
                      audioLanguage === 'hi'
                        ? 'bg-amber-500 text-white shadow-sm'
                        : 'text-gray-400 hover:text-white bg-ankirab-surface'
                    }`}
                    title="Hindi Dubbed"
                  >
                    🇮🇳 Hindi
                  </button>
                  <button
                    onClick={() => {
                      setAudioLanguage('en');
                      addToast('Preferred audio set to English Dubbed', 'info');
                    }}
                    className={`text-[11px] font-bold px-2 py-0.5 rounded transition ${
                      audioLanguage === 'en'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-gray-400 hover:text-white bg-ankirab-surface'
                    }`}
                    title="English Dubbed"
                  >
                    🇬🇧 Eng
                  </button>
                  <button
                    onClick={() => {
                      setAudioLanguage('ja');
                      addToast('Preferred audio set to Japanese Subbed', 'info');
                    }}
                    className={`text-[11px] font-bold px-2 py-0.5 rounded transition ${
                      audioLanguage === 'ja'
                        ? 'bg-rose-600 text-white shadow-sm'
                        : 'text-gray-400 hover:text-white bg-ankirab-surface'
                    }`}
                    title="Japanese Subbed"
                  >
                    🇯🇵 Jap
                  </button>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleWatchlistToggle}
                  className={`flex-1 py-2.5 px-3 rounded-xl border text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 transition ${
                    inWatchlist
                      ? 'bg-ankirab-purple/20 border-ankirab-purple text-purple-300'
                      : 'bg-ankirab-surface border-ankirab-border text-gray-200 hover:text-white hover:bg-ankirab-card'
                  }`}
                >
                  {inWatchlist ? <Check className="w-4 h-4 text-ankirab-cyan" /> : <Bookmark className="w-4 h-4" />}
                  <span>{inWatchlist ? 'In Watchlist' : 'Add to List'}</span>
                </button>

                <button
                  onClick={handleShare}
                  className="p-2.5 rounded-xl bg-ankirab-surface border border-ankirab-border text-gray-300 hover:text-white hover:bg-ankirab-card transition"
                  title="Share Anime"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Metadata Card */}
            <div className="w-full mt-6 p-4 bg-ankirab-card border border-ankirab-border rounded-xl space-y-3 text-xs text-gray-300">
              <div className="flex items-center justify-between pb-2 border-b border-ankirab-border/60">
                <span className="text-gray-400">Format</span>
                <span className="font-bold text-white">{anime.format}</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-ankirab-border/60">
                <span className="text-gray-400">Release Year</span>
                <span className="font-bold text-white">{anime.releaseYear}</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-ankirab-border/60">
                <span className="text-gray-400">Status</span>
                <span className="font-bold text-emerald-400 capitalize">{anime.status.toLowerCase()}</span>
              </div>
              {anime.studio && (
                <div className="flex items-center justify-between pb-2 border-b border-ankirab-border/60">
                  <span className="text-gray-400">Studio</span>
                  <span className="font-bold text-white">{anime.studio}</span>
                </div>
              )}
              {anime.durationMinutes && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Avg Duration</span>
                  <span className="font-bold text-white">{anime.durationMinutes} mins</span>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Title, Synopsis, Languages, Seasons & Episodes */}
          <div className="flex-1 space-y-6">
            
            {/* Title & Aliases */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                {anime.hasHindiDub && (
                  <span className="px-2.5 py-0.5 text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full">
                    🇮🇳 Hindi Dub
                  </span>
                )}
                {anime.hasEnglishDub && (
                  <span className="px-2.5 py-0.5 text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40 rounded-full">
                    English Dub
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
                {anime.title}
              </h1>

              {/* Japanese and English titles */}
              <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-gray-400 mt-2">
                {anime.japaneseTitle && <span>{anime.japaneseTitle}</span>}
                {anime.englishTitle && anime.englishTitle !== anime.title && (
                  <>
                    <span>•</span>
                    <span>{anime.englishTitle}</span>
                  </>
                )}
              </div>

              {/* Rating and Reviews */}
              <div className="flex items-center gap-4 mt-3">
                {anime.rating && (
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-black/60 border border-amber-400/30 rounded-lg text-amber-400 font-bold text-sm">
                    <Star className="w-4 h-4 fill-amber-400" />
                    <span>{anime.rating.toFixed(1)}</span>
                  </div>
                )}
                {anime.voteCount && (
                  <span className="text-xs text-gray-400">
                    ({anime.voteCount.toLocaleString()} community ratings)
                  </span>
                )}
              </div>
            </div>

            {/* Genres */}
            <div className="flex flex-wrap gap-2">
              {anime.genres.map((g) => (
                <Link
                  key={g.id}
                  to={`/catalog?genre=${g.slug}`}
                  className="px-3 py-1 bg-ankirab-card hover:bg-ankirab-surface border border-ankirab-border text-xs font-semibold text-gray-200 rounded-lg transition"
                >
                  {g.name}
                </Link>
              ))}
            </div>

            {/* Synopsis */}
            <div className="p-5 bg-ankirab-card/70 border border-ankirab-border rounded-2xl">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2">
                Synopsis
              </h3>
              <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-line">
                {anime.synopsis}
              </p>
            </div>

            {/* Audio & Subtitle Language Availability Showcase */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-ankirab-card border border-ankirab-border rounded-xl">
                <div className="flex items-center gap-2 text-sm font-bold text-white mb-2">
                  <Languages className="w-4 h-4 text-amber-400" />
                  <span>Available Audio Tracks</span>
                </div>
                <div className="flex flex-wrap gap-1.5 text-xs">
                  {anime.hasHindiDub && (
                    <span className="px-2 py-1 bg-amber-500/10 text-amber-300 border border-amber-500/30 rounded">
                      Hindi (हिन्दी)
                    </span>
                  )}
                  {anime.hasEnglishDub && (
                    <span className="px-2 py-1 bg-blue-500/10 text-blue-300 border border-blue-500/30 rounded">
                      English
                    </span>
                  )}
                  <span className="px-2 py-1 bg-purple-500/10 text-purple-300 border border-purple-500/30 rounded">
                    Japanese (Original Audio)
                  </span>
                </div>
              </div>

              <div className="p-4 bg-ankirab-card border border-ankirab-border rounded-xl">
                <div className="flex items-center gap-2 text-sm font-bold text-white mb-2">
                  <Subtitles className="w-4 h-4 text-ankirab-cyan" />
                  <span>Available Subtitles</span>
                </div>
                <div className="flex flex-wrap gap-1.5 text-xs">
                  <span className="px-2 py-1 bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 rounded">
                    English Subtitles
                  </span>
                  <span className="px-2 py-1 bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 rounded">
                    Hindi Subtitles (हिंदी)
                  </span>
                </div>
              </div>
            </div>

            {/* Seasons and Episodes Section */}
            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-ankirab-purple" />
                  <span>Episodes</span>
                </h3>

                {/* Season Switcher */}
                {anime.seasons && anime.seasons.length > 1 && (
                  <div className="flex flex-wrap gap-1.5">
                    {anime.seasons.map((s, idx) => (
                      <button
                        key={s.id}
                        onClick={() => setSelectedSeasonIdx(idx)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                          selectedSeasonIdx === idx
                            ? 'bg-ankirab-purple text-white font-bold'
                            : 'bg-ankirab-surface text-gray-400 hover:text-white'
                        }`}
                      >
                        {s.title}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Episodes Grid/List */}
              {currentSeason && currentSeason.episodes && currentSeason.episodes.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[...currentSeason.episodes]
                    .sort((a, b) => a.episodeNumber - b.episodeNumber)
                    .map((ep) => (
                    <Link
                      key={ep.id}
                      to={`/watch/${ep.id}`}
                      className="group flex gap-3 p-3 bg-ankirab-card border border-ankirab-border/60 hover:border-ankirab-cyan rounded-xl transition duration-200"
                    >
                      {/* Thumbnail */}
                      <div className="relative w-32 aspect-video rounded-lg overflow-hidden bg-ankirab-surface flex-shrink-0">
                        <img
                          src={ep.thumbnail || anime.posterImage}
                          alt={ep.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition"
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                          <Play className="w-6 h-6 fill-white text-white" />
                        </div>
                      </div>

                      {/* Info */}
                      <div className="flex flex-col justify-between overflow-hidden">
                        <div>
                          <p className="text-xs font-bold text-ankirab-cyan">
                            Episode {ep.episodeNumber}
                          </p>
                          <p className="text-sm font-semibold text-white group-hover:text-ankirab-cyan line-clamp-1 transition">
                            {ep.title}
                          </p>
                          {ep.synopsis && (
                            <p className="text-xs text-gray-400 line-clamp-2 mt-1">
                              {ep.synopsis}
                            </p>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                          {ep.durationMinutes && (
                            <span className="text-[11px] text-gray-400 flex items-center gap-1 font-mono mr-1">
                              <Clock className="w-3 h-3" />
                              {ep.durationMinutes}m
                            </span>
                          )}
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30">
                            Hindi
                          </span>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-300 border border-blue-500/30">
                            Eng
                          </span>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-500/15 text-rose-300 border border-rose-500/30">
                            Jap
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center bg-ankirab-card border border-ankirab-border rounded-xl text-gray-400 text-sm">
                  Episodes are currently being scheduled for this title.
                </div>
              )}
            </div>

            {/* Related Anime Row */}
            {related.length > 0 && (
              <div className="mt-12 pt-8 border-t border-ankirab-border/60">
                <h3 className="text-xl font-bold text-white mb-4">You May Also Like</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {related.slice(0, 4).map((rel) => (
                    <AnimeCard key={rel.id} anime={rel} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
