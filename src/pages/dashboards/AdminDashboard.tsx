import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { User, UserRole, RolePermissions } from '../../types';
import {
  Users,
  Shield,
  Clock,
  Settings,
  Plus,
  Search,
  CheckCircle,
  XCircle,
  Download,
  Save,
  Server,
  Database,
  Activity,
  Layers,
} from 'lucide-react';
import { AddUserModal } from '../../components/modals/AddUserModal';
import { ReportsAnalyticsView } from '../../components/reports/ReportsAnalyticsView';
import { ActivityLogsView } from '../../components/activity/ActivityLogsView';
import { MyWorkspaceView } from '../../components/workspace/MyWorkspaceView';
import { MeetingsManagementView } from '../../components/meetings/MeetingsManagementView';
import { TeamProfilesManagementView } from '../../components/admin/TeamProfilesManagementView';
import { NotificationSettingsView } from '../../components/settings/NotificationSettingsView';
import { MotivationManagementView } from '../../components/admin/MotivationManagementView';

interface AdminDashboardProps {
  activeTab: string;
  onTabChange?: (tab: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ activeTab, onTabChange }) => {
  const {
    users,
    clients,
    projects,
    tasks,
    activityLogs,
    rolePermissions,
    systemConfig,
    updateUserRole,
    toggleUserStatus,
    updateRolePermissions,
    updateSystemConfig,
    showToast,
  } = useApp();

  const [userModalOpen, setUserModalOpen] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [logSearch, setLogSearch] = useState('');
  const [logCategoryFilter, setLogCategoryFilter] = useState<string>('all');

  // Local state for configuration form
  const [configForm, setConfigForm] = useState(systemConfig);
  // Local state for permissions matrix
  const [permissionsMatrix, setPermissionsMatrix] = useState<RolePermissions[]>(rolePermissions);

  const filteredUsers = users.filter((u) => {
    const query = userSearch.toLowerCase();
    const matchesSearch =
      u.name.toLowerCase().includes(query) ||
      (u.loginId ? u.loginId.toLowerCase().includes(query) : false) ||
      (u.email ? u.email.toLowerCase().includes(query) : false) ||
      (u.department ? u.department.toLowerCase().includes(query) : false) ||
      (u.title ? u.title.toLowerCase().includes(query) : false);
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const filteredLogs = activityLogs.filter((log) => {
    const matchesSearch =
      log.actorName.toLowerCase().includes(logSearch.toLowerCase()) ||
      log.action.toLowerCase().includes(logSearch.toLowerCase()) ||
      log.target.toLowerCase().includes(logSearch.toLowerCase()) ||
      log.details.toLowerCase().includes(logSearch.toLowerCase());
    const matchesCat = logCategoryFilter === 'all' || log.category === logCategoryFilter;
    return matchesSearch && matchesCat;
  });

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    updateSystemConfig(configForm);
  };

  const handleSavePermissions = () => {
    updateRolePermissions(permissionsMatrix);
  };

  const handleExportLogs = () => {
    const jsonStr = JSON.stringify(activityLogs, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cms_audit_logs_${new Date().toISOString().substring(0, 10)}.json`;
    a.click();
    showToast('success', 'Logs Exported', 'Audit logs exported as JSON archive.');
  };

  const totalContractValue = clients.reduce((sum, c) => sum + c.contractValue, 0);

  return (
    <div className="space-y-6">
      {/* Tab: Universal My Workspace */}
      {activeTab === 'workspace' && (
        <MyWorkspaceView onNavigateTab={onTabChange} />
      )}

      {/* Tab: Team Profile Management (Administrator Controlled) */}
      {activeTab === 'team-profiles' && (
        <TeamProfilesManagementView />
      )}

      {/* Tab: Meetings Management */}
      {activeTab === 'meetings' && (
        <MeetingsManagementView />
      )}

      {/* Tab: Notification Settings & Preferences */}
      {(activeTab === 'settings' || activeTab === 'notification-settings') && (
        <NotificationSettingsView />
      )}

      {/* Tab: Centralized Motivation Management */}
      {(activeTab === 'motivation-admin' || activeTab === 'motivation-management') && (
        <MotivationManagementView />
      )}

      {/* Tab: System Overview */}
      {(activeTab === 'overview' || (!activeTab && activeTab !== 'workspace' && activeTab !== 'settings' && activeTab !== 'notification-settings')) && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-[#101010] dark:text-white">
                Enterprise System Overview
              </h2>
              <p className="text-xs text-[#555555] dark:text-[#A3A3A3] mt-0.5">
                Centralized telemetry, active user directories, and system health status.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setUserModalOpen(true)}
                className="px-3.5 py-2 text-xs font-bold text-white bg-[#E50914] hover:bg-[#c40812] rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Provision User</span>
              </button>
            </div>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 bg-white dark:bg-[#141414] rounded-2xl border border-[#E0E0E0] dark:border-[#333333] shadow-xs transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#555555] dark:text-[#A3A3A3]">
                  Provisioned Users
                </span>
                <Users className="w-4 h-4 text-[#FF7900]" />
              </div>
              <p className="text-2xl font-bold text-[#101010] dark:text-white mt-2 font-mono tabular-nums">
                {users.length}
              </p>
              <p className="text-[11px] text-[#555555] dark:text-[#A3A3A3] mt-1">
                {users.filter((u) => u.status === 'active').length} Active sessions verified
              </p>
            </div>

            <div className="p-5 bg-white dark:bg-[#141414] rounded-2xl border border-[#E0E0E0] dark:border-[#333333] shadow-xs transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#555555] dark:text-[#A3A3A3]">
                  Managed Clients
                </span>
                <Layers className="w-4 h-4 text-[#FFC928]" />
              </div>
              <p className="text-2xl font-bold text-[#101010] dark:text-white mt-2 font-mono tabular-nums">
                {clients.length}
              </p>
              <p className="text-[11px] text-[#555555] dark:text-[#A3A3A3] mt-1 font-mono tabular-nums">
                {totalContractValue > 0 ? `$${(totalContractValue / 1000000).toFixed(2)}M Active Contract Value` : `${clients.length} Registered Client Accounts`}
              </p>
            </div>

            <div className="p-5 bg-white dark:bg-[#141414] rounded-2xl border border-[#E0E0E0] dark:border-[#333333] shadow-xs transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#555555] dark:text-[#A3A3A3]">
                  Infrastructure Health
                </span>
                <Server className="w-4 h-4 text-[#FFC928]" />
              </div>
              <p className="text-2xl font-bold text-[#FFC928] mt-2 font-mono tabular-nums">
                99.98%
              </p>
              <p className="text-[11px] text-[#555555] dark:text-[#A3A3A3] mt-1">All database nodes operational</p>
            </div>

            <div className="p-5 bg-white dark:bg-[#141414] rounded-2xl border border-[#E0E0E0] dark:border-[#333333] shadow-xs transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#555555] dark:text-[#A3A3A3]">
                  Audit Events (24h)
                </span>
                <Activity className="w-4 h-4 text-[#E50914]" />
              </div>
              <p className="text-2xl font-bold text-[#101010] dark:text-white mt-2 font-mono tabular-nums">
                {activityLogs.length}
              </p>
              <p className="text-[11px] text-[#555555] dark:text-[#A3A3A3] mt-1">100% Traceability verified</p>
            </div>
          </div>

          {/* Quick User Summary & Recent Logs */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Quick Users */}
            <div className="bg-white dark:bg-[#141414] rounded-2xl border border-[#E0E0E0] dark:border-[#333333] p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#101010] dark:text-white">
                  Active Directory Members
                </h3>
                <span className="text-xs text-[#E50914] font-bold">
                  {users.length} Registered
                </span>
              </div>
              <div className="divide-y divide-[#EAEAEA] dark:divide-[#262626]">
                {users.slice(0, 4).map((u) => (
                  <div key={u.id} className="py-3 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <img
                        src={u.avatar}
                        alt={u.name}
                        referrerPolicy="no-referrer"
                        className="w-8 h-8 rounded-full object-cover border border-[#E0E0E0] dark:border-[#333333]"
                      />
                      <div>
                        <p className="font-semibold text-[#101010] dark:text-white">{u.name}</p>
                        <p className="text-[11px] text-[#555555] dark:text-[#A3A3A3]">{u.title}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#F0F0F0] dark:bg-[#202020] text-[#101010] dark:text-white border border-[#E0E0E0] dark:border-[#333333] uppercase">
                      {u.role.replace('_', ' ')}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Audit Trail */}
            <div className="bg-white dark:bg-[#141414] rounded-2xl border border-[#E0E0E0] dark:border-[#333333] p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#101010] dark:text-white">
                  Recent Audit Trail
                </h3>
                <span className="text-xs text-[#FF7900] font-mono">Immutable</span>
              </div>
              <div className="divide-y divide-[#EAEAEA] dark:divide-[#262626]">
                {activityLogs.slice(0, 4).map((log) => (
                  <div key={log.id} className="py-2.5 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-[#101010] dark:text-white">
                        {log.action}
                      </span>
                      <span className="text-[10px] text-[#777777] dark:text-[#888888] font-mono">{log.timestamp}</span>
                    </div>
                    <p className="text-[11px] text-[#555555] dark:text-[#A3A3A3] leading-relaxed truncate">
                      {log.actorName} ({log.actorRole}) · {log.details}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: User Directory */}
      {activeTab === 'users' && (
        <div className="bg-white dark:bg-[#141414] rounded-2xl border border-[#E0E0E0] dark:border-[#333333] p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-[#101010] dark:text-white">
                Organization User Directory
              </h2>
              <p className="text-xs text-[#555555] dark:text-[#A3A3A3] mt-0.5">
                Manage accounts, departments, and securely designate trusted role permissions.
              </p>
            </div>
            <button
              onClick={() => setUserModalOpen(true)}
              className="px-3.5 py-2 text-xs font-bold text-white bg-[#E50914] hover:bg-[#c40812] rounded-xl shadow-xs transition-colors flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New User</span>
            </button>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-3.5 h-3.5 text-[#888888] absolute left-3 top-3" />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search by name, email, department..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-[#F7F7F7] dark:bg-[#171717] border border-[#E0E0E0] dark:border-[#333333] rounded-lg text-[#101010] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#E50914]"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-[#555555] dark:text-[#A3A3A3]">Filter Role:</span>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-3 py-1.5 text-xs bg-[#F7F7F7] dark:bg-[#171717] border border-[#E0E0E0] dark:border-[#333333] rounded-lg text-[#101010] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#E50914]"
              >
                <option value="all">All Roles</option>
                <option value="admin">Administrator</option>
                <option value="manager">Manager</option>
                <option value="team_lead">Team Lead</option>
                <option value="team_member">Team Member</option>
              </select>
            </div>
          </div>

          {/* Users Table */}
          <div className="overflow-x-auto border border-[#E0E0E0] dark:border-[#333333] rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F0F0F0] dark:bg-[#1c1c1c] text-[#101010] dark:text-white font-semibold border-b border-[#E0E0E0] dark:border-[#333333]">
                <tr>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Department & Title</th>
                  <th className="py-3 px-4">Designated Role</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Last Active</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAEAEA] dark:divide-[#262626]">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-[#F9F9F9] dark:hover:bg-[#1a1a1a] transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={u.avatar}
                          alt={u.name}
                          referrerPolicy="no-referrer"
                          className="w-8 h-8 rounded-full object-cover border border-[#E0E0E0] dark:border-[#333333]"
                        />
                        <div>
                          <p className="font-semibold text-[#101010] dark:text-white">{u.name}</p>
                          <p className="text-[11px] text-[#555555] dark:text-[#A3A3A3] font-mono">
                            <span className="text-[#E50914] font-semibold">{u.loginId}</span>
                            {u.email && <span> · {u.email}</span>}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-[#555555] dark:text-[#A3A3A3]">
                      <p className="font-medium text-[#101010] dark:text-white">
                        {u.title || (u.role === 'admin' ? 'Administrator' : u.role === 'manager' ? 'Operations Manager' : u.role === 'team_lead' ? 'Solutions Lead' : 'Specialist')}
                      </p>
                      {u.department && <p className="text-[11px] text-[#555555] dark:text-[#A3A3A3]">{u.department}</p>}
                    </td>
                    <td className="py-3.5 px-4">
                      <select
                        value={u.role}
                        onChange={(e) => updateUserRole(u.id, e.target.value as UserRole)}
                        className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-[#E0E0E0] dark:border-[#333333] bg-[#F7F7F7] dark:bg-[#1e1e1e] text-[#101010] dark:text-white"
                      >
                        <option value="admin">Administrator</option>
                        <option value="manager">Manager</option>
                        <option value="team_lead">Team Lead</option>
                        <option value="team_member">Team Member</option>
                      </select>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium border ${
                          u.status === 'active'
                            ? 'bg-[#F0F0F0] dark:bg-[#202020] text-[#101010] dark:text-white border-[#CCCCCC] dark:border-[#444444]'
                            : 'bg-[#1a1a1a] text-[#888888] border-[#333333]'
                        }`}
                      >
                        {u.status === 'active' ? (
                          <CheckCircle className="w-3 h-3 text-[#FFC928]" />
                        ) : (
                          <XCircle className="w-3 h-3 text-[#777777]" />
                        )}
                        <span className="capitalize">{u.status}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-[#555555] dark:text-[#A3A3A3] font-mono text-[11px]">
                      {u.lastActive}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => toggleUserStatus(u.id)}
                        className="text-xs font-medium text-[#555555] dark:text-[#A3A3A3] hover:text-[#E50914] dark:hover:text-[#FFC928] underline cursor-pointer"
                      >
                        {u.status === 'active' ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Role Permissions Matrix */}
      {activeTab === 'permissions' && (
        <div className="bg-white dark:bg-[#141414] rounded-2xl border border-[#E0E0E0] dark:border-[#333333] p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-[#101010] dark:text-white">
                Role Permissions Governance Matrix
              </h2>
              <p className="text-xs text-[#555555] dark:text-[#A3A3A3] mt-0.5">
                Enforce granular module-level authorization for each defined system role.
              </p>
            </div>
            <button
              onClick={handleSavePermissions}
              className="px-4 py-2 text-xs font-bold text-white bg-[#E50914] hover:bg-[#c40812] rounded-xl shadow-xs transition-colors flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Permissions Matrix</span>
            </button>
          </div>

          <div className="overflow-x-auto border border-[#E0E0E0] dark:border-[#333333] rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F0F0F0] dark:bg-[#1c1c1c] text-[#101010] dark:text-white font-semibold border-b border-[#E0E0E0] dark:border-[#333333]">
                <tr>
                  <th className="py-3.5 px-4">Role Profile</th>
                  <th className="py-3.5 px-4">Client Management</th>
                  <th className="py-3.5 px-4">Team Allocation</th>
                  <th className="py-3.5 px-4">Project Oversight</th>
                  <th className="py-3.5 px-4">Task Assignment</th>
                  <th className="py-3.5 px-4">Reports & Analytics</th>
                  <th className="py-3.5 px-4">System Settings</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAEAEA] dark:divide-[#262626]">
                {permissionsMatrix.map((rp) => (
                  <tr key={rp.role} className="hover:bg-[#F9F9F9] dark:hover:bg-[#1a1a1a]">
                    <td className="py-4 px-4">
                      <p className="font-bold text-[#101010] dark:text-white">{rp.label}</p>
                      <p className="text-[11px] text-[#555555] dark:text-[#A3A3A3] mt-0.5 max-w-xs leading-relaxed">
                        {rp.description}
                      </p>
                    </td>

                    <td className="py-4 px-4">
                      <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-[#F0F0F0] dark:bg-[#202020] text-[#101010] dark:text-white border border-[#E0E0E0] dark:border-[#333333] uppercase">
                        {rp.permissions.clientManagement}
                      </span>
                    </td>

                    <td className="py-4 px-4">
                      <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-[#F0F0F0] dark:bg-[#202020] text-[#101010] dark:text-white border border-[#E0E0E0] dark:border-[#333333] uppercase">
                        {rp.permissions.teamManagement}
                      </span>
                    </td>

                    <td className="py-4 px-4">
                      <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-[#F0F0F0] dark:bg-[#202020] text-[#101010] dark:text-white border border-[#E0E0E0] dark:border-[#333333] uppercase">
                        {rp.permissions.projectOversight}
                      </span>
                    </td>

                    <td className="py-4 px-4">
                      <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-[#F0F0F0] dark:bg-[#202020] text-[#101010] dark:text-white border border-[#E0E0E0] dark:border-[#333333] uppercase">
                        {rp.permissions.taskAssignment}
                      </span>
                    </td>

                    <td className="py-4 px-4">
                      <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-[#F0F0F0] dark:bg-[#202020] text-[#101010] dark:text-white border border-[#E0E0E0] dark:border-[#333333] uppercase">
                        {rp.permissions.reportsAnalytics}
                      </span>
                    </td>

                    <td className="py-4 px-4">
                      <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-[#F0F0F0] dark:bg-[#202020] text-[#101010] dark:text-white border border-[#E0E0E0] dark:border-[#333333] uppercase">
                        {rp.permissions.systemSettings}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Reports & Analytics */}
      {activeTab === 'reports' && (
        <ReportsAnalyticsView />
      )}

      {/* Tab: Audit Activity Logs */}
      {activeTab === 'audit-logs' && (
        <ActivityLogsView />
      )}

      {/* Tab: System Configuration */}
      {activeTab === 'configuration' && (
        <div className="bg-white dark:bg-[#141414] rounded-2xl border border-[#E0E0E0] dark:border-[#333333] p-6 space-y-6">
          <div>
            <h2 className="text-lg font-bold text-[#101010] dark:text-white">
              Enterprise System Configuration
            </h2>
            <p className="text-xs text-[#555555] dark:text-[#A3A3A3] mt-0.5">
              Configure global organization settings, SLA threshold warning engines, and security flags.
            </p>
          </div>

          <form onSubmit={handleSaveConfig} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-[#101010] dark:text-white mb-1.5">
                  Organization Legal Entity
                </label>
                <input
                  type="text"
                  value={configForm.organizationName}
                  onChange={(e) =>
                    setConfigForm({ ...configForm, organizationName: e.target.value })
                  }
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-[#F7F7F7] dark:bg-[#171717] border border-[#E0E0E0] dark:border-[#333333] rounded-lg text-[#101010] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#E50914]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#101010] dark:text-white mb-1.5">
                  Default Operational Timezone
                </label>
                <input
                  type="text"
                  value={configForm.defaultTimezone}
                  onChange={(e) =>
                    setConfigForm({ ...configForm, defaultTimezone: e.target.value })
                  }
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-[#F7F7F7] dark:bg-[#171717] border border-[#E0E0E0] dark:border-[#333333] rounded-lg text-[#101010] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#E50914]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#101010] dark:text-white mb-1.5">
                  Session Expiration Timeout (Minutes)
                </label>
                <input
                  type="number"
                  value={configForm.sessionTimeoutMinutes}
                  onChange={(e) =>
                    setConfigForm({
                      ...configForm,
                      sessionTimeoutMinutes: Number(e.target.value),
                    })
                  }
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-[#F7F7F7] dark:bg-[#171717] border border-[#E0E0E0] dark:border-[#333333] rounded-lg text-[#101010] dark:text-white font-mono focus:outline-none focus:ring-1 focus:ring-[#E50914]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#101010] dark:text-white mb-1.5">
                  Early SLA Warning Trigger Threshold (Hours)
                </label>
                <input
                  type="number"
                  value={configForm.slaWarningThresholdHours}
                  onChange={(e) =>
                    setConfigForm({
                      ...configForm,
                      slaWarningThresholdHours: Number(e.target.value),
                    })
                  }
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-[#F7F7F7] dark:bg-[#171717] border border-[#E0E0E0] dark:border-[#333333] rounded-lg text-[#101010] dark:text-white font-mono focus:outline-none focus:ring-1 focus:ring-[#E50914]"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-[#E0E0E0] dark:border-[#333333] space-y-3">
              <h4 className="text-xs font-bold text-[#101010] dark:text-white uppercase tracking-wider">
                Security & Verification Policies
              </h4>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={configForm.requireTwoFactor}
                  onChange={(e) =>
                    setConfigForm({ ...configForm, requireTwoFactor: e.target.checked })
                  }
                  className="rounded border-[#E0E0E0] dark:border-[#333333] text-[#E50914] focus:ring-[#E50914] accent-[#E50914]"
                />
                <span className="text-xs text-[#555555] dark:text-[#A3A3A3]">
                  Enforce Two-Factor Authentication (2FA) for all Managers and Administrators
                </span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={configForm.automaticSLAReminders}
                  onChange={(e) =>
                    setConfigForm({ ...configForm, automaticSLAReminders: e.target.checked })
                  }
                  className="rounded border-[#E0E0E0] dark:border-[#333333] text-[#E50914] focus:ring-[#E50914] accent-[#E50914]"
                />
                <span className="text-xs text-[#555555] dark:text-[#A3A3A3]">
                  Transmit automated deadline notification warnings 48h before deliverable due date
                </span>
              </label>
            </div>

            <div className="flex justify-end pt-4 border-t border-[#E0E0E0] dark:border-[#333333]">
              <button
                type="submit"
                className="px-5 py-2.5 text-xs font-bold text-white bg-[#E50914] hover:bg-[#c40812] rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save System Configuration</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add User Modal */}
      <AddUserModal isOpen={userModalOpen} onClose={() => setUserModalOpen(false)} />
    </div>
  );
};
