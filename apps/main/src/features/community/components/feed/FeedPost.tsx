'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Heart, MessageCircle, Share2, Flag, Bookmark, MoreHorizontal } from 'lucide-react';
import { CommentSection } from '../comments/CommentSection';
import { formatRelativeTime } from '../../utils/timeFormat';
import type { Post } from '@repo/types';

interface FeedPostProps {
  post: Post;
  onLikeToggle?: (postId: string, isLiked: boolean) => void;
  showComments?: boolean;
}

export function FeedPost({ post, onLikeToggle, showComments = false }: FeedPostProps) {
  const [expandedComments, setExpandedComments] = useState(showComments);
  const [isLiked, setIsLiked] = useState(post.isLiked);
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const [isSaved, setIsSaved] = useState(false);

  const handleLike = () => {
    const newIsLiked = !isLiked;
    setIsLiked(newIsLiked);
    setLikeCount(prev => newIsLiked ? prev + 1 : prev - 1);
    onLikeToggle?.(post.id, newIsLiked);
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'author':
        return <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">Author</span>;
      case 'publisher':
        return <span className="text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded">Publisher</span>;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-xl border border-[#E8E2D9] overflow-hidden">
      {/* Header */}
      <div className="p-4 pb-2">
        <div className="flex items-start justify-between">
          <Link href={`/@${post.author.username}`} className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2C3E50] to-[#B85C38] flex items-center justify-center text-white font-semibold overflow-hidden">
              {post.author.avatarUrl ? (
                <img src={post.author.avatarUrl} alt={post.author.name} className="w-full h-full object-cover" />
              ) : (
                post.author.name.charAt(0).toUpperCase()
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-[#1A2A3A]">{post.author.name}</span>
                {getRoleBadge(post.author.role)}
              </div>
              <span className="text-xs text-[#4A5568]">@{post.author.username} • {formatRelativeTime(post.createdAt)}</span>
            </div>
          </Link>
          <button className="p-1 text-[#4A5568] hover:text-[#1A2A3A]">
            <MoreHorizontal size={18} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-2">
        <p className="text-[#1A2A3A] whitespace-pre-wrap">{post.content}</p>
        {post.imageUrl && (
          <div className="mt-3 rounded-lg overflow-hidden">
            <img src={post.imageUrl} alt="Post image" className="w-full object-cover max-h-96" />
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="px-4 py-2 border-t border-[#E8E2D9] flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={handleLike} className="flex items-center gap-1 text-sm text-[#4A5568] hover:text-red-500 transition-colors">
            <Heart size={18} fill={isLiked ? '#ef4444' : 'none'} className={isLiked ? 'text-red-500' : ''} />
            <span>{likeCount > 0 ? likeCount : ''}</span>
          </button>
          
          <button onClick={() => setExpandedComments(!expandedComments)} className="flex items-center gap-1 text-sm text-[#4A5568] hover:text-[#B85C38] transition-colors">
            <MessageCircle size={18} />
            <span>{post.commentCount}</span>
          </button>
          
          <button className="flex items-center gap-1 text-sm text-[#4A5568] hover:text-[#B85C38] transition-colors">
            <Share2 size={18} />
            <span>{post.shareCount > 0 ? post.shareCount : ''}</span>
          </button>
        </div>
        
        <div className="flex items-center gap-2">
          <button onClick={() => setIsSaved(!isSaved)} className="text-[#4A5568] hover:text-[#B85C38] transition-colors">
            <Bookmark size={18} fill={isSaved ? '#B85C38' : 'none'} />
          </button>
          <button className="text-[#4A5568] hover:text-red-500 transition-colors">
            <Flag size={18} />
          </button>
        </div>
      </div>

      {/* Comments */}
      {expandedComments && (
        <div className="border-t border-[#E8E2D9]">
          <CommentSection postId={post.id} />
        </div>
      )}
    </div>
  );
}