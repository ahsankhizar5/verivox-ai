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
        'bg-emerald-50 text-emerald-900 border border-emerald-200 hover:bg-emerald-100 focus-visible:ring-emerald-500',
      success:
        'bg-success-600 text-white hover:bg-success-700 focus-visible:ring-success-600 border border-success-700/20 shadow-soft',
      danger:
        'bg-danger-600 text-white hover:bg-danger-700 focus-visible:ring-danger-600 shadow-sm',
      warning:
        'bg-warning-500 text-secondary-950 hover:bg-warning-600 focus-visible:ring-warning-500 border border-warning-600/20 shadow-soft',
      outline:
        'border border-secondary-300 bg-white text-secondary-900 hover:bg-amber-50/50 hover:border-amber-400 focus-visible:ring-amber-500',
      ghost:
        'text-secondary-700 hover:bg-amber-50/60 hover:text-amber-800 focus-visible:ring-amber-500',
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
