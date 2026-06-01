'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { RevenueTrendPoint } from './types';

function formatEtb(value: number) {
  return `${Number(value).toLocaleString('en-US')} ETB`;
}

function ChartTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ value?: number; payload?: RevenueTrendPoint }>;
}) {
  if (!active || !payload?.length) return null;
  const point = payload[0]?.payload;
  const amount = payload[0]?.value ?? 0;
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-lg dark:border-border dark:bg-primary">
      <p className="text-xs font-semibold text-foreground">{point?.label ?? point?.date}</p>
      <p className="mt-0.5 text-sm font-bold text-accent">{formatEtb(amount)}</p>
    </div>
  );
}

type RevenueTrendChartProps = {
  data: RevenueTrendPoint[];
  loading?: boolean;
};

export function RevenueTrendChart({ data, loading }: RevenueTrendChartProps) {
  if (loading) {
    return <div className="h-44 animate-pulse rounded-xl bg-surface dark:bg-surface" />;
  }

  if (!data.length) {
    return (
      <p className="flex h-44 items-center justify-center text-xs text-muted">
        No revenue data in this period.
      </p>
    );
  }

  const tickInterval = data.length > 20 ? Math.floor(data.length / 6) : data.length > 10 ? 2 : 0;

  return (
    <div className="h-44 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 12, right: 4, left: -8, bottom: 0 }} barCategoryGap="18%">
          <defs>
            <linearGradient id="reportsRevenueBar" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#a78bfa" />
              <stop offset="100%" stopColor="#6366f1" />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" />
          <XAxis
            dataKey="label"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#a1a1aa', fontSize: 10 }}
            interval={tickInterval}
            dy={6}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#a1a1aa', fontSize: 10 }}
            tickFormatter={(v) => (v >= 1000 ? `${Math.round(v / 1000)}k` : String(v))}
            width={36}
          />
          <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(99, 102, 241, 0.08)' }} />
          <Bar
            dataKey="amount"
            fill="url(#reportsRevenueBar)"
            radius={[4, 4, 0, 0]}
            maxBarSize={28}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
