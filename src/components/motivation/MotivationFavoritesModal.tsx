import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useApp } from '../../context/AppContext';
import { UserMotivationFavorite } from '../../types';
import {
  Star,
  Trash2,
  Search,
  Filter,
  Languages,
  Calendar,
  Sparkles,
  ExternalLink,
  BookOpen,
} from 'lucide-react';

interface MotivationFavoritesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectQuote?: (quoteId: string) => void;
}

export const MotivationFavoritesModal: React.FC<MotivationFavoritesModalProps> = ({
  isOpen,
  onClose,
  onSelectQuote,
}) => {
  const { currentUserFavorites, removeFavoriteQuote, showToast } = useApp();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLanguage, setSelectedLanguage] = useState<'all' | 'en' | 'ta'>('all');

  // Categories present in user's favorites
  const categories = Array.from(new Set(currentUserFavorites.map((f) => f.category)));

  const filteredFavorites = currentUserFavorites.filter((fav) => {
    const query = search.toLowerCase();
    const matchesSearch =
      fav.quote.toLowerCase().includes(query) ||
      (fav.quoteTamil ? fav.quoteTamil.toLowerCase().includes(query) : false) ||
      (fav.author ? fav.author.toLowerCase().includes(query) : false) ||
      fav.category.toLowerCase().includes(query);

    const matchesCategory = selectedCategory === 'all' || fav.category === selectedCategory;
    const matchesLanguage = selectedLanguage === 'all' || fav.language === selectedLanguage;

    return matchesSearch && matchesCategory && matchesLanguage;
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Saved Motivation Favorites"
      description="Your private collection of inspiring quotations and reflections."
      maxWidth="2xl"
    >
      <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
        {/* Filters Bar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search saved quotes or authors..."
              className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-2">
            {/* Category Dropdown */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            {/* Language Toggle Pills */}
            <div className="flex items-center rounded-xl bg-slate-100 dark:bg-slate-800 p-0.5 border border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setSelectedLanguage('all')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  selectedLanguage === 'all'
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setSelectedLanguage('en')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  selectedLanguage === 'en'
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setSelectedLanguage('ta')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  selectedLanguage === 'ta'
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                தமிழ்
              </button>
            </div>
          </div>
        </div>

        {/* Favorites Count */}
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1">
          <span>
            Showing {filteredFavorites.length} of {currentUserFavorites.length} saved favorites
          </span>
          <span className="text-[11px] font-mono">Private to your account</span>
        </div>

        {/* Favorites List */}
        {filteredFavorites.length === 0 ? (
          <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 space-y-3">
            <div className="w-12 h-12 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-500 flex items-center justify-center mx-auto">
              <Star className="w-6 h-6 fill-amber-500/20" />
            </div>
            <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              No Favorite Quotes Found
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {search || selectedCategory !== 'all' || selectedLanguage !== 'all'
                ? 'Try broadening your search or resetting the filters.'
                : 'Click the star icon on any Daily Motivation card to save your favorite reflections here for quick revisiting.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredFavorites.map((fav) => (
              <div
                key={fav.id}
                className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 hover:border-blue-400 dark:hover:border-blue-500 transition-all shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
                      {fav.category}
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-mono uppercase bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                      {fav.language === 'ta' ? 'தமிழ்' : 'English'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    {onSelectQuote && (
                      <button
                        type="button"
                        onClick={() => {
                          onSelectQuote(fav.quoteId);
                          onClose();
                          showToast('info', 'Active Motivation Set', 'Loaded favorite quote onto your workspace dashboard.');
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                        title="Display on workspace card"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => removeFavoriteQuote(fav.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                      title="Remove from favorites"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Quote Text */}
                <blockquote className="text-sm font-serif italic text-slate-800 dark:text-slate-100 leading-relaxed">
                  "{fav.language === 'ta' && fav.quoteTamil ? fav.quoteTamil : fav.quote}"
                </blockquote>

                {/* Footer attribution & save date */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    — {fav.language === 'ta' && fav.authorTamil ? fav.authorTamil : fav.author || 'Verified Reflection'}
                  </span>
                  <div className="flex items-center gap-1 text-[11px] font-mono text-slate-400">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Saved {fav.savedAt.substring(0, 10)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
};
