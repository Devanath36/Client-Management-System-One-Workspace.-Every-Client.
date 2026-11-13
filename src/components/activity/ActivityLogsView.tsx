import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { ActivityLog, UserRole } from '../../types';
import {
  Clock,
  Search,
  Filter,
  Download,
  Shield,
  UserCheck,
  CheckCircle2,
  FileCheck2,
  Briefcase,
  CheckSquare,
  AlertCircle,
  ArrowRight,
  RotateCcw,
  Calendar,
  Lock,
} from 'lucide-react';

export const ActivityLogsView: React.FC = () => {
  const { activityLogs, currentUser, users, projects, tasks, showToast } = useApp();

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedActor, setSelectedActor] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month' | 'custom'>('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  // RBAC isolation for logs
  const visibleLogs = useMemo(() => {
    if (!currentUser) return [];

    return activityLogs.filter((log) => {
      // 1. Admin sees everything
      if (currentUser.role === 'admin') return true;

      // 2. Team Member: Only see own actions or actions targeted at them or their tasks
      if (currentUser.role === 'team_member') {
        const isActor =
          log.actorLoginId === currentUser.loginId ||
          log.actorName === currentUser.name;
        const isTarget =
          log.target === currentUser.name ||
          log.target === currentUser.loginId ||
          log.details.includes(currentUser.name);
        const isMyTask = log.taskId
          ? tasks.some((t) => t.id === log.taskId && t.assigneeId === currentUser.id)
          : false;

        return isActor || isTarget || isMyTask;
      }

      // 3. Team Lead: See logs related to assigned projects, tasks in those projects, or assigned members
      if (currentUser.role === 'team_lead') {
        const myProjectIds = projects
          .filter((p) => p.leadId === currentUser.id)
          .map((p) => p.id);
        const myTaskIds = tasks
          .filter((t) => t.leadId === currentUser.id || (t.projectId && myProjectIds.includes(t.projectId)))
          .map((t) => t.id);

        const isActor =
          log.actorLoginId === currentUser.loginId ||
          log.actorName === currentUser.name;
        const isMyProject = log.projectId ? myProjectIds.includes(log.projectId) : false;
        const isMyTask = log.taskId ? myTaskIds.includes(log.taskId) : false;
        const mentionsMyLead = log.details.includes(currentUser.name) || log.target === currentUser.name;

        return isActor || isMyProject || isMyTask || mentionsMyLead;
      }

      // 4. Manager: See project, client, task, and team activities
      if (currentUser.role === 'manager') {
        return log.category !== 'security' || log.actorRole !== 'admin';
      }

      return false;
    });
  }, [activityLogs, currentUser, projects, tasks]);

  // Apply User-Selected Filters
  const filteredLogs = useMemo(() => {
    return visibleLogs.filter((log) => {
      // Text Search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesText =
          log.action.toLowerCase().includes(query) ||
          log.target.toLowerCase().includes(query) ||
          log.details.toLowerCase().includes(query) ||
          log.actorName.toLowerCase().includes(query) ||
          (log.actorLoginId && log.actorLoginId.toLowerCase().includes(query)) ||
          (log.projectName && log.projectName.toLowerCase().includes(query)) ||
          (log.taskTitle && log.taskTitle.toLowerCase().includes(query));

        if (!matchesText) return false;
      }

      // Role Filter
      if (selectedRole !== 'all' && log.actorRole !== selectedRole) {
        return false;
      }

      // Category Filter
      if (selectedCategory !== 'all' && log.category !== selectedCategory) {
        return false;
      }

      // Actor Filter
      if (selectedActor !== 'all' && (log.actorLoginId !== selectedActor && log.actorName !== selectedActor)) {
        return false;
      }

      // Date Range Filter
      const logDate = new Date(log.timestamp.replace(' ', 'T')).getTime();
      const now = new Date();

      if (dateFilter === 'today') {
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        if (logDate < startOfToday) return false;
      } else if (dateFilter === 'week') {
        const startOfWeek = now.getTime() - 7 * 24 * 60 * 60 * 1000;
        if (logDate < startOfWeek) return false;
      } else if (dateFilter === 'month') {
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
        if (logDate < startOfMonth) return false;
      } else if (dateFilter === 'custom') {
        if (customStartDate) {
          const start = new Date(customStartDate).getTime();
          if (logDate < start) return false;
        }
        if (customEndDate) {
          const end = new Date(customEndDate).getTime() + 24 * 60 * 60 * 1000;
          if (logDate > end) return false;
        }
      }

      return true;
    }).sort((a, b) => {
      const timeA = new Date(a.timestamp.replace(' ', 'T')).getTime() || 0;
      const timeB = new Date(b.timestamp.replace(' ', 'T')).getTime() || 0;
      return sortOrder === 'newest' ? timeB - timeA : timeA - timeB;
    });
  }, [
    visibleLogs,
    searchQuery,
    selectedRole,
    selectedCategory,
    selectedActor,
    dateFilter,
    customStartDate,
    customEndDate,
    sortOrder,
  ]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedRole('all');
    setSelectedCategory('all');
    setSelectedActor('all');
    setDateFilter('all');
    setCustomStartDate('');
    setCustomEndDate('');
    setSortOrder('newest');
  };

  // Export to Excel-compatible CSV with UTF-8 BOM
  const handleExportCSV = () => {
    const headers = [
      'Timestamp',
      'Actor Name',
      'Actor Login ID',
      'Actor Role',
      'Action',
      'Target',
      'Category',
      'Project Name',
      'Task Title',
      'Previous Value',
      'Updated Value',
      'Details',
    ];

    const rows = filteredLogs.map((log) => [
      `"${log.timestamp}"`,
      `"${(log.actorName || '').replace(/"/g, '""')}"`,
      `"${(log.actorLoginId || '').replace(/"/g, '""')}"`,
      `"${(log.actorRole || '').replace(/"/g, '""')}"`,
      `"${(log.action || '').replace(/"/g, '""')}"`,
      `"${(log.target || '').replace(/"/g, '""')}"`,
      `"${(log.category || '').replace(/"/g, '""')}"`,
      `"${(log.projectName || '').replace(/"/g, '""')}"`,
      `"${(log.taskTitle || '').replace(/"/g, '""')}"`,
      `"${(log.previousValue || '').replace(/"/g, '""')}"`,
      `"${(log.updatedValue || '').replace(/"/g, '""')}"`,
      `"${(log.details || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cms_audit_trail_${new Date().toISOString().substring(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('success', 'Export Complete', 'Audit history exported to Excel CSV.');
  };

  // Category Icon & Badge
  const getCategoryBadge = (category: ActivityLog['category']) => {
    switch (category) {
      case 'auth':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-[#171717] text-[#FFC928] border border-[#333333]">
            <Lock className="w-2.5 h-2.5" />
            Auth
          </span>
        );
      case 'project':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-[#171717] text-[#FF7900] border border-[#333333]">
            <Briefcase className="w-2.5 h-2.5" />
            Project
          </span>
        );
      case 'task':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-[#171717] text-white border border-[#333333]">
            <CheckSquare className="w-2.5 h-2.5" />
            Task
          </span>
        );
      case 'security':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-[#E50914]/15 text-[#E50914] border border-[#E50914]/40">
            <Shield className="w-2.5 h-2.5" />
            Security
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-[#F7F7F7] dark:bg-[#171717] text-[#555555] dark:text-[#A3A3A3] border border-[#E0E0E0] dark:border-[#333333]">
            <Clock className="w-2.5 h-2.5" />
            System
          </span>
        );
    }
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return 'bg-[#171717] text-[#E50914] border border-[#E50914]/40';
      case 'manager':
        return 'bg-[#171717] text-[#FFC928] border border-[#FFC928]/40';
      case 'team_lead':
        return 'bg-[#171717] text-[#FF7900] border border-[#FF7900]/40';
      case 'team_member':
        return 'bg-[#171717] text-white border border-[#333333]';
      default:
        return 'bg-[#F7F7F7] dark:bg-[#171717] text-[#555555] dark:text-[#A3A3A3] border border-[#E0E0E0] dark:border-[#333333]';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Summary Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#141414] p-5 rounded-2xl border border-[#E0E0E0] dark:border-[#333333] shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#F7F7F7] dark:bg-[#171717] rounded-xl text-[#E50914] border border-[#E0E0E0] dark:border-[#333333]">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#101010] dark:text-white">
                Activity Logs & Audit History
              </h2>
              <p className="text-xs text-[#555555] dark:text-[#A3A3A3]">
                Tamper-evident trail tracking project lifecycle, task states, approvals, and authorization events.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#101010] dark:text-white bg-[#F7F7F7] dark:bg-[#171717] border border-[#E0E0E0] dark:border-[#333333] hover:border-[#E50914] rounded-xl transition-all shadow-xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#E50914]" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white dark:bg-[#141414] p-4 rounded-2xl border border-[#E0E0E0] dark:border-[#333333] shadow-xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search Query */}
          <div className="relative md:col-span-2">
            <Search className="w-4 h-4 text-[#555555] dark:text-[#A3A3A3] absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by action, user, project, task, or details..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-[#F7F7F7] dark:bg-[#171717] border border-[#E0E0E0] dark:border-[#333333] rounded-xl text-[#101010] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#E50914]"
            />
          </div>

          {/* Role Filter */}
          <div>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-[#F7F7F7] dark:bg-[#171717] border border-[#E0E0E0] dark:border-[#333333] rounded-xl text-[#101010] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#E50914]"
            >
              <option value="all">All Roles</option>
              <option value="admin">Administrator</option>
              <option value="manager">Manager</option>
              <option value="team_lead">Team Lead</option>
              <option value="team_member">Team Member</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-[#F7F7F7] dark:bg-[#171717] border border-[#E0E0E0] dark:border-[#333333] rounded-xl text-[#101010] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#E50914]"
            >
              <option value="all">All Categories</option>
              <option value="auth">Authentication & Sessions</option>
              <option value="project">Project Workflows</option>
              <option value="task">Task Status & Deliverables</option>
              <option value="security">Security & Roles</option>
              <option value="system">System Broadcasts</option>
            </select>
          </div>
        </div>

        {/* Date Filter & Sort */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#E0E0E0] dark:border-[#333333]">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-semibold text-[#555555] dark:text-[#A3A3A3] uppercase tracking-wider">
              Timeframe:
            </span>
            {(['all', 'today', 'week', 'month', 'custom'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setDateFilter(filter)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors capitalize cursor-pointer ${
                  dateFilter === filter
                    ? 'bg-[#E50914] text-white shadow-xs'
                    : 'bg-[#F7F7F7] dark:bg-[#171717] text-[#555555] dark:text-[#A3A3A3] hover:bg-[#EFEFEF] dark:hover:bg-[#222222] border border-[#E0E0E0] dark:border-[#333333]'
                }`}
              >
                {filter === 'all' ? 'All Time' : filter}
              </button>
            ))}

            {dateFilter === 'custom' && (
              <div className="flex items-center gap-2 ml-2">
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="px-2 py-1 text-xs bg-[#F7F7F7] dark:bg-[#171717] border border-[#E0E0E0] dark:border-[#333333] rounded-lg text-[#101010] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#E50914]"
                />
                <span className="text-xs text-[#555555] dark:text-[#A3A3A3]">to</span>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="px-2 py-1 text-xs bg-[#F7F7F7] dark:bg-[#171717] border border-[#E0E0E0] dark:border-[#333333] rounded-lg text-[#101010] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#E50914]"
                />
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-[#555555] dark:text-[#A3A3A3]">
              <span>Sort:</span>
              <button
                onClick={() => setSortOrder((prev) => (prev === 'newest' ? 'oldest' : 'newest'))}
                className="font-semibold text-[#E50914] hover:underline cursor-pointer"
              >
                {sortOrder === 'newest' ? 'Newest First' : 'Oldest First'}
              </button>
            </div>

            {(searchQuery || selectedRole !== 'all' || selectedCategory !== 'all' || dateFilter !== 'all') && (
              <button
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1 text-xs text-[#555555] dark:text-[#A3A3A3] hover:text-[#101010] dark:hover:text-white transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Audit Log Entries Table / List */}
      <div className="bg-white dark:bg-[#141414] rounded-2xl border border-[#E0E0E0] dark:border-[#333333] shadow-xs overflow-hidden">
        <div className="p-4 border-b border-[#E0E0E0] dark:border-[#333333] flex items-center justify-between text-xs text-[#555555] dark:text-[#A3A3A3]">
          <span>
            Displaying <strong className="text-[#101010] dark:text-white">{filteredLogs.length}</strong> logged event(s)
          </span>
          <span className="text-[11px] text-[#555555] dark:text-[#A3A3A3]">
            Immutable Audit Trail • RBAC Enforced
          </span>
        </div>

        {filteredLogs.length === 0 ? (
          <div className="py-16 text-center text-[#555555] dark:text-[#A3A3A3] space-y-2">
            <Clock className="w-10 h-10 mx-auto text-[#555555] dark:text-[#A3A3A3] mb-2" />
            <p className="text-sm font-semibold text-[#101010] dark:text-white">
              No matching activity events found
            </p>
            <p className="text-xs">
              Try adjusting your search criteria or resetting active filters.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#E0E0E0] dark:divide-[#333333]">
            {filteredLogs.map((log) => (
              <div
                key={log.id}
                className="p-4 hover:bg-[#F7F7F7] dark:hover:bg-[#1a1a1a] transition-colors space-y-2 text-xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    {getCategoryBadge(log.category)}
                    <span className="font-bold text-[#101010] dark:text-white text-sm">
                      {log.action}
                    </span>
                    <span className="text-[#737373]">•</span>
                    <span className="text-[#555555] dark:text-[#A3A3A3] font-medium">
                      Target: <span className="font-mono text-[#101010] dark:text-white">{log.target}</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] font-mono text-[#555555] dark:text-[#A3A3A3]">
                      {log.timestamp}
                    </span>
                  </div>
                </div>

                {/* Details line */}
                <p className="text-[#555555] dark:text-[#A3A3A3] leading-relaxed">
                  {log.details}
                </p>

                {/* State Transition Diff (previousValue -> updatedValue) */}
                {(log.previousValue || log.updatedValue) && (
                  <div className="p-2.5 bg-[#F7F7F7] dark:bg-[#171717] rounded-xl border border-[#E0E0E0] dark:border-[#333333] flex flex-wrap items-center gap-2 text-xs font-mono">
                    <span className="text-[#555555] dark:text-[#A3A3A3] font-sans text-[11px]">Value Transition:</span>
                    {log.previousValue && (
                      <span className="px-2 py-0.5 rounded bg-[#E50914]/15 text-[#E50914] border border-[#E50914]/40">
                        {log.previousValue}
                      </span>
                    )}
                    <ArrowRight className="w-3.5 h-3.5 text-[#555555] dark:text-[#A3A3A3]" />
                    {log.updatedValue && (
                      <span className="px-2 py-0.5 rounded bg-[#171717] text-[#FFC928] border border-[#FFC928]/40 font-semibold">
                        {log.updatedValue}
                      </span>
                    )}
                  </div>
                )}

                {/* Metadata Row: Actor, Login ID, Role, Project/Task tags */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-[#E0E0E0] dark:border-[#333333] text-[11px] text-[#555555] dark:text-[#A3A3A3]">
                  <div className="flex flex-wrap items-center gap-2">
                    <span>
                      Performed by: <strong className="text-[#101010] dark:text-white font-medium">{log.actorName}</strong>
                      {log.actorLoginId && (
                        <span className="font-mono text-[#555555] dark:text-[#A3A3A3] ml-1">({log.actorLoginId})</span>
                      )}
                    </span>
                    <span className={`px-1.5 py-0.2 rounded border text-[10px] font-semibold ${getRoleBadge(log.actorRole)}`}>
                      {log.actorRole.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 font-mono text-[10px]">
                    {log.projectName && (
                      <span className="px-2 py-0.5 rounded bg-[#171717] text-[#FF7900] border border-[#333333]">
                        Proj: {log.projectName}
                      </span>
                    )}
                    {log.taskTitle && (
                      <span className="px-2 py-0.5 rounded bg-[#171717] text-white border border-[#333333]">
                        Task: {log.taskTitle}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
