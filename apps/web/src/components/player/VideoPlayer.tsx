import React, { useRef, useState, useEffect } from 'react';
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
  AlertCircle
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

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [showAudioMenu, setShowAudioMenu] = useState(false);
  const [showSubtitleMenu, setShowSubtitleMenu] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [canSkipIntro, setCanSkipIntro] = useState(false);
  const [canSkipOutro, setCanSkipOutro] = useState(false);

  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Pick master or first HLS source
  const currentSource = session.sources.find((s) => s.format === 'HLS') || session.sources[0];

  // Initialize Video & HLS
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !currentSource) return;

    setHasError(false);
    setErrorMessage('');

    if (Hls.isSupported() && currentSource.format === 'HLS') {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }

      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });

      hls.loadSource(currentSource.url);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        // Resume from saved progress if available
        if (session.progressSeconds && session.progressSeconds > 0) {
          video.currentTime = session.progressSeconds;
        }
        video.play().catch(() => setIsPlaying(false));
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
            default:
              setHasError(true);
              setErrorMessage('Playback error: Unable to connect to authorized media provider stream.');
              hls.destroy();
              break;
          }
        }
      });

      hlsRef.current = hls;
    } else if (video.canPlayType('application/vnd.apple.mpegurl') || currentSource.format === 'MP4') {
      video.src = currentSource.url;
      if (session.progressSeconds && session.progressSeconds > 0) {
        video.currentTime = session.progressSeconds;
      }
      video.play().catch(() => setIsPlaying(false));
    } else {
      setHasError(true);
      setErrorMessage('Your browser does not support HLS adaptive streaming.');
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

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play();
      setIsPlaying(true);
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

  // Active audio track label
  const activeAudioLabel =
    session.audioTracks.find((a) => a.language === audioLanguage)?.label || 'Hindi Dubbed';

  // Active subtitle track label
  const activeSubLabel = subtitlesEnabled
    ? session.subtitleTracks.find((s) => s.language === subtitleLanguage)?.label || 'English Subtitles'
    : 'Off';

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl group select-none"
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        onTimeUpdate={handleTimeUpdate}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
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

      {/* Stream Error Overlay */}
      {hasError && (
        <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center p-6 text-center z-30">
          <AlertCircle className="w-12 h-12 text-rose-500 mb-3" />
          <h3 className="text-xl font-bold text-white mb-2">Stream Unavailable</h3>
          <p className="text-sm text-gray-400 max-w-md mb-4">{errorMessage}</p>
          <div className="flex gap-3">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-ankirab-purple hover:bg-purple-600 text-white rounded-lg text-sm font-semibold transition"
            >
              Retry Stream
            </button>
            <a
              href="mailto:support@ankirab.com"
              className="px-4 py-2 bg-ankirab-surface hover:bg-ankirab-card text-gray-300 rounded-lg text-sm font-medium transition"
            >
              Contact Support
            </a>
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

      {/* Overlay Notice banner (demonstration stream) */}
      {session.providerNotice && (
        <div className="absolute top-4 left-4 z-20 hidden sm:flex items-center gap-2 px-3 py-1 bg-black/60 backdrop-blur-md rounded-lg border border-white/10 text-[11px] text-gray-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>{session.providerNotice}</span>
        </div>
      )}

      {/* Center Big Play Button when paused */}
      {!isPlaying && !hasError && (
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
              title="Rewind 10s"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Volume slider */}
            <div className="flex items-center gap-2 group/vol">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="p-1.5 hover:text-ankirab-cyan transition"
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

          {/* Right Controls: Audio selector, Subtitle selector, Speed, PiP, Fullscreen */}
          <div className="flex items-center gap-2">
            
            {/* Audio Track Selector Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowAudioMenu(!showAudioMenu);
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
                        setAudioLanguage(audio.language);
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
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
