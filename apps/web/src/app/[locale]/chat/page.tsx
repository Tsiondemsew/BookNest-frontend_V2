'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useAuthStore } from '@/stores/authStore';
import Link from 'next/link';

interface Message {
  id: string;
  author: string;
  avatar: string;
  text: string;
  timestamp: string;
  isOwn: boolean;
}

interface Conversation {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  unread: number;
  members: number;
}

const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: '1',
    name: 'Fiction Lovers',
    avatar: '📚',
    lastMessage: 'Has anyone finished The Great Gatsby?',
    unread: 2,
    members: 145,
  },
  {
    id: '2',
    name: 'Sci-Fi Discussion',
    avatar: '🚀',
    lastMessage: 'What do you think about the latest sci-fi releases?',
    unread: 0,
    members: 98,
  },
  {
    id: '3',
    name: 'Book Recommendations',
    avatar: '💡',
    lastMessage: 'Looking for a good mystery novel',
    unread: 3,
    members: 267,
  },
];

const MOCK_MESSAGES: Message[] = [
  {
    id: '1',
    author: 'Sarah',
    avatar: '👩',
    text: 'Has anyone finished The Great Gatsby yet?',
    timestamp: '10:30 AM',
    isOwn: false,
  },
  {
    id: '2',
    author: 'You',
    avatar: '👤',
    text: 'I just finished it! What an incredible story.',
    timestamp: '10:32 AM',
    isOwn: true,
  },
  {
    id: '3',
    author: 'Mike',
    avatar: '👨',
    text: 'The prose is absolutely beautiful. Fitzgerald is a master.',
    timestamp: '10:35 AM',
    isOwn: false,
  },
  {
    id: '4',
    author: 'Emma',
    avatar: '👩‍🦰',
    text: 'I love how the narrative unfolds through Nick Carraway\'s perspective.',
    timestamp: '10:37 AM',
    isOwn: false,
  },
  {
    id: '5',
    author: 'You',
    avatar: '👤',
    text: 'Exactly! His observations add so much depth to the story.',
    timestamp: '10:40 AM',
    isOwn: true,
  },
];

export default function ChatPage() {
  const t = useTranslations();
  const params = useParams<{ locale: string }>();
  const locale = params?.locale ?? 'en';
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const [activeConversation, setActiveConversation] = useState<string>('1');
  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message: Message = {
      id: String(messages.length + 1),
      author: user?.displayName || 'You',
      avatar: '👤',
      text: newMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isOwn: true,
    };

    setMessages([...messages, message]);
    setNewMessage('');
  };

  const filteredConversations = MOCK_CONVERSATIONS.filter(
    (conv) =>
      searchQuery === '' || conv.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>{t('common.loading')}</p>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">BookNest Chat</h1>
            <nav className="flex gap-4">
              <Link href={`/${locale}/dashboard`} className="text-gray-600 hover:text-gray-900">
                {t('nav.discover')}
              </Link>
              <Link href={`/${locale}/profile`} className="text-gray-600 hover:text-gray-900">
                {t('nav.profile')}
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Chat Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Conversations Sidebar */}
        <div className="w-full md:w-80 bg-white border-r border-gray-200 flex flex-col">
          {/* Search */}
          <div className="p-4 border-b">
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Conversation List */}
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setActiveConversation(conv.id)}
                className={`w-full text-left px-4 py-3 border-b hover:bg-gray-50 transition ${
                  activeConversation === conv.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="text-2xl">{conv.avatar}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h3 className="font-semibold text-gray-900 truncate">{conv.name}</h3>
                      {conv.unread > 0 && (
                        <span className="ml-2 px-2 py-1 text-xs font-semibold bg-blue-600 text-white rounded-full">
                          {conv.unread}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 truncate">{conv.lastMessage}</p>
                    <p className="text-xs text-gray-500 mt-1">{conv.members} members</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat Window */}
        <div className="hidden md:flex flex-1 flex-col bg-white">
          {/* Active Conversation Header */}
          <div className="p-4 border-b bg-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="text-3xl">
                  {MOCK_CONVERSATIONS.find((c) => c.id === activeConversation)?.avatar}
                </div>
                <div>
                  <h2 className="font-semibold text-lg text-gray-900">
                    {MOCK_CONVERSATIONS.find((c) => c.id === activeConversation)?.name}
                  </h2>
                  <p className="text-sm text-gray-600">
                    {MOCK_CONVERSATIONS.find((c) => c.id === activeConversation)?.members} members
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`flex gap-2 max-w-xs ${msg.isOwn ? 'flex-row-reverse' : ''}`}
                >
                  <div className="text-2xl">{msg.avatar}</div>
                  <div>
                    {!msg.isOwn && (
                      <p className="text-xs text-gray-600 mb-1 font-semibold">{msg.author}</p>
                    )}
                    <div
                      className={`px-4 py-2 rounded-lg ${
                        msg.isOwn
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-900'
                      }`}
                    >
                      {msg.text}
                    </div>
                    <p className="text-xs text-gray-500 mt-1 text-right">{msg.timestamp}</p>
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="p-4 border-t bg-white">
            <div className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Type a message..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleSendMessage}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                Send
              </button>
            </div>
          </div>
        </div>

        {/* Mobile View Message */}
        <div className="md:hidden flex-1 flex items-center justify-center bg-white">
          <div className="text-center">
            <div className="text-4xl mb-4">💬</div>
            <p className="text-gray-600">Select a conversation to start chatting</p>
          </div>
        </div>
      </div>
    </div>
  );
}
