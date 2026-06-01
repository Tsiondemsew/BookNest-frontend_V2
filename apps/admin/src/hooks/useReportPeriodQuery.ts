import type { AppliedReportPeriod } from '@/lib/report-period';
import { toReportsQuery } from '@/lib/report-period';

/** Query string params shared by reports, user growth, and error logs APIs. */
export function buildPeriodApiQuery(period: AppliedReportPeriod): string {
  const q = new URLSearchParams();
  const reports = toReportsQuery(period);
  if (reports.preset === 'custom' && reports.from && reports.to) {
    q.set('preset', 'custom');
    q.set('from', reports.from);
    q.set('to', reports.to);
    q.set('days', String(period.days));
  } else if (reports.days) {
    q.set('days', String(reports.days));
  }
  return q.toString();
}
