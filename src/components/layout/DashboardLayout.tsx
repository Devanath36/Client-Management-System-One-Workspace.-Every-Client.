import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Shield,
  LayoutDashboard,
  Users,
  Briefcase,
  CheckSquare,
  BarChart3,
  Settings,
  Bell,
  LogOut,
  Search,
  ChevronDown,
  Menu,
  X,
  Clock,
  AlertTriangle,
  ExternalLink,
  Sparkles,
  Video,
  UserCheck,
} from 'lucide-react';

import { NotificationCenter } from '../notifications/NotificationCenter';
import { ThemeToggle } from '../common/ThemeToggle';
import { GlobalSearchModal } from '../search/GlobalSearchModal';
import { TaskDetailsModal } from '../modals/TaskDetailsModal';
import { ClientDetailsModal } from '../modals/ClientDetailsModal';
import { ScrollToTop } from '../common/ScrollToTop';
import { Task, Client } from '../../types';
import { useTabKeyboardShortcuts } from '../../hooks';

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  roleTitle?: string;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  activeTab,
  onTabChange,
}) => {
  const {
    currentUser,
    logout,
    userNotifications,
    canAccessTab,
    setCurrentView,
    tasks,
    projects,
    showToast,
  } = useApp();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [selectedTaskForModal, setSelectedTaskForModal] = useState<Task | null>(null);
  const [selectedClientForModal, setSelectedClientForModal] = useState<Client | null>(null);
  const mainContentRef = useRef<HTMLElement>(null);

  // Reset scroll to top when changing tabs
  useEffect(() => {
    if (mainContentRef.current) {
      mainContentRef.current.scrollTo({ top: 0, behavior: 'auto' });
    }
  }, [activeTab]);

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchModalOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!currentUser) return null;

  const unreadCount = userNotifications.filter((n) => !n.read).length;

  // Determine navigation items dynamically by user role
  const getNavItems = () => {
    switch (currentUser.role) {
      case 'admin':
        return [
          { id: 'workspace', label: 'My Workspace', icon: Sparkles },
          { id: 'overview', label: 'System Overview', icon: LayoutDashboard },
          { id: 'users', label: 'User Directory', icon: Users },
          { id: 'permissions', label: 'Role Permissions', icon: Shield },
          { id: 'team-profiles', label: 'Team Profile Management', icon: UserCheck },
          { id: 'motivation-admin', label: 'Motivation Control Center', icon: Sparkles },
          { id: 'meetings', label: 'Meetings Management', icon: Video },
          { id: 'reports', label: 'Reports & Analytics', icon: BarChart3 },
          { id: 'audit-logs', label: 'Audit Activity Logs', icon: Clock },
          { id: 'configuration', label: 'System Configuration', icon: Settings },
          { id: 'settings', label: 'Notification Settings', icon: Bell },
        ];
      case 'manager':
        return [
          { id: 'workspace', label: 'My Workspace', icon: Sparkles },
          { id: 'clients', label: 'Client Accounts', icon: Briefcase },
          { id: 'team', label: 'Team Allocation', icon: Users },
          { id: 'projects', label: 'Project Management', icon: LayoutDashboard },
          { id: 'tasks', label: 'Task Assignments', icon: CheckSquare },
          { id: 'meetings', label: 'Meetings Management', icon: Video },
          { id: 'reports', label: 'Reports & Analytics', icon: BarChart3 },
          { id: 'activity-logs', label: 'Activity Logs', icon: Clock },
          { id: 'deadline-alerts', label: 'Deadline & SLA Alerts', icon: AlertTriangle },
          { id: 'settings', label: 'Notification Settings', icon: Bell },
        ];
      case 'team_lead':
        return [
          { id: 'workspace', label: 'My Workspace', icon: Sparkles },
          { id: 'assigned-projects', label: 'Assigned Projects', icon: Briefcase },
          { id: 'team-overview', label: 'Team Members', icon: Users },
          { id: 'task-allocation', label: 'Task Management', icon: CheckSquare },
          { id: 'meetings', label: 'Meetings Management', icon: Video },
          { id: 'milestone-tracking', label: 'Milestone Progress', icon: BarChart3 },
          { id: 'activity-logs', label: 'Activity Logs', icon: Clock },
          { id: 'deadline-alerts', label: 'Deadline Alerts', icon: AlertTriangle },
          { id: 'settings', label: 'Notification Settings', icon: Bell },
        ];
      case 'team_member':
      default:
        return [
          { id: 'workspace', label: 'My Workspace', icon: Sparkles },
          { id: 'my-tasks', label: 'My Tasks', icon: CheckSquare },
          { id: 'deliverables', label: 'Deliverable Status', icon: LayoutDashboard },
          { id: 'meetings', label: 'Meetings Management', icon: Video },
          { id: 'my-analytics', label: 'Personal Reports', icon: BarChart3 },
          { id: 'activity-logs', label: 'Activity Logs', icon: Clock },
          { id: 'settings', label: 'Notification Settings', icon: Bell },
        ];
    }
  };

  const navItems = getNavItems();

  useTabKeyboardShortcuts({
    tabs: navItems.map((item) => ({ id: item.id, label: item.label })),
    activeTab,
    onTabChange,
    enabled: true,
    showFeedback: (label, shortcut) => {
      showToast('info', `Switched to ${label}`, `Shortcut ${shortcut} activated`);
    },
  });

  return (
    <div className="h-screen w-full bg-white dark:bg-[#101010] text-[#101010] dark:text-white flex overflow-hidden transition-colors">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex lg:flex-col w-64 h-screen sticky top-0 bg-white dark:bg-[#101010] border-r border-[#E0E0E0] dark:border-[#333333] shrink-0 select-none z-30 transition-colors">
        {/* Brand */}
        <div className="h-16 px-5 border-b border-[#E0E0E0] dark:border-[#333333] flex items-center justify-between">
          <button
            onClick={() => setCurrentView('landing')}
            className="flex items-center gap-2.5 text-left group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#E50914] to-[#FF7900] text-white flex items-center justify-center font-bold text-sm shadow-xs shadow-[#E50914]/30 group-hover:scale-105 transition-all">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-[#101010] dark:text-white leading-tight group-hover:text-[#E50914] transition-colors">
                Client Workspace
              </p>
              <p className="text-[10px] text-[#555555] dark:text-[#A3A3A3] font-mono">One Workspace. Every Client.</p>
            </div>
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const shortcutNum = index < 9 ? `${index + 1}` : index === 9 ? '0' : null;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                title={shortcutNum ? `${item.label} (Ctrl+${shortcutNum})` : item.label}
                className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap text-left cursor-pointer group ${
                  isActive
                    ? 'bg-[#E50914] text-white shadow-xs shadow-[#E50914]/40 font-bold'
                    : 'text-[#555555] dark:text-[#A3A3A3] hover:bg-[#F3F3F3] dark:hover:bg-[#1a1a1a] hover:text-[#101010] dark:hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-[#555555] dark:text-[#A3A3A3] group-hover:text-[#101010] dark:group-hover:text-white'}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                {shortcutNum && (
                  <kbd
                    className={`text-[9px] font-mono px-1.5 py-0.5 rounded border shrink-0 transition-colors ${
                      isActive
                        ? 'bg-[#c40812] text-white border-transparent'
                        : 'bg-[#F0F0F0] dark:bg-[#171717] text-[#555555] dark:text-[#A3A3A3] group-hover:text-[#101010] dark:group-hover:text-white border-[#E0E0E0] dark:border-[#333333]'
                    }`}
                  >
                    ⌘{shortcutNum}
                  </kbd>
                )}
              </button>
            );
          })}
        </nav>

        {/* Keyboard shortcut hint */}
        <div className="px-3.5 py-2 border-t border-[#E0E0E0] dark:border-[#333333] flex items-center justify-between text-[10px] text-[#555555] dark:text-[#A3A3A3]">
          <span className="flex items-center gap-1">
            <kbd className="px-1 py-0.5 font-mono text-[9px] bg-[#F0F0F0] dark:bg-[#171717] border border-[#E0E0E0] dark:border-[#333333] rounded text-[#555555] dark:text-[#A3A3A3]">⌘1-9</kbd>
            <span>Jump Tab</span>
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1 py-0.5 font-mono text-[9px] bg-[#F0F0F0] dark:bg-[#171717] border border-[#E0E0E0] dark:border-[#333333] rounded text-[#555555] dark:text-[#A3A3A3]">⌘⇄</kbd>
            <span>Cycle</span>
          </span>
        </div>

        {/* User Mini Profile */}
        <div className="p-3 border-t border-[#E0E0E0] dark:border-[#333333] flex items-center justify-between gap-2 bg-[#F9F9F9] dark:bg-[#141414] transition-colors">
          <div className="flex items-center gap-2.5 min-w-0">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              referrerPolicy="no-referrer"
              className="w-8 h-8 rounded-full object-cover shrink-0 border border-[#E0E0E0] dark:border-[#333333]"
            />
            <div className="truncate">
              <p className="text-xs font-semibold text-[#101010] dark:text-white truncate">
                {currentUser.name}
              </p>
              <p className="text-[10px] text-[#555555] dark:text-[#A3A3A3] truncate">{currentUser.title}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="text-[#555555] dark:text-[#A3A3A3] hover:text-[#E50914] p-1.5 rounded-xl hover:bg-[#EAEAEA] dark:hover:bg-[#1f1f1f] transition-colors cursor-pointer"
            title="Sign Out"
            aria-label="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden bg-[#F7F7F7] dark:bg-[#171717] transition-colors">
        {/* Top Header */}
        <header className="sticky top-0 z-20 h-16 bg-white/95 dark:bg-[#101010]/95 backdrop-blur-md border-b border-[#E0E0E0] dark:border-[#333333] px-4 sm:px-6 flex items-center justify-between gap-4 shrink-0 transition-colors shadow-2xs">
          {/* Left: Mobile Toggle + Breadcrumb */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-[#555555] dark:text-[#A3A3A3] hover:text-[#101010] dark:hover:text-white hover:bg-[#F0F0F0] dark:hover:bg-[#1f1f1f] rounded-xl cursor-pointer"
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumb Trail */}
            <div className="hidden sm:flex items-center gap-2 text-xs text-[#555555] dark:text-[#A3A3A3] whitespace-nowrap">
              <span>Workspace</span>
              <span className="text-[#CCCCCC] dark:text-[#333333]">/</span>
              <span className="text-[#E50914] dark:text-[#FFC928] capitalize font-bold">
                {activeTab.replace('-', ' ')}
              </span>
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Quick search input button with Ctrl+K badge */}
            <button
              onClick={() => setSearchModalOpen(true)}
              className="relative hidden md:flex items-center justify-between w-48 lg:w-64 pl-8 pr-2.5 py-1.5 text-xs bg-[#F0F0F0] dark:bg-[#171717] border border-[#E0E0E0] dark:border-[#333333] rounded-xl text-[#555555] dark:text-[#A3A3A3] hover:text-[#101010] dark:hover:text-white hover:border-[#E50914]/60 transition-all cursor-pointer text-left shadow-2xs"
            >
              <Search className="w-3.5 h-3.5 text-[#888888] absolute left-2.5 top-2.5" />
              <span className="truncate">Search workspace...</span>
              <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono font-medium text-[#555555] dark:text-[#A3A3A3] bg-white dark:bg-[#101010] border border-[#E0E0E0] dark:border-[#333333] rounded">
                ⌘K
              </kbd>
            </button>

            {/* Mobile search button */}
            <button
              onClick={() => setSearchModalOpen(true)}
              className="md:hidden p-2 text-[#555555] dark:text-[#A3A3A3] hover:text-[#101010] dark:hover:text-white rounded-xl hover:bg-[#F0F0F0] dark:hover:bg-[#1f1f1f] transition-colors cursor-pointer"
              aria-label="Search"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Landing page jump */}
            <button
              onClick={() => setCurrentView('landing')}
              className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-[#555555] dark:text-[#A3A3A3] hover:text-[#101010] dark:hover:text-white hover:bg-[#F0F0F0] dark:hover:bg-[#1f1f1f] rounded-xl transition-colors cursor-pointer"
              title="Visit Landing Page"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#888888]" />
              <span>Public Page</span>
            </button>

            {/* 3D Command Universe View */}
            <button
              onClick={() => setCurrentView('3d-universe')}
              className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-[#FF7900] dark:text-[#FFC928] hover:text-[#101010] dark:hover:text-white hover:bg-[#F0F0F0] dark:hover:bg-[#1f1f1f] border border-[#E0E0E0] dark:border-[#333333] rounded-xl transition-colors cursor-pointer"
              title="Launch Interactive 3D Command Universe"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#FF7900] dark:text-[#FFC928]" />
              <span>3D Universe</span>
            </button>

            {/* Notifications Menu */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative min-h-[44px] min-w-[44px] flex items-center justify-center text-[#555555] dark:text-[#A3A3A3] hover:text-[#101010] dark:hover:text-white rounded-xl hover:bg-[#F0F0F0] dark:hover:bg-[#1f1f1f] transition-colors cursor-pointer"
                aria-label="View notifications"
                title={unreadCount > 0 ? `${unreadCount} unread notifications` : 'Notification Center'}
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-[#E50914] text-white font-mono text-[10px] font-bold ring-2 ring-white dark:ring-[#101010] shadow-xs">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>

              <NotificationCenter
                isOpen={notificationsOpen}
                onClose={() => setNotificationsOpen(false)}
                onOpenTask={(taskId) => {
                  const t = tasks.find((x) => x.id === taskId);
                  if (t) setSelectedTaskForModal(t);
                }}
                onOpenProject={() => {
                  if (currentUser.role === 'manager') onTabChange('projects');
                  else if (currentUser.role === 'team_lead') onTabChange('assigned-projects');
                  else onTabChange('workspace');
                }}
                onNavigateTab={(tab) => onTabChange(tab)}
              />
            </div>

            {/* Dark / Light Toggle */}
            <ThemeToggle />

            {/* User Profile Pill */}
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-[#F0F0F0] dark:hover:bg-[#1f1f1f] transition-colors text-left cursor-pointer"
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  referrerPolicy="no-referrer"
                  className="w-7 h-7 rounded-full object-cover border border-[#E0E0E0] dark:border-[#333333] shrink-0"
                />
                <span className="hidden sm:block text-xs font-semibold text-[#101010] dark:text-white max-w-[110px] truncate">
                  {currentUser.name}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-[#555555] dark:text-[#A3A3A3]" />
              </button>

              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#141414] border border-[#E0E0E0] dark:border-[#333333] rounded-2xl shadow-xl py-2 z-50 text-[#101010] dark:text-white animate-in fade-in duration-150">
                  <div className="px-4 py-2 border-b border-[#E0E0E0] dark:border-[#333333]">
                    <p className="text-xs font-bold text-[#101010] dark:text-white truncate">
                      {currentUser.name}
                    </p>
                    <p className="text-[11px] text-[#555555] dark:text-[#A3A3A3] truncate">{currentUser.email || currentUser.loginId}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-[#E50914]/15 text-[#E50914] border border-[#E50914]/30">
                      {currentUser.role.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        onTabChange('settings');
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-[#555555] dark:text-[#A3A3A3] hover:text-[#101010] dark:hover:text-white hover:bg-[#F3F3F3] dark:hover:bg-[#1a1a1a] flex items-center gap-2 cursor-pointer"
                    >
                      <Settings className="w-3.5 h-3.5 text-[#888888]" />
                      <span>Preferences & Settings</span>
                    </button>
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        setCurrentView('landing');
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-[#555555] dark:text-[#A3A3A3] hover:text-[#101010] dark:hover:text-white hover:bg-[#F3F3F3] dark:hover:bg-[#1a1a1a] flex items-center gap-2 cursor-pointer"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-[#888888]" />
                      <span>Public Landing Page</span>
                    </button>
                  </div>

                  <div className="pt-1 border-t border-[#E0E0E0] dark:border-[#333333]">
                    <button
                      onClick={logout}
                      className="w-full text-left px-4 py-2 text-xs text-[#E50914] hover:bg-[#E50914]/10 flex items-center gap-2 cursor-pointer font-semibold"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Scrollable Viewport */}
        <main
          ref={mainContentRef}
          className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6"
        >
          <div className="max-w-7xl mx-auto space-y-6">
            {!canAccessTab(activeTab) ? (
              <div className="bg-white dark:bg-[#141414] border border-[#E0E0E0] dark:border-[#333333] rounded-2xl p-8 text-center space-y-4 shadow-sm">
                <div className="w-12 h-12 rounded-full bg-[#E50914]/15 border border-[#E50914]/40 flex items-center justify-center mx-auto text-[#E50914]">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#101010] dark:text-white">
                    Access Restricted by Security Policy
                  </h3>
                  <p className="text-xs text-[#555555] dark:text-[#A3A3A3] max-w-md mx-auto mt-1 leading-relaxed">
                    Your current role ({currentUser.role.toUpperCase()}) does not hold authorization to inspect or alter this module. Contact your System Administrator for elevated access credentials.
                  </p>
                </div>
                <div className="pt-2">
                  <button
                    onClick={() => onTabChange('workspace')}
                    className="px-4 py-2 text-xs font-bold text-white bg-[#E50914] hover:bg-[#c40812] rounded-xl shadow-xs cursor-pointer"
                  >
                    Return to Authorized Workspace
                  </button>
                </div>
              </div>
            ) : (
              children
            )}
          </div>
          {/* Unobtrusive Scroll-To-Top button for dashboard viewport */}
          <ScrollToTop targetRef={mainContentRef} />
        </main>
      </div>

      {/* Mobile Drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative w-72 bg-white dark:bg-[#101010] border-r border-[#E0E0E0] dark:border-[#333333] flex flex-col z-50 text-[#101010] dark:text-white shadow-2xl">
            <div className="h-16 px-5 border-b border-[#E0E0E0] dark:border-[#333333] flex items-center justify-between">
              <span className="text-sm font-bold text-[#101010] dark:text-white">
                Client Workspace
              </span>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1 text-[#555555] dark:text-[#A3A3A3] hover:text-[#101010] dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onTabChange(item.id);
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold ${
                      isActive
                        ? 'bg-[#E50914] text-white font-bold'
                        : 'text-[#555555] dark:text-[#A3A3A3] hover:bg-[#F3F3F3] dark:hover:bg-[#1a1a1a] hover:text-[#101010] dark:hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
            <div className="p-4 border-t border-[#E0E0E0] dark:border-[#333333]">
              <button
                onClick={logout}
                className="w-full py-2 px-3 text-xs font-bold text-[#E50914] hover:bg-[#E50914]/15 rounded-xl flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Search Modal */}
      <GlobalSearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        onSelectTask={(task) => setSelectedTaskForModal(task)}
        onSelectProject={() => {
          if (currentUser.role === 'manager') onTabChange('projects');
          else if (currentUser.role === 'team_lead') onTabChange('assigned-projects');
          else if (currentUser.role === 'team_member') onTabChange('my-tasks');
        }}
        onSelectClient={(client) => setSelectedClientForModal(client)}
      />

      {/* Task Details Modal from Search / Notification click */}
      {selectedTaskForModal && (
        <TaskDetailsModal
          task={selectedTaskForModal}
          isOpen={Boolean(selectedTaskForModal)}
          onClose={() => setSelectedTaskForModal(null)}
        />
      )}

      {/* Client Details Modal from Search */}
      {selectedClientForModal && (
        <ClientDetailsModal
          client={selectedClientForModal}
          projects={projects}
          isOpen={Boolean(selectedClientForModal)}
          onClose={() => setSelectedClientForModal(null)}
        />
      )}
    </div>
  );
};
