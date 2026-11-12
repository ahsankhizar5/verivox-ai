import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      fullWidth = false,
      className = '',
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-bold tracking-tight rounded-xl transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:translate-y-[1px] disabled:opacity-50 disabled:cursor-not-allowed select-none';

    const variantStyles = {
      primary:
        'bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 text-stone-950 hover:brightness-110 focus-visible:ring-amber-500 shadow-sm shadow-amber-500/20',
      secondary:
        'bg-emerald-500/15 text-emerald-300 border border-emerald-400/30 hover:bg-emerald-500/25 focus-visible:ring-emerald-500',
      success:
        'bg-emerald-600 text-white hover:bg-emerald-500 focus-visible:ring-emerald-500 border border-emerald-400/20 shadow-soft',
      danger:
        'bg-rose-600 text-white hover:bg-rose-500 focus-visible:ring-rose-500 shadow-sm',
      warning:
        'bg-amber-500 text-stone-950 hover:bg-amber-400 focus-visible:ring-amber-500 border border-amber-400/20 shadow-soft',
      outline:
        'border border-white/20 bg-white/5 text-stone-100 hover:bg-amber-500/15 hover:border-amber-400/40 hover:text-amber-300 focus-visible:ring-amber-500',
      ghost:
        'text-stone-300 hover:bg-white/10 hover:text-amber-300 focus-visible:ring-amber-500',
    };

    const sizeStyles = {
      sm: 'px-3.5 py-2 text-xs gap-1.5 min-h-[34px]',
      md: 'px-4 py-2.5 text-sm gap-2 min-h-[40px]',
      lg: 'px-6 py-3.5 text-base gap-2.5 min-h-[46px]',
      xl: 'px-6 py-3.5 sm:px-7 sm:py-4 text-base gap-3 min-h-[52px]',
    };

    const widthStyle = fullWidth ? 'w-full' : '';

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyle} ${className}`}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
