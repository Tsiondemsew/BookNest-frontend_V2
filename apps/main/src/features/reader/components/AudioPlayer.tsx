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
  Download,
  ArrowLeft,
  Loader2,
  Headphones,
} from 'lucide-react';
import { useReadingProgress } from '@/hooks/useReadingProgress';
import { getOfflineBookData } from '@/lib/offline/downloadService';

interface AudioPlayerProps {
  bookFormatId: string;
  bookTitle: string;
  bookAuthor: string;
  coverImage: string;
  audioUrl: string;
  totalDuration: number; // in seconds
}

export function AudioPlayer({
  bookFormatId,
  bookTitle,
  bookAuthor,
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

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.volume = volume;
        setIsMuted(false);
      } else {
        audioRef.current.volume = 0;
        setIsMuted(true);
      }
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
    <div className="fixed inset-0 bg-gradient-to-br from-[#1A2A3A] to-[#2C3E50] z-50 flex flex-col">
      {/* Audio Element */}
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        preload="metadata"
      />

      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <button
          onClick={() => router.back()}
          className="p-2 text-white/80 hover:text-white transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        
        <div className="flex items-center gap-2">
          {isOffline && (
            <span className="text-xs bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded flex items-center gap-1">
              <Download size={12} />
              Offline
            </span>
          )}
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="p-2 text-white/80 hover:text-white transition-colors disabled:opacity-50"
          >
            <Download size={20} />
          </button>
        </div>
      </div>

      {/* Cover Art */}
      <div className="flex-1 flex flex-col items-center justify-center px-4">
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

        {/* Volume Control */}
        <div className="flex items-center gap-3 mt-8">
          <button onClick={toggleMute} className="text-white/60 hover:text-white">
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className="w-24 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
}