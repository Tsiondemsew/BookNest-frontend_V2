'use client';

import { useAuthStore } from '@/stores/authStore';
import { useSalesAnalytics } from '@/features/analytics/hooks/useAnalytics';
import { MyBooksList } from '@/features/studio/components/MyBooksList';
import Link from 'next/link';
import { Plus, BookOpen, DollarSign, TrendingUp, Clock, AlertCircle } from 'lucide-react';

export default function StudioDashboard() {
  const { user, isAuthenticated } = useAuthStore();
  const { data: analytics, isLoading: analyticsLoading } = useSalesAnalytics();

  if (!isAuthenticated || (user?.role !== 'author' && user?.role !== 'publisher')) {
    return (
      <div className="text-center py-16">
        <p className="text-red-500">Access denied. Author or publisher access required.</p>
      </div>
    );
  }

  const summary = analytics?.summary;
  const totalBooks = summary?.total_books ?? 0;
  const totalCopiesSold = summary?.total_copies_sold ?? 0;
  const totalRevenue = summary?.total_revenue ?? 0;
  const pendingApproval = summary?.pending_approval ?? 0;
  const monthlyEarnings = summary?.monthly_earnings ?? 0;

  const stats = [
    {
      label: 'Total Books',
      value: analyticsLoading ? '...' : totalBooks,
      icon: BookOpen,
      color: '#2C3E50',
      bgColor: '#2C3E5010',
    },
    {
      label: 'Digital Sales',
      value: analyticsLoading ? '...' : totalCopiesSold,
      icon: TrendingUp,
      color: '#2D6A4F',
      bgColor: '#2D6A4F10',
    },
    {
      label: 'Total Revenue',
      value: analyticsLoading ? '...' : `${totalRevenue} ETB`,
      icon: DollarSign,
      color: '#B85C38',
      bgColor: '#B85C3810',
    },
    {
      label: 'This Month',
      value: analyticsLoading ? '...' : `${monthlyEarnings} ETB`,
      icon: Clock,
      color: '#8E735B',
      bgColor: '#8E735B10',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1A2A3A]">Studio Dashboard</h1>
          <p className="text-[#4A5568] mt-1">
            Welcome back, {user?.publicName}
          </p>
        </div>
        <Link
          href="/studio/upload"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#B85C38] text-white rounded-lg font-medium hover:bg-[#8E735B] transition-colors shadow-sm"
        >
          <Plus size={18} />
          Upload New Book
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white rounded-xl border border-[#E8E2D9] p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg" style={{ backgroundColor: stat.bgColor }}>
                <stat.icon size={20} style={{ color: stat.color }} />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold text-[#1A2A3A]">{stat.value}</div>
              <div className="text-sm text-[#4A5568]">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Pending Approval Alert */}
      {pendingApproval > 0 && (
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
          <AlertCircle size={20} className="text-amber-600" />
          <div className="flex-1">
            <p className="text-amber-800 font-medium">
              You have {pendingApproval} book{pendingApproval !== 1 ? 's' : ''} pending admin approval
            </p>
            <p className="text-amber-700 text-sm">Books will appear in marketplace once approved.</p>
          </div>
        </div>
      )}

      {/* My Books Section */}
      <div>
        <h2 className="text-lg font-semibold text-[#1A2A3A] mb-4">Your Books</h2>
        <MyBooksList />
      </div>
    </div>
  );
}