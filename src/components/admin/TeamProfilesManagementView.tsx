import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  DetailedProfileData,
  EducationEntry,
  ContributionEntry,
  ExperienceEntry,
} from '../../types';
import {
  Users,
  Edit3,
  Plus,
  Trash2,
  Save,
  RotateCcw,
  Globe,
  ExternalLink,
  Mail,
  Linkedin,
  Github,
  GraduationCap,
  Briefcase,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  Eye,
} from 'lucide-react';
import { TeamMemberProfileModal } from '../team/TeamMemberProfileModal';

export const TeamProfilesManagementView: React.FC = () => {
  const { teamProfiles, updateTeamProfile, resetTeamProfiles, showToast } = useApp();

  const [editingProfile, setEditingProfile] = useState<DetailedProfileData | null>(null);
  const [previewMember, setPreviewMember] = useState<DetailedProfileData | null>(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  // Form state
  const [formData, setFormData] = useState<DetailedProfileData | null>(null);

  const handleOpenEdit = (profile: DetailedProfileData) => {
    setEditingProfile(profile);
    setFormData(JSON.parse(JSON.stringify(profile)));
  };

  const handleCloseEdit = () => {
    setEditingProfile(null);
    setFormData(null);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;

    updateTeamProfile(formData);
    showToast('success', 'Profile Saved', `Updated ${formData.name}'s profile and synced to homepage.`);
    handleCloseEdit();
  };

  const handlePreview = (profile: DetailedProfileData) => {
    setPreviewMember(profile);
    setIsPreviewModalOpen(true);
  };

  // Education Helpers
  const addEducation = () => {
    if (!formData) return;
    setFormData({
      ...formData,
      education: [
        ...formData.education,
        {
          degree: '',
          institution: '',
          period: '',
          status: 'Completed',
        },
      ],
    });
  };

  const removeEducation = (index: number) => {
    if (!formData) return;
    setFormData({
      ...formData,
      education: formData.education.filter((_, i) => i !== index),
    });
  };

  // Contribution Helpers
  const addContribution = () => {
    if (!formData) return;
    setFormData({
      ...formData,
      contributions: [
        ...formData.contributions,
        {
          title: `Project Contribution ${formData.contributions.length + 1}`,
          description: '',
          subItems: [],
        },
      ],
    });
  };

  const removeContribution = (index: number) => {
    if (!formData) return;
    setFormData({
      ...formData,
      contributions: formData.contributions.filter((_, i) => i !== index),
    });
  };

  // Experience Helpers
  const addExperience = () => {
    if (!formData) return;
    const currentExp = formData.experience || [];
    setFormData({
      ...formData,
      experience: [
        ...currentExp,
        {
          role: '',
          company: '',
          duration: '',
          experienceText: '',
        },
      ],
    });
  };

  const removeExperience = (index: number) => {
    if (!formData || !formData.experience) return;
    setFormData({
      ...formData,
      experience: formData.experience.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="space-y-6">
      {/* Module Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Team Profile Management (Administrator-Only)
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Centralized administrator portal for editing verified team profiles (Devanath N, Shiva
            Shankar P, Bhuvaneswaran K). Changes sync instantly to homepage cards & detailed profile
            modals.
          </p>
        </div>

        <button
          onClick={resetTeamProfiles}
          className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0"
          title="Restore official initial team member data"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset to Defaults</span>
        </button>
      </div>

      {/* Profiles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teamProfiles.map((member) => (
          <div
            key={member.id || member.name}
            className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4 hover:border-blue-400 transition-all"
          >
            <div className="space-y-4">
              {/* Photo & Identity */}
              <div className="flex items-start gap-4">
                <div className="relative shrink-0">
                  {member.photoUrl ? (
                    <img
                      src={member.photoUrl}
                      alt={member.name}
                      className="w-16 h-16 rounded-2xl object-cover object-center border-2 border-slate-200 dark:border-slate-700 shadow-xs"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-bold text-lg flex items-center justify-center font-mono">
                      {member.initials}
                    </div>
                  )}
                  <span className="absolute -bottom-1 -right-1 p-1 rounded-full bg-emerald-500 text-white shadow-xs">
                    <ShieldCheck className="w-3 h-3" />
                  </span>
                </div>

                <div className="min-w-0">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white truncate">
                    {member.name}
                  </h3>
                  <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 line-clamp-1">
                    {member.title}
                  </p>
                  <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                    ID: {member.id || 'custom'}
                  </p>
                </div>
              </div>

              {/* Bio snippet */}
              <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed">
                {member.bio}
              </p>

              {/* Counts Badge strip */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500">
                <div className="flex items-center gap-1 font-mono">
                  <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
                  <span>{member.education.length} Degree(s)</span>
                </div>
                <div className="flex items-center gap-1 font-mono">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                  <span>{member.contributions.length} Contribution(s)</span>
                </div>
              </div>

              {/* Portfolio and Contact pill */}
              <div className="space-y-1 text-xs">
                {member.portfolio?.url && (
                  <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 truncate">
                    <Globe className="w-3.5 h-3.5 shrink-0" />
                    <span className="font-mono text-[11px] truncate">{member.portfolio.url}</span>
                  </div>
                )}
                {member.contact.email && (
                  <div className="flex items-center gap-1.5 text-slate-500 truncate">
                    <Mail className="w-3.5 h-3.5 shrink-0" />
                    <span className="font-mono text-[11px] truncate">{member.contact.email}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
              <button
                onClick={() => handlePreview(member)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Live Preview</span>
              </button>

              <button
                onClick={() => handleOpenEdit(member)}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Profile</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ========================================================= */}
      {/* FULL MODAL / DRAWER: EDIT TEAM MEMBER PROFILE             */}
      {/* ========================================================= */}
      {editingProfile && formData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-3xl my-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            {/* Header */}
            <div className="p-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 text-white flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-blue-200">
                  Administrator Profile Editor
                </span>
                <h3 className="text-xl font-bold">Edit Profile: {formData.name}</h3>
              </div>
              <button
                onClick={handleCloseEdit}
                className="px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-6 flex-1">
              {/* Basic Details */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  General Profile Identity
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Professional Title *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                      className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Profile Photograph Asset Path / URL
                    </label>
                    <input
                      type="text"
                      value={formData.photoUrl || ''}
                      onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Biography */}
              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  About / Biography *
                </label>
                <textarea
                  rows={4}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  required
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white leading-relaxed"
                />
              </div>

              {/* Portfolio Settings */}
              <div className="space-y-3 p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900">
                <h4 className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300 flex items-center gap-1.5">
                  <Globe className="w-4 h-4" />
                  <span>Personal Portfolio Settings</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Portfolio Website URL
                    </label>
                    <input
                      type="url"
                      value={formData.portfolio?.url || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          portfolio: e.target.value
                            ? {
                                url: e.target.value,
                                buttonText: formData.portfolio?.buttonText || 'Visit Portfolio',
                              }
                            : undefined,
                        })
                      }
                      placeholder="https://..."
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Button Label
                    </label>
                    <input
                      type="text"
                      value={formData.portfolio?.buttonText || 'Visit Portfolio'}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          portfolio: formData.portfolio
                            ? { ...formData.portfolio, buttonText: e.target.value }
                            : undefined,
                        })
                      }
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                    />
                  </div>
                </div>
              </div>

              {/* Contacts */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Verified Contact Details
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={formData.contact.email || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          contact: { ...formData.contact, email: e.target.value },
                        })
                      }
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                      LinkedIn URL
                    </label>
                    <input
                      type="url"
                      value={formData.contact.linkedin || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          contact: { ...formData.contact, linkedin: e.target.value },
                        })
                      }
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                      GitHub URL
                    </label>
                    <input
                      type="url"
                      value={formData.contact.github || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          contact: { ...formData.contact, github: e.target.value },
                        })
                      }
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Education list */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4 text-blue-600" />
                    <span>Education Credentials</span>
                  </h4>
                  <button
                    type="button"
                    onClick={addEducation}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Degree</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {formData.education.map((edu, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 space-y-2 relative"
                    >
                      <button
                        type="button"
                        onClick={() => removeEducation(idx)}
                        className="absolute top-3 right-3 text-rose-500 hover:text-rose-700 p-1"
                        title="Remove degree"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pr-8">
                        <div>
                          <label className="text-[11px] font-semibold text-slate-500">Degree</label>
                          <input
                            type="text"
                            value={edu.degree}
                            onChange={(e) => {
                              const updated = [...formData.education];
                              updated[idx].degree = e.target.value;
                              setFormData({ ...formData, education: updated });
                            }}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-semibold text-slate-500">Institution</label>
                          <input
                            type="text"
                            value={edu.institution}
                            onChange={(e) => {
                              const updated = [...formData.education];
                              updated[idx].institution = e.target.value;
                              setFormData({ ...formData, education: updated });
                            }}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-semibold text-slate-500">Period / Years</label>
                          <input
                            type="text"
                            value={edu.period || ''}
                            onChange={(e) => {
                              const updated = [...formData.education];
                              updated[idx].period = e.target.value;
                              setFormData({ ...formData, education: updated });
                            }}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-semibold text-slate-500">Status</label>
                          <input
                            type="text"
                            value={edu.status}
                            onChange={(e) => {
                              const updated = [...formData.education];
                              updated[idx].status = e.target.value;
                              setFormData({ ...formData, education: updated });
                            }}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Contributions list */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                    <span>Project Contributions</span>
                  </h4>
                  <button
                    type="button"
                    onClick={addContribution}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Contribution</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {formData.contributions.map((contrib, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 space-y-2 relative"
                    >
                      <button
                        type="button"
                        onClick={() => removeContribution(idx)}
                        className="absolute top-3 right-3 text-rose-500 hover:text-rose-700 p-1"
                        title="Remove contribution"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <div className="pr-8 space-y-2">
                        <div>
                          <label className="text-[11px] font-semibold text-slate-500">Title</label>
                          <input
                            type="text"
                            value={contrib.title}
                            onChange={(e) => {
                              const updated = [...formData.contributions];
                              updated[idx].title = e.target.value;
                              setFormData({ ...formData, contributions: updated });
                            }}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-xs font-bold"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-semibold text-slate-500">Description</label>
                          <textarea
                            rows={2}
                            value={contrib.description || ''}
                            onChange={(e) => {
                              const updated = [...formData.contributions];
                              updated[idx].description = e.target.value;
                              setFormData({ ...formData, contributions: updated });
                            }}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Form Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={handleCloseEdit}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-2 shadow-md shadow-blue-500/20 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Profile Updates</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Live Preview Modal */}
      <TeamMemberProfileModal
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        member={previewMember}
        allowEditing={false}
      />
    </div>
  );
};
