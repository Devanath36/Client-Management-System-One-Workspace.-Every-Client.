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
    overrideQuoteId,
    motivationQuotes,
    weeklyThemes,
    motivationCampaigns,
    recentQuoteIds,
    tasks,
    projects,
    todayStr,
    manualOffset,
  ]);

  // Record quote view for telemetry & rotation history
  useEffect(() => {
    if (currentSelection?.entry) {
      const themeTitle =
        activeLang === 'ta' && currentSelection.weeklyTheme?.titleTamil
          ? currentSelection.weeklyTheme.titleTamil
          : currentSelection.weeklyTheme?.title;
      recordMotivationView(
        currentSelection.entry,
        activeLang,
        currentSelection.achievementContext,
        themeTitle
      );
      setRecentQuoteIds((prev) => {
        if (prev.includes(currentSelection.entry.id)) return prev;
        return [currentSelection.entry.id, ...prev.slice(0, 15)];
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSelection?.entry?.id, activeLang]);

  // Handlers
  const handleToggleLanguage = (lang: 'en' | 'ta') => {
    setActiveLang(lang);
    showToast(
      'info',
      lang === 'ta' ? 'தமிழ் மொழி தேர்ந்தெடுக்கப்பட்டது' : 'Switched to English',
      lang === 'ta'
        ? 'தினம் ஒரு உற்சாக உரை தமிழில் காட்டப்படுகிறது.'
        : 'Displaying quote and theme in English.'
    );
  };

  const handleShuffleQuote = () => {
    setIsRefreshing(true);
    setOverrideQuoteId(null);
    setManualOffset((prev) => prev + 1);
    setFadeKey((prev) => prev + 1);

    setTimeout(() => {
      setIsRefreshing(false);
    }, 350);
  };

  // If user disabled motivation banner in settings
  if (!currentUserMotivationPreferences.enabled) {
    return (
      <div
        className={`lg:col-span-5 bg-white dark:bg-[#171717] rounded-3xl p-5 border border-[#E0E0E0] dark:border-[#333333] shadow-xs flex items-center justify-between text-xs text-[#555555] dark:text-[#A3A3A3] ${className}`}
      >
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#FF7900]" />
          <span>Daily Workspace Motivation is currently paused.</span>
        </div>
        <button
          onClick={() => updateCurrentUserMotivationPreferences({ enabled: true })}
          className="text-[#E50914] font-semibold hover:underline cursor-pointer"
        >
          Enable Banner
        </button>
      </div>
    );
  }

  // Graceful fallback if no quotes available
  if (!currentSelection) {
    return (
      <div
        className={`lg:col-span-5 bg-white dark:bg-[#171717] rounded-3xl p-6 border border-[#E0E0E0] dark:border-[#333333] shadow-xs flex flex-col justify-between text-[#101010] dark:text-white ${className}`}
      >
        <div className="text-center py-8 text-xs text-[#555555] dark:text-[#A3A3A3]">
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
        className={`lg:col-span-5 bg-white dark:bg-[#171717] rounded-3xl p-6 border border-[#E0E0E0] dark:border-[#333333] shadow-sm flex flex-col justify-between relative overflow-hidden transition-all text-[#101010] dark:text-white ${className}`}
      >
        {/* Subtle decorative background gradient */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-[#E50914]/5 rounded-full blur-3xl pointer-events-none" />

        {/* 1. Header with Badges & Controls */}
        <div className="relative z-10 space-y-3">
          <div className="flex items-center justify-between gap-2">
            {/* Left Badges */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#F3F3F3] dark:bg-[#101010] border border-[#E0E0E0] dark:border-[#333333] text-[#E50914] dark:text-[#FFC928] text-[11px] font-bold uppercase tracking-wider">
                <Sparkles className="w-3 h-3 text-[#FF7900] dark:text-[#FFC928]" />
                <span>{entry.category}</span>
              </span>

              {weeklyTheme && (
                <span
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FF7900]/10 border border-[#FF7900]/30 text-[#FF7900] text-[10px] font-medium"
                  title={`Weekly Theme: ${themeDisplayTitle}`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF7900] animate-pulse" />
                  <span className="truncate max-w-[130px] sm:max-w-[160px]">{themeDisplayTitle}</span>
                </span>
              )}

              {campaignInfo && (
                <span
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#FFC928]/15 border border-[#FFC928]/40 text-[#101010] dark:text-white text-[10px] font-medium"
                  title={`Active Campaign: ${campaignInfo.campaignName}`}
                >
                  <Megaphone className="w-3 h-3 text-[#FF7900]" />
                  <span className="truncate max-w-[110px]">Campaign Drive</span>
                </span>
              )}
            </div>

            {/* Right Controls: Language toggle + Favorite + Refresh */}
            <div className="flex items-center gap-1">
              {/* Language Switcher Button (EN / தமிழ்) */}
              <div className="flex items-center rounded-lg bg-[#F0F0F0] dark:bg-[#101010] p-0.5 border border-[#E0E0E0] dark:border-[#333333] text-[10px] font-semibold">
                <button
                  type="button"
                  onClick={() => handleToggleLanguage('en')}
                  className={`px-2 py-1 rounded-md transition-colors cursor-pointer ${
                    activeLang === 'en'
                      ? 'bg-white dark:bg-[#202020] text-[#E50914] font-bold shadow-xs'
                      : 'text-[#555555] dark:text-[#A3A3A3] hover:text-[#101010] dark:hover:text-white'
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
                      ? 'bg-white dark:bg-[#202020] text-[#E50914] font-bold shadow-xs'
                      : 'text-[#555555] dark:text-[#A3A3A3] hover:text-[#101010] dark:hover:text-white'
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
                    ? 'text-[#FFC928] bg-[#FFC928]/15 hover:bg-[#FFC928]/25'
                    : 'text-[#888888] hover:text-[#FF7900] hover:bg-[#F0F0F0] dark:hover:bg-[#1a1a1a]'
                }`}
                title={isFavorited ? 'Remove from favorites' : 'Save to favorites'}
                aria-label="Toggle favorite"
              >
                <Star
                  className={`w-4 h-4 transition-transform ${
                    isFavorited ? 'fill-[#FFC928] scale-110' : ''
                  }`}
                />
              </button>

              {/* Shuffle / Refresh Button */}
              <button
                type="button"
                onClick={handleShuffleQuote}
                disabled={isRefreshing}
                className="min-w-[36px] min-h-[36px] p-2 rounded-xl text-[#888888] hover:text-[#101010] dark:hover:text-white hover:bg-[#F0F0F0] dark:hover:bg-[#1a1a1a] transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center"
                title="Shuffle Daily Motivation"
                aria-label="Shuffle quote"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-[#E50914]' : ''}`} />
              </button>
            </div>
          </div>

          {/* Task Achievement Milestone Banner (if progress triggered) */}
          {achievementContext && (
            <div className="p-2.5 rounded-xl bg-[#FFC928]/15 border border-[#FFC928]/40 flex items-center gap-2 text-xs text-[#101010] dark:text-white font-medium animate-fadeIn">
              <Target className="w-3.5 h-3.5 text-[#FF7900] shrink-0" />
              <span className="truncate">{achievementContext}</span>
            </div>
          )}

          {/* Quote Body with smooth fade */}
          <div
            key={fadeKey}
            className="transition-opacity duration-300 ease-in-out py-1"
          >
            <blockquote className="text-base sm:text-lg font-serif italic text-[#101010] dark:text-white leading-relaxed">
              "{displayQuote}"
            </blockquote>
          </div>
        </div>

        {/* 2. Footer: Author & Shortcuts */}
        <div className="relative z-10 pt-4 mt-3 border-t border-[#E0E0E0] dark:border-[#333333] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div>
            <p className="font-bold text-[#101010] dark:text-white flex items-center gap-1.5">
              <span>— {displayAuthor}</span>
              {entry.isVerifiedAuthor ? (
                <span className="inline-flex items-center text-[10px] px-1.5 py-0.5 rounded-sm bg-[#E50914]/10 text-[#E50914] font-medium border border-[#E50914]/20">
                  Verified
                </span>
              ) : (
                <span className="inline-flex items-center text-[10px] px-1.5 py-0.5 rounded-sm bg-[#F0F0F0] dark:bg-[#1a1a1a] text-[#555555] dark:text-[#A3A3A3] font-normal border border-[#E0E0E0] dark:border-[#333333]">
                  Original
                </span>
              )}
            </p>
            <p className="text-[#555555] dark:text-[#A3A3A3] text-[11px] font-medium mt-0.5">
              Personalized for {currentUser?.name || 'Workspace User'} ({currentUser ? currentUser.role.replace('_', ' ').toUpperCase() : 'USER'})
            </p>
          </div>

          {/* Quick Action Navigation Buttons */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setFavoritesOpen(true)}
              className="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-[#555555] dark:text-[#A3A3A3] hover:text-[#E50914] dark:hover:text-[#FFC928] hover:bg-[#F0F0F0] dark:hover:bg-[#1a1a1a] transition-colors inline-flex items-center gap-1 cursor-pointer"
              title="View your saved favorites"
            >
              <Bookmark className="w-3.5 h-3.5 text-[#FF7900]" />
              <span>Favorites</span>
              {currentUserFavorites.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-[#FF7900]/15 text-[#FF7900] text-[10px] font-bold font-mono">
                  {currentUserFavorites.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setHistoryOpen(true)}
              className="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-[#555555] dark:text-[#A3A3A3] hover:text-[#E50914] dark:hover:text-[#FFC928] hover:bg-[#F0F0F0] dark:hover:bg-[#1a1a1a] transition-colors inline-flex items-center gap-1 cursor-pointer"
              title="View viewing history"
            >
              <History className="w-3.5 h-3.5 text-[#FF7900]" />
              <span>History</span>
            </button>

            <button
              type="button"
              onClick={() => setSettingsOpen(true)}
              className="p-1.5 rounded-lg text-[#888888] hover:text-[#101010] dark:hover:text-white hover:bg-[#F0F0F0] dark:hover:bg-[#1a1a1a] transition-colors cursor-pointer"
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
