import React from 'react';
import { cn } from '@/utils/helpers';
import { X } from 'lucide-react';

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'info' | 'success' | 'warning' | 'danger';
  title?: string;
  dismissible?: boolean;
  onDismiss?: () => void;
}

export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  (
    { className, variant = 'info', title, dismissible, onDismiss, children, ...props },
    ref
  ) => {
    const variants = {
      info: 'bg-amber-500/15 border-amber-400/30 text-amber-200',
      success: 'bg-emerald-500/15 border-emerald-400/30 text-emerald-200',
      warning: 'bg-amber-500/15 border-amber-400/30 text-amber-200',
      danger: 'bg-rose-500/15 border-rose-400/30 text-rose-200',
    };

    return (
      <div
        ref={ref}
        role="alert"
        className={cn(
          'relative rounded-xl border p-4',
          variants[variant],
          className
        )}
        {...props}
      >
        <div className="flex items-start">
          <div className="flex-1">
            {title && (
              <h5 className="font-semibold mb-1">{title}</h5>
            )}
            <div className="text-sm">{children}</div>
          </div>
          {dismissible && (
            <button
              onClick={onDismiss}
              className="ml-4 -mt-1 -mr-1 p-1 rounded-md hover:bg-white/10 transition-colors"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    );
  }
);

Alert.displayName = 'Alert';
