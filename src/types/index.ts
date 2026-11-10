export type UserRole = 'admin' | 'manager' | 'team_lead' | 'team_member';

export interface User {
  id: string;
  name: string;
  loginId: string;
  role: UserRole;
  avatar: string;
  status: 'active' | 'inactive';
  lastActive: string;
  email?: string;
  department?: string;
  phone?: string;
  title?: string;
  emailVerified?: boolean;
}

export interface DemoAccountCredential {
  userId: string;
  name: string;
  loginId: string;
  email: string;
  role: UserRole;
  demoPassword: string;
  title: string;
  department: string;
}

export type ClientStatus = 'Active' | 'Onboarding' | 'At Risk' | 'Completed';
export type ClientTier = 'Enterprise' | 'Growth' | 'Strategic' | 'Standard';

export interface ClientContact {
  name: string;
  email: string;
  phone: string;
  role: string;
}

export interface Client {
  id: string;
  name: string;
  industry: string;
  tier: ClientTier;
  contractValue: number;
  status: ClientStatus;
  healthScore: number; // 0-100
  primaryContact: ClientContact;
  assignedManagerId: string;
  assignedManagerName: string;
  assignedLeadId: string;
  assignedLeadName: string;
  activeProjectsCount: number;
  startDate: string;
  renewalDate: string;
  slaAdherence: number; // percentage
  notes: string;
}

export type ProjectStatus = 'New' | 'In Progress' | 'Done' | 'Active' | 'Completed' | 'In Planning' | 'Review' | 'Delayed';
export type PriorityLevel = 'Critical' | 'High' | 'Medium' | 'Low';

export interface Project {
  id: string;
  title: string;
  clientName: string;
  companyName?: string;
  purpose: string; // Free-text input accepting any text
  description?: string;
  startDate: string; // YYYY-MM-DD
  deadline: string; // YYYY-MM-DD
  duration: number; // Automatically calculated duration in days
  leadId: string; // Assigned Team Lead
  leadName: string;
  managerId: string;
  managerName?: string;
  status: ProjectStatus; // 'New' | 'In Progress' | 'Done'
  progress: number; // Calculated dynamically from actual task statuses (0-100)
  clientId?: string;
  budget?: number;
  spent?: number;
  deliverablesCount?: number;
  completedDeliverablesCount?: number;
  priority?: PriorityLevel;
  createdAt?: string;
}

export type TaskStatus = 'New' | 'In Progress' | 'Done' | 'To Do' | 'Proof Review' | 'Completed';

export interface ProofSubmission {
  id: string;
  taskId: string;
  submittedBy: string;
  submittedByName: string;
  submittedAt: string;
  proofTitle: string;
  proofNotes: string;
  fileName: string;
  fileSize: string;
  externalLink?: string;
  status: 'Pending Review' | 'Approved' | 'Revision Requested';
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNotes?: string;
}

export interface Task {
  id: string;
  title: string; // Task Name
  description: string; // Task Description
  projectId: string;
  projectTitle: string; // Project Name
  clientId?: string;
  clientName?: string;
  workComponent?: string; // Work Component (e.g. Frontend Development, Backend Development, Database Development, UI/UX Design, Testing & QA, Documentation, etc.)
  assigneeId: string;
  assigneeName: string;
  assigneeAvatar?: string;
  leadId: string;
  leadName?: string;
  status: TaskStatus; // 'New' | 'In Progress' | 'Done' | 'Proof Review'
  priority: PriorityLevel;
  assignedDate: string; // Assigned Date YYYY-MM-DD
  deadline: string; // Due Date YYYY-MM-DD
  estimatedHours: number;
  loggedHours: number;
  proofSubmission?: ProofSubmission;
  reviewStatus?: 'Not Submitted' | 'Pending Review' | 'Approved' | 'Revision Requested';
  tags?: string[];
  createdAt: string;
}

export interface Team {
  id: string;
  name: string;
  leadId: string;
  leadName: string;
  memberIds: string[]; // Flexible team size: e.g. 10, 5, 2, or any custom count
  description?: string;
  createdAt: string;
}

export interface MemberWorkloadInfo {
  memberId: string;
  memberName: string;
  activeTasksCount: number;
  completedTasksCount: number;
  upcomingDeadlinesCount: number;
  overdueTasksCount: number;
  availabilityStatus: 'Available' | 'Moderate' | 'Busy' | 'Unavailable';
  availabilityLabel: string;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  actorName: string;
  actorLoginId?: string;
  actorRole: UserRole;
  action: string;
  target: string;
  category: 'auth' | 'client' | 'project' | 'task' | 'security' | 'system';
  details: string;
  projectId?: string;
  projectName?: string;
  taskId?: string;
  taskTitle?: string;
  previousValue?: string;
  updatedValue?: string;
}

export type NotificationCategory =
  | 'project'
  | 'task'
  | 'meeting'
  | 'system';

export type NotificationType =
  // Project
  | 'new_project_assigned'
  | 'project_updated'
  | 'project_deadline'
  | 'project_completed'
  | 'project_status_changed'
  | 'client_update'
  // Task
  | 'task_assigned'
  | 'task_reassigned'
  | 'task_status_updated'
  | 'task_completed'
  | 'task_proof_submitted'
  | 'task_proof_approved'
  | 'task_proof_rejected'
  | 'task_deadline'
  | 'task_overdue'
  | 'proof_review'
  | 'deadline_approaching'
  | 'deadline'
  | 'assignment'
  // Meeting
  | 'meeting_scheduled'
  | 'meeting_invite'
  | 'meeting_rescheduled'
  | 'meeting_postponed'
  | 'meeting_cancelled'
  | 'meeting_reminder'
  // System / Administration
  | 'system_announcement'
  | 'system_broadcast'
  | 'account_created'
  | 'account_updated'
  | 'role_changed'
  | 'security_alert'
  | 'sla_alert'
  | 'system';

export interface NotificationItem {
  id: string;
  userId?: string; // specific user ID or undefined if role/all
  recipientType: 'user' | 'role' | 'all';
  targetRole?: UserRole;
  senderId?: string;
  senderName: string;
  senderRole: UserRole;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: NotificationType;
  category?: NotificationCategory;
  linkTarget?: string;
  projectId?: string;
  taskId?: string;
  meetingId?: string;
  priority?: 'normal' | 'high' | 'critical';
}

export interface NotificationPreferences {
  allEnabled: boolean;
  projectNotifications: boolean;
  taskNotifications: boolean;
  deadlineReminders: boolean;
  meetingNotifications: boolean;
  systemAnnouncements: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
}


export interface RolePermissions {
  role: UserRole;
  label: string;
  description: string;
  permissions: {
    clientManagement: 'full' | 'edit' | 'view' | 'none';
    teamManagement: 'full' | 'edit' | 'view' | 'none';
    projectOversight: 'full' | 'edit' | 'view' | 'none';
    taskAssignment: 'full' | 'edit' | 'assigned_only' | 'none';
    proofReview: 'approve_all' | 'approve_team' | 'submit_only' | 'none';
    reportsAnalytics: 'full' | 'department' | 'project' | 'none';
    systemSettings: 'full' | 'none';
  };
}

export interface SystemConfig {
  organizationName: string;
  defaultTimezone: string;
  sessionTimeoutMinutes: number;
  requireTwoFactor: boolean;
  automaticSLAReminders: boolean;
  slaWarningThresholdHours: number;
  allowSelfProofApproval: boolean;
  maintenanceMode: boolean;
}

// Authentication & Registration Flow Data Structures
export interface SignUpFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  department: string;
  title: string;
  requestedRole: UserRole;
  organizationName?: string;
  agreeToTerms: boolean;
}

export interface VerificationState {
  email: string;
  code: string;
  expiresAt: number;
  verified: boolean;
}

export interface PasswordResetRequest {
  email: string;
  token: string;
  expiresAt: number;
}

// ==========================================
// COMMON WORKSPACE & PERSONAL PRODUCTIVITY
// ==========================================
export type ToDoPriority = 'Low' | 'Medium' | 'High' | 'Urgent';
export type ToDoStatus = 'Pending' | 'In Progress' | 'Completed' | 'Overdue';

export interface PersonalToDo {
  id: string;
  userId: string;
  title: string;
  description?: string;
  priority: ToDoPriority;
  status: ToDoStatus;
  dueDate: string; // YYYY-MM-DD
  createdAt: string;
  completedAt?: string;
}

export interface CalendarEvent {
  id: string;
  userId: string;
  title: string;
  description?: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
  type: 'personal' | 'project' | 'meeting';
  referenceId?: string;
  priority?: ToDoPriority;
}


// ==========================================
// ADVANCED MEETING MANAGEMENT SYSTEM
// ==========================================
export type MeetingPlatform = 'Google Meet' | 'Microsoft Teams' | 'Zoom' | 'In-Person';
export type MeetingStatus = 'Scheduled' | 'In Progress' | 'Completed' | 'Postponed' | 'Cancelled';

export interface MeetingPostponedInfo {
  originalDate: string;
  originalStartTime: string;
  originalEndTime: string;
  reason: string;
  postponedAt: string;
  postponedBy: string;
}

export interface Meeting {
  id: string;
  title: string;
  description: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  platform: MeetingPlatform;
  meetingUrl?: string;
  organizerId: string;
  organizerName: string;
  organizerRole: UserRole;
  attendeeIds: string[];
  attendeeNames: string[];
  projectId?: string;
  projectName?: string;
  workspaceId?: string;
  agenda: string[];
  status: MeetingStatus;
  postponedFrom?: MeetingPostponedInfo;
  createdAt: string;
}

// ==========================================
// CENTRALIZED TEAM PROFILES DATA
// ==========================================
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

// ==========================================
// ADVANCED DYNAMIC DAILY MOTIVATION SYSTEM
// ==========================================
export type MotivationLanguage = 'en' | 'ta' | 'both';

export interface MotivationEntry {
  id: string;
  quote: string; // English quote / reflection
  quoteTamil?: string; // Tamil verified translation / authentic Tamil text
  author?: string; // Author name if verified
  authorTamil?: string; // Author name in Tamil
  isVerifiedAuthor: boolean; // Author verified
  applicableRoles: UserRole[]; // ['admin', 'manager', 'team_lead', 'team_member']
  category: string; // e.g. "Leadership", "Productivity", "Consistency"
  weeklyThemeId?: string; // Associated weekly theme ID
  language: MotivationLanguage;
  isOriginal: boolean; // Original thought vs verified quote
  published: boolean;
  publishDate?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

export interface WeeklyTheme {
  id: string;
  weekNumber: number; // 1 - 52
  title: string;
  titleTamil?: string;
  description: string;
  descriptionTamil?: string;
  applicableRoles?: UserRole[];
  isActive: boolean;
  startDate?: string;
  endDate?: string;
  createdAt: string;
}

export interface MotivationCampaign {
  id: string;
  name: string;
  description: string;
  targetRoles: UserRole[];
  targetUserIds?: string[];
  language: 'en' | 'ta' | 'all';
  weeklyThemeId?: string;
  quoteIds: string[];
  scheduleType: 'once' | 'daily' | 'weekly' | 'monthly';
  startDate: string;
  endDate?: string;
  status: 'draft' | 'scheduled' | 'active' | 'paused' | 'completed' | 'cancelled';
  reachCount: number;
  viewCount: number;
  favoriteCount: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface UserMotivationPreferences {
  userId: string;
  enabled: boolean;
  language: 'en' | 'ta' | 'both';
  preferredCategories: string[];
  preferredThemeId?: string;
  taskProgressMotivation: boolean;
  campaignParticipation: boolean;
  autoDailyRefresh: boolean;
  manualRefreshAllowed: boolean;
}

export interface UserMotivationFavorite {
  id: string;
  userId: string;
  quoteId: string;
  quote: string;
  quoteTamil?: string;
  author?: string;
  authorTamil?: string;
  category: string;
  language: 'en' | 'ta';
  savedAt: string;
}

export interface UserMotivationHistory {
  id: string;
  userId: string;
  quoteId: string;
  quote: string;
  quoteTamil?: string;
  author?: string;
  authorTamil?: string;
  category: string;
  language: 'en' | 'ta';
  weeklyThemeTitle?: string;
  taskAchievementContext?: string;
  viewedAt: string;
}

export interface CampaignDeliveryRecord {
  id: string;
  campaignId: string;
  campaignName: string;
  userId: string;
  userRole: UserRole;
  deliveredAt: string;
  quoteId: string;
  language: 'en' | 'ta';
}

export interface MotivationCategoryItem {
  name: string;
  nameTamil?: string;
  applicableRoles: UserRole[];
  isCustom?: boolean;
}


