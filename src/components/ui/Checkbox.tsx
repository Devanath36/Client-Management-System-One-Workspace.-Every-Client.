import React from 'react';
import { Check } from 'lucide-react';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: React.ReactNode;
  description?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  label,
  description,
  id,
  checked,
  className = '',
  disabled,
  ...props
}) => {
  const checkboxId = id || (typeof label === 'string' ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <label
      htmlFor={checkboxId}
      className={`flex items-start gap-2.5 cursor-pointer select-none ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      } ${className}`}
    >
      <div className="relative flex items-center justify-center mt-0.5">
        <input
          id={checkboxId}
          type="checkbox"
          checked={checked}
          disabled={disabled}
          className="peer sr-only"
          {...props}
        />
        <div className="w-4 h-4 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 peer-checked:bg-blue-600 peer-checked:border-blue-600 peer-focus:ring-2 peer-focus:ring-blue-500/30 transition-all flex items-center justify-center text-white">
          <Check className="w-3 h-3 stroke-[3] opacity-0 peer-checked:opacity-100 transition-opacity" />
        </div>
      </div>

      {(label || description) && (
        <div className="text-xs">
          {label && (
            <span className="font-medium text-slate-800 dark:text-slate-200 block">
              {label}
            </span>
          )}
          {description && (
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
              {description}
            </span>
          )}
        </div>
      )}
    </label>
  );
};
