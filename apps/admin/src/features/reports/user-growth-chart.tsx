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
import type { UserGrowthTrendPoint } from './types';

function ChartTooltip({
  active,
  payload,
  periodLabel,
}: {
  active?: boolean;
  payload?: Array<{ value?: number; payload?: UserGrowthTrendPoint }>;
  periodLabel: string;
}) {
  if (!active || !payload?.length) return null;
  const point = payload[0]?.payload;
  const count = payload[0]?.value ?? 0;
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-lg">
      <p className="text-xs font-semibold text-foreground">{point?.label ?? point?.date}</p>
      <p className="mt-0.5 text-sm font-bold text-primary">
        {count} {periodLabel}
        {count === 1 ? '' : 's'}
      </p>
    </div>
  );
}

type Props = {
  data: UserGrowthTrendPoint[];
  loading?: boolean;
  view?: 'daily' | 'monthly';
};

export function UserGrowthChart({ data, loading, view = 'daily' }: Props) {
  if (loading) {
    return <div className="h-72 animate-pulse rounded-xl bg-surface" />;
  }

  if (!data.length) {
    return (
      <p className="flex h-72 items-center justify-center text-sm text-muted">
        No signups in this period for the selected role.
      </p>
    );
  }

  const periodLabel = view === 'monthly' ? 'new user' : 'new user';

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 12, right: 12, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" vertical={false} />
          <XAxis
            dataKey="label"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#71717a', fontSize: 10, fontWeight: 600 }}
            interval={view === 'monthly' ? 0 : 'preserveStartEnd'}
            angle={view === 'monthly' ? -35 : 0}
            textAnchor={view === 'monthly' ? 'end' : 'middle'}
            height={view === 'monthly' ? 48 : 30}
          />
          <YAxis
            allowDecimals={false}
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#a1a1aa', fontSize: 10 }}
            width={28}
          />
          <Tooltip content={<ChartTooltip periodLabel={periodLabel} />} />
          <Bar dataKey="signups" name="Signups" fill="#1e3a5f" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
