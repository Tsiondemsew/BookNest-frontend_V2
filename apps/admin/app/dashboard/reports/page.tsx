import { Suspense } from 'react';
import { ReportsCenter } from '@/features/reports';

export default function ReportsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-muted">Loading reports…</div>}>
      <ReportsCenter />
    </Suspense>
  );
}
