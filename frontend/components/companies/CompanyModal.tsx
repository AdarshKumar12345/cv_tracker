'use client';

import React, { useEffect, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { api } from '@/lib/api';
import { Company } from '@/types';
import { Plus, Trash2 } from 'lucide-react';

interface CompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  company?: Company | null;
}

export function CompanyModal({
  isOpen,
  onClose,
  onSaved,
  company,
}: CompanyModalProps) {
  const { success, error } = useToast();
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState('');
  const [website, setWebsite] = useState('');
  const [location, setLocation] = useState('');
  const [industry, setIndustry] = useState('');
  const [description, setDescription] = useState('');
  const [rating, setRating] = useState('3');
  const [notes, setNotes] = useState('');
  const [contacts, setContacts] = useState<
    Array<{ name: string; email: string; role: string; linkedin: string }>
  >([]);

  useEffect(() => {
    if (isOpen) {
      if (company) {
        setName(company.name || '');
        setWebsite(company.website || '');
        setLocation(company.location || '');
        setIndustry(company.industry || '');
        setDescription(company.description || '');
        setRating(company.rating?.toString() || '3');
        setNotes(company.notes || '');
        setContacts(
          company.recruiterContacts?.map((c) => ({
            name: c.name || '',
            email: c.email || '',
            role: c.role || '',
            linkedin: c.linkedin || '',
          })) || []
        );
      } else {
        setName('');
        setWebsite('');
        setLocation('');
        setIndustry('');
        setDescription('');
        setRating('3');
        setNotes('');
        setContacts([]);
      }
    }
  }, [isOpen, company]);

  const addContact = () => {
    setContacts([...contacts, { name: '', email: '', role: '', linkedin: '' }]);
  };

  const removeContact = (index: number) => {
    setContacts(contacts.filter((_, i) => i !== index));
  };

  const updateContact = (index: number, field: string, value: string) => {
    const updated = [...contacts];
    updated[index] = { ...updated[index], [field]: value };
    setContacts(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      error('Company name is required');
      return;
    }

    setLoading(true);

    const payload = {
      name: name.trim(),
      website: website.trim() || undefined,
      location: location.trim() || undefined,
      industry: industry.trim() || undefined,
      description: description.trim() || undefined,
      rating: parseInt(rating, 10) || 3,
      notes: notes.trim() || undefined,
      recruiterContacts: contacts.filter((c) => c.name.trim()),
    };

    try {
      if (company) {
        await api.put(`/companies/${company._id}`, payload);
        success('Company updated successfully');
      } else {
        await api.post('/companies', payload);
        success('Company added successfully');
      }
      onSaved();
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to save company');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={company ? 'Edit Company' : 'Add Company'}
      description="Organize company research, recruiters, and key company details."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-1">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Company Name *"
            placeholder="e.g. Figma"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Input
            label="Company Website"
            placeholder="https://..."
            type="url"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label="Location"
            placeholder="e.g. New York, NY"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
          <Input
            label="Industry"
            placeholder="e.g. Fintech, SaaS, AI"
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
          />
          <Select
            label="Company Rating"
            value={rating}
            onChange={(e) => setRating(e.target.value)}
            options={[
              { label: '5 - Top Choice', value: '5' },
              { label: '4 - Strong Interest', value: '4' },
              { label: '3 - Neutral', value: '3' },
              { label: '2 - Backup', value: '2' },
              { label: '1 - Low Interest', value: '1' },
            ]}
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
            About Company / Description
          </label>
          <textarea
            rows={2}
            className="w-full rounded-lg border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            placeholder="Mission, funding stage, culture, tech stack..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* Recruiter Contacts list */}
        <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">
              Recruiters & Contacts ({contacts.length})
            </p>
            <Button type="button" size="sm" variant="outline" onClick={addContact} icon={<Plus className="w-3.5 h-3.5" />}>
              Add Contact
            </Button>
          </div>

          {contacts.map((contact, idx) => (
            <div key={idx} className="flex flex-col sm:flex-row gap-2 items-center bg-white dark:bg-zinc-900 p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800">
              <Input
                placeholder="Name"
                value={contact.name}
                onChange={(e) => updateContact(idx, 'name', e.target.value)}
                className="text-xs"
              />
              <Input
                placeholder="Email"
                type="email"
                value={contact.email}
                onChange={(e) => updateContact(idx, 'email', e.target.value)}
                className="text-xs"
              />
              <Input
                placeholder="Role"
                value={contact.role}
                onChange={(e) => updateContact(idx, 'role', e.target.value)}
                className="text-xs"
              />
              <button
                type="button"
                onClick={() => removeContact(idx)}
                className="p-1.5 text-zinc-400 hover:text-rose-500 transition-colors"
                title="Remove contact"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={loading}>
            {company ? 'Save Changes' : 'Add Company'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
