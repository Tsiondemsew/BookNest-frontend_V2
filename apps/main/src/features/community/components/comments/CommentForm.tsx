'use client';

import { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

interface CommentFormProps {
  postId: string;
  parentCommentId?: string;
  isReply?: boolean;
  onCommentAdded: (comment: any) => void;
}

export function CommentForm({ postId, parentCommentId, isReply = false, onCommentAdded }: CommentFormProps) {
  const { user, isAuthenticated } = useAuthStore();
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim()) return;
    if (!isAuthenticated) {
      // Redirect to login
      window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname);
      return;
    }

    setIsSubmitting(true);
    // TODO: API call to create comment
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mock new comment
    const newComment = {
      id: Date.now().toString(),
      content: content.trim(),
      author: {
        id: user?.id || '',
        name: user?.publicName || 'User',
        username: user?.email?.split('@')[0] || 'user',
      },
      likeCount: 0,
      isLiked: false,
      replyCount: 0,
      createdAt: new Date().toISOString(),
    };
    
    onCommentAdded(newComment);
    setContent('');
    setIsSubmitting(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="bg-[#F5F1EB] rounded-lg p-3 text-center">
        <p className="text-sm text-[#4A5568]">
          <a href="/login" className="text-[#B85C38] hover:underline">Sign in</a> to leave a comment
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
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          placeholder={isReply ? "Write a reply..." : "Write a comment..."}
          className="flex-1 px-3 py-2 border border-[#E8E2D9] rounded-lg focus:outline-none focus:border-[#B85C38] focus:ring-1 focus:ring-[#B85C38] text-sm"
        />
        <button
          onClick={handleSubmit}
          disabled={isSubmitting || !content.trim()}
          className="p-2 bg-[#B85C38] text-white rounded-lg hover:bg-[#8E735B] transition-colors disabled:opacity-50"
        >
          {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
        </button>
      </div>
    </div>
  );
}