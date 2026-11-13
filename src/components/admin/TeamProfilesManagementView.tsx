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
            <div className="p-2 rounded-xl bg-[#F7F7F7] dark:bg-[#171717] text-[#E50914] border border-[#E0E0E0] dark:border-[#333333]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#101010] dark:text-white">
              Team Profile Management (Administrator-Only)
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-[#666666] dark:text-[#A3A3A3] mt-1">
            Centralized administrator portal for editing verified team profiles (Devanath N, Shiva
            Shankar P, Bhuvaneswaran K). Changes sync instantly to homepage cards & detailed profile
            modals.
          </p>
        </div>

        <button
          onClick={resetTeamProfiles}
          className="px-4 py-2 rounded-xl border border-[#D4D4D4] dark:border-[#333333] hover:bg-[#F0F0F0] dark:hover:bg-[#202020] text-[#333333] dark:text-[#D4D4D4] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0"
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
            className="bg-white dark:bg-[#141414] rounded-3xl p-6 border border-[#E0E0E0] dark:border-[#333333] shadow-sm flex flex-col justify-between space-y-4 hover:border-[#E50914] transition-all"
          >
            <div className="space-y-4">
              {/* Photo & Identity */}
              <div className="flex items-start gap-4">
                <div className="relative shrink-0">
                  {member.photoUrl ? (
                    <img
                      src={member.photoUrl}
                      alt={member.name}
                      className="w-16 h-16 rounded-2xl object-cover object-center border-2 border-[#E0E0E0] dark:border-[#333333] shadow-xs"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-[#FFF5F5] dark:bg-[#171717] text-[#E50914] border border-[#E50914]/30 font-bold text-lg flex items-center justify-center font-mono">
                      {member.initials}
                    </div>
                  )}
                  <span className="absolute -bottom-1 -right-1 p-1 rounded-full bg-[#FFC928] text-[#101010] shadow-xs">
                    <ShieldCheck className="w-3 h-3" />
                  </span>
                </div>

                <div className="min-w-0">
                  <h3 className="text-base font-bold text-[#101010] dark:text-white truncate">
                    {member.name}
                  </h3>
                  <p className="text-xs font-semibold text-[#FF7900] line-clamp-1">
                    {member.title}
                  </p>
                  <p className="text-[11px] text-[#888888] dark:text-[#A3A3A3] font-mono mt-0.5">
                    ID: {member.id || 'custom'}
                  </p>
                </div>
              </div>

              {/* Bio snippet */}
              <p className="text-xs text-[#555555] dark:text-[#A3A3A3] line-clamp-3 leading-relaxed">
                {member.bio}
              </p>

              {/* Counts Badge strip */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#E0E0E0] dark:border-[#333333] text-[11px] text-[#666666] dark:text-[#A3A3A3]">
                <div className="flex items-center gap-1 font-mono">
                  <GraduationCap className="w-3.5 h-3.5 text-[#E50914]" />
                  <span>{member.education.length} Degree(s)</span>
                </div>
                <div className="flex items-center gap-1 font-mono">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#FF7900]" />
                  <span>{member.contributions.length} Contribution(s)</span>
                </div>
              </div>

              {/* Portfolio and Contact pill */}
              <div className="space-y-1 text-xs">
                {member.portfolio?.url && (
                  <div className="flex items-center gap-1.5 text-[#E50914] truncate">
                    <Globe className="w-3.5 h-3.5 shrink-0" />
                    <span className="font-mono text-[11px] truncate">{member.portfolio.url}</span>
                  </div>
                )}
                {member.contact.email && (
                  <div className="flex items-center gap-1.5 text-[#666666] dark:text-[#A3A3A3] truncate">
                    <Mail className="w-3.5 h-3.5 shrink-0" />
                    <span className="font-mono text-[11px] truncate">{member.contact.email}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-3 border-t border-[#E0E0E0] dark:border-[#333333] flex items-center justify-between gap-2">
              <button
                onClick={() => handlePreview(member)}
                className="px-3 py-1.5 rounded-xl border border-[#D4D4D4] dark:border-[#333333] hover:bg-[#F0F0F0] dark:hover:bg-[#202020] text-[#333333] dark:text-[#D4D4D4] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Live Preview</span>
              </button>

              <button
                onClick={() => handleOpenEdit(member)}
                className="px-4 py-2 rounded-xl bg-[#E50914] hover:bg-[#c40812] text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-3xl my-6 bg-white dark:bg-[#141414] rounded-3xl border border-[#E0E0E0] dark:border-[#333333] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            {/* Header */}
            <div className="p-6 bg-gradient-to-r from-[#101010] via-[#E50914] to-[#FF7900] text-white flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-[#FFC928]">
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
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#666666] dark:text-[#A3A3A3]">
                  General Profile Identity
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#101010] dark:text-[#D4D4D4] mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-[#D4D4D4] dark:border-[#333333] bg-white dark:bg-[#171717] text-[#101010] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#E50914]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#101010] dark:text-[#D4D4D4] mb-1">
                      Professional Title *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                      className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-[#D4D4D4] dark:border-[#333333] bg-white dark:bg-[#171717] text-[#101010] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#E50914]"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-[#101010] dark:text-[#D4D4D4] mb-1">
                      Profile Photograph Asset Path / URL
                    </label>
                    <input
                      type="text"
                      value={formData.photoUrl || ''}
                      onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#D4D4D4] dark:border-[#333333] bg-white dark:bg-[#171717] text-[#101010] dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-[#E50914]"
                    />
                  </div>
                </div>
              </div>

              {/* Biography */}
              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#666666] dark:text-[#A3A3A3] mb-1">
                  About / Biography *
                </label>
                <textarea
                  rows={4}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  required
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-[#D4D4D4] dark:border-[#333333] bg-white dark:bg-[#171717] text-[#101010] dark:text-white leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#E50914]"
                />
              </div>

              {/* Portfolio Settings */}
              <div className="space-y-3 p-4 rounded-2xl bg-[#FFF5F5] dark:bg-[#171717] border border-[#E50914]/30">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#E50914] flex items-center gap-1.5">
                  <Globe className="w-4 h-4" />
                  <span>Personal Portfolio Settings</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-[#555555] dark:text-[#A3A3A3] mb-1">
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
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-[#D4D4D4] dark:border-[#333333] bg-white dark:bg-[#141414] text-[#101010] dark:text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#555555] dark:text-[#A3A3A3] mb-1">
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
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-[#D4D4D4] dark:border-[#333333] bg-white dark:bg-[#141414] text-[#101010] dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Contacts */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#666666] dark:text-[#A3A3A3]">
                  Verified Contact Details
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-[#555555] dark:text-[#A3A3A3] mb-1">
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
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-[#D4D4D4] dark:border-[#333333] bg-white dark:bg-[#171717] text-[#101010] dark:text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#555555] dark:text-[#A3A3A3] mb-1">
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
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-[#D4D4D4] dark:border-[#333333] bg-white dark:bg-[#171717] text-[#101010] dark:text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#555555] dark:text-[#A3A3A3] mb-1">
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
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-[#D4D4D4] dark:border-[#333333] bg-white dark:bg-[#171717] text-[#101010] dark:text-white font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Education list */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#666666] dark:text-[#A3A3A3] flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4 text-[#E50914]" />
                    <span>Education Credentials</span>
                  </h4>
                  <button
                    type="button"
                    onClick={addEducation}
                    className="text-xs font-semibold text-[#E50914] hover:text-[#c40812] flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Degree</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {formData.education.map((edu, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl border border-[#E0E0E0] dark:border-[#333333] bg-[#F7F7F7] dark:bg-[#171717] space-y-2 relative"
                    >
                      <button
                        type="button"
                        onClick={() => removeEducation(idx)}
                        className="absolute top-3 right-3 text-[#E50914] hover:text-[#c40812] p-1 cursor-pointer"
                        title="Remove degree"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pr-8">
                        <div>
                          <label className="text-[11px] font-semibold text-[#666666] dark:text-[#A3A3A3]">Degree</label>
                          <input
                            type="text"
                            value={edu.degree}
                            onChange={(e) => {
                              const updated = [...formData.education];
                              updated[idx].degree = e.target.value;
                              setFormData({ ...formData, education: updated });
                            }}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-[#D4D4D4] dark:border-[#333333] bg-white dark:bg-[#141414] text-[#101010] dark:text-white text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-semibold text-[#666666] dark:text-[#A3A3A3]">Institution</label>
                          <input
                            type="text"
                            value={edu.institution}
                            onChange={(e) => {
                              const updated = [...formData.education];
                              updated[idx].institution = e.target.value;
                              setFormData({ ...formData, education: updated });
                            }}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-[#D4D4D4] dark:border-[#333333] bg-white dark:bg-[#141414] text-[#101010] dark:text-white text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-semibold text-[#666666] dark:text-[#A3A3A3]">Period / Years</label>
                          <input
                            type="text"
                            value={edu.period || ''}
                            onChange={(e) => {
                              const updated = [...formData.education];
                              updated[idx].period = e.target.value;
                              setFormData({ ...formData, education: updated });
                            }}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-[#D4D4D4] dark:border-[#333333] bg-white dark:bg-[#141414] text-[#101010] dark:text-white text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-semibold text-[#666666] dark:text-[#A3A3A3]">Status</label>
                          <input
                            type="text"
                            value={edu.status}
                            onChange={(e) => {
                              const updated = [...formData.education];
                              updated[idx].status = e.target.value;
                              setFormData({ ...formData, education: updated });
                            }}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-[#D4D4D4] dark:border-[#333333] bg-white dark:bg-[#141414] text-[#101010] dark:text-white text-xs"
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
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#666666] dark:text-[#A3A3A3] flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-[#FF7900]" />
                    <span>Project Contributions</span>
                  </h4>
                  <button
                    type="button"
                    onClick={addContribution}
                    className="text-xs font-semibold text-[#E50914] hover:text-[#c40812] flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Contribution</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {formData.contributions.map((contrib, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl border border-[#E0E0E0] dark:border-[#333333] bg-[#F7F7F7] dark:bg-[#171717] space-y-2 relative"
                    >
                      <button
                        type="button"
                        onClick={() => removeContribution(idx)}
                        className="absolute top-3 right-3 text-[#E50914] hover:text-[#c40812] p-1 cursor-pointer"
                        title="Remove contribution"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <div className="pr-8 space-y-2">
                        <div>
                          <label className="text-[11px] font-semibold text-[#666666] dark:text-[#A3A3A3]">Title</label>
                          <input
                            type="text"
                            value={contrib.title}
                            onChange={(e) => {
                              const updated = [...formData.contributions];
                              updated[idx].title = e.target.value;
                              setFormData({ ...formData, contributions: updated });
                            }}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-[#D4D4D4] dark:border-[#333333] bg-white dark:bg-[#141414] text-[#101010] dark:text-white text-xs font-bold"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-semibold text-[#666666] dark:text-[#A3A3A3]">Description</label>
                          <textarea
                            rows={2}
                            value={contrib.description || ''}
                            onChange={(e) => {
                              const updated = [...formData.contributions];
                              updated[idx].description = e.target.value;
                              setFormData({ ...formData, contributions: updated });
                            }}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-[#D4D4D4] dark:border-[#333333] bg-white dark:bg-[#141414] text-[#101010] dark:text-white text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Form Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E0E0E0] dark:border-[#333333]">
                <button
                  type="button"
                  onClick={handleCloseEdit}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#555555] dark:text-[#A3A3A3] hover:bg-[#F0F0F0] dark:hover:bg-[#202020] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#E50914] hover:bg-[#c40812] text-white text-xs font-semibold flex items-center gap-2 shadow-md cursor-pointer"
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
