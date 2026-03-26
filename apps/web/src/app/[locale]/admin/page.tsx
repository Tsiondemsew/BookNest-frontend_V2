'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useAuthStore } from '@/stores/authStore';
import Link from 'next/link';

const MOCK_USERS = [
  { id: '1', name: 'Alice', email: 'alice@example.com', role: 'reader', createdAt: '2024-01-01' },
  { id: '2', name: 'Bob', email: 'bob@example.com', role: 'reader', createdAt: '2024-01-02' },
  { id: '3', name: 'Carol', email: 'carol@example.com', role: 'admin', createdAt: '2024-01-03' },
];

const MOCK_REPORTS = [
  { id: '1', type: 'inappropriate content', reporter: 'User123', status: 'pending', date: '2024-01-15' },
  { id: '2', type: 'spam', reporter: 'User456', status: 'reviewed', date: '2024-01-14' },
  { id: '3', type: 'harassment', reporter: 'User789', status: 'pending', date: '2024-01-13' },
];

export default function AdminPage() {
  const t = useTranslations();
  const params = useParams<{ locale: string }>();
  const locale = params?.locale ?? 'en';
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'reports' | 'moderation'>('dashboard');

  if (!user || user.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 font-semibold mb-4">Access Denied</p>
          <Link href={`/${locale}/dashboard`} className="text-blue-600 hover:underline">
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">BookNest Admin</h1>
            <nav className="flex gap-4">
              <Link href={`/${locale}/dashboard`} className="text-gray-600 hover:text-gray-900">
                {t('nav.discover')}
              </Link>
              <Link href={`/${locale}/admin`} className="font-bold text-blue-600">
                {t('nav.admin')}
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">{t('admin.title')}</h2>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-8">
          <div className="border-b flex flex-wrap">
            {(['dashboard', 'users', 'reports', 'moderation'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-6 font-medium border-b-2 transition ${
                  activeTab === tab
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab === 'dashboard' && 'Dashboard'}
                {tab === 'users' && t('admin.users')}
                {tab === 'reports' && t('admin.reports')}
                {tab === 'moderation' && t('admin.moderation')}
              </button>
            ))}
          </div>

          <div className="p-6">
            {activeTab === 'dashboard' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Analytics Overview</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                  <div className="bg-blue-50 p-6 rounded-lg">
                    <p className="text-gray-600 text-sm">{t('admin.totalUsers')}</p>
                    <p className="text-3xl font-bold text-blue-600 mt-2">{MOCK_USERS.length}</p>
                  </div>
                  <div className="bg-green-50 p-6 rounded-lg">
                    <p className="text-gray-600 text-sm">{t('admin.totalBooks')}</p>
                    <p className="text-3xl font-bold text-green-600 mt-2">128</p>
                  </div>
                  <div className="bg-yellow-50 p-6 rounded-lg">
                    <p className="text-gray-600 text-sm">{t('admin.totalReports')}</p>
                    <p className="text-3xl font-bold text-yellow-600 mt-2">{MOCK_REPORTS.length}</p>
                  </div>
                  <div className="bg-purple-50 p-6 rounded-lg">
                    <p className="text-gray-600 text-sm">Active Users</p>
                    <p className="text-3xl font-bold text-purple-600 mt-2">24</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('admin.users')}</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-4">Name</th>
                        <th className="text-left py-2 px-4">Email</th>
                        <th className="text-left py-2 px-4">Role</th>
                        <th className="text-left py-2 px-4">Joined</th>
                        <th className="text-left py-2 px-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {MOCK_USERS.map((u) => (
                        <tr key={u.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">{u.name}</td>
                          <td className="py-3 px-4 text-gray-600">{u.email}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              u.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                            }`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-600 text-sm">{u.createdAt}</td>
                          <td className="py-3 px-4">
                            <button className="text-blue-600 hover:underline text-sm">Edit</button>
                            <button className="ml-3 text-red-600 hover:underline text-sm">Remove</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'reports' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('admin.reports')}</h3>
                <div className="space-y-4">
                  {MOCK_REPORTS.map((report) => (
                    <div key={report.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-semibold text-gray-900 capitalize">{report.type}</p>
                          <p className="text-sm text-gray-600">Reported by {report.reporter}</p>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          report.status === 'pending' 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {report.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">{report.date}</p>
                      {report.status === 'pending' && (
                        <div className="mt-3 flex gap-2">
                          <button className="text-sm px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700">
                            Approve
                          </button>
                          <button className="text-sm px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700">
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'moderation' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('admin.moderation')}</h3>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-gray-700">
                    Moderation dashboard - Review and manage flagged content, posts, and user accounts.
                  </p>
                  <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                    View Flagged Content
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
