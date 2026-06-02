'use client';

import { useEffect, useMemo, useState } from 'react';
import { Eye, Loader2, AlertCircle } from 'lucide-react';
import { downloadApi } from '@/lib/api/client';

type StudioFilePreviewProps = {
  formatType: 'PDF' | 'Audio';
  /** Newly selected file (before upload). */
  file?: File | null;
  /** Saved format on the server (owner preview). */
  formatId?: string;
  title?: string;
};

export function StudioFilePreview({
  formatType,
  file,
  formatId,
  title,
}: StudioFilePreviewProps) {
  const [remoteUrl, setRemoteUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const localUrl = useMemo(() => {
    if (!file) return null;
    return URL.createObjectURL(file);
  }, [file]);

  useEffect(() => {
    return () => {
      if (localUrl) URL.revokeObjectURL(localUrl);
    };
  }, [localUrl]);

  useEffect(() => {
    if (file || !formatId) {
      setRemoteUrl(null);
      setError(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    let blobUrl: string | null = null;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const url = downloadApi.getFormatPreviewUrl(formatId);
        const response = await fetch(url, { method: 'GET', credentials: 'include' });
        if (!response.ok) {
          let message = `Could not load preview (${response.status})`;
          try {
            const body = await response.json();
            message = body?.error?.message || message;
          } catch {
            /* ignore */
          }
          throw new Error(message);
        }
        const blob = await response.blob();
        if (cancelled) return;
        blobUrl = URL.createObjectURL(blob);
        setRemoteUrl(blobUrl);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Preview failed');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [file, formatId]);

  const previewUrl = localUrl || remoteUrl;
  const heading =
    title ||
    (formatType === 'PDF' ? 'Review your PDF' : 'Listen to your audio');

  if (!file && !formatId) return null;

  return (
    <div className="rounded-lg border border-[#E8E2D9] bg-white overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2.5 bg-[#F5F1EB] border-b border-[#E8E2D9]">
        <Eye size={16} className="text-[#B85C38]" />
        <span className="text-sm font-medium text-[#1A2A3A]">{heading}</span>
        {file && (
          <span className="text-xs text-[#4A5568] truncate ml-auto">{file.name}</span>
        )}
      </div>

      {loading && (
        <div className="flex items-center justify-center gap-2 py-12 text-[#4A5568]">
          <Loader2 size={20} className="animate-spin text-[#B85C38]" />
          <span className="text-sm">Loading preview…</span>
        </div>
      )}

      {error && !loading && (
        <div className="flex items-start gap-2 p-4 text-red-600 text-sm">
          <AlertCircle size={18} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {!loading && !error && previewUrl && formatType === 'PDF' && (
        <iframe
          src={previewUrl}
          title={heading}
          className="w-full h-[min(70vh,520px)] bg-[#FDFBF7]"
        />
      )}

      {!loading && !error && previewUrl && formatType === 'Audio' && (
        <div className="p-4 space-y-3">
          <p className="text-xs text-[#4A5568]">
            Play the file below to confirm it is the correct recording before you submit.
          </p>
          <audio controls preload="metadata" src={previewUrl} className="w-full">
            Your browser does not support audio playback.
          </audio>
        </div>
      )}
    </div>
  );
}
