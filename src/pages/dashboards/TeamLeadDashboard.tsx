import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Task, Project, TaskStatus } from '../../types';
import {
  Briefcase,
  CheckSquare,
  BarChart3,
  AlertTriangle,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  RotateCcw,
  ChevronRight,
  Tag,
  Layers,
  User,
  Calendar,
  Eye,
} from 'lucide-react';
import { AddTaskModal } from '../../components/modals/AddTaskModal';
import { TaskDetailsModal } from '../../components/modals/TaskDetailsModal';
import { MyWorkspaceView } from '../../components/workspace/MyWorkspaceView';
import { MeetingsManagementView } from '../../components/meetings/MeetingsManagementView';
import { ReportsAnalyticsView } from '../../components/reports/ReportsAnalyticsView';
import { ActivityLogsView } from '../../components/activity/ActivityLogsView';
import { NotificationSettingsView } from '../../components/settings/NotificationSettingsView';

interface TeamLeadDashboardProps {
  activeTab: string;
  onTabChange?: (tab: string) => void;
}

export const TeamLeadDashboard: React.FC<TeamLeadDashboardProps> = ({ activeTab, onTabChange }) => {
  const {
    currentUser,
    projects,
    tasks,
    users,
    updateTaskStatus,
  } = useApp();

  const [addTaskOpen, setAddTaskOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | undefined>(undefined);
  const [selectedWorkComponent, setSelectedWorkComponent] = useState<string | undefined>(undefined);
  const [detailsModalTask, setDetailsModalTask] = useState<Task | null>(null);

  // Filter projects assigned to this lead
  const myProjects = projects.filter(
    (p) => !currentUser || p.leadId === currentUser.id || currentUser.role === 'admin'
  );

  // Filter tasks belonging to these projects
  const myTasks = tasks.filter(
    (t) =>
      !currentUser ||
      t.leadId === currentUser.id ||
      myProjects.some((p) => p.id === t.projectId) ||
      currentUser.role === 'admin'
  );

  // Status lists for Kanban (clean stages)
  const todoTasks = myTasks.filter((t) => t.status === 'To Do');
  const inProgressTasks = myTasks.filter((t) => t.status === 'In Progress');
  const completedTasks = myTasks.filter((t) => t.status === 'Completed' || t.status === 'Done');

  // Metrics
  const totalTasksCount = myTasks.length;
  const completedTasksCount = completedTasks.length;
  const sprintProgress = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;
  const totalLoggedHours = myTasks.reduce((sum, t) => sum + t.loggedHours, 0);

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

      {/* Notification Center & Preferences */}
      {(activeTab === 'settings' || activeTab === 'notification-settings') && (
        <NotificationSettingsView />
      )}

      {/* Top Metric Strip (for team lead workflow tabs) */}
      {activeTab !== 'workspace' &&
        activeTab !== 'meetings' &&
        activeTab !== 'reports' &&
        activeTab !== 'activity-logs' &&
        activeTab !== 'settings' &&
        activeTab !== 'notification-settings' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Assigned Initiatives
                </span>
                <Briefcase className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2 font-mono tabular-nums">
                {myProjects.length}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">{currentUser?.title || 'Team Lead'}</p>
            </div>

            <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Tasks In Progress
                </span>
                <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-2 font-mono tabular-nums">
                {inProgressTasks.length}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                {inProgressTasks.length > 0 ? 'Currently active in development' : 'No tasks currently in progress'}
              </p>
            </div>

            <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Sprint Milestone Progress
                </span>
                <BarChart3 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2 font-mono tabular-nums">
                {sprintProgress}%
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                {completedTasksCount}/{totalTasksCount} Tasks Completed
              </p>
            </div>

            <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Logged Engineering Hours
                </span>
                <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2 font-mono tabular-nums">
                {totalLoggedHours}h
              </p>
              <p className="text-[11px] text-slate-500 mt-1">Total tracked engineering time</p>
            </div>
          </div>
        )}

      {/* Tab: Assigned Projects & Work Allocation */}
      {activeTab === 'assigned-projects' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-blue-600" />
                <span>Assigned Projects & Work Allocation</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Client initiatives assigned specifically to your lead account by Managers. Allocate architectural work components to team members.
              </p>
            </div>
            <button
              onClick={() => {
                setSelectedProjectId(myProjects[0]?.id);
                setAddTaskOpen(true);
              }}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Allocate Work Component</span>
            </button>
          </div>

          {myProjects.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center space-y-2">
              <Briefcase className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto" />
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                No Projects Assigned Yet
              </p>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                When a Manager (Manager 1, Manager 2, or Manager 3) assigns an initiative to your Team Lead account, it will appear here with full work component allocation tools.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {myProjects.map((p) => {
                const projectTasks = tasks.filter((t) => t.projectId === p.id);
                const completedTasks = projectTasks.filter((t) => t.status === 'Done' || t.status === 'Completed').length;
                const progressPercent = projectTasks.length > 0 ? Math.round((completedTasks / projectTasks.length) * 100) : p.progress;

                // Distinct Manager Badge
                const managerBadgeStyle = p.managerName?.includes('1')
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                  : p.managerName?.includes('2')
                  ? 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800'
                  : p.managerName?.includes('3')
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                  : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';

                return (
                  <div
                    key={p.id}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-5 shadow-xs"
                  >
                    {/* Top Row: Client, Title, Assigning Manager, and Status */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                            {p.clientName}
                          </span>
                          {p.companyName && (
                            <>
                              <span className="text-slate-300 dark:text-slate-600">·</span>
                              <span className="text-xs text-slate-500 font-medium">
                                {p.companyName}
                              </span>
                            </>
                          )}

                          {/* Prominent Assigning Manager Badge */}
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-[11px] font-semibold border ${managerBadgeStyle}`}>
                            <Briefcase className="w-3 h-3 shrink-0" />
                            <span>Assigned by: {p.managerName || 'Manager 1'}</span>
                          </span>
                        </div>

                        <h3 className="text-base font-bold text-slate-900 dark:text-white">
                          {p.purpose}
                        </h3>
                        {p.description && (
                          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            {p.description}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${
                            p.status === 'Done' || p.status === 'Completed' || progressPercent === 100
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                              : p.status === 'In Progress' || progressPercent > 0
                              ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                              : 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                          }`}
                        >
                          {progressPercent === 100 ? 'Done' : p.status}
                        </span>
                      </div>
                    </div>

                    {/* Timeline & Progress Indicator */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                      <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-1">
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                          Project Timeline
                        </span>
                        <p className="font-mono text-slate-800 dark:text-slate-200">
                          {p.startDate} → {p.deadline}
                        </p>
                        <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400">
                          {p.duration || 'N/A'} Days Duration
                        </p>
                      </div>

                      <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-1 sm:col-span-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                            Overall Task Completion
                          </span>
                          <span className="font-mono font-bold text-slate-900 dark:text-white">
                            {progressPercent}% ({completedTasks}/{projectTasks.length} Done)
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden mt-1.5">
                          <div
                            className="bg-blue-600 h-full rounded-full transition-all"
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Multi-Component Work Allocation Section */}
                    <div className="pt-2 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Layers className="w-4 h-4 text-indigo-600" />
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                            Work Components & Task Allocations ({projectTasks.length})
                          </h4>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedProjectId(p.id);
                            setAddTaskOpen(true);
                          }}
                          className="px-3 py-1 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Allocate Component Task</span>
                        </button>
                      </div>

                      {projectTasks.length === 0 ? (
                        <div className="p-6 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-center space-y-2">
                          <Layers className="w-6 h-6 text-slate-300 dark:text-slate-600 mx-auto" />
                          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                            No work components allocated yet
                          </p>
                          <p className="text-[11px] text-slate-500">
                            Allocate Frontend, Backend, Database, UI/UX, Testing, or Documentation tasks to registered team members.
                          </p>
                          <button
                            onClick={() => {
                              setSelectedProjectId(p.id);
                              setAddTaskOpen(true);
                            }}
                            className="mt-2 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Allocate First Component Task</span>
                          </button>
                        </div>
                      ) : (
                        <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800">
                              <tr>
                                <th className="py-2.5 px-3">Work Component</th>
                                <th className="py-2.5 px-3">Task Deliverable</th>
                                <th className="py-2.5 px-3">Assigned Specialist</th>
                                <th className="py-2.5 px-3">Due Date</th>
                                <th className="py-2.5 px-3">Status</th>
                                <th className="py-2.5 px-3 text-right">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                              {projectTasks.map((t) => {
                                return (
                                  <tr key={t.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                                    <td className="py-2.5 px-3 whitespace-nowrap">
                                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 flex items-center gap-1 w-fit">
                                        <Tag className="w-2.5 h-2.5" />
                                        <span>{t.workComponent || 'General Delivery'}</span>
                                      </span>
                                    </td>
                                    <td className="py-2.5 px-3 max-w-xs">
                                      <p className="font-bold text-slate-900 dark:text-white truncate">
                                        {t.title}
                                      </p>
                                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                                        {t.description}
                                      </p>
                                    </td>
                                    <td className="py-2.5 px-3 whitespace-nowrap font-medium text-slate-800 dark:text-slate-200">
                                      {t.assigneeName}
                                    </td>
                                    <td className="py-2.5 px-3 whitespace-nowrap font-mono text-[11px] text-slate-600 dark:text-slate-400">
                                      {t.deadline}
                                    </td>
                                    <td className="py-2.5 px-3 whitespace-nowrap">
                                      <span
                                        className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                          t.status === 'Done' || t.status === 'Completed'
                                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                                            : t.status === 'In Progress'
                                            ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400'
                                            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                                        }`}
                                      >
                                        {t.status}
                                      </span>
                                    </td>
                                    <td className="py-2.5 px-3 text-right whitespace-nowrap space-x-1">
                                      <button
                                        onClick={() => setDetailsModalTask(t)}
                                        className="px-2.5 py-1 text-[11px] font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
                                      >
                                        Inspect Details
                                      </button>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab: Task Status Monitoring (Kanban / Segmented View) */}
      {activeTab === 'status-monitoring' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Task Status Kanban Board
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Real-time delivery progress across To Do, In Progress, and Completed stages.
              </p>
            </div>
            <button
              onClick={() => setAddTaskOpen(true)}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Task</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Column 1: To Do / Pending */}
            <div className="bg-slate-100/70 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  To Do / Pending ({todoTasks.length})
                </span>
                <span className="w-2 h-2 rounded-full bg-slate-400" />
              </div>
              <div className="space-y-2.5">
                {todoTasks.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => setDetailsModalTask(t)}
                    className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs cursor-pointer hover:border-blue-400 transition-colors space-y-2"
                  >
                    <span className="text-[10px] text-slate-400 font-medium block truncate">
                      {t.clientName}
                    </span>
                    <p className="text-xs font-bold text-slate-900 dark:text-white leading-snug">
                      {t.title}
                    </p>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                      <span>{t.assigneeName.split(' ')[0]}</span>
                      <span className="font-mono text-slate-500">Due: {t.deadline}</span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        updateTaskStatus(t.id, 'In Progress');
                      }}
                      className="w-full mt-1 py-1 text-[11px] font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 rounded hover:bg-blue-100 text-center cursor-pointer"
                    >
                      Start Task →
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Column 2: In Progress */}
            <div className="bg-slate-100/70 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  In Progress ({inProgressTasks.length})
                </span>
                <span className="w-2 h-2 rounded-full bg-blue-500" />
              </div>
              <div className="space-y-2.5">
                {inProgressTasks.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => setDetailsModalTask(t)}
                    className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs cursor-pointer hover:border-blue-400 transition-colors space-y-2"
                  >
                    <span className="text-[10px] text-slate-400 font-medium block truncate">
                      {t.clientName}
                    </span>
                    <p className="text-xs font-bold text-slate-900 dark:text-white leading-snug">
                      {t.title}
                    </p>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                      <span>{t.assigneeName.split(' ')[0]}</span>
                      <span className="font-mono">{t.deadline}</span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        updateTaskStatus(t.id, 'Completed');
                      }}
                      className="w-full mt-1 py-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 rounded hover:bg-emerald-100 text-center cursor-pointer"
                    >
                      Mark Completed ✓
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Column 3: Completed */}
            <div className="bg-slate-100/70 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Completed ({completedTasks.length})
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
              </div>
              <div className="space-y-2.5">
                {completedTasks.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => setDetailsModalTask(t)}
                    className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs cursor-pointer opacity-90 space-y-1.5"
                  >
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                      ✓ Completed
                    </span>
                    <p className="text-xs font-medium text-slate-800 dark:text-slate-200 leading-snug">
                      {t.title}
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono">
                      {t.assigneeName}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Task Distribution & Team Burndown */}
      {(activeTab === 'task-distribution' || activeTab === 'team-progress') && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Team Task Distribution
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Balanced work allocation across assigned team specialists.
            </p>
          </div>

          <div className="space-y-4">
            {users
              .filter((u) => u.role === 'team_member')
              .map((member) => {
                const memberTasks = myTasks.filter((t) => t.assigneeId === member.id);
                const completed = memberTasks.filter((t) => t.status === 'Completed' || t.status === 'Done').length;

                return (
                  <div
                    key={member.id}
                    className="p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-800/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={member.avatar}
                        alt={member.name}
                        referrerPolicy="no-referrer"
                        className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                      />
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">
                          {member.name}
                        </p>
                        <p className="text-xs text-slate-500">{member.title}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 text-xs">
                      <div className="text-right">
                        <span className="text-slate-400 block text-[10px]">Deliverables</span>
                        <span className="font-mono font-semibold text-slate-900 dark:text-white">
                          {completed} / {memberTasks.length} Completed
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Tab: Upcoming Deadlines */}
      {activeTab === 'deadline-alerts' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <span>Upcoming Deadlines & Progress</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Live status and delivery progress for all active team tasks and project deliverables.
            </p>
          </div>

          <div className="space-y-3">
            {myTasks.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-500">
                No active deadline alerts. Tasks assigned to your team will appear here.
              </div>
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
                  'Completed': 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
                  'In Progress': 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 border-blue-200 dark:border-blue-800',
                  'Overdue': 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border-rose-200 dark:border-rose-800',
                  'Pending': 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border-amber-200 dark:border-amber-800',
                }[displayStatus];

                return (
                  <div
                    key={t.id}
                    onClick={() => setDetailsModalTask(t)}
                    className="p-4 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs bg-slate-50/40 dark:bg-slate-800/20 hover:border-blue-300 dark:hover:border-blue-700 transition-colors cursor-pointer"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500 font-mono text-[11px] font-semibold">
                          {t.projectTitle || t.clientName}
                        </span>
                        <span className="text-slate-300 dark:text-slate-600">·</span>
                        <span className="text-slate-400 text-[11px]">{t.workComponent || 'General Delivery'}</span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        {t.title}
                      </h4>
                      <p className="text-slate-500 text-[11px]">
                        Assigned Team Member: <span className="font-semibold text-slate-700 dark:text-slate-300">{t.assigneeName}</span>
                      </p>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${statusStyles}`}>
                        {displayStatus}
                      </span>
                      <div className="text-right">
                        <span className="font-mono text-xs font-semibold text-slate-700 dark:text-slate-300 block">
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

      {/* Modals */}
      <AddTaskModal
        isOpen={addTaskOpen}
        onClose={() => {
          setAddTaskOpen(false);
          setSelectedProjectId(undefined);
          setSelectedWorkComponent(undefined);
        }}
        defaultProjectId={selectedProjectId}
        defaultWorkComponent={selectedWorkComponent}
      />
      <TaskDetailsModal
        isOpen={Boolean(detailsModalTask)}
        onClose={() => setDetailsModalTask(null)}
        task={detailsModalTask}
      />
    </div>
  );
};
