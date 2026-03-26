'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useAuthStore } from '@/stores/authStore';
import Link from 'next/link';

const SAMPLE_BOOK_CONTENT = `
Chapter 1: The Beginning

The sun had just risen over the horizon, casting long shadows across the quiet street. 
Sarah stood at the window, watching the world come alive. She had been waiting for this moment for so long, 
and now that it was finally here, she wasn't sure how to feel.

The apartment was small but cozy, filled with the smell of morning coffee and fresh flowers. 
Outside, the city was stirring to life. Cars began to fill the streets, and people emerged from their homes, 
ready to face another day.

She thought back to all the years that had led to this point. The struggles, the triumphs, the moments of doubt. 
Everything had prepared her for today. She took a deep breath and smiled, knowing that whatever came next, 
she was ready.

The day stretched out before her, full of possibility and promise. She picked up her phone and dialed the number 
she had been holding onto for weeks. This was it. This was the beginning of everything.

"Hello?" came the voice on the other end. Sarah's heart raced as she opened her mouth to speak, 
ready to change her life forever.
`;

export default function ReaderPage() {
  const t = useTranslations();
  const params = useParams<{ locale: string }>();
  const locale = params?.locale ?? 'en';
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const [fontSize, setFontSize] = useState(16);
  const [theme, setTheme] = useState<'light' | 'dark' | 'sepia'>('light');
  const [progress, setProgress] = useState(25);
  const [showControls, setShowControls] = useState(true);

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
      {showControls && (
        <header className={`${currentTheme.controls} border-b sticky top-0 z-10 transition-colors`}>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold">{t('reader.title')}</h1>
              <p className="text-sm opacity-70">The Great Gatsby</p>
            </div>
            <Link
              href={`/${locale}/library`}
              className="text-blue-600 hover:underline font-medium"
            >
              {t('common.back')}
            </Link>
          </div>
        </header>
      )}

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Reading Content */}
        <div
          className="prose prose-lg max-w-none mb-8 leading-relaxed"
          style={{ fontSize: `${fontSize}px` }}
        >
          <p className="whitespace-pre-line">{SAMPLE_BOOK_CONTENT}</p>
        </div>

        {/* Progress Bar */}
        <div className={`${currentTheme.controls} border rounded-lg p-4 sticky bottom-0`}>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm">{t('library.progress')}</span>
            <span className="font-semibold">{progress}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={progress}
            onChange={(e) => setProgress(parseInt(e.target.value))}
            className="w-full"
          />
        </div>
      </div>

      {/* Controls Panel */}
      {showControls && (
        <div
          className={`${currentTheme.controls} border-t fixed bottom-0 left-0 right-0 p-4 transition-colors`}
        >
          <div className="max-w-4xl mx-auto flex flex-wrap gap-4 items-center justify-center">
            {/* Font Size Controls */}
            <div className="flex items-center gap-2">
              <span className="text-sm">{t('reader.fontSize')}</span>
              <button
                onClick={() => setFontSize(Math.max(12, fontSize - 2))}
                className="px-3 py-1 border rounded hover:bg-opacity-50"
              >
                A-
              </button>
              <span className="px-2">{fontSize}px</span>
              <button
                onClick={() => setFontSize(Math.min(24, fontSize + 2))}
                className="px-3 py-1 border rounded hover:bg-opacity-50"
              >
                A+
              </button>
            </div>

            {/* Theme Controls */}
            <div className="flex items-center gap-2">
              <span className="text-sm">{t('reader.theme')}</span>
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value as 'light' | 'dark' | 'sepia')}
                className={`px-3 py-1 border rounded ${currentTheme.controls}`}
              >
                <option value="light">{t('reader.lightMode')}</option>
                <option value="dark">{t('reader.darkMode')}</option>
                <option value="sepia">{t('reader.sepiaMode')}</option>
              </select>
            </div>

            {/* Hide Controls */}
            <button
              onClick={() => setShowControls(false)}
              className="px-4 py-1 border rounded hover:bg-opacity-50 text-sm"
            >
              Hide
            </button>
          </div>
        </div>
      )}

      {/* Show Controls Button */}
      {!showControls && (
        <button
          onClick={() => setShowControls(true)}
          className="fixed bottom-4 right-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Show Controls
        </button>
      )}
    </div>
  );
}
