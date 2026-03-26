'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useAuthStore } from '@/stores/authStore';
import Link from 'next/link';

const BOOK_DETAILS: Record<string, any> = {
  '1': {
    id: '1',
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    cover: '📕',
    rating: 4.5,
    reviews: 1823,
    description: `Set in the Jazz Age, The Great Gatsby follows the mysterious millionaire Jay Gatsby 
    and his obsessive pursuit of the beautiful Daisy Buchanan. Through the eyes of narrator Nick Carraway, 
    we witness a tale of wealth, love, and the corruption of the American Dream.`,
    genre: 'Fiction',
    pages: 180,
    published: '1925',
    inLibrary: true,
    progress: 75,
    comments: 12,
  },
};

export default function BookDetailPage() {
  const t = useTranslations();
  const params = useParams<{ locale: string; id: string }>();
  const locale = params?.locale ?? 'en';
  const bookId = params?.id ?? '1';
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const book = BOOK_DETAILS[bookId] || BOOK_DETAILS['1'];
  const [inLibrary, setInLibrary] = useState(book.inLibrary);
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState([
    {
      id: '1',
      author: 'Alice',
      text: 'An absolute masterpiece of American literature!',
      date: '2 days ago',
    },
    {
      id: '2',
      author: 'Bob',
      text: 'The prose is beautiful and the story is timeless.',
      date: '1 week ago',
    },
  ]);

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    setComments([
      {
        id: String(comments.length + 1),
        author: user?.displayName || 'Anonymous',
        text: newComment,
        date: 'now',
      },
      ...comments,
    ]);
    setNewComment('');
  };

  const handleToggleLibrary = () => {
    setInLibrary(!inLibrary);
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
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href={`/${locale}/discover`}
            className="text-blue-600 hover:underline font-medium mb-4 inline-block"
          >
            {t('common.back')}
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Book Cover & Actions */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-4">
              <div className="text-9xl mb-4 text-center">{book.cover}</div>
              <div className="space-y-3">
                <button
                  onClick={handleToggleLibrary}
                  className={`w-full py-3 rounded-lg font-semibold transition ${
                    inLibrary
                      ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {inLibrary ? t('library.title') : '+ ' + t('nav.library')}
                </button>
                <button className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700">
                  {t('reader.title')}
                </button>
              </div>

              {/* Metadata */}
              <div className="mt-6 space-y-2 text-sm">
                <p className="text-gray-600">
                  <span className="font-semibold">{t('discover.categories')}:</span> {book.genre}
                </p>
                <p className="text-gray-600">
                  <span className="font-semibold">Pages:</span> {book.pages}
                </p>
                <p className="text-gray-600">
                  <span className="font-semibold">Published:</span> {book.published}
                </p>
              </div>
            </div>
          </div>

          {/* Book Information */}
          <div className="md:col-span-3">
            <div className="bg-white rounded-lg shadow-md p-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{book.title}</h1>
              <p className="text-xl text-gray-600 mb-6">by {book.author}</p>

              {/* Rating */}
              <div className="flex items-center gap-4 mb-6">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={i < Math.floor(book.rating) ? '⭐' : '☆'}>
                      {i < Math.floor(book.rating) ? '⭐' : '☆'}
                    </span>
                  ))}
                </div>
                <span className="text-gray-600">
                  {book.rating} ({book.reviews} reviews)
                </span>
              </div>

              {/* Progress */}
              {inLibrary && (
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold">{t('library.progress')}</span>
                    <span>{book.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-blue-600 h-3 rounded-full transition"
                      style={{ width: `${book.progress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Description */}
              <div className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Description</h2>
                <p className="text-gray-700 leading-relaxed">{book.description}</p>
              </div>
            </div>

            {/* Comments Section */}
            <div className="bg-white rounded-lg shadow-md p-8 mt-8">
              <h3 className="text-2xl font-semibold text-gray-900 mb-6">{t('social.comment')}</h3>

              {/* Add Comment */}
              <div className="mb-8 pb-8 border-b">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder={t('social.replies')}
                  className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={3}
                />
                <button
                  onClick={handleAddComment}
                  disabled={!newComment.trim()}
                  className="mt-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-medium"
                >
                  Post
                </button>
              </div>

              {/* Comments List */}
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="border-b pb-4 last:border-b-0">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-semibold text-gray-900">{comment.author}</span>
                      <span className="text-xs text-gray-500">{comment.date}</span>
                    </div>
                    <p className="text-gray-700">{comment.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
