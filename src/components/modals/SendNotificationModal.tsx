import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useApp } from '../../context/AppContext';
import { NotificationType, UserRole } from '../../types';
import { Send, Bell, Users, User, ShieldAlert } from 'lucide-react';

interface SendNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SendNotificationModal: React.FC<SendNotificationModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { sendNotification, users } = useApp();

  const [recipientType, setRecipientType] = useState<'all' | 'role' | 'user'>('all');
  const [targetRole, setTargetRole] = useState<UserRole>('team_member');
  const [targetUserId, setTargetUserId] = useState<string>(users[0]?.id || '');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState<NotificationType>('system_broadcast');
  const [priority, setPriority] = useState<'normal' | 'high' | 'critical'>('normal');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!title.trim()) newErrors.title = 'Notification title is required';
    if (!message.trim()) newErrors.message = 'Notification message body is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    sendNotification({
      recipientType,
      targetRole: recipientType === 'role' ? targetRole : undefined,
      targetUserId: recipientType === 'user' ? targetUserId : undefined,
      title: title.trim(),
      message: message.trim(),
      type,
      priority,
    });

    setTitle('');
    setMessage('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Dispatch System Notification"
      description="Send operational announcements, task alerts, or SLA warnings to teams and users."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Recipient Target */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Recipient Target
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setRecipientType('all')}
              className={`p-2.5 rounded-xl border text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${
                recipientType === 'all'
                  ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200'
                  : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>All Workspace</span>
            </button>

            <button
              type="button"
              onClick={() => setRecipientType('role')}
              className={`p-2.5 rounded-xl border text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${
                recipientType === 'role'
                  ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200'
                  : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>By Role</span>
            </button>

            <button
              type="button"
              onClick={() => setRecipientType('user')}
              className={`p-2.5 rounded-xl border text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${
                recipientType === 'user'
                  ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200'
                  : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Specific User</span>
            </button>
          </div>
        </div>

        {/* Dynamic target select */}
        {recipientType === 'role' && (
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Select Target Role
            </label>
            <select
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value as UserRole)}
              className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
            >
              <option value="admin">Administrators</option>
              <option value="manager">Operations Managers</option>
              <option value="team_lead">Solutions Team Leads</option>
              <option value="team_member">Team Members</option>
            </select>
          </div>
        )}

        {recipientType === 'user' && (
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Select Target User
            </label>
            <select
              value={targetUserId}
              onChange={(e) => setTargetUserId(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
            >
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.title})
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Notification Category
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as NotificationType)}
              className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
            >
              <option value="system_broadcast">Organization Announcement</option>
              <option value="task_assigned">Task Assignment Update</option>
              <option value="deadline_approaching">Milestone Deadline Alert</option>
              <option value="client_update">Client Account Update</option>
              <option value="sla_alert">SLA Risk Warning</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Urgency Priority
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as 'normal' | 'high' | 'critical')}
              className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
            >
              <option value="normal">Normal Priority</option>
              <option value="high">High Priority</option>
              <option value="critical">Critical Urgent</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            Notification Title *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (errors.title) setErrors({ ...errors, title: '' });
            }}
            placeholder="e.g. Critical SLA Deadline Alert: SCADA Integration"
            className={`w-full px-3.5 py-2 text-xs sm:text-sm bg-white dark:bg-slate-800 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white ${
              errors.title ? 'border-rose-500' : 'border-slate-300 dark:border-slate-700'
            }`}
          />
          {errors.title && <p className="text-xs text-rose-500 mt-1">{errors.title}</p>}
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            Notification Message Body *
          </label>
          <textarea
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              if (errors.message) setErrors({ ...errors, message: '' });
            }}
            rows={3}
            placeholder="Type your message details or instructions for the recipient..."
            className={`w-full px-3.5 py-2 text-xs sm:text-sm bg-white dark:bg-slate-800 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white resize-none ${
              errors.message ? 'border-rose-500' : 'border-slate-300 dark:border-slate-700'
            }`}
          />
          {errors.message && <p className="text-xs text-rose-500 mt-1">{errors.message}</p>}
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Dispatch Notification</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
