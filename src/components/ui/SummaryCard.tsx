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
      className={`p-5 bg-[#171717] rounded-2xl border border-[#333333] shadow-xs transition-all duration-150 ${
        onClick ? 'cursor-pointer hover:border-[#E50914] hover:shadow-md' : ''
      } ${className}`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold text-[#A3A3A3] tracking-tight">
          {title}
        </span>
        {icon && (
          <div className="w-8 h-8 rounded-xl bg-[#101010] border border-[#333333] text-[#FFC928] flex items-center justify-center shrink-0">
            {icon}
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline justify-between gap-2 flex-wrap">
        <span className="text-2xl font-black text-white font-mono tracking-tight tabular-nums">
          {value}
        </span>

        {badge && <div className="shrink-0">{badge}</div>}
      </div>

      {(subtitle || trend) && (
        <div className="mt-2 flex items-center justify-between text-xs text-[#A3A3A3] gap-2 flex-wrap pt-2 border-t border-[#333333]">
          {subtitle && <span className="truncate">{subtitle}</span>}

          {trend && (
            <span
              className={`inline-flex items-center gap-1 font-bold ml-auto text-[11px] ${
                trend.isPositive
                  ? 'text-[#FFC928]'
                  : 'text-[#E50914]'
              }`}
            >
              {trend.isPositive ? (
                <ArrowUpRight className="w-3.5 h-3.5" />
              ) : (
                <ArrowDownRight className="w-3.5 h-3.5" />
              )}
              <span>{trend.value}</span>
              {trend.label && <span className="text-[#A3A3A3] font-normal">({trend.label})</span>}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
