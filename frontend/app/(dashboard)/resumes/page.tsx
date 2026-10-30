'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ResumeUploadModal } from '@/components/resumes/ResumeUploadModal';
import { useToast } from '@/components/ui/Toast';
import { api } from '@/lib/api';
import { Resume } from '@/types';
import { formatDate } from '@/lib/utils';
import {
  FileText,
  UploadCloud,
  Download,
  Trash2,
  Star,
  CheckCircle2,
  Briefcase,
  Sparkles,
} from 'lucide-react';

export default function ResumesPage() {
  const { success, error } = useToast();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const fetchResumes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/resumes');
      if (res.data.success) {
        setResumes(res.data.data);
      }
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchResumes();
  }, [fetchResumes]);

  const handleSetDefault = async (id: string, title: string) => {
    try {
      await api.patch(`/resumes/${id}/default`);
      success(`"${title}" marked as default resume`);
      fetchResumes();
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to update default resume');
    }
  };

  const handleDownload = async (resume: Resume) => {
    try {
      const res = await api.get(`/resumes/${resume._id}/download`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', resume.originalName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      success('Download started');
    } catch {
      error('Failed to download resume file');
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      await api.delete(`/resumes/${id}`);
      success('Resume deleted successfully');
      fetchResumes();
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to delete resume');
    }
  };

  return (
    <DashboardShell
      title="Resume Versions & CV Management"
      subtitle="Upload tailored resume iterations, track which version was used for each application, and set your default CV."
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            All Resumes ({resumes.length})
          </h2>
          <p className="text-xs text-zinc-500">
            PDF and DOCX formats supported up to 10MB
          </p>
        </div>

        <Button
          onClick={() => setIsUploadModalOpen(true)}
          icon={<UploadCloud className="w-4 h-4" />}
        >
          Upload New CV
        </Button>
      </div>

      {/* AI Resume Enhancement Banner */}
      <div className="relative overflow-hidden p-5 rounded-2xl bg-gradient-to-r from-indigo-900/30 via-purple-900/20 to-sky-900/20 border border-indigo-500/20">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400 shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-zinc-100">
              Future-Ready Resume Architecture
            </h4>
            <p className="text-xs text-zinc-400 max-w-2xl leading-relaxed">
              Every resume uploaded here is parsed with schema metadata and indexed. Soon you will be able to run automated ATS scoring, keyword matching against job descriptions, and AI bullet optimization.
            </p>
          </div>
        </div>
      </div>

      {/* Resume Cards Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64 text-sm text-zinc-500">
          Loading resumes...
        </div>
      ) : resumes.length === 0 ? (
        <Card className="p-12 text-center space-y-4">
          <FileText className="w-12 h-12 text-zinc-400 mx-auto opacity-40" />
          <h3 className="font-bold text-base text-zinc-800 dark:text-zinc-200">
            No resumes uploaded yet
          </h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            Upload your master resume or role-specific versions to associate them with your job applications.
          </p>
          <Button
            onClick={() => setIsUploadModalOpen(true)}
            icon={<UploadCloud className="w-4 h-4" />}
          >
            Upload Resume
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {resumes.map((resume) => {
            const isPdf = resume.fileType.includes('pdf');
            const sizeMb = (resume.fileSize / (1024 * 1024)).toFixed(2);

            return (
              <Card
                key={resume._id}
                hoverEffect
                className={`relative flex flex-col justify-between ${
                  resume.isDefault
                    ? 'border-indigo-500/50 bg-indigo-500/[0.02] shadow-sm'
                    : ''
                }`}
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 truncate">
                          {resume.title}
                        </h4>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[11px] font-semibold text-indigo-500">
                            Version {resume.version}
                          </span>
                          <span className="text-zinc-400">•</span>
                          <span className="text-[11px] text-zinc-500">
                            {isPdf ? 'PDF' : 'DOCX'} • {sizeMb} MB
                          </span>
                        </div>
                      </div>
                    </div>

                    {resume.isDefault && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                        Default
                      </span>
                    )}
                  </div>

                  {/* Metadata and Stats */}
                  <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
                      <span>Uploaded on</span>
                      <span className="font-medium text-zinc-700 dark:text-zinc-300">
                        {formatDate(resume.createdAt)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
                      <span>Linked applications</span>
                      <span className="font-semibold text-indigo-400">
                        {resume.applicationCount || 0} applications
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
                      <span className="truncate text-[11px] opacity-75">
                        {resume.originalName}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions bottom */}
                <div className="mt-5 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between gap-2">
                  {!resume.isDefault ? (
                    <button
                      onClick={() => handleSetDefault(resume._id, resume.title)}
                      className="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-indigo-400 transition-colors"
                      title="Set as default resume"
                    >
                      <Star className="w-3.5 h-3.5" /> Make Default
                    </button>
                  ) : (
                    <span className="text-[11px] text-indigo-400 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Primary CV
                    </span>
                  )}

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleDownload(resume)}
                      className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                      title="Download File"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(resume._id, resume.title)}
                      className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                      title="Delete Resume"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <ResumeUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploaded={() => {
          setIsUploadModalOpen(false);
          fetchResumes();
        }}
      />
    </DashboardShell>
  );
}
