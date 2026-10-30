'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { label: string; value: string | number }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, id, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={cn(
              'w-full appearance-none rounded-lg border bg-white dark:bg-zinc-900/60 px-3 py-2 pr-9 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 transition-all cursor-pointer',
              error
                ? 'border-rose-500 focus:ring-rose-500/20'
                : 'border-zinc-300 dark:border-zinc-800 focus:border-indigo-500 dark:focus:border-indigo-500 focus:ring-indigo-500/20',
              className
            )}
            {...props}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">
                {opt.label}
              </option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
        {error && <p className="text-xs text-rose-500">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';
