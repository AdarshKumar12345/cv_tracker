'use client';

import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface TrendItem {
  name: string;
  applications: number;
  interviews: number;
  offers: number;
}

interface TrendsChartProps {
  data: TrendItem[];
}

export function TrendsChart({ data }: TrendsChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-sm text-zinc-400">
        No application trend data available yet. Track your first job application!
      </div>
    );
  }

  return (
    <div className="h-72 w-full pt-2">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="colorInterviews" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#a855f7" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#a855f7" stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="colorOffers" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" opacity={0.3} />
          <XAxis
            dataKey="name"
            stroke="#71717a"
            fontSize={11}
            tickLine={false}
            axisLine={{ stroke: '#27272a', opacity: 0.5 }}
          />
          <YAxis
            stroke="#71717a"
            fontSize={11}
            tickLine={false}
            axisLine={{ stroke: '#27272a', opacity: 0.5 }}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#18181b',
              border: '1px solid #27272a',
              borderRadius: '0.75rem',
              fontSize: '12px',
              color: '#f4f4f5',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
            }}
          />
          <Area
            type="monotone"
            dataKey="applications"
            name="Applications"
            stroke="#6366f1"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorApps)"
          />
          <Area
            type="monotone"
            dataKey="interviews"
            name="Interviews"
            stroke="#a855f7"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorInterviews)"
          />
          <Area
            type="monotone"
            dataKey="offers"
            name="Offers"
            stroke="#10b981"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorOffers)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
