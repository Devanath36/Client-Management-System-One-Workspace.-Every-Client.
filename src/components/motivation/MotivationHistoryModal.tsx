import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useApp } from '../../context/AppContext';
import {
  History,
  Trash2,
  Search,
  Filter,
  Calendar,
  Sparkles,
  Star,
  ExternalLink,
  Target,
} from 'lucide-react';

interface MotivationHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectQuote?: (quoteId: string) => void;
}

export const MotivationHistoryModal: React.FC<MotivationHistoryModalProps> = ({
  isOpen,
  onClose,
  onSelectQuote,
}) => {
  const {
    currentUserHistory,
    clearUserHistory,
    toggleFavoriteQuote,
    isQuoteFavorited,
    motivationQuotes,
    showToast,
  } = useApp();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLanguage, setSelectedLanguage] = useState<'all' | 'en' | 'ta'>('all');
  const [dateFilter, setDateFilter] = useState<string>('');

  const categories = Array.from(new Set(currentUserHistory.map((h) => h.category)));

  const filteredHistory = currentUserHistory.filter((item) => {
    const query = search.toLowerCase();
    const matchesSearch =
      item.quote.toLowerCase().includes(query) ||
      (item.quoteTamil ? item.quoteTamil.toLowerCase().includes(query) : false) ||
      (item.author ? item.author.toLowerCase().includes(query) : false) ||
      item.category.toLowerCase().includes(query) ||
      (item.taskAchievementContext ? item.taskAchievementContext.toLowerCase().includes(query) : false);

    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesLanguage = selectedLanguage === 'all' || item.language === selectedLanguage;
    const matchesDate = !dateFilter || item.viewedAt.startsWith(dateFilter);

    return matchesSearch && matchesCategory && matchesLanguage && matchesDate;
  });

  const handleFavorite = (item: (typeof currentUserHistory)[0]) => {
    const fullQuote = motivationQuotes.find((q) => q.id === item.quoteId);
    if (fullQuote) {
      toggleFavoriteQuote(fullQuote, item.language);
    } else {
      // Fallback
      toggleFavoriteQuote(
        {
          id: item.quoteId,
          quote: item.quote,
          quoteTamil: item.quoteTamil,
          author: item.author,
          authorTamil: item.authorTamil,
          isVerifiedAuthor: true,
          applicableRoles: ['team_member'],
          category: item.category,
          language: 'both',
          isOriginal: false,
          published: true,
          createdAt: item.viewedAt,
          updatedAt: item.viewedAt,
        },
        item.language
      );
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Personal Motivation History"
      description="Timeline of quotes, weekly themes, and task-achievement reflections viewed by your account."
      maxWidth="3xl"
    >
      <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search history, authors, or milestones..."
              className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
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

            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
              title="Filter by specific date"
            />

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

        {/* Counter & Clear Button */}
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1 border-b border-slate-100 dark:border-slate-800 pb-2">
          <span>
            {filteredHistory.length} viewing events recorded (private to you)
          </span>
          {currentUserHistory.length > 0 && (
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Clear all your motivation viewing history?')) {
                  clearUserHistory();
                }
              }}
              className="text-[11px] text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 font-medium inline-flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          )}
        </div>

        {/* Timeline Items */}
        {filteredHistory.length === 0 ? (
          <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
              <History className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              No History Records Found
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              As you interact with daily motivation and explore themes on your workspace dashboard, a private timeline will be recorded here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredHistory.map((item) => {
              const favorited = isQuoteFavorited(item.quoteId, item.language);
              return (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600 transition-all shadow-xs space-y-2.5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
                        {item.category}
                      </span>
                      {item.weeklyThemeTitle && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-indigo-50 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900">
                          {item.weeklyThemeTitle}
                        </span>
                      )}
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-mono uppercase bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                        {item.language === 'ta' ? 'தமிழ்' : 'English'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleFavorite(item)}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                          favorited
                            ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/50'
                            : 'text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-700'
                        }`}
                        title={favorited ? 'In favorites' : 'Add to favorites'}
                      >
                        <Star className={`w-4 h-4 ${favorited ? 'fill-amber-500' : ''}`} />
                      </button>
                      {onSelectQuote && (
                        <button
                          type="button"
                          onClick={() => {
                            onSelectQuote(item.quoteId);
                            onClose();
                            showToast('info', 'Motivation Loaded', 'Revisited quote on your dashboard.');
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                          title="Revisit quote on workspace"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Task Achievement Context if this quote was triggered by progress */}
                  {item.taskAchievementContext && (
                    <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 rounded-xl flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-300 font-medium">
                      <Target className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>{item.taskAchievementContext}</span>
                    </div>
                  )}

                  {/* Quote Body */}
                  <blockquote className="text-sm font-serif italic text-slate-800 dark:text-slate-100 leading-relaxed">
                    "{item.language === 'ta' && item.quoteTamil ? item.quoteTamil : item.quote}"
                  </blockquote>

                  {/* Footer */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      — {item.language === 'ta' && item.authorTamil ? item.authorTamil : item.author || 'Verified Reflection'}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      {new Date(item.viewedAt).toLocaleDateString()} at{' '}
                      {new Date(item.viewedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Modal>
  );
};
