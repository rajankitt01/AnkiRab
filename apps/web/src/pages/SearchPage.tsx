import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { searchService } from '../services/playback.service';
import { animeService } from '../services/anime.service';
import { AnimeCard } from '../components/anime/AnimeCard';
import { Search, Sparkles, Clock, X, Compass } from 'lucide-react';
import { AnimeDto } from '@ankirab/shared';

export const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParam = searchParams.get('q') || '';

  const [query, setQuery] = useState(queryParam);
  const [results, setResults] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [popularAnime, setPopularAnime] = useState<AnimeDto[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('ankirab_search_history') || '[]');
    } catch {
      return [];
    }
  });
  const [isLoading, setIsLoading] = useState(false);

  // Sync state with URL parameter
  useEffect(() => {
    setQuery(queryParam);
    if (queryParam.trim()) {
      executeSearch(queryParam.trim());
    } else {
      setResults([]);
    }
  }, [queryParam]);

  // Load fallback popular recommendations
  useEffect(() => {
    animeService.getPopular().then(setPopularAnime).catch(() => {});
  }, []);

  const executeSearch = async (searchTerm: string) => {
    if (!searchTerm.trim()) return;

    try {
      setIsLoading(true);
      const data = await searchService.search(searchTerm, 20);
      setResults(data.results || []);
      setSuggestions(data.suggestions || []);

      // Update search history
      setSearchHistory((prev) => {
        const next = [searchTerm, ...prev.filter((i) => i.toLowerCase() !== searchTerm.toLowerCase())].slice(0, 8);
        localStorage.setItem('ankirab_search_history', JSON.stringify(next));
        return next;
      });
    } catch (err) {
      console.error('Search failed', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setSearchParams({ q: query.trim() });
    }
  };

  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('ankirab_search_history');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen">
      
      {/* Search Header Form */}
      <div className="max-w-3xl mx-auto text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-black text-white mb-2">
          Find Your Next Anime
        </h1>
        <p className="text-sm text-gray-400 mb-6">
          Search thousands of anime movies, TV series, Hindi dubbed, and English dubbed releases.
        </p>

        <form onSubmit={handleSearchSubmit} className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title, Japanese name, or studio..."
            className="w-full bg-ankirab-card border-2 border-ankirab-border text-white text-base pl-12 pr-28 py-3.5 rounded-2xl focus:border-ankirab-purple focus:outline-none shadow-xl transition"
          />
          <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <button
            type="submit"
            className="absolute right-2 top-2 bottom-2 px-6 bg-ankirab-purple hover:bg-purple-600 text-white text-sm font-bold rounded-xl transition shadow"
          >
            Search
          </button>
        </form>

        {/* Search History Chips */}
        {searchHistory.length > 0 && !queryParam && (
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> Recent:
            </span>
            {searchHistory.map((term, idx) => (
              <button
                key={idx}
                onClick={() => setSearchParams({ q: term })}
                className="px-2.5 py-1 text-xs bg-ankirab-surface border border-ankirab-border rounded-lg text-gray-300 hover:text-white hover:border-ankirab-purple transition"
              >
                {term}
              </button>
            ))}
            <button
              onClick={clearHistory}
              className="text-xs text-gray-500 hover:text-gray-300 underline ml-1"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {/* Results Section */}
      {queryParam ? (
        <div>
          <div className="flex items-center justify-between mb-6 pb-2 border-b border-ankirab-border/60">
            <h2 className="text-xl font-bold text-white">
              Results for <span className="text-ankirab-cyan">"{queryParam}"</span>
            </h2>
            <span className="text-xs text-gray-400">{results.length} found</span>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="aspect-[3/4] bg-ankirab-card rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : results.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
              {results.map((anime) => (
                <AnimeCard key={anime.id} anime={anime as any} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-ankirab-card border border-ankirab-border rounded-2xl p-8">
              <p className="text-lg font-bold text-white mb-2">No results matched "{queryParam}"</p>
              <p className="text-sm text-gray-400 max-w-md mx-auto mb-6">
                Try checking the spelling, using alternative Romanized or English titles, or explore trending anime below.
              </p>
              <Link
                to="/catalog"
                className="px-5 py-2.5 bg-ankirab-purple text-white rounded-xl text-sm font-semibold"
              >
                Browse Full Catalog
              </Link>
            </div>
          )}
        </div>
      ) : (
        /* Blank state recommendations */
        <div>
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="w-5 h-5 text-ankirab-cyan" />
            <h2 className="text-xl font-bold text-white">Trending Recommendations</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {popularAnime.slice(0, 10).map((anime) => (
              <AnimeCard key={anime.id} anime={anime} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
