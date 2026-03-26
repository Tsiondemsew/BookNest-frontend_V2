'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useAuthStore } from '@/stores/authStore';
import Link from 'next/link';

interface SecureBook {
  id: string;
  title: string;
  author: string;
  encrypted: boolean;
  accessLevel: 'free' | 'premium' | 'exclusive';
  protection: 'none' | 'standard' | 'military';
  pages: number;
  cover: string;
}

const SECURE_BOOKS: SecureBook[] = [
  {
    id: '1',
    title: 'The Great Gatsby (Premium)',
    author: 'F. Scott Fitzgerald',
    encrypted: true,
    accessLevel: 'premium',
    protection: 'standard',
    pages: 180,
    cover: '📕',
  },
  {
    id: '2',
    title: 'Exclusive Literary Collection',
    author: 'Various Authors',
    encrypted: true,
    accessLevel: 'exclusive',
    protection: 'military',
    pages: 450,
    cover: '📘',
  },
  {
    id: '3',
    title: 'The Catcher in the Rye',
    author: 'J.D. Salinger',
    encrypted: true,
    accessLevel: 'premium',
    protection: 'standard',
    pages: 225,
    cover: '📗',
  },
];

const SAMPLE_SECURE_CONTENT = `
SECURE ENCRYPTED CONTENT - Premium Edition

This book is protected with industry-standard AES-256 encryption.
Your reading session is secure and private.

Chapter 1: The Beginning
═══════════════════════════════════════════════════════════════════════

The morning sun cast golden rays across the library, illuminating dust particles
that danced in the light like tiny stars. Sarah found her favorite reading chair
by the window, the leather worn smooth by years of use.

She opened the book she had been waiting weeks to read. The pages felt crisp,
fresh from the printer, and carried that intoxicating smell of new paper and ink.
This was her sanctuary - a place where the outside world faded away, and she could
lose herself in stories and worlds beyond her imagination.

The first words pulled her in immediately...

═══════════════════════════════════════════════════════════════════════
`;

export default function SecureReaderPage() {
  const t = useTranslations();
  const params = useParams<{ locale: string }>();
  const locale = params?.locale ?? 'en';
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const [selectedBook, setSelectedBook] = useState<SecureBook | null>(SECURE_BOOKS[0]);
  const [fontSize, setFontSize] = useState(16);
  const [theme, setTheme] = useState<'light' | 'dark' | 'sepia'>('light');
  const [showEncryption, setShowEncryption] = useState(true);
  const [sessionTime, setSessionTime] = useState('12:34 remaining');

  const themeStyles = {
    light: {
      bg: 'bg-white',
      text: 'text-black',
      controls: 'bg-gray-100 border-gray-300',
    },
    dark: {
      bg: 'bg-gray-900',
      text: 'text-white',
      controls: 'bg-gray-800 border-gray-700',
    },
    sepia: {
      bg: 'bg-amber-50',
      text: 'text-amber-900',
      controls: 'bg-amber-100 border-amber-300',
    },
  };

  const currentTheme = themeStyles[theme];

  const getAccessBadge = (level: string) => {
    switch (level) {
      case 'free':
        return <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Free</span>;
      case 'premium':
        return <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">Premium</span>;
      case 'exclusive':
        return <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">Exclusive</span>;
      default:
        return null;
    }
  };

  const getProtectionLevel = (protection: string) => {
    switch (protection) {
      case 'none':
        return '🔓 No Encryption';
      case 'standard':
        return '🔒 AES-256 Encrypted';
      case 'military':
        return '🛡️ Military Grade Encryption';
      default:
        return '';
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>{t('common.loading')}</p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${currentTheme.bg} ${currentTheme.text} transition-colors`}>
      {/* Header */}
      <header className={`${currentTheme.controls} border-b sticky top-0 z-10 transition-colors`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Secure Reader</h1>
            <p className="text-sm opacity-70">Encrypted & Protected Reading</p>
          </div>
          <Link
            href={`/${locale}/reader`}
            className="text-blue-600 hover:underline font-medium"
          >
            {t('common.back')}
          </Link>
        </div>
      </header>

      {/* Main Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Book Selection */}
          <div className="lg:col-span-1">
            <div className={`${currentTheme.controls} border rounded-lg p-6 sticky top-24`}>
              <h2 className="text-lg font-semibold mb-4">Protected Books</h2>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {SECURE_BOOKS.map((book) => (
                  <button
                    key={book.id}
                    onClick={() => setSelectedBook(book)}
                    className={`w-full text-left p-3 rounded-lg transition ${
                      selectedBook?.id === book.id
                        ? 'bg-blue-600 text-white'
                        : 'hover:bg-opacity-50'
                    }`}
                  >
                    <div className="text-2xl mb-2">{book.cover}</div>
                    <p className="font-semibold text-sm">{book.title}</p>
                    <p className="text-xs opacity-70">{book.author}</p>
                    <div className="mt-2">{getAccessBadge(book.accessLevel)}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            {selectedBook && (
              <>
                {/* Book Info Bar */}
                <div className={`${currentTheme.controls} border rounded-lg p-6 mb-8 transition-colors`}>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h1 className="text-3xl font-bold mb-2">{selectedBook.title}</h1>
                      <p className="text-lg opacity-75">{selectedBook.author}</p>
                    </div>
                    <div className="text-4xl">{selectedBook.cover}</div>
                  </div>

                  {/* Security Info */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                    <div>
                      <p className="text-xs opacity-75">Protection</p>
                      <p className="font-semibold text-sm">{getProtectionLevel(selectedBook.protection)}</p>
                    </div>
                    <div>
                      <p className="text-xs opacity-75">Access Level</p>
                      {getAccessBadge(selectedBook.accessLevel)}
                    </div>
                    <div>
                      <p className="text-xs opacity-75">Pages</p>
                      <p className="font-semibold">{selectedBook.pages}</p>
                    </div>
                    <div>
                      <p className="text-xs opacity-75">Session</p>
                      <p className="font-semibold text-sm">{sessionTime}</p>
                    </div>
                  </div>
                </div>

                {/* Reader Area */}
                <div className={`${currentTheme.controls} border rounded-lg p-8 mb-8 transition-colors min-h-96`}>
                  <div style={{ fontSize: `${fontSize}px` }} className="leading-relaxed">
                    <p className="whitespace-pre-line">{SAMPLE_SECURE_CONTENT}</p>
                  </div>

                  {/* Encryption Status */}
                  {showEncryption && (
                    <div className="mt-8 pt-6 border-t border-opacity-30">
                      <div className="text-xs opacity-75 flex items-center gap-2">
                        <span className="animate-pulse">🔒</span>
                        <span>
                          This content is encrypted with AES-256. Your reading session is private and secure.
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Controls Bar */}
                <div className={`${currentTheme.controls} border rounded-lg p-6 space-y-4 transition-colors`}>
                  {/* Font Size Controls */}
                  <div className="flex items-center gap-4 pb-4 border-b">
                    <span className="font-semibold">Font Size:</span>
                    <button
                      onClick={() => setFontSize(Math.max(12, fontSize - 2))}
                      className="px-3 py-1 border rounded hover:bg-opacity-50"
                    >
                      A-
                    </button>
                    <span className="px-3">{fontSize}px</span>
                    <button
                      onClick={() => setFontSize(Math.min(24, fontSize + 2))}
                      className="px-3 py-1 border rounded hover:bg-opacity-50"
                    >
                      A+
                    </button>
                  </div>

                  {/* Theme Controls */}
                  <div className="flex items-center gap-4 pb-4 border-b">
                    <span className="font-semibold">Theme:</span>
                    <select
                      value={theme}
                      onChange={(e) => setTheme(e.target.value as 'light' | 'dark' | 'sepia')}
                      className={`px-3 py-1 border rounded ${currentTheme.controls}`}
                    >
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                      <option value="sepia">Sepia</option>
                    </select>
                  </div>

                  {/* Security Controls */}
                  <div className="flex items-center gap-4 pb-4 border-b">
                    <span className="font-semibold">Security:</span>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showEncryption}
                        onChange={(e) => setShowEncryption(e.target.checked)}
                      />
                      <span className="text-sm">Show Encryption Status</span>
                    </label>
                  </div>

                  {/* Features */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <button className="px-4 py-2 border rounded hover:bg-opacity-50 text-sm font-medium">
                      📍 Bookmark
                    </button>
                    <button className="px-4 py-2 border rounded hover:bg-opacity-50 text-sm font-medium">
                      ✏️ Annotate
                    </button>
                    <button className="px-4 py-2 border rounded hover:bg-opacity-50 text-sm font-medium">
                      🔐 Lock Session
                    </button>
                    <button className="px-4 py-2 border rounded hover:bg-opacity-50 text-sm font-medium">
                      📊 Stats
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
