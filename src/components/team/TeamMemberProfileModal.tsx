import React, { useState, useEffect } from 'react';
import {
  X,
  GraduationCap,
  Briefcase,
  CheckCircle2,
  Mail,
  Linkedin,
  Github,
  Globe,
  ExternalLink,
  Copy,
  Check,
  ShieldCheck,
  Calendar,
  Sparkles,
  Edit3,
  Save,
  RotateCcw,
  Plus,
  Trash2,
} from 'lucide-react';

export interface EducationEntry {
  degree: string;
  institution: string;
  period?: string;
  status: string;
  percentage?: string;
}

export interface ContributionEntry {
  title: string;
  description?: string;
  subItems?: string[];
}

export interface ExperienceEntry {
  role: string;
  company: string;
  duration: string;
  experienceText: string;
}

export interface DetailedProfileData {
  id?: string;
  name: string;
  title: string;
  photoUrl?: string;
  initials: string;
  bio: string;
  education: EducationEntry[];
  experience?: ExperienceEntry[];
  contributions: ContributionEntry[];
  contact: {
    email?: string;
    linkedin?: string;
    github?: string;
  };
  portfolio?: {
    url: string;
    buttonText: string;
  };
}

interface TeamMemberProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: DetailedProfileData | null;
  onSave?: (updated: DetailedProfileData) => void;
  allowEditing?: boolean;
}

export const TeamMemberProfileModal: React.FC<TeamMemberProfileModalProps> = ({
  isOpen,
  onClose,
  member,
  onSave,
  allowEditing = false,
}) => {
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<DetailedProfileData | null>(member);
  const [saveSuccessNotice, setSaveSuccessNotice] = useState(false);

  useEffect(() => {
    if (member) {
      setFormData(JSON.parse(JSON.stringify(member)));
      setIsEditing(false);
    }
  }, [member, isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isEditing) {
          setIsEditing(false);
        } else {
          onClose();
        }
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, isEditing, onClose]);

  if (!isOpen || !member || !formData) return null;

  const handleCopyEmail = (email: string) => {
    navigator.clipboard.writeText(email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSave && formData) {
      onSave(formData);
    }
    setIsEditing(false);
    setSaveSuccessNotice(true);
    setTimeout(() => setSaveSuccessNotice(false), 3000);
  };

  const handleCancel = () => {
    setFormData(JSON.parse(JSON.stringify(member)));
    setIsEditing(false);
  };

  // Education Helpers for Edit Mode
  const addEducation = () => {
    setFormData((prev) =>
      prev
        ? {
            ...prev,
            education: [
              ...prev.education,
              {
                degree: '',
                institution: '',
                period: '',
                status: 'Completed',
              },
            ],
          }
        : null
    );
  };

  const removeEducation = (index: number) => {
    setFormData((prev) =>
      prev
        ? {
            ...prev,
            education: prev.education.filter((_, i) => i !== index),
          }
        : null
    );
  };

  const updateEducation = (index: number, field: keyof EducationEntry, value: string) => {
    setFormData((prev) => {
      if (!prev) return null;
      const updated = [...prev.education];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, education: updated };
    });
  };

  // Contributions Helpers for Edit Mode
  const addContribution = () => {
    setFormData((prev) =>
      prev
        ? {
            ...prev,
            contributions: [
              ...prev.contributions,
              {
                title: `Project Contribution ${prev.contributions.length + 1}`,
                description: '',
              },
            ],
          }
        : null
    );
  };

  const removeContribution = (index: number) => {
    setFormData((prev) =>
      prev
        ? {
            ...prev,
            contributions: prev.contributions.filter((_, i) => i !== index),
          }
        : null
    );
  };

  const updateContributionTitle = (index: number, value: string) => {
    setFormData((prev) => {
      if (!prev) return null;
      const updated = [...prev.contributions];
      updated[index] = { ...updated[index], title: value };
      return { ...prev, contributions: updated };
    });
  };

  const updateContributionDescription = (index: number, value: string) => {
    setFormData((prev) => {
      if (!prev) return null;
      const updated = [...prev.contributions];
      updated[index] = { ...updated[index], description: value };
      return { ...prev, contributions: updated };
    });
  };

  const hasExperience = Boolean(formData.experience && formData.experience.length > 0);
  const hasPortfolio = Boolean(formData.portfolio?.url);

  // Filter valid contacts
  const activeContactsCount = [
    formData.contact?.email,
    formData.contact?.linkedin,
    formData.contact?.github,
  ].filter(Boolean).length;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl my-6 bg-white dark:bg-[#171717] border border-[#E0E0E0] dark:border-[#333333] rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200 ease-out"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header Banner */}
        <div className="relative bg-gradient-to-r from-[#101010] via-[#E50914] to-[#FF7900] p-6 sm:p-8 text-white">
          <div className="absolute inset-0 bg-black/15 pointer-events-none" />

          {/* Action buttons (Top Right) */}
          <div className="absolute top-4 right-4 flex items-center gap-2 z-20">
            {allowEditing && (
              !isEditing ? (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white text-xs font-semibold backdrop-blur-xs transition-colors cursor-pointer shadow-xs"
                  title="Edit profile information"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Profile</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleCancel}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/30 hover:bg-black/40 text-white text-xs font-semibold backdrop-blur-xs transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Cancel</span>
                </button>
              )
            )}

            <button
              onClick={onClose}
              className="text-white/80 hover:text-white p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all cursor-pointer backdrop-blur-xs"
              aria-label="Close profile"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Header Identity Display */}
          <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
            {/* Profile Photograph Container with Professional Cropping */}
            <div className="relative shrink-0">
              {formData.photoUrl ? (
                <img
                  src={formData.photoUrl}
                  alt={formData.name}
                  className="w-24 h-24 sm:w-28 sm:h-28 aspect-square rounded-2xl sm:rounded-3xl object-cover object-center border-3 border-white/90 shadow-xl"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl sm:rounded-3xl bg-white/20 border-2 border-white/50 flex items-center justify-center text-white text-2xl font-bold font-mono">
                  {formData.initials}
                </div>
              )}
              <span
                className="absolute -bottom-2 -right-2 p-1.5 rounded-full bg-[#FFC928] text-[#101010] shadow-md border-2 border-white dark:border-[#171717]"
                title="Verified Team Contributor"
              >
                <ShieldCheck className="w-4 h-4" />
              </span>
            </div>

            {/* Profile Title & Main Badges */}
            <div className="space-y-2 flex-1 max-w-xl">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-black/30 text-white text-[11px] font-semibold backdrop-blur-xs border border-white/20">
                <Sparkles className="w-3 h-3 text-[#FFC928]" />
                <span>Verified Contributor Profile</span>
                {saveSuccessNotice && (
                  <span className="ml-1 text-[#FFC928] font-bold">Saved!</span>
                )}
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                {formData.name}
              </h2>
              <p className="text-sm sm:text-base font-medium text-white/90">
                {formData.title}
              </p>

              {/* Quick Action Links Bar - only displayed if details provided */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                {formData.portfolio?.url && (
                  <a
                    href={formData.portfolio.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-xs font-semibold text-white transition-colors cursor-pointer"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>Portfolio</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                {formData.contact.email && (
                  <a
                    href={`mailto:${formData.contact.email}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/15 hover:bg-white/25 text-xs font-semibold text-white transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Email</span>
                  </a>
                )}
                {formData.contact.linkedin && (
                  <a
                    href={formData.contact.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/15 hover:bg-white/25 text-xs font-semibold text-white transition-colors"
                  >
                    <Linkedin className="w-3.5 h-3.5" />
                    <span>LinkedIn</span>
                  </a>
                )}
                {formData.contact.github && (
                  <a
                    href={formData.contact.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/15 hover:bg-white/25 text-xs font-semibold text-white transition-colors"
                  >
                    <Github className="w-3.5 h-3.5" />
                    <span>GitHub</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-8 flex-1 text-[#101010] dark:text-[#E5E5E5]">
          {/* ========================================================= */}
          {/* EDIT MODE FORM                                            */}
          {/* ========================================================= */}
          {isEditing ? (
            <form onSubmit={handleSave} className="space-y-6">
              <div className="p-4 rounded-2xl bg-[#FFF5F5] dark:bg-[#101010] border border-[#E50914]/30 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-[#101010] dark:text-white flex items-center gap-2">
                    <Edit3 className="w-4 h-4 text-[#E50914]" />
                    Editing Profile: {formData.name}
                  </h4>
                  <p className="text-xs text-[#666666] dark:text-[#A3A3A3] mt-0.5">
                    Update information, photograph, education, or contributions.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-[#E50914] hover:bg-[#b80710] text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
                  </button>
                </div>
              </div>

              {/* Basic Info Fields */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#666666] dark:text-[#A3A3A3]">
                  General Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#333333] dark:text-[#D4D4D4] mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      required
                      className="w-full px-3.5 py-2 rounded-xl border border-[#E0E0E0] dark:border-[#333333] bg-white dark:bg-[#101010] text-sm focus:outline-none focus:ring-2 focus:ring-[#E50914]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#333333] dark:text-[#D4D4D4] mb-1">
                      Professional Title
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      required
                      className="w-full px-3.5 py-2 rounded-xl border border-[#E0E0E0] dark:border-[#333333] bg-white dark:bg-[#101010] text-sm focus:outline-none focus:ring-2 focus:ring-[#E50914]"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-[#333333] dark:text-[#D4D4D4] mb-1">
                      Profile Photograph URL (Replaceable & Responsive)
                    </label>
                    <input
                      type="text"
                      value={formData.photoUrl || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, photoUrl: e.target.value })
                      }
                      placeholder="Image URL or local asset path"
                      className="w-full px-3.5 py-2 rounded-xl border border-[#E0E0E0] dark:border-[#333333] bg-white dark:bg-[#101010] text-sm focus:outline-none focus:ring-2 focus:ring-[#E50914] font-mono text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Bio Field */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#666666] dark:text-[#A3A3A3]">
                  About / Biography
                </label>
                <textarea
                  rows={4}
                  value={formData.bio}
                  onChange={(e) =>
                    setFormData({ ...formData, bio: e.target.value })
                  }
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E0E0E0] dark:border-[#333333] bg-white dark:bg-[#101010] text-sm focus:outline-none focus:ring-2 focus:ring-[#E50914] leading-relaxed"
                />
              </div>

              {/* Contact Details */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#666666] dark:text-[#A3A3A3]">
                  Contact Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-[#555555] dark:text-[#A3A3A3] mb-1">
                      Email
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
                      className="w-full px-3 py-1.5 rounded-lg border border-[#E0E0E0] dark:border-[#333333] bg-white dark:bg-[#101010] text-xs focus:ring-2 focus:ring-[#E50914]"
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
                      className="w-full px-3 py-1.5 rounded-lg border border-[#E0E0E0] dark:border-[#333333] bg-white dark:bg-[#101010] text-xs focus:ring-2 focus:ring-[#E50914]"
                    />
                  </div>
                  {formData.contact.github !== undefined && (
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
                        className="w-full px-3 py-1.5 rounded-lg border border-[#E0E0E0] dark:border-[#333333] bg-white dark:bg-[#101010] text-xs focus:ring-2 focus:ring-[#E50914]"
                      />
                    </div>
                  )}
                  {formData.portfolio && (
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
                        className="w-full px-3 py-1.5 rounded-lg border border-[#E0E0E0] dark:border-[#333333] bg-white dark:bg-[#101010] text-xs focus:ring-2 focus:ring-[#E50914]"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Education List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#666666] dark:text-[#A3A3A3] flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4 text-[#E50914]" />
                    Education History
                  </h4>
                  <button
                    type="button"
                    onClick={addEducation}
                    className="inline-flex items-center gap-1 text-xs text-[#E50914] hover:text-[#b80710] font-semibold cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Degree</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {formData.education.map((edu, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl border border-[#E0E0E0] dark:border-[#333333] bg-[#F7F7F7] dark:bg-[#101010] space-y-2 relative"
                    >
                      <button
                        type="button"
                        onClick={() => removeEducation(idx)}
                        className="absolute top-3 right-3 text-[#E50914] hover:text-[#b80710] p-1 rounded-lg"
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
                            onChange={(e) => updateEducation(idx, 'degree', e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-[#E0E0E0] dark:border-[#333333] bg-white dark:bg-[#171717] text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-semibold text-[#666666] dark:text-[#A3A3A3]">Institution</label>
                          <input
                            type="text"
                            value={edu.institution}
                            onChange={(e) => updateEducation(idx, 'institution', e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-[#E0E0E0] dark:border-[#333333] bg-white dark:bg-[#171717] text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-semibold text-[#666666] dark:text-[#A3A3A3]">Year / Period</label>
                          <input
                            type="text"
                            value={edu.period || ''}
                            onChange={(e) => updateEducation(idx, 'period', e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-[#E0E0E0] dark:border-[#333333] bg-white dark:bg-[#171717] text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-semibold text-[#666666] dark:text-[#A3A3A3]">Status</label>
                          <input
                            type="text"
                            value={edu.status}
                            onChange={(e) => updateEducation(idx, 'status', e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-[#E0E0E0] dark:border-[#333333] bg-white dark:bg-[#171717] text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Contributions List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#666666] dark:text-[#A3A3A3] flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-[#E50914]" />
                    Project Contributions
                  </h4>
                  <button
                    type="button"
                    onClick={addContribution}
                    className="inline-flex items-center gap-1 text-xs text-[#E50914] hover:text-[#b80710] font-semibold cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Contribution</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {formData.contributions.map((contrib, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl border border-[#E0E0E0] dark:border-[#333333] bg-[#F7F7F7] dark:bg-[#101010] space-y-2 relative"
                    >
                      <button
                        type="button"
                        onClick={() => removeContribution(idx)}
                        className="absolute top-3 right-3 text-[#E50914] hover:text-[#b80710] p-1 rounded-lg"
                        title="Remove contribution"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <div className="space-y-2 pr-8">
                        <div>
                          <label className="text-[11px] font-semibold text-[#666666] dark:text-[#A3A3A3]">Title</label>
                          <input
                            type="text"
                            value={contrib.title}
                            onChange={(e) => updateContributionTitle(idx, e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-[#E0E0E0] dark:border-[#333333] bg-white dark:bg-[#171717] text-xs font-bold"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-semibold text-[#666666] dark:text-[#A3A3A3]">Description / Sub-bullets</label>
                          <textarea
                            rows={3}
                            value={contrib.description || (contrib.subItems ? contrib.subItems.join('\n') : '')}
                            onChange={(e) => updateContributionDescription(idx, e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-[#E0E0E0] dark:border-[#333333] bg-white dark:bg-[#171717] text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Form Bottom Save */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E0E0E0] dark:border-[#333333]">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 rounded-xl bg-[#F5F5F5] dark:bg-[#202020] hover:bg-[#EBEBEB] dark:hover:bg-[#2a2a2a] text-xs font-semibold text-[#333333] dark:text-[#D4D4D4] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#E50914] hover:bg-[#b80710] text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-[#E50914]/20 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          ) : (
            /* ========================================================= */
            /* VIEW MODE DISPLAY (ALL SEVEN SECTIONS)                    */
            /* ========================================================= */
            <>
              {/* 4. About / Biography */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#E50914] flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#E50914]" />
                  About / Biography
                </h3>
                <div className="p-4 sm:p-5 rounded-2xl bg-[#F7F7F7] dark:bg-[#101010] border border-[#E0E0E0] dark:border-[#333333] text-sm leading-relaxed text-[#444444] dark:text-[#D4D4D4]">
                  <p>{formData.bio}</p>
                </div>
              </div>

              {/* Personal Portfolio (rendered ONLY when defined and non-empty) */}
              {hasPortfolio && formData.portfolio?.url && (
                <div className="p-5 sm:p-6 rounded-2xl bg-[#FFF5F5] dark:bg-[#101010] border-2 border-[#E50914]/35 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="space-y-1 text-center sm:text-left">
                    <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#E50914] uppercase tracking-wider">
                      <Globe className="w-4 h-4" />
                      <span>Personal Portfolio</span>
                    </div>
                    <h4 className="text-base font-bold text-[#101010] dark:text-white">
                      Explore Interactive Work & Projects
                    </h4>
                    <p className="text-xs text-[#666666] dark:text-[#A3A3A3] font-mono">
                      {formData.portfolio.url}
                    </p>
                  </div>

                  <a
                    href={formData.portfolio.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#E50914] hover:bg-[#b80710] text-white text-sm font-semibold shadow-md shadow-[#E50914]/20 flex items-center justify-center gap-2 transition-all group cursor-pointer"
                  >
                    <Globe className="w-4 h-4" />
                    <span>{formData.portfolio.buttonText || 'Visit Portfolio'}</span>
                    <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </a>
                </div>
              )}

              {/* 6. Project Contributions */}
              {formData.contributions?.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-[#E50914] flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#E50914]" />
                    Project Contributions
                  </h3>
                  <div className="grid grid-cols-1 gap-3.5">
                    {formData.contributions.map((contrib, idx) => (
                      <div
                        key={idx}
                        className="p-4 sm:p-5 rounded-xl bg-white dark:bg-[#101010] border border-[#E0E0E0] dark:border-[#333333] shadow-2xs flex items-start gap-3.5"
                      >
                        <div className="w-8 h-8 rounded-lg bg-[#E50914]/10 text-[#E50914] border border-[#E50914]/25 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 font-mono">
                          {idx + 1}
                        </div>
                        <div className="space-y-1.5 flex-1">
                          <h4 className="text-sm font-bold text-[#101010] dark:text-white">
                            {contrib.title}
                          </h4>
                          {contrib.description && (
                            <p className="text-xs text-[#555555] dark:text-[#A3A3A3] leading-relaxed">
                              {contrib.description}
                            </p>
                          )}
                          {contrib.subItems && contrib.subItems.length > 0 && (
                            <ul className="mt-2 space-y-1.5 pl-0.5">
                              {contrib.subItems.map((item, sIdx) => (
                                <li
                                  key={sIdx}
                                  className="text-xs text-[#444444] dark:text-[#D4D4D4] flex items-start gap-2 leading-relaxed"
                                >
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF7900] shrink-0 mt-1.5" />
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 5. Education (and Experience if available) */}
              <div
                className={`grid grid-cols-1 ${
                  hasExperience ? 'md:grid-cols-2' : 'grid-cols-1'
                } gap-6`}
              >
                {/* Education Section */}
                <div className="space-y-3">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-[#E50914] flex items-center gap-2">
                    <GraduationCap className="w-4 h-4" />
                    Education
                  </h3>
                  <div className="space-y-3">
                    {formData.education.map((edu, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-xl bg-[#F7F7F7] dark:bg-[#101010] border border-[#E0E0E0] dark:border-[#333333] space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-bold text-[#101010] dark:text-white">
                            {edu.degree}
                          </h4>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#FFC928]/15 text-[#FF7900] dark:text-[#FFC928] font-semibold border border-[#FFC928]/40">
                            {edu.status}
                          </span>
                        </div>
                        <p className="text-xs font-medium text-[#444444] dark:text-[#D4D4D4]">
                          {edu.institution}
                        </p>
                        <div className="flex items-center justify-between text-[11px] text-[#666666] dark:text-[#A3A3A3] pt-1 border-t border-[#E0E0E0] dark:border-[#2a2a2a]">
                          <span className="flex items-center gap-1 font-mono">
                            <Calendar className="w-3 h-3" />
                            {edu.period || 'Academic Track'}
                          </span>
                          {edu.percentage && (
                            <span className="font-semibold text-[#333333] dark:text-[#D4D4D4] font-mono">
                              Score: {edu.percentage}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Work Experience (rendered ONLY when present) */}
                {hasExperience && formData.experience && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-[#E50914] flex items-center gap-2">
                      <Briefcase className="w-4 h-4" />
                      Work Experience
                    </h3>
                    <div className="space-y-3">
                      {formData.experience.map((exp, idx) => (
                        <div
                          key={idx}
                          className="p-4 rounded-xl bg-[#F7F7F7] dark:bg-[#101010] border border-[#E0E0E0] dark:border-[#333333] space-y-1.5"
                        >
                          <h4 className="text-sm font-bold text-[#101010] dark:text-white">
                            {exp.role}
                          </h4>
                          <p className="text-xs font-semibold text-[#FF7900]">
                            {exp.company}
                          </p>
                          <div className="flex items-center gap-1 text-[11px] text-[#666666] dark:text-[#A3A3A3] font-mono">
                            <Calendar className="w-3 h-3" />
                            <span>{exp.duration}</span>
                          </div>
                          {exp.experienceText && (
                            <p className="text-xs text-[#555555] dark:text-[#A3A3A3] pt-1 border-t border-[#E0E0E0] dark:border-[#2a2a2a]">
                              {exp.experienceText}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* 7. Contact Details Section (Rendered only when actual details provided) */}
              {activeContactsCount > 0 && (
                <div className="space-y-3 pt-2">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-[#E50914] flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#E50914]" />
                    Contact Details
                  </h3>
                  <div
                    className={`grid grid-cols-1 ${
                      activeContactsCount === 2
                        ? 'sm:grid-cols-2'
                        : activeContactsCount === 1
                        ? 'sm:grid-cols-1'
                        : 'sm:grid-cols-3'
                    } gap-3`}
                  >
                    {/* Email */}
                    {formData.contact.email && (
                      <div className="p-3.5 rounded-xl bg-[#F7F7F7] dark:bg-[#101010] border border-[#E0E0E0] dark:border-[#333333] flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between text-xs font-semibold text-[#666666] dark:text-[#A3A3A3] mb-1">
                            <span className="flex items-center gap-1.5">
                              <Mail className="w-3.5 h-3.5 text-[#E50914]" />
                              Email
                            </span>
                            <button
                              onClick={() => handleCopyEmail(formData.contact.email!)}
                              className="text-[#888888] hover:text-[#101010] dark:hover:text-white cursor-pointer"
                              title="Copy email"
                            >
                              {copiedEmail ? (
                                <Check className="w-3.5 h-3.5 text-[#FFC928]" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                          <a
                            href={`mailto:${formData.contact.email}`}
                            className="text-xs font-semibold text-[#E50914] hover:underline break-all"
                          >
                            {formData.contact.email}
                          </a>
                        </div>
                      </div>
                    )}

                    {/* LinkedIn */}
                    {formData.contact.linkedin && (
                      <div className="p-3.5 rounded-xl bg-[#F7F7F7] dark:bg-[#101010] border border-[#E0E0E0] dark:border-[#333333] flex flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#666666] dark:text-[#A3A3A3] mb-1">
                            <Linkedin className="w-3.5 h-3.5 text-[#FF7900]" />
                            LinkedIn
                          </div>
                          <a
                            href={formData.contact.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-semibold text-[#E50914] hover:underline flex items-center gap-1 break-all"
                          >
                            <span>Profile Link</span>
                            <ExternalLink className="w-3 h-3 shrink-0" />
                          </a>
                        </div>
                      </div>
                    )}

                    {/* GitHub (Only if provided) */}
                    {formData.contact.github && (
                      <div className="p-3.5 rounded-xl bg-[#F7F7F7] dark:bg-[#101010] border border-[#E0E0E0] dark:border-[#333333] flex flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#666666] dark:text-[#A3A3A3] mb-1">
                            <Github className="w-3.5 h-3.5 text-[#333333] dark:text-[#D4D4D4]" />
                            GitHub
                          </div>
                          <a
                            href={formData.contact.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-semibold text-[#E50914] hover:underline flex items-center gap-1 break-all"
                          >
                            <span>Profile Link</span>
                            <ExternalLink className="w-3 h-3 shrink-0" />
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-[#F7F7F7] dark:bg-[#141414] border-t border-[#E0E0E0] dark:border-[#333333] flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-[#666666] dark:text-[#A3A3A3]">
            <span>Client Management System · Final Year Project Team</span>
            {isEditing && (
              <span className="px-2 py-0.5 rounded bg-[#E50914]/10 text-[#E50914] border border-[#E50914]/30 font-semibold text-[10px]">
                Editing Active
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {!isEditing ? (
              <>
                {allowEditing && (
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="px-3.5 py-2 rounded-xl bg-[#E50914]/10 hover:bg-[#E50914]/20 text-[#E50914] text-xs font-semibold flex items-center gap-1.5 border border-[#E50914]/30 transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Profile</span>
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-[#EBEBEB] dark:bg-[#202020] hover:bg-[#D4D4D4] dark:hover:bg-[#333333] text-xs font-semibold text-[#333333] dark:text-[#D4D4D4] transition-colors cursor-pointer"
                >
                  Close
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 rounded-xl bg-[#EBEBEB] dark:bg-[#202020] hover:bg-[#D4D4D4] dark:hover:bg-[#333333] text-xs font-semibold text-[#333333] dark:text-[#D4D4D4] transition-colors cursor-pointer"
              >
                Exit Edit Mode
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
