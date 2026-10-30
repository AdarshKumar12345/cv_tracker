'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'outline' | 'dot';
  dotColor?: string;
  className?: string;
}

export function Badge({ children, variant = 'default', dotColor, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border',
        className
      )}
    >
      {variant === 'dot' && (
        <span
          className={cn('w-1.5 h-1.5 rounded-full shrink-0', dotColor || 'bg-current')}
        />
      )}
      {children}
    </span>
  );
}
