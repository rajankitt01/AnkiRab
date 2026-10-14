import React, { useRef, useState, useEffect, useMemo } from 'react';
import Hls from 'hls.js';
import { PlaybackSessionDto } from '@ankirab/shared';
import { usePlayerStore } from '../../store/playerStore';
import { playbackService } from '../../services/playback.service';
import { useAuthStore } from '../../store/authStore';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Settings,
  SkipForward,
  SkipBack,
  RotateCcw,
  Languages,
  Subtitles,
  Tv,
  AlertCircle,
  Gauge,
  Film,
  Server
} from 'lucide-react';

interface VideoPlayerProps {
  session: PlaybackSessionDto;
  onNextEpisode?: () => void;
  onPrevEpisode?: () => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  session,
  onNextEpisode,
  onPrevEpisode
}) => {
  const { isAuthenticated } = useAuthStore();
  const {
    volume,
    setVolume,
    isMuted,
    setIsMuted,
    playbackRate,
    setPlaybackRate,
    audioLanguage,
    setAudioLanguage,
    subtitleLanguage,
    setSubtitleLanguage,
    subtitlesEnabled,
    setSubtitlesEnabled,
    autoSkipIntro
  } = usePlayerStore();

  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const lastEpisodeIdRef = useRef<string>(session.episode.id);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [showAudioMenu, setShowAudioMenu] = useState(false);
  const [showSubtitleMenu, setShowSubtitleMenu] = useState(false);
  const [selectedQuality, setSelectedQuality] = useState<string>('auto');
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [canSkipIntro, setCanSkipIntro] = useState(false);
  const [canSkipOutro, setCanSkipOutro] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [episodeToast, setEpisodeToast] = useState<string | null>(null);
  const [autoNextCountdown, setAutoNextCountdown] = useState<number | null>(null);

  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Available streaming servers from session
  const availableServers = useMemo(() => {
    if (session.servers && session.servers.length > 0) {
      return session.servers;
    }
    return [
      {
        id: 'ankirab-core',
        name: 'Server 1: AnkiRab Core Player',
        badge: 'HLS',
        type: 'hls' as const,
        url: session.sources?.[0]?.url || 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
        isDefault: true
      }
    ];
  }, [session.servers, session.sources]);

  // Prioritize default server from session
  const defaultServerId =
    availableServers.find((s) => s.isDefault)?.id ||
    availableServers[0]?.id;
  const [selectedServerId, setSelectedServerId] = useState<string>(defaultServerId);

  // Synchronize default server on episode change
  useEffect(() => {
    const def = availableServers.find((s) => s.isDefault) || availableServers[0];
    if (def) {
      setSelectedServerId(def.id);
    }
  }, [session.episode.id, availableServers]);

  const activeServer = useMemo(() => {
    return availableServers.find((s) => s.id === selectedServerId) || availableServers[0];
  }, [availableServers, selectedServerId]);

  const activeEmbedUrl = useMemo(() => {
    if (activeServer.type !== 'embed') return '';
    let url = activeServer.url;
    if (activeServer.id === 'vidlink-anime') {
      const mode = audioLanguage === 'ja' ? 'sub' : 'dub';
      url = url.replace(/\/(sub|dub)\b/, `/${mode}`);
    }
    return url;
  }, [activeServer, audioLanguage]);

  // Derive the active video source according to selected server, quality, and audio language
  const currentSource = useMemo(() => {
    if (activeServer && activeServer.type === 'hls' && activeServer.url) {
      return {
        id: activeServer.id,
        url: activeServer.url,
        format: activeServer.url.includes('.m3u8') ? ('HLS' as const) : ('MP4' as const),
        quality: selectedQuality !== 'auto' ? selectedQuality : '1080p',
        isMaster: true
      };
    }
    if (!session.sources || session.sources.length === 0) return null;
    if (selectedQuality !== 'auto') {
      const match = session.sources.find((s) => s.quality === selectedQuality);
      if (match) return match;
    }
    const langMatch = session.sources.find((s) => s.url.includes(`lang=${audioLanguage}`));
    if (langMatch) return langMatch;

    return (
      session.sources.find((s) => s.isMaster) ||
      session.sources.find((s) => s.format === 'HLS') ||
      session.sources[0]
    );
  }, [session.sources, activeServer, selectedQuality, audioLanguage]);

  // Display episode banner on switch
  useEffect(() => {
    setEpisodeToast(`Now Playing: Episode ${session.episode.episodeNumber} — ${session.episode.title}`);
    const timer = setTimeout(() => setEpisodeToast(null), 3500);
    return () => clearTimeout(timer);
  }, [session.episode.id]);

  // Synchronize HLS audio track and server when audioLanguage changes
  useEffect(() => {
    const targetServerId =
      audioLanguage === 'hi'
        ? (availableServers.find((s) => s.id === 'ankirab-hindi-stream')?.id || 'ankirab-hindi')
        : (availableServers.find((s) => s.id === 'vidlink-anime')?.id || (audioLanguage === 'en' ? 'ankirab-english' : 'ankirab-japanese'));
    const targetServer = availableServers.find((s) => s.id === targetServerId);
    if (targetServer && selectedServerId.startsWith('ankirab-') && targetServer.id !== selectedServerId) {
      setSelectedServerId(targetServer.id);
    }

    if (hlsRef.current && hlsRef.current.audioTracks && hlsRef.current.audioTracks.length > 0) {
      const trackIdx = hlsRef.current.audioTracks.findIndex(
        (t) =>
          t.lang === audioLanguage ||
          t.name.toLowerCase().includes(audioLanguage === 'hi' ? 'hindi' : audioLanguage === 'en' ? 'english' : 'japanese')
      );
      if (trackIdx !== -1 && hlsRef.current.audioTrack !== trackIdx) {
        hlsRef.current.audioTrack = trackIdx;
      }
    }
  }, [audioLanguage, availableServers, selectedServerId]);

  // Attach and load video when episode or source changes (for native HLS/MP4 player)
  useEffect(() => {
    if (activeServer.type === 'embed') return;
    const video = videoRef.current;
    if (!video || !currentSource) return;

    setHasError(false);
    setErrorMessage('');
    setIsBuffering(true);
    setAutoNextCountdown(null);

    // Retain previous timestamp during source/language switch within the same episode.
    // When changing to a brand-new episode, start at saved progress or 0:00.
    const isNewEpisode = lastEpisodeIdRef.current !== session.episode.id;
    lastEpisodeIdRef.current = session.episode.id;

    const startPosition =
      !isNewEpisode && video.currentTime > 0
        ? video.currentTime
        : session.progressSeconds && session.progressSeconds > 0
        ? session.progressSeconds
        : 0;

    // Completely unload previous video and tear down any existing HLS instance
    video.pause();
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    setCurrentTime(startPosition);
    setBuffered(0);

    // If source is HLS and browser supports HLS.js
    if (currentSource.format === 'HLS' && Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });

      hls.loadSource(currentSource.url);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setIsBuffering(false);
        if (startPosition > 0) {
          video.currentTime = startPosition;
        } else {
          video.currentTime = 0;
        }
        video.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
      });

      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;
            default: {
              // Try fallback to next available source
              const fallback = session.sources.find((s) => s.url !== currentSource.url);
              if (fallback) {
                hls.destroy();
                hlsRef.current = null;
                video.src = fallback.url;
                video.play().catch(() => {});
              } else {
                setHasError(true);
                setErrorMessage('Unable to connect to stream. Please switch quality or refresh.');
                hls.destroy();
                hlsRef.current = null;
              }
              break;
            }
          }
        }
      });

      hlsRef.current = hls;
    } else {
      // Native MP4 / WebM / Safari native HLS playback
      video.src = currentSource.url;
      video.load();

      const onCanPlay = () => {
        setIsBuffering(false);
        if (startPosition > 0) {
          video.currentTime = startPosition;
        } else {
          video.currentTime = 0;
        }
        video.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
        video.removeEventListener('canplay', onCanPlay);
      };

      const onError = () => {
        setIsBuffering(false);
        const fallback = session.sources.find((s) => s.url !== currentSource.url);
        if (fallback) {
          video.src = fallback.url;
          video.play().catch(() => {});
        } else {
          setHasError(true);
          setErrorMessage('Unable to load video stream for this episode.');
        }
        video.removeEventListener('error', onError);
      };

      video.addEventListener('canplay', onCanPlay);
      video.addEventListener('error', onError);
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [currentSource?.url, session.episode.id]);

  // Volume & Speed Sync
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = isMuted ? 0 : volume;
      videoRef.current.playbackRate = playbackRate;
    }
  }, [volume, isMuted, playbackRate]);

  // Periodic Progress Reporting to Backend
  useEffect(() => {
    if (!isAuthenticated) return;
    const interval = setInterval(() => {
      const video = videoRef.current;
      if (video && !video.paused && video.currentTime > 5 && video.duration > 0) {
        playbackService.updateProgress(session.episode.id, {
          progressSeconds: Math.floor(video.currentTime),
          durationSeconds: Math.floor(video.duration),
          completed: video.currentTime / video.duration > 0.88
        }).catch(() => {});
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [isAuthenticated, session.episode.id]);

  // Autoplay countdown handler on ended
  useEffect(() => {
    if (autoNextCountdown === null) return;
    if (autoNextCountdown > 0) {
      const timer = setTimeout(() => setAutoNextCountdown(autoNextCountdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (autoNextCountdown === 0) {
      setAutoNextCountdown(null);
      if (onNextEpisode) onNextEpisode();
    }
  }, [autoNextCountdown, onNextEpisode]);

  // Keyboard Navigation Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        skipSeconds(10);
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        skipSeconds(-10);
      } else if (e.code === 'KeyF') {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.code === 'KeyM') {
        e.preventDefault();
        setIsMuted(!isMuted);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, isMuted, duration]);

  // Time & Skip Intro/Outro Check
  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) return;

    setCurrentTime(video.currentTime);
    setDuration(video.duration || 0);

    // Buffer check
    if (video.buffered.length > 0) {
      setBuffered(video.buffered.end(video.buffered.length - 1));
    }

    // Intro timestamp check
    if (session.intro) {
      const inIntro = video.currentTime >= session.intro.start && video.currentTime < session.intro.end;
      setCanSkipIntro(inIntro);
      if (inIntro && autoSkipIntro) {
        video.currentTime = session.intro.end;
      }
    }

    // Outro timestamp check
    if (session.outro) {
      setCanSkipOutro(video.currentTime >= session.outro.start && video.currentTime < session.outro.end);
    }
  };

  const handleVideoEnded = () => {
    setIsPlaying(false);
    if (onNextEpisode) {
      setAutoNextCountdown(4);
    }
  };

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const togglePiP = async () => {
    if (!videoRef.current) return;
    if (document.pictureInPictureElement) {
      await document.exitPictureInPicture().catch(() => {});
    } else if (document.pictureInPictureEnabled) {
      await videoRef.current.requestPictureInPicture().catch(() => {});
    }
  };

  const skipSeconds = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, Math.min(duration, videoRef.current.currentTime + seconds));
    }
  };

  const handleSkipIntro = () => {
    if (videoRef.current && session.intro) {
      videoRef.current.currentTime = session.intro.end;
      setCanSkipIntro(false);
    }
  };

  const handleSkipOutro = () => {
    if (videoRef.current && session.outro) {
      videoRef.current.currentTime = session.outro.end;
      setCanSkipOutro(false);
    }
  };

  // Mouse move handler for auto-hiding controls
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
        setShowSettingsMenu(false);
        setShowQualityMenu(false);
        setShowAudioMenu(false);
        setShowSubtitleMenu(false);
      }
    }, 3500);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Switch quality while preserving playback timestamp
  const handleSelectQuality = (quality: string) => {
    setSelectedQuality(quality);
    setShowQualityMenu(false);
    if (videoRef.current) {
      const savedTime = videoRef.current.currentTime;
      setTimeout(() => {
        if (videoRef.current) videoRef.current.currentTime = savedTime;
      }, 300);
    }
  };

  // Active audio track label
  const activeAudioLabel =
    session.audioTracks.find((a) => a.language === audioLanguage)?.label || 'Hindi Dubbed';

  // Active subtitle track label
  const activeSubLabel = subtitlesEnabled
    ? session.subtitleTracks.find((s) => s.language === subtitleLanguage)?.label || 'English Subtitles'
    : 'Off';

  const handleLanguageSwitch = (lang: string) => {
    setAudioLanguage(lang);
    if (lang === 'ja' && !subtitlesEnabled) {
      setSubtitlesEnabled(true);
      setSubtitleLanguage('en');
    }

    const savedTime = videoRef.current ? videoRef.current.currentTime : currentTime;

    // Route to appropriate multi-audio server
    if (lang === 'hi') {
      const hindiServer = availableServers.find((s) => s.id === 'ankirab-hindi-stream' || s.id === 'ankirab-hindi');
      if (hindiServer) {
        setSelectedServerId(hindiServer.id);
      }
    } else if (lang === 'en' || lang === 'ja') {
      const vidlinkServer = availableServers.find((s) => s.id === 'vidlink-anime');
      if (vidlinkServer) {
        setSelectedServerId(vidlinkServer.id);
      } else {
        const targetServerId = lang === 'en' ? 'ankirab-english' : 'ankirab-japanese';
        const fallbackServer = availableServers.find((s) => s.id === targetServerId);
        if (fallbackServer) {
          setSelectedServerId(fallbackServer.id);
        }
      }
    }

    // Switch HLS audio track if active
    if (hlsRef.current && hlsRef.current.audioTracks && hlsRef.current.audioTracks.length > 0) {
      const trackIdx = hlsRef.current.audioTracks.findIndex(
        (t) =>
          t.lang === lang ||
          t.name.toLowerCase().includes(lang === 'hi' ? 'hindi' : lang === 'en' ? 'english' : 'japanese')
      );
      if (trackIdx !== -1) {
        hlsRef.current.audioTrack = trackIdx;
      }
    }

    setTimeout(() => {
      if (videoRef.current && savedTime > 0) {
        videoRef.current.currentTime = savedTime;
      }
    }, 200);

    const label =
      lang === 'hi'
        ? '🇮🇳 Playing Episode in Hindi Dubbed (हिंदी डब VIP चालू है)'
        : lang === 'en'
        ? '🇬🇧 Playing Episode in English Dubbed'
        : '🇯🇵 Playing Episode in Japanese (Subtitles Enabled)';
    setEpisodeToast(label);
    const timer = setTimeout(() => setEpisodeToast(null), 3500);
  };

  return (
    <div className="space-y-3">
      {/* Streaming Server & Audio Language Switcher Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-3.5 bg-ankirab-card border border-ankirab-border rounded-2xl shadow-lg">
        {/* Left: Server Switcher */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 mr-1">
            <Server className="w-3.5 h-3.5 text-ankirab-cyan" />
            <span className="text-xs font-bold uppercase tracking-wider text-gray-300">
              Server:
            </span>
          </div>
          {availableServers.map((server) => {
            const isSelected = server.id === activeServer.id;
            return (
              <button
                key={server.id}
                onClick={() => {
                  setSelectedServerId(server.id);
                  if (server.id === 'ankirab-hindi-stream' || server.id === 'ankirab-hindi') {
                    handleLanguageSwitch('hi');
                  } else if (server.id === 'ankirab-english') {
                    handleLanguageSwitch('en');
                  } else if (server.id === 'ankirab-japanese') {
                    handleLanguageSwitch('ja');
                  }
                }}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-gradient-to-r from-ankirab-purple to-ankirab-cyan text-white shadow-lg shadow-ankirab-purple/30 scale-105'
                    : 'bg-ankirab-surface text-gray-400 hover:text-white hover:bg-ankirab-cardHover border border-ankirab-border/60'
                }`}
              >
                <span>{server.name}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                    isSelected ? 'bg-black/40 text-white' : 'bg-black/30 text-gray-400'
                  }`}
                >
                  {server.badge}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right: Audio / Dub Language Switcher */}
        <div className="flex flex-wrap items-center gap-1.5 border-t lg:border-t-0 lg:border-l border-ankirab-border/80 pt-2 lg:pt-0 lg:pl-3">
          <div className="flex items-center gap-1.5 mr-1">
            <Languages className="w-3.5 h-3.5 text-ankirab-purple" />
            <span className="text-xs font-bold uppercase tracking-wider text-gray-300">
              Audio:
            </span>
          </div>
          <button
            onClick={() => handleLanguageSwitch('hi')}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              audioLanguage === 'hi'
                ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md shadow-orange-500/30 scale-105 ring-1 ring-orange-400/50'
                : 'bg-ankirab-surface text-gray-400 hover:text-white hover:bg-ankirab-cardHover border border-ankirab-border/60'
            }`}
          >
            <span>🇮🇳 Hindi Dub</span>
          </button>
          <button
            onClick={() => handleLanguageSwitch('en')}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              audioLanguage === 'en'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/30 scale-105 ring-1 ring-blue-400/50'
                : 'bg-ankirab-surface text-gray-400 hover:text-white hover:bg-ankirab-cardHover border border-ankirab-border/60'
            }`}
          >
            <span>🇬🇧 English Dub</span>
          </button>
          <button
            onClick={() => handleLanguageSwitch('ja')}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              audioLanguage === 'ja'
                ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-md shadow-rose-500/30 scale-105 ring-1 ring-rose-400/50'
                : 'bg-ankirab-surface text-gray-400 hover:text-white hover:bg-ankirab-cardHover border border-ankirab-border/60'
            }`}
          >
            <span>🇯🇵 Japanese Sub</span>
          </button>
        </div>
      </div>

      {/* Real Video Player Container */}
      {activeServer.type === 'embed' ? (
        <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-ankirab-border/60 group">
          <iframe
            key={`${session.episode.id}-${activeServer.id}-${audioLanguage}`}
            src={activeEmbedUrl}
            title={`${session.anime.title} - Episode ${session.episode.episodeNumber}`}
            className="w-full h-full border-0"
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          />
          {/* Episode Switch Toast Banner */}
          {episodeToast && (
            <div className="absolute top-4 inset-x-0 mx-auto w-fit z-30 px-4 py-2 bg-black/85 backdrop-blur-md border border-ankirab-cyan/50 text-white rounded-xl shadow-2xl flex items-center gap-2 animate-fade-in text-xs sm:text-sm font-semibold pointer-events-none">
              <Film className="w-4 h-4 text-ankirab-cyan" />
              <span>{episodeToast}</span>
            </div>
          )}
        </div>
      ) : (
        <div
          ref={containerRef}
          onMouseMove={handleMouseMove}
          className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl group select-none"
        >
      {/* Video Element */}
      <video
        ref={videoRef}
        crossOrigin="anonymous"
        onTimeUpdate={handleTimeUpdate}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onWaiting={() => setIsBuffering(true)}
        onPlaying={() => setIsBuffering(false)}
        onEnded={handleVideoEnded}
        onClick={togglePlay}
        className="w-full h-full object-contain cursor-pointer"
        playsInline
      >
        {/* Synchronized Subtitles tracks */}
        {subtitlesEnabled &&
          session.subtitleTracks.map((sub) => (
            <track
              key={sub.language}
              kind="subtitles"
              label={sub.label}
              src={sub.vttUrl}
              srcLang={sub.language}
              default={sub.language === subtitleLanguage}
            />
          ))}
      </video>

      {/* Episode Switch Toast Banner */}
      {episodeToast && (
        <div className="absolute top-4 inset-x-0 mx-auto w-fit z-30 px-4 py-2 bg-black/85 backdrop-blur-md border border-ankirab-cyan/50 text-white rounded-xl shadow-2xl flex items-center gap-2 animate-fade-in text-xs sm:text-sm font-semibold">
          <Film className="w-4 h-4 text-ankirab-cyan" />
          <span>{episodeToast}</span>
        </div>
      )}

      {/* Buffering Spinner */}
      {isBuffering && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-20 pointer-events-none">
          <div className="w-12 h-12 border-4 border-ankirab-purple border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Auto-Next Episode Countdown Overlay */}
      {autoNextCountdown !== null && onNextEpisode && (
        <div className="absolute inset-0 bg-black/85 backdrop-blur-sm z-30 flex flex-col items-center justify-center p-6 text-center animate-fade-in">
          <p className="text-xs uppercase tracking-widest text-ankirab-cyan font-bold mb-1">
            Episode Completed
          </p>
          <h3 className="text-xl sm:text-2xl font-black text-white mb-4">
            Next Episode starting in <span className="text-ankirab-cyan">{autoNextCountdown}</span>s...
          </h3>
          <div className="flex gap-3">
            <button
              onClick={() => {
                setAutoNextCountdown(null);
                onNextEpisode();
              }}
              className="px-5 py-2.5 bg-ankirab-purple hover:bg-purple-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-ankirab-purple/30 transition transform hover:scale-105 flex items-center gap-2"
            >
              <SkipForward className="w-4 h-4 fill-white" />
              <span>Play Now</span>
            </button>
            <button
              onClick={() => setAutoNextCountdown(null)}
              className="px-4 py-2.5 bg-ankirab-surface hover:bg-ankirab-card text-gray-300 rounded-xl font-medium text-sm transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Stream Error Overlay */}
      {hasError && (
        <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center p-6 text-center z-30">
          <AlertCircle className="w-12 h-12 text-rose-500 mb-3" />
          <h3 className="text-xl font-bold text-white mb-2">Stream Unavailable</h3>
          <p className="text-sm text-gray-400 max-w-md mb-4">{errorMessage}</p>
          <div className="flex gap-3">
            <button
              onClick={() => handleSelectQuality('720p')}
              className="px-4 py-2 bg-ankirab-purple hover:bg-purple-600 text-white rounded-lg text-sm font-semibold transition"
            >
              Switch to 720p Stream
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-ankirab-surface hover:bg-ankirab-card text-gray-300 rounded-lg text-sm font-medium transition"
            >
              Reload Page
            </button>
          </div>
        </div>
      )}

      {/* Skip Intro Button */}
      {canSkipIntro && (
        <button
          onClick={handleSkipIntro}
          className="absolute bottom-24 right-6 z-20 px-4 py-2 bg-ankirab-purple/90 hover:bg-ankirab-purple text-white text-xs sm:text-sm font-bold rounded-xl shadow-xl backdrop-blur-md border border-white/20 transition transform hover:scale-105 flex items-center gap-2"
        >
          <SkipForward className="w-4 h-4 fill-white" />
          <span>Skip Intro</span>
        </button>
      )}

      {/* Skip Outro Button */}
      {canSkipOutro && (
        <button
          onClick={handleSkipOutro}
          className="absolute bottom-24 right-6 z-20 px-4 py-2 bg-ankirab-cyan/90 hover:bg-ankirab-cyan text-black text-xs sm:text-sm font-bold rounded-xl shadow-xl backdrop-blur-md border border-white/20 transition transform hover:scale-105 flex items-center gap-2"
        >
          <SkipForward className="w-4 h-4 fill-black" />
          <span>Skip Outro</span>
        </button>
      )}

      {/* Center Big Play Button when paused */}
      {!isPlaying && !hasError && autoNextCountdown === null && (
        <div
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer"
        >
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-ankirab-purple/90 text-white flex items-center justify-center shadow-2xl hover:scale-110 transition-transform">
            <Play className="w-8 h-8 sm:w-10 sm:h-10 fill-white ml-1" />
          </div>
        </div>
      )}

      {/* Player Controls Bar */}
      <div
        className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/70 to-transparent px-4 pb-4 pt-12 transition-opacity duration-300 z-20 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Progress Bar / Scrubber */}
        <div className="relative mb-3 flex items-center group/scrubber cursor-pointer">
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1.5 bg-gray-700/60 rounded-lg appearance-none cursor-pointer accent-ankirab-cyan group-hover/scrubber:h-2 transition-all"
          />
          {/* Buffered track visualization */}
          <div
            className="absolute left-0 h-1.5 bg-gray-500/40 rounded-lg pointer-events-none"
            style={{ width: `${(buffered / (duration || 1)) * 100}%` }}
          />
        </div>

        {/* Buttons Row */}
        <div className="flex items-center justify-between text-white gap-2">
          
          {/* Left Controls: Play, Prev/Next, Volume, Time */}
          <div className="flex items-center gap-3">
            <button
              onClick={togglePlay}
              className="p-1.5 hover:text-ankirab-cyan transition"
              title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-white" />}
            </button>

            {onPrevEpisode && (
              <button
                onClick={onPrevEpisode}
                className="p-1.5 hover:text-ankirab-cyan transition"
                title="Previous Episode"
              >
                <SkipBack className="w-5 h-5" />
              </button>
            )}

            {onNextEpisode && (
              <button
                onClick={onNextEpisode}
                className="p-1.5 hover:text-ankirab-cyan transition"
                title="Next Episode"
              >
                <SkipForward className="w-5 h-5" />
              </button>
            )}

            <button
              onClick={() => skipSeconds(-10)}
              className="p-1.5 hover:text-ankirab-cyan transition hidden sm:inline-block"
              title="Rewind 10s (←)"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Volume slider */}
            <div className="flex items-center gap-2 group/vol">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="p-1.5 hover:text-ankirab-cyan transition"
                title="Mute / Unmute (M)"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-5 h-5 text-gray-400" />
                ) : (
                  <Volume2 className="w-5 h-5" />
                )}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={isMuted ? 0 : volume}
                onChange={(e) => {
                  setVolume(parseFloat(e.target.value));
                  setIsMuted(false);
                }}
                className="w-16 h-1 bg-gray-600 rounded appearance-none cursor-pointer accent-ankirab-cyan hidden group-hover/vol:inline-block"
              />
            </div>

            {/* Time Indicator */}
            <div className="text-xs text-gray-300 font-mono ml-2">
              <span>{formatTime(currentTime)}</span> / <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Right Controls: Quality, Audio selector, Subtitle selector, Speed, PiP, Fullscreen */}
          <div className="flex items-center gap-2">

            {/* Quality Selector Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowQualityMenu(!showQualityMenu);
                  setShowAudioMenu(false);
                  setShowSubtitleMenu(false);
                  setShowSettingsMenu(false);
                }}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-ankirab-surface/80 hover:bg-ankirab-surface text-xs font-semibold text-emerald-300 border border-emerald-500/30 transition"
                title="Select Quality"
              >
                <Gauge className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline uppercase">{selectedQuality}</span>
              </button>

              {showQualityMenu && (
                <div className="absolute right-0 bottom-full mb-2 w-44 bg-ankirab-card border border-ankirab-border rounded-xl shadow-2xl p-2 z-50 text-xs">
                  <div className="px-2 py-1 text-gray-400 font-bold uppercase tracking-wider">
                    Video Quality
                  </div>
                  {['auto', '1080p', '720p', '480p'].map((q) => (
                    <button
                      key={q}
                      onClick={() => handleSelectQuality(q)}
                      className={`w-full text-left px-3 py-1.5 rounded-lg transition capitalize ${
                        selectedQuality === q
                          ? 'bg-ankirab-purple text-white font-bold'
                          : 'text-gray-300 hover:bg-ankirab-surface hover:text-white'
                      }`}
                    >
                      {q === 'auto' ? 'Auto (Adaptive HLS)' : q}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {/* Audio Track Selector Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowAudioMenu(!showAudioMenu);
                  setShowQualityMenu(false);
                  setShowSubtitleMenu(false);
                  setShowSettingsMenu(false);
                }}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-ankirab-surface/80 hover:bg-ankirab-surface text-xs font-semibold text-amber-300 border border-amber-500/30 transition"
                title="Select Audio Language"
              >
                <Languages className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{activeAudioLabel}</span>
              </button>

              {showAudioMenu && (
                <div className="absolute right-0 bottom-full mb-2 w-48 bg-ankirab-card border border-ankirab-border rounded-xl shadow-2xl p-2 z-50 text-xs">
                  <div className="px-2 py-1 text-gray-400 font-bold uppercase tracking-wider">
                    Audio Language
                  </div>
                  {session.audioTracks.map((audio) => (
                    <button
                      key={audio.language}
                      onClick={() => {
                        handleLanguageSwitch(audio.language);
                        setShowAudioMenu(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg transition ${
                        audioLanguage === audio.language
                          ? 'bg-ankirab-purple text-white font-bold'
                          : 'text-gray-300 hover:bg-ankirab-surface hover:text-white'
                      }`}
                    >
                      {audio.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Subtitles Selector Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowSubtitleMenu(!showSubtitleMenu);
                  setShowQualityMenu(false);
                  setShowAudioMenu(false);
                  setShowSettingsMenu(false);
                }}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-ankirab-surface/80 hover:bg-ankirab-surface text-xs font-semibold text-blue-300 border border-blue-500/30 transition"
                title="Select Subtitles"
              >
                <Subtitles className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{activeSubLabel}</span>
              </button>

              {showSubtitleMenu && (
                <div className="absolute right-0 bottom-full mb-2 w-48 bg-ankirab-card border border-ankirab-border rounded-xl shadow-2xl p-2 z-50 text-xs">
                  <div className="px-2 py-1 text-gray-400 font-bold uppercase tracking-wider">
                    Subtitles
                  </div>
                  <button
                    onClick={() => {
                      setSubtitlesEnabled(false);
                      setShowSubtitleMenu(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg transition ${
                      !subtitlesEnabled
                        ? 'bg-ankirab-purple text-white font-bold'
                        : 'text-gray-300 hover:bg-ankirab-surface'
                    }`}
                  >
                    Off
                  </button>
                  {session.subtitleTracks.map((sub) => (
                    <button
                      key={sub.language}
                      onClick={() => {
                        setSubtitleLanguage(sub.language);
                        setSubtitlesEnabled(true);
                        setShowSubtitleMenu(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg transition ${
                        subtitlesEnabled && subtitleLanguage === sub.language
                          ? 'bg-ankirab-purple text-white font-bold'
                          : 'text-gray-300 hover:bg-ankirab-surface hover:text-white'
                      }`}
                    >
                      {sub.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Speed / Settings Selector */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowSettingsMenu(!showSettingsMenu);
                  setShowQualityMenu(false);
                  setShowAudioMenu(false);
                  setShowSubtitleMenu(false);
                }}
                className="p-1.5 hover:text-ankirab-cyan transition"
                title="Playback Settings"
              >
                <Settings className="w-5 h-5" />
              </button>

              {showSettingsMenu && (
                <div className="absolute right-0 bottom-full mb-2 w-40 bg-ankirab-card border border-ankirab-border rounded-xl shadow-2xl p-2 z-50 text-xs">
                  <div className="px-2 py-1 text-gray-400 font-bold uppercase tracking-wider">
                    Speed
                  </div>
                  {[0.75, 1, 1.25, 1.5, 2].map((rate) => (
                    <button
                      key={rate}
                      onClick={() => {
                        setPlaybackRate(rate);
                        setShowSettingsMenu(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 rounded-lg transition ${
                        playbackRate === rate
                          ? 'bg-ankirab-purple text-white font-bold'
                          : 'text-gray-300 hover:bg-ankirab-surface'
                      }`}
                    >
                      {rate === 1 ? 'Normal (1x)' : `${rate}x`}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* PiP Button */}
            <button
              onClick={togglePiP}
              className="p-1.5 hover:text-ankirab-cyan transition hidden sm:inline-block"
              title="Picture in Picture"
            >
              <Tv className="w-5 h-5" />
            </button>

            {/* Fullscreen Button */}
            <button
              onClick={toggleFullscreen}
              className="p-1.5 hover:text-ankirab-cyan transition"
              title={isFullscreen ? 'Exit Fullscreen (F)' : 'Fullscreen (F)'}
            >
              {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
      )}
    </div>
  );
};
