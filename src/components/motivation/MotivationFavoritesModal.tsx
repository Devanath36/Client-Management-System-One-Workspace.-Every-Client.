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
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#888888]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search saved quotes or authors..."
              className="w-full pl-9 pr-3.5 py-2 text-xs bg-[#F7F7F7] dark:bg-[#101010] border border-[#E0E0E0] dark:border-[#333333] rounded-xl text-[#101010] dark:text-white placeholder-[#888888] focus:outline-none focus:ring-2 focus:ring-[#E50914]"
            />
          </div>

          <div className="flex items-center gap-2">
            {/* Category Dropdown */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 text-xs bg-[#F7F7F7] dark:bg-[#101010] border border-[#E0E0E0] dark:border-[#333333] rounded-xl text-[#333333] dark:text-[#D4D4D4] focus:outline-none cursor-pointer"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            {/* Language Toggle Pills */}
            <div className="flex items-center rounded-xl bg-[#F0F0F0] dark:bg-[#101010] p-0.5 border border-[#E0E0E0] dark:border-[#333333]">
              <button
                type="button"
                onClick={() => setSelectedLanguage('all')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  selectedLanguage === 'all'
                    ? 'bg-white dark:bg-[#202020] text-[#E50914] shadow-xs'
                    : 'text-[#666666] dark:text-[#A3A3A3] hover:text-[#101010] dark:hover:text-white'
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setSelectedLanguage('en')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  selectedLanguage === 'en'
                    ? 'bg-white dark:bg-[#202020] text-[#E50914] shadow-xs'
                    : 'text-[#666666] dark:text-[#A3A3A3] hover:text-[#101010] dark:hover:text-white'
                }`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setSelectedLanguage('ta')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  selectedLanguage === 'ta'
                    ? 'bg-white dark:bg-[#202020] text-[#E50914] shadow-xs'
                    : 'text-[#666666] dark:text-[#A3A3A3] hover:text-[#101010] dark:hover:text-white'
                }`}
              >
                தமிழ்
              </button>
            </div>
          </div>
        </div>

        {/* Favorites Count */}
        <div className="flex items-center justify-between text-xs text-[#666666] dark:text-[#A3A3A3] pt-1">
          <span>
            Showing {filteredFavorites.length} of {currentUserFavorites.length} saved favorites
          </span>
          <span className="text-[11px] font-mono">Private to your account</span>
        </div>

        {/* Favorites List */}
        {filteredFavorites.length === 0 ? (
          <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-[#E0E0E0] dark:border-[#333333] space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#FFC928]/15 text-[#FFC928] flex items-center justify-center mx-auto">
              <Star className="w-6 h-6 fill-[#FFC928]/30" />
            </div>
            <h4 className="text-sm font-semibold text-[#101010] dark:text-white">
              No Favorite Quotes Found
            </h4>
            <p className="text-xs text-[#666666] dark:text-[#A3A3A3] max-w-sm mx-auto">
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
                className="p-4 rounded-2xl bg-white dark:bg-[#171717] border border-[#E0E0E0] dark:border-[#333333] hover:border-[#E50914] transition-all shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#E50914]/10 text-[#E50914] border border-[#E50914]/25">
                      {fav.category}
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-mono uppercase bg-[#F5F5F5] dark:bg-[#202020] text-[#555555] dark:text-[#D4D4D4]">
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
                        className="p-1.5 rounded-lg text-[#888888] hover:text-[#E50914] hover:bg-[#F5F5F5] dark:hover:bg-[#202020] transition-colors cursor-pointer"
                        title="Display on workspace card"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => removeFavoriteQuote(fav.id)}
                      className="p-1.5 rounded-lg text-[#888888] hover:text-[#E50914] hover:bg-[#E50914]/10 transition-colors cursor-pointer"
                      title="Remove from favorites"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Quote Text */}
                <blockquote className="text-sm font-serif italic text-[#101010] dark:text-white leading-relaxed">
                  "{fav.language === 'ta' && fav.quoteTamil ? fav.quoteTamil : fav.quote}"
                </blockquote>

                {/* Footer attribution & save date */}
                <div className="pt-2 border-t border-[#E0E0E0] dark:border-[#2a2a2a] flex items-center justify-between text-xs text-[#666666] dark:text-[#A3A3A3]">
                  <span className="font-medium text-[#333333] dark:text-[#D4D4D4]">
                    — {fav.language === 'ta' && fav.authorTamil ? fav.authorTamil : fav.author || 'Verified Reflection'}
                  </span>
                  <div className="flex items-center gap-1 text-[11px] font-mono text-[#888888]">
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
