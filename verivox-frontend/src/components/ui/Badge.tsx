import React from 'react';
import { cn } from '@/utils/helpers';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info';
  size?: 'sm' | 'md' | 'lg';
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    const variantStyles = {
      default: 'bg-white/10 text-stone-200 border-white/15',
      primary: 'bg-amber-500/15 text-amber-300 border-amber-400/30',
      secondary: 'bg-white/10 text-stone-300 border-white/15',
      success: 'bg-emerald-500/15 text-emerald-300 border-emerald-400/30',
      danger: 'bg-rose-500/15 text-rose-300 border-rose-400/30',
      warning: 'bg-amber-500/15 text-amber-300 border-amber-400/30',
      info: 'bg-emerald-500/15 text-emerald-300 border-emerald-400/30',
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
