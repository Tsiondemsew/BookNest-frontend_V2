'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { booksApi, authApi } from '@/lib/api/client';
import {
  completeAuthContinuation,
  readPendingActionFromSearchParams,
} from '@/lib/auth/pendingAuthAction';
import { BookOpen, ChevronRight, SkipForward, Globe, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface Genre {
  id: string;
  name: string;
  slug: string;
}

function GenresPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { redirect: afterSaveRedirect, action, bookFormatIds } =
    readPendingActionFromSearchParams(searchParams);
  const { isAuthenticated, isInitializing: authLoading, user } = useAuthStore();
  const [genres, setGenres] = useState<Genre[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const payload = await booksApi.getGenres();
        setGenres(payload.data || []);
      } catch (err) {
        console.error('Failed to load genres:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGenres();
  }, []);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  const toggleGenre = (genreId: string) => {
    setSelectedGenres(prev => {
      if (prev.includes(genreId)) {
        setError(null);
        return prev.filter(id => id !== genreId);
      }
      if (prev.length >= 5) {
        setError('You can select up to 5 genres only');
        return prev;
      }
      setError(null);
      return [...prev, genreId];
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedGenres.length === 0) {
      setError('Please select at least one genre');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await authApi.favoriteGenres({ genre_ids: selectedGenres });
      if (user) {
        await completeAuthContinuation(router, searchParams, user);
      } else {
        router.push(afterSaveRedirect);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save your preferences');
    } finally {
      setIsSubmitting(false);
    }
  };

  const skip = async () => {
    if (user) {
      await completeAuthContinuation(router, searchParams, user);
    } else {
      router.push(afterSaveRedirect);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-[#B85C38] animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col">
      {/* Header */}
      <header className="border-b border-[#E8E2D9] bg-white">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-[#B85C38]" />
            <span className="text-xl font-bold text-[#1A2A3A]">BookNest</span>
          </Link>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="max-w-2xl w-full">
          <div className="bg-white rounded-2xl shadow-sm border border-[#E8E2D9] p-8">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-[#1A2A3A]">Choose your favorite genres</h1>
              <p className="text-[#4A5568] mt-2">
                Pick 1–5 genres so we can personalize your feed. You can skip and do this later.
              </p>
            </div>

            {error && (
              <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm text-center">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-8">
              {genres.map((genre) => (
                <button
                  key={genre.id}
                  type="button"
                  onClick={() => toggleGenre(genre.id)}
                  className={`
                    py-3 px-4 rounded-xl text-center font-medium transition-all
                    ${selectedGenres.includes(genre.id)
                      ? 'bg-[#2C3E50] text-white shadow-md'
                      : 'bg-[#F5F1EB] text-[#1A2A3A] hover:bg-[#E8E2D9]'
                    }
                  `}
                >
                  {genre.name}
                </button>
              ))}
            </div>

            <div className="text-center mb-6">
              <p className="text-sm text-[#4A5568]">
                Selected: <span className="font-semibold text-[#1A2A3A]">{selectedGenres.length}</span> / 5
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 py-3 bg-[#2C3E50] text-white rounded-xl font-medium hover:bg-[#1A2A3A] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    Continue
                    <ChevronRight size={18} />
                  </>
                )}
              </button>
              <button
                onClick={skip}
                className="py-3 px-6 text-[#4A5568] hover:text-[#1A2A3A] transition-colors flex items-center justify-center gap-1"
              >
                <SkipForward size={16} />
                Skip for now
              </button>
            </div>
          </div>

          <div className="mt-4 text-center">
            <button className="inline-flex items-center gap-1 text-sm text-[#4A5568] hover:text-[#B85C38] transition-colors">
              <Globe size={14} />
              <span>English</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function GenresPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
          <Loader2 className="w-10 h-10 text-[#B85C38] animate-spin" />
        </div>
      }
    >
      <GenresPageContent />
    </Suspense>
  );
}