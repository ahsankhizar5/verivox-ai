'use client';

import React, { useEffect } from 'react';
import { cn } from '@/utils/helpers';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
  id: string;
  title?: string;
  message: string;
  variant?: ToastVariant;
  duration?: number;
  onClose: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({
  id,
  title,
  message,
  variant = 'info',
  duration = 5000,
  onClose,
}) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose(id);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [id, duration, onClose]);

  const variants = {
    success: {
      container: 'bg-success-50 border-success-200 text-success-900',
      icon: CheckCircle,
      iconColor: 'text-success-600',
      progressBar: 'bg-success-600',
    },
    error: {
      container: 'bg-danger-50 border-danger-200 text-danger-900',
      icon: AlertCircle,
      iconColor: 'text-danger-600',
      progressBar: 'bg-danger-600',
    },
    warning: {
      container: 'bg-warning-50 border-warning-200 text-warning-900',
      icon: AlertTriangle,
      iconColor: 'text-warning-600',
      progressBar: 'bg-warning-600',
    },
    info: {
      container: 'bg-primary-50 border-primary-200 text-primary-900',
      icon: Info,
      iconColor: 'text-primary-600',
      progressBar: 'bg-primary-600',
    },
  };

  const config = variants[variant];
  const IconComponent = config.icon;

  return (
    <div
      className={cn(
        'relative flex items-start gap-3 p-4 rounded-lg border-2 shadow-lg backdrop-blur-sm',
        'animate-slide-down min-w-[320px] max-w-md',
        config.container
      )}
      role="alert"
    >
      {/* Icon */}
      <div className="flex-shrink-0">
        <IconComponent className={cn('w-5 h-5', config.iconColor)} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {title && (
          <h4 className="font-semibold text-sm mb-1">{title}</h4>
        )}
        <p className="text-sm leading-relaxed">{message}</p>
      </div>

      {/* Close Button */}
      <button
        onClick={() => onClose(id)}
        className={cn(
          'flex-shrink-0 p-1 rounded-md transition-colors',
          'hover:bg-black/10 focus:outline-none focus:ring-2 focus:ring-offset-1',
          config.iconColor
        )}
        aria-label="Close notification"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Progress Bar */}
      {duration > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/10 rounded-b-lg overflow-hidden">
          <div
            className={cn('h-full', config.progressBar)}
            style={{
              animation: `shrink ${duration}ms linear forwards`,
            }}
          />
        </div>
      )}

      <style jsx>{`
        @keyframes shrink {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </div>
  );
};

Toast.displayName = 'Toast';
