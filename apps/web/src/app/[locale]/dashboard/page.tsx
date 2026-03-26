'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLogoutMutation } from '@/hooks/auth';
import { useAuthStore } from '@/stores/authStore';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

export default function DashboardPage() {
  const router = useRouter();
  const params = useParams<{ locale: string }>();
  const locale = params?.locale ?? 'en';
  const t = useTranslations();

  const user = useAuthStore((s) => s.user);
  const logout = useLogoutMutation();

  if (!user) {
    return (
      <div className="p-6">
        <p className="mb-4">{t('common.loading')}</p>
        <Link className="rounded bg-black px-4 py-2 text-white" href={`/${locale}/login`}>
          {t('auth.login')}
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">BookNest</h1>
            <nav className="flex gap-4 items-center">
              <LanguageSwitcher />
              <Link href={`/${locale}/discover`} className="text-gray-600 hover:text-gray-900 font-medium">
                {t('nav.discover')}
              </Link>
              <Link href={`/${locale}/library`} className="text-gray-600 hover:text-gray-900 font-medium">
                {t('nav.library')}
              </Link>
              <Link href={`/${locale}/social`} className="text-gray-600 hover:text-gray-900 font-medium">
                {t('nav.community')}
              </Link>
              <Link href={`/${locale}/profile`} className="text-gray-600 hover:text-gray-900 font-medium">
                {t('nav.profile')}
              </Link>
              {user.role === 'admin' && (
                <Link href={`/${locale}/admin`} className="text-gray-600 hover:text-gray-900 font-medium">
                  {t('nav.admin')}
                </Link>
              )}
              <button
                disabled={logout.isPending}
                onClick={async () => {
                  await logout.mutateAsync();
                  router.replace(`/${locale}/`);
                }}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50"
              >
                {logout.isPending ? t('common.loading') : t('nav.logout')}
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {t('common.welcome')}, {user.displayName}!
          </h2>
          <p className="text-gray-600">{user.email}</p>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            href={`/${locale}/discover`}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition transform hover:scale-105"
          >
            <div className="text-5xl mb-4">📚</div>
            <h3 className="font-semibold text-lg text-gray-900">{t('nav.discover')}</h3>
            <p className="text-gray-600 mt-2">{t('discover.subtitle')}</p>
          </Link>

          <Link
            href={`/${locale}/library`}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition transform hover:scale-105"
          >
            <div className="text-5xl mb-4">📖</div>
            <h3 className="font-semibold text-lg text-gray-900">{t('nav.library')}</h3>
            <p className="text-gray-600 mt-2">{t('library.subtitle')}</p>
          </Link>

          <Link
            href={`/${locale}/social`}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition transform hover:scale-105"
          >
            <div className="text-5xl mb-4">👥</div>
            <h3 className="font-semibold text-lg text-gray-900">{t('nav.community')}</h3>
            <p className="text-gray-600 mt-2">{t('social.title')}</p>
          </Link>
        </div>
      </div>
    </div>
  );
}

