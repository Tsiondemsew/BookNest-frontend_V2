'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useBooks } from '@/hooks/useBooks';
import { useEncryptionWorker } from '@/hooks/useEncryptionWorker';
import type { Book } from '@repo/types';
import ReaderMenu from './ReaderMenu';

interface ReaderInterfaceProps {
  book: Book;
}

export default function ReaderInterface({ book }: ReaderInterfaceProps) {
  const router = useRouter();
  const { updateReadingProgress } = useBooks();
  const { decryptContent } = useEncryptionWorker();

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(book.pageCount || 300);
  const [progress, setProgress] = useState((currentPage / totalPages) * 100);
  const [showMenu, setShowMenu] = useState(false);
  const [fontSize, setFontSize] = useState(16);
  const [lineHeight, setLineHeight] = useState(1.6);
  const [fontFamily, setFontFamily] = useState('serif');
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [textColor, setTextColor] = useState('#000000');
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Mock chapter content
  const chapters = [
    'Chapter 1: The Beginning',
    'Chapter 2: The Journey',
    'Chapter 3: The Challenge',
    'Chapter 4: The Resolution',
  ];

  const currentChapter = Math.floor((currentPage / totalPages) * chapters.length);

  useEffect(() => {
    const newProgress = (currentPage / totalPages) * 100;
    setProgress(newProgress);

    // Auto-save progress every page turn
    if (currentPage % 5 === 0) {
      updateReadingProgress(book.id, newProgress);
    }
  }, [currentPage, totalPages, book.id, updateReadingProgress]);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const handleGoToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleToggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const textStyle = {
    fontSize: `${fontSize}px`,
    lineHeight,
    fontFamily: fontFamily === 'serif' ? 'Georgia, serif' : 'Arial, sans-serif',
    color: textColor,
  };

  return (
    <div
      className={`h-screen bg-background flex flex-col transition-all ${
        isFullscreen ? 'fixed inset-0 z-50' : 'relative'
      }`}
      style={{ backgroundColor }}
    >
      {/* Header */}
      <div
        className={`border-b border-border p-4 flex items-center justify-between transition-all ${
          showMenu ? 'bg-muted' : 'bg-background'
        }`}
      >
        <div className="flex items-center gap-4 flex-1">
          <button
            onClick={() => router.back()}
            className="text-primary hover:underline text-sm"
            aria-label="Back to library"
          >
            ← Back
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="font-semibold text-foreground truncate">{book.title}</h1>
            <p className="text-xs text-foreground/60">{chapters[currentChapter]}</p>
          </div>
        </div>
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="px-3 py-2 hover:bg-muted rounded transition-colors"
          aria-label="Reader menu"
        >
          ☰
        </button>
      </div>

      {/* Menu */}
      {showMenu && (
        <ReaderMenu
          fontSize={fontSize}
          setFontSize={setFontSize}
          lineHeight={lineHeight}
          setLineHeight={setLineHeight}
          fontFamily={fontFamily}
          setFontFamily={setFontFamily}
          backgroundColor={backgroundColor}
          setBackgroundColor={setBackgroundColor}
          textColor={textColor}
          setTextColor={setTextColor}
          isFullscreen={isFullscreen}
          onToggleFullscreen={handleToggleFullscreen}
        />
      )}

      {/* Reader Content */}
      <div className="flex-1 overflow-y-auto p-6 flex items-center justify-center">
        <div className="max-w-2xl w-full" style={textStyle}>
          <article className="prose prose-sm sm:prose-base lg:prose-lg dark:prose-invert max-w-none">
            <h2>{chapters[currentChapter]}</h2>

            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
              incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
              exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
            </p>

            <p>
              Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat
              nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui
              officia deserunt mollit anim id est laborum.
            </p>

            <p>
              Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque
              laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi
              architecto beatae vitae dicta sunt explicabo.
            </p>

            <p>
              Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia
              consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.
            </p>
          </article>
        </div>
      </div>

      {/* Footer with Controls */}
      <div className="border-t border-border bg-background p-4 space-y-3">
        {/* Progress Bar */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-foreground/60 whitespace-nowrap">
            {currentChapter + 1}/{chapters.length}
          </span>
          <div className="flex-1 h-2 rounded-full bg-secondary/30">
            <div
              className="h-full bg-primary rounded-full transition-all"
              style={{ width: `${progress}%` }}
              role="progressbar"
              aria-valuenow={Math.round(progress)}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
          <span className="text-xs text-foreground/60 whitespace-nowrap">{Math.round(progress)}%</span>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center gap-3">
          <button
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
            className="px-4 py-2 text-sm font-medium rounded border border-border hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Previous page"
          >
            ← Previous
          </button>

          <input
            type="number"
            min="1"
            max={totalPages}
            value={currentPage}
            onChange={(e) => handleGoToPage(Number(e.target.value))}
            className="w-16 px-2 py-1 text-center text-sm rounded border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label="Current page"
          />

          <span className="text-xs text-foreground/60">
            of {totalPages}
          </span>

          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className="px-4 py-2 text-sm font-medium rounded border border-border hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Next page"
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}
