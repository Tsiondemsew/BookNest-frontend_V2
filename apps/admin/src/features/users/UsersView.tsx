'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronRight } from 'lucide-react';
import { adminApi } from '@/lib/api/client';
import { AdminBadge, AdminInput, AdminSelect, AdminCard } from '@/components/ui/AdminUi';

function statusTone(status: string): 'neutral' | 'success' | 'warning' | 'danger' {
  if (status === 'active') return 'success';
  if (status === 'suspended') return 'warning';
  if (status === 'disabled') return 'danger';
  return 'neutral';
}

export function UsersView() {
  const [q, setQ] = useState('');
  const [role, setRole] = useState('');
  const [accountStatus, setAccountStatus] = useState('');

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['admin', 'users', q, role, accountStatus],
    queryFn: () =>
      adminApi.listUsers({
        q: q || undefined,
        role: role || undefined,
        account_status: accountStatus || undefined,
      }),
  });

  const users = data?.data?.users ?? [];

  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl font-semibold text-[#1A2A3A]">Users</h1>
      <p className="mt-1 text-sm text-[#4A5568]">
        Browse members, review reported content, and suspend accounts when needed.
      </p>

      <div className="mt-6 flex flex-wrap gap-3">
        <AdminInput
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search email or name…"
          className="max-w-xs"
        />
        <AdminSelect value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="">All roles</option>
          <option value="reader">Reader</option>
          <option value="author">Author</option>
          <option value="publisher">Publisher</option>
          <option value="admin">Admin</option>
        </AdminSelect>
        <AdminSelect value={accountStatus} onChange={(e) => setAccountStatus(e.target.value)}>
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
          <option value="disabled">Disabled</option>
        </AdminSelect>
      </div>

      {error && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Failed to load users.{' '}
          <button type="button" className="underline" onClick={() => void refetch()}>
            Retry
          </button>
        </div>
      )}

      <AdminCard className="mt-6 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-[#FDFBF7] text-left text-[#4A5568] border-b border-[#E8E2D9]">
              <tr>
                <th className="px-4 py-3 font-medium">User</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Joined</th>
                <th className="px-4 py-3 w-10" />
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-[#4A5568]">
                    Loading…
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-[#4A5568]">
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr
                    key={u.id}
                    className="border-t border-[#E8E2D9] hover:bg-[#FDFBF7]/80 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/dashboard/users/${u.id}`}
                        className="flex items-center gap-3 group"
                      >
                        <div className="w-9 h-9 rounded-full bg-[#2C3E50]/10 flex items-center justify-center overflow-hidden shrink-0">
                          {u.avatar_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={u.avatar_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-sm font-medium text-[#2C3E50]">
                              {(u.display_name || u.email)[0]?.toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-[#1A2A3A] group-hover:text-[#B85C38] truncate">
                            {u.display_name || u.email.split('@')[0]}
                          </p>
                          <p className="text-xs text-[#4A5568] truncate">{u.email}</p>
                        </div>
                      </Link>
                    </td>
                    <td className="px-4 py-3 capitalize text-[#1A2A3A]">{u.role}</td>
                    <td className="px-4 py-3">
                      <AdminBadge tone={statusTone(u.account_status)}>{u.account_status}</AdminBadge>
                    </td>
                    <td className="px-4 py-3 text-[#4A5568]">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/dashboard/users/${u.id}`}
                        className="text-[#B85C38] hover:text-[#2C3E50]"
                        aria-label="View user"
                      >
                        <ChevronRight size={18} />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </AdminCard>
    </div>
  );
}
