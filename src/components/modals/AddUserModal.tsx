import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import { Eye, EyeOff, User, KeyRound, Shield, Lock, AlertCircle } from 'lucide-react';

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddUserModal: React.FC<AddUserModalProps> = ({ isOpen, onClose }) => {
  const { users, addUser } = useApp();

  // ONLY 4 REQUIRED FIELDS
  const [name, setName] = useState('');
  const [loginId, setLoginId] = useState('');
  const [initialPassword, setInitialPassword] = useState('');
  const [role, setRole] = useState<UserRole>('team_member');

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    loginId?: string;
    initialPassword?: string;
    role?: string;
    general?: string;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setName('');
    setLoginId('');
    setInitialPassword('');
    setRole('team_member');
    setShowPassword(false);
    setErrors({});
    setIsSubmitting(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: typeof errors = {};

    const trimmedName = name.trim();
    const trimmedLoginId = loginId.trim().toLowerCase();
    const trimmedPassword = initialPassword.trim();

    // 1. Full Name Validation
    if (!trimmedName) {
      newErrors.name = 'Full Name is required.';
    } else if (trimmedName.length < 2) {
      newErrors.name = 'Full Name must be at least 2 characters.';
    }

    // 2. Login ID Validation & Duplicate Check
    if (!trimmedLoginId) {
      newErrors.loginId = 'Login ID is required.';
    } else if (trimmedLoginId.length < 3) {
      newErrors.loginId = 'Login ID must be at least 3 characters.';
    } else if (/\s/.test(trimmedLoginId)) {
      newErrors.loginId = 'Login ID cannot contain spaces.';
    } else {
      const isDuplicate = users.some(
        (u) => u.loginId && u.loginId.toLowerCase() === trimmedLoginId
      );
      if (isDuplicate) {
        newErrors.loginId = `Login ID "${loginId.trim()}" is already registered. Please choose a unique Login ID.`;
      }
    }

    // 3. Initial Password Validation
    if (!trimmedPassword) {
      newErrors.initialPassword = 'Initial Account Password is required.';
    } else if (trimmedPassword.length < 4) {
      newErrors.initialPassword = 'Password must be at least 4 characters.';
    }

    // 4. Role Validation
    if (!role || !['admin', 'manager', 'team_lead', 'team_member'].includes(role)) {
      newErrors.role = 'Please select a valid Designated System Role.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);

    const result = addUser(
      {
        name: trimmedName,
        loginId: trimmedLoginId,
        role,
      },
      trimmedPassword
    );

    setIsSubmitting(false);

    if (result && !result.success) {
      setErrors({ general: result.error || 'Failed to provision user.' });
      return;
    }

    handleClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Provision Organization User"
      description="Create a verified employee account and designate system role permissions."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto max-h-[75vh]">
        {/* General Error Banner */}
        {errors.general && (
          <div className="p-3.5 bg-[#E50914]/10 border border-[#E50914]/30 rounded-xl flex items-start gap-2.5 text-xs text-[#E50914]">
            <AlertCircle className="w-4 h-4 text-[#E50914] shrink-0 mt-0.5" />
            <span className="leading-relaxed">{errors.general}</span>
          </div>
        )}

        {/* Responsive Grid: 2 columns on tablet/desktop, 1 column on mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* 1. Full Name */}
          <div className="space-y-1.5">
            <label
              htmlFor="provision-fullname"
              className="block text-xs font-semibold text-[#333333] dark:text-[#D4D4D4]"
            >
              Full Name <span className="text-[#E50914]">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#888888]">
                <User className="w-4 h-4" />
              </div>
              <input
                id="provision-fullname"
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
                }}
                placeholder="e.g. Cameron Wright"
                className={`w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm bg-white dark:bg-[#101010] border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E50914] text-[#101010] dark:text-white transition-colors ${
                  errors.name
                    ? 'border-[#E50914] focus:ring-[#E50914]'
                    : 'border-[#E0E0E0] dark:border-[#333333]'
                }`}
              />
            </div>
            {errors.name && (
              <p className="text-[11px] text-[#E50914] font-medium">{errors.name}</p>
            )}
          </div>

          {/* 2. Login ID */}
          <div className="space-y-1.5">
            <label
              htmlFor="provision-loginid"
              className="block text-xs font-semibold text-[#333333] dark:text-[#D4D4D4]"
            >
              Login ID <span className="text-[#E50914]">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#888888]">
                <KeyRound className="w-4 h-4" />
              </div>
              <input
                id="provision-loginid"
                type="text"
                value={loginId}
                onChange={(e) => {
                  setLoginId(e.target.value);
                  if (errors.loginId) setErrors((prev) => ({ ...prev, loginId: undefined }));
                }}
                placeholder="e.g. cameron.wright"
                className={`w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm bg-white dark:bg-[#101010] border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E50914] text-[#101010] dark:text-white font-mono transition-colors ${
                  errors.loginId
                    ? 'border-[#E50914] focus:ring-[#E50914]'
                    : 'border-[#E0E0E0] dark:border-[#333333]'
                }`}
              />
            </div>
            {errors.loginId && (
              <p className="text-[11px] text-[#E50914] font-medium">{errors.loginId}</p>
            )}
          </div>

          {/* 3. Initial Account Password */}
          <div className="space-y-1.5">
            <label
              htmlFor="provision-password"
              className="block text-xs font-semibold text-[#333333] dark:text-[#D4D4D4]"
            >
              Initial Account Password <span className="text-[#E50914]">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#888888]">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="provision-password"
                type={showPassword ? 'text' : 'password'}
                value={initialPassword}
                onChange={(e) => {
                  setInitialPassword(e.target.value);
                  if (errors.initialPassword) {
                    setErrors((prev) => ({ ...prev, initialPassword: undefined }));
                  }
                }}
                placeholder="Assign account password"
                className={`w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm bg-white dark:bg-[#101010] border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E50914] text-[#101010] dark:text-white transition-colors ${
                  errors.initialPassword
                    ? 'border-[#E50914] focus:ring-[#E50914]'
                    : 'border-[#E0E0E0] dark:border-[#333333]'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#888888] hover:text-[#101010] dark:hover:text-white transition-colors cursor-pointer"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.initialPassword && (
              <p className="text-[11px] text-[#E50914] font-medium">{errors.initialPassword}</p>
            )}
          </div>

          {/* 4. Designated System Role */}
          <div className="space-y-1.5">
            <label
              htmlFor="provision-role"
              className="block text-xs font-semibold text-[#333333] dark:text-[#D4D4D4]"
            >
              Designated System Role <span className="text-[#E50914]">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#888888]">
                <Shield className="w-4 h-4" />
              </div>
              <select
                id="provision-role"
                value={role}
                onChange={(e) => {
                  setRole(e.target.value as UserRole);
                  if (errors.role) setErrors((prev) => ({ ...prev, role: undefined }));
                }}
                className={`w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-white dark:bg-[#101010] border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E50914] text-[#101010] dark:text-white transition-colors cursor-pointer ${
                  errors.role
                    ? 'border-[#E50914] focus:ring-[#E50914]'
                    : 'border-[#E0E0E0] dark:border-[#333333]'
                }`}
              >
                <option value="admin">Administrator</option>
                <option value="manager">Manager</option>
                <option value="team_lead">Team Lead</option>
                <option value="team_member">Team Member</option>
              </select>
            </div>
            {errors.role && (
              <p className="text-[11px] text-[#E50914] font-medium">{errors.role}</p>
            )}
          </div>
        </div>

        {/* Security callout note */}
        <div className="p-3 bg-[#F7F7F7] dark:bg-[#101010] border border-[#E0E0E0] dark:border-[#333333] rounded-xl text-[11px] text-[#555555] dark:text-[#A3A3A3] flex items-center gap-2">
          <Shield className="w-4 h-4 text-[#E50914] shrink-0" />
          <span>
            Passwords are securely hashed (SHA-256) before storage. The new user will be able to sign in immediately with their Login ID.
          </span>
        </div>

        {/* Modal Action Buttons at bottom */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E0E0E0] dark:border-[#333333]">
          <button
            type="button"
            onClick={handleClose}
            className="min-h-[44px] px-4 py-2 text-xs font-semibold text-[#555555] dark:text-[#A3A3A3] hover:text-[#101010] dark:hover:text-white rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="min-h-[44px] px-5 py-2 text-xs font-bold text-white bg-[#E50914] hover:bg-[#b80710] rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50 inline-flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Provisioning...</span>
              </>
            ) : (
              <span>Provision User</span>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};
