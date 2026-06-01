'use client';

import Link from 'next/link';
import { Loader2, Mail, Shield, User } from 'lucide-react';
import { AdminAvatarUpload } from '@/components/admin-avatar-upload';
import { AdminProfileEditor } from '@/components/admin-profile-editor';
import { AdminTopHeader } from '@/components/admin-top-header';
import { useAdminSession } from '@/hooks/useAdminSession';

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 border-b border-border py-4 text-sm dark:border-border">
      <span className="shrink-0 text-muted">{label}</span>
      <span className="min-w-0 text-right font-medium text-foreground">{value}</span>
    </div>
  );
}

export function AdminProfilePage() {
  const { session, loading, displayName, bio, email, role, accountStatus } = useAdminSession();

  return (
    <div className="min-h-screen bg-background">
      <AdminTopHeader adminSubtitle="My profile" />

      <div className="px-8 py-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">My Profile</h1>
          <p className="mt-1 text-sm text-muted">
            Update your photo, name, and bio here.
          </p>
        </div>

        {loading && (
          <div className="mt-12 flex justify-center text-muted">
            <Loader2 className="animate-spin" size={28} />
          </div>
        )}

        {!loading && (
          <div className="mt-8 grid gap-6 lg:grid-cols-[360px_1fr]">
            <div className="rounded-2xl border border-border bg-card p-6 text-center shadow-sm dark:border-border dark:bg-primary">
              <AdminAvatarUpload size="lg" editable />
              <p className="mt-4 text-xl font-bold text-foreground">{displayName}</p>
              <p className="mt-1 text-sm text-muted">{email}</p>
              <span className="mt-3 inline-flex rounded-full bg-indigo-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-primary dark:bg-surface dark:text-accent">
                {role}
              </span>
              <AdminProfileEditor />
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm dark:border-border dark:bg-primary">
              <div className="mb-4 flex items-center gap-2">
                <User size={18} className="text-accent" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-muted">
                  Account information
                </h2>
              </div>

              <DetailRow label="Display name" value={displayName} />
              <DetailRow
                label="Bio"
                value={
                  bio ? (
                    <span className="block max-w-md whitespace-pre-wrap">{bio}</span>
                  ) : (
                    <span className="text-muted">—</span>
                  )
                }
              />
              <DetailRow
                label="Email"
                value={
                  <span className="inline-flex items-center gap-1.5">
                    <Mail size={14} className="text-muted" />
                    {email || '—'}
                  </span>
                }
              />
              <DetailRow label="Role" value={<span className="capitalize">{role}</span>} />
              <DetailRow
                label="Account status"
                value={
                  <span
                    className={
                      accountStatus === 'active' ? 'text-emerald-600' : 'text-amber-600'
                    }
                  >
                    {accountStatus}
                  </span>
                }
              />
              <DetailRow
                label="User ID"
                value={<span className="font-mono text-xs">{session?.user?.id ?? '—'}</span>}
              />
              {session?.issuedAt && (
                <DetailRow
                  label="Session started"
                  value={new Date(session.issuedAt).toLocaleString()}
                />
              )}
              {session?.expiresAt && (
                <DetailRow
                  label="Session expires"
                  value={new Date(session.expiresAt).toLocaleString()}
                />
              )}

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/dashboard/settings"
                  className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-muted hover:bg-surface"
                >
                  <Shield size={16} />
                  Platform settings
                </Link>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-muted hover:bg-surface dark:border-border dark:text-zinc-200"
                >
                  Back to dashboard
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
