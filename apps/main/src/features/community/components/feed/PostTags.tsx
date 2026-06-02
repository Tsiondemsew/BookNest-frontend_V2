'use client';

import Link from 'next/link';
import { BookOpen, User } from 'lucide-react';
import { getBookDetailPath } from '@/lib/books/bookPaths';
import type { PostTag } from '@repo/types';

export function PostTags({ tags }: { tags: PostTag[] }) {
  if (!tags.length) return null;

  return (
    <div className="flex flex-wrap gap-2 mt-3">
      {tags.map((tag) => {
        if (tag.type === 'user') {
          return (
            <Link
              key={`user-${tag.id}`}
              href={`/@${encodeURIComponent(tag.username)}`}
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#F5F1EB] text-xs text-[#1A2A3A] hover:bg-[#E8E2D9] transition-colors"
            >
              <User size={12} className="text-[#B85C38]" />@{tag.username}
            </Link>
          );
        }

        if (tag.type === 'book' && tag.id) {
          return (
            <Link
              key={`book-${tag.id}`}
              href={getBookDetailPath(tag.id)}
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#E8F4FD] text-xs text-[#2C3E50] hover:bg-[#D6EBFA] transition-colors font-medium"
            >
              {tag.coverUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={tag.coverUrl} alt="" className="w-4 h-5 object-cover rounded-sm" />
              ) : (
                <BookOpen size={12} className="text-[#B85C38]" />
              )}
              {tag.title || 'View book'}
            </Link>
          );
        }

        return null;
      })}
    </div>
  );
}
