'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Sidebar } from './Sidebar';
import { TopNav } from './TopNav';
import { ApplicationModal } from '@/components/applications/ApplicationModal';
import { Loader2 } from 'lucide-react';

interface DashboardShellProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export function DashboardShell({ children, title, subtitle }: DashboardShellProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isNewAppModalOpen, setIsNewAppModalOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-50 dark:bg-zinc-950">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          <p className="text-sm text-zinc-500">Loading CV Tracker...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-50/50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopNav
          title={title}
          subtitle={subtitle}
          onNewApplication={() => setIsNewAppModalOpen(true)}
        />
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>

      <ApplicationModal
        isOpen={isNewAppModalOpen}
        onClose={() => setIsNewAppModalOpen(false)}
        onSaved={() => {
          setIsNewAppModalOpen(false);
          // Trigger custom event so active pages refresh seamlessly
          window.dispatchEvent(new Event('application-saved'));
        }}
      />
    </div>
  );
}
