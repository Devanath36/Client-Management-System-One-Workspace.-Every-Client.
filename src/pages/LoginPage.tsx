import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import { INITIAL_DEMO_CREDENTIALS } from '../data/mockData';
import {
  Shield,
  Briefcase,
  Users,
  CheckSquare,
  ArrowRight,
  ArrowLeft,
  Eye,
  EyeOff,
  Lock,
  User as UserIcon,
  AlertCircle,
  Copy,
  Check,
  KeyRound,
  Sparkles,
  ChevronDown,
  Info,
  CheckCircle2,
} from 'lucide-react';

interface RoleThemeConfig {
  id: UserRole;
  title: string;
  badge: string;
  welcomeMessage: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  iconBg: string;
  buttonClass: string;
  activeBorder: string;
  activeText: string;
  activeBg: string;
  activeRing: string;
  topAccentBar: string;
  ambientGlow: string;
  focusRing: string;
  badgeClass: string;
  defaultLoginId: string;
  defaultPassword: string;
  defaultName: string;
  scopeSummary: string;
}

export const LoginPage: React.FC = () => {
  const { login, setCurrentView, showToast } = useApp();

  // Dynamic role selection directly inside login page (default: Administrator)
  const [selectedRole, setSelectedRole] = useState<UserRole>('admin');

  // Form inputs
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Authentication Loading-to-Success Animation State
  const [loginStage, setLoginStage] = useState<'idle' | 'loading' | 'success'>('idle');

  // Demo helpers state
  const [showAllAccounts, setShowAllAccounts] = useState(false);
  const [revealDemoPassword, setRevealDemoPassword] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Error handling
  const [errorMessage, setErrorMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ loginId?: string; password?: string }>({});

  // Check remembered session on mount
  useEffect(() => {
    try {
      const savedRemember = localStorage.getItem('cms_remember_me') === 'true';
      const savedLoginId = localStorage.getItem('cms_remember_login_id');
      if (savedRemember && savedLoginId) {
        setRememberMe(true);
        setLoginId(savedLoginId);
      }
    } catch {
      // Ignore localStorage access issues
    }
  }, []);

  const roleConfigs: Record<UserRole, RoleThemeConfig> = {
    admin: {
      id: 'admin',
      title: 'Administrator',
      badge: 'System Governance & Security',
      welcomeMessage:
        'Full administrative authority: manage system configurations, security policies, user directories, and audit activity logs.',
      icon: Shield,
      iconColor: 'text-[#E50914]',
      iconBg: 'bg-[#E50914]/15 border border-[#E50914]/40',
      buttonClass: 'bg-[#E50914] hover:bg-[#c40812] text-white shadow-lg shadow-[#E50914]/30',
      activeBorder: 'border-[#E50914]',
      activeText: 'text-[#E50914]',
      activeBg: 'bg-[#E50914]/5 dark:bg-[#1a1414]',
      activeRing: 'ring-2 ring-[#E50914]/50 shadow-[#E50914]/20 shadow-md',
      topAccentBar: 'bg-[#E50914]',
      ambientGlow: 'rgba(229, 9, 20, 0.12)',
      focusRing: 'focus:ring-[#E50914]',
      badgeClass: 'bg-[#E50914]/15 text-[#E50914] border-[#E50914]/30',
      defaultLoginId: 'admin@123',
      defaultPassword: 'admin@123',
      defaultName: 'Administrator',
      scopeSummary: 'User directory, role permissions, audit logs, and global settings.',
    },
    manager: {
      id: 'manager',
      title: 'Manager',
      badge: 'Client Portfolios & Operations',
      welcomeMessage:
        'Operational authority: oversee client partnerships, track project portfolios, allocate resources, and review analytics.',
      icon: Briefcase,
      iconColor: 'text-[#FF7900]',
      iconBg: 'bg-[#FF7900]/15 border border-[#FF7900]/40',
      buttonClass: 'bg-[#FF7900] hover:bg-[#e06a00] text-white shadow-lg shadow-[#FF7900]/30',
      activeBorder: 'border-[#FF7900]',
      activeText: 'text-[#FF7900]',
      activeBg: 'bg-[#FF7900]/5 dark:bg-[#1a1714]',
      activeRing: 'ring-2 ring-[#FF7900]/50 shadow-[#FF7900]/20 shadow-md',
      topAccentBar: 'bg-[#FF7900]',
      ambientGlow: 'rgba(255, 121, 0, 0.12)',
      focusRing: 'focus:ring-[#FF7900]',
      badgeClass: 'bg-[#FF7900]/15 text-[#FF7900] border-[#FF7900]/30',
      defaultLoginId: 'manager1@123',
      defaultPassword: 'Manager123',
      defaultName: 'Manager 1',
      scopeSummary: 'Client management, project pipelines, reports, deadlines, and supervision.',
    },
    team_lead: {
      id: 'team_lead',
      title: 'Team Lead',
      badge: 'Sprint Delivery & Orchestration',
      welcomeMessage:
        'Delivery leadership: oversee project milestones, coordinate team tasks, monitor throughput, and resolve blockers.',
      icon: Users,
      iconColor: 'text-[#FFC928]',
      iconBg: 'bg-[#FFC928]/15 border border-[#FFC928]/40',
      buttonClass: 'bg-[#FFC928] hover:bg-[#e6b41f] text-[#101010] font-extrabold shadow-lg shadow-[#FFC928]/25',
      activeBorder: 'border-[#FFC928]',
      activeText: 'text-[#FFC928]',
      activeBg: 'bg-[#FFC928]/5 dark:bg-[#1a1914]',
      activeRing: 'ring-2 ring-[#FFC928]/50 shadow-[#FFC928]/20 shadow-md',
      topAccentBar: 'bg-[#FFC928]',
      ambientGlow: 'rgba(255, 201, 40, 0.10)',
      focusRing: 'focus:ring-[#FFC928]',
      badgeClass: 'bg-[#FFC928]/15 text-[#FFC928] border-[#FFC928]/30',
      defaultLoginId: 'teamlead1@123',
      defaultPassword: 'teamlead@123',
      defaultName: 'Team Lead 1',
      scopeSummary: 'Assigned projects, task distribution, sprint tracking, and milestones.',
    },
    team_member: {
      id: 'team_member',
      title: 'Team Member',
      badge: 'Task Execution & Deliverables',
      welcomeMessage:
        'Focused execution: review assigned deliverables, log progress updates, track personal to-dos, and meet deadlines.',
      icon: CheckSquare,
      iconColor: 'text-[#101010] dark:text-white',
      iconBg: 'bg-black/5 dark:bg-white/10 border border-[#CCCCCC] dark:border-white/20',
      buttonClass: 'bg-[#E50914] hover:bg-[#c40812] text-white shadow-lg shadow-[#E50914]/30',
      activeBorder: 'border-[#101010] dark:border-white',
      activeText: 'text-[#101010] dark:text-white',
      activeBg: 'bg-black/5 dark:bg-[#1a1a1a]',
      activeRing: 'ring-2 ring-[#101010]/30 dark:ring-white/40 shadow-sm',
      topAccentBar: 'bg-[#101010] dark:bg-white',
      ambientGlow: 'rgba(255, 255, 255, 0.08)',
      focusRing: 'focus:ring-[#101010] dark:focus:ring-white',
      badgeClass: 'bg-black/5 dark:bg-white/10 text-[#101010] dark:text-white border-[#CCCCCC] dark:border-white/20',
      defaultLoginId: 'teammember1@123',
      defaultPassword: 'teammember@123',
      defaultName: 'Team Member 1',
      scopeSummary: 'My tasks, deliverable updates, status workflows, and deadlines.',
    },
  };

  const currentConfig = roleConfigs[selectedRole];
  const ActiveIcon = currentConfig.icon;

  const roleAccounts = INITIAL_DEMO_CREDENTIALS.filter((acc) => acc.role === selectedRole);

  const handleRoleChange = (newRole: UserRole) => {
    setSelectedRole(newRole);
    setErrorMessage('');
    setFieldErrors({});
    setLoginStage('idle');
  };

  const handleAutofillDemo = (demoId?: string, demoPass?: string) => {
    const idToUse = demoId || currentConfig.defaultLoginId;
    const passToUse = demoPass || currentConfig.defaultPassword;
    setLoginId(idToUse);
    setPassword(passToUse);
    setErrorMessage('');
    setFieldErrors({});
    setLoginStage('idle');
    showToast(
      'info',
      `${currentConfig.title} Demo Loaded`,
      `Ready to sign in as ${idToUse}. Click "Sign In as ${currentConfig.title}".`
    );
  };

  const handleCopy = (text: string, key: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    showToast('info', 'Copied to Clipboard', `${label}: ${text}`);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    const errors: { loginId?: string; password?: string } = {};

    if (!loginId.trim()) {
      errors.loginId = `Please enter your ${currentConfig.title} Login ID or corporate email.`;
    }

    if (!password) {
      errors.password = 'Please enter your account password.';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    // Begin Loading Stage with Primary Red Theme Feedback
    setLoginStage('loading');

    if (rememberMe) {
      try {
        localStorage.setItem('cms_remember_me', 'true');
        localStorage.setItem('cms_remember_login_id', loginId.trim());
      } catch {
        // Ignore
      }
    } else {
      try {
        localStorage.removeItem('cms_remember_me');
        localStorage.removeItem('cms_remember_login_id');
      } catch {
        // Ignore
      }
    }

    // Execute authentication with subtle, high-quality transition animation
    setTimeout(() => {
      // Validate credentials using AppContext authentication logic without autoNavigate
      const result = login(loginId, password, selectedRole, false);

      if (!result.success) {
        setLoginStage('idle');
        setErrorMessage(
          result.error ||
            `Invalid credentials for ${currentConfig.title}. Please verify your Login ID and password.`
        );
      } else {
        // Transition to Success Animation State
        setLoginStage('success');
        
        // Allow user to visibly observe clear success feedback before routing to workspace
        setTimeout(() => {
          setCurrentView('dashboard');
          try {
            localStorage.setItem('cms_active_view', 'dashboard');
          } catch {}
        }, 650);
      }
    }, 450);
  };

  return (
    <div
      className="min-h-screen bg-[#F7F7F7] dark:bg-[#101010] text-[#101010] dark:text-white py-6 sm:py-10 px-3.5 sm:px-6 lg:px-8 flex flex-col justify-between relative overflow-hidden transition-all duration-500"
      style={{
        backgroundImage: `radial-gradient(circle at 50% 120px, ${currentConfig.ambientGlow} 0%, transparent 60%)`,
      }}
    >
      {/* Ambient background grid lines */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(to right, #888888 1px, transparent 1px), linear-gradient(to bottom, #888888 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      <div className="max-w-4xl mx-auto w-full space-y-5 sm:space-y-6 relative z-10">
        {/* Navigation Bar / Top Bar */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setCurrentView('landing')}
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#555555] dark:text-[#A3A3A3] hover:text-[#101010] dark:hover:text-white transition-colors cursor-pointer py-1.5 px-3 rounded-lg bg-white dark:bg-[#1a1a1a] border border-[#E0E0E0] dark:border-[#333333] shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </button>

          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white dark:bg-[#171717] border border-[#E0E0E0] dark:border-[#333333] shadow-xs">
            <div className={`w-2 h-2 rounded-full ${currentConfig.topAccentBar} animate-pulse`} />
            <span className="text-[11px] font-semibold text-[#555555] dark:text-[#A3A3A3]">
              Role: <strong className="text-[#101010] dark:text-white">{currentConfig.title}</strong>
            </span>
          </div>
        </div>

        {/* ======================================================== */}
        {/* MAIN DYNAMIC LOGIN CARD                                  */}
        {/* ======================================================== */}
        <div className="bg-white dark:bg-[#171717] rounded-3xl p-5 sm:p-7 lg:p-9 shadow-xl border border-[#E0E0E0] dark:border-[#333333] space-y-5 sm:space-y-6 relative overflow-hidden transition-all duration-300">
          {/* Subtle Top Accent Bar reflecting selected role */}
          <div
            className={`absolute top-0 left-0 right-0 h-1.5 ${currentConfig.topAccentBar} transition-colors duration-500`}
          />

          {/* Header Branding & Dynamic Role Banner */}
          <div className="text-center space-y-2.5 pt-1">
            <div
              className={`w-14 h-14 rounded-2xl ${currentConfig.iconBg} flex items-center justify-center mx-auto transition-all duration-300 transform hover:scale-105 shadow-inner`}
            >
              <ActiveIcon className={`w-7 h-7 ${currentConfig.iconColor} transition-colors duration-300`} />
            </div>

            <div>
              <div
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border mb-2 transition-colors duration-300 ${currentConfig.badgeClass}`}
              >
                <Sparkles className="w-3.5 h-3.5 text-[#FFC928]" />
                <span>{currentConfig.badge}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#101010] dark:text-white transition-all">
                {currentConfig.title} Portal
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-[#555555] dark:text-[#A3A3A3] max-w-xl mx-auto leading-relaxed transition-all">
                {currentConfig.welcomeMessage}
              </p>
            </div>
          </div>

          {/* ======================================================== */}
          {/* EMBEDDED ROLE SELECTOR (4 OPTIONS DIRECTLY ON LOGIN PAGE) */}
          {/* ======================================================== */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-[#101010] dark:text-white uppercase tracking-wider px-1">
              <span className="flex items-center gap-1.5">
                <span>Select Your Role</span>
                <span className="text-[10px] normal-case font-normal text-[#FF7900] dark:text-[#FFC928]">
                  (Click any card to switch interface)
                </span>
              </span>
              <span className="text-[11px] font-normal normal-case text-[#555555] dark:text-[#A3A3A3] hidden sm:inline">
                Switches theme & credentials
              </span>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
              {(Object.keys(roleConfigs) as UserRole[]).map((roleKey) => {
                const config = roleConfigs[roleKey];
                const RoleIcon = config.icon;
                const isSelected = selectedRole === roleKey;

                return (
                  <button
                    key={roleKey}
                    type="button"
                    onClick={() => handleRoleChange(roleKey)}
                    className={`p-3 sm:p-3.5 rounded-2xl border text-left transition-all duration-300 relative flex flex-col justify-between cursor-pointer select-none outline-none group ${
                      isSelected
                        ? `${config.activeBorder} ${config.activeBg} ${config.activeRing}`
                        : 'border-[#E0E0E0] dark:border-[#333333] bg-[#F9F9F9] dark:bg-[#101010] hover:border-[#CCCCCC] dark:hover:border-[#555555]'
                    }`}
                    aria-pressed={isSelected}
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold ${config.iconBg} shrink-0 transition-transform group-hover:scale-105`}
                      >
                        <RoleIcon className={`w-4 h-4 ${config.iconColor}`} />
                      </div>
                      <span
                        className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors shrink-0 ${
                          isSelected
                            ? `${config.topAccentBar} text-white`
                            : 'border-[#D0D0D0] dark:border-[#333333] bg-white dark:bg-[#171717]'
                        }`}
                      >
                        {isSelected && (
                          <Check
                            className={`w-3 h-3 stroke-[3] ${
                              config.id === 'team_lead' ? 'text-[#101010]' : 'text-white'
                            }`}
                          />
                        )}
                      </span>
                    </div>

                    <div>
                      <div
                        className={`text-xs sm:text-sm font-bold transition-colors ${
                          isSelected ? config.activeText : 'text-[#101010] dark:text-white'
                        }`}
                      >
                        {config.title}
                      </div>
                      <div className="text-[10px] text-[#555555] dark:text-[#A3A3A3] line-clamp-1 mt-0.5">
                        {config.scopeSummary}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3.5 sm:p-4 bg-[#E50914]/10 dark:bg-[#E50914]/15 border border-[#E50914]/50 rounded-2xl text-xs text-[#E50914] flex items-start gap-2.5 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#E50914]" />
              <div>
                <p className="font-bold text-[#E50914]">Authentication Error</p>
                <p className="mt-0.5 text-[#555555] dark:text-[#E5E5E5] leading-relaxed">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* LOGIN CREDENTIAL FORM                                   */}
          {/* ======================================================== */}
          <form onSubmit={handleSignIn} className="space-y-4">
            {/* Login ID Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="loginIdInput"
                  className="block text-xs font-semibold text-[#101010] dark:text-white"
                >
                  {currentConfig.title} Login ID or Corporate Email *
                </label>
                <button
                  type="button"
                  onClick={() => handleAutofillDemo()}
                  className="text-[11px] text-[#E50914] dark:text-[#FFC928] hover:underline font-mono cursor-pointer flex items-center gap-1 font-semibold"
                  title="Click to fill demo Login ID"
                >
                  <span>Demo: {currentConfig.defaultLoginId}</span>
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#888888]">
                  <UserIcon className="w-4 h-4" />
                </div>
                <input
                  id="loginIdInput"
                  type="text"
                  value={loginId}
                  onChange={(e) => {
                    setLoginId(e.target.value);
                    if (fieldErrors.loginId) setFieldErrors({ ...fieldErrors, loginId: '' });
                    if (errorMessage) setErrorMessage('');
                  }}
                  placeholder={`e.g. ${currentConfig.defaultLoginId}`}
                  className={`w-full pl-10 pr-4 py-2.5 text-sm bg-white dark:bg-[#101010] border rounded-xl focus:outline-none focus:ring-2 ${currentConfig.focusRing} text-[#101010] dark:text-white transition-colors ${
                    fieldErrors.loginId ? 'border-[#E50914]' : 'border-[#E0E0E0] dark:border-[#333333]'
                  }`}
                />
              </div>
              {fieldErrors.loginId && (
                <p className="text-xs text-[#E50914] font-medium">{fieldErrors.loginId}</p>
              )}
            </div>

            {/* Password Input with Show/Hide toggle */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="passwordInput"
                  className="block text-xs font-semibold text-[#101010] dark:text-white"
                >
                  Password *
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-[#555555] dark:text-[#A3A3A3] font-mono">
                    Demo:{' '}
                    <span className="text-[#E50914] dark:text-[#FFC928] font-bold">
                      {revealDemoPassword ? currentConfig.defaultPassword : '••••••••••••'}
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setRevealDemoPassword(!revealDemoPassword)}
                    className="text-[11px] text-[#555555] dark:text-[#A3A3A3] hover:text-[#101010] dark:hover:text-white underline cursor-pointer"
                  >
                    {revealDemoPassword ? 'Hide' : 'Reveal'}
                  </button>
                </div>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#888888]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="passwordInput"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: '' });
                    if (errorMessage) setErrorMessage('');
                  }}
                  placeholder="Enter your account password"
                  className={`w-full pl-10 pr-11 py-2.5 text-sm bg-white dark:bg-[#101010] border rounded-xl focus:outline-none focus:ring-2 ${currentConfig.focusRing} text-[#101010] dark:text-white transition-colors ${
                    fieldErrors.password ? 'border-[#E50914]' : 'border-[#E0E0E0] dark:border-[#333333]'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#888888] hover:text-[#101010] dark:hover:text-white cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="text-xs text-[#E50914] font-medium">{fieldErrors.password}</p>
              )}
            </div>

            {/* Remember Me and Password Reminder */}
            <div className="flex items-center justify-between pt-0.5">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-[#D0D0D0] dark:border-[#333333] bg-white dark:bg-[#101010] text-[#E50914] focus:ring-[#E50914] cursor-pointer"
                />
                <span className="text-xs text-[#555555] dark:text-[#A3A3A3] hover:text-[#101010] dark:hover:text-white transition-colors">
                  Remember me on this browser
                </span>
              </label>

              <button
                type="button"
                onClick={() => handleAutofillDemo()}
                className="text-xs font-semibold text-[#E50914] dark:text-[#FFC928] hover:underline cursor-pointer flex items-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#FF7900] dark:text-[#FFC928]" />
                <span>Fill Demo Credentials</span>
              </button>
            </div>

            {/* ======================================================== */}
            {/* SUBTLE HIGH-QUALITY LOADING-TO-SUCCESS BUTTON ANIMATION */}
            {/* ======================================================== */}
            <button
              type="submit"
              disabled={loginStage !== 'idle'}
              className={`w-full py-3.5 px-6 rounded-xl text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2.5 cursor-pointer disabled:cursor-not-allowed select-none ${
                loginStage === 'success'
                  ? 'bg-[#E50914] text-white ring-4 ring-[#E50914]/40 shadow-xl shadow-[#E50914]/40 scale-[1.01]'
                  : loginStage === 'loading'
                  ? 'bg-[#E50914] text-white shadow-lg shadow-[#E50914]/30 animate-pulse'
                  : `${currentConfig.buttonClass} hover:scale-[1.01] active:scale-[0.99]`
              }`}
            >
              {loginStage === 'loading' && (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin shrink-0" />
                  <span className="tracking-wide">Authenticating as {currentConfig.title}...</span>
                </>
              )}
              {loginStage === 'success' && (
                <>
                  <CheckCircle2 className="w-5 h-5 text-[#FFC928] animate-in zoom-in-75 duration-300 shrink-0" />
                  <span className="tracking-wide font-extrabold text-white">Access Granted! Entering Workspace...</span>
                </>
              )}
              {loginStage === 'idle' && (
                <>
                  <span>Sign In as {currentConfig.title}</span>
                  <ArrowRight className="w-4 h-4 shrink-0 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>

          {/* ======================================================== */}
          {/* QUICK DEMO CREDENTIALS BAR & 1-CLICK AUTOFILL            */}
          {/* ======================================================== */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-[#F7F7F7] dark:bg-[#101010] border border-[#E0E0E0] dark:border-[#333333] space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-[#FF7900] dark:text-[#FFC928] shrink-0" />
                <div>
                  <span className="text-xs font-bold text-[#101010] dark:text-white">
                    {currentConfig.title} Demo Credentials
                  </span>
                  <span className="text-[11px] text-[#555555] dark:text-[#A3A3A3] block">
                    Pre-configured credentials to evaluate {currentConfig.title} permissions.
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleAutofillDemo()}
                  className="min-h-[36px] px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-[#E50914] hover:bg-[#c40812] shadow-xs inline-flex items-center gap-1.5 cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#FFC928]" />
                  <span>Autofill Form</span>
                </button>
              </div>
            </div>

            {/* Quick Interactive Credential Chips */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
              {/* Login ID Chip */}
              <div
                onClick={() => handleAutofillDemo()}
                className="flex items-center justify-between px-3 py-2 bg-white dark:bg-[#171717] hover:bg-[#F0F0F0] dark:hover:bg-[#1f1f1f] rounded-xl border border-[#E0E0E0] dark:border-[#333333] hover:border-[#FFC928] transition-all cursor-pointer group shadow-2xs"
                title="Click to populate Login ID into form"
              >
                <div className="flex items-center gap-1.5">
                  <span className="text-[#555555] dark:text-[#A3A3A3] font-sans text-[11px]">ID:</span>
                  <span className="text-[#E50914] dark:text-[#FFC928] font-bold tracking-tight">
                    {currentConfig.defaultLoginId}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-[#888888] dark:text-[#A3A3A3] group-hover:text-[#101010] dark:group-hover:text-white font-sans hidden sm:inline">
                    Use
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopy(currentConfig.defaultLoginId, 'primary-id', 'Login ID');
                    }}
                    className="text-[#888888] dark:text-[#A3A3A3] hover:text-[#101010] dark:hover:text-white p-1 cursor-pointer rounded hover:bg-[#EAEAEA] dark:hover:bg-[#262626]"
                    title="Copy Login ID"
                  >
                    {copiedKey === 'primary-id' ? (
                      <Check className="w-3.5 h-3.5 text-[#E50914] dark:text-[#FFC928]" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Password Chip */}
              <div
                onClick={() => handleAutofillDemo()}
                className="flex items-center justify-between px-3 py-2 bg-white dark:bg-[#171717] hover:bg-[#F0F0F0] dark:hover:bg-[#1f1f1f] rounded-xl border border-[#E0E0E0] dark:border-[#333333] hover:border-[#FFC928] transition-all cursor-pointer group shadow-2xs"
                title="Click to populate Password into form"
              >
                <div className="flex items-center gap-1.5">
                  <span className="text-[#555555] dark:text-[#A3A3A3] font-sans text-[11px]">Pass:</span>
                  <span className="text-[#101010] dark:text-white font-semibold tracking-tight">
                    {revealDemoPassword ? currentConfig.defaultPassword : '••••••••••••'}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-[#888888] dark:text-[#A3A3A3] group-hover:text-[#101010] dark:group-hover:text-white font-sans hidden sm:inline">
                    Use
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopy(currentConfig.defaultPassword, 'primary-pass', 'Password');
                    }}
                    className="text-[#888888] dark:text-[#A3A3A3] hover:text-[#101010] dark:hover:text-white p-1 cursor-pointer rounded hover:bg-[#EAEAEA] dark:hover:bg-[#262626]"
                    title="Copy Password"
                  >
                    {copiedKey === 'primary-pass' ? (
                      <Check className="w-3.5 h-3.5 text-[#E50914] dark:text-[#FFC928]" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Collapsible Additional Accounts Drawer if more than 1 account exists */}
            {roleAccounts.length > 1 && (
              <div className="pt-0.5">
                <button
                  type="button"
                  onClick={() => setShowAllAccounts(!showAllAccounts)}
                  className="w-full flex items-center justify-between text-xs font-semibold text-[#555555] dark:text-[#A3A3A3] hover:text-[#101010] dark:hover:text-white py-1 cursor-pointer"
                >
                  <span className="inline-flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-[#FF7900]" />
                    <span>
                      {showAllAccounts
                        ? `Hide other ${roleAccounts.length} ${currentConfig.title} accounts`
                        : `View all ${roleAccounts.length} configured ${currentConfig.title} accounts`}
                    </span>
                  </span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                      showAllAccounts ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {showAllAccounts && (
                  <div className="mt-2.5 grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1 animate-in fade-in duration-200">
                    {roleAccounts.map((acc) => (
                      <div
                        key={acc.userId}
                        className="p-2.5 rounded-xl border border-[#E0E0E0] dark:border-[#333333] bg-white dark:bg-[#171717] text-xs space-y-1.5 hover:border-[#E50914] transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#101010] dark:text-white truncate">
                            {acc.name}
                          </span>
                          <span className="text-[10px] text-[#555555] dark:text-[#A3A3A3]">{acc.title}</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] font-mono text-[#555555] dark:text-[#A3A3A3]">
                          <span>{acc.loginId}</span>
                          <button
                            type="button"
                            onClick={() => handleAutofillDemo(acc.loginId, acc.demoPassword)}
                            className="text-[#E50914] dark:text-[#FFC928] hover:underline font-semibold cursor-pointer"
                          >
                            Autofill →
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Security & Access Notice */}
        <div className="text-center space-y-1 text-xs text-[#777777] dark:text-[#A3A3A3] pb-2">
          <p>© {new Date().getFullYear()} Client Management System — One Workspace. Every Client.</p>
          <p className="text-[11px] text-[#888888] dark:text-[#737373]">
            Role-based access security active. Credentials are validated directly against database user records.
          </p>
        </div>
      </div>
    </div>
  );
};
