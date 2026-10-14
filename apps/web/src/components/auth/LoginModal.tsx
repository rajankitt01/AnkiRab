import React, { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { authService } from '../../services/auth.service';
import { useToastStore } from '../../store/toastStore';
import { X, Lock, Mail, ArrowRight, Loader2 } from 'lucide-react';

export const LoginModal: React.FC = () => {
  const { isLoginModalOpen, closeLoginModal, openRegisterModal, setUser } = useAuthStore();
  const { addToast } = useToastStore();

  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isLoginModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await authService.login({ emailOrUsername, password });
      setUser(res.user);
      addToast(`Welcome back, ${res.user.displayName}!`, 'success');
      closeLoginModal();
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemoUser = (type: 'user' | 'admin') => {
    if (type === 'admin') {
      setEmailOrUsername('admin@ankirab.com');
      setPassword('AdminSecurePass123!');
    } else {
      setEmailOrUsername('demo@ankirab.com');
      setPassword('DemoUserPass123!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-ankirab-card border border-ankirab-border rounded-2xl shadow-2xl p-6 sm:p-8">
        
        {/* Close Button */}
        <button
          onClick={closeLoginModal}
          className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-lg hover:bg-ankirab-surface transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-black text-white tracking-wide">
            Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-ankirab-purple to-ankirab-cyan">ANKIRAB</span>
          </h2>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Sign in to track anime, customize subtitles, and resume watching.
          </p>
        </div>

        {/* Quick Demo Credentials Pill Bar */}
        <div className="mb-6 p-3 bg-ankirab-surface/80 border border-ankirab-purple/30 rounded-xl text-xs space-y-2">
          <p className="text-gray-300 font-semibold flex items-center justify-between">
            <span>Quick Demo Credentials:</span>
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => fillDemoUser('user')}
              className="flex-1 py-1.5 px-2 bg-ankirab-card hover:bg-ankirab-cardHover border border-ankirab-border rounded text-ankirab-cyan font-medium text-center transition"
            >
              Demo User
            </button>
            <button
              type="button"
              onClick={() => fillDemoUser('admin')}
              className="flex-1 py-1.5 px-2 bg-ankirab-card hover:bg-ankirab-cardHover border border-ankirab-border rounded text-amber-300 font-medium text-center transition"
            >
              Admin
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">
              Email or Username
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={emailOrUsername}
                onChange={(e) => setEmailOrUsername(e.target.value)}
                placeholder="you@domain.com or username"
                className="w-full bg-ankirab-surface border border-ankirab-border text-white text-sm pl-10 pr-4 py-2.5 rounded-xl focus:border-ankirab-purple focus:outline-none focus:ring-1 focus:ring-ankirab-purple transition"
              />
              <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-gray-300">
                Password
              </label>
              <button
                type="button"
                onClick={() => addToast('Use demo credentials or register a new account.', 'info')}
                className="text-xs text-ankirab-cyan hover:underline"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-ankirab-surface border border-ankirab-border text-white text-sm pl-10 pr-4 py-2.5 rounded-xl focus:border-ankirab-purple focus:outline-none focus:ring-1 focus:ring-ankirab-purple transition"
              />
              <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-gradient-to-r from-ankirab-purple to-indigo-600 hover:from-purple-600 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-ankirab-purple/20 flex items-center justify-center gap-2 transition disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer Switch to Register */}
        <div className="mt-6 text-center text-xs text-gray-400">
          Don't have an account yet?{' '}
          <button
            onClick={openRegisterModal}
            className="text-ankirab-cyan font-bold hover:underline"
          >
            Sign up now
          </button>
        </div>
      </div>
    </div>
  );
};
