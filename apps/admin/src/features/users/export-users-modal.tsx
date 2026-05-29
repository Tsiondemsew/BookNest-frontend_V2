'use client';

import { Download, X } from 'lucide-react';
import { useState } from 'react';
import type { AdminUserRow } from './types';
import { downloadUsersCsv, fetchUsersForExport } from './user-export';

export type UserRoleFilter = '' | 'reader' | 'author' | 'publisher' | 'admin';

export type ExportScope = 'current_page' | 'all_filtered';

type ExportUsersModalProps = {
  open: boolean;
  onClose: () => void;
  currentPageUsers: AdminUserRow[];
  search: string;
  role: UserRoleFilter;
  totalFiltered: number;
};

const ROLE_LABELS: Record<UserRoleFilter | 'all', string> = {
  '': 'All roles',
  all: 'All roles',
  reader: 'Reader',
  author: 'Author',
  publisher: 'Publisher',
  admin: 'Admin',
};

export function ExportUsersModal({
  open,
  onClose,
  currentPageUsers,
  search,
  role,
  totalFiltered,
}: ExportUsersModalProps) {
  const [scope, setScope] = useState<ExportScope>('all_filtered');
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const handleDownload = async () => {
    setExporting(true);
    setError(null);
    try {
      let rows = currentPageUsers;
      if (scope === 'all_filtered') {
        const data = await fetchUsersForExport({ search, role: role || null });
        rows = data.items;
      }
      if (!rows.length) {
        setError('No users match the selected filters.');
        return;
      }
      const roleSlug = role || 'all-roles';
      downloadUsersCsv(rows, `users-${roleSlug}`);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label="Close export dialog"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-700 dark:bg-zinc-900">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Export Options</h2>
            <p className="mt-1 text-sm text-zinc-500">Choose what to include in your CSV download.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-5 rounded-xl bg-zinc-50 p-4 dark:bg-zinc-800/50">
          <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">Active filters</p>
          <ul className="mt-2 space-y-1 text-sm text-zinc-700 dark:text-zinc-300">
            <li>
              <span className="font-medium">Role:</span> {ROLE_LABELS[role || 'all']}
            </li>
            <li>
              <span className="font-medium">Search:</span>{' '}
              {search.trim() ? `"${search.trim()}"` : 'None'}
            </li>
            <li>
              <span className="font-medium">Matching users:</span> {totalFiltered.toLocaleString()}
            </li>
          </ul>
        </div>

        <fieldset className="mt-5 space-y-3">
          <legend className="text-xs font-bold uppercase tracking-wider text-zinc-500">
            Export choice
          </legend>
          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-zinc-200 p-3 has-[:checked]:border-indigo-500 has-[:checked]:bg-indigo-50/50 dark:border-zinc-700 dark:has-[:checked]:bg-indigo-950/30">
            <input
              type="radio"
              name="export-scope"
              value="all_filtered"
              checked={scope === 'all_filtered'}
              onChange={() => setScope('all_filtered')}
              className="mt-1"
            />
            <span>
              <span className="block text-sm font-semibold text-zinc-900 dark:text-white">
                All filtered results
              </span>
              <span className="text-xs text-zinc-500">
                Export every user matching the role and search filters ({totalFiltered.toLocaleString()}{' '}
                users)
              </span>
            </span>
          </label>
          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-zinc-200 p-3 has-[:checked]:border-indigo-500 has-[:checked]:bg-indigo-50/50 dark:border-zinc-700 dark:has-[:checked]:bg-indigo-950/30">
            <input
              type="radio"
              name="export-scope"
              value="current_page"
              checked={scope === 'current_page'}
              onChange={() => setScope('current_page')}
              className="mt-1"
            />
            <span>
              <span className="block text-sm font-semibold text-zinc-900 dark:text-white">
                Current page only
              </span>
              <span className="text-xs text-zinc-500">
                Export the {currentPageUsers.length} users visible on this page
              </span>
            </span>
          </label>
        </fieldset>

        {error && (
          <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-zinc-200 px-4 py-2.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDownload}
            disabled={exporting}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#4f46e5] px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            <Download size={16} />
            {exporting ? 'Preparing…' : 'Download CSV'}
          </button>
        </div>
      </div>
    </div>
  );
}
