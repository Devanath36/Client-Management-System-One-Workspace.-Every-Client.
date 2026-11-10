import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import {
  Shield,
  LayoutDashboard,
  Users,
  Briefcase,
  CheckSquare,
  FileCheck2,
  BarChart3,
  Settings,
  Bell,
  Sun,
  Moon,
  LogOut,
  Search,
  ChevronDown,
  Menu,
  X,
  Clock,
  AlertTriangle,
  ArrowRight,
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
import { Task, Project, Client } from '../../types';
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
  roleTitle,
}) => {
  const {
    currentUser,
    logout,
    theme,
    toggleTheme,
    userNotifications,
    canAccessTab,
    setCurrentView,
    tasks,
    projects,
    clients,
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
          { id: 'task-distribution', label: 'Task Distribution', icon: CheckSquare },
          { id: 'team-progress', label: 'Team Availability', icon: Users },
          { id: 'status-monitoring', label: 'Status Kanban', icon: LayoutDashboard },
          { id: 'meetings', label: 'Meetings Management', icon: Video },
          { id: 'reports', label: 'Reports & Analytics', icon: BarChart3 },
          { id: 'activity-logs', label: 'Activity Logs', icon: Clock },
          { id: 'deadline-alerts', label: 'Milestone Alerts', icon: AlertTriangle },
          { id: 'settings', label: 'Notification Settings', icon: Bell },
        ];
      case 'team_member':
        return [
          { id: 'workspace', label: 'My Workspace', icon: Sparkles },
          { id: 'my-tasks', label: 'My Focus Tasks', icon: CheckSquare },
          { id: 'meetings', label: 'Meetings Management', icon: Video },
          { id: 'reports', label: 'Reports & Analytics', icon: BarChart3 },
          { id: 'deadlines', label: 'Upcoming Deadlines', icon: Clock },
          { id: 'activity-logs', label: 'Activity Logs', icon: Clock },
          { id: 'settings', label: 'Notification Settings', icon: Bell },
        ];
    }
  };

  const navItems = getNavItems();

  // Global keyboard shortcut hook for fast tab switching (Ctrl/Cmd + 1-9, Ctrl/Cmd + 0, Ctrl+Arrows)
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
    <div className="h-screen w-full bg-slate-50 dark:bg-slate-950 flex overflow-hidden transition-colors">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex lg:flex-col w-64 h-screen sticky top-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shrink-0 select-none z-30">
        {/* Brand */}
        <div className="h-16 px-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <button
            onClick={() => setCurrentView('landing')}
            className="flex items-center gap-2.5 text-left group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-xs shadow-blue-500/20 group-hover:scale-105 transition-all">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                Client Workspace
              </p>
              <p className="text-[10px] text-slate-400 font-mono">One Workspace. Every Client.</p>
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
                    ? 'bg-blue-600 text-white shadow-xs shadow-blue-600/30'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200'}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                {shortcutNum && (
                  <kbd
                    className={`text-[9px] font-mono px-1.5 py-0.5 rounded border shrink-0 transition-colors ${
                      isActive
                        ? 'bg-blue-700/80 text-blue-100 border-blue-400/40'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 border-slate-200 dark:border-slate-700'
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
        <div className="px-3.5 py-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
          <span className="flex items-center gap-1">
            <kbd className="px-1 py-0.5 font-mono text-[9px] bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-500">⌘1-9</kbd>
            <span>Jump Tab</span>
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1 py-0.5 font-mono text-[9px] bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-500">⌘⇄</kbd>
            <span>Cycle</span>
          </span>
        </div>

        {/* User Mini Profile */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              referrerPolicy="no-referrer"
              className="w-8 h-8 rounded-full object-cover shrink-0 border border-slate-300 dark:border-slate-700"
            />
            <div className="truncate">
              <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                {currentUser.name}
              </p>
              <p className="text-[10px] text-slate-400 truncate">{currentUser.title}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="text-slate-400 hover:text-rose-500 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Sign Out"
            aria-label="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Header */}
        <header className="sticky top-0 z-20 h-16 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between gap-4 shrink-0 transition-colors shadow-2xs">
          {/* Left: Mobile Toggle + Breadcrumb */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumb Trail */}
            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
              <span>Workspace</span>
              <span className="text-slate-300 dark:text-slate-700">/</span>
              <span className="text-blue-600 dark:text-blue-400 capitalize font-semibold">
                {activeTab.replace('-', ' ')}
              </span>
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Quick search input button with Ctrl+K badge */}
            <button
              onClick={() => setSearchModalOpen(true)}
              className="relative hidden md:flex items-center justify-between w-48 lg:w-64 pl-8 pr-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:border-blue-400 transition-all cursor-pointer text-left"
            >
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <span className="truncate">Search workspace...</span>
              <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono font-medium text-slate-500 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded">
                ⌘K
              </kbd>
            </button>

            {/* Mobile search button */}
            <button
              onClick={() => setSearchModalOpen(true)}
              className="md:hidden p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Search"
            >
              <Search className="w-4 h-4" />
            </button>



            {/* Landing page jump */}
            <button
              onClick={() => setCurrentView('landing')}
              className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              title="Visit Landing Page"
            >
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              <span>Public Page</span>
            </button>

            {/* 3D Command Universe View */}
            <button
              onClick={() => setCurrentView('3d-universe')}
              className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-sky-600 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-950/40 border border-sky-200 dark:border-sky-800/60 rounded-xl transition-colors cursor-pointer"
              title="Launch Interactive 3D Command Universe"
            >
              <Sparkles className="w-3.5 h-3.5 text-sky-500" />
              <span>3D Universe</span>
            </button>

            {/* Notifications Menu */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                aria-label="View notifications"
                title={unreadCount > 0 ? `${unreadCount} unread notifications` : 'Notification Center'}
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-blue-600 text-white font-mono text-[10px] font-bold ring-2 ring-white dark:ring-slate-900 shadow-xs">
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
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left cursor-pointer"
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  referrerPolicy="no-referrer"
                  className="w-7 h-7 rounded-full object-cover border border-slate-300 dark:border-slate-700 shrink-0"
                />
                <span className="hidden sm:block text-xs font-semibold text-slate-900 dark:text-white max-w-[110px] truncate">
                  {currentUser.name}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl py-2 z-50">
                  <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {currentUser.name}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">{currentUser.email}</p>
                  </div>
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        setCurrentView('landing');
                      }}
                      className="w-full px-4 py-2 text-xs text-left text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-between"
                    >
                      <span>Public Landing Page</span>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                    </button>
                  </div>
                  <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={logout}
                      className="w-full px-4 py-2 text-xs text-left text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-2 cursor-pointer"
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

        {/* Viewport Content */}
        <main
          ref={mainContentRef}
          id="dashboard-main-viewport"
          className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8 scroll-smooth relative focus:outline-none"
        >
          <div className="max-w-7xl mx-auto space-y-6">
            {!canAccessTab(activeTab) ? (
              <div className="p-8 bg-white dark:bg-slate-900 rounded-3xl border border-rose-200 dark:border-rose-900/60 shadow-sm text-center max-w-lg mx-auto space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
                  <Shield className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Access Restricted by Role Governance
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Your designated account role (<strong className="uppercase font-mono text-slate-800 dark:text-slate-200">{currentUser.role.replace('_', ' ')}</strong>) does not have privileges to view or manage this section.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => onTabChange('workspace')}
                    className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs cursor-pointer"
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
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col z-50">
            <div className="h-16 px-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <span className="text-sm font-bold text-slate-900 dark:text-white">
                Client Workspace
              </span>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
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
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
            <div className="p-4 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={logout}
                className="w-full py-2 px-3 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl flex items-center justify-center gap-2"
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
        onSelectProject={(project) => {
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
