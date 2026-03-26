'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useAuthStore } from '@/stores/authStore';
import Link from 'next/link';
import { BarChart3, Users, BookOpen, AlertCircle } from 'lucide-react';

const MOCK_METRICS = [
  { label: 'Total Users', value: '2,847', icon: Users, change: '+12%' },
  { label: 'Pending Books', value: '34', icon: BookOpen, change: '+8 today' },
  { label: 'Active Reports', value: '12', icon: AlertCircle, change: '3 critical' },
  { label: 'Daily Revenue', value: '$4,829', icon: BarChart3, change: '+5.2%' },
];

const MOCK_BOOKS = [
  { id: '1', title: 'The Midnight Library', author: 'Matt Haig', submitted: '2024-01-15' },
  { id: '2', title: 'Project Hail Mary', author: 'Andy Weir', submitted: '2024-01-14' },
  { id: '3', title: 'Atomic Habits', author: 'James Clear', submitted: '2024-01-13' },
];

const MOCK_MODERATION = [
  { id: '1', user: 'Sarah_Chen', post: 'This book is absolutely terrible and the author is...', reason: 'Harassment', timestamp: '2 hours ago' },
  { id: '2', user: 'Mike_Dev', post: 'Buy cheap books now! Click here for free PDFs!!!', reason: 'Spam', timestamp: '4 hours ago' },
  { id: '3', user: 'Jane_Reader', post: 'Contains explicit content and inappropriate language', reason: 'Inappropriate Content', timestamp: '6 hours ago' },
];

export default function AdminPage() {
  const params = useParams<{ locale: string }>();
  const locale = params?.locale ?? 'en';
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [activeView, setActiveView] = useState<'overview' | 'approvals' | 'moderation'>('overview');

  if (!user || user.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <p className="text-destructive font-semibold mb-4">Access Denied</p>
          <Link href={`/${locale}/dashboard`} className="text-primary hover:underline">
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-sidebar text-sidebar-foreground flex flex-col">
        <div className="p-6 border-b border-white/10">
          <h2 className="text-xl font-bold">BookNest</h2>
          <p className="text-sm text-white/60">Admin Portal</p>
        </div>
        <nav className="flex-1 px-3 py-6 space-y-2">
          {[
            { id: 'overview', icon: BarChart3, label: 'Dashboard' },
            { id: 'approvals', icon: BookOpen, label: 'Book Approvals' },
            { id: 'moderation', icon: AlertCircle, label: 'Moderation Queue' },
            { id: 'users', icon: Users, label: 'Users' },
          ].map((item) => {
            const Icon = item.icon as any;
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id as any)}
                className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition ${
                  activeView === item.id
                    ? 'bg-white/20 text-white'
                    : 'text-white/70 hover:bg-white/10'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
        <div className="px-3 py-4 border-t border-white/10">
          <button
            onClick={() => router.push(`/${locale}/dashboard`)}
            className="w-full text-left px-4 py-2 rounded-lg text-white/70 hover:bg-white/10 text-sm"
          >
            Back to App
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-white border-b border-border sticky top-0 z-10">
          <div className="px-8 py-4 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {activeView === 'overview' && 'Dashboard Overview'}
                {activeView === 'approvals' && 'Book Approvals Queue'}
                {activeView === 'moderation' && 'Moderation Queue'}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {activeView === 'overview' && 'System metrics and analytics'}
                {activeView === 'approvals' && 'Review and approve submitted books'}
                {activeView === 'moderation' && 'Handle user reports and content violations'}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <input
                type="search"
                placeholder="Search..."
                className="px-4 py-2 rounded-lg border border-border bg-muted placeholder-muted-foreground text-sm w-48"
              />
              <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center cursor-pointer">
                <span className="text-sm font-semibold text-accent">A</span>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="p-8 space-y-8">
          {activeView === 'overview' && (
            <div className="space-y-8">
              {/* Metrics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {MOCK_METRICS.map((metric) => {
                  const Icon = metric.icon as any;
                  return (
                    <div key={metric.label} className="bg-white rounded-lg border border-border p-6 hover:shadow-md transition">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm text-muted-foreground font-medium">{metric.label}</p>
                          <p className="text-3xl font-bold text-foreground mt-2">{metric.value}</p>
                          <p className="text-xs text-success font-semibold mt-2">{metric.change}</p>
                        </div>
                        <div className="p-3 bg-accent/10 rounded-lg">
                          <Icon className="w-6 h-6 text-accent" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Chart Placeholder */}
              <div className="bg-white rounded-lg border border-border p-8">
                <h3 className="text-lg font-semibold text-foreground mb-6">Revenue Trend</h3>
                <div className="h-64 bg-muted/30 rounded-lg flex items-center justify-center">
                  <p className="text-muted-foreground">Revenue chart placeholder</p>
                </div>
              </div>
            </div>
          )}

          {activeView === 'approvals' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg border border-border overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted border-b border-border">
                      <tr>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Cover</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Title</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Author</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Submitted</th>
                        <th className="px-6 py-3 text-right text-sm font-semibold text-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {MOCK_BOOKS.map((book) => (
                        <tr key={book.id} className="border-b border-border hover:bg-muted/50 transition">
                          <td className="px-6 py-4">
                            <div className="w-12 h-16 bg-secondary/20 rounded-md" />
                          </td>
                          <td className="px-6 py-4">
                            <p className="font-medium text-foreground">{book.title}</p>
                          </td>
                          <td className="px-6 py-4 text-foreground">{book.author}</td>
                          <td className="px-6 py-4 text-sm text-muted-foreground">{book.submitted}</td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button className="px-4 py-2 rounded-lg bg-success text-success-foreground text-sm font-medium hover:opacity-90 transition">
                                Approve
                              </button>
                              <button className="px-4 py-2 rounded-lg bg-destructive text-destructive-foreground text-sm font-medium hover:opacity-90 transition">
                                Reject
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeView === 'moderation' && (
            <div className="space-y-6">
              {MOCK_MODERATION.map((item) => (
                <div key={item.id} className="bg-white rounded-lg border border-border p-6 hover:shadow-md transition">
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-foreground">@{item.user}</p>
                        <p className="text-sm text-muted-foreground mt-1">{item.post}</p>
                        <div className="flex gap-2 mt-3">
                          <span className="inline-flex items-center px-2 py-1 rounded-full bg-red-50 text-red-700 text-xs font-medium">
                            {item.reason}
                          </span>
                          <span className="text-xs text-muted-foreground">{item.timestamp}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button className="flex-1 px-4 py-2 rounded-lg border border-border text-foreground font-medium hover:bg-muted transition">
                        Dismiss Report
                      </button>
                      <button className="flex-1 px-4 py-2 rounded-lg bg-destructive text-destructive-foreground font-medium hover:opacity-90 transition">
                        Delete Post & Warn
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
