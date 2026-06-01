'use client';

import { ChevronLeft, Download, RefreshCw, Search } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { AdminTopHeader } from '@/components/admin-top-header';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { SaleFormatToggle } from '@/components/sale-format-toggle';
import { parseSaleFormatParam, type SaleFormatFilter } from '@/lib/sale-format';
import { useAdminRevenueSales } from '@/hooks/useAdminRevenue';
import {
  downloadCsv,
  downloadExcel,
  formatEtb,
  printAsPdf,
  salesToExportRows,
  tableHtmlFromRows,
} from './export-utils';
import type { RevenuePreset } from './types';

export function RevenueSalesPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
  const [bookTitleInput, setBookTitleInput] = useState('');
  const [authorNameInput, setAuthorNameInput] = useState('');
  const debouncedSearch = useDebouncedValue(searchInput, 400);
  const debouncedBookTitle = useDebouncedValue(bookTitleInput, 400);
  const debouncedAuthorName = useDebouncedValue(authorNameInput, 400);
  const [page, setPage] = useState(1);
  const [format, setFormat] = useState<SaleFormatFilter>(
    parseSaleFormatParam(searchParams.get('format')),
  );

  useEffect(() => {
    setFormat(parseSaleFormatParam(searchParams.get('format')));
  }, [searchParams]);

  const applyFormat = useCallback(
    (next: SaleFormatFilter) => {
      setFormat(next);
      setPage(1);
      const p = new URLSearchParams(searchParams.toString());
      if (next === 'all') p.delete('format');
      else p.set('format', next);
      router.replace(`/dashboard/revenue/sales?${p.toString()}`, { scroll: false });
    },
    [router, searchParams],
  );

  const preset = (searchParams.get('preset') as RevenuePreset) || 'this_month';
  const from = searchParams.get('from') || undefined;
  const to = searchParams.get('to') || undefined;

  const query = useMemo(
    () => ({
      preset,
      from,
      to,
      search: debouncedSearch.trim() || undefined,
      bookTitle: debouncedBookTitle.trim() || undefined,
      authorName: debouncedAuthorName.trim() || undefined,
      format: format !== 'all' ? format : undefined,
      page,
      limit: 25,
    }),
    [preset, from, to, debouncedSearch, debouncedBookTitle, debouncedAuthorName, format, page],
  );

  const { data, loading, error, refetch } = useAdminRevenueSales(query);

  useEffect(() => {
    if (data?.pagination && page > data.pagination.pages && data.pagination.pages > 0) {
      setPage(data.pagination.pages);
    }
  }, [page, data?.pagination]);

  useEffect(() => {
    const p = new URLSearchParams(searchParams.toString());
    const trimmed = debouncedSearch.trim();
    if (trimmed) p.set('search', trimmed);
    else p.delete('search');
    const next = p.toString();
    const current = searchParams.toString();
    if (next !== current) {
      router.replace(`/dashboard/revenue/sales?${next}`, { scroll: false });
    }
  }, [debouncedSearch, router, searchParams]);

  const onSearchChange = (value: string) => {
    setSearchInput(value);
    setPage(1);
  };

  const exportSales = (kind: 'csv' | 'xlsx' | 'pdf') => {
    const rows = salesToExportRows(data?.sales ?? []);
    const base = 'booknest-sold-books';
    if (kind === 'csv') downloadCsv(`${base}.csv`, rows);
    else if (kind === 'xlsx') downloadExcel(`${base}.xlsx`, rows);
    else printAsPdf('Sold Books', tableHtmlFromRows(rows));
  };

  return (
    <div className="min-h-screen bg-background">
      <AdminTopHeader
        adminSubtitle="Revenue Manager"
        searchValue={searchInput}
        onSearchChange={onSearchChange}
        searchPlaceholder="Search title, author, customer, transaction…"
      />

      <div className="space-y-4 px-8 py-8">
        <h1 className="text-2xl font-bold text-foreground">Sold Books</h1>
        <p className="text-sm text-muted">Successful purchases only</p>
        <Link
          href="/dashboard/revenue"
          className="inline-flex items-center gap-1 text-sm font-medium text-primary"
        >
          <ChevronLeft size={16} />
          Back to Revenue
        </Link>

        {data && !data.tableReady && (
          <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm">
            Run backend <code>npm run setup:revenue</code> to create sales tables.
          </div>
        )}

        {data?.summary && (
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {[
              ['Revenue', formatEtb(data.summary.totalRevenue)],
              ['Commission', formatEtb(data.summary.platformCommission)],
              ['Authors', formatEtb(data.summary.authorEarnings)],
              ['Sold', String(data.summary.totalBooksSold)],
              ['Customers', String(data.summary.totalCustomers)],
              ['Authors active', String(data.summary.activeAuthors)],
            ].map(([l, v]) => (
              <div key={l} className="rounded-lg border border-border bg-card px-3 py-2">
                <p className="text-[10px] uppercase text-muted">{l}</p>
                <p className="text-sm font-bold">{v}</p>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <div className="flex flex-1 min-w-[200px] items-center gap-2 rounded-lg border border-border bg-card px-3">
            <Search size={16} className="text-muted" />
            <input
              value={searchInput}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search title, author, customer, transaction…"
              className="flex-1 bg-transparent py-2 text-sm outline-none"
            />
          </div>
          <input
            placeholder="Book title"
            value={bookTitleInput}
            onChange={(e) => {
              setBookTitleInput(e.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-border bg-card px-3 py-2 text-sm"
          />
          <input
            placeholder="Author"
            value={authorNameInput}
            onChange={(e) => {
              setAuthorNameInput(e.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-border bg-card px-3 py-2 text-sm"
          />
          <SaleFormatToggle value={format} onChange={applyFormat} disabled={loading} />
          <button
            type="button"
            onClick={() => refetch()}
            className="rounded-lg border border-border px-3 py-2"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
          <div className="flex gap-1">
            {(['csv', 'xlsx', 'pdf'] as const).map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => exportSales(k)}
                className="inline-flex items-center gap-1 rounded-lg border border-border px-2 py-2 text-xs uppercase"
              >
                <Download size={12} />
                {k}
              </button>
            ))}
          </div>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full min-w-[1200px] text-left text-xs">
            <thead className="border-b border-border bg-surface/80 uppercase tracking-wider text-muted">
              <tr>
                <th className="px-3 py-3">Cover</th>
                <th className="px-3 py-3">Title</th>
                <th className="px-3 py-3">Author</th>
                <th className="px-3 py-3">Publisher</th>
                <th className="px-3 py-3">Category</th>
                <th className="px-3 py-3">Format</th>
                <th className="px-3 py-3">Customer</th>
                <th className="px-3 py-3">Date</th>
                <th className="px-3 py-3">Time</th>
                <th className="px-3 py-3">Qty</th>
                <th className="px-3 py-3">Price</th>
                <th className="px-3 py-3">Comm %</th>
                <th className="px-3 py-3">Commission</th>
                <th className="px-3 py-3">Author $</th>
                <th className="px-3 py-3">Payment</th>
                <th className="px-3 py-3">Tx ID</th>
                <th className="px-3 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={17} className="px-4 py-8 text-center text-muted">
                    Loading…
                  </td>
                </tr>
              )}
              {!loading && !(data?.sales.length) && (
                <tr>
                  <td colSpan={17} className="px-4 py-8 text-center text-muted">
                    No successful sales found.
                  </td>
                </tr>
              )}
              {data?.sales.map((s) => {
                const fmt = (s.format || '').toLowerCase();
                const isAudio = fmt.includes('audio');
                const isPdf = fmt.includes('pdf') || fmt.includes('ebook');
                return (
                <tr key={s.id} className="border-b border-border/50">
                  <td className="px-3 py-2">
                    {s.bookCover ? (
                      <Image
                        src={s.bookCover}
                        alt=""
                        width={32}
                        height={44}
                        className="rounded object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="h-11 w-8 rounded bg-surface" />
                    )}
                  </td>
                  <td className="max-w-[140px] truncate px-3 py-2 font-medium">{s.bookTitle}</td>
                  <td className="px-3 py-2">{s.author}</td>
                  <td className="px-3 py-2">{s.publisher}</td>
                  <td className="px-3 py-2">{s.category}</td>
                  <td className="px-3 py-2">
                    {isAudio ? (
                      <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold uppercase text-violet-800">
                        Audio
                      </span>
                    ) : isPdf ? (
                      <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-bold uppercase text-sky-800">
                        PDF
                      </span>
                    ) : (
                      <span className="capitalize text-muted">{s.format || '—'}</span>
                    )}
                  </td>
                  <td className="px-3 py-2">{s.customer}</td>
                  <td className="px-3 py-2">{s.purchaseDate}</td>
                  <td className="px-3 py-2">{s.purchaseTime}</td>
                  <td className="px-3 py-2">{s.quantity}</td>
                  <td className="px-3 py-2">{formatEtb(s.bookPrice)}</td>
                  <td className="px-3 py-2">{s.commissionPercent}%</td>
                  <td className="px-3 py-2">{formatEtb(s.commissionAmount)}</td>
                  <td className="px-3 py-2">{formatEtb(s.authorEarnings)}</td>
                  <td className="px-3 py-2">{s.paymentMethod}</td>
                  <td className="max-w-[100px] truncate px-3 py-2 font-mono text-[10px]">
                    {s.transactionId}
                  </td>
                  <td className="px-3 py-2 capitalize text-emerald-600">{s.status}</td>
                </tr>
              );
              })}
            </tbody>
          </table>
        </div>

        {data?.pagination && data.pagination.pages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="rounded border border-border px-3 py-1 text-sm disabled:opacity-40"
            >
              Prev
            </button>
            <span className="text-sm text-muted">
              Page {page} of {data.pagination.pages}
            </span>
            <button
              type="button"
              disabled={page >= data.pagination.pages}
              onClick={() => setPage((p) => p + 1)}
              className="rounded border border-border px-3 py-1 text-sm disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
