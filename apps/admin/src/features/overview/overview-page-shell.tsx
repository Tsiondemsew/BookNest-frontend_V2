'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { AdminTopHeader } from '@/components/admin-top-header';

type Props = {
  title: string;
  description: string;
  children: React.ReactNode;
  secondaryAction?: { label: string; href: string };
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
};

export function OverviewPageShell({
  title,
  description,
  children,
  secondaryAction,
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search by name or email…',
}: Props) {
  return (
    <div className="min-h-screen bg-background">
      <AdminTopHeader
        adminSubtitle="System overview"
        searchValue={searchValue}
        onSearchChange={onSearchChange}
        searchPlaceholder={searchPlaceholder}
      />
      <div className="px-6 py-8 sm:px-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
        >
          <ArrowLeft size={16} />
          Back to dashboard
        </Link>
        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">{title}</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted">{description}</p>
          </div>
          {secondaryAction && (
            <Link
              href={secondaryAction.href}
              className="inline-flex shrink-0 items-center justify-center rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground shadow-sm hover:bg-surface"
            >
              {secondaryAction.label}
            </Link>
          )}
        </div>
        <div className="mt-8">{children}</div>
      </div>
    </div>
  );
}
