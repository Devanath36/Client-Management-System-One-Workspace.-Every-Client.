import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { useApp } from '../../context/AppContext';
import { Calendar, Clock, UserCheck, AlertCircle } from 'lucide-react';

interface AddClientModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Replaced enterprise CRM client registration with the simple "Create New Project" form
 * containing ONLY the 8 required fields and no CRM / contact / contract fields.
 */
export const AddClientModal: React.FC<AddClientModalProps> = ({ isOpen, onClose }) => {
  const { users, createProject } = useApp();

  // The 5 registered Team Leads
  const teamLeads = users.filter((u) => u.role === 'team_lead' && u.status === 'active');

  const todayStr = new Date().toISOString().substring(0, 10);
  const nextTwoWeeksStr = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10);

  // KEEP:
  // 1. Client Name (required)
  // 2. Company Name (optional)
  // 3. Project Purpose (required, free-text input)
  // 4. Project Description (optional)
  // 5. Project Start Date (required)
  // 6. Project Deadline (required)
  // 7. Project Duration (automatically calculated in days)
  // 8. Assign Team Lead (dropdown showing the five registered Team Leads)
  const [clientName, setClientName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [purpose, setPurpose] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState(todayStr);
  const [deadline, setDeadline] = useState(nextTwoWeeksStr);
  const [leadId, setLeadId] = useState('');
  const [error, setError] = useState('');

  // Automatically calculated duration in days
  const [durationDays, setDurationDays] = useState<number>(14);

  useEffect(() => {
    if (startDate && deadline) {
      const start = new Date(startDate).getTime();
      const end = new Date(deadline).getTime();
      if (!isNaN(start) && !isNaN(end)) {
        const diffDays = Math.round((end - start) / (1000 * 60 * 60 * 24));
        setDurationDays(diffDays);
      }
    }
  }, [startDate, deadline]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!clientName.trim()) {
      setError('Client Name is required.');
      return;
    }

    if (!purpose.trim()) {
      setError('Project Purpose is required (accepts any custom project objective).');
      return;
    }

    if (!startDate) {
      setError('Project Start Date is required.');
      return;
    }

    if (!deadline) {
      setError('Project Deadline is required.');
      return;
    }

    if (new Date(deadline) < new Date(startDate)) {
      setError('Project deadline cannot be earlier than start date.');
      return;
    }

    if (!leadId) {
      setError('Please assign one of the registered Team Leads.');
      return;
    }

    const result = createProject({
      clientName: clientName.trim(),
      companyName: companyName.trim() || undefined,
      purpose: purpose.trim(),
      description: description.trim() || undefined,
      startDate,
      deadline,
      leadId,
    });

    if (result.success) {
      setClientName('');
      setCompanyName('');
      setPurpose('');
      setDescription('');
      setStartDate(todayStr);
      setDeadline(nextTwoWeeksStr);
      setLeadId('');
      setError('');
      onClose();
    } else {
      setError(result.error || 'Failed to create project.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Project"
      description="Initialize a new client project, set project purpose, dates, duration, and assign a Team Lead."
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3.5 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 rounded-xl text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        {/* 1. Client Name (required) & 2. Company Name (optional) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Client Name *
            </label>
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="e.g. John Doe / Apex Solutions"
              className="w-full px-3.5 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Company Name (Optional)
            </label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="e.g. Apex Global Corp"
              className="w-full px-3.5 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
            />
          </div>
        </div>

        {/* 3. Project Purpose (required, free-text input) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Project Purpose *
            </label>
            <span className="text-[10px] text-slate-400">Accepts manually entered text</span>
          </div>
          <input
            type="text"
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            placeholder="Enter custom project purpose..."
            className="w-full px-3.5 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
          />
        </div>

        {/* 4. Project Description (optional text area) */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Project Description (Optional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Provide optional project details or scope..."
            className="w-full px-3.5 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white resize-none"
          />
        </div>

        {/* 5. Start Date, 6. Deadline, 7. Project Duration */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              <span>Project Start Date *</span>
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-rose-600" />
              <span>Project Deadline *</span>
            </label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-emerald-600" />
              <span>Project Duration</span>
            </label>
            <div className="px-3.5 py-2 text-xs font-mono font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white flex items-center justify-between">
              <span>{durationDays >= 0 ? `${durationDays} Days` : 'Invalid Range'}</span>
              <span className="text-[10px] text-slate-400 font-sans font-normal">Auto-calculated</span>
            </div>
          </div>
        </div>

        {/* 8. Assign Team Lead (dropdown showing the five registered Team Leads) */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
            <span>Assign Team Lead *</span>
          </label>
          <select
            value={leadId}
            onChange={(e) => setLeadId(e.target.value)}
            className="w-full px-3.5 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white cursor-pointer"
          >
            <option value="">Select one of the 5 registered Team Leads...</option>
            {teamLeads.map((lead) => (
              <option key={lead.id} value={lead.id}>
                {lead.name} ({lead.loginId})
              </option>
            ))}
          </select>
          <p className="text-[11px] text-slate-400">
            Assigned project will appear directly in this Team Lead&apos;s dashboard.
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            Create & Assign Project
          </button>
        </div>
      </form>
    </Modal>
  );
};
