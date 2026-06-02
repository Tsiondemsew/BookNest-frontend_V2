'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Flag, BookOpen, MessageSquare } from 'lucide-react';
import { adminApi } from '@/lib/api/client';
import { AdminBadge, AdminButton, AdminCard } from '@/components/ui/AdminUi';
import { useDialog } from '@/components/feedback/DialogProvider';

function statusTone(status: string): 'neutral' | 'success' | 'warning' | 'danger' {
  if (status === 'active' || status === 'published' || status === 'approved') return 'success';
  if (status === 'suspended' || status === 'hidden' || status === 'pending') return 'warning';
  if (status === 'disabled' || status === 'rejected') return 'danger';
  return 'neutral';
}

export function UserDetailView() {
  const params = useParams();
  const queryClient = useQueryClient();
  const userId = params.id as string;
  const { confirm } = useDialog();

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin', 'users', userId],
    queryFn: () => adminApi.getUser(userId),
    enabled: Boolean(userId),
  });

  const statusMutation = useMutation({
    mutationFn: (account_status: 'active' | 'suspended' | 'disabled') =>
      adminApi.updateUserStatus(userId, account_status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users', userId] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });

  const detail = data?.data;
  const user = detail?.user;
  const isAdmin = user?.role === 'admin';

  if (isLoading) {
    return <p className="text-[#4A5568]">Loading user…</p>;
  }

  if (error || !user) {
    return (
      <div>
        <Link href="/dashboard/users" className="inline-flex items-center gap-2 text-sm text-[#B85C38] hover:underline mb-4">
          <ArrowLeft size={16} />
          Back to users
        </Link>
        <p className="text-red-600">User not found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <Link
        href="/dashboard/users"
        className="inline-flex items-center gap-2 text-sm text-[#B85C38] hover:underline"
      >
        <ArrowLeft size={16} />
        Back to users
      </Link>

      <AdminCard className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-start gap-5">
          <div className="w-16 h-16 rounded-full bg-[#2C3E50]/10 flex items-center justify-center overflow-hidden shrink-0">
            {user.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-xl font-semibold text-[#2C3E50]">
                {(user.display_name || user.email)[0]?.toUpperCase()}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-semibold text-[#1A2A3A]">
                {user.display_name || user.email}
              </h1>
              <AdminBadge tone={statusTone(user.account_status)}>{user.account_status}</AdminBadge>
              <AdminBadge tone="neutral">{user.role}</AdminBadge>
            </div>
            <p className="mt-1 text-sm text-[#4A5568]">{user.email}</p>
            {user.bio && <p className="mt-3 text-sm text-[#1A2A3A]/80">{user.bio}</p>}
            <div className="mt-4 grid grid-cols-3 gap-4 max-w-md">
              <div className="rounded-xl bg-[#FDFBF7] border border-[#E8E2D9] px-3 py-2 text-center">
                <p className="text-lg font-semibold text-[#2C3E50]">{detail.stats.post_count}</p>
                <p className="text-xs text-[#4A5568]">Posts</p>
              </div>
              <div className="rounded-xl bg-[#FDFBF7] border border-[#E8E2D9] px-3 py-2 text-center">
                <p className="text-lg font-semibold text-[#2C3E50]">{detail.stats.book_count}</p>
                <p className="text-xs text-[#4A5568]">Books</p>
              </div>
              <div className="rounded-xl bg-[#FDFBF7] border border-[#E8E2D9] px-3 py-2 text-center">
                <p className="text-lg font-semibold text-[#B85C38]">{detail.stats.pending_report_count}</p>
                <p className="text-xs text-[#4A5568]">Reports</p>
              </div>
            </div>
          </div>
          {!isAdmin && (
            <div className="flex flex-col gap-2 shrink-0">
              {user.account_status !== 'active' && (
                <AdminButton
                  variant="secondary"
                  disabled={statusMutation.isPending}
                  onClick={() => statusMutation.mutate('active')}
                >
                  Activate user
                </AdminButton>
              )}
              {user.account_status !== 'suspended' && (
                <AdminButton
                  variant="danger"
                  disabled={statusMutation.isPending}
                  onClick={async () => {
                    const ok = await confirm({
                      title: 'Suspend user?',
                      description:
                        'Suspend this user? Their profile, posts, and books will be hidden on the main site.',
                      confirmLabel: 'Suspend',
                      cancelLabel: 'Cancel',
                      destructive: true,
                    });
                    if (ok) statusMutation.mutate('suspended');
                  }}
                >
                  Suspend user
                </AdminButton>
              )}
            </div>
          )}
        </div>
        {user.account_status === 'suspended' && (
          <p className="mt-4 text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
            This user is suspended. Their profile, community posts, and books are hidden from the main app.
          </p>
        )}
      </AdminCard>

      {detail.reports.length > 0 && (
        <section>
          <h2 className="flex items-center gap-2 text-lg font-semibold text-[#1A2A3A] mb-3">
            <Flag size={20} className="text-[#B85C38]" />
            Reported content ({detail.reports.length})
          </h2>
          <div className="space-y-3">
            {detail.reports.map((report) => (
              <AdminCard key={report.id} className="p-4">
                <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                  <AdminBadge tone={statusTone(report.status || 'pending')}>
                    {report.status || 'pending'}
                  </AdminBadge>
                  <span className="text-xs text-[#4A5568]">
                    {new Date(report.created_at).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm font-medium text-[#1A2A3A] capitalize">
                  {report.target_type.replace('_', ' ')} · {report.reason}
                </p>
                {report.details && (
                  <p className="mt-1 text-sm text-[#4A5568]">{report.details}</p>
                )}
                {report.reporter && (
                  <p className="mt-2 text-xs text-[#4A5568]">
                    Reported by {report.reporter.email}
                  </p>
                )}
                {report.post && (
                  <div className="mt-3 rounded-xl border border-[#E8E2D9] bg-[#FDFBF7] p-3">
                    <p className="text-xs font-medium text-[#4A5568] mb-1 flex items-center gap-1">
                      <MessageSquare size={14} />
                      Reported post
                    </p>
                    <p className="text-sm text-[#1A2A3A] whitespace-pre-wrap">{report.post.content}</p>
                    {report.post.image_url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={report.post.image_url}
                        alt=""
                        className="mt-2 max-h-40 rounded-lg object-cover"
                      />
                    )}
                    <div className="mt-2">
                      <AdminBadge tone={statusTone(report.post.status)}>
                        {report.post.status}
                      </AdminBadge>
                    </div>
                  </div>
                )}
              </AdminCard>
            ))}
          </div>
        </section>
      )}

      {detail.posts.length > 0 && (
        <section>
          <h2 className="flex items-center gap-2 text-lg font-semibold text-[#1A2A3A] mb-3">
            <MessageSquare size={20} className="text-[#B85C38]" />
            Posts ({detail.posts.length})
          </h2>
          <div className="space-y-3">
            {detail.posts.map((post) => (
              <AdminCard key={post.id} className="p-4">
                <div className="flex justify-between gap-2 mb-2">
                  <AdminBadge tone={statusTone(post.status)}>{post.status}</AdminBadge>
                  <span className="text-xs text-[#4A5568]">
                    {new Date(post.created_at).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm text-[#1A2A3A] whitespace-pre-wrap">{post.content}</p>
                {post.image_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={post.image_url} alt="" className="mt-2 max-h-40 rounded-lg object-cover" />
                )}
              </AdminCard>
            ))}
          </div>
        </section>
      )}

      {detail.books.length > 0 && (
        <section>
          <h2 className="flex items-center gap-2 text-lg font-semibold text-[#1A2A3A] mb-3">
            <BookOpen size={20} className="text-[#B85C38]" />
            Books ({detail.books.length})
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {detail.books.map((book) => (
              <AdminCard key={book.id} className="p-4 flex gap-3">
                {book.cover_image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={book.cover_image_url}
                    alt=""
                    className="w-14 h-20 object-cover rounded-lg shrink-0"
                  />
                ) : (
                  <div className="w-14 h-20 rounded-lg bg-[#E8E2D9] shrink-0" />
                )}
                <div className="min-w-0">
                  <p className="font-medium text-[#1A2A3A] truncate">{book.title}</p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    <AdminBadge tone={statusTone(book.status)}>{book.status}</AdminBadge>
                    {book.is_active === false && (
                      <AdminBadge tone="warning">hidden</AdminBadge>
                    )}
                  </div>
                </div>
              </AdminCard>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
