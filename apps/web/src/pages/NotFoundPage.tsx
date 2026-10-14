import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Compass } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center p-4 text-center">
      <span className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-ankirab-purple via-indigo-400 to-ankirab-cyan">
        404
      </span>
      <h1 className="text-2xl sm:text-3xl font-bold text-white mt-4 mb-2">
        Page Lost in the Multiverse
      </h1>
      <p className="text-sm text-gray-400 max-w-md mb-8">
        The anime page or streaming route you requested does not exist or has been relocated to another dimension.
      </p>

      <div className="flex gap-4">
        <Link
          to="/"
          className="flex items-center gap-2 px-5 py-2.5 bg-ankirab-purple hover:bg-purple-600 text-white rounded-xl text-sm font-semibold transition"
        >
          <Home className="w-4 h-4" />
          <span>Return Home</span>
        </Link>
        <Link
          to="/catalog"
          className="flex items-center gap-2 px-5 py-2.5 bg-ankirab-surface hover:bg-ankirab-card border border-ankirab-border text-gray-300 hover:text-white rounded-xl text-sm font-semibold transition"
        >
          <Compass className="w-4 h-4" />
          <span>Explore Catalog</span>
        </Link>
      </div>
    </div>
  );
};
