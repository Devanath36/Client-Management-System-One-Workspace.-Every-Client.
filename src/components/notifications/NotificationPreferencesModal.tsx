import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Bell,
  X,
  CheckCircle2,
  Clock,
  Briefcase,
  CheckSquare,
  FileCheck2,
  AlertTriangle,
  Radio,
} from 'lucide-react';

interface NotificationPreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DEFAULT_PREFERENCES: Record<string, boolean> = {
  projectAssigned: true,
  taskAssigned: true,
  deadlineApproaching: true,
  taskOverdue: true,
  taskCompleted: true,
  systemAnnouncements: true,
};

export const NotificationPreferencesModal: React.FC<NotificationPreferencesModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [preferences, setPreferences] = React.useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('cms_notification_preferences');
      return saved ? JSON.parse(saved) : DEFAULT_PREFERENCES;
    } catch {
      return DEFAULT_PREFERENCES;
    }
  });

  if (!isOpen) return null;

  const toggleOption = (key: string) => {
    setPreferences((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      localStorage.setItem('cms_notification_preferences', JSON.stringify(next));
      return next;
    });
  };

  const categories = [
    {
      key: 'projectAssigned' as const,
      title: 'New Project Assignments',
      desc: 'Receive alerts when manager assigns new projects to your portfolio.',
      icon: Briefcase,
    },
    {
      key: 'taskAssigned' as const,
      title: 'New Task Assignments',
      desc: 'Receive alerts when a new task or milestone is delegated to you.',
      icon: CheckSquare,
    },
    {
      key: 'deadlineApproaching' as const,
      title: 'Upcoming Deadline Warnings (< 48h)',
      desc: 'Proactive reminders when scheduled project or task deadlines approach.',
      icon: Clock,
    },
    {
      key: 'taskOverdue' as const,
      title: 'Overdue Task Alerts',
      desc: 'High-visibility alerts when tasks exceed their assigned completion deadline.',
      icon: AlertTriangle,
    },
    {
      key: 'taskCompleted' as const,
      title: 'Task Completion Confirmations',
      desc: 'Alerts when team members mark deliverables as complete.',
      icon: CheckCircle2,
    },
    {
      key: 'systemAnnouncements' as const,
      title: 'System Broadcasts & Announcements',
      desc: 'Organization-wide administrative alerts and workspace maintenance notices.',
      icon: Radio,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className="bg-white dark:bg-[#141414] w-full max-w-lg rounded-2xl border border-[#E0E0E0] dark:border-[#333333] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-[#E0E0E0] dark:border-[#333333] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#F7F7F7] dark:bg-[#171717] text-[#E50914] border border-[#E0E0E0] dark:border-[#333333] rounded-xl">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#101010] dark:text-white">
                Notification Preferences
              </h3>
              <p className="text-xs text-[#555555] dark:text-[#A3A3A3]">
                Configure which automated events generate notifications in your workspace.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#555555] dark:text-[#A3A3A3] hover:text-[#101010] dark:hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Options List */}
        <div className="p-5 max-h-[60vh] overflow-y-auto space-y-3 divide-y divide-[#E0E0E0] dark:divide-[#333333]">
          {categories.map((cat, idx) => {
            const Icon = cat.icon;
            const enabled = preferences[cat.key];
            return (
              <div
                key={cat.key}
                className={`flex items-start justify-between gap-4 pt-3 ${idx === 0 ? 'pt-0' : ''}`}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-[#F7F7F7] dark:bg-[#171717] text-[#101010] dark:text-white border border-[#E0E0E0] dark:border-[#333333] shrink-0 mt-0.5">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#101010] dark:text-white">
                      {cat.title}
                    </p>
                    <p className="text-[11px] text-[#555555] dark:text-[#A3A3A3] leading-snug">
                      {cat.desc}
                    </p>
                  </div>
                </div>

                {/* Toggle switch */}
                <button
                  type="button"
                  onClick={() => toggleOption(cat.key)}
                  className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#E50914] ${
                    enabled ? 'bg-[#E50914]' : 'bg-[#E0E0E0] dark:bg-[#262626]'
                  }`}
                  role="switch"
                  aria-checked={enabled}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      enabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#F7F7F7] dark:bg-[#101010] border-t border-[#E0E0E0] dark:border-[#333333] flex items-center justify-between">
          <span className="text-[11px] text-[#555555] dark:text-[#A3A3A3] font-medium">
            Changes are saved instantly to your profile.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-white bg-[#E50914] hover:bg-[#c40812] rounded-xl transition-colors cursor-pointer shadow-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
