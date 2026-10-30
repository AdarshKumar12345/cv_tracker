'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { KanbanBoard } from '@/components/kanban/KanbanBoard';
import { ApplicationModal } from '@/components/applications/ApplicationModal';
import { ApplicationTimelineModal } from '@/components/applications/ApplicationTimelineModal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { api } from '@/lib/api';
import { Application, ApplicationStatus } from '@/types';
import { Search, Plus } from 'lucide-react';

export default function KanbanPage() {
  const { success, error } = useToast();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('All');

  // Modals
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isTimelineModalOpen, setIsTimelineModalOpen] = useState(false);

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/applications?limit=200');
      if (res.data.success) {
        setApplications(res.data.data);
      }
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApplications();

    const handleRefresh = () => fetchApplications();
    window.addEventListener('application-saved', handleRefresh);
    return () => window.removeEventListener('application-saved', handleRefresh);
  }, [fetchApplications]);

  const handleStatusChange = async (appId: string, newStatus: ApplicationStatus) => {
    // Optimistic UI update
    setApplications((prev) =>
      prev.map((app) => (app._id === appId ? { ...app, status: newStatus } : app))
    );

    try {
      await api.patch(`/applications/${appId}/status`, { status: newStatus });
      success(`Moved to ${newStatus}`);
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to update status');
      fetchApplications();
    }
  };

  const handleDelete = async (appId: string) => {
    if (!window.confirm('Delete this job application?')) return;
    try {
      await api.delete(`/applications/${appId}`);
      success('Application deleted');
      fetchApplications();
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to delete');
    }
  };

  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      !search ||
      app.companyName.toLowerCase().includes(search.toLowerCase()) ||
      app.jobTitle.toLowerCase().includes(search.toLowerCase());

    const matchesPriority =
      priorityFilter === 'All' || app.priority === priorityFilter;

    return matchesSearch && matchesPriority;
  });

  return (
    <DashboardShell
      title="Interactive Kanban Pipeline"
      subtitle="Drag cards between columns or use the dropdown to update hiring stages."
    >
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-zinc-900/60 p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="w-full sm:w-64">
            <Input
              placeholder="Filter pipeline cards..."
              icon={<Search className="w-4 h-4" />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="text-xs"
            />
          </div>
          <div className="w-40 shrink-0">
            <Select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              options={[
                { label: 'All Priorities', value: 'All' },
                { label: 'High Priority', value: 'High' },
                { label: 'Medium Priority', value: 'Medium' },
                { label: 'Low Priority', value: 'Low' },
              ]}
              className="text-xs"
            />
          </div>
        </div>

        <div className="text-xs text-zinc-500 font-medium">
          Showing {filteredApplications.length} of {applications.length} applications
        </div>
      </div>

      {/* Kanban Board View */}
      {loading ? (
        <div className="flex items-center justify-center h-80 text-sm text-zinc-500">
          Loading Kanban pipeline...
        </div>
      ) : (
        <KanbanBoard
          applications={filteredApplications}
          onStatusChange={handleStatusChange}
          onEdit={(app) => {
            setSelectedApp(app);
            setIsEditModalOpen(true);
          }}
          onDelete={handleDelete}
          onOpenTimeline={(app) => {
            setSelectedApp(app);
            setIsTimelineModalOpen(true);
          }}
        />
      )}

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
