import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="mx-auto w-full max-w-5xl px-6 py-14">
        <h1 className="text-3xl font-semibold text-zinc-900">BookNest Admin</h1>
        <p className="mt-2 text-sm text-zinc-600">
          This admin app is now a real shell (next step: wire auth + moderation pages).
        </p>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-zinc-200 bg-white p-5">
            <h2 className="text-base font-semibold text-zinc-900">Moderation</h2>
            <p className="mt-1 text-sm text-zinc-600">Review and approve submitted books.</p>
            <p className="mt-4 text-xs text-zinc-500">Coming next.</p>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-white p-5">
            <h2 className="text-base font-semibold text-zinc-900">Users</h2>
            <p className="mt-1 text-sm text-zinc-600">List users and manage roles/bans.</p>
            <p className="mt-4 text-xs text-zinc-500">Coming next.</p>
          </div>
        </div>

        <div className="mt-10">
          <Link href="/" className="text-sm font-medium text-blue-600 hover:underline">
            Back to main site
          </Link>
        </div>
      </div>
    </div>
  );
}
