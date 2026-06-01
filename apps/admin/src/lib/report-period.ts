import type { ReportsQuery } from '@/hooks/useAdminReports';

export type ReportDaysPreset = 7 | 30 | 90;

export type AppliedReportPeriod = {
  from: string;
  to: string;
  days: number;
  preset: ReportDaysPreset | 'custom';
};

export function toDateInputValue(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function todayDateInput(): string {
  return toDateInputValue(new Date());
}

export function startDateForDays(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - Math.max(1, days) + 1);
  d.setHours(0, 0, 0, 0);
  return toDateInputValue(d);
}

export function daysInclusive(from: string, to: string): number {
  const a = new Date(`${from}T00:00:00`);
  const b = new Date(`${to}T00:00:00`);
  const diff = Math.floor((b.getTime() - a.getTime()) / 86400000) + 1;
  return Math.max(1, Math.min(365, diff));
}

export function periodFromPreset(days: ReportDaysPreset): AppliedReportPeriod {
  const to = todayDateInput();
  const from = startDateForDays(days);
  return { from, to, days, preset: days };
}

export function periodFromCustomRange(from: string, to: string): AppliedReportPeriod {
  return {
    from,
    to,
    days: daysInclusive(from, to),
    preset: 'custom',
  };
}

export function formatPeriodLabel(period: AppliedReportPeriod): string {
  if (period.preset !== 'custom') {
    return `Last ${period.preset} days`;
  }
  try {
    const fmt = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    return `${fmt.format(new Date(`${period.from}T12:00:00`))} – ${fmt.format(new Date(`${period.to}T12:00:00`))}`;
  } catch {
    return `${period.from} – ${period.to}`;
  }
}

export function isValidDateRange(from: string, to: string): boolean {
  if (!from || !to) return false;
  return new Date(`${from}T00:00:00`) <= new Date(`${to}T00:00:00`);
}

export function toReportsQuery(period: AppliedReportPeriod, format?: ReportsQuery['format']): ReportsQuery {
  return {
    preset: 'custom',
    from: period.from,
    to: period.to,
    days: period.days,
    format,
  };
}

export function parsePeriodFromSearchParams(params: URLSearchParams): AppliedReportPeriod {
  const from = params.get('from');
  const to = params.get('to');
  if (from && to && isValidDateRange(from, to)) {
    return periodFromCustomRange(from, to);
  }
  const days = parseInt(params.get('days') || '30', 10);
  const preset: ReportDaysPreset = days === 7 || days === 30 || days === 90 ? days : 30;
  return periodFromPreset(preset);
}
