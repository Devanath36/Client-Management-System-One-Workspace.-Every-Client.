import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  TeamMemberProfileModal,
  DetailedProfileData,
} from '../components/team/TeamMemberProfileModal';
import { INITIAL_TEAM_PROFILES } from '../data/mockData';
import devanathPhoto from '../assets/images/devanath_profile.jpg';
import shivaPhoto from '../assets/images/shiva_profile.png';
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
  Layers,
  Sparkles,
  Zap,
  Clock,
  Shield,
  ExternalLink,
  Globe,
  Mail,
  Linkedin,
  Github,
  Eye,
  Printer,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { setCurrentView, teamProfiles, updateTeamProfile, currentUser } = useApp();

  // Print About the Project view to PDF
  const handlePrintAbout = () => {
    document.body.classList.add('print-about-only');
    window.print();
    setTimeout(() => {
      document.body.classList.remove('print-about-only');
    }, 1000);
  };

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
      accent: 'from-[#E50914] to-[#99060e]',
      tagColor: 'bg-[#E50914]/20 text-[#E50914] border-[#E50914]/40',
      icon: Shield,
    },
    {
      title: 'Manager',
      roleKey: 'manager',
      description:
        'Manages client records, projects, teams, task assignments, reports, and overall progress.',
      badge: 'Operations',
      accent: 'from-[#FF7900] to-[#e06a00]',
      tagColor: 'bg-[#FF7900]/20 text-[#FF7900] border-[#FF7900]/40',
      icon: Briefcase,
    },
    {
      title: 'Team Lead',
      roleKey: 'team_lead',
      description:
        'Assigns tasks to team members, monitors progress, and tracks deadlines.',
      badge: 'Delivery Lead',
      accent: 'from-[#FFC928] to-[#e6b217]',
      tagColor: 'bg-[#FFC928]/20 text-[#FFC928] border-[#FFC928]/40',
      icon: Users,
    },
    {
      title: 'Team Member',
      roleKey: 'team_member',
      description:
        'Views assigned tasks, updates task status, and checks notifications.',
      badge: 'Execution',
      accent: 'from-white to-[#A3A3A3] text-black',
      tagColor: 'bg-white/10 text-white border-[#333333]',
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
    <div className="bg-[#101010] text-white transition-colors selection:bg-[#E50914] selection:text-white">
      {/* ========================================================= */}
      {/* 1. HERO SECTION WITH MATTE BLACK / RED HIGHLIGHT OVERLAY  */}
      {/* ========================================================= */}
      <section
        id="home"
        className="relative w-full overflow-hidden isolate min-h-[620px] sm:min-h-[680px] lg:min-h-[720px] flex items-center pt-16 pb-20 md:pt-20 md:pb-28 border-b border-[#333333] bg-[#101010]"
      >
        {/* Full-width 3D Background with Dark Overlay */}
        <div className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden select-none">
          <img
            src={heroCommandUniverseBg}
            alt="3D Digital Business Ecosystem - Client Management System"
            className="w-full h-full object-cover object-center transform-gpu scale-100 will-change-transform opacity-35"
            loading="eager"
            decoding="async"
          />
          {/* Subtle dark overlay for foreground text contrast */}
          <div className="absolute inset-0 bg-[#101010]/80" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#101010] via-[#101010]/60 to-[#101010]/90" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#101010] via-[#101010]/70 to-transparent" />
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
            {/* Left Column: Hero Content */}
            <div className="lg:col-span-7 space-y-6 text-left">
              {/* Product Badge */}
              <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#171717] border border-[#333333] text-xs font-semibold text-[#FFC928] shadow-md backdrop-blur-md">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E50914] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#E50914]"></span>
                </span>
                <span className="text-white font-bold">Client Management System</span>
                <span className="text-[#333333]">|</span>
                <span className="font-medium text-[#A3A3A3]">
                  One Workspace. Every Client.
                </span>
              </div>

              {/* Main Heading */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.1]">
                Client Management System
              </h1>

              {/* Tagline */}
              <p className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-[#E50914] via-[#FF7900] to-[#FFC928] bg-clip-text text-transparent">
                One Workspace. Every Client.
              </p>

              {/* Subtitle Description */}
              <p className="text-base sm:text-lg text-[#A3A3A3] max-w-xl leading-relaxed">
                Organize client records, assign tasks, coordinate teams, and monitor project progress
                through one centralized system.
              </p>

              {/* Call-to-Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => setCurrentView('login')}
                  className="px-6 py-3.5 text-sm font-bold text-white bg-[#E50914] hover:bg-[#c40812] rounded-xl shadow-lg shadow-[#E50914]/30 transition-all flex items-center gap-2 cursor-pointer group active:scale-98"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={() => scrollToSection('about')}
                  className="px-6 py-3.5 text-sm font-semibold text-white bg-[#171717] hover:bg-[#222222] border border-[#333333] hover:border-[#666666] rounded-xl transition-colors cursor-pointer"
                >
                  Learn More
                </button>
                <button
                  onClick={() => setCurrentView('3d-universe')}
                  className="px-5 py-3.5 text-sm font-semibold text-[#FFC928] hover:text-white bg-[#171717] hover:bg-[#222222] border border-[#333333] hover:border-[#FFC928]/60 rounded-xl transition-all cursor-pointer flex items-center gap-2 shadow-lg group"
                  title="Explore Interactive 3D Command Universe"
                >
                  <Sparkles className="w-4 h-4 text-[#FFC928] group-hover:rotate-12 transition-transform" />
                  <span>3D Universe</span>
                </button>
              </div>

              {/* Quick Feature Pillars Strip */}
              <div className="pt-6 border-t border-[#333333] grid grid-cols-3 gap-3 text-left">
                <div className="space-y-1">
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-[#E50914]" />
                    <span>4 Isolated Roles</span>
                  </div>
                  <p className="text-[11px] text-[#A3A3A3]">RBAC Gated Portals</p>
                </div>
                <div className="space-y-1">
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#FF7900]" />
                    <span>Deliverable Tasks</span>
                  </div>
                  <p className="text-[11px] text-[#A3A3A3]">Milestone Progress</p>
                </div>
                <div className="space-y-1">
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-[#FFC928]" />
                    <span>Project Tracking</span>
                  </div>
                  <p className="text-[11px] text-[#A3A3A3]">Live Client SLAs</p>
                </div>
              </div>
            </div>

            {/* Right Column: Abstract Geometric Composition */}
            <div className="lg:col-span-5 relative flex items-center justify-center">
              <div className="relative w-full max-w-[440px] aspect-square flex items-center justify-center">
                {/* Central Glassmorphism Isometric Mockup Container */}
                <div className="relative z-10 w-[95%] bg-[#171717] rounded-3xl p-5 shadow-2xl border border-[#333333] space-y-4">
                  {/* Mock Window Top Bar */}
                  <div className="flex items-center justify-between pb-3 border-b border-[#333333]">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-[#E50914]" />
                      <div className="w-3 h-3 rounded-full bg-[#FF7900]" />
                      <div className="w-3 h-3 rounded-full bg-[#FFC928]" />
                    </div>
                    <div className="text-[10px] font-mono text-[#A3A3A3] font-semibold uppercase tracking-wider">
                      Client Workspace · Active
                    </div>
                  </div>

                  {/* Mock Card: Client Account Status */}
                  <div className="p-3.5 rounded-2xl bg-[#101010] border border-[#333333] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">
                        Enterprise Client Record
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#FFC928]/20 text-[#FFC928] border border-[#FFC928]/40">
                        SLA 99.8%
                      </span>
                    </div>
                    <p className="text-[11px] text-[#A3A3A3]">
                      Unified dashboard for client milestones, task distributions, and delivery progress.
                    </p>
                    <div className="w-full bg-[#171717] rounded-full h-1.5 overflow-hidden border border-[#333333]">
                      <div className="bg-[#E50914] h-1.5 rounded-full w-4/5" />
                    </div>
                  </div>

                  {/* Mock Deliverable Task Box */}
                  <div className="p-3 rounded-2xl bg-[#101010] border border-[#333333] flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-[#E50914]/20 text-[#E50914] border border-[#E50914]/30 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-white text-xs">
                          Task Deliverable Status
                        </div>
                        <div className="text-[10px] text-[#A3A3A3]">Team Lead Supervision</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-[#FFC928] px-2 py-0.5 bg-[#FFC928]/15 border border-[#FFC928]/30 rounded-lg">
                      Completed
                    </span>
                  </div>

                  {/* 4 Role Avatars Representation */}
                  <div className="pt-1 flex items-center justify-between text-[11px] text-[#A3A3A3]">
                    <span>Authorized Workspaces:</span>
                    <div className="flex -space-x-1.5 overflow-hidden">
                      <span className="inline-block w-6 h-6 rounded-full ring-2 ring-[#101010] bg-[#E50914] text-white text-[9px] font-bold text-center leading-6">
                        A
                      </span>
                      <span className="inline-block w-6 h-6 rounded-full ring-2 ring-[#101010] bg-[#FF7900] text-white text-[9px] font-bold text-center leading-6">
                        M
                      </span>
                      <span className="inline-block w-6 h-6 rounded-full ring-2 ring-[#101010] bg-[#FFC928] text-black text-[9px] font-bold text-center leading-6">
                        TL
                      </span>
                      <span className="inline-block w-6 h-6 rounded-full ring-2 ring-[#101010] bg-white text-black text-[9px] font-bold text-center leading-6">
                        TM
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Overview Metric Strip */}
          <div className="mt-14 pt-8 border-t border-[#333333] grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-[#171717] rounded-2xl border border-[#333333] hover:border-[#E50914]/60 transition-colors">
              <div className="text-xl sm:text-2xl font-black text-[#FFC928] font-mono">100%</div>
              <div className="text-xs text-[#A3A3A3] mt-0.5">Role-Isolated Security</div>
            </div>
            <div className="p-4 bg-[#171717] rounded-2xl border border-[#333333] hover:border-[#E50914]/60 transition-colors">
              <div className="text-xl sm:text-2xl font-black text-[#E50914] font-mono">19 Accounts</div>
              <div className="text-xs text-[#A3A3A3] mt-0.5">Preconfigured Portals</div>
            </div>
            <div className="p-4 bg-[#171717] rounded-2xl border border-[#333333] hover:border-[#E50914]/60 transition-colors">
              <div className="text-xl sm:text-2xl font-black text-[#FF7900] font-mono">Real-Time</div>
              <div className="text-xs text-[#A3A3A3] mt-0.5">Milestone SLA Tracking</div>
            </div>
            <div className="p-4 bg-[#171717] rounded-2xl border border-[#333333] hover:border-[#E50914]/60 transition-colors">
              <div className="text-xl sm:text-2xl font-black text-white font-mono">100% Unified</div>
              <div className="text-xs text-[#A3A3A3] mt-0.5">One Workspace. Every Client.</div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 2. ABOUT US SECTION                                       */}
      {/* ========================================================= */}
      <section
        id="about"
        className="scroll-mt-16 sm:scroll-mt-20 py-12 sm:py-16 border-b border-[#333333] bg-[#141414] transition-colors"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          {/* Section Headers */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5 text-center sm:text-left">
              <h1 className="text-xs sm:text-sm font-bold text-[#E50914] uppercase tracking-widest font-mono">
                ABOUT OUR CLIENT MANAGEMENT SYSTEM
              </h1>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
                One Workspace. Every Client.
              </h2>
            </div>

            <button
              type="button"
              onClick={handlePrintAbout}
              className="no-print self-center sm:self-auto inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#171717] hover:bg-[#222222] border border-[#333333] rounded-xl shadow-2xs transition-all cursor-pointer shrink-0"
              title="Export About the Project view to a printer-friendly PDF"
            >
              <Printer className="w-4 h-4 text-[#FFC928]" />
              <span>Print / Export PDF</span>
            </button>
          </div>

          {/* Centered Professional Content Container */}
          <div className="p-6 sm:p-8 lg:p-10 rounded-3xl border border-[#333333] shadow-sm text-sm sm:text-[15px] text-[#A3A3A3] leading-relaxed bg-[#171717]">
            <div className="space-y-4">
              <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2 pb-2 border-b border-[#333333]">
                <Building className="w-5 h-5 text-[#E50914] shrink-0" />
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
        className="scroll-mt-16 sm:scroll-mt-20 py-20 border-b border-[#333333] bg-[#101010] transition-colors"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="space-y-2 text-center sm:text-left">
            <span className="text-xs font-bold text-[#FF7900] uppercase tracking-wider font-mono">
              Goals & Purpose
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Our Objectives
            </h2>
            <p className="text-sm text-[#A3A3A3] leading-relaxed">
              The main objective of the Client Management System is to make client and project
              management easier, more organized, and easier to track.
            </p>
          </div>

          <div className="bg-[#171717] p-6 sm:p-8 rounded-3xl border border-[#333333] shadow-xs">
            <ul className="space-y-3.5">
              {objectives.map((obj, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-3 text-xs sm:text-sm text-[#A3A3A3]"
                >
                  <div className="p-1 rounded-lg bg-[#101010] text-[#FFC928] border border-[#333333] font-bold shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4 text-[#FFC928]" />
                  </div>
                  <span className="leading-relaxed text-white">{obj}</span>
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
        className="scroll-mt-16 sm:scroll-mt-20 py-20 border-b border-[#333333] bg-[#141414] transition-colors"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold text-[#E50914] uppercase tracking-wider font-mono">
              Core Capabilities
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Features
            </h2>
            <p className="text-xs sm:text-sm text-[#A3A3A3]">
              Key operational modules provided by the Client Management System.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feat) => {
              const Icon = feat.icon;
              return (
                <div
                  key={feat.id}
                  className="group p-6 rounded-2xl border border-[#333333] bg-[#171717] shadow-xs hover:border-[#E50914] transition-all duration-300 flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#E50914] to-[#FF7900] text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform duration-300">
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-[#101010] text-[#FFC928] border border-[#333333]">
                        {feat.badge}
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <h3 className="text-base font-bold text-white group-hover:text-[#E50914] transition-colors">
                        {feat.title}
                      </h3>
                      <p className="text-xs text-[#A3A3A3] leading-relaxed">
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
        className="scroll-mt-16 sm:scroll-mt-20 py-20 border-b border-[#333333] bg-[#101010] transition-colors"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold text-[#FFC928] uppercase tracking-wider font-mono">
              Workflow
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              How It Works
            </h2>
            <p className="text-xs sm:text-sm text-[#A3A3A3]">
              The operational workflow of the Client Management System in six simple steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workflowSteps.map((ws) => (
              <div
                key={ws.step}
                className="p-6 rounded-2xl border border-[#333333] bg-[#171717] shadow-xs hover:border-[#FF7900] transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-8 h-8 rounded-lg bg-[#E50914] text-white flex items-center justify-center text-xs font-bold font-mono">
                      {ws.step}
                    </div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#101010] text-[#FFC928] border border-[#333333] font-mono">
                      {ws.role}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white">
                    {ws.title}
                  </h3>
                  <p className="text-xs text-[#A3A3A3] leading-relaxed">
                    {ws.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 6. USER ROLES SECTION                                     */}
      {/* ========================================================= */}
      <section
        id="user-roles"
        className="scroll-mt-16 sm:scroll-mt-20 py-20 border-b border-[#333333] bg-[#141414] transition-colors"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold text-[#E50914] uppercase tracking-wider font-mono">
              Access Governance
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              User Roles
            </h2>
            <p className="text-xs sm:text-sm text-[#A3A3A3]">
              Clear responsibilities assigned to each user role.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {userRoles.map((role) => {
              const Icon = role.icon;
              return (
                <div
                  key={role.title}
                  className="p-6 rounded-3xl border border-[#333333] bg-[#171717] shadow-xs space-y-4 flex flex-col justify-between hover:border-[#E50914] transition-all"
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
                          <h3 className="text-base font-bold text-white">
                            {role.title}
                          </h3>
                          <span className={`text-[10px] font-semibold font-mono px-2 py-0.5 rounded border ${role.tagColor}`}>
                            {role.badge}
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-[#A3A3A3] leading-relaxed">
                      {role.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[#333333] flex items-center justify-between">
                    <span className="text-[11px] text-[#A3A3A3]">Portal Ready</span>
                    <button
                      onClick={() => setCurrentView('login')}
                      className="text-xs font-bold text-[#E50914] hover:text-[#FF7900] flex items-center gap-1 cursor-pointer"
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
      {/* 7. OUR TEAM SECTION                                       */}
      {/* ========================================================= */}
      <section
        id="our-team"
        className="scroll-mt-16 sm:scroll-mt-20 py-24 border-b border-[#333333] relative overflow-hidden isolate bg-[#101010]"
      >
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#171717] text-[#FFC928] border border-[#333333] text-xs font-bold uppercase tracking-wider font-mono">
              <Sparkles className="w-3.5 h-3.5 text-[#FFC928]" />
              <span>Project Contributors & Leadership</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
              THE MINDS BEHIND THE INTELLIGENCE
            </h2>
            <p className="text-sm sm:text-base font-medium text-[#A3A3A3]">
              One Workspace. Every Client.
            </p>
          </div>

          {/* Team Members Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 items-stretch">
            {activeTeamProfiles.filter(Boolean).map((member) => {
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

              const contributionsList =
                Array.isArray(member.contributions) && member.contributions.length > 0
                  ? member.contributions
                  : [];

              return (
                <div
                  key={member.id || member.name || Math.random()}
                  onClick={() => {
                    setSelectedMember({ ...member, photoUrl: photoSrc });
                    setIsProfileModalOpen(true);
                  }}
                  className="group relative rounded-3xl border border-[#333333] bg-[#171717] p-5 sm:p-6 shadow-sm hover:border-[#E50914] transition-all duration-300 flex flex-col justify-between cursor-pointer md:last:col-span-2 md:last:max-w-md md:last:mx-auto lg:last:col-span-1 lg:last:max-w-none lg:last:mx-0 w-full"
                >
                  <div className="space-y-4">
                    {/* Photograph */}
                    <div className="relative w-full aspect-[4/5] rounded-2xl overflow-hidden bg-[#101010] border border-[#333333] shadow-md">
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
                        <div className="w-full h-full flex items-center justify-center bg-[#101010] font-bold text-3xl font-mono text-white">
                          {member.initials || 'CMS'}
                        </div>
                      )}

                      {/* Verified Badge */}
                      <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-[#101010]/90 backdrop-blur-md border border-[#333333] text-white text-[10px] font-semibold flex items-center gap-1 shadow-md">
                        <ShieldCheck className="w-3.5 h-3.5 text-[#FFC928]" />
                        <span>Verified</span>
                      </div>
                    </div>

                    {/* Full Name & Title */}
                    <div className="space-y-1">
                      <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-[#E50914] transition-colors leading-snug">
                        {member.name}
                      </h3>
                      <p className="text-xs sm:text-[13px] font-semibold text-[#FFC928] leading-tight">
                        {member.title}
                      </p>
                    </div>

                    {/* Biography */}
                    {member.bio && (
                      <div className="p-3.5 rounded-xl bg-[#101010] border border-[#333333] text-xs sm:text-[13px] leading-relaxed text-[#A3A3A3]">
                        <p className="line-clamp-3" title={member.bio}>
                          {member.bio}
                        </p>
                      </div>
                    )}

                    {/* Contributions */}
                    {contributionsList.length > 0 && (
                      <div className="space-y-1.5 pt-0.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#A3A3A3] block font-mono">
                          Project Contributions
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {contributionsList.slice(0, 3).map((contrib, idx) => {
                            const rawTitle = typeof contrib === 'string' ? contrib : (contrib?.title || '');
                            const label = rawTitle.replace(/^\d+\.\s*/, '') || rawTitle;
                            return (
                              <span
                                key={idx}
                                className="inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-medium bg-[#101010] text-[#FFC928] border border-[#333333] leading-tight"
                              >
                                {label}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Profile Actions */}
                  <div className="mt-5 pt-3.5 border-t border-[#333333] space-y-2.5">
                    {member.portfolio?.url && (
                      <a
                        href={member.portfolio.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="w-full py-2.5 px-3 rounded-xl bg-[#E50914] hover:bg-[#c40812] text-white text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 transition-all group/port cursor-pointer"
                        aria-label={`Visit ${member.name}'s Portfolio`}
                      >
                        <Globe className="w-3.5 h-3.5" />
                        <span>{member.portfolio.buttonText || 'Visit Portfolio'}</span>
                        <ExternalLink className="w-3 h-3 group-hover/port:translate-x-0.5 group-hover/port:-translate-y-0.5 transition-transform" />
                      </a>
                    )}

                    <div className="flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedMember(member);
                          setIsProfileModalOpen(true);
                        }}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#E50914] hover:text-[#FF7900] py-1.5 px-3 rounded-lg hover:bg-[#101010] transition-colors cursor-pointer group/view"
                        aria-label={`View detailed profile of ${member.name}`}
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Profile</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover/view:translate-x-0.5 transition-transform" />
                      </button>

                      <div className="flex items-center gap-1">
                        {member.contact?.email && (
                          <a
                            href={`mailto:${member.contact.email}`}
                            onClick={(e) => e.stopPropagation()}
                            className="p-1.5 rounded-lg text-[#A3A3A3] hover:text-[#E50914] hover:bg-[#101010] transition-colors"
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
                            className="p-1.5 rounded-lg text-[#A3A3A3] hover:text-[#FF7900] hover:bg-[#101010] transition-colors"
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
                            className="p-1.5 rounded-lg text-[#A3A3A3] hover:text-white hover:bg-[#101010] transition-colors"
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

      {/* Profile Modal */}
      <TeamMemberProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        member={selectedMember}
        onSave={handleSaveProfile}
        allowEditing={Boolean(currentUser && currentUser.role === 'admin')}
      />

      {/* ========================================================= */}
      {/* 8. FAQ SECTION                                            */}
      {/* ========================================================= */}
      <section
        id="faq"
        className="scroll-mt-16 sm:scroll-mt-20 py-20 border-b border-[#333333] bg-[#141414] transition-colors"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold text-[#FFC928] uppercase tracking-wider font-mono">
              Questions & Answers
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Frequently Asked Questions (FAQ)
            </h2>
            <p className="text-xs sm:text-sm text-[#A3A3A3]">
              Common questions about using the Client Management System.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={faq.question}
                  className="bg-[#171717] rounded-2xl border border-[#333333] overflow-hidden shadow-2xs transition-all"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full px-6 py-4.5 text-left flex items-center justify-between gap-4 transition-colors cursor-pointer"
                    aria-expanded={isOpen}
                  >
                    <span className="text-sm font-semibold text-white">
                      {faq.question}
                    </span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-[#E50914] shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-[#A3A3A3] shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-5 pt-1 text-xs sm:text-sm text-[#A3A3A3] leading-relaxed border-t border-[#333333]">
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
        className="scroll-mt-16 sm:scroll-mt-20 py-20 border-b border-[#333333] bg-[#101010] transition-colors"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="space-y-1">
            <span className="text-xs font-bold text-[#E50914] uppercase tracking-wider font-mono">
              Legal & Data
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Privacy Policy
            </h2>
            <p className="text-xs text-[#A3A3A3] font-mono">Standard Enterprise Compliance</p>
          </div>

          <div className="bg-[#171717] p-6 sm:p-8 rounded-3xl border border-[#333333] text-xs sm:text-sm text-[#A3A3A3] space-y-5 leading-relaxed shadow-xs">
            <div>
              <h3 className="font-bold text-white mb-1">
                1. Data Processing Scope
              </h3>
              <p>
                The Client Management System may process account details, client records, project
                information, and task updates strictly to provide its features and
                support team coordination.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-white mb-1">
                2. Access Restrictions & Role-Based Isolation
              </h3>
              <p>
                Access to client records, project budgets, and personal tasks is restricted according to
                each user's assigned role and organizational permissions. Data is only accessible to
                users with a legitimate business responsibility.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-white mb-1">
                3. Confidentiality & Appropriate Data Handling
              </h3>
              <p>
                All client and project records must be handled with appropriate care. Users are
                responsible for maintaining the confidentiality of information viewed through the system.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-white mb-1">
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
        className="scroll-mt-16 sm:scroll-mt-20 py-20 border-b border-[#333333] bg-[#141414] transition-colors"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="space-y-1">
            <span className="text-xs font-bold text-[#FF7900] uppercase tracking-wider">
              Agreement
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Terms & Conditions
            </h2>
            <p className="text-xs text-[#A3A3A3] font-mono">Standard Operating Agreement</p>
          </div>

          <div className="bg-[#171717] p-6 sm:p-8 rounded-3xl border border-[#333333] text-xs sm:text-sm text-[#A3A3A3] space-y-5 leading-relaxed shadow-xs">
            <div>
              <h3 className="font-bold text-white mb-1">
                1. Authorized Use of the Application
              </h3>
              <p>
                Access to the Client Management System is granted solely for legitimate business
                operations, client management, project delivery, and task management. Unauthorized
                access attempts or misuse of user credentials are strictly prohibited.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-white mb-1">
                2. User Responsibilities When Updating Records
              </h3>
              <p>
                Users are responsible for ensuring that all client details, milestone progress updates,
                logged hours, and deliverable notes are accurate, timely, and complete.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-white mb-1">
                3. Appropriate Handling of Confidential Information
              </h3>
              <p>
                Users must safeguard proprietary client information and adhere to organization guidelines
                regarding data sharing and external exports.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-white mb-1">
                4. Role-Based Access and Permitted Activities
              </h3>
              <p>
                Users may only perform activities and access views permitted by their designated system
                role (Administrator, Manager, Team Lead, or Team Member). Bypassing role boundaries is
                prohibited.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-white mb-1">
                5. Responsible Use of Platform and Deliverables
              </h3>
              <p>
                All documents, records, and files updated within the system must be authentic, free of
                harmful software, and directly relevant to the assigned work.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-white mb-1">
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
