'use client';

import Link from 'next/link';
import { LikeButton } from '../interactions/LikeButton';
import { formatRelativeTime } from '../../utils/timeFormat';
import type { Comment } from '@repo/types';

interface ReplyItemProps {
  reply: Comment;
}

export function ReplyItem({ reply }: ReplyItemProps) {
  return (
    <div className="flex gap-2 mt-2">
      <Link href={`/@${encodeURIComponent(reply.author.username)}`} className="flex-shrink-0">
        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#2C3E50] to-[#B85C38] flex items-center justify-center text-white text-[10px] font-semibold overflow-hidden">
          {reply.author.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={reply.author.avatarUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            reply.author.name.charAt(0).toUpperCase()
          )}
        </div>
      </Link>
      <div className="flex-1 min-w-0">
        <div className="bg-[#F5F1EB] rounded-lg px-2 py-1.5">
          <Link
            href={`/@${encodeURIComponent(reply.author.username)}`}
            className="font-semibold text-xs text-[#1A2A3A] hover:text-[#B85C38]"
          >
            {reply.author.name}
          </Link>
          <p className="text-xs text-[#1A2A3A] mt-0.5 break-words">{reply.content}</p>
        </div>
        <div className="flex items-center gap-2 mt-0.5 ml-2">
          <LikeButton
            targetId={reply.id}
            targetType="comment"
            initialLiked={reply.isLiked}
            initialCount={reply.likeCount}
            size="xs"
          />
          <span className="text-xs text-[#4A5568]">{formatRelativeTime(reply.createdAt)}</span>
        </div>
      </div>
    </div>
  );
}
