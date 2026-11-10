import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Sparkles,
  RefreshCw,
  Star,
  Languages,
  Bookmark,
  History,
  Settings,
  Target,
  Megaphone,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { selectPersonalizedMotivation, SelectionResult } from '../../services/motivationService';
import { MotivationFavoritesModal } from './MotivationFavoritesModal';
import { MotivationHistoryModal } from './MotivationHistoryModal';
import { MotivationSettingsModal } from './MotivationSettingsModal';

interface DailyMotivationCardProps {
  className?: string;
}

export const DailyMotivationCard: React.FC<DailyMotivationCardProps> = ({ className = '' }) => {
  const {
    currentUser,
    motivationQuotes,
    weeklyThemes,
    motivationCampaigns,
    currentUserMotivationPreferences,
    updateCurrentUserMotivationPreferences,
    currentUserFavorites,
    toggleFavoriteQuote,
    isQuoteFavorited,
    recordMotivationView,
    tasks,
    projects,
    showToast,
  } = useApp();

  // Local card state
  const [manualOffset, setManualOffset] = useState<number>(0);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [fadeKey, setFadeKey] = useState<number>(0);
  const [recentQuoteIds, setRecentQuoteIds] = useState<string[]>([]);
  const [overrideQuoteId, setOverrideQuoteId] = useState<string | null>(null);

  // Active language displayed on card: follows preference or explicit card toggle
  const defaultLang = useMemo(() => {
    if (currentUserMotivationPreferences.language === 'ta') return 'ta';
    return 'en';
  }, [currentUserMotivationPreferences.language]);

  const [activeLang, setActiveLang] = useState<'en' | 'ta'>(defaultLang);

  // Update activeLang if preferences change
  useEffect(() => {
    if (currentUserMotivationPreferences.language === 'ta') {
      setActiveLang('ta');
    } else if (currentUserMotivationPreferences.language === 'en') {
      setActiveLang('en');
    }
  }, [currentUserMotivationPreferences.language]);

  // Modals state
  const [favoritesOpen, setFavoritesOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Today's date string YYYY-MM-DD
  const todayStr = new Date().toISOString().substring(0, 10);

  // Calculate current motivation item
  const currentSelection: SelectionResult | null = useMemo(() => {
    if (!currentUser || !currentUserMotivationPreferences.enabled) return null;

    // If an explicit quote was selected from Favorites or History
    if (overrideQuoteId) {
      const found = motivationQuotes.find((q) => q.id === overrideQuoteId);
      if (found) {
        const theme = weeklyThemes.find((t) => t.id === found.weeklyThemeId) || weeklyThemes[0];
        return {
          entry: found,
          weeklyTheme: theme,
        };
      }
    }

    return selectPersonalizedMotivation({
      user: currentUser,
      allQuotes: motivationQuotes,
      preferences: currentUserMotivationPreferences,
      themes: weeklyThemes,
      campaigns: motivationCampaigns,
      recentQuoteIds,
      tasks,
      projects,
      dateStr: todayStr,
      manualOffset,
    });
  }, [
    currentUser,
    currentUserMotivationPreferences,
    motivationQuotes,
    weeklyThemes,
    motivationCampaigns,
    recentQuoteIds,
    tasks,
    projects,
    todayStr,
    manualOffset,
    overrideQuoteId,
  ]);

  // Record viewing event in user history when currentSelection updates
  useEffect(() => {
    if (currentSelection && currentUser) {
      recordMotivationView(
        currentSelection.entry,
        activeLang,
        currentSelection.achievementContext,
        currentSelection.weeklyTheme?.title
      );
      // Track rolling recent quote IDs to avoid repeats during manual refresh
      setRecentQuoteIds((prev) => {
        if (prev.includes(currentSelection.entry.id)) return prev;
        return [currentSelection.entry.id, ...prev.slice(0, 9)];
      });
    }
  }, [currentSelection?.entry.id, activeLang]);

  // Handle manual shuffle
  const handleShuffleQuote = () => {
    if (!currentUserMotivationPreferences.manualRefreshAllowed) {
      showToast('info', 'Manual Shuffle Disabled', 'Enable manual refresh in Motivation Settings.');
      return;
    }
    setOverrideQuoteId(null);
    setIsRefreshing(true);
    setFadeKey((prev) => prev + 1);

    setTimeout(() => {
      setManualOffset((prev) => prev + 1);
      setIsRefreshing(false);
    }, 280);
  };

  // Toggle card language
  const handleToggleLanguage = (lang: 'en' | 'ta') => {
    setActiveLang(lang);
    setFadeKey((prev) => prev + 1);
  };

  // If motivation is disabled in settings
  if (!currentUserMotivationPreferences.enabled) {
    return (
      <div
        className={`lg:col-span-5 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between items-center text-center space-y-4 ${className}`}
      >
        <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mt-3">
          <Sparkles className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
            Daily Motivation is Paused
          </h3>
          <p className="text-xs text-slate-500 max-w-sm">
            You have disabled daily motivation on your workspace dashboard.
          </p>
        </div>
        <button
          type="button"
          onClick={() => updateCurrentUserMotivationPreferences({ enabled: true })}
          className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors cursor-pointer inline-flex items-center gap-1.5 mb-2"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Resume Daily Motivation</span>
        </button>
      </div>
    );
  }

  // Graceful fallback if no quotes available
  if (!currentSelection) {
    return (
      <div
        className={`lg:col-span-5 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between ${className}`}
      >
        <div className="text-center py-8 text-xs text-slate-500">
          Loading personalized daily motivation...
        </div>
      </div>
    );
  }

  const { entry, achievementContext, campaignInfo, weeklyTheme } = currentSelection;
  const isFavorited = isQuoteFavorited(entry.id, activeLang);

  // Quote text in requested language with graceful fallback
  const displayQuote =
    activeLang === 'ta' && entry.quoteTamil ? entry.quoteTamil : entry.quote;
  const displayAuthor =
    activeLang === 'ta' && entry.authorTamil
      ? entry.authorTamil
      : entry.author || (entry.isOriginal ? 'Team Reflection' : 'Verified Author');

  const themeDisplayTitle =
    activeLang === 'ta' && weeklyTheme?.titleTamil
      ? weeklyTheme.titleTamil
      : weeklyTheme?.title || 'Continuous Excellence';

  return (
    <>
      <div
        className={`lg:col-span-5 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between relative overflow-hidden transition-all ${className}`}
      >
        {/* Subtle decorative background gradient */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* 1. Header with Badges & Controls */}
        <div className="relative z-10 space-y-3">
          <div className="flex items-center justify-between gap-2">
            {/* Left Badges */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-900 text-blue-700 dark:text-blue-300 text-[11px] font-bold uppercase tracking-wider">
                <Sparkles className="w-3 h-3" />
                <span>{entry.category}</span>
              </span>

              {weeklyTheme && (
                <span
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-900 text-indigo-700 dark:text-indigo-300 text-[10px] font-medium"
                  title={`Weekly Theme: ${themeDisplayTitle}`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                  <span className="truncate max-w-[130px] sm:max-w-[160px]">{themeDisplayTitle}</span>
                </span>
              )}

              {campaignInfo && (
                <span
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900 text-amber-700 dark:text-amber-300 text-[10px] font-medium"
                  title={`Active Campaign: ${campaignInfo.campaignName}`}
                >
                  <Megaphone className="w-3 h-3 text-amber-500" />
                  <span className="truncate max-w-[110px]">Campaign Drive</span>
                </span>
              )}
            </div>

            {/* Right Controls: Language toggle + Favorite + Refresh */}
            <div className="flex items-center gap-1">
              {/* Language Switcher Button (EN / தமிழ்) */}
              <div className="flex items-center rounded-lg bg-slate-100 dark:bg-slate-800 p-0.5 border border-slate-200 dark:border-slate-700 text-[10px] font-semibold">
                <button
                  type="button"
                  onClick={() => handleToggleLanguage('en')}
                  className={`px-2 py-1 rounded-md transition-colors cursor-pointer ${
                    activeLang === 'en'
                      ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                  title="Switch to English"
                >
                  EN
                </button>
                <button
                  type="button"
                  onClick={() => handleToggleLanguage('ta')}
                  className={`px-2 py-1 rounded-md transition-colors cursor-pointer ${
                    activeLang === 'ta'
                      ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                  title="தமிழ் மொழியில் படிக்க"
                >
                  தமிழ்
                </button>
              </div>

              {/* Favorite Button */}
              <button
                type="button"
                onClick={() => toggleFavoriteQuote(entry, activeLang)}
                className={`min-w-[36px] min-h-[36px] p-2 rounded-xl transition-all cursor-pointer flex items-center justify-center ${
                  isFavorited
                    ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100'
                    : 'text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
                title={isFavorited ? 'Remove from favorites' : 'Save to favorites'}
                aria-label="Toggle favorite"
              >
                <Star
                  className={`w-4 h-4 transition-transform ${
                    isFavorited ? 'fill-amber-500 scale-110' : ''
                  }`}
                />
              </button>

              {/* Shuffle / Refresh Button */}
              <button
                type="button"
                onClick={handleShuffleQuote}
                disabled={isRefreshing}
                className="min-w-[36px] min-h-[36px] p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center"
                title="Shuffle Daily Motivation"
                aria-label="Shuffle quote"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-blue-500' : ''}`} />
              </button>
            </div>
          </div>

          {/* Task Achievement Milestone Banner (if progress triggered) */}
          {achievementContext && (
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-300 font-medium animate-fadeIn">
              <Target className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="truncate">{achievementContext}</span>
            </div>
          )}

          {/* Quote Body with smooth fade */}
          <div
            key={fadeKey}
            className="transition-opacity duration-300 ease-in-out py-1"
          >
            <blockquote className="text-base sm:text-lg font-serif italic text-slate-800 dark:text-slate-100 leading-relaxed">
              "{displayQuote}"
            </blockquote>
          </div>
        </div>

        {/* 2. Footer: Author & Shortcuts */}
        <div className="relative z-10 pt-4 mt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div>
            <p className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>— {displayAuthor}</span>
              {entry.isVerifiedAuthor ? (
                <span className="inline-flex items-center text-[10px] px-1.5 py-0.5 rounded-sm bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 font-normal">
                  Verified
                </span>
              ) : (
                <span className="inline-flex items-center text-[10px] px-1.5 py-0.5 rounded-sm bg-slate-100 dark:bg-slate-800 text-slate-500 font-normal">
                  Original
                </span>
              )}
            </p>
            <p className="text-slate-500 dark:text-slate-400 text-[11px] font-medium mt-0.5">
              Personalized for {currentUser?.name || 'Workspace User'} ({currentUser ? currentUser.role.replace('_', ' ').toUpperCase() : 'USER'})
            </p>
          </div>

          {/* Quick Action Navigation Buttons */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setFavoritesOpen(true)}
              className="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors inline-flex items-center gap-1 cursor-pointer"
              title="View your saved favorites"
            >
              <Bookmark className="w-3.5 h-3.5 text-amber-500" />
              <span>Favorites</span>
              {currentUserFavorites.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 text-[10px] font-bold font-mono">
                  {currentUserFavorites.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setHistoryOpen(true)}
              className="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors inline-flex items-center gap-1 cursor-pointer"
              title="View viewing history"
            >
              <History className="w-3.5 h-3.5 text-blue-500" />
              <span>History</span>
            </button>

            <button
              type="button"
              onClick={() => setSettingsOpen(true)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Motivation Preferences"
              aria-label="Motivation settings"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Favorites Modal */}
      <MotivationFavoritesModal
        isOpen={favoritesOpen}
        onClose={() => setFavoritesOpen(false)}
        onSelectQuote={(qid) => {
          setOverrideQuoteId(qid);
          setFadeKey((prev) => prev + 1);
        }}
      />

      {/* History Modal */}
      <MotivationHistoryModal
        isOpen={historyOpen}
        onClose={() => setHistoryOpen(false)}
        onSelectQuote={(qid) => {
          setOverrideQuoteId(qid);
          setFadeKey((prev) => prev + 1);
        }}
      />

      {/* Settings Modal */}
      <MotivationSettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onOpenFavorites={() => setFavoritesOpen(true)}
        onOpenHistory={() => setHistoryOpen(true)}
      />
    </>
  );
};
