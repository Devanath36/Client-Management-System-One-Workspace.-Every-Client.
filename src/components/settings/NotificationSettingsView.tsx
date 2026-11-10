import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { NotificationPreferences } from '../../types';
import {
  Bell,
  CheckCircle2,
  Clock,
  Briefcase,
  CheckSquare,
  Video,
  Shield,
  Mail,
  Smartphone,
  Save,
  RotateCcw,
  Sparkles,
  Info,
} from 'lucide-react';
import { MotivationSettingsPanel } from './MotivationSettingsPanel';

export const NotificationSettingsView: React.FC = () => {
  const { currentUser, notificationPreferences, updateNotificationPreferences, showToast } = useApp();

  const [settingsTab, setSettingsTab] = useState<'notifications' | 'motivation'>('notifications');
  const [localPrefs, setLocalPrefs] = useState<NotificationPreferences>({ ...notificationPreferences });
  const [isDirty, setIsDirty] = useState(false);

  // Sync if context updates
  React.useEffect(() => {
    setLocalPrefs({ ...notificationPreferences });
    setIsDirty(false);
  }, [notificationPreferences]);

  const handleToggle = (key: keyof NotificationPreferences) => {
    setLocalPrefs((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      // If toggling allEnabled to true/false, affect the master state
      setIsDirty(true);
      return next;
    });
  };

  const handleSave = () => {
    updateNotificationPreferences(localPrefs);
    setIsDirty(false);
    showToast(
      'success',
      'Preferences Saved',
      'Your notification settings have been updated and persisted across sessions.'
    );
  };

  const handleReset = () => {
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
    showToast('info', 'Preferences Reset', 'All notification categories restored to default enabled status.');
  };

  const categories = [
    {
      key: 'projectNotifications' as const,
      title: 'Project & Initiative Notifications',
      description:
        'Alerts for new project assignments, milestone updates, status changes, and project completions.',
      icon: Briefcase,
      color: 'text-sky-600 dark:text-sky-400',
      bg: 'bg-sky-50 dark:bg-sky-950/60',
      events: ['New project assigned', 'Project status changed', 'Milestone updated', 'Project completed'],
    },
    {
      key: 'taskNotifications' as const,
      title: 'Task & Deliverable Alerts',
      description:
        'Notifications when tasks are assigned, reassigned, status updated, or marked complete.',
      icon: CheckSquare,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-950/60',
      events: ['Task assigned / reassigned', 'Status updated', 'Task completed', 'Milestone achieved'],
    },
    {
      key: 'deadlineReminders' as const,
      title: 'Milestone & Deadline Reminders',
      description:
        'Proactive reminders when scheduled deadlines approach within 48 hours, SLA warnings, and overdue deliverable alerts.',
      icon: Clock,
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-950/60',
      events: ['48-hour deadline warning', 'Approaching SLA threshold', 'Escalated overdue alerts'],
    },
    {
      key: 'meetingNotifications' as const,
      title: 'Meeting Scheduling & Reschedule Alerts',
      description:
        'Notices for newly scheduled client syncs, platform links (Meet/Teams/Zoom), postponements with reason justification, and reminders.',
      icon: Video,
      color: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-50 dark:bg-purple-950/60',
      events: ['Meeting scheduled', 'Meeting postponed / rescheduled', 'Cancellation notices', '15-min reminder'],
    },
    {
      key: 'systemAnnouncements' as const,
      title: 'System & Security Announcements',
      description:
        'Organization-wide administrative alerts, role permission modifications, maintenance windows, and security audit confirmations.',
      icon: Shield,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-950/60',
      events: ['Role permission changes', 'System maintenance broadcast', 'Security audit alerts'],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                Notification Center & Preferences
              </h1>
              <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                {currentUser?.role.replace('_', ' ').toUpperCase()} SETTINGS
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Customize automated alerts, delivery channels, and category filters for your personal workspace account.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleReset}
            className="min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
            title="Reset to default settings"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={!isDirty}
            className={`min-h-[44px] px-5 py-2 rounded-xl text-xs font-semibold text-white shadow-xs transition-all inline-flex items-center gap-2 cursor-pointer ${
              isDirty
                ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20'
                : 'bg-slate-400 dark:bg-slate-700 cursor-not-allowed opacity-60'
            }`}
          >
            <Save className="w-4 h-4" />
            <span>Save Preferences</span>
          </button>
        </div>
      </div>

      {/* Settings Category Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          type="button"
          onClick={() => setSettingsTab('notifications')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-2 ${
            settingsTab === 'notifications'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Notification Alert Policies</span>
        </button>

        <button
          type="button"
          onClick={() => setSettingsTab('motivation')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-2 ${
            settingsTab === 'motivation'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Daily Motivation Preferences</span>
        </button>
      </div>

      {settingsTab === 'motivation' ? (
        <MotivationSettingsPanel />
      ) : (
        <>
          {/* Master Toggle Card */}
          <div className="p-5 bg-gradient-to-r from-blue-50/70 via-indigo-50/50 to-slate-50 dark:from-blue-950/30 dark:via-indigo-950/20 dark:to-slate-900/40 rounded-2xl border border-blue-200/80 dark:border-blue-900/60 flex items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-blue-600 text-white shadow-xs shrink-0 mt-0.5">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Master Notification Control
              </h2>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                  localPrefs.allEnabled
                    ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                {localPrefs.allEnabled ? 'Active' : 'Muted'}
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 max-w-2xl">
              Enable or disable all notifications system-wide. When paused, no non-critical alerts will be delivered to your Notification Bell or banner feeds.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => handleToggle('allEnabled')}
          className={`min-h-[44px] min-w-[56px] relative inline-flex items-center shrink-0 cursor-pointer rounded-full p-1 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            localPrefs.allEnabled ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
          }`}
          aria-label="Toggle all notifications"
        >
          <span
            className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out ${
              localPrefs.allEnabled ? 'translate-x-6' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {/* Informational Banner */}
      {!localPrefs.allEnabled && (
        <div className="p-4 bg-amber-50 dark:bg-amber-950/40 rounded-2xl border border-amber-200 dark:border-amber-900/60 flex items-center gap-3 text-xs text-amber-800 dark:text-amber-200">
          <Info className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
          <span>
            <strong>Master Notifications are currently paused.</strong> Individual category settings will take effect once you re-enable Master Notifications. Critical security alerts will always remain visible.
          </span>
        </div>
      )}

      {/* Grid of Category Settings */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Category-Specific Notification Filters
          </h2>
          <span className="text-xs text-slate-400">
            {categories.filter((c) => localPrefs[c.key]).length} of {categories.length} categories enabled
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isEnabled = localPrefs.allEnabled && localPrefs[cat.key];

            return (
              <div
                key={cat.key}
                className={`p-5 rounded-2xl border transition-all ${
                  isEnabled
                    ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-2xs'
                    : 'bg-slate-50/70 dark:bg-slate-900/50 border-slate-200/60 dark:border-slate-800/60 opacity-75'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className={`p-2.5 rounded-xl ${cat.bg} ${cat.color} shrink-0 mt-0.5`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                        {cat.title}
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                        {cat.description}
                      </p>
                    </div>
                  </div>

                  {/* Toggle button */}
                  <button
                    type="button"
                    onClick={() => handleToggle(cat.key)}
                    className={`min-h-[44px] min-w-[50px] relative inline-flex items-center shrink-0 cursor-pointer rounded-full p-1 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      localPrefs[cat.key] ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                    aria-label={`Toggle ${cat.title}`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition duration-200 ease-in-out ${
                        localPrefs[cat.key] ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Sub-events tags */}
                <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap gap-1.5">
                  {cat.events.map((ev, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                    >
                      <span className="w-1 h-1 rounded-full bg-slate-400" />
                      <span>{ev}</span>
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Delivery Channels Card */}
      <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            Delivery Channels & Multi-Platform Dispatch
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Choose where you receive real-time notifications when events are dispatched.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          {/* In-App */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">In-App Header Bell</p>
                <p className="text-[10px] text-slate-500">Live badge & drop-down</p>
              </div>
            </div>
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">
              Always Active
            </span>
          </div>

          {/* Email */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">Email Digest Alerts</p>
                <p className="text-[10px] text-slate-500">{currentUser?.email || 'Corporate address'}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleToggle('emailNotifications')}
              className={`min-h-[44px] min-w-[50px] relative inline-flex items-center shrink-0 cursor-pointer rounded-full p-1 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                localPrefs.emailNotifications ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
              }`}
              aria-label="Toggle email notifications"
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition duration-200 ease-in-out ${
                  localPrefs.emailNotifications ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Push */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-600 dark:text-teal-400">
                <Smartphone className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">Push Notifications</p>
                <p className="text-[10px] text-slate-500">Browser & mobile sync</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleToggle('pushNotifications')}
              className={`min-h-[44px] min-w-[50px] relative inline-flex items-center shrink-0 cursor-pointer rounded-full p-1 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                localPrefs.pushNotifications ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
              }`}
              aria-label="Toggle push notifications"
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition duration-200 ease-in-out ${
                  localPrefs.pushNotifications ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

          {/* Save Button Bar */}
          {isDirty && (
            <div className="fixed bottom-6 right-6 z-40 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-blue-200 dark:border-blue-800 shadow-2xl flex items-center gap-4 animate-in slide-in-from-bottom-4 duration-200">
              <div className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>You have unsaved preference changes</span>
              </div>
              <button
                type="button"
                onClick={handleSave}
                className="min-h-[44px] px-4 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-xs transition-colors cursor-pointer inline-flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Now</span>
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
