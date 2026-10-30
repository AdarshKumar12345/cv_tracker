'use client';

import React from 'react';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { Sun, Moon, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface TopNavProps {
  onNewApplication?: () => void;
  title?: string;
  subtitle?: string;
}

export function TopNav({ onNewApplication, title, subtitle }: TopNavProps) {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between h-16 px-6 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/70 backdrop-blur-md">
      <div>
        {title ? (
          <div>
            <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {subtitle}
              </p>
            )}
          </div>
        ) : (
          <div className="text-sm text-zinc-500 dark:text-zinc-400">
            Welcome back, <span className="font-semibold text-zinc-900 dark:text-zinc-200">{user?.name}</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        {onNewApplication && (
          <Button
            size="sm"
            onClick={onNewApplication}
            icon={<Plus className="w-4 h-4" />}
          >
            New Application
          </Button>
        )}

        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 transition-colors"
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-indigo-500" />
          )}
        </button>
      </div>
    </header>
  );
}
