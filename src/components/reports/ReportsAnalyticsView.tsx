import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Project, Task, UserRole } from '../../types';
import { downloadProjectAnalyticsPDF } from '../../utils/pdfExport';
import {
  BarChart3,
  PieChart as PieChartIcon,
  Calendar,
  Download,
  FileSpreadsheet,
  Printer,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Briefcase,
  Users,
  CheckSquare,
  TrendingUp,
  ArrowUpRight,
  Shield,
  Layers,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area,
} from 'recharts';

interface ReportsAnalyticsViewProps {
  role?: UserRole;
  leadId?: string;
}

export const ReportsAnalyticsView: React.FC<ReportsAnalyticsViewProps> = ({ role, leadId }) => {
  const {
    currentUser,
    projects,
    tasks,
    users,
    teams,
    getProjectProgress,
    getMemberWorkload,
  } = useApp();

  const userRole = role || currentUser?.role || 'manager';
  const effectiveLeadId = leadId || (userRole === 'team_lead' ? currentUser?.id : undefined);

  // Timeframe and Project Filters
  const [timeframe, setTimeframe] = useState<'today' | 'week' | 'month' | 'year' | 'custom'>('month');
  const [customStart, setCustomStart] = useState<string>('');
  const [customEnd, setCustomEnd] = useState<string>('');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');

  // RBAC scope isolation
  const scopedProjects = useMemo(() => {
    if (userRole === 'admin' || userRole === 'manager') {
      return projects;
    }
    if (userRole === 'team_lead') {
      return projects.filter((p) => p.leadId === effectiveLeadId);
    }
    if (userRole === 'team_member') {
      // Projects where member has assigned tasks
      const myTaskProjectIds = new Set(
        tasks.filter((t) => t.assigneeId === currentUser?.id).map((t) => t.projectId)
      );
      return projects.filter((p) => myTaskProjectIds.has(p.id));
    }
    return projects;
  }, [projects, tasks, userRole, effectiveLeadId, currentUser]);

  const scopedTasks = useMemo(() => {
    if (userRole === 'admin' || userRole === 'manager') {
      return tasks;
    }
    if (userRole === 'team_lead') {
      return tasks.filter(
        (t) =>
          t.leadId === effectiveLeadId ||
          scopedProjects.some((p) => p.id === t.projectId)
      );
    }
    if (userRole === 'team_member') {
      return tasks.filter((t) => t.assigneeId === currentUser?.id);
    }
    return tasks;
  }, [tasks, userRole, effectiveLeadId, scopedProjects, currentUser]);

  // Apply project filter and date filter
  const filteredProjects = useMemo(() => {
    return scopedProjects.filter((p) => {
      if (selectedProjectId !== 'all' && p.id !== selectedProjectId) return false;
      return true;
    });
  }, [scopedProjects, selectedProjectId]);

  const filteredTasks = useMemo(() => {
    const now = new Date();
    return scopedTasks.filter((t) => {
      if (selectedProjectId !== 'all' && t.projectId !== selectedProjectId) return false;

      if (!t.assignedDate && !t.deadline) return true;
      const taskDate = new Date(t.assignedDate || t.deadline);

      if (timeframe === 'today') {
        const todayStr = now.toISOString().substring(0, 10);
        return t.assignedDate === todayStr || t.deadline === todayStr;
      }
      if (timeframe === 'week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return taskDate >= weekAgo;
      }
      if (timeframe === 'month') {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return taskDate >= monthAgo;
      }
      if (timeframe === 'year') {
        const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        return taskDate >= yearAgo;
      }
      if (timeframe === 'custom') {
        if (customStart && taskDate < new Date(customStart)) return false;
        if (customEnd && taskDate > new Date(customEnd + 'T23:59:59')) return false;
        return true;
      }
      return true;
    });
  }, [scopedTasks, selectedProjectId, timeframe, customStart, customEnd]);

  // Dynamic Statistics
  const nowTime = Date.now();
  const totalProjectsCount = filteredProjects.length;
  const completedProjectsCount = filteredProjects.filter(
    (p) => p.status === 'Done' || p.status === 'Completed' || getProjectProgress(p.id).progress === 100
  ).length;
  const ongoingProjectsCount = filteredProjects.filter((p) => {
    const isDone = p.status === 'Done' || p.status === 'Completed' || getProjectProgress(p.id).progress === 100;
    return !isDone;
  }).length;
  const delayedProjectsCount = filteredProjects.filter((p) => {
    const isDone = p.status === 'Done' || p.status === 'Completed' || getProjectProgress(p.id).progress === 100;
    return !isDone && new Date(p.deadline).getTime() < nowTime;
  }).length;

  const totalTasksCount = filteredTasks.length;
  const completedTasksCount = filteredTasks.filter(
    (t) => t.status === 'Done' || t.status === 'Completed'
  ).length;
  const pendingTasksCount = filteredTasks.filter(
    (t) => t.status !== 'Done' && t.status !== 'Completed'
  ).length;
  const overdueTasksCount = filteredTasks.filter(
    (t) => (t.status !== 'Done' && t.status !== 'Completed') && new Date(t.deadline).getTime() < nowTime
  ).length;

  const overallVelocity =
    totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;

  // Chart 1: Project Status Distribution (Pie / Donut)
  const projectStatusData = [
    { name: 'Completed / Done', value: completedProjectsCount, color: '#FFC928' },
    {
      name: 'Ongoing / In Progress',
      value: Math.max(0, ongoingProjectsCount - delayedProjectsCount),
      color: '#FF7900',
    },
    { name: 'Delayed / Overdue', value: delayedProjectsCount, color: '#E50914' },
  ].filter((d) => d.value > 0);

  // Fallback if 0
  const finalProjectStatusData =
    projectStatusData.length > 0
      ? projectStatusData
      : [{ name: 'No Projects', value: 1, color: '#333333' }];

  // Chart 2: Task Completion Status
  const taskStatusData = [
    { name: 'Completed', count: completedTasksCount, fill: '#FFC928' },
    {
      name: 'In Progress',
      count: filteredTasks.filter((t) => t.status === 'In Progress').length,
      fill: '#FF7900',
    },
    {
      name: 'Pending / To Do',
      count: filteredTasks.filter((t) => t.status === 'New' || t.status === 'To Do').length,
      fill: '#A3A3A3',
    },
  ];

  // Chart 3: Component Distribution
  const componentNames = ['Frontend Development', 'Backend Development', 'Application Integration', 'Testing & QA'];
  const componentData = componentNames.map((comp) => ({
    component: comp.replace(' Development', '').replace(' & QA', ''),
    tasks: filteredTasks.filter((t) => (t.workComponent || '').toLowerCase().includes(comp.split(' ')[0].toLowerCase())).length,
    fill: comp.includes('Frontend') ? '#E50914' : comp.includes('Backend') ? '#FF7900' : comp.includes('Integration') ? '#FFC928' : '#FFFFFF',
  }));

  // Chart 4: Team Workload (for Manager & Team Lead)
  const teamWorkloadData = users
    .filter((u) => u.role === 'team_member')
    .map((member) => {
      const memberTasks = filteredTasks.filter((t) => t.assigneeId === member.id);
      const done = memberTasks.filter((t) => t.status === 'Done' || t.status === 'Completed').length;
      const active = memberTasks.length - done;
      return {
        name: member.name.split(' ')[0] + ' ' + (member.name.split(' ')[1] || ''),
        activeTasks: active,
        completedTasks: done,
        total: memberTasks.length,
      };
    })
    .filter((m) => m.total > 0 || userRole !== 'team_member')
    .slice(0, 8);

  // Export to Excel / CSV
  const handleExportCSV = () => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `CMS_Reports_${userRole}_${timeframe}_${timestamp}.csv`;

    let csvContent = '\uFEFF'; // UTF-8 BOM for Excel
    csvContent += `CLIENT MANAGEMENT SYSTEM - ${userRole.toUpperCase()} REPORTS & ANALYTICS\n`;
    csvContent += `Generated At: ${new Date().toLocaleString()}\n`;
    csvContent += `Timeframe Filter: ${timeframe.toUpperCase()}\n`;
    csvContent += `Selected Project: ${selectedProjectId === 'all' ? 'All Projects' : selectedProjectId}\n\n`;

    // Summary Statistics
    csvContent += '--- SUMMARY STATISTICS ---\n';
    csvContent += `Total Projects,${totalProjectsCount}\n`;
    csvContent += `Completed Projects,${completedProjectsCount}\n`;
    csvContent += `Ongoing Projects,${ongoingProjectsCount}\n`;
    csvContent += `Delayed Projects,${delayedProjectsCount}\n`;
    csvContent += `Total Tasks,${totalTasksCount}\n`;
    csvContent += `Completed Tasks,${completedTasksCount}\n`;
    csvContent += `Pending Tasks,${pendingTasksCount}\n`;
    csvContent += `Overdue Tasks,${overdueTasksCount}\n`;
    csvContent += `Overall Velocity,${overallVelocity}%\n\n`;

    // Projects Roster
    csvContent += '--- PROJECT PROGRESS DATA ---\n';
    csvContent += 'Project ID,Client Name,Company,Purpose,Team Lead,Start Date,Deadline,Duration (Days),Progress %,Status\n';
    filteredProjects.forEach((p) => {
      const prog = getProjectProgress(p.id);
      csvContent += `"${p.id}","${p.clientName}","${p.companyName || ''}","${p.purpose || p.title}","${p.leadName}","${p.startDate}","${p.deadline}",${p.duration || ''},${prog.progress}%,${p.status}\n`;
    });

    csvContent += '\n--- TASK DELIVERABLES DATA ---\n';
    csvContent += 'Task ID,Task Title,Project,Assignee,Status,Assigned Date,Due Date,Logged Hours\n';
    filteredTasks.forEach((t) => {
      csvContent += `"${t.id}","${t.title}","${t.projectTitle}","${t.assigneeName}","${t.status}","${t.assignedDate || ''}","${t.deadline}",${t.loggedHours || 0}\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export to PDF using high-fidelity jsPDF document generator
  const handlePrintPDF = () => {
    downloadProjectAnalyticsPDF({
      projects: filteredProjects,
      tasks: filteredTasks,
      managerName: currentUser?.name || 'Authorized Lead',
      timeframeLabel: timeframe.toUpperCase(),
      statusFilter: selectedProjectId !== 'all' ? selectedProjectId : undefined,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header and Export Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#141414] p-5 sm:p-6 rounded-2xl border border-[#E0E0E0] dark:border-[#333333] shadow-xs transition-colors">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#E50914]/10 text-[#E50914] border border-[#E50914]/25">
              <BarChart3 className="w-5 h-5" />
            </span>
            <h2 className="text-base sm:text-xl font-bold text-[#101010] dark:text-white">
              {userRole === 'manager'
                ? 'Manager Executive Reports & Analytics'
                : userRole === 'team_lead'
                ? 'Team Lead Velocity & Milestone Reports'
                : userRole === 'team_member'
                ? 'My Deliverable & Task Analytics'
                : 'Enterprise System Reports & Audit Analytics'}
            </h2>
          </div>
          <p className="text-xs text-[#555555] dark:text-[#A3A3A3] mt-1">
            Dynamically aggregated performance statistics, milestone velocity, and export capabilities.
          </p>
        </div>

        {/* Action Buttons: Export CSV / PDF */}
        <div className="flex items-center gap-2.5 self-start md:self-auto">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 text-xs font-semibold text-[#101010] dark:text-white bg-[#F0F0F0] hover:bg-[#E5E5E5] dark:bg-[#1e1e1e] dark:hover:bg-[#282828] rounded-xl border border-[#E0E0E0] dark:border-[#333333] transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
            title="Download report data as Excel CSV"
          >
            <FileSpreadsheet className="w-4 h-4 text-[#FFC928]" />
            <span>Export Excel</span>
          </button>
          <button
            onClick={handlePrintPDF}
            className="px-3.5 py-2 text-xs font-bold text-white bg-[#E50914] hover:bg-[#c40812] rounded-xl shadow-xs shadow-[#E50914]/25 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
            title="Download formatted executive PDF report"
          >
            <Download className="w-4 h-4" />
            <span>Download Report (PDF)</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar: Timeframe & Project Selection */}
      <div className="bg-white dark:bg-[#141414] p-4 rounded-2xl border border-[#E0E0E0] dark:border-[#333333] flex flex-wrap items-center justify-between gap-4 text-xs shadow-xs transition-colors">
        {/* Timeframe Chips */}
        <div className="flex items-center gap-2">
          <span className="font-semibold text-[#555555] dark:text-[#A3A3A3] flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-[#FF7900]" />
            <span>Period:</span>
          </span>
          <div className="inline-flex rounded-xl p-1 bg-[#F0F0F0] dark:bg-[#1e1e1e] gap-1">
            {(['today', 'week', 'month', 'year', 'custom'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTimeframe(t)}
                className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer capitalize ${
                  timeframe === t
                    ? 'bg-[#E50914] text-white font-bold shadow-xs'
                    : 'text-[#555555] dark:text-[#A3A3A3] hover:text-[#101010] dark:hover:text-white'
                }`}
              >
                {t === 'today'
                  ? 'Today'
                  : t === 'week'
                  ? 'This Week'
                  : t === 'month'
                  ? 'This Month'
                  : t === 'year'
                  ? 'This Year'
                  : 'Custom Range'}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Date Inputs if 'custom' is active */}
        {timeframe === 'custom' && (
          <div className="flex items-center gap-2 font-mono">
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="px-2.5 py-1 text-xs bg-[#F7F7F7] dark:bg-[#1f1f1f] border border-[#E0E0E0] dark:border-[#333333] rounded-lg text-[#101010] dark:text-white"
            />
            <span className="text-[#888888]">→</span>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="px-2.5 py-1 text-xs bg-[#F7F7F7] dark:bg-[#1f1f1f] border border-[#E0E0E0] dark:border-[#333333] rounded-lg text-[#101010] dark:text-white"
            />
          </div>
        )}

        {/* Project-Wise Filter */}
        <div className="flex items-center gap-2">
          <span className="font-semibold text-[#555555] dark:text-[#A3A3A3] flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-[#FF7900]" />
            <span>Project Filter:</span>
          </span>
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="px-3 py-1.5 text-xs bg-[#F7F7F7] dark:bg-[#1f1f1f] border border-[#E0E0E0] dark:border-[#333333] rounded-xl text-[#101010] dark:text-white cursor-pointer max-w-xs truncate"
          >
            <option value="all">All Accessible Projects ({scopedProjects.length})</option>
            {scopedProjects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.clientName} - {p.purpose || p.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 bg-white dark:bg-[#141414] rounded-2xl border border-[#E0E0E0] dark:border-[#333333] shadow-xs transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#555555] dark:text-[#A3A3A3]">
              {userRole === 'team_member' ? 'My Projects' : 'Total Projects'}
            </span>
            <Briefcase className="w-4 h-4 text-[#FF7900]" />
          </div>
          <p className="text-2xl font-bold text-[#101010] dark:text-white mt-2 font-mono tabular-nums">
            {totalProjectsCount}
          </p>
          <p className="text-[11px] text-[#555555] dark:text-[#A3A3A3] mt-1">
            {completedProjectsCount} Done · {ongoingProjectsCount} Ongoing
          </p>
        </div>

        <div className="p-5 bg-white dark:bg-[#141414] rounded-2xl border border-[#E0E0E0] dark:border-[#333333] shadow-xs transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#555555] dark:text-[#A3A3A3]">
              {userRole === 'team_member' ? 'My Total Tasks' : 'Total Tasks'}
            </span>
            <CheckSquare className="w-4 h-4 text-[#FFC928]" />
          </div>
          <p className="text-2xl font-bold text-[#101010] dark:text-white mt-2 font-mono tabular-nums">
            {totalTasksCount}
          </p>
          <p className="text-[11px] text-[#555555] dark:text-[#A3A3A3] mt-1">
            {completedTasksCount} Completed · {pendingTasksCount} Pending
          </p>
        </div>

        <div className="p-5 bg-white dark:bg-[#141414] rounded-2xl border border-[#E0E0E0] dark:border-[#333333] shadow-xs transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#555555] dark:text-[#A3A3A3]">Delivery Velocity</span>
            <TrendingUp className="w-4 h-4 text-[#FFC928]" />
          </div>
          <p className="text-2xl font-bold text-[#FFC928] mt-2 font-mono tabular-nums">
            {overallVelocity}%
          </p>
          <p className="text-[11px] text-[#555555] dark:text-[#A3A3A3] mt-1">
            Overall task completion rate
          </p>
        </div>

        <div className="p-5 bg-white dark:bg-[#141414] rounded-2xl border border-[#E0E0E0] dark:border-[#333333] shadow-xs transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#555555] dark:text-[#A3A3A3]">Delayed / Overdue</span>
            <AlertTriangle className="w-4 h-4 text-[#E50914]" />
          </div>
          <p className="text-2xl font-bold text-[#E50914] mt-2 font-mono tabular-nums">
            {overdueTasksCount}
          </p>
          <p className="text-[11px] text-[#555555] dark:text-[#A3A3A3] mt-1">
            {overdueTasksCount > 0 ? 'Requires attention' : 'All milestones on schedule'}
          </p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Project Status Distribution */}
        <div className="bg-white dark:bg-[#141414] p-5 sm:p-6 rounded-2xl border border-[#E0E0E0] dark:border-[#333333] shadow-xs space-y-4 transition-colors">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#101010] dark:text-white flex items-center gap-2">
              <PieChartIcon className="w-4 h-4 text-[#FF7900]" />
              <span>Project Status Distribution</span>
            </h3>
            <span className="text-xs text-[#555555] dark:text-[#A3A3A3] font-mono">{totalProjectsCount} Total</span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={finalProjectStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {finalProjectStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#101010',
                    borderColor: '#333333',
                    borderRadius: '0.75rem',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Legend verticalAlign="bottom" wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Task Completion Status */}
        <div className="bg-white dark:bg-[#141414] p-5 sm:p-6 rounded-2xl border border-[#E0E0E0] dark:border-[#333333] shadow-xs space-y-4 transition-colors">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#101010] dark:text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#FFC928]" />
              <span>Task Completion Breakdown</span>
            </h3>
            <span className="text-xs text-[#555555] dark:text-[#A3A3A3] font-mono">{totalTasksCount} Tasks</span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={taskStatusData} margin={{ top: 10, right: 10, bottom: 20, left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#101010',
                    borderColor: '#333333',
                    borderRadius: '0.75rem',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" name="Tasks" radius={[6, 6, 0, 0]} maxBarSize={45}>
                  {taskStatusData.map((entry, index) => (
                    <Cell key={`task-cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Deliverable Component Distribution */}
        <div className="bg-white dark:bg-[#141414] p-5 sm:p-6 rounded-2xl border border-[#E0E0E0] dark:border-[#333333] shadow-xs space-y-4 transition-colors">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#101010] dark:text-white flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-[#E50914]" />
              <span>Deliverable Component Breakdown</span>
            </h3>
            <span className="text-xs text-[#555555] dark:text-[#A3A3A3] font-mono">By Module</span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={componentData} margin={{ top: 10, right: 10, bottom: 20, left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="component" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#101010',
                    borderColor: '#333333',
                    borderRadius: '0.75rem',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="tasks" name="Tasks" radius={[6, 6, 0, 0]} maxBarSize={45}>
                  {componentData.map((entry, index) => (
                    <Cell key={`comp-cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Team Workload (Manager & Lead) or Personal Timeline (Member) */}
        <div className="bg-white dark:bg-[#141414] p-5 sm:p-6 rounded-2xl border border-[#E0E0E0] dark:border-[#333333] shadow-xs space-y-4 transition-colors">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#101010] dark:text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-[#FF7900]" />
              <span>
                {userRole === 'team_member' ? 'My Workload Breakdown' : 'Team Member Workload Distribution'}
              </span>
            </h3>
            <span className="text-xs text-[#555555] dark:text-[#A3A3A3] font-mono">Capacity Load</span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={teamWorkloadData}
                margin={{ top: 10, right: 10, bottom: 20, left: -10 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#101010',
                    borderColor: '#333333',
                    borderRadius: '0.75rem',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar
                  dataKey="activeTasks"
                  name="Active Tasks"
                  fill="#FF7900"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={30}
                />
                <Bar
                  dataKey="completedTasks"
                  name="Completed Tasks"
                  fill="#FFC928"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={30}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Data Table: Projects Breakdown */}
      <div className="bg-white dark:bg-[#141414] rounded-2xl border border-[#E0E0E0] dark:border-[#333333] p-5 sm:p-6 space-y-4 shadow-xs transition-colors">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-[#101010] dark:text-white flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-[#E50914]" />
            <span>Project Performance Breakdown</span>
          </h3>
          <span className="text-xs text-[#555555] dark:text-[#A3A3A3] font-mono">
            {filteredProjects.length} Projects Tracked
          </span>
        </div>

        <div className="overflow-x-auto border border-[#E0E0E0] dark:border-[#333333] rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F0F0F0] dark:bg-[#1c1c1c] text-[#101010] dark:text-white font-semibold border-b border-[#E0E0E0] dark:border-[#333333]">
              <tr>
                <th className="py-3 px-4">Client & Company</th>
                <th className="py-3 px-4">Purpose</th>
                <th className="py-3 px-4">Team Lead</th>
                <th className="py-3 px-4">Start & Deadline</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4">Milestone Progress</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAEAEA] dark:divide-[#262626]">
              {filteredProjects.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-xs text-[#555555] dark:text-[#A3A3A3]">
                    No projects found for the selected period.
                  </td>
                </tr>
              ) : (
                filteredProjects.map((p) => {
                  const prog = getProjectProgress(p.id);
                  const isDone = p.status === 'Done' || p.status === 'Completed' || prog.progress === 100;
                  return (
                    <tr key={p.id} className="hover:bg-[#F9F9F9] dark:hover:bg-[#1a1a1a] transition-colors">
                      <td className="py-3.5 px-4 font-bold text-[#101010] dark:text-white">
                        {p.clientName}
                        {p.companyName && (
                          <span className="block text-[11px] font-normal text-[#555555] dark:text-[#A3A3A3]">
                            {p.companyName}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 max-w-xs truncate text-[#101010] dark:text-white">
                        {p.purpose || p.title}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-[#555555] dark:text-[#A3A3A3]">
                        {p.leadName}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-[#555555] dark:text-[#A3A3A3]">
                        {p.startDate} → {p.deadline}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-[#555555] dark:text-[#A3A3A3]">
                        {p.duration ? `${p.duration}d` : 'N/A'}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="w-28 space-y-1">
                          <div className="flex justify-between text-[11px] font-mono">
                            <span className="font-semibold text-[#101010] dark:text-white">{prog.progress}%</span>
                            <span className="text-[#555555] dark:text-[#A3A3A3]">
                              {prog.completedTasks}/{prog.totalTasks}
                            </span>
                          </div>
                          <div className="w-full bg-[#EAEAEA] dark:bg-[#262626] h-1.5 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                isDone ? 'bg-[#FFC928]' : 'bg-[#FF7900]'
                              }`}
                              style={{ width: `${prog.progress}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-semibold border ${
                            isDone
                              ? 'bg-[#F0F0F0] dark:bg-[#202020] text-[#101010] dark:text-white border-[#CCCCCC] dark:border-[#444444]'
                              : 'bg-[#FF7900]/15 text-[#FF7900] border border-[#FF7900]/30'
                          }`}
                        >
                          {isDone ? 'Done' : p.status}
                        </span>
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
  );
};
