'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';

export function AuthHomePanel() {
  const router = useRouter();
  const { user, isLoading, logout, isAuthenticated } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  if (isLoading) {
    return (
      <section className="rounded-3xl border border-stone-200 bg-stone-50 p-5">
        <p className="text-sm text-stone-600">Checking your session with the backend...</p>
      </section>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <section className="rounded-3xl border border-stone-200 bg-stone-50 p-5">
        <h2 className="text-lg font-semibold">Public Reader Access</h2>
        <p className="mt-2 text-sm leading-6 text-stone-600">
          The main app is currently shaped for reader sign-in. Author and publisher accounts are
          expected to be provisioned through admin-controlled workflows.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/login"
            className="rounded-full bg-stone-900 px-4 py-2 text-sm font-medium text-white"
          >
            Go to Login
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-3xl border border-stone-200 bg-stone-50 p-5">
      <h2 className="text-lg font-semibold">Active Session</h2>
      <p className="mt-2 text-sm leading-6 text-stone-600">
        Signed in as <span className="font-medium text-stone-900">{user.publicName}</span>{' '}
        with role <span className="font-medium text-stone-900">{user.role}</span>.
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <Link
          href="/library"
          className="rounded-full bg-stone-900 px-4 py-2 text-sm font-medium text-white"
        >
          Open Library
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          disabled={isLoading}
          className="rounded-full border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 disabled:opacity-60"
        >
          {isLoading ? 'Signing out...' : 'Logout'}
        </button>
      </div>
    </section>
  );
}