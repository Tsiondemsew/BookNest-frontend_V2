import Link from 'next/link';
import { Container } from '@repo/ui';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export default function ProfilePage() {
  return (
    <Container className="py-10">
      <div className="rounded-2xl border border-zinc-200 bg-white p-6">
        <h1 className="text-2xl font-semibold text-zinc-900">Profile</h1>
        <p className="mt-2 text-sm text-zinc-600">
          This page is now a real route. Next we’ll connect it to your existing backend profile APIs.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/library"
            className="inline-flex items-center justify-center rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
          >
            Go to Library
          </Link>
          <Link
            href="/studio"
            className="inline-flex items-center justify-center rounded-xl bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-200"
          >
            Go to Studio
          </Link>
        </div>
      </div>
    </Container>
  );
}

