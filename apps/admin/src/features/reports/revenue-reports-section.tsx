'use client';

import { BookOpen, Headphones, FileText, Settings, TrendingUp, Users } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { SoldBookDetailPanel } from './sold-book-detail-panel';
import { RevenueTrendChart } from './revenue-trend-chart';
import type { ReportTransaction, RevenueTrendPoint } from './types';
import { TopSoldBooksButtons } from '@/features/revenue/revenue-charts';
import { formatEtb } from '@/features/revenue/export-utils';
import { sumTransactionsByFormat } from '@/lib/sale-format';
import type { ReportsCenterData, SaleFormatFilter } from './types';

const REPORTS_RETURN = '/dashboard/reports?category=revenue';

function bookDetailPath(bookId: string) {
  return `/dashboard/books/${bookId}?returnTo=${encodeURIComponent(REPORTS_RETURN)}`;
}

function RevenueKpi({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="rounded-lg bg-primary/10 p-2 text-primary">{icon}</div>
      </div>
      <p className="mt-3 text-[10px] font-semibold uppercase tracking-wider text-muted">{label}</p>
      <p className="mt-1 text-xl font-bold text-foreground">{value}</p>
    </div>
  );
}

function FormatBadge({ format }: { format?: string }) {
  const f = (format || '').toLowerCase();
  if (f === 'audio') {
    return (
      <span className="inline-flex rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold uppercase text-violet-800">
        Audio
      </span>
    );
  }
  if (f === 'pdf') {
    return (
      <span className="inline-flex rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-bold uppercase text-sky-800">
        PDF
      </span>
    );
  }
  return (
    <span className="text-xs capitalize text-muted">{format || '—'}</span>
  );
}

type Props = {
  data: ReportsCenterData | null;
  loading: boolean;
  transactions?: ReportTransaction[];
  formatFilter?: SaleFormatFilter;
  onFormatSelect?: (format: SaleFormatFilter) => void;
};

function formatRevenueTitle(filter: SaleFormatFilter = 'all') {
  if (filter === 'audio') return 'Audio Revenue';
  if (filter === 'pdf') return 'PDF Revenue';
  return 'Total Revenue';
}

function formatBooksSoldTitle(filter: SaleFormatFilter = 'all') {
  if (filter === 'audio') return 'Audio Books Sold';
  if (filter === 'pdf') return 'PDF Books Sold';
  return 'Books Sold';
}

function formatCommissionTitle(filter: SaleFormatFilter = 'all') {
  if (filter === 'audio') return 'Audio Platform Commission';
  if (filter === 'pdf') return 'PDF Platform Commission';
  return 'Platform Commission';
}

function formatAuthorEarningsTitle(filter: SaleFormatFilter = 'all') {
  if (filter === 'audio') return 'Audio Author Earnings';
  if (filter === 'pdf') return 'PDF Author Earnings';
  return 'Author Earnings';
}

function formatSectionPrefix(filter: SaleFormatFilter = 'all') {
  if (filter === 'audio') return 'Audio';
  if (filter === 'pdf') return 'PDF';
  return '';
}

export function RevenueReportsSection({
  data,
  loading,
  transactions = [],
  formatFilter = 'all',
  onFormatSelect,
}: Props) {
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
  const [selectedSale, setSelectedSale] = useState<ReportTransaction | null>(null);

  const selectSale = (tx: ReportTransaction) => {
    setSelectedSale((prev) => (prev?.id === tx.id ? null : tx));
  };

  const filteredTransactions = useMemo(() => {
    if (!selectedBookId) return transactions;
    return transactions.filter((tx) => tx.bookId === selectedBookId);
  }, [transactions, selectedBookId]);

  useEffect(() => {
    if (selectedSale && !filteredTransactions.some((t) => t.id === selectedSale.id)) {
      setSelectedSale(null);
    }
  }, [filteredTransactions, selectedSale]);

  const rev = data?.revenue;
  const formatPrefix = formatSectionPrefix(formatFilter);

  const summary = useMemo(() => {
    if (loading) return undefined;

    const apiSummary = rev?.summary;

    if (formatFilter === 'all') {
      return apiSummary;
    }

    if (rev?.formatTotals?.format === formatFilter) {
      return {
        totalRevenue: rev.formatTotals.totalRevenue,
        platformCommission: rev.formatTotals.platformCommission,
        authorEarnings: rev.formatTotals.authorEarnings,
        totalBooksSold: rev.formatTotals.totalBooksSold,
        totalCustomers: apiSummary?.totalCustomers ?? 0,
        activeAuthors: apiSummary?.activeAuthors ?? 0,
      };
    }

    if (rev?.activeFormat === formatFilter && apiSummary) {
      return apiSummary;
    }

    const breakdown =
      formatFilter === 'audio' ? rev?.formatBreakdown?.audio : rev?.formatBreakdown?.pdf;
    if (breakdown) {
      return {
        totalRevenue: breakdown.revenue,
        platformCommission: breakdown.commission ?? 0,
        authorEarnings: breakdown.authorEarnings ?? 0,
        totalBooksSold: breakdown.sales,
        totalCustomers: apiSummary?.totalCustomers ?? 0,
        activeAuthors: apiSummary?.activeAuthors ?? 0,
      };
    }

    if (transactions.length > 0) {
      return sumTransactionsByFormat(transactions, formatFilter);
    }

    return apiSummary;
  }, [
    loading,
    rev?.summary,
    rev?.activeFormat,
    rev?.formatTotals,
    rev?.formatBreakdown,
    formatFilter,
    transactions,
  ]);

  const revenueTrendPoints: RevenueTrendPoint[] = useMemo(() => {
    return (rev?.charts?.revenueTrend ?? []).map((d) => {
      const date = d.date;
      let label = date;
      try {
        label = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(
          new Date(date),
        );
      } catch {
        /* keep raw date */
      }
      return { date, label, amount: d.revenue };
    });
  }, [rev?.charts?.revenueTrend]);

  const trendTotal = useMemo(() => {
    if (formatFilter !== 'all' && summary?.totalRevenue != null) {
      return summary.totalRevenue;
    }
    return revenueTrendPoints.reduce((s, p) => s + p.amount, 0);
  }, [revenueTrendPoints, formatFilter, summary?.totalRevenue]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs text-muted">
            {formatFilter === 'audio'
              ? 'Audio sales only — revenue and commission from completed audio purchases'
              : formatFilter === 'pdf'
                ? 'PDF sales only — revenue and commission from completed PDF purchases'
                : rev?.dataSource === 'user_purchases' || rev?.dataSource === 'book_sales'
                  ? 'All formats — totals from completed purchases in your database'
                  : 'Showing catalog estimate until purchase records exist'}
            {!loading && formatFilter !== 'all' && summary && (
              <span className="mt-1 block font-semibold text-foreground">
                {formatEtb(summary.totalRevenue ?? 0)} revenue ·{' '}
                {formatEtb(summary.platformCommission ?? 0)} commission ·{' '}
                {summary.totalBooksSold ?? 0} sold
              </span>
            )}
            {formatFilter !== 'all' && onFormatSelect && (
              <>
                {' '}
                <button
                  type="button"
                  className="font-semibold text-primary underline"
                  onClick={() => onFormatSelect('all')}
                >
                  Clear format filter
                </button>
              </>
            )}
            {rev?.commissionPercent != null && (
              <>
                {' '}
                · Commission <strong>{rev.commissionPercent}%</strong>
              </>
            )}
          </p>
        </div>
        <Link
          href="/dashboard/reports/settings"
          className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-semibold"
        >
          <Settings size={14} />
          Commission settings
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-8">
        <RevenueKpi
          label={formatRevenueTitle(formatFilter)}
          value={loading ? '—' : formatEtb(summary?.totalRevenue ?? 0)}
          icon={
            formatFilter === 'audio' ? (
              <Headphones size={18} />
            ) : formatFilter === 'pdf' ? (
              <FileText size={18} />
            ) : (
              <TrendingUp size={18} />
            )
          }
        />
        <RevenueKpi
          label={formatCommissionTitle(formatFilter)}
          value={loading ? '—' : formatEtb(summary?.platformCommission ?? 0)}
          icon={<TrendingUp size={18} />}
        />
        <RevenueKpi
          label={formatAuthorEarningsTitle(formatFilter)}
          value={loading ? '—' : formatEtb(summary?.authorEarnings ?? 0)}
          icon={<Users size={18} />}
        />
        <RevenueKpi
          label={formatBooksSoldTitle(formatFilter)}
          value={loading ? '—' : String(summary?.totalBooksSold ?? 0)}
          icon={<BookOpen size={18} />}
        />
        <RevenueKpi
          label="Customers"
          value={loading ? '—' : String(summary?.totalCustomers ?? 0)}
          icon={<Users size={18} />}
        />
        <RevenueKpi
          label="Active Authors"
          value={loading ? '—' : String(summary?.activeAuthors ?? 0)}
          icon={<Users size={18} />}
        />
        {formatFilter === 'all' && (
          <>
            <button
              type="button"
              onClick={() => onFormatSelect?.('pdf')}
              className="rounded-xl border border-border bg-card p-4 text-left shadow-sm transition hover:border-sky-500/50 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div className="rounded-lg bg-sky-100 p-2 text-sky-700">
                  <FileText size={18} />
                </div>
              </div>
              <p className="mt-3 text-[10px] font-semibold uppercase tracking-wider text-muted">
                PDF Sales
              </p>
              <p className="mt-1 text-xl font-bold text-foreground">
                {loading ? '—' : formatEtb(rev?.formatBreakdown?.pdf.revenue ?? 0)}
              </p>
              <p className="mt-0.5 text-[10px] text-muted">
                {loading ? '' : `${rev?.formatBreakdown?.pdf.sales ?? 0} sold · ${formatEtb(rev?.formatBreakdown?.pdf.commission ?? 0)} commission`}
              </p>
              <p className="mt-1 text-[10px] font-semibold text-primary">Filter PDF →</p>
            </button>
            <button
              type="button"
              onClick={() => onFormatSelect?.('audio')}
              className="rounded-xl border border-border bg-card p-4 text-left shadow-sm transition hover:border-violet-500/50 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div className="rounded-lg bg-violet-100 p-2 text-violet-700">
                  <Headphones size={18} />
                </div>
              </div>
              <p className="mt-3 text-[10px] font-semibold uppercase tracking-wider text-muted">
                Audio Sales
              </p>
              <p className="mt-1 text-xl font-bold text-foreground">
                {loading ? '—' : formatEtb(rev?.formatBreakdown?.audio.revenue ?? 0)}
              </p>
              <p className="mt-0.5 text-[10px] text-muted">
                {loading
                  ? ''
                  : `${rev?.formatBreakdown?.audio.sales ?? 0} sold · ${formatEtb(rev?.formatBreakdown?.audio.commission ?? 0)} commission`}
              </p>
              <p className="mt-1 text-[10px] font-semibold text-primary">Filter audio →</p>
            </button>
          </>
        )}
      </div>

      {(rev?.dataSource === 'user_purchases' || rev?.dataSource === 'book_sales') && (
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-foreground">
              {formatPrefix ? `${formatPrefix} Revenue Trend` : 'Revenue Trend'}
            </h3>
            {!loading && trendTotal > 0 && (
              <p className="text-xs font-semibold text-muted">
                Period total: {formatEtb(trendTotal)}
              </p>
            )}
          </div>
          <RevenueTrendChart data={revenueTrendPoints} loading={loading} />
        </div>
      )}

      <div className="rounded-2xl border border-border bg-card p-5">
        <h3 className="mb-3 text-sm font-semibold text-foreground">
          {formatPrefix ? `Top ${formatPrefix} Books` : 'Top Sold Books'}
        </h3>
        <p className="mb-3 text-xs text-muted">
          {formatFilter === 'audio'
            ? 'Top audio titles by sales in this period. Tap a book to filter the table below.'
            : formatFilter === 'pdf'
              ? 'Top PDF titles by sales in this period. Tap a book to filter the table below.'
              : 'Tap a book to filter the table. Click a sale row to view full details on the right.'}
        </p>
        <TopSoldBooksButtons
          data={rev?.charts.topBooks ?? []}
          loading={loading}
          selectedBookId={selectedBookId}
          onSelectBook={setSelectedBookId}
        />
      </div>

      {(rev?.dataSource === 'user_purchases' || rev?.dataSource === 'book_sales') && (
        <div className="rounded-2xl border border-border bg-card p-5">
          <h3 className="mb-1 text-sm font-semibold text-foreground">
            {formatFilter === 'audio'
              ? 'Recent Audio Sales'
              : formatFilter === 'pdf'
                ? 'Recent PDF Sales'
                : 'Recent Sold Books'}
            {selectedBookId && (
              <span className="ml-2 text-xs font-normal text-muted">(by book)</span>
            )}
          </h3>
          <p className="mb-4 text-xs text-muted">
            {loading
              ? 'Loading…'
              : `${rev?.recentSalesCount ?? filteredTransactions.length} recent sale${
                  (rev?.recentSalesCount ?? filteredTransactions.length) === 1 ? '' : 's'
                } in the selected period`}
          </p>
          <div className="grid gap-6 lg:grid-cols-5">
            <div className="overflow-x-auto lg:col-span-3">
            <table className="w-full min-w-[640px] text-left text-xs">
              <thead className="border-b border-border text-[10px] uppercase text-muted">
                <tr>
                  <th className="px-3 py-2">Transaction</th>
                  <th className="px-3 py-2">Book</th>
                  <th className="px-3 py-2">Format</th>
                  <th className="px-3 py-2">Customer</th>
                  <th className="px-3 py-2">Price</th>
                  <th className="px-3 py-2">Commission</th>
                  <th className="px-3 py-2">Author earnings</th>
                  <th className="px-3 py-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={8} className="px-3 py-6 text-center text-muted">
                      Loading…
                    </td>
                  </tr>
                )}
                {!loading && filteredTransactions.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-3 py-6 text-center text-muted">
                      {selectedBookId
                        ? 'No sales for this book in the period.'
                        : 'No sales in this period.'}
                    </td>
                  </tr>
                )}
                {!loading &&
                  filteredTransactions.map((tx) => {
                    const title = tx.bookTitle || tx.source.split(' — ')[0] || tx.source;
                    const isSelected = selectedSale?.id === tx.id;
                    return (
                      <tr
                        key={tx.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => selectSale(tx)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            selectSale(tx);
                          }
                        }}
                        className={`cursor-pointer border-b border-border/50 transition ${
                          isSelected
                            ? 'bg-primary/10 ring-1 ring-inset ring-primary/30'
                            : 'hover:bg-primary/5 focus-visible:bg-primary/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-primary'
                        }`}
                      >
                        <td className="max-w-[120px] truncate px-3 py-2 font-mono">{tx.id}</td>
                        <td className="max-w-[200px] px-3 py-2">
                          <span className="truncate font-medium text-foreground">{title}</span>
                          {(tx.author || tx.source.includes(' — ')) && (
                            <p className="truncate text-[10px] text-muted">
                              {tx.author || tx.source.split(' — ')[1]}
                            </p>
                          )}
                        </td>
                        <td className="px-3 py-2">
                          <FormatBadge format={tx.format} />
                        </td>
                        <td className="px-3 py-2">{tx.customer ?? '—'}</td>
                        <td className="px-3 py-2">{tx.amountFormatted}</td>
                        <td className="px-3 py-2">
                          {tx.commissionAmount != null ? formatEtb(tx.commissionAmount) : '—'}
                        </td>
                        <td className="px-3 py-2">
                          {tx.authorEarnings != null ? formatEtb(tx.authorEarnings) : '—'}
                        </td>
                        <td className="px-3 py-2">{tx.date}</td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
            </div>
            <div className="lg:col-span-2">
              <SoldBookDetailPanel
                sale={selectedSale}
                bookDetailHref={bookDetailPath}
                commissionPercent={rev?.commissionPercent}
                onClose={() => setSelectedSale(null)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
