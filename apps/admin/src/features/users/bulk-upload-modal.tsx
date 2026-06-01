'use client';

import { AlertCircle, CheckCircle2, Download, Loader2, Upload, X } from 'lucide-react';
import { useRef, useState } from 'react';
import {
  downloadBulkUserTemplate,
  parseBulkUserSheet,
  submitBulkUserRows,
  type BulkImportResult,
  type BulkUserRow,
} from './user-bulk-parse';

type BulkUploadModalProps = {
  open: boolean;
  onClose: () => void;
  onComplete: () => void;
};

export function BulkUploadModal({ open, onClose, onComplete }: BulkUploadModalProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [rows, setRows] = useState<BulkUserRow[]>([]);
  const [fileName, setFileName] = useState('');
  const [parseError, setParseError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [result, setResult] = useState<BulkImportResult | null>(null);

  if (!open) return null;

  const reset = () => {
    setRows([]);
    setFileName('');
    setParseError(null);
    setImportError(null);
    setResult(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleFile = async (file: File | null) => {
    setParseError(null);
    setResult(null);
    setImportError(null);

    if (!file) return;

    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!['xlsx', 'xls', 'csv'].includes(ext || '')) {
      setParseError('Use an Excel file (.xlsx, .xls) or .csv');
      return;
    }

    try {
      const buffer = await file.arrayBuffer();
      const parsed = parseBulkUserSheet(buffer);
      if (!parsed.length) {
        setParseError('No valid rows found. Check the template headers and email column.');
        setRows([]);
        return;
      }
      if (parsed.length > 100) {
        setParseError(`Too many rows (${parsed.length}). Maximum is 100 per upload.`);
        setRows([]);
        return;
      }
      setRows(parsed);
      setFileName(file.name);
    } catch {
      setParseError('Could not read the file. Download the template and try again.');
      setRows([]);
    }
  };

  const handleImport = async () => {
    if (!rows.length) return;
    setImporting(true);
    setImportError(null);
    try {
      const summary = await submitBulkUserRows(rows);
      setResult(summary);
      if (summary.succeeded > 0) {
        onComplete();
      }
    } catch (err) {
      setImportError(err instanceof Error ? err.message : 'Import failed');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label="Close"
        onClick={handleClose}
      />
      <div className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
        <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-4 dark:border-border">
          <div>
            <h2 className="text-lg font-bold text-foreground">Bulk Upload (XLSX)</h2>
            <p className="mt-1 text-sm text-muted">
              Create or update up to 100 users per file. Download the template first.
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg p-2 text-muted hover:bg-surface dark:hover:bg-primary/90"
          >
            <X size={18} />
          </button>
        </div>

        <div className="overflow-y-auto px-6 py-4">
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={downloadBulkUserTemplate}
              className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-semibold text-muted hover:bg-surface dark:border-border dark:text-zinc-200"
            >
              <Download size={16} />
              Download template
            </button>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90"
            >
              <Upload size={16} />
              Choose file
            </button>
            <input
              ref={inputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
            />
          </div>

          {fileName && (
            <p className="mt-3 text-sm text-muted">
              File: <span className="font-medium">{fileName}</span> — {rows.length} row(s) ready
            </p>
          )}

          {parseError && (
            <p className="mt-3 flex items-start gap-2 text-sm text-red-600">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              {parseError}
            </p>
          )}

          {rows.length > 0 && !result && (
            <div className="mt-4 overflow-x-auto rounded-xl border border-border">
              <table className="w-full min-w-[520px] text-left text-xs">
                <thead className="bg-surface text-[10px] font-bold uppercase tracking-wider text-muted dark:bg-surface">
                  <tr>
                    <th className="px-3 py-2">Email</th>
                    <th className="px-3 py-2">Action</th>
                    <th className="px-3 py-2">Role</th>
                    <th className="px-3 py-2">Name</th>
                    <th className="px-3 py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.slice(0, 8).map((row) => (
                    <tr key={row.email} className="border-t border-border">
                      <td className="px-3 py-2 font-medium">{row.email}</td>
                      <td className="px-3 py-2">{row.action}</td>
                      <td className="px-3 py-2">{row.role}</td>
                      <td className="px-3 py-2">{row.name || '—'}</td>
                      <td className="px-3 py-2">{row.account_status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {rows.length > 8 && (
                <p className="border-t border-border px-3 py-2 text-xs text-muted dark:border-border">
                  + {rows.length - 8} more rows
                </p>
              )}
            </div>
          )}

          {importError && (
            <p className="mt-3 text-sm text-red-600">{importError}</p>
          )}

          {result && (
            <div className="mt-4 space-y-3">
              <div className="flex gap-4 text-sm">
                <span className="font-semibold text-emerald-600">
                  {result.succeeded} succeeded
                </span>
                <span className="font-semibold text-red-600">{result.failed} failed</span>
                <span className="text-muted">{result.total} total</span>
              </div>
              <div className="max-h-48 overflow-y-auto rounded-xl border border-border">
                <ul className="divide-y divide-zinc-100 text-xs dark:divide-zinc-800">
                  {result.results.map((item) => (
                    <li
                      key={`${item.row}-${item.email}`}
                      className="flex items-start gap-2 px-3 py-2"
                    >
                      {item.success ? (
                        <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-emerald-600" />
                      ) : (
                        <AlertCircle size={14} className="mt-0.5 shrink-0 text-red-600" />
                      )}
                      <span>
                        <span className="font-medium">Row {item.row}</span> — {item.email}:{' '}
                        {item.message}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 border-t border-border px-6 py-4 dark:border-border">
          <button
            type="button"
            onClick={handleClose}
            className="rounded-xl border border-border px-4 py-2 text-sm font-semibold text-muted dark:border-border dark:text-zinc-200"
          >
            {result ? 'Close' : 'Cancel'}
          </button>
          {!result && (
            <button
              type="button"
              disabled={!rows.length || importing}
              onClick={handleImport}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              {importing ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Upload size={16} />
              )}
              Run import
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
