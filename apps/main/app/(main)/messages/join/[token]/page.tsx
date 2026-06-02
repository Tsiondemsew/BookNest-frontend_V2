'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Users, Check, X } from 'lucide-react';
import { chatApi } from '@/lib/api/client';
import { useAuthStore } from '@/stores/authStore';
import { BackLink, CommunityCard, ui, cn } from '@/features/community/ui';

type InvitePreview = {
  id: string;
  name?: string;
  memberCount: number;
  alreadyMember: boolean;
};

export default function JoinGroupPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;
  const { isAuthenticated, isInitializing } = useAuthStore();
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<InvitePreview | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(true);
  const [isJoining, setIsJoining] = useState(false);

  const loadPreview = useCallback(async () => {
    setIsLoadingPreview(true);
    setError(null);
    try {
      const response = await chatApi.previewGroupInvite(token);
      setPreview(response.data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Could not load this group invite');
      setPreview(null);
    } finally {
      setIsLoadingPreview(false);
    }
  }, [token]);

  useEffect(() => {
    if (!token || isInitializing) return;

    if (!isAuthenticated) {
      const returnPath = `/messages/join/${encodeURIComponent(token)}`;
      router.replace(`/login?redirect=${encodeURIComponent(returnPath)}`);
      return;
    }

    void loadPreview();
  }, [token, router, isAuthenticated, isInitializing, loadPreview]);

  const handleJoin = async () => {
    if (!preview) return;
    setIsJoining(true);
    setError(null);
    try {
      const response = await chatApi.joinGroupViaInvite(token);
      router.replace(`/messages?chat=${response.data.id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Could not join this group');
      setIsJoining(false);
    }
  };

  const handleDecline = () => {
    router.replace('/messages');
  };

  if (isInitializing || isLoadingPreview) {
    return (
      <div className={cn(ui.page, 'flex flex-col items-center justify-center min-h-[50vh] gap-3')}>
        <Loader2 size={32} className="animate-spin text-bn-primary" />
        <p className="text-bn-muted">Loading group invite…</p>
      </div>
    );
  }

  if (error && !preview) {
    return (
      <div className={cn(ui.page, 'max-w-md mx-auto')}>
        <BackLink href="/messages" label="Back to messages" className="mb-4" />
        <CommunityCard padding className="text-center">
          <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
            <Users size={24} className="text-red-600" />
          </div>
          <h1 className="text-xl font-semibold text-bn-ink">Invalid invite</h1>
          <p className="text-sm text-bn-muted mt-2">{error}</p>
        </CommunityCard>
      </div>
    );
  }

  if (!preview) return null;

  if (preview.alreadyMember) {
    return (
      <div className={cn(ui.page, 'max-w-md mx-auto')}>
        <BackLink href="/messages" label="Back to messages" className="mb-4" />
        <CommunityCard padding className="text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-bn-primary/10 flex items-center justify-center mx-auto">
            <Users size={24} className="text-bn-primary" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-bn-ink">Already in this group</h1>
            <p className="text-sm text-bn-muted mt-2">
              You are already a member of <strong>{preview.name || 'this group'}</strong>.
            </p>
          </div>
          <Link
            href={`/messages?chat=${preview.id}`}
            className={cn(ui.btnPrimary, 'inline-flex w-full justify-center')}
          >
            Open group chat
          </Link>
        </CommunityCard>
      </div>
    );
  }

  return (
    <div className={cn(ui.page, 'max-w-md mx-auto')}>
      <BackLink href="/messages" label="Back to messages" className="mb-4" />
      <CommunityCard padding className="text-center space-y-5">
        <div className="w-14 h-14 rounded-full bg-bn-primary/10 flex items-center justify-center mx-auto">
          <Users size={24} className="text-bn-primary" />
        </div>

        <div>
          <h1 className="text-xl font-semibold text-bn-ink">Join group chat?</h1>
          <p className="text-sm text-bn-muted mt-2">
            You were invited to join{' '}
            <strong className="text-bn-ink">{preview.name || 'a group'}</strong>.
          </p>
          <p className="text-xs text-bn-muted mt-1">
            {preview.memberCount} member{preview.memberCount === 1 ? '' : 's'} currently in this
            group
          </p>
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
            {error}
          </p>
        )}

        <div className="flex flex-col sm:flex-row gap-2 pt-1">
          <button
            type="button"
            onClick={() => void handleJoin()}
            disabled={isJoining}
            className={cn(ui.btnPrimary, 'flex-1 justify-center gap-2')}
          >
            {isJoining ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Check size={16} />
            )}
            Join group
          </button>
          <button
            type="button"
            onClick={handleDecline}
            disabled={isJoining}
            className={cn(ui.btnSecondary, 'flex-1 justify-center gap-2')}
          >
            <X size={16} />
            Not now
          </button>
        </div>
      </CommunityCard>
    </div>
  );
}
