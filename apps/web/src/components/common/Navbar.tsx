import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { searchService } from '../../services/playback.service';
import {
  Search,
  User,
  LogOut,
  ShieldCheck,
  Bookmark,
  Calendar,
  Compass,
  Film,
  Menu,
  X,
  Languages
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, isAdmin, openLoginModal, openRegisterModal, logout } = useAuthStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Debounced autocomplete suggestions
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.trim().length >= 2) {
        try {
          const res = await searchService.search(searchQuery.trim(), 5);
          setSuggestions(res.suggestions || []);
          setIsSearchOpen(true);
        } catch {
          setSuggestions([]);
        }
      } else {
        setSuggestions([]);
        setIsSearchOpen(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearchOpen(false);
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Anime', path: '/catalog' },
    { label: 'Movies', path: '/catalog?format=MOVIE' },
    { label: 'Schedule', path: '/schedule' },
    { label: 'My List', path: '/my-list', auth: true }
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-ankirab-darkest/95 backdrop-blur-md border-b border-ankirab-border/60 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Left: Brand Logo & Main Nav */}
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2 group">
            <span className="text-2xl font-black tracking-wider text-white">
              ANKI<span className="text-transparent bg-clip-text bg-gradient-to-r from-ankirab-purple via-indigo-400 to-ankirab-cyan">RAB</span>
            </span>
            <span className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-bold tracking-widest text-ankirab-cyan bg-ankirab-cyan/10 border border-ankirab-cyan/30 rounded">
              .COM
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              if (link.auth && !isAuthenticated) return null;
              const isActive = location.pathname === link.path || (link.path !== '/' && location.pathname.startsWith(link.path));
              return (
                <Link
                  key={link.label}
                  to={link.path}
                  className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-white bg-ankirab-card border border-ankirab-purple/30'
                      : 'text-gray-300 hover:text-white hover:bg-ankirab-surface'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Center: Search Bar with Autocomplete Dropdown */}
        <div ref={searchRef} className="relative flex-1 max-w-md hidden sm:block">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchQuery.trim().length >= 2 && setIsSearchOpen(true)}
              placeholder="Search anime, movies, genres..."
              className="w-full bg-ankirab-surface text-gray-200 placeholder-gray-400 text-sm pl-10 pr-4 py-2 rounded-xl border border-ankirab-border focus:border-ankirab-purple focus:outline-none focus:ring-1 focus:ring-ankirab-purple transition"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          </form>

          {/* Autocomplete Dropdown */}
          {isSearchOpen && suggestions.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-2 bg-ankirab-card border border-ankirab-border rounded-xl shadow-2xl overflow-hidden z-50">
              <div className="p-2 text-xs font-semibold uppercase tracking-wider text-gray-400 px-3">
                Suggestions
              </div>
              {suggestions.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setSearchQuery(item);
                    setIsSearchOpen(false);
                    navigate(`/search?q=${encodeURIComponent(item)}`);
                  }}
                  className="w-full text-left px-4 py-2.5 text-sm text-gray-200 hover:bg-ankirab-cardHover hover:text-ankirab-cyan flex items-center justify-between transition"
                >
                  <span>{item}</span>
                  <Search className="w-3.5 h-3.5 text-gray-500" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Language Dub badge, Auth buttons or Profile Menu */}
        <div className="flex items-center gap-3">
          
          {/* Quick Dub Pill */}
          <Link
            to="/catalog?audioLang=hi"
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 text-amber-300 rounded-full hover:bg-amber-500/20 transition"
            title="Browse Hindi Dubbed Anime"
          >
            <Languages className="w-3.5 h-3.5" />
            <span>Hindi Dubbed</span>
          </Link>

          {isAuthenticated && user ? (
            <div ref={userMenuRef} className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 p-1.5 rounded-full hover:bg-ankirab-surface border border-ankirab-border transition"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-ankirab-purple to-ankirab-cyan flex items-center justify-center text-white font-bold text-sm">
                  {user.displayName?.charAt(0).toUpperCase() || 'U'}
                </div>
                <span className="hidden xl:inline-block text-sm font-medium text-gray-200 max-w-[100px] truncate">
                  {user.displayName}
                </span>
              </button>

              {/* Profile Dropdown */}
              {isUserMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-ankirab-card border border-ankirab-border rounded-xl shadow-2xl py-2 z-50">
                  <div className="px-4 py-2 border-b border-ankirab-border/50">
                    <p className="text-sm font-bold text-white truncate">{user.displayName}</p>
                    <p className="text-xs text-gray-400 truncate">{user.email}</p>
                  </div>

                  <Link
                    to="/profile"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-300 hover:bg-ankirab-cardHover hover:text-white transition"
                  >
                    <User className="w-4 h-4 text-ankirab-cyan" />
                    <span>My Profile</span>
                  </Link>

                  <Link
                    to="/my-list"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-300 hover:bg-ankirab-cardHover hover:text-white transition"
                  >
                    <Bookmark className="w-4 h-4 text-ankirab-purple" />
                    <span>My Watchlist</span>
                  </Link>

                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-amber-300 hover:bg-amber-500/10 transition font-semibold"
                    >
                      <ShieldCheck className="w-4 h-4 text-amber-400" />
                      <span>Admin Dashboard</span>
                    </Link>
                  )}

                  <div className="border-t border-ankirab-border/50 mt-1 pt-1">
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-rose-400 hover:bg-rose-500/10 transition text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Log Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={openLoginModal}
                className="px-4 py-1.5 text-sm font-medium text-gray-200 hover:text-white transition"
              >
                Log In
              </button>
              <button
                onClick={openRegisterModal}
                className="px-4 py-1.5 text-sm font-medium text-white bg-gradient-to-r from-ankirab-purple to-indigo-600 hover:opacity-95 rounded-lg shadow-lg shadow-ankirab-purple/20 transition"
              >
                Sign Up
              </button>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-ankirab-surface transition"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-ankirab-dark border-b border-ankirab-border px-4 py-4 space-y-3">
          {/* Mobile Search input */}
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search anime..."
              className="w-full bg-ankirab-surface text-gray-200 text-sm pl-10 pr-4 py-2 rounded-xl border border-ankirab-border focus:outline-none"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </form>

          <div className="flex flex-col gap-1 pt-2">
            {navLinks.map((link) => {
              if (link.auth && !isAuthenticated) return null;
              return (
                <Link
                  key={link.label}
                  to={link.path}
                  className="px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-ankirab-surface"
                >
                  {link.label}
                </Link>
              );
            })}
            <Link
              to="/catalog?audioLang=hi"
              className="px-3 py-2 rounded-lg text-sm font-medium text-amber-300 bg-amber-500/10"
            >
              🇮🇳 Hindi Dubbed Anime
            </Link>
            {isAdmin && (
              <Link
                to="/admin"
                className="px-3 py-2 rounded-lg text-sm font-medium text-purple-300 bg-purple-500/10"
              >
                Admin Dashboard
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
