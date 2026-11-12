'use client';

import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/utils/helpers';

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  className?: string;
}

export const Select: React.FC<SelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Select an option',
  label,
  error,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label className="block text-sm font-medium text-secondary-700 mb-1.5">
          {label}
        </label>
      )}
      <div ref={selectRef} className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            'w-full px-4 py-2.5 rounded-lg border transition-colors duration-200 text-left',
            'bg-white text-secondary-900 focus:outline-none focus:ring-2 focus:ring-primary-500',
            error
              ? 'border-danger-500 focus:ring-danger-500'
              : 'border-secondary-300 hover:border-secondary-400'
          )}
        >
          <span className={cn(!selectedOption && 'text-secondary-400')}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <span className="absolute right-3 top-1/2 -translate-y-1/2">
            <svg className="w-5 h-5 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </span>
        </button>

        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-secondary-200 rounded-lg shadow-lg max-h-60 overflow-auto">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={cn(
                  'w-full px-4 py-2.5 text-left hover:bg-secondary-50 transition-colors',
                  option.value === value && 'bg-primary-50 text-primary-700 font-medium'
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>
      {error && (
        <p className="mt-1.5 text-sm text-danger-600">{error}</p>
      )}
    </div>
  );
};
