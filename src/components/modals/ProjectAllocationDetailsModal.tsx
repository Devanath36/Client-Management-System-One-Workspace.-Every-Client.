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
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/80 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                    {project.clientName}
                  </span>
                  {project.companyName && (
                    <>
                      <span className="text-slate-300 dark:text-slate-600">·</span>
                      <span className="text-xs text-slate-500 font-medium">
                        {project.companyName}
                      </span>
                    </>
                  )}
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                  {project.purpose}
                </h3>
                {project.description && (
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                    {project.description}
                  </p>
                )}
              </div>

              <span
                className={`text-xs font-semibold px-2.5 py-1 rounded-lg shrink-0 self-start sm:self-auto ${
                  project.status === 'Done'
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                    : project.status === 'In Progress'
                    ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                    : 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                }`}
              >
                {project.status}
              </span>
            </div>

            {/* Attribution Meta Matrix */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-200/80 dark:border-slate-700/80 text-xs">
              <div className="space-y-0.5">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                  Assigned Manager
                </span>
                <p className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>{project.managerName || 'Operations Manager'}</span>
                </p>
              </div>

              <div className="space-y-0.5">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                  Assigned Team Lead
                </span>
                <p className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span>{project.leadName}</span>
                </p>
              </div>

              <div className="space-y-0.5">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                  Timeline / Duration
                </span>
                <p className="font-mono text-slate-800 dark:text-slate-200">
                  {project.duration} Days
                </p>
                <p className="text-[10px] text-slate-400">
                  {project.startDate} → {project.deadline}
                </p>
              </div>

              <div className="space-y-0.5">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                  Completion Progress
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    {progressPercent}%
                  </span>
                  <span className="text-[10px] text-slate-500">
                    ({completedCount}/{projectTasks.length} tasks)
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-600 h-full rounded-full transition-all"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            </div>

            {isOverdue && (
              <div className="p-2.5 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 rounded-xl text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>This project is past its deadline ({project.deadline}). Attention required on remaining work components.</span>
              </div>
            )}
          </div>

          {/* Work Allocation Sub-Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-600" />
                <span>Allocated Work Components ({componentsMap.size})</span>
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Tasks decomposed across architectural layers and assigned to registered specialists.
              </p>
            </div>

            <button
              onClick={() => setAddTaskOpen(true)}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
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
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
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
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
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
            <div className="py-10 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl space-y-2">
              <CheckSquare className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-700" />
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                No tasks allocated for this project yet.
              </p>
              <p className="text-[11px] text-slate-500">
                Click &quot;Allocate New Component Task&quot; above to create and assign tasks to team members.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {displayedTasks.map((task) => {
                return (
                  <div
                    key={task.id}
                    className="p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 hover:border-blue-300 dark:hover:border-blue-700 transition-colors space-y-2.5"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 flex items-center gap-1">
                            <Tag className="w-3 h-3" />
                            <span>{task.workComponent || 'General Delivery'}</span>
                          </span>

                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                              task.status === 'Done' || task.status === 'Completed'
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                                : task.status === 'In Progress'
                                ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400'
                                : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                            }`}
                          >
                            Status: {task.status}
                          </span>
                        </div>

                        <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                          {task.title}
                        </h5>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                          {task.description}
                        </p>
                      </div>

                      <div className="text-right shrink-0 font-mono text-[11px]">
                        <span className="text-slate-500">Due: </span>
                        <strong className="text-slate-900 dark:text-white">{task.deadline}</strong>
                      </div>
                    </div>

                    {/* Assignee strip */}
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2">
                        {task.assigneeAvatar ? (
                          <img
                            src={task.assigneeAvatar}
                            alt={task.assigneeName}
                            referrerPolicy="no-referrer"
                            className="w-5 h-5 rounded-full object-cover"
                          />
                        ) : (
                          <User className="w-4 h-4 text-slate-400" />
                        )}
                        <span className="text-slate-600 dark:text-slate-400">
                          Assigned Specialist:{' '}
                          <strong className="text-slate-900 dark:text-white">
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
          <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={onClose}
              className="px-5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
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
