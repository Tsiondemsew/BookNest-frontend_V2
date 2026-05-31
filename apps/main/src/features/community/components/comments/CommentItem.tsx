'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Heart, MessageCircle, MoreHorizontal } from 'lucide-react';
import { CommentForm } from './CommentForm';
import { ReplyItem } from './ReplyItem';
import { LikeButton } from '../interactions/LikeButton';
import { ReportButton } from '../interactions/ReportButton';
import { formatRelativeTime } from '../../utils/timeFormat';

interface Comment {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
    username: string;
    avatarUrl?: string;
  };
  likeCount: number;
  isLiked: boolean;
  replyCount: number;
  replies?: Comment[];
  createdAt: string;
}

interface CommentItemProps {
  comment: Comment;
  onReplyAdded: (reply: Comment) => void;
  isReply?: boolean;
}

export function CommentItem({ comment, onReplyAdded, isReply = false }: CommentItemProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showReplies, setShowReplies] = useState(false);

  return (
    <div className={`${!isReply && 'border-b border-[#E8E2D9] pb-3'} ${isReply && 'ml-8 mt-2'}`}>
      <div className="flex gap-2">
        {/* Avatar */}
        <Link href={`/@${encodeURIComponent(comment.author.username)}`} className="flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#2C3E50] to-[#B85C38] flex items-center justify-center text-white text-xs font-semibold">
            {comment.author.avatarUrl ? (
              <img src={comment.author.avatarUrl} alt="" className="w-full h-full rounded-full object-cover" />
            ) : (
              comment.author.name.charAt(0).toUpperCase()
            )}
          </div>
        </Link>

        {/* Comment Content */}
        <div className="flex-1">
          <div className="bg-[#F5F1EB] rounded-lg px-3 py-2">
            <div className="flex items-center justify-between">
              <Link href={`/@${encodeURIComponent(comment.author.username)}`} className="font-semibold text-sm text-[#1A2A3A] hover:text-[#B85C38]">
                {comment.author.name}
              </Link>
              <div className="flex items-center gap-1">
                <ReportButton postId={comment.id} type="comment" />
                <button className="p-0.5 text-[#4A5568] hover:text-[#1A2A3A]">
                  <MoreHorizontal size={12} />
                </button>
              </div>
            </div>
            <p className="text-sm text-[#1A2A3A] mt-1">{comment.content}</p>
          </div>
          
          {/* Actions */}
          <div className="flex items-center gap-3 mt-1 ml-2">
            <LikeButton postId={comment.id} initialLiked={comment.isLiked} initialCount={comment.likeCount} size="sm" />
            <button
              onClick={() => setShowReplyForm(!showReplyForm)}
              className="text-xs text-[#4A5568] hover:text-[#B85C38] transition-colors flex items-center gap-1"
            >
              <MessageCircle size={12} />
              Reply
            </button>
            <span className="text-xs text-[#4A5568]">{formatRelativeTime(comment.createdAt)}</span>
          </div>

          {/* Reply Form */}
          {showReplyForm && (
            <div className="mt-2 ml-6">
              <CommentForm
                postId={comment.id}
                isReply={true}
                parentCommentId={comment.id}
                onCommentAdded={(reply) => {
                  onReplyAdded(reply);
                  setShowReplyForm(false);
                }}
              />
            </div>
          )}

          {/* View Replies Button */}
          {comment.replyCount > 0 && !showReplies && (
            <button
              onClick={() => setShowReplies(true)}
              className="text-xs text-[#B85C38] hover:underline mt-1 ml-2"
            >
              View {comment.replyCount} {comment.replyCount === 1 ? 'reply' : 'replies'}
            </button>
          )}

          {/* Replies List */}
          {showReplies && comment.replies && comment.replies.length > 0 && (
            <div className="mt-2">
              {comment.replies.map((reply) => (
                <ReplyItem key={reply.id} reply={reply} />
              ))}
              <button
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