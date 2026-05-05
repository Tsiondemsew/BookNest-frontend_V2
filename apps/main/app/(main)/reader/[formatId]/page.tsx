'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { apiClient } from '@/lib/api/client';

type AccessResponse = {
  success: boolean;
  data: {
    formatId: string;
    formatType: string;
    signedUrl: string;
    expiresInSec: number;
  };
  error?: { message?: string };
};

export default function ReaderPage() {
  const params = useParams();
  const formatId = params.formatId as string;
  const [state, setState] = useState<
    | { kind: 'loading' }
    | { kind: 'error'; message: string }
    | { kind: 'ready'; url: string; type: string }
  >({ kind: 'loading' });

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await apiClient.get<AccessResponse>(`/api/library/formats/${formatId}/access`);
        if (!res.success) throw new Error(res.error?.message || 'Access denied');
        if (!mounted) return;
        setState({ kind: 'ready', url: res.data.signedUrl, type: res.data.formatType });
      } catch (e: any) {
        if (!mounted) return;
        setState({ kind: 'error', message: e?.message || 'Failed to load reader' });
      }
    })();
    return () => {
      mounted = false;
    };
  }, [formatId]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <Link href="/library" className="text-blue-600 hover:underline">
          ← Back to library
        </Link>
      </div>

      {state.kind === 'loading' && <p className="text-gray-600">Preparing secure access…</p>}
      {state.kind === 'error' && <p className="text-red-600">{state.message}</p>}
      {state.kind === 'ready' && (
        <div className="rounded-xl border bg-white overflow-hidden">
          {state.type === 'Audio' ? (
            <audio controls src={state.url} className="w-full" />
          ) : (
            <iframe title="Book reader" src={state.url} className="w-full h-[80vh]" />
          )}
        </div>
      )}
    </div>
  );
}

