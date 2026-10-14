import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { animeService } from '../services/anime.service';
import { AnimeCard } from '../components/anime/AnimeCard';
import { AnimeDto, GenreDto, PaginatedResult } from '@ankirab/shared';
import {
  Filter,
  RotateCcw,
  Search,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  Languages
} from 'lucide-react';

export const CatalogPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [genres, setGenres] = useState<GenreDto[]>([]);
  const [data, setData] = useState<PaginatedResult<AnimeDto>>({
    data: [],
    pagination: {
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 1,
      hasNextPage: false,
      hasPrevPage: false
    }
  });
  const [isLoading, setIsLoading] = useState(true);

  // Read filters from URL query parameters
  const page = parseInt(searchParams.get('page') || '1', 10);
  const search = searchParams.get('search') || '';
  const genre = searchParams.get('genre') || '';
  const format = searchParams.get('format') || '';
  const status = searchParams.get('status') || '';
  const audioLang = searchParams.get('audioLang') || '';
  const subLang = searchParams.get('subLang') || '';
  const sortBy = (searchParams.get('sortBy') as any) || 'popularity';
  const sortOrder = (searchParams.get('sortOrder') as any) || 'desc';

  // Load available genres
  useEffect(() => {
    animeService.getGenres().then(setGenres).catch(() => {});
  }, []);

  // Fetch catalog data when params change
  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        setIsLoading(true);
        const result = await animeService.getCatalog({
          page,
          limit: 20,
          search: search || undefined,
          genre: genre || undefined,
          format: (format as any) || undefined,
          status: (status as any) || undefined,
          audioLang: audioLang || undefined,
          subLang: subLang || undefined,
          sortBy,
          sortOrder
        });
        setData(result);
      } catch (err) {
        console.error('Catalog fetch error', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCatalog();
  }, [page, search, genre, format, status, audioLang, subLang, sortBy, sortOrder]);

  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    next.set('page', '1'); // reset to page 1 on filter change
    setSearchParams(next);
  };

  const handlePageChange = (newPage: number) => {
    const next = new URLSearchParams(searchParams);
    next.set('page', String(newPage));
    setSearchParams(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReset = () => {
    setSearchParams(new URLSearchParams());
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen">
      
      {/* Page Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-white tracking-wide">
            Anime Catalog
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Browse full anime catalog with multilingual audio and subtitle filters.
          </p>
        </div>

        {/* Search input in catalog */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            value={search}
            onChange={(e) => updateParam('search', e.target.value)}
            placeholder="Search within catalog..."
            className="w-full bg-ankirab-surface border border-ankirab-border text-white text-sm pl-10 pr-4 py-2.5 rounded-xl focus:border-ankirab-purple focus:outline-none transition"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* Filter Control Bar */}
      <div className="bg-ankirab-card border border-ankirab-border rounded-2xl p-5 mb-8 shadow-xl">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-ankirab-border/60">
          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <SlidersHorizontal className="w-4 h-4 text-ankirab-cyan" />
            <span>Refine Results</span>
          </div>

          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition px-2.5 py-1 rounded bg-ankirab-surface border border-ankirab-border"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Filters</span>
          </button>
        </div>

        {/* Filters Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-xs">
          
          {/* Genre */}
          <div>
            <label className="block text-gray-400 font-semibold mb-1">Genre</label>
            <select
              value={genre}
              onChange={(e) => updateParam('genre', e.target.value)}
              className="w-full bg-ankirab-surface border border-ankirab-border text-gray-200 rounded-lg p-2 focus:outline-none focus:border-ankirab-purple"
            >
              <option value="">All Genres</option>
              {genres.map((g) => (
                <option key={g.id} value={g.slug}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>

          {/* Audio Language */}
          <div>
            <label className="block text-gray-400 font-semibold mb-1 flex items-center gap-1">
              <Languages className="w-3 h-3 text-amber-400" />
              <span>Audio Dub</span>
            </label>
            <select
              value={audioLang}
              onChange={(e) => updateParam('audioLang', e.target.value)}
              className="w-full bg-ankirab-surface border border-ankirab-border text-gray-200 rounded-lg p-2 focus:outline-none focus:border-ankirab-purple"
            >
              <option value="">Any Audio</option>
              <option value="hi">Hindi Dubbed (हिंदी)</option>
              <option value="en">English Dubbed</option>
              <option value="ja">Japanese Audio</option>
            </select>
          </div>

          {/* Subtitles */}
          <div>
            <label className="block text-gray-400 font-semibold mb-1">Subtitles</label>
            <select
              value={subLang}
              onChange={(e) => updateParam('subLang', e.target.value)}
              className="w-full bg-ankirab-surface border border-ankirab-border text-gray-200 rounded-lg p-2 focus:outline-none focus:border-ankirab-purple"
            >
              <option value="">Any Subtitles</option>
              <option value="en">English Subs</option>
              <option value="hi">Hindi Subs</option>
            </select>
          </div>

          {/* Format */}
          <div>
            <label className="block text-gray-400 font-semibold mb-1">Format</label>
            <select
              value={format}
              onChange={(e) => updateParam('format', e.target.value)}
              className="w-full bg-ankirab-surface border border-ankirab-border text-gray-200 rounded-lg p-2 focus:outline-none focus:border-ankirab-purple"
            >
              <option value="">All Formats</option>
              <option value="TV">TV Series</option>
              <option value="MOVIE">Movie</option>
              <option value="OVA">OVA</option>
              <option value="SPECIAL">Special</option>
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-gray-400 font-semibold mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => updateParam('status', e.target.value)}
              className="w-full bg-ankirab-surface border border-ankirab-border text-gray-200 rounded-lg p-2 focus:outline-none focus:border-ankirab-purple"
            >
              <option value="">All Statuses</option>
              <option value="ONGOING">Ongoing</option>
              <option value="COMPLETED">Completed</option>
              <option value="UPCOMING">Upcoming</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-gray-400 font-semibold mb-1">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => updateParam('sortBy', e.target.value)}
              className="w-full bg-ankirab-surface border border-ankirab-border text-gray-200 rounded-lg p-2 focus:outline-none focus:border-ankirab-purple"
            >
              <option value="popularity">Popularity</option>
              <option value="latest">Latest Release</option>
              <option value="rating">Rating</option>
              <option value="alphabetical">A to Z</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-sm text-gray-400 mb-6">
        <span>
          Showing <span className="font-bold text-white">{data.pagination.total}</span> anime results
        </span>
        {data.pagination.totalPages > 1 && (
          <span>
            Page {data.pagination.page} of {data.pagination.totalPages}
          </span>
        )}
      </div>

      {/* Anime Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {Array.from({ length: 10 }).map((_, idx) => (
            <div key={idx} className="aspect-[3/4] bg-ankirab-card animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : data.data.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {data.data.map((anime) => (
            <AnimeCard key={anime.id} anime={anime} />
          ))}
        </div>
      ) : (
        <div className="bg-ankirab-card border border-ankirab-border rounded-2xl p-12 text-center my-8">
          <p className="text-gray-300 font-bold text-lg mb-1">No anime matched your active filters</p>
          <p className="text-gray-400 text-sm mb-4">Try clearing one or more filters or searching for alternative titles.</p>
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-ankirab-purple text-white text-sm font-semibold rounded-lg hover:bg-purple-600 transition"
          >
            Clear All Filters
          </button>
        </div>
      )}

      {/* Pagination Controls */}
      {data.pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-12">
          <button
            onClick={() => handlePageChange(data.pagination.page - 1)}
            disabled={!data.pagination.hasPrevPage}
            className="p-2.5 rounded-xl bg-ankirab-card border border-ankirab-border text-gray-300 hover:text-white disabled:opacity-40 disabled:pointer-events-none transition"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {Array.from({ length: data.pagination.totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => handlePageChange(p)}
              className={`w-10 h-10 rounded-xl text-sm font-bold transition ${
                p === data.pagination.page
                  ? 'bg-ankirab-purple text-white shadow-lg shadow-ankirab-purple/30'
                  : 'bg-ankirab-card border border-ankirab-border text-gray-400 hover:text-white hover:bg-ankirab-cardHover'
              }`}
            >
              {p}
            </button>
          ))}

          <button
            onClick={() => handlePageChange(data.pagination.page + 1)}
            disabled={!data.pagination.hasNextPage}
            className="p-2.5 rounded-xl bg-ankirab-card border border-ankirab-border text-gray-300 hover:text-white disabled:opacity-40 disabled:pointer-events-none transition"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
};
