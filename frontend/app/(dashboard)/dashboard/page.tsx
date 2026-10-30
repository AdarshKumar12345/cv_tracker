'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { StatCard } from '@/components/dashboard/StatCard';
import { TrendsChart } from '@/components/dashboard/TrendsChart';
import { StatusPieChart } from '@/components/dashboard/StatusPieChart';
import { UpcomingInterviewsList } from '@/components/dashboard/UpcomingInterviewsList';
import { RecentActivityFeed } from '@/components/dashboard/RecentActivityFeed';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { InterviewModal } from '@/components/interviews/InterviewModal';
import { api } from '@/lib/api';
import { DashboardStats } from '@/types';
import {
  Briefcase,
  Send,
  Eye,
  CalendarCheck2,
  Award,
  XCircle,
  TrendingUp,
  Percent,
  Plus,
  ArrowUpRight,
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [trends, setTrends] = useState<any[]>([]);
  const [distribution, setDistribution] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isInterviewModalOpen, setIsInterviewModalOpen] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [statsRes, trendsRes, distRes] = await Promise.all([
        api.get('/analytics/dashboard'),
        api.get('/analytics/applications'),
        api.get('/analytics/status-distribution'),
      ]);

      if (statsRes.data.success) {
        setStats(statsRes.data.data);
      }
      if (trendsRes.data.success) {
        setTrends(trendsRes.data.data);
      }
      if (distRes.data.success) {
        setDistribution(distRes.data.data);
      }
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();

    // Listen for custom application updates
    const handleRefresh = () => loadData();
    window.addEventListener('application-saved', handleRefresh);
    return () => window.removeEventListener('application-saved', handleRefresh);
  }, [loadData]);

  const summary = stats?.summary || {
    total: 0,
    applied: 0,
    underReview: 0,
    assessment: 0,
    interviewScheduled: 0,
    offers: 0,
    rejected: 0,
    withdrawn: 0,
    interviewConversionRate: 0,
    successRate: 0,
  };

  return (
    <DashboardShell
      title="Executive Overview"
      subtitle="Track your applications, interview pipeline, and hiring conversion performance."
    >
      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <StatCard
          title="Total Apps"
          value={summary.total}
          icon={<Briefcase className="w-4 h-4" />}
          colorClass="text-indigo-400 bg-indigo-500/10 border-indigo-500/20"
        />
        <StatCard
          title="Applied"
          value={summary.applied}
          icon={<Send className="w-4 h-4" />}
          colorClass="text-sky-400 bg-sky-500/10 border-sky-500/20"
        />
        <StatCard
          title="Under Review"
          value={summary.underReview}
          icon={<Eye className="w-4 h-4" />}
          colorClass="text-amber-400 bg-amber-500/10 border-amber-500/20"
        />
        <StatCard
          title="Interviews"
          value={summary.interviewScheduled}
          icon={<CalendarCheck2 className="w-4 h-4" />}
          colorClass="text-purple-400 bg-purple-500/10 border-purple-500/20"
        />
        <StatCard
          title="Offers"
          value={summary.offers}
          icon={<Award className="w-4 h-4" />}
          colorClass="text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
        />
        <StatCard
          title="Rejected"
          value={summary.rejected}
          icon={<XCircle className="w-4 h-4" />}
          colorClass="text-rose-400 bg-rose-500/10 border-rose-500/20"
        />
      </div>

      {/* Conversion Rate Banners */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex items-center justify-between p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-gradient-to-r from-purple-500/10 via-indigo-500/5 to-transparent">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-400">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-semibold uppercase tracking-wider">
                Interview Conversion Rate
              </p>
              <p className="text-xl font-extrabold text-zinc-900 dark:text-zinc-100">
                {summary.interviewConversionRate}%
              </p>
            </div>
          </div>
          <span className="text-xs text-zinc-400">
            {summary.interviewScheduled} interviews from {summary.total} total
          </span>
        </div>

        <div className="flex items-center justify-between p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400">
              <Percent className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-semibold uppercase tracking-wider">
                Overall Offer Success Rate
              </p>
              <p className="text-xl font-extrabold text-zinc-900 dark:text-zinc-100">
                {summary.successRate}%
              </p>
            </div>
          </div>
          <span className="text-xs text-zinc-400">
            {summary.offers} offers received
          </span>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Application & Interview Trends</CardTitle>
              <CardDescription>
                Monthly activity over the last 6 months
              </CardDescription>
            </div>
            <Link
              href="/analytics"
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold inline-flex items-center gap-1"
            >
              Full Analytics <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </CardHeader>
          <CardContent>
            <TrendsChart data={trends} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status Breakdown</CardTitle>
            <CardDescription>
              Current distribution across hiring stages
            </CardDescription>
          </CardHeader>
          <CardContent>
            <StatusPieChart data={distribution} />
          </CardContent>
        </Card>
      </div>

      {/* Two Columns: Upcoming Interviews + Activity Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle>Upcoming Interviews</CardTitle>
              <CardDescription>
                Rounds scheduled on your calendar
              </CardDescription>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsInterviewModalOpen(true)}
              icon={<Plus className="w-3.5 h-3.5" />}
            >
              Schedule
            </Button>
          </CardHeader>
          <CardContent>
            <UpcomingInterviewsList
              interviews={stats?.upcomingInterviews || []}
              onScheduleClick={() => setIsInterviewModalOpen(true)}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Recent Activity Timeline</CardTitle>
            <CardDescription>
              Latest changes, status shifts, and logged events
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RecentActivityFeed activities={stats?.recentActivities || []} />
          </CardContent>
        </Card>
      </div>

      <InterviewModal
        isOpen={isInterviewModalOpen}
        onClose={() => setIsInterviewModalOpen(false)}
        onSaved={() => {
          setIsInterviewModalOpen(false);
          loadData();
        }}
      />
    </DashboardShell>
  );
}
