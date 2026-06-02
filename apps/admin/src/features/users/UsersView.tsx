'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/api/client';

export function UsersView() {
  const [q, setQ] = useState('');
  const [role, setRole] = useState('');
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'users', q, role],
    queryFn: () => adminApi.listUsers({ q: q || undefined, role: role || undefined }),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, account_status }: { id: string; account_status: 'active' | 'suspended' | 'disabled' }) =>
      adminApi.updateUserStatus(id, account_status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'users'] }),
  });

  const users = data?.data?.users ?? [];

  return (
    <div>
      <h1 className="text-2xl font-semibold text-zinc-900">Users</h1>
      <div className="mt-4 flex flex-wrap gap-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search email or name…"
          className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
        >
          <option value="">All roles</option>
          <option value="reader">Reader</option>
          <option value="author">Author</option>
          <option value="publisher">Publisher</option>
          <option value="admin">Admin</option>
        </select>
      </div>
      <div className="mt-6 overflow-x-auto rounded-xl border border-zinc-200 bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-zinc-50 text-left text-zinc-500">
            <tr>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-zinc-500">
                  Loading…
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} className="border-t border-zinc-100">
                  <td className="px-4 py-3">{u.email}</td>
                  <td className="px-4 py-3 capitalize">{u.role}</td>
                  <td className="px-4 py-3 capitalize">{u.account_status}</td>
                  <td className="px-4 py-3">
                    {u.role !== 'admin' && (
                      <div className="flex gap-2">
                        {u.account_status !== 'active' && (
                          <button
                            type="button"
                            className="text-green-700 hover:underline"
                            onClick={() =>
                              statusMutation.mutate({ id: u.id, account_status: 'active' })
                            }
                          >
                            Activate
                          </button>
                        )}
                        {u.account_status !== 'suspended' && (
                          <button
                            type="button"
                            className="text-amber-700 hover:underline"
                            onClick={() =>
                              statusMutation.mutate({ id: u.id, account_status: 'suspended' })
                            }
                          >
                            Suspend
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
