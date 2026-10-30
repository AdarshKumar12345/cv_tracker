'use client';

import React from 'react';
import { Interview } from '@/types';
import { formatDateTime } from '@/lib/utils';
import { CalendarCheck2, Video, Phone, Building2, ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface UpcomingInterviewsListProps {
  interviews: Interview[];
  onScheduleClick?: () => void;
}

export function UpcomingInterviewsList({
  interviews,
  onScheduleClick,
}: UpcomingInterviewsListProps) {
  if (!interviews || interviews.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center bg-zinc-50/50 dark:bg-zinc-900/30 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800">
        <CalendarCheck2 className="w-8 h-8 text-zinc-400 mb-2" />
        <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          No upcoming interviews scheduled
        </p>
        <p className="text-xs text-zinc-500 mt-0.5">
          Interviews you schedule will appear here with calendar dates and meeting links.
        </p>
        {onScheduleClick && (
          <button
            onClick={onScheduleClick}
            className="mt-3 text-xs font-semibold text-indigo-500 hover:text-indigo-400 transition-colors"
          >
            + Schedule an interview
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {interviews.map((item) => (
        <div
          key={item._id}
          className="flex items-center justify-between p-3.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/50 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all group"
        >
          <div className="flex items-start gap-3 min-w-0">
            <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 shrink-0 mt-0.5">
              {item.interviewType === 'Video' ? (
                <Video className="w-4 h-4" />
              ) : item.interviewType === 'Phone' ? (
                <Phone className="w-4 h-4" />
              ) : (
                <Building2 className="w-4 h-4" />
              )}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">
                  {item.companyName}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-500 dark:text-purple-400 font-medium">
                  {item.round}
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                {item.jobTitle}
              </p>
              <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-1">
                {formatDateTime(item.scheduledAt)} ({item.durationMinutes || 45} mins)
              </p>
            </div>
          </div>

          {item.meetingLink && (
            <a
              href={item.meetingLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors shrink-0"
            >
              Join <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      ))}
    </div>
  );
}
