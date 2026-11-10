import React, { useState } from 'react';
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
  ArrowRightLeft,
  ChevronDown,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, setCurrentView, showToast } = useApp();

  // Workflow steps:
  // Step 1: Select Role
  // Step 2: Enter Credentials
  const [step, setStep] = useState<'select-role' | 'enter-credentials'>('select-role');
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

  // Form inputs: MUST BE EMPTY by default
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Development / Demo accounts helper toggle (collapsed by default in production)
  const [showDemoHelper, setShowDemoHelper] = useState(false);
  const [revealPasswords, setRevealPasswords] = useState(false);

  // Error messages
  const [errorMessage, setErrorMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ loginId?: string; password?: string }>({});

  // Copy feedback state
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const roleDefinitions = [
    {
      id: 'admin' as UserRole,
      title: 'Administrator',
      badge: 'Executive System Control',
      icon: Shield,
      gradient: 'from-indigo-600 to-blue-700',
      activeRing: 'ring-indigo-500/30 border-indigo-500',
      description:
        'User management, role and permission management, system overview, audit logs, and settings.',
      countLabel: '1 configured demo account',
    },
    {
      id: 'manager' as UserRole,
      title: 'Manager',
      badge: 'Operations & Accounts',
      icon: Briefcase,
      gradient: 'from-blue-600 to-cyan-600',
      activeRing: 'ring-blue-500/30 border-blue-500',
      description:
        'Client management, team management, projects, task assignments, reports, and deadline alerts.',
      countLabel: '3 configured demo accounts',
    },
    {
      id: 'team_lead' as UserRole,
      title: 'Team Lead',
      badge: 'Delivery & Solutions',
      icon: Users,
      gradient: 'from-sky-600 to-blue-600',
      activeRing: 'ring-sky-500/30 border-sky-500',
      description:
        'Assigned projects, task distribution, team progress monitoring, and deadline alerts.',
      countLabel: '5 configured demo accounts',
    },
    {
      id: 'team_member' as UserRole,
      title: 'Team Member',
      badge: 'Task Execution',
      icon: CheckSquare,
      gradient: 'from-teal-600 to-emerald-600',
      activeRing: 'ring-teal-500/30 border-teal-500',
      description:
        'My Tasks, task details, status updates, upcoming deadlines, and notifications.',
      countLabel: '10 configured demo accounts',
    },
  ];

  // Helper to change role cleanly
  const selectRoleAndProceed = (role: UserRole) => {
    setSelectedRole(role);
    setLoginId('');
    setPassword('');
    setErrorMessage('');
    setFieldErrors({});
    setStep('enter-credentials');
  };

  // Step 1: Select role and proceed
  const handleNextToCredentials = () => {
    if (!selectedRole) {
      setErrorMessage('Please select a workspace role to proceed.');
      return;
    }
    setLoginId('');
    setPassword('');
    setErrorMessage('');
    setFieldErrors({});
    setStep('enter-credentials');
  };

  // Step 2: Back to role selection
  const handleBackToRoles = () => {
    setStep('select-role');
    setLoginId('');
    setPassword('');
    setErrorMessage('');
    setFieldErrors({});
  };

  // Developer Quick-Switch dropdown: instantly toggles between role flows
  const handleQuickSwitchRole = (newRole: UserRole) => {
    setSelectedRole(newRole);
    setLoginId('');
    setPassword('');
    setErrorMessage('');
    setFieldErrors({});
    setStep('enter-credentials');
    showToast(
      'info',
      'Switched Role Portal',
      `Switched to ${newRole.replace('_', ' ').toUpperCase()} portal. Displaying only ${newRole.replace('_', ' ')} demo credentials.`
    );
  };

  // Step 3: Handle Sign In submission
  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    const errors: { loginId?: string; password?: string } = {};

    if (!loginId.trim()) {
      errors.loginId = 'Please enter your assigned Login ID or corporate email.';
    }

    if (!password) {
      errors.password = 'Please enter your account password.';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    if (!selectedRole) {
      setErrorMessage('Please select a role first.');
      setStep('select-role');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const result = login(loginId, password, selectedRole);
      setIsSubmitting(false);

      if (!result.success) {
        setErrorMessage(result.error || 'Authentication failed. Please verify credentials.');
      }
    }, 250);
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleFillCredentials = (accLoginId: string, accPass: string) => {
    setLoginId(accLoginId);
    setPassword(accPass);
    setErrorMessage('');
    setFieldErrors({});
    showToast(
      'info',
      'Credentials Loaded',
      `Loaded demo credentials for ${accLoginId}. Click "Sign In" to authenticate.`
    );
  };

  const selectedRoleConfig = roleDefinitions.find((r) => r.id === selectedRole);

  // Exact visibility rule: filter credentials EXCLUSIVELY for the currently selected role
  const roleSpecificCredentials = selectedRole
    ? INITIAL_DEMO_CREDENTIALS.filter((a) => a.role === selectedRole)
    : [];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 sm:py-12 px-3.5 sm:px-6 lg:px-8 flex flex-col justify-between relative overflow-hidden transition-colors">
      {/* Ambient background glows */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-full max-w-6xl h-80 bg-gradient-to-tr from-blue-500/10 via-indigo-500/10 to-transparent blur-3xl pointer-events-none -z-10" />

      <div className="max-w-5xl xl:max-w-6xl mx-auto w-full space-y-6 relative z-10">
        {/* Navigation Bar Header with Quick-Switch */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <button
            onClick={() => setCurrentView('landing')}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors w-fit cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </button>

          {/* Developer Quick-Switch Dropdown (always accessible) */}
          <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 shadow-2xs">
            <ArrowRightLeft className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
            <label htmlFor="quick-switch" className="text-[11px] font-semibold text-slate-500 shrink-0">
              Dev Quick-Switch:
            </label>
            <select
              id="quick-switch"
              value={selectedRole || ''}
              onChange={(e) => handleQuickSwitchRole(e.target.value as UserRole)}
              className="text-xs font-semibold bg-transparent text-blue-600 dark:text-blue-400 focus:outline-none cursor-pointer pr-1"
            >
              <option value="" disabled>
                Jump to Role Portal...
              </option>
              <option value="admin">Administrator (1)</option>
              <option value="manager">Manager (3)</option>
              <option value="team_lead">Team Lead (5)</option>
              <option value="team_member">Team Member (10)</option>
            </select>
          </div>
        </div>

        {/* MAIN AUTHENTICATION CARD WITH GLASSMORPHISM */}
        <div className="glass-panel rounded-3xl p-4 sm:p-8 lg:p-10 shadow-xl shadow-blue-900/5 dark:shadow-black/40 space-y-6 sm:space-y-8 border border-slate-200 dark:border-slate-800">
          {/* Header Title */}
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-600 text-white flex items-center justify-center mx-auto shadow-md shadow-blue-500/20">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Client Management System
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              One Workspace. Every Client. Secure Role-Based Authentication.
            </p>
          </div>

          {/* Workflow Step Indicators */}
          <div className="flex items-center justify-center gap-3">
            <div
              className={`flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full transition-colors ${
                step === 'select-role'
                  ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">
                1
              </span>
              <span>Step 1: Select Role</span>
            </div>
            <span className="text-slate-300 dark:text-slate-700 font-bold">→</span>
            <div
              className={`flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full transition-colors ${
                step === 'enter-credentials'
                  ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-slate-400 dark:bg-slate-700 text-white flex items-center justify-center text-[10px] font-bold">
                2
              </span>
              <span>Step 2: Enter Credentials</span>
            </div>
          </div>

          {/* General Error Alert */}
          {errorMessage && (
            <div className="p-4 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 rounded-2xl text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2.5 shadow-2xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
              <div>
                <p className="font-semibold">Authentication Error</p>
                <p className="mt-0.5 leading-relaxed">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* STEP 1: SELECT ROLE                                     */}
          {/* ======================================================== */}
          {step === 'select-role' && (
            <div className="space-y-6">
              <div className="space-y-1 text-center sm:text-left">
                <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Select Your Workspace Role
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Choose your assigned role to access its dedicated portal. Credentials will be authenticated against your verified account data.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-5">
                {roleDefinitions.map((role) => {
                  const Icon = role.icon;
                  const isSelected = selectedRole === role.id;
                  return (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => {
                        setSelectedRole(role.id);
                        setErrorMessage('');
                      }}
                      className={`min-h-[160px] p-5 rounded-2xl border text-left transition-all relative flex flex-col justify-between cursor-pointer touch-manipulation select-none outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 active:scale-[0.99] group ${
                        isSelected
                          ? 'border-blue-600 dark:border-blue-500 bg-blue-50/80 dark:bg-blue-950/60 ring-2 ring-blue-600/30 dark:ring-blue-500/40 shadow-sm'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/80 shadow-2xs'
                      }`}
                      style={{
                        WebkitTapHighlightColor: 'transparent',
                      }}
                      aria-pressed={isSelected}
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div
                            className={`w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl flex items-center justify-center font-bold text-white shadow-xs bg-gradient-to-tr ${role.gradient} shrink-0`}
                          >
                            <Icon className="w-5 h-5 text-white" />
                          </div>
                          <span
                            className={`w-6 h-6 min-w-[24px] min-h-[24px] rounded-full border-2 flex items-center justify-center transition-colors shrink-0 ${
                              isSelected
                                ? 'border-blue-600 bg-blue-600 text-white dark:border-blue-500 dark:bg-blue-500'
                                : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800'
                            }`}
                          >
                            {isSelected && <Check className="w-3.5 h-3.5 stroke-[3] text-white" />}
                          </span>
                        </div>

                        <div>
                          <div className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                            {role.title}
                          </div>
                          <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400">
                            {role.badge}
                          </span>
                        </div>

                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                          {role.description}
                        </p>
                      </div>

                      <div className="pt-3.5 mt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
                        <span className="text-slate-500 dark:text-slate-400 font-mono font-medium">
                          {role.countLabel}
                        </span>
                        <span className="font-semibold text-blue-600 dark:text-blue-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-1 min-h-[44px]">
                          Select →
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-200/80 dark:border-slate-800">
                <span className="text-xs text-slate-500">
                  {selectedRole ? 'Role selected. Click Next to continue.' : 'Please select a role above.'}
                </span>

                <button
                  type="button"
                  onClick={handleNextToCredentials}
                  disabled={!selectedRole}
                  className={`px-6 py-2.5 rounded-xl text-xs font-semibold transition-all inline-flex items-center gap-2 ${
                    selectedRole
                      ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs cursor-pointer'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <span>Next: Enter Credentials</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* STEP 2: ENTER CREDENTIALS                               */}
          {/* ======================================================== */}
          {step === 'enter-credentials' && selectedRoleConfig && (
            <div className="space-y-8">
              {/* Selected Role Header Badge with in-form Quick-Switch */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${selectedRoleConfig.gradient} text-white flex items-center justify-center shrink-0 shadow-xs`}>
                    <selectedRoleConfig.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">
                      Active Portal
                    </div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white">
                      {selectedRoleConfig.title} Login
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Quick-switch dropdown */}
                  <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 text-xs">
                    <span className="text-[11px] text-slate-400 font-medium">Switch:</span>
                    <select
                      value={selectedRole || ''}
                      onChange={(e) => handleQuickSwitchRole(e.target.value as UserRole)}
                      className="bg-transparent font-semibold text-blue-600 dark:text-blue-400 focus:outline-none cursor-pointer"
                    >
                      <option value="admin">Administrator</option>
                      <option value="manager">Manager</option>
                      <option value="team_lead">Team Lead</option>
                      <option value="team_member">Team Member</option>
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={handleBackToRoles}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors inline-flex items-center gap-1 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back</span>
                  </button>
                </div>
              </div>

              {/* Login Form */}
              <form onSubmit={handleSignIn} className="space-y-5">
                {/* Login ID field: EMPTY by default */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="loginIdInput"
                    className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
                  >
                    Login ID or Corporate Email *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
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
                      placeholder={`Enter ${selectedRoleConfig.title} Login ID`}
                      className={`w-full pl-10 pr-4 py-2.5 text-sm bg-white dark:bg-slate-800 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white transition-colors ${
                        fieldErrors.loginId
                          ? 'border-rose-500'
                          : 'border-slate-300 dark:border-slate-700'
                      }`}
                    />
                  </div>
                  {fieldErrors.loginId && (
                    <p className="text-xs text-rose-500 font-medium">{fieldErrors.loginId}</p>
                  )}
                  <p className="text-[11px] text-slate-400">
                    Enter your authorized corporate Login ID or registered enterprise email.
                  </p>
                </div>

                {/* Password field: EMPTY by default with show/hide toggle */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="passwordInput"
                    className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
                  >
                    Account Password *
                  </label>

                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
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
                      placeholder="Enter account password"
                      className={`w-full pl-10 pr-11 py-2.5 text-sm bg-white dark:bg-slate-800 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white transition-colors ${
                        fieldErrors.password
                          ? 'border-rose-500'
                          : 'border-slate-300 dark:border-slate-700'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {fieldErrors.password && (
                    <p className="text-xs text-rose-500 font-medium">{fieldErrors.password}</p>
                  )}
                </div>

                {/* Submit Action */}
                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={handleBackToRoles}
                    className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Roles</span>
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-colors shadow-xs inline-flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Verifying...</span>
                      </>
                    ) : (
                      <>
                        <span>Sign In as {selectedRoleConfig.title}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* ======================================================== */}
              {/* COLLAPSIBLE DEVELOPMENT / TESTING HELPER (COLLAPSED BY DEFAULT) */}
              {/* No plaintext credentials automatically exposed in production */}
              {/* ======================================================== */}
              <div className="pt-6 border-t border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <KeyRound className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>Evaluation / Testing Environment</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowDemoHelper(!showDemoHelper)}
                    className="min-h-[44px] px-3 py-1.5 rounded-xl text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                    aria-expanded={showDemoHelper}
                  >
                    <span>{showDemoHelper ? 'Hide Testing Accounts' : 'Show Testing Accounts'}</span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform duration-200 ${
                        showDemoHelper ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                </div>

                {showDemoHelper && (
                  <div className="p-5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 space-y-4 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div>
                        <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                          Configured Accounts — {selectedRoleConfig.title}
                        </h3>
                        <p className="text-[11px] text-slate-500">
                          Pre-configured sandbox accounts for evaluating <strong>{selectedRoleConfig.title}</strong> features.
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setRevealPasswords(!revealPasswords)}
                          className="px-2.5 py-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                        >
                          {revealPasswords ? 'Hide Passwords' : 'Show Passwords'}
                        </button>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                          {roleSpecificCredentials.length} {selectedRoleConfig.title}{' '}
                          {roleSpecificCredentials.length === 1 ? 'Account' : 'Accounts'}
                        </span>
                      </div>
                    </div>

                    {/* Account Cards for SELECTED ROLE */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
                      {roleSpecificCredentials.map((acc) => (
                        <div
                          key={acc.userId}
                          className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs space-y-2.5 shadow-2xs hover:border-blue-400 dark:hover:border-blue-500 transition-colors"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <div className="font-bold text-slate-900 dark:text-white truncate">
                                {acc.name}
                              </div>
                              <div className="text-[11px] text-slate-500 truncate">{acc.title}</div>
                            </div>
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 shrink-0">
                              {acc.role}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 dark:bg-slate-800/60 p-2 rounded-lg border border-slate-100 dark:border-slate-800 font-mono">
                            <div>
                              <span className="text-slate-400 block text-[9px] uppercase font-sans">
                                Login ID:
                              </span>
                              <span className="text-blue-600 dark:text-blue-400 font-bold break-all">
                                {acc.loginId}
                              </span>
                            </div>
                            <div>
                              <span className="text-slate-400 block text-[9px] uppercase font-sans">
                                Password:
                              </span>
                              <span className="text-slate-700 dark:text-slate-300 font-semibold break-all">
                                {revealPasswords ? acc.demoPassword : '••••••••••••'}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-1 text-[11px]">
                            <button
                              type="button"
                              onClick={() => handleCopy(acc.loginId, acc.userId + '-id')}
                              className="min-h-[36px] inline-flex items-center gap-1 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                            >
                              {copiedKey === acc.userId + '-id' ? (
                                <Check className="w-3.5 h-3.5 text-emerald-500" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                              <span>{copiedKey === acc.userId + '-id' ? 'Copied' : 'Copy ID'}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleFillCredentials(acc.loginId, acc.demoPassword)}
                              className="min-h-[36px] px-3 py-1 font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-lg transition-colors cursor-pointer"
                            >
                              Autofill Account →
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 pt-1">
                      <Sparkles className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      <span>
                        Clicking <strong>Autofill Account</strong> securely populates credentials into the form. In production, credentials remain unexposed.
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Note */}
        <div className="text-center text-xs text-slate-400">
          <p>© {new Date().getFullYear()} Client Management System. Authorized enterprise access only.</p>
          <p className="mt-0.5 text-[11px] text-slate-500">
            Enforced role verification active. Access to role dashboards requires valid credentials.
          </p>
        </div>
      </div>
    </div>
  );
};
