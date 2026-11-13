import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { useApp } from '../../context/AppContext';
import { TaskStatus } from '../../types';
import { Calendar, AlertCircle, Clock, User, Briefcase, Tag } from 'lucide-react';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultProjectId?: string;
  defaultAssigneeId?: string;
  defaultWorkComponent?: string;
  allowedAssigneeIds?: string[];
}

export const WORK_COMPONENT_OPTIONS = [
  'Frontend Development',
  'Backend Development',
  'Database Development',
  'UI/UX Design',
  'Testing and Quality Assurance',
  'Documentation',
  'DevOps & Cloud Infrastructure',
  'API & System Integration',
  'Other',
];

export const AddTaskModal: React.FC<AddTaskModalProps> = ({
  isOpen,
  onClose,
  defaultProjectId,
  defaultAssigneeId,
  defaultWorkComponent,
  allowedAssigneeIds,
}) => {
  const { addTask, projects, users, currentUser, getMemberWorkload } = useApp();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState(defaultProjectId || '');
  const [workComponent, setWorkComponent] = useState(defaultWorkComponent || 'Frontend Development');
  const [customComponent, setCustomComponent] = useState('');
  const [assigneeId, setAssigneeId] = useState(defaultAssigneeId || '');
  const [deadline, setDeadline] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Filter projects available to the user
  const availableProjects = projects.filter((p) => {
    if (!currentUser) return true;
    if (currentUser.role === 'admin' || currentUser.role === 'manager') return true;
    if (currentUser.role === 'team_lead') return p.leadId === currentUser.id;
    return true;
  });

  useEffect(() => {
    if (defaultProjectId) {
      setProjectId(defaultProjectId);
    } else if (availableProjects.length > 0 && !projectId) {
      setProjectId(availableProjects[0].id);
    }
  }, [defaultProjectId, availableProjects, projectId]);

  useEffect(() => {
    if (defaultAssigneeId) {
      setAssigneeId(defaultAssigneeId);
    }
  }, [defaultAssigneeId]);

  useEffect(() => {
    if (defaultWorkComponent) {
      setWorkComponent(defaultWorkComponent);
    }
  }, [defaultWorkComponent]);

  // Candidates for assignment
  const candidateMembers = users.filter((u) => {
    if (u.role !== 'team_member') return false;
    if (allowedAssigneeIds && allowedAssigneeIds.length > 0) {
      return allowedAssigneeIds.includes(u.id);
    }
    return true;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!title.trim()) newErrors.title = 'Task Name is required';
    if (!description.trim()) newErrors.description = 'Task Description is required';
    if (!projectId) newErrors.projectId = 'Please select a project';
    if (!assigneeId) newErrors.assigneeId = 'Please select an assignee';
    if (!deadline) newErrors.deadline = 'Please select a task due date';
    if (workComponent === 'Other' && !customComponent.trim()) {
      newErrors.workComponent = 'Please specify the custom work component name';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const selectedProject = projects.find((p) => p.id === projectId);
    const selectedAssignee = users.find((u) => u.id === assigneeId);
    const resolvedWorkComponent =
      workComponent === 'Other' && customComponent.trim()
        ? customComponent.trim()
        : workComponent;

    addTask({
      title: title.trim(),
      description: description.trim(),
      projectId: selectedProject?.id || '',
      projectTitle: selectedProject?.title || selectedProject?.purpose || 'General Project',
      clientName: selectedProject?.clientName || 'General Client',
      workComponent: resolvedWorkComponent,
      assigneeId: selectedAssignee?.id || '',
      assigneeName: selectedAssignee?.name || 'Unassigned',
      assigneeAvatar: selectedAssignee?.avatar || '',
      leadId: selectedProject?.leadId || (currentUser?.role === 'team_lead' ? currentUser.id : ''),
      leadName: selectedProject?.leadName || (currentUser?.role === 'team_lead' ? currentUser.name : 'Team Lead 1'),
      status: 'New',
      priority: 'Medium',
      assignedDate: new Date().toISOString().substring(0, 10),
      deadline,
      estimatedHours: 0,
      reviewStatus: 'Not Submitted',
      tags: [resolvedWorkComponent],
    });

    // Reset form
    setTitle('');
    setDescription('');
    setAssigneeId('');
    setDeadline('');
    setCustomComponent('');
    setErrors({});
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Assign Project Task"
      description="Create a milestone task, set the due date, and assign it to an authorized team member."
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {Object.keys(errors).length > 0 && (
          <div className="p-3 bg-[#E50914]/10 border border-[#E50914]/30 rounded-xl text-xs text-[#E50914] flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#E50914]" />
            <div>
              <p className="font-semibold">Please resolve form errors:</p>
              <ul className="list-disc list-inside mt-0.5">
                {Object.values(errors).map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Task Name */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-[#333333] dark:text-[#D4D4D4]">
            Task Name *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (errors.title) setErrors({ ...errors, title: '' });
            }}
            placeholder="e.g. Build client notification dispatch endpoints"
            className={`w-full px-3.5 py-2 text-xs bg-white dark:bg-[#101010] border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E50914] text-[#101010] dark:text-white ${
              errors.title ? 'border-[#E50914]' : 'border-[#E0E0E0] dark:border-[#333333]'
            }`}
          />
        </div>

        {/* Task Description */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-[#333333] dark:text-[#D4D4D4]">
            Task Description *
          </label>
          <textarea
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              if (errors.description) setErrors({ ...errors, description: '' });
            }}
            rows={3}
            placeholder="Detailed instructions and deliverables required..."
            className={`w-full px-3.5 py-2 text-xs bg-white dark:bg-[#101010] border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E50914] text-[#101010] dark:text-white resize-none ${
              errors.description ? 'border-[#E50914]' : 'border-[#E0E0E0] dark:border-[#333333]'
            }`}
          />
        </div>

        {/* Project Selection & Assignee Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#333333] dark:text-[#D4D4D4] flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-[#E50914]" />
              <span>Project *</span>
            </label>
            <select
              value={projectId}
              onChange={(e) => {
                setProjectId(e.target.value);
                if (errors.projectId) setErrors({ ...errors, projectId: '' });
              }}
              className="w-full px-3 py-2 text-xs bg-white dark:bg-[#101010] border border-[#E0E0E0] dark:border-[#333333] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E50914] text-[#101010] dark:text-white cursor-pointer"
            >
              <option value="">Select project...</option>
              {availableProjects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} ({p.clientName})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#333333] dark:text-[#D4D4D4] flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#FF7900]" />
              <span>Assign Team Member *</span>
            </label>
            <select
              value={assigneeId}
              onChange={(e) => {
                setAssigneeId(e.target.value);
                if (errors.assigneeId) setErrors({ ...errors, assigneeId: '' });
              }}
              className="w-full px-3 py-2 text-xs bg-white dark:bg-[#101010] border border-[#E0E0E0] dark:border-[#333333] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E50914] text-[#101010] dark:text-white cursor-pointer"
            >
              <option value="">Select team member...</option>
              {candidateMembers.map((m) => {
                const workload = getMemberWorkload(m.id);
                return (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.loginId}) — {workload.availabilityLabel}
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        {/* Work Component Allocation */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#333333] dark:text-[#D4D4D4] flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-[#FF7900]" />
              <span>Work Component *</span>
            </label>
            <select
              value={workComponent}
              onChange={(e) => {
                setWorkComponent(e.target.value);
                if (errors.workComponent) setErrors({ ...errors, workComponent: '' });
              }}
              className="w-full px-3 py-2 text-xs bg-white dark:bg-[#101010] border border-[#E0E0E0] dark:border-[#333333] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E50914] text-[#101010] dark:text-white cursor-pointer"
            >
              {WORK_COMPONENT_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          {workComponent === 'Other' ? (
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#333333] dark:text-[#D4D4D4]">
                Custom Component Name *
              </label>
              <input
                type="text"
                value={customComponent}
                onChange={(e) => setCustomComponent(e.target.value)}
                placeholder="e.g. Security Audit & Hardening"
                className={`w-full px-3.5 py-2 text-xs bg-white dark:bg-[#101010] border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E50914] text-[#101010] dark:text-white ${
                  errors.workComponent ? 'border-[#E50914]' : 'border-[#E0E0E0] dark:border-[#333333]'
                }`}
              />
            </div>
          ) : (
            <div className="space-y-1.5 flex flex-col justify-end">
              <span className="text-[11px] text-[#666666] dark:text-[#A3A3A3] bg-[#F7F7F7] dark:bg-[#101010] p-2 rounded-xl border border-[#E0E0E0] dark:border-[#333333]">
                Categorizes this deliverable under the project's work architecture.
              </span>
            </div>
          )}
        </div>

        {/* Due Date */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-[#333333] dark:text-[#D4D4D4] flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-[#E50914]" />
            <span>Due Date *</span>
          </label>
          <input
            type="date"
            value={deadline}
            onChange={(e) => {
              setDeadline(e.target.value);
              if (errors.deadline) setErrors({ ...errors, deadline: '' });
            }}
            className="w-full px-3 py-2 text-xs bg-white dark:bg-[#101010] border border-[#E0E0E0] dark:border-[#333333] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E50914] text-[#101010] dark:text-white font-mono"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E0E0E0] dark:border-[#333333]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-[#555555] dark:text-[#A3A3A3] hover:bg-[#F5F5F5] dark:hover:bg-[#202020] rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 text-xs font-bold text-white bg-[#E50914] hover:bg-[#b80710] rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            Assign Task
          </button>
        </div>
      </form>
    </Modal>
  );
};
