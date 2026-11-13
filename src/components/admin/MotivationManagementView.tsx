import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  MotivationEntry,
  WeeklyTheme,
  MotivationCampaign,
  UserRole,
  MotivationCategoryItem,
} from '../../types';
import {
  Sparkles,
  Search,
  Filter,
  Plus,
  Edit2,
  Trash2,
  Eye,
  Download,
  Upload,
  Calendar,
  Layers,
  Megaphone,
  CheckCircle,
  XCircle,
  BarChart3,
  Languages,
  Shield,
  Tag,
  Clock,
  Play,
  Pause,
  FileText,
  AlertCircle,
  Copy,
  ExternalLink,
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { validateBulkImport } from '../../services/motivationService';

export const MotivationManagementView: React.FC = () => {
  const {
    currentUser,
    hasRole,
    motivationQuotes,
    weeklyThemes,
    motivationCampaigns,
    motivationCategories,
    addMotivationQuote,
    updateMotivationQuote,
    deleteMotivationQuote,
    addWeeklyTheme,
    updateWeeklyTheme,
    deleteWeeklyTheme,
    addMotivationCampaign,
    updateMotivationCampaign,
    deleteMotivationCampaign,
    addMotivationCategory,
    importMotivationQuotes,
    users,
    showToast,
  } = useApp();

  // Admin authorization guard
  const isAdmin = currentUser?.role === 'admin' || hasRole(['admin']);

  // Tabs: 'library' | 'themes' | 'campaigns' | 'analytics'
  const [activeTab, setActiveTab] = useState<'library' | 'themes' | 'campaigns' | 'analytics'>('library');

  // ------------------------------------------------------------------
  // 1. CONTENT LIBRARY STATE
  // ------------------------------------------------------------------
  const [libSearch, setLibSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [catFilter, setCatFilter] = useState<string>('all');
  const [langFilter, setLangFilter] = useState<string>('all');
  const [publishFilter, setPublishFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 8;

  // Add / Edit Quote Modal State
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [editingQuote, setEditingQuote] = useState<MotivationEntry | null>(null);
  const [quoteForm, setQuoteForm] = useState<{
    quote: string;
    quoteTamil: string;
    author: string;
    authorTamil: string;
    isVerifiedAuthor: boolean;
    isOriginal: boolean;
    applicableRoles: UserRole[];
    category: string;
    weeklyThemeId: string;
    published: boolean;
    publishDate: string;
  }>({
    quote: '',
    quoteTamil: '',
    author: '',
    authorTamil: '',
    isVerifiedAuthor: true,
    isOriginal: false,
    applicableRoles: ['admin', 'manager', 'team_lead', 'team_member'],
    category: 'Leadership',
    weeklyThemeId: 'theme-1',
    published: true,
    publishDate: '',
  });

  // Card Preview Modal State
  const [previewEntry, setPreviewEntry] = useState<MotivationEntry | null>(null);
  const [previewLang, setPreviewLang] = useState<'en' | 'ta'>('en');

  // Bulk Import State
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importJsonText, setImportJsonText] = useState('');
  const [importError, setImportError] = useState<string | null>(null);

  // Custom Category Add State
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatNameTamil, setNewCatNameTamil] = useState('');
  const [newCatRoles, setNewCatRoles] = useState<UserRole[]>([
    'admin',
    'manager',
    'team_lead',
    'team_member',
  ]);

  // ------------------------------------------------------------------
  // 2. THEMES STATE
  // ------------------------------------------------------------------
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [editingTheme, setEditingTheme] = useState<WeeklyTheme | null>(null);
  const [themeForm, setThemeForm] = useState({
    weekNumber: 1,
    title: '',
    titleTamil: '',
    description: '',
    descriptionTamil: '',
    isActive: false,
    startDate: '',
    endDate: '',
  });

  // ------------------------------------------------------------------
  // 3. CAMPAIGNS STATE
  // ------------------------------------------------------------------
  const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<MotivationCampaign | null>(null);
  const [campForm, setCampForm] = useState<{
    name: string;
    description: string;
    targetRoles: UserRole[];
    language: 'en' | 'ta' | 'all';
    weeklyThemeId: string;
    quoteIds: string[];
    scheduleType: 'once' | 'daily' | 'weekly' | 'monthly';
    startDate: string;
    endDate: string;
    status: MotivationCampaign['status'];
  }>({
    name: '',
    description: '',
    targetRoles: ['admin', 'manager', 'team_lead', 'team_member'],
    language: 'all',
    weeklyThemeId: 'theme-1',
    quoteIds: [],
    scheduleType: 'weekly',
    startDate: new Date().toISOString().substring(0, 10),
    endDate: '',
    status: 'active',
  });

  // ------------------------------------------------------------------
  // FILTERED QUOTES FOR LIBRARY
  // ------------------------------------------------------------------
  const filteredQuotes = useMemo(() => {
    return motivationQuotes.filter((q) => {
      const query = libSearch.toLowerCase();
      const matchesSearch =
        q.quote.toLowerCase().includes(query) ||
        (q.quoteTamil ? q.quoteTamil.toLowerCase().includes(query) : false) ||
        (q.author ? q.author.toLowerCase().includes(query) : false) ||
        q.category.toLowerCase().includes(query);

      const matchesRole =
        roleFilter === 'all' || q.applicableRoles.includes(roleFilter as UserRole);

      const matchesCat = catFilter === 'all' || q.category === catFilter;

      const matchesLang =
        langFilter === 'all' || q.language === langFilter || q.language === 'both';

      const matchesPublish =
        publishFilter === 'all' ||
        (publishFilter === 'published' ? q.published : !q.published);

      return matchesSearch && matchesRole && matchesCat && matchesLang && matchesPublish;
    });
  }, [motivationQuotes, libSearch, roleFilter, catFilter, langFilter, publishFilter]);

  const totalPages = Math.ceil(filteredQuotes.length / itemsPerPage) || 1;
  const paginatedQuotes = filteredQuotes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // ------------------------------------------------------------------
  // HANDLERS: QUOTE ADD/EDIT
  // ------------------------------------------------------------------
  const handleOpenAddQuote = () => {
    setEditingQuote(null);
    setQuoteForm({
      quote: '',
      quoteTamil: '',
      author: '',
      authorTamil: '',
      isVerifiedAuthor: true,
      isOriginal: false,
      applicableRoles: ['admin', 'manager', 'team_lead', 'team_member'],
      category: motivationCategories[0]?.name || 'Leadership',
      weeklyThemeId: weeklyThemes[0]?.id || 'theme-1',
      published: true,
      publishDate: '',
    });
    setIsQuoteModalOpen(true);
  };

  const handleOpenEditQuote = (quote: MotivationEntry) => {
    setEditingQuote(quote);
    setQuoteForm({
      quote: quote.quote,
      quoteTamil: quote.quoteTamil || '',
      author: quote.author || '',
      authorTamil: quote.authorTamil || '',
      isVerifiedAuthor: quote.isVerifiedAuthor,
      isOriginal: quote.isOriginal,
      applicableRoles: quote.applicableRoles,
      category: quote.category,
      weeklyThemeId: quote.weeklyThemeId || 'theme-1',
      published: quote.published,
      publishDate: quote.publishDate || '',
    });
    setIsQuoteModalOpen(true);
  };

  const handleSaveQuote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quoteForm.quote.trim()) {
      showToast('error', 'Quote Required', 'Please enter the English quote or reflection.');
      return;
    }
    if (quoteForm.applicableRoles.length === 0) {
      showToast('error', 'Role Required', 'Please select at least one applicable system role.');
      return;
    }

    const payload = {
      quote: quoteForm.quote.trim(),
      quoteTamil: quoteForm.quoteTamil.trim() || undefined,
      author: quoteForm.author.trim() || undefined,
      authorTamil: quoteForm.authorTamil.trim() || undefined,
      isVerifiedAuthor: quoteForm.isVerifiedAuthor,
      isOriginal: quoteForm.isOriginal,
      applicableRoles: quoteForm.applicableRoles,
      category: quoteForm.category,
      weeklyThemeId: quoteForm.weeklyThemeId || undefined,
      language: (quoteForm.quoteTamil.trim() ? 'both' : 'en') as 'both' | 'en',
      published: quoteForm.published,
      publishDate: quoteForm.publishDate || undefined,
    };

    if (editingQuote) {
      updateMotivationQuote(editingQuote.id, payload);
    } else {
      addMotivationQuote(payload);
    }
    setIsQuoteModalOpen(false);
  };

  // ------------------------------------------------------------------
  // HANDLERS: EXPORT & IMPORT
  // ------------------------------------------------------------------
  const handleExportQuotes = () => {
    const dataStr = JSON.stringify(motivationQuotes, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cms_motivation_library_${new Date().toISOString().substring(0, 10)}.json`;
    a.click();
    showToast('success', 'Library Exported', `Exported ${motivationQuotes.length} motivation entries.`);
  };

  const handleImportQuotes = () => {
    setImportError(null);
    try {
      const parsed = JSON.parse(importJsonText);
      const validation = validateBulkImport(parsed);
      if (!validation.valid) {
        setImportError(validation.error || 'Invalid JSON format.');
        return;
      }
      importMotivationQuotes(validation.entries);
      setIsImportModalOpen(false);
      setImportJsonText('');
    } catch (err: any) {
      setImportError('Failed to parse JSON. Please verify syntax.');
    }
  };

  // ------------------------------------------------------------------
  // HANDLERS: CATEGORY ADD
  // ------------------------------------------------------------------
  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    addMotivationCategory({
      name: newCatName.trim(),
      nameTamil: newCatNameTamil.trim() || undefined,
      applicableRoles: newCatRoles,
    });
    setNewCatName('');
    setNewCatNameTamil('');
    setIsCatModalOpen(false);
  };

  // ------------------------------------------------------------------
  // HANDLERS: THEMES
  // ------------------------------------------------------------------
  const handleOpenAddTheme = () => {
    setEditingTheme(null);
    setThemeForm({
      weekNumber: weeklyThemes.length + 1,
      title: '',
      titleTamil: '',
      description: '',
      descriptionTamil: '',
      isActive: false,
      startDate: '',
      endDate: '',
    });
    setIsThemeModalOpen(true);
  };

  const handleSaveTheme = (e: React.FormEvent) => {
    e.preventDefault();
    if (!themeForm.title.trim()) return;

    if (editingTheme) {
      updateWeeklyTheme(editingTheme.id, themeForm);
    } else {
      addWeeklyTheme(themeForm);
    }
    setIsThemeModalOpen(false);
  };

  // ------------------------------------------------------------------
  // HANDLERS: CAMPAIGNS
  // ------------------------------------------------------------------
  const handleOpenAddCampaign = () => {
    setEditingCampaign(null);
    setCampForm({
      name: '',
      description: '',
      targetRoles: ['admin', 'manager', 'team_lead', 'team_member'],
      language: 'all',
      weeklyThemeId: weeklyThemes[0]?.id || 'theme-1',
      quoteIds: motivationQuotes.slice(0, 3).map((q) => q.id),
      scheduleType: 'weekly',
      startDate: new Date().toISOString().substring(0, 10),
      endDate: '',
      status: 'active',
    });
    setIsCampaignModalOpen(true);
  };

  const handleSaveCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!campForm.name.trim()) return;

    if (editingCampaign) {
      updateMotivationCampaign(editingCampaign.id, campForm);
    } else {
      addMotivationCampaign(campForm);
    }
    setIsCampaignModalOpen(false);
  };

  if (!isAdmin) {
    return (
      <div className="p-8 text-center bg-white dark:bg-[#141414] rounded-3xl border border-[#E0E0E0] dark:border-[#333333] shadow-sm space-y-3">
        <Shield className="w-12 h-12 text-[#E50914] mx-auto" />
        <h3 className="text-base font-bold text-[#101010] dark:text-white">
          Administrator Access Restricted
        </h3>
        <p className="text-xs text-[#666666] dark:text-[#A3A3A3] max-w-sm mx-auto">
          Motivation library authoring, weekly theme scheduling, and enterprise campaigns are reserved for authorized system administrators.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight text-[#101010] dark:text-white">
              Dynamic Daily Motivation Control Center
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-[#171717] text-[#FFC928] border border-[#FFC928]/40 text-[11px] font-bold">
              Admin Suite
            </span>
          </div>
          <p className="text-xs text-[#666666] dark:text-[#A3A3A3] mt-0.5">
            Manage multi-language motivational libraries, weekly themes, scheduled campaigns, and engagement analytics.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleExportQuotes}
            className="px-3 py-1.5 rounded-xl border border-[#D4D4D4] dark:border-[#333333] bg-white dark:bg-[#171717] text-[#333333] dark:text-[#D4D4D4] text-xs font-semibold hover:bg-[#F7F7F7] dark:hover:bg-[#202020] transition-colors inline-flex items-center gap-1.5 cursor-pointer"
            title="Export entire library as JSON"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Library</span>
          </button>

          <button
            type="button"
            onClick={() => setIsImportModalOpen(true)}
            className="px-3 py-1.5 rounded-xl border border-[#D4D4D4] dark:border-[#333333] bg-white dark:bg-[#171717] text-[#333333] dark:text-[#D4D4D4] text-xs font-semibold hover:bg-[#F7F7F7] dark:hover:bg-[#202020] transition-colors inline-flex items-center gap-1.5 cursor-pointer"
            title="Bulk import JSON quotes"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Bulk Import</span>
          </button>

          <button
            type="button"
            onClick={handleOpenAddQuote}
            className="px-4 py-2 rounded-xl bg-[#E50914] hover:bg-[#c40812] text-white text-xs font-semibold shadow-xs transition-colors inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Motivation Entry</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#E0E0E0] dark:border-[#333333] pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('library')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-2 ${
            activeTab === 'library'
              ? 'bg-[#E50914] text-white shadow-xs'
              : 'text-[#555555] dark:text-[#A3A3A3] hover:bg-[#F0F0F0] dark:hover:bg-[#202020]'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Content Library ({motivationQuotes.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('themes')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-2 ${
            activeTab === 'themes'
              ? 'bg-[#E50914] text-white shadow-xs'
              : 'text-[#555555] dark:text-[#A3A3A3] hover:bg-[#F0F0F0] dark:hover:bg-[#202020]'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Weekly Themes ({weeklyThemes.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('campaigns')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-2 ${
            activeTab === 'campaigns'
              ? 'bg-[#E50914] text-white shadow-xs'
              : 'text-[#555555] dark:text-[#A3A3A3] hover:bg-[#F0F0F0] dark:hover:bg-[#202020]'
          }`}
        >
          <Megaphone className="w-4 h-4" />
          <span>Scheduled Campaigns ({motivationCampaigns.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-2 ${
            activeTab === 'analytics'
              ? 'bg-[#E50914] text-white shadow-xs'
              : 'text-[#555555] dark:text-[#A3A3A3] hover:bg-[#F0F0F0] dark:hover:bg-[#202020]'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Delivery & Engagement Analytics</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: CONTENT LIBRARY                                    */}
      {/* ========================================================= */}
      {activeTab === 'library' && (
        <div className="space-y-4">
          {/* Search & Multi-Filters */}
          <div className="p-4 bg-white dark:bg-[#141414] rounded-2xl border border-[#E0E0E0] dark:border-[#333333] shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#888888]" />
                <input
                  type="text"
                  value={libSearch}
                  onChange={(e) => {
                    setLibSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search quote text, author name, or category..."
                  className="w-full pl-9 pr-3.5 py-2 text-xs bg-[#F7F7F7] dark:bg-[#171717] border border-[#E0E0E0] dark:border-[#333333] rounded-xl text-[#101010] dark:text-white placeholder-[#888888] focus:outline-none focus:ring-2 focus:ring-[#E50914]"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Role filter */}
                <select
                  value={roleFilter}
                  onChange={(e) => {
                    setRoleFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="px-3 py-2 text-xs bg-[#F7F7F7] dark:bg-[#171717] border border-[#E0E0E0] dark:border-[#333333] rounded-xl text-[#101010] dark:text-[#D4D4D4] focus:outline-none cursor-pointer"
                >
                  <option value="all">All Roles</option>
                  <option value="admin">Administrator</option>
                  <option value="manager">Manager</option>
                  <option value="team_lead">Team Lead</option>
                  <option value="team_member">Team Member</option>
                </select>

                {/* Category filter */}
                <select
                  value={catFilter}
                  onChange={(e) => {
                    setCatFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="px-3 py-2 text-xs bg-[#F7F7F7] dark:bg-[#171717] border border-[#E0E0E0] dark:border-[#333333] rounded-xl text-[#101010] dark:text-[#D4D4D4] focus:outline-none cursor-pointer max-w-[150px] truncate"
                >
                  <option value="all">All Categories</option>
                  {motivationCategories.map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>

                {/* Language filter */}
                <select
                  value={langFilter}
                  onChange={(e) => {
                    setLangFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="px-3 py-2 text-xs bg-[#F7F7F7] dark:bg-[#171717] border border-[#E0E0E0] dark:border-[#333333] rounded-xl text-[#101010] dark:text-[#D4D4D4] focus:outline-none cursor-pointer"
                >
                  <option value="all">All Languages</option>
                  <option value="en">English</option>
                  <option value="ta">Tamil (தமிழ்)</option>
                  <option value="both">Bilingual</option>
                </select>

                {/* Publish filter */}
                <select
                  value={publishFilter}
                  onChange={(e) => {
                    setPublishFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="px-3 py-2 text-xs bg-[#F7F7F7] dark:bg-[#171717] border border-[#E0E0E0] dark:border-[#333333] rounded-xl text-[#101010] dark:text-[#D4D4D4] focus:outline-none cursor-pointer"
                >
                  <option value="all">All Status</option>
                  <option value="published">Published</option>
                  <option value="unpublished">Unpublished</option>
                </select>

                <button
                  type="button"
                  onClick={() => setIsCatModalOpen(true)}
                  className="px-3 py-2 text-xs font-semibold rounded-xl border border-dashed border-[#FF7900] text-[#FF7900] hover:bg-[#FF7900]/10 transition-colors inline-flex items-center gap-1 cursor-pointer"
                  title="Add custom motivation category"
                >
                  <Tag className="w-3.5 h-3.5" />
                  <span>+ Category</span>
                </button>
              </div>
            </div>
          </div>

          {/* Quotes Table */}
          <div className="bg-white dark:bg-[#141414] rounded-2xl border border-[#E0E0E0] dark:border-[#333333] shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F7F7F7] dark:bg-[#171717] border-b border-[#E0E0E0] dark:border-[#333333] text-[#666666] dark:text-[#A3A3A3] font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Motivation Content</th>
                    <th className="py-3 px-4">Author Attribution</th>
                    <th className="py-3 px-4">Category & Roles</th>
                    <th className="py-3 px-4">Language</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E0E0E0] dark:divide-[#333333]">
                  {paginatedQuotes.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-10 text-center text-[#888888] dark:text-[#A3A3A3]">
                        No motivation entries found matching current filters.
                      </td>
                    </tr>
                  ) : (
                    paginatedQuotes.map((q) => (
                      <tr key={q.id} className="hover:bg-[#F7F7F7] dark:hover:bg-[#171717] transition-colors">
                        <td className="py-3.5 px-4 max-w-sm">
                          <p className="font-serif italic text-[#101010] dark:text-white line-clamp-2">
                            "{q.quote}"
                          </p>
                          {q.quoteTamil && (
                            <p className="text-[11px] text-[#666666] dark:text-[#A3A3A3] mt-1 line-clamp-1">
                              தமிழ்: {q.quoteTamil}
                            </p>
                          )}
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <p className="font-semibold text-[#101010] dark:text-white">
                            {q.author || (q.isOriginal ? 'Original Reflection' : 'Verified Author')}
                          </p>
                          {q.isVerifiedAuthor ? (
                            <span className="text-[10px] text-[#FFC928] font-medium">
                              ✓ Verified Attribution
                            </span>
                          ) : (
                            <span className="text-[10px] text-[#888888] dark:text-[#A3A3A3]">Original Thought</span>
                          )}
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#FFF5F5] dark:bg-[#171717] text-[#E50914] border border-[#E50914]/30 mb-1">
                            {q.category}
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {q.applicableRoles.map((r) => (
                              <span
                                key={r}
                                className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded-sm bg-[#F0F0F0] dark:bg-[#171717] text-[#555555] dark:text-[#A3A3A3]"
                              >
                                {r.replace('_', ' ')}
                              </span>
                            ))}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap font-mono text-[11px]">
                          {q.quoteTamil ? (
                            <span className="px-2 py-0.5 rounded-md bg-[#FF7900]/15 text-[#FF7900] font-medium">
                              EN + தமிழ்
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-md bg-[#F0F0F0] dark:bg-[#171717] text-[#555555] dark:text-[#A3A3A3]">
                              English
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() =>
                              updateMotivationQuote(q.id, { published: !q.published })
                            }
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer transition-colors ${
                              q.published
                                ? 'bg-[#FFC928]/15 text-[#101010] dark:text-[#FFC928] border border-[#FFC928]/40'
                                : 'bg-[#F0F0F0] text-[#555555] dark:bg-[#171717] dark:text-[#A3A3A3] border border-[#D4D4D4] dark:border-[#333333]'
                            }`}
                          >
                            {q.published ? 'Published' : 'Draft'}
                          </button>
                        </td>

                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                setPreviewEntry(q);
                                setPreviewLang(q.quoteTamil ? 'ta' : 'en');
                              }}
                              className="p-1.5 rounded-lg text-[#888888] hover:text-[#FF7900] hover:bg-[#F0F0F0] dark:hover:bg-[#202020] transition-colors cursor-pointer"
                              title="Preview dashboard card"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenEditQuote(q)}
                              className="p-1.5 rounded-lg text-[#888888] hover:text-[#101010] dark:hover:text-white hover:bg-[#F0F0F0] dark:hover:bg-[#202020] transition-colors cursor-pointer"
                              title="Edit entry"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (window.confirm(`Delete motivation entry "${q.quote.substring(0, 30)}..."?`)) {
                                  deleteMotivationQuote(q.id);
                                }
                              }}
                              className="p-1.5 rounded-lg text-[#888888] hover:text-[#E50914] hover:bg-[#FFF5F5] dark:hover:bg-[#202020] transition-colors cursor-pointer"
                              title="Delete entry"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Bar */}
            <div className="p-4 border-t border-[#E0E0E0] dark:border-[#333333] flex items-center justify-between text-xs text-[#666666] dark:text-[#A3A3A3]">
              <span>
                Showing {paginatedQuotes.length} of {filteredQuotes.length} entries
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1.5 rounded-lg border border-[#D4D4D4] dark:border-[#333333] disabled:opacity-40 hover:bg-[#F7F7F7] dark:hover:bg-[#202020] cursor-pointer"
                >
                  Previous
                </button>
                <span className="px-3 font-mono font-bold text-[#101010] dark:text-white">
                  {currentPage} / {totalPages}
                </span>
                <button
                  type="button"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="px-3 py-1.5 rounded-lg border border-[#D4D4D4] dark:border-[#333333] disabled:opacity-40 hover:bg-[#F7F7F7] dark:hover:bg-[#202020] cursor-pointer"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: WEEKLY THEMES                                      */}
      {/* ========================================================= */}
      {activeTab === 'themes' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-[#666666] dark:text-[#A3A3A3]">
              Enterprise weekly themes structure the organization's collective motivation calendar week by week.
            </p>
            <button
              type="button"
              onClick={handleOpenAddTheme}
              className="px-3.5 py-2 rounded-xl bg-[#E50914] hover:bg-[#c40812] text-white text-xs font-semibold shadow-xs transition-colors inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Weekly Theme</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {weeklyThemes.map((th) => (
              <div
                key={th.id}
                className={`p-5 rounded-2xl border transition-all ${
                  th.isActive
                    ? 'bg-[#FFF5F5] dark:bg-[#171717] border-[#E50914] shadow-sm'
                    : 'bg-white dark:bg-[#141414] border-[#E0E0E0] dark:border-[#333333]'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#F0F0F0] dark:bg-[#171717] text-[#333333] dark:text-[#D4D4D4]">
                    Week {th.weekNumber}
                  </span>

                  <div className="flex items-center gap-1">
                    {th.isActive ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FFC928] text-[#101010]">
                        Active Now
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => updateWeeklyTheme(th.id, { isActive: true })}
                        className="text-[11px] font-semibold text-[#E50914] hover:underline cursor-pointer"
                      >
                        Set Active
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setEditingTheme(th);
                        setThemeForm({
                          weekNumber: th.weekNumber,
                          title: th.title,
                          titleTamil: th.titleTamil || '',
                          description: th.description,
                          descriptionTamil: th.descriptionTamil || '',
                          isActive: th.isActive,
                          startDate: th.startDate || '',
                          endDate: th.endDate || '',
                        });
                        setIsThemeModalOpen(true);
                      }}
                      className="p-1 text-[#888888] hover:text-[#101010] dark:hover:text-white cursor-pointer ml-1"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(`Delete theme "${th.title}"?`)) {
                          deleteWeeklyTheme(th.id);
                        }
                      }}
                      className="p-1 text-[#888888] hover:text-[#E50914] cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h4 className="text-sm font-bold text-[#101010] dark:text-white mt-3">
                  {th.title}
                </h4>
                {th.titleTamil && (
                  <p className="text-xs text-[#FF7900] font-medium mt-0.5">
                    {th.titleTamil}
                  </p>
                )}

                <p className="text-xs text-[#666666] dark:text-[#A3A3A3] mt-2 leading-relaxed">
                  {th.description}
                </p>

                {th.startDate && (
                  <div className="mt-3 pt-3 border-t border-[#E0E0E0] dark:border-[#333333] text-[11px] font-mono text-[#888888] dark:text-[#A3A3A3] flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>
                      {th.startDate} {th.endDate ? `to ${th.endDate}` : ''}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: SCHEDULED CAMPAIGNS                                */}
      {/* ========================================================= */}
      {activeTab === 'campaigns' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-[#666666] dark:text-[#A3A3A3]">
              Targeted motivation campaigns delivered to specific roles, teams, or scheduled dates.
            </p>
            <button
              type="button"
              onClick={handleOpenAddCampaign}
              className="px-3.5 py-2 rounded-xl bg-[#E50914] hover:bg-[#c40812] text-white text-xs font-semibold shadow-xs transition-colors inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Schedule Campaign</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {motivationCampaigns.map((camp) => (
              <div
                key={camp.id}
                className="p-5 rounded-2xl bg-white dark:bg-[#141414] border border-[#E0E0E0] dark:border-[#333333] shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider mb-1.5 ${
                        camp.status === 'active'
                          ? 'bg-[#FFC928]/15 text-[#101010] dark:text-[#FFC928] border border-[#FFC928]/40'
                          : camp.status === 'paused'
                          ? 'bg-[#FF7900]/15 text-[#FF7900] border border-[#FF7900]/40'
                          : 'bg-[#F0F0F0] text-[#555555] dark:bg-[#171717] dark:text-[#D4D4D4]'
                      }`}
                    >
                      {camp.status}
                    </span>
                    <h4 className="text-sm font-bold text-[#101010] dark:text-white">
                      {camp.name}
                    </h4>
                  </div>

                  <div className="flex items-center gap-1">
                    {camp.status === 'active' ? (
                      <button
                        type="button"
                        onClick={() => updateMotivationCampaign(camp.id, { status: 'paused' })}
                        className="p-1.5 rounded-lg text-[#888888] hover:text-[#FF7900] hover:bg-[#F0F0F0] dark:hover:bg-[#202020] cursor-pointer"
                        title="Pause campaign"
                      >
                        <Pause className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => updateMotivationCampaign(camp.id, { status: 'active' })}
                        className="p-1.5 rounded-lg text-[#888888] hover:text-[#FFC928] hover:bg-[#F0F0F0] dark:hover:bg-[#202020] cursor-pointer"
                        title="Activate campaign"
                      >
                        <Play className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(`Delete campaign "${camp.name}"?`)) {
                          deleteMotivationCampaign(camp.id);
                        }
                      }}
                      className="p-1.5 rounded-lg text-[#888888] hover:text-[#E50914] cursor-pointer"
                      title="Delete campaign"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-[#666666] dark:text-[#A3A3A3] leading-relaxed">
                  {camp.description}
                </p>

                {/* Target roles pills */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[11px] text-[#888888] dark:text-[#A3A3A3] mr-1 font-medium">Target Roles:</span>
                  {camp.targetRoles.map((r) => (
                    <span
                      key={r}
                      className="px-2 py-0.5 rounded-md text-[10px] font-mono uppercase bg-[#F0F0F0] dark:bg-[#171717] text-[#333333] dark:text-[#D4D4D4]"
                    >
                      {r.replace('_', ' ')}
                    </span>
                  ))}
                </div>

                {/* Stats */}
                <div className="pt-3 border-t border-[#E0E0E0] dark:border-[#333333] flex items-center justify-between text-xs font-mono">
                  <div className="text-[#666666] dark:text-[#A3A3A3]">
                    <span>Reach: </span>
                    <span className="font-bold text-[#101010] dark:text-white">{camp.reachCount}</span>
                  </div>
                  <div className="text-[#666666] dark:text-[#A3A3A3]">
                    <span>Views: </span>
                    <span className="font-bold text-[#101010] dark:text-white">{camp.viewCount}</span>
                  </div>
                  <div className="text-[#666666] dark:text-[#A3A3A3]">
                    <span>Saved Favorites: </span>
                    <span className="font-bold text-[#101010] dark:text-white">{camp.favoriteCount}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 4: DELIVERY & ENGAGEMENT ANALYTICS                    */}
      {/* ========================================================= */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 bg-white dark:bg-[#141414] rounded-2xl border border-[#E0E0E0] dark:border-[#333333] shadow-xs">
              <span className="text-xs font-semibold text-[#666666] dark:text-[#A3A3A3]">Total Quotes Library</span>
              <p className="text-2xl font-bold text-[#101010] dark:text-white font-mono mt-1">
                {motivationQuotes.length}
              </p>
              <span className="text-[11px] text-[#FFC928]">
                {motivationQuotes.filter((q) => q.published).length} Published & Active
              </span>
            </div>

            <div className="p-5 bg-white dark:bg-[#141414] rounded-2xl border border-[#E0E0E0] dark:border-[#333333] shadow-xs">
              <span className="text-xs font-semibold text-[#666666] dark:text-[#A3A3A3]">Bilingual Support</span>
              <p className="text-2xl font-bold text-[#FF7900] font-mono mt-1">
                {motivationQuotes.filter((q) => q.quoteTamil).length}
              </p>
              <span className="text-[11px] text-[#888888] dark:text-[#A3A3A3]">Verified Tamil translations</span>
            </div>

            <div className="p-5 bg-white dark:bg-[#141414] rounded-2xl border border-[#E0E0E0] dark:border-[#333333] shadow-xs">
              <span className="text-xs font-semibold text-[#666666] dark:text-[#A3A3A3]">Weekly Themes</span>
              <p className="text-2xl font-bold text-[#E50914] font-mono mt-1">
                {weeklyThemes.length}
              </p>
              <span className="text-[11px] text-[#888888] dark:text-[#A3A3A3]">Scheduled calendar cycles</span>
            </div>

            <div className="p-5 bg-white dark:bg-[#141414] rounded-2xl border border-[#E0E0E0] dark:border-[#333333] shadow-xs">
              <span className="text-xs font-semibold text-[#666666] dark:text-[#A3A3A3]">Active Campaigns</span>
              <p className="text-2xl font-bold text-[#FFC928] font-mono mt-1">
                {motivationCampaigns.filter((c) => c.status === 'active').length}
              </p>
              <span className="text-[11px] text-[#888888] dark:text-[#A3A3A3]">Delivering to user workspace</span>
            </div>
          </div>

          <div className="p-6 bg-white dark:bg-[#141414] rounded-2xl border border-[#E0E0E0] dark:border-[#333333] shadow-xs space-y-3">
            <h4 className="text-xs font-bold text-[#101010] dark:text-white uppercase tracking-wider">
              Category Distribution Across Roles
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              {['admin', 'manager', 'team_lead', 'team_member'].map((role) => {
                const count = motivationQuotes.filter((q) =>
                  q.applicableRoles.includes(role as UserRole)
                ).length;
                return (
                  <div
                    key={role}
                    className="p-3.5 rounded-xl bg-[#F7F7F7] dark:bg-[#171717] border border-[#E0E0E0] dark:border-[#333333]"
                  >
                    <span className="text-[11px] font-mono uppercase text-[#666666] dark:text-[#A3A3A3]">
                      {role.replace('_', ' ')}
                    </span>
                    <p className="text-xl font-bold text-[#101010] dark:text-white font-mono mt-1">
                      {count} <span className="text-xs font-normal text-[#888888] dark:text-[#A3A3A3]">quotes</span>
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: ADD / EDIT MOTIVATION ENTRY                        */}
      {/* ========================================================= */}
      <Modal
        isOpen={isQuoteModalOpen}
        onClose={() => setIsQuoteModalOpen(false)}
        title={editingQuote ? 'Edit Motivation Entry' : 'Add New Motivation Entry'}
        description="Author or update motivational thoughts and verified quotes for enterprise delivery."
        maxWidth="2xl"
      >
        <form onSubmit={handleSaveQuote} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Quote Text in English */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#101010] dark:text-[#D4D4D4]">
              Motivational Quote (English) <span className="text-[#E50914]">*</span>
            </label>
            <textarea
              rows={3}
              value={quoteForm.quote}
              onChange={(e) => setQuoteForm({ ...quoteForm, quote: e.target.value })}
              placeholder="e.g. Quality is not an act, it is a habit."
              className="w-full p-3 text-xs sm:text-sm bg-white dark:bg-[#171717] border border-[#D4D4D4] dark:border-[#333333] rounded-xl text-[#101010] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#E50914]"
            />
          </div>

          {/* Quote Text in Tamil */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#101010] dark:text-[#D4D4D4]">
              தமிழ் வடிவம் / மொழிபெயர்ப்பு (Tamil Translation or Authentic Text)
            </label>
            <textarea
              rows={2}
              value={quoteForm.quoteTamil}
              onChange={(e) => setQuoteForm({ ...quoteForm, quoteTamil: e.target.value })}
              placeholder="எ.கா. தரம் என்பது தற்செயலான செயல் அல்ல, அது தொடர்ச்சியான பழக்கம்."
              className="w-full p-3 text-xs sm:text-sm bg-white dark:bg-[#171717] border border-[#D4D4D4] dark:border-[#333333] rounded-xl text-[#101010] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#E50914]"
            />
          </div>

          {/* Author in English & Tamil */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-[#101010] dark:text-[#D4D4D4]">
                Author (English)
              </label>
              <input
                type="text"
                value={quoteForm.author}
                onChange={(e) => setQuoteForm({ ...quoteForm, author: e.target.value })}
                placeholder="e.g. Aristotle"
                className="w-full px-3 py-2 text-xs bg-white dark:bg-[#171717] border border-[#D4D4D4] dark:border-[#333333] rounded-xl text-[#101010] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#E50914]"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-[#101010] dark:text-[#D4D4D4]">
                ஆசிரியர் (Author in Tamil)
              </label>
              <input
                type="text"
                value={quoteForm.authorTamil}
                onChange={(e) => setQuoteForm({ ...quoteForm, authorTamil: e.target.value })}
                placeholder="எ.கா. அரிஸ்டாட்டில்"
                className="w-full px-3 py-2 text-xs bg-white dark:bg-[#171717] border border-[#D4D4D4] dark:border-[#333333] rounded-xl text-[#101010] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#E50914]"
              />
            </div>
          </div>

          {/* Category & Weekly Theme */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-[#101010] dark:text-[#D4D4D4]">
                Category
              </label>
              <select
                value={quoteForm.category}
                onChange={(e) => setQuoteForm({ ...quoteForm, category: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-white dark:bg-[#171717] border border-[#D4D4D4] dark:border-[#333333] rounded-xl text-[#101010] dark:text-white focus:outline-none cursor-pointer"
              >
                {motivationCategories.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-[#101010] dark:text-[#D4D4D4]">
                Associated Weekly Theme
              </label>
              <select
                value={quoteForm.weeklyThemeId}
                onChange={(e) => setQuoteForm({ ...quoteForm, weeklyThemeId: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-white dark:bg-[#171717] border border-[#D4D4D4] dark:border-[#333333] rounded-xl text-[#101010] dark:text-white focus:outline-none cursor-pointer"
              >
                {weeklyThemes.map((th) => (
                  <option key={th.id} value={th.id}>
                    Week {th.weekNumber}: {th.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Applicable Roles Checkboxes */}
          <div className="space-y-1.5 pt-1">
            <label className="block text-xs font-semibold text-[#101010] dark:text-[#D4D4D4]">
              Applicable System Roles <span className="text-[#E50914]">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(['admin', 'manager', 'team_lead', 'team_member'] as UserRole[]).map((r) => {
                const checked = quoteForm.applicableRoles.includes(r);
                return (
                  <label
                    key={r}
                    className={`p-2.5 rounded-xl border text-xs font-medium flex items-center gap-2 cursor-pointer transition-colors ${
                      checked
                        ? 'border-[#E50914] bg-[#FFF5F5] dark:bg-[#171717] text-[#E50914] dark:text-[#FFC928]'
                        : 'border-[#E0E0E0] dark:border-[#333333] text-[#333333] dark:text-[#D4D4D4]'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => {
                        const next = checked
                          ? quoteForm.applicableRoles.filter((item) => item !== r)
                          : [...quoteForm.applicableRoles, r];
                        setQuoteForm({ ...quoteForm, applicableRoles: next });
                      }}
                      className="rounded border-[#D4D4D4] dark:border-[#444444] accent-[#E50914]"
                    />
                    <span className="capitalize">{r.replace('_', ' ')}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Attribution & Publish Toggles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#E0E0E0] dark:border-[#333333]">
            <label className="flex items-center gap-2.5 text-xs text-[#333333] dark:text-[#D4D4D4] cursor-pointer">
              <input
                type="checkbox"
                checked={quoteForm.isVerifiedAuthor}
                onChange={(e) => setQuoteForm({ ...quoteForm, isVerifiedAuthor: e.target.checked })}
                className="rounded border-[#D4D4D4] dark:border-[#444444] accent-[#E50914]"
              />
              <span>Verified Author Attribution</span>
            </label>

            <label className="flex items-center gap-2.5 text-xs text-[#333333] dark:text-[#D4D4D4] cursor-pointer">
              <input
                type="checkbox"
                checked={quoteForm.published}
                onChange={(e) => setQuoteForm({ ...quoteForm, published: e.target.checked })}
                className="rounded border-[#D4D4D4] dark:border-[#444444] accent-[#E50914]"
              />
              <span>Published & Immediately Active</span>
            </label>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E0E0E0] dark:border-[#333333]">
            <button
              type="button"
              onClick={() => setIsQuoteModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-[#555555] dark:text-[#A3A3A3] hover:text-[#101010] dark:hover:text-white rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-[#E50914] hover:bg-[#c40812] rounded-xl shadow-xs cursor-pointer"
            >
              {editingQuote ? 'Save Changes' : 'Publish Quote'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ========================================================= */}
      {/* MODAL: LIVE DASHBOARD CARD PREVIEW                        */}
      {/* ========================================================= */}
      {previewEntry && (
        <Modal
          isOpen={Boolean(previewEntry)}
          onClose={() => setPreviewEntry(null)}
          title="Dashboard Motivation Preview"
          description="Live preview of how this entry renders on an employee's My Workspace dashboard."
          maxWidth="lg"
        >
          <div className="p-6 space-y-4">
            {/* Language Switch in Preview */}
            <div className="flex items-center justify-between pb-2 border-b border-[#E0E0E0] dark:border-[#333333]">
              <span className="text-xs font-bold uppercase tracking-wider text-[#888888] dark:text-[#A3A3A3]">
                Card Preview Simulation
              </span>
              <div className="flex items-center rounded-lg bg-[#F0F0F0] dark:bg-[#171717] p-0.5 text-xs">
                <button
                  type="button"
                  onClick={() => setPreviewLang('en')}
                  className={`px-2.5 py-1 rounded-md font-semibold cursor-pointer ${
                    previewLang === 'en' ? 'bg-white dark:bg-[#333333] text-[#E50914] shadow-xs' : 'text-[#666666] dark:text-[#A3A3A3]'
                  }`}
                >
                  English
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewLang('ta')}
                  className={`px-2.5 py-1 rounded-md font-semibold cursor-pointer ${
                    previewLang === 'ta' ? 'bg-white dark:bg-[#333333] text-[#E50914] shadow-xs' : 'text-[#666666] dark:text-[#A3A3A3]'
                  }`}
                >
                  தமிழ்
                </button>
              </div>
            </div>

            {/* Simulated Workspace Card */}
            <div className="bg-white dark:bg-[#141414] rounded-3xl p-6 border border-[#E0E0E0] dark:border-[#333333] shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[#FFF5F5] text-[#E50914] dark:bg-[#171717] border border-[#E50914]/30">
                  {previewEntry.category}
                </span>
                <span className="text-[10px] font-mono text-[#888888] dark:text-[#A3A3A3]">1 of 1</span>
              </div>

              <blockquote className="text-base sm:text-lg font-serif italic text-[#101010] dark:text-white leading-relaxed">
                "{previewLang === 'ta' && previewEntry.quoteTamil ? previewEntry.quoteTamil : previewEntry.quote}"
              </blockquote>

              <div className="pt-3 border-t border-[#E0E0E0] dark:border-[#333333] flex items-center justify-between text-xs">
                <p className="font-bold text-[#101010] dark:text-white">
                  — {previewLang === 'ta' && previewEntry.authorTamil ? previewEntry.authorTamil : previewEntry.author || 'Verified Reflection'}
                </p>
                <span className="text-[10px] text-[#FFC928] font-medium">Preview Mode</span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setPreviewEntry(null)}
                className="px-4 py-2 text-xs font-semibold bg-[#F0F0F0] hover:bg-[#E0E0E0] dark:bg-[#171717] dark:hover:bg-[#202020] text-[#101010] dark:text-[#D4D4D4] rounded-xl cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ========================================================= */}
      {/* MODAL: BULK JSON IMPORT                                   */}
      {/* ========================================================= */}
      <Modal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        title="Bulk Import Motivation Entries"
        description="Paste a JSON array of motivation objects to bulk-import into the repository."
        maxWidth="2xl"
      >
        <div className="p-6 space-y-4">
          {importError && (
            <div className="p-3 bg-[#FFF5F5] dark:bg-[#171717] border border-[#E50914]/40 rounded-xl text-xs text-[#E50914] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-[#E50914] shrink-0" />
              <span>{importError}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-[#666666] dark:text-[#A3A3A3]">
              <span>JSON Content Array</span>
              <button
                type="button"
                onClick={() => {
                  const sample = [
                    {
                      quote: 'Simplicity is prerequisite for reliability.',
                      quoteTamil: 'எளிமையே நம்பகத்தன்மையின் முதன்மைத் தேவை.',
                      author: 'Edsger W. Dijkstra',
                      authorTamil: 'எட்ஸ்கர் டைக்ஸ்ட்ரா',
                      isVerifiedAuthor: true,
                      applicableRoles: ['team_lead', 'team_member'],
                      category: 'Problem Solving',
                    },
                  ];
                  setImportJsonText(JSON.stringify(sample, null, 2));
                }}
                className="text-[#E50914] hover:underline cursor-pointer"
              >
                Insert Sample Template
              </button>
            </div>
            <textarea
              rows={8}
              value={importJsonText}
              onChange={(e) => setImportJsonText(e.target.value)}
              placeholder='[ { "quote": "...", "author": "..." } ]'
              className="w-full p-3 font-mono text-xs bg-[#F7F7F7] dark:bg-[#171717] border border-[#D4D4D4] dark:border-[#333333] rounded-xl text-[#101010] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#E50914]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsImportModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-[#555555] dark:text-[#A3A3A3] hover:text-[#101010] dark:hover:text-white rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleImportQuotes}
              disabled={!importJsonText.trim()}
              className="px-5 py-2 text-xs font-semibold text-white bg-[#E50914] hover:bg-[#c40812] rounded-xl disabled:opacity-50 cursor-pointer"
            >
              Execute Bulk Import
            </button>
          </div>
        </div>
      </Modal>

      {/* ========================================================= */}
      {/* MODAL: CREATE CUSTOM CATEGORY                             */}
      {/* ========================================================= */}
      <Modal
        isOpen={isCatModalOpen}
        onClose={() => setIsCatModalOpen(false)}
        title="Create Motivation Category"
        description="Add a new custom category for grouping motivational thoughts."
        maxWidth="md"
      >
        <form onSubmit={handleSaveCategory} className="p-6 space-y-4">
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-[#101010] dark:text-[#D4D4D4]">
              Category Name (English) <span className="text-[#E50914]">*</span>
            </label>
            <input
              type="text"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              placeholder="e.g. Architectural Craftsmanship"
              className="w-full px-3 py-2 text-xs bg-white dark:bg-[#171717] border border-[#D4D4D4] dark:border-[#333333] rounded-xl text-[#101010] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#E50914]"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-[#101010] dark:text-[#D4D4D4]">
              பிரிவு பெயர் (Category in Tamil)
            </label>
            <input
              type="text"
              value={newCatNameTamil}
              onChange={(e) => setNewCatNameTamil(e.target.value)}
              placeholder="எ.கா. கட்டிடக்கலை கைவினைத்திறன்"
              className="w-full px-3 py-2 text-xs bg-white dark:bg-[#171717] border border-[#D4D4D4] dark:border-[#333333] rounded-xl text-[#101010] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#E50914]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsCatModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-[#555555] dark:text-[#A3A3A3] hover:text-[#101010] dark:hover:text-white rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!newCatName.trim()}
              className="px-5 py-2 text-xs font-semibold text-white bg-[#E50914] hover:bg-[#c40812] rounded-xl disabled:opacity-50 cursor-pointer"
            >
              Save Category
            </button>
          </div>
        </form>
      </Modal>

      {/* ========================================================= */}
      {/* MODAL: WEEKLY THEME FORM                                  */}
      {/* ========================================================= */}
      <Modal
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
        title={editingTheme ? 'Edit Weekly Theme' : 'Create Weekly Theme'}
        description="Configure theme title, description, and active status."
        maxWidth="lg"
      >
        <form onSubmit={handleSaveTheme} className="p-6 space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-[#101010] dark:text-[#D4D4D4]">
                Week #
              </label>
              <input
                type="number"
                value={themeForm.weekNumber}
                onChange={(e) => setThemeForm({ ...themeForm, weekNumber: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs bg-white dark:bg-[#171717] border border-[#D4D4D4] dark:border-[#333333] text-[#101010] dark:text-white rounded-xl font-mono"
              />
            </div>
            <div className="col-span-2 space-y-1">
              <label className="block text-xs font-semibold text-[#101010] dark:text-[#D4D4D4]">
                Theme Title (English) <span className="text-[#E50914]">*</span>
              </label>
              <input
                type="text"
                value={themeForm.title}
                onChange={(e) => setThemeForm({ ...themeForm, title: e.target.value })}
                placeholder="e.g. Delivery Excellence"
                className="w-full px-3 py-2 text-xs bg-white dark:bg-[#171717] border border-[#D4D4D4] dark:border-[#333333] text-[#101010] dark:text-white rounded-xl"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-[#101010] dark:text-[#D4D4D4]">
              கருப்பொருள் பெயர் (Tamil Title)
            </label>
            <input
              type="text"
              value={themeForm.titleTamil}
              onChange={(e) => setThemeForm({ ...themeForm, titleTamil: e.target.value })}
              placeholder="எ.கா. சிறப்பான விநியோகம்"
              className="w-full px-3 py-2 text-xs bg-white dark:bg-[#171717] border border-[#D4D4D4] dark:border-[#333333] text-[#101010] dark:text-white rounded-xl"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-[#101010] dark:text-[#D4D4D4]">
              Description (English)
            </label>
            <textarea
              rows={2}
              value={themeForm.description}
              onChange={(e) => setThemeForm({ ...themeForm, description: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-white dark:bg-[#171717] border border-[#D4D4D4] dark:border-[#333333] text-[#101010] dark:text-white rounded-xl"
            />
          </div>

          <label className="flex items-center gap-2.5 text-xs text-[#333333] dark:text-[#D4D4D4] cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={themeForm.isActive}
              onChange={(e) => setThemeForm({ ...themeForm, isActive: e.target.checked })}
              className="rounded border-[#D4D4D4] dark:border-[#444444] accent-[#E50914]"
            />
            <span>Set as Current Active Theme for all Dashboards</span>
          </label>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsThemeModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-[#555555] dark:text-[#A3A3A3] hover:text-[#101010] dark:hover:text-white rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!themeForm.title.trim()}
              className="px-5 py-2 text-xs font-semibold text-white bg-[#E50914] hover:bg-[#c40812] rounded-xl disabled:opacity-50 cursor-pointer"
            >
              Save Theme
            </button>
          </div>
        </form>
      </Modal>

      {/* ========================================================= */}
      {/* MODAL: CAMPAIGN FORM                                      */}
      {/* ========================================================= */}
      <Modal
        isOpen={isCampaignModalOpen}
        onClose={() => setIsCampaignModalOpen(false)}
        title={editingCampaign ? 'Edit Campaign' : 'Schedule Motivation Campaign'}
        description="Target specific roles and schedule motivation campaigns across the workspace."
        maxWidth="lg"
      >
        <form onSubmit={handleSaveCampaign} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-[#101010] dark:text-[#D4D4D4]">
              Campaign Name <span className="text-[#E50914]">*</span>
            </label>
            <input
              type="text"
              value={campForm.name}
              onChange={(e) => setCampForm({ ...campForm, name: e.target.value })}
              placeholder="e.g. Q4 Sprint Velocity & Craftsmanship Drive"
              className="w-full px-3 py-2 text-xs bg-white dark:bg-[#171717] border border-[#D4D4D4] dark:border-[#333333] text-[#101010] dark:text-white rounded-xl"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-[#101010] dark:text-[#D4D4D4]">
              Description
            </label>
            <textarea
              rows={2}
              value={campForm.description}
              onChange={(e) => setCampForm({ ...campForm, description: e.target.value })}
              placeholder="Enterprise objective of this campaign..."
              className="w-full px-3 py-2 text-xs bg-white dark:bg-[#171717] border border-[#D4D4D4] dark:border-[#333333] text-[#101010] dark:text-white rounded-xl"
            />
          </div>

          {/* Target roles */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-[#101010] dark:text-[#D4D4D4]">
              Target System Roles
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['admin', 'manager', 'team_lead', 'team_member'] as UserRole[]).map((r) => {
                const checked = campForm.targetRoles.includes(r);
                return (
                  <label
                    key={r}
                    className={`p-2 rounded-xl border text-xs font-medium flex items-center gap-2 cursor-pointer ${
                      checked
                        ? 'border-[#E50914] bg-[#FFF5F5] dark:bg-[#171717] text-[#E50914] dark:text-[#FFC928]'
                        : 'border-[#E0E0E0] dark:border-[#333333] text-[#333333] dark:text-[#D4D4D4]'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => {
                        const next = checked
                          ? campForm.targetRoles.filter((item) => item !== r)
                          : [...campForm.targetRoles, r];
                        setCampForm({ ...campForm, targetRoles: next });
                      }}
                      className="rounded border-[#D4D4D4] dark:border-[#444444] accent-[#E50914]"
                    />
                    <span className="capitalize">{r.replace('_', ' ')}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-[#101010] dark:text-[#D4D4D4]">
                Start Date
              </label>
              <input
                type="date"
                value={campForm.startDate}
                onChange={(e) => setCampForm({ ...campForm, startDate: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-white dark:bg-[#171717] border border-[#D4D4D4] dark:border-[#333333] text-[#101010] dark:text-white rounded-xl font-mono"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-[#101010] dark:text-[#D4D4D4]">
                End Date (Optional)
              </label>
              <input
                type="date"
                value={campForm.endDate}
                onChange={(e) => setCampForm({ ...campForm, endDate: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-white dark:bg-[#171717] border border-[#D4D4D4] dark:border-[#333333] text-[#101010] dark:text-white rounded-xl font-mono"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsCampaignModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-[#555555] dark:text-[#A3A3A3] hover:text-[#101010] dark:hover:text-white rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!campForm.name.trim()}
              className="px-5 py-2 text-xs font-semibold text-white bg-[#E50914] hover:bg-[#c40812] rounded-xl disabled:opacity-50 cursor-pointer"
            >
              Save Campaign
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
