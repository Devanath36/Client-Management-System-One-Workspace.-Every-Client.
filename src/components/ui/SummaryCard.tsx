import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export interface SummaryCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: string;
    isPositive?: boolean;
    label?: string;
  };
  badge?: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  badge,
  className = '',
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={`p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs transition-all duration-150 ${
        onClick ? 'cursor-pointer hover:border-blue-400 dark:hover:border-blue-600 hover:shadow-sm' : ''
      } ${className}`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-tight">
          {title}
        </span>
        {icon && (
          <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            {icon}
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline justify-between gap-2 flex-wrap">
        <span className="text-2xl font-bold text-slate-900 dark:text-white font-mono tracking-tight tabular-nums">
          {value}
        </span>

        {badge && <div className="shrink-0">{badge}</div>}
      </div>

      {(subtitle || trend) && (
        <div className="mt-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-2 flex-wrap pt-1 border-t border-slate-100 dark:border-slate-800/80">
          {subtitle && <span className="truncate">{subtitle}</span>}

          {trend && (
            <span
              className={`inline-flex items-center gap-1 font-semibold ml-auto text-[11px] ${
                trend.isPositive
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              {trend.isPositive ? (
                <ArrowUpRight className="w-3.5 h-3.5" />
              ) : (
                <ArrowDownRight className="w-3.5 h-3.5" />
              )}
              <span>{trend.value}</span>
              {trend.label && <span className="text-slate-400 font-normal">({trend.label})</span>}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
