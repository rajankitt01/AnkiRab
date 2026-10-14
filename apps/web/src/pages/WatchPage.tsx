import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { playbackService } from '../services/playback.service';
import { animeService } from '../services/anime.service';
import { VideoPlayer } from '../components/player/VideoPlayer';
import { PlaybackSessionDto, AnimeDto } from '@ankirab/shared';
import {
  ArrowLeft,
  SkipForward,
  SkipBack,
  Layers,
  Sparkles,
  Info,
  Calendar,
  Languages,
  Subtitles,
  Share2
} from 'lucide-react';
import { useToastStore } from '../store/toastStore';

export const WatchPage: React.FC = () => {
  const { episodeId } = useParams<{ episodeId: string }>();
  const navigate = useNavigate();
  const { addToast } = useToastStore();

  const [session, setSession] = useState<PlaybackSessionDto | null>(null);
  const [fullAnime, setFullAnime] = useState<AnimeDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!episodeId) return;

    const loadPlayback = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await playbackService.getPlaybackSession(episodeId);
        setSession(data);

        // Fetch full anime info for episode list
        const animeData = await animeService.getBySlug(data.anime.slug);
        setFullAnime(animeData);
      } catch (err: any) {
        setError(err.message || 'Failed to initialize video playback session');
      } finally {
        setIsLoading(false);
      }
    };

    loadPlayback();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [episodeId]);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      addToast('Watch link copied to clipboard!', 'info');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-ankirab-darkest flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-ankirab-purple border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold text-gray-400">Loading authorized stream...</p>
        </div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4 text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Stream Error</h2>
        <p className="text-gray-400 text-sm max-w-md mb-6">{error || 'Episode could not be found'}</p>
        <Link to="/catalog" className="px-5 py-2.5 bg-ankirab-purple text-white rounded-xl font-semibold">
          Return to Catalog
        </Link>
      </div>
    );
  }

  const allEpisodes = fullAnime?.seasons?.[0]?.episodes || [];

  return (
    <div className="min-h-screen bg-ankirab-darkest pb-20">
      
      {/* Top Breadcrumb Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between text-xs sm:text-sm text-gray-400">
        <Link
          to={`/anime/${session.anime.slug}`}
          className="flex items-center gap-1.5 hover:text-white transition group"
        >
          <ArrowLeft className="w-4 h-4 text-ankirab-cyan group-hover:-translate-x-1 transition-transform" />
          <span>Back to {session.anime.title}</span>
        </Link>

        <div className="flex items-center gap-3">
          <button
            onClick={handleShare}
            className="flex items-center gap-1 hover:text-white transition"
          >
            <Share2 className="w-4 h-4" />
            <span className="hidden sm:inline">Share</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Video Player & Episode Info (col-span-2) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* The Video Player Component */}
            <VideoPlayer
              session={session}
              onNextEpisode={
                session.nextEpisode
                  ? () => navigate(`/watch/${session.nextEpisode!.id}`)
                  : undefined
              }
              onPrevEpisode={
                session.prevEpisode
                  ? () => navigate(`/watch/${session.prevEpisode!.id}`)
                  : undefined
              }
            />

            {/* Episode Title & Navigation Controls */}
            <div className="p-6 bg-ankirab-card border border-ankirab-border rounded-2xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-ankirab-border/60">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-ankirab-cyan uppercase tracking-wider">
                      Episode {session.episode.episodeNumber}
                    </span>
                    <span className="text-gray-500">•</span>
                    <span className="text-xs text-gray-400">
                      {session.episode.durationMinutes || 24} minutes
                    </span>
                  </div>

                  <h1 className="text-xl sm:text-2xl font-black text-white">
                    {session.episode.title}
                  </h1>
                </div>

                {/* Next / Prev Quick Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => session.prevEpisode && navigate(`/watch/${session.prevEpisode.id}`)}
                    disabled={!session.prevEpisode}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-ankirab-surface hover:bg-ankirab-cardHover border border-ankirab-border rounded-xl text-xs font-semibold text-gray-300 hover:text-white disabled:opacity-40 disabled:pointer-events-none transition"
                  >
                    <SkipBack className="w-4 h-4" />
                    <span>Prev</span>
                  </button>

                  <button
                    onClick={() => session.nextEpisode && navigate(`/watch/${session.nextEpisode.id}`)}
                    disabled={!session.nextEpisode}
                    className="flex items-center gap-1.5 px-4 py-2 bg-ankirab-purple hover:bg-purple-600 text-white rounded-xl text-xs font-bold shadow-md shadow-ankirab-purple/20 disabled:opacity-40 disabled:pointer-events-none transition"
                  >
                    <span>Next</span>
                    <SkipForward className="w-4 h-4 fill-white" />
                  </button>
                </div>
              </div>

              {/* Episode Synopsis */}
              {session.episode.synopsis && (
                <p className="text-sm text-gray-300 leading-relaxed">
                  {session.episode.synopsis}
                </p>
              )}

              {/* Audio & Subtitle verification indicator */}
              <div className="flex flex-wrap items-center gap-2 pt-2 text-xs">
                <span className="text-gray-400">Available Tracks:</span>
                {session.audioTracks.map((a) => (
                  <span
                    key={a.language}
                    className="px-2 py-0.5 bg-ankirab-surface border border-ankirab-border rounded text-amber-300 font-medium"
                  >
                    {a.label}
                  </span>
                ))}
                {session.subtitleTracks.map((s) => (
                  <span
                    key={s.language}
                    className="px-2 py-0.5 bg-ankirab-surface border border-ankirab-border rounded text-blue-300 font-medium"
                  >
                    {s.label}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Episodes Playlist & Anime Summary */}
          <div className="space-y-6">
            
            {/* Playlist Container */}
            <div className="bg-ankirab-card border border-ankirab-border rounded-2xl overflow-hidden shadow-xl">
              <div className="p-4 bg-ankirab-surface border-b border-ankirab-border/70 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-ankirab-cyan" />
                  <h3 className="font-bold text-white text-sm">Episodes</h3>
                </div>
                <span className="text-xs text-gray-400 font-semibold">
                  {allEpisodes.length} Episodes
                </span>
              </div>

              {/* Scrollable Episodes List */}
              <div className="max-h-[480px] overflow-y-auto divide-y divide-ankirab-border/40 p-2 space-y-1">
                {allEpisodes.map((ep) => {
                  const isCurrent = ep.id === session.episode.id;

                  return (
                    <button
                      key={ep.id}
                      onClick={() => navigate(`/watch/${ep.id}`)}
                      className={`w-full text-left p-2.5 rounded-xl flex items-center gap-3 transition ${
                        isCurrent
                          ? 'bg-ankirab-purple/20 border border-ankirab-purple/50'
                          : 'hover:bg-ankirab-surface/80 text-gray-300 hover:text-white'
                      }`}
                    >
                      <div className="relative w-20 aspect-video rounded-lg overflow-hidden bg-black flex-shrink-0">
                        <img
                          src={ep.thumbnail || session.anime.posterImage}
                          alt={ep.title}
                          className="w-full h-full object-cover"
                        />
                        {isCurrent && (
                          <div className="absolute inset-0 bg-ankirab-purple/60 flex items-center justify-center">
                            <span className="text-[10px] font-black uppercase text-white tracking-widest">
                              PLAYING
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex-1 overflow-hidden">
                        <div className="flex items-center justify-between">
                          <span className={`text-xs font-bold ${isCurrent ? 'text-ankirab-cyan' : 'text-gray-400'}`}>
                            EP {ep.episodeNumber}
                          </span>
                          {ep.durationMinutes && (
                            <span className="text-[10px] text-gray-500">
                              {ep.durationMinutes}m
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-semibold text-white line-clamp-1 mt-0.5">
                          {ep.title}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Anime Synopsis Snippet */}
            {fullAnime && (
              <div className="p-4 bg-ankirab-card border border-ankirab-border rounded-2xl flex items-start gap-4">
                <img
                  src={fullAnime.posterImage}
                  alt={fullAnime.title}
                  className="w-16 aspect-[3/4] object-cover rounded-xl border border-ankirab-border"
                />
                <div className="flex-1">
                  <h4 className="font-bold text-white text-sm line-clamp-1">
                    {fullAnime.title}
                  </h4>
                  <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                    {fullAnime.synopsis}
                  </p>
                  <Link
                    to={`/anime/${fullAnime.slug}`}
                    className="inline-block mt-2 text-xs font-semibold text-ankirab-cyan hover:underline"
                  >
                    View Details Page →
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
