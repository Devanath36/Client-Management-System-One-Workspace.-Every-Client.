import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { useApp } from '../../context/AppContext';
import { Briefcase, Calendar, Clock, UserCheck, AlertCircle, FileText } from 'lucide-react';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({ isOpen, onClose }) => {
  const { users, createProject, currentUser } = useApp();

  const teamLeads = users.filter((u) => u.role === 'team_lead' && u.status === 'active');
  const managers = users.filter((u) => u.role === 'manager' && u.status === 'active');

  const todayStr = new Date().toISOString().substring(0, 10);
  const nextTwoWeeksStr = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10);

  const [clientName, setClientName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [purpose, setPurpose] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState(todayStr);
  const [deadline, setDeadline] = useState(nextTwoWeeksStr);
  const [leadId, setLeadId] = useState('');
  const [managerId, setManagerId] = useState(
    currentUser?.role === 'manager' ? currentUser.id : 'user-manager-1'
  );
  const [error, setError] = useState('');

  // Automatically calculate duration in days
  const [durationDays, setDurationDays] = useState<number>(14);

  useEffect(() => {
    if (currentUser?.role === 'manager') {
      setManagerId(currentUser.id);
    }
  }, [currentUser]);

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
      setError('Please enter the Client Name.');
      return;
    }

    if (!purpose.trim()) {
      setError('Please specify the Project Purpose.');
      return;
    }

    if (!startDate) {
      setError('Please select a project start date.');
      return;
    }

    if (!deadline) {
      setError('Please select a project deadline.');
      return;
    }

    if (new Date(deadline) < new Date(startDate)) {
      setError('Validation Error: Project deadline cannot be earlier than the start date.');
      return;
    }

    if (!leadId) {
      setError('Please assign a registered Team Lead to this project.');
      return;
    }

    const assignedMgr = managers.find((m) => m.id === managerId);

    const result = createProject({
      clientName: clientName.trim(),
      companyName: companyName.trim() || undefined,
      purpose: purpose.trim(),
      description: description.trim() || undefined,
      startDate,
      deadline,
      leadId,
      managerId,
      managerName: assignedMgr ? assignedMgr.name : currentUser?.name,
    });

    if (result.success) {
      // Reset form
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
      description="Initialize a client project, assign an authorized Team Lead, and establish delivery timeline."
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3.5 bg-[#E50914]/10 border border-[#E50914]/30 rounded-xl text-xs text-[#E50914] flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#E50914]" />
            <span>{error}</span>
          </div>
        )}

        {/* Client Name & Optional Company Name */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#333333] dark:text-[#D4D4D4]">
              Client Name *
            </label>
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="e.g. John Doe / Apex Solutions"
              className="w-full px-3.5 py-2 text-xs bg-white dark:bg-[#101010] border border-[#E0E0E0] dark:border-[#333333] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E50914] text-[#101010] dark:text-white"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#333333] dark:text-[#D4D4D4]">
              Company Name (Optional)
            </label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="e.g. Apex Global Corp"
              className="w-full px-3.5 py-2 text-xs bg-white dark:bg-[#101010] border border-[#E0E0E0] dark:border-[#333333] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E50914] text-[#101010] dark:text-white"
            />
          </div>
        </div>

        {/* Project Purpose (free text input, accepts any text) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold text-[#333333] dark:text-[#D4D4D4]">
              Project Purpose *
            </label>
            <span className="text-[10px] text-[#888888]">Accepts any custom project objective</span>
          </div>
          <input
            type="text"
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            placeholder="e.g. Implement unified customer portal and automated reporting engine"
            className="w-full px-3.5 py-2 text-xs bg-white dark:bg-[#101010] border border-[#E0E0E0] dark:border-[#333333] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E50914] text-[#101010] dark:text-white"
          />
        </div>

        {/* Project Description (optional text area) */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-[#333333] dark:text-[#D4D4D4]">
            Project Description (Optional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Detailed scope, milestone criteria, and client expectations..."
            className="w-full px-3.5 py-2 text-xs bg-white dark:bg-[#101010] border border-[#E0E0E0] dark:border-[#333333] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E50914] text-[#101010] dark:text-white resize-none"
          />
        </div>

        {/* Date Pickers & Automatically Calculated Duration */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#333333] dark:text-[#D4D4D4] flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#FF7900]" />
              <span>Start Date *</span>
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white dark:bg-[#101010] border border-[#E0E0E0] dark:border-[#333333] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E50914] text-[#101010] dark:text-white"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#333333] dark:text-[#D4D4D4] flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#E50914]" />
              <span>Project Deadline *</span>
            </label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white dark:bg-[#101010] border border-[#E0E0E0] dark:border-[#333333] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E50914] text-[#101010] dark:text-white"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#333333] dark:text-[#D4D4D4] flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#FFC928]" />
              <span>Project Duration</span>
            </label>
            <div className="px-3.5 py-2 text-xs font-mono font-bold rounded-xl border border-[#E0E0E0] dark:border-[#333333] bg-[#F7F7F7] dark:bg-[#101010] text-[#101010] dark:text-white flex items-center justify-between">
              <span>{durationDays >= 0 ? `${durationDays} Days` : 'Invalid Range'}</span>
              {durationDays < 0 && (
                <span className="text-[10px] text-[#E50914] font-sans font-normal">Check dates</span>
              )}
            </div>
          </div>
        </div>

        {/* Manager-Wise Assignment & Team Lead Assignment */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Assigning Manager */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#333333] dark:text-[#D4D4D4] flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-[#E50914]" />
              <span>Assigning Manager *</span>
            </label>
            {currentUser?.role === 'admin' ? (
              <select
                value={managerId}
                onChange={(e) => setManagerId(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-white dark:bg-[#101010] border border-[#E0E0E0] dark:border-[#333333] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E50914] text-[#101010] dark:text-white cursor-pointer"
              >
                {managers.map((mgr) => (
                  <option key={mgr.id} value={mgr.id}>
                    {mgr.name} ({mgr.loginId})
                  </option>
                ))}
              </select>
            ) : (
              <div className="px-3.5 py-2 text-xs font-semibold rounded-xl border border-[#E50914]/30 bg-[#FFF5F5] dark:bg-[#101010] text-[#101010] dark:text-white flex items-center justify-between">
                <span>{currentUser?.name || 'Manager 1'}</span>
                <span className="text-[10px] font-mono uppercase tracking-wider bg-[#E50914]/15 text-[#E50914] px-2 py-0.5 rounded">
                  Assigning Manager
                </span>
              </div>
            )}
            <p className="text-[11px] text-[#888888]">
              Project will be registered under this Manager for centralized visibility.
            </p>
          </div>

          {/* Assigned Team Lead */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#333333] dark:text-[#D4D4D4] flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-[#FF7900]" />
              <span>Assign Team Lead *</span>
            </label>
            <select
              value={leadId}
              onChange={(e) => setLeadId(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-white dark:bg-[#101010] border border-[#E0E0E0] dark:border-[#333333] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E50914] text-[#101010] dark:text-white cursor-pointer"
            >
              <option value="">Select one of the 5 registered Team Leads...</option>
              {teamLeads.map((lead) => (
                <option key={lead.id} value={lead.id}>
                  {lead.name} ({lead.loginId})
                </option>
              ))}
            </select>
            <p className="text-[11px] text-[#888888]">
              Assigned Team Lead will allocate work components to members.
            </p>
          </div>
        </div>

        {/* Modal Actions */}
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
            Create & Assign Project
          </button>
        </div>
      </form>
    </Modal>
  );
};
