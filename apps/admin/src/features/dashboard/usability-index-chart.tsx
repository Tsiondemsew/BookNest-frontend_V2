'use client';

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { DashboardOverviewData } from './types';

type Point = DashboardOverviewData['usabilityIndex'][number];

function ChartTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ name?: string; value?: number; color?: string }>;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-zinc-200 bg-white px-3 py-2 shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
      {payload.map((entry) => (
        <p key={entry.name} className="text-xs font-semibold" style={{ color: entry.color }}>
          {entry.name}: {entry.value}
        </p>
      ))}
    </div>
  );
}

export function UsabilityIndexChart({
  data,
  loading,
}: {
  data: Point[];
  loading?: boolean;
}) {
  if (loading) {
    return <div className="h-72 animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-800" />;
  }

  if (!data.length) {
    return (
      <p className="flex h-72 items-center justify-center text-sm text-zinc-500">
        No activity data available.
      </p>
    );
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 12, right: 12, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" vertical={false} />
          <XAxis
            dataKey="day"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#71717a', fontSize: 11, fontWeight: 600 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#a1a1aa', fontSize: 10 }}
            width={32}
          />
          <Tooltip content={<ChartTooltip />} />
          <Legend
            verticalAlign="top"
            align="right"
            iconType="circle"
            wrapperStyle={{ fontSize: 12, paddingBottom: 8 }}
          />
          <Line
            type="monotone"
            dataKey="backendLoad"
            name="Backend Load"
            stroke="#1e3a5f"
            strokeWidth={3}
            dot={false}
            activeDot={{ r: 5 }}
          />
          <Line
            type="monotone"
            dataKey="responseTime"
            name="Response Time"
            stroke="#60a5fa"
            strokeWidth={3}
            dot={false}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
