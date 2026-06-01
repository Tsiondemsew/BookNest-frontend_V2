'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Send,
  Loader2,
  ArrowLeft,
  MoreVertical,
  Link2,
  Trash2,
  Copy,
  Check,
  RefreshCw,
  User,
  Users,
  LogOut,
  Pencil,
  Reply,
  Forward,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { useRealtimeChat, type RealtimeMessage } from '@/hooks/useRealtimeChat';
import { chatApi } from '@/lib/api/client';
import { getFriendlyNetworkMessage } from '@/lib/api/networkErrorMessage';
import { dismissMessageNotifications } from '@/lib/notifications/dismissOnView';
import { useAuthStore } from '@/stores/authStore';
import { formatRelativeTime } from '@/features/community/utils/timeFormat';
import { SharedPostCard } from './SharedPostCard';
import { EmojiQuickPicker } from './EmojiQuickPicker';
import { GroupManageModal } from './GroupManageModal';
import { ForwardMessageModal } from './ForwardMessageModal';
import {
  parseAnyForwarded,
  replyPreviewFromMessage,
  toReplyPreview,
} from './messageFormat';
import { ui } from '@/features/community/ui';
import type { ChatMessage } from '@repo/types';

interface ChatWindowProps {
  chatId: string;
  chatName?: string;
  chatType?: 'direct' | 'group';
  isGroupAdmin?: boolean;
  otherUserId?: string;
  otherUsername?: string | null;
  otherUserOnline?: boolean;
  onBack?: () => void;
  onMessageSent?: () => void;
  onRefreshMeta?: () => void;
  onChatRemoved?: () => void;
}

export function ChatWindow({
  chatId,
  chatName,
  chatType = 'direct',
  isGroupAdmin = false,
  otherUserId,
  otherUsername,
  otherUserOnline = false,
  onBack,
  onMessageSent,
  onRefreshMeta,
  onChatRemoved,
}: ChatWindowProps) {
  const { user } = useAuthStore();
  const currentUserId = user?.id;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeMessageMenu, setActiveMessageMenu] = useState<string | null>(null);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [copiedInvite, setCopiedInvite] = useState(false);
  const [headerError, setHeaderError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(otherUserOnline);
  const [showEmoji, setShowEmoji] = useState(false);
  const [showGroupManage, setShowGroupManage] = useState(false);
  const [groupAdmin, setGroupAdmin] = useState(isGroupAdmin);
  const [isDeletingChat, setIsDeletingChat] = useState(false);
  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [forwardMessage, setForwardMessage] = useState<ChatMessage | null>(null);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const headerMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsOnline(otherUserOnline);
  }, [otherUserOnline, chatId]);

  useEffect(() => {
    setGroupAdmin(isGroupAdmin);
  }, [isGroupAdmin, chatId]);

  useEffect(() => {
    if (chatType !== 'group') return;
    void chatApi
      .getChat(chatId)
      .then((response) => setGroupAdmin(Boolean(response.data.isAdmin)))
      .catch(() => {
        /* keep prop fallback */
      });
  }, [chatId, chatType]);

  useEffect(() => {
    if (chatType !== 'direct') return;
    const interval = window.setInterval(() => onRefreshMeta?.(), 45_000);
    return () => window.clearInterval(interval);
  }, [chatType, chatId, onRefreshMeta]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('[data-chat-menu-trigger]')) return;
      if (headerMenuRef.current?.contains(target)) return;
      setMenuOpen(false);
      setActiveMessageMenu(null);
      setShowEmoji(false);
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  const { newMessages, clearNewMessages } = useRealtimeChat(chatId);

  const loadMessages = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const response = await chatApi.getMessages(chatId);
      setMessages(response.data.messages || []);
    } catch (error) {
      setLoadError(getFriendlyNetworkMessage(error, 'Unable to load messages. Please try again.'));
    } finally {
      setIsLoading(false);
    }
  }, [chatId]);

  useEffect(() => {
    if (chatId) {
      void loadMessages();
      dismissMessageNotifications(chatId);
      setInviteLink(null);
      setMenuOpen(false);
    }
  }, [chatId, loadMessages]);

  useEffect(() => {
    if (newMessages?.length) {
      const hasSharedPost = newMessages.some((msg) => msg.post_id);
      if (hasSharedPost) {
        void loadMessages();
        clearNewMessages();
        return;
      }

      setMessages((prev) => {
        const formatRealtime = (msg: RealtimeMessage): ChatMessage => {
          const base: ChatMessage = {
            id: msg.id,
            content: msg.deleted_for_everyone_at ? null : msg.content,
            postId: msg.post_id || null,
            senderId: msg.sender_id,
            senderName: msg.users?.email?.split('@')[0] || 'User',
            senderAvatar: msg.users?.avatar_url || undefined,
            isRead: msg.is_read,
            isDeleted: Boolean(msg.deleted_for_everyone_at),
            deletedForEveryone: Boolean(msg.deleted_for_everyone_at),
            createdAt: msg.created_at,
            replyTo: null,
          };
          if (msg.reply_to_message_id) {
            const parent = prev.find((p) => p.id === msg.reply_to_message_id);
            if (parent) base.replyTo = toReplyPreview(parent);
          }
          return base;
        };

        const formatted = newMessages.map(formatRealtime);
        const existingIds = new Set(prev.map((m) => m.id));
        const toAdd = formatted.filter((m) => !existingIds.has(m.id));
        const updated = prev.map((m) => {
          const incoming = formatted.find((f) => f.id === m.id);
          if (!incoming) return m;
          return m.replyTo ? m : { ...m, ...incoming, replyTo: incoming.replyTo ?? m.replyTo };
        });
        return [...updated, ...toAdd];
      });
      clearNewMessages();
    }
  }, [newMessages, clearNewMessages, loadMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!inputValue.trim() || isSending || !currentUserId) return;

    if (editingMessageId) {
      setIsSending(true);
      try {
        const response = await chatApi.editMessage(editingMessageId, inputValue.trim());
        const updated = response.data;
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === editingMessageId
              ? { ...msg, ...updated, senderName: 'You' }
              : msg
          )
        );
        setInputValue('');
        setEditingMessageId(null);
        onMessageSent?.();
      } catch (error) {
        console.error('Failed to edit message:', error);
        setHeaderError(getFriendlyNetworkMessage(error, 'Could not edit message.'));
      } finally {
        setIsSending(false);
      }
      return;
    }

    const tempId = `temp-${Date.now()}`;
    const content = inputValue.trim();
    const replyingTo = replyTo;
    const optimistic: ChatMessage = {
      id: tempId,
      content,
      senderId: currentUserId,
      senderName: 'You',
      isRead: false,
      replyTo: replyingTo ? toReplyPreview(replyingTo) : null,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimistic]);
    setInputValue('');
    setReplyTo(null);
    setIsSending(true);

    try {
      const response = await chatApi.sendMessage(chatId, {
        content,
        replyToMessageId: replyingTo?.id,
      });
      const realMessage = response.data;
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === tempId
            ? {
                ...realMessage,
                senderName: 'You',
                replyTo: replyPreviewFromMessage(realMessage, replyingTo),
              }
            : msg
        )
      );
      onMessageSent?.();
    } catch (error) {
      console.error('Failed to send message:', error);
      setMessages((prev) => prev.filter((msg) => msg.id !== tempId));
    } finally {
      setIsSending(false);
    }
  };

  const deleteForMe = async (messageId: string) => {
    setActiveMessageMenu(null);
    try {
      await chatApi.deleteMessageForMe(messageId);
      setMessages((prev) => prev.filter((m) => m.id !== messageId));
    } catch (error) {
      console.error('Delete for me failed:', error);
    }
  };

  const deleteForEveryone = async (messageId: string) => {
    setActiveMessageMenu(null);
    try {
      await chatApi.deleteMessageForEveryone(messageId);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId
            ? {
                ...m,
                content: null,
                isDeleted: true,
                deletedForEveryone: true,
              }
            : m
        )
      );
      onMessageSent?.();
    } catch (error) {
      console.error('Delete for everyone failed:', error);
    }
  };

  const copyMessageText = async (msg: ChatMessage) => {
    setActiveMessageMenu(null);
    const text = msg.content?.trim();
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedMessageId(msg.id);
      window.setTimeout(() => setCopiedMessageId(null), 1500);
    } catch {
      setHeaderError('Could not copy message.');
    }
  };

  const startReply = (msg: ChatMessage) => {
    setActiveMessageMenu(null);
    setEditingMessageId(null);
    setReplyTo(msg);
    inputRef.current?.focus();
  };

  const startEdit = (msg: ChatMessage) => {
    setActiveMessageMenu(null);
    setReplyTo(null);
    setEditingMessageId(msg.id);
    setInputValue(msg.content || '');
    inputRef.current?.focus();
  };

  const createInviteLink = async () => {
    setHeaderError(null);
    try {
      const response = await chatApi.createGroupInvite(chatId);
      setInviteLink(response.data.inviteUrl);
      setMenuOpen(false);
    } catch (error) {
      setHeaderError(error instanceof Error ? error.message : 'Could not create invite link');
    }
  };

  const copyInviteLink = async () => {
    if (!inviteLink) return;
    await navigator.clipboard.writeText(inviteLink);
    setCopiedInvite(true);
    setTimeout(() => setCopiedInvite(false), 2000);
  };

  const deleteDirectConversation = async () => {
    if (!window.confirm('Delete this conversation from your inbox?')) return;
    setIsDeletingChat(true);
    setHeaderError(null);
    try {
      await chatApi.deleteDirectChat(chatId);
      setMenuOpen(false);
      onChatRemoved?.();
    } catch (error) {
      setHeaderError(
        getFriendlyNetworkMessage(error, 'Could not delete conversation. Please try again.')
      );
    } finally {
      setIsDeletingChat(false);
    }
  };

  const leaveGroup = async () => {
    if (!window.confirm('Leave this group?')) return;
    setIsDeletingChat(true);
    setHeaderError(null);
    try {
      await chatApi.leaveGroup(chatId);
      setMenuOpen(false);
      onChatRemoved?.();
    } catch (error) {
      setHeaderError(getFriendlyNetworkMessage(error, 'Could not leave group. Please try again.'));
    } finally {
      setIsDeletingChat(false);
    }
  };

  const deleteGroup = async () => {
    if (!window.confirm('Delete this group for everyone? This cannot be undone.')) return;
    setIsDeletingChat(true);
    setHeaderError(null);
    try {
      await chatApi.deleteGroup(chatId);
      setMenuOpen(false);
      onChatRemoved?.();
    } catch (error) {
      setHeaderError(getFriendlyNetworkMessage(error, 'Could not delete group. Please try again.'));
    } finally {
      setIsDeletingChat(false);
    }
  };

  const insertEmoji = (emoji: string) => {
    setInputValue((prev) => prev + emoji);
    setShowEmoji(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void sendMessage();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 size={32} className="animate-spin text-bn-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Header — stays above message scroll */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-bn-border/70 bg-white shrink-0 sticky top-0 z-20">
        <div className="flex items-center gap-3 min-w-0">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="p-1.5 hover:bg-bn-surface rounded-lg shrink-0 lg:hidden"
              aria-label="Back to conversations"
            >
              <ArrowLeft size={20} />
            </button>
          )}
          <div className="min-w-0">
            <h2 className="font-semibold text-bn-ink truncate">{chatName || 'Chat'}</h2>
            <p className="text-xs text-bn-muted flex items-center gap-1.5">
              {chatType === 'direct' ? (
                <>
                  <span
                    className={cn(
                      'inline-block w-2 h-2 rounded-full',
                      isOnline ? 'bg-emerald-500' : 'bg-bn-border'
                    )}
                  />
                  {isOnline ? 'Online now' : 'Offline'}
                </>
              ) : (
                <>Group chat</>
              )}
            </p>
          </div>
        </div>

        <div className="relative" ref={headerMenuRef}>
          <button
            type="button"
            data-chat-menu-trigger
            onClick={() => setMenuOpen((v) => !v)}
            className="p-2 text-bn-muted hover:text-bn-primary hover:bg-bn-surface rounded-lg touch-manipulation"
            aria-label="Chat options"
            aria-expanded={menuOpen}
          >
            <MoreVertical size={18} />
          </button>
          {menuOpen && (
            <div
              data-chat-menu-trigger
              className={cn(ui.menuDropdown, 'right-0 top-full mt-1 w-56')}
            >
              <button
                type="button"
                data-chat-menu-trigger
                onClick={() => {
                  setMenuOpen(false);
                  void loadMessages();
                }}
                className={ui.menuItem}
              >
                <RefreshCw size={16} />
                Refresh messages
              </button>
              {chatType === 'direct' && otherUserId && (
                <Link
                  href={otherUsername ? `/${otherUsername}` : `/messages?startUser=${otherUserId}`}
                  data-chat-menu-trigger
                  onClick={() => setMenuOpen(false)}
                  className={ui.menuItem}
                >
                  <User size={16} />
                  View profile
                </Link>
              )}
              {chatType === 'group' && (
                <>
                  <button
                    type="button"
                    data-chat-menu-trigger
                    onClick={() => {
                      setMenuOpen(false);
                      setShowGroupManage(true);
                    }}
                    className={ui.menuItem}
                  >
                    <Users size={16} />
                    {groupAdmin ? 'Manage group' : 'View members'}
                  </button>
                  {groupAdmin ? (
                    <>
                      <button
                        type="button"
                        data-chat-menu-trigger
                        onClick={() => void createInviteLink()}
                        className={ui.menuItem}
                      >
                        <Link2 size={16} />
                        Create invite link
                      </button>
                      <button
                        type="button"
                        data-chat-menu-trigger
                        disabled={isDeletingChat}
                        onClick={() => void deleteGroup()}
                        className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-left hover:bg-red-50 text-red-600 touch-manipulation"
                      >
                        <Trash2 size={16} />
                        Delete group
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      data-chat-menu-trigger
                      disabled={isDeletingChat}
                      onClick={() => void leaveGroup()}
                      className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-left hover:bg-red-50 text-red-600 touch-manipulation"
                    >
                      <LogOut size={16} />
                      Leave group
                    </button>
                  )}
                </>
              )}
              {chatType === 'direct' && (
                <button
                  type="button"
                  data-chat-menu-trigger
                  disabled={isDeletingChat}
                  onClick={() => void deleteDirectConversation()}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-left hover:bg-red-50 text-red-600 touch-manipulation"
                >
                  <Trash2 size={16} />
                  Delete conversation
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {loadError && (
        <div className="px-4 py-3 bg-red-50 border-b border-red-100 flex items-center justify-between gap-3">
          <p className="text-sm text-red-700">{loadError}</p>
          <button
            type="button"
            onClick={() => void loadMessages()}
            className="text-sm font-medium text-red-700 hover:underline shrink-0"
          >
            Retry
          </button>
        </div>
      )}

      {headerError && (
        <div className="px-4 py-2 text-sm text-red-600 bg-red-50 border-b border-red-100">
          {headerError}
        </div>
      )}

      {inviteLink && (
        <div className="px-4 py-2.5 bg-bn-primary/5 border-b border-bn-border/60 flex items-center gap-2 shrink-0">
          <a
            href={inviteLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-bn-primary font-medium truncate flex-1 hover:underline"
          >
            {inviteLink}
          </a>
          <button
            type="button"
            onClick={() => void copyInviteLink()}
            className="flex items-center gap-1 text-xs font-medium text-bn-primary hover:underline flex-shrink-0"
          >
            {copiedInvite ? <Check size={14} /> : <Copy size={14} />}
            {copiedInvite ? 'Copied' : 'Copy'}
          </button>
        </div>
      )}

      {/* Messages — only this region scrolls */}
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 space-y-3 bg-gradient-to-b from-bn-surface/20 to-white">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <p className="text-bn-muted">No messages yet</p>
              <p className="text-sm text-bn-muted">Say hello to start the conversation.</p>
            </div>
          </div>
        ) : (
          messages.map((msg) => {
            const isOwn = currentUserId ? msg.senderId === currentUserId : false;
            const isDeleted = Boolean(msg.isDeleted || msg.deletedForEveryone);

            return (
              <div
                key={msg.id}
                id={`msg-${msg.id}`}
                className={`flex group ${isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`relative max-w-[min(75%,20rem)] ${isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
                  {!isOwn && chatType === 'group' && (
                    <span className="text-xs text-bn-muted mb-1 ml-2">{msg.senderName}</span>
                  )}

                  <div className="relative flex items-start gap-1">
                    <div className={cnBubble(isOwn, isDeleted)}>
                      {!isDeleted && msg.replyTo && (
                        <ReplyQuote reply={msg.replyTo} isOwn={isOwn} />
                      )}
                      {!isDeleted && msg.sharedPost && (
                        <div className="mb-2">
                          <SharedPostCard post={msg.sharedPost} compact />
                        </div>
                      )}
                      {!isDeleted &&
                        msg.content &&
                        msg.content !== 'Shared a post' &&
                        (() => {
                          const forwarded = parseAnyForwarded(msg.content);
                          if (forwarded) {
                            return (
                              <ForwardQuote from={forwarded.from} text={forwarded.text} isOwn={isOwn} />
                            );
                          }
                          return <MessageBody content={msg.content} isOwn={isOwn} />;
                        })()}
                      {!isDeleted && msg.editedAt && (
                        <p className={`text-[10px] mt-1 ${isOwn ? 'text-white/70' : 'text-bn-muted'}`}>
                          edited
                        </p>
                      )}
                      {isDeleted && (
                        <p className="text-sm whitespace-pre-wrap break-words">
                          <span className="italic opacity-70">This message was deleted</span>
                        </p>
                      )}
                      {!isDeleted && !msg.sharedPost && msg.content === 'Shared a post' && (
                        <p className="text-sm italic opacity-80">Shared a post</p>
                      )}
                    </div>

                    <button
                      type="button"
                      data-chat-menu-trigger
                      onClick={() =>
                        setActiveMessageMenu((cur) => (cur === msg.id ? null : msg.id))
                      }
                      className={cn(
                        'p-1.5 rounded-lg text-bn-muted hover:text-bn-primary hover:bg-[#F5F1EB] border border-transparent hover:border-bn-border transition-colors touch-manipulation shrink-0',
                        activeMessageMenu === msg.id && 'text-bn-primary bg-[#F5F1EB] border-bn-border'
                      )}
                      aria-label="Message options"
                    >
                      <MoreVertical size={14} />
                    </button>

                    {activeMessageMenu === msg.id && (
                      <div
                        data-chat-menu-trigger
                        className={cn(
                          cn(ui.menuDropdown, 'top-full mt-1 w-48'),
                          isOwn ? 'right-0' : 'left-0'
                        )}
                      >
                        {!isDeleted && msg.content && (
                          <button
                            type="button"
                            data-chat-menu-trigger
                            onClick={() => void copyMessageText(msg)}
                            className="w-full flex items-center gap-2 px-3 py-2.5 text-sm hover:bg-bn-surface text-left touch-manipulation"
                          >
                            <Copy size={14} />
                            {copiedMessageId === msg.id ? 'Copied' : 'Copy'}
                          </button>
                        )}
                        {!isDeleted && msg.content && !msg.sharedPost && (
                          <button
                            type="button"
                            data-chat-menu-trigger
                            onClick={() => startReply(msg)}
                            className="w-full flex items-center gap-2 px-3 py-2.5 text-sm hover:bg-bn-surface text-left touch-manipulation"
                          >
                            <Reply size={14} />
                            Reply
                          </button>
                        )}
                        {!isDeleted && msg.content && (
                          <button
                            type="button"
                            data-chat-menu-trigger
                            onClick={() => {
                              setActiveMessageMenu(null);
                              setForwardMessage(msg);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2.5 text-sm hover:bg-bn-surface text-left touch-manipulation"
                          >
                            <Forward size={14} />
                            Forward
                          </button>
                        )}
                        {isOwn && !isDeleted && !msg.sharedPost && (
                          <button
                            type="button"
                            data-chat-menu-trigger
                            onClick={() => startEdit(msg)}
                            className="w-full flex items-center gap-2 px-3 py-2.5 text-sm hover:bg-bn-surface text-left touch-manipulation"
                          >
                            <Pencil size={14} />
                            Edit
                          </button>
                        )}
                        <button
                          type="button"
                          data-chat-menu-trigger
                          onClick={() => void deleteForMe(msg.id)}
                          className="w-full flex items-center gap-2 px-3 py-2.5 text-sm hover:bg-bn-surface text-left touch-manipulation"
                        >
                          <Trash2 size={14} />
                          Delete for me
                        </button>
                        {isOwn && !isDeleted && (
                          <button
                            type="button"
                            data-chat-menu-trigger
                            onClick={() => void deleteForEveryone(msg.id)}
                            className="w-full flex items-center gap-2 px-3 py-2.5 text-sm hover:bg-bn-surface text-left text-red-600 touch-manipulation"
                          >
                            <Trash2 size={14} />
                            Delete for everyone
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  <div
                    className={`flex items-center gap-1 mt-1 text-xs text-bn-muted ${
                      isOwn ? 'justify-end mr-1' : 'justify-start ml-1'
                    }`}
                  >
                    <span>{formatRelativeTime(msg.createdAt)}</span>
                    {isOwn && msg.isRead && <span className="text-blue-500">✓✓</span>}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-bn-border/70 bg-white shrink-0">
        {(replyTo || editingMessageId) && (
          <div className="mb-2 flex items-start justify-between gap-2 rounded-xl bg-bn-surface/80 border border-bn-border border-l-4 border-l-bn-primary px-3 py-2 animate-in fade-in slide-in-from-bottom-1 duration-200">
            <div className="min-w-0">
              <p className="text-xs font-medium text-bn-primary">
                {editingMessageId ? 'Editing message' : `Replying to ${replyTo?.senderName}`}
              </p>
              {!editingMessageId && replyTo?.content && (
                <p className="text-xs text-bn-muted line-clamp-2 mt-0.5">{replyTo.content}</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => {
                setReplyTo(null);
                setEditingMessageId(null);
                setInputValue('');
              }}
              className="text-bn-muted hover:text-bn-ink"
              aria-label="Cancel"
            >
              <X size={16} />
            </button>
          </div>
        )}
        <div className="flex gap-2 items-end">
          <EmojiQuickPicker
            open={showEmoji}
            onToggle={() => setShowEmoji((value) => !value)}
            onSelect={insertEmoji}
          />
          <textarea
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={editingMessageId ? 'Edit your message…' : 'Type a message…'}
            rows={1}
            className={`${ui.input} resize-none max-h-32 py-2.5`}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = 'auto';
              target.style.height = `${Math.min(target.scrollHeight, 128)}px`;
            }}
          />
          <button
            type="button"
            onClick={() => void sendMessage()}
            disabled={!inputValue.trim() || isSending}
            className="p-2.5 bg-bn-primary text-white rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {isSending ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
          </button>
        </div>
      </div>

      <ForwardMessageModal
        message={forwardMessage}
        excludeChatId={chatId}
        isOpen={Boolean(forwardMessage)}
        onClose={() => setForwardMessage(null)}
      />

      <GroupManageModal
        isOpen={showGroupManage}
        chatId={chatId}
        groupName={chatName}
        isAdmin={groupAdmin}
        onClose={() => setShowGroupManage(false)}
        onUpdated={() => {
          onRefreshMeta?.();
          onMessageSent?.();
        }}
        onLeftOrDeleted={() => onChatRemoved?.()}
      />
    </div>
  );
}

function cnBubble(isOwn: boolean, isDeleted: boolean) {
  const base = 'px-3.5 py-2 rounded-2xl shadow-sm';
  if (isDeleted) {
    return `${base} bg-bn-surface/80 text-bn-muted border border-dashed border-bn-border`;
  }
  if (isOwn) {
    return `${base} bg-bn-primary text-white rounded-br-md`;
  }
  return `${base} bg-white text-bn-ink border border-bn-border/60 rounded-bl-md`;
}

function cn(...parts: (string | false | undefined)[]) {
  return parts.filter(Boolean).join(' ');
}

const URL_SPLIT = /(https?:\/\/[^\s]+)/;

function isHttpUrl(part: string) {
  return /^https?:\/\//i.test(part);
}

function ReplyQuote({
  reply,
  isOwn,
}: {
  reply: NonNullable<ChatMessage['replyTo']>;
  isOwn: boolean;
}) {
  return (
    <button
      type="button"
      className={cn(
        'mb-2 w-full text-left rounded-lg border-l-[3px] px-2.5 py-1.5 text-xs transition-opacity hover:opacity-90',
        isOwn ? 'border-white/90 bg-black/10' : 'border-[#B85C38] bg-[#F5F1EB]/90'
      )}
      onClick={() => {
        const el = document.getElementById(`msg-${reply.id}`);
        el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }}
    >
      <p className={cn('font-semibold truncate text-[11px]', isOwn ? 'text-white' : 'text-[#B85C38]')}>
        {reply.senderName}
      </p>
      <p className={cn('line-clamp-2 mt-0.5', isOwn ? 'text-white/85' : 'text-[#4A5568]')}>
        {reply.isDeleted ? 'Message deleted' : reply.content || '…'}
      </p>
    </button>
  );
}

function ForwardQuote({
  from,
  text,
  isOwn,
}: {
  from: string;
  text: string;
  isOwn: boolean;
}) {
  return (
    <div
      className={cn(
        'mb-2 rounded-lg border-l-[3px] px-2.5 py-1.5 text-xs',
        isOwn ? 'border-white/70 bg-black/10' : 'border-[#2C3E50]/40 bg-[#F5F1EB]'
      )}
    >
      <p className={cn('text-[10px] uppercase tracking-wide font-medium', isOwn ? 'text-white/75' : 'text-bn-muted')}>
        Forwarded
      </p>
      <p className={cn('font-semibold truncate mt-0.5', isOwn ? 'text-white' : 'text-[#2C3E50]')}>
        {from}
      </p>
      {text.trim() ? (
        <p className={cn('line-clamp-3 mt-0.5', isOwn ? 'text-white/85' : 'text-[#4A5568]')}>
          {text}
        </p>
      ) : null}
    </div>
  );
}

function MessageBody({ content, isOwn }: { content: string; isOwn: boolean }) {
  const parts = content.split(URL_SPLIT);
  return (
    <p className="text-sm whitespace-pre-wrap break-words">
      {parts.map((part, i) =>
        isHttpUrl(part) ? (
          <a
            key={`${i}-${part.slice(0, 12)}`}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className={`underline break-all ${isOwn ? 'text-white/95' : 'text-bn-primary'}`}
          >
            {part}
          </a>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </p>
  );
}
