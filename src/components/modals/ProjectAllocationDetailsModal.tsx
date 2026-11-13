import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Project, Task } from '../../types';
import {
  Briefcase,
  UserCheck,
  Calendar,
  Clock,
  Layers,
  CheckCircle2,
  AlertCircle,
  FileText,
  User,
  Plus,
  Tag,
  CheckSquare,
} from 'lucide-react';
import { AddTaskModal } from './AddTaskModal';

interface ProjectAllocationDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
  tasks: Task[];
}

export const ProjectAllocationDetailsModal: React.FC<ProjectAllocationDetailsModalProps> = ({
  isOpen,
  onClose,
  project,
  tasks,
}) => {
  const [addTaskOpen, setAddTaskOpen] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState<string>('all');

  if (!project) return null;

  const projectTasks = tasks.filter((t) => t.projectId === project.id);

  // Group tasks by Work Component
  const componentsMap = new Map<string, Task[]>();
  projectTasks.forEach((t) => {
    const comp = t.workComponent || 'General Delivery';
    const list = componentsMap.get(comp) || [];
    list.push(t);
    componentsMap.set(comp, list);
  });

  const allComponents = Array.from(componentsMap.keys());

  const displayedTasks =
    selectedComponent === 'all'
      ? projectTasks
      : projectTasks.filter((t) => (t.workComponent || 'General Delivery') === selectedComponent);

  const completedCount = projectTasks.filter((t) => t.status === 'Done' || t.status === 'Completed').length;
  const progressPercent = projectTasks.length > 0 ? Math.round((completedCount / projectTasks.length) * 100) : project.progress;

  const isOverdue =
    (project.status !== 'Done' && project.status !== 'Completed') &&
    new Date(project.deadline).getTime() < Date.now();

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Project Work Allocation & Delivery Details"
        description="Inspect multi-component work allocation, assigned specialists, deliverables, and progress status."
        maxWidth="3xl"
      >
        <div className="space-y-6">
          {/* Project Summary Banner */}
          <div className="p-4 bg-[#F7F7F7] dark:bg-[#171717] rounded-2xl border border-[#E0E0E0] dark:border-[#333333] space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#E50914]">
                    {project.clientName}
                  </span>
                  {project.companyName && (
                    <>
                      <span className="text-[#A3A3A3]">·</span>
                      <span className="text-xs text-[#666666] dark:text-[#A3A3A3] font-medium">
                        {project.companyName}
                      </span>
                    </>
                  )}
                </div>
                <h3 className="text-base font-bold text-[#101010] dark:text-white mt-0.5">
                  {project.purpose}
                </h3>
                {project.description && (
                  <p className="text-xs text-[#555555] dark:text-[#A3A3A3] mt-1 leading-relaxed">
                    {project.description}
                  </p>
                )}
              </div>

              <span
                className={`text-xs font-semibold px-2.5 py-1 rounded-lg shrink-0 self-start sm:self-auto ${
                  project.status === 'Done'
                    ? 'bg-[#FFC928]/15 text-[#101010] dark:text-[#FFC928] border border-[#FFC928]/40'
                    : project.status === 'In Progress'
                    ? 'bg-[#FF7900]/15 text-[#FF7900] border border-[#FF7900]/40'
                    : 'bg-[#E50914]/15 text-[#E50914] border border-[#E50914]/40'
                }`}
              >
                {project.status}
              </span>
            </div>

            {/* Attribution Meta Matrix */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-[#E0E0E0] dark:border-[#333333] text-xs">
              <div className="space-y-0.5">
                <span className="text-[10px] text-[#888888] dark:text-[#A3A3A3] uppercase font-bold tracking-wider">
                  Assigned Manager
                </span>
                <p className="font-semibold text-[#101010] dark:text-white flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-[#E50914] shrink-0" />
                  <span>{project.managerName || 'Operations Manager'}</span>
                </p>
              </div>

              <div className="space-y-0.5">
                <span className="text-[10px] text-[#888888] dark:text-[#A3A3A3] uppercase font-bold tracking-wider">
                  Assigned Team Lead
                </span>
                <p className="font-semibold text-[#101010] dark:text-white flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-[#FF7900] shrink-0" />
                  <span>{project.leadName}</span>
                </p>
              </div>

              <div className="space-y-0.5">
                <span className="text-[10px] text-[#888888] dark:text-[#A3A3A3] uppercase font-bold tracking-wider">
                  Timeline / Duration
                </span>
                <p className="font-mono text-[#101010] dark:text-[#D4D4D4]">
                  {project.duration} Days
                </p>
                <p className="text-[10px] text-[#888888] dark:text-[#A3A3A3]">
                  {project.startDate} → {project.deadline}
                </p>
              </div>

              <div className="space-y-0.5">
                <span className="text-[10px] text-[#888888] dark:text-[#A3A3A3] uppercase font-bold tracking-wider">
                  Completion Progress
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-[#101010] dark:text-white">
                    {progressPercent}%
                  </span>
                  <span className="text-[10px] text-[#666666] dark:text-[#A3A3A3]">
                    ({completedCount}/{projectTasks.length} tasks)
                  </span>
                </div>
                <div className="w-full bg-[#E0E0E0] dark:bg-[#333333] h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-[#FF7900] h-full rounded-full transition-all"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            </div>

            {isOverdue && (
              <div className="p-2.5 bg-[#FFF5F5] dark:bg-[#101010] border border-[#E50914]/40 rounded-xl text-xs text-[#E50914] flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-[#E50914] shrink-0" />
                <span>This project is past its deadline ({project.deadline}). Attention required on remaining work components.</span>
              </div>
            )}
          </div>

          {/* Work Allocation Sub-Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-sm font-bold text-[#101010] dark:text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#E50914]" />
                <span>Allocated Work Components ({componentsMap.size})</span>
              </h4>
              <p className="text-xs text-[#666666] dark:text-[#A3A3A3] mt-0.5">
                Tasks decomposed across architectural layers and assigned to registered specialists.
              </p>
            </div>

            <button
              onClick={() => setAddTaskOpen(true)}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#E50914] hover:bg-[#c40812] rounded-xl shadow-xs transition-colors flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Allocate New Component Task</span>
            </button>
          </div>

          {/* Component Tabs / Filters */}
          {allComponents.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
              <button
                onClick={() => setSelectedComponent('all')}
                className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                  selectedComponent === 'all'
                    ? 'bg-[#E50914] text-white'
                    : 'bg-[#F0F0F0] dark:bg-[#171717] text-[#555555] dark:text-[#A3A3A3] hover:text-[#101010] dark:hover:text-white'
                }`}
              >
                All Components ({projectTasks.length})
              </button>
              {allComponents.map((comp) => {
                const count = componentsMap.get(comp)?.length || 0;
                return (
                  <button
                    key={comp}
                    onClick={() => setSelectedComponent(comp)}
                    className={`px-3 py-1 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer ${
                      selectedComponent === comp
                        ? 'bg-[#E50914] text-white'
                        : 'bg-[#F0F0F0] dark:bg-[#171717] text-[#555555] dark:text-[#A3A3A3] hover:text-[#101010] dark:hover:text-white'
                    }`}
                  >
                    {comp} ({count})
                  </button>
                );
              })}
            </div>
          )}

          {/* Tasks List */}
          {displayedTasks.length === 0 ? (
            <div className="py-10 text-center border border-dashed border-[#D4D4D4] dark:border-[#333333] rounded-2xl space-y-2">
              <CheckSquare className="w-8 h-8 mx-auto text-[#A3A3A3] dark:text-[#444444]" />
              <p className="text-xs font-semibold text-[#333333] dark:text-[#D4D4D4]">
                No tasks allocated for this project yet.
              </p>
              <p className="text-[11px] text-[#666666] dark:text-[#A3A3A3]">
                Click &quot;Allocate New Component Task&quot; above to create and assign tasks to team members.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {displayedTasks.map((task) => {
                return (
                  <div
                    key={task.id}
                    className="p-4 border border-[#E0E0E0] dark:border-[#333333] rounded-xl bg-white dark:bg-[#141414] hover:border-[#E50914] transition-colors space-y-2.5"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#F7F7F7] dark:bg-[#171717] text-[#FF7900] border border-[#FF7900]/40 flex items-center gap-1">
                            <Tag className="w-3 h-3" />
                            <span>{task.workComponent || 'General Delivery'}</span>
                          </span>

                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                              task.status === 'Done' || task.status === 'Completed'
                                ? 'bg-[#FFC928]/15 text-[#101010] dark:text-[#FFC928]'
                                : task.status === 'In Progress'
                                ? 'bg-[#FF7900]/15 text-[#FF7900]'
                                : 'bg-[#F0F0F0] text-[#555555] dark:bg-[#171717] dark:text-[#D4D4D4]'
                            }`}
                          >
                            Status: {task.status}
                          </span>
                        </div>

                        <h5 className="text-xs font-bold text-[#101010] dark:text-white">
                          {task.title}
                        </h5>
                        <p className="text-xs text-[#555555] dark:text-[#A3A3A3] leading-relaxed">
                          {task.description}
                        </p>
                      </div>

                      <div className="text-right shrink-0 font-mono text-[11px]">
                        <span className="text-[#666666] dark:text-[#A3A3A3]">Due: </span>
                        <strong className="text-[#101010] dark:text-white">{task.deadline}</strong>
                      </div>
                    </div>

                    {/* Assignee strip */}
                    <div className="pt-2 border-t border-[#E0E0E0] dark:border-[#333333] flex flex-wrap items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2">
                        {task.assigneeAvatar ? (
                          <img
                            src={task.assigneeAvatar}
                            alt={task.assigneeName}
                            referrerPolicy="no-referrer"
                            className="w-5 h-5 rounded-full object-cover"
                          />
                        ) : (
                          <User className="w-4 h-4 text-[#888888]" />
                        )}
                        <span className="text-[#555555] dark:text-[#A3A3A3]">
                          Assigned Specialist:{' '}
                          <strong className="text-[#101010] dark:text-white">
                            {task.assigneeName}
                          </strong>
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Close button */}
          <div className="flex justify-end pt-3 border-t border-[#E0E0E0] dark:border-[#333333]">
            <button
              onClick={onClose}
              className="px-5 py-2 text-xs font-semibold text-[#333333] dark:text-[#D4D4D4] bg-[#F0F0F0] dark:bg-[#171717] hover:bg-[#E0E0E0] dark:hover:bg-[#202020] rounded-xl transition-colors cursor-pointer"
            >
              Close Inspector
            </button>
          </div>
        </div>
      </Modal>

      {/* Add Task Modal pre-linked to this project */}
      <AddTaskModal
        isOpen={addTaskOpen}
        onClose={() => setAddTaskOpen(false)}
        defaultProjectId={project.id}
      />
    </>
  );
};
