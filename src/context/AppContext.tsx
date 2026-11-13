import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  UserRole,
  Client,
  Project,
  Task,
  TaskStatus,
  Team,
  MemberWorkloadInfo,
  ActivityLog,
  NotificationItem,
  NotificationType,
  NotificationCategory,
  NotificationPreferences,
  RolePermissions,
  SystemConfig,
  ProofSubmission,
  SignUpFormData,
  ProjectStatus,
  PersonalToDo,
  CalendarEvent,
  Meeting,
  DetailedProfileData,
  MotivationEntry,
  WeeklyTheme,
  MotivationCampaign,
  UserMotivationPreferences,
  UserMotivationFavorite,
  UserMotivationHistory,
  MotivationCategoryItem,
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_CLIENTS,
  INITIAL_PROJECTS,
  INITIAL_TASKS,
  INITIAL_TEAMS,
  INITIAL_ACTIVITY_LOGS,
  INITIAL_NOTIFICATIONS,
  INITIAL_ROLE_PERMISSIONS,
  INITIAL_SYSTEM_CONFIG,
  INITIAL_CREDENTIALS_MAP,
  INITIAL_TODOS,
  INITIAL_CALENDAR_EVENTS,
  INITIAL_MEETINGS,
  INITIAL_TEAM_PROFILES,
} from '../data/mockData';
import {
  INITIAL_MOTIVATION_QUOTES,
  INITIAL_WEEKLY_THEMES,
  INITIAL_MOTIVATION_CAMPAIGNS,
  DEFAULT_MOTIVATION_CATEGORIES,
} from '../data/initialMotivationData';

interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message: string;
}

interface AppContextType {
  currentUser: User | null;
  users: User[];
  clients: Client[];
  projects: Project[];
  tasks: Task[];
  teams: Team[];
  activityLogs: ActivityLog[];
  notifications: NotificationItem[];
  userNotifications: NotificationItem[];
  rolePermissions: RolePermissions[];
  systemConfig: SystemConfig;
  theme: 'light' | 'dark';
  toasts: ToastMessage[];
  currentView: 'landing' | 'login' | 'dashboard' | '3d-universe';

  // Navigation & Authentication
  setCurrentView: (view: 'landing' | 'login' | 'dashboard' | '3d-universe') => void;
  login: (loginIdentifier: string, password: string, selectedRole?: UserRole, autoNavigate?: boolean) => { success: boolean; error?: string; user?: User };
  signup: (data: SignUpFormData) => { success: boolean; error?: string; code?: string };
  verifyEmail: (email: string, code: string) => { success: boolean; error?: string };
  requestPasswordReset: (email: string) => { success: boolean; error?: string; token?: string };
  confirmPasswordReset: (email: string, token: string, newPass: string) => { success: boolean; error?: string };
  logout: () => void;
  switchDemoUser: (role: UserRole) => void;
  toggleTheme: () => void;
  dismissToast: (id: string) => void;
  showToast: (type: 'success' | 'error' | 'info', title: string, message: string) => void;

  // RBAC Permission checks
  canAccessTab: (tabId: string) => boolean;
  hasRole: (allowed: UserRole[]) => boolean;

  // Notification management
  notificationPreferences: NotificationPreferences;
  updateNotificationPreferences: (prefs: NotificationPreferences) => void;
  sendNotification: (data: {
    recipientType: 'user' | 'role' | 'all';
    targetUserId?: string;
    targetRole?: UserRole;
    title: string;
    message: string;
    type: NotificationType;
    category?: NotificationCategory;
    projectId?: string;
    taskId?: string;
    meetingId?: string;
    workspaceId?: string;
    priority?: 'normal' | 'high' | 'critical';
  }) => void;
  markNotificationRead: (id: string) => void;
  markNotificationUnread: (id: string) => void;
  markAllNotificationsRead: () => void;
  deleteNotification: (id: string) => void;

  // Client Operations
  addClient: (client: Omit<Client, 'id' | 'healthScore' | 'activeProjectsCount' | 'slaAdherence'>) => void;
  updateClient: (id: string, updates: Partial<Client>) => void;
  deleteClient: (id: string) => void;

  // Project Operations (Workflow)
  createProject: (projectData: {
    clientName: string;
    companyName?: string;
    purpose: string;
    description?: string;
    startDate: string;
    deadline: string;
    leadId: string;
    managerId?: string;
    managerName?: string;
  }) => { success: boolean; error?: string };
  addProject: (project: Omit<Project, 'id' | 'spent' | 'progress' | 'completedDeliverablesCount'>) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  getProjectProgress: (projectId: string) => {
    progress: number;
    totalTasks: number;
    completedTasks: number;
    activeTasks: number;
    isOverdue: boolean;
  };

  // Team & Workload Operations
  createTeam: (data: { name: string; leadId: string; memberIds: string[]; description?: string }) => void;
  updateTeam: (teamId: string, updates: Partial<Team>) => void;
  getMemberWorkload: (memberId: string) => MemberWorkloadInfo;

  // Task & Proof Operations
  addTask: (task: Omit<Task, 'id' | 'loggedHours' | 'createdAt'>) => void;
  updateTaskStatus: (taskId: string, status: TaskStatus) => void;
  submitProof: (taskId: string, proofData: {
    proofTitle: string;
    proofNotes: string;
    fileName: string;
    fileSize: string;
    externalLink?: string;
  }) => void;
  reviewProof: (taskId: string, decision: 'Approved' | 'Revision Requested', reviewNotes: string) => void;

  // Admin & User Governance
  addUser: (
    user: {
      name: string;
      loginId: string;
      role: UserRole;
      avatar?: string;
      email?: string;
      department?: string;
      phone?: string;
      title?: string;
    },
    initialPassword?: string
  ) => { success: boolean; error?: string };
  configureInitialAdmin: (adminData: {
    name: string;
    loginId: string;
    email: string;
    password: string;
    department?: string;
    title?: string;
  }) => { success: boolean; error?: string };
  updateUserRole: (userId: string, newRole: UserRole) => void;
  toggleUserStatus: (userId: string) => void;
  updateRolePermissions: (permissions: RolePermissions[]) => void;
  updateSystemConfig: (config: Partial<SystemConfig>) => void;

  // Productivity & Calendar
  todos: PersonalToDo[];
  calendarEvents: CalendarEvent[];
  addTodo: (todo: Omit<PersonalToDo, 'id' | 'createdAt' | 'userId'>) => void;
  updateTodo: (id: string, updates: Partial<PersonalToDo>) => void;
  deleteTodo: (id: string) => void;
  toggleTodoComplete: (id: string) => void;
  addCalendarEvent: (event: Omit<CalendarEvent, 'id' | 'userId'>) => void;
  deleteCalendarEvent: (id: string) => void;

  // Meetings Management
  meetings: Meeting[];
  scheduleMeeting: (meeting: Omit<Meeting, 'id' | 'createdAt' | 'organizerId' | 'organizerName' | 'organizerRole'>) => void;
  updateMeeting: (id: string, updates: Partial<Meeting>) => void;
  postponeMeeting: (id: string, newDate: string, newStartTime: string, newEndTime: string, reason: string) => void;
  cancelMeeting: (id: string, reason?: string) => void;

  // Centralized Team Profiles (Administrator-Only)
  teamProfiles: DetailedProfileData[];
  updateTeamProfile: (profile: DetailedProfileData) => void;
  resetTeamProfiles: () => void;

  // ==========================================
  // DYNAMIC DAILY MOTIVATION SYSTEM
  // ==========================================
  motivationQuotes: MotivationEntry[];
  weeklyThemes: WeeklyTheme[];
  motivationCampaigns: MotivationCampaign[];
  motivationCategories: MotivationCategoryItem[];
  currentUserMotivationPreferences: UserMotivationPreferences;
  currentUserFavorites: UserMotivationFavorite[];
  currentUserHistory: UserMotivationHistory[];
  updateCurrentUserMotivationPreferences: (updates: Partial<UserMotivationPreferences>) => void;
  toggleFavoriteQuote: (entry: MotivationEntry, lang: 'en' | 'ta') => void;
  removeFavoriteQuote: (favoriteId: string) => void;
  isQuoteFavorited: (quoteId: string, lang: 'en' | 'ta') => boolean;
  recordMotivationView: (
    entry: MotivationEntry,
    lang: 'en' | 'ta',
    achievementContext?: string,
    weeklyThemeTitle?: string
  ) => void;
  clearUserHistory: () => void;
  // Admin Motivation Management
  addMotivationQuote: (quote: Omit<MotivationEntry, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateMotivationQuote: (id: string, updates: Partial<MotivationEntry>) => void;
  deleteMotivationQuote: (id: string) => void;
  addWeeklyTheme: (theme: Omit<WeeklyTheme, 'id' | 'createdAt'>) => void;
  updateWeeklyTheme: (id: string, updates: Partial<WeeklyTheme>) => void;
  deleteWeeklyTheme: (id: string) => void;
  addMotivationCampaign: (
    campaign: Omit<MotivationCampaign, 'id' | 'reachCount' | 'viewCount' | 'favoriteCount' | 'createdAt' | 'updatedAt' | 'createdBy'>
  ) => void;
  updateMotivationCampaign: (id: string, updates: Partial<MotivationCampaign>) => void;
  deleteMotivationCampaign: (id: string) => void;
  addMotivationCategory: (category: MotivationCategoryItem) => void;
  importMotivationQuotes: (quotes: MotivationEntry[]) => { success: boolean; count: number };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Standard SHA-256 cryptographic hash function for secure password storage
export const hashPassword = (password: string): string => {
  function rotateRight(n: number, x: number) {
    return (x >>> n) | (x << (32 - n));
  }
  function choice(x: number, y: number, z: number) {
    return (x & y) ^ (~x & z);
  }
  function majority(x: number, y: number, z: number) {
    return (x & y) ^ (x & z) ^ (y & z);
  }
  function sigma0(x: number) {
    return rotateRight(2, x) ^ rotateRight(13, x) ^ rotateRight(22, x);
  }
  function sigma1(x: number) {
    return rotateRight(6, x) ^ rotateRight(11, x) ^ rotateRight(25, x);
  }
  function gamma0(x: number) {
    return rotateRight(7, x) ^ rotateRight(18, x) ^ (x >>> 3);
  }
  function gamma1(x: number) {
    return rotateRight(17, x) ^ rotateRight(19, x) ^ (x >>> 10);
  }

  const K = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
  ];

  let H0 = 0x6a09e667,
    H1 = 0xbb67ae85,
    H2 = 0x3c6ef372,
    H3 = 0xa54ff53a,
    H4 = 0x510e527f,
    H5 = 0x9b05688c,
    H6 = 0x1f83d9ab,
    H7 = 0x5be0cd19;

  const utf8 = unescape(encodeURIComponent(password));
  const words: number[] = [];
  for (let i = 0; i < utf8.length; i++) {
    words[i >>> 2] |= (utf8.charCodeAt(i) & 0xff) << (24 - (i % 4) * 8);
  }
  const bitLength = utf8.length * 8;
  words[bitLength >>> 5] |= 0x80 << (24 - (bitLength % 32));
  words[(((bitLength + 64) >>> 9) << 4) + 15] = bitLength;

  const W: number[] = new Array(64);
  for (let i = 0; i < words.length; i += 16) {
    for (let t = 0; t < 16; t++) W[t] = words[i + t] || 0;
    for (let t = 16; t < 64; t++) {
      W[t] = (gamma1(W[t - 2]) + W[t - 7] + gamma0(W[t - 15]) + W[t - 16]) | 0;
    }

    let a = H0,
      b = H1,
      c = H2,
      d = H3,
      e = H4,
      f = H5,
      g = H6,
      h = H7;

    for (let t = 0; t < 64; t++) {
      const T1 = (h + sigma1(e) + choice(e, f, g) + K[t] + W[t]) | 0;
      const T2 = (sigma0(a) + majority(a, b, c)) | 0;
      h = g;
      g = f;
      f = e;
      e = (d + T1) | 0;
      d = c;
      c = b;
      b = a;
      a = (T1 + T2) | 0;
    }

    H0 = (H0 + a) | 0;
    H1 = (H1 + b) | 0;
    H2 = (H2 + c) | 0;
    H3 = (H3 + d) | 0;
    H4 = (H4 + e) | 0;
    H5 = (H5 + f) | 0;
    H6 = (H6 + g) | 0;
    H7 = (H7 + h) | 0;
  }

  const toHex = (n: number) => (n >>> 0).toString(16).padStart(8, '0');
  return `${toHex(H0)}${toHex(H1)}${toHex(H2)}${toHex(H3)}${toHex(H4)}${toHex(H5)}${toHex(H6)}${toHex(H7)}`;
};

const DATA_VERSION = 'cms_v14_manager_visibility_work_allocation';

const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  allEnabled: true,
  projectNotifications: true,
  taskNotifications: true,
  deadlineReminders: true,
  meetingNotifications: true,
  systemAnnouncements: true,
  emailNotifications: true,
  pushNotifications: true,
};

const STORAGE_KEYS = {
  USER: 'cms_auth_user',
  VIEW: 'cms_current_view',
  CLIENTS: 'cms_clients_data',
  PROJECTS: 'cms_projects_data',
  TASKS: 'cms_tasks_data',
  TEAMS: 'cms_teams_data',
  USERS: 'cms_users_data',
  LOGS: 'cms_logs_data',
  PERMISSIONS: 'cms_permissions_data',
  CONFIG: 'cms_config_data',
  THEME: 'cms_theme_preference',
  NOTIFS: 'cms_notifs_data',
  NOTIF_PREFS: 'cms_notification_preferences',
  PASSWORDS: 'cms_mock_passwords',
  VERIFICATIONS: 'cms_mock_verifications',
  RESETS: 'cms_mock_resets',
  TODOS: 'cms_user_todos_v1',
  CALENDAR: 'cms_calendar_events_v1',
  WORKSPACES: 'cms_workspaces_v1',
  MEETINGS: 'cms_meetings_data_v1',
  TEAM_PROFILES: 'CMS_TEAM_PROFILES_V7',
  MOTIVATION_QUOTES: 'cms_motivation_quotes_v2',
  MOTIVATION_THEMES: 'cms_motivation_themes_v2',
  MOTIVATION_CAMPAIGNS: 'cms_motivation_campaigns_v2',
  MOTIVATION_PREFS: 'cms_motivation_prefs_v2',
  MOTIVATION_FAVORITES: 'cms_motivation_favorites_v2',
  MOTIVATION_HISTORY: 'cms_motivation_history_v2',
  MOTIVATION_CATEGORIES: 'cms_motivation_categories_v2',
};


// Check and perform clean data migration if previous versions stored fake names/companies or malformed profile schemas
if (typeof window !== 'undefined') {
  try {
    const currentVersion = localStorage.getItem('cms_data_version');
    if (currentVersion !== DATA_VERSION) {
      localStorage.removeItem(STORAGE_KEYS.CLIENTS);
      localStorage.removeItem(STORAGE_KEYS.PROJECTS);
      localStorage.removeItem(STORAGE_KEYS.TASKS);
      localStorage.removeItem(STORAGE_KEYS.TEAMS);
      localStorage.removeItem(STORAGE_KEYS.USERS);
      localStorage.removeItem(STORAGE_KEYS.USER);
      localStorage.removeItem(STORAGE_KEYS.LOGS);
      localStorage.removeItem(STORAGE_KEYS.NOTIFS);
      localStorage.removeItem(STORAGE_KEYS.PASSWORDS);
      localStorage.removeItem(STORAGE_KEYS.TEAM_PROFILES);
      localStorage.removeItem(STORAGE_KEYS.WORKSPACES);
      localStorage.setItem('cms_data_version', DATA_VERSION);
    }
  } catch {}
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Theme state: defaults to dark matte black mode
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.THEME) || localStorage.getItem('cms_theme');
      return saved === 'light' ? 'light' : 'dark';
    } catch {
      return 'dark';
    }
  });

  // Authenticated User with LocalStorage caching
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USER);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.id && parsed.role) {
          // Verify with clean accounts or keep active session
          const matched = INITIAL_USERS.find((u) => u.id === parsed.id || u.loginId === parsed.loginId);
          return matched || parsed;
        }
      } catch {
        return null;
      }
    }
    return null;
  });

  // Current View: landing, login, dashboard, 3d-universe with persistent restoration
  const [currentView, setCurrentView] = useState<'landing' | 'login' | 'dashboard' | '3d-universe'>(() => {
    const savedUser = localStorage.getItem(STORAGE_KEYS.USER);
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        if (parsed && parsed.id && parsed.role) {
          const savedView = localStorage.getItem(STORAGE_KEYS.VIEW);
          if (savedView === 'landing' || savedView === 'login') {
            return savedView;
          }
          return 'dashboard';
        }
      } catch {}
    }
    const savedView = localStorage.getItem(STORAGE_KEYS.VIEW);
    if (savedView === 'login') return 'login';
    return 'landing';
  });

  // Application Data States with LocalStorage fallback
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USERS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 19 && parsed.some((u: User) => u.loginId === 'admin@123')) {
          return parsed;
        }
      } catch {}
    }
    return INITIAL_USERS;
  });

  const [clients, setClients] = useState<Client[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CLIENTS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch {}
    }
    return INITIAL_CLIENTS;
  });

  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PROJECTS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch {}
    }
    return INITIAL_PROJECTS;
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TASKS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch {}
    }
    return INITIAL_TASKS;
  });

  const [teams, setTeams] = useState<Team[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TEAMS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {}
    }
    return INITIAL_TEAMS;
  });

  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.LOGS);
    return saved ? JSON.parse(saved) : INITIAL_ACTIVITY_LOGS;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.NOTIFS);
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [notificationPreferences, setNotificationPreferences] = useState<NotificationPreferences>(() => {
    try {
      const savedUser = localStorage.getItem(STORAGE_KEYS.USER);
      const parsedUser = savedUser ? JSON.parse(savedUser) : null;
      const key = parsedUser?.id ? `cms_notif_prefs_${parsedUser.id}` : STORAGE_KEYS.NOTIF_PREFS;
      const saved = localStorage.getItem(key) || localStorage.getItem(STORAGE_KEYS.NOTIF_PREFS);
      return saved ? { ...DEFAULT_NOTIFICATION_PREFERENCES, ...JSON.parse(saved) } : DEFAULT_NOTIFICATION_PREFERENCES;
    } catch {
      return DEFAULT_NOTIFICATION_PREFERENCES;
    }
  });

  const updateNotificationPreferences = (newPrefs: NotificationPreferences) => {
    setNotificationPreferences(newPrefs);
    const key = currentUser?.id ? `cms_notif_prefs_${currentUser.id}` : STORAGE_KEYS.NOTIF_PREFS;
    localStorage.setItem(key, JSON.stringify(newPrefs));
    localStorage.setItem(STORAGE_KEYS.NOTIF_PREFS, JSON.stringify(newPrefs));
  };

  const [rolePermissions, setRolePermissions] = useState<RolePermissions[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PERMISSIONS);
    return saved ? JSON.parse(saved) : INITIAL_ROLE_PERMISSIONS;
  });

  const [systemConfig, setSystemConfig] = useState<SystemConfig>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CONFIG);
    return saved ? JSON.parse(saved) : INITIAL_SYSTEM_CONFIG;
  });

  // Personal To-Dos state
  const [todos, setTodos] = useState<PersonalToDo[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TODOS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch {}
    }
    return INITIAL_TODOS;
  });

  // Calendar Events state
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CALENDAR);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch {}
    }
    return INITIAL_CALENDAR_EVENTS;
  });


  // Meetings Management state
  const [meetings, setMeetings] = useState<Meeting[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.MEETINGS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {}
    }
    return INITIAL_MEETINGS;
  });

  // Centralized Team Profiles (Administrator-Only)
  const [teamProfiles, setTeamProfiles] = useState<DetailedProfileData[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TEAM_PROFILES);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0]?.bio) return parsed;
      } catch {}
    }
    return INITIAL_TEAM_PROFILES;
  });

  // ==========================================
  // DYNAMIC DAILY MOTIVATION STATE
  // ==========================================
  const [motivationQuotes, setMotivationQuotes] = useState<MotivationEntry[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.MOTIVATION_QUOTES);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {}
    }
    return INITIAL_MOTIVATION_QUOTES;
  });

  const [weeklyThemes, setWeeklyThemes] = useState<WeeklyTheme[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.MOTIVATION_THEMES);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {}
    }
    return INITIAL_WEEKLY_THEMES;
  });

  const [motivationCampaigns, setMotivationCampaigns] = useState<MotivationCampaign[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.MOTIVATION_CAMPAIGNS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {}
    }
    return INITIAL_MOTIVATION_CAMPAIGNS;
  });

  const [motivationCategories, setMotivationCategories] = useState<MotivationCategoryItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.MOTIVATION_CATEGORIES);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {}
    }
    return DEFAULT_MOTIVATION_CATEGORIES;
  });

  const [allUserMotivationPrefs, setAllUserMotivationPrefs] = useState<Record<string, UserMotivationPreferences>>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.MOTIVATION_PREFS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return {};
  });

  const [userFavorites, setUserFavorites] = useState<UserMotivationFavorite[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.MOTIVATION_FAVORITES);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch {}
    }
    return [];
  });

  const [userHistory, setUserHistory] = useState<UserMotivationHistory[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.MOTIVATION_HISTORY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch {}
    }
    return [];
  });

  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Sync theme to documentElement class and localStorage
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem(STORAGE_KEYS.THEME, theme);
      localStorage.setItem('cms_theme', theme);
    } catch {}
  }, [theme]);

  // Listen for external ThemeToggle updates or cross-tab storage changes
  useEffect(() => {
    const handleExternalThemeChange = (e: Event) => {
      const customEvent = e as CustomEvent<'light' | 'dark'>;
      if (customEvent.detail === 'light' || customEvent.detail === 'dark') {
        setTheme((prev) => (prev === customEvent.detail ? prev : customEvent.detail));
      }
    };
    const handleStorageChange = (e: StorageEvent) => {
      if ((e.key === STORAGE_KEYS.THEME || e.key === 'cms_theme') && (e.newValue === 'light' || e.newValue === 'dark')) {
        setTheme(e.newValue);
      }
    };
    window.addEventListener('cms-theme-change', handleExternalThemeChange);
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('cms-theme-change', handleExternalThemeChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Persist data
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TEAMS, JSON.stringify(teams));
  }, [teams]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(activityLogs));
  }, [activityLogs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.NOTIFS, JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PERMISSIONS, JSON.stringify(rolePermissions));
  }, [rolePermissions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(systemConfig));
  }, [systemConfig]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TODOS, JSON.stringify(todos));
  }, [todos]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CALENDAR, JSON.stringify(calendarEvents));
  }, [calendarEvents]);


  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MEETINGS, JSON.stringify(meetings));
  }, [meetings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TEAM_PROFILES, JSON.stringify(teamProfiles));
  }, [teamProfiles]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MOTIVATION_QUOTES, JSON.stringify(motivationQuotes));
  }, [motivationQuotes]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MOTIVATION_THEMES, JSON.stringify(weeklyThemes));
  }, [weeklyThemes]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MOTIVATION_CAMPAIGNS, JSON.stringify(motivationCampaigns));
  }, [motivationCampaigns]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MOTIVATION_CATEGORIES, JSON.stringify(motivationCategories));
  }, [motivationCategories]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MOTIVATION_PREFS, JSON.stringify(allUserMotivationPrefs));
  }, [allUserMotivationPrefs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MOTIVATION_FAVORITES, JSON.stringify(userFavorites));
  }, [userFavorites]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MOTIVATION_HISTORY, JSON.stringify(userHistory));
  }, [userHistory]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(STORAGE_KEYS.USER);
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.VIEW, currentView);
  }, [currentView]);

  // Toast Helpers
  const showToast = (type: 'success' | 'error' | 'info', title: string, message: string) => {
    const id = 'toast-' + Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      dismissToast(id);
    }, 4500);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // Add Log Entry Helper
  const addLog = (
    action: string,
    target: string,
    category: ActivityLog['category'],
    details: string
  ) => {
    const newLog: ActivityLog = {
      id: 'act-' + Date.now(),
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      actorName: currentUser ? currentUser.name : 'System',
      actorRole: currentUser ? currentUser.role : 'admin',
      action,
      target,
      category,
      details,
    };
    setActivityLogs((prev) => [newLog, ...prev]);
  };

  // Authentication Flow
  const login = (
    loginIdentifier: string,
    pass: string,
    selectedRole?: UserRole,
    autoNavigate = true
  ): { success: boolean; error?: string; user?: User } => {
    const trimmed = loginIdentifier.trim().toLowerCase();

    if (!trimmed) {
      return {
        success: false,
        error: 'Please enter your assigned Login ID.',
      };
    }

    if (!pass) {
      return {
        success: false,
        error: 'Please enter your account password.',
      };
    }

    // Support pattern aliases (e.g. manager@123 resolves to manager1@123)
    let normalizedId = trimmed;
    if (trimmed === 'manager@123') normalizedId = 'manager1@123';
    if (trimmed === 'teamlead@123') normalizedId = 'teamlead1@123';
    if (trimmed === 'teammember@123') normalizedId = 'teammember1@123';

    // Lookup user by Login ID or Email
    const foundUser = users.find(
      (u) =>
        (u.loginId && u.loginId.toLowerCase() === normalizedId) ||
        (u.email && u.email.toLowerCase() === normalizedId) ||
        (u.loginId && u.loginId.toLowerCase() === trimmed) ||
        (u.email && u.email.toLowerCase() === trimmed)
    );

    if (!foundUser) {
      return {
        success: false,
        error: 'Invalid Login ID or Password. No matching account found in the system.',
      };
    }

    if (foundUser.status === 'inactive') {
      return {
        success: false,
        error: 'This account has been deactivated. Please contact your organization administrator.',
      };
    }

    // Role Verification against trusted account data
    if (selectedRole && foundUser.role !== selectedRole) {
      const roleTitles: Record<UserRole, string> = {
        admin: 'Administrator',
        manager: 'Manager',
        team_lead: 'Team Lead',
        team_member: 'Team Member',
      };
      return {
        success: false,
        error: `Access Denied: The credentials entered belong to a ${roleTitles[foundUser.role]} account, not ${roleTitles[selectedRole]}. Users cannot gain access by selecting a different role.`,
      };
    }

    // Password verification against trusted credentials (supporting SHA-256 hashed and plaintext credentials)
    const passwordsStore = JSON.parse(localStorage.getItem(STORAGE_KEYS.PASSWORDS) || '{}');
    const enteredHash = hashPassword(pass);
    const expectedPass =
      (foundUser.loginId && passwordsStore[foundUser.loginId.toLowerCase()]) ||
      (foundUser.email && passwordsStore[foundUser.email.toLowerCase()]) ||
      passwordsStore[trimmed] ||
      passwordsStore[normalizedId] ||
      (foundUser.loginId && INITIAL_CREDENTIALS_MAP[foundUser.loginId.toLowerCase()]) ||
      (foundUser.email && INITIAL_CREDENTIALS_MAP[foundUser.email.toLowerCase()]) ||
      INITIAL_CREDENTIALS_MAP[trimmed] ||
      INITIAL_CREDENTIALS_MAP[normalizedId];

    if (!expectedPass || (pass !== expectedPass && enteredHash !== expectedPass)) {
      return {
        success: false,
        error: 'Invalid Login ID or Password. Please verify your credentials and try again.',
      };
    }

    // Successful Authentication: Bind role strictly to trusted database user record
    setCurrentUser(foundUser);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(foundUser));
    
    if (autoNavigate) {
      setCurrentView('dashboard');
      localStorage.setItem(STORAGE_KEYS.VIEW, 'dashboard');
    }

    showToast(
      'success',
      'Authenticated Successfully',
      `Welcome, ${foundUser.name}. Signed in as ${foundUser.role.replace('_', ' ').toUpperCase()}.`
    );
    addLog(
      'User Signed In',
      foundUser.loginId || foundUser.email || foundUser.name,
      'auth',
      `Session established with verified role: ${foundUser.role}.`
    );
    return { success: true, user: foundUser };
  };

  const signup = (data: SignUpFormData): { success: boolean; error?: string; code?: string } => {
    const normalizedEmail = data.email.trim().toLowerCase();

    // Check duplicate
    if (users.some((u) => (u.email ? u.email.toLowerCase() === normalizedEmail : false))) {
      return {
        success: false,
        error: 'An account with this email address already exists. Please sign in.',
      };
    }

    // Create 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verifications = JSON.parse(localStorage.getItem(STORAGE_KEYS.VERIFICATIONS) || '{}');
    verifications[normalizedEmail] = {
      code: verificationCode,
      expiresAt: Date.now() + 15 * 60 * 1000, // 15 mins
      data: {
        name: data.name.trim(),
        email: normalizedEmail,
        password: data.password,
        role: data.requestedRole || 'team_member',
        department: data.department || 'Solutions & Delivery Engineering',
        title: data.title || 'Implementation Specialist',
        phone: '+1 (555) 010-0000',
      },
    };
    localStorage.setItem(STORAGE_KEYS.VERIFICATIONS, JSON.stringify(verifications));

    // Save initial password in password store
    const passwordsStore = JSON.parse(localStorage.getItem(STORAGE_KEYS.PASSWORDS) || '{}');
    passwordsStore[normalizedEmail] = data.password;
    localStorage.setItem(STORAGE_KEYS.PASSWORDS, JSON.stringify(passwordsStore));

    showToast(
      'info',
      'Verification Code Dispatched',
      `Verification code sent to ${data.email}. Demo Code: ${verificationCode}`
    );

    addLog(
      'User Registration Initiated',
      data.email,
      'auth',
      `Verification code generated for requested role: ${data.requestedRole || 'team_member'}.`
    );

    return {
      success: true,
      code: verificationCode,
    };
  };

  const verifyEmail = (email: string, code: string): { success: boolean; error?: string } => {
    const normalizedEmail = email.trim().toLowerCase();
    const verifications = JSON.parse(localStorage.getItem(STORAGE_KEYS.VERIFICATIONS) || '{}');
    const record = verifications[normalizedEmail];

    if (!record) {
      return {
        success: false,
        error: 'No pending registration found for this email address.',
      };
    }

    if (record.code !== code.trim()) {
      return {
        success: false,
        error: 'Invalid verification code. Please check your email and try again.',
      };
    }

    // Create active user
    const newUser: User = {
      id: 'user-' + Date.now(),
      name: record.data.name,
      loginId: record.data.loginId || normalizedEmail.split('@')[0],
      email: normalizedEmail,
      role: record.data.role,
      department: record.data.department,
      title: record.data.title,
      phone: record.data.phone,
      status: 'active',
      lastActive: 'Just now',
      avatar: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><rect width="64" height="64" rx="32" fill="%232563EB"/><text x="50%" y="54%" text-anchor="middle" dy=".3em" fill="white" font-family="sans-serif" font-size="18" font-weight="bold">${(record.data.name || 'U').split(' ').map((n: string) => n[0]).filter(Boolean).join('').toUpperCase().substring(0, 3)}</text></svg>`,
      emailVerified: true,
    };

    setUsers((prev) => [newUser, ...prev]);
    setCurrentUser(newUser);
    delete verifications[normalizedEmail];
    localStorage.setItem(STORAGE_KEYS.VERIFICATIONS, JSON.stringify(verifications));

    setCurrentView('dashboard');
    showToast('success', 'Email Verified', `Account verified! Welcome to Client Workspace, ${newUser.name}.`);
    addLog('User Account Verified', newUser.email || newUser.loginId || newUser.name, 'auth', `Completed email verification with role: ${newUser.role}.`);

    return { success: true };
  };

  const requestPasswordReset = (email: string): { success: boolean; error?: string; token?: string } => {
    const normalizedEmail = email.trim().toLowerCase();
    const user = users.find((u) => (u.email ? u.email.toLowerCase() === normalizedEmail : false));

    if (!user) {
      return {
        success: false,
        error: 'No registered workspace account found with this email.',
      };
    }

    const resetToken = 'rst-' + Math.random().toString(36).substring(2, 10).toUpperCase();
    const resets = JSON.parse(localStorage.getItem(STORAGE_KEYS.RESETS) || '{}');
    resets[normalizedEmail] = {
      token: resetToken,
      expiresAt: Date.now() + 30 * 60 * 1000,
    };
    localStorage.setItem(STORAGE_KEYS.RESETS, JSON.stringify(resets));

    showToast('info', 'Password Reset Dispatched', `Reset token generated: ${resetToken}`);
    addLog('Password Reset Requested', normalizedEmail, 'auth', 'Reset token generated.');

    return {
      success: true,
      token: resetToken,
    };
  };

  const confirmPasswordReset = (
    email: string,
    token: string,
    newPass: string
  ): { success: boolean; error?: string } => {
    const normalizedEmail = email.trim().toLowerCase();
    const resets = JSON.parse(localStorage.getItem(STORAGE_KEYS.RESETS) || '{}');
    const record = resets[normalizedEmail];

    if (!record || record.token !== token.trim().toUpperCase()) {
      return {
        success: false,
        error: 'Invalid or expired password reset token.',
      };
    }

    const passwordsStore = JSON.parse(localStorage.getItem(STORAGE_KEYS.PASSWORDS) || '{}');
    passwordsStore[normalizedEmail] = newPass;
    localStorage.setItem(STORAGE_KEYS.PASSWORDS, JSON.stringify(passwordsStore));

    delete resets[normalizedEmail];
    localStorage.setItem(STORAGE_KEYS.RESETS, JSON.stringify(resets));

    showToast('success', 'Password Updated', 'Your password has been reset. You can now sign in.');
    addLog('Password Reset Completed', normalizedEmail, 'auth', 'Password credentials updated.');

    return { success: true };
  };

  const logout = () => {
    if (currentUser) {
      addLog('User Signed Out', currentUser.email || currentUser.loginId || currentUser.name, 'auth', 'Session gracefully terminated.');
    }
    setCurrentUser(null);
    setCurrentView('login');
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.setItem(STORAGE_KEYS.VIEW, 'login');
    showToast('info', 'Signed Out', 'You have been securely signed out of your workspace session.');
  };

  const switchDemoUser = (role: UserRole) => {
    const target = users.find((u) => u.role === role);
    if (target) {
      setCurrentUser(target);
      setCurrentView('dashboard');
      showToast(
        'info',
        'Switched User Profile',
        `Switched session to ${target.name} (${target.title}).`
      );
      addLog(
        'Role Switch Executed',
        target.role,
        'auth',
        `Evaluator switched active session to ${target.name}.`
      );
    }
  };

  // RBAC Permission Helpers
  const hasRole = (allowedRoles: UserRole[]): boolean => {
    if (!currentUser) return false;
    return allowedRoles.includes(currentUser.role);
  };

  const canAccessTab = (tabId: string): boolean => {
    if (!currentUser) return false;
    const role = currentUser.role;

    // Common universal tabs for all authenticated roles
    if (
      tabId === 'workspace' ||
      tabId === 'meetings' ||
      tabId === 'settings' ||
      tabId === 'notification-settings'
    ) {
      return true;
    }

    // Role-specific allowed tabs
    const adminAllowed = [
      'workspace',
      'overview',
      'users',
      'permissions',
      'team-profiles',
      'motivation-admin',
      'motivation-management',
      'projects',
      'teams',
      'meetings',
      'reports',
      'audit-logs',
      'configuration',
      'settings',
    ];
    const managerAllowed = [
      'workspace',
      'clients',
      'team',
      'projects',
      'tasks',
      'meetings',
      'reports',
      'analytics',
      'activity-logs',
      'deadline-alerts',
      'settings',
    ];
    const leadAllowed = [
      'workspace',
      'assigned-projects',
      'task-distribution',
      'team-progress',
      'status-monitoring',
      'meetings',
      'reports',
      'activity-logs',
      'deadline-alerts',
      'settings',
    ];
    const memberAllowed = [
      'workspace',
      'my-tasks',
      'meetings',
      'reports',
      'deadlines',
      'activity-logs',
      'notifications-log',
      'settings',
    ];

    if (role === 'admin') return adminAllowed.includes(tabId);
    if (role === 'manager') return managerAllowed.includes(tabId);
    if (role === 'team_lead') return leadAllowed.includes(tabId);
    if (role === 'team_member') return memberAllowed.includes(tabId);
    return false;
  };

  // Notification Dispatching
  const sendNotification = (data: {
    recipientType: 'user' | 'role' | 'all';
    targetUserId?: string;
    targetRole?: UserRole;
    title: string;
    message: string;
    type: NotificationType;
    category?: NotificationCategory;
    projectId?: string;
    taskId?: string;
    meetingId?: string;
    priority?: 'normal' | 'high' | 'critical';
  }) => {
    if (!currentUser) return;

    // Resolve category automatically if not supplied
    const resolvedCategory: NotificationCategory =
      data.category ||
      (data.type.startsWith('project_') || data.type === 'new_project_assigned' || data.projectId
        ? 'project'
        : data.type.startsWith('task_') || data.type === 'proof_review' || data.taskId
        ? 'task'
        : data.type.startsWith('meeting_') || data.meetingId
        ? 'meeting'
        : 'system');

    const newNotif: NotificationItem = {
      id: 'notif-' + Date.now(),
      recipientType: data.recipientType,
      userId: data.targetUserId,
      targetRole: data.targetRole,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderRole: currentUser.role,
      title: data.title,
      message: data.message,
      timestamp: 'Just now',
      read: false,
      type: data.type,
      category: resolvedCategory,
      projectId: data.projectId,
      taskId: data.taskId,
      meetingId: data.meetingId,
      priority: data.priority || 'normal',
    };

    setNotifications((prev) => [newNotif, ...prev]);
    showToast(
      'success',
      'Notification Dispatched',
      `Sent notification "${data.title}" to ${
        data.recipientType === 'all'
          ? 'all workspace users'
          : data.recipientType === 'role'
          ? `role: ${data.targetRole}`
          : 'individual recipient'
      }.`
    );

    addLog(
      'Notification Broadcast',
      data.title,
      'system',
      `Dispatched by ${currentUser.name} (${currentUser.role}) to ${data.recipientType}.`
    );
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markNotificationUnread = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: false } : n))
    );
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    showToast('info', 'Notifications Cleared', 'All visible notifications marked as read.');
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    showToast('info', 'Notification Removed', 'Notification was deleted.');
  };

  // Filter notifications visible to current user based on RBAC & recipient targeting + user preferences
  const userNotifications = notifications.filter((n) => {
    if (!currentUser) return false;

    // Recipient Targeting Verification
    const isRecipient =
      currentUser.role === 'admin' ||
      n.recipientType === 'all' ||
      (n.recipientType === 'role' && n.targetRole === currentUser.role) ||
      (n.recipientType === 'user' && n.userId === currentUser.id);

    if (!isRecipient) return false;

    // Suppression via user notification preferences
    if (!notificationPreferences.allEnabled && n.priority !== 'critical') {
      return false;
    }

    const cat =
      n.category ||
      (n.type.startsWith('project_') || n.type === 'new_project_assigned' || n.projectId
        ? 'project'
        : n.type.startsWith('task_') || n.type === 'proof_review' || n.taskId
        ? 'task'
        : n.type.startsWith('meeting_') || n.meetingId
        ? 'meeting'
        : 'system');

    if (!notificationPreferences.projectNotifications && cat === 'project') {
      return false;
    }

    if (
      !notificationPreferences.taskNotifications &&
      cat === 'task' &&
      n.type !== 'task_overdue' &&
      n.priority !== 'critical'
    ) {
      return false;
    }

    if (
      !notificationPreferences.deadlineReminders &&
      (n.type === 'deadline' ||
        n.type === 'deadline_approaching' ||
        n.type === 'task_deadline' ||
        n.type === 'project_deadline' ||
        n.type === 'task_overdue')
    ) {
      return false;
    }

    if (!notificationPreferences.meetingNotifications && cat === 'meeting') {
      return false;
    }

    if (
      !notificationPreferences.systemAnnouncements &&
      cat === 'system' &&
      n.priority !== 'critical'
    ) {
      return false;
    }

    return true;
  });

  // Client Management
  const addClient = (newClientData: Omit<Client, 'id' | 'healthScore' | 'activeProjectsCount' | 'slaAdherence'>) => {
    const newClient: Client = {
      ...newClientData,
      id: 'client-' + Date.now(),
      healthScore: 92,
      activeProjectsCount: 0,
      slaAdherence: 99.0,
    };
    setClients((prev) => [newClient, ...prev]);
    showToast('success', 'Client Registered', `${newClient.name} has been added to the client directory.`);
    addLog('Client Created', newClient.name, 'client', `New client onboarding initiated with tier: ${newClient.tier}.`);
  };

  const updateClient = (id: string, updates: Partial<Client>) => {
    setClients((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
    showToast('success', 'Client Updated', 'Client record changes have been saved.');
    addLog('Client Modified', id, 'client', 'Client profile and metadata updated.');
  };

  const deleteClient = (id: string) => {
    const client = clients.find((c) => c.id === id);
    setClients((prev) => prev.filter((c) => c.id !== id));
    showToast('info', 'Client Removed', `${client?.name || 'Client'} was removed from active roster.`);
    addLog('Client Deleted', client?.name || id, 'client', 'Client record archived.');
  };

  // Project Operations (Workflow)
  const createProject = (projectData: {
    clientName: string;
    companyName?: string;
    purpose: string;
    description?: string;
    startDate: string;
    deadline: string;
    leadId: string;
    managerId?: string;
    managerName?: string;
  }): { success: boolean; error?: string } => {
    if (!projectData.clientName.trim()) {
      return { success: false, error: 'Client Name is required.' };
    }
    if (!projectData.purpose.trim()) {
      return { success: false, error: 'Project Purpose is required.' };
    }
    if (!projectData.startDate || !projectData.deadline) {
      return { success: false, error: 'Start Date and Deadline are required.' };
    }

    const start = new Date(projectData.startDate).getTime();
    const end = new Date(projectData.deadline).getTime();
    if (end < start) {
      return { success: false, error: 'Project deadline cannot be earlier than start date.' };
    }

    const duration = Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)));
    const leadUser = users.find((u) => u.id === projectData.leadId);

    // Explicit Manager Assignment
    const assigningManagerId =
      projectData.managerId || (currentUser?.role === 'manager' ? currentUser.id : 'user-manager-1');
    const assigningManagerUser = users.find((u) => u.id === assigningManagerId);
    const assigningManagerName =
      projectData.managerName ||
      (assigningManagerUser ? assigningManagerUser.name : currentUser?.role === 'manager' ? currentUser.name : 'Manager 1');

    const newProject: Project = {
      id: 'proj-' + Date.now(),
      title: projectData.companyName
        ? `${projectData.clientName} (${projectData.companyName})`
        : projectData.clientName,
      clientName: projectData.clientName,
      companyName: projectData.companyName,
      purpose: projectData.purpose,
      description: projectData.description,
      startDate: projectData.startDate,
      deadline: projectData.deadline,
      duration,
      leadId: projectData.leadId,
      leadName: leadUser ? leadUser.name : 'Team Lead 1',
      managerId: assigningManagerId,
      managerName: assigningManagerName,
      status: 'New',
      progress: 0,
      deliverablesCount: 0,
      completedDeliverablesCount: 0,
      createdAt: new Date().toISOString().substring(0, 10),
    };

    setProjects((prev) => [newProject, ...prev]);

    // Dispatch notification specifically to the assigned Team Lead
    if (projectData.leadId) {
      const notif: NotificationItem = {
        id: 'notif-' + Date.now(),
        recipientType: 'user',
        userId: projectData.leadId,
        senderId: assigningManagerId,
        senderName: assigningManagerName,
        senderRole: 'manager',
        title: 'New Project Assigned: ' + newProject.title,
        message: `${assigningManagerName} assigned project "${newProject.purpose}" to you. Timeline: ${newProject.startDate} to ${newProject.deadline} (${duration} days).`,
        timestamp: 'Just now',
        read: false,
        type: 'new_project_assigned',
        priority: 'high',
      };
      setNotifications((prev) => [notif, ...prev]);
    }

    showToast('success', 'Project Created & Assigned', `Project for ${newProject.clientName} assigned to ${newProject.leadName} by ${assigningManagerName} (${duration} days).`);
    addLog(
      'Project Created',
      newProject.title,
      'project',
      `Purpose: "${newProject.purpose}". Assigned to ${newProject.leadName} by ${assigningManagerName}. Duration: ${duration} days.`
    );

    return { success: true };
  };

  const addProject = (projectData: Omit<Project, 'id' | 'spent' | 'progress' | 'completedDeliverablesCount'>) => {
    const newProject: Project = {
      ...projectData,
      id: 'proj-' + Date.now(),
      spent: 0,
      progress: 0,
      completedDeliverablesCount: 0,
    };
    setProjects((prev) => [newProject, ...prev]);
    showToast('success', 'Project Created', `${newProject.title} initialized successfully.`);
    addLog('Project Created', newProject.title, 'project', `Project assigned to Lead: ${newProject.leadName}.`);
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
    showToast('success', 'Project Updated', 'Project milestones and status updated.');
  };

  // Dynamic progress calculated from actual task statuses, not arbitrary percentages
  const getProjectProgress = (projectId: string) => {
    const projectTasks = tasks.filter((t) => t.projectId === projectId);
    if (projectTasks.length === 0) {
      const project = projects.find((p) => p.id === projectId);
      const isDone = project?.status === 'Done' || project?.status === 'Completed';
      return { progress: isDone ? 100 : 0, totalTasks: 0, completedTasks: 0, activeTasks: 0, isOverdue: false };
    }
    const completedTasks = projectTasks.filter((t) => t.status === 'Done' || t.status === 'Completed').length;
    const progress = Math.round((completedTasks / projectTasks.length) * 100);
    const activeTasks = projectTasks.length - completedTasks;
    const now = Date.now();
    const isOverdue = projectTasks.some((t) => (t.status !== 'Done' && t.status !== 'Completed') && new Date(t.deadline).getTime() < now);
    return {
      progress,
      totalTasks: projectTasks.length,
      completedTasks,
      activeTasks,
      isOverdue,
    };
  };

  // Team & Workload Operations (Flexible team sizes: e.g. 10, 5, 2 members)
  const createTeam = (data: { name: string; leadId: string; memberIds: string[]; description?: string }) => {
    const leadUser = users.find((u) => u.id === data.leadId);
    const newTeam: Team = {
      id: 'team-' + Date.now(),
      name: data.name,
      leadId: data.leadId,
      leadName: leadUser ? leadUser.name : 'Team Lead',
      memberIds: data.memberIds,
      description: data.description,
      createdAt: new Date().toISOString().substring(0, 10),
    };
    setTeams((prev) => [...prev, newTeam]);
    showToast('success', 'Team Configured', `Team "${newTeam.name}" with ${newTeam.memberIds.length} members configured.`);
    addLog('Team Created', newTeam.name, 'system', `Assigned to Lead: ${newTeam.leadName}.`);
  };

  const updateTeam = (teamId: string, updates: Partial<Team>) => {
    setTeams((prev) => prev.map((t) => (t.id === teamId ? { ...t, ...updates } : t)));
    showToast('success', 'Team Updated', 'Team allocation changes saved.');
  };

  // Availability tracking based on current task assignments, deadlines, and workload
  // Does not assume a member is available merely because they have no currently completed tasks
  const getMemberWorkload = (memberId: string): MemberWorkloadInfo => {
    const member = users.find((u) => u.id === memberId);
    const memberName = member ? member.name : 'Team Member';
    const memberTasks = tasks.filter((t) => t.assigneeId === memberId);
    const activeTasks = memberTasks.filter((t) => t.status !== 'Done' && t.status !== 'Completed');
    const completedTasksCount = memberTasks.filter((t) => t.status === 'Done' || t.status === 'Completed').length;
    const now = Date.now();
    const overdueTasks = activeTasks.filter((t) => new Date(t.deadline).getTime() < now);
    const upcomingDeadlines = activeTasks.filter((t) => {
      const diff = (new Date(t.deadline).getTime() - now) / (1000 * 60 * 60 * 24);
      return diff >= 0 && diff <= 3;
    });

    let availabilityStatus: 'Available' | 'Moderate' | 'Busy' | 'Unavailable' = 'Available';
    let availabilityLabel = 'Available (0 active tasks)';

    if (activeTasks.length === 0) {
      availabilityStatus = 'Available';
      availabilityLabel = 'Available · Ready for work';
    } else if (activeTasks.length <= 2 && overdueTasks.length === 0) {
      availabilityStatus = 'Moderate';
      availabilityLabel = `Available · ${activeTasks.length} active ${activeTasks.length === 1 ? 'task' : 'tasks'}`;
    } else if (activeTasks.length >= 5 || overdueTasks.length >= 2) {
      availabilityStatus = 'Unavailable';
      availabilityLabel = `Unavailable · ${activeTasks.length} tasks allocated`;
    } else {
      availabilityStatus = 'Busy';
      availabilityLabel = `Busy · ${activeTasks.length} active tasks`;
    }

    return {
      memberId,
      memberName,
      activeTasksCount: activeTasks.length,
      completedTasksCount,
      upcomingDeadlinesCount: upcomingDeadlines.length,
      overdueTasksCount: overdueTasks.length,
      availabilityStatus,
      availabilityLabel,
    };
  };

  // Task & Proof Operations
  const addTask = (taskData: Omit<Task, 'id' | 'loggedHours' | 'createdAt'>) => {
    const leadUser = users.find((u) => u.id === taskData.leadId);
    const newTask: Task = {
      ...taskData,
      id: 'task-' + Date.now(),
      workComponent: taskData.workComponent || 'Frontend Development',
      leadName: taskData.leadName || (leadUser ? leadUser.name : 'Team Lead 1'),
      reviewStatus: taskData.proofSubmission ? taskData.proofSubmission.status : 'Not Submitted',
      loggedHours: 0,
      status: taskData.status || 'New',
      assignedDate: taskData.assignedDate || new Date().toISOString().substring(0, 10),
      createdAt: new Date().toISOString().substring(0, 10),
    };

    setTasks((prev) => {
      const updatedTasks = [newTask, ...prev];
      // Recalculate and update parent project progress and status
      if (newTask.projectId) {
        const projectTasks = updatedTasks.filter((t) => t.projectId === newTask.projectId);
        const completed = projectTasks.filter((t) => t.status === 'Done' || t.status === 'Completed').length;
        const calcProgress = Math.round((completed / projectTasks.length) * 100);
        setProjects((pList) =>
          pList.map((p) =>
            p.id === newTask.projectId
              ? {
                  ...p,
                  progress: calcProgress,
                  status: calcProgress === 100 ? 'Done' : p.status === 'New' && calcProgress > 0 ? 'In Progress' : p.status,
                  deliverablesCount: projectTasks.length,
                  completedDeliverablesCount: completed,
                }
              : p
          )
        );
      }
      return updatedTasks;
    });

    showToast('success', 'Task Assigned', `Assigned "${newTask.title}" to ${newTask.assigneeName}.`);
    addLog('Task Assigned', newTask.title, 'task', `Assigned to ${newTask.assigneeName} with priority ${newTask.priority}. Due: ${newTask.deadline}.`);

    // Create task notification for assignee
    if (newTask.assigneeId) {
      const notif: NotificationItem = {
        id: 'notif-' + Date.now(),
        recipientType: 'user',
        userId: newTask.assigneeId,
        senderId: currentUser?.id,
        senderName: currentUser ? currentUser.name : 'Team Lead',
        senderRole: currentUser ? currentUser.role : 'team_lead',
        title: 'New Task Assigned: ' + newTask.title,
        message: `You have been assigned to "${newTask.title}" for project "${newTask.projectTitle}". Due: ${newTask.deadline}.`,
        timestamp: 'Just now',
        read: false,
        type: 'task_assigned',
        priority: newTask.priority === 'Critical' ? 'critical' : 'high',
      };
      setNotifications((prev) => [notif, ...prev]);
    }
  };

  const updateTaskStatus = (taskId: string, status: TaskStatus) => {
    const targetTask = tasks.find((t) => t.id === taskId);
    if (!targetTask) return;

    setTasks((prev) => {
      const updated = prev.map((t) => (t.id === taskId ? { ...t, status } : t));

      // Recalculate parent project progress
      if (targetTask.projectId) {
        const projectTasks = updated.filter((t) => t.projectId === targetTask.projectId);
        const completed = projectTasks.filter((t) => t.status === 'Done' || t.status === 'Completed').length;
        const calcProgress = projectTasks.length > 0 ? Math.round((completed / projectTasks.length) * 100) : 0;
        const newProjStatus: ProjectStatus =
          calcProgress === 100 ? 'Done' : calcProgress > 0 ? 'In Progress' : 'New';

        setProjects((pList) =>
          pList.map((p) =>
            p.id === targetTask.projectId
              ? {
                  ...p,
                  progress: calcProgress,
                  status: newProjStatus,
                  deliverablesCount: projectTasks.length,
                  completedDeliverablesCount: completed,
                }
              : p
          )
        );
      }
      return updated;
    });

    // Notify Team Lead when Team Member updates task status
    if (targetTask.leadId && currentUser && currentUser.role === 'team_member') {
      const notif: NotificationItem = {
        id: 'notif-' + Date.now(),
        recipientType: 'user',
        userId: targetTask.leadId,
        senderId: currentUser.id,
        senderName: currentUser.name,
        senderRole: currentUser.role,
        title: `Task Status Updated: ${targetTask.title}`,
        message: `${currentUser.name} updated status to "${status}" on project "${targetTask.projectTitle}".`,
        timestamp: 'Just now',
        read: false,
        type: 'task_status_updated',
        priority: 'normal',
      };
      setNotifications((prev) => [notif, ...prev]);
    }

    showToast('info', 'Task Status Updated', `Status moved to "${status}".`);
    addLog('Task Status Shifted', targetTask.title, 'task', `Task updated to ${status}.`);
  };

  const submitProof = (taskId: string, proofData: {
    proofTitle: string;
    proofNotes: string;
    fileName: string;
    fileSize: string;
    externalLink?: string;
  }) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task || !currentUser) return;

    const proof: ProofSubmission = {
      id: 'proof-' + Date.now(),
      taskId,
      submittedBy: currentUser.id,
      submittedByName: currentUser.name,
      submittedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      proofTitle: proofData.proofTitle,
      proofNotes: proofData.proofNotes,
      fileName: proofData.fileName,
      fileSize: proofData.fileSize,
      externalLink: proofData.externalLink,
      status: 'Pending Review',
    };

    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              status: 'Proof Review',
              reviewStatus: 'Pending Review',
              proofSubmission: proof,
            }
          : t
      )
    );

    // Notify Team Lead
    const newNotif: NotificationItem = {
      id: 'notif-' + Date.now(),
      recipientType: 'user',
      userId: task.leadId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderRole: currentUser.role,
      title: 'New Proof Submitted for Review',
      message: `${currentUser.name} submitted deliverable proof for "${task.title}".`,
      timestamp: 'Just now',
      read: false,
      type: 'proof_review',
      linkTarget: proof.id,
      priority: 'high',
    };
    setNotifications((prev) => [newNotif, ...prev]);

    showToast('success', 'Proof Submitted', 'Deliverable proof queued for Team Lead review.');
    addLog('Proof Submitted', task.title, 'task', `Proof "${proof.proofTitle}" submitted by ${currentUser.name}.`);
  };

  const reviewProof = (taskId: string, decision: 'Approved' | 'Revision Requested', reviewNotes: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task || !task.proofSubmission || !currentUser) return;

    const updatedProof: ProofSubmission = {
      ...task.proofSubmission,
      status: decision,
      reviewedBy: currentUser.name,
      reviewedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      reviewNotes,
    };

    const newStatus: TaskStatus = decision === 'Approved' ? 'Done' : 'In Progress';

    setTasks((prev) => {
      const updated = prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              status: newStatus,
              reviewStatus: decision,
              proofSubmission: updatedProof,
            }
          : t
      );

      // Recalculate parent project progress
      if (task.projectId) {
        const projectTasks = updated.filter((t) => t.projectId === task.projectId);
        const completed = projectTasks.filter((t) => t.status === 'Done' || t.status === 'Completed').length;
        const calcProgress = projectTasks.length > 0 ? Math.round((completed / projectTasks.length) * 100) : 0;
        const newProjStatus: ProjectStatus =
          calcProgress === 100 ? 'Done' : calcProgress > 0 ? 'In Progress' : 'New';

        setProjects((pList) =>
          pList.map((p) =>
            p.id === task.projectId
              ? {
                  ...p,
                  progress: calcProgress,
                  status: newProjStatus,
                  deliverablesCount: projectTasks.length,
                  completedDeliverablesCount: completed,
                }
              : p
          )
        );
      }
      return updated;
    });

    // Send notification to the submitter
    const notifyMember: NotificationItem = {
      id: 'notif-' + Date.now(),
      recipientType: 'user',
      userId: task.assigneeId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderRole: currentUser.role,
      title: decision === 'Approved' ? 'Deliverable Proof Approved' : 'Proof Revision Requested',
      message: `${currentUser.name} ${decision === 'Approved' ? 'approved' : 'requested changes on'} "${task.title}". Notes: ${reviewNotes}`,
      timestamp: 'Just now',
      read: false,
      type: 'proof_review',
      priority: decision === 'Approved' ? 'normal' : 'high',
    };
    setNotifications((prev) => [notifyMember, ...prev]);

    showToast(
      decision === 'Approved' ? 'success' : 'info',
      `Proof ${decision}`,
      `Deliverable marked as ${decision}. Status updated to ${newStatus}.`
    );
    addLog(
      `Proof ${decision}`,
      task.title,
      'task',
      `Reviewed by ${currentUser.name}. Notes: ${reviewNotes}`
    );
  };


  // Admin User Governance
  const addUser = (
    userData: {
      name: string;
      loginId: string;
      role: UserRole;
      avatar?: string;
      email?: string;
      department?: string;
      phone?: string;
      title?: string;
    },
    initialPassword?: string
  ): { success: boolean; error?: string } => {
    const normalizedLoginId = userData.loginId?.trim().toLowerCase();
    if (!normalizedLoginId) {
      return { success: false, error: 'Login ID is required.' };
    }

    // Check duplicate Login ID
    const isDuplicate = users.some(
      (u) => u.loginId && u.loginId.toLowerCase() === normalizedLoginId
    );
    if (isDuplicate) {
      return {
        success: false,
        error: `Login ID "${userData.loginId}" is already taken. Please choose a unique Login ID.`,
      };
    }

    const initials =
      userData.name
        .split(' ')
        .map((n) => n[0])
        .filter(Boolean)
        .join('')
        .toUpperCase()
        .substring(0, 3) || 'USR';

    const avatarSvg =
      userData.avatar ||
      `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><rect width="64" height="64" rx="32" fill="%232563EB"/><text x="50%" y="54%" text-anchor="middle" dy=".3em" fill="white" font-family="sans-serif" font-size="18" font-weight="bold">${initials}</text></svg>`;

    const newUser: User = {
      id: 'user-' + Date.now(),
      name: userData.name.trim(),
      loginId: normalizedLoginId,
      role: userData.role,
      avatar: avatarSvg,
      lastActive: 'Never',
      status: 'active',
      emailVerified: true,
      ...(userData.email ? { email: userData.email } : {}),
      ...(userData.department ? { department: userData.department } : {}),
      ...(userData.title ? { title: userData.title } : {}),
      ...(userData.phone ? { phone: userData.phone } : {}),
    };
    setUsers((prev) => [newUser, ...prev]);

    if (initialPassword) {
      const passwordsStore = JSON.parse(localStorage.getItem(STORAGE_KEYS.PASSWORDS) || '{}');
      const hashedPassword = hashPassword(initialPassword);
      passwordsStore[normalizedLoginId] = hashedPassword;
      if (newUser.email) passwordsStore[newUser.email.toLowerCase()] = hashedPassword;
      localStorage.setItem(STORAGE_KEYS.PASSWORDS, JSON.stringify(passwordsStore));
    }

    showToast(
      'success',
      'User Provisioned',
      `Account provisioned for ${newUser.name} with role ${newUser.role.replace('_', ' ').toUpperCase()}.`
    );
    addLog(
      'User Provisioned',
      newUser.loginId,
      'security',
      `New organization user provisioned with role: ${newUser.role}.`
    );
    return { success: true };
  };

  const configureInitialAdmin = (adminData: {
    name: string;
    loginId: string;
    email: string;
    password: string;
    department?: string;
    title?: string;
  }): { success: boolean; error?: string } => {
    if (!adminData.name.trim() || !adminData.loginId.trim() || !adminData.email.trim() || !adminData.password.trim()) {
      return { success: false, error: 'All fields are required to securely configure the Administrator account.' };
    }

    const adminUser: User = {
      id: 'user-admin-' + Date.now(),
      name: adminData.name.trim(),
      loginId: adminData.loginId.trim().toLowerCase(),
      email: adminData.email.trim().toLowerCase(),
      role: 'admin',
      department: adminData.department?.trim() || 'Executive Administration',
      title: adminData.title?.trim() || 'System Administrator',
      phone: '+1 (555) 000-0001',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      status: 'active',
      lastActive: 'Just now',
      emailVerified: true,
    };

    setUsers((prev) => [adminUser, ...prev]);

    const passwordsStore = JSON.parse(localStorage.getItem(STORAGE_KEYS.PASSWORDS) || '{}');
    passwordsStore[adminUser.loginId.toLowerCase()] = adminData.password;
    if (adminUser.email) {
      passwordsStore[adminUser.email.toLowerCase()] = adminData.password;
    }
    localStorage.setItem(STORAGE_KEYS.PASSWORDS, JSON.stringify(passwordsStore));

    showToast('success', 'Administrator Configured', `Initial Administrator account ${adminUser.name} (${adminUser.loginId}) has been securely configured.`);
    addLog('Administrator Configured', adminUser.email || adminUser.loginId, 'security', 'Initial Administrator account provisioned.');
    return { success: true };
  };

  const updateUserRole = (userId: string, newRole: UserRole) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    );
    if (currentUser && currentUser.id === userId) {
      setCurrentUser((prev) => (prev ? { ...prev, role: newRole } : null));
    }
    showToast('success', 'User Role Updated', `Role changed to ${newRole.replace('_', ' ').toUpperCase()}.`);
    addLog('Role Modified', userId, 'security', `Role permissions updated.`);
  };

  const toggleUserStatus = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const nextStatus = u.status === 'active' ? 'inactive' : 'active';
          return { ...u, status: nextStatus };
        }
        return u;
      })
    );
    showToast('info', 'User Status Changed', 'Account activation status updated.');
  };

  const updateRolePermissions = (perms: RolePermissions[]) => {
    setRolePermissions(perms);
    showToast('success', 'Permissions Saved', 'System authorization matrix updated.');
    addLog('Permissions Updated', 'Global Role Matrix', 'security', 'Role access rights adjusted.');
  };

  const updateSystemConfig = (newConfig: Partial<SystemConfig>) => {
    setSystemConfig((prev) => ({ ...prev, ...newConfig }));
    showToast('success', 'System Config Saved', 'Enterprise settings saved successfully.');
    addLog('System Configuration Updated', 'Organization Policies', 'system', 'Updated platform configuration parameters.');
  };

  // ==========================================
  // PRODUCTIVITY & TO-DO METHODS
  // ==========================================
  const addTodo = (todoData: Omit<PersonalToDo, 'id' | 'createdAt' | 'userId'>) => {
    const newTodo: PersonalToDo = {
      ...todoData,
      id: 'todo-' + Date.now(),
      userId: currentUser?.id || 'guest',
      createdAt: new Date().toISOString(),
    };
    setTodos((prev) => [newTodo, ...prev]);
    showToast('success', 'Task Created', `Added "${newTodo.title}" to your personal to-do list.`);
  };

  const updateTodo = (id: string, updates: Partial<PersonalToDo>) => {
    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
    showToast('info', 'Task Updated', 'To-do details updated.');
  };

  const deleteTodo = (id: string) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
    showToast('info', 'Task Removed', 'To-do task removed from list.');
  };

  const toggleTodoComplete = (id: string) => {
    setTodos((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const isNowDone = t.status !== 'Completed';
          return {
            ...t,
            status: isNowDone ? 'Completed' : 'Pending',
            completedAt: isNowDone ? new Date().toISOString() : undefined,
          };
        }
        return t;
      })
    );
  };

  const addCalendarEvent = (eventData: Omit<CalendarEvent, 'id' | 'userId'>) => {
    const newEvent: CalendarEvent = {
      ...eventData,
      id: 'cal-' + Date.now(),
      userId: currentUser?.id || 'guest',
    };
    setCalendarEvents((prev) => [...prev, newEvent]);
    showToast('success', 'Event Scheduled', `Added "${newEvent.title}" to calendar.`);
  };

  const deleteCalendarEvent = (id: string) => {
    setCalendarEvents((prev) => prev.filter((e) => e.id !== id));
  };


  // ==========================================
  // MEETINGS MANAGEMENT METHODS
  // ==========================================
  const scheduleMeeting = (meetingData: Omit<Meeting, 'id' | 'createdAt' | 'organizerId' | 'organizerName' | 'organizerRole'>) => {
    const newMeeting: Meeting = {
      ...meetingData,
      id: 'meet-' + Date.now(),
      organizerId: currentUser?.id || 'unknown',
      organizerName: currentUser?.name || 'Organizer',
      organizerRole: currentUser?.role || 'manager',
      createdAt: new Date().toISOString(),
    };
    setMeetings((prev) => [newMeeting, ...prev]);

    // Notify all attendees
    meetingData.attendeeIds.forEach((uid) => {
      if (uid !== currentUser?.id) {
        sendNotification({
          recipientType: 'user',
          targetUserId: uid,
          title: `Meeting Scheduled: ${newMeeting.title}`,
          message: `Scheduled for ${newMeeting.date} at ${newMeeting.startTime}. Platform: ${newMeeting.platform}`,
          type: 'system',
        });
      }
    });

    showToast('success', 'Meeting Scheduled', `Scheduled "${newMeeting.title}" for ${newMeeting.date}.`);
    addLog('Meeting Scheduled', newMeeting.title, 'system', `Organized by ${currentUser?.name}.`);
  };

  const updateMeeting = (id: string, updates: Partial<Meeting>) => {
    setMeetings((prev) => prev.map((m) => (m.id === id ? { ...m, ...updates } : m)));
    showToast('info', 'Meeting Updated', 'Meeting details updated.');
  };

  const postponeMeeting = (id: string, newDate: string, newStartTime: string, newEndTime: string, reason: string) => {
    const target = meetings.find((m) => m.id === id);
    if (!target) return;

    const updated: Meeting = {
      ...target,
      date: newDate,
      startTime: newStartTime,
      endTime: newEndTime,
      status: 'Postponed',
      postponedFrom: {
        originalDate: target.date,
        originalStartTime: target.startTime,
        originalEndTime: target.endTime,
        reason,
        postponedAt: new Date().toISOString(),
        postponedBy: currentUser?.name || 'Organizer',
      },
    };

    setMeetings((prev) => prev.map((m) => (m.id === id ? updated : m)));

    // Notify attendees
    target.attendeeIds.forEach((uid) => {
      if (uid !== currentUser?.id) {
        sendNotification({
          recipientType: 'user',
          targetUserId: uid,
          title: `Meeting Postponed: ${target.title}`,
          message: `Rescheduled to ${newDate} at ${newStartTime}. Reason: ${reason}`,
          type: 'system',
          priority: 'high',
        });
      }
    });

    showToast('info', 'Meeting Postponed', `Rescheduled to ${newDate} at ${newStartTime}. Attendees notified.`);
    addLog('Meeting Postponed', target.title, 'system', `Postponed by ${currentUser?.name}. Reason: ${reason}`);
  };

  const cancelMeeting = (id: string, reason?: string) => {
    setMeetings((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status: 'Cancelled' } : m))
    );
    showToast('info', 'Meeting Cancelled', reason || 'Meeting cancelled.');
  };

  // ==========================================
  // CENTRALIZED TEAM PROFILES METHODS
  // ==========================================
  const updateTeamProfile = (profile: DetailedProfileData) => {
    setTeamProfiles((prev) => {
      const exists = prev.some((p) => p.name.toLowerCase() === profile.name.toLowerCase() || (p.id && p.id === profile.id));
      const updated = exists
        ? prev.map((p) => (p.name.toLowerCase() === profile.name.toLowerCase() || (p.id && p.id === profile.id) ? profile : p))
        : [...prev, profile];
      localStorage.setItem(STORAGE_KEYS.TEAM_PROFILES, JSON.stringify(updated));
      return updated;
    });
    addLog('Team Profile Updated', profile.name, 'security', `Administrator modified ${profile.name}'s profile.`);
  };

  const resetTeamProfiles = () => {
    setTeamProfiles(INITIAL_TEAM_PROFILES);
    localStorage.setItem(STORAGE_KEYS.TEAM_PROFILES, JSON.stringify(INITIAL_TEAM_PROFILES));
    showToast('success', 'Profiles Restored', 'Team member profiles reset to official initial data.');
  };

  // ==========================================
  // DYNAMIC DAILY MOTIVATION METHODS
  // ==========================================
  const currentUserMotivationPreferences: UserMotivationPreferences = currentUser
    ? (allUserMotivationPrefs[currentUser.id] || {
        userId: currentUser.id,
        enabled: true,
        language: 'both',
        preferredCategories: [],
        taskProgressMotivation: true,
        campaignParticipation: true,
        autoDailyRefresh: true,
        manualRefreshAllowed: true,
      })
    : {
        userId: 'guest',
        enabled: true,
        language: 'both',
        preferredCategories: [],
        taskProgressMotivation: true,
        campaignParticipation: true,
        autoDailyRefresh: true,
        manualRefreshAllowed: true,
      };

  const currentUserFavorites = userFavorites.filter((f) => f.userId === currentUser?.id);
  const currentUserHistory = userHistory.filter((h) => h.userId === currentUser?.id);

  const updateCurrentUserMotivationPreferences = (updates: Partial<UserMotivationPreferences>) => {
    if (!currentUser) return;
    setAllUserMotivationPrefs((prev) => {
      const current = prev[currentUser.id] || {
        userId: currentUser.id,
        enabled: true,
        language: 'both',
        preferredCategories: [],
        taskProgressMotivation: true,
        campaignParticipation: true,
        autoDailyRefresh: true,
        manualRefreshAllowed: true,
      };
      const updated = { ...current, ...updates, userId: currentUser.id };
      return { ...prev, [currentUser.id]: updated };
    });
    showToast('success', 'Preferences Updated', 'Motivation settings saved.');
  };

  const toggleFavoriteQuote = (entry: MotivationEntry, lang: 'en' | 'ta') => {
    if (!currentUser) return;
    const existing = userFavorites.find(
      (f) => f.userId === currentUser.id && f.quoteId === entry.id && f.language === lang
    );
    if (existing) {
      setUserFavorites((prev) => prev.filter((f) => f.id !== existing.id));
      showToast('info', 'Favorite Removed', 'Removed quote from your saved favorites.');
    } else {
      const newFav: UserMotivationFavorite = {
        id: 'fav-' + Date.now(),
        userId: currentUser.id,
        quoteId: entry.id,
        quote: entry.quote,
        quoteTamil: entry.quoteTamil,
        author: entry.author,
        authorTamil: entry.authorTamil,
        category: entry.category,
        language: lang,
        savedAt: new Date().toISOString(),
      };
      setUserFavorites((prev) => [newFav, ...prev]);
      showToast('success', 'Favorite Saved', 'Saved quote to your personal favorites.');
    }
  };

  const removeFavoriteQuote = (favoriteId: string) => {
    setUserFavorites((prev) => prev.filter((f) => f.id !== favoriteId));
    showToast('info', 'Favorite Removed', 'Quote removed from favorites.');
  };

  const isQuoteFavorited = (quoteId: string, lang: 'en' | 'ta'): boolean => {
    if (!currentUser) return false;
    return userFavorites.some(
      (f) => f.userId === currentUser.id && f.quoteId === quoteId && f.language === lang
    );
  };

  const recordMotivationView = (
    entry: MotivationEntry,
    lang: 'en' | 'ta',
    achievementContext?: string,
    weeklyThemeTitle?: string
  ) => {
    if (!currentUser) return;
    const now = new Date().toISOString();
    setUserHistory((prev) => {
      const recent = prev[0];
      if (
        recent &&
        recent.userId === currentUser.id &&
        recent.quoteId === entry.id &&
        recent.language === lang &&
        new Date(now).getTime() - new Date(recent.viewedAt).getTime() < 60000
      ) {
        return prev;
      }
      const newHistory: UserMotivationHistory = {
        id: 'hist-' + Date.now(),
        userId: currentUser.id,
        quoteId: entry.id,
        quote: entry.quote,
        quoteTamil: entry.quoteTamil,
        author: entry.author,
        authorTamil: entry.authorTamil,
        category: entry.category,
        language: lang,
        weeklyThemeTitle,
        taskAchievementContext: achievementContext,
        viewedAt: now,
      };
      return [newHistory, ...prev.slice(0, 99)];
    });
  };

  const clearUserHistory = () => {
    if (!currentUser) return;
    setUserHistory((prev) => prev.filter((h) => h.userId !== currentUser.id));
    showToast('info', 'History Cleared', 'Your viewing history has been reset.');
  };

  // Admin Motivation Management
  const addMotivationQuote = (quoteData: Omit<MotivationEntry, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newQuote: MotivationEntry = {
      ...quoteData,
      id: 'quote-custom-' + Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: currentUser?.name || 'Administrator',
    };
    setMotivationQuotes((prev) => [newQuote, ...prev]);
    showToast('success', 'Quote Added', 'New motivation entry published.');
    addLog('Motivation Quote Added', newQuote.category, 'system', `Added quote: "${newQuote.quote.substring(0, 30)}..."`);
  };

  const updateMotivationQuote = (id: string, updates: Partial<MotivationEntry>) => {
    setMotivationQuotes((prev) =>
      prev.map((q) =>
        q.id === id ? { ...q, ...updates, updatedAt: new Date().toISOString() } : q
      )
    );
    showToast('success', 'Quote Updated', 'Motivation entry changes saved.');
    addLog('Motivation Quote Updated', id, 'system', 'Updated motivation entry.');
  };

  const deleteMotivationQuote = (id: string) => {
    setMotivationQuotes((prev) => prev.filter((q) => q.id !== id));
    showToast('info', 'Quote Deleted', 'Motivation entry removed.');
    addLog('Motivation Quote Deleted', id, 'system', 'Removed motivation entry.');
  };

  const addWeeklyTheme = (themeData: Omit<WeeklyTheme, 'id' | 'createdAt'>) => {
    const newTheme: WeeklyTheme = {
      ...themeData,
      id: 'theme-' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    if (newTheme.isActive) {
      setWeeklyThemes((prev) => [newTheme, ...prev.map((t) => ({ ...t, isActive: false }))]);
    } else {
      setWeeklyThemes((prev) => [...prev, newTheme]);
    }
    showToast('success', 'Weekly Theme Added', `Theme "${newTheme.title}" created.`);
    addLog('Weekly Theme Created', newTheme.title, 'system', 'Created new weekly motivation theme.');
  };

  const updateWeeklyTheme = (id: string, updates: Partial<WeeklyTheme>) => {
    setWeeklyThemes((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          return { ...t, ...updates };
        }
        if (updates.isActive) {
          return { ...t, isActive: false };
        }
        return t;
      })
    );
    showToast('success', 'Weekly Theme Updated', 'Weekly theme details modified.');
  };

  const deleteWeeklyTheme = (id: string) => {
    setWeeklyThemes((prev) => prev.filter((t) => t.id !== id));
    showToast('info', 'Weekly Theme Removed', 'Theme deleted.');
  };

  const addMotivationCampaign = (
    campaignData: Omit<MotivationCampaign, 'id' | 'reachCount' | 'viewCount' | 'favoriteCount' | 'createdAt' | 'updatedAt' | 'createdBy'>
  ) => {
    const newCamp: MotivationCampaign = {
      ...campaignData,
      id: 'camp-' + Date.now(),
      reachCount: users.filter((u) => campaignData.targetRoles.includes(u.role)).length,
      viewCount: 0,
      favoriteCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: currentUser?.name || 'Administrator',
    };
    setMotivationCampaigns((prev) => [newCamp, ...prev]);
    showToast('success', 'Campaign Scheduled', `Campaign "${newCamp.name}" published.`);
    addLog('Motivation Campaign Created', newCamp.name, 'system', `Scheduled campaign for roles: ${newCamp.targetRoles.join(', ')}`);
  };

  const updateMotivationCampaign = (id: string, updates: Partial<MotivationCampaign>) => {
    setMotivationCampaigns((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c
      )
    );
    showToast('success', 'Campaign Updated', 'Campaign settings saved.');
  };

  const deleteMotivationCampaign = (id: string) => {
    setMotivationCampaigns((prev) => prev.filter((c) => c.id !== id));
    showToast('info', 'Campaign Deleted', 'Campaign removed.');
  };

  const addMotivationCategory = (cat: MotivationCategoryItem) => {
    setMotivationCategories((prev) => {
      if (prev.some((c) => c.name.toLowerCase() === cat.name.toLowerCase())) {
        return prev;
      }
      return [...prev, { ...cat, isCustom: true }];
    });
    showToast('success', 'Category Created', `Category "${cat.name}" added.`);
  };

  const importMotivationQuotes = (quotesList: MotivationEntry[]): { success: boolean; count: number } => {
    if (!Array.isArray(quotesList) || quotesList.length === 0) {
      return { success: false, count: 0 };
    }
    setMotivationQuotes((prev) => {
      const existingIds = new Set(prev.map((q) => q.id));
      const incoming = quotesList.map((q) => ({
        ...q,
        id: existingIds.has(q.id) ? `quote-imp-${Date.now()}-${Math.random().toString(36).substr(2, 5)}` : q.id,
      }));
      return [...incoming, ...prev];
    });
    showToast('success', 'Bulk Import Completed', `Imported ${quotesList.length} quotes.`);
    addLog('Motivation Quotes Imported', `${quotesList.length} entries`, 'system', 'Bulk JSON import completed.');
    return { success: true, count: quotesList.length };
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        users,
        clients,
        projects,
        tasks,
        teams,
        activityLogs,
        notifications,
        userNotifications,
        rolePermissions,
        systemConfig,
        theme,
        toasts,
        currentView,
        setCurrentView,
        login,
        signup,
        verifyEmail,
        requestPasswordReset,
        confirmPasswordReset,
        logout,
        switchDemoUser,
        toggleTheme,
        dismissToast,
        showToast,
        canAccessTab,
        hasRole,
        notificationPreferences,
        updateNotificationPreferences,
        sendNotification,
        markNotificationRead,
        markNotificationUnread,
        markAllNotificationsRead,
        deleteNotification,
        addClient,
        updateClient,
        deleteClient,
        createProject,
        addProject,
        updateProject,
        getProjectProgress,
        createTeam,
        updateTeam,
        getMemberWorkload,
        addTask,
        updateTaskStatus,
        submitProof,
        reviewProof,
        addUser,
        configureInitialAdmin,
        updateUserRole,
        toggleUserStatus,
        updateRolePermissions,
        updateSystemConfig,
        todos,
        calendarEvents,
        addTodo,
        updateTodo,
        deleteTodo,
        toggleTodoComplete,
        addCalendarEvent,
        deleteCalendarEvent,
        meetings,
        scheduleMeeting,
        updateMeeting,
        postponeMeeting,
        cancelMeeting,
        teamProfiles,
        updateTeamProfile,
        resetTeamProfiles,
        // Motivation System
        motivationQuotes,
        weeklyThemes,
        motivationCampaigns,
        motivationCategories,
        currentUserMotivationPreferences,
        currentUserFavorites,
        currentUserHistory,
        updateCurrentUserMotivationPreferences,
        toggleFavoriteQuote,
        removeFavoriteQuote,
        isQuoteFavorited,
        recordMotivationView,
        clearUserHistory,
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
      }}

    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
