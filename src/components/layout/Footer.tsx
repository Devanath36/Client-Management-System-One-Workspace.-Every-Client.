import React from 'react';
import { Shield, ArrowUpRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const Footer: React.FC = () => {
  const { setCurrentView } = useApp();

  const scrollTo = (id: string) => {
    setCurrentView('landing');
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const navLinks = [
    { label: 'Home', id: 'home' },
    { label: 'About Us', id: 'about' },
    { label: 'Our Objectives', id: 'objectives' },
    { label: 'Features', id: 'features' },
    { label: 'How It Works', id: 'how-it-works' },
    { label: 'User Roles', id: 'user-roles' },
    { label: 'Our Team', id: 'our-team' },
    { label: 'FAQ', id: 'faq' },
    { label: 'Privacy Policy', id: 'privacy' },
    { label: 'Terms & Conditions', id: 'terms' },
  ];

  return (
    <footer className="bg-[#F7F7F7] dark:bg-[#101010] text-[#555555] dark:text-[#A3A3A3] border-t border-[#E0E0E0] dark:border-[#333333] text-xs transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">
          {/* Brand info */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#E50914] to-[#FF7900] text-white flex items-center justify-center font-bold shadow-sm shadow-[#E50914]/30">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <span className="text-base font-bold text-[#101010] dark:text-white tracking-tight">
                Client Management System
              </span>
            </div>
            <p className="text-[#555555] dark:text-[#A3A3A3] text-xs sm:text-sm leading-relaxed max-w-md">
              The Client Management System is a web application designed to organize client information, manage teams, assign tasks, track project progress, and monitor work in one place.
            </p>
            <div className="pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-white dark:bg-[#171717] text-[#101010] dark:text-white border border-[#E0E0E0] dark:border-[#333333] shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF7900] dark:bg-[#FFC928]" />
                One Workspace. Every Client.
              </span>
            </div>
          </div>

          {/* Quick Navigation Links */}
          <div className="md:col-span-4">
            <h4 className="text-xs font-semibold text-[#101010] dark:text-white uppercase tracking-wider mb-3">
              Quick Links
            </h4>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => scrollTo(link.id)}
                  className="text-left text-[#555555] dark:text-[#A3A3A3] hover:text-[#101010] dark:hover:text-white transition-colors py-0.5 cursor-pointer"
                >
                  {link.label}
                </button>
              ))}
              <button
                onClick={() => setCurrentView('login')}
                className="text-left text-[#E50914] dark:text-[#FFC928] hover:text-[#FF7900] font-semibold py-0.5 inline-flex items-center gap-1 cursor-pointer"
              >
                Login
                <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Direct System Portal Access */}
          <div className="md:col-span-3 space-y-4">
            <h4 className="text-xs font-semibold text-[#101010] dark:text-white uppercase tracking-wider">
              System Access
            </h4>
            <p className="text-xs text-[#555555] dark:text-[#A3A3A3] leading-relaxed">
              Unified enterprise operations platform for clients, projects, task delegation, and verified milestone deliverables.
            </p>
            <div className="pt-1">
              <button
                onClick={() => setCurrentView('login')}
                className="w-full px-4 py-2.5 bg-[#E50914] hover:bg-[#c40812] text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-[#E50914]/25 inline-flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
              >
                Access System Login
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom copyright and legal links */}
        <div className="mt-10 pt-6 border-t border-[#E0E0E0] dark:border-[#333333] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#777777] dark:text-[#A3A3A3]">
          <p>© {new Date().getFullYear()} Client Management System. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <button
              onClick={() => scrollTo('privacy')}
              className="hover:text-[#101010] dark:hover:text-white transition-colors cursor-pointer"
            >
              Privacy Policy
            </button>
            <span className="text-[#CCCCCC] dark:text-[#333333]">·</span>
            <button
              onClick={() => scrollTo('terms')}
              className="hover:text-[#101010] dark:hover:text-white transition-colors cursor-pointer"
            >
              Terms & Conditions
            </button>
            <span className="text-[#CCCCCC] dark:text-[#333333]">·</span>
            <button
              onClick={() => setCurrentView('login')}
              className="hover:text-[#101010] dark:hover:text-white transition-colors cursor-pointer"
            >
              Login
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
