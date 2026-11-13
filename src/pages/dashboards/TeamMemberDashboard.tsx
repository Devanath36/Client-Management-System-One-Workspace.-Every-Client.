import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Task, TaskStatus } from '../../types';
import {
  CheckSquare,
  Clock,
  Bell,
  Search,
  CheckCircle2,
  AlertCircle,
  Play,
  RotateCcw,
  Tag,
} from 'lucide-react';
import { TaskDetailsModal } from '../../components/modals/TaskDetailsModal';
import { MyWorkspaceView } from '../../components/workspace/MyWorkspaceView';
import { MeetingsManagementView } from '../../components/meetings/MeetingsManagementView';
import { ReportsAnalyticsView } from '../../components/reports/ReportsAnalyticsView';
import { ActivityLogsView } from '../../components/activity/ActivityLogsView';
import { NotificationSettingsView } from '../../components/settings/NotificationSettingsView';

interface TeamMemberDashboardProps {
  activeTab: string;
  onTabChange?: (tab: string) => void;
}

export const TeamMemberDashboard: React.FC<TeamMemberDashboardProps> = ({ activeTab, onTabChange }) => {
  const {
    currentUser,
    tasks,
    updateTaskStatus,
    notifications,
  } = useApp();

  const [detailsTask, setDetailsTask] = useState<Task | null>(null);

  // Filters
  const [taskSearch, setTaskSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Filter tasks assigned to current user
  const myTasks = tasks.filter(
    (t) => !currentUser || t.assigneeId === currentUser.id || currentUser.role === 'admin'
  );

  const filteredTasks = myTasks.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(taskSearch.toLowerCase()) ||
      (t.clientName || '').toLowerCase().includes(taskSearch.toLowerCase()) ||
      t.description.toLowerCase().includes(taskSearch.toLowerCase());
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Derived metrics
  const activeCount = myTasks.filter((t) => t.status !== 'Completed' && t.status !== 'Done').length;
  const inProgressCount = myTasks.filter((t) => t.status === 'In Progress').length;
  const completedCount = myTasks.filter((t) => t.status === 'Completed' || t.status === 'Done').length;
  const totalLogged = myTasks.reduce((sum, t) => sum + t.loggedHours, 0);

  return (
    <div className="space-y-6">
      {/* Universal My Workspace */}
      {activeTab === 'workspace' && (
        <MyWorkspaceView onNavigateTab={onTabChange} />
      )}

      {/* Meetings Management */}
      {activeTab === 'meetings' && (
        <MeetingsManagementView />
      )}

      {/* Reports & Analytics */}
      {activeTab === 'reports' && (
        <ReportsAnalyticsView />
      )}

      {/* Activity Logs */}
      {activeTab === 'activity-logs' && (
        <ActivityLogsView />
      )}

      {/* Notification Center & Settings */}
      {(activeTab === 'settings' || activeTab === 'notification-settings') && (
        <NotificationSettingsView />
      )}

      {/* Top Header Metric Strip (for team member workflow tabs) */}
      {activeTab !== 'workspace' &&
        activeTab !== 'meetings' &&
        activeTab !== 'reports' &&
        activeTab !== 'activity-logs' &&
        activeTab !== 'settings' &&
        activeTab !== 'notification-settings' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 bg-white dark:bg-[#141414] rounded-2xl border border-[#E0E0E0] dark:border-[#333333] shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#555555] dark:text-[#A3A3A3]">
                  Active Focus Tasks
                </span>
                <CheckSquare className="w-4 h-4 text-[#E50914]" />
              </div>
              <p className="text-2xl font-bold text-[#101010] dark:text-white mt-2 font-mono tabular-nums">
                {activeCount}
              </p>
              <p className="text-[11px] text-[#555555] dark:text-[#A3A3A3] mt-1">Pending & active queue</p>
            </div>

            <div className="p-5 bg-white dark:bg-[#141414] rounded-2xl border border-[#E0E0E0] dark:border-[#333333] shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#555555] dark:text-[#A3A3A3]">
                  Tasks In Progress
                </span>
                <Clock className="w-4 h-4 text-[#FF7900]" />
              </div>
              <p className="text-2xl font-bold text-[#FF7900] mt-2 font-mono tabular-nums">
                {inProgressCount}
              </p>
              <p className="text-[11px] text-[#555555] dark:text-[#A3A3A3] mt-1">Currently being worked on</p>
            </div>

            <div className="p-5 bg-white dark:bg-[#141414] rounded-2xl border border-[#E0E0E0] dark:border-[#333333] shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#555555] dark:text-[#A3A3A3]">
                  Completed Tasks
                </span>
                <CheckCircle2 className="w-4 h-4 text-[#FFC928]" />
              </div>
              <p className="text-2xl font-bold text-[#FFC928] mt-2 font-mono tabular-nums">
                {completedCount}
              </p>
              <p className="text-[11px] text-[#555555] dark:text-[#A3A3A3] mt-1">Finished deliverables</p>
            </div>

            <div className="p-5 bg-white dark:bg-[#141414] rounded-2xl border border-[#E0E0E0] dark:border-[#333333] shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#555555] dark:text-[#A3A3A3]">
                  Logged Time
                </span>
                <Clock className="w-4 h-4 text-[#FF7900]" />
              </div>
              <p className="text-2xl font-bold text-[#101010] dark:text-white mt-2 font-mono tabular-nums">
                {totalLogged} Hours
              </p>
              <p className="text-[11px] text-[#555555] dark:text-[#A3A3A3] mt-1">Recorded engineering time</p>
            </div>
          </div>
        )}

      {/* Tab: My Tasks */}
      {activeTab === 'my-tasks' && (
        <div className="bg-white dark:bg-[#141414] rounded-2xl border border-[#E0E0E0] dark:border-[#333333] p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-[#101010] dark:text-white">
                My Assigned Deliverable Tasks
              </h2>
              <p className="text-xs text-[#555555] dark:text-[#A3A3A3] mt-0.5">
                Execute client deliverables and update live operational task progress.
              </p>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-3.5 h-3.5 text-[#555555] dark:text-[#A3A3A3] absolute left-3 top-3" />
              <input
                type="text"
                value={taskSearch}
                onChange={(e) => setTaskSearch(e.target.value)}
                placeholder="Search assigned deliverables..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-[#F7F7F7] dark:bg-[#171717] border border-[#E0E0E0] dark:border-[#333333] rounded-lg text-[#101010] dark:text-white focus:outline-none focus:border-[#E50914]"
              />
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-[#555555] dark:text-[#A3A3A3]">Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-2.5 py-1.5 text-xs bg-[#F7F7F7] dark:bg-[#171717] border border-[#E0E0E0] dark:border-[#333333] rounded-lg text-[#101010] dark:text-white focus:outline-none focus:border-[#E50914]"
                >
                  <option value="all">All</option>
                  <option value="To Do">To Do</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>
          </div>

          {/* Tasks List */}
          <div className="space-y-3">
            {filteredTasks.length === 0 ? (
              <p className="text-center py-8 text-xs text-[#555555] dark:text-[#A3A3A3] border border-dashed border-[#E0E0E0] dark:border-[#333333] rounded-xl">
                No matching tasks found.
              </p>
            ) : (
              filteredTasks.map((t) => (
                <div
                  key={t.id}
                  className="p-5 border border-[#E0E0E0] dark:border-[#333333] rounded-xl hover:border-[#E50914] transition-colors bg-white dark:bg-[#171717] space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 text-xs text-[#555555] dark:text-[#A3A3A3] flex-wrap">
                        <span className="font-semibold text-[#E50914]">
                          {t.clientName}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="font-medium text-[#101010] dark:text-white">{t.projectTitle}</span>
                        {t.workComponent && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-[#F7F7F7] dark:bg-[#141414] text-[#101010] dark:text-white border border-[#E0E0E0] dark:border-[#333333]">
                            <Tag className="w-2.5 h-2.5" />
                            <span>{t.workComponent}</span>
                          </span>
                        )}
                      </div>
                      <h3 className="text-sm font-bold text-[#101010] dark:text-white mt-1">
                        {t.title}
                      </h3>
                      <p className="text-xs text-[#555555] dark:text-[#A3A3A3] mt-1 leading-relaxed">
                        {t.description}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="text-xs font-mono font-medium text-[#101010] dark:text-white tabular-nums">
                        Due: {t.deadline}
                      </p>
                    </div>
                  </div>

                  {/* Interactive Action Controls */}
                  <div className="pt-2 border-t border-[#E0E0E0] dark:border-[#333333] flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3 text-[#555555] dark:text-[#A3A3A3] font-mono text-[11px]">
                      <span>Status: <strong className="text-[#101010] dark:text-white font-medium">{t.status}</strong></span>
                      <span>·</span>
                      <span>Logged: {t.loggedHours}h</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setDetailsTask(t)}
                        className="px-3 py-1.5 text-[#555555] dark:text-[#A3A3A3] hover:text-[#101010] dark:hover:text-white font-medium cursor-pointer transition-colors"
                      >
                        Inspect Details
                      </button>

                      {t.status === 'To Do' && (
                        <button
                          onClick={() => updateTaskStatus(t.id, 'In Progress')}
                          className="px-3 py-1.5 text-xs font-semibold text-[#101010] dark:text-white bg-[#F0F0F0] dark:bg-[#202020] hover:bg-[#E50914] hover:text-white rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <Play className="w-3 h-3" />
                          <span>Start Work</span>
                        </button>
                      )}

                      {t.status === 'In Progress' && (
                        <button
                          onClick={() => updateTaskStatus(t.id, 'Completed')}
                          className="px-3.5 py-1.5 text-xs font-semibold text-[#101010] dark:text-white bg-[#F0F0F0] dark:bg-[#202020] hover:bg-[#FFC928] hover:text-[#101010] rounded-lg border border-[#E0E0E0] dark:border-[#333333] flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Mark Completed ✓</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab: Upcoming Deadlines */}
      {activeTab === 'deadlines' && (
        <div className="bg-white dark:bg-[#141414] rounded-2xl border border-[#E0E0E0] dark:border-[#333333] p-6 space-y-5">
          <div>
            <h2 className="text-lg font-bold text-[#101010] dark:text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#FF7900]" />
              <span>Upcoming Delivery Deadlines</span>
            </h2>
            <p className="text-xs text-[#555555] dark:text-[#A3A3A3] mt-0.5">
              Live progress and countdown timeline for all assigned deliverables.
            </p>
          </div>

          <div className="space-y-3">
            {myTasks.length === 0 ? (
              <p className="p-8 text-center text-xs text-[#555555] dark:text-[#A3A3A3] border border-dashed border-[#E0E0E0] dark:border-[#333333] rounded-xl">
                No active deadline tasks assigned.
              </p>
            ) : (
              myTasks.map((t) => {
                const today = new Date().toISOString().split('T')[0];
                const isOverdue = t.deadline < today && t.status !== 'Completed' && t.status !== 'Done';

                let displayStatus: 'In Progress' | 'Pending' | 'Completed' | 'Overdue' = 'Pending';
                if (t.status === 'Completed' || t.status === 'Done') {
                  displayStatus = 'Completed';
                } else if (isOverdue) {
                  displayStatus = 'Overdue';
                } else if (t.status === 'In Progress') {
                  displayStatus = 'In Progress';
                } else {
                  displayStatus = 'Pending';
                }

                const statusStyles = {
                  'Completed': 'bg-[#171717] text-[#FFC928] border-[#FFC928]/40',
                  'In Progress': 'bg-[#171717] text-[#FF7900] border-[#FF7900]/40',
                  'Overdue': 'bg-[#E50914]/15 text-[#E50914] border-[#E50914]/40',
                  'Pending': 'bg-[#F7F7F7] dark:bg-[#171717] text-[#555555] dark:text-[#A3A3A3] border-[#E0E0E0] dark:border-[#333333]',
                }[displayStatus];

                return (
                  <div
                    key={t.id}
                    onClick={() => setDetailsTask(t)}
                    className="p-4 border border-[#E0E0E0] dark:border-[#333333] rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs bg-[#F7F7F7] dark:bg-[#171717] hover:border-[#E50914] transition-colors cursor-pointer"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-[#E50914] font-semibold">{t.clientName}</span>
                        <span className="text-[#737373]">·</span>
                        <span className="text-[11px] text-[#555555] dark:text-[#A3A3A3] font-medium">{t.projectTitle}</span>
                      </div>
                      <p className="text-sm font-bold text-[#101010] dark:text-white mt-0.5">{t.title}</p>
                      <p className="text-[#555555] dark:text-[#A3A3A3] text-[11px]">
                        Assigned Specialist: <span className="font-semibold text-[#101010] dark:text-white">{t.assigneeName}</span>
                      </p>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${statusStyles}`}>
                        {displayStatus}
                      </span>
                      <div className="text-right">
                        <span className="font-mono text-xs font-semibold text-[#101010] dark:text-white block">
                          Deadline: {t.deadline}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Tab: Feedback & Notifications Log */}
      {activeTab === 'notifications-log' && (
        <div className="bg-white dark:bg-[#141414] rounded-2xl border border-[#E0E0E0] dark:border-[#333333] p-6 space-y-4">
          <div>
            <h2 className="text-lg font-bold text-[#101010] dark:text-white">
              Lead Remarks & Review Feedback
            </h2>
            <p className="text-xs text-[#555555] dark:text-[#A3A3A3] mt-0.5">
              Direct notifications regarding your deliverable tasks.
            </p>
          </div>

          <div className="divide-y divide-[#E0E0E0] dark:divide-[#333333]">
            {notifications.map((notif) => (
              <div key={notif.id} className="py-3 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-[#101010] dark:text-white">{notif.title}</p>
                  <span className="text-[10px] text-[#555555] dark:text-[#A3A3A3] font-mono">{notif.timestamp}</span>
                </div>
                <p className="text-[#555555] dark:text-[#A3A3A3] leading-relaxed">{notif.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      <TaskDetailsModal
        isOpen={Boolean(detailsTask)}
        onClose={() => setDetailsTask(null)}
        task={detailsTask}
      />
    </div>
  );
};
