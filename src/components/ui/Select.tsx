import React from 'react';
import { AlertCircle, ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options?: SelectOption[];
  leftIcon?: React.ReactNode;
}

export const Select: React.FC<SelectProps> = ({
  label,
  error,
  helperText,
  options,
  leftIcon,
  children,
  id,
  className = '',
  required,
  ...props
}) => {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="space-y-1.5 w-full">
      {label && (
        <label
          htmlFor={selectId}
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

        <select
          id={selectId}
          required={required}
          className={`w-full appearance-none text-xs sm:text-sm bg-[#101010] border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E50914] focus:border-[#E50914] text-white transition-colors duration-150 py-2.5 ${
            leftIcon ? 'pl-10' : 'pl-3.5'
          } pr-10 cursor-pointer ${
            error
              ? 'border-[#E50914] focus:ring-[#E50914]'
              : 'border-[#333333] hover:border-[#666666]'
          } ${className}`}
          {...props}
        >
          {options
            ? options.map((opt) => (
                <option key={opt.value} value={opt.value} disabled={opt.disabled} className="bg-[#101010] text-white">
                  {opt.label}
                </option>
              ))
            : children}
        </select>

        <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-[#A3A3A3]">
          <ChevronDown className="w-4 h-4" />
        </div>
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
