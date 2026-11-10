import React from 'react';
import { Modal } from '../common/Modal';
import { Task } from '../../types';
import { Calendar, User, Tag } from 'lucide-react';

interface TaskDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
}

export const TaskDetailsModal: React.FC<TaskDetailsModalProps> = ({
  isOpen,
  onClose,
  task,
}) => {
  if (!task) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={task.title}
      description={`Task ID: ${task.id} · ${task.clientName}`}
      maxWidth="xl"
    >
      <div className="space-y-4">
        {/* Meta badges */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
          {task.workComponent && (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-semibold border border-indigo-200 dark:border-indigo-800 text-[11px]">
              <Tag className="w-3 h-3 text-indigo-600" />
              <span>{task.workComponent}</span>
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-blue-500" />
            Assignee: <strong className="text-slate-900 dark:text-white font-medium">{task.assigneeName}</strong>
          </span>
          <span aria-hidden="true">·</span>
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-blue-500" />
            Due: <span className="font-mono">{task.deadline}</span>
          </span>
        </div>

        {/* Status bar */}
        <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold block">Status</span>
            <span className="text-xs font-semibold text-slate-900 dark:text-white mt-0.5 inline-block">
              {task.status}
            </span>
          </div>
          <div className="text-right">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold block">Due Date</span>
            <span className="text-xs font-mono font-semibold text-slate-900 dark:text-white mt-0.5 inline-block">
              {task.deadline}
            </span>
          </div>
        </div>

        {/* Description */}
        <div>
          <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">
            Task Description & Scope
          </h4>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-white dark:bg-slate-800 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
            {task.description}
          </p>
        </div>

        {/* Tags */}
        {task.tags && task.tags.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
              Domain Tags
            </h4>
            <div className="flex flex-wrap gap-1.5 text-xs text-slate-600 dark:text-slate-400">
              {task.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 text-[11px]"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};
