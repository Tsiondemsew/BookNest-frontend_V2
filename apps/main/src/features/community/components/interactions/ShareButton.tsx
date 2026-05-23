'use client';

import { useState } from 'react';
import { Share2, Check, Link2 } from 'lucide-react';

interface ShareButtonProps {
  postId: string;
  shareCount: number;
}

export function ShareButton({ postId, shareCount }: ShareButtonProps) {
  const [showOptions, setShowOptions] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyLink = async () => {
    const url = `${window.location.origin}/post/${postId}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    setShowOptions(false);
  };

  const shareViaNative = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Check out this post on BookNest',
        url: `${window.location.origin}/post/${postId}`,
      });
    } else {
      copyLink();
    }
    setShowOptions(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowOptions(!showOptions)}
        className="flex items-center gap-1 text-sm text-[#4A5568] hover:text-[#B85C38] transition-colors"
      >
        <Share2 size={18} />
        <span>{shareCount > 0 ? shareCount : ''}</span>
      </button>

      {showOptions && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setShowOptions(false)} />
          <div className="absolute bottom-full left-0 mb-2 bg-white rounded-lg shadow-lg border border-[#E8E2D9] p-2 z-20 min-w-[160px]">
            <button
              onClick={shareViaNative}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-[#1A2A3A] hover:bg-[#F5F1EB] rounded-lg transition-colors"
            >
              <Share2 size={16} />
              Share via...
            </button>
            <button
              onClick={copyLink}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-[#1A2A3A] hover:bg-[#F5F1EB] rounded-lg transition-colors"
            >
              {copied ? <Check size={16} className="text-green-500" /> : <Link2 size={16} />}
              {copied ? 'Copied!' : 'Copy link'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}