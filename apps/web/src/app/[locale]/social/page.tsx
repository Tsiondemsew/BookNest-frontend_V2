'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAuthStore } from '@/stores/authStore';
import { AppShell } from '@/components/AppShell';
import { Heart, MessageCircle, Share2, MoreHorizontal } from 'lucide-react';

const MOCK_POSTS = [
  {
    id: '1',
    author: 'Sarah_Chen',
    avatar: 'SC',
    content: 'Just finished "The Midnight Library" - absolutely mind-blowing! The way it explores parallel lives and choices is just... wow. Highly recommend! 📚✨',
    book: 'The Midnight Library',
    bookAuthor: 'Matt Haig',
    timestamp: '2 hours ago',
    likes: 234,
    comments: 12,
    shares: 8,
    liked: false,
  },
  {
    id: '2',
    author: 'Mike_Reader',
    avatar: 'MR',
    content: 'Currently on chapter 15 of "Project Hail Mary". Cannot put it down! Weir never disappoints with his science fiction. 🚀',
    book: 'Project Hail Mary',
    bookAuthor: 'Andy Weir',
    timestamp: '5 hours ago',
    likes: 156,
    comments: 8,
    shares: 5,
    liked: false,
  },
  {
    id: '3',
    author: 'Emma_Bookworm',
    avatar: 'EB',
    content: '"Atomic Habits" changed my perspective on building lasting change. Small incremental improvements really do compound! Great read for anyone looking to improve themselves.',
    book: 'Atomic Habits',
    bookAuthor: 'James Clear',
    timestamp: '1 day ago',
    likes: 589,
    comments: 34,
    shares: 120,
    liked: false,
  },
];

export default function SocialPage() {
  const params = useParams<{ locale: string }>();
  const locale = params?.locale ?? 'en';
  const t = useTranslations();
  const user = useAuthStore((s) => s.user);
  const [posts, setPosts] = useState(MOCK_POSTS);

  const handleLike = (postId: string) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, liked: !post.liked, likes: post.liked ? post.likes - 1 : post.likes + 1 }
        : post
    ));
  };

  return (
    <AppShell currentTab="social">
      <div className="bg-background min-h-screen">
        {/* Header */}
        <div className="bg-card border-b border-border sticky top-0 z-20">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              Community Feed
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Discover what others are reading and share your thoughts
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          {/* Create Post */}
          <div className="bg-white rounded-lg border border-border p-6">
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-semibold flex-shrink-0">
                {user?.displayName?.charAt(0) || 'U'}
              </div>
              <div className="flex-1">
                <textarea
                  placeholder="Share your thoughts on a book you're reading..."
                  className="w-full p-3 rounded-lg border border-border bg-muted placeholder-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-accent text-sm"
                  rows={3}
                />
                <div className="flex justify-end mt-3 gap-2">
                  <button className="px-4 py-2 rounded-lg border border-border text-foreground font-medium hover:bg-muted transition text-sm">
                    Cancel
                  </button>
                  <button className="px-6 py-2 rounded-lg bg-accent text-accent-foreground font-medium hover:opacity-90 transition text-sm">
                    Post
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Posts Feed */}
          {posts.map((post) => (
            <div key={post.id} className="bg-white rounded-lg border border-border p-6 hover:shadow-md transition">
              {/* Post Header */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex gap-3 flex-1">
                  <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-semibold text-sm flex-shrink-0">
                    {post.avatar}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">{post.author}</p>
                    <p className="text-xs text-muted-foreground">{post.timestamp}</p>
                  </div>
                </div>
                <button className="p-2 rounded-lg hover:bg-muted transition">
                  <MoreHorizontal className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>

              {/* Post Content */}
              <p className="text-foreground mb-4 text-sm leading-relaxed">{post.content}</p>

              {/* Book Reference */}
              {post.book && (
                <div className="bg-accent/5 border border-accent/20 rounded-lg p-4 mb-4">
                  <p className="text-xs text-muted-foreground font-medium">Reading</p>
                  <h4 className="font-serif-title font-semibold text-foreground text-sm md:text-base">{post.book}</h4>
                  <p className="text-xs text-muted-foreground">{post.bookAuthor}</p>
                </div>
              )}

              {/* Post Actions */}
              <div className="flex items-center justify-between text-muted-foreground text-xs border-t border-border pt-4">
                <button
                  onClick={() => handleLike(post.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition ${
                    post.liked
                      ? 'text-accent bg-accent/10'
                      : 'hover:bg-muted'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${post.liked ? 'fill-accent' : ''}`} />
                  <span className="font-medium">{post.likes}</span>
                </button>
                <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-muted transition">
                  <MessageCircle className="w-4 h-4" />
                  <span className="font-medium">{post.comments}</span>
                </button>
                <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-muted transition">
                  <Share2 className="w-4 h-4" />
                  <span className="font-medium">{post.shares}</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <footer className="bg-foreground text-foreground/50 border-t border-border mt-12">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-sm">
            <p>&copy; 2024 BookNest. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </AppShell>
  );
}
