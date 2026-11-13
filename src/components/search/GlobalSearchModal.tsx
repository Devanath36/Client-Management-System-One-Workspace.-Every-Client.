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
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-4 bg-black/85 backdrop-blur-sm">
      <div className="bg-[#141414] w-full max-w-2xl rounded-3xl border border-[#333333] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[80vh] text-white">
        {/* Search Header Input */}
        <div className="p-4 border-b border-[#333333] flex items-center gap-3">
          <Search className="w-5 h-5 text-[#E50914] shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Search projects, tasks, team members, or clients... (Press ESC to close)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full text-sm bg-transparent border-none text-white placeholder:text-[#A3A3A3] focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-xs text-[#A3A3A3] hover:text-white px-1.5 py-0.5 rounded cursor-pointer"
            >
              Clear
            </button>
          )}
          <button
            onClick={onClose}
            className="text-[#A3A3A3] hover:text-white p-1 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Filter Chips */}
        <div className="px-4 py-2 border-b border-[#333333] flex items-center gap-2 overflow-x-auto bg-[#101010]">
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
              className={`px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-[#E50914] text-white shadow-xs'
                  : 'bg-[#171717] text-[#A3A3A3] hover:text-white border border-[#333333]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search Results */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {!trimmed ? (
            <div className="py-12 text-center text-[#A3A3A3] space-y-2">
              <Search className="w-8 h-8 mx-auto text-[#555555] mb-1" />
              <p className="text-xs font-medium text-white">
                Type keywords above to search across your authorized workspace
              </p>
              <p className="text-[11px]">
                Search tasks by title, assignee, or status • Search projects by client or lead
              </p>
            </div>
          ) : totalResults === 0 ? (
            <div className="py-12 text-center text-[#A3A3A3] space-y-1">
              <p className="text-xs font-medium text-white">
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
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#A3A3A3] block px-1">
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
                          className="p-3 bg-[#171717] hover:bg-[#1f1f1f] rounded-xl border border-[#333333] hover:border-[#E50914] flex items-center justify-between gap-3 cursor-pointer transition-colors group"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="p-2 rounded-lg bg-[#101010] text-[#FFC928] border border-[#333333] shrink-0">
                              <Briefcase className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-white truncate group-hover:text-[#E50914] transition-colors">
                                {proj.title}
                              </p>
                              <p className="text-[11px] text-[#A3A3A3] truncate">
                                Purpose: {proj.purpose} • Lead: {proj.leadName}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#101010] text-[#FFC928] border border-[#333333] font-medium">
                              {proj.status}
                            </span>
                            <ArrowRight className="w-3.5 h-3.5 text-[#A3A3A3] group-hover:text-[#E50914] transition-colors" />
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
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#A3A3A3] block px-1">
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
                          className="p-3 bg-[#171717] hover:bg-[#1f1f1f] rounded-xl border border-[#333333] hover:border-[#FF7900] flex items-center justify-between gap-3 cursor-pointer transition-colors group"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="p-2 rounded-lg bg-[#101010] text-[#FF7900] border border-[#333333] shrink-0">
                              <CheckSquare className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-white truncate group-hover:text-[#FF7900] transition-colors">
                                {task.title}
                              </p>
                              <p className="text-[11px] text-[#A3A3A3] truncate">
                                Project: {task.projectTitle} • Assignee: {task.assigneeName} • Due: {task.deadline}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${
                                task.status === 'Done' || task.status === 'Completed'
                                  ? 'bg-[#101010] text-[#FFC928] border-[#FFC928]/40'
                                  : task.status === 'In Progress'
                                  ? 'bg-[#101010] text-[#FF7900] border-[#FF7900]/40'
                                  : 'bg-[#101010] text-white border-[#333333]'
                              }`}
                            >
                              {task.status}
                            </span>
                            <ArrowRight className="w-3.5 h-3.5 text-[#A3A3A3] group-hover:text-[#FF7900] transition-colors" />
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
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#A3A3A3] block px-1">
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
                          className="p-3 bg-[#171717] hover:bg-[#1f1f1f] rounded-xl border border-[#333333] hover:border-[#E50914] flex items-center justify-between gap-3 cursor-pointer transition-colors group"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="p-2 rounded-lg bg-[#101010] text-[#E50914] border border-[#333333] shrink-0">
                              <Building className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-white truncate group-hover:text-[#E50914] transition-colors">
                                {client.name}
                              </p>
                              <p className="text-[11px] text-[#A3A3A3] truncate">
                                Industry: {client.industry} • Contact: {client.primaryContact.name}
                              </p>
                            </div>
                          </div>
                          <ArrowRight className="w-3.5 h-3.5 text-[#A3A3A3] group-hover:text-[#E50914] transition-colors shrink-0" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* Members Section */}
              {(activeCategory === 'all' || activeCategory === 'members') &&
                matchingMembers.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#A3A3A3] block px-1">
                      Team Members ({matchingMembers.length})
                    </span>
                    <div className="space-y-1">
                      {matchingMembers.map((member) => (
                        <div
                          key={member.id}
                          className="p-3 bg-[#171717] rounded-xl border border-[#333333] flex items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <img
                              src={member.avatar}
                              alt={member.name}
                              referrerPolicy="no-referrer"
                              className="w-8 h-8 rounded-full object-cover shrink-0 border border-[#333333]"
                            />
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-white truncate">
                                {member.name}
                                <span className="ml-1.5 font-mono text-[10px] text-[#A3A3A3]">
                                  ({member.loginId})
                                </span>
                              </p>
                              <p className="text-[11px] text-[#A3A3A3] truncate">
                                {member.title} • {member.department}
                              </p>
                            </div>
                          </div>
                          <span className="text-[10px] px-2 py-0.5 rounded border border-[#333333] bg-[#101010] text-[#FFC928] font-semibold shrink-0">
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
        <div className="p-3 bg-[#101010] border-t border-[#333333] flex items-center justify-between text-[11px] text-[#A3A3A3]">
          <span>Press ESC to exit search</span>
          <span>Role-Based Access Control Active</span>
        </div>
      </div>
    </div>
  );
};
