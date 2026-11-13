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
            <div className="p-5 bg-white dark:bg-[#141414] rounded-2xl border border-[#E0E0E0] dark:border-[#333333] shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#555555] dark:text-[#A3A3A3]">
                  Assigned Initiatives
                </span>
                <Briefcase className="w-4 h-4 text-[#E50914]" />
              </div>
              <p className="text-2xl font-bold text-[#101010] dark:text-white mt-2 font-mono tabular-nums">
                {myProjects.length}
              </p>
              <p className="text-[11px] text-[#555555] dark:text-[#A3A3A3] mt-1">{currentUser?.title || 'Team Lead'}</p>
            </div>

            <div className="p-5 bg-white dark:bg-[#141414] rounded-2xl border border-[#E0E0E0] dark:border-[#333333] shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#555555] dark:text-[#A3A3A3]">
                  Tasks In Progress
                </span>
                <Clock className="w-4 h-4 text-[#FF7900]" />
              </div>
              <p className="text-2xl font-bold text-[#FF7900] mt-2 font-mono tabular-nums">
                {inProgressTasks.length}
              </p>
              <p className="text-[11px] text-[#555555] dark:text-[#A3A3A3] mt-1">
                {inProgressTasks.length > 0 ? 'Currently active in development' : 'No tasks currently in progress'}
              </p>
            </div>

            <div className="p-5 bg-white dark:bg-[#141414] rounded-2xl border border-[#E0E0E0] dark:border-[#333333] shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#555555] dark:text-[#A3A3A3]">
                  Sprint Milestone Progress
                </span>
                <BarChart3 className="w-4 h-4 text-[#FFC928]" />
              </div>
              <p className="text-2xl font-bold text-[#101010] dark:text-white mt-2 font-mono tabular-nums">
                {sprintProgress}%
              </p>
              <p className="text-[11px] text-[#555555] dark:text-[#A3A3A3] mt-1">
                {completedTasksCount}/{totalTasksCount} Tasks Completed
              </p>
            </div>

            <div className="p-5 bg-white dark:bg-[#141414] rounded-2xl border border-[#E0E0E0] dark:border-[#333333] shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#555555] dark:text-[#A3A3A3]">
                  Logged Engineering Hours
                </span>
                <Clock className="w-4 h-4 text-[#FFC928]" />
              </div>
              <p className="text-2xl font-bold text-[#101010] dark:text-white mt-2 font-mono tabular-nums">
                {totalLoggedHours}h
              </p>
              <p className="text-[11px] text-[#555555] dark:text-[#A3A3A3] mt-1">Total tracked engineering time</p>
            </div>
          </div>
        )}

      {/* Tab: Assigned Projects & Work Allocation */}
      {activeTab === 'assigned-projects' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-[#101010] dark:text-white flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-[#E50914]" />
                <span>Assigned Projects & Work Allocation</span>
              </h2>
              <p className="text-xs text-[#555555] dark:text-[#A3A3A3] mt-0.5">
                Client initiatives assigned specifically to your lead account by Managers. Allocate architectural work components to team members.
              </p>
            </div>
            <button
              onClick={() => {
                setSelectedProjectId(myProjects[0]?.id);
                setAddTaskOpen(true);
              }}
              className="px-4 py-2 text-xs font-bold text-white bg-[#E50914] hover:bg-[#c40812] rounded-xl shadow-xs transition-colors flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Allocate Work Component</span>
            </button>
          </div>

          {myProjects.length === 0 ? (
            <div className="bg-white dark:bg-[#141414] border border-dashed border-[#E0E0E0] dark:border-[#333333] rounded-2xl p-12 text-center space-y-2">
              <Briefcase className="w-10 h-10 text-[#555555] dark:text-[#A3A3A3] mx-auto" />
              <p className="text-sm font-bold text-[#101010] dark:text-white">
                No Projects Assigned Yet
              </p>
              <p className="text-xs text-[#555555] dark:text-[#A3A3A3] max-w-md mx-auto">
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
                  ? 'bg-[#171717] text-[#FFC928] border border-[#333333]'
                  : p.managerName?.includes('2')
                  ? 'bg-[#171717] text-[#FF7900] border border-[#333333]'
                  : p.managerName?.includes('3')
                  ? 'bg-[#171717] text-white border border-[#333333]'
                  : 'bg-[#F7F7F7] dark:bg-[#171717] text-[#101010] dark:text-white border border-[#E0E0E0] dark:border-[#333333]';

                return (
                  <div
                    key={p.id}
                    className="bg-white dark:bg-[#141414] border border-[#E0E0E0] dark:border-[#333333] rounded-2xl p-6 space-y-5 shadow-xs"
                  >
                    {/* Top Row: Client, Title, Assigning Manager, and Status */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-4 border-b border-[#E0E0E0] dark:border-[#333333]">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-[#E50914]">
                            {p.clientName}
                          </span>
                          {p.companyName && (
                            <>
                              <span className="text-[#A3A3A3]">·</span>
                              <span className="text-xs text-[#555555] dark:text-[#A3A3A3] font-medium">
                                {p.companyName}
                              </span>
                            </>
                          )}

                          {/* Prominent Assigning Manager Badge */}
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-[11px] font-semibold ${managerBadgeStyle}`}>
                            <Briefcase className="w-3 h-3 shrink-0" />
                            <span>Assigned by: {p.managerName || 'Manager 1'}</span>
                          </span>
                        </div>

                        <h3 className="text-base font-bold text-[#101010] dark:text-white">
                          {p.purpose}
                        </h3>
                        {p.description && (
                          <p className="text-xs text-[#555555] dark:text-[#A3A3A3] leading-relaxed">
                            {p.description}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`text-xs font-semibold px-2.5 py-1 rounded-lg border ${
                            p.status === 'Done' || p.status === 'Completed' || progressPercent === 100
                              ? 'bg-[#171717] text-[#FFC928] border-[#FFC928]/40'
                              : p.status === 'In Progress' || progressPercent > 0
                              ? 'bg-[#171717] text-[#FF7900] border-[#FF7900]/40'
                              : 'bg-[#F7F7F7] dark:bg-[#171717] text-[#101010] dark:text-white border-[#E0E0E0] dark:border-[#333333]'
                          }`}
                        >
                          {progressPercent === 100 ? 'Done' : p.status}
                        </span>
                      </div>
                    </div>

                    {/* Timeline & Progress Indicator */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                      <div className="p-3 bg-[#F7F7F7] dark:bg-[#171717] rounded-xl border border-[#E0E0E0] dark:border-[#333333] space-y-1">
                        <span className="text-[10px] text-[#555555] dark:text-[#A3A3A3] uppercase font-bold tracking-wider">
                          Project Timeline
                        </span>
                        <p className="font-mono text-[#101010] dark:text-white font-medium">
                          {p.startDate} → {p.deadline}
                        </p>
                        <p className="text-[10px] font-bold text-[#FF7900]">
                          {p.duration || 'N/A'} Days Duration
                        </p>
                      </div>

                      <div className="p-3 bg-[#F7F7F7] dark:bg-[#171717] rounded-xl border border-[#E0E0E0] dark:border-[#333333] space-y-1 sm:col-span-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-[#555555] dark:text-[#A3A3A3] uppercase font-bold tracking-wider">
                            Overall Task Completion
                          </span>
                          <span className="font-mono font-bold text-[#101010] dark:text-white">
                            {progressPercent}% ({completedTasks}/{projectTasks.length} Done)
                          </span>
                        </div>
                        <div className="w-full bg-[#E0E0E0] dark:bg-[#262626] h-2 rounded-full overflow-hidden mt-1.5">
                          <div
                            className="bg-[#E50914] h-full rounded-full transition-all"
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Multi-Component Work Allocation Section */}
                    <div className="pt-2 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Layers className="w-4 h-4 text-[#FF7900]" />
                          <h4 className="text-xs font-bold text-[#101010] dark:text-white uppercase tracking-wider">
                            Work Components & Task Allocations ({projectTasks.length})
                          </h4>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedProjectId(p.id);
                            setAddTaskOpen(true);
                          }}
                          className="px-3 py-1 text-xs font-semibold text-[#101010] dark:text-white bg-[#F7F7F7] dark:bg-[#171717] hover:bg-[#EFEFEF] dark:hover:bg-[#222222] border border-[#E0E0E0] dark:border-[#333333] rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Allocate Component Task</span>
                        </button>
                      </div>

                      {projectTasks.length === 0 ? (
                        <div className="p-6 border border-dashed border-[#E0E0E0] dark:border-[#333333] rounded-xl text-center space-y-2">
                          <Layers className="w-6 h-6 text-[#555555] dark:text-[#A3A3A3] mx-auto" />
                          <p className="text-xs font-semibold text-[#101010] dark:text-white">
                            No work components allocated yet
                          </p>
                          <p className="text-[11px] text-[#555555] dark:text-[#A3A3A3]">
                            Allocate Frontend, Backend, Database, UI/UX, Testing, or Documentation tasks to registered team members.
                          </p>
                          <button
                            onClick={() => {
                              setSelectedProjectId(p.id);
                              setAddTaskOpen(true);
                            }}
                            className="mt-2 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#E50914] hover:bg-[#c40812] rounded-lg shadow-xs inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Allocate First Component Task</span>
                          </button>
                        </div>
                      ) : (
                        <div className="overflow-x-auto border border-[#E0E0E0] dark:border-[#333333] rounded-xl">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-[#F7F7F7] dark:bg-[#171717] text-[#101010] dark:text-white font-semibold border-b border-[#E0E0E0] dark:border-[#333333]">
                              <tr>
                                <th className="py-2.5 px-3">Work Component</th>
                                <th className="py-2.5 px-3">Task Deliverable</th>
                                <th className="py-2.5 px-3">Assigned Specialist</th>
                                <th className="py-2.5 px-3">Due Date</th>
                                <th className="py-2.5 px-3">Status</th>
                                <th className="py-2.5 px-3 text-right">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-[#E0E0E0] dark:divide-[#333333]">
                              {projectTasks.map((t) => {
                                return (
                                  <tr key={t.id} className="hover:bg-[#F7F7F7] dark:hover:bg-[#1a1a1a] transition-colors">
                                    <td className="py-2.5 px-3 whitespace-nowrap">
                                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#F7F7F7] dark:bg-[#171717] text-[#101010] dark:text-white border border-[#E0E0E0] dark:border-[#333333] flex items-center gap-1 w-fit">
                                        <Tag className="w-2.5 h-2.5" />
                                        <span>{t.workComponent || 'General Delivery'}</span>
                                      </span>
                                    </td>
                                    <td className="py-2.5 px-3 max-w-xs">
                                      <p className="font-bold text-[#101010] dark:text-white truncate">
                                        {t.title}
                                      </p>
                                      <p className="text-[11px] text-[#555555] dark:text-[#A3A3A3] truncate mt-0.5">
                                        {t.description}
                                      </p>
                                    </td>
                                    <td className="py-2.5 px-3 whitespace-nowrap font-medium text-[#101010] dark:text-white">
                                      {t.assigneeName}
                                    </td>
                                    <td className="py-2.5 px-3 whitespace-nowrap font-mono text-[11px] text-[#555555] dark:text-[#A3A3A3]">
                                      {t.deadline}
                                    </td>
                                    <td className="py-2.5 px-3 whitespace-nowrap">
                                      <span
                                        className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                                          t.status === 'Done' || t.status === 'Completed'
                                            ? 'bg-[#171717] text-[#FFC928] border-[#FFC928]/40'
                                            : t.status === 'In Progress'
                                            ? 'bg-[#171717] text-[#FF7900] border-[#FF7900]/40'
                                            : 'bg-[#F7F7F7] dark:bg-[#171717] text-[#555555] dark:text-[#A3A3A3] border-[#E0E0E0] dark:border-[#333333]'
                                        }`}
                                      >
                                        {t.status}
                                      </span>
                                    </td>
                                    <td className="py-2.5 px-3 text-right whitespace-nowrap space-x-1">
                                      <button
                                        onClick={() => setDetailsModalTask(t)}
                                        className="px-2.5 py-1 text-[11px] font-medium text-[#555555] dark:text-[#A3A3A3] hover:text-[#101010] dark:hover:text-white hover:bg-[#EFEFEF] dark:hover:bg-[#222222] rounded-lg cursor-pointer transition-colors"
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
              <h2 className="text-lg font-bold text-[#101010] dark:text-white">
                Task Status Kanban Board
              </h2>
              <p className="text-xs text-[#555555] dark:text-[#A3A3A3] mt-0.5">
                Real-time delivery progress across To Do, In Progress, and Completed stages.
              </p>
            </div>
            <button
              onClick={() => setAddTaskOpen(true)}
              className="px-3.5 py-2 text-xs font-bold text-white bg-[#E50914] hover:bg-[#c40812] rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Task</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Column 1: To Do / Pending */}
            <div className="bg-[#F7F7F7] dark:bg-[#141414] p-4 rounded-2xl border border-[#E0E0E0] dark:border-[#333333] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#101010] dark:text-white">
                  To Do / Pending ({todoTasks.length})
                </span>
                <span className="w-2 h-2 rounded-full bg-[#737373]" />
              </div>
              <div className="space-y-2.5">
                {todoTasks.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => setDetailsModalTask(t)}
                    className="p-3 bg-white dark:bg-[#171717] rounded-xl border border-[#E0E0E0] dark:border-[#333333] shadow-xs cursor-pointer hover:border-[#E50914] transition-colors space-y-2"
                  >
                    <span className="text-[10px] text-[#555555] dark:text-[#A3A3A3] font-medium block truncate">
                      {t.clientName}
                    </span>
                    <p className="text-xs font-bold text-[#101010] dark:text-white leading-snug">
                      {t.title}
                    </p>
                    <div className="flex items-center justify-between text-[11px] text-[#555555] dark:text-[#A3A3A3] pt-1">
                      <span>{t.assigneeName.split(' ')[0]}</span>
                      <span className="font-mono">Due: {t.deadline}</span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        updateTaskStatus(t.id, 'In Progress');
                      }}
                      className="w-full mt-1 py-1 text-[11px] font-semibold text-[#101010] dark:text-white bg-[#F0F0F0] dark:bg-[#202020] hover:bg-[#E50914] hover:text-white rounded text-center cursor-pointer transition-colors"
                    >
                      Start Task →
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Column 2: In Progress */}
            <div className="bg-[#F7F7F7] dark:bg-[#141414] p-4 rounded-2xl border border-[#E0E0E0] dark:border-[#333333] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#101010] dark:text-white">
                  In Progress ({inProgressTasks.length})
                </span>
                <span className="w-2 h-2 rounded-full bg-[#FF7900]" />
              </div>
              <div className="space-y-2.5">
                {inProgressTasks.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => setDetailsModalTask(t)}
                    className="p-3 bg-white dark:bg-[#171717] rounded-xl border border-[#E0E0E0] dark:border-[#333333] shadow-xs cursor-pointer hover:border-[#FF7900] transition-colors space-y-2"
                  >
                    <span className="text-[10px] text-[#555555] dark:text-[#A3A3A3] font-medium block truncate">
                      {t.clientName}
                    </span>
                    <p className="text-xs font-bold text-[#101010] dark:text-white leading-snug">
                      {t.title}
                    </p>
                    <div className="flex items-center justify-between text-[11px] text-[#555555] dark:text-[#A3A3A3] pt-1">
                      <span>{t.assigneeName.split(' ')[0]}</span>
                      <span className="font-mono">{t.deadline}</span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        updateTaskStatus(t.id, 'Completed');
                      }}
                      className="w-full mt-1 py-1 text-[11px] font-semibold text-[#101010] dark:text-white bg-[#F0F0F0] dark:bg-[#202020] hover:bg-[#FFC928] hover:text-[#101010] rounded text-center cursor-pointer transition-colors"
                    >
                      Mark Completed ✓
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Column 3: Completed */}
            <div className="bg-[#F7F7F7] dark:bg-[#141414] p-4 rounded-2xl border border-[#E0E0E0] dark:border-[#333333] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#101010] dark:text-white">
                  Completed ({completedTasks.length})
                </span>
                <span className="w-2 h-2 rounded-full bg-[#FFC928]" />
              </div>
              <div className="space-y-2.5">
                {completedTasks.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => setDetailsModalTask(t)}
                    className="p-3 bg-white dark:bg-[#171717] rounded-xl border border-[#E0E0E0] dark:border-[#333333] shadow-xs cursor-pointer opacity-90 space-y-1.5 hover:border-[#FFC928] transition-colors"
                  >
                    <span className="text-[10px] text-[#FFC928] font-semibold">
                      ✓ Completed
                    </span>
                    <p className="text-xs font-medium text-[#101010] dark:text-white leading-snug">
                      {t.title}
                    </p>
                    <p className="text-[10px] text-[#555555] dark:text-[#A3A3A3] font-mono">
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
        <div className="bg-white dark:bg-[#141414] rounded-2xl border border-[#E0E0E0] dark:border-[#333333] p-6 space-y-6">
          <div>
            <h2 className="text-lg font-bold text-[#101010] dark:text-white">
              Team Task Distribution
            </h2>
            <p className="text-xs text-[#555555] dark:text-[#A3A3A3] mt-0.5">
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
                    className="p-4 border border-[#E0E0E0] dark:border-[#333333] rounded-xl bg-[#F7F7F7] dark:bg-[#171717] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={member.avatar}
                        alt={member.name}
                        referrerPolicy="no-referrer"
                        className="w-10 h-10 rounded-full object-cover border border-[#E0E0E0] dark:border-[#333333]"
                      />
                      <div>
                        <p className="text-sm font-bold text-[#101010] dark:text-white">
                          {member.name}
                        </p>
                        <p className="text-xs text-[#555555] dark:text-[#A3A3A3]">{member.title}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 text-xs">
                      <div className="text-right">
                        <span className="text-[#555555] dark:text-[#A3A3A3] block text-[10px]">Deliverables</span>
                        <span className="font-mono font-semibold text-[#101010] dark:text-white">
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
        <div className="bg-white dark:bg-[#141414] rounded-2xl border border-[#E0E0E0] dark:border-[#333333] p-6 space-y-5">
          <div>
            <h2 className="text-lg font-bold text-[#101010] dark:text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-[#FF7900]" />
              <span>Upcoming Deadlines & Progress</span>
            </h2>
            <p className="text-xs text-[#555555] dark:text-[#A3A3A3] mt-0.5">
              Live status and delivery progress for all active team tasks and project deliverables.
            </p>
          </div>

          <div className="space-y-3">
            {myTasks.length === 0 ? (
              <div className="p-8 text-center bg-[#F7F7F7] dark:bg-[#171717] rounded-xl border border-[#E0E0E0] dark:border-[#333333] text-xs text-[#555555] dark:text-[#A3A3A3]">
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
                  'Completed': 'bg-[#171717] text-[#FFC928] border-[#FFC928]/40',
                  'In Progress': 'bg-[#171717] text-[#FF7900] border-[#FF7900]/40',
                  'Overdue': 'bg-[#E50914]/15 text-[#E50914] border-[#E50914]/40',
                  'Pending': 'bg-[#F7F7F7] dark:bg-[#171717] text-[#555555] dark:text-[#A3A3A3] border-[#E0E0E0] dark:border-[#333333]',
                }[displayStatus];

                return (
                  <div
                    key={t.id}
                    onClick={() => setDetailsModalTask(t)}
                    className="p-4 border border-[#E0E0E0] dark:border-[#333333] rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs bg-[#F7F7F7] dark:bg-[#171717] hover:border-[#E50914] transition-colors cursor-pointer"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[#555555] dark:text-[#A3A3A3] font-mono text-[11px] font-semibold">
                          {t.projectTitle || t.clientName}
                        </span>
                        <span className="text-[#737373]">·</span>
                        <span className="text-[#555555] dark:text-[#A3A3A3] text-[11px]">{t.workComponent || 'General Delivery'}</span>
                      </div>
                      <h4 className="text-sm font-bold text-[#101010] dark:text-white">
                        {t.title}
                      </h4>
                      <p className="text-[#555555] dark:text-[#A3A3A3] text-[11px]">
                        Assigned Team Member: <span className="font-semibold text-[#101010] dark:text-white">{t.assigneeName}</span>
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
