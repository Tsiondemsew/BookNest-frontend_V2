import Link from 'next/link';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="mx-auto w-full max-w-md px-4 py-16">
        <h1 className="text-2xl font-semibold">Reset password</h1>
        <p className="mt-2 text-sm text-zinc-300">
          Password reset isn’t enabled yet in this build. We’ll wire this into Supabase auth next.
        </p>

        <div className="mt-8">
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-xl bg-white/10 px-4 py-2 text-sm font-medium hover:bg-white/15"
          >
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}

