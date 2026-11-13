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
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/95 dark:bg-[#101010]/95 border-b border-[#E0E0E0] dark:border-[#333333] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        {/* Brand with Red/Orange Icon Container */}
        <button
          onClick={() => {
            setCurrentView('landing');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex items-center gap-2.5 text-left group shrink-0 cursor-pointer focus:outline-none"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#E50914] via-[#E50914] to-[#FF7900] text-white flex items-center justify-center font-bold text-base shadow-sm shadow-[#E50914]/25 group-hover:scale-105 transition-all duration-300">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs sm:text-base font-bold tracking-tight text-[#101010] dark:text-white truncate max-w-[160px] sm:max-w-none group-hover:text-[#E50914] transition-colors">
              Client Management System
            </span>
            <span className="hidden sm:inline-block text-[10px] text-[#555555] dark:text-[#A3A3A3] font-medium tracking-wide">
              One Workspace. Every Client.
            </span>
          </div>
        </button>

        {/* Desktop Navigation Links */}
        <nav className="hidden xl:flex items-center gap-0.5 2xl:gap-1 text-xs font-medium text-[#555555] dark:text-[#A3A3A3]">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => handleNavClick(link.id)}
              className="px-2 2xl:px-2.5 py-1.5 rounded-lg text-[#555555] dark:text-[#A3A3A3] hover:text-[#101010] dark:hover:text-white hover:bg-[#F0F0F0] dark:hover:bg-[#1f1f1f] transition-colors whitespace-nowrap cursor-pointer"
            >
              {link.label}
            </button>
          ))}
        </nav>

        {/* Medium-to-Large Screens Primary Links */}
        <nav className="hidden lg:flex xl:hidden items-center gap-1 text-xs font-medium text-[#555555] dark:text-[#A3A3A3]">
          {navLinks.slice(0, 7).map((link) => (
            <button
              key={link.id}
              onClick={() => handleNavClick(link.id)}
              className="px-2 py-1.5 rounded-lg text-[#555555] dark:text-[#A3A3A3] hover:text-[#101010] dark:hover:text-white hover:bg-[#F0F0F0] dark:hover:bg-[#1f1f1f] transition-colors whitespace-nowrap cursor-pointer"
            >
              {link.label}
            </button>
          ))}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="text-[#FF7900] dark:text-[#FFC928] font-semibold px-2 py-1.5 hover:bg-[#F0F0F0] dark:hover:bg-[#1f1f1f] rounded-lg whitespace-nowrap cursor-pointer"
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
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#FF7900] dark:text-[#FFC928] hover:text-[#101010] dark:hover:text-white bg-[#F7F7F7] dark:bg-[#171717] border border-[#E0E0E0] dark:border-[#333333] hover:border-[#FFC928] rounded-xl transition-all cursor-pointer shadow-2xs"
            title="Launch Interactive 3D Command Universe"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#FF7900] dark:text-[#FFC928]" />
            <span>3D Universe</span>
          </button>

          <ThemeToggle />

          {/* Notifications Menu (when authenticated) */}
          {currentUser && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative p-2 text-[#555555] dark:text-[#A3A3A3] hover:text-[#101010] dark:hover:text-white rounded-xl hover:bg-[#F0F0F0] dark:hover:bg-[#1f1f1f] transition-colors cursor-pointer"
                aria-label="View notifications"
                title={unreadCount > 0 ? `${unreadCount} unread notifications` : 'Notification Center'}
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 min-w-[16px] h-[16px] px-1 flex items-center justify-center rounded-full bg-[#E50914] text-white font-mono text-[9px] font-bold ring-2 ring-white dark:ring-[#101010] shadow-xs">
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
              className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-xs font-bold text-white bg-[#E50914] hover:bg-[#c40812] rounded-xl shadow-xs shadow-[#E50914]/30 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer active:scale-95"
            >
              <span>Workspace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={() => setCurrentView('login')}
              className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs font-bold text-white bg-[#E50914] hover:bg-[#c40812] rounded-xl shadow-xs shadow-[#E50914]/30 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer active:scale-95"
            >
              <span>Login</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="2xl:hidden p-2 text-[#555555] dark:text-[#A3A3A3] hover:text-[#101010] dark:hover:text-white hover:bg-[#F0F0F0] dark:hover:bg-[#1f1f1f] rounded-xl cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Responsive Drawer for mobile and smaller screens */}
      {mobileMenuOpen && (
        <div className="2xl:hidden border-b border-[#E0E0E0] dark:border-[#333333] backdrop-blur-md bg-white/98 dark:bg-[#101010]/98 px-4 pt-3 pb-5 space-y-2 shadow-xl">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => handleNavClick(link.id)}
              className="block w-full text-left py-2 px-3 text-xs font-medium text-[#555555] dark:text-[#A3A3A3] hover:text-[#101010] dark:hover:text-white hover:bg-[#F0F0F0] dark:hover:bg-[#1f1f1f] rounded-lg transition-colors"
            >
              {link.label}
            </button>
          ))}

          {/* Mobile Theme Toggle & Actions */}
          <div className="pt-3 border-t border-[#E0E0E0] dark:border-[#333333] space-y-2.5">
            <div className="flex items-center justify-between px-3 py-1.5 bg-[#F7F7F7] dark:bg-[#171717] rounded-xl border border-[#E0E0E0] dark:border-[#333333]">
              <span className="text-xs font-medium text-[#555555] dark:text-[#A3A3A3]">Display Theme:</span>
              <ThemeToggle showLabel />
            </div>

            {currentUser && unreadCount > 0 && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setCurrentView('dashboard');
                }}
                className="w-full py-2 px-3 text-xs font-semibold text-[#FF7900] dark:text-[#FFC928] bg-[#F7F7F7] dark:bg-[#171717] border border-[#E0E0E0] dark:border-[#333333] rounded-xl flex items-center justify-between"
              >
                <span>Deadline & Task Updates</span>
                <span className="px-2 py-0.5 rounded-full bg-[#E50914] text-white font-mono text-[10px] font-bold">
                  {unreadCount} New
                </span>
              </button>
            )}

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setCurrentView(currentUser ? 'dashboard' : 'login');
              }}
              className="w-full py-2.5 text-center text-xs font-bold text-white bg-[#E50914] hover:bg-[#c40812] rounded-xl shadow-xs"
            >
              {currentUser ? 'Go to Workspace' : 'Login / Sign In'}
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
