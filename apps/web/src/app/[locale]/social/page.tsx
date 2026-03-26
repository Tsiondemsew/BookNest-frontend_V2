'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useAuthStore } from '@/stores/authStore';
import Link from 'next/link';

const MOCK_POSTS = [
  {
    id: '1',
    author: 'Alice Reader',
    avatar: '👩',
    content: 'Just finished The Great Gatsby! What an amazing novel.',
    likes: 24,
    comments: 5,
    timestamp: '2 hours ago',
  },
  {
    id: '2',
    author: 'Bob Bookworm',
    avatar: '👨',
    content: 'Started reading Dune today. Excited to explore this sci-fi masterpiece!',
    likes: 15,
    comments: 3,
    timestamp: '4 hours ago',
  },
  {
    id: '3',
    author: 'Carol Pages',
    avatar: '👩',
    content: 'Reading recommendations? I love mystery novels!',
    likes: 32,
    comments: 12,
    timestamp: '6 hours ago',
  },
];

export default function SocialPage() {
  const t = useTranslations();
  const params = useParams<{ locale: string }>();
  const locale = params?.locale ?? 'en';
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const [posts, setPosts] = useState(MOCK_POSTS);
  const [newPost, setNewPost] = useState('');

  const handlePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.trim()) return;

    const post = {
      id: String(posts.length + 1),
      author: user?.displayName || 'Anonymous',
      avatar: '📝',
      content: newPost,
      likes: 0,
      comments: 0,
      timestamp: 'now',
    };

    setPosts([post, ...posts]);
    setNewPost('');
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
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">BookNest</h1>
            <nav className="flex gap-4">
              <Link href={`/${locale}/discover`} className="text-gray-600 hover:text-gray-900">
                {t('nav.discover')}
              </Link>
              <Link href={`/${locale}/library`} className="text-gray-600 hover:text-gray-900">
                {t('nav.library')}
              </Link>
              <Link href={`/${locale}/social`} className="font-bold text-blue-600">
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
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('social.title')}</h2>
        <p className="text-gray-600 mb-6">{t('social.subtitle')}</p>

        {/* Compose Post */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <form onSubmit={handlePostSubmit}>
            <textarea
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              placeholder={t('social.share')}
              className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={4}
            />
            <div className="mt-4 flex justify-end">
              <button
                type="submit"
                disabled={!newPost.trim()}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-medium"
              >
                {t('social.post')}
              </button>
            </div>
          </form>
        </div>

        {/* Feed */}
        <div className="space-y-4">
          {posts.map((post) => (
            <div key={post.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
              {/* Post Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="text-3xl">{post.avatar}</div>
                <div>
                  <p className="font-semibold text-gray-900">{post.author}</p>
                  <p className="text-xs text-gray-600">{post.timestamp}</p>
                </div>
              </div>

              {/* Post Content */}
              <p className="text-gray-800 mb-4">{post.content}</p>

              {/* Post Actions */}
              <div className="flex gap-6 text-sm text-gray-600 border-t pt-4">
                <button className="hover:text-blue-600 font-medium flex items-center gap-1">
                  ❤️ {post.likes} {t('social.like')}
                </button>
                <button className="hover:text-blue-600 font-medium flex items-center gap-1">
                  💬 {post.comments} {t('social.comment')}
                </button>
                <button className="hover:text-blue-600 font-medium flex items-center gap-1">
                  📤 {t('social.share')}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
