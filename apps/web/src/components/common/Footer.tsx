import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Heart, Globe, Sparkles } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-ankirab-dark border-t border-ankirab-border/60 text-gray-400 mt-20 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          
          {/* Brand & Tagline */}
          <div className="space-y-4 md:col-span-1">
            <Link to="/" className="inline-block text-2xl font-black text-white">
              ANKI<span className="text-transparent bg-clip-text bg-gradient-to-r from-ankirab-purple to-ankirab-cyan">RAB</span>
              <span className="text-xs text-ankirab-cyan ml-1">.COM</span>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed">
              "Your Anime. Your Language. Your World."
            </p>
            <p className="text-xs text-gray-500 leading-relaxed">
              Discover and watch anime with multilingual audio (Hindi, English, Japanese) and accurate multi-language subtitles on any device.
            </p>
          </div>

          {/* Discover Links */}
          <div>
            <h4 className="text-white text-sm font-semibold uppercase tracking-wider mb-3">
              Discover
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/catalog" className="hover:text-white transition">Anime Catalog</Link>
              </li>
              <li>
                <Link to="/catalog?format=MOVIE" className="hover:text-white transition">Anime Movies</Link>
              </li>
              <li>
                <Link to="/catalog?audioLang=hi" className="hover:text-amber-400 transition flex items-center gap-1.5">
                  <span>Hindi Dubbed Anime</span>
                </Link>
              </li>
              <li>
                <Link to="/catalog?audioLang=en" className="hover:text-blue-400 transition">English Dubbed</Link>
              </li>
              <li>
                <Link to="/schedule" className="hover:text-white transition">Weekly Release Schedule</Link>
              </li>
            </ul>
          </div>

          {/* Multilingual Support */}
          <div>
            <h4 className="text-white text-sm font-semibold uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-ankirab-cyan" />
              <span>Languages</span>
            </h4>
            <div className="flex flex-wrap gap-1.5 text-xs">
              <span className="px-2 py-1 bg-ankirab-surface border border-ankirab-border rounded text-gray-300">Hindi (हिन्दी)</span>
              <span className="px-2 py-1 bg-ankirab-surface border border-ankirab-border rounded text-gray-300">English</span>
              <span className="px-2 py-1 bg-ankirab-surface border border-ankirab-border rounded text-gray-300">Japanese (日本語)</span>
              <span className="px-2 py-1 bg-ankirab-surface border border-ankirab-border rounded text-gray-300">Tamil (தமிழ்)</span>
              <span className="px-2 py-1 bg-ankirab-surface border border-ankirab-border rounded text-gray-300">Telugu (తెలుగు)</span>
            </div>
            <p className="text-xs text-gray-500 mt-3">
              Adaptive multi-audio tracks and synchronized WebVTT subtitles on all supported players.
            </p>
          </div>

          {/* Legal and Compliance */}
          <div>
            <h4 className="text-white text-sm font-semibold uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Legal & Providers</span>
            </h4>
            <p className="text-xs text-gray-400 leading-relaxed mb-3">
              ANKIRAB delivers content exclusively through authorized streaming providers, licensed CDN endpoints, and public-domain materials.
            </p>
            <div className="flex flex-col gap-1.5 text-xs">
              <Link to="/catalog" className="hover:text-white transition">Privacy Policy</Link>
              <Link to="/catalog" className="hover:text-white transition">Terms of Service</Link>
              <Link to="/catalog" className="hover:text-white transition">Content Licensing Inquiries</Link>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-ankirab-border/40 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} ANKIRAB.COM. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built for anime fans worldwide with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" /> and speed.
          </p>
        </div>
      </div>
    </footer>
  );
};
