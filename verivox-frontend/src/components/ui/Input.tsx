import React from 'react';
import { cn } from '@/utils/helpers';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
  rightElement?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, icon, rightElement, type, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-xs font-mono uppercase tracking-wider text-secondary-700 mb-2">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-secondary-400 pointer-events-none">
              {icon}
            </div>
          )}
          <input
            type={type}
            className={cn(
              'w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all duration-150',
              'bg-white text-secondary-950 placeholder:text-secondary-400',
              'focus:outline-none focus:ring-2 focus:ring-primary-600/15 focus:border-primary-600',
              error
                ? 'border-danger-500 focus:ring-danger-500/15 focus:border-danger-600'
                : 'border-secondary-200 hover:border-secondary-300',
              icon && 'pl-10',
              rightElement && 'pr-10',
              className
            )}
            ref={ref}
            {...props}
          />
          {rightElement && (
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
              {rightElement}
            </div>
          )}
        </div>
        {error && <p className="mt-1.5 text-xs text-danger-600 font-medium">{error}</p>}
        {helperText && !error && (
          <p className="mt-1.5 text-xs text-secondary-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
