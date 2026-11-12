import React from 'react';
import { cn } from '@/utils/helpers';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info';
  size?: 'sm' | 'md' | 'lg';
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    const variantStyles = {
      default: 'bg-secondary-100 text-secondary-800 border-secondary-200',
      primary: 'bg-amber-50 text-amber-900 border-amber-200',
      secondary: 'bg-secondary-100 text-secondary-700 border-secondary-200',
      success: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      danger: 'bg-rose-50 text-rose-800 border-rose-200',
      warning: 'bg-amber-50 text-amber-800 border-amber-200',
      info: 'bg-emerald-50 text-emerald-900 border-emerald-200',
    };

    const sizeStyles = {
      sm: 'px-2.5 py-0.5 text-xs',
      md: 'px-3 py-1 text-xs',
      lg: 'px-3.5 py-1.5 text-xs sm:text-sm',
    };

    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center gap-1.5 font-mono font-medium rounded-full border tracking-tight',
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';
