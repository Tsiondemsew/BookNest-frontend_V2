'use client';

import { useState } from 'react';
import { useRevenueSettings } from '@/hooks/useAdminRevenue';

export function CommissionSettingsForm() {
  const { commissionPercent, loading, saving, error, save } = useRevenueSettings();
  const [value, setValue] = useState('');

  const display = value || (commissionPercent != null ? String(commissionPercent) : '');

  const onSave = async () => {
    const n = parseFloat(display);
    if (!Number.isFinite(n) || n < 0 || n > 100) return;
    const ok = await save(n);
    if (ok) setValue('');
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <h2 className="text-sm font-semibold text-foreground">Global commission rate</h2>
      <p className="mt-1 text-xs text-muted">
        Applied to new book purchases. Example: 20% on 100 ETB → platform 20 ETB, author 80 ETB.
      </p>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      <div className="mt-4 flex items-end gap-3">
        <div className="flex-1">
          <label htmlFor="commission-percent" className="text-xs font-semibold uppercase text-muted">
            Commission %
          </label>
          <input
            id="commission-percent"
            type="number"
            min={0}
            max={100}
            step={0.5}
            disabled={loading}
            value={display}
            onChange={(e) => setValue(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border bg-background px-4 py-2.5 text-lg font-bold text-foreground"
          />
        </div>
        <span className="pb-2 text-2xl font-bold text-muted">%</span>
      </div>

      <button
        type="button"
        onClick={onSave}
        disabled={loading || saving}
        className="mt-6 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:opacity-50"
      >
        {saving ? 'Saving…' : 'Save commission rate'}
      </button>
    </div>
  );
}
