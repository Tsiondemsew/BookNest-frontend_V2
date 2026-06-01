'use client';

import type { MouseEvent } from 'react';
import { UserCircle2 } from 'lucide-react';
import type { PendingBook } from './types';

export function getBookAuthorUserId(book: Pick<PendingBook, 'author'>): string | null {
  const id = book.author?.id;
  return id && id.length > 0 ? id : null;
}

export function getBookAuthorDisplayName(
  book: Pick<PendingBook, 'author' | 'authorProfile'>,
): string {
  return (
    book.authorProfile?.name ||
    book.author?.publicName ||
    book.author?.email ||
    'Author'
  );
}

type Props = {
  book: Pick<PendingBook, 'author' | 'authorProfile'>;
  onOpenProfile: (userId: string) => void;
  variant?: 'link' | 'button';
  className?: string;
};

export function AuthorProfileAccess({
  book,
  onOpenProfile,
  variant = 'link',
  className = '',
}: Props) {
  const userId = getBookAuthorUserId(book);
  const name = getBookAuthorDisplayName(book);

  if (!userId) {
    return <span className={className}>{name}</span>;
  }

  const openProfile = (e: MouseEvent) => {
    e.stopPropagation();
    onOpenProfile(userId);
  };

  if (variant === 'button') {
    return (
      <button
        type="button"
        onClick={openProfile}
        className={`inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-sm font-semibold text-foreground transition hover:border-primary/40 hover:bg-surface ${className}`}
      >
        <UserCircle2 size={16} className="text-primary" />
        Author profile
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={openProfile}
      className={`font-medium text-primary hover:underline ${className}`}
    >
      {name}
    </button>
  );
}
