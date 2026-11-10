import React from 'react';
import { Modal } from '../common/Modal';
import { Client, Project } from '../../types';
import { Building2, Mail, Phone, Calendar, ShieldCheck, DollarSign } from 'lucide-react';

interface ClientDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client | null;
  projects: Project[];
}

export const ClientDetailsModal: React.FC<ClientDetailsModalProps> = ({
  isOpen,
  onClose,
  client,
  projects,
}) => {
  if (!client) return null;

  const clientProjects = projects.filter((p) => p.clientId === client.id);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={client.name}
      description={`Enterprise Account Profile · ${client.industry}`}
      maxWidth="2xl"
    >
      <div className="space-y-4">
        {/* KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl">
          <div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">Account Tier</span>
            <p className="text-sm font-semibold text-slate-900 dark:text-white mt-0.5">{client.tier}</p>
          </div>
          <div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">Annual Contract</span>
            <p className="text-sm font-semibold text-slate-900 dark:text-white mt-0.5 font-mono tabular-nums">
              ${(client.contractValue / 1000).toFixed(0)}k/yr
            </p>
          </div>
          <div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">Health Score</span>
            <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 mt-0.5 font-mono tabular-nums">
              {client.healthScore}/100
            </p>
          </div>
          <div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">SLA Adherence</span>
            <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5 font-mono tabular-nums">
              {client.slaAdherence}%
            </p>
          </div>
        </div>

        {/* Stakeholder & Lead Assignment */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-3.5 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
            <h4 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-blue-600" />
              Primary Client Stakeholder
            </h4>
            <p className="text-sm font-medium text-slate-900 dark:text-white">{client.primaryContact.name}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{client.primaryContact.role}</p>
            <div className="pt-2 text-xs text-slate-600 dark:text-slate-300 space-y-1">
              <p className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                {client.primaryContact.email}
              </p>
              <p className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                {client.primaryContact.phone}
              </p>
            </div>
          </div>

          <div className="p-3.5 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
            <h4 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              Assigned Workspace Team
            </h4>
            <div className="text-xs space-y-2">
              <div>
                <span className="text-slate-400">Client Operations Manager:</span>
                <p className="font-medium text-slate-900 dark:text-white">{client.assignedManagerName}</p>
              </div>
              <div>
                <span className="text-slate-400">Assigned Solutions Lead:</span>
                <p className="font-medium text-slate-900 dark:text-white">{client.assignedLeadName}</p>
              </div>
              <div className="pt-1 flex items-center gap-2 text-[11px] text-slate-500 font-mono">
                <Calendar className="w-3.5 h-3.5" />
                <span>Renewal: {client.renewalDate}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Notes & SLA */}
        <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl">
          <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">
            Contract Scope & SLA Commitments
          </h4>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            {client.notes}
          </p>
        </div>

        {/* Active Projects */}
        <div>
          <h4 className="text-xs font-semibold text-slate-900 dark:text-white mb-2">
            Active Projects ({clientProjects.length})
          </h4>
          {clientProjects.length === 0 ? (
            <p className="text-xs text-slate-500 italic p-3 border border-dashed rounded-lg text-center">
              No active projects currently linked to this client.
            </p>
          ) : (
            <div className="space-y-2">
              {clientProjects.map((proj) => (
                <div
                  key={proj.id}
                  className="p-3 border border-slate-200 dark:border-slate-800 rounded-lg flex items-center justify-between text-xs"
                >
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">{proj.title}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Deadline: {proj.deadline} · Lead: {proj.leadName}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-mono tabular-nums text-blue-600 dark:text-blue-400 font-medium">
                      {proj.progress}%
                    </span>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {proj.completedDeliverablesCount}/{proj.deliverablesCount} Deliverables
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg transition-colors"
          >
            Close Overview
          </button>
        </div>
      </div>
    </Modal>
  );
};
