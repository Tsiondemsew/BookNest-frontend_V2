'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAuthStore } from '@/stores/authStore';
import Link from 'next/link';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

const MOCK_BOOKS = [
  {
    id: '1',
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    cover: '📕',
    category: 'Fiction',
  },
  {
    id: '2',
    title: 'To Kill a Mockingbird',
    author: 'Harper Lee',
    cover: '📗',
    category: 'Fiction',
  },
  {
    id: '3',
    title: 'The Catcher in the Rye',
    author: 'J.D. Salinger',
    cover: '📘',
    category: 'Fiction',
  },
  {
    id: '4',
    title: 'Sapiens',
    author: 'Yuval Noah Harari',
    cover: '📙',
    category: 'Non-Fiction',
  },
  {
    id: '5',
    title: 'Educated',
    author: 'Tara Westover',
    cover: '📕',
    category: 'Biography',
  },
  {
    id: '6',
    title: 'Dune',
    author: 'Frank Herbert',
    cover: '📗',
    category: 'Sci-Fi',
  },
];

export default function DiscoverPage() {
  const t = useTranslations();
  const params = useParams<{ locale: string }>();
  const locale = params?.locale ?? 'en';
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = ['Fiction', 'Non-Fiction', 'Mystery', 'Romance', 'Sci-Fi', 'Biography'];

  const filteredBooks = MOCK_BOOKS.filter((book) => {
    const matchesSearch = !searchQuery || book.title.toLowerCase().includes(searchQuery.toLowerCase()) || book.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || book.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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
            <nav className="flex gap-4 items-center">
              <LanguageSwitcher />
              <Link href={`/${locale}/discover`} className="font-bold text-blue-600">
                {t('nav.discover')}
              </Link>
              <Link href={`/${locale}/library`} className="text-gray-600 hover:text-gray-900">
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

          {/* Search Bar */}
          <div className="flex gap-4">
            <input
              type="text"
              placeholder={t('discover.search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('discover.title')}</h2>
        <p className="text-gray-600 mb-6">{t('discover.subtitle')}</p>

        {/* Categories */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('discover.categories')}</h3>
          <div className="flex gap-2 flex-wrap">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(selectedCategory === category ? null : category)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Books Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBooks.map((book) => (
            <div
              key={book.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition cursor-pointer transform hover:scale-105"
              onClick={() => router.push(`/${locale}/book/${book.id}`)}
            >
              <div className="h-48 bg-gradient-to-br from-blue-200 to-indigo-200 flex items-center justify-center text-6xl">
                {book.cover}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-lg text-gray-900 truncate">{book.title}</h3>
                <p className="text-gray-600 text-sm truncate">{book.author}</p>
                <div className="mt-3 flex justify-between items-center">
                  <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                    {book.category}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // Add to library
                    }}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    + {t('nav.library')}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredBooks.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">{t('discover.subtitle')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
