'use client';

import React, { useEffect, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { api } from '@/lib/api';
import { Application, Interview, InterviewOutcome, InterviewRound } from '@/types';

interface InterviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  interview?: Interview | null;
  defaultApplicationId?: string;
}

export function InterviewModal({
  isOpen,
  onClose,
  onSaved,
  interview,
  defaultApplicationId,
}: InterviewModalProps) {
  const { success, error } = useToast();
  const [loading, setLoading] = useState(false);
  const [applications, setApplications] = useState<Application[]>([]);

  const [applicationId, setApplicationId] = useState('');
  const [round, setRound] = useState<InterviewRound>('Technical');
  const [scheduledAt, setScheduledAt] = useState('');
  const [durationMinutes, setDurationMinutes] = useState('45');
  const [interviewType, setInterviewType] = useState<'Video' | 'Phone' | 'In-person'>('Video');
  const [meetingLink, setMeetingLink] = useState('');
  const [interviewerName, setInterviewerName] = useState('');
  const [interviewerEmail, setInterviewerEmail] = useState('');
  const [preparationNotes, setPreparationNotes] = useState('');
  const [feedback, setFeedback] = useState('');
  const [outcome, setOutcome] = useState<InterviewOutcome>('Pending');

  useEffect(() => {
    if (isOpen) {
      // Fetch applications to link
      api
        .get('/applications?limit=100')
        .then((res) => {
          if (res.data.success) {
            setApplications(res.data.data);
            if (!interview && !applicationId && res.data.data.length > 0) {
              setApplicationId(defaultApplicationId || res.data.data[0]._id);
            }
          }
        })
        .catch(() => {});

      if (interview) {
        const appId = typeof interview.applicationId === 'object'
          ? interview.applicationId?._id
          : interview.applicationId;
        setApplicationId(appId || '');
        setRound(interview.round || 'Technical');
        setScheduledAt(
          interview.scheduledAt ? new Date(interview.scheduledAt).toISOString().slice(0, 16) : ''
        );
        setDurationMinutes(interview.durationMinutes?.toString() || '45');
        setInterviewType(interview.interviewType || 'Video');
        setMeetingLink(interview.meetingLink || '');
        setInterviewerName(interview.interviewerName || '');
        setInterviewerEmail(interview.interviewerEmail || '');
        setPreparationNotes(interview.preparationNotes || '');
        setFeedback(interview.feedback || '');
        setOutcome(interview.outcome || 'Pending');
      } else {
        // Defaults
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(14, 0, 0, 0);
        setScheduledAt(tomorrow.toISOString().slice(0, 16));
        setRound('Technical');
        setDurationMinutes('45');
        setInterviewType('Video');
        setMeetingLink('');
        setInterviewerName('');
        setInterviewerEmail('');
        setPreparationNotes('');
        setFeedback('');
        setOutcome('Pending');
        if (defaultApplicationId) setApplicationId(defaultApplicationId);
      }
    }
  }, [isOpen, interview, defaultApplicationId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!applicationId) {
      error('Please select an application for this interview');
      return;
    }
    if (!scheduledAt) {
      error('Please specify the interview date and time');
      return;
    }

    setLoading(true);

    const payload = {
      applicationId,
      round,
      scheduledAt: new Date(scheduledAt).toISOString(),
      durationMinutes: parseInt(durationMinutes, 10) || 45,
      interviewType,
      meetingLink: meetingLink.trim() || undefined,
      interviewerName: interviewerName.trim() || undefined,
      interviewerEmail: interviewerEmail.trim() || undefined,
      preparationNotes: preparationNotes.trim(),
      feedback: feedback.trim(),
      outcome,
    };

    try {
      if (interview) {
        await api.put(`/interviews/${interview._id}`, payload);
        success('Interview updated successfully');
      } else {
        await api.post('/interviews', payload);
        success('Interview scheduled successfully');
      }
      onSaved();
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to schedule interview');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={interview ? 'Edit Interview Round' : 'Schedule Interview'}
      description="Track upcoming rounds, meeting links, questions, and notes."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-1">
        <Select
          label="Job Application *"
          value={applicationId}
          onChange={(e) => setApplicationId(e.target.value)}
          options={applications.map((app) => ({
            label: `${app.companyName} — ${app.jobTitle}`,
            value: app._id,
          }))}
          disabled={!!interview}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Interview Round"
            value={round}
            onChange={(e) => setRound(e.target.value as InterviewRound)}
            options={[
              { label: 'Screening / HR Call', value: 'Screening' },
              { label: 'Technical Interview', value: 'Technical' },
              { label: 'System Design', value: 'System Design' },
              { label: 'Behavioral Round', value: 'Behavioral' },
              { label: 'Managerial Round', value: 'Managerial' },
              { label: 'HR Final Round', value: 'HR' },
              { label: 'Final Round', value: 'Final' },
            ]}
          />
          <Select
            label="Format / Type"
            value={interviewType}
            onChange={(e) => setInterviewType(e.target.value as any)}
            options={[
              { label: 'Video Call (Zoom/Meet/Teams)', value: 'Video' },
              { label: 'Phone Call', value: 'Phone' },
              { label: 'On-site / In-person', value: 'In-person' },
            ]}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Scheduled Date & Time *"
            type="datetime-local"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
            required
          />
          <Input
            label="Duration (minutes)"
            type="number"
            value={durationMinutes}
            onChange={(e) => setDurationMinutes(e.target.value)}
          />
        </div>

        <Input
          label="Meeting URL or Phone Number"
          placeholder="e.g. https://meet.google.com/xyz-abc or Zoom link"
          value={meetingLink}
          onChange={(e) => setMeetingLink(e.target.value)}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Interviewer Name"
            placeholder="e.g. John Doe"
            value={interviewerName}
            onChange={(e) => setInterviewerName(e.target.value)}
          />
          <Input
            label="Interviewer Email"
            type="email"
            placeholder="john@company.com"
            value={interviewerEmail}
            onChange={(e) => setInterviewerEmail(e.target.value)}
          />
        </div>

        {interview && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Interview Outcome"
              value={outcome}
              onChange={(e) => setOutcome(e.target.value as InterviewOutcome)}
              options={[
                { label: 'Pending', value: 'Pending' },
                { label: 'Passed', value: 'Passed' },
                { label: 'Failed', value: 'Failed' },
                { label: 'Rescheduled', value: 'Rescheduled' },
              ]}
            />
            <Input
              label="Feedback / Result"
              placeholder="Key impressions, result or feedback"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
            />
          </div>
        )}

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
            Preparation Notes & Topics to Review
          </label>
          <textarea
            rows={3}
            className="w-full rounded-lg border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            placeholder="Review algorithms, system design architecture, questions for the interviewer..."
            value={preparationNotes}
            onChange={(e) => setPreparationNotes(e.target.value)}
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={loading}>
            {interview ? 'Save Changes' : 'Schedule Interview'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
