import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { UserMotivationPreferences } from '../../types';
import {
  Sparkles,
  Languages,
  Check,
  Target,
  Megaphone,
  RotateCcw,
  Save,
  Bookmark,
  History,
  Info,
  Calendar,
} from 'lucide-react';
import { MotivationFavoritesModal } from '../motivation/MotivationFavoritesModal';
import { MotivationHistoryModal } from '../motivation/MotivationHistoryModal';

export const MotivationSettingsPanel: React.FC = () => {
  const {
    currentUser,
    currentUserMotivationPreferences,
    updateCurrentUserMotivationPreferences,
    motivationCategories,
    weeklyThemes,
    currentUserFavorites,
    currentUserHistory,
    showToast,
  } = useApp();

  const [prefs, setPrefs] = useState<UserMotivationPreferences>({
    ...currentUserMotivationPreferences,
  });
  const [isDirty, setIsDirty] = useState(false);
  const [favoritesOpen, setFavoritesOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  useEffect(() => {
    setPrefs({ ...currentUserMotivationPreferences });
    setIsDirty(false);
  }, [currentUserMotivationPreferences]);

  const applicableCategories = motivationCategories.filter(
    (c) => !currentUser || c.applicableRoles.includes(currentUser.role)
  );

  const toggleCategory = (catName: string) => {
    setPrefs((prev) => {
      const exists = prev.preferredCategories.includes(catName);
      const next = exists
        ? prev.preferredCategories.filter((c) => c !== catName)
        : [...prev.preferredCategories, catName];
      setIsDirty(true);
      return { ...prev, preferredCategories: next };
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateCurrentUserMotivationPreferences(prefs);
    setIsDirty(false);
  };

  const handleResetDefaults = () => {
    const defaults: UserMotivationPreferences = {
      userId: currentUser?.id || 'user',
      enabled: true,
      language: 'both',
      preferredCategories: [],
      taskProgressMotivation: true,
      campaignParticipation: true,
      autoDailyRefresh: true,
      manualRefreshAllowed: true,
    };
    setPrefs(defaults);
    updateCurrentUserMotivationPreferences(defaults);
    setIsDirty(false);
    showToast('info', 'Preferences Reset', 'Restored default motivation settings.');
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSave} className="space-y-6">
        {/* 1. Master Enable/Disable Toggle */}
        <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Enable Daily Motivation System
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              When enabled, a personalized, role-aware quotation, weekly theme, and achievement reflection are presented on your workspace cockpit.
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input
              type="checkbox"
              checked={prefs.enabled}
              onChange={(e) => {
                setPrefs({ ...prefs, enabled: e.target.checked });
                setIsDirty(true);
              }}
              className="sr-only peer"
            />
            <div className="w-12 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        {/* 2. Preferred Language Selection */}
        <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Language Delivery Setting
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Select whether you prefer author quotes in English, authentic Tamil literature & translations (தமிழ்), or an interactive bilingual toggle.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <button
              type="button"
              onClick={() => {
                setPrefs({ ...prefs, language: 'en' });
                setIsDirty(true);
              }}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                prefs.language === 'en'
                  ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 ring-2 ring-blue-500/20'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:border-slate-300'
              }`}
            >
              <div className="text-xs font-bold">English (Original Attributions)</div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Quotes presented in verified English language text with source authors.
              </p>
            </button>

            <button
              type="button"
              onClick={() => {
                setPrefs({ ...prefs, language: 'ta' });
                setIsDirty(true);
              }}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                prefs.language === 'ta'
                  ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 ring-2 ring-blue-500/20'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:border-slate-300'
              }`}
            >
              <div className="text-xs font-bold">தமிழ் (Tamil Only)</div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                திருக்குறள், பாரதியார் மற்றும் சரிபார்க்கப்பட்ட தமிழ் மொழிபெயர்ப்புகள்.
              </p>
            </button>

            <button
              type="button"
              onClick={() => {
                setPrefs({ ...prefs, language: 'both' });
                setIsDirty(true);
              }}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                prefs.language === 'both'
                  ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 ring-2 ring-blue-500/20'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:border-slate-300'
              }`}
            >
              <div className="text-xs font-bold">Bilingual Switcher (Recommended)</div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Display 1-tap EN ↔ தமிழ் button directly on your workspace card.
              </p>
            </button>
          </div>
        </div>

        {/* 3. Preferred Categories */}
        <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Category Focus Areas ({currentUser?.role.replace('_', ' ').toUpperCase()})
            </h3>
            <span className="text-xs text-slate-500 font-mono">
              {prefs.preferredCategories.length === 0
                ? 'All categories active'
                : `${prefs.preferredCategories.length} selected`}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Tailor motivation entries to specific competencies matching your system role.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 pt-1">
            {applicableCategories.map((cat) => {
              const selected = prefs.preferredCategories.includes(cat.name);
              return (
                <button
                  type="button"
                  key={cat.name}
                  onClick={() => toggleCategory(cat.name)}
                  className={`p-3 rounded-xl border text-xs font-medium flex items-center justify-between transition-all cursor-pointer ${
                    selected
                      ? 'border-blue-500 bg-blue-50/60 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                  }`}
                >
                  <span className="truncate">{cat.name}</span>
                  {selected && <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0 ml-1" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. Weekly Theme Preference */}
        <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Weekly Theme Synchronization
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Choose whether to automatically synchronize with the organization's published weekly schedule, or lock into a specific theme.
          </p>
          <select
            value={prefs.preferredThemeId || 'auto'}
            onChange={(e) => {
              setPrefs({
                ...prefs,
                preferredThemeId: e.target.value === 'auto' ? undefined : e.target.value,
              });
              setIsDirty(true);
            }}
            className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="auto">Automatic (Follow Organization Scheduled Calendar Week)</option>
            {weeklyThemes.map((th) => (
              <option key={th.id} value={th.id}>
                Week {th.weekNumber}: {th.title} {th.isActive ? '(Current Active)' : ''}
              </option>
            ))}
          </select>
        </div>

        {/* 5 & 6. Task Progress & Campaign Toggles */}
        <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Contextual Intelligence & Delivery
          </h3>

          <div className="space-y-3">
            <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={prefs.taskProgressMotivation}
                onChange={(e) => {
                  setPrefs({ ...prefs, taskProgressMotivation: e.target.checked });
                  setIsDirty(true);
                }}
                className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <div className="text-xs">
                <span className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Target className="w-4 h-4 text-emerald-500" />
                  <span>Task-Progress-Based Motivation</span>
                </span>
                <p className="text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Evaluate actual project milestone completions, sprint deliverable approvals, and workload consistency from the database to present milestone banners with matching quotes.
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={prefs.campaignParticipation}
                onChange={(e) => {
                  setPrefs({ ...prefs, campaignParticipation: e.target.checked });
                  setIsDirty(true);
                }}
                className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <div className="text-xs">
                <span className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Megaphone className="w-4 h-4 text-indigo-500" />
                  <span>Participate in Enterprise Motivation Campaigns</span>
                </span>
                <p className="text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Allow Administrator-scheduled strategic initiatives to appear on your workspace motivation cockpit during sprint campaigns.
                </p>
              </div>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <label className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={prefs.autoDailyRefresh}
                  onChange={(e) => {
                    setPrefs({ ...prefs, autoDailyRefresh: e.target.checked });
                    setIsDirty(true);
                  }}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-xs text-slate-800 dark:text-slate-200 font-medium">
                  Automatic Daily Selection
                </span>
              </label>

              <label className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={prefs.manualRefreshAllowed}
                  onChange={(e) => {
                    setPrefs({ ...prefs, manualRefreshAllowed: e.target.checked });
                    setIsDirty(true);
                  }}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-xs text-slate-800 dark:text-slate-200 font-medium">
                  Enable Manual Shuffle Button
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* 9 & 10. Favorites & History Access Panels */}
        <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Private Quotes & Engagement History
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Access your private collection of saved favorite quotes or review your historical timeline of viewed reflections.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => setFavoritesOpen(true)}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 text-xs font-semibold inline-flex items-center gap-2 cursor-pointer"
            >
              <Bookmark className="w-4 h-4 text-amber-500" />
              <span>Saved Favorites ({currentUserFavorites.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setHistoryOpen(true)}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 text-xs font-semibold inline-flex items-center gap-2 cursor-pointer"
            >
              <History className="w-4 h-4 text-blue-500" />
              <span>History Timeline ({currentUserHistory.length})</span>
            </button>
          </div>
        </div>

        {/* Form Action Controls */}
        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="px-3.5 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 rounded-xl inline-flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <button
            type="submit"
            disabled={!isDirty}
            className={`px-5 py-2.5 text-xs font-semibold text-white rounded-xl shadow-xs transition-all inline-flex items-center gap-2 cursor-pointer ${
              isDirty
                ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20'
                : 'bg-slate-400 dark:bg-slate-700 opacity-60 cursor-not-allowed'
            }`}
          >
            <Save className="w-4 h-4" />
            <span>Save Motivation Preferences</span>
          </button>
        </div>
      </form>

      {/* Modals */}
      <MotivationFavoritesModal
        isOpen={favoritesOpen}
        onClose={() => setFavoritesOpen(false)}
      />

      <MotivationHistoryModal
        isOpen={historyOpen}
        onClose={() => setHistoryOpen(false)}
      />
    </div>
  );
};
