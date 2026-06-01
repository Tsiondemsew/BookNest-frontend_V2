'use client';

import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { MessageCircle, X } from 'lucide-react';
import { CommentSection } from './CommentSection';
import { useTranslation } from '@/hooks/useTranslation';

interface CommentsFloatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string;
  authorName: string;
  authorUsername: string;
  postPreview?: string;
  commentCount?: number;
}

export function CommentsFloatPanel({
  isOpen,
  onClose,
  postId,
  authorName,
  authorUsername,
  postPreview,
  commentCount = 0,
}: CommentsFloatPanelProps) {
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, handleClose]);

  if (!mounted || !isOpen) return null;

  const preview =
    postPreview && postPreview.length > 120 ? `${postPreview.slice(0, 120).trim()}…` : postPreview;

  return createPortal(
    <div
      className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-[2px]"
      onClick={handleClose}
      role="presentation"
    >
      <div
        className="bg-white rounded-t-2xl sm:rounded-2xl border border-[#E8E2D9] shadow-2xl w-full sm:max-w-lg max-h-[min(92vh,640px)] flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-labelledby="comments-float-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 px-4 sm:px-5 pt-4 pb-3 border-b border-[#E8E2D9] shrink-0">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <MessageCircle size={18} className="text-[#B85C38] shrink-0" />
              <h2 id="comments-float-title" className="font-semibold text-[#1A2A3A]">
                {t('community.comments')}
                {commentCount > 0 && (
                  <span className="text-[#4A5568] font-normal ml-1.5">({commentCount})</span>
                )}
              </h2>
            </div>
            <p className="text-xs text-[#4A5568] mt-1 truncate">
              {authorName} · @{authorUsername}
            </p>
            {preview && (
              <p className="text-sm text-[#4A5568] mt-2 line-clamp-2 leading-snug">{preview}</p>
            )}
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="shrink-0 inline-flex items-center justify-center w-9 h-9 rounded-xl border border-[#E8E2D9] text-[#4A5568] hover:bg-[#F5F1EB] transition-colors"
            aria-label={t('community.closeComments')}
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
          <CommentSection postId={postId} floating />
        </div>
      </div>
    </div>,
    document.body
  );
}
