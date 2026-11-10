import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  NotificationItem,
  NotificationType,
  NotificationCategory,
  NotificationPreferences,
} from '../../types';
import {
  Bell,
  CheckCircle2,
  Clock,
  Briefcase,
  CheckSquare,
  FileCheck2,
  AlertTriangle,
  Plus,
  Trash2,
  X,
  Settings,
  ArrowRight,
  Video,
  Shield,
  Check,
  RotateCcw,
  Sliders,
  Mail,
  Smartphone,
  Sparkles,
} from 'lucide-react';
import { SendNotificationModal } from '../modals/SendNotificationModal';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenTask?: (taskId: string) => void;
  onOpenProject?: (projectId: string) => void;
  onNavigateTab?: (tab: string) => void;
}

type FilterCategory = 'all' | 'unread' | 'project' | 'task' | 'meeting' | 'system';
type ViewMode = 'list' | 'preferences';

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  isOpen,
  onClose,
  onOpenTask,
  onOpenProject,
  onNavigateTab,
}) => {
  const {
    userNotifications,
    currentUser,
    markNotificationRead,
    markNotificationUnread,
    markAllNotificationsRead,
    deleteNotification,
    notificationPreferences,
    updateNotificationPreferences,
    showToast,
  } = useApp();

  const [activeFilter, setActiveFilter] = useState<FilterCategory>('all');
  const [activeMode, setActiveMode] = useState<ViewMode>('list');
  const [sendModalOpen, setSendModalOpen] = useState(false);

  // Local copy of preferences for editing within the Preferences section
  const [localPrefs, setLocalPrefs] = useState<NotificationPreferences>({
    ...notificationPreferences,
  });
  const [isDirty, setIsDirty] = useState(false);

  // Synchronize local preferences whenever global preferences change
  useEffect(() => {
    setLocalPrefs({ ...notificationPreferences });
    setIsDirty(false);
  }, [notificationPreferences, isOpen]);

  // Handle escape key to close modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Derive notification category if not explicitly set
  const resolveCategory = (n: NotificationItem): NotificationCategory => {
    if (n.category) return n.category;
    if (
      n.type.startsWith('project_') ||
      n.type === 'new_project_assigned' ||
      n.type === 'client_update' ||
      n.projectId
    ) {
      return 'project';
    }
    if (
      n.type.startsWith('task_') ||
      n.type === 'proof_review' ||
      n.type === 'assignment' ||
      n.taskId
    ) {
      return 'task';
    }
    if (n.type.startsWith('meeting_') || n.meetingId) {
      return 'meeting';
    }
    return 'system';
  };

  const filteredNotifs = userNotifications.filter((n) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'unread') return !n.read;
    const cat = resolveCategory(n);
    return cat === activeFilter;
  });

  const unreadCount = userNotifications.filter((n) => !n.read).length;
  const canSend = currentUser?.role === 'admin' || currentUser?.role === 'manager';

  const getTypeIcon = (type: NotificationType, cat: NotificationCategory) => {
    switch (cat) {
      case 'project':
        return <Briefcase className="w-4 h-4 text-sky-600 dark:text-sky-400" />;
      case 'task':
        if (type === 'task_completed' || type === 'task_proof_approved') {
          return <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
        }
        if (type === 'task_overdue' || type === 'task_deadline') {
          return <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400" />;
        }
        return <CheckSquare className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
      case 'meeting':
        return <Video className="w-4 h-4 text-purple-600 dark:text-purple-400" />;
      case 'system':
      default:
        if (type === 'security_alert') {
          return <Shield className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
        }
        return <Bell className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
    }
  };

  const getCategoryBadge = (cat: NotificationCategory) => {
    switch (cat) {
      case 'project':
        return 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300 border-sky-200 dark:border-sky-800';
      case 'task':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'meeting':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 border-purple-200 dark:border-purple-800';
      case 'system':
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  const handleNotificationClick = (notif: NotificationItem) => {
    if (!notif.read) {
      markNotificationRead(notif.id);
    }
    const cat = resolveCategory(notif);

    if (notif.taskId && onOpenTask) {
      onOpenTask(notif.taskId);
      onClose();
      return;
    }

    if (notif.projectId) {
      if (onOpenProject) {
        onOpenProject(notif.projectId);
      } else if (onNavigateTab) {
        if (currentUser?.role === 'manager') onNavigateTab('projects');
        else if (currentUser?.role === 'team_lead') onNavigateTab('assigned-projects');
        else onNavigateTab('workspace');
      }
      onClose();
      return;
    }

    if (cat === 'meeting' && onNavigateTab) {
      onNavigateTab('meetings');
      onClose();
      return;
    }

    if (cat === 'task' && onNavigateTab) {
      if (currentUser?.role === 'team_member') onNavigateTab('my-tasks');
      else if (currentUser?.role === 'team_lead') onNavigateTab('task-distribution');
      else if (currentUser?.role === 'manager') onNavigateTab('tasks');
      else onNavigateTab('workspace');
      onClose();
      return;
    }

    if (cat === 'project' && onNavigateTab) {
      if (currentUser?.role === 'manager') onNavigateTab('projects');
      else if (currentUser?.role === 'team_lead') onNavigateTab('assigned-projects');
      else onNavigateTab('workspace');
      onClose();
      return;
    }

    onClose();
  };

  // Preference Handlers
  const handleTogglePreference = (key: keyof NotificationPreferences) => {
    setLocalPrefs((prev) => {
      const updated = { ...prev, [key]: !prev[key] };
      setIsDirty(true);
      return updated;
    });
  };

  const handleSavePreferences = () => {
    updateNotificationPreferences(localPrefs);
    setIsDirty(false);
    showToast(
      'success',
      'Preferences Saved',
      'Workspace notification preferences have been saved.'
    );
  };

  const handleResetPreferences = () => {
    const defaults: NotificationPreferences = {
      allEnabled: true,
      projectNotifications: true,
      taskNotifications: true,
      deadlineReminders: true,
      meetingNotifications: true,
      systemAnnouncements: true,
      emailNotifications: true,
      pushNotifications: true,
    };
    setLocalPrefs(defaults);
    updateNotificationPreferences(defaults);
    setIsDirty(false);
    showToast('info', 'Preferences Reset', 'Restored default notification preferences.');
  };

  const filterTabs: { id: FilterCategory; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'unread', label: 'Unread' },
    { id: 'project', label: 'Projects' },
    { id: 'task', label: 'Tasks' },
    { id: 'meeting', label: 'Meetings' },
    { id: 'system', label: 'System' },
  ];

  const categoryToggles = [
    {
      key: 'projectNotifications' as const,
      title: 'Project Assignments & Milestones',
      description: 'Notifications when new projects are created, assigned, or reach milestones.',
      icon: Briefcase,
      color: 'text-sky-600 dark:text-sky-400',
      bg: 'bg-sky-50 dark:bg-sky-950/60',
    },
    {
      key: 'taskNotifications' as const,
      title: 'Task Distribution & Workflows',
      description: 'Alerts when tasks are allocated, updated, or marked completed.',
      icon: CheckSquare,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-950/60',
    },
    {
      key: 'deadlineReminders' as const,
      title: 'Deadline Reminders & Overdue Warnings',
      description: 'Automated 24h reminders, same-day notices, and overdue SLA breach alerts.',
      icon: AlertTriangle,
      color: 'text-rose-600 dark:text-rose-400',
      bg: 'bg-rose-50 dark:bg-rose-950/60',
    },
    {
      key: 'meetingNotifications' as const,
      title: 'Meeting Scheduling & Reschedule Alerts',
      description: 'Notices for client syncs, video call links, and rescheduling broadcasts.',
      icon: Video,
      color: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-50 dark:bg-purple-950/60',
    },
    {
      key: 'systemAnnouncements' as const,
      title: 'System & Security Announcements',
      description: 'Administrative alerts, role permissions, and platform notifications.',
      icon: Shield,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-950/60',
    },
  ];

  return (
    <>
      {/* ========================================================= */}
      {/* MODAL BACKDROP & CENTERING CONTAINER                      */}
      {/* ========================================================= */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-hidden"
        role="region"
        aria-label="Notification Center Overlay"
      >
        {/* Backdrop Overlay */}
        <div
          className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-xs transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />

        {/* Modal Window Container */}
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="notification-center-title"
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-2xl max-h-[calc(100dvh-32px)] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl flex flex-col min-h-0 overflow-hidden z-10 transition-all animate-in fade-in zoom-in-95 duration-150"
        >
          {/* ========================================================= */}
          {/* 1. HEADER (Completely visible, separate container)         */}
          {/* ========================================================= */}
          <div className="shrink-0 p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between gap-3 z-10">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2.5 bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 rounded-2xl shrink-0">
                <Bell className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2
                    id="notification-center-title"
                    className="text-base font-bold text-slate-900 dark:text-white truncate"
                  >
                    Notification Center
                  </h2>
                  {unreadCount > 0 ? (
                    <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-blue-600 text-white rounded-full shrink-0">
                      {unreadCount} new
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full shrink-0">
                      Up to date
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  Real-time workspace activity, milestones, and alerts
                </p>
              </div>
            </div>

            {/* Header Action Controls */}
            <div className="flex items-center gap-1.5 shrink-0">
              {canSend && (
                <button
                  type="button"
                  onClick={() => setSendModalOpen(true)}
                  className="min-h-[40px] px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
                  title="Dispatch organization announcement"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Dispatch</span>
                </button>
              )}

              {/* Mode Toggle: Settings / Preferences */}
              <button
                type="button"
                onClick={() => setActiveMode(activeMode === 'preferences' ? 'list' : 'preferences')}
                className={`min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl transition-colors cursor-pointer ${
                  activeMode === 'preferences'
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                    : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
                title={activeMode === 'preferences' ? 'Back to notifications' : 'Notification Preferences'}
                aria-label={activeMode === 'preferences' ? 'Back to notifications' : 'Notification Preferences'}
              >
                <Settings className="w-4 h-4" />
              </button>

              {/* Close Button */}
              <button
                type="button"
                onClick={onClose}
                className="min-h-[40px] min-w-[40px] flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title="Close notification center"
                aria-label="Close notification center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* ========================================================= */}
          {/* SUB-HEADER / MODE SELECTOR STRIP                          */}
          {/* ========================================================= */}
          <div className="shrink-0 px-4 py-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/40 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setActiveMode('list')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeMode === 'list'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-2xs border border-slate-200 dark:border-slate-700'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span>Alerts</span>
                {unreadCount > 0 && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full font-mono bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                    {unreadCount}
                  </span>
                )}
              </button>
              <button
                type="button"
                onClick={() => setActiveMode('preferences')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeMode === 'preferences'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-2xs border border-slate-200 dark:border-slate-700'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Preferences</span>
              </button>
            </div>

            {activeMode === 'list' && unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllNotificationsRead}
                className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline cursor-pointer flex items-center gap-1"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Mark All Read</span>
              </button>
            )}
          </div>

          {/* ========================================================= */}
          {/* 2. BODY (Scrolls independently, min-h-0, fits viewport)   */}
          {/* ========================================================= */}
          <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
            {activeMode === 'list' ? (
              <div>
                {/* Category Filter Tabs */}
                <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                  <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
                    {filterTabs.map((tab) => {
                      const isActive = activeFilter === tab.id;
                      let count = 0;
                      if (tab.id === 'all') count = userNotifications.length;
                      else if (tab.id === 'unread') count = unreadCount;
                      else count = userNotifications.filter((n) => resolveCategory(n) === tab.id).length;

                      return (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setActiveFilter(tab.id)}
                          className={`min-h-[32px] px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                            isActive
                              ? 'bg-blue-600 text-white shadow-2xs'
                              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                          }`}
                        >
                          <span>{tab.label}</span>
                          {count > 0 && (
                            <span
                              className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                                isActive
                                  ? 'bg-white/20 text-white'
                                  : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                              }`}
                            >
                              {count}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Notifications List */}
                <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {filteredNotifs.length === 0 ? (
                    <div className="p-10 text-center text-xs text-slate-400 space-y-2">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto flex items-center justify-center">
                        <CheckCircle2 className="w-6 h-6 text-slate-300 dark:text-slate-600" />
                      </div>
                      <p className="font-bold text-slate-700 dark:text-slate-300 text-sm">All caught up!</p>
                      <p className="max-w-xs mx-auto text-slate-500">
                        No notifications found in the <strong>{activeFilter}</strong> category. New dispatches will appear here instantly.
                      </p>
                    </div>
                  ) : (
                    filteredNotifs.map((notif) => {
                      const isUnread = !notif.read;
                      const cat = resolveCategory(notif);
                      const hasActionLink = Boolean(
                        notif.taskId || notif.projectId || notif.meetingId
                      );

                      return (
                        <div
                          key={notif.id}
                          onClick={() => handleNotificationClick(notif)}
                          className={`p-4 text-xs transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer space-y-2 relative ${
                            isUnread
                              ? 'bg-blue-50/50 dark:bg-blue-950/20 border-l-4 border-l-blue-600'
                              : 'border-l-4 border-l-transparent'
                          }`}
                        >
                          {/* Top line: Category badge, timestamp, and actions */}
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0 flex-wrap">
                              <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 shrink-0">
                                {getTypeIcon(notif.type, cat)}
                              </div>
                              <span
                                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border uppercase tracking-wider ${getCategoryBadge(
                                  cat
                                )}`}
                              >
                                {cat}
                              </span>
                            </div>

                            {/* Timestamp & Tool Actions */}
                            <div
                              className="flex items-center gap-1.5 shrink-0"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <span className="text-[11px] font-mono text-slate-400">
                                {notif.timestamp}
                              </span>

                              {/* Read / Unread toggle */}
                              <button
                                type="button"
                                onClick={() => {
                                  if (notif.read) {
                                    markNotificationUnread(notif.id);
                                  } else {
                                    markNotificationRead(notif.id);
                                  }
                                }}
                                className="min-h-[32px] min-w-[32px] flex items-center justify-center text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                                title={notif.read ? 'Mark as unread' : 'Mark as read'}
                                aria-label={notif.read ? 'Mark as unread' : 'Mark as read'}
                              >
                                {notif.read ? (
                                  <RotateCcw className="w-3.5 h-3.5" />
                                ) : (
                                  <Check className="w-3.5 h-3.5" />
                                )}
                              </button>

                              {/* Delete notification */}
                              <button
                                type="button"
                                onClick={() => deleteNotification(notif.id)}
                                className="min-h-[32px] min-w-[32px] flex items-center justify-center text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                                title="Delete notification"
                                aria-label="Delete notification"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Title & Message */}
                          <div>
                            <h4 className="font-bold text-slate-900 dark:text-white text-xs leading-snug">
                              {notif.title}
                            </h4>
                            <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed mt-1">
                              {notif.message}
                            </p>
                          </div>

                          {/* Footer Line: Sender and Action link */}
                          <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400">
                            <span>
                              Sender:{' '}
                              <strong className="font-medium text-slate-700 dark:text-slate-300">
                                {notif.senderName}
                              </strong>
                            </span>

                            {hasActionLink && (
                              <span className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 font-semibold hover:underline">
                                <span>View Details</span>
                                <ArrowRight className="w-3 h-3" />
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            ) : (
              /* ========================================================= */
              /* NOTIFICATION CENTER & PREFERENCES SECTION IN BODY         */
              /* ========================================================= */
              <div className="p-5 sm:p-6 space-y-6">
                {/* Heading positioned properly below the header with dedicated spacing */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 gap-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      Notification Center & Preferences
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Customize automated alerts, delivery channels, and category filters.
                    </p>
                  </div>
                  <span className="self-start sm:self-auto px-2.5 py-1 text-[10px] font-bold uppercase rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 shrink-0">
                    {currentUser?.role.replace('_', ' ').toUpperCase()} SETTINGS
                  </span>
                </div>

                {/* Master Switch */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                      <Bell className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">
                        All Notifications Master Switch
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {localPrefs.allEnabled
                          ? 'Active — Workspace alerts and notifications are enabled.'
                          : 'Muted — Non-critical alerts are paused.'}
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={localPrefs.allEnabled}
                      onChange={() => handleTogglePreference('allEnabled')}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                {/* Delivery Channels */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Delivery Channels
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Push / In-App */}
                    <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                          <Smartphone className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900 dark:text-white">In-App & Push</p>
                          <p className="text-[10px] text-slate-400">Real-time badges</p>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={localPrefs.pushNotifications}
                        onChange={() => handleTogglePreference('pushNotifications')}
                        className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                      />
                    </div>

                    {/* Email Notices */}
                    <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-400">
                          <Mail className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900 dark:text-white">Email Digest</p>
                          <p className="text-[10px] text-slate-400">Daily summary</p>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={localPrefs.emailNotifications}
                        onChange={() => handleTogglePreference('emailNotifications')}
                        className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                {/* Category Preferences */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Category Subscriptions
                  </h4>
                  <div className="space-y-2.5">
                    {categoryToggles.map((cat) => {
                      const Icon = cat.icon;
                      const isEnabled = localPrefs[cat.key];
                      return (
                        <div
                          key={cat.key}
                          className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-start justify-between gap-3"
                        >
                          <div className="flex items-start gap-3 min-w-0">
                            <div className={`p-2 rounded-xl ${cat.bg} ${cat.color} shrink-0 mt-0.5`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-slate-900 dark:text-white">
                                {cat.title}
                              </p>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed mt-0.5">
                                {cat.description}
                              </p>
                            </div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                            <input
                              type="checkbox"
                              checked={isEnabled}
                              onChange={() => handleTogglePreference(cat.key)}
                              className="sr-only peer"
                            />
                            <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Action Controls for Preferences */}
                <div className="pt-2 flex items-center justify-between gap-3 border-t border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={handleResetPreferences}
                    className="min-h-[40px] px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset Defaults</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveMode('list')}
                      className="min-h-[40px] px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSavePreferences}
                      className={`min-h-[40px] px-5 py-2 rounded-xl text-xs font-semibold text-white transition-all inline-flex items-center gap-1.5 cursor-pointer shadow-xs ${
                        isDirty
                          ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20'
                          : 'bg-blue-600 hover:bg-blue-700'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Save Preferences</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ========================================================= */}
          {/* 3. FOOTER (Fixed/Sticky bottom, separate container)       */}
          {/* ========================================================= */}
          <div className="shrink-0 p-3 sm:p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
            {activeMode === 'list' ? (
              <>
                <button
                  type="button"
                  onClick={() => setActiveMode('preferences')}
                  className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 font-medium inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>Customize alert preferences</span>
                </button>

                <span className="text-[11px] text-slate-400">
                  {userNotifications.length} items stored
                </span>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setActiveMode('list')}
                  className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 font-medium inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowRight className="w-3.5 h-3.5 rotate-180" />
                  <span>Return to Notifications List</span>
                </button>

                {onNavigateTab && (
                  <button
                    type="button"
                    onClick={() => {
                      onNavigateTab('settings');
                      onClose();
                    }}
                    className="text-blue-600 dark:text-blue-400 hover:underline text-[11px] font-medium cursor-pointer"
                  >
                    Open Full Settings View →
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Dispatch Announcement Modal */}
      <SendNotificationModal
        isOpen={sendModalOpen}
        onClose={() => setSendModalOpen(false)}
      />
    </>
  );
};
