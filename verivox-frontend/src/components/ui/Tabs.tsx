'use client';

import React from 'react';
import { cn } from '@/utils/helpers';

interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string | number;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'dark';
}

export const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onChange, className, size = 'md', variant = 'default' }) => {
  const sizeClasses = {
    sm: 'py-2 text-sm',
    md: 'py-4 text-sm',
    lg: 'py-6 text-base',
  } as const;

  const isDark = variant === 'dark';

  return (
    <div className={cn(isDark ? 'border-b border-white/20' : 'border-b border-secondary-200', className)}>
      <nav className="-mb-px flex space-x-6" aria-label="Tabs">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={cn(
                'group inline-flex items-center gap-2 px-1 border-b-2 font-medium transition-colors',
                sizeClasses[size],
                isDark
                  ? isActive
                    ? 'border-white text-white'
                    : 'border-transparent text-white/70 hover:text-white hover:border-white/50'
                  : isActive
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-secondary-500 hover:text-secondary-700 hover:border-secondary-300'
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              {tab.icon && (
                <span className={cn(
                  isDark
                    ? isActive ? 'text-white' : 'text-white/70 group-hover:text-white'
                    : isActive ? 'text-primary-600' : 'text-secondary-400 group-hover:text-secondary-500'
                )}>
                  {tab.icon}
                </span>
              )}
              {tab.label}
              {tab.badge && (
                <span className={cn(
                  'ml-2 py-0.5 px-2 rounded-full text-xs font-medium',
                  isDark
                    ? isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-white/10 text-white/80'
                    : isActive
                      ? 'bg-primary-100 text-primary-700'
                      : 'bg-secondary-100 text-secondary-700'
                )}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};
