import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
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
      'inline-flex items-center justify-center font-semibold tracking-tight rounded-xl transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:translate-y-[1px] disabled:opacity-50 disabled:cursor-not-allowed select-none';

    const variantStyles = {
      primary:
        'bg-gradient-to-r from-violet-600 via-purple-600 to-rose-500 text-white hover:brightness-110 focus-visible:ring-violet-500 shadow-sm shadow-violet-600/25',
      secondary:
        'bg-emerald-50 text-emerald-900 border border-emerald-200 hover:bg-emerald-100 focus-visible:ring-emerald-500',
      outline:
        'border border-secondary-300 bg-white text-secondary-900 hover:bg-violet-50/40 hover:border-violet-400 focus-visible:ring-violet-500',
      ghost:
        'text-secondary-700 hover:bg-violet-50/60 hover:text-violet-700 focus-visible:ring-violet-500',
      danger:
        'bg-danger-600 text-white hover:bg-danger-700 focus-visible:ring-danger-600 shadow-sm',
    };

    const sizeStyles = {
      sm: 'px-3.5 py-2 text-xs gap-1.5',
      md: 'px-4 py-2.5 text-sm gap-2',
      lg: 'px-6 py-3.5 text-base gap-2.5',
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
