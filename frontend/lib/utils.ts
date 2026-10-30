import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ApplicationStatus, PriorityLevel, InterviewRound, InterviewOutcome } from '../types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString?: string | Date): string {
  if (!dateString) return 'N/A';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return 'Invalid date';
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatDateTime(dateString?: string | Date): string {
  if (!dateString) return 'N/A';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return 'Invalid date';
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function formatSalary(min?: number, max?: number, currency = 'USD', period = 'yearly'): string {
  if (!min && !max) return 'Not specified';
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  });

  const periodLabel = period === 'yearly' ? '/yr' : period === 'monthly' ? '/mo' : '/hr';

  if (min && max) {
    return `${formatter.format(min)} - ${formatter.format(max)}${periodLabel}`;
  }
  if (min) {
    return `From ${formatter.format(min)}${periodLabel}`;
  }
  return `Up to ${formatter.format(max!)}${periodLabel}`;
}

export function getStatusBadgeStyle(status: ApplicationStatus): {
  bg: string;
  text: string;
  border: string;
  dot: string;
} {
  switch (status) {
    case 'Wishlist':
      return {
        bg: 'bg-indigo-500/10 dark:bg-indigo-500/20',
        text: 'text-indigo-600 dark:text-indigo-400',
        border: 'border-indigo-500/30',
        dot: 'bg-indigo-500',
      };
    case 'Applied':
      return {
        bg: 'bg-sky-500/10 dark:bg-sky-500/20',
        text: 'text-sky-600 dark:text-sky-400',
        border: 'border-sky-500/30',
        dot: 'bg-sky-500',
      };
    case 'Under Review':
      return {
        bg: 'bg-amber-500/10 dark:bg-amber-500/20',
        text: 'text-amber-600 dark:text-amber-400',
        border: 'border-amber-500/30',
        dot: 'bg-amber-500',
      };
    case 'Online Assessment':
      return {
        bg: 'bg-pink-500/10 dark:bg-pink-500/20',
        text: 'text-pink-600 dark:text-pink-400',
        border: 'border-pink-500/30',
        dot: 'bg-pink-500',
      };
    case 'Interview Scheduled':
    case 'Technical Interview':
    case 'HR Interview':
      return {
        bg: 'bg-purple-500/10 dark:bg-purple-500/20',
        text: 'text-purple-600 dark:text-purple-400',
        border: 'border-purple-500/30',
        dot: 'bg-purple-500',
      };
    case 'Offer Received':
      return {
        bg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
        text: 'text-emerald-600 dark:text-emerald-400',
        border: 'border-emerald-500/30',
        dot: 'bg-emerald-500',
      };
    case 'Rejected':
      return {
        bg: 'bg-rose-500/10 dark:bg-rose-500/20',
        text: 'text-rose-600 dark:text-rose-400',
        border: 'border-rose-500/30',
        dot: 'bg-rose-500',
      };
    case 'Withdrawn':
    default:
      return {
        bg: 'bg-zinc-500/10 dark:bg-zinc-500/20',
        text: 'text-zinc-600 dark:text-zinc-400',
        border: 'border-zinc-500/30',
        dot: 'bg-zinc-500',
      };
  }
}

export function getPriorityBadge(priority: PriorityLevel): {
  bg: string;
  text: string;
  border: string;
} {
  switch (priority) {
    case 'High':
      return {
        bg: 'bg-red-500/10 dark:bg-red-500/20',
        text: 'text-red-600 dark:text-red-400',
        border: 'border-red-500/30',
      };
    case 'Medium':
      return {
        bg: 'bg-amber-500/10 dark:bg-amber-500/20',
        text: 'text-amber-600 dark:text-amber-400',
        border: 'border-amber-500/30',
      };
    case 'Low':
    default:
      return {
        bg: 'bg-slate-500/10 dark:bg-slate-500/20',
        text: 'text-slate-600 dark:text-slate-400',
        border: 'border-slate-500/30',
      };
  }
}

export function getOutcomeBadge(outcome: InterviewOutcome): {
  bg: string;
  text: string;
} {
  switch (outcome) {
    case 'Passed':
      return { bg: 'bg-emerald-500/20', text: 'text-emerald-400' };
    case 'Failed':
      return { bg: 'bg-rose-500/20', text: 'text-rose-400' };
    case 'Rescheduled':
      return { bg: 'bg-amber-500/20', text: 'text-amber-400' };
    case 'Pending':
    default:
      return { bg: 'bg-blue-500/20', text: 'text-blue-400' };
  }
}
