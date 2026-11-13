import React, { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

export type ThemeMode = 'light' | 'dark';

const THEME_STORAGE_KEY = 'cms_theme_preference';
const LEGACY_THEME_STORAGE_KEY = 'cms_theme';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

const getInitialTheme = (): ThemeMode => {
  if (typeof window === 'undefined') return 'dark';
  try {
    const saved =
      localStorage.getItem(THEME_STORAGE_KEY) ||
      localStorage.getItem(LEGACY_THEME_STORAGE_KEY);
    if (saved === 'light' || saved === 'dark') {
      return saved;
    }
    if (document.documentElement.classList.contains('dark')) {
      return 'dark';
    }
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      return 'light';
    }
  } catch {
    // Fallback to dark mode if storage access fails
  }
  return 'dark';
};

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  className = '',
  showLabel = false,
}) => {
  const [theme, setTheme] = useState<ThemeMode>(getInitialTheme);

  // Keep documentElement 'dark' class and localStorage synchronized
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
      localStorage.setItem(LEGACY_THEME_STORAGE_KEY, theme);
    } catch {
      // Ignore storage quota / security errors
    }
  }, [theme]);

  // Synchronize multiple ThemeToggle instances or cross-tab updates
  useEffect(() => {
    const handleThemeEvent = (e: Event) => {
      const customEvent = e as CustomEvent<ThemeMode>;
      if (customEvent.detail === 'light' || customEvent.detail === 'dark') {
        setTheme((prev) => (prev === customEvent.detail ? prev : customEvent.detail));
      }
    };

    const handleStorage = (e: StorageEvent) => {
      if (
        (e.key === THEME_STORAGE_KEY || e.key === LEGACY_THEME_STORAGE_KEY) &&
        (e.newValue === 'light' || e.newValue === 'dark')
      ) {
        setTheme(e.newValue);
      }
    };

    window.addEventListener('cms-theme-change', handleThemeEvent);
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener('cms-theme-change', handleThemeEvent);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  const handleToggle = () => {
    const nextTheme: ThemeMode = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);

    // Apply immediately to documentElement & persist in localStorage
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    try {
      localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
      localStorage.setItem(LEGACY_THEME_STORAGE_KEY, nextTheme);
    } catch {
      // Ignore storage errors
    }

    window.dispatchEvent(new CustomEvent<ThemeMode>('cms-theme-change', { detail: nextTheme }));
  };

  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-pressed={isDark}
      aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      className={`group inline-flex items-center justify-center gap-2 px-2.5 py-2 rounded-xl bg-[#F7F7F7] dark:bg-[#171717] border border-[#E0E0E0] dark:border-[#333333] hover:border-[#E50914] text-[#101010] dark:text-white transition-all cursor-pointer shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#E50914]/40 active:scale-95 ${className}`}
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-[#FFC928] group-hover:rotate-45 transition-transform duration-200 shrink-0" />
      ) : (
        <Moon className="w-4 h-4 text-[#FF7900] group-hover:-rotate-12 transition-transform duration-200 shrink-0" />
      )}
      {showLabel && (
        <span className="text-xs font-semibold text-[#101010] dark:text-white whitespace-nowrap">
          {isDark ? 'Light Mode' : 'Dark Mode'}
        </span>
      )}
    </button>
  );
};
