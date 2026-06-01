'use client';

import Link from 'next/link';
import { AdminAvatarUpload } from './admin-avatar-upload';
import { useAdminSession } from '@/hooks/useAdminSession';

export const ADMIN_PROFILE_PATH = '/dashboard/profile';

type AdminProfileChipProps = {
  subtitle?: string;
  className?: string;
  showText?: boolean;
};

export function AdminProfileChip({
  subtitle = 'Admin',
  className = '',
  showText = true,
}: AdminProfileChipProps) {
  const { displayName, loading } = useAdminSession();

  return (
    <Link
      href={ADMIN_PROFILE_PATH}
      className={`flex items-center gap-3 rounded-lg px-2 py-1 transition hover:bg-surface ${className}`}
      aria-label="View and edit your profile"
    >
      {showText && (
        <div className="hidden text-right sm:block">
          <p className="text-sm font-semibold text-foreground">
            {loading ? 'Loading…' : displayName}
          </p>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">
            {subtitle}
          </p>
        </div>
      )}
      <AdminAvatarUpload size="sm" editable={false} />
    </Link>
  );
}
