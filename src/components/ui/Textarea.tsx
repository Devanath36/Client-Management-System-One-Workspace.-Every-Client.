import React from 'react';
import { AlertCircle } from 'lucide-react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea: React.FC<TextareaProps> = ({
  label,
  error,
  helperText,
  id,
  className = '',
  required,
  rows = 3,
  ...props
}) => {
  const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="space-y-1.5 w-full">
      {label && (
        <label
          htmlFor={textareaId}
          className="block text-xs font-semibold text-[#333333] dark:text-[#D4D4D4]"
        >
          {label} {required && <span className="text-[#E50914]">*</span>}
        </label>
      )}

      <textarea
        id={textareaId}
        rows={rows}
        required={required}
        className={`w-full text-xs sm:text-sm bg-white dark:bg-[#171717] border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E50914] focus:border-[#E50914] text-[#101010] dark:text-white transition-colors duration-150 p-3 shadow-xs ${
          error
            ? 'border-[#E50914] dark:border-[#E50914] focus:ring-[#E50914]'
            : 'border-[#E0E0E0] dark:border-[#333333]'
        } ${className}`}
        {...props}
      />

      {error ? (
        <p className="text-xs text-[#E50914] font-medium flex items-center gap-1 mt-1">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </p>
      ) : helperText ? (
        <p className="text-[11px] text-[#666666] dark:text-[#A3A3A3] mt-1">{helperText}</p>
      ) : null}
    </div>
  );
};
