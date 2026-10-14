import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { scheduleService } from '../services/playback.service';
import { Calendar, Clock, Globe, Play } from 'lucide-react';

export const SchedulePage: React.FC = () => {
  const [scheduleData, setScheduleData] = useState<any[]>([]);
  const [timezone, setTimezone] = useState('Asia/Kolkata (IST)');
  const [selectedDayIdx, setSelectedDayIdx] = useState(new Date().getDay());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    scheduleService.getWeeklySchedule().then((res: { timezone?: string; schedule?: any[] }) => {
      setScheduleData(res.schedule || []);
      if (res.timezone) setTimezone(res.timezone);
      setIsLoading(false);
    }).catch(() => setIsLoading(false));
  }, []);

  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const activeDay = scheduleData.find((d) => d.dayIndex === selectedDayIdx) || { episodes: [] };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-white tracking-wide">
            Simulcast & Release Schedule
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Weekly release timetable for ongoing anime episodes and multilingual dub releases.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 bg-ankirab-card border border-ankirab-border rounded-xl text-xs text-ankirab-cyan font-mono">
          <Globe className="w-4 h-4" />
          <span>{timezone}</span>
        </div>
      </div>

      {/* Day of Week Tabs */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-3 mb-8">
        {daysOfWeek.map((day, idx) => {
          const isToday = new Date().getDay() === idx;
          const isSelected = selectedDayIdx === idx;

          return (
            <button
              key={day}
              onClick={() => setSelectedDayIdx(idx)}
              className={`flex-1 min-w-[110px] py-3 px-4 rounded-xl text-center border transition relative ${
                isSelected
                  ? 'bg-ankirab-purple text-white border-ankirab-purple font-bold shadow-lg shadow-ankirab-purple/20'
                  : 'bg-ankirab-card border-ankirab-border text-gray-300 hover:text-white hover:bg-ankirab-cardHover'
              }`}
            >
              <p className="text-xs uppercase tracking-wider">{day.slice(0, 3)}</p>
              <p className="text-sm font-semibold mt-0.5">{day}</p>
              {isToday && (
                <span className="absolute -top-1.5 right-2 px-1.5 py-0.2 bg-ankirab-cyan text-black font-extrabold text-[9px] rounded-full uppercase">
                  TODAY
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Schedule Episodes Grid */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 bg-ankirab-card rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : activeDay.episodes && activeDay.episodes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activeDay.episodes.map((item: any) => (
            <div
              key={item.id}
              className="flex items-center gap-4 p-4 bg-ankirab-card border border-ankirab-border rounded-2xl hover:border-ankirab-purple/60 transition group"
            >
              {/* Anime Thumbnail */}
              <Link
                to={`/anime/${item.anime.slug}`}
                className="w-16 sm:w-20 aspect-[3/4] rounded-xl overflow-hidden bg-ankirab-surface flex-shrink-0"
              >
                <img
                  src={item.anime.posterImage}
                  alt={item.anime.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition"
                />
              </Link>

              {/* Episode Info */}
              <div className="flex-1 overflow-hidden">
                <div className="flex items-center gap-2 mb-1">
                  <span className="flex items-center gap-1 text-xs font-bold text-amber-400 bg-black/40 px-2 py-0.5 rounded border border-amber-400/20">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{item.timeString}</span>
                  </span>

                  {item.anime.hasHindiDub && (
                    <span className="text-[10px] font-bold text-amber-300 bg-amber-500/10 px-1.5 py-0.5 rounded">
                      Hindi
                    </span>
                  )}
                  {item.anime.hasEnglishDub && (
                    <span className="text-[10px] font-bold text-blue-300 bg-blue-500/10 px-1.5 py-0.5 rounded">
                      English
                    </span>
                  )}
                </div>

                <Link
                  to={`/anime/${item.anime.slug}`}
                  className="font-bold text-base text-white group-hover:text-ankirab-cyan line-clamp-1 transition"
                >
                  {item.anime.title}
                </Link>

                <p className="text-xs text-gray-400 mt-1">
                  Upcoming Episode {item.episodeNumber}
                </p>
              </div>

              {/* Action Button */}
              <Link
                to={`/anime/${item.anime.slug}`}
                className="p-3 rounded-xl bg-ankirab-surface hover:bg-ankirab-purple text-gray-300 hover:text-white transition"
              >
                <Play className="w-4 h-4 fill-current" />
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-ankirab-card border border-ankirab-border rounded-2xl p-12 text-center text-gray-400">
          <Calendar className="w-10 h-10 text-gray-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white mb-1">No scheduled releases for {daysOfWeek[selectedDayIdx]}</h3>
          <p className="text-xs sm:text-sm">Check other days of the week or browse our completed catalog.</p>
        </div>
      )}
    </div>
  );
};
