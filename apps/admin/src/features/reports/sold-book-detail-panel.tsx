'use client';

import { BookOpen, ExternalLink, X } from 'lucide-react';
import Link from 'next/link';
import { formatEtb } from '@/features/revenue/export-utils';
import type { ReportTransaction } from './types';

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 border-b border-border/60 py-2.5 last:border-0">
      <span className="shrink-0 text-xs font-medium text-muted">{label}</span>
      <span className="text-right text-xs font-semibold text-foreground">{value}</span>
    </div>
  );
}

type Props = {
  sale: ReportTransaction | null;
  bookDetailHref?: (bookId: string) => string;
  commissionPercent?: number;
  onClose?: () => void;
};

export function SoldBookDetailPanel({
  sale,
  bookDetailHref,
  commissionPercent,
  onClose,
}: Props) {
  if (!sale) {
    return (
      <div className="flex h-full min-h-[280px] flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface/30 p-6 text-center">
        <BookOpen className="mb-3 h-10 w-10 text-muted opacity-40" />
        <p className="text-sm font-semibold text-foreground">Sale details</p>
        <p className="mt-1 max-w-[220px] text-xs text-muted">
          Click any row in the sold books log to view the full purchase record.
        </p>
      </div>
    );
  }

  const title = sale.bookTitle || sale.source.split(' — ')[0] || sale.source;
  const author = sale.author || sale.source.split(' — ')[1] || '—';
  const rate = sale.commissionPercent ?? commissionPercent;

  return (
    <div className="sticky top-24 rounded-2xl border border-border bg-card shadow-sm">
      <div className="flex items-start justify-between gap-2 border-b border-border px-4 py-3">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Sale detail</p>
          <h4 className="mt-1 truncate text-sm font-bold text-foreground">{title}</h4>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-lg p-1 text-muted hover:bg-surface hover:text-foreground"
            aria-label="Close details"
          >
            <X size={16} />
          </button>
        )}
      </div>

      <div className="max-h-[420px] overflow-y-auto px-4 py-2">
        <DetailRow label="Transaction ID" value={<span className="font-mono text-[11px]">{sale.id}</span>} />
        <DetailRow label="Book" value={title} />
        <DetailRow label="Author" value={author} />
        <DetailRow label="Publisher" value={sale.publisher || '—'} />
        <DetailRow label="Category" value={sale.genre || '—'} />
        <DetailRow label="ISBN" value={sale.isbn || '—'} />
        <DetailRow
          label="Format"
          value={
            sale.format ? (
              <span className="capitalize">
                {sale.format === 'audio' ? 'Audio' : sale.format === 'pdf' ? 'PDF' : sale.format}
              </span>
            ) : (
              '—'
            )
          }
        />
        <DetailRow label="Customer" value={sale.customer || '—'} />
        <DetailRow label="Purchase date" value={sale.date} />
        {sale.purchaseTime && <DetailRow label="Purchase time" value={sale.purchaseTime} />}
        <DetailRow label="Sale price" value={sale.amountFormatted} />
        <DetailRow
          label="Commission"
          value={
            sale.commissionAmount != null
              ? `${formatEtb(sale.commissionAmount)}${rate != null ? ` (${rate}%)` : ''}`
              : '—'
          }
        />
        <DetailRow
          label="Author earnings"
          value={sale.authorEarnings != null ? formatEtb(sale.authorEarnings) : '—'}
        />
        <DetailRow label="Payment" value={sale.paymentMethod || '—'} />
        <DetailRow label="Status" value={<span className="capitalize">{sale.status}</span>} />
      </div>

      {sale.bookId && bookDetailHref && (
        <div className="border-t border-border p-4">
          <Link
            href={bookDetailHref(sale.bookId)}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-primary/90"
          >
            Open book detail
            <ExternalLink size={14} />
          </Link>
        </div>
      )}
    </div>
  );
}
