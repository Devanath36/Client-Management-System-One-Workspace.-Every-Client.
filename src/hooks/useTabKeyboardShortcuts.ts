import { useEffect, useCallback } from 'react';

export interface ShortcutTabItem {
  id: string;
  label: string;
}

export interface UseTabKeyboardShortcutsOptions {
  tabs: ShortcutTabItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  enabled?: boolean;
  showFeedback?: (tabLabel: string, shortcut: string) => void;
}

/**
 * Global keyboard shortcut hook allowing users to quickly navigate dashboard tabs
 * e.g., Ctrl+1 for Workspace, Ctrl+2 for Projects, etc.
 * Also supports Cmd+1..9 on macOS and Ctrl+ArrowRight / Ctrl+ArrowLeft to cycle tabs.
 */
export const useTabKeyboardShortcuts = ({
  tabs,
  activeTab,
  onTabChange,
  enabled = true,
  showFeedback,
}: UseTabKeyboardShortcutsOptions) => {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!enabled || !tabs.length) return;

      const isModifier = e.ctrlKey || e.metaKey;
      if (!isModifier) return;

      // Avoid capturing when typing inside inputs unless explicitly modified with Ctrl/Cmd
      const target = e.target as HTMLElement | null;
      const isInput =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable);

      // Number keys 1-9 and 0
      const key = e.key;
      let targetIndex: number | null = null;

      if (key >= '1' && key <= '9') {
        targetIndex = parseInt(key, 10) - 1;
      } else if (key === '0') {
        targetIndex = 9; // 10th tab
      }

      if (targetIndex !== null && targetIndex < tabs.length) {
        e.preventDefault();
        e.stopPropagation();

        const targetTab = tabs[targetIndex];
        if (targetTab) {
          onTabChange(targetTab.id);
          if (showFeedback && targetTab.id !== activeTab) {
            showFeedback(targetTab.label, `Ctrl+${key}`);
          }
        }
        return;
      }

      // Next / Previous tab cycling with Ctrl+ArrowRight and Ctrl+ArrowLeft
      if (!isInput && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) {
        const currentIndex = tabs.findIndex((t) => t.id === activeTab);
        if (currentIndex !== -1) {
          e.preventDefault();
          e.stopPropagation();

          const nextIndex =
            e.key === 'ArrowRight'
              ? (currentIndex + 1) % tabs.length
              : (currentIndex - 1 + tabs.length) % tabs.length;

          const targetTab = tabs[nextIndex];
          if (targetTab) {
            onTabChange(targetTab.id);
            if (showFeedback) {
              showFeedback(targetTab.label, e.key === 'ArrowRight' ? 'Ctrl+→' : 'Ctrl+←');
            }
          }
        }
      }
    },
    [tabs, activeTab, onTabChange, enabled, showFeedback]
  );

  useEffect(() => {
    if (!enabled) return;

    window.addEventListener('keydown', handleKeyDown, true);
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [handleKeyDown, enabled]);
};
