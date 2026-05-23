'use client';

import { useState } from 'react';
import { Check, CheckCheck, MoreHorizontal, Copy, Trash2, Flag } from 'lucide-react';
import { formatRelativeTime } from '../../utils/timeFormat';

interface ChatMessageProps {
  message: {
    id: string;
    content: string;
    senderId: string;
    senderName: string;
    senderAvatar?: string;
    createdAt: string;
    status: 'sending' | 'sent' | 'delivered' | 'read';
    isEdited?: boolean;
  };
  isOwn: boolean;
  showAvatar?: boolean;
  onDelete?: (messageId: string) => void;
  onReport?: (messageId: string) => void;
}

export function ChatMessage({ message, isOwn, showAvatar = true, onDelete, onReport }: ChatMessageProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  const getStatusIcon = () => {
    switch (message.status) {
      case 'sending':
        return <span className="text-xs text-[#4A5568]">Sending...</span>;
      case 'sent':
        return <Check size={14} className="text-[#4A5568]" />;
      case 'delivered':
        return <CheckCheck size={14} className="text-[#4A5568]" />;
      case 'read':
        return <CheckCheck size={14} className="text-blue-500" />;
      default:
        return null;
    }
  };

  const copyMessage = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    setShowMenu(false);
  };

  return (
    <div className={`flex gap-2 group ${isOwn ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      {!isOwn && showAvatar && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-[#2C3E50] to-[#B85C38] flex items-center justify-center text-white text-xs font-semibold">
          {message.senderAvatar ? (
            <img src={message.senderAvatar} alt={message.senderName} className="w-full h-full rounded-full object-cover" />
          ) : (
            message.senderName.charAt(0).toUpperCase()
          )}
        </div>
      )}
      {!isOwn && !showAvatar && <div className="w-8 flex-shrink-0" />}

      {/* Message Bubble */}
      <div className={`max-w-[70%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
        {!isOwn && showAvatar && (
          <span className="text-xs text-[#4A5568] mb-1 ml-2">{message.senderName}</span>
        )}
        
        <div className="relative">
          <div
            className={`relative px-3 py-2 rounded-2xl ${
              isOwn 
                ? 'bg-[#B85C38] text-white rounded-br-sm' 
                : 'bg-white border border-[#E8E2D9] text-[#1A2A3A] rounded-bl-sm'
            }`}
          >
            <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
            {message.isEdited && (
              <span className="text-xs opacity-60 ml-1">(edited)</span>
            )}
          </div>

          {/* Message Menu */}
          <button
            onClick={() => setShowMenu(!showMenu)}
            className={`absolute top-1/2 -translate-y-1/2 p-1 text-[#4A5568] hover:bg-[#F5F1EB] rounded-full opacity-0 group-hover:opacity-100 transition-opacity ${
              isOwn ? '-left-6' : '-right-6'
            }`}
          >
            <MoreHorizontal size={14} />
          </button>

          {showMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
              <div className={`absolute top-6 ${isOwn ? 'right-0' : 'left-0'} z-20 bg-white rounded-lg shadow-lg border border-[#E8E2D9] p-1 min-w-[120px]`}>
                <button
                  onClick={copyMessage}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-[#1A2A3A] hover:bg-[#F5F1EB] rounded-md transition-colors"
                >
                  {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
                {isOwn && onDelete && (
                  <button
                    onClick={() => {
                      onDelete(message.id);
                      setShowMenu(false);
                    }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-md transition-colors"
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                )}
                {!isOwn && onReport && (
                  <button
                    onClick={() => {
                      onReport(message.id);
                      setShowMenu(false);
                    }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-md transition-colors"
                  >
                    <Flag size={14} />
                    Report
                  </button>
                )}
              </div>
            </>
          )}
        </div>

        {/* Timestamp & Status */}
        <div className={`flex items-center gap-1 mt-1 text-xs text-[#4A5568] ${isOwn ? 'justify-end' : 'justify-start'}`}>
          <span>{formatRelativeTime(message.createdAt)}</span>
          {isOwn && getStatusIcon()}
        </div>
      </div>
    </div>
  );
}