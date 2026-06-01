'use client';

import { useState } from 'react';
import { Share2, Check, Link2, MessageCircle } from 'lucide-react';
import { feedApi } from '@/lib/api/client';
import { ShareToChatModal } from '../chat/ShareToChatModal';
import { useTranslation } from '@/hooks/useTranslation';
import type { Post } from '@repo/types';

interface ShareButtonProps {
  postId: string;
  post?: Post;
  shareCount: number;
  onShareCountChange?: (count: number) => void;
}

export function ShareButton({ postId, post, shareCount, onShareCountChange }: ShareButtonProps) {
  const { t } = useTranslation();
  const [showOptions, setShowOptions] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [count, setCount] = useState(shareCount);

  const recordShare = async () => {
    try {
      const res = await feedApi.sharePost(postId);
      const next = res.data?.shareCount ?? count + 1;
      setCount(next);
      onShareCountChange?.(next);
    } catch {
      // Still allow copy/share even if API fails
    }
  };

  const copyLink = async () => {
    const url = `${window.location.origin}/community?post=${postId}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    void recordShare();
    setTimeout(() => setCopied(false), 2000);
    setShowOptions(false);
  };

  const shareViaNative = async () => {
    const url = `${window.location.origin}/community?post=${postId}`;
    if (navigator.share) {
      await navigator.share({
        title: t('community.sharePostTitle'),
        url,
      });
      void recordShare();
    } else {
      await copyLink();
    }
    setShowOptions(false);
  };

  const openChatShare = () => {
    setShowOptions(false);
    setShowChatModal(true);
  };

  return (
    <>
      <div className="relative">
        <button
          type="button"
          onClick={() => setShowOptions(!showOptions)}
          className="flex items-center gap-1 text-sm text-[#4A5568] hover:text-[#B85C38] transition-colors"
        >
          <Share2 size={18} />
          <span>{count > 0 ? count : ''}</span>
        </button>

        {showOptions && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setShowOptions(false)} />
            <div className="absolute bottom-full left-0 mb-2 bg-white rounded-lg shadow-lg border border-[#E8E2D9] p-2 z-20 min-w-[180px]">
              {post && (
                <button
                  type="button"
                  onClick={openChatShare}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-[#1A2A3A] hover:bg-[#F5F1EB] rounded-lg transition-colors"
                >
                  <MessageCircle size={16} />
                  {t('community.sendInChat')}
                </button>
              )}
              <button
                type="button"
                onClick={() => void shareViaNative()}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-[#1A2A3A] hover:bg-[#F5F1EB] rounded-lg transition-colors"
              >
                <Share2 size={16} />
                {t('community.shareVia')}
              </button>
              <button
                type="button"
                onClick={() => void copyLink()}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-[#1A2A3A] hover:bg-[#F5F1EB] rounded-lg transition-colors"
              >
                {copied ? <Check size={16} className="text-green-500" /> : <Link2 size={16} />}
                {copied ? t('community.copied') : t('community.copyLink')}
              </button>
            </div>
          </>
        )}
      </div>

      {post && (
        <ShareToChatModal
          post={post}
          isOpen={showChatModal}
          onClose={() => setShowChatModal(false)}
        />
      )}
    </>
  );
}
