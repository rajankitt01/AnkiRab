import React, { useEffect, useState } from 'react';
import { adminService } from '../services/admin.service';
import { animeService } from '../services/anime.service';
import { useToastStore } from '../store/toastStore';
import {
  ShieldCheck,
  Film,
  Users,
  Activity,
  Plus,
  Trash2,
  Edit,
  Database,
  Radio,
  Clock,
  Layers,
  Search,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const { addToast } = useToastStore();

  const [activeTab, setActiveTab] = useState<'ANALYTICS' | 'ANIME' | 'USERS' | 'METADATA'>('ANALYTICS');
  const [analytics, setAnalytics] = useState<any>(null);
  const [animeList, setAnimeList] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [allGenres, setAllGenres] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // New Anime Form State
  const [isNewAnimeOpen, setIsNewAnimeOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSlug, setNewSlug] = useState('');
  const [newSynopsis, setNewSynopsis] = useState('');
  const [newPoster, setNewPoster] = useState('');
  const [newFormat, setNewFormat] = useState('TV');
  const [newStatus, setNewStatus] = useState('ONGOING');
  const [newYear, setNewYear] = useState(2024);
  const [newHindiDub, setNewHindiDub] = useState(true);
  const [newEnglishDub, setNewEnglishDub] = useState(true);
  const [selectedGenreIds, setSelectedGenreIds] = useState<string[]>([]);

  // Metadata import state
  const [metaSearchQuery, setMetaSearchQuery] = useState('');
  const [importedResults, setImportedResults] = useState<any[]>([]);
  const [isSearchingMeta, setIsSearchingMeta] = useState(false);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [analyticsData, animesData, usersData, genresData] = await Promise.all([
        adminService.getAnalytics(),
        adminService.listAnime(1, 50),
        adminService.listUsers(1, 50),
        animeService.getGenres()
      ]);

      setAnalytics(analyticsData);
      setAnimeList(animesData.data || []);
      setUsersList((usersData as any).users || (usersData as any).data || []);
      setAllGenres(genresData);
    } catch (err: any) {
      addToast(err.message || 'Failed to load administration data', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateAnime = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newSlug || !newPoster || !newSynopsis) {
      addToast('Please fill all required anime fields', 'warning');
      return;
    }

    try {
      await adminService.createAnime({
        title: newTitle,
        slug: newSlug,
        synopsis: newSynopsis,
        posterImage: newPoster,
        format: newFormat as any,
        status: newStatus as any,
        releaseYear: Number(newYear),
        isFeatured: false,
        isTrending: false,
        hasHindiDub: newHindiDub,
        hasEnglishDub: newEnglishDub,
        hasSubtitles: true,
        genreIds: selectedGenreIds.length > 0 ? selectedGenreIds : [allGenres[0]?.id]
      });

      addToast(`Anime "${newTitle}" created successfully!`, 'success');
      setIsNewAnimeOpen(false);
      loadData();
    } catch (err: any) {
      addToast(err.message || 'Failed to create anime', 'error');
    }
  };

  const handleDeleteAnime = async (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      try {
        await adminService.deleteAnime(id);
        addToast(`Anime "${title}" deleted`, 'info');
        loadData();
      } catch (err: any) {
        addToast(err.message || 'Failed to delete anime', 'error');
      }
    }
  };

  const handleUpdateRole = async (userId: string, newRole: string) => {
    try {
      await adminService.updateUserRole(userId, newRole);
      addToast(`User role updated to ${newRole}`, 'success');
      loadData();
    } catch (err: any) {
      addToast(err.message || 'Failed to update user role', 'error');
    }
  };

  const handleMetaImportSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!metaSearchQuery.trim()) return;

    try {
      setIsSearchingMeta(true);
      const results = await adminService.importMetadata(metaSearchQuery.trim());
      setImportedResults(results);
    } catch (err: any) {
      addToast('Metadata search failed', 'error');
    } finally {
      setIsSearchingMeta(false);
    }
  };

  const handlePopulateFromMeta = (meta: any) => {
    setNewTitle(meta.title.english || meta.title.romaji || '');
    setNewSlug((meta.title.english || meta.title.romaji || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
    setNewSynopsis(meta.synopsis || '');
    setNewPoster(meta.posterImage || '');
    setNewYear(meta.year || 2024);
    setIsNewAnimeOpen(true);
    addToast('Populated anime form from external metadata provider!', 'info');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-ankirab-border/60">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-amber-400" />
            <span>ANKIRAB Control Center</span>
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Role-based administration for anime catalog, stream sources, users, and stream health.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex bg-ankirab-card border border-ankirab-border rounded-xl p-1 gap-1">
          <button
            onClick={() => setActiveTab('ANALYTICS')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              activeTab === 'ANALYTICS' ? 'bg-ankirab-purple text-white shadow' : 'text-gray-400 hover:text-white'
            }`}
          >
            Analytics
          </button>
          <button
            onClick={() => setActiveTab('ANIME')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              activeTab === 'ANIME' ? 'bg-ankirab-purple text-white shadow' : 'text-gray-400 hover:text-white'
            }`}
          >
            Anime Catalog
          </button>
          <button
            onClick={() => setActiveTab('USERS')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              activeTab === 'USERS' ? 'bg-ankirab-purple text-white shadow' : 'text-gray-400 hover:text-white'
            }`}
          >
            Users
          </button>
          <button
            onClick={() => setActiveTab('METADATA')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              activeTab === 'METADATA' ? 'bg-ankirab-purple text-white shadow' : 'text-gray-400 hover:text-white'
            }`}
          >
            Metadata Import
          </button>
        </div>
      </div>

      {/* Tab: Analytics */}
      {activeTab === 'ANALYTICS' && analytics && (
        <div className="space-y-8">
          {/* Top Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 bg-ankirab-card border border-ankirab-border rounded-2xl">
              <div className="flex items-center justify-between text-gray-400 text-xs font-bold uppercase mb-2">
                <span>Total Anime</span>
                <Film className="w-4 h-4 text-ankirab-cyan" />
              </div>
              <p className="text-3xl font-black text-white">{analytics.totals.anime}</p>
              <p className="text-[11px] text-gray-500 mt-1">Catalog titles published</p>
            </div>

            <div className="p-5 bg-ankirab-card border border-ankirab-border rounded-2xl">
              <div className="flex items-center justify-between text-gray-400 text-xs font-bold uppercase mb-2">
                <span>Total Episodes</span>
                <Layers className="w-4 h-4 text-purple-400" />
              </div>
              <p className="text-3xl font-black text-white">{analytics.totals.episodes}</p>
              <p className="text-[11px] text-gray-500 mt-1">Episodes across all seasons</p>
            </div>

            <div className="p-5 bg-ankirab-card border border-ankirab-border rounded-2xl">
              <div className="flex items-center justify-between text-gray-400 text-xs font-bold uppercase mb-2">
                <span>Registered Users</span>
                <Users className="w-4 h-4 text-amber-400" />
              </div>
              <p className="text-3xl font-black text-white">{analytics.totals.users}</p>
              <p className="text-[11px] text-gray-500 mt-1">Active user accounts</p>
            </div>

            <div className="p-5 bg-ankirab-card border border-ankirab-border rounded-2xl">
              <div className="flex items-center justify-between text-gray-400 text-xs font-bold uppercase mb-2">
                <span>Playback Events</span>
                <Activity className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-3xl font-black text-white">{analytics.totals.playbackEvents}</p>
              <p className="text-[11px] text-gray-500 mt-1">Stream sessions recorded</p>
            </div>
          </div>

          {/* Stream Health Panel */}
          <div className="p-6 bg-ankirab-card border border-ankirab-border rounded-2xl">
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <Radio className="w-5 h-5 text-emerald-400" />
              <span>CDN & Authorized Streaming Provider Health</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-3 bg-ankirab-surface rounded-xl">
                <p className="text-gray-400 mb-1">Status</p>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-sm font-bold text-white uppercase">Operational</span>
                </div>
              </div>

              <div className="p-3 bg-ankirab-surface rounded-xl">
                <p className="text-gray-400 mb-1">CDN Edge Latency</p>
                <p className="text-sm font-bold text-emerald-400">{analytics.streamHealth.cdnLatencyMs} ms</p>
              </div>

              <div className="p-3 bg-ankirab-surface rounded-xl">
                <p className="text-gray-400 mb-1">Provider Uptime</p>
                <p className="text-sm font-bold text-ankirab-cyan">{analytics.streamHealth.availabilityPercent}%</p>
              </div>
            </div>
          </div>

          {/* Recent Audit Logs */}
          <div className="p-6 bg-ankirab-card border border-ankirab-border rounded-2xl">
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-gray-400" />
              <span>Administrative Audit Trail</span>
            </h3>

            <div className="divide-y divide-ankirab-border/50 text-xs">
              {analytics.recentAuditLogs.map((log: any) => (
                <div key={log.id} className="py-2.5 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-ankirab-cyan">{log.action}</span>
                    <span className="text-gray-400 ml-2">on {log.entity}</span>
                    {log.details && (
                      <span className="text-gray-500 ml-2 font-mono text-[11px] truncate max-w-xs inline-block">
                        {log.details}
                      </span>
                    )}
                  </div>
                  <span className="text-gray-500">
                    {new Date(log.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Anime Catalog Management */}
      {activeTab === 'ANIME' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">Manage Catalog Records ({animeList.length})</h2>
            <button
              onClick={() => setIsNewAnimeOpen(!isNewAnimeOpen)}
              className="flex items-center gap-2 px-4 py-2 bg-ankirab-purple hover:bg-purple-600 text-white rounded-xl text-xs font-bold transition shadow"
            >
              <Plus className="w-4 h-4" />
              <span>Add Anime</span>
            </button>
          </div>

          {/* New Anime Modal Form */}
          {isNewAnimeOpen && (
            <form onSubmit={handleCreateAnime} className="p-6 bg-ankirab-card border border-ankirab-purple/50 rounded-2xl space-y-4 shadow-2xl">
              <h3 className="text-base font-bold text-white">Add New Anime Title</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Title</label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => {
                      setNewTitle(e.target.value);
                      if (!newSlug) {
                        setNewSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
                      }
                    }}
                    placeholder="e.g. Bleach: Thousand-Year Blood War"
                    className="w-full bg-ankirab-surface border border-ankirab-border text-white p-2.5 rounded-lg focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Slug (URL)</label>
                  <input
                    type="text"
                    required
                    value={newSlug}
                    onChange={(e) => setNewSlug(e.target.value)}
                    placeholder="e.g. bleach-thousand-year-blood-war"
                    className="w-full bg-ankirab-surface border border-ankirab-border text-white p-2.5 rounded-lg focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Poster Image URL</label>
                  <input
                    type="url"
                    required
                    value={newPoster}
                    onChange={(e) => setNewPoster(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full bg-ankirab-surface border border-ankirab-border text-white p-2.5 rounded-lg focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Release Year</label>
                  <input
                    type="number"
                    value={newYear}
                    onChange={(e) => setNewYear(parseInt(e.target.value, 10))}
                    className="w-full bg-ankirab-surface border border-ankirab-border text-white p-2.5 rounded-lg focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-300 text-xs font-semibold mb-1">Synopsis</label>
                <textarea
                  required
                  rows={3}
                  value={newSynopsis}
                  onChange={(e) => setNewSynopsis(e.target.value)}
                  placeholder="Plot summary of the anime series..."
                  className="w-full bg-ankirab-surface border border-ankirab-border text-white text-xs p-2.5 rounded-lg focus:outline-none"
                />
              </div>

              <div className="flex gap-4 text-xs">
                <label className="flex items-center gap-2 text-amber-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newHindiDub}
                    onChange={(e) => setNewHindiDub(e.target.checked)}
                  />
                  <span>Hindi Dubbed Available</span>
                </label>

                <label className="flex items-center gap-2 text-blue-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newEnglishDub}
                    onChange={(e) => setNewEnglishDub(e.target.checked)}
                  />
                  <span>English Dubbed Available</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewAnimeOpen(false)}
                  className="px-4 py-2 bg-ankirab-surface text-gray-300 rounded-lg text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-ankirab-purple text-white rounded-lg text-xs font-bold"
                >
                  Publish Record
                </button>
              </div>
            </form>
          )}

          {/* Anime Table */}
          <div className="bg-ankirab-card border border-ankirab-border rounded-2xl overflow-hidden shadow-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-ankirab-surface text-gray-400 uppercase tracking-wider border-b border-ankirab-border">
                <tr>
                  <th className="p-3.5">Anime</th>
                  <th className="p-3.5">Format</th>
                  <th className="p-3.5">Year</th>
                  <th className="p-3.5">Audio Dubs</th>
                  <th className="p-3.5">Rating</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ankirab-border/50 text-gray-300">
                {animeList.map((a) => (
                  <tr key={a.id} className="hover:bg-ankirab-surface/50 transition">
                    <td className="p-3.5 flex items-center gap-3">
                      <img src={a.posterImage} alt={a.title} referrerPolicy="no-referrer" className="w-9 h-12 object-cover rounded bg-ankirab-surface" />
                      <div>
                        <p className="font-bold text-white text-sm">{a.title}</p>
                        <p className="text-[11px] text-gray-500">{a.slug}</p>
                      </div>
                    </td>
                    <td className="p-3.5 font-semibold text-white">{a.format}</td>
                    <td className="p-3.5">{a.releaseYear}</td>
                    <td className="p-3.5">
                      <div className="flex gap-1">
                        {a.hasHindiDub && <span className="px-1.5 py-0.5 bg-amber-500/20 text-amber-300 rounded text-[10px]">HI</span>}
                        {a.hasEnglishDub && <span className="px-1.5 py-0.5 bg-blue-500/20 text-blue-300 rounded text-[10px]">EN</span>}
                      </div>
                    </td>
                    <td className="p-3.5 text-amber-400 font-bold">★ {a.rating || 0}</td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => handleDeleteAnime(a.id, a.title)}
                        className="p-1.5 text-gray-400 hover:text-rose-400 rounded hover:bg-ankirab-surface transition"
                        title="Delete Anime"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Users Management */}
      {activeTab === 'USERS' && (
        <div className="space-y-6">
          <h2 className="text-lg font-bold text-white">Registered Accounts ({usersList.length})</h2>
          
          <div className="bg-ankirab-card border border-ankirab-border rounded-2xl overflow-hidden shadow-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-ankirab-surface text-gray-400 uppercase tracking-wider border-b border-ankirab-border">
                <tr>
                  <th className="p-3.5">User</th>
                  <th className="p-3.5">Email</th>
                  <th className="p-3.5">Current Role</th>
                  <th className="p-3.5">Joined</th>
                  <th className="p-3.5 text-right">Role Management</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ankirab-border/50 text-gray-300">
                {usersList.map((u) => (
                  <tr key={u.id} className="hover:bg-ankirab-surface/50 transition">
                    <td className="p-3.5 font-bold text-white">{u.displayName} ({u.username})</td>
                    <td className="p-3.5 text-gray-400">{u.email}</td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        u.role === 'ADMIN' ? 'bg-amber-500/20 text-amber-300' : 'bg-ankirab-surface text-gray-300'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3.5 text-gray-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td className="p-3.5 text-right">
                      <select
                        value={u.role}
                        onChange={(e) => handleUpdateRole(u.id, e.target.value)}
                        className="bg-ankirab-surface border border-ankirab-border text-white text-xs px-2 py-1 rounded focus:outline-none"
                      >
                        <option value="USER">USER</option>
                        <option value="MODERATOR">MODERATOR</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: External Metadata Import */}
      {activeTab === 'METADATA' && (
        <div className="space-y-6">
          <div className="p-6 bg-ankirab-card border border-ankirab-border rounded-2xl">
            <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <Database className="w-5 h-5 text-ankirab-cyan" />
              <span>Import Metadata from AniList API</span>
            </h2>
            <p className="text-xs text-gray-400 mb-4">
              Query verified anime records via permitted GraphQL endpoint to automatically prefill anime records.
            </p>

            <form onSubmit={handleMetaImportSearch} className="flex gap-3">
              <input
                type="text"
                value={metaSearchQuery}
                onChange={(e) => setMetaSearchQuery(e.target.value)}
                placeholder="Search external anime database (e.g. Naruto, Bleach)..."
                className="flex-1 bg-ankirab-surface border border-ankirab-border text-white text-sm px-4 py-2.5 rounded-xl focus:outline-none"
              />
              <button
                type="submit"
                disabled={isSearchingMeta}
                className="px-6 py-2.5 bg-ankirab-purple hover:bg-purple-600 text-white rounded-xl text-xs font-bold transition disabled:opacity-50"
              >
                {isSearchingMeta ? 'Searching...' : 'Search AniList'}
              </button>
            </form>
          </div>

          {/* Search Results for import */}
          {importedResults.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {importedResults.map((item) => (
                <div key={item.id} className="p-4 bg-ankirab-card border border-ankirab-border rounded-xl flex gap-3">
                  <img src={item.posterImage} alt="Cover" referrerPolicy="no-referrer" className="w-16 aspect-[3/4] object-cover rounded bg-ankirab-surface" />
                  <div className="flex-1 overflow-hidden">
                    <p className="font-bold text-white text-sm line-clamp-1">{item.title.english || item.title.romaji}</p>
                    <p className="text-xs text-gray-400">{item.year} • {item.format}</p>
                    <button
                      onClick={() => handlePopulateFromMeta(item)}
                      className="mt-3 px-3 py-1 bg-ankirab-cyan/20 hover:bg-ankirab-cyan text-cyan-300 hover:text-black rounded text-xs font-bold transition"
                    >
                      Import to Catalog
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
