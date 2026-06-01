import type { ErrorLogItem } from './error-log-types';

export function errorLogsToCsv(rows: ErrorLogItem[]): string {
  const header =
    'ID,Level,Message,Code,Status,Method,Path,User ID,Resolved,Resolved At,Created At\n';
  const body = rows
    .map((r) =>
      [
        r.id,
        r.level,
        `"${(r.message || '').replace(/"/g, '""')}"`,
        r.code ?? '',
        r.statusCode ?? '',
        r.method ?? '',
        `"${(r.path || '').replace(/"/g, '""')}"`,
        r.userId ?? '',
        r.resolved ? 'yes' : 'no',
        r.resolvedAt ?? '',
        r.createdAtFormatted,
      ].join(','),
    )
    .join('\n');
  return header + body;
}

export function downloadCsv(filename: string, csv: string) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
