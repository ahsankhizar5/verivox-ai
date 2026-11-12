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
      info: 'bg-blue-50 border-blue-200 text-blue-800',
      success: 'bg-success-50 border-success-200 text-success-800',
      warning: 'bg-warning-50 border-warning-200 text-warning-800',
      danger: 'bg-danger-50 border-danger-200 text-danger-800',
    };

    return (
      <div
        ref={ref}
        role="alert"
        className={cn(
          'relative rounded-lg border p-4',
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
              className="ml-4 -mt-1 -mr-1 p-1 rounded-md hover:bg-black/5 transition-colors"
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
