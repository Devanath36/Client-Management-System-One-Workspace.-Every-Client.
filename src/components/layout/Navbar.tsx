import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Shield, ArrowRight, Menu, X, Bell, Sparkles } from 'lucide-react';
import { ThemeToggle } from '../common/ThemeToggle';
import { NotificationCenter } from '../notifications/NotificationCenter';

export const Navbar: React.FC = () => {
  const { currentView, setCurrentView, currentUser, userNotifications } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const unreadCount = userNotifications.filter((n) => !n.read).length;

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About Us' },
    { id: 'objectives', label: 'Our Objectives' },
    { id: 'features', label: 'Features' },
    { id: 'how-it-works', label: 'How It Works' },
    { id: 'user-roles', label: 'User Roles' },
    { id: 'our-team', label: 'Our Team' },
    { id: 'faq', label: 'FAQ' },
    { id: 'privacy', label: 'Privacy Policy' },
    { id: 'terms', label: 'Terms & Conditions' },
  ];

  const handleNavClick = (sectionId: string) => {
    setMobileMenuOpen(false);
    if (currentView !== 'landing') {
      setCurrentView('landing');
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/85 dark:bg-slate-900/85 border-b border-slate-200/80 dark:border-slate-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        {/* Brand with Glowing Icon Container */}
        <button
          onClick={() => {
            setCurrentView('landing');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex items-center gap-2.5 text-left group shrink-0 cursor-pointer focus:outline-none"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-500 text-white flex items-center justify-center font-bold text-base shadow-sm shadow-blue-500/20 group-hover:scale-105 group-hover:shadow-blue-500/30 transition-all duration-300">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs sm:text-base font-bold tracking-tight text-slate-900 dark:text-white truncate max-w-[160px] sm:max-w-none group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              Client Management System
            </span>
            <span className="hidden sm:inline-block text-[10px] text-slate-400 font-medium tracking-wide">
              One Workspace. Every Client.
            </span>
          </div>
        </button>

        {/* Desktop Navigation Links */}
        <nav className="hidden xl:flex items-center gap-0.5 2xl:gap-1 text-xs font-medium text-slate-600 dark:text-slate-300">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => handleNavClick(link.id)}
              className="px-2 2xl:px-2.5 py-1.5 rounded-lg hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100/70 dark:hover:bg-slate-800/60 transition-colors whitespace-nowrap cursor-pointer"
            >
              {link.label}
            </button>
          ))}
        </nav>

        {/* Medium-to-Large Screens Primary Links */}
        <nav className="hidden lg:flex xl:hidden items-center gap-1 text-xs font-medium text-slate-600 dark:text-slate-300">
          {navLinks.slice(0, 7).map((link) => (
            <button
              key={link.id}
              onClick={() => handleNavClick(link.id)}
              className="px-2 py-1.5 rounded-lg hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100/70 dark:hover:bg-slate-800/60 transition-colors whitespace-nowrap cursor-pointer"
            >
              {link.label}
            </button>
          ))}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="text-blue-600 dark:text-blue-400 font-semibold px-2 py-1.5 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg whitespace-nowrap cursor-pointer"
          >
            More links...
          </button>
        </nav>

        {/* Action Controls & Theme Toggle */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Launch Three.js 3D Universe */}
          <button
            type="button"
            onClick={() => setCurrentView('3d-universe')}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-sky-600 dark:text-sky-300 hover:text-blue-700 dark:hover:text-white bg-sky-50 dark:bg-slate-900 border border-sky-200 dark:border-sky-500/30 hover:border-sky-400 rounded-xl transition-all cursor-pointer shadow-2xs"
            title="Launch Interactive 3D Command Universe"
          >
            <Sparkles className="w-3.5 h-3.5 text-sky-500" />
            <span>3D Universe</span>
          </button>

          <ThemeToggle />

          {/* Notifications Menu (when authenticated) */}
          {currentUser && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                aria-label="View notifications"
                title={unreadCount > 0 ? `${unreadCount} unread notifications` : 'Notification Center'}
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 min-w-[16px] h-[16px] px-1 flex items-center justify-center rounded-full bg-blue-600 text-white font-mono text-[9px] font-bold ring-2 ring-white dark:ring-slate-900 shadow-xs">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>

              <NotificationCenter
                isOpen={notificationsOpen}
                onClose={() => setNotificationsOpen(false)}
                onOpenTask={() => {
                  setNotificationsOpen(false);
                  setCurrentView('dashboard');
                }}
                onOpenProject={() => {
                  setNotificationsOpen(false);
                  setCurrentView('dashboard');
                }}
                onNavigateTab={() => {
                  setNotificationsOpen(false);
                  setCurrentView('dashboard');
                }}
              />
            </div>
          )}

          {currentUser ? (
            <button
              onClick={() => setCurrentView('dashboard')}
              className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl shadow-xs shadow-blue-600/20 hover:shadow-blue-600/30 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
            >
              <span>Workspace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={() => setCurrentView('login')}
              className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl shadow-xs shadow-blue-600/20 hover:shadow-blue-600/30 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
            >
              <span>Login</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="2xl:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Responsive Drawer for mobile and smaller screens */}
      {mobileMenuOpen && (
        <div className="2xl:hidden border-b border-slate-200/80 dark:border-slate-800/80 backdrop-blur-md bg-white/95 dark:bg-slate-900/95 px-4 pt-3 pb-5 space-y-2 shadow-lg">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => handleNavClick(link.id)}
              className="block w-full text-left py-2 px-3 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg hover:text-blue-600 transition-colors"
            >
              {link.label}
            </button>
          ))}

          {/* Mobile Theme Toggle & Actions */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between px-3 py-1 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Display Theme:</span>
              <ThemeToggle showLabel />
            </div>

            {currentUser && unreadCount > 0 && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setCurrentView('dashboard');
                }}
                className="w-full py-2 px-3 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 rounded-xl flex items-center justify-between"
              >
                <span>Deadline & Task Updates</span>
                <span className="px-2 py-0.5 rounded-full bg-blue-600 text-white font-mono text-[10px] font-bold">
                  {unreadCount} New
                </span>
              </button>
            )}

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setCurrentView(currentUser ? 'dashboard' : 'login');
              }}
              className="w-full py-2.5 text-center text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-xs"
            >
              {currentUser ? 'Go to Workspace' : 'Login / Sign In'}
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

