'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { InterviewModal } from '@/components/interviews/InterviewModal';
import { useToast } from '@/components/ui/Toast';
import { api } from '@/lib/api';
import { Interview, InterviewOutcome } from '@/types';
import { formatDateTime, getOutcomeBadge } from '@/lib/utils';
import {
  CalendarCheck2,
  Plus,
  Video,
  Phone,
  Building2,
  ExternalLink,
  Edit,
  Trash2,
  Clock,
  User,
  CheckCircle,
  FileEdit,
} from 'lucide-react';

export default function InterviewsPage() {
  const { success, error } = useToast();
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<'all' | 'upcoming' | 'past'>('all');

  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchInterviews = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/interviews?timeframe=${timeframe}`);
      if (res.data.success) {
        setInterviews(res.data.data);
      }
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  }, [timeframe]);

  useEffect(() => {
    fetchInterviews();
  }, [fetchInterviews]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this interview record?')) return;
    try {
      await api.delete(`/interviews/${id}`);
      success('Interview deleted');
      fetchInterviews();
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to delete interview');
    }
  };

  const handleOutcomeChange = async (id: string, outcome: InterviewOutcome) => {
    try {
      await api.put(`/interviews/${id}`, { outcome });
      success(`Outcome updated: ${outcome}`);
      fetchInterviews();
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to update outcome');
    }
  };

  return (
    <DashboardShell
      title="Interview Pipeline & Scheduling"
      subtitle="Track your technical rounds, behavioral assessments, meeting details, and prep notes."
    >
      {/* Top Filter and Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-zinc-900/60 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={timeframe === 'all' ? 'primary' : 'outline'}
            onClick={() => setTimeframe('all')}
          >
            All Rounds ({interviews.length})
          </Button>
          <Button
            size="sm"
            variant={timeframe === 'upcoming' ? 'primary' : 'outline'}
            onClick={() => setTimeframe('upcoming')}
          >
            Upcoming Only
          </Button>
          <Button
            size="sm"
            variant={timeframe === 'past' ? 'primary' : 'outline'}
            onClick={() => setTimeframe('past')}
          >
            Past Interviews
          </Button>
        </div>

        <Button
          onClick={() => {
            setSelectedInterview(null);
            setIsModalOpen(true);
          }}
          icon={<Plus className="w-4 h-4" />}
        >
          Schedule Interview
        </Button>
      </div>

      {/* Interviews List */}
      {loading ? (
        <div className="flex items-center justify-center h-64 text-sm text-zinc-500">
          Loading interviews...
        </div>
      ) : interviews.length === 0 ? (
        <Card className="p-12 text-center space-y-4">
          <CalendarCheck2 className="w-12 h-12 text-zinc-400 mx-auto opacity-40" />
          <h3 className="font-bold text-base text-zinc-800 dark:text-zinc-200">
            No interviews found in this view
          </h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            Schedule upcoming interview rounds with hiring managers and recruiters to track your progress.
          </p>
          <Button
            onClick={() => {
              setSelectedInterview(null);
              setIsModalOpen(true);
            }}
            icon={<Plus className="w-4 h-4" />}
          >
            Schedule Interview
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {interviews.map((item) => {
            const outcomeBadge = getOutcomeBadge(item.outcome);
            const isUpcoming = new Date(item.scheduledAt) >= new Date();

            return (
              <Card
                key={item._id}
                hoverEffect
                className="flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Top line: Round badge & outcome */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 border border-indigo-500/20">
                          {item.round}
                        </span>
                        <span
                          className={`text-xs font-semibold px-2 py-0.5 rounded-full ${outcomeBadge.bg} ${outcomeBadge.text}`}
                        >
                          {item.outcome}
                        </span>
                      </div>
                      <h4 className="font-extrabold text-base text-zinc-900 dark:text-zinc-100 mt-2">
                        {item.companyName}
                      </h4>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                        {item.jobTitle}
                      </p>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setSelectedInterview(item);
                          setIsModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                        title="Edit Interview"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item._id)}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Scheduled date & type */}
                  <div className="p-3 rounded-xl bg-zinc-50/80 dark:bg-zinc-900/50 border border-zinc-200/60 dark:border-zinc-800/60 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300 font-medium">
                        <Clock className="w-3.5 h-3.5 text-indigo-400" />
                        <span>{formatDateTime(item.scheduledAt)}</span>
                      </div>
                      <span className="text-zinc-400">
                        {item.durationMinutes} minutes
                      </span>
                    </div>

                    {item.interviewerName && (
                      <div className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400">
                        <User className="w-3.5 h-3.5 text-zinc-400" />
                        <span>{item.interviewerName} {item.interviewerEmail ? `(${item.interviewerEmail})` : ''}</span>
                      </div>
                    )}
                  </div>

                  {/* Prep notes */}
                  {item.preparationNotes && (
                    <div className="text-xs text-zinc-600 dark:text-zinc-400 bg-zinc-50/50 dark:bg-zinc-900/30 p-2.5 rounded-lg border border-zinc-200/50 dark:border-zinc-800/50">
                      <p className="font-semibold text-zinc-500 uppercase text-[10px] tracking-wider mb-1">
                        Preparation Notes
                      </p>
                      <p className="line-clamp-2">{item.preparationNotes}</p>
                    </div>
                  )}

                  {item.feedback && (
                    <div className="text-xs text-zinc-600 dark:text-zinc-400 bg-purple-500/5 p-2.5 rounded-lg border border-purple-500/10">
                      <p className="font-semibold text-purple-400 uppercase text-[10px] tracking-wider mb-1">
                        Feedback / Impression
                      </p>
                      <p className="line-clamp-2">{item.feedback}</p>
                    </div>
                  )}
                </div>

                {/* Footer Join Link & Quick Outcome */}
                <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <span className="text-[11px] text-zinc-400">Outcome:</span>
                    <select
                      value={item.outcome}
                      onChange={(e) => handleOutcomeChange(item._id, e.target.value as InterviewOutcome)}
                      className="text-xs py-0.5 px-1.5 rounded border border-zinc-200 dark:border-zinc-700 bg-transparent text-zinc-700 dark:text-zinc-300 focus:outline-none"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Passed">Passed</option>
                      <option value="Failed">Failed</option>
                      <option value="Rescheduled">Rescheduled</option>
                    </select>
                  </div>

                  {item.meetingLink ? (
                    <a
                      href={item.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm transition-colors"
                    >
                      Join Call <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  ) : null}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <InterviewModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedInterview(null);
        }}
        onSaved={() => {
          setIsModalOpen(false);
          setSelectedInterview(null);
          fetchInterviews();
        }}
        interview={selectedInterview}
      />
    </DashboardShell>
  );
}
