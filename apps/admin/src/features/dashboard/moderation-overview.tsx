'use client';

import Link from 'next/link';
import { AnimatedCounter } from '@/components/moderation/animated-counter';
import { useModerationStats } from '@/hooks/useModerationStats';

const cards = [
  {
    key: 'totalBooks',
    label: 'Total books',
    color: 'from-slate-600 to-slate-800',
    href: '/dashboard/overview/books',
  },
  {
    key: 'pending',
    label: 'Pending review',
    color: 'from-amber-500 to-orange-600',
    href: '/dashboard/overview/books?status=pending_review',
  },
  {
    key: 'approved',
    label: 'Approved',
    color: 'from-emerald-500 to-teal-600',
    href: '/dashboard/overview/books?status=approved',
  },
  {
    key: 'rejected',
    label: 'Rejected',
    color: 'from-red-500 to-rose-600',
    href: '/dashboard/overview/books?status=rejected',
  },
  { key: 'resubmitted', label: 'Submitted again', color: 'from-violet-500 to-purple-600' },
  { key: 'totalAuthors', label: 'Authors', color: 'from-indigo-500 to-blue-600', href: '/dashboard/overview/authors' },
] as const;

export function ModerationOverview() {
  const { stats, loading, error } = useModerationStats();

  if (error) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        Moderation stats unavailable. Ensure the backend is running.
      </div>
    );
  }

  return (
    <section className="mb-8">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-foreground">
            Catalog moderation
          </h2>
          <p className="text-sm text-muted">
            Live counts from the approval queue · reviewed today:{' '}
            {loading ? '…' : <AnimatedCounter value={stats?.reviewedToday ?? 0} />}
          </p>
        </div>
        <Link
          href="/dashboard/books"
          className="rounded-xl bg-gradient-to-r from-primary to-accent px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:shadow-lg"
        >
          Open approval queue
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        {cards.map((card) => {
          const { key, label, color } = card;
          const href = 'href' in card ? card.href : undefined;
          const value = stats?.[key as keyof typeof stats] ?? 0;
          const inner = (
            <div
              className={`rounded-2xl bg-gradient-to-br ${color} p-4 text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg`}
            >
              <p className="text-xs font-medium uppercase tracking-wide text-white/80">
                {label}
              </p>
              <p className="mt-2 text-3xl font-bold">
                {loading ? '—' : <AnimatedCounter value={Number(value)} />}
              </p>
            </div>
          );
          return href ? (
            <Link key={key} href={href} className="block">
              {inner}
            </Link>
          ) : (
            <div key={key}>{inner}</div>
          );
        })}
      </div>
    </section>
  );
}
