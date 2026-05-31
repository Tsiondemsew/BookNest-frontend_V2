'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Heart, MessageCircle, Bookmark, MoreHorizontal, BookOpen, User } from 'lucide-react';
import { CommentSection } from '../comments/CommentSection';
import { ShareButton } from '../interactions/ShareButton';
import { ReportButton } from '../interactions/ReportButton';
import { formatRelativeTime } from '../../utils/timeFormat';
import type { Post, PostTag } from '@repo/types';

interface FeedPostProps {
  post: Post;
  onLikeToggle?: (postId: string, nextLiked: boolean) => void;
  showComments?: boolean;
}

function PostTags({ tags }: { tags: PostTag[] }) {
  if (!tags.length) return null;

  return (
    <div className="flex flex-wrap gap-2 mt-3">
      {tags.map((tag) =>
        tag.type === 'user' ? (
          <Link
            key={`user-${tag.id}`}
            href={`/@${encodeURIComponent(tag.username)}`}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#F5F1EB] text-xs text-[#1A2A3A] hover:bg-[#E8E2D9] transition-colors"
          >
            <User size={12} className="text-[#B85C38]" />@{tag.username}
          </Link>
        ) : (
          <Link
            key={`book-${tag.id}`}
            href={`/market/${tag.id}`}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#F5F1EB] text-xs text-[#1A2A3A] hover:bg-[#E8E2D9] transition-colors"
          >
            {tag.coverUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={tag.coverUrl} alt="" className="w-4 h-5 object-cover rounded-sm" />
            ) : (
              <BookOpen size={12} className="text-[#B85C38]" />
            )}
            {tag.title}
          </Link>
        )
      )}
    </div>
  );
}

export function FeedPost({ post, onLikeToggle, showComments = false }: FeedPostProps) {
  const [expandedComments, setExpandedComments] = useState(showComments);
  const [isLiked, setIsLiked] = useState(post.isLiked);
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const [shareCount, setShareCount] = useState(post.shareCount);
  const [isSaved, setIsSaved] = useState(post.isSaved ?? false);

  const handleLike = () => {
    const nextLiked = !isLiked;
    setIsLiked(nextLiked);
    setLikeCount((prev) => Math.max(0, prev + (nextLiked ? 1 : -1)));
    onLikeToggle?.(post.id, nextLiked);
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'author':
        return (
          <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">Author</span>
        );
      case 'publisher':
        return (
          <span className="text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded">
            Publisher
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <article className="bg-white rounded-xl border border-[#E8E2D9] overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="p-4 pb-2">
        <div className="flex items-start justify-between">
          <Link
            href={`/@${encodeURIComponent(post.author.username)}`}
            className="flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2C3E50] to-[#B85C38] flex items-center justify-center text-white font-semibold overflow-hidden">
              {post.author.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={post.author.avatarUrl}
                  alt={post.author.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                post.author.name.charAt(0).toUpperCase()
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-[#1A2A3A]">{post.author.name}</span>
                {getRoleBadge(post.author.role)}
                {post.isFromFollowing && (
                  <span className="text-xs bg-[#B85C38]/10 text-[#B85C38] px-1.5 py-0.5 rounded font-medium">
                    Following
                  </span>
                )}
              </div>
              <span className="text-xs text-[#4A5568]">
                @{post.author.username} • {formatRelativeTime(post.createdAt)}
              </span>
            </div>
          </Link>
          <div className="flex items-center gap-1">
            <ReportButton targetId={post.id} type="post" />
            <button type="button" className="p-1 text-[#4A5568] hover:text-[#1A2A3A]">
              <MoreHorizontal size={18} />
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 py-2">
        <p className="text-[#1A2A3A] whitespace-pre-wrap leading-relaxed">{post.content}</p>
        {post.tags && post.tags.length > 0 && <PostTags tags={post.tags} />}
        {post.imageUrl && (
          <div className="mt-3 rounded-xl overflow-hidden border border-[#E8E2D9]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={post.imageUrl} alt="Post" className="w-full object-cover max-h-[28rem]" />
          </div>
        )}
      </div>

      <div className="px-4 py-2 border-t border-[#E8E2D9] flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={handleLike}
            className={`flex items-center gap-1 text-sm transition-colors ${
              isLiked ? 'text-red-500' : 'text-[#4A5568] hover:text-red-500'
            }`}
          >
            <Heart size={18} fill={isLiked ? 'currentColor' : 'none'} />
            <span>{likeCount > 0 ? likeCount : ''}</span>
          </button>

          <button
            type="button"
            onClick={() => setExpandedComments(!expandedComments)}
            className="flex items-center gap-1 text-sm text-[#4A5568] hover:text-[#B85C38] transition-colors"
          >
            <MessageCircle size={18} />
            <span>{post.commentCount}</span>
          </button>

          <ShareButton
            postId={post.id}
            post={post}
            shareCount={shareCount}
            onShareCountChange={setShareCount}
          />
        </div>

        <button
          type="button"
          onClick={() => setIsSaved(!isSaved)}
          className="text-[#4A5568] hover:text-[#B85C38] transition-colors"
        >
          <Bookmark size={18} fill={isSaved ? '#B85C38' : 'none'} />
        </button>
      </div>

      {expandedComments && (
        <div className="border-t border-[#E8E2D9]">
          <CommentSection postId={post.id} />
        </div>
      )}
    </article>
  );
}
