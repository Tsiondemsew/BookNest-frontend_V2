'use client';

import { BookOpen, CheckCircle2, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getApiErrorMessage } from '@/lib/api-error';
import type { InvitationAcceptInfo } from '@/features/invitations/types';

export default function AcceptInvitationPage() {
  const params = useParams();
  const token = params.token as string;

  const [info, setInfo] = useState<InvitationAcceptInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/invitations/accept/${token}/validate`, { cache: 'no-store' });
        const payload = await res.json();
        if (!res.ok || !payload.success) {
          throw new Error(getApiErrorMessage(payload, 'Invalid or expired invitation'));
        }
        const data = payload.data as InvitationAcceptInfo;
        setInfo(data);
        setDisplayName(data.recipientName);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Invitation unavailable');
      } finally {
        setLoading(false);
      }
    }
    if (token) load();
  }, [token]);

  const validate = () => {
    const errors: Record<string, string> = {};
    if (displayName.trim().length < 2) errors.displayName = 'Name is required';
    if (password.length < 6) errors.password = 'Password must be at least 6 characters';
    if (password !== confirmPassword) errors.confirmPassword = 'Passwords do not match';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/invitations/accept/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password,
          displayName: displayName.trim(),
        }),
      });
      const payload = await res.json();
      if (!res.ok || !payload.success) {
        throw new Error(getApiErrorMessage(payload, 'Failed to accept invitation'));
      }
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create account');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-violet-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
      <div className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-6 py-12">
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg">
            <BookOpen size={28} />
          </div>
          <h1 className="mt-4 text-2xl font-bold text-foreground">BookNest</h1>
          <p className="mt-1 text-sm text-muted">Invitation acceptance</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-8 shadow-xl dark:border-border dark:bg-primary">
          {loading && (
            <div className="flex flex-col items-center py-8 text-muted">
              <Loader2 className="animate-spin" size={32} />
              <p className="mt-3 text-sm">Validating invitation…</p>
            </div>
          )}

          {!loading && error && !success && (
            <div className="text-center">
              <p className="text-sm font-medium text-red-600">{error}</p>
              {error.includes('already exists') ? (
                <Link
                  href={process.env.NEXT_PUBLIC_MAIN_APP_URL || 'http://localhost:3001/login'}
                  className="mt-4 inline-block text-sm font-semibold text-indigo-600"
                >
                  Go to sign in
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => setError(null)}
                  className="mt-4 inline-block text-sm font-semibold text-indigo-600"
                >
                  Try again
                </button>
              )}
            </div>
          )}

          {success && (
            <div className="text-center">
              <CheckCircle2 className="mx-auto text-emerald-500" size={48} />
              <h2 className="mt-4 text-xl font-bold text-foreground">Welcome to BookNest!</h2>
              <p className="mt-2 text-sm text-muted">
                Your {info?.roleLabel} account has been created. You can now sign in with your email and
                password.
              </p>
              <p className="mt-4 text-sm text-muted">{info?.recipientEmail}</p>
              <Link
                href={process.env.NEXT_PUBLIC_MAIN_APP_URL || 'http://localhost:3001/login'}
                className="mt-6 inline-block rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                Sign in to BookNest
              </Link>
            </div>
          )}

          {!loading && !error && !success && info && (
            <>
              <p className="text-sm text-muted dark:text-muted">
                Hello <strong>{info.recipientName}</strong>, you have been invited to join BookNest as a{' '}
                <strong>{info.roleLabel}</strong>. Create your password to complete registration.
              </p>
              <p className="mt-2 text-xs text-muted">
                Expires {new Date(info.expiresAt).toLocaleString()}
              </p>

              <form onSubmit={submit} className="mt-6 space-y-4">
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase text-muted">
                    Display name
                  </label>
                  <input
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full rounded-lg border border-border px-3 py-2.5 text-sm dark:border-border dark:bg-surface"
                  />
                  {fieldErrors.displayName && (
                    <p className="mt-1 text-xs text-red-600">{fieldErrors.displayName}</p>
                  )}
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase text-muted">
                    Email
                  </label>
                  <input
                    value={info.recipientEmail}
                    disabled
                    className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-muted"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase text-muted">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-lg border border-border px-3 py-2.5 text-sm dark:border-border dark:bg-surface"
                  />
                  {fieldErrors.password && (
                    <p className="mt-1 text-xs text-red-600">{fieldErrors.password}</p>
                  )}
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase text-muted">
                    Confirm password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full rounded-lg border border-border px-3 py-2.5 text-sm dark:border-border dark:bg-surface"
                  />
                  {fieldErrors.confirmPassword && (
                    <p className="mt-1 text-xs text-red-600">{fieldErrors.confirmPassword}</p>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
                >
                  {submitting ? <Loader2 size={18} className="animate-spin" /> : null}
                  Accept invitation & create account
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
