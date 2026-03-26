'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useAuthStore } from '@/stores/authStore';
import { useLogoutMutation } from '@/hooks/auth';
import Link from 'next/link';

export default function ProfilePage() {
  const t = useTranslations();
  const params = useParams<{ locale: string }>();
  const locale = params?.locale ?? 'en';
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useLogoutMutation();

  const [activeTab, setActiveTab] = useState<'profile' | 'settings' | 'preferences'>('profile');

  const handleLogout = async () => {
    await logout.mutateAsync();
    router.push(`/${locale}/login`);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>{t('common.loading')}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">BookNest</h1>
            <nav className="flex gap-4">
              <Link href={`/${locale}/discover`} className="text-gray-600 hover:text-gray-900">
                {t('nav.discover')}
              </Link>
              <Link href={`/${locale}/library`} className="text-gray-600 hover:text-gray-900">
                {t('nav.library')}
              </Link>
              <Link href={`/${locale}/social`} className="text-gray-600 hover:text-gray-900">
                {t('nav.community')}
              </Link>
              <Link href={`/${locale}/profile`} className="font-bold text-blue-600">
                {t('nav.profile')}
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Card */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <div className="flex items-start gap-6 mb-6">
            <div className="text-8xl">{user.email?.charAt(0).toUpperCase()}</div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900">{user.displayName}</h1>
              <p className="text-gray-600">{user.email}</p>
              {user.bio && <p className="text-gray-700 mt-2">{user.bio}</p>}
              <div className="mt-4 flex gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">5</p>
                  <p className="text-xs text-gray-600">{t('profile.reading')}</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">12</p>
                  <p className="text-xs text-gray-600">{t('profile.finished')}</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">24</p>
                  <p className="text-xs text-gray-600">{t('profile.followers')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="border-b flex">
            {(['profile', 'settings', 'preferences'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-4 px-6 font-medium border-b-2 transition ${
                  activeTab === tab
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab === 'profile' && t('profile.profile')}
                {tab === 'settings' && t('nav.settings')}
                {tab === 'preferences' && t('profile.preferences')}
              </button>
            ))}
          </div>

          <div className="p-6">
            {activeTab === 'profile' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('profile.profile')}</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('auth.name')}
                    </label>
                    <input
                      type="text"
                      defaultValue={user.displayName}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('auth.email')}
                    </label>
                    <input
                      type="email"
                      defaultValue={user.email}
                      disabled
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('profile.bio')}
                    </label>
                    <textarea
                      defaultValue={user.bio || ''}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      rows={4}
                    />
                  </div>
                  <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-medium">
                    {t('common.save')}
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('nav.settings')}</h3>
                <div className="space-y-4">
                  <label className="flex items-center gap-3 p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input type="checkbox" defaultChecked className="w-4 h-4" />
                    <span className="text-gray-900">{t('profile.reading')} Notifications</span>
                  </label>
                  <label className="flex items-center gap-3 p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input type="checkbox" defaultChecked className="w-4 h-4" />
                    <span className="text-gray-900">{t('social.title')} Updates</span>
                  </label>
                </div>
              </div>
            )}

            {activeTab === 'preferences' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('profile.preferences')}</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('reader.theme')}
                    </label>
                    <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option>{t('reader.lightMode')}</option>
                      <option>{t('reader.darkMode')}</option>
                      <option>{t('reader.sepiaMode')}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Language
                    </label>
                    <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option>English</option>
                      <option>Amharic (አማርኛ)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Logout Button */}
        <div className="mt-6">
          <button
            onClick={handleLogout}
            disabled={logout.isPending}
            className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 disabled:bg-gray-400 font-medium"
          >
            {logout.isPending ? t('common.loading') : t('nav.logout')}
          </button>
        </div>
      </div>
    </div>
  );
}
