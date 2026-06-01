'use client';

import { Minus, PanelRightClose, PanelRightOpen, Plus, Volume2, VolumeX } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { BookFormatView } from '../hooks/useAuthorBookSubmission';

const VOLUME_STEP = 0.05;

function formatDuration(sec: number | null | undefined) {
  if (sec == null) return '—';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

type Props = {
  format: BookFormatView;
  label?: string;
  bookDescription?: string | null;
};

export function AuthorAudioPreview({ format, label, bookDescription }: Props) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(format.durationSec ?? 0);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    el.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  const applyVolume = (next: number) => {
    const clamped = Math.min(1, Math.max(0, Math.round(next * 100) / 100));
    setVolume(clamped);
    setIsMuted(clamped === 0);
    if (audioRef.current) audioRef.current.volume = clamped;
  };

  const chapters = useMemo(() => {
    const total = duration || format.durationSec || 0;
    if (!total) return [];
    const count = Math.min(8, Math.max(3, Math.floor(total / 480)));
    const seg = total / count;
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      title: `Part ${i + 1}`,
      start: i * seg,
    }));
  }, [duration, format.durationSec]);

  if (!format.fileUrl) {
    return <p className="text-sm text-[#4A5568]">Audio file not available yet.</p>;
  }

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-[#E8E2D9] bg-[#F5F1EB]/50 lg:flex-row">
      <div className="min-w-0 flex-1 p-4">
        {label && <p className="text-xs font-bold uppercase tracking-wide text-[#8E735B]">{label}</p>}
        <p className="mt-1 text-sm font-medium text-[#1A2A3A]">{format.fileName || 'Audio'}</p>
        <audio
          ref={audioRef}
          src={format.fileUrl}
          preload="metadata"
          className="mt-3 w-full"
          onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime ?? 0)}
          onLoadedMetadata={() => setDuration(audioRef.current?.duration ?? format.durationSec ?? 0)}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onEnded={() => setPlaying(false)}
        />
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => void audioRef.current?.play()}
            className="rounded-lg bg-[#B85C38] px-3 py-1.5 text-xs font-semibold text-white"
          >
            Play
          </button>
          <button
            type="button"
            onClick={() => audioRef.current?.pause()}
            className="rounded-lg border border-[#E8E2D9] px-3 py-1.5 text-xs"
          >
            Pause
          </button>
          <div className="ml-auto flex items-center gap-1 rounded-lg border border-[#E8E2D9] bg-white/60 px-2 py-1">
            <button type="button" onClick={() => applyVolume((isMuted ? 0 : volume) - VOLUME_STEP)}>
              <Minus size={14} />
            </button>
            <button
              type="button"
              onClick={() => {
                if (isMuted) applyVolume(volume || VOLUME_STEP);
                else {
                  setIsMuted(true);
                  if (audioRef.current) audioRef.current.volume = 0;
                }
              }}
            >
              {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
            <span className="min-w-[2.5rem] text-center text-xs font-semibold">
              {Math.round((isMuted ? 0 : volume) * 100)}%
            </span>
            <button type="button" onClick={() => applyVolume((isMuted ? 0 : volume) + VOLUME_STEP)}>
              <Plus size={14} />
            </button>
          </div>
          {playing && <span className="text-xs text-emerald-700">Playing…</span>}
        </div>
      </div>

      {sidebarOpen ? (
        <aside className="w-full border-t border-[#E8E2D9] p-4 lg:w-64 lg:border-l lg:border-t-0">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase text-[#8E735B]">Content</p>
            <button type="button" onClick={() => setSidebarOpen(false)}>
              <PanelRightClose size={14} />
            </button>
          </div>
          <p className="mt-2 text-xs text-[#4A5568]">
            Duration {formatDuration(format.durationSec)}
            {format.price != null && ` · ${format.currency} ${format.price}`}
          </p>
          {bookDescription && (
            <p className="mt-3 max-h-32 overflow-y-auto text-xs leading-relaxed text-[#1A2A3A]">
              {bookDescription}
            </p>
          )}
          <ul className="mt-3 max-h-36 space-y-1 overflow-y-auto">
            {chapters.map((ch) => (
              <li key={ch.id}>
                <button
                  type="button"
                  className="flex w-full justify-between rounded px-2 py-1 text-xs hover:bg-[#B85C38]/10"
                  onClick={() => {
                    if (audioRef.current) {
                      audioRef.current.currentTime = ch.start;
                      void audioRef.current.play();
                    }
                  }}
                >
                  <span>{ch.title}</span>
                  <span className="text-[#8E735B]">{formatTime(ch.start)}</span>
                </button>
              </li>
            ))}
          </ul>
        </aside>
      ) : (
        <button
          type="button"
          className="hidden border-l border-[#E8E2D9] px-2 lg:block"
          onClick={() => setSidebarOpen(true)}
        >
          <PanelRightOpen size={16} />
        </button>
      )}
    </div>
  );
}
