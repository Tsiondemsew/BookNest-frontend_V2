'use client';

import { useState, useEffect } from 'react';
import { CommentItem } from './CommentItem';
import { CommentForm } from './CommentForm';
import { MessageCircle, Loader2 } from 'lucide-react';
import { feedApi } from '@/lib/api/client';
import type { Comment } from '@repo/types';

interface CommentSectionProps {
  postId: string;
}

export function CommentSection({ postId }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const res = await feedApi.getComments(postId);
        setComments(res.data.comments || []);
      } catch {
        setComments([]);
      } finally {
        setIsLoading(false);
      }
    };
    void load();
  }, [postId]);

  const addComment = (newComment: Comment) => {
    setComments((prev) => [newComment, ...prev]);
  };

  const addReply = (parentCommentId: string, newReply: Comment) => {
    setComments((prev) =>
      prev.map((comment) =>
        comment.id === parentCommentId
          ? {
              ...comment,
              replyCount: comment.replyCount + 1,
              replies: [newReply, ...(comment.replies || [])],
            }
          : comment
      )
    );
  };

  return (
    <div className="p-4 space-y-4 bg-[#FDFBF7]/50">
      <CommentForm postId={postId} onCommentAdded={addComment} />

      {isLoading ? (
        <div className="flex justify-center py-6">
          <Loader2 className="animate-spin text-[#B85C38]" size={24} />
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-4">
          <MessageCircle size={28} className="mx-auto text-[#4A5568] mb-2 opacity-60" />
          <p className="text-sm text-[#4A5568]">No comments yet — start the conversation.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              postId={postId}
              onReplyAdded={(reply) => addReply(comment.id, reply)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
