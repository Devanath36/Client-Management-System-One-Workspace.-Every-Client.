import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Client, Project, Task, ProjectStatus } from '../../types';
import {
  Briefcase,
  Users,
  LayoutDashboard,
  CheckSquare,
  BarChart3,
  AlertTriangle,
  Plus,
  Search,
  Clock,
  CheckCircle2,
  Calendar,
  UserCheck,
  Building,
  Target,
  Layers,
  ArrowRight,
  Eye,
  Filter,
} from 'lucide-react';
import { CreateProjectModal } from '../../components/modals/CreateProjectModal';
import { AddClientModal } from '../../components/modals/AddClientModal';
import { AddTaskModal } from '../../components/modals/AddTaskModal';
import { ClientDetailsModal } from '../../components/modals/ClientDetailsModal';
import { TaskDetailsModal } from '../../components/modals/TaskDetailsModal';
import { ProjectAllocationDetailsModal } from '../../components/modals/ProjectAllocationDetailsModal';
import { MyWorkspaceView } from '../../components/workspace/MyWorkspaceView';
import { MeetingsManagementView } from '../../components/meetings/MeetingsManagementView';
import { ActivityLogsView } from '../../components/activity/ActivityLogsView';
import { NotificationSettingsView } from '../../components/settings/NotificationSettingsView';

interface ManagerDashboardProps {
  activeTab: string;
  onTabChange?: (tab: string) => void;
}

export const ManagerDashboard: React.FC<ManagerDashboardProps> = ({ activeTab, onTabChange }) => {
  const {
    clients,
    projects,
    tasks,
    teams,
    users,
    currentUser,
    getProjectProgress,
    getMemberWorkload,
  } = useApp();

  const [createProjectOpen, setCreateProjectOpen] = useState(false);
  const [addClientOpen, setAddClientOpen] = useState(false);
  const [addTaskOpen, setAddTaskOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [inspectingProject, setInspectingProject] = useState<Project | null>(null);

  // Filters for centralized project visibility
  const [clientSearch, setClientSearch] = useState('');
  const [clientStatusFilter, setClientStatusFilter] = useState<string>('all');
  const [projectStatusFilter, setProjectStatusFilter] = useState<string>('all');
  const [projectSearch, setProjectSearch] = useState('');
  const [managerFilter, setManagerFilter] = useState<string>('all');
  const [leadFilter, setLeadFilter] = useState<string>('all');
  const [timelineFilter, setTimelineFilter] = useState<string>('all');

  const nowTime = Date.now();

  const managers = users.filter((u) => u.role === 'manager');
  const teamLeads = users.filter((u) => u.role === 'team_lead');

  const filteredClients = clients.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
      c.industry.toLowerCase().includes(clientSearch.toLowerCase()) ||
      c.primaryContact.name.toLowerCase().includes(clientSearch.toLowerCase());
    const matchesStatus = clientStatusFilter === 'all' || c.status === clientStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.clientName.toLowerCase().includes(projectSearch.toLowerCase()) ||
      (p.companyName && p.companyName.toLowerCase().includes(projectSearch.toLowerCase())) ||
      p.purpose.toLowerCase().includes(projectSearch.toLowerCase()) ||
      (p.managerName && p.managerName.toLowerCase().includes(projectSearch.toLowerCase())) ||
      p.leadName.toLowerCase().includes(projectSearch.toLowerCase());

    const matchesStatus = projectStatusFilter === 'all' || p.status === projectStatusFilter;
    const matchesManager =
      managerFilter === 'all' ||
      p.managerId === managerFilter ||
      p.managerName === managerFilter;
    const matchesLead =
      leadFilter === 'all' ||
      p.leadId === leadFilter ||
      p.leadName === leadFilter;

    let matchesTimeline = true;
    if (timelineFilter === 'overdue') {
      matchesTimeline =
        (p.status !== 'Done' && p.status !== 'Completed') &&
        new Date(p.deadline).getTime() < nowTime;
    } else if (timelineFilter === 'next7') {
      const diffDays = (new Date(p.deadline).getTime() - nowTime) / (1000 * 60 * 60 * 24);
      matchesTimeline = diffDays >= 0 && diffDays <= 7;
    } else if (timelineFilter === 'next14') {
      const diffDays = (new Date(p.deadline).getTime() - nowTime) / (1000 * 60 * 60 * 24);
      matchesTimeline = diffDays >= 0 && diffDays <= 14;
    }

    return matchesSearch && matchesStatus && matchesManager && matchesLead && matchesTimeline;
  });

  const filteredTasks = tasks;

  // Calculate dynamic metrics from actual project & task statuses
  const totalProjects = projects.length;
  const activeProjects = projects.filter((p) => p.status === 'In Progress' || p.status === 'New' || p.status === 'Active').length;
  const completedProjects = projects.filter((p) => p.status === 'Done' || p.status === 'Completed').length;
  const totalTasks = tasks.length;
  const pendingTasks = tasks.filter((t) => t.status !== 'Done' && t.status !== 'Completed').length;
  const completedTasks = tasks.filter((t) => t.status === 'Done' || t.status === 'Completed').length;

  const overdueTasksCount = tasks.filter(
    (t) => (t.status !== 'Done' && t.status !== 'Completed') && new Date(t.deadline).getTime() < nowTime
  ).length;

  const overallProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Real-time Deadline alerts derived dynamically from projects and tasks
  const projectDeadlineAlerts = projects
    .filter((p) => {
      if (p.status === 'Done' || p.status === 'Completed') return false;
      const diff = (new Date(p.deadline).getTime() - nowTime) / (1000 * 60 * 60 * 24);
      return diff <= 5; // within 5 days or overdue
    })
    .map((p) => {
      const diff = Math.ceil((new Date(p.deadline).getTime() - nowTime) / (1000 * 60 * 60 * 24));
      return {
        id: p.id,
        type: 'Project',
        title: p.clientName + (p.companyName ? ` (${p.companyName})` : ''),
        purpose: p.purpose,
        lead: p.leadName,
        deadline: p.deadline,
        isOverdue: diff < 0,
        daysText: diff < 0 ? `${Math.abs(diff)} days overdue` : diff === 0 ? 'Due Today' : `${diff} days remaining`,
      };
    });

  const taskDeadlineAlerts = tasks
    .filter((t) => {
      if (t.status === 'Done' || t.status === 'Completed') return false;
      const diff = (new Date(t.deadline).getTime() - nowTime) / (1000 * 60 * 60 * 24);
      return diff <= 3;
    })
    .map((t) => {
      const diff = Math.ceil((new Date(t.deadline).getTime() - nowTime) / (1000 * 60 * 60 * 24));
      return {
        id: t.id,
        type: 'Task',
        title: t.title,
        purpose: t.projectTitle,
        lead: t.assigneeName,
        deadline: t.deadline,
        isOverdue: diff < 0,
        daysText: diff < 0 ? `${Math.abs(diff)} days overdue` : diff === 0 ? 'Due Today' : `${diff} days remaining`,
      };
    });

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

      {/* Activity Logs */}
      {activeTab === 'activity-logs' && (
        <ActivityLogsView />
      )}

      {/* Notification Center & Settings */}
      {(activeTab === 'settings' || activeTab === 'notification-settings') && (
        <NotificationSettingsView />
      )}

      {/* Top Header Summary Strip (for operational tabs) */}
      {activeTab !== 'workspace' &&
        activeTab !== 'meetings' &&
        activeTab !== 'activity-logs' &&
        activeTab !== 'settings' &&
        activeTab !== 'notification-settings' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Total Managed Projects
                </span>
                <Briefcase className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2 font-mono tabular-nums">
                {totalProjects}
              </p>
              <p className="text-[11px] text-slate-500 mt-1 font-mono">
                {activeProjects} Active · {completedProjects} Completed
              </p>
            </div>

            <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Deliverable Progress
                </span>
                <BarChart3 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2 font-mono tabular-nums">
                {overallProgress}%
              </p>
              <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-emerald-600 h-full rounded-full transition-all"
                  style={{ width: `${overallProgress}%` }}
                />
              </div>
            </div>

            <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Active Task Queue
                </span>
                <CheckSquare className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2 font-mono tabular-nums">
                {pendingTasks}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                {completedTasks} tasks done across initiatives
              </p>
            </div>

            <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Overdue Tasks & Alerts
                </span>
                <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              </div>
              <p className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-2 font-mono tabular-nums">
                {overdueTasksCount}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                {overdueTasksCount > 0 ? 'Requires manager attention' : 'All milestones on schedule'}
              </p>
            </div>
          </div>
        )}

      {/* ========================================================= */}
      {/* TAB: CLIENT PROJECT MANAGEMENT (CENTRALIZED OVERVIEW)     */}
      {/* ========================================================= */}
      {activeTab === 'projects' && (
        <div className="space-y-6">
          {/* Centralized Overview Header */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-blue-600" />
                  <span>Centralized Project Overview</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Consolidated multi-manager visibility across Manager 1, Manager 2, Manager 3, and all assigned Team Leads.
                </p>
              </div>
              {/* Primary Action: Create Project */}
              <button
                onClick={() => setCreateProjectOpen(true)}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Create & Assign Project</span>
              </button>
            </div>

            {/* Manager-Wise Project Breakdown Quick-Filter Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div
                onClick={() => setManagerFilter('all')}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                  managerFilter === 'all'
                    ? 'bg-blue-50/70 border-blue-400 dark:bg-blue-950/60 dark:border-blue-700'
                    : 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    All Managers
                  </span>
                  <Briefcase className="w-3.5 h-3.5 text-blue-600" />
                </div>
                <p className="text-xl font-bold font-mono text-slate-900 dark:text-white mt-1">
                  {totalProjects}
                </p>
                <span className="text-[10px] text-slate-400">
                  {activeProjects} Active · {completedProjects} Done
                </span>
              </div>

              {managers.map((mgr) => {
                const mgrProjects = projects.filter((p) => p.managerId === mgr.id || p.managerName === mgr.name);
                const isSelected = managerFilter === mgr.id || managerFilter === mgr.name;

                const badgeColor = mgr.name.includes('1')
                  ? 'text-blue-600'
                  : mgr.name.includes('2')
                  ? 'text-purple-600'
                  : 'text-emerald-600';

                return (
                  <div
                    key={mgr.id}
                    onClick={() => setManagerFilter(isSelected ? 'all' : mgr.id)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50/70 border-blue-400 dark:bg-blue-950/60 dark:border-blue-700'
                        : 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                        {mgr.name}
                      </span>
                      <UserCheck className={`w-3.5 h-3.5 ${badgeColor}`} />
                    </div>
                    <p className="text-xl font-bold font-mono text-slate-900 dark:text-white mt-1">
                      {mgrProjects.length}
                    </p>
                    <span className="text-[10px] text-slate-400">
                      {mgrProjects.filter((p) => p.status === 'In Progress' || p.status === 'New').length} Active
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Search & Comprehensive Filters Toolbar */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
                {/* Search */}
                <div className="relative sm:col-span-2 lg:col-span-1">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={projectSearch}
                    onChange={(e) => setProjectSearch(e.target.value)}
                    placeholder="Search client, purpose, lead..."
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                {/* Filter by Manager */}
                <div className="space-y-1">
                  <select
                    value={managerFilter}
                    onChange={(e) => setManagerFilter(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white cursor-pointer"
                  >
                    <option value="all">All Assigning Managers</option>
                    {managers.map((mgr) => (
                      <option key={mgr.id} value={mgr.id}>
                        {mgr.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Filter by Team Lead */}
                <div className="space-y-1">
                  <select
                    value={leadFilter}
                    onChange={(e) => setLeadFilter(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white cursor-pointer"
                  >
                    <option value="all">All Team Leads</option>
                    {teamLeads.map((lead) => (
                      <option key={lead.id} value={lead.id}>
                        {lead.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Filter by Status */}
                <div className="space-y-1">
                  <select
                    value={projectStatusFilter}
                    onChange={(e) => setProjectStatusFilter(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white cursor-pointer"
                  >
                    <option value="all">All Statuses</option>
                    <option value="New">New</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Done">Done</option>
                  </select>
                </div>

                {/* Filter by Timeline */}
                <div className="space-y-1">
                  <select
                    value={timelineFilter}
                    onChange={(e) => setTimelineFilter(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white cursor-pointer"
                  >
                    <option value="all">All Deadlines</option>
                    <option value="overdue">Overdue / At-Risk</option>
                    <option value="next7">Due within 7 Days</option>
                    <option value="next14">Due within 14 Days</option>
                  </select>
                </div>
              </div>

              {(managerFilter !== 'all' || leadFilter !== 'all' || projectStatusFilter !== 'all' || timelineFilter !== 'all' || projectSearch) && (
                <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                  <span>
                    Showing <strong>{filteredProjects.length}</strong> of {totalProjects} projects
                  </span>
                  <button
                    onClick={() => {
                      setManagerFilter('all');
                      setLeadFilter('all');
                      setProjectStatusFilter('all');
                      setTimelineFilter('all');
                      setProjectSearch('');
                    }}
                    className="text-blue-600 hover:text-blue-700 font-medium cursor-pointer"
                  >
                    Clear All Filters
                  </button>
                </div>
              )}
            </div>

            {/* Centralized Projects Table */}
            <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Client & Project Purpose</th>
                    <th className="py-3 px-4">Assigned Manager</th>
                    <th className="py-3 px-4">Assigned Team Lead</th>
                    <th className="py-3 px-4">Timeline & Duration</th>
                    <th className="py-3 px-4">Milestone Progress</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Work Allocation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredProjects.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-xs text-slate-500 dark:text-slate-400">
                        <Briefcase className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
                        <p className="font-semibold text-slate-700 dark:text-slate-300">No Projects Found</p>
                        <p className="mt-1">Try adjusting your filters or click &quot;Create & Assign Project&quot; above.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredProjects.map((p) => {
                      const progressData = getProjectProgress(p.id);
                      const isDone = p.status === 'Done' || p.status === 'Completed' || progressData.progress === 100;
                      const isInProgress = p.status === 'In Progress' || (progressData.progress > 0 && !isDone);
                      const isOverdue = !isDone && new Date(p.deadline).getTime() < nowTime;

                      // Distinct badge color per assigning manager
                      const managerBadgeStyle = p.managerName?.includes('1')
                        ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                        : p.managerName?.includes('2')
                        ? 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800'
                        : p.managerName?.includes('3')
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                        : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';

                      return (
                        <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="py-3.5 px-4 max-w-xs">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-900 dark:text-white">{p.clientName}</span>
                              {p.companyName && (
                                <span className="text-[11px] text-slate-400 truncate">({p.companyName})</span>
                              )}
                            </div>
                            <p className="font-medium text-slate-800 dark:text-slate-200 leading-snug mt-0.5 truncate">
                              {p.purpose}
                            </p>
                            {p.description && (
                              <p className="text-[11px] text-slate-500 truncate mt-0.5">{p.description}</p>
                            )}
                          </td>

                          {/* Assigned Manager (Clearly Distinguished) */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${managerBadgeStyle}`}>
                              <Briefcase className="w-3.5 h-3.5 shrink-0" />
                              <span>{p.managerName || 'Manager 1'}</span>
                            </span>
                          </td>

                          {/* Assigned Team Lead */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="flex items-center gap-1.5 font-medium text-slate-800 dark:text-slate-200">
                              <UserCheck className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                              <span>{p.leadName}</span>
                            </div>
                          </td>

                          {/* Dates & Duration */}
                          <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600 dark:text-slate-400 whitespace-nowrap">
                            <div>{p.startDate} → {p.deadline}</div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">
                                {p.duration || 'N/A'} Days
                              </span>
                              {isOverdue && (
                                <span className="text-[10px] font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-1.5 py-0.2 rounded border border-rose-200 dark:border-rose-900">
                                  Overdue
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Milestone Progress */}
                          <td className="py-3.5 px-4">
                            <div className="w-28 space-y-1">
                              <div className="flex justify-between text-[11px] font-mono tabular-nums">
                                <span className="font-semibold text-slate-900 dark:text-white">{progressData.progress}%</span>
                                <span className="text-slate-400">
                                  {progressData.completedTasks}/{progressData.totalTasks} Done
                                </span>
                              </div>
                              <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all ${
                                    isDone ? 'bg-emerald-600' : 'bg-blue-600'
                                  }`}
                                  style={{ width: `${progressData.progress}%` }}
                                />
                              </div>
                            </div>
                          </td>

                          {/* Status */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span
                              className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                                isDone
                                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                                  : isInProgress
                                  ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                                  : 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400'
                              }`}
                            >
                              {isDone ? 'Done' : isInProgress ? 'In Progress' : 'New'}
                            </span>
                          </td>

                          {/* Action: Inspect Work Allocation */}
                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <button
                              onClick={() => setInspectingProject(p)}
                              className="px-3 py-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-xl transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Inspect Allocation</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB: TEAM ALLOCATION & AVAILABILITY TRACKING              */}
      {/* ========================================================= */}
      {activeTab === 'team' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Flexible Team Allocation & Real-Time Availability
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Availability tracked based on current active task assignments, deadlines, and active workload (not merely completed tasks).
            </p>
          </div>

          {/* Teams Overview Strip (Flexible Team Sizes: e.g. 10, 5, 2 members) */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Configured Delivery Teams
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {teams.map((tm) => (
                <div
                  key={tm.id}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">{tm.name}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                      {tm.memberIds.length} Members
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{tm.description}</p>
                  <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs text-slate-500">
                    <span>Lead: <strong className="text-slate-800 dark:text-slate-200">{tm.leadName}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Member Workload & Availability Cards */}
          <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Team Member Workload & Capacity Roster
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {users
                .filter((u) => u.role === 'team_member')
                .map((member) => {
                  const workload = getMemberWorkload(member.id);

                  const availabilityBadgeColor = {
                    Available: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
                    Moderate: 'bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 border-sky-200 dark:border-sky-800',
                    Busy: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800',
                    Unavailable: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-900',
                  }[workload.availabilityStatus];

                  return (
                    <div
                      key={member.id}
                      className="p-5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-800/30 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img
                            src={member.avatar}
                            alt={member.name}
                            referrerPolicy="no-referrer"
                            className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 dark:text-white truncate">
                              {member.name}
                            </p>
                            <p className="text-[11px] text-slate-500 font-mono truncate">{member.loginId}</p>
                          </div>
                        </div>

                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border shrink-0 ${availabilityBadgeColor}`}>
                          {workload.availabilityStatus}
                        </span>
                      </div>

                      {/* Workload breakdown */}
                      <div className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 space-y-1.5 text-xs">
                        <div className="flex justify-between text-slate-600 dark:text-slate-300">
                          <span>Active Tasks:</span>
                          <strong className="text-slate-900 dark:text-white font-mono">{workload.activeTasksCount}</strong>
                        </div>
                        <div className="flex justify-between text-slate-600 dark:text-slate-300">
                          <span>Completed Tasks:</span>
                          <strong className="text-slate-900 dark:text-white font-mono">{workload.completedTasksCount}</strong>
                        </div>
                        {workload.overdueTasksCount > 0 && (
                          <div className="flex justify-between text-rose-600 dark:text-rose-400 font-semibold">
                            <span>Overdue Tasks:</span>
                            <span className="font-mono">{workload.overdueTasksCount}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-slate-600 dark:text-slate-300">
                          <span>Upcoming (3d):</span>
                          <span className="font-mono">{workload.upcomingDeadlinesCount}</span>
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {workload.availabilityLabel}
                      </p>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB: CLIENT DIRECTORY                                     */}
      {/* ========================================================= */}
      {activeTab === 'clients' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Client Directory
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Overview of client records and assigned delivery architects.
              </p>
            </div>
            <button
              onClick={() => setAddClientOpen(true)}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Client</span>
            </button>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={clientSearch}
                onChange={(e) => setClientSearch(e.target.value)}
                placeholder="Search clients..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Status:</span>
              <select
                value={clientStatusFilter}
                onChange={(e) => setClientStatusFilter(e.target.value)}
                className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Onboarding">Onboarding</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>

          {/* Client Table */}
          <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">Client Name</th>
                  <th className="py-3 px-4">Industry / Domain</th>
                  <th className="py-3 px-4">Account Tier</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredClients.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-xs text-slate-500 dark:text-slate-400">
                      No clients added yet. Click &quot;Add New Client&quot; to register a client record.
                    </td>
                  </tr>
                ) : (
                  filteredClients.map((client) => (
                    <tr
                      key={client.id}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
                      onClick={() => setSelectedClient(client)}
                    >
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                        {client.name}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                        {client.industry}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {client.tier}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                          {client.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setSelectedClient(client)}
                          className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB: TASK ASSIGNMENTS                                     */}
      {/* ========================================================= */}
      {activeTab === 'tasks' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Project Task Registry
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Centralized monitoring of deliverable tasks, assignees, and progress status.
              </p>
            </div>
            <button
              onClick={() => setAddTaskOpen(true)}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Assign New Task</span>
            </button>
          </div>

          <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">Task Name</th>
                  <th className="py-3 px-4">Project</th>
                  <th className="py-3 px-4">Assignee</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredTasks.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-xs text-slate-500 dark:text-slate-400">
                      No tasks assigned yet.
                    </td>
                  </tr>
                ) : (
                  filteredTasks.map((t) => (
                    <tr
                      key={t.id}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
                      onClick={() => setSelectedTask(t)}
                    >
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                        {t.title}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                        {t.projectTitle}
                      </td>
                      <td className="py-3.5 px-4 text-slate-800 dark:text-slate-200 font-medium">
                        {t.assigneeName}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-400">
                        {t.deadline}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                            t.status === 'Done' || t.status === 'Completed'
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                              : t.status === 'In Progress'
                              ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                              : 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400'
                          }`}
                        >
                          {t.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB: DEADLINE & SLA ALERTS                                */}
      {/* ========================================================= */}
      {activeTab === 'deadline-alerts' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Project & Task Deadline Alerts
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Live tracking of approaching deadlines and overdue items across all initiatives.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Project Milestone Alerts
            </h3>
            {projectDeadlineAlerts.length === 0 ? (
              <div className="p-6 bg-slate-50 dark:bg-slate-800/40 rounded-xl text-xs text-slate-500 text-center">
                All projects are comfortably within their scheduled target deadlines.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {projectDeadlineAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-4 rounded-xl border flex items-start gap-3 ${
                      alert.isOverdue
                        ? 'bg-rose-50/60 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300'
                        : 'bg-amber-50/60 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-300'
                    }`}
                  >
                    <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-xs">{alert.title}</span>
                        <span className="text-[10px] font-mono font-bold">{alert.daysText}</span>
                      </div>
                      <p className="text-xs leading-relaxed">{alert.purpose}</p>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        Lead: {alert.lead} · Target: {alert.deadline}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 pt-4">
              Urgent Task Alerts
            </h3>
            {taskDeadlineAlerts.length === 0 ? (
              <div className="p-6 bg-slate-50 dark:bg-slate-800/40 rounded-xl text-xs text-slate-500 text-center">
                No critical or approaching task deadlines found.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {taskDeadlineAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-4 rounded-xl border flex items-start gap-3 ${
                      alert.isOverdue
                        ? 'bg-rose-50/60 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300'
                        : 'bg-amber-50/60 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-300'
                    }`}
                  >
                    <Clock className="w-5 h-5 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-xs">{alert.title}</span>
                        <span className="text-[10px] font-mono font-bold">{alert.daysText}</span>
                      </div>
                      <p className="text-xs leading-relaxed">Project: {alert.purpose}</p>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        Assignee: {alert.lead} · Due: {alert.deadline}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB: REPORTS & ANALYTICS                                  */}
      {/* ========================================================= */}
      {(activeTab === 'analytics' || activeTab === 'reports') && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Project Performance & Delivery Reports
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Comprehensive report of project completion, task statuses, and team velocities.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-2">
              <span className="text-xs text-slate-500 font-semibold uppercase">Total Projects</span>
              <p className="text-3xl font-bold font-mono text-slate-900 dark:text-white">{totalProjects}</p>
              <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1 pt-2 border-t border-slate-200 dark:border-slate-700">
                <div className="flex justify-between">
                  <span>Active / In Progress:</span>
                  <span className="font-bold">{activeProjects}</span>
                </div>
                <div className="flex justify-between">
                  <span>Completed / Done:</span>
                  <span className="font-bold text-emerald-600">{completedProjects}</span>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-2">
              <span className="text-xs text-slate-500 font-semibold uppercase">Task Completion</span>
              <p className="text-3xl font-bold font-mono text-slate-900 dark:text-white">{overallProgress}%</p>
              <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1 pt-2 border-t border-slate-200 dark:border-slate-700">
                <div className="flex justify-between">
                  <span>Total Tasks:</span>
                  <span className="font-bold">{totalTasks}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tasks Completed:</span>
                  <span className="font-bold text-emerald-600">{completedTasks}</span>
                </div>
                <div className="flex justify-between">
                  <span>Pending Tasks:</span>
                  <span className="font-bold text-blue-600">{pendingTasks}</span>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-2">
              <span className="text-xs text-slate-500 font-semibold uppercase">Deadline Adherence</span>
              <p className="text-3xl font-bold font-mono text-slate-900 dark:text-white">
                {totalTasks > 0 ? `${Math.round(((totalTasks - overdueTasksCount) / totalTasks) * 100)}%` : '100%'}
              </p>
              <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1 pt-2 border-t border-slate-200 dark:border-slate-700">
                <div className="flex justify-between">
                  <span>On-time Tasks:</span>
                  <span className="font-bold text-emerald-600">{totalTasks - overdueTasksCount}</span>
                </div>
                <div className="flex justify-between">
                  <span>Overdue Tasks:</span>
                  <span className="font-bold text-rose-600">{overdueTasksCount}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <CreateProjectModal
        isOpen={createProjectOpen}
        onClose={() => setCreateProjectOpen(false)}
      />

      <AddClientModal
        isOpen={addClientOpen}
        onClose={() => setAddClientOpen(false)}
      />

      <AddTaskModal
        isOpen={addTaskOpen}
        onClose={() => setAddTaskOpen(false)}
      />

      {selectedClient && (
        <ClientDetailsModal
          client={selectedClient}
          projects={projects}
          isOpen={!!selectedClient}
          onClose={() => setSelectedClient(null)}
        />
      )}

      {selectedTask && (
        <TaskDetailsModal
          task={selectedTask}
          isOpen={!!selectedTask}
          onClose={() => setSelectedTask(null)}
        />
      )}

      {inspectingProject && (
        <ProjectAllocationDetailsModal
          project={inspectingProject}
          tasks={tasks}
          isOpen={Boolean(inspectingProject)}
          onClose={() => setInspectingProject(null)}
        />
      )}
    </div>
  );
};
