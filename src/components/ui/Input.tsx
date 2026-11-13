import React, { useState } from 'react';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isPassword?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  isPassword = false,
  type = 'text',
  id,
  className = '',
  required,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  const effectiveType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className="space-y-1.5 w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-semibold text-white"
        >
          {label} {required && <span className="text-[#E50914]">*</span>}
        </label>
      )}

      <div className="relative rounded-xl shadow-xs">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#A3A3A3]">
            {leftIcon}
          </div>
        )}

        <input
          id={inputId}
          type={effectiveType}
          required={required}
          className={`w-full text-xs sm:text-sm bg-[#101010] border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E50914] focus:border-[#E50914] text-white transition-colors duration-150 py-2.5 ${
            leftIcon ? 'pl-10' : 'pl-3.5'
          } ${isPassword || rightIcon ? 'pr-11' : 'pr-3.5'} ${
            error
              ? 'border-[#E50914] focus:ring-[#E50914]'
              : 'border-[#333333] hover:border-[#666666]'
          } ${className}`}
          {...props}
        />

        {isPassword ? (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#A3A3A3] hover:text-white transition-colors"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        ) : rightIcon ? (
          <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-[#A3A3A3]">
            {rightIcon}
          </div>
        ) : null}
      </div>

      {error ? (
        <p className="text-xs text-[#E50914] font-medium flex items-center gap-1 mt-1">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </p>
      ) : helperText ? (
        <p className="text-[11px] text-[#A3A3A3] mt-1">{helperText}</p>
      ) : null}
    </div>
  );
};
