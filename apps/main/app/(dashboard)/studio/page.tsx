'use client';

import { useAuthStore } from '@/stores/authStore';
import { useSalesAnalytics } from '@/features/analytics/hooks/useAnalytics';
import { MyBooksList } from '@/features/studio/components/MyBooksList';
import Link from 'next/link';
import { Plus, BookOpen, DollarSign, TrendingUp } from 'lucide-react';

export default function StudioDashboard() {
  const { user, isAuthenticated } = useAuthStore();
  const { data: analytics, isLoading: analyticsLoading } = useSalesAnalytics();

  if (!isAuthenticated || (user?.role !== 'author' && user?.role !== 'publisher')) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-red-500">Access denied. Author or publisher access required.</p>
      </div>
    );
  }

  const summary = analytics?.summary;
  const totalBooks = summary?.total_books ?? 0;
  const totalCopiesSold = summary?.total_copies_sold ?? 0;
  const totalRevenue = summary?.total_revenue ?? 0;
  const pendingApproval = summary?.pending_approval ?? 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold">Studio Dashboard</h1>
          <p className="text-gray-500">
            Welcome back, {user?.publicName}
          </p>
        </div>
        <Link
          href="/studio/upload"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Plus size={18} />
          Upload New Book
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Books</p>
              <p className="text-2xl font-bold">
                {analyticsLoading ? '...' : totalBooks}
              </p>
            </div>
            <BookOpen className="text-blue-500" size={32} />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Copies Sold</p>
              <p className="text-2xl font-bold">
                {analyticsLoading ? '...' : totalCopiesSold}
              </p>
            </div>
            <TrendingUp className="text-green-500" size={32} />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Revenue</p>
              <p className="text-2xl font-bold">
                {analyticsLoading ? '...' : `${totalRevenue} ETB`}
              </p>
            </div>
            <DollarSign className="text-yellow-500" size={32} />
          </div>
        </div>
      </div>

      {/* Pending Approval Alert */}
      {pendingApproval > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
          <p className="text-yellow-800">
            You have {pendingApproval} book{pendingApproval !== 1 ? 's' : ''} pending admin approval.
          </p>
        </div>
      )}

      {/* My Books List */}
      <MyBooksList />
    </div>
  );
}