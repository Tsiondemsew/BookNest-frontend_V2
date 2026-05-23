'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Phone, Video, MoreVertical, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRealtimeChat } from '@/hooks/useRealtimeChat';
import { chatApi } from '@/lib/api/chat';
import { formatRelativeTime } from '@/features/community/utils/timeFormat';
import type { ChatMessage } from '@repo/types';

interface ChatWindowProps {
  chatId: string;
  chatName?: string;
  chatType?: 'direct' | 'group';
  onBack?: () => void;
}

export function ChatWindow({ chatId, chatName, chatType = 'direct', onBack }: ChatWindowProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  
  const { newMessages, clearNewMessages, isConnected } = useRealtimeChat(chatId);

  // Load initial messages
  useEffect(() => {
    const loadMessages = async () => {
      setIsLoading(true);
      try {
        const response = await chatApi.getMessages(chatId);
        setMessages(response.data.messages || []);
      } catch (error) {
        console.error('Failed to load messages:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (chatId) {
      loadMessages();
    }
  }, [chatId]);

  // Add realtime messages to state
  useEffect(() => {
    if (newMessages && newMessages.length > 0) {
      const formattedNewMessages: ChatMessage[] = newMessages.map((msg: any) => ({
        id: msg.id,
        content: msg.content,
        senderId: msg.sender_id,
        senderName: msg.users?.email?.split('@')[0] || 'User',
        senderAvatar: msg.users?.avatar_url,
        isRead: msg.is_read,
        createdAt: msg.created_at,
      }));
      setMessages(prev => [...prev, ...formattedNewMessages]);
      clearNewMessages();
    }
  }, [newMessages, clearNewMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!inputValue.trim() || isSending) return;
    
    const tempId = `temp-${Date.now()}`;
    const newMessage: ChatMessage = {
      id: tempId,
      content: inputValue.trim(),
      senderId: 'currentUser',
      senderName: 'You',
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    
    setMessages(prev => [...prev, newMessage]);
    const messageContent = inputValue.trim();
    setInputValue('');
    setIsSending(true);

    try {
      const response = await chatApi.sendMessage(chatId, messageContent);
      const realMessage = response.data;
      setMessages(prev => 
        prev.map(msg => msg.id === tempId ? {
          id: realMessage.id,
          content: realMessage.content,
          senderId: realMessage.senderId,
          senderName: 'You',
          isRead: realMessage.isRead,
          createdAt: realMessage.createdAt,
        } : msg)
      );
    } catch (error) {
      console.error('Failed to send message:', error);
      setMessages(prev => prev.filter(msg => msg.id !== tempId));
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 size={32} className="animate-spin text-[#B85C38]" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-xl border border-[#E8E2D9] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#E8E2D9]">
        <div className="flex items-center gap-3">
          {onBack && (
            <button onClick={onBack} className="p-1 hover:bg-[#F5F1EB] rounded-lg">
              <ArrowLeft size={20} />
            </button>
          )}
          <div>
            <h2 className="font-semibold text-[#1A2A3A]">{chatName || 'Chat'}</h2>
            <div className="flex items-center gap-2">
              {isConnected ? (
                <span className="text-xs text-green-500">● Connected</span>
              ) : (
                <span className="text-xs text-yellow-500">● Connecting...</span>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          {chatType === 'direct' && (
            <>
              <button className="p-2 text-[#4A5568] hover:text-[#B85C38] hover:bg-[#F5F1EB] rounded-lg">
                <Phone size={18} />
              </button>
              <button className="p-2 text-[#4A5568] hover:text-[#B85C38] hover:bg-[#F5F1EB] rounded-lg">
                <Video size={18} />
              </button>
            </>
          )}
          <button className="p-2 text-[#4A5568] hover:text-[#B85C38] hover:bg-[#F5F1EB] rounded-lg">
            <MoreVertical size={18} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <p className="text-[#4A5568]">No messages yet</p>
              <p className="text-sm text-[#4A5568]">Start the conversation!</p>
            </div>
          </div>
        ) : (
          messages.map((msg) => {
            const isOwn = msg.senderId === 'currentUser';
            return (
              <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[70%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
                  {!isOwn && (
                    <span className="text-xs text-[#4A5568] mb-1 ml-2">{msg.senderName}</span>
                  )}
                  <div
                    className={`px-3 py-2 rounded-2xl ${
                      isOwn
                        ? 'bg-[#B85C38] text-white rounded-br-sm'
                        : 'bg-[#F5F1EB] text-[#1A2A3A] rounded-bl-sm'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                  </div>
                  <div className={`flex items-center gap-1 mt-1 text-xs text-[#4A5568] ${isOwn ? 'justify-end' : 'justify-start'}`}>
                    <span>{formatRelativeTime(msg.createdAt)}</span>
                    {isOwn && msg.isRead && <span className="text-blue-500">✓✓</span>}
                    {isOwn && !msg.isRead && <span className="text-[#4A5568]">✓</span>}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-[#E8E2D9]">
        <div className="flex gap-2 items-end">
          <textarea
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            rows={1}
            className="flex-1 px-3 py-2 border border-[#E8E2D9] rounded-lg focus:outline-none focus:border-[#B85C38] focus:ring-1 focus:ring-[#B85C38] resize-none max-h-32"
            style={{ height: 'auto' }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = 'auto';
              target.style.height = Math.min(target.scrollHeight, 128) + 'px';
            }}
          />
          <button
            onClick={sendMessage}
            disabled={!inputValue.trim() || isSending}
            className="p-2 bg-[#B85C38] text-white rounded-lg hover:bg-[#8E735B] transition-colors disabled:opacity-50"
          >
            {isSending ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
          </button>
        </div>
      </div>
    </div>
  );
}