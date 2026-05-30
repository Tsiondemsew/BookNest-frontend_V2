'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  ArrowLeft,
  Loader2,
  Headphones,
  RotateCcw,
  RotateCw,
} from 'lucide-react';
import { useReadingProgress } from '@/hooks/useReadingProgress';
import { useListeningTracker } from '@/hooks/useListeningTracker';
import { loadAudioForPlayback } from '@/lib/reader/loadBookFile';
import { handleReaderExitReview } from '@/lib/reader/reviewPrompt';
import { flushReadingActivity } from '@/lib/reading/recordActivity';

interface AudioPlayerProps {
  bookFormatId: string;
  bookId: string;
  bookTitle: string;
  bookAuthor: string;
  coverImage: string;
  audioUrl: string;
  totalDuration: number;
}

export function AudioPlayer({
  bookFormatId,
  bookId,
  bookTitle,
  bookAuthor,
  coverImage,
  totalDuration,
}: AudioPlayerProps) {
  const router = useRouter();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const revokeRef = useRef<(() => void) | null>(null);
  const completedSessionRef = useRef(false);
  const updateProgressRef = useRef<
    (pos: number, meta?: { trackMode: 'minutes'; forcePositionSave: boolean }) => void
  >(() => {});
  const loadGenRef = useRef(0);

  const [resumedFrom, setResumedFrom] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [audioReady, setAudioReady] = useState(false);
  const [isBuffering, setIsBuffering] = useState(true);

  const displayDuration = totalDuration > 0 ? totalDuration : 0;

  const { progressPercent, lastPosition, isLoading, updateProgress } = useReadingProgress({
    bookFormatId,
    total: displayDuration || 3600,
    onComplete: () => {
      completedSessionRef.current = true;
    },
  });

  updateProgressRef.current = updateProgress;

  useListeningTracker(isPlaying);

  useEffect(() => {
    return () => {
      const audio = audioRef.current;
      if (audio) {
        updateProgressRef.current(Math.floor(audio.currentTime), {
          trackMode: 'minutes',
          forcePositionSave: true,
        });
      }
      handleReaderExitReview(bookId, bookTitle, completedSessionRef.current);
      flushReadingActivity();
      revokeRef.current?.();
      revokeRef.current = null;
    };
  }, [bookId, bookTitle]);

  useEffect(() => {
    const gen = ++loadGenRef.current;
    let cancelled = false;

    const load = async () => {
      setLoadError(null);
      setAudioReady(false);
      setIsBuffering(true);
      setIsPlaying(false);
      setResumedFrom(null);

      try {
        const source = await loadAudioForPlayback(bookFormatId);

        if (cancelled || gen !== loadGenRef.current) {
          source.revoke();
          return;
        }

        revokeRef.current?.();
        revokeRef.current = source.revoke;

        const audio = audioRef.current;
        if (audio) {
          audio.pause();
          audio.src = source.blobUrl;
          audio.load();
        }

        setAudioReady(true);
        setIsBuffering(false);
      } catch (error) {
        if (!cancelled && gen === loadGenRef.current) {
          setLoadError(error instanceof Error ? error.message : 'Failed to load audio');
          setIsBuffering(false);
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [bookFormatId]);

  const applyResume = useCallback(
    (position: number) => {
      const audio = audioRef.current;
      if (!audio || position <= 0) return;

      const maxSeek = displayDuration > 0 ? Math.max(0, displayDuration - 1) : position;
      const seekTo = Math.min(position, maxSeek);

      const doSeek = () => {
        if (Math.abs(audio.currentTime - seekTo) > 0.5) {
          audio.currentTime = seekTo;
          setCurrentTime(seekTo);
        }
        setResumedFrom(seekTo);
      };

      if (audio.readyState >= HTMLMediaElement.HAVE_METADATA) {
        doSeek();
      } else {
        audio.addEventListener('loadedmetadata', doSeek, { once: true });
      }
    },
    [displayDuration]
  );

  useEffect(() => {
    if (isLoading || !audioReady || lastPosition <= 0 || resumedFrom != null) return;
    applyResume(lastPosition);
  }, [isLoading, audioReady, lastPosition, resumedFrom, applyResume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !audioReady) return;

    const onWaiting = () => setIsBuffering(true);
    const onCanPlay = () => setIsBuffering(false);
    const onPlaying = () => setIsBuffering(false);
    const onError = () => {
      setIsPlaying(false);
      setLoadError('Playback interrupted. Tap play to continue.');
      setIsBuffering(false);
    };
    const onPause = () => setIsPlaying(false);

    audio.addEventListener('waiting', onWaiting);
    audio.addEventListener('canplay', onCanPlay);
    audio.addEventListener('playing', onPlaying);
    audio.addEventListener('error', onError);
    audio.addEventListener('pause', onPause);

    return () => {
      audio.removeEventListener('waiting', onWaiting);
      audio.removeEventListener('canplay', onCanPlay);
      audio.removeEventListener('playing', onPlaying);
      audio.removeEventListener('error', onError);
      audio.removeEventListener('pause', onPause);
    };
  }, [audioReady]);

  const savePosition = useCallback(() => {
    if (!audioRef.current) return;
    updateProgressRef.current(Math.floor(audioRef.current.currentTime), {
      trackMode: 'minutes',
      forcePositionSave: true,
    });
  }, []);

  useEffect(() => {
    if (!isPlaying) return;
    const id = window.setInterval(savePosition, 30000);
    return () => window.clearInterval(id);
  }, [isPlaying, savePosition]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handlePlay = async () => {
    if (!audioRef.current || !audioReady) return;
    setLoadError(null);
    try {
      await audioRef.current.play();
      setIsPlaying(true);
      setIsBuffering(false);
    } catch {
      setLoadError('Tap play again to start listening.');
    }
  };

  const handlePause = async () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      savePosition();
      await flushReadingActivity();
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const seekTime = parseFloat(e.target.value);
    setCurrentTime(seekTime);
    if (audioRef.current && audioReady) {
      audioRef.current.currentTime = seekTime;
    }
    updateProgressRef.current(Math.floor(seekTime), {
      trackMode: 'minutes',
      forcePositionSave: true,
    });
  };

  const skip = (delta: number) => {
    const max = displayDuration || audioRef.current?.duration || 0;
    const next = Math.max(0, Math.min(currentTime + delta, max));
    setCurrentTime(next);
    if (audioRef.current && audioReady) {
      audioRef.current.currentTime = next;
    }
    updateProgressRef.current(Math.floor(next), {
      trackMode: 'minutes',
      forcePositionSave: true,
    });
  };

  const formatTime = (seconds: number) => {
    const safe = Number.isFinite(seconds) ? Math.max(0, seconds) : 0;
    const hrs = Math.floor(safe / 3600);
    const mins = Math.floor((safe % 3600) / 60);
    const secs = Math.floor(safe % 60);
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const canPlay = audioReady && !loadError;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-gradient-to-br from-[#141E28] via-[#1A2A3A] to-[#2C3E50] text-white">
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onEnded={async () => {
          setIsPlaying(false);
          setCurrentTime(displayDuration);
          savePosition();
          await flushReadingActivity();
        }}
        preload="auto"
      />

      <header className="flex items-center justify-between px-4 py-3 shrink-0">
        <button
          type="button"
          onClick={async () => {
            savePosition();
            await flushReadingActivity();
            router.back();
          }}
          className="p-2 rounded-full hover:bg-white/10 transition-colors"
          aria-label="Back"
        >
          <ArrowLeft size={22} />
        </button>
        <div className="text-center flex-1 px-2 min-w-0">
          <p className="text-xs uppercase tracking-wider text-[#D4845C]">Audiobook</p>
          <p className="text-sm font-medium truncate opacity-90">{bookTitle}</p>
        </div>
        <div className="w-10" />
      </header>

      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-8 overflow-y-auto">
        <div
          className={`relative w-56 h-56 sm:w-72 sm:h-72 rounded-3xl overflow-hidden shadow-2xl mb-8 ring-1 ring-white/10 transition-transform duration-500 ${
            isPlaying ? 'scale-[1.02]' : 'scale-100'
          }`}
        >
          {coverImage ? (
            <img src={coverImage} alt={bookTitle} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-[#8E735B]/40 flex items-center justify-center">
              <Headphones size={56} className="text-white/70" />
            </div>
          )}
          {isPlaying && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
          )}
        </div>

        <h1 className="text-xl sm:text-2xl font-bold text-center mb-1 max-w-md">{bookTitle}</h1>
        <p className="text-white/55 text-center mb-8">{bookAuthor}</p>

        {loadError && (
          <div className="w-full max-w-md mb-6 rounded-xl bg-red-500/15 border border-red-400/30 px-4 py-3 text-sm text-red-200 text-center">
            {loadError}
          </div>
        )}

        <div className="w-full max-w-md mb-2">
          <div className="flex justify-between text-xs text-white/50 mb-1 tabular-nums">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(displayDuration)}</span>
          </div>
          <input
            type="range"
            min={0}
            max={displayDuration || 1}
            value={Math.min(currentTime, displayDuration || 0)}
            onChange={handleSeek}
            disabled={!canPlay}
            className="w-full h-1.5 bg-white/15 rounded-full appearance-none cursor-pointer disabled:opacity-40 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#B85C38] [&::-webkit-slider-thumb]:shadow-lg"
          />
        </div>

        <p className="text-white/40 text-sm mb-2">{progressPercent}% complete</p>
        {!isLoading && resumedFrom != null && resumedFrom > 0 && (
          <p className="text-white/50 text-xs mb-6">Resumed from {formatTime(resumedFrom)}</p>
        )}
        {(resumedFrom == null || resumedFrom <= 0) && <div className="mb-6" />}

        <div className="flex items-center gap-5 sm:gap-8">
          <button type="button" onClick={() => skip(-15)} disabled={!canPlay} className="p-3 text-white/75 hover:text-white disabled:opacity-30 transition-colors" aria-label="Back 15 seconds">
            <RotateCcw size={26} />
          </button>
          <button type="button" onClick={() => skip(-30)} disabled={!canPlay} className="p-2 text-white/60 hover:text-white disabled:opacity-30" aria-label="Back 30 seconds">
            <SkipBack size={28} />
          </button>

          {isPlaying ? (
            <button type="button" onClick={handlePause} className="p-5 bg-[#B85C38] rounded-full hover:bg-[#A04E2F] transition-all shadow-xl shadow-[#B85C38]/30" aria-label="Pause">
              <Pause size={34} fill="white" />
            </button>
          ) : (
            <button type="button" onClick={handlePlay} disabled={!canPlay} className="p-5 bg-[#B85C38] rounded-full hover:bg-[#A04E2F] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl shadow-[#B85C38]/30" aria-label="Play">
              {canPlay ? <Play size={34} fill="white" className="ml-1" /> : <Loader2 size={34} className="animate-spin" />}
            </button>
          )}

          <button type="button" onClick={() => skip(30)} disabled={!canPlay} className="p-2 text-white/60 hover:text-white disabled:opacity-30" aria-label="Forward 30 seconds">
            <SkipForward size={28} />
          </button>
          <button type="button" onClick={() => skip(15)} disabled={!canPlay} className="p-3 text-white/75 hover:text-white disabled:opacity-30 transition-colors" aria-label="Forward 15 seconds">
            <RotateCw size={26} />
          </button>
        </div>

        {isBuffering && !loadError && (
          <p className="text-xs text-white/35 mt-8">Buffering…</p>
        )}

        <div className="flex items-center gap-3 mt-10 w-full max-w-xs">
          <button
            type="button"
            onClick={() => {
              if (audioRef.current) {
                if (isMuted) {
                  audioRef.current.volume = volume || 1;
                  setIsMuted(false);
                } else {
                  audioRef.current.volume = 0;
                  setIsMuted(true);
                }
              }
            }}
            className="text-white/50 hover:text-white"
          >
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={isMuted ? 0 : volume}
            onChange={(e) => {
              const v = parseFloat(e.target.value);
              setVolume(v);
              if (audioRef.current) audioRef.current.volume = v;
              setIsMuted(v === 0);
            }}
            className="flex-1 h-1 bg-white/15 rounded-full appearance-none cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
}
