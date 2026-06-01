'use client';

import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { AdminTopHeader } from '@/components/admin-top-header';
import { CommissionSettingsForm } from '@/features/settings/commission-settings-form';

export function RevenueSettingsPage() {
  return (
    <div className="min-h-screen bg-background">
      <AdminTopHeader adminSubtitle="Revenue Manager" />

      <div className="mx-auto max-w-lg space-y-6 px-8 py-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Revenue settings</h1>
          <p className="mt-1 text-sm text-muted">Global platform commission</p>
          <Link
            href="/dashboard/reports?category=revenue"
            className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary"
          >
            <ChevronLeft size={16} />
            Back to Reports
          </Link>
          <p className="mt-2 text-xs text-muted">
            Or manage all admin settings on{' '}
            <Link href="/dashboard/settings" className="font-semibold text-primary hover:underline">
              Settings
            </Link>
            .
          </p>
        </div>

        <CommissionSettingsForm />
      </div>
    </div>
  );
}
