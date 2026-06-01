export type SaleFormatFilter = 'all' | 'pdf' | 'audio';

export function parseSaleFormatParam(value: string | null): SaleFormatFilter {
  if (value === 'pdf' || value === 'audio') return value;
  return 'all';
}

/** Normalize DB / API format strings to pdf | audio | empty. */
export function normalizeSaleFormat(value?: string | null): 'pdf' | 'audio' | '' {
  const s = String(value || '').toLowerCase().trim();
  if (s.includes('audio') || s.includes('audiobook')) return 'audio';
  if (s.includes('pdf') || s.includes('ebook') || s.includes('epub')) return 'pdf';
  return '';
}

export function matchesSaleFormat(
  txFormat: string | undefined | null,
  filter: SaleFormatFilter,
): boolean {
  if (filter === 'all') return true;
  return normalizeSaleFormat(txFormat) === filter;
}

export type FormatSalesTotals = {
  totalRevenue: number;
  platformCommission: number;
  authorEarnings: number;
  totalBooksSold: number;
  totalCustomers: number;
  activeAuthors: number;
};

/** Sum cleared sale rows for format-filtered KPI display (fallback when API summary is stale). */
export function sumTransactionsByFormat(
  rows: Array<{
    format?: string | null;
    status?: string;
    amount?: number;
    commissionAmount?: number;
    authorEarnings?: number;
    customer?: string;
    author?: string;
  }>,
  filter: SaleFormatFilter,
): FormatSalesTotals {
  const cleared = rows.filter(
    (t) => matchesSaleFormat(t.format, filter) && (t.status === 'cleared' || !t.status),
  );
  const customers = new Set(cleared.map((t) => t.customer).filter(Boolean));
  const authors = new Set(cleared.map((t) => t.author).filter(Boolean));
  return {
    totalRevenue: cleared.reduce((s, t) => s + (Number(t.amount) || 0), 0),
    platformCommission: cleared.reduce((s, t) => s + (Number(t.commissionAmount) || 0), 0),
    authorEarnings: cleared.reduce((s, t) => s + (Number(t.authorEarnings) || 0), 0),
    totalBooksSold: cleared.length,
    totalCustomers: customers.size,
    activeAuthors: authors.size,
  };
}
