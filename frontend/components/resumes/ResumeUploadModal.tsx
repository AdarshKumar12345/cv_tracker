'use client';

import React, { useState, useRef } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { api } from '@/lib/api';
import { UploadCloud, FileText, CheckCircle2 } from 'lucide-react';

interface ResumeUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploaded: () => void;
}

export function ResumeUploadModal({
  isOpen,
  onClose,
  onUploaded,
}: ResumeUploadModalProps) {
  const { success, error } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      if (!title) {
        setTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      error('Please select a resume file (PDF or DOCX)');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('title', title.trim() || selectedFile.name);
    formData.append('isDefault', String(isDefault));

    try {
      await api.post('/resumes/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      success('Resume uploaded successfully');
      setSelectedFile(null);
      setTitle('');
      setIsDefault(false);
      onUploaded();
      onClose();
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to upload resume');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Upload Resume Version"
      description="Upload your latest CV in PDF or DOCX format (up to 10MB)."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-1">
        {/* Dropzone Area */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
            selectedFile
              ? 'border-indigo-500 bg-indigo-50/20 dark:bg-indigo-950/20'
              : 'border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-600 bg-zinc-50/50 dark:bg-zinc-900/40'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".pdf,.docx,.doc,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            className="hidden"
          />

          {selectedFile ? (
            <div className="flex flex-col items-center gap-2">
              <FileText className="w-10 h-10 text-indigo-500" />
              <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                {selectedFile.name}
              </div>
              <div className="text-xs text-zinc-500">
                {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Click to change file
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <UploadCloud className="w-10 h-10 text-zinc-400 group-hover:text-indigo-500 transition-colors" />
              <div className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                Click to browse or drag and drop resume
              </div>
              <p className="text-xs text-zinc-400">PDF, DOCX up to 10MB</p>
            </div>
          )}
        </div>

        <Input
          label="Resume Title"
          placeholder="e.g. Senior Full Stack Engineer (v2026)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <div className="flex items-center gap-2 pt-1">
          <input
            type="checkbox"
            id="makeDefault"
            checked={isDefault}
            onChange={(e) => setIsDefault(e.target.checked)}
            className="rounded border-zinc-300 dark:border-zinc-700 text-indigo-600 focus:ring-indigo-500 cursor-pointer w-4 h-4"
          />
          <label htmlFor="makeDefault" className="text-xs font-medium text-zinc-700 dark:text-zinc-300 cursor-pointer">
            Set as default resume for new applications
          </label>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={loading} icon={<UploadCloud className="w-4 h-4" />}>
            Upload Resume
          </Button>
        </div>
      </form>
    </Modal>
  );
}
