'use client';

import { useAuthStore } from '@/stores/authStore';
import Link from 'next/link';
import { BookOpen, Users, MessageCircle, TrendingUp, Award, Clock, Library, Heart, Store, ShoppingCart } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuthStore();

  const stats = {
    reader: [
      { label: 'Books Read', value: '12', icon: BookOpen, color: '#2C3E50', change: '+3 this month' },
      { label: 'Reading Streak', value: '47', icon: Award, color: '#B85C38', change: 'days' },
      { label: 'Hours Spent', value: '86', icon: Clock, color: '#8E735B', change: 'this year' },
      { label: 'Following', value: '23', icon: Users, color: '#2D6A4F', change: '+5 new' },
    ],
    author: [
      { label: 'Total Sales', value: '1,247', icon: TrendingUp, color: '#2C3E50', change: '+23% this month' },
      { label: 'Books Uploaded', value: '4', icon: BookOpen, color: '#B85C38', change: '2 published' },
      { label: 'Reviews', value: '89', icon: Heart, color: '#8E735B', change: '4.8 avg rating' },
      { label: 'Followers', value: '456', icon: Users, color: '#2D6A4F', change: '+12 this week' },
    ],
    publisher: [
      { label: 'Total Revenue', value: '45.2K', icon: TrendingUp, color: '#2C3E50', change: 'ETB' },
      { label: 'Catalog Size', value: '28', icon: Library, color: '#B85C38', change: 'books' },
      { label: 'Authors', value: '12', icon: Users, color: '#8E735B', change: 'active' },
      { label: 'Monthly Sales', value: '3.2K', icon: Award, color: '#2D6A4F', change: 'units' },
    ],
  };

  const userRole = user?.role === 'author' ? 'author' : user?.role === 'publisher' ? 'publisher' : 'reader';
  const userStats = stats[userRole as keyof typeof stats] || stats.reader;

  const quickActions = {
    reader: [
      { label: 'Browse Marketplace', href: '/market', icon: Store },
      { label: 'My Library', href: '/library', icon: BookOpen },
      { label: 'Shopping Cart', href: '/cart', icon: ShoppingCart },
      { label: 'View Community', href: '/community', icon: Users },
    ],
    author: [
      { label: 'Upload New Book', href: '/studio/upload', icon: BookOpen },
      { label: 'View Analytics', href: '/studio/analytics', icon: TrendingUp },
      { label: 'Browse Marketplace', href: '/market', icon: Store },
      { label: 'Withdraw Earnings', href: '/studio/earnings', icon: Award },
    ],
    publisher: [
      { label: 'Upload Book', href: '/studio/upload', icon: BookOpen },
      { label: 'View Reports', href: '/studio/analytics', icon: TrendingUp },
      { label: 'Browse Marketplace', href: '/market', icon: Store },
      { label: 'Withdraw Funds', href: '/studio/earnings', icon: Award },
    ],
  };

  const actions = quickActions[userRole as keyof typeof quickActions] || quickActions.reader;

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#1A2A3A]">
          Welcome back, {user?.name?.split(' ')[0] || user?.role} 👋
        </h1>
        <p className="text-[#4A5568] mt-1">
          {userRole === 'reader' && "Ready to continue your reading journey?"}
          {userRole === 'author' && "Your creative dashboard is ready"}
          {userRole === 'publisher' && "Manage your publishing empire"}
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

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-[#1A2A3A] mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {actions.map((action, idx) => (
            <Link
              key={idx}
              href={action.href}
              className="flex items-center gap-3 p-4 bg-white rounded-xl border border-[#E8E2D9] hover:border-[#B85C38]/30 hover:shadow-md transition-all group"
            >
              <action.icon size={20} className="text-[#4A5568] group-hover:text-[#B85C38]" />
              <span className="text-sm font-medium text-[#1A2A3A] group-hover:text-[#B85C38]">
                {action.label}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Books */}
        <div className="bg-white rounded-xl border border-[#E8E2D9] p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-[#1A2A3A]">Continue Reading</h3>
            <Link href="/library" className="text-sm text-[#B85C38] hover:text-[#8E735B]">View All →</Link>
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg hover:bg-[#FDFBF7] transition-colors">
                <div className="w-10 h-12 bg-[#2C3E50]/10 rounded-md"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-[#1A2A3A]">The Midnight Library</p>
                  <p className="text-xs text-[#4A5568]">65% completed</p>
                </div>
                <button className="text-sm text-[#B85C38] hover:text-[#8E735B]">Continue →</button>
              </div>
            ))}
          </div>
        </div>

        {/* Community Feed Preview */}
        <div className="bg-white rounded-xl border border-[#E8E2D9] p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-[#1A2A3A]">Community Feed</h3>
            <Link href="/community" className="text-sm text-[#B85C38] hover:text-[#8E735B]">View All →</Link>
          </div>
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-[#2C3E50]/20 flex-shrink-0 flex items-center justify-center text-[#2C3E50] text-sm font-medium">
                  JD
                </div>
                <div>
                  <p className="text-sm">
                    <span className="font-semibold text-[#1A2A3A]">Jane Doe</span>
                    <span className="text-[#4A5568] ml-2">shared a reflection on "Atomic Habits"</span>
                  </p>
                  <p className="text-xs text-[#4A5568] mt-1">2 hours ago</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}