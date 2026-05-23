'use client';

import { useAuthStore } from '@/stores/authStore';
import Link from 'next/link';
import { BookOpen, Users, MessageCircle, TrendingUp, Award, Clock, Library, Heart, Store, ShoppingCart, ArrowRight } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuthStore();

  // Mock community activity
  const communityActivity = [
    {
      id: 1,
      author: { name: 'Jane Author', username: 'janeauthor', role: 'author' },
      content: 'Just released my new book "The Midnight Library" - available now on BookNest!',
      timeAgo: '15 minutes ago',
      likes: 45,
      comments: 12,
    },
    {
      id: 2,
      author: { name: 'BookNest Publishers', username: 'booknestpub', role: 'publisher' },
      content: 'Weekly reading challenge: Read 100 pages this weekend and earn a special badge!',
      timeAgo: '2 hours ago',
      likes: 128,
      comments: 34,
    },
    {
      id: 3,
      author: { name: 'Sarah Reader', username: 'sarahreader', role: 'reader' },
      content: 'Just finished "Project Hail Mary" - 5 stars! Highly recommend to all sci-fi fans.',
      timeAgo: '5 hours ago',
      likes: 89,
      comments: 23,
    },
  ];

  const userRole = user?.role === 'author' ? 'author' : user?.role === 'publisher' ? 'publisher' : 'reader';

  const stats = {
    reader: [
      { label: 'Reading Streak', value: '12', icon: Award, color: '#B85C38', change: 'days' },
      { label: 'Books Completed', value: '8', icon: BookOpen, color: '#2C3E50', change: 'this year' },
      { label: 'Following', value: '23', icon: Users, color: '#2D6A4F', change: '+5 this month' },
      { label: 'Hours Read', value: '86', icon: Clock, color: '#8E735B', change: 'total' },
    ],
    author: [
      { label: 'Followers', value: '456', icon: Users, color: '#2D6A4F', change: '+12 this week' },
      { label: 'Books Sold', value: '1,247', icon: TrendingUp, color: '#2C3E50', change: '+23%' },
      { label: 'Reviews', value: '89', icon: Heart, color: '#B85C38', change: '4.8 avg' },
      { label: 'Earnings', value: '12.4K', icon: Award, color: '#8E735B', change: 'ETB' },
    ],
    publisher: [
      { label: 'Total Revenue', value: '45.2K', icon: TrendingUp, color: '#2C3E50', change: 'ETB' },
      { label: 'Catalog', value: '28', icon: Library, color: '#B85C38', change: 'books' },
      { label: 'Authors', value: '12', icon: Users, color: '#2D6A4F', change: 'active' },
      { label: 'Monthly Sales', value: '3.2K', icon: Award, color: '#8E735B', change: 'units' },
    ],
  };

  const userStats = stats[userRole as keyof typeof stats] || stats.reader;

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#1A2A3A]">
          Welcome back, {user?.publicName?.split(' ')[0] || user?.email?.split('@')[0] || 'Reader'} 👋
        </h1>
        <p className="text-[#4A5568] mt-1">
          {userRole === 'reader' && "Your reading journey continues. Join the conversation!"}
          {userRole === 'author' && "Connect with your readers and share your work"}
          {userRole === 'publisher' && "Engage with the community and grow your audience"}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {userStats.map((stat, idx) => (
          <div key={idx} className="bg-white rounded-xl border border-[#E8E2D9] p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg" style={{ backgroundColor: `${stat.color}10` }}>
                <stat.icon size={20} style={{ color: stat.color }} />
              </div>
              <span className="text-xs text-[#4A5568]">{stat.change}</span>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold text-[#1A2A3A]">{stat.value}</div>
              <div className="text-sm text-[#4A5568]">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Community Feed - PRIMARY SECTION */}
      <div className="bg-white rounded-xl border border-[#E8E2D9] overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E8E2D9]">
          <div className="flex items-center gap-2">
            <Users size={20} className="text-[#B85C38]" />
            <h2 className="font-semibold text-[#1A2A3A]">Community Feed</h2>
          </div>
          <Link href="/community" className="text-sm text-[#B85C38] hover:text-[#8E735B] flex items-center gap-1">
            View all <ArrowRight size={14} />
          </Link>
        </div>
        
        <div className="divide-y divide-[#E8E2D9]">
          {communityActivity.map((activity) => (
            <div key={activity.id} className="p-5 hover:bg-[#FDFBF7] transition-colors">
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2C3E50] to-[#B85C38] flex items-center justify-center text-white font-semibold flex-shrink-0">
                  {activity.author.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-[#1A2A3A]">{activity.author.name}</span>
                    <span className="text-xs px-1.5 py-0.5 rounded bg-[#F5F1EB] text-[#4A5568]">
                      {activity.author.role}
                    </span>
                    <span className="text-xs text-[#4A5568]">· {activity.timeAgo}</span>
                  </div>
                  <p className="text-[#1A2A3A] mt-2">{activity.content}</p>
                  <div className="flex items-center gap-4 mt-3">
                    <button className="flex items-center gap-1 text-sm text-[#4A5568] hover:text-[#B85C38] transition-colors">
                      <Heart size={16} /> {activity.likes}
                    </button>
                    <button className="flex items-center gap-1 text-sm text-[#4A5568] hover:text-[#B85C38] transition-colors">
                      <MessageCircle size={16} /> {activity.comments}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Continue Reading */}
        <div className="bg-white rounded-xl border border-[#E8E2D9] p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-[#1A2A3A]">Continue Reading</h3>
            <Link href="/library" className="text-sm text-[#B85C38] hover:text-[#8E735B]">View All →</Link>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-[#FDFBF7] transition-colors">
              <div className="w-10 h-12 bg-[#2C3E50]/10 rounded-md"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-[#1A2A3A]">The Midnight Library</p>
                <p className="text-xs text-[#4A5568]">65% completed</p>
              </div>
              <button className="text-sm text-[#B85C38] hover:text-[#8E735B]">Continue →</button>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-[#FDFBF7] transition-colors">
              <div className="w-10 h-12 bg-[#2C3E50]/10 rounded-md"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-[#1A2A3A]">Atomic Habits</p>
                <p className="text-xs text-[#4A5568]">32% completed</p>
              </div>
              <button className="text-sm text-[#B85C38] hover:text-[#8E735B]">Continue →</button>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl border border-[#E8E2D9] p-5">
          <h3 className="font-semibold text-[#1A2A3A] mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <Link href="/market" className="flex items-center gap-2 p-3 rounded-lg border border-[#E8E2D9] hover:border-[#B85C38]/30 hover:shadow-sm transition-all">
              <Store size={16} className="text-[#B85C38]" />
              <span className="text-sm">Marketplace</span>
            </Link>
            <Link href="/library" className="flex items-center gap-2 p-3 rounded-lg border border-[#E8E2D9] hover:border-[#B85C38]/30 hover:shadow-sm transition-all">
              <Library size={16} className="text-[#2C3E50]" />
              <span className="text-sm">My Library</span>
            </Link>
            {(userRole === 'author' || userRole === 'publisher') && (
              <Link href="/studio/upload" className="flex items-center gap-2 p-3 rounded-lg border border-[#E8E2D9] hover:border-[#B85C38]/30 hover:shadow-sm transition-all">
                <BookOpen size={16} className="text-[#2D6A4F]" />
                <span className="text-sm">Upload Book</span>
              </Link>
            )}
            <Link href="/messages" className="flex items-center gap-2 p-3 rounded-lg border border-[#E8E2D9] hover:border-[#B85C38]/30 hover:shadow-sm transition-all">
              <MessageCircle size={16} className="text-[#8E735B]" />
              <span className="text-sm">Messages</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}