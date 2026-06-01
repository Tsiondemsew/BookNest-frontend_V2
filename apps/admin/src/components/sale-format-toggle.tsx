'use client';

import type { SaleFormatFilter } from '@/lib/sale-format';

const OPTIONS: { id: SaleFormatFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'pdf', label: 'PDF' },
  { id: 'audio', label: 'Audio' },
];

type Props = {
  value: SaleFormatFilter;
  onChange: (format: SaleFormatFilter) => void;
  disabled?: boolean;
  className?: string;
};

export function SaleFormatToggle({ value, onChange, disabled, className = '' }: Props) {
  return (
    <div
      className={`flex items-center gap-1 rounded-xl border border-border bg-surface p-1 ${className}`}
    >
      {OPTIONS.map((f) => (
        <button
          key={f.id}
          type="button"
          disabled={disabled}
          onClick={() => onChange(f.id)}
          className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition disabled:opacity-50 ${
            value === f.id
              ? f.id === 'audio'
                ? 'bg-violet-600 text-white'
                : f.id === 'pdf'
                  ? 'bg-sky-600 text-white'
                  : 'bg-primary text-white'
              : 'text-muted hover:bg-card'
          }`}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}
