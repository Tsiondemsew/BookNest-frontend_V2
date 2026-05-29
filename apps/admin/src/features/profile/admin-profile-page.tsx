'use client';

import Link from 'next/link';
import { Loader2, Mail, Shield, User } from 'lucide-react';
import { AdminAvatarUpload } from '@/components/admin-avatar-upload';
import { AdminDisplayNameEditor } from '@/components/admin-display-name-editor';
import { AdminTopHeader } from '@/components/admin-top-header';
import { useAdminSession } from '@/hooks/useAdminSession';

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 border-b border-zinc-100 py-4 text-sm dark:border-zinc-800">
      <span className="text-zinc-500">{label}</span>
      <span className="text-right font-medium text-zinc-900 dark:text-white">{value}</span>
    </div>
  );
}

export function AdminProfilePage() {
  const { session, loading, email, role, accountStatus } = useAdminSession();

  return (
    <div className="min-h-screen bg-[#F5F7FA] dark:bg-zinc-950">
      <AdminTopHeader adminSubtitle="My profile" />

      <div className="px-8 py-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">My Profile</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Update your photo and display name here.
          </p>
        </div>

        {loading && (
          <div className="mt-12 flex justify-center text-zinc-500">
            <Loader2 className="animate-spin" size={28} />
          </div>
        )}

        {!loading && (
          <div className="mt-8 grid gap-6 lg:grid-cols-[320px_1fr]">
            <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <AdminAvatarUpload size="lg" editable />
              <AdminDisplayNameEditor variant="card" />
              <p className="mt-1 text-sm text-zinc-500">{email}</p>
              <span className="mt-4 inline-flex rounded-full bg-indigo-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300">
                {role}
              </span>
            </div>

            <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <div className="mb-4 flex items-center gap-2">
                <User size={18} className="text-indigo-600" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-500">
                  Account information
                </h2>
              </div>

              <DetailRow label="Display name" value={<AdminDisplayNameEditor variant="row" />} />
              <DetailRow
                label="Email"
                value={
                  <span className="inline-flex items-center gap-1.5">
                    <Mail size={14} className="text-zinc-400" />
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
                  className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
                >
                  <Shield size={16} />
                  Account settings
                </Link>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 px-4 py-2.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200"
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
