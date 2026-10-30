'use client';

import React, { useEffect, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import { api } from '@/lib/api';
import { Activity, Application } from '@/types';
import { formatDateTime, getStatusBadgeStyle } from '@/lib/utils';
import { Clock, Send, MessageSquare, Briefcase, CalendarCheck2, Award } from 'lucide-react';

interface ApplicationTimelineModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: Application | null;
}

export function ApplicationTimelineModal({
  isOpen,
  onClose,
  application,
}: ApplicationTimelineModalProps) {
  const { success, error } = useToast();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState('');
  const [submittingNote, setSubmittingNote] = useState(false);

  const fetchActivities = async () => {
    if (!application) return;
    setLoading(true);
    try {
      const res = await api.get(`/activities?applicationId=${application._id}&limit=50`);
      if (res.data.success) {
        setActivities(res.data.data);
      }
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && application) {
      fetchActivities();
    }
  }, [isOpen, application]);

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!note.trim() || !application) return;

    setSubmittingNote(true);
    try {
      await api.post('/activities', {
        applicationId: application._id,
        type: 'NOTE_ADDED',
        description: note.trim(),
      });
      setNote('');
      success('Note added to timeline');
      fetchActivities();
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to add note');
    } finally {
      setSubmittingNote(false);
    }
  };

  if (!application) return null;
  const statusStyle = getStatusBadgeStyle(application.status);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'OFFER_RECEIVED':
        return <Award className="w-4 h-4 text-emerald-400" />;
      case 'INTERVIEW_SCHEDULED':
      case 'INTERVIEW_UPDATED':
        return <CalendarCheck2 className="w-4 h-4 text-purple-400" />;
      case 'APPLICATION_CREATED':
        return <Briefcase className="w-4 h-4 text-sky-400" />;
      default:
        return <MessageSquare className="w-4 h-4 text-indigo-400" />;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${application.jobTitle} @ ${application.companyName}`}
      description="Activity Timeline & Interview History"
      maxWidth="lg"
    >
      <div className="space-y-5">
        {/* Header badges */}
        <div className="flex items-center gap-2 pb-2">
          <Badge
            variant="dot"
            dotColor={statusStyle.dot}
            className={`${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
          >
            {application.status}
          </Badge>
          <span className="text-xs text-zinc-500">
            {application.jobLocation || 'Location not specified'} • {application.jobType}
          </span>
        </div>

        {/* Add Note Input */}
        <form onSubmit={handleAddNote} className="flex gap-2">
          <Input
            placeholder="Add an update or note to this timeline..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="text-sm"
          />
          <Button type="submit" size="sm" isLoading={submittingNote} icon={<Send className="w-3.5 h-3.5" />}>
            Post
          </Button>
        </form>

        {/* Timeline list */}
        <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-zinc-200 dark:before:bg-zinc-800">
          {loading ? (
            <div className="text-xs text-zinc-500 py-4">Loading timeline...</div>
          ) : activities.length === 0 ? (
            <div className="text-xs text-zinc-500 py-4">No activities logged yet for this application.</div>
          ) : (
            activities.map((act) => (
              <div key={act._id} className="relative group">
                {/* Timeline node */}
                <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 flex items-center justify-center shrink-0">
                  {getActivityIcon(act.type)}
                </div>

                <div className="bg-zinc-50/70 dark:bg-zinc-900/50 p-3 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80">
                  <p className="text-xs font-medium text-zinc-900 dark:text-zinc-100">
                    {act.description}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1.5 text-[10px] text-zinc-400">
                    <Clock className="w-3 h-3" />
                    <span>{formatDateTime(act.createdAt)}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Modal>
  );
}
