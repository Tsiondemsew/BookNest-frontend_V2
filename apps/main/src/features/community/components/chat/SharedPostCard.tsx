'use client';

import Link from 'next/link';
import type { Post } from '@repo/types';
import { PostTags } from '../feed/PostTags';

interface SharedPostCardProps {
  post: Post;
  compact?: boolean;
}

export function SharedPostCard({ post, compact = false }: SharedPostCardProps) {
  const preview = post.content.length > 140 ? `${post.content.slice(0, 140)}…` : post.content;
  const bookTags = (post.tags || []).filter((t) => t.type === 'book');

  return (
    <div className="block rounded-xl border border-bn-border/70 bg-white overflow-hidden max-w-sm">
      <Link
        href={`/community?post=${post.id}`}
        className="block hover:border-bn-primary/40 transition-colors"
      >
        <div className="px-3 py-2 border-b border-bn-border/50 flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#2C3E50] to-[#B85C38] flex items-center justify-center text-white text-xs font-semibold overflow-hidden flex-shrink-0">
            {post.author.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={post.author.avatarUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              post.author.name.charAt(0).toUpperCase()
            )}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-bn-ink truncate">{post.author.name}</p>
            <p className="text-[10px] text-bn-muted truncate">@{post.author.username}</p>
          </div>
        </div>
        <div className="p-3">
          <p className={`text-sm text-bn-ink whitespace-pre-wrap ${compact ? 'line-clamp-3' : ''}`}>
            {preview}
          </p>
          {post.imageUrl && (
            <div className="mt-2 rounded-lg overflow-hidden border border-bn-border/50">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={post.imageUrl}
                alt=""
                className="w-full object-cover max-h-36"
              />
            </div>
          )}
        </div>
        <div className="px-3 py-2 text-[10px] uppercase tracking-wide text-bn-primary font-medium bg-bn-primary/5">
          View post on BookNest
        </div>
      </Link>
      {bookTags.length > 0 && (
        <div className="px-3 pb-3">
          <PostTags tags={bookTags} />
        </div>
      )}
    </div>
  );
}
