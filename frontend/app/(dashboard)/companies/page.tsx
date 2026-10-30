'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { CompanyModal } from '@/components/companies/CompanyModal';
import { useToast } from '@/components/ui/Toast';
import { api } from '@/lib/api';
import { Company } from '@/types';
import {
  Building2,
  Plus,
  Search,
  ExternalLink,
  MapPin,
  Star,
  Users,
  Edit,
  Trash2,
  Briefcase,
} from 'lucide-react';
import Link from 'next/link';

export default function CompaniesPage() {
  const { success, error } = useToast();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchCompanies = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/companies?search=${encodeURIComponent(search)}`);
      if (res.data.success) {
        setCompanies(res.data.data);
      }
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Delete company profile for "${name}"?`)) return;
    try {
      await api.delete(`/companies/${id}`);
      success('Company deleted successfully');
      fetchCompanies();
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to delete company');
    }
  };

  return (
    <DashboardShell
      title="Company Directory & Research"
      subtitle="Organize company intelligence, recruiter contacts, ratings, and track all applications per company."
    >
      {/* Top Search & Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-zinc-900/60 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
        <div className="w-full sm:w-80">
          <Input
            placeholder="Search companies by name..."
            icon={<Search className="w-4 h-4" />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="text-xs"
          />
        </div>

        <Button
          onClick={() => {
            setSelectedCompany(null);
            setIsModalOpen(true);
          }}
          icon={<Plus className="w-4 h-4" />}
        >
          Add Company
        </Button>
      </div>

      {/* Companies Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64 text-sm text-zinc-500">
          Loading companies...
        </div>
      ) : companies.length === 0 ? (
        <Card className="p-12 text-center space-y-4">
          <Building2 className="w-12 h-12 text-zinc-400 mx-auto opacity-40" />
          <h3 className="font-bold text-base text-zinc-800 dark:text-zinc-200">
            No companies in directory
          </h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            Add companies you are interested in or apply to jobs to have companies tracked automatically.
          </p>
          <Button
            onClick={() => {
              setSelectedCompany(null);
              setIsModalOpen(true);
            }}
            icon={<Plus className="w-4 h-4" />}
          >
            Add Company
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {companies.map((comp) => (
            <Card
              key={comp._id}
              hoverEffect
              className="flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-indigo-500/20 to-sky-500/20 border border-indigo-500/30 flex items-center justify-center font-bold text-indigo-500 text-sm shrink-0">
                      {comp.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-bold text-base text-zinc-900 dark:text-zinc-100 truncate">
                          {comp.name}
                        </h4>
                        {comp.website && (
                          <a
                            href={comp.website.startsWith('http') ? comp.website : `https://${comp.website}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-zinc-400 hover:text-indigo-400 transition-colors"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5 text-xs text-zinc-500">
                        {comp.location && (
                          <span className="flex items-center gap-1 truncate">
                            <MapPin className="w-3 h-3 text-zinc-400" />
                            {comp.location}
                          </span>
                        )}
                        {comp.industry && (
                          <>
                            <span>•</span>
                            <span className="truncate">{comp.industry}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setSelectedCompany(comp);
                        setIsModalOpen(true);
                      }}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                      title="Edit Company"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(comp._id, comp.name)}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                      title="Delete Company"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Rating and Description */}
                <div className="flex items-center gap-1 text-amber-400 text-xs">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${
                        i < (comp.rating || 3) ? 'fill-current' : 'text-zinc-300 dark:text-zinc-700'
                      }`}
                    />
                  ))}
                  <span className="text-[11px] text-zinc-400 ml-1">
                    {comp.rating || 3}/5 rating
                  </span>
                </div>

                {comp.description && (
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                    {comp.description}
                  </p>
                )}

                {/* Recruiter contacts snippet */}
                {comp.recruiterContacts && comp.recruiterContacts.length > 0 && (
                  <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
                    <div className="flex items-center gap-1 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">
                      <Users className="w-3 h-3 text-indigo-400" />
                      <span>Recruiters ({comp.recruiterContacts.length})</span>
                    </div>
                    <div className="space-y-1">
                      {comp.recruiterContacts.slice(0, 2).map((c, i) => (
                        <div key={i} className="text-xs text-zinc-700 dark:text-zinc-300 flex items-center justify-between">
                          <span className="font-medium truncate">{c.name}</span>
                          <span className="text-zinc-400 text-[11px] truncate max-w-[120px]">{c.role || c.email}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-xs text-zinc-500">
                <div className="flex items-center gap-1 text-indigo-400 font-semibold">
                  <Briefcase className="w-3.5 h-3.5" />
                  <span>{comp.applicationCount || 0} applications</span>
                </div>

                <Link
                  href={`/applications?search=${encodeURIComponent(comp.name)}`}
                  className="text-zinc-400 hover:text-zinc-200 transition-colors"
                >
                  View Jobs →
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}

      <CompanyModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedCompany(null);
        }}
        onSaved={() => {
          setIsModalOpen(false);
          setSelectedCompany(null);
          fetchCompanies();
        }}
        company={selectedCompany}
      />
    </DashboardShell>
  );
}
