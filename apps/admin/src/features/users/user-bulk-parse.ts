import * as XLSX from 'xlsx';

export type BulkUserRow = {
  email: string;
  action: string;
  role: string;
  name: string;
  password: string;
  account_status: string;
  reason: string;
};

const HEADER_MAP: Record<string, keyof BulkUserRow> = {
  email: 'email',
  'e-mail': 'email',
  action: 'action',
  role: 'role',
  name: 'name',
  'display name': 'name',
  display_name: 'name',
  pen_name: 'name',
  'pen name': 'name',
  password: 'password',
  account_status: 'account_status',
  status: 'account_status',
  'system status': 'account_status',
  reason: 'reason',
  'ban reason': 'reason',
};

function normalizeHeader(cell: unknown): string {
  return String(cell ?? '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

function cellValue(row: Record<string, unknown>, key: keyof BulkUserRow): string {
  const v = row[key];
  if (v === undefined || v === null) return '';
  return String(v).trim();
}

export function parseBulkUserSheet(buffer: ArrayBuffer): BulkUserRow[] {
  const workbook = XLSX.read(buffer, { type: 'array' });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) return [];

  const sheet = workbook.Sheets[sheetName];
  const matrix = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, defval: '' });
  if (matrix.length < 2) return [];

  const headerRow = (matrix[0] as unknown[]).map(normalizeHeader);
  const colKeys: (keyof BulkUserRow | null)[] = headerRow.map((h) => HEADER_MAP[h] ?? null);

  const rows: BulkUserRow[] = [];

  for (let r = 1; r < matrix.length; r += 1) {
    const line = matrix[r] as unknown[];
    if (!line?.length) continue;

    const raw: Partial<Record<keyof BulkUserRow, string>> = {};
    colKeys.forEach((key, col) => {
      if (!key) return;
      raw[key] = String(line[col] ?? '').trim();
    });

    const email = cellValue(raw as Record<string, unknown>, 'email');
    if (!email) continue;

    rows.push({
      email,
      action: cellValue(raw as Record<string, unknown>, 'action') || 'create',
      role: cellValue(raw as Record<string, unknown>, 'role') || 'reader',
      name: cellValue(raw as Record<string, unknown>, 'name'),
      password: cellValue(raw as Record<string, unknown>, 'password'),
      account_status: cellValue(raw as Record<string, unknown>, 'account_status') || 'active',
      reason: cellValue(raw as Record<string, unknown>, 'reason'),
    });
  }

  return rows;
}

export function downloadBulkUserTemplate() {
  const headers = [
    'email',
    'action',
    'role',
    'name',
    'password',
    'account_status',
    'reason',
  ];
  const examples = [
    [
      'new.author@example.com',
      'create',
      'author',
      'Jane Author',
      'TempPass123',
      'active',
      '',
    ],
    [
      'existing.reader@example.com',
      'update',
      'reader',
      '',
      '',
      'suspended',
      'Policy violation',
    ],
  ];

  const sheet = XLSX.utils.aoa_to_sheet([headers, ...examples]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, 'Users');

  const instructions = XLSX.utils.aoa_to_sheet([
    ['Bulk upload instructions'],
    ['action: create | update'],
    ['role: reader | author | publisher (create only)'],
    ['password: required for create (min 6 chars)'],
    ['name: required for create (display/pen/company name)'],
    ['account_status: active | suspended | disabled (update, or optional on create)'],
    ['reason: required when suspending authors (min 5 chars)'],
    ['Max 100 rows per file. Admin accounts cannot be created or updated.'],
  ]);
  XLSX.utils.book_append_sheet(workbook, instructions, 'Help');

  XLSX.writeFile(workbook, `booknest-bulk-users-template.xlsx`);
}

export type BulkImportResult = {
  total: number;
  succeeded: number;
  failed: number;
  results: Array<{
    row: number;
    email: string;
    action: string;
    success: boolean;
    message: string;
    userId?: string;
  }>;
};

export async function submitBulkUserRows(rows: BulkUserRow[]): Promise<BulkImportResult> {
  const res = await fetch('/api/admin/users/bulk', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rows }),
  });

  const payload = await res.json();
  if (!res.ok || !payload.success) {
    throw new Error(payload.error?.message || payload.message || 'Bulk import failed');
  }
  return payload.data as BulkImportResult;
}
