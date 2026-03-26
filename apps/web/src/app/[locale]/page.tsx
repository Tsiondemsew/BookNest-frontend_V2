'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useAuthStore } from '@/stores/authStore';

export default function Home() {
  const t = useTranslations('common');
  const user = useAuthStore((s) => s.user);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold">{t('welcome')}</h1>
      <div className="mt-4 flex items-center gap-3">
        {user ? (
          <>
            <Link className="rounded bg-black px-4 py-2 text-white" href="./dashboard">
              Dashboard
            </Link>
            <Link className="rounded border px-4 py-2" href="./login">
              Switch account
            </Link>
          </>
        ) : (
          <>
            <Link className="rounded bg-black px-4 py-2 text-white" href="./login">
              Login
            </Link>
            <button className="rounded border px-4 py-2">{t('buy')}</button>
          </>
        )}
      </div>
    </div>
  );
}
