'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MessageCircle, MoreHorizontal } from 'lucide-react';
import { CommentForm } from './CommentForm';
import { ReplyItem } from './ReplyItem';
import { LikeButton } from '../interactions/LikeButton';
import { ReportButton } from '../interactions/ReportButton';
import { formatRelativeTime } from '../../utils/timeFormat';
import type { Comment } from '@repo/types';

interface CommentItemProps {
  comment: Comment;
  postId: string;
  onReplyAdded: (reply: Comment) => void;
  isReply?: boolean;
}

export function CommentItem({ comment, postId, onReplyAdded, isReply = false }: CommentItemProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showReplies, setShowReplies] = useState(false);

  return (
    <div className={`${!isReply && 'pb-3 last:pb-0'} ${isReply && 'ml-6 mt-2 pl-3 border-l-2 border-[#E8E2D9]'}`}>
      <div className="flex gap-2">
        <Link href={`/@${encodeURIComponent(comment.author.username)}`} className="flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#2C3E50] to-[#B85C38] flex items-center justify-center text-white text-xs font-semibold overflow-hidden">
            {comment.author.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={comment.author.avatarUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              comment.author.name.charAt(0).toUpperCase()
            )}
          </div>
        </Link>

        <div className="flex-1 min-w-0">
          <div className="bg-[#F5F1EB] rounded-xl px-3 py-2">
            <div className="flex items-center justify-between gap-2">
              <Link
                href={`/@${encodeURIComponent(comment.author.username)}`}
                className="font-semibold text-sm text-[#1A2A3A] hover:text-[#B85C38] truncate"
              >
                {comment.author.name}
              </Link>
              <div className="flex items-center gap-1 shrink-0">
                <ReportButton targetId={comment.id} type="comment" />
                <button type="button" className="p-0.5 text-[#4A5568] hover:text-[#1A2A3A]">
                  <MoreHorizontal size={12} />
                </button>
              </div>
            </div>
            <p className="text-sm text-[#1A2A3A] mt-1 break-words">{comment.content}</p>
          </div>

          <div className="flex items-center gap-3 mt-1 ml-2 flex-wrap">
            <LikeButton
              targetId={comment.id}
              targetType="comment"
              initialLiked={comment.isLiked}
              initialCount={comment.likeCount}
              size="sm"
            />
            <button
              type="button"
              onClick={() => setShowReplyForm(!showReplyForm)}
              className="text-xs text-[#4A5568] hover:text-[#B85C38] transition-colors flex items-center gap-1"
            >
              <MessageCircle size={12} />
              Reply
            </button>
            <span className="text-xs text-[#4A5568]">{formatRelativeTime(comment.createdAt)}</span>
          </div>

          {showReplyForm && (
            <div className="mt-2 ml-6">
              <CommentForm
                postId={postId}
                isReply
                parentCommentId={comment.id}
                onCommentAdded={(reply) => {
                  onReplyAdded(reply);
                  setShowReplyForm(false);
                }}
              />
            </div>
          )}

          {comment.replyCount > 0 && !showReplies && (
            <button
              type="button"
              onClick={() => setShowReplies(true)}
              className="text-xs text-[#B85C38] hover:underline mt-1 ml-2 font-medium"
            >
              View {comment.replyCount} {comment.replyCount === 1 ? 'reply' : 'replies'}
            </button>
          )}

          {showReplies && comment.replies && comment.replies.length > 0 && (
            <div className="mt-2">
              {comment.replies.map((reply) => (
                <ReplyItem key={reply.id} reply={reply} />
              ))}
              <button
                type="button"
                onClick={() => setShowReplies(false)}
                className="text-xs text-[#4A5568] hover:underline mt-1 ml-2"
              >
                Show less
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
