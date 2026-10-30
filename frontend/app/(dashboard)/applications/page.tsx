'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { ApplicationModal } from '@/components/applications/ApplicationModal';
import { ApplicationTimelineModal } from '@/components/applications/ApplicationTimelineModal';
import { useToast } from '@/components/ui/Toast';
import { api } from '@/lib/api';
import { Application, ApplicationStatus, JobType } from '@/types';
import { getStatusBadgeStyle, formatDate, formatSalary, getPriorityBadge } from '@/lib/utils';
import {
  Search,
  Filter,
  Plus,
  ExternalLink,
  MessageSquare,
  Edit,
  Trash2,
  Calendar,
  Building2,
  MapPin,
  ChevronLeft,
  ChevronRight,
  FileText,
} from 'lucide-react';

export default function ApplicationsPage() {
  const { success, error } = useToast();
  const [applications, setApplications] = useState<Application[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [jobTypeFilter, setJobTypeFilter] = useState('All');
  const [sortBy, setSortBy] = useState('applicationDate');
  const [sortOrder, setSortOrder] = useState('desc');

  // Modals state
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isTimelineModalOpen, setIsTimelineModalOpen] = useState(false);

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', String(page));
      params.append('limit', '15');
      params.append('sortBy', sortBy);
      params.append('sortOrder', sortOrder);
      if (search) params.append('search', search);
      if (statusFilter !== 'All') params.append('status', statusFilter);
      if (jobTypeFilter !== 'All') params.append('jobType', jobTypeFilter);

      const res = await api.get(`/applications?${params.toString()}`);
      if (res.data.success) {
        setApplications(res.data.data);
        setTotal(res.data.pagination.total);
        setTotalPages(res.data.pagination.totalPages || 1);
      }
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter, jobTypeFilter, sortBy, sortOrder]);

  useEffect(() => {
    fetchApplications();

    const handleRefresh = () => fetchApplications();
    window.addEventListener('application-saved', handleRefresh);
    return () => window.removeEventListener('application-saved', handleRefresh);
  }, [fetchApplications]);

  const handleStatusChange = async (appId: string, newStatus: ApplicationStatus) => {
    try {
      await api.patch(`/applications/${appId}/status`, { status: newStatus });
      success(`Status updated to ${newStatus}`);
      fetchApplications();
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleDelete = async (appId: string) => {
    if (!window.confirm('Are you sure you want to delete this job application?')) {
      return;
    }

    try {
      await api.delete(`/applications/${appId}`);
      success('Application deleted successfully');
      fetchApplications();
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to delete application');
    }
  };

  return (
    <DashboardShell
      title="Job Application Tracker"
      subtitle="View, search, filter, and manage all your tracked job opportunities."
    >
      {/* Search and Filters Header */}
      <Card className="p-4 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="md:col-span-2">
            <Input
              placeholder="Search by company, role, or location..."
              icon={<Search className="w-4 h-4" />}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>

          <Select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            options={[
              { label: 'All Statuses', value: 'All' },
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
            value={jobTypeFilter}
            onChange={(e) => {
              setJobTypeFilter(e.target.value);
              setPage(1);
            }}
            options={[
              { label: 'All Workplace Types', value: 'All' },
              { label: 'Remote', value: 'Remote' },
              { label: 'Hybrid', value: 'Hybrid' },
              { label: 'On-site', value: 'On-site' },
            ]}
          />
        </div>
      </Card>

      {/* Applications Table / Cards */}
      <Card className="p-0 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-sm text-zinc-500">
            Loading applications...
          </div>
        ) : applications.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <Building2 className="w-12 h-12 text-zinc-400 mx-auto opacity-40" />
            <h3 className="font-bold text-base text-zinc-800 dark:text-zinc-200">
              No applications match your filter
            </h3>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              Get started by adding your current active applications or clearing the search filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 text-[11px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-semibold">
                  <th className="py-3 px-4">Company & Role</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Workplace & Type</th>
                  <th className="py-3 px-4">Compensation</th>
                  <th className="py-3 px-4">Applied Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/80 text-sm">
                {applications.map((app) => {
                  const statusStyle = getStatusBadgeStyle(app.status);
                  const priorityStyle = getPriorityBadge(app.priority);

                  return (
                    <tr
                      key={app._id}
                      className="hover:bg-zinc-50/60 dark:hover:bg-zinc-900/30 transition-colors group"
                    >
                      {/* Company & Role */}
                      <td className="py-3.5 px-4 min-w-[220px]">
                        <div className="flex items-start gap-3">
                          <div className="w-9 h-9 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/80 flex items-center justify-center font-bold text-zinc-700 dark:text-zinc-300 text-xs shrink-0">
                            {app.companyName.substring(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-zinc-900 dark:text-zinc-100 truncate flex items-center gap-1.5">
                              {app.companyName}
                              {app.jobUrl && (
                                <a
                                  href={app.jobUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-zinc-400 hover:text-indigo-400"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              )}
                            </div>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                              {app.jobTitle}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 min-w-[170px]">
                        <select
                          value={app.status}
                          onChange={(e) => handleStatusChange(app._id, e.target.value as ApplicationStatus)}
                          className={`text-xs font-semibold px-2.5 py-1 rounded-full border cursor-pointer focus:outline-none ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
                        >
                          <option value="Wishlist">Wishlist</option>
                          <option value="Applied">Applied</option>
                          <option value="Under Review">Under Review</option>
                          <option value="Online Assessment">Online Assessment</option>
                          <option value="Interview Scheduled">Interview Scheduled</option>
                          <option value="Technical Interview">Technical Interview</option>
                          <option value="HR Interview">HR Interview</option>
                          <option value="Offer Received">Offer Received</option>
                          <option value="Rejected">Rejected</option>
                          <option value="Withdrawn">Withdrawn</option>
                        </select>
                      </td>

                      {/* Workplace & Type */}
                      <td className="py-3.5 px-4 min-w-[150px]">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1 text-xs text-zinc-700 dark:text-zinc-300">
                            <MapPin className="w-3 h-3 text-zinc-400 shrink-0" />
                            <span className="truncate">{app.jobLocation || 'Remote'}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Badge className={`${priorityStyle.bg} ${priorityStyle.text} ${priorityStyle.border}`}>
                              {app.priority}
                            </Badge>
                            <span className="text-[11px] text-zinc-400">
                              {app.jobType}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Compensation */}
                      <td className="py-3.5 px-4 text-xs font-medium text-zinc-700 dark:text-zinc-300 min-w-[130px]">
                        {formatSalary(
                          app.salaryRange?.min,
                          app.salaryRange?.max,
                          app.salaryRange?.currency,
                          app.salaryRange?.period
                        )}
                      </td>

                      {/* Applied Date */}
                      <td className="py-3.5 px-4 text-xs text-zinc-500 min-w-[120px]">
                        {formatDate(app.applicationDate)}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right min-w-[140px]">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => {
                              setSelectedApp(app);
                              setIsTimelineModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-indigo-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                            title="Timeline & Notes"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedApp(app);
                              setIsEditModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                            title="Edit Details"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(app._id)}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-zinc-200 dark:border-zinc-800 text-xs text-zinc-500">
            <div>
              Showing {applications.length} of {total} applications
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Prev
              </Button>
              <span className="font-semibold px-2">
                Page {page} of {totalPages}
              </span>
              <Button
                size="sm"
                variant="outline"
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
              >
                Next <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      <ApplicationModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedApp(null);
        }}
        onSaved={() => {
          setIsEditModalOpen(false);
          setSelectedApp(null);
          fetchApplications();
        }}
        application={selectedApp}
      />

      <ApplicationTimelineModal
        isOpen={isTimelineModalOpen}
        onClose={() => {
          setIsTimelineModalOpen(false);
          setSelectedApp(null);
        }}
        application={selectedApp}
      />
    </DashboardShell>
  );
}
