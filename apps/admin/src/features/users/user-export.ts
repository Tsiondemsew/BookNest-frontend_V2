import type { AdminUserRow } from './types';
import { verificationLabel } from './verification-badge';

function escapeCsv(value: string) {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

export function usersToCsv(rows: AdminUserRow[]) {
  const header = [
    'ID',
    'Name',
    'Email',
    'Role',
    'Verification Status',
    'System Status',
    'Last Activity',
    'Created At',
  ].join(',');

  const body = rows
    .map((user) =>
      [
        user.id,
        escapeCsv(user.name),
        escapeCsv(user.email),
        user.role,
        verificationLabel(user.verificationStatus),
        user.systemStatus,
        escapeCsv(user.lastActivity),
        user.createdAt,
      ].join(','),
    )
    .join('\n');

  return `${header}\n${body}`;
}

export function downloadUsersCsv(rows: AdminUserRow[], filenamePrefix = 'users-export') {
  const csv = usersToCsv(rows);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filenamePrefix}-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function fetchUsersForExport(filters: { search?: string; role?: string | null }) {
  const params = new URLSearchParams();
  if (filters.search?.trim()) params.set('search', filters.search.trim());
  if (filters.role) params.set('role', filters.role);

  const res = await fetch(`/api/admin/users/export?${params}`, { credentials: 'include' });
  const payload = await res.json();
  if (!res.ok || !payload.success) {
    throw new Error(payload.error?.message || 'Failed to export users');
  }
  return payload.data as { items: AdminUserRow[]; total: number };
}
