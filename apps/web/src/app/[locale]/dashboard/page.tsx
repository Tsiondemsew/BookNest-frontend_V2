'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLogoutMutation } from '@/hooks/auth';
import { useAuthStore } from '@/stores/authStore';
import { useParams } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();
  const params = useParams<{ locale: string }>();
  const locale = params?.locale ?? 'en';

  const user = useAuthStore((s) => s.user);
  const logout = useLogoutMutation();

  if (!user) {
    return (
      <div className="p-6">
        <p className="mb-4">Please login to access your dashboard.</p>
        <Link className="rounded bg-black px-4 py-2 text-white" href={`/${locale}/login`}>
          Go to Login
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="mb-2 text-2xl font-semibold">Dashboard</h1>
      <p className="mb-6 text-sm text-zinc-700">
        Signed in as <span className="font-medium">{user.displayName}</span> ({user.email})
      </p>

      <button
        className="rounded border px-4 py-2 disabled:opacity-50"
        disabled={logout.isPending}
        onClick={async () => {
          await logout.mutateAsync();
          router.replace(`/${locale}/`);
        }}
      >
        {logout.isPending ? 'Signing out...' : 'Logout'}
      </button>
    </div>
  );
}

