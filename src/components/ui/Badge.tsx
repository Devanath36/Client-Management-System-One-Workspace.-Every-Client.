import React from 'react';

export type BadgeVariant = 'red' | 'yellow' | 'orange' | 'white' | 'black' | 'blue' | 'emerald' | 'amber' | 'rose' | 'slate' | 'indigo' | 'purple';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'red',
  dot = false,
  className = '',
  ...props
}) => {
  const variantStyles: Record<string, { bg: string; dot: string }> = {
    red: {
      bg: 'bg-[#E50914]/15 text-[#E50914] border-[#E50914]/40',
      dot: 'bg-[#E50914]',
    },
    yellow: {
      bg: 'bg-[#FFC928]/15 text-[#FFC928] border-[#FFC928]/40',
      dot: 'bg-[#FFC928]',
    },
    orange: {
      bg: 'bg-[#FF7900]/15 text-[#FF7900] border-[#FF7900]/40',
      dot: 'bg-[#FF7900]',
    },
    white: {
      bg: 'bg-white/10 text-white border-[#333333]',
      dot: 'bg-white',
    },
    black: {
      bg: 'bg-[#101010] text-[#A3A3A3] border-[#333333]',
      dot: 'bg-[#A3A3A3]',
    },
    // Aliases ensuring zero blue
    blue: {
      bg: 'bg-[#E50914]/15 text-[#E50914] border-[#E50914]/40',
      dot: 'bg-[#E50914]',
    },
    indigo: {
      bg: 'bg-[#FF7900]/15 text-[#FF7900] border-[#FF7900]/40',
      dot: 'bg-[#FF7900]',
    },
    purple: {
      bg: 'bg-[#E50914]/15 text-[#E50914] border-[#E50914]/40',
      dot: 'bg-[#E50914]',
    },
    amber: {
      bg: 'bg-[#FFC928]/15 text-[#FFC928] border-[#FFC928]/40',
      dot: 'bg-[#FFC928]',
    },
    emerald: {
      bg: 'bg-[#FFC928]/15 text-[#FFC928] border-[#FFC928]/40',
      dot: 'bg-[#FFC928]',
    },
    rose: {
      bg: 'bg-[#E50914]/15 text-[#E50914] border-[#E50914]/40',
      dot: 'bg-[#E50914]',
    },
    slate: {
      bg: 'bg-[#101010] text-[#A3A3A3] border-[#333333]',
      dot: 'bg-[#A3A3A3]',
    },
  };

  const style = variantStyles[variant] || variantStyles.red;

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
