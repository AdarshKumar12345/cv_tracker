'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ReactNode;
  trend?: string;
  trendPositive?: boolean;
  colorClass?: string;
}

export function StatCard({
  title,
  value,
  description,
  icon,
  trend,
  trendPositive = true,
  colorClass = 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20',
}: StatCardProps) {
  return (
    <Card hoverEffect className="relative overflow-hidden">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          {title}
        </span>
        <div className={cn('p-2.5 rounded-xl border', colorClass)}>
          {icon}
        </div>
      </div>

      <div className="mt-3">
        <div className="text-2xl lg:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
          {value}
        </div>
        {(description || trend) && (
          <div className="flex items-center gap-1.5 mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            {trend && (
              <span
                className={`font-semibold ${
                  trendPositive ? 'text-emerald-500' : 'text-rose-500'
                }`}
              >
                {trend}
              </span>
            )}
            {description && <span>{description}</span>}
          </div>
        )}
      </div>
    </Card>
  );
}
