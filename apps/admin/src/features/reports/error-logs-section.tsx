'use client';

import { useToast } from '@/components/toast-provider';
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Copy,
  Download,
  Info,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { Fragment, useCallback, useEffect, useState } from 'react';
import { useAdminErrorLogs } from '@/hooks/useAdminErrorLogs';
import type { AppliedReportPeriod } from '@/lib/report-period';
import type { ErrorLogItem, ErrorLogLevel } from './error-log-types';
import { copyText, downloadCsv, errorLogsToCsv } from './error-logs-utils';

const LEVELS: { id: string; label: string }[] = [
  { id: 'all', label: 'All levels' },
  { id: 'error', label: 'Errors' },
  { id: 'warn', label: 'Warnings' },
  { id: 'info', label: 'Info' },
];

function LevelBadge({ level }: { level: ErrorLogLevel }) {
  const styles: Record<ErrorLogLevel, string> = {
    error: 'bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-300',
    warn: 'bg-amber-100 text-amber-900 dark:bg-amber-950/50 dark:text-amber-200',
    info: 'bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300',
  };
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${styles[level]}`}
    >
      {level}
    </span>
  );
}

type Props = {
  period: AppliedReportPeriod;
  search: string;
  onRegisterExport?: (handler: (() => Promise<void>) | null) => void;
  embedded?: boolean;
};

export function ErrorLogsSection({ period, search, onRegisterExport, embedded = false }: Props) {
  const days = period.days;
  const { toast } = useToast();
  const [level, setLevel] = useState('all');
  const [resolvedFilter, setResolvedFilter] = useState('');
  const [hoursFilter, setHoursFilter] = useState<number | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  const { data, loading, isRefreshing, error, refetch, resolveLog, exportLogs } = useAdminErrorLogs({
    days: hoursFilter ? undefined : days,
    from: hoursFilter ? undefined : period.from,
    to: hoursFilter ? undefined : period.to,
    hours: hoursFilter,
    page,
    limit: 25,
    level,
    search,
    status:
      resolvedFilter === 'false'
        ? 'unresolved'
        : resolvedFilter === 'true'
          ? 'resolved'
          : 'all',
  });

  const runExport = useCallback(async () => {
    setExporting(true);
    try {
      const rows = await exportLogs();
      if (!rows.length) {
        toast('No error logs to export for the current filters', 'info');
        return;
      }
      const csv = errorLogsToCsv(rows);
      downloadCsv(`error-logs-${new Date().toISOString().slice(0, 10)}.csv`, csv);
      toast(`Exported ${rows.length} log${rows.length === 1 ? '' : 's'}`, 'success');
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Export failed', 'error');
    } finally {
      setExporting(false);
    }
  }, [exportLogs, toast]);

  useEffect(() => {
    onRegisterExport?.(runExport);
    return () => onRegisterExport?.(null);
  }, [onRegisterExport, runExport]);

  const handleResolve = async (id: string) => {
    setResolvingId(id);
    try {
      await resolveLog(id);
      toast('Marked as resolved', 'success');
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed to resolve log', 'error');
    } finally {
      setResolvingId(null);
    }
  };

  const handleCopy = async (label: string, text: string) => {
    const ok = await copyText(text);
    toast(ok ? `${label} copied` : 'Copy failed — check browser permissions', ok ? 'success' : 'error');
  };

  const resetFilters = () => {
    setLevel('all');
    setResolvedFilter('');
    setHoursFilter(undefined);
    setPage(1);
  };

  useEffect(() => {
    setPage(1);
  }, [search]);

  return (
    <div className={embedded ? 'space-y-6' : 'mt-8 space-y-6'}>
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
          <button type="button" className="ml-2 font-semibold underline" onClick={() => refetch()}>
            Retry
          </button>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total (period)"
          value={loading ? '—' : String(data?.stats.total ?? 0)}
          sub="logged events · click to reset filters"
          onClick={resetFilters}
          active={level === 'all' && !resolvedFilter && !hoursFilter}
        />
        <StatCard
          label="Unresolved"
          value={loading ? '—' : String(data?.stats.unresolved ?? 0)}
          sub="needs review · click to filter"
          accent={data?.stats.unresolved ? 'text-amber-600' : undefined}
          onClick={() => {
            setResolvedFilter('false');
            setHoursFilter(undefined);
            setPage(1);
          }}
          active={resolvedFilter === 'false' && !hoursFilter}
        />
        <StatCard
          label="Last 24 hours"
          value={loading ? '—' : String(data?.stats.last24h ?? 0)}
          sub="recent activity · click to filter"
          onClick={() => {
            setHoursFilter(24);
            setPage(1);
          }}
          active={hoursFilter === 24}
        />
        <StatCard
          label="Error rate"
          value={loading ? '—' : data?.stats.errorRate ?? '0%'}
          sub={`${data?.stats.errorRateStatus ?? 'STABLE'} · click for errors only`}
          onClick={() => {
            setLevel('error');
            setPage(1);
          }}
          active={level === 'error'}
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-2">
          {LEVELS.map((l) => (
            <button
              key={l.id}
              type="button"
              onClick={() => {
                setLevel(l.id);
                setPage(1);
              }}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                level === l.id
                  ? 'bg-primary text-white'
                  : 'border border-border bg-surface text-muted hover:bg-border'
              }`}
            >
              {l.label}
              {!loading && data?.stats && l.id !== 'all' && (
                <span className="ml-1 opacity-80">
                  ({data.stats.byLevel[l.id as keyof typeof data.stats.byLevel] ?? 0})
                </span>
              )}
            </button>
          ))}
        </div>
        <select
          value={resolvedFilter}
          onChange={(e) => {
            setResolvedFilter(e.target.value);
            setPage(1);
          }}
          className="rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium text-foreground"
          aria-label="Filter by resolution status"
        >
          <option value="">All statuses</option>
          <option value="false">Unresolved only</option>
          <option value="true">Resolved only</option>
        </select>
        {(resolvedFilter || hoursFilter || level !== 'all') && (
          <button
            type="button"
            onClick={resetFilters}
            className="text-xs font-semibold text-accent hover:underline"
          >
            Clear filters
          </button>
        )}
        <button
          type="button"
          onClick={() => refetch()}
          disabled={isRefreshing}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-muted hover:bg-surface disabled:opacity-50"
        >
          <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
          {isRefreshing ? 'Refreshing…' : 'Refresh'}
        </button>
        <button
          type="button"
          onClick={() => runExport()}
          disabled={exporting || loading || data?.tableReady === false}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-muted hover:bg-surface disabled:opacity-50"
        >
          {exporting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
          {exporting ? 'Exporting…' : 'Export CSV'}
        </button>
      </div>

      {hoursFilter === 24 && (
        <p className="text-xs text-muted">
          Showing logs from the last 24 hours.{' '}
          <button type="button" className="font-semibold text-accent hover:underline" onClick={resetFilters}>
            Show full period
          </button>
        </p>
      )}

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="flex items-center gap-2 border-b border-border px-6 py-4">
          <AlertTriangle size={18} className="text-red-500" />
          <h2 className="text-base font-bold text-foreground">System error logs</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-surface/80 text-[10px] font-bold uppercase tracking-wider text-muted">
                <th className="px-4 py-3">Level</th>
                <th className="px-4 py-3">Message</th>
                <th className="px-4 py-3">Route</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Time</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading &&
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-border">
                    <td colSpan={6} className="px-4 py-4">
                      <div className="h-4 animate-pulse rounded bg-border" />
                    </td>
                  </tr>
                ))}

              {!loading && !data?.items.length && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted">
                    <Info className="mx-auto mb-2 opacity-50" size={28} />
                    No error logs match your filters. Try clearing filters or widening the date range
                    in the header.
                  </td>
                </tr>
              )}

              {!loading &&
                data?.items.map((log) => (
                  <Fragment key={log.id}>
                    <tr
                      className={`border-b border-border transition hover:bg-surface/40 ${
                        log.resolved ? 'opacity-60' : ''
                      } ${expandedId === log.id ? 'bg-surface/20' : ''}`}
                    >
                      <td className="px-4 py-3">
                        <LevelBadge level={log.level} />
                      </td>
                      <td className="max-w-xs px-4 py-3">
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedId((id) => (id === log.id ? null : log.id))
                          }
                          className="line-clamp-2 text-left font-medium text-foreground hover:text-accent"
                        >
                          {log.message}
                        </button>
                        {log.code && (
                          <p className="mt-0.5 font-mono text-[10px] text-muted">{log.code}</p>
                        )}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-muted">
                        {log.method && (
                          <span className="mr-1 font-bold text-foreground">{log.method}</span>
                        )}
                        {log.path ?? '—'}
                      </td>
                      <td className="px-4 py-3 text-muted">{log.statusCode ?? '—'}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-xs text-muted">
                        {log.createdAtFormatted}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap items-center gap-2">
                          {!log.resolved && (
                            <button
                              type="button"
                              disabled={resolvingId === log.id}
                              onClick={() => handleResolve(log.id)}
                              className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:underline disabled:opacity-50"
                            >
                              {resolvingId === log.id && (
                                <Loader2 size={12} className="animate-spin" />
                              )}
                              {resolvingId === log.id ? 'Resolving…' : 'Resolve'}
                            </button>
                          )}
                          {log.resolved && (
                            <span className="inline-flex items-center gap-1 text-xs text-emerald-600">
                              <CheckCircle2 size={14} />
                              Resolved
                            </span>
                          )}
                          {(log.stack || log.metadata) && (
                            <button
                              type="button"
                              onClick={() =>
                                setExpandedId((id) => (id === log.id ? null : log.id))
                              }
                              className="text-xs font-semibold text-accent hover:underline"
                            >
                              {expandedId === log.id ? (
                                <span className="inline-flex items-center gap-0.5">
                                  Hide <ChevronUp size={12} />
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-0.5">
                                  Details <ChevronDown size={12} />
                                </span>
                              )}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                    {expandedId === log.id && (
                      <tr className="border-b border-border bg-surface/30">
                        <td colSpan={6} className="px-6 py-4">
                          <LogDetailPanel log={log} onCopy={handleCopy} />
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
            </tbody>
          </table>
        </div>

        {data && data.pagination.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border px-6 py-4">
            <p className="text-xs text-muted">
              Page {data.pagination.page} of {data.pagination.totalPages} ({data.pagination.total}{' '}
              logs)
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={page <= 1 || isRefreshing}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold disabled:opacity-40"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={!data.pagination.hasMore || isRefreshing}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function LogDetailPanel({
  log,
  onCopy,
}: {
  log: ErrorLogItem;
  onCopy: (label: string, text: string) => void;
}) {
  const detailText = [
    `ID: ${log.id}`,
    `Level: ${log.level}`,
    `Message: ${log.message}`,
    log.code ? `Code: ${log.code}` : null,
    log.statusCode ? `Status: ${log.statusCode}` : null,
    log.method ? `Method: ${log.method}` : null,
    log.path ? `Path: ${log.path}` : null,
    log.userId ? `User: ${log.userId}` : null,
    `Created: ${log.createdAtFormatted}`,
    log.resolved ? `Resolved: ${log.resolvedAt ?? 'yes'}` : 'Resolved: no',
    log.stack ? `\nStack:\n${log.stack}` : null,
    log.metadata ? `\nMetadata:\n${JSON.stringify(log.metadata, null, 2)}` : null,
  ]
    .filter(Boolean)
    .join('\n');

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <CopyButton label="Copy all" onClick={() => onCopy('Log details', detailText)} />
        <CopyButton label="Copy message" onClick={() => onCopy('Message', log.message)} />
        <CopyButton label="Copy ID" onClick={() => onCopy('Log ID', log.id)} />
        {log.stack && (
          <CopyButton label="Copy stack" onClick={() => onCopy('Stack trace', log.stack!)} />
        )}
      </div>
      <dl className="grid gap-2 text-xs sm:grid-cols-2">
        <DetailRow label="Log ID" value={log.id} mono />
        <DetailRow label="HTTP status" value={String(log.statusCode ?? '—')} />
        <DetailRow label="Method" value={log.method ?? '—'} />
        <DetailRow label="Path" value={log.path ?? '—'} mono />
        <DetailRow label="User ID" value={log.userId ?? '—'} mono />
        <DetailRow
          label="Resolution"
          value={
            log.resolved
              ? `Resolved ${log.resolvedAt ? `at ${log.resolvedAt}` : ''}`
              : 'Unresolved'
          }
        />
      </dl>
      {log.stack && (
        <pre className="max-h-40 overflow-auto rounded-lg bg-zinc-900 p-3 text-[11px] text-zinc-200">
          {log.stack}
        </pre>
      )}
      {log.metadata && Object.keys(log.metadata).length > 0 && (
        <pre className="max-h-32 overflow-auto rounded-lg border border-border bg-card p-3 text-[11px] text-muted">
          {JSON.stringify(log.metadata, null, 2)}
        </pre>
      )}
      {!log.stack && !log.metadata && (
        <p className="text-xs text-muted">No stack trace or metadata recorded for this event.</p>
      )}
    </div>
  );
}

function CopyButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1 rounded-lg border border-border bg-card px-2.5 py-1 text-[10px] font-semibold text-muted hover:bg-surface"
    >
      <Copy size={12} />
      {label}
    </button>
  );
}

function StatCard({
  label,
  value,
  sub,
  accent,
  onClick,
  active,
}: {
  label: string;
  value: string;
  sub: string;
  accent?: string;
  onClick?: () => void;
  active?: boolean;
}) {
  const className = `rounded-xl border p-4 text-left shadow-sm transition hover:shadow-md ${
    active
      ? 'border-primary/50 bg-primary/5 ring-1 ring-primary/20'
      : 'border-border bg-card hover:border-primary/30'
  }`;

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={className}>
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted">{label}</p>
        <p className={`mt-1 text-2xl font-bold ${accent ?? 'text-foreground'}`}>{value}</p>
        <p className="mt-0.5 text-xs text-muted">{sub}</p>
      </button>
    );
  }

  return (
    <div className={className}>
      <p className="text-[10px] font-bold uppercase tracking-wider text-muted">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${accent ?? 'text-foreground'}`}>{value}</p>
      <p className="mt-0.5 text-xs text-muted">{sub}</p>
    </div>
  );
}

function DetailRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <dt className="font-bold uppercase tracking-wider text-muted">{label}</dt>
      <dd className={`mt-0.5 text-foreground ${mono ? 'font-mono text-[11px]' : ''}`}>{value}</dd>
    </div>
  );
}

