'use client';

import {
  Search,
  Bell,
  History,
  DollarSign,
  Users,
  BookOpen,
  AlertTriangle,
  TrendingUp,
} from 'lucide-react';

import {
  RevenueChart,
  UserChart,
  BookChart,
 
} from '@/components';
// import { RecentApprovals } from '@/components';
import { AnalyticsCard } from '@/components/AnalyticsCard';
import { useDashboardData } from '@/hooks/useDashboardData';

export function DashboardContent() {
  const { stats, revenue, users, books, loading, error } =
    useDashboardData();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F5F7FA]">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-zinc-300 border-t-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F5F7FA]">
        <div className="rounded-3xl border border-red-200 bg-red-50 px-8 py-6 shadow-sm">
          <p className="text-lg font-semibold text-red-700">
            Error loading dashboard
          </p>

          <p className="mt-2 text-sm text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      {/* Top Header */}
      <div className="border-b border-zinc-200 bg-white px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Search */}
          <div className="relative w-full max-w-md">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400"
              size={18}
            />

            <input
              type="text"
              placeholder="Search system resources..."
              className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 py-3 pl-12 pr-4 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          {/* Right Side */}
          <div className="ml-6 flex items-center gap-5">
            {/* Notification */}
            <button className="relative rounded-xl p-2 transition hover:bg-zinc-100">
              <Bell size={20} className="text-zinc-600" />

              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500"></span>
            </button>

            {/* History */}
            <button className="rounded-xl p-2 transition hover:bg-zinc-100">
              <History size={20} className="text-zinc-600" />
            </button>

            {/* Divider */}
            <div className="h-10 w-px bg-zinc-200"></div>

            {/* Admin Profile */}
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-semibold text-zinc-900">
                  Admin User
                </p>

                <p className="text-xs text-zinc-500">
                  Super Administrator
                </p>
              </div>

              <img
                src="https://i.pravatar.cc/100"
                alt="Admin"
                className="h-12 w-12 rounded-full border-2 border-white shadow-md"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Dashboard */}
      <div className="p-8">
        {/* Title */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-5xl font-bold tracking-tight text-indigo-900">
              System Overview
            </h1>

            <p className="mt-2 text-lg text-zinc-500">
              Real-time platform performance and analytics
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <button className="rounded-2xl border border-zinc-300 bg-white px-5 py-3 text-sm font-medium text-zinc-700 shadow-sm transition hover:bg-zinc-50">
              Last 30 Days
            </button>

            <button className="rounded-2xl bg-indigo-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-800">
              Export Report
            </button>
          </div>
        </div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          <AnalyticsCard
            title="Monthly Revenue"
            value={`$${stats?.totalRevenue?.toLocaleString() || 0}`}
            icon={
              <DollarSign className="h-7 w-7 text-indigo-700" />
            }
          />

          <AnalyticsCard
            title="System Health"
            value="99.98%"
            icon={
              <TrendingUp className="h-7 w-7 text-green-600" />
            }
          />

          <AnalyticsCard
            title="Active Users"
            value={stats?.totalUsers?.toLocaleString() || 0}
            icon={<Users className="h-7 w-7 text-zinc-700" />}
          />

          <AnalyticsCard
            title="Pending Reports"
            value={stats?.pendingReports || 0}
            icon={
              <AlertTriangle className="h-7 w-7 text-red-600" />
            }
          />
        </div>

        {/* Charts Section */}
        <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-3">
          {/* Main Chart */}
          <div className="xl:col-span-2 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-zinc-900">
                Platform Analytics
              </h2>

              <div className="flex items-center gap-5 text-sm text-zinc-500">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-indigo-700"></div>
                  Revenue
                </div>

                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-indigo-200"></div>
                  Users
                </div>
              </div>
            </div>

            {revenue && <RevenueChart data={revenue} />}
          </div>

          {/* Financial Summary */}
          <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-semibold text-zinc-900">
              Financial Summary
            </h2>

            <div className="mt-8 space-y-7">
              <SummaryItem
                title="Revenue"
                amount={`$${stats?.totalRevenue?.toLocaleString() || 0}`}
                width="85%"
              />

              <SummaryItem
                title="Readers"
                amount={`${stats?.totalReaders || 0}`}
                width="65%"
              />

              <SummaryItem
                title="Authors"
                amount={`${stats?.totalAuthors || 0}`}
                width="45%"
              />
            </div>

            {/* Top Performer */}
            <div className="mt-10 border-t border-zinc-200 pt-6">
              <p className="text-xs font-semibold tracking-wider text-zinc-400">
                TOP CATEGORY
              </p>

              <div className="mt-4 flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100">
                  <BookOpen className="text-indigo-700" />
                </div>

                <div>
                  <p className="font-semibold text-zinc-900">
                    Most Popular Genre
                  </p>

                  <p className="text-sm text-green-600">
                    +18% growth
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Charts */}
         <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-2">
          <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-xl font-semibold text-zinc-900">
              User Growth
            </h2>

            {users && <UserChart data={users} />}
          </div>

          <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-xl font-semibold text-zinc-900">
              Books by Genre
            </h2>

            {books && <BookChart data={books} />}
          </div>
        </div> 
      </div>
    </div>
  );
}

/* Financial Summary Item */
function SummaryItem({
  title,
  amount,
  width,
}: {
  title: string;
  amount: string;
  width: string;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm font-medium text-zinc-600">
          {title}
        </p>

        <p className="text-sm font-semibold text-zinc-900">
          {amount}
        </p>
      </div>

      <div className="h-3 overflow-hidden rounded-full bg-zinc-100">
        <div
          className="h-full rounded-full bg-indigo-700"
          style={{ width }}
        ></div>
      </div>

    </div>
    
  );
//   <div className="mt-8">
//   <RecentApprovals />
// </div>
}
