'use client';

import { useState } from 'react';
import { CommentItem } from './CommentItem';
import { CommentForm } from './CommentForm';
import { MessageCircle } from 'lucide-react';

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

interface CommentSectionProps {
  postId: string;
  initialComments?: Comment[];
}

export function CommentSection({ postId, initialComments = [] }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [isLoading, setIsLoading] = useState(false);

  const addComment = (newComment: Comment) => {
    setComments(prev => [newComment, ...prev]);
  };

  const addReply = (parentCommentId: string, newReply: Comment) => {
    setComments(prev =>
      prev.map(comment =>
        comment.id === parentCommentId
          ? { ...comment, replyCount: comment.replyCount + 1, replies: [newReply, ...(comment.replies || [])] }
          : comment
      )
    );
  };

  if (comments.length === 0 && !isLoading) {
    return (
      <div className="p-4 text-center">
        <MessageCircle size={32} className="mx-auto text-[#4A5568] mb-2" />
        <p className="text-sm text-[#4A5568]">No comments yet. Be the first to share your thoughts!</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <CommentForm postId={postId} onCommentAdded={addComment} />
      
      <div className="space-y-3">
        {comments.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            onReplyAdded={(reply) => addReply(comment.id, reply)}
          />
        ))}
      </div>
    </div>
  );
}