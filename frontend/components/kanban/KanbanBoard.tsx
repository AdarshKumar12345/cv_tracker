'use client';

import React, { useState } from 'react';
import { Application, ApplicationStatus } from '@/types';
import { getStatusBadgeStyle, formatDate, formatSalary, getPriorityBadge } from '@/lib/utils';
import {
  MoreVertical,
  Calendar,
  Building2,
  DollarSign,
  GripVertical,
  ExternalLink,
  MessageSquare,
  Trash2,
  Edit,
} from 'lucide-react';
import { Badge } from '../ui/Badge';

export const KANBAN_COLUMNS: { id: string; title: string; statuses: ApplicationStatus[]; color: string }[] = [
  { id: 'wishlist', title: 'Wishlist', statuses: ['Wishlist'], color: 'border-indigo-500/40' },
  { id: 'applied', title: 'Applied', statuses: ['Applied'], color: 'border-sky-500/40' },
  { id: 'under_review', title: 'Under Review', statuses: ['Under Review'], color: 'border-amber-500/40' },
  { id: 'assessment', title: 'Assessment', statuses: ['Online Assessment'], color: 'border-pink-500/40' },
  {
    id: 'interview',
    title: 'Interview',
    statuses: ['Interview Scheduled', 'Technical Interview', 'HR Interview'],
    color: 'border-purple-500/40',
  },
  { id: 'offer', title: 'Offer', statuses: ['Offer Received'], color: 'border-emerald-500/40' },
  { id: 'rejected', title: 'Rejected', statuses: ['Rejected', 'Withdrawn'], color: 'border-rose-500/40' },
];

interface KanbanBoardProps {
  applications: Application[];
  onStatusChange: (applicationId: string, newStatus: ApplicationStatus) => void;
  onEdit: (application: Application) => void;
  onDelete: (applicationId: string) => void;
  onOpenTimeline: (application: Application) => void;
}

export function KanbanBoard({
  applications,
  onStatusChange,
  onEdit,
  onDelete,
  onOpenTimeline,
}: KanbanBoardProps) {
  const [draggedAppId, setDraggedAppId] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, appId: string) => {
    e.dataTransfer.setData('text/plain', appId);
    setDraggedAppId(appId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetStatus: ApplicationStatus) => {
    e.preventDefault();
    const appId = e.dataTransfer.getData('text/plain') || draggedAppId;
    if (appId) {
      onStatusChange(appId, targetStatus);
    }
    setDraggedAppId(null);
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-6 pt-2">
      {KANBAN_COLUMNS.map((col) => {
        const columnApps = applications.filter((app) => col.statuses.includes(app.status));
        const defaultDropStatus = col.statuses[0];

        return (
          <div
            key={col.id}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, defaultDropStatus)}
            className="flex flex-col w-80 shrink-0 rounded-2xl bg-zinc-100/70 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/80 p-3 min-h-[550px]"
          >
            {/* Column Header */}
            <div className={`flex items-center justify-between pb-3 mb-3 border-b-2 ${col.color}`}>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm tracking-tight text-zinc-900 dark:text-zinc-100">
                  {col.title}
                </span>
                <span className="flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                  {columnApps.length}
                </span>
              </div>
            </div>

            {/* Cards List */}
            <div className="flex-1 space-y-3 overflow-y-auto">
              {columnApps.map((app) => {
                const priorityBadge = getPriorityBadge(app.priority);

                return (
                  <div
                    key={app._id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, app._id)}
                    className="group relative rounded-xl border border-zinc-200 dark:border-zinc-800/90 bg-white dark:bg-zinc-900/90 p-3.5 shadow-sm hover:shadow-md hover:border-indigo-500/50 dark:hover:border-indigo-500/50 transition-all cursor-grab active:cursor-grabbing"
                  >
                    {/* Header info */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 truncate">
                          {app.companyName}
                        </h4>
                        <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400 truncate mt-0.5">
                          {app.jobTitle}
                        </p>
                      </div>

                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => onOpenTimeline(app)}
                          className="p-1 rounded text-zinc-400 hover:text-indigo-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                          title="View timeline / Add notes"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onEdit(app)}
                          className="p-1 rounded text-zinc-400 hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                          title="Edit"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDelete(app._id)}
                          className="p-1 rounded text-zinc-400 hover:text-rose-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Metadata tags */}
                    <div className="flex flex-wrap items-center gap-1.5 my-2.5">
                      <Badge className={`${priorityBadge.bg} ${priorityBadge.text} ${priorityBadge.border}`}>
                        {app.priority}
                      </Badge>
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                        {app.jobType}
                      </span>
                    </div>

                    {/* Details footer */}
                    <div className="flex items-center justify-between text-[11px] text-zinc-400 dark:text-zinc-500 pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(app.applicationDate)}</span>
                      </div>

                      {app.salaryRange?.min || app.salaryRange?.max ? (
                        <div className="flex items-center gap-0.5 text-zinc-600 dark:text-zinc-300 font-medium">
                          <span>{formatSalary(app.salaryRange.min, app.salaryRange.max, app.salaryRange.currency, app.salaryRange.period)}</span>
                        </div>
                      ) : null}
                    </div>

                    {/* Quick Move Selector */}
                    <div className="mt-2.5 pt-2 border-t border-dashed border-zinc-100 dark:border-zinc-800/80">
                      <select
                        value={app.status}
                        onChange={(e) => onStatusChange(app._id, e.target.value as ApplicationStatus)}
                        className="w-full text-[11px] py-1 px-2 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 focus:outline-none"
                      >
                        <option value="Wishlist">Move to Wishlist</option>
                        <option value="Applied">Move to Applied</option>
                        <option value="Under Review">Move to Under Review</option>
                        <option value="Online Assessment">Move to Assessment</option>
                        <option value="Interview Scheduled">Move to Interview Scheduled</option>
                        <option value="Technical Interview">Move to Technical Interview</option>
                        <option value="HR Interview">Move to HR Interview</option>
                        <option value="Offer Received">Move to Offer Received</option>
                        <option value="Rejected">Move to Rejected</option>
                        <option value="Withdrawn">Move to Withdrawn</option>
                      </select>
                    </div>
                  </div>
                );
              })}

              {columnApps.length === 0 && (
                <div className="flex items-center justify-center h-28 border border-dashed border-zinc-300/60 dark:border-zinc-800/60 rounded-xl text-xs text-zinc-400">
                  Drag items here
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
