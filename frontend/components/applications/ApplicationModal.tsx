'use client';

import React, { useEffect, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { api } from '@/lib/api';
import { Application, ApplicationStatus, EmploymentType, JobType, PriorityLevel, Resume } from '@/types';

interface ApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  application?: Application | null;
}

export function ApplicationModal({
  isOpen,
  onClose,
  onSaved,
  application,
}: ApplicationModalProps) {
  const { success, error } = useToast();
  const [loading, setLoading] = useState(false);
  const [resumes, setResumes] = useState<Resume[]>([]);

  // Form State
  const [companyName, setCompanyName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [jobLocation, setJobLocation] = useState('');
  const [jobType, setJobType] = useState<JobType>('Remote');
  const [employmentType, setEmploymentType] = useState<EmploymentType>('Full-time');
  const [priority, setPriority] = useState<PriorityLevel>('Medium');
  const [status, setStatus] = useState<ApplicationStatus>('Applied');
  const [minSalary, setMinSalary] = useState('');
  const [maxSalary, setMaxSalary] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [jobUrl, setJobUrl] = useState('');
  const [applicationDate, setApplicationDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [deadline, setDeadline] = useState('');
  const [resumeId, setResumeId] = useState('');
  const [recruiterName, setRecruiterName] = useState('');
  const [recruiterEmail, setRecruiterEmail] = useState('');
  const [recruiterRole, setRecruiterRole] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (isOpen) {
      // Fetch user's resumes for dropdown
      api
        .get('/resumes')
        .then((res) => {
          if (res.data.success) {
            setResumes(res.data.data);
            // Auto-select default resume if creating new
            if (!application) {
              const defaultRes = res.data.data.find((r: Resume) => r.isDefault);
              if (defaultRes) setResumeId(defaultRes._id);
            }
          }
        })
        .catch(() => {});

      if (application) {
        setCompanyName(application.companyName || '');
        setJobTitle(application.jobTitle || '');
        setJobLocation(application.jobLocation || '');
        setJobType(application.jobType || 'Remote');
        setEmploymentType(application.employmentType || 'Full-time');
        setPriority(application.priority || 'Medium');
        setStatus(application.status || 'Applied');
        setMinSalary(application.salaryRange?.min?.toString() || '');
        setMaxSalary(application.salaryRange?.max?.toString() || '');
        setCurrency(application.salaryRange?.currency || 'USD');
        setJobUrl(application.jobUrl || '');
        setApplicationDate(
          application.applicationDate
            ? new Date(application.applicationDate).toISOString().split('T')[0]
            : ''
        );
        setDeadline(
          application.deadline
            ? new Date(application.deadline).toISOString().split('T')[0]
            : ''
        );
        setResumeId(
          typeof application.resumeId === 'object'
            ? application.resumeId?._id || ''
            : application.resumeId || ''
        );
        setRecruiterName(application.recruiterContact?.name || '');
        setRecruiterEmail(application.recruiterContact?.email || '');
        setRecruiterRole(application.recruiterContact?.role || '');
        setNotes(application.notes || '');
      } else {
        // Reset form
        setCompanyName('');
        setJobTitle('');
        setJobLocation('');
        setJobType('Remote');
        setEmploymentType('Full-time');
        setPriority('Medium');
        setStatus('Applied');
        setMinSalary('');
        setMaxSalary('');
        setCurrency('USD');
        setJobUrl('');
        setApplicationDate(new Date().toISOString().split('T')[0]);
        setDeadline('');
        setRecruiterName('');
        setRecruiterEmail('');
        setRecruiterRole('');
        setNotes('');
      }
    }
  }, [isOpen, application]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim() || !jobTitle.trim()) {
      error('Company name and Job title are required');
      return;
    }

    setLoading(true);

    const payload = {
      companyName: companyName.trim(),
      jobTitle: jobTitle.trim(),
      jobLocation: jobLocation.trim(),
      jobType,
      employmentType,
      priority,
      status,
      salaryRange: {
        min: minSalary ? parseFloat(minSalary) : undefined,
        max: maxSalary ? parseFloat(maxSalary) : undefined,
        currency,
        period: 'yearly',
      },
      jobUrl: jobUrl.trim() || undefined,
      applicationDate: applicationDate ? new Date(applicationDate).toISOString() : new Date().toISOString(),
      deadline: deadline ? new Date(deadline).toISOString() : undefined,
      resumeId: resumeId || undefined,
      recruiterContact: recruiterName.trim()
        ? {
            name: recruiterName.trim(),
            email: recruiterEmail.trim() || undefined,
            role: recruiterRole.trim() || undefined,
          }
        : undefined,
      notes: notes.trim(),
    };

    try {
      if (application) {
        await api.put(`/applications/${application._id}`, payload);
        success('Application updated successfully');
      } else {
        await api.post('/applications', payload);
        success('Application created successfully');
      }
      onSaved();
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to save application');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={application ? 'Edit Application' : 'Track New Application'}
      description="Record all job details, hiring stages, and interview information."
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-1">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Company Name *"
            placeholder="e.g. Stripe, Airbnb, Google"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            required
          />
          <Input
            label="Job Title *"
            placeholder="e.g. Senior Software Engineer"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Select
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value as ApplicationStatus)}
            options={[
              { label: 'Wishlist', value: 'Wishlist' },
              { label: 'Applied', value: 'Applied' },
              { label: 'Under Review', value: 'Under Review' },
              { label: 'Online Assessment', value: 'Online Assessment' },
              { label: 'Interview Scheduled', value: 'Interview Scheduled' },
              { label: 'Technical Interview', value: 'Technical Interview' },
              { label: 'HR Interview', value: 'HR Interview' },
              { label: 'Offer Received', value: 'Offer Received' },
              { label: 'Rejected', value: 'Rejected' },
              { label: 'Withdrawn', value: 'Withdrawn' },
            ]}
          />
          <Select
            label="Workplace Type"
            value={jobType}
            onChange={(e) => setJobType(e.target.value as JobType)}
            options={[
              { label: 'Remote', value: 'Remote' },
              { label: 'Hybrid', value: 'Hybrid' },
              { label: 'On-site', value: 'On-site' },
            ]}
          />
          <Select
            label="Priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value as PriorityLevel)}
            options={[
              { label: 'Low Priority', value: 'Low' },
              { label: 'Medium Priority', value: 'Medium' },
              { label: 'High Priority', value: 'High' },
            ]}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Location"
            placeholder="e.g. San Francisco, CA / London / Remote"
            value={jobLocation}
            onChange={(e) => setJobLocation(e.target.value)}
          />
          <Input
            label="Job Posting URL"
            placeholder="https://..."
            type="url"
            value={jobUrl}
            onChange={(e) => setJobUrl(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label="Min Salary (USD/yr)"
            type="number"
            placeholder="e.g. 120000"
            value={minSalary}
            onChange={(e) => setMinSalary(e.target.value)}
          />
          <Input
            label="Max Salary (USD/yr)"
            type="number"
            placeholder="e.g. 160000"
            value={maxSalary}
            onChange={(e) => setMaxSalary(e.target.value)}
          />
          <Select
            label="Associated Resume"
            value={resumeId}
            onChange={(e) => setResumeId(e.target.value)}
            options={[
              { label: 'No resume attached', value: '' },
              ...resumes.map((r) => ({
                label: `${r.title} (v${r.version})`,
                value: r._id,
              })),
            ]}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Application Date"
            type="date"
            value={applicationDate}
            onChange={(e) => setApplicationDate(e.target.value)}
          />
          <Input
            label="Deadline (optional)"
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
          />
        </div>

        {/* Recruiter info */}
        <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 space-y-3">
          <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">
            Recruiter / Contact Information (Optional)
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              placeholder="Recruiter Name"
              value={recruiterName}
              onChange={(e) => setRecruiterName(e.target.value)}
            />
            <Input
              placeholder="Recruiter Email"
              type="email"
              value={recruiterEmail}
              onChange={(e) => setRecruiterEmail(e.target.value)}
            />
            <Input
              placeholder="Role / Title"
              value={recruiterRole}
              onChange={(e) => setRecruiterRole(e.target.value)}
            />
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
            Notes & Comments
          </label>
          <textarea
            rows={3}
            className="w-full rounded-lg border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            placeholder="Add key requirements, referral details, or thoughts about this position..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={loading}>
            {application ? 'Save Changes' : 'Create Application'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
