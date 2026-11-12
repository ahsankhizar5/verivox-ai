'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { ToastContainer } from '@/components/ui/ToastContainer';
import { ToastProps, ToastVariant } from '@/components/ui/Toast';

interface ToastOptions {
  title?: string;
  message: string;
  variant?: ToastVariant;
  duration?: number;
}

interface ToastContextType {
  showToast: (options: ToastOptions) => void;
  success: (message: string, title?: string, duration?: number) => void;
  error: (message: string, title?: string, duration?: number) => void;
  warning: (message: string, title?: string, duration?: number) => void;
  info: (message: string, title?: string, duration?: number) => void;
  removeToast: (id: string) => void;
  clearAll: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

interface ToastProviderProps {
  children: React.ReactNode;
  position?: 'top-right' | 'top-left' | 'top-center' | 'bottom-right' | 'bottom-left' | 'bottom-center';
  maxToasts?: number;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({
  children,
  position = 'top-right',
  maxToasts = 5,
}) => {
  const [toasts, setToasts] = useState<Omit<ToastProps, 'onClose'>[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    ({ title, message, variant = 'info', duration = 5000 }: ToastOptions) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const newToast: Omit<ToastProps, 'onClose'> = {
        id,
        title,
        message,
        variant,
        duration,
      };

      setToasts((prev) => {
        const updated = [...prev, newToast];
        // Limit the number of toasts
        if (updated.length > maxToasts) {
          return updated.slice(-maxToasts);
        }
        return updated;
      });
    },
    [maxToasts]
  );

  const success = useCallback(
    (message: string, title?: string, duration?: number) => {
      showToast({ message, title, variant: 'success', duration });
    },
    [showToast]
  );

  const error = useCallback(
    (message: string, title?: string, duration?: number) => {
      showToast({ message, title, variant: 'error', duration });
    },
    [showToast]
  );

  const warning = useCallback(
    (message: string, title?: string, duration?: number) => {
      showToast({ message, title, variant: 'warning', duration });
    },
    [showToast]
  );

  const info = useCallback(
    (message: string, title?: string, duration?: number) => {
      showToast({ message, title, variant: 'info', duration });
    },
    [showToast]
  );

  const clearAll = useCallback(() => {
    setToasts([]);
  }, []);

  return (
    <ToastContext.Provider
      value={{
        showToast,
        success,
        error,
        warning,
        info,
        removeToast,
        clearAll,
      }}
    >
      {children}
      <ToastContainer toasts={toasts} onClose={removeToast} position={position} />
    </ToastContext.Provider>
  );
};
