'use client';

import { Minus, PanelRightClose, PanelRightOpen, Plus, Volume2, VolumeX } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getAdminFormatContentUrl, googleDriveOpenUrl, isGoogleDriveUrl } from '@/lib/format-content-url';
import { DEMO_AUDIO_URL } from '@/lib/demo-content';
import type { BookFormatDetail } from './types';

const VOLUME_STEP = 0.05;

function formatDuration(sec: number | null | undefined) {
  if (sec == null || !Number.isFinite(sec)) return '—';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

function formatBytes(n: number | null | undefined) {
  if (n == null) return '—';
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

function needsBlobSrc(url: string) {
  return url.startsWith('/api/');
}

function AudioSeekBar({
  duration,
  position,
  disabled,
  onSeekStart,
  onSeek,
  onSeekEnd,
}: {
  duration: number;
  position: number;
  disabled?: boolean;
  onSeekStart: () => void;
  onSeek: (time: number) => void;
  onSeekEnd: (time: number) => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);

  const timeFromClientX = useCallback(
    (clientX: number) => {
      const track = trackRef.current;
      if (!track || duration <= 0) return 0;
      const rect = track.getBoundingClientRect();
      const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
      return ratio * duration;
    },
    [duration],
  );

  useEffect(() => {
    const onPointerMove = (e: PointerEvent) => {
      if (!draggingRef.current) return;
      onSeek(timeFromClientX(e.clientX));
    };

    const onPointerUp = (e: PointerEvent) => {
      if (!draggingRef.current) return;
      draggingRef.current = false;
      onSeekEnd(timeFromClientX(e.clientX));
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);
    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
    };
  }, [onSeek, onSeekEnd, timeFromClientX]);

  const pct = duration > 0 ? Math.min(100, (position / duration) * 100) : 0;

  return (
    <div
      ref={trackRef}
      role="slider"
      aria-label="Seek audio position"
      aria-valuemin={0}
      aria-valuemax={duration}
      aria-valuenow={position}
      aria-disabled={disabled}
      className={`relative mt-1 h-3 rounded-full bg-slate-200 dark:bg-slate-700 ${
        disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer touch-manipulation'
      }`}
      onPointerDown={(e) => {
        if (disabled) return;
        e.preventDefault();
        e.stopPropagation();
        draggingRef.current = true;
        onSeekStart();
        const t = timeFromClientX(e.clientX);
        onSeek(t);
        try {
          (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        } catch {
          /* ignore */
        }
      }}
    >
      <div
        className="pointer-events-none absolute inset-y-0 left-0 rounded-full bg-primary"
        style={{ width: `${pct}%` }}
      />
      <div
        className="pointer-events-none absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-primary shadow-md dark:border-slate-900"
        style={{ left: `${pct}%` }}
      />
    </div>
  );
}

type Props = {
  bookId?: string;
  format: BookFormatDetail;
  label?: string;
  bookTitle?: string;
  bookDescription?: string | null;
  standalone?: boolean;
  /** Embedded in change cards: hide sidebar, stack controls vertically */
  compact?: boolean;
  /** Load format URL before book proxy (for "previous" column) */
  preferDirectSource?: boolean;
};

export function AdminAudioPlayer({
  bookId,
  format,
  label,
  bookTitle,
  bookDescription,
  standalone = false,
  compact = false,
  preferDirectSource = false,
}: Props) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const isSeekingRef = useRef(false);
  const volumeBeforeMute = useRef(1);
  const blobUrlRef = useRef<string | null>(null);

  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [displayTime, setDisplayTime] = useState(0);
  const [duration, setDuration] = useState(format.durationSec ?? 0);
  const [sidebarOpen, setSidebarOpen] = useState(!compact);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [srcIndex, setSrcIndex] = useState(0);
  const [resolvedSrc, setResolvedSrc] = useState<string | null>(null);
  const [loadingSrc, setLoadingSrc] = useState(false);

  const proxySrc = bookId ? getAdminFormatContentUrl(bookId, 'audio') : null;
  const candidateSources = useMemo(() => {
    const direct = [format.playbackUrl, format.fileUrl].filter((url): url is string => Boolean(url));
    const proxied = proxySrc ? [proxySrc] : [];
    const demos = [
      format.isDemoContent ? DEMO_AUDIO_URL : null,
      DEMO_AUDIO_URL,
    ].filter((url): url is string => Boolean(url));
    const list = preferDirectSource
      ? [...direct, ...proxied, ...demos]
      : [...proxied, ...direct, ...demos];
    return [...new Set(list)];
  }, [proxySrc, format.playbackUrl, format.fileUrl, format.isDemoContent, preferDirectSource]);

  const playbackSrc = candidateSources[srcIndex] ?? candidateSources[0] ?? null;

  const isGoogle = isGoogleDriveUrl(format.fileUrl);
  const googleOpen = format.fileUrl && isGoogle ? googleDriveOpenUrl(format.fileUrl) : null;

  useEffect(() => {
    setSrcIndex(0);
    setLoadError(null);
    setCurrentTime(0);
    setDisplayTime(0);
    isSeekingRef.current = false;
  }, [bookId, format.playbackUrl, format.fileUrl]);

  useEffect(() => {
    let cancelled = false;

    const revokeBlob = () => {
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
    };

    async function resolveAudioSrc() {
      revokeBlob();
      if (!playbackSrc) {
        setResolvedSrc(null);
        setLoadingSrc(false);
        return;
      }

      if (!needsBlobSrc(playbackSrc)) {
        setResolvedSrc(playbackSrc);
        setLoadingSrc(false);
        return;
      }

      setLoadingSrc(true);
      try {
        const res = await fetch(playbackSrc, { credentials: 'include', cache: 'no-store' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const blob = await res.blob();
        if (cancelled) return;
        const url = URL.createObjectURL(blob);
        blobUrlRef.current = url;
        setResolvedSrc(url);
        setLoadError(null);
      } catch {
        if (!cancelled) {
          setResolvedSrc(playbackSrc);
        }
      } finally {
        if (!cancelled) setLoadingSrc(false);
      }
    }

    void resolveAudioSrc();
    return () => {
      cancelled = true;
      revokeBlob();
    };
  }, [playbackSrc]);

  const effectiveDuration =
    duration > 0 && Number.isFinite(duration)
      ? duration
      : format.durationSec && format.durationSec > 0
        ? format.durationSec
        : 0;

  const canSeek = effectiveDuration > 0 && Boolean(resolvedSrc) && !loadingSrc;

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;

    const syncDuration = () => {
      const d = el.duration;
      if (d != null && Number.isFinite(d) && d > 0) {
        setDuration(d);
      }
    };

    const onTimeUpdate = () => {
      if (isSeekingRef.current) return;
      const t = el.currentTime;
      setCurrentTime(t);
      setDisplayTime(t);
    };

    el.addEventListener('loadedmetadata', syncDuration);
    el.addEventListener('durationchange', syncDuration);
    el.addEventListener('timeupdate', onTimeUpdate);
    syncDuration();

    return () => {
      el.removeEventListener('loadedmetadata', syncDuration);
      el.removeEventListener('durationchange', syncDuration);
      el.removeEventListener('timeupdate', onTimeUpdate);
    };
  }, [resolvedSrc]);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    el.volume = isMuted ? 0 : volume;
    el.muted = isMuted || volume === 0;
  }, [volume, isMuted, resolvedSrc]);

  const applyVolume = (next: number) => {
    const clamped = Math.min(1, Math.max(0, Math.round(next * 100) / 100));
    setVolume(clamped);
    if (clamped > 0) {
      setIsMuted(false);
      volumeBeforeMute.current = clamped;
    } else {
      setIsMuted(true);
    }
    const el = audioRef.current;
    if (el) {
      el.volume = clamped;
      el.muted = clamped === 0;
    }
  };

  const adjustVolume = (delta: number) => {
    const base = isMuted ? 0 : volume;
    applyVolume(base + delta);
  };

  const toggleMute = () => {
    if (isMuted || volume === 0) {
      applyVolume(volumeBeforeMute.current > 0 ? volumeBeforeMute.current : 0.5);
      return;
    }
    volumeBeforeMute.current = volume;
    setIsMuted(true);
    const el = audioRef.current;
    if (el) {
      el.muted = true;
      el.volume = 0;
    }
  };

  const seekTo = useCallback(
    (time: number) => {
      const el = audioRef.current;
      if (!el || !Number.isFinite(time)) return;

      const max =
        el.duration > 0 && Number.isFinite(el.duration)
          ? el.duration
          : effectiveDuration > 0
            ? effectiveDuration
            : time;
      const clamped = Math.min(Math.max(0, time), max);

      const apply = () => {
        el.currentTime = clamped;
        setCurrentTime(clamped);
        setDisplayTime(clamped);
      };

      if (el.readyState >= 1) {
        apply();
      } else {
        const onReady = () => {
          el.removeEventListener('loadedmetadata', onReady);
          apply();
        };
        el.addEventListener('loadedmetadata', onReady);
      }
    },
    [effectiveDuration],
  );

  const chapters = useMemo(() => {
    const total = duration > 0 ? duration : format.durationSec ?? 0;
    if (!total) return [];
    const count = Math.min(10, Math.max(3, Math.floor(total / 480)));
    const seg = total / count;
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      title: `Section ${i + 1}`,
      start: i * seg,
    }));
  }, [duration, format.durationSec]);

  if (!playbackSrc && format.missing) {
    return <p className="text-sm text-muted-foreground">No audio file available.</p>;
  }

  const playAudio = () => {
    const el = audioRef.current;
    if (!el) return;
    void el.play().catch(() => {
      setLoadError('Playback was blocked. Press Play again or use Open full reader.');
    });
  };

  const togglePlayback = () => {
    const el = audioRef.current;
    if (!el || !resolvedSrc || loadingSrc) return;
    if (playing) {
      el.pause();
      setPlaying(false);
      return;
    }
    playAudio();
  };

  return (
    <div
      className={`flex gap-0 overflow-hidden rounded-xl border border-border bg-card ${
        compact
          ? 'flex-col'
          : standalone
            ? 'min-h-0 flex-1 flex-col lg:flex-row'
            : 'flex-col lg:flex-row'
      }`}
    >
      <div className={`min-w-0 flex-1 ${compact ? 'p-2' : 'p-4'}`}>
        <div className="flex flex-wrap items-start justify-between gap-2">
          <p className="text-sm font-semibold">{label || 'Audio'}</p>
          <div className="flex gap-2">
            {googleOpen && (
              <a
                href={googleOpen}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-primary hover:bg-surface"
              >
                Open in Google Drive
              </a>
            )}
            {playbackSrc && (
              <a
                href={playbackSrc}
                download={format.fileName || 'audio.mp3'}
                className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold hover:bg-surface"
              >
                Download
              </a>
            )}
          </div>
        </div>

        {format.isDemoContent && (
          <p className="mt-1 text-xs text-amber-700 dark:text-amber-300">
            {format.demoLabel || 'Demo audio — no upload stored'}
          </p>
        )}

        {loadingSrc && (
          <p className="mt-2 text-xs text-muted-foreground">Loading audio for playback…</p>
        )}

        {loadError && <p className="mt-2 text-xs text-red-600">{loadError}</p>}

        <audio
          key={resolvedSrc || 'pending'}
          ref={audioRef}
          src={resolvedSrc || undefined}
          preload="auto"
          playsInline
          className="sr-only"
          onLoadedMetadata={() => {
            setLoadError(null);
            const d = audioRef.current?.duration;
            if (d != null && Number.isFinite(d) && d > 0) {
              setDuration(d);
            } else {
              setDuration(format.durationSec ?? 0);
            }
          }}
          onDurationChange={() => {
            const d = audioRef.current?.duration;
            if (d != null && Number.isFinite(d) && d > 0) {
              setDuration(d);
            }
          }}
          onSeeked={() => {
            const t = audioRef.current?.currentTime ?? 0;
            setCurrentTime(t);
            setDisplayTime(t);
          }}
          onError={() => {
            const next = srcIndex + 1;
            if (next < candidateSources.length) {
              setSrcIndex(next);
              return;
            }
            setLoadError('Could not play audio. Try Download or open in Google Drive.');
          }}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onEnded={() => setPlaying(false)}
        />

        <div className="mt-3 flex justify-between text-[10px] text-muted">
          <span>{formatTime(displayTime)}</span>
          <span>{canSeek ? formatTime(effectiveDuration) : '—'}</span>
        </div>

        <AudioSeekBar
          duration={effectiveDuration}
          position={displayTime}
          disabled={!canSeek}
          onSeekStart={() => {
            isSeekingRef.current = true;
          }}
          onSeek={(t) => {
            setDisplayTime(t);
            seekTo(t);
          }}
          onSeekEnd={(t) => {
            isSeekingRef.current = false;
            setDisplayTime(t);
            seekTo(t);
          }}
        />

        {!canSeek && !loadingSrc && (
          <p className="mt-1 text-[10px] text-muted-foreground">Loading audio duration…</p>
        )}

        <div
          className="mt-3 flex flex-wrap items-center gap-2"
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            disabled={!resolvedSrc || loadingSrc}
            className="rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-800 transition hover:bg-indigo-100 disabled:opacity-50 dark:border-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-200 dark:hover:bg-indigo-950/60"
            onClick={(e) => {
              e.stopPropagation();
              togglePlayback();
            }}
          >
            {playing ? 'Pause' : 'Play'}
          </button>
          <button
            type="button"
            className="rounded-lg border border-border px-3 py-1.5 text-xs"
            onClick={() => {
              audioRef.current?.pause();
              setPlaying(false);
            }}
          >
            Pause
          </button>
          <button
            type="button"
            className="rounded-lg border border-border px-3 py-1.5 text-xs"
            onClick={() => {
              const el = audioRef.current;
              if (!el) return;
              el.pause();
              seekTo(0);
              setPlaying(false);
            }}
          >
            Stop
          </button>

          <div className="ml-auto flex min-w-[10rem] flex-1 items-center gap-2 rounded-lg border border-border bg-surface/50 px-2 py-1 sm:max-w-[14rem]">
            <button
              type="button"
              aria-label="Decrease volume"
              className="shrink-0 rounded p-1 hover:bg-surface"
              onClick={() => adjustVolume(-VOLUME_STEP)}
            >
              <Minus size={14} />
            </button>
            <button
              type="button"
              aria-label={isMuted ? 'Unmute' : 'Mute'}
              className="shrink-0 rounded p-1 text-muted hover:bg-surface"
              onClick={toggleMute}
            >
              {isMuted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={isMuted ? 0 : volume}
              aria-label="Volume"
              onInput={(e) => applyVolume(Number(e.currentTarget.value))}
              onChange={(e) => applyVolume(Number(e.target.value))}
              className="h-2 min-w-0 flex-1 cursor-pointer accent-primary"
            />
            <span className="shrink-0 min-w-[2.25rem] text-center text-xs font-semibold tabular-nums">
              {Math.round((isMuted ? 0 : volume) * 100)}%
            </span>
            <button
              type="button"
              aria-label="Increase volume"
              className="shrink-0 rounded p-1 hover:bg-surface"
              onClick={() => adjustVolume(VOLUME_STEP)}
            >
              <Plus size={14} />
            </button>
          </div>
          {playing && <span className="text-xs text-emerald-600">Playing</span>}
        </div>
      </div>

      {!compact && sidebarOpen ? (
        <aside className="w-full shrink-0 border-border bg-surface/30 p-4 lg:w-72 lg:border-l">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-muted">Audio content</p>
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="rounded p-1 text-muted hover:bg-surface"
              aria-label="Hide sidebar"
            >
              <PanelRightClose size={14} />
            </button>
          </div>

          {bookTitle && <p className="text-sm font-semibold text-foreground">{bookTitle}</p>}
          <dl className="mt-3 space-y-2 text-xs text-muted-foreground">
            <div>
              <dt className="font-semibold uppercase tracking-wide">File</dt>
              <dd className="font-medium text-foreground">{format.fileName || 'audio'}</dd>
            </div>
            <div>
              <dt className="font-semibold uppercase tracking-wide">Duration</dt>
              <dd className="font-medium text-foreground">{formatDuration(format.durationSec)}</dd>
            </div>
            <div>
              <dt className="font-semibold uppercase tracking-wide">Size</dt>
              <dd className="font-medium text-foreground">{formatBytes(format.fileSizeBytes)}</dd>
            </div>
          </dl>

          {bookDescription && (
            <div className="mt-4 max-h-40 overflow-y-auto rounded-lg border border-border bg-card p-3">
              <p className="text-[10px] font-bold uppercase tracking-wide text-muted">Description</p>
              <p className="mt-1 text-xs leading-relaxed text-foreground">{bookDescription}</p>
            </div>
          )}

          {chapters.length > 0 && (
            <div className="mt-4">
              <p className="text-[10px] font-bold uppercase tracking-wide text-muted">Sections</p>
              <ul className="mt-2 max-h-48 space-y-1 overflow-y-auto">
                {chapters.map((ch) => (
                  <li key={ch.id}>
                    <button
                      type="button"
                      onClick={() => {
                        seekTo(ch.start);
                        playAudio();
                        setPlaying(true);
                      }}
                      className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left text-xs hover:bg-primary/10"
                    >
                      <span className="font-medium text-foreground">{ch.title}</span>
                      <span className="text-muted">{formatTime(ch.start)}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      ) : !compact ? (
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="hidden shrink-0 items-center justify-center border-l border-border bg-surface/30 px-2 text-xs font-semibold text-primary lg:flex lg:flex-col"
          aria-label="Show content sidebar"
        >
          <PanelRightOpen size={18} />
        </button>
      ) : null}
    </div>
  );
}
