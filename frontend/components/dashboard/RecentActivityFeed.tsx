'use client';

import React from 'react';
import { Activity } from '@/types';
import { formatDateTime } from '@/lib/utils';
import { Clock, Briefcase, CalendarCheck2, Award, MessageSquare } from 'lucide-react';

interface RecentActivityFeedProps {
  activities: Activity[];
}

export function RecentActivityFeed({ activities }: RecentActivityFeedProps) {
  if (!activities || activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center text-zinc-400">
        <Clock className="w-8 h-8 mb-2 opacity-50" />
        <p className="text-xs">No recent activity logged yet.</p>
      </div>
    );
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'OFFER_RECEIVED':
        return <Award className="w-3.5 h-3.5 text-emerald-400" />;
      case 'INTERVIEW_SCHEDULED':
      case 'INTERVIEW_UPDATED':
        return <CalendarCheck2 className="w-3.5 h-3.5 text-purple-400" />;
      case 'APPLICATION_CREATED':
        return <Briefcase className="w-3.5 h-3.5 text-sky-400" />;
      default:
        return <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />;
    }
  };

  return (
    <div className="space-y-3">
      {activities.map((act) => (
        <div
          key={act._id}
          className="flex items-start gap-3 p-3 rounded-xl bg-zinc-50/50 dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 text-xs"
        >
          <div className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/80 shrink-0 mt-0.5">
            {getIcon(act.type)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-zinc-900 dark:text-zinc-100 leading-snug">
              {act.description}
            </p>
            <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1">
              {formatDateTime(act.createdAt)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
