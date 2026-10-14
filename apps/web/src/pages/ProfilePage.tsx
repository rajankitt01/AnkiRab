import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { userService } from '../services/auth.service';
import { useToastStore } from '../store/toastStore';
import { usePlayerStore } from '../store/playerStore';
import {
  User,
  Settings,
  Languages,
  Subtitles,
  ShieldCheck,
  Trash2,
  Save,
  CheckCircle2
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, setUser, logout } = useAuthStore();
  const { addToast } = useToastStore();
  const { setAudioLanguage, setSubtitleLanguage, setAutoPlayNext, setAutoSkipIntro } = usePlayerStore();

  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [preferredAudio, setPreferredAudio] = useState(user?.preferredAudio || 'hi');
  const [preferredSubtitle, setPreferredSubtitle] = useState(user?.preferredSubtitle || 'en');
  const [autoPlayNext, setAutoPlayNextState] = useState(user?.autoPlayNext ?? true);
  const [autoSkipIntro, setAutoSkipIntroState] = useState(user?.autoSkipIntro ?? false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const updated = await userService.updateProfile({
        displayName,
        preferredAudio,
        preferredSubtitle,
        autoPlayNext,
        autoSkipIntro
      });
      setUser(updated);
      setAudioLanguage(preferredAudio);
      setSubtitleLanguage(preferredSubtitle);
      setAutoPlayNext(autoPlayNext);
      setAutoSkipIntro(autoSkipIntro);
      addToast('Profile and preferences updated successfully!', 'success');
    } catch (err: any) {
      addToast(err.message || 'Failed to update profile', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you absolutely sure you want to delete your account? This action cannot be undone.')) {
      try {
        await userService.deleteAccount();
        addToast('Your account has been deleted.', 'info');
        logout();
      } catch {
        addToast('Failed to delete account', 'error');
      }
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen">
      <div className="flex items-center gap-4 mb-8 pb-6 border-b border-ankirab-border/60">
        <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-ankirab-purple to-ankirab-cyan flex items-center justify-center text-white text-2xl font-black shadow-xl">
          {user.displayName.charAt(0).toUpperCase()}
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">{user.displayName}</h1>
          <p className="text-xs sm:text-sm text-gray-400">
            {user.email} • Role: <span className="font-bold text-amber-400">{user.role}</span>
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        
        {/* Personal Details */}
        <div className="bg-ankirab-card border border-ankirab-border rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <User className="w-5 h-5 text-ankirab-cyan" />
            <span>Profile Details</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                Display Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full bg-ankirab-surface border border-ankirab-border text-white text-sm px-4 py-2.5 rounded-xl focus:border-ankirab-purple focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                Username
              </label>
              <input
                type="text"
                disabled
                value={user.username}
                className="w-full bg-ankirab-dark border border-ankirab-border/50 text-gray-400 text-sm px-4 py-2.5 rounded-xl cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Playback & Language Preferences */}
        <div className="bg-ankirab-card border border-ankirab-border rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Languages className="w-5 h-5 text-amber-400" />
            <span>Streaming & Language Preferences</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                Default Audio Language
              </label>
              <select
                value={preferredAudio}
                onChange={(e) => setPreferredAudio(e.target.value)}
                className="w-full bg-ankirab-surface border border-ankirab-border text-white text-sm px-4 py-2.5 rounded-xl focus:border-ankirab-purple focus:outline-none"
              >
                <option value="hi">Hindi Dubbed (हिंदी) - Recommended</option>
                <option value="en">English Dubbed</option>
                <option value="ja">Japanese (Original Audio)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                Default Subtitles
              </label>
              <select
                value={preferredSubtitle}
                onChange={(e) => setPreferredSubtitle(e.target.value)}
                className="w-full bg-ankirab-surface border border-ankirab-border text-white text-sm px-4 py-2.5 rounded-xl focus:border-ankirab-purple focus:outline-none"
              >
                <option value="en">English Subtitles</option>
                <option value="hi">Hindi Subtitles (हिंदी)</option>
                <option value="none">Off (No Subtitles)</option>
              </select>
            </div>
          </div>

          <div className="pt-2 space-y-3 border-t border-ankirab-border/60">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={autoPlayNext}
                onChange={(e) => setAutoPlayNextState(e.target.checked)}
                className="w-4 h-4 rounded text-ankirab-purple focus:ring-ankirab-purple border-ankirab-border"
              />
              <span className="text-sm text-gray-200">Automatically play next episode</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={autoSkipIntro}
                onChange={(e) => setAutoSkipIntroState(e.target.checked)}
                className="w-4 h-4 rounded text-ankirab-purple focus:ring-ankirab-purple border-ankirab-border"
              />
              <span className="text-sm text-gray-200">Automatically skip opening intro theme</span>
            </label>
          </div>
        </div>

        {/* Save Changes Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-ankirab-purple to-indigo-600 hover:from-purple-600 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-ankirab-purple/30 transition disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>
      </form>

      {/* Danger Zone: Account Deletion */}
      <div className="mt-12 p-6 bg-rose-500/5 border border-rose-500/20 rounded-2xl">
        <h3 className="text-base font-bold text-rose-400 mb-1">Danger Zone</h3>
        <p className="text-xs text-gray-400 mb-4">
          Permanently remove your account, personal watchlist, and watch progress from ANKIRAB.
        </p>
        <button
          onClick={handleDeleteAccount}
          className="flex items-center gap-2 px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-xl text-xs font-semibold transition"
        >
          <Trash2 className="w-4 h-4" />
          <span>Delete My Account</span>
        </button>
      </div>
    </div>
  );
};
