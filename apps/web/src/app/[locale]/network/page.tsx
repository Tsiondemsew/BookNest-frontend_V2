'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useAuthStore } from '@/stores/authStore';
import Link from 'next/link';

interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  bio: string;
  booksRead: number;
  followers: number;
  following: boolean;
  commonBooks: number;
}

const MOCK_USERS: UserProfile[] = [
  {
    id: '1',
    name: 'Alice Reader',
    avatar: '👩',
    bio: 'Fiction lover and book reviewer',
    booksRead: 156,
    followers: 342,
    following: false,
    commonBooks: 12,
  },
  {
    id: '2',
    name: 'Bob Bookworm',
    avatar: '👨',
    bio: 'Sci-fi enthusiast and avid reader',
    booksRead: 203,
    followers: 521,
    following: true,
    commonBooks: 8,
  },
  {
    id: '3',
    name: 'Carol Pages',
    avatar: '👩‍🦰',
    bio: 'Mystery novels and thrillers',
    booksRead: 89,
    followers: 234,
    following: false,
    commonBooks: 5,
  },
  {
    id: '4',
    name: 'David Literature',
    avatar: '🧔',
    bio: 'Classic literature scholar',
    booksRead: 312,
    followers: 678,
    following: true,
    commonBooks: 34,
  },
  {
    id: '5',
    name: 'Emma Writer',
    avatar: '👩‍🎓',
    bio: 'Author and passionate about storytelling',
    booksRead: 178,
    followers: 456,
    following: false,
    commonBooks: 19,
  },
  {
    id: '6',
    name: 'Frank Scholar',
    avatar: '👴',
    bio: 'Academic and book collector',
    booksRead: 487,
    followers: 789,
    following: false,
    commonBooks: 42,
  },
];

export default function NetworkPage() {
  const t = useTranslations();
  const params = useParams<{ locale: string }>();
  const locale = params?.locale ?? 'en';
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const [users, setUsers] = useState<UserProfile[]>(MOCK_USERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBy, setFilterBy] = useState<'all' | 'following' | 'similar'>('all');

  const filteredUsers = users.filter((u) => {
    const matchesSearch = searchQuery === '' || u.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filterBy === 'following') {
      return matchesSearch && u.following;
    }
    if (filterBy === 'similar') {
      return matchesSearch && u.commonBooks > 5;
    }
    return matchesSearch;
  });

  const handleFollowToggle = (userId: string) => {
    setUsers(users.map((u) =>
      u.id === userId ? { ...u, following: !u.following } : u
    ));
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
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold text-gray-900">BookNest</h1>
            <nav className="flex gap-4">
              <Link href={`/${locale}/discover`} className="text-gray-600 hover:text-gray-900">
                {t('nav.discover')}
              </Link>
              <Link href={`/${locale}/social`} className="text-gray-600 hover:text-gray-900">
                {t('nav.community')}
              </Link>
              <Link href={`/${locale}/profile`} className="text-gray-600 hover:text-gray-900">
                {t('nav.profile')}
              </Link>
            </nav>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              placeholder="Search readers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex gap-2">
              {(['all', 'following', 'similar'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilterBy(f)}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    filterBy === f
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {f === 'all' && 'All Readers'}
                  {f === 'following' && 'Following'}
                  {f === 'similar' && 'Similar Taste'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Discover Readers</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((profile) => (
            <div
              key={profile.id}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
            >
              {/* Profile Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="text-5xl">{profile.avatar}</div>
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900">{profile.name}</h3>
                    <p className="text-sm text-gray-600">{profile.bio}</p>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mb-4 pb-4 border-b">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{profile.booksRead}</p>
                  <p className="text-xs text-gray-600">Books Read</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{profile.followers}</p>
                  <p className="text-xs text-gray-600">Followers</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{profile.commonBooks}</p>
                  <p className="text-xs text-gray-600">In Common</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleFollowToggle(profile.id)}
                  className={`flex-1 py-2 rounded-lg font-medium transition ${
                    profile.following
                      ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {profile.following ? '✓ Following' : '+ Follow'}
                </button>
                <button
                  onClick={() => router.push(`/${locale}/chat`)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition"
                >
                  Message
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg mb-4">No readers found</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setFilterBy('all');
              }}
              className="text-blue-600 hover:underline font-medium"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
