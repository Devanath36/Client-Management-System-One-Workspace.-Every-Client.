import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  TeamMemberProfileModal,
  DetailedProfileData,
} from '../components/team/TeamMemberProfileModal';
import { INITIAL_TEAM_PROFILES } from '../data/mockData';
import devanathPhoto from '../assets/images/devanath_profile.jpg';
import shivaPhoto from '../assets/images/shiva_profile.jpg';
import bhuvaneshPhoto from '../assets/images/bhuvanesh_profile.jpg';
import heroCommandUniverseBg from '../assets/images/hero_command_universe_1794147879933.jpg';
import {
  Users,
  Briefcase,
  CheckSquare,
  BarChart3,
  Bell,
  ShieldCheck,
  Building,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  CheckCircle2,
  Lock,
  Layers,
  Sparkles,
  Zap,
  Clock,
  Shield,
  FileCheck2,
  ExternalLink,
  Globe,
  Mail,
  Linkedin,
  Github,
  Eye,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { setCurrentView, teamProfiles, updateTeamProfile, currentUser } = useApp();

  // FAQ Accordion State (single open accordion item or null)
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Detailed Team Member Profile Modal State
  const [selectedMember, setSelectedMember] = useState<DetailedProfileData | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const features = [
    {
      id: 1,
      icon: Building,
      title: 'Client Management',
      description: 'Store and organize client information.',
      badge: 'Directory',
    },
    {
      id: 2,
      icon: Users,
      title: 'Team Management',
      description: 'Organize team members and responsibilities.',
      badge: 'Allocation',
    },
    {
      id: 3,
      icon: Briefcase,
      title: 'Project Management',
      description: 'Create projects and monitor their progress.',
      badge: 'Milestones',
    },
    {
      id: 4,
      icon: CheckSquare,
      title: 'Task Management',
      description: 'Assign tasks, update statuses, and track completion.',
      badge: 'Execution',
    },
    {
      id: 5,
      icon: BarChart3,
      title: 'Reports & Analytics',
      description: 'Review task completion and project progress.',
      badge: 'Insights',
    },
    {
      id: 6,
      icon: Bell,
      title: 'Notifications',
      description: 'Receive task assignments, updates, and deadline reminders.',
      badge: 'Alerts',
    },
    {
      id: 7,
      icon: ShieldCheck,
      title: 'Role-Based Access Control',
      description: "Restrict pages, actions, and data according to each user's assigned role.",
      badge: 'Security',
    },
  ];

  const workflowSteps = [
    {
      step: 1,
      role: 'Manager',
      title: 'Step 1: Create Clients & Projects',
      description: 'The Manager creates client records and projects.',
      icon: Building,
    },
    {
      step: 2,
      role: 'Manager',
      title: 'Step 2: Organize Teams & Work',
      description: 'The Manager organizes teams and assigns work.',
      icon: Users,
    },
    {
      step: 3,
      role: 'Team Lead',
      title: 'Step 3: Distribute Tasks',
      description: 'The Team Lead distributes tasks to team members.',
      icon: CheckSquare,
    },
    {
      step: 4,
      role: 'Team Member',
      title: 'Step 4: Execute & Deliver Work',
      description: 'Team Members complete assigned tasks and report milestone progress.',
      icon: CheckCircle2,
    },
    {
      step: 5,
      role: 'Team Lead',
      title: 'Step 5: Review & Monitor Progress',
      description: 'The Team Lead reviews progress and monitors task delivery.',
      icon: ShieldCheck,
    },
    {
      step: 6,
      role: 'Manager',
      title: 'Step 6: Overall Evaluation & Reporting',
      description: 'The Manager reviews overall project performance and reports.',
      icon: BarChart3,
    },
  ];

  const objectives = [
    'Keep client information organized in one place.',
    'Make project assignments and responsibilities clear.',
    'Help teams track task progress and completion.',
    'Reduce confusion about deadlines and assigned work.',
    'Improve coordination through notifications and updates.',
    'Help Managers understand project progress through reports.',
    'Provide appropriate access to users according to their roles.',
  ];

  const userRoles = [
    {
      title: 'Administrator',
      roleKey: 'admin',
      description:
        'Manages user accounts, role permissions, system settings, and overall system activity.',
      badge: 'System Admin',
      accent: 'from-indigo-600 to-blue-700',
      tagColor: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
      icon: Shield,
    },
    {
      title: 'Manager',
      roleKey: 'manager',
      description:
        'Manages client records, projects, teams, task assignments, reports, and overall progress.',
      badge: 'Operations',
      accent: 'from-blue-600 to-cyan-600',
      tagColor: 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
      icon: Briefcase,
    },
    {
      title: 'Team Lead',
      roleKey: 'team_lead',
      description:
        'Assigns tasks to team members, monitors progress, and tracks deadlines.',
      badge: 'Delivery Lead',
      accent: 'from-sky-600 to-blue-600',
      tagColor: 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800',
      icon: Users,
    },
    {
      title: 'Team Member',
      roleKey: 'team_member',
      description:
        'Views assigned tasks, updates task status, and checks notifications.',
      badge: 'Execution',
      accent: 'from-teal-600 to-emerald-600',
      tagColor: 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800',
      icon: CheckSquare,
    },
  ];

  // Active verified team profiles synchronized from database / AppContext
  const activeTeamProfiles: DetailedProfileData[] =
    teamProfiles && teamProfiles.length > 0 ? teamProfiles : INITIAL_TEAM_PROFILES;

  const handleSaveProfile = (updatedProfile: DetailedProfileData) => {
    updateTeamProfile(updatedProfile);
    setSelectedMember(updatedProfile);
  };

  const faqs = [
    {
      question: 'What is the Client Management System?',
      answer:
        'It is a web application for organizing client information, projects, teams, tasks, and progress.',
    },
    {
      question: 'Who can use the system?',
      answer: 'Authorized Administrators, Managers, Team Leads, and Team Members.',
    },
    {
      question: 'What does the Administrator do?',
      answer:
        'The Administrator manages users, permissions, system settings, and overall activity.',
    },
    {
      question: 'How are tasks assigned?',
      answer:
        'Managers organize projects and teams, while Team Leads distribute tasks to team members according to their responsibilities.',
    },
    {
      question: 'Can team members update task progress?',
      answer:
        'Yes. Team Members can view their assigned tasks and update their status according to their permissions.',
    },
    {
      question: 'What is the purpose of notifications?',
      answer:
        'Notifications inform users about relevant task assignments, approaching deadlines, and project updates.',
    },
    {
      question: 'How does role-based access work?',
      answer: 'Each user receives access according to their assigned role and permissions.',
    },
    {
      question: 'Can everyone view all client and project information?',
      answer:
        "No. Access should be restricted according to the user's permissions and the system's security rules.",
    },
  ];

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors selection:bg-blue-600 selection:text-white">
      {/* ========================================================= */}
      {/* 1. HERO SECTION WITH 3D BUSINESS ECOSYSTEM BACKGROUND      */}
      {/* ========================================================= */}
      <section
        id="home"
        className="relative w-full overflow-hidden isolate min-h-[620px] sm:min-h-[680px] lg:min-h-[720px] flex items-center pt-16 pb-20 md:pt-20 md:pb-28 border-b border-slate-800/80 bg-slate-950"
      >
        {/* Full-width 3D Digital Business Ecosystem Background Image */}
        <div className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden select-none">
          <img
            src={heroCommandUniverseBg}
            alt="3D Digital Business Ecosystem - Client Management System"
            className="w-full h-full object-cover object-center transform-gpu scale-100 will-change-transform"
            loading="eager"
            decoding="async"
          />
          {/* Deep navy subtle dark overlay for foreground text contrast and readability */}
          <div className="absolute inset-0 bg-slate-950/70" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-slate-950/75" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/60 to-slate-950/35" />
          {/* Subtle cyan and electric-blue ambient glow */}
          <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
            {/* Left Column: Hero Content */}
            <div className="lg:col-span-7 space-y-6 text-left">
              {/* Product Badge */}
              <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-blue-950/70 border border-blue-700/60 text-xs font-semibold text-blue-300 shadow-md shadow-blue-900/30 backdrop-blur-md">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </span>
                <span className="text-white font-semibold">Client Management System</span>
                <span className="text-slate-500">|</span>
                <span className="font-medium text-blue-200">
                  One Workspace. Every Client.
                </span>
              </div>

              {/* Main Heading as explicitly specified */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.1] drop-shadow-sm">
                Client Management System
              </h1>

              {/* Tagline */}
              <p className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-300 bg-clip-text text-transparent">
                One Workspace. Every Client.
              </p>

              {/* Subtitle Description */}
              <p className="text-base sm:text-lg text-slate-200 max-w-xl leading-relaxed drop-shadow-xs">
                Organize client records, assign tasks, coordinate teams, and monitor project progress
                through one centralized system.
              </p>

              {/* Call-to-Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => setCurrentView('login')}
                  className="px-6 py-3.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 via-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all flex items-center gap-2 cursor-pointer group"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={() => scrollToSection('about')}
                  className="px-6 py-3.5 text-sm font-semibold text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 hover:border-slate-600 rounded-xl transition-colors cursor-pointer backdrop-blur-md"
                >
                  Learn More
                </button>
                <button
                  onClick={() => setCurrentView('3d-universe')}
                  className="px-5 py-3.5 text-sm font-semibold text-sky-300 hover:text-white bg-slate-900/90 hover:bg-slate-800 border border-sky-500/40 hover:border-sky-400 rounded-xl transition-all cursor-pointer backdrop-blur-md flex items-center gap-2 shadow-lg shadow-sky-950/50 group"
                  title="Explore Interactive 3D Command Universe"
                >
                  <Sparkles className="w-4 h-4 text-sky-400 group-hover:rotate-12 transition-transform" />
                  <span>3D Universe</span>
                </button>
              </div>

              {/* Quick Feature Pillars Strip */}
              <div className="pt-6 border-t border-slate-700/70 grid grid-cols-3 gap-3 text-left">
                <div className="space-y-1">
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-blue-400" />
                    <span>4 Isolated Roles</span>
                  </div>
                  <p className="text-[11px] text-slate-300">RBAC Gated Portals</p>
                </div>
                <div className="space-y-1">
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Deliverable Tasks</span>
                  </div>
                  <p className="text-[11px] text-slate-300">Milestone Progress</p>
                </div>
                <div className="space-y-1">
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-sky-400" />
                    <span>Project Tracking</span>
                  </div>
                  <p className="text-[11px] text-slate-300">Live Client SLAs</p>
                </div>
              </div>
            </div>

            {/* Right Column: Abstract 3D Geometric Vector Composition */}
            <div className="lg:col-span-5 relative flex items-center justify-center">
              {/* Background Geometric Grid / Ring */}
              <div className="relative w-full max-w-[440px] aspect-square flex items-center justify-center">
                {/* Outer decorative ring */}
                <div className="absolute inset-0 rounded-3xl border border-blue-500/20 dark:border-blue-500/30 rotate-6 transition-transform" />
                <div className="absolute inset-4 rounded-3xl border border-dashed border-indigo-500/30 dark:border-indigo-500/40 -rotate-3 transition-transform" />

                {/* Central Glassmorphism Isometric Mockup Container */}
                <div className="relative z-10 w-[92%] glass-panel rounded-2xl p-5 shadow-2xl shadow-blue-900/10 dark:shadow-black/50 border border-slate-200/80 dark:border-slate-700/80 space-y-4">
                  {/* Mock Window Top Bar */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-rose-400" />
                      <div className="w-3 h-3 rounded-full bg-amber-400" />
                      <div className="w-3 h-3 rounded-full bg-emerald-400" />
                    </div>
                    <div className="text-[10px] font-mono text-slate-400 font-semibold uppercase tracking-wider">
                      Client Workspace · Active
                    </div>
                  </div>

                  {/* Mock Card: Client Account Status */}
                  <div className="p-3.5 rounded-xl bg-gradient-to-br from-blue-500/10 via-indigo-500/5 to-transparent border border-blue-500/20 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        Enterprise Client Record
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300">
                        SLA 99.8%
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Unified dashboard for client milestones, task distributions, and delivery progress.
                    </p>
                    <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 h-1.5 rounded-full w-4/5" />
                    </div>
                  </div>

                  {/* Mock Deliverable Task Box */}
                  <div className="p-3 rounded-xl bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white text-xs">
                          Task Deliverable Status
                        </div>
                        <div className="text-[10px] text-slate-400">Team Lead Supervision</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950 rounded">
                      Completed
                    </span>
                  </div>

                  {/* 4 Role Avatars Representation */}
                  <div className="pt-1 flex items-center justify-between text-[11px] text-slate-500">
                    <span>Authorized Workspaces:</span>
                    <div className="flex -space-x-1.5 overflow-hidden">
                      <span className="inline-block w-6 h-6 rounded-full ring-2 ring-white dark:ring-slate-900 bg-indigo-600 text-white text-[9px] font-bold text-center leading-6">
                        A
                      </span>
                      <span className="inline-block w-6 h-6 rounded-full ring-2 ring-white dark:ring-slate-900 bg-blue-600 text-white text-[9px] font-bold text-center leading-6">
                        M
                      </span>
                      <span className="inline-block w-6 h-6 rounded-full ring-2 ring-white dark:ring-slate-900 bg-sky-500 text-white text-[9px] font-bold text-center leading-6">
                        TL
                      </span>
                      <span className="inline-block w-6 h-6 rounded-full ring-2 ring-white dark:ring-slate-900 bg-teal-500 text-white text-[9px] font-bold text-center leading-6">
                        TM
                      </span>
                    </div>
                  </div>
                </div>

                {/* Floating Micro-Card 1 (Subtle float animation) */}
                <div className="absolute -top-3 -right-3 z-20 p-2.5 rounded-xl glass-panel shadow-lg border border-slate-200/80 dark:border-slate-700/80 animate-float-slow hidden sm:flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-600 flex items-center justify-center">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-slate-900 dark:text-white">Active SLA</div>
                    <div className="text-[9px] text-emerald-600 font-semibold font-mono">100% On-Track</div>
                  </div>
                </div>

                {/* Floating Micro-Card 2 */}
                <div className="absolute -bottom-4 -left-4 z-20 p-2.5 rounded-xl glass-panel shadow-lg border border-slate-200/80 dark:border-slate-700/80 animate-float-reverse hidden sm:flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-600 flex items-center justify-center">
                    <Lock className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-slate-900 dark:text-white">Role Gated</div>
                    <div className="text-[9px] text-slate-400">Strict RBAC</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Summary Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-16 max-w-5xl mx-auto text-left">
            <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs hover:border-blue-400 dark:hover:border-blue-600 transition-colors">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
                Centralized Data
              </span>
              <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                Client Records & SLAs
              </p>
            </div>
            <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs hover:border-blue-400 dark:hover:border-blue-600 transition-colors">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
                Team Allocation
              </span>
              <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                Capacity & Workload
              </p>
            </div>
            <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs hover:border-blue-400 dark:hover:border-blue-600 transition-colors">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
                Deliverable Tracking
              </span>
              <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                Milestone Sign-Offs
              </p>
            </div>
            <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs hover:border-blue-400 dark:hover:border-blue-600 transition-colors">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
                Role Governance
              </span>
              <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                4 Isolated Roles
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 2. ABOUT US SECTION                                       */}
      {/* ========================================================= */}
      {/* ========================================================= */}
      {/* 2. ABOUT US SECTION                                       */}
      {/* ========================================================= */}
      <section
        id="about"
        className="scroll-mt-16 sm:scroll-mt-20 py-10 sm:py-14 border-b border-slate-200/80 dark:border-slate-800/80 bg-slate-100/40 dark:bg-slate-900/40 transition-colors"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          {/* Section Headers */}
          <div className="space-y-2 text-center sm:text-left">
            <h1 className="text-xs sm:text-sm font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest font-mono">
              ABOUT OUR CLIENT MANAGEMENT SYSTEM
            </h1>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              One Workspace. Every Client.
            </h2>
          </div>

          {/* Centered Professional Content Container */}
          <div className="glass-panel p-6 sm:p-8 lg:p-10 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm text-sm sm:text-[15px] text-slate-600 dark:text-slate-300 leading-relaxed bg-white/95 dark:bg-slate-900/95 backdrop-blur-md">
            <div className="space-y-4">
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                <Building className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
                <span>About the Project</span>
              </h3>
              <p>
                The Client Management System is a centralized web-based application developed to simplify client information management, organize project activities, and improve coordination among team members. It provides a unified digital workspace where organizations can manage client records, project assignments, task responsibilities, deadlines, and work progress in an organized and efficient manner.
              </p>
              <p>
                In many organizations, managing multiple clients and projects involves handling different records, coordinating employees, assigning responsibilities, and monitoring ongoing activities. When these operations are managed through separate platforms or manual processes, it can become difficult to maintain accurate information, track responsibilities, and monitor project progress. Our Client Management System addresses these challenges by bringing essential client and project management activities together within a single platform.
              </p>
              <p>
                The system provides a structured environment for managing the complete project workflow, starting from project creation and team assignment to task execution and progress monitoring. It helps organizations maintain better visibility into their activities while ensuring that responsibilities are clearly distributed among the people involved.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 3. OUR OBJECTIVES SECTION                                 */}
      {/* ========================================================= */}
      <section
        id="objectives"
        className="scroll-mt-16 sm:scroll-mt-20 py-20 border-b border-slate-200/80 dark:border-slate-800/80 transition-colors"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="space-y-2 text-center sm:text-left">
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider font-mono">
              Goals & Purpose
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              Our Objectives
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              The main objective of the Client Management System is to make client and project
              management easier, more organized, and easier to track.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <ul className="space-y-3.5">
              {objectives.map((obj, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300"
                >
                  <div className="p-1 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-bold shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <span className="leading-relaxed">{obj}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 4. CORE FEATURES SECTION                                   */}
      {/* ========================================================= */}
      <section
        id="features"
        className="scroll-mt-16 sm:scroll-mt-20 py-20 border-b border-slate-200/80 dark:border-slate-800/80 transition-colors"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider font-mono">
              Core Capabilities
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              Features
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Key operational modules provided by the Client Management System.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feat) => {
              const Icon = feat.icon;
              return (
                <div
                  key={feat.id}
                  className="group p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs hover:shadow-md hover:border-blue-500/50 dark:hover:border-blue-500/50 transition-all duration-300 flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform duration-300">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        {feat.badge}
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {feat.title}
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        {feat.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 5. HOW IT WORKS SECTION                                   */}
      {/* ========================================================= */}
      <section
        id="how-it-works"
        className="scroll-mt-16 sm:scroll-mt-20 py-20 border-b border-slate-200/80 dark:border-slate-800/80 bg-slate-100/40 dark:bg-slate-900/40 transition-colors"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider font-mono">
              Workflow
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              How It Works
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              The operational workflow of the Client Management System in six simple steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workflowSteps.map((ws) => {
              const Icon = ws.icon;
              return (
                <div
                  key={ws.step}
                  className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs hover:border-blue-400 dark:hover:border-blue-600 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-bold font-mono">
                        {ws.step}
                      </div>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900 font-mono">
                        {ws.role}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {ws.title}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      {ws.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 6. USER ROLES SECTION                                     */}
      {/* ========================================================= */}
      <section
        id="user-roles"
        className="scroll-mt-16 sm:scroll-mt-20 py-20 border-b border-slate-200/80 dark:border-slate-800/80 bg-slate-100/40 dark:bg-slate-900/40 transition-colors"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider font-mono">
              Access Governance
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              User Roles
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Clear responsibilities assigned to each user role.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {userRoles.map((role) => {
              const Icon = role.icon;
              return (
                <div
                  key={role.title}
                  className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4 flex flex-col justify-between hover:border-blue-400 dark:hover:border-blue-600 transition-all"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${role.accent} text-white flex items-center justify-center shadow-xs`}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-slate-900 dark:text-white">
                            {role.title}
                          </h3>
                          <span className={`text-[10px] font-semibold font-mono px-2 py-0.5 rounded border ${role.tagColor}`}>
                            {role.badge}
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      {role.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">Portal Ready</span>
                    <button
                      onClick={() => setCurrentView('login')}
                      className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>Sign in as {role.title}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 7. OUR TEAM SECTION — THE MINDS BEHIND THE INTELLIGENCE   */}
      {/* ========================================================= */}
      <section
        id="our-team"
        className="scroll-mt-16 sm:scroll-mt-20 py-24 border-b border-slate-200/80 dark:border-slate-800/80 relative overflow-hidden isolate bg-slate-50/50 dark:bg-[#070c18]"
      >
        {/* Subtle Ambient Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-6xl h-96 bg-blue-600/5 dark:bg-blue-500/10 blur-3xl pointer-events-none z-0 rounded-full" />

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100/80 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/80 text-xs font-bold uppercase tracking-wider font-mono">
              <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Project Contributors & Leadership</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              THE MINDS BEHIND THE INTELLIGENCE
            </h2>
            <p className="text-sm sm:text-base font-medium text-slate-600 dark:text-slate-300">
              One Workspace. Every Client.
            </p>
          </div>

          {/* Team Members Grid - Responsive: Desktop 3 cols (1 row), Tablet 2 cols, Mobile 1 col */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 items-stretch">
            {activeTeamProfiles.filter(Boolean).map((member) => {
              // Strict 1-to-1 photo mapping for the 3 team section members
              const memberName = member.name || '';
              const memberNameLower = memberName.toLowerCase();
              const photoSrc =
                member.id === 'shiva' || memberNameLower.includes('shiva')
                  ? shivaPhoto
                  : member.id === 'devanath' || memberNameLower.includes('devanath')
                  ? devanathPhoto
                  : member.id === 'bhuvanesh' || memberNameLower.includes('bhuvanesh')
                  ? bhuvaneshPhoto
                  : member.photoUrl;

              // Extract actual contributions without empty placeholders
              const contributionsList =
                Array.isArray(member.contributions) && member.contributions.length > 0
                  ? member.contributions
                  : [];

              return (
                <div
                  key={member.id || member.name || Math.random()}
                  onClick={() => {
                    setSelectedMember(member);
                    setIsProfileModalOpen(true);
                  }}
                  className="group relative rounded-3xl border border-slate-200 dark:border-slate-800/90 bg-white dark:bg-slate-900/95 p-5 sm:p-6 shadow-sm hover:shadow-2xl hover:shadow-blue-950/20 dark:hover:shadow-blue-950/50 hover:border-blue-500/60 dark:hover:border-blue-500/50 transition-all duration-300 flex flex-col justify-between cursor-pointer md:last:col-span-2 md:last:max-w-md md:last:mx-auto lg:last:col-span-1 lg:last:max-w-none lg:last:mx-0 w-full"
                >
                  <div className="space-y-4">
                    {/* A. Profile Photograph - Consistent Portrait Aspect Ratio */}
                    <div className="relative w-full aspect-[4/5] rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 shadow-md">
                      {photoSrc ? (
                        <img
                          src={photoSrc}
                          alt={member.name || 'Team Member'}
                          className="w-full h-full object-cover object-top transition-transform duration-500 ease-out group-hover:scale-105 select-none"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-tr from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 font-bold text-3xl font-mono text-slate-700 dark:text-slate-200">
                          {member.initials || 'CMS'}
                        </div>
                      )}

                      {/* Verified Contributor Badge Overlay */}
                      <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-slate-900/85 backdrop-blur-md border border-white/20 text-white text-[10px] font-semibold flex items-center gap-1 shadow-md">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Verified</span>
                      </div>

                      {/* Subtle Vignette at Bottom */}
                      <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
                    </div>

                    {/* B. Full Name & C. Professional Title */}
                    <div className="space-y-1">
                      <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug">
                        {member.name}
                      </h3>
                      <p className="text-xs sm:text-[13px] font-semibold text-blue-600 dark:text-blue-400 leading-tight">
                        {member.title}
                      </p>
                    </div>

                    {/* D. Short Biography - Real Database Content without blank container */}
                    {member.bio && (
                      <div className="p-3.5 rounded-xl bg-slate-50/90 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800 text-xs sm:text-[13px] leading-relaxed text-slate-600 dark:text-slate-300">
                        <p className="line-clamp-3" title={member.bio}>
                          {member.bio}
                        </p>
                      </div>
                    )}

                    {/* E. Project Contributions - Compact readable chips */}
                    {contributionsList.length > 0 && (
                      <div className="space-y-1.5 pt-0.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block font-mono">
                          Project Contributions
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {contributionsList.slice(0, 3).map((contrib, idx) => {
                            const rawTitle = typeof contrib === 'string' ? contrib : (contrib?.title || '');
                            const label = rawTitle.replace(/^\d+\.\s*/, '') || rawTitle;
                            return (
                              <span
                                key={idx}
                                className="inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-medium bg-blue-50/90 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/70 dark:border-blue-800/60 leading-tight"
                              >
                                {label}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* F. Profile Actions & Buttons */}
                  <div className="mt-5 pt-3.5 border-t border-slate-100 dark:border-slate-800/80 space-y-2.5">
                    {/* Prominent Visit Portfolio button when configured */}
                    {member.portfolio?.url && (
                      <a
                        href={member.portfolio.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="w-full py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs flex items-center justify-center gap-1.5 transition-all group/port cursor-pointer"
                        aria-label={`Visit ${member.name}'s Portfolio`}
                      >
                        <Globe className="w-3.5 h-3.5" />
                        <span>{member.portfolio.buttonText || 'Visit Portfolio'}</span>
                        <ExternalLink className="w-3 h-3 group-hover/port:translate-x-0.5 group-hover/port:-translate-y-0.5 transition-transform" />
                      </a>
                    )}

                    {/* View Profile Action & Social Icons */}
                    <div className="flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedMember(member);
                          setIsProfileModalOpen(true);
                        }}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 py-1.5 px-3 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors cursor-pointer group/view"
                        aria-label={`View detailed profile of ${member.name}`}
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Profile</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover/view:translate-x-0.5 transition-transform" />
                      </button>

                      {/* Social Contact Icons */}
                      <div className="flex items-center gap-1">
                        {member.contact?.email && (
                          <a
                            href={`mailto:${member.contact.email}`}
                            onClick={(e) => e.stopPropagation()}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title={`Email ${member.name}`}
                            aria-label={`Email ${member.name}`}
                          >
                            <Mail className="w-4 h-4" />
                          </a>
                        )}
                        {member.contact?.linkedin && (
                          <a
                            href={member.contact.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title={`LinkedIn Profile of ${member.name}`}
                            aria-label={`LinkedIn Profile of ${member.name}`}
                          >
                            <Linkedin className="w-4 h-4" />
                          </a>
                        )}
                        {member.contact?.github && (
                          <a
                            href={member.contact.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title={`GitHub Profile of ${member.name}`}
                            aria-label={`GitHub Profile of ${member.name}`}
                          >
                            <Github className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Detailed Team Member Profile Modal with onSave support */}
      <TeamMemberProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        member={selectedMember}
        onSave={handleSaveProfile}
        allowEditing={Boolean(currentUser && currentUser.role === 'admin')}
      />

      {/* ========================================================= */}
      {/* 8. FREQUENTLY ASKED QUESTIONS (FAQ)                       */}
      {/* ========================================================= */}
      <section
        id="faq"
        className="scroll-mt-16 sm:scroll-mt-20 py-20 border-b border-slate-200/80 dark:border-slate-800/80 bg-slate-100/40 dark:bg-slate-900/40 transition-colors"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider font-mono">
              Questions & Answers
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              Frequently Asked Questions (FAQ)
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Common questions about using the Client Management System.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={faq.question}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xs transition-all"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full px-6 py-4.5 text-left flex items-center justify-between gap-4 transition-colors cursor-pointer"
                    aria-expanded={isOpen}
                  >
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">
                      {faq.question}
                    </span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-blue-600 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-5 pt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 9. PRIVACY POLICY SECTION                                 */}
      {/* ========================================================= */}
      <section
        id="privacy"
        className="scroll-mt-16 sm:scroll-mt-20 py-20 border-b border-slate-200/80 dark:border-slate-800/80 transition-colors"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="space-y-1">
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider font-mono">
              Legal & Data
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              Privacy Policy
            </h2>
            <p className="text-xs text-slate-400 font-mono">Standard Enterprise Compliance</p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-600 dark:text-slate-300 space-y-5 leading-relaxed shadow-xs">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white mb-1">
                1. Data Processing Scope
              </h3>
              <p>
                The Client Management System may process account details, client records, project
                information, and task updates strictly to provide its features and
                support team coordination.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-slate-900 dark:text-white mb-1">
                2. Access Restrictions & Role-Based Isolation
              </h3>
              <p>
                Access to client records, project budgets, and personal tasks is restricted according to
                each user's assigned role and organizational permissions. Data is only accessible to
                users with a legitimate business responsibility.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-slate-900 dark:text-white mb-1">
                3. Confidentiality & Appropriate Data Handling
              </h3>
              <p>
                All client and project records must be handled with appropriate care. Users are
                responsible for maintaining the confidentiality of information viewed through the system.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-slate-900 dark:text-white mb-1">
                4. Policy Review Before Production Deployment
              </h3>
              <p>
                This policy represents the baseline data handling practices of the application. It can be
                reviewed, edited, and customized by organization administrators prior to production
                deployment.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 10. TERMS & CONDITIONS SECTION                            */}
      {/* ========================================================= */}
      <section
        id="terms"
        className="scroll-mt-16 sm:scroll-mt-20 py-20 border-b border-slate-200/80 dark:border-slate-800/80 bg-slate-100/40 dark:bg-slate-900/40 transition-colors"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="space-y-1">
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              Agreement
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              Terms & Conditions
            </h2>
            <p className="text-xs text-slate-400 font-mono">Standard Operating Agreement</p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-600 dark:text-slate-300 space-y-5 leading-relaxed shadow-xs">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white mb-1">
                1. Authorized Use of the Application
              </h3>
              <p>
                Access to the Client Management System is granted solely for legitimate business
                operations, client management, project delivery, and task management. Unauthorized
                access attempts or misuse of user credentials are strictly prohibited.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-slate-900 dark:text-white mb-1">
                2. User Responsibilities When Updating Records
              </h3>
              <p>
                Users are responsible for ensuring that all client details, milestone progress updates,
                logged hours, and deliverable notes are accurate, timely, and complete.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-slate-900 dark:text-white mb-1">
                3. Appropriate Handling of Confidential Information
              </h3>
              <p>
                Users must safeguard proprietary client information and adhere to organization guidelines
                regarding data sharing and external exports.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-slate-900 dark:text-white mb-1">
                4. Role-Based Access and Permitted Activities
              </h3>
              <p>
                Users may only perform activities and access views permitted by their designated system
                role (Administrator, Manager, Team Lead, or Team Member). Bypassing role boundaries is
                prohibited.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-slate-900 dark:text-white mb-1">
                5. Responsible Use of Platform and Deliverables
              </h3>
              <p>
                All documents, records, and files updated within the system must be authentic, free of
                harmful software, and directly relevant to the assigned work.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-slate-900 dark:text-white mb-1">
                6. System Availability and Future Updates
              </h3>
              <p>
                The system and its features are subject to ongoing improvements and periodic updates.
                Administrators may configure or update operational settings as organizational needs evolve.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
