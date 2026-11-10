import {
  MotivationEntry,
  WeeklyTheme,
  MotivationCampaign,
  UserMotivationPreferences,
  User,
  Task,
  Project,
} from '../types';

/**
 * Simple deterministic hash for a string to an unsigned 32-bit integer
 */
export function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * Evaluates real task & project records for progress milestones
 */
export function evaluateTaskProgressMilestone(
  user: User,
  tasks: Task[],
  projects: Project[]
): { hasMilestone: boolean; context: string; preferredCategory: string } | null {
  const role = user.role;

  if (role === 'team_member') {
    const userTasks = tasks.filter((t) => t.assigneeId === user.id);
    const completedTasks = userTasks.filter((t) => t.status === 'Done' || t.status === 'Completed');

    if (completedTasks.length > 0) {
      const recentTask = completedTasks[0];
      return {
        hasMilestone: true,
        context: `Task completed: "${recentTask.title}" (${completedTasks.length} total tasks delivered).`,
        preferredCategory: 'Execution',
      };
    }
    if (userTasks.length > 0) {
      return {
        hasMilestone: true,
        context: `Active sprint progress: ${userTasks.length} focus items in motion.`,
        preferredCategory: 'Time Management',
      };
    }
  }

  if (role === 'team_lead') {
    const leadTasks = tasks.filter((t) => t.leadId === user.id);
    const completed = leadTasks.filter((t) => t.status === 'Done' || t.status === 'Completed');

    if (completed.length > 0) {
      return {
        hasMilestone: true,
        context: `Team delivery milestone: ${completed.length} tasks completed under your solutions leadership.`,
        preferredCategory: 'Delivery Excellence',
      };
    }
  }

  if (role === 'manager') {
    const activeProjects = projects.filter((p) => p.status === 'In Progress' || p.status === 'Active');
    const completedProjects = projects.filter((p) => p.status === 'Completed');

    if (completedProjects.length > 0) {
      return {
        hasMilestone: true,
        context: `Project milestone: ${completedProjects.length} enterprise projects successfully delivered to client stakeholders.`,
        preferredCategory: 'Operations',
      };
    }
    if (activeProjects.length > 0) {
      return {
        hasMilestone: true,
        context: `Operations delivery: managing ${activeProjects.length} active client projects.`,
        preferredCategory: 'Productivity',
      };
    }
  }

  if (role === 'admin') {
    const totalDone = tasks.filter((t) => t.status === 'Done').length;
    const totalProjects = projects.length;
    if (totalDone > 0 || totalProjects > 0) {
      return {
        hasMilestone: true,
        context: `Organization telemetry: ${totalDone} enterprise tasks cleared across ${totalProjects} active client programs.`,
        preferredCategory: 'Organizational Growth',
      };
    }
  }

  return null;
}

export interface SelectionResult {
  entry: MotivationEntry;
  achievementContext?: string;
  campaignInfo?: { campaignId: string; campaignName: string };
  weeklyTheme?: WeeklyTheme;
}

/**
 * Centralized deterministic and user-personalized motivation selector
 */
export function selectPersonalizedMotivation({
  user,
  allQuotes,
  preferences,
  themes,
  campaigns,
  recentQuoteIds = [],
  tasks = [],
  projects = [],
  dateStr,
  manualOffset = 0,
}: {
  user: User;
  allQuotes: MotivationEntry[];
  preferences?: UserMotivationPreferences;
  themes: WeeklyTheme[];
  campaigns: MotivationCampaign[];
  recentQuoteIds?: string[];
  tasks?: Task[];
  projects?: Project[];
  dateStr: string;
  manualOffset?: number;
}): SelectionResult | null {
  if (!allQuotes || allQuotes.length === 0) {
    return null;
  }

  // Active theme
  const activeTheme = themes.find((t) => t.isActive) || themes[0];

  // 1. Check for Active Admin Scheduled Campaigns
  const now = dateStr;
  const activeCampaign = campaigns.find((c) => {
    if (c.status !== 'active') return false;
    if (c.startDate > now) return false;
    if (c.endDate && c.endDate < now) return false;
    if (!c.targetRoles.includes(user.role)) return false;
    if (c.targetUserIds && c.targetUserIds.length > 0 && !c.targetUserIds.includes(user.id)) return false;
    return true;
  });

  if (activeCampaign && preferences?.campaignParticipation !== false && activeCampaign.quoteIds.length > 0) {
    const campaignQuotes = allQuotes.filter((q) => activeCampaign.quoteIds.includes(q.id) && q.published);
    if (campaignQuotes.length > 0) {
      const idx = (hashString(user.id + dateStr + activeCampaign.id) + manualOffset) % campaignQuotes.length;
      return {
        entry: campaignQuotes[idx],
        campaignInfo: {
          campaignId: activeCampaign.id,
          campaignName: activeCampaign.name,
        },
        weeklyTheme: activeTheme,
      };
    }
  }

  // 2. Task-Progress-Based Motivation check
  let achievementContext: string | undefined = undefined;
  let preferredCategoryFromTask: string | undefined = undefined;

  if (preferences?.taskProgressMotivation !== false) {
    const milestone = evaluateTaskProgressMilestone(user, tasks, projects);
    if (milestone && milestone.hasMilestone) {
      achievementContext = milestone.context;
      preferredCategoryFromTask = milestone.preferredCategory;
    }
  }

  // 3. Filter published quotes eligible for this user's role
  let eligibleQuotes = allQuotes.filter(
    (q) => q.published && q.applicableRoles.includes(user.role)
  );

  if (eligibleQuotes.length === 0) {
    eligibleQuotes = allQuotes.filter((q) => q.published);
  }

  // Apply user category preferences if configured
  if (
    preferences?.preferredCategories &&
    preferences.preferredCategories.length > 0
  ) {
    const matchedCategories = eligibleQuotes.filter((q) =>
      preferences.preferredCategories.includes(q.category)
    );
    if (matchedCategories.length > 0) {
      eligibleQuotes = matchedCategories;
    }
  }

  // If milestone preferred category exists, prioritize matching quotes
  if (preferredCategoryFromTask) {
    const matchedTaskQuotes = eligibleQuotes.filter(
      (q) => q.category.toLowerCase() === preferredCategoryFromTask?.toLowerCase()
    );
    if (matchedTaskQuotes.length > 0) {
      eligibleQuotes = matchedTaskQuotes;
    }
  }

  // Filter recently viewed quotes on manual refresh to prevent immediate repetition
  let candidates = eligibleQuotes;
  if (manualOffset > 0 && recentQuoteIds.length > 0) {
    const notRecent = eligibleQuotes.filter((q) => !recentQuoteIds.includes(q.id));
    if (notRecent.length > 0) {
      candidates = notRecent;
    }
  }

  // Deterministic seed based on User ID + Date + manual offset
  const userSeed = hashString(user.id + dateStr);
  const selectedIndex = (userSeed + manualOffset) % candidates.length;
  const chosenEntry = candidates[selectedIndex] || eligibleQuotes[0] || allQuotes[0];

  return {
    entry: chosenEntry,
    achievementContext,
    weeklyTheme: activeTheme,
  };
}

/**
 * Validates bulk imported motivation JSON
 */
export function validateBulkImport(data: any): { valid: boolean; entries: MotivationEntry[]; error?: string } {
  if (!Array.isArray(data)) {
    return { valid: false, entries: [], error: 'Import data must be a JSON array of motivation objects.' };
  }

  const validEntries: MotivationEntry[] = [];
  for (let i = 0; i < data.length; i++) {
    const item = data[i];
    if (!item.quote || typeof item.quote !== 'string') {
      return { valid: false, entries: [], error: `Item at index ${i} is missing required string "quote".` };
    }
    const entry: MotivationEntry = {
      id: item.id || `quote-imported-${Date.now()}-${i}`,
      quote: item.quote.trim(),
      quoteTamil: item.quoteTamil?.trim() || undefined,
      author: item.author?.trim() || undefined,
      authorTamil: item.authorTamil?.trim() || undefined,
      isVerifiedAuthor: Boolean(item.isVerifiedAuthor),
      applicableRoles: Array.isArray(item.applicableRoles) && item.applicableRoles.length > 0
        ? item.applicableRoles
        : ['admin', 'manager', 'team_lead', 'team_member'],
      category: item.category?.trim() || 'General Growth',
      weeklyThemeId: item.weeklyThemeId || undefined,
      language: item.language || 'both',
      isOriginal: Boolean(item.isOriginal),
      published: item.published !== false,
      publishDate: item.publishDate,
      createdAt: item.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: item.createdBy || 'Admin Import',
    };
    validEntries.push(entry);
  }

  return { valid: true, entries: validEntries };
}
