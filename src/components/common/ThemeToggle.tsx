import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '', showLabel = false }) => {
  const { theme, toggleTheme } = useApp();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`p-2 rounded-xl text-[#555555] dark:text-[#A3A3A3] hover:text-[#101010] dark:hover:text-white hover:bg-[#EAEAEA] dark:hover:bg-[#1f1f1f] transition-all cursor-pointer inline-flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-[#E50914]/40 ${className}`}
      aria-label={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      {theme === 'dark' ? (
        <Sun className="w-4 h-4 text-[#FFC928] hover:rotate-45 transition-transform shrink-0" />
      ) : (
        <Moon className="w-4 h-4 text-[#101010] hover:-rotate-12 transition-transform shrink-0" />
      )}
      {showLabel && (
        <span className="text-xs font-semibold text-[#101010] dark:text-white">
          {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
        </span>
      )}
    </button>
  );
};
