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
        <div className="p-4 rounded-2xl bg-[#F7F7F7] dark:bg-[#101010] border border-[#E0E0E0] dark:border-[#333333] flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#E50914]" />
              <span className="text-xs font-bold text-[#101010] dark:text-white uppercase tracking-wider">
                Enable Daily Motivation
              </span>
            </div>
            <p className="text-xs text-[#666666] dark:text-[#A3A3A3]">
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
            <div className="w-11 h-6 bg-[#D4D4D4] peer-focus:outline-none rounded-full peer dark:bg-[#333333] peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#E0E0E0] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#E50914]"></div>
          </label>
        </div>

        {/* 2. Preferred Language Selection */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-[#101010] dark:text-white uppercase tracking-wider">
            Preferred Language
          </label>
          <div className="grid grid-cols-3 gap-2.5">
            <button
              type="button"
              onClick={() => setPrefs({ ...prefs, language: 'en' })}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                prefs.language === 'en'
                  ? 'border-[#E50914] bg-[#E50914]/10 text-[#E50914] dark:text-white ring-2 ring-[#E50914]/20'
                  : 'border-[#E0E0E0] dark:border-[#333333] bg-white dark:bg-[#171717] text-[#333333] dark:text-[#D4D4D4] hover:border-[#A3A3A3]'
              }`}
            >
              <div className="text-xs font-bold">English Only</div>
              <div className="text-[11px] text-[#666666] dark:text-[#A3A3A3] mt-0.5">Author's original quote</div>
            </button>

            <button
              type="button"
              onClick={() => setPrefs({ ...prefs, language: 'ta' })}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                prefs.language === 'ta'
                  ? 'border-[#E50914] bg-[#E50914]/10 text-[#E50914] dark:text-white ring-2 ring-[#E50914]/20'
                  : 'border-[#E0E0E0] dark:border-[#333333] bg-white dark:bg-[#171717] text-[#333333] dark:text-[#D4D4D4] hover:border-[#A3A3A3]'
              }`}
            >
              <div className="text-xs font-bold">தமிழ் (Tamil Only)</div>
              <div className="text-[11px] text-[#666666] dark:text-[#A3A3A3] mt-0.5">தமிழ் ஆக்கங்கள் & மொழிபெயர்ப்பு</div>
            </button>

            <button
              type="button"
              onClick={() => setPrefs({ ...prefs, language: 'both' })}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                prefs.language === 'both'
                  ? 'border-[#E50914] bg-[#E50914]/10 text-[#E50914] dark:text-white ring-2 ring-[#E50914]/20'
                  : 'border-[#E0E0E0] dark:border-[#333333] bg-white dark:bg-[#171717] text-[#333333] dark:text-[#D4D4D4] hover:border-[#A3A3A3]'
              }`}
            >
              <div className="text-xs font-bold">Bilingual Toggle</div>
              <div className="text-[11px] text-[#666666] dark:text-[#A3A3A3] mt-0.5">English & Tamil switcher</div>
            </button>
          </div>
        </div>

        {/* 3. Role-Based Category Preferences */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-[#101010] dark:text-white uppercase tracking-wider">
              Preferred Categories ({currentUser?.role.replace('_', ' ').toUpperCase()})
            </label>
            <span className="text-[11px] text-[#666666] dark:text-[#A3A3A3]">
              {prefs.preferredCategories.length === 0
                ? 'All categories active'
                : `${prefs.preferredCategories.length} selected`}
            </span>
          </div>
          <p className="text-xs text-[#666666] dark:text-[#A3A3A3]">
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
                      ? 'border-[#E50914] bg-[#E50914]/10 text-[#E50914] dark:text-white shadow-xs'
                      : 'border-[#E0E0E0] dark:border-[#333333] bg-white dark:bg-[#171717] text-[#333333] dark:text-[#D4D4D4] hover:border-[#A3A3A3]'
                  }`}
                >
                  <span className="truncate">{cat.name}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-[#E50914] shrink-0 ml-1" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. Weekly Theme Preference */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-[#101010] dark:text-white uppercase tracking-wider">
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
            className="w-full px-3.5 py-2 text-xs bg-white dark:bg-[#171717] border border-[#E0E0E0] dark:border-[#333333] rounded-xl text-[#101010] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#E50914] cursor-pointer"
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
        <div className="space-y-3 pt-2 border-t border-[#E0E0E0] dark:border-[#333333]">
          <h4 className="text-xs font-bold text-[#101010] dark:text-white uppercase tracking-wider">
            Automation & Delivery Settings
          </h4>

          {/* 5. Task Progress Motivation */}
          <label className="flex items-start gap-3 p-3 rounded-xl bg-[#F7F7F7] dark:bg-[#101010] border border-[#E0E0E0] dark:border-[#333333] cursor-pointer">
            <input
              type="checkbox"
              checked={prefs.taskProgressMotivation}
              onChange={(e) => setPrefs({ ...prefs, taskProgressMotivation: e.target.checked })}
              className="mt-0.5 rounded border-[#E0E0E0] dark:border-[#333333] accent-[#E50914] focus:ring-[#E50914]"
            />
            <div className="text-xs">
              <span className="font-semibold text-[#101010] dark:text-white flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-[#FF7900]" />
                <span>Task-Progress-Based Motivation</span>
              </span>
              <p className="text-[#666666] dark:text-[#A3A3A3] mt-0.5 text-[11px] leading-relaxed">
                Connect motivation to your verified task completions, sprint deliverables, and team milestones.
              </p>
            </div>
          </label>

          {/* 6. Campaign Participation */}
          <label className="flex items-start gap-3 p-3 rounded-xl bg-[#F7F7F7] dark:bg-[#101010] border border-[#E0E0E0] dark:border-[#333333] cursor-pointer">
            <input
              type="checkbox"
              checked={prefs.campaignParticipation}
              onChange={(e) => setPrefs({ ...prefs, campaignParticipation: e.target.checked })}
              className="mt-0.5 rounded border-[#E0E0E0] dark:border-[#333333] accent-[#E50914] focus:ring-[#E50914]"
            />
            <div className="text-xs">
              <span className="font-semibold text-[#101010] dark:text-white flex items-center gap-1.5">
                <Megaphone className="w-3.5 h-3.5 text-[#E50914]" />
                <span>Participate in Enterprise Motivation Campaigns</span>
              </span>
              <p className="text-[#666666] dark:text-[#A3A3A3] mt-0.5 text-[11px] leading-relaxed">
                Receive Administrator-scheduled strategic themes and sprint drives tailored to your role.
              </p>
            </div>
          </label>

          {/* 7 & 8. Refresh behaviors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <label className="flex items-center gap-2.5 p-3 rounded-xl bg-[#F7F7F7] dark:bg-[#101010] border border-[#E0E0E0] dark:border-[#333333] cursor-pointer">
              <input
                type="checkbox"
                checked={prefs.autoDailyRefresh}
                onChange={(e) => setPrefs({ ...prefs, autoDailyRefresh: e.target.checked })}
                className="rounded border-[#E0E0E0] dark:border-[#333333] accent-[#E50914] focus:ring-[#E50914]"
              />
              <span className="text-xs text-[#333333] dark:text-[#D4D4D4] font-medium">
                Automatic Daily Selection
              </span>
            </label>

            <label className="flex items-center gap-2.5 p-3 rounded-xl bg-[#F7F7F7] dark:bg-[#101010] border border-[#E0E0E0] dark:border-[#333333] cursor-pointer">
              <input
                type="checkbox"
                checked={prefs.manualRefreshAllowed}
                onChange={(e) => setPrefs({ ...prefs, manualRefreshAllowed: e.target.checked })}
                className="rounded border-[#E0E0E0] dark:border-[#333333] accent-[#E50914] focus:ring-[#E50914]"
              />
              <span className="text-xs text-[#333333] dark:text-[#D4D4D4] font-medium">
                Enable Manual Shuffle Button
              </span>
            </label>
          </div>
        </div>

        {/* 9 & 10. Direct Shortcuts to Favorites & History */}
        <div className="p-3.5 bg-[#FFF5F5] dark:bg-[#101010] border border-[#E50914]/30 rounded-2xl flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-[#101010] dark:text-white">
            <span className="font-semibold block">Quick Navigation</span>
            <span className="text-[11px] text-[#666666] dark:text-[#A3A3A3]">Manage saved quotes or view your timeline</span>
          </div>

          <div className="flex items-center gap-2">
            {onOpenFavorites && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenFavorites();
                }}
                className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#171717] text-[#E50914] border border-[#E50914]/30 text-xs font-semibold hover:bg-[#FFF5F5] dark:hover:bg-[#202020] transition-colors inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Bookmark className="w-3.5 h-3.5 text-[#FF7900]" />
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
                className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#171717] text-[#E50914] border border-[#E50914]/30 text-xs font-semibold hover:bg-[#FFF5F5] dark:hover:bg-[#202020] transition-colors inline-flex items-center gap-1.5 cursor-pointer"
              >
                <History className="w-3.5 h-3.5 text-[#FF7900]" />
                <span>History</span>
              </button>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-3 border-t border-[#E0E0E0] dark:border-[#333333]">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="text-xs text-[#666666] dark:text-[#A3A3A3] hover:text-[#101010] dark:hover:text-white font-medium inline-flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-[#555555] dark:text-[#A3A3A3] hover:text-[#101010] dark:hover:text-white rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-[#E50914] hover:bg-[#b80710] rounded-xl shadow-xs transition-colors cursor-pointer inline-flex items-center gap-1.5"
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
