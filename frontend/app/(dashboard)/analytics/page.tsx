'use client';

import React, { useEffect, useState } from 'react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { TrendsChart } from '@/components/dashboard/TrendsChart';
import { StatusPieChart } from '@/components/dashboard/StatusPieChart';
import { api } from '@/lib/api';
import { DashboardStats } from '@/types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { TrendingUp, Award, Percent, Target, Zap, Clock } from 'lucide-react';

export default function AnalyticsPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [trends, setTrends] = useState<any[]>([]);
  const [distribution, setDistribution] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/analytics/dashboard'),
      api.get('/analytics/applications'),
      api.get('/analytics/status-distribution'),
    ])
      .then(([statsRes, trendsRes, distRes]) => {
        if (statsRes.data.success) setStats(statsRes.data.data);
        if (trendsRes.data.success) setTrends(trendsRes.data.data);
        if (distRes.data.success) setDistribution(distRes.data.data);
      })
      .finally(() => setLoading(false));
  }, []);

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

  // Funnel conversion steps
  const funnelSteps = [
    { name: 'Applied / In Play', value: summary.total, color: 'bg-sky-500' },
    { name: 'Reached Screening/Review', value: summary.underReview + summary.interviewScheduled + summary.offers, color: 'bg-amber-500' },
    { name: 'Interviews Scheduled', value: summary.interviewScheduled + summary.offers, color: 'bg-purple-500' },
    { name: 'Final Offers Received', value: summary.offers, color: 'bg-emerald-500' },
  ];

  return (
    <DashboardShell
      title="Hiring Pipeline Analytics & Conversion Funnel"
      subtitle="Analyze your job search efficiency, conversion rates, and response metrics."
    >
      {/* KPI Highlight Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card hoverEffect className="bg-gradient-to-br from-indigo-500/10 to-transparent">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-indigo-500/20 text-indigo-400">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-zinc-500 dark:text-zinc-400">
                Total Pipeline
              </p>
              <h3 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100">
                {summary.total}
              </h3>
            </div>
          </div>
        </Card>

        <Card hoverEffect className="bg-gradient-to-br from-purple-500/10 to-transparent">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-purple-500/20 text-purple-400">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-zinc-500 dark:text-zinc-400">
                Interview Rate
              </p>
              <h3 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100">
                {summary.interviewConversionRate}%
              </h3>
            </div>
          </div>
        </Card>

        <Card hoverEffect className="bg-gradient-to-br from-emerald-500/10 to-transparent">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-zinc-500 dark:text-zinc-400">
                Offers Closed
              </p>
              <h3 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100">
                {summary.offers}
              </h3>
            </div>
          </div>
        </Card>

        <Card hoverEffect className="bg-gradient-to-br from-teal-500/10 to-transparent">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-teal-500/20 text-teal-400">
              <Percent className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-zinc-500 dark:text-zinc-400">
                Success Rate
              </p>
              <h3 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100">
                {summary.successRate}%
              </h3>
            </div>
          </div>
        </Card>
      </div>

      {/* Funnel Visualizer */}
      <Card>
        <CardHeader>
          <CardTitle>Application Conversion Funnel</CardTitle>
          <CardDescription>
            Step-by-step retention from initial submission through final job offer
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 pt-2">
            {funnelSteps.map((step, idx) => {
              const maxVal = summary.total > 0 ? summary.total : 1;
              const pct = Math.round((step.value / maxVal) * 100);

              return (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-zinc-800 dark:text-zinc-200">{step.name}</span>
                    <span className="text-zinc-500">
                      {step.value} ({pct}%)
                    </span>
                  </div>
                  <div className="h-3 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${step.color} transition-all duration-500 rounded-full`}
                      style={{ width: `${Math.max(pct, 2)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Charts Dual Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Applications & Offers Timeline</CardTitle>
            <CardDescription>Monthly distribution trends</CardDescription>
          </CardHeader>
          <CardContent>
            <TrendsChart data={trends} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Current Status Breakdown</CardTitle>
            <CardDescription>Proportions by pipeline stage</CardDescription>
          </CardHeader>
          <CardContent>
            <StatusPieChart data={distribution} />
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
