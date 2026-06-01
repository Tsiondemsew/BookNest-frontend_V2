import * as XLSX from 'xlsx';
import type { RevenueSaleRow, PeriodReportRow } from './types';

export function formatEtb(n: number) {
  return `${Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ETB`;
}

export function salesToExportRows(sales: RevenueSaleRow[]) {
  return sales.map((s) => ({
    Title: s.bookTitle,
    Author: s.author,
    Publisher: s.publisher,
    Category: s.category,
    Customer: s.customer,
    Date: s.purchaseDate,
    Time: s.purchaseTime,
    Qty: s.quantity,
    Price: s.bookPrice,
    'Commission %': s.commissionPercent,
    Commission: s.commissionAmount,
    'Author Earnings': s.authorEarnings,
    'Payment Method': s.paymentMethod,
    'Transaction ID': s.transactionId,
    Status: s.status,
    ISBN: s.isbn,
    Format: s.format,
  }));
}

export function reportToExportRows(rows: PeriodReportRow[]) {
  return rows.map((r) => ({
    Period: r.period,
    'Books Sold': r.booksSold,
    Revenue: r.revenue,
    Commission: r.commission,
    'Author Earnings': r.authorEarnings,
  }));
}

export function downloadCsv(filename: string, rows: Record<string, unknown>[]) {
  if (!rows.length) return;
  const ws = XLSX.utils.json_to_sheet(rows);
  const csv = XLSX.utils.sheet_to_csv(ws);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function downloadExcel(filename: string, rows: Record<string, unknown>[]) {
  if (!rows.length) return;
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Report');
  XLSX.writeFile(wb, filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`);
}

export function printAsPdf(title: string, html: string) {
  const win = window.open('', '_blank', 'width=900,height=700');
  if (!win) return;
  win.document.write(`
    <!DOCTYPE html><html><head><title>${title}</title>
    <style>
      body { font-family: system-ui, sans-serif; padding: 24px; color: #111; }
      h1 { font-size: 18px; margin-bottom: 16px; }
      table { width: 100%; border-collapse: collapse; font-size: 11px; }
      th, td { border: 1px solid #ddd; padding: 6px 8px; text-align: left; }
      th { background: #f4f4f5; }
    </style></head><body>
    <h1>${title}</h1>${html}
    <script>window.onload = () => { window.print(); }</script>
    </body></html>`);
  win.document.close();
}

export function tableHtmlFromRows(rows: Record<string, unknown>[]) {
  if (!rows.length) return '<p>No data</p>';
  const keys = Object.keys(rows[0]);
  const head = keys.map((k) => `<th>${k}</th>`).join('');
  const body = rows
    .map(
      (r) =>
        `<tr>${keys.map((k) => `<td>${String(r[k] ?? '')}</td>`).join('')}</tr>`,
    )
    .join('');
  return `<table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>`;
}
