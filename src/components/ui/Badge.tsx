import React from 'react';

export type BadgeVariant = 'blue' | 'emerald' | 'amber' | 'rose' | 'slate' | 'indigo' | 'purple';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'blue',
  dot = false,
  className = '',
  ...props
}) => {
  const variantStyles: Record<BadgeVariant, { bg: string; dot: string }> = {
    blue: {
      bg: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800/60',
      dot: 'bg-blue-500',
    },
    emerald: {
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800/60',
      dot: 'bg-emerald-500',
    },
    amber: {
      bg: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800/60',
      dot: 'bg-amber-500',
    },
    rose: {
      bg: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800/60',
      dot: 'bg-rose-500',
    },
    slate: {
      bg: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
      dot: 'bg-slate-400',
    },
    indigo: {
      bg: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-800/60',
      dot: 'bg-indigo-500',
    },
    purple: {
      bg: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800/60',
      dot: 'bg-purple-500',
    },
  };

  const style = variantStyles[variant] || variantStyles.blue;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${style.bg} ${className}`}
      {...props}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />}
      <span>{children}</span>
    </span>
  );
};
