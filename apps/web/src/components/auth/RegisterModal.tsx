import React, { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { authService } from '../../services/auth.service';
import { useToastStore } from '../../store/toastStore';
import { X, Lock, Mail, User, ArrowRight, Loader2 } from 'lucide-react';

export const RegisterModal: React.FC = () => {
  const { isRegisterModalOpen, closeRegisterModal, openLoginModal, setUser } = useAuthStore();
  const { addToast } = useToastStore();

  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isRegisterModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setIsLoading(true);

    try {
      const res = await authService.register({
        email,
        username,
        displayName: displayName || username,
        password
      });
      setUser(res.user);
      addToast(`Account created! Welcome to ANKIRAB, ${res.user.displayName}`, 'success');
      closeRegisterModal();
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-ankirab-card border border-ankirab-border rounded-2xl shadow-2xl p-6 sm:p-8">
        
        {/* Close Button */}
        <button
          onClick={closeRegisterModal}
          className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-lg hover:bg-ankirab-surface transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-black text-white tracking-wide">
            Join <span className="text-transparent bg-clip-text bg-gradient-to-r from-ankirab-purple to-ankirab-cyan">ANKIRAB</span>
          </h2>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Create your free account to access multilingual anime streams.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
                className="w-full bg-ankirab-surface border border-ankirab-border text-white text-sm pl-10 pr-4 py-2.5 rounded-xl focus:border-ankirab-purple focus:outline-none focus:ring-1 focus:ring-ankirab-purple transition"
              />
              <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">
              Username
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="anime_fan_2026"
                className="w-full bg-ankirab-surface border border-ankirab-border text-white text-sm pl-10 pr-4 py-2.5 rounded-xl focus:border-ankirab-purple focus:outline-none focus:ring-1 focus:ring-ankirab-purple transition"
              />
              <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">
              Display Name (Optional)
            </label>
            <div className="relative">
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Shinobi Hero"
                className="w-full bg-ankirab-surface border border-ankirab-border text-white text-sm pl-10 pr-4 py-2.5 rounded-xl focus:border-ankirab-purple focus:outline-none transition"
              />
              <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">
              Password (min. 8 chars, 1 uppercase, 1 digit)
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-ankirab-surface border border-ankirab-border text-white text-sm pl-10 pr-4 py-2.5 rounded-xl focus:border-ankirab-purple focus:outline-none transition"
              />
              <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3 bg-gradient-to-r from-ankirab-purple to-indigo-600 hover:from-purple-600 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-ankirab-purple/20 flex items-center justify-center gap-2 transition disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <span>Create Account</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-gray-400">
          Already have an account?{' '}
          <button
            onClick={openLoginModal}
            className="text-ankirab-cyan font-bold hover:underline"
          >
            Sign in
          </button>
        </div>
      </div>
    </div>
  );
};
