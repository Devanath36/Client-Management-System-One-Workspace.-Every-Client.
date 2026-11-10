import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { useApp } from '../../context/AppContext';
import { UserMotivationPreferences } from '../../types';
import {
  Settings,
  Sparkles,
  Languages,
  CheckSquare,
  Bookmark,
  History,
  Target,
  Megaphone,
  RefreshCw,
  Save,
  RotateCcw,
  Check,
} from 'lucide-react';

interface MotivationSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenFavorites?: () => void;
  onOpenHistory?: () => void;
}

export const MotivationSettingsModal: React.FC<MotivationSettingsModalProps> = ({
  isOpen,
  onClose,
  onOpenFavorites,
  onOpenHistory,
}) => {
  const {
    currentUser,
    currentUserMotivationPreferences,
    updateCurrentUserMotivationPreferences,
    motivationCategories,
    weeklyThemes,
    showToast,
  } = useApp();

  const [prefs, setPrefs] = useState<UserMotivationPreferences>({
    ...currentUserMotivationPreferences,
  });

  useEffect(() => {
    setPrefs({ ...currentUserMotivationPreferences });
  }, [currentUserMotivationPreferences, isOpen]);

  // Role-applicable categories
  const applicableCategories = motivationCategories.filter(
    (c) => !currentUser || c.applicableRoles.includes(currentUser.role)
  );

  const toggleCategory = (catName: string) => {
    setPrefs((prev) => {
      const exists = prev.preferredCategories.includes(catName);
      const nextCategories = exists
        ? prev.preferredCategories.filter((c) => c !== catName)
        : [...prev.preferredCategories, catName];
      return { ...prev, preferredCategories: nextCategories };
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateCurrentUserMotivationPreferences(prefs);
    onClose();
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
    showToast('info', 'Preferences Reset', 'Restored default motivation settings.');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Daily Motivation Preferences"
      description="Personalize your daily motivation experience, language, and category focus."
      maxWidth="2xl"
    >
      <form onSubmit={handleSave} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
        {/* 1. Master Toggle */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Enable Daily Motivation
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Display personalized quotes and reflections on your workspace cockpit.
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={prefs.enabled}
              onChange={(e) => setPrefs({ ...prefs, enabled: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        {/* 2. Preferred Language Selection */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Preferred Language
          </label>
          <div className="grid grid-cols-3 gap-2.5">
            <button
              type="button"
              onClick={() => setPrefs({ ...prefs, language: 'en' })}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                prefs.language === 'en'
                  ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 ring-2 ring-blue-500/20'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
              }`}
            >
              <div className="text-xs font-bold">English Only</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Author's original quote</div>
            </button>

            <button
              type="button"
              onClick={() => setPrefs({ ...prefs, language: 'ta' })}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                prefs.language === 'ta'
                  ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 ring-2 ring-blue-500/20'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
              }`}
            >
              <div className="text-xs font-bold">தமிழ் (Tamil Only)</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">தமிழ் ஆக்கங்கள் & மொழிபெயர்ப்பு</div>
            </button>

            <button
              type="button"
              onClick={() => setPrefs({ ...prefs, language: 'both' })}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                prefs.language === 'both'
                  ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 ring-2 ring-blue-500/20'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
              }`}
            >
              <div className="text-xs font-bold">Bilingual Toggle</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">English & Tamil switcher</div>
            </button>
          </div>
        </div>

        {/* 3. Role-Based Category Preferences */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Preferred Categories ({currentUser?.role.replace('_', ' ').toUpperCase()})
            </label>
            <span className="text-[11px] text-slate-500">
              {prefs.preferredCategories.length === 0
                ? 'All categories active'
                : `${prefs.preferredCategories.length} selected`}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Select specific focus areas, or leave all unselected to receive diverse inspiration across your entire role portfolio.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
            {applicableCategories.map((cat) => {
              const isSelected = prefs.preferredCategories.includes(cat.name);
              return (
                <button
                  type="button"
                  key={cat.name}
                  onClick={() => toggleCategory(cat.name)}
                  className={`p-2.5 rounded-xl border text-xs font-medium flex items-center justify-between transition-all cursor-pointer ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50/60 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 shadow-xs'
                      : 'border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                  }`}
                >
                  <span className="truncate">{cat.name}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0 ml-1" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. Weekly Theme Preference */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Weekly Theme Sync
          </label>
          <select
            value={prefs.preferredThemeId || 'auto'}
            onChange={(e) =>
              setPrefs({
                ...prefs,
                preferredThemeId: e.target.value === 'auto' ? undefined : e.target.value,
              })
            }
            className="w-full px-3.5 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="auto">Automatic (Follow Organization Scheduled Calendar Week)</option>
            {weeklyThemes.map((th) => (
              <option key={th.id} value={th.id}>
                Week {th.weekNumber}: {th.title} {th.isActive ? '(Current Active)' : ''}
              </option>
            ))}
          </select>
        </div>

        {/* 5, 6, 7, 8 Feature Toggles */}
        <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
          <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Automation & Delivery Settings
          </h4>

          {/* 5. Task Progress Motivation */}
          <label className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={prefs.taskProgressMotivation}
              onChange={(e) => setPrefs({ ...prefs, taskProgressMotivation: e.target.checked })}
              className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <div className="text-xs">
              <span className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-emerald-500" />
                <span>Task-Progress-Based Motivation</span>
              </span>
              <p className="text-slate-500 dark:text-slate-400 mt-0.5 text-[11px] leading-relaxed">
                Connect motivation to your verified task completions, sprint deliverables, and team milestones.
              </p>
            </div>
          </label>

          {/* 6. Campaign Participation */}
          <label className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={prefs.campaignParticipation}
              onChange={(e) => setPrefs({ ...prefs, campaignParticipation: e.target.checked })}
              className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <div className="text-xs">
              <span className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Megaphone className="w-3.5 h-3.5 text-indigo-500" />
                <span>Participate in Enterprise Motivation Campaigns</span>
              </span>
              <p className="text-slate-500 dark:text-slate-400 mt-0.5 text-[11px] leading-relaxed">
                Receive Administrator-scheduled strategic themes and sprint drives tailored to your role.
              </p>
            </div>
          </label>

          {/* 7 & 8. Refresh behaviors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <label className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={prefs.autoDailyRefresh}
                onChange={(e) => setPrefs({ ...prefs, autoDailyRefresh: e.target.checked })}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-xs text-slate-800 dark:text-slate-200 font-medium">
                Automatic Daily Selection
              </span>
            </label>

            <label className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={prefs.manualRefreshAllowed}
                onChange={(e) => setPrefs({ ...prefs, manualRefreshAllowed: e.target.checked })}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-xs text-slate-800 dark:text-slate-200 font-medium">
                Enable Manual Shuffle Button
              </span>
            </label>
          </div>
        </div>

        {/* 9 & 10. Direct Shortcuts to Favorites & History */}
        <div className="p-3.5 bg-blue-50/50 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/50 rounded-2xl flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-blue-900 dark:text-blue-200">
            <span className="font-semibold block">Quick Navigation</span>
            <span className="text-[11px] text-blue-700/80 dark:text-blue-300/80">Manage saved quotes or view your timeline</span>
          </div>

          <div className="flex items-center gap-2">
            {onOpenFavorites && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenFavorites();
                }}
                className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 text-xs font-semibold hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span>Favorites</span>
              </button>
            )}

            {onOpenHistory && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenHistory();
                }}
                className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 text-xs font-semibold hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
              >
                <History className="w-3.5 h-3.5" />
                <span>History</span>
              </button>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-medium inline-flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors cursor-pointer inline-flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Preferences</span>
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
