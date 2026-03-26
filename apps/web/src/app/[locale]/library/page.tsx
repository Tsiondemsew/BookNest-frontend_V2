'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useAuthStore } from '@/stores/authStore';
import Link from 'next/link';

const MOCK_LIBRARY_BOOKS = [
  {
    id: '1',
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    cover: '📕',
    progress: 75,
    status: 'reading',
  },
  {
    id: '2',
    title: 'To Kill a Mockingbird',
    author: 'Harper Lee',
    cover: '📗',
    progress: 100,
    status: 'finished',
  },
  {
    id: '3',
    title: 'The Catcher in the Rye',
    author: 'J.D. Salinger',
    cover: '📘',
    progress: 0,
    status: 'wishlist',
  },
];

export default function LibraryPage() {
  const t = useTranslations();
  const params = useParams<{ locale: string }>();
  const locale = params?.locale ?? 'en';
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const [filter, setFilter] = useState<'all' | 'reading' | 'finished' | 'wishlist'>('all');

  const filters = [
    { label: t('library.all'), value: 'all' as const },
    { label: t('library.reading'), value: 'reading' as const },
    { label: t('library.finished'), value: 'finished' as const },
    { label: t('library.wishlist'), value: 'wishlist' as const },
  ];

  const filteredBooks = filter === 'all' ? MOCK_LIBRARY_BOOKS : MOCK_LIBRARY_BOOKS.filter((b) => b.status === filter);

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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold text-gray-900">BookNest</h1>
            <nav className="flex gap-4">
              <Link href={`/${locale}/discover`} className="text-gray-600 hover:text-gray-900">
                {t('nav.discover')}
              </Link>
              <Link href={`/${locale}/library`} className="font-bold text-blue-600">
                {t('nav.library')}
              </Link>
              <Link href={`/${locale}/social`} className="text-gray-600 hover:text-gray-900">
                {t('nav.community')}
              </Link>
              <Link href={`/${locale}/profile`} className="text-gray-600 hover:text-gray-900">
                {t('nav.profile')}
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('library.title')}</h2>
        <p className="text-gray-600 mb-6">{t('library.subtitle')}</p>

        {/* Filter Tabs */}
        <div className="mb-8 flex gap-2 border-b">
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-4 py-3 font-medium border-b-2 transition ${
                filter === f.value
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Books List */}
        <div className="space-y-4">
          {filteredBooks.map((book) => (
            <div
              key={book.id}
              className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition cursor-pointer flex items-center gap-4"
              onClick={() => router.push(`/${locale}/book/${book.id}`)}
            >
              <div className="text-5xl flex-shrink-0">{book.cover}</div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-gray-900">{book.title}</h3>
                <p className="text-gray-600 text-sm">{book.author}</p>

                {book.progress > 0 && book.progress < 100 && (
                  <div className="mt-3">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-gray-600">{t('library.progress')}</span>
                      <span className="text-xs font-semibold text-gray-900">{book.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition"
                        style={{ width: `${book.progress}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {book.progress === 100 && (
                  <p className="text-xs text-green-600 font-medium mt-2">✓ {t('library.finished')}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredBooks.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg">
            <p className="text-gray-600 mb-4">{t('library.empty')}</p>
            <Link
              href={`/${locale}/discover`}
              className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              {t('nav.discover')}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
