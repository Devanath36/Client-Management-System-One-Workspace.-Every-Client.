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
          className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
        >
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      <textarea
        id={textareaId}
        rows={rows}
        required={required}
        className={`w-full text-xs sm:text-sm bg-white dark:bg-slate-800 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 dark:text-white transition-colors duration-150 p-3 shadow-xs ${
          error
            ? 'border-rose-500 dark:border-rose-600 focus:ring-rose-500'
            : 'border-slate-300 dark:border-slate-700'
        } ${className}`}
        {...props}
      />

      {error ? (
        <p className="text-xs text-rose-500 dark:text-rose-400 font-medium flex items-center gap-1 mt-1">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </p>
      ) : helperText ? (
        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">{helperText}</p>
      ) : null}
    </div>
  );
};
