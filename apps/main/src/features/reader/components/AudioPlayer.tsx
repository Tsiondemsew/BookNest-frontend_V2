'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Download,
  ArrowLeft,
  Loader2,
  Headphones,
  Minus,
  Plus,
  PanelRightClose,
  PanelRightOpen,
} from 'lucide-react';
import { useReadingProgress } from '@/hooks/useReadingProgress';
import { getOfflineBookData } from '@/lib/offline/downloadService';

const VOLUME_STEP = 0.05;

interface AudioPlayerProps {
  bookFormatId: string;
  bookTitle: string;
  bookAuthor: string;
  bookDescription?: string | null;
  coverImage: string;
  audioUrl: string;
  totalDuration: number; // in seconds
}

export function AudioPlayer({
  bookFormatId,
  bookTitle,
  bookAuthor,
  bookDescription,
  coverImage,
  audioUrl,
  totalDuration,
}: AudioPlayerProps) {
  const router = useRouter();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(totalDuration);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [isDownloading, setIsDownloading] = useState(false);
  const [audioBlobUrl, setAudioBlobUrl] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Progress tracking
  const { progressPercent, lastPosition, updateProgress } = useReadingProgress({
    bookFormatId,
    total: totalDuration,
    onComplete: () => {
      console.log('Book completed!');
    },
  });

  // Load audio from offline storage or network
  useEffect(() => {
    const loadAudio = async () => {
      setIsLoading(true);

      try {
        let audioData: ArrayBuffer | null = null;

        // Try to get from offline storage first
        const offlineData = await getOfflineBookData(bookFormatId);
        if (offlineData) {
          console.log('Loading audio from offline storage');
          audioData = offlineData;
          setIsOffline(true);
        } else if (audioUrl && !isOffline) {
          console.log('Loading audio from network');
          const response = await fetch(audioUrl, { credentials: 'include' });
          audioData = await response.arrayBuffer();
        } else {
          throw new Error('No offline data and no network connection');
        }

        // Create blob URL
        const blob = new Blob([audioData], { type: 'audio/mpeg' });
        const blobUrl = URL.createObjectURL(blob);
        setAudioBlobUrl(blobUrl);

        setIsLoading(false);
      } catch (error) {
        console.error('Failed to load audio:', error);
        setIsLoading(false);
        alert('Failed to load audio. Please check your connection and try again.');
      }
    };

    loadAudio();

    return () => {
      if (audioBlobUrl) {
        URL.revokeObjectURL(audioBlobUrl);
      }
    };
  }, [bookFormatId, audioUrl, isOffline]);

  // Set up audio element
  useEffect(() => {
    if (audioRef.current && audioBlobUrl) {
      audioRef.current.src = audioBlobUrl;
      audioRef.current.load();
      
      // Restore last position if exists
      if (lastPosition > 0 && lastPosition < totalDuration) {
        audioRef.current.currentTime = lastPosition;
        setCurrentTime(lastPosition);
      }
    }
  }, [audioBlobUrl, lastPosition, totalDuration]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const time = audioRef.current.currentTime;
      setCurrentTime(time);
      updateProgress(Math.floor(time));
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
      setIsLoading(false);
    }
  };

  const handlePlay = () => {
    if (audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handlePause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const seekTime = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = seekTime;
      setCurrentTime(seekTime);
    }
  };

  const applyVolume = useCallback((next: number) => {
    const clamped = Math.min(1, Math.max(0, Math.round(next * 100) / 100));
    setVolume(clamped);
    setIsMuted(clamped === 0);
    if (audioRef.current) audioRef.current.volume = clamped;
  }, []);

  const adjustVolume = (delta: number) => {
    applyVolume((isMuted ? 0 : volume) + delta);
  };

  const toggleMute = () => {
    if (isMuted) {
      applyVolume(volume > 0 ? volume : VOLUME_STEP);
    } else {
      setIsMuted(true);
      if (audioRef.current) audioRef.current.volume = 0;
    }
  };

  const chapters = useMemo(() => {
    const total = duration > 0 ? duration : totalDuration;
    if (!total) return [];
    const count = Math.min(12, Math.max(4, Math.floor(total / 600)));
    const seg = total / count;
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      title: `Chapter ${i + 1}`,
      start: i * seg,
    }));
  }, [duration, totalDuration]);

  const seekTo = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const skipForward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.min(audioRef.current.currentTime + 15, duration);
    }
  };

  const skipBackward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(audioRef.current.currentTime - 15, 0);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(duration);
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    alert('Download functionality coming soon');
    setIsDownloading(false);
  };

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-[#1A2A3A] to-[#2C3E50]">
        <div className="text-center">
          <Loader2 size={48} className="animate-spin text-[#B85C38] mx-auto mb-4" />
          <p className="text-white">Loading audio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex bg-gradient-to-br from-[#1A2A3A] to-[#2C3E50]">
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        preload="metadata"
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={() => router.back()}
            className="p-2 text-white/80 transition-colors hover:text-white"
          >
            <ArrowLeft size={24} />
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSidebarOpen((o) => !o)}
              className="flex items-center gap-1 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-semibold text-white lg:hidden"
            >
              {sidebarOpen ? <PanelRightClose size={16} /> : <PanelRightOpen size={16} />}
              Content
            </button>
            {isOffline && (
              <span className="flex items-center gap-1 rounded bg-yellow-500/20 px-2 py-1 text-xs text-yellow-300">
                <Download size={12} />
                Offline
              </span>
            )}
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="p-2 text-white/80 transition-colors hover:text-white disabled:opacity-50"
            >
              <Download size={20} />
            </button>
          </div>
        </div>

        <div className="flex flex-1 flex-col items-center justify-center px-4">
        <div className="w-64 h-64 md:w-80 md:h-80 rounded-2xl shadow-2xl overflow-hidden mb-8">
          {coverImage ? (
            <img
              src={coverImage}
              alt={bookTitle}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-[#8E735B] flex items-center justify-center">
              <Headphones size={64} className="text-white" />
            </div>
          )}
        </div>

        <h1 className="text-xl md:text-2xl font-bold text-white text-center mb-2">
          {bookTitle}
        </h1>
        <p className="text-white/60 text-center mb-8">{bookAuthor}</p>

        {/* Progress Bar */}
        <div className="w-full max-w-md mb-4">
          <div className="flex justify-between text-xs text-white/60 mb-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
          <input
            type="range"
            min={0}
            max={duration}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#B85C38]"
          />
        </div>

        {/* Progress Percentage */}
        <div className="text-white/40 text-sm mb-4">
          {progressPercent}% complete
        </div>

        {/* Controls */}
        <div className="flex items-center gap-6">
          <button
            onClick={skipBackward}
            className="p-3 text-white/80 hover:text-white transition-colors"
          >
            <SkipBack size={28} />
          </button>

          {isPlaying ? (
            <button
              onClick={handlePause}
              className="p-4 bg-[#B85C38] rounded-full hover:bg-[#8E735B] transition-colors shadow-lg"
            >
              <Pause size={32} fill="white" />
            </button>
          ) : (
            <button
              onClick={handlePlay}
              className="p-4 bg-[#B85C38] rounded-full hover:bg-[#8E735B] transition-colors shadow-lg"
            >
              <Play size={32} fill="white" />
            </button>
          )}

          <button
            onClick={skipForward}
            className="p-3 text-white/80 hover:text-white transition-colors"
          >
            <SkipForward size={28} />
          </button>
        </div>

        <div className="mt-8 flex items-center gap-2 rounded-full bg-white/10 px-3 py-2">
          <button
            type="button"
            aria-label="Decrease volume"
            onClick={() => adjustVolume(-VOLUME_STEP)}
            className="rounded-full p-2 text-white/80 transition hover:bg-white/10 hover:text-white"
          >
            <Minus size={20} />
          </button>
          <button
            type="button"
            onClick={toggleMute}
            className="rounded-full p-2 text-white/80 transition hover:bg-white/10 hover:text-white"
          >
            {isMuted || volume === 0 ? <VolumeX size={22} /> : <Volume2 size={22} />}
          </button>
          <span className="min-w-[3rem] text-center text-sm font-semibold tabular-nums text-white">
            {Math.round((isMuted ? 0 : volume) * 100)}%
          </span>
          <button
            type="button"
            aria-label="Increase volume"
            onClick={() => adjustVolume(VOLUME_STEP)}
            className="rounded-full p-2 text-white/80 transition hover:bg-white/10 hover:text-white"
          >
            <Plus size={20} />
          </button>
        </div>
        </div>
      </div>

      <aside
        className={`flex w-full shrink-0 flex-col border-white/10 bg-[#152535]/95 text-white lg:w-80 lg:border-l ${
          sidebarOpen ? 'max-h-[45vh] border-t lg:max-h-none' : 'hidden lg:flex'
        }`}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <p className="text-xs font-bold uppercase tracking-wider text-white/50">Audio content</p>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="rounded p-1 text-white/60 hover:bg-white/10 lg:inline"
            aria-label="Hide content sidebar"
          >
            <PanelRightClose size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-4">
          <h2 className="text-lg font-bold leading-snug">{bookTitle}</h2>
          <p className="mt-1 text-sm text-white/60">{bookAuthor}</p>
          <p className="mt-3 text-xs text-white/40">
            {progressPercent}% complete · {formatTime(currentTime)} / {formatTime(duration)}
          </p>

          {bookDescription && (
            <div className="mt-4 rounded-xl bg-white/5 p-3">
              <p className="text-[10px] font-bold uppercase tracking-wide text-white/50">About</p>
              <p className="mt-2 max-h-48 overflow-y-auto text-sm leading-relaxed text-white/80">
                {bookDescription}
              </p>
            </div>
          )}

          {chapters.length > 0 && (
            <div className="mt-4">
              <p className="text-[10px] font-bold uppercase tracking-wide text-white/50">Sections</p>
              <ul className="mt-2 space-y-1">
                {chapters.map((ch, i) => {
                  const nextStart = chapters[i + 1]?.start ?? duration + 1;
                  const active = currentTime >= ch.start && currentTime < nextStart;
                  return (
                    <li key={ch.id}>
                      <button
                        type="button"
                        onClick={() => {
                          seekTo(ch.start);
                          handlePlay();
                        }}
                        className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition ${
                          active ? 'bg-[#B85C38]/40 text-white' : 'hover:bg-white/10 text-white/80'
                        }`}
                      >
                        <span>{ch.title}</span>
                        <span className="text-xs text-white/50">{formatTime(ch.start)}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}