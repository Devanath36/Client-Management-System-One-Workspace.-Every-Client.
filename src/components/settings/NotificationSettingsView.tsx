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
      color: 'text-[#E50914]',
      bg: 'bg-[#E50914]/10 border border-[#E50914]/25',
      events: ['New project assigned', 'Project status changed', 'Milestone updated', 'Project completed'],
    },
    {
      key: 'taskNotifications' as const,
      title: 'Task & Deliverable Alerts',
      description:
        'Notifications when tasks are assigned, reassigned, status updated, or marked complete.',
      icon: CheckSquare,
      color: 'text-[#FF7900]',
      bg: 'bg-[#FF7900]/10 border border-[#FF7900]/25',
      events: ['Task assigned / reassigned', 'Status updated', 'Task completed', 'Milestone achieved'],
    },
    {
      key: 'deadlineReminders' as const,
      title: 'Milestone & Deadline Reminders',
      description:
        'Proactive reminders when scheduled deadlines approach within 48 hours, SLA warnings, and overdue deliverable alerts.',
      icon: Clock,
      color: 'text-[#FFC928]',
      bg: 'bg-[#FFC928]/15 border border-[#FFC928]/30',
      events: ['48-hour deadline warning', 'Approaching SLA threshold', 'Escalated overdue alerts'],
    },
    {
      key: 'meetingNotifications' as const,
      title: 'Meeting Scheduling & Reschedule Alerts',
      description:
        'Notices for newly scheduled client syncs, platform links (Meet/Teams/Zoom), postponements with reason justification, and reminders.',
      icon: Video,
      color: 'text-[#FF7900]',
      bg: 'bg-[#FF7900]/10 border border-[#FF7900]/25',
      events: ['Meeting scheduled', 'Meeting postponed / rescheduled', 'Cancellation notices', '15-min reminder'],
    },
    {
      key: 'systemAnnouncements' as const,
      title: 'System & Security Announcements',
      description:
        'Organization-wide administrative alerts, role permission modifications, maintenance windows, and security audit confirmations.',
      icon: Shield,
      color: 'text-[#E50914]',
      bg: 'bg-[#E50914]/10 border border-[#E50914]/25',
      events: ['Role permission changes', 'System maintenance broadcast', 'Security audit alerts'],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 bg-white dark:bg-[#171717] rounded-3xl border border-[#E0E0E0] dark:border-[#333333] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#E50914] to-[#FF7900] text-white flex items-center justify-center shadow-md shadow-[#E50914]/20 shrink-0">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-[#101010] dark:text-white">
                Notification Center & Preferences
              </h1>
              <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-full bg-[#E50914]/10 text-[#E50914] border border-[#E50914]/30">
                {currentUser?.role.replace('_', ' ').toUpperCase()} SETTINGS
              </span>
            </div>
            <p className="text-xs text-[#666666] dark:text-[#A3A3A3] mt-0.5">
              Customize automated alerts, delivery channels, and category filters for your personal workspace account.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleReset}
            className="min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-semibold text-[#555555] dark:text-[#D4D4D4] bg-[#F5F5F5] dark:bg-[#202020] hover:bg-[#EBEBEB] dark:hover:bg-[#2a2a2a] border border-[#E0E0E0] dark:border-[#333333] transition-colors inline-flex items-center gap-1.5 cursor-pointer"
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
                ? 'bg-[#E50914] hover:bg-[#b80710] shadow-[#E50914]/20'
                : 'bg-[#A3A3A3] dark:bg-[#333333] cursor-not-allowed opacity-60'
            }`}
          >
            <Save className="w-4 h-4" />
            <span>Save Preferences</span>
          </button>
        </div>
      </div>

      {/* Settings Category Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E0E0E0] dark:border-[#333333] pb-2">
        <button
          type="button"
          onClick={() => setSettingsTab('notifications')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-2 ${
            settingsTab === 'notifications'
              ? 'bg-[#E50914] text-white shadow-xs'
              : 'text-[#555555] dark:text-[#A3A3A3] hover:bg-[#F5F5F5] dark:hover:bg-[#202020]'
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
              ? 'bg-[#E50914] text-white shadow-xs'
              : 'text-[#555555] dark:text-[#A3A3A3] hover:bg-[#F5F5F5] dark:hover:bg-[#202020]'
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
          <div className="p-5 bg-[#FFF5F5] dark:bg-[#171717] rounded-2xl border border-[#E50914]/30 flex items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-[#E50914] text-white shadow-xs shrink-0 mt-0.5">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-[#101010] dark:text-white">
                Master Notification Control
              </h2>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                  localPrefs.allEnabled
                    ? 'bg-[#FFC928]/15 text-[#FF7900] dark:text-[#FFC928] border border-[#FFC928]/40'
                    : 'bg-[#EBEBEB] dark:bg-[#202020] text-[#555555] dark:text-[#A3A3A3]'
                }`}
              >
                {localPrefs.allEnabled ? 'Active' : 'Muted'}
              </span>
            </div>
            <p className="text-xs text-[#555555] dark:text-[#D4D4D4] mt-0.5 max-w-2xl">
              Enable or disable all notifications system-wide. When paused, no non-critical alerts will be delivered to your Notification Bell or banner feeds.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => handleToggle('allEnabled')}
          className={`min-h-[44px] min-w-[56px] relative inline-flex items-center shrink-0 cursor-pointer rounded-full p-1 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#E50914] ${
            localPrefs.allEnabled ? 'bg-[#E50914]' : 'bg-[#D4D4D4] dark:bg-[#333333]'
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
        <div className="p-4 bg-[#FFC928]/10 rounded-2xl border border-[#FFC928]/40 flex items-center gap-3 text-xs text-[#101010] dark:text-[#FFC928]">
          <Info className="w-5 h-5 text-[#FF7900] dark:text-[#FFC928] shrink-0" />
          <span>
            <strong>Master Notifications are currently paused.</strong> Individual category settings will take effect once you re-enable Master Notifications. Critical security alerts will always remain visible.
          </span>
        </div>
      )}

      {/* Grid of Category Settings */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-[#101010] dark:text-white uppercase tracking-wider">
            Category-Specific Notification Filters
          </h2>
          <span className="text-xs text-[#666666] dark:text-[#A3A3A3]">
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
                    ? 'bg-white dark:bg-[#171717] border-[#E0E0E0] dark:border-[#333333] shadow-2xs'
                    : 'bg-[#F7F7F7] dark:bg-[#141414] border-[#E0E0E0] dark:border-[#2a2a2a] opacity-75'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className={`p-2.5 rounded-xl ${cat.bg} ${cat.color} shrink-0 mt-0.5`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-xs font-bold text-[#101010] dark:text-white leading-tight">
                        {cat.title}
                      </h3>
                      <p className="text-[11px] text-[#666666] dark:text-[#A3A3A3] mt-1 leading-relaxed">
                        {cat.description}
                      </p>
                    </div>
                  </div>

                  {/* Toggle button */}
                  <button
                    type="button"
                    onClick={() => handleToggle(cat.key)}
                    className={`min-h-[44px] min-w-[50px] relative inline-flex items-center shrink-0 cursor-pointer rounded-full p-1 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#E50914] ${
                      localPrefs[cat.key] ? 'bg-[#E50914]' : 'bg-[#D4D4D4] dark:bg-[#333333]'
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
                <div className="mt-3.5 pt-3 border-t border-[#E0E0E0] dark:border-[#2a2a2a] flex flex-wrap gap-1.5">
                  {cat.events.map((ev, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-md bg-[#F5F5F5] dark:bg-[#202020] text-[#555555] dark:text-[#A3A3A3]"
                    >
                      <span className="w-1 h-1 rounded-full bg-[#FF7900]" />
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
      <div className="p-6 bg-white dark:bg-[#171717] rounded-3xl border border-[#E0E0E0] dark:border-[#333333] shadow-xs space-y-4">
        <div>
          <h2 className="text-sm font-bold text-[#101010] dark:text-white">
            Delivery Channels & Multi-Platform Dispatch
          </h2>
          <p className="text-xs text-[#666666] dark:text-[#A3A3A3] mt-0.5">
            Choose where you receive real-time notifications when events are dispatched.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          {/* In-App */}
          <div className="p-4 rounded-2xl bg-[#F7F7F7] dark:bg-[#101010] border border-[#E0E0E0] dark:border-[#333333] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-[#E50914]/10 text-[#E50914]">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#101010] dark:text-white">In-App Header Bell</p>
                <p className="text-[10px] text-[#666666] dark:text-[#A3A3A3]">Live badge & drop-down</p>
              </div>
            </div>
            <span className="text-[10px] font-bold text-[#FFC928] uppercase">
              Always Active
            </span>
          </div>

          {/* Email */}
          <div className="p-4 rounded-2xl bg-[#F7F7F7] dark:bg-[#101010] border border-[#E0E0E0] dark:border-[#333333] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-[#FF7900]/10 text-[#FF7900]">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#101010] dark:text-white">Email Digest Alerts</p>
                <p className="text-[10px] text-[#666666] dark:text-[#A3A3A3]">{currentUser?.email || 'Corporate address'}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleToggle('emailNotifications')}
              className={`min-h-[44px] min-w-[50px] relative inline-flex items-center shrink-0 cursor-pointer rounded-full p-1 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#E50914] ${
                localPrefs.emailNotifications ? 'bg-[#E50914]' : 'bg-[#D4D4D4] dark:bg-[#333333]'
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
          <div className="p-4 rounded-2xl bg-[#F7F7F7] dark:bg-[#101010] border border-[#E0E0E0] dark:border-[#333333] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-[#FFC928]/15 text-[#FF7900] dark:text-[#FFC928]">
                <Smartphone className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#101010] dark:text-white">Push Notifications</p>
                <p className="text-[10px] text-[#666666] dark:text-[#A3A3A3]">Browser & mobile sync</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleToggle('pushNotifications')}
              className={`min-h-[44px] min-w-[50px] relative inline-flex items-center shrink-0 cursor-pointer rounded-full p-1 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#E50914] ${
                localPrefs.pushNotifications ? 'bg-[#E50914]' : 'bg-[#D4D4D4] dark:bg-[#333333]'
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
            <div className="fixed bottom-6 right-6 z-40 bg-white dark:bg-[#171717] p-4 rounded-2xl border border-[#E50914]/40 shadow-2xl flex items-center gap-4 animate-in slide-in-from-bottom-4 duration-200">
              <div className="flex items-center gap-2 text-xs font-medium text-[#333333] dark:text-[#D4D4D4]">
                <CheckCircle2 className="w-4 h-4 text-[#E50914]" />
                <span>You have unsaved preference changes</span>
              </div>
              <button
                type="button"
                onClick={handleSave}
                className="min-h-[44px] px-4 py-2 rounded-xl text-xs font-semibold text-white bg-[#E50914] hover:bg-[#b80710] shadow-xs transition-colors cursor-pointer inline-flex items-center gap-1.5"
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
