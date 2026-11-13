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
  Download,
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
import { ReportsAnalyticsView } from '../../components/reports/ReportsAnalyticsView';
import { downloadProjectAnalyticsPDF } from '../../utils/pdfExport';

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
    showToast,
  } = useApp();

  const handleDownloadReport = () => {
    try {
      showToast('info', 'Generating PDF Report...', 'Compiling currently viewed project analytics and deliverable summary.');
      downloadProjectAnalyticsPDF({
        projects: filteredProjects,
        tasks: filteredTasks,
        clients,
        users,
        managerName: currentUser?.name || 'Operations Manager',
        statusFilter: projectStatusFilter,
      });
      setTimeout(() => {
        showToast('success', 'Report Download Complete', 'Project analytics PDF has been saved to your device.');
      }, 500);
    } catch (err) {
      console.error('PDF download error:', err);
      showToast('error', 'Download Failed', 'Could not generate PDF report.');
    }
  };

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

      {/* Top Header Summary Strip & Download Report Action (for operational tabs) */}
      {activeTab !== 'workspace' &&
        activeTab !== 'meetings' &&
        activeTab !== 'activity-logs' &&
        activeTab !== 'settings' &&
        activeTab !== 'notification-settings' && (
          <div className="space-y-4">
            <div className="bg-white dark:bg-[#141414] p-4 sm:p-5 rounded-2xl border border-[#E0E0E0] dark:border-[#333333] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs transition-colors">
              <div>
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-[#E50914]/10 text-[#E50914] border border-[#E50914]/25">
                    <Briefcase className="w-4 h-4" />
                  </span>
                  <h1 className="text-base sm:text-lg font-bold text-[#101010] dark:text-white">
                    Operations & Project Oversight
                  </h1>
                </div>
                <p className="text-xs text-[#555555] dark:text-[#A3A3A3] mt-1">
                  Centralized cross-team performance metrics, client initiatives, and SLA milestones.
                </p>
              </div>

              {/* Action Controls: Download PDF Report & Create Project */}
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleDownloadReport}
                  className="px-3.5 py-2 text-xs font-bold text-white bg-[#E50914] hover:bg-[#c40812] rounded-xl shadow-xs shadow-[#E50914]/30 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                  title="Download comprehensive PDF report of currently viewed project analytics"
                >
                  <Download className="w-4 h-4 text-white" />
                  <span>Download Report</span>
                  <span className="px-1.5 py-0.2 rounded bg-black/30 text-[10px] font-mono uppercase tracking-wide">
                    PDF
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setCreateProjectOpen(true)}
                  className="px-3.5 py-2 text-xs font-bold text-[#101010] dark:text-white bg-[#F0F0F0] dark:bg-[#202020] hover:bg-[#E5E5E5] dark:hover:bg-[#2a2a2a] border border-[#E0E0E0] dark:border-[#333333] rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                >
                  <Plus className="w-4 h-4 text-[#FF7900]" />
                  <span>Create Project</span>
                </button>
              </div>
            </div>

            {/* Metric KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 bg-white dark:bg-[#141414] rounded-2xl border border-[#E0E0E0] dark:border-[#333333] shadow-xs transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#555555] dark:text-[#A3A3A3]">
                    Total Managed Projects
                  </span>
                  <Briefcase className="w-4 h-4 text-[#FF7900]" />
                </div>
                <p className="text-2xl font-bold text-[#101010] dark:text-white mt-2 font-mono tabular-nums">
                  {totalProjects}
                </p>
                <p className="text-[11px] text-[#555555] dark:text-[#A3A3A3] mt-1 font-mono">
                  {activeProjects} Active · {completedProjects} Completed
                </p>
              </div>

              <div className="p-5 bg-white dark:bg-[#141414] rounded-2xl border border-[#E0E0E0] dark:border-[#333333] shadow-xs transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#555555] dark:text-[#A3A3A3]">
                    Deliverable Progress
                  </span>
                  <BarChart3 className="w-4 h-4 text-[#FFC928]" />
                </div>
                <p className="text-2xl font-bold text-[#101010] dark:text-white mt-2 font-mono tabular-nums">
                  {overallProgress}%
                </p>
                <div className="w-full bg-[#EAEAEA] dark:bg-[#262626] h-1.5 rounded-full mt-2 overflow-hidden">
                  <div
                    className="bg-[#FFC928] h-full rounded-full transition-all"
                    style={{ width: `${overallProgress}%` }}
                  />
                </div>
              </div>

              <div className="p-5 bg-white dark:bg-[#141414] rounded-2xl border border-[#E0E0E0] dark:border-[#333333] shadow-xs transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#555555] dark:text-[#A3A3A3]">
                    Active Task Queue
                  </span>
                  <CheckSquare className="w-4 h-4 text-[#FF7900]" />
                </div>
                <p className="text-2xl font-bold text-[#101010] dark:text-white mt-2 font-mono tabular-nums">
                  {pendingTasks}
                </p>
                <p className="text-[11px] text-[#555555] dark:text-[#A3A3A3] mt-1">
                  {completedTasks} tasks completed across initiatives
                </p>
              </div>

              <div className="p-5 bg-white dark:bg-[#141414] rounded-2xl border border-[#E0E0E0] dark:border-[#333333] shadow-xs transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#555555] dark:text-[#A3A3A3]">
                    Overdue Tasks & Alerts
                  </span>
                  <AlertTriangle className="w-4 h-4 text-[#E50914]" />
                </div>
                <p className="text-2xl font-bold text-[#E50914] mt-2 font-mono tabular-nums">
                  {overdueTasksCount}
                </p>
                <p className="text-[11px] text-[#555555] dark:text-[#A3A3A3] mt-1">
                  {overdueTasksCount > 0 ? 'Requires manager attention' : 'All milestones on schedule'}
                </p>
              </div>
            </div>
          </div>
        )}

      {/* ========================================================= */}
      {/* TAB: CLIENT PROJECT MANAGEMENT (CENTRALIZED OVERVIEW)     */}
      {/* ========================================================= */}
      {activeTab === 'projects' && (
        <div className="space-y-6">
          {/* Centralized Overview Header */}
          <div className="bg-white dark:bg-[#141414] rounded-2xl border border-[#E0E0E0] dark:border-[#333333] p-5 sm:p-6 space-y-5 shadow-xs transition-colors">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-[#101010] dark:text-white flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-[#E50914]" />
                  <span>Centralized Project Overview</span>
                </h2>
                <p className="text-xs text-[#555555] dark:text-[#A3A3A3] mt-0.5">
                  Consolidated multi-manager visibility across Manager 1, Manager 2, Manager 3, and all assigned Team Leads.
                </p>
              </div>

              {/* Primary Actions: Download Report & Create Project */}
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={handleDownloadReport}
                  className="px-3.5 py-2 text-xs font-bold text-white bg-[#E50914] hover:bg-[#c40812] rounded-xl shadow-xs shadow-[#E50914]/25 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                  title="Download PDF report of current project analytics"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Report</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCreateProjectOpen(true)}
                  className="px-3.5 py-2 text-xs font-bold text-[#101010] dark:text-white bg-[#F0F0F0] dark:bg-[#202020] hover:bg-[#E5E5E5] dark:hover:bg-[#2a2a2a] border border-[#E0E0E0] dark:border-[#333333] rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <Plus className="w-4 h-4 text-[#FF7900]" />
                  <span>Create Project</span>
                </button>
              </div>
            </div>

            {/* Manager-Wise Project Breakdown Quick-Filter Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div
                onClick={() => setManagerFilter('all')}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                  managerFilter === 'all'
                    ? 'bg-[#E50914]/10 border-[#E50914] text-[#E50914]'
                    : 'bg-[#F9F9F9] dark:bg-[#1a1a1a] border-[#E0E0E0] dark:border-[#333333] hover:border-[#FF7900]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-[#555555] dark:text-[#A3A3A3]">
                    All Managers
                  </span>
                  <Briefcase className="w-3.5 h-3.5 text-[#FF7900]" />
                </div>
                <p className="text-xl font-bold font-mono text-[#101010] dark:text-white mt-1">
                  {totalProjects}
                </p>
                <span className="text-[10px] text-[#777777] dark:text-[#888888]">
                  {activeProjects} Active · {completedProjects} Done
                </span>
              </div>

              {managers.map((mgr) => {
                const mgrProjects = projects.filter((p) => p.managerId === mgr.id || p.managerName === mgr.name);
                const isSelected = managerFilter === mgr.id || managerFilter === mgr.name;

                return (
                  <div
                    key={mgr.id}
                    onClick={() => setManagerFilter(isSelected ? 'all' : mgr.id)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#E50914]/10 border-[#E50914] text-[#E50914]'
                        : 'bg-[#F9F9F9] dark:bg-[#1a1a1a] border-[#E0E0E0] dark:border-[#333333] hover:border-[#FF7900]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-[#101010] dark:text-white">
                        {mgr.name}
                      </span>
                      <UserCheck className="w-3.5 h-3.5 text-[#FF7900]" />
                    </div>
                    <p className="text-xl font-bold font-mono text-[#101010] dark:text-white mt-1">
                      {mgrProjects.length}
                    </p>
                    <span className="text-[10px] text-[#777777] dark:text-[#888888]">
                      {mgrProjects.filter((p) => p.status === 'In Progress' || p.status === 'New').length} Active
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Search & Comprehensive Filters Toolbar */}
            <div className="pt-2 border-t border-[#E0E0E0] dark:border-[#333333] space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
                {/* Search */}
                <div className="relative sm:col-span-2 lg:col-span-1">
                  <Search className="w-3.5 h-3.5 text-[#888888] absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={projectSearch}
                    onChange={(e) => setProjectSearch(e.target.value)}
                    placeholder="Search client, purpose, lead..."
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#F7F7F7] dark:bg-[#1f1f1f] border border-[#E0E0E0] dark:border-[#333333] rounded-xl text-[#101010] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#E50914]"
                  />
                </div>

                {/* Filter by Manager */}
                <div className="space-y-1">
                  <select
                    value={managerFilter}
                    onChange={(e) => setManagerFilter(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-[#F7F7F7] dark:bg-[#1f1f1f] border border-[#E0E0E0] dark:border-[#333333] rounded-xl text-[#101010] dark:text-white cursor-pointer"
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
                    className="w-full px-3 py-1.5 text-xs bg-[#F7F7F7] dark:bg-[#1f1f1f] border border-[#E0E0E0] dark:border-[#333333] rounded-xl text-[#101010] dark:text-white cursor-pointer"
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
                    className="w-full px-3 py-1.5 text-xs bg-[#F7F7F7] dark:bg-[#1f1f1f] border border-[#E0E0E0] dark:border-[#333333] rounded-xl text-[#101010] dark:text-white cursor-pointer"
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
                    className="w-full px-3 py-1.5 text-xs bg-[#F7F7F7] dark:bg-[#1f1f1f] border border-[#E0E0E0] dark:border-[#333333] rounded-xl text-[#101010] dark:text-white cursor-pointer"
                  >
                    <option value="all">All Deadlines</option>
                    <option value="overdue">Overdue / At-Risk</option>
                    <option value="next7">Due within 7 Days</option>
                    <option value="next14">Due within 14 Days</option>
                  </select>
                </div>
              </div>

              {(managerFilter !== 'all' || leadFilter !== 'all' || projectStatusFilter !== 'all' || timelineFilter !== 'all' || projectSearch) && (
                <div className="flex items-center justify-between text-xs text-[#555555] dark:text-[#A3A3A3] pt-1">
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
                    className="text-[#E50914] hover:text-[#c40812] font-semibold cursor-pointer"
                  >
                    Clear All Filters
                  </button>
                </div>
              )}
            </div>

            {/* Centralized Projects Table */}
            <div className="overflow-x-auto border border-[#E0E0E0] dark:border-[#333333] rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F0F0F0] dark:bg-[#1c1c1c] text-[#101010] dark:text-white font-semibold border-b border-[#E0E0E0] dark:border-[#333333]">
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
                <tbody className="divide-y divide-[#EAEAEA] dark:divide-[#262626]">
                  {filteredProjects.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-xs text-[#555555] dark:text-[#A3A3A3]">
                        <Briefcase className="w-8 h-8 mx-auto text-[#CCCCCC] dark:text-[#444444] mb-2" />
                        <p className="font-semibold text-[#101010] dark:text-white">No Projects Found</p>
                        <p className="mt-1">Try adjusting your filters or click &quot;Create & Assign Project&quot; above.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredProjects.map((p) => {
                      const progressData = getProjectProgress(p.id);
                      const isDone = p.status === 'Done' || p.status === 'Completed' || progressData.progress === 100;
                      const isInProgress = p.status === 'In Progress' || (progressData.progress > 0 && !isDone);
                      const isOverdue = !isDone && new Date(p.deadline).getTime() < nowTime;

                      return (
                        <tr key={p.id} className="hover:bg-[#F9F9F9] dark:hover:bg-[#1a1a1a] transition-colors">
                          <td className="py-3.5 px-4 max-w-xs">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-[#101010] dark:text-white">{p.clientName}</span>
                              {p.companyName && (
                                <span className="text-[11px] text-[#777777] dark:text-[#888888] truncate">({p.companyName})</span>
                              )}
                            </div>
                            <p className="font-medium text-[#222222] dark:text-[#E0E0E0] leading-snug mt-0.5 truncate">
                              {p.purpose}
                            </p>
                            {p.description && (
                              <p className="text-[11px] text-[#555555] dark:text-[#A3A3A3] truncate mt-0.5">{p.description}</p>
                            )}
                          </td>

                          {/* Assigned Manager */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border bg-[#F0F0F0] dark:bg-[#202020] text-[#101010] dark:text-white border-[#E0E0E0] dark:border-[#333333]">
                              <Briefcase className="w-3.5 h-3.5 text-[#FF7900] shrink-0" />
                              <span>{p.managerName || 'Manager 1'}</span>
                            </span>
                          </td>

                          {/* Assigned Team Lead */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="flex items-center gap-1.5 font-medium text-[#101010] dark:text-white">
                              <UserCheck className="w-3.5 h-3.5 text-[#FFC928] shrink-0" />
                              <span>{p.leadName}</span>
                            </div>
                          </td>

                          {/* Dates & Duration */}
                          <td className="py-3.5 px-4 font-mono text-[11px] text-[#555555] dark:text-[#A3A3A3] whitespace-nowrap">
                            <div>{p.startDate} → {p.deadline}</div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[10px] font-bold text-[#FF7900] dark:text-[#FFC928]">
                                {p.duration || 'N/A'} Days
                              </span>
                              {isOverdue && (
                                <span className="text-[10px] font-semibold text-[#E50914] bg-[#E50914]/10 px-1.5 py-0.2 rounded border border-[#E50914]/30">
                                  Overdue
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Milestone Progress */}
                          <td className="py-3.5 px-4">
                            <div className="w-28 space-y-1">
                              <div className="flex justify-between text-[11px] font-mono tabular-nums">
                                <span className="font-semibold text-[#101010] dark:text-white">{progressData.progress}%</span>
                                <span className="text-[#777777] dark:text-[#888888]">
                                  {progressData.completedTasks}/{progressData.totalTasks} Done
                                </span>
                              </div>
                              <div className="w-full bg-[#EAEAEA] dark:bg-[#2a2a2a] h-1.5 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all ${
                                    isDone ? 'bg-[#FFC928]' : isOverdue ? 'bg-[#E50914]' : 'bg-[#FF7900]'
                                  }`}
                                  style={{ width: `${progressData.progress}%` }}
                                />
                              </div>
                            </div>
                          </td>

                          {/* Status */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span
                              className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-semibold border ${
                                isDone
                                  ? 'bg-[#F0F0F0] dark:bg-[#202020] text-[#101010] dark:text-white border-[#CCCCCC] dark:border-[#444444]'
                                  : isInProgress
                                  ? 'bg-[#FF7900]/15 text-[#FF7900] border-[#FF7900]/30'
                                  : 'bg-[#FFC928]/15 text-[#FFC928] border-[#FFC928]/30'
                              }`}
                            >
                              {isDone ? 'Done' : isInProgress ? 'In Progress' : 'New'}
                            </span>
                          </td>

                          {/* Action: Inspect Work Allocation */}
                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <button
                              onClick={() => setInspectingProject(p)}
                              className="px-3 py-1.5 text-xs font-semibold text-[#101010] dark:text-white bg-[#F0F0F0] dark:bg-[#202020] hover:bg-[#E5E5E5] dark:hover:bg-[#2a2a2a] border border-[#E0E0E0] dark:border-[#333333] rounded-xl transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                            >
                              <Eye className="w-3.5 h-3.5 text-[#FF7900]" />
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
        <div className="bg-white dark:bg-[#141414] rounded-2xl border border-[#E0E0E0] dark:border-[#333333] p-5 sm:p-6 space-y-6 shadow-xs transition-colors">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[#101010] dark:text-white">
              Flexible Team Allocation & Real-Time Availability
            </h2>
            <p className="text-xs text-[#555555] dark:text-[#A3A3A3] mt-0.5">
              Availability tracked based on current active task assignments, deadlines, and active workload (not merely completed tasks).
            </p>
          </div>

          {/* Teams Overview Strip (Flexible Team Sizes: e.g. 10, 5, 2 members) */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#101010] dark:text-white">
              Configured Delivery Teams
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {teams.map((tm) => (
                <div
                  key={tm.id}
                  className="p-4 rounded-xl border border-[#E0E0E0] dark:border-[#333333] bg-[#F9F9F9] dark:bg-[#1a1a1a] space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-[#101010] dark:text-white">{tm.name}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-[#FF7900]/15 text-[#FF7900] border border-[#FF7900]/30">
                      {tm.memberIds.length} Members
                    </span>
                  </div>
                  <p className="text-xs text-[#555555] dark:text-[#A3A3A3]">{tm.description}</p>
                  <div className="pt-2 border-t border-[#E0E0E0] dark:border-[#333333] flex items-center justify-between text-xs text-[#555555] dark:text-[#A3A3A3]">
                    <span>Lead: <strong className="text-[#101010] dark:text-white">{tm.leadName}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Member Workload & Availability Cards */}
          <div className="space-y-3 pt-4 border-t border-[#E0E0E0] dark:border-[#333333]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#101010] dark:text-white">
              Team Member Workload & Capacity Roster
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {users
                .filter((u) => u.role === 'team_member')
                .map((member) => {
                  const workload = getMemberWorkload(member.id);

                  const availabilityBadgeColor = {
                    Available: 'bg-[#FFC928]/15 text-[#FFC928] border-[#FFC928]/40',
                    Moderate: 'bg-[#FF7900]/15 text-[#FF7900] border-[#FF7900]/40',
                    Busy: 'bg-[#FF7900]/25 text-[#FF7900] border-[#FF7900]/50 font-bold',
                    Unavailable: 'bg-[#E50914]/15 text-[#E50914] border-[#E50914]/40 font-bold',
                  }[workload.availabilityStatus];

                  return (
                    <div
                      key={member.id}
                      className="p-5 border border-[#E0E0E0] dark:border-[#333333] rounded-xl bg-[#F9F9F9] dark:bg-[#1a1a1a] space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img
                            src={member.avatar}
                            alt={member.name}
                            referrerPolicy="no-referrer"
                            className="w-9 h-9 rounded-full object-cover border border-[#E0E0E0] dark:border-[#333333] shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="font-bold text-[#101010] dark:text-white truncate">
                              {member.name}
                            </p>
                            <p className="text-[11px] text-[#555555] dark:text-[#A3A3A3] font-mono truncate">{member.loginId}</p>
                          </div>
                        </div>

                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border shrink-0 ${availabilityBadgeColor}`}>
                          {workload.availabilityStatus}
                        </span>
                      </div>

                      {/* Workload breakdown */}
                      <div className="p-2.5 rounded-lg bg-white dark:bg-[#202020] border border-[#E0E0E0] dark:border-[#333333] space-y-1.5 text-xs">
                        <div className="flex justify-between text-[#555555] dark:text-[#A3A3A3]">
                          <span>Active Tasks:</span>
                          <strong className="text-[#101010] dark:text-white font-mono">{workload.activeTasksCount}</strong>
                        </div>
                        <div className="flex justify-between text-[#555555] dark:text-[#A3A3A3]">
                          <span>Completed Tasks:</span>
                          <strong className="text-[#101010] dark:text-white font-mono">{workload.completedTasksCount}</strong>
                        </div>
                        {workload.overdueTasksCount > 0 && (
                          <div className="flex justify-between text-[#E50914] font-semibold">
                            <span>Overdue Tasks:</span>
                            <span className="font-mono">{workload.overdueTasksCount}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-[#555555] dark:text-[#A3A3A3]">
                          <span>Upcoming (3d):</span>
                          <span className="font-mono text-[#101010] dark:text-white">{workload.upcomingDeadlinesCount}</span>
                        </div>
                      </div>

                      <p className="text-[11px] text-[#555555] dark:text-[#A3A3A3]">
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
        <div className="bg-white dark:bg-[#141414] rounded-2xl border border-[#E0E0E0] dark:border-[#333333] p-5 sm:p-6 space-y-5 shadow-xs transition-colors">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#101010] dark:text-white">
                Client Directory
              </h2>
              <p className="text-xs text-[#555555] dark:text-[#A3A3A3] mt-0.5">
                Overview of client records and assigned delivery architects.
              </p>
            </div>
            <button
              onClick={() => setAddClientOpen(true)}
              className="px-3.5 py-2 text-xs font-bold text-white bg-[#E50914] hover:bg-[#c40812] rounded-xl shadow-xs transition-colors flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Client</span>
            </button>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-3.5 h-3.5 text-[#888888] absolute left-3 top-2.5" />
              <input
                type="text"
                value={clientSearch}
                onChange={(e) => setClientSearch(e.target.value)}
                placeholder="Search clients..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#F7F7F7] dark:bg-[#1f1f1f] border border-[#E0E0E0] dark:border-[#333333] rounded-xl text-[#101010] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#E50914]"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-[#555555] dark:text-[#A3A3A3]">Status:</span>
              <select
                value={clientStatusFilter}
                onChange={(e) => setClientStatusFilter(e.target.value)}
                className="px-3 py-1.5 text-xs bg-[#F7F7F7] dark:bg-[#1f1f1f] border border-[#E0E0E0] dark:border-[#333333] rounded-xl text-[#101010] dark:text-white cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Onboarding">Onboarding</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>

          {/* Client Table */}
          <div className="overflow-x-auto border border-[#E0E0E0] dark:border-[#333333] rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F0F0F0] dark:bg-[#1c1c1c] text-[#101010] dark:text-white font-semibold border-b border-[#E0E0E0] dark:border-[#333333]">
                <tr>
                  <th className="py-3 px-4">Client Name</th>
                  <th className="py-3 px-4">Industry / Domain</th>
                  <th className="py-3 px-4">Account Tier</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAEAEA] dark:divide-[#262626]">
                {filteredClients.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-xs text-[#555555] dark:text-[#A3A3A3]">
                      No clients added yet. Click &quot;Add New Client&quot; to register a client record.
                    </td>
                  </tr>
                ) : (
                  filteredClients.map((client) => (
                    <tr
                      key={client.id}
                      className="hover:bg-[#F9F9F9] dark:hover:bg-[#1a1a1a] transition-colors cursor-pointer"
                      onClick={() => setSelectedClient(client)}
                    >
                      <td className="py-3.5 px-4 font-bold text-[#101010] dark:text-white">
                        {client.name}
                      </td>
                      <td className="py-3.5 px-4 text-[#555555] dark:text-[#A3A3A3]">
                        {client.industry}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-[#F0F0F0] dark:bg-[#202020] text-[#101010] dark:text-white border border-[#E0E0E0] dark:border-[#333333]">
                          {client.tier}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-semibold border ${
                          client.status === 'Completed'
                            ? 'bg-[#F0F0F0] dark:bg-[#202020] text-[#101010] dark:text-white border-[#CCCCCC] dark:border-[#444444]'
                            : client.status === 'Active'
                            ? 'bg-[#FF7900]/15 text-[#FF7900] border-[#FF7900]/30'
                            : 'bg-[#FFC928]/15 text-[#FFC928] border-[#FFC928]/30'
                        }`}>
                          {client.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setSelectedClient(client)}
                          className="text-xs font-semibold text-[#E50914] hover:text-[#c40812] cursor-pointer"
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
        <div className="bg-white dark:bg-[#141414] rounded-2xl border border-[#E0E0E0] dark:border-[#333333] p-5 sm:p-6 space-y-5 shadow-xs transition-colors">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#101010] dark:text-white">
                Project Task Registry
              </h2>
              <p className="text-xs text-[#555555] dark:text-[#A3A3A3] mt-0.5">
                Centralized monitoring of deliverable tasks, assignees, and progress status.
              </p>
            </div>
            <button
              onClick={() => setAddTaskOpen(true)}
              className="px-3.5 py-2 text-xs font-bold text-white bg-[#E50914] hover:bg-[#c40812] rounded-xl shadow-xs transition-colors flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Assign New Task</span>
            </button>
          </div>

          <div className="overflow-x-auto border border-[#E0E0E0] dark:border-[#333333] rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F0F0F0] dark:bg-[#1c1c1c] text-[#101010] dark:text-white font-semibold border-b border-[#E0E0E0] dark:border-[#333333]">
                <tr>
                  <th className="py-3 px-4">Task Name</th>
                  <th className="py-3 px-4">Project</th>
                  <th className="py-3 px-4">Assignee</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAEAEA] dark:divide-[#262626]">
                {filteredTasks.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-xs text-[#555555] dark:text-[#A3A3A3]">
                      No tasks assigned yet.
                    </td>
                  </tr>
                ) : (
                  filteredTasks.map((t) => (
                    <tr
                      key={t.id}
                      className="hover:bg-[#F9F9F9] dark:hover:bg-[#1a1a1a] transition-colors cursor-pointer"
                      onClick={() => setSelectedTask(t)}
                    >
                      <td className="py-3.5 px-4 font-bold text-[#101010] dark:text-white">
                        {t.title}
                      </td>
                      <td className="py-3.5 px-4 text-[#555555] dark:text-[#A3A3A3]">
                        {t.projectTitle}
                      </td>
                      <td className="py-3.5 px-4 text-[#101010] dark:text-white font-medium">
                        {t.assigneeName}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[#555555] dark:text-[#A3A3A3]">
                        {t.deadline}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-semibold border ${
                            t.status === 'Done' || t.status === 'Completed'
                              ? 'bg-[#F0F0F0] dark:bg-[#202020] text-[#101010] dark:text-white border-[#CCCCCC] dark:border-[#444444]'
                              : t.status === 'In Progress'
                              ? 'bg-[#FF7900]/15 text-[#FF7900] border-[#FF7900]/30'
                              : 'bg-[#FFC928]/15 text-[#FFC928] border-[#FFC928]/30'
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
        <div className="bg-white dark:bg-[#141414] rounded-2xl border border-[#E0E0E0] dark:border-[#333333] p-5 sm:p-6 space-y-6 shadow-xs transition-colors">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[#101010] dark:text-white">
              Project & Task Deadline Alerts
            </h2>
            <p className="text-xs text-[#555555] dark:text-[#A3A3A3] mt-0.5">
              Live tracking of approaching deadlines and overdue items across all initiatives.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#101010] dark:text-white">
              Project Milestone Alerts
            </h3>
            {projectDeadlineAlerts.length === 0 ? (
              <div className="p-6 bg-[#F9F9F9] dark:bg-[#1a1a1a] rounded-xl text-xs text-[#555555] dark:text-[#A3A3A3] text-center border border-[#E0E0E0] dark:border-[#333333]">
                All projects are comfortably within their scheduled target deadlines.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {projectDeadlineAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-4 rounded-xl border flex items-start gap-3 ${
                      alert.isOverdue
                        ? 'bg-[#E50914]/10 border-[#E50914]/30 text-[#E50914]'
                        : 'bg-[#FF7900]/10 border-[#FF7900]/30 text-[#FF7900]'
                    }`}
                  >
                    <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-xs">{alert.title}</span>
                        <span className="text-[10px] font-mono font-bold">{alert.daysText}</span>
                      </div>
                      <p className="text-xs leading-relaxed">{alert.purpose}</p>
                      <div className="text-[11px] opacity-80">
                        Lead: {alert.lead} · Target: {alert.deadline}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <h3 className="text-xs font-bold uppercase tracking-wider text-[#101010] dark:text-white pt-4">
              Urgent Task Alerts
            </h3>
            {taskDeadlineAlerts.length === 0 ? (
              <div className="p-6 bg-[#F9F9F9] dark:bg-[#1a1a1a] rounded-xl text-xs text-[#555555] dark:text-[#A3A3A3] text-center border border-[#E0E0E0] dark:border-[#333333]">
                No critical or approaching task deadlines found.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {taskDeadlineAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-4 rounded-xl border flex items-start gap-3 ${
                      alert.isOverdue
                        ? 'bg-[#E50914]/10 border-[#E50914]/30 text-[#E50914]'
                        : 'bg-[#FF7900]/10 border-[#FF7900]/30 text-[#FF7900]'
                    }`}
                  >
                    <Clock className="w-5 h-5 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-xs">{alert.title}</span>
                        <span className="text-[10px] font-mono font-bold">{alert.daysText}</span>
                      </div>
                      <p className="text-xs leading-relaxed">Project: {alert.purpose}</p>
                      <div className="text-[11px] opacity-80">
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
        <ReportsAnalyticsView role="manager" />
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
