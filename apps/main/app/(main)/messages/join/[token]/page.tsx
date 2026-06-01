'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2, Users } from 'lucide-react';
import { chatApi } from '@/lib/api/chat';
import { useAuthStore } from '@/stores/authStore';
import { BackLink, CommunityCard, ui, cn } from '@/features/community/ui';

export default function JoinGroupPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;
  const { isAuthenticated, isInitializing } = useAuthStore();
  const [error, setError] = useState<string | null>(null);
  const [groupName, setGroupName] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState(true);

  useEffect(() => {
    if (!token || isInitializing) return;

    if (!isAuthenticated) {
      const returnPath = `/messages/join/${encodeURIComponent(token)}`;
      router.replace(`/login?redirect=${encodeURIComponent(returnPath)}`);
      return;
    }

    void (async () => {
      try {
        const response = await chatApi.joinGroupViaInvite(token);
        setGroupName(response.data.name || 'Group');
        router.replace(`/messages?chat=${response.data.id}`);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Could not join this group');
        setIsJoining(false);
      }
    })();
  }, [token, router, isAuthenticated, isInitializing]);

  if (isInitializing || (isJoining && !error)) {
    return (
      <div className={cn(ui.page, 'flex flex-col items-center justify-center min-h-[50vh] gap-3')}>
        <Loader2 size={32} className="animate-spin text-bn-primary" />
        <p className="text-bn-muted">Joining group…</p>
      </div>
    );
  }

  return (
    <div className={cn(ui.page, 'max-w-md mx-auto')}>
      <BackLink href="/messages" label="Back to messages" className="mb-4" />
      <CommunityCard padding className="text-center">
        <div className="w-14 h-14 rounded-full bg-bn-primary/10 flex items-center justify-center mx-auto mb-4">
          <Users size={24} className="text-bn-primary" />
        </div>
        <h1 className="text-xl font-semibold text-bn-ink">Could not join group</h1>
        <p className="text-sm text-bn-muted mt-2">{error}</p>
        {groupName && (
          <p className="text-sm text-green-600 mt-2">Joined {groupName}</p>
        )}
      </CommunityCard>
    </div>
  );
}
