import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Project, Task, Client, User } from '../../types';
import {
  Search,
  X,
  Briefcase,
  CheckSquare,
  Users,
  Building,
  ArrowRight,
  ExternalLink,
  Clock,
  CheckCircle2,
} from 'lucide-react';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTask: (task: Task) => void;
  onSelectProject: (project: Project) => void;
  onSelectClient?: (client: Client) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectTask,
  onSelectProject,
  onSelectClient,
}) => {
  const { projects, tasks, clients, users, currentUser } = useApp();
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'projects' | 'tasks' | 'clients' | 'members'>('all');

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // RBAC Filtering for search scope
  const authorizedProjects = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === 'admin' || currentUser.role === 'manager') return projects;
    if (currentUser.role === 'team_lead') {
      return projects.filter((p) => p.leadId === currentUser.id);
    }
    if (currentUser.role === 'team_member') {
      const myTaskProjectIds = new Set(tasks.filter((t) => t.assigneeId === currentUser.id).map((t) => t.projectId));
      return projects.filter((p) => myTaskProjectIds.has(p.id));
    }
    return [];
  }, [projects, tasks, currentUser]);

  const authorizedTasks = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === 'admin' || currentUser.role === 'manager') return tasks;
    if (currentUser.role === 'team_lead') {
      const myProjectIds = new Set(authorizedProjects.map((p) => p.id));
      return tasks.filter((t) => t.leadId === currentUser.id || (t.projectId && myProjectIds.has(t.projectId)));
    }
    if (currentUser.role === 'team_member') {
      return tasks.filter((t) => t.assigneeId === currentUser.id);
    }
    return [];
  }, [tasks, authorizedProjects, currentUser]);

  const authorizedClients = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === 'admin' || currentUser.role === 'manager') return clients;
    if (currentUser.role === 'team_lead') {
      const leadClientNames = new Set(authorizedProjects.map((p) => p.clientName.toLowerCase()));
      return clients.filter((c) => leadClientNames.has(c.name.toLowerCase()));
    }
    return [];
  }, [clients, authorizedProjects, currentUser]);

  const authorizedUsers = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === 'admin' || currentUser.role === 'manager') return users;
    if (currentUser.role === 'team_lead') {
      return users.filter((u) => u.role === 'team_member' || u.id === currentUser.id);
    }
    return users.filter((u) => u.id === currentUser.id);
  }, [users, currentUser]);

  // Filtered Results
  const trimmed = query.trim().toLowerCase();

  const matchingProjects = useMemo(() => {
    if (!trimmed) return [];
    return authorizedProjects.filter(
      (p) =>
        p.title.toLowerCase().includes(trimmed) ||
        p.clientName.toLowerCase().includes(trimmed) ||
        (p.companyName && p.companyName.toLowerCase().includes(trimmed)) ||
        p.purpose.toLowerCase().includes(trimmed) ||
        p.leadName.toLowerCase().includes(trimmed)
    ).slice(0, 5);
  }, [authorizedProjects, trimmed]);

  const matchingTasks = useMemo(() => {
    if (!trimmed) return [];
    return authorizedTasks.filter(
      (t) =>
        t.title.toLowerCase().includes(trimmed) ||
        t.projectTitle.toLowerCase().includes(trimmed) ||
        t.assigneeName.toLowerCase().includes(trimmed) ||
        t.description.toLowerCase().includes(trimmed)
    ).slice(0, 6);
  }, [authorizedTasks, trimmed]);

  const matchingClients = useMemo(() => {
    if (!trimmed) return [];
    return authorizedClients.filter(
      (c) =>
        c.name.toLowerCase().includes(trimmed) ||
        c.industry.toLowerCase().includes(trimmed) ||
        c.primaryContact.name.toLowerCase().includes(trimmed)
    ).slice(0, 4);
  }, [authorizedClients, trimmed]);

  const matchingMembers = useMemo(() => {
    if (!trimmed) return [];
    return authorizedUsers.filter(
      (u) =>
        u.name.toLowerCase().includes(trimmed) ||
        (u.loginId ? u.loginId.toLowerCase().includes(trimmed) : false) ||
        (u.email ? u.email.toLowerCase().includes(trimmed) : false) ||
        (u.title ? u.title.toLowerCase().includes(trimmed) : false)
    ).slice(0, 4);
  }, [authorizedUsers, trimmed]);

  const totalResults =
    matchingProjects.length + matchingTasks.length + matchingClients.length + matchingMembers.length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[80vh]">
        {/* Search Header Input */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
          <Search className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Search projects, tasks, team members, or clients... (Press ESC to close)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full text-sm bg-transparent border-none text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 px-1.5 py-0.5 rounded cursor-pointer"
            >
              Clear
            </button>
          )}
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Filter Chips */}
        <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2 overflow-x-auto bg-slate-50/50 dark:bg-slate-800/30">
          {(
            [
              { id: 'all', label: 'All Results' },
              { id: 'projects', label: `Projects (${matchingProjects.length})` },
              { id: 'tasks', label: `Tasks (${matchingTasks.length})` },
              { id: 'clients', label: `Clients (${matchingClients.length})` },
              { id: 'members', label: `Members (${matchingMembers.length})` },
            ] as const
          ).map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search Results */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {!trimmed ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <Search className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-700 mb-1" />
              <p className="text-xs font-medium text-slate-600 dark:text-slate-300">
                Type keywords above to search across your authorized workspace
              </p>
              <p className="text-[11px]">
                Search tasks by title, assignee, or status • Search projects by client or lead
              </p>
            </div>
          ) : totalResults === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-1">
              <p className="text-xs font-medium text-slate-600 dark:text-slate-300">
                No matching results found for "{query}"
              </p>
              <p className="text-[11px]">
                Check spelling or ensure you have access permissions for this resource.
              </p>
            </div>
          ) : (
            <>
              {/* Projects Section */}
              {(activeCategory === 'all' || activeCategory === 'projects') &&
                matchingProjects.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block px-1">
                      Projects ({matchingProjects.length})
                    </span>
                    <div className="space-y-1">
                      {matchingProjects.map((proj) => (
                        <div
                          key={proj.id}
                          onClick={() => {
                            onSelectProject(proj);
                            onClose();
                          }}
                          className="p-3 bg-slate-50 dark:bg-slate-800/60 hover:bg-blue-50/60 dark:hover:bg-blue-950/30 rounded-xl border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3 cursor-pointer transition-colors group"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 shrink-0">
                              <Briefcase className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400">
                                {proj.title}
                              </p>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                                Purpose: {proj.purpose} • Lead: {proj.leadName}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium">
                              {proj.status}
                            </span>
                            <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 transition-colors" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* Tasks Section */}
              {(activeCategory === 'all' || activeCategory === 'tasks') &&
                matchingTasks.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block px-1">
                      Tasks & Deliverables ({matchingTasks.length})
                    </span>
                    <div className="space-y-1">
                      {matchingTasks.map((task) => (
                        <div
                          key={task.id}
                          onClick={() => {
                            onSelectTask(task);
                            onClose();
                          }}
                          className="p-3 bg-slate-50 dark:bg-slate-800/60 hover:bg-blue-50/60 dark:hover:bg-blue-950/30 rounded-xl border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3 cursor-pointer transition-colors group"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 shrink-0">
                              <CheckSquare className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400">
                                {task.title}
                              </p>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                                Project: {task.projectTitle} • Assignee: {task.assigneeName} • Due: {task.deadline}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                                task.status === 'Done' || task.status === 'Completed'
                                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                                  : task.status === 'In Progress'
                                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                                  : 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                              }`}
                            >
                              {task.status}
                            </span>
                            <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 transition-colors" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* Clients Section */}
              {(activeCategory === 'all' || activeCategory === 'clients') &&
                matchingClients.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block px-1">
                      Clients ({matchingClients.length})
                    </span>
                    <div className="space-y-1">
                      {matchingClients.map((client) => (
                        <div
                          key={client.id}
                          onClick={() => {
                            if (onSelectClient) onSelectClient(client);
                            onClose();
                          }}
                          className="p-3 bg-slate-50 dark:bg-slate-800/60 hover:bg-blue-50/60 dark:hover:bg-blue-950/30 rounded-xl border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3 cursor-pointer transition-colors group"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="p-2 rounded-lg bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-400 shrink-0">
                              <Building className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400">
                                {client.name}
                              </p>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                                Industry: {client.industry} • Contact: {client.primaryContact.name}
                              </p>
                            </div>
                          </div>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 transition-colors shrink-0" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* Members Section */}
              {(activeCategory === 'all' || activeCategory === 'members') &&
                matchingMembers.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block px-1">
                      Team Members ({matchingMembers.length})
                    </span>
                    <div className="space-y-1">
                      {matchingMembers.map((member) => (
                        <div
                          key={member.id}
                          className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <img
                              src={member.avatar}
                              alt={member.name}
                              referrerPolicy="no-referrer"
                              className="w-8 h-8 rounded-full object-cover shrink-0 border border-slate-200 dark:border-slate-700"
                            />
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                {member.name}
                                <span className="ml-1.5 font-mono text-[10px] text-slate-400">
                                  ({member.loginId})
                                </span>
                              </p>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                                {member.title} • {member.department}
                              </p>
                            </div>
                          </div>
                          <span className="text-[10px] px-2 py-0.5 rounded border bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold shrink-0">
                            {member.role.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <span>Press ESC to exit search</span>
          <span>Role-Based Access Control Active</span>
        </div>
      </div>
    </div>
  );
};
