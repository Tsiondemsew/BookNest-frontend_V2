'use client';

import { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { feedApi } from '@/lib/api/client';
import type { Comment } from '@repo/types';

interface CommentFormProps {
  postId: string;
  parentCommentId?: string;
  isReply?: boolean;
  onCommentAdded: (comment: Comment) => void;
}

export function CommentForm({ postId, parentCommentId, isReply = false, onCommentAdded }: CommentFormProps) {
  const { user, isAuthenticated } = useAuthStore();
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim()) return;
    if (!isAuthenticated) {
      window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await feedApi.createComment(postId, content.trim(), parentCommentId);
      onCommentAdded(res.data);
      setContent('');
    } catch (error) {
      console.error('Failed to post comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="bg-[#F5F1EB] rounded-xl p-3 text-center">
        <p className="text-sm text-[#4A5568]">
          <a href="/login" className="text-[#B85C38] hover:underline font-medium">
            Sign in
          </a>{' '}
          to leave a comment
        </p>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#2C3E50] to-[#B85C38] flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
        {user?.publicName?.charAt(0) || 'U'}
      </div>
      <div className="flex-1 flex gap-2">
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && void handleSubmit()}
          placeholder={isReply ? 'Write a reply…' : 'Write a comment…'}
          className="flex-1 px-3 py-2 border border-[#E8E2D9] rounded-xl focus:outline-none focus:border-[#B85C38] focus:ring-2 focus:ring-[#B85C38]/20 text-sm"
        />
        <button
          type="button"
          onClick={() => void handleSubmit()}
          disabled={isSubmitting || !content.trim()}
          className="p-2 bg-[#B85C38] text-white rounded-xl hover:bg-[#A04E2F] disabled:opacity-50"
        >
          {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
        </button>
      </div>
    </div>
  );
}
