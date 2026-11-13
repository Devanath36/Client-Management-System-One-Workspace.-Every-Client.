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
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#888888]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search history, authors, or milestones..."
              className="w-full pl-9 pr-3.5 py-2 text-xs bg-[#F7F7F7] dark:bg-[#101010] border border-[#E0E0E0] dark:border-[#333333] rounded-xl text-[#101010] dark:text-white placeholder-[#888888] focus:outline-none focus:ring-2 focus:ring-[#E50914]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
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

            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-3 py-1.5 text-xs bg-[#F7F7F7] dark:bg-[#101010] border border-[#E0E0E0] dark:border-[#333333] rounded-xl text-[#333333] dark:text-[#D4D4D4] focus:outline-none cursor-pointer"
              title="Filter by specific date"
            />

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

        {/* Counter & Clear Button */}
        <div className="flex items-center justify-between text-xs text-[#666666] dark:text-[#A3A3A3] pt-1 border-b border-[#E0E0E0] dark:border-[#2a2a2a] pb-2">
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
              className="text-[11px] text-[#E50914] hover:text-[#b80710] font-medium inline-flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          )}
        </div>

        {/* Timeline Items */}
        {filteredHistory.length === 0 ? (
          <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-[#E0E0E0] dark:border-[#333333] space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#F5F5F5] dark:bg-[#202020] text-[#888888] flex items-center justify-center mx-auto">
              <History className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-semibold text-[#101010] dark:text-white">
              No History Records Found
            </h4>
            <p className="text-xs text-[#666666] dark:text-[#A3A3A3] max-w-sm mx-auto">
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
                  className="p-4 rounded-2xl bg-white dark:bg-[#171717] border border-[#E0E0E0] dark:border-[#333333] hover:border-[#A3A3A3] transition-all shadow-xs space-y-2.5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#E50914]/10 text-[#E50914] border border-[#E50914]/25">
                        {item.category}
                      </span>
                      {item.weeklyThemeTitle && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-[#FF7900]/10 text-[#FF7900] border border-[#FF7900]/30">
                          {item.weeklyThemeTitle}
                        </span>
                      )}
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-mono uppercase bg-[#F5F5F5] dark:bg-[#202020] text-[#555555] dark:text-[#D4D4D4]">
                        {item.language === 'ta' ? 'தமிழ்' : 'English'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleFavorite(item)}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                          favorited
                            ? 'text-[#FFC928] bg-[#FFC928]/15'
                            : 'text-[#888888] hover:text-[#FFC928] hover:bg-[#F5F5F5] dark:hover:bg-[#202020]'
                        }`}
                        title={favorited ? 'In favorites' : 'Add to favorites'}
                      >
                        <Star className={`w-4 h-4 ${favorited ? 'fill-[#FFC928]' : ''}`} />
                      </button>
                      {onSelectQuote && (
                        <button
                          type="button"
                          onClick={() => {
                            onSelectQuote(item.quoteId);
                            onClose();
                            showToast('info', 'Motivation Loaded', 'Revisited quote on your dashboard.');
                          }}
                          className="p-1.5 rounded-lg text-[#888888] hover:text-[#E50914] hover:bg-[#F5F5F5] dark:hover:bg-[#202020] transition-colors cursor-pointer"
                          title="Revisit quote on workspace"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Task Achievement Context if this quote was triggered by progress */}
                  {item.taskAchievementContext && (
                    <div className="p-2.5 bg-[#FFC928]/15 border border-[#FFC928]/40 rounded-xl flex items-center gap-2 text-xs text-[#101010] dark:text-white font-medium">
                      <Target className="w-3.5 h-3.5 text-[#FF7900] shrink-0" />
                      <span>{item.taskAchievementContext}</span>
                    </div>
                  )}

                  {/* Quote Body */}
                  <blockquote className="text-sm font-serif italic text-[#101010] dark:text-white leading-relaxed">
                    "{item.language === 'ta' && item.quoteTamil ? item.quoteTamil : item.quote}"
                  </blockquote>

                  {/* Footer */}
                  <div className="pt-2 border-t border-[#E0E0E0] dark:border-[#2a2a2a] flex items-center justify-between text-xs text-[#666666] dark:text-[#A3A3A3]">
                    <span className="font-medium text-[#333333] dark:text-[#D4D4D4]">
                      — {item.language === 'ta' && item.authorTamil ? item.authorTamil : item.author || 'Verified Reflection'}
                    </span>
                    <span className="text-[11px] font-mono text-[#888888]">
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
