'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, icon, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {icon && (
            <div className="absolute left-3 text-zinc-400 dark:text-zinc-500 pointer-events-none flex items-center">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'w-full rounded-lg border bg-white dark:bg-zinc-900/60 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-2 transition-all',
              icon ? 'pl-9' : 'pl-3',
              error
                ? 'border-rose-500 focus:ring-rose-500/20'
                : 'border-zinc-300 dark:border-zinc-800 focus:border-indigo-500 dark:focus:border-indigo-500 focus:ring-indigo-500/20',
              className
            )}
            {...props}
          />
        </div>
        {error && <p className="text-xs text-rose-500">{error}</p>}
        {helperText && !error && (
          <p className="text-xs text-zinc-500 dark:text-zinc-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
