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
        <div className="flex flex-wrap items-center gap-3 text-xs text-[#666666] dark:text-[#A3A3A3]">
          {task.workComponent && (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#FF7900]/10 text-[#FF7900] font-semibold border border-[#FF7900]/30 text-[11px]">
              <Tag className="w-3 h-3 text-[#FF7900]" />
              <span>{task.workComponent}</span>
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-[#E50914]" />
            Assignee: <strong className="text-[#101010] dark:text-white font-medium">{task.assigneeName}</strong>
          </span>
          <span aria-hidden="true">·</span>
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-[#E50914]" />
            Due: <span className="font-mono">{task.deadline}</span>
          </span>
        </div>

        {/* Status bar */}
        <div className="flex items-center justify-between p-3 bg-[#F7F7F7] dark:bg-[#101010] rounded-xl border border-[#E0E0E0] dark:border-[#333333]">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-[#888888] font-semibold block">Status</span>
            <span className="text-xs font-semibold text-[#101010] dark:text-white mt-0.5 inline-block">
              {task.status}
            </span>
          </div>
          <div className="text-right">
            <span className="text-[10px] uppercase tracking-wider text-[#888888] font-semibold block">Due Date</span>
            <span className="text-xs font-mono font-semibold text-[#101010] dark:text-white mt-0.5 inline-block">
              {task.deadline}
            </span>
          </div>
        </div>

        {/* Description */}
        <div>
          <h4 className="text-xs font-semibold text-[#333333] dark:text-[#D4D4D4] mb-1">
            Task Description & Scope
          </h4>
          <p className="text-xs text-[#555555] dark:text-[#A3A3A3] leading-relaxed bg-white dark:bg-[#171717] p-3.5 rounded-xl border border-[#E0E0E0] dark:border-[#333333]">
            {task.description}
          </p>
        </div>

        {/* Tags */}
        {task.tags && task.tags.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-[#333333] dark:text-[#D4D4D4] mb-1.5">
              Domain Tags
            </h4>
            <div className="flex flex-wrap gap-1.5 text-xs text-[#555555] dark:text-[#A3A3A3]">
              {task.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 bg-[#F5F5F5] dark:bg-[#202020] rounded border border-[#E0E0E0] dark:border-[#333333] text-[11px]"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center justify-end pt-3 border-t border-[#E0E0E0] dark:border-[#333333]">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-[#555555] dark:text-[#D4D4D4] hover:bg-[#F5F5F5] dark:hover:bg-[#202020] rounded-lg transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};
