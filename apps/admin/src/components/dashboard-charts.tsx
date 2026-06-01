'use client';

import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ChartContainerProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

function ChartContainer({ title, subtitle, children }: ChartContainerProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        {subtitle && <p className="text-sm text-muted">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

interface RevenueChartProps {
  data: Array<{
    date: string;
    revenue: number;
    orders: number;
  }>;
}

export function RevenueChart({ data }: RevenueChartProps) {
  return (
    <ChartContainer title="Revenue Trend" subtitle="Monthly revenue and order count">
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
          <XAxis dataKey="date" stroke="#71717a" style={{ fontSize: '12px' }} />
          <YAxis stroke="#71717a" style={{ fontSize: '12px' }} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e4e4e7',
              borderRadius: '8px',
            }}
          />
          <Legend />
          <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}

interface UserChartProps {
  data: Array<{
    date: string;
    readers: number;
    authors: number;
    total: number;
  }>;
}

export function UserChart({ data }: UserChartProps) {
  return (
    <ChartContainer title="User Growth" subtitle="Readers vs Authors over time">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
          <XAxis dataKey="date" stroke="#71717a" style={{ fontSize: '12px' }} />
          <YAxis stroke="#71717a" style={{ fontSize: '12px' }} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e4e4e7',
              borderRadius: '8px',
            }}
          />
          <Legend />
          <Bar dataKey="readers" fill="#10b981" />
          <Bar dataKey="authors" fill="#f59e0b" />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}

interface BookChartProps {
  data: Array<{
    date: string;
    newBooks: number;
    approvedBooks: number;
    rejectedBooks: number;
  }>;
}

export function BookChart({ data }: BookChartProps) {
  return (
    <ChartContainer title="Book Submissions" subtitle="New, approved, and rejected books">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
          <XAxis dataKey="date" stroke="#71717a" style={{ fontSize: '12px' }} />
          <YAxis stroke="#71717a" style={{ fontSize: '12px' }} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e4e4e7',
              borderRadius: '8px',
            }}
          />
          <Legend />
          <Bar dataKey="newBooks" fill="#8b5cf6" />
          <Bar dataKey="approvedBooks" fill="#10b981" />
          <Bar dataKey="rejectedBooks" fill="#ef4444" />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
