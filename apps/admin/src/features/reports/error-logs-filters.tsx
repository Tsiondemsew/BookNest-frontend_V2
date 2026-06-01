'use client';

import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  CircleDot,
  Info,
  XCircle,
} from 'lucide-react';
import type { ErrorLogLevel, ErrorLogsData } from './error-log-types';
import type { ErrorLogLevelFilter, ErrorLogStatusFilter } from './error-log-types';

const LEVEL_OPTIONS: {
  id: ErrorLogLevelFilter;
  label: string;
  icon: typeof XCircle;
  activeClass: string;
  idleClass: string;
}[] = [
  {
    id: 'all',
    label: 'All levels',
    icon: CircleDot,
    activeClass: 'bg-primary text-white border-primary',
    idleClass: 'border-border bg-surface text-muted hover:border-primary/40',
  },
  {
    id: 'error',
    label: 'Errors',
    icon: XCircle,
    activeClass: 'bg-red-600 text-white border-red-600',
    idleClass: 'border-red-200 bg-red-50 text-red-800 hover:bg-red-100 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300',
  },
  {
    id: 'warn',
    label: 'Warnings',
    icon: AlertTriangle,
    activeClass: 'bg-amber-500 text-white border-amber-500',
    idleClass: 'border-amber-200 bg-amber-50 text-amber-900 hover:bg-amber-100 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-200',
  },
  {
    id: 'info',
    label: 'Info',
    icon: Info,
    activeClass: 'bg-blue-600 text-white border-blue-600',
    idleClass: 'border-blue-200 bg-blue-50 text-blue-800 hover:bg-blue-100 dark:border-blue-900/50 dark:bg-blue-950/40 dark:text-blue-300',
  },
];

const STATUS_OPTIONS: {
  id: ErrorLogStatusFilter;
  label: string;
  icon: typeof CheckCircle2;
  activeClass: string;
  idleClass: string;
}[] = [
  {
    id: 'all',
    label: 'All statuses',
    icon: CircleDot,
    activeClass: 'bg-primary text-white border-primary',
    idleClass: 'border-border bg-surface text-muted hover:border-primary/40',
  },
  {
    id: 'unresolved',
    label: 'Unresolved',
    icon: AlertCircle,
    activeClass: 'bg-amber-500 text-white border-amber-500',
    idleClass: 'border-amber-200 bg-amber-50 text-amber-900 hover:bg-amber-100 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-200',
  },
  {
    id: 'resolved',
    label: 'Resolved',
    icon: CheckCircle2,
    activeClass: 'bg-emerald-600 text-white border-emerald-600',
    idleClass: 'border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300',
  },
];

function countForLevel(
  stats: ErrorLogsData['stats'] | undefined,
  level: ErrorLogLevelFilter,
  status: ErrorLogStatusFilter,
): number | null {
  if (!stats) return null;
  if (level === 'all' && status === 'all') return stats.total;
  if (level === 'all' && status === 'unresolved') return stats.unresolved;
  if (level === 'all' && status === 'resolved') return stats.resolved;
  if (status === 'unresolved' && level !== 'all') {
    return stats.byLevelUnresolved[level as ErrorLogLevel] ?? 0;
  }
  if (status === 'resolved' && level !== 'all') {
    const total = stats.byLevel[level as ErrorLogLevel] ?? 0;
    const open = stats.byLevelUnresolved[level as ErrorLogLevel] ?? 0;
    return Math.max(0, total - open);
  }
  if (level !== 'all' && status === 'all') {
    return stats.byLevel[level as ErrorLogLevel] ?? 0;
  }
  return null;
}

type Props = {
  level: ErrorLogLevelFilter;
  status: ErrorLogStatusFilter;
  stats?: ErrorLogsData['stats'];
  listTotal?: number | null;
  loading?: boolean;
  onLevelChange: (level: ErrorLogLevelFilter) => void;
  onStatusChange: (status: ErrorLogStatusFilter) => void;
};

export function ErrorLogsFilters({
  level,
  status,
  stats,
  listTotal,
  loading,
  onLevelChange,
  onStatusChange,
}: Props) {
  return (
    <div className="space-y-4 rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted">By level</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {LEVEL_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const count = countForLevel(stats, opt.id, status);
            const active = level === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => onLevelChange(opt.id)}
                className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-semibold transition ${
                  active ? opt.activeClass : opt.idleClass
                }`}
              >
                <Icon size={14} />
                {opt.label}
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                    active ? 'bg-white/20' : 'bg-black/5 dark:bg-white/10'
                  }`}
                >
                  {loading ? '—' : (count ?? 0)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted">By status</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {STATUS_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const count = countForLevel(stats, 'all', opt.id);
            const active = status === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => onStatusChange(opt.id)}
                className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-semibold transition ${
                  active ? opt.activeClass : opt.idleClass
                }`}
              >
                <Icon size={14} />
                {opt.label}
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                    active ? 'bg-white/20' : 'bg-black/5 dark:bg-white/10'
                  }`}
                >
                  {loading ? '—' : (count ?? 0)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {(level !== 'all' || status !== 'all') && (
        <p className="text-xs text-muted">
          Active view:{' '}
          <span className="font-semibold text-foreground">{filterDescription(level, status)}</span>
          {listTotal != null && (
            <>
              {' '}
              — <span className="font-semibold text-foreground">{loading ? '…' : listTotal}</span>{' '}
              matching {listTotal === 1 ? 'entry' : 'entries'}
            </>
          )}
        </p>
      )}
    </div>
  );
}

function filterDescription(level: ErrorLogLevelFilter, status: ErrorLogStatusFilter): string {
  const levelPart =
    level === 'error' ? 'errors' : level === 'warn' ? 'warnings' : level === 'info' ? 'info logs' : 'logs';
  if (status === 'unresolved') {
    return level === 'all' ? 'unresolved logs' : `unresolved ${levelPart}`;
  }
  if (status === 'resolved') {
    return level === 'all' ? 'resolved logs' : `resolved ${levelPart}`;
  }
  return level === 'all' ? 'logs' : levelPart;
}

export function emptyStateMessage(
  level: ErrorLogLevelFilter,
  status: ErrorLogStatusFilter,
): { title: string; hint: string } {
  if (status === 'unresolved' && level === 'error') {
    return { title: 'No unresolved errors', hint: 'Critical issues you have not reviewed will appear here.' };
  }
  if (status === 'unresolved' && level === 'warn') {
    return { title: 'No unresolved warnings', hint: 'Client and validation warnings awaiting review show here.' };
  }
  if (status === 'unresolved' && level === 'info') {
    return { title: 'No unresolved info logs', hint: 'Informational events marked open will appear here.' };
  }
  if (status === 'unresolved') {
    return { title: 'No unresolved logs', hint: 'Everything in this period has been reviewed.' };
  }
  if (status === 'resolved' && level !== 'all') {
    return {
      title: `No resolved ${level === 'error' ? 'errors' : level === 'warn' ? 'warnings' : 'info logs'}`,
      hint: 'Resolve items from the unresolved view to track them here.',
    };
  }
  if (status === 'resolved') {
    return { title: 'No resolved logs yet', hint: 'Use Resolve on a log to move it into this view.' };
  }
  if (level === 'error') {
    return { title: 'No errors logged', hint: 'Server failures (5xx) and critical issues are recorded as errors.' };
  }
  if (level === 'warn') {
    return { title: 'No warnings logged', hint: '4xx responses and validation issues are typically logged as warnings.' };
  }
  if (level === 'info') {
    return { title: 'No info logs', hint: 'Lower-severity events appear here when recorded.' };
  }
  return {
    title: 'No logs in this period',
    hint: 'Adjust the date range in the header or trigger a test API error.',
  };
}
