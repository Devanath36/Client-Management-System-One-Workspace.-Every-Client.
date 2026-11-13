import React from 'react';
import { Loader2 } from 'lucide-react';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-bold rounded-xl transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none cursor-pointer';

  const sizeStyles: Record<ButtonSize, string> = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-xs sm:text-sm px-4 py-2.5 gap-2',
    lg: 'text-sm sm:text-base px-6 py-3 gap-2.5',
  };

  const variantStyles: Record<ButtonVariant, string> = {
    primary:
      'bg-[#E50914] hover:bg-[#c40812] active:bg-[#99060e] text-white shadow-xs focus:ring-[#E50914] focus:ring-offset-[#101010]',
    secondary:
      'bg-[#171717] hover:bg-[#222222] active:bg-[#101010] text-[#FF7900] border border-[#333333] focus:ring-[#FF7900] focus:ring-offset-[#101010]',
    outline:
      'border border-[#333333] hover:border-[#E50914] hover:bg-[#1a1a1a] text-white focus:ring-[#E50914] focus:ring-offset-[#101010]',
    ghost:
      'bg-transparent hover:bg-[#1a1a1a] text-[#A3A3A3] hover:text-white focus:ring-[#333333]',
    danger:
      'bg-[#E50914] hover:bg-[#c40812] active:bg-[#99060e] text-white shadow-xs focus:ring-[#E50914] focus:ring-offset-[#101010]',
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
      ) : leftIcon ? (
        <span className="shrink-0">{leftIcon}</span>
      ) : null}
      <span>{children}</span>
      {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </button>
  );
};
