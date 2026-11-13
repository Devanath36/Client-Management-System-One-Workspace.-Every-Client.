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
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-[#F7F7F7] dark:bg-[#171717] border border-[#E0E0E0] dark:border-[#333333] rounded-xl">
          <div>
            <span className="text-[11px] text-[#666666] dark:text-[#A3A3A3]">Account Tier</span>
            <p className="text-sm font-semibold text-[#101010] dark:text-white mt-0.5">{client.tier}</p>
          </div>
          <div>
            <span className="text-[11px] text-[#666666] dark:text-[#A3A3A3]">Annual Contract</span>
            <p className="text-sm font-semibold text-[#101010] dark:text-white mt-0.5 font-mono tabular-nums">
              ${(client.contractValue / 1000).toFixed(0)}k/yr
            </p>
          </div>
          <div>
            <span className="text-[11px] text-[#666666] dark:text-[#A3A3A3]">Health Score</span>
            <p className="text-sm font-semibold text-[#FF7900] mt-0.5 font-mono tabular-nums">
              {client.healthScore}/100
            </p>
          </div>
          <div>
            <span className="text-[11px] text-[#666666] dark:text-[#A3A3A3]">SLA Adherence</span>
            <p className="text-sm font-semibold text-[#FFC928] mt-0.5 font-mono tabular-nums">
              {client.slaAdherence}%
            </p>
          </div>
        </div>

        {/* Stakeholder & Lead Assignment */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-3.5 border border-[#E0E0E0] dark:border-[#333333] rounded-xl space-y-2">
            <h4 className="text-xs font-semibold text-[#101010] dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-[#E50914]" />
              Primary Client Stakeholder
            </h4>
            <p className="text-sm font-medium text-[#101010] dark:text-white">{client.primaryContact.name}</p>
            <p className="text-xs text-[#666666] dark:text-[#A3A3A3]">{client.primaryContact.role}</p>
            <div className="pt-2 text-xs text-[#555555] dark:text-[#D4D4D4] space-y-1">
              <p className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[#888888]" />
                {client.primaryContact.email}
              </p>
              <p className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#888888]" />
                {client.primaryContact.phone}
              </p>
            </div>
          </div>

          <div className="p-3.5 border border-[#E0E0E0] dark:border-[#333333] rounded-xl space-y-2">
            <h4 className="text-xs font-semibold text-[#101010] dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#FF7900]" />
              Assigned Workspace Team
            </h4>
            <div className="text-xs space-y-2">
              <div>
                <span className="text-[#888888] dark:text-[#A3A3A3]">Client Operations Manager:</span>
                <p className="font-medium text-[#101010] dark:text-white">{client.assignedManagerName}</p>
              </div>
              <div>
                <span className="text-[#888888] dark:text-[#A3A3A3]">Assigned Solutions Lead:</span>
                <p className="font-medium text-[#101010] dark:text-white">{client.assignedLeadName}</p>
              </div>
              <div className="pt-1 flex items-center gap-2 text-[11px] text-[#666666] dark:text-[#A3A3A3] font-mono">
                <Calendar className="w-3.5 h-3.5" />
                <span>Renewal: {client.renewalDate}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Notes & SLA */}
        <div className="p-3.5 bg-[#F7F7F7] dark:bg-[#171717] border border-[#E0E0E0] dark:border-[#333333] rounded-xl">
          <h4 className="text-xs font-semibold text-[#101010] dark:text-white mb-1">
            Contract Scope & SLA Commitments
          </h4>
          <p className="text-xs text-[#555555] dark:text-[#D4D4D4] leading-relaxed">
            {client.notes}
          </p>
        </div>

        {/* Active Projects */}
        <div>
          <h4 className="text-xs font-semibold text-[#101010] dark:text-white mb-2">
            Active Projects ({clientProjects.length})
          </h4>
          {clientProjects.length === 0 ? (
            <p className="text-xs text-[#666666] dark:text-[#A3A3A3] italic p-3 border border-dashed border-[#D4D4D4] dark:border-[#333333] rounded-lg text-center">
              No active projects currently linked to this client.
            </p>
          ) : (
            <div className="space-y-2">
              {clientProjects.map((proj) => (
                <div
                  key={proj.id}
                  className="p-3 border border-[#E0E0E0] dark:border-[#333333] rounded-lg flex items-center justify-between text-xs"
                >
                  <div>
                    <p className="font-semibold text-[#101010] dark:text-white">{proj.title}</p>
                    <p className="text-[11px] text-[#666666] dark:text-[#A3A3A3] mt-0.5">
                      Deadline: {proj.deadline} · Lead: {proj.leadName}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-mono tabular-nums text-[#E50914] font-medium">
                      {proj.progress}%
                    </span>
                    <p className="text-[10px] text-[#888888] dark:text-[#A3A3A3] mt-0.5">
                      {proj.completedDeliverablesCount}/{proj.deliverablesCount} Deliverables
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end pt-3 border-t border-[#E0E0E0] dark:border-[#333333]">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-[#555555] dark:text-[#A3A3A3] hover:text-[#101010] dark:hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            Close Overview
          </button>
        </div>
      </div>
    </Modal>
  );
};
