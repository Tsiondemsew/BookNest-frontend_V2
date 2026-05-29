'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { authApi, cartApi } from '@/lib/api/client';

interface Genre {
  id: string;
  name: string;
  slug: string;
}

interface GenreSelectionProps {
  genres: Genre[];
}

export function GenreSelection({ genres }: GenreSelectionProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuthStore();
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get pending action from URL
  const pendingAction = searchParams.get('action');
  const pendingBookFormatId = searchParams.get('book_format_id');
  const pendingRedirect = searchParams.get('redirect') || '/';

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

  const executePendingAction = async () => {
    if (pendingAction === 'add-to-cart' && pendingBookFormatId) {
      try {
        await cartApi.addToCart(pendingBookFormatId);
        router.push('/cart');
        return true;
      } catch (err) {
        console.error('Failed to add to cart after onboarding:', err);
      }
    }
    
    if (pendingAction === 'buy' && pendingBookFormatId) {
      router.push(`/checkout?book_format_id=${pendingBookFormatId}`);
      return true;
    }
    
    return false;
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
      
      // Execute pending action if any
      const actionExecuted = await executePendingAction();
      
      if (!actionExecuted) {
        router.push(pendingRedirect);
      }
    } catch (err: any) {
      console.error('Save error:', err);
      setError(err.message || 'Failed to save your preferences');
    } finally {
      setIsSubmitting(false);
    }
  };

  const skip = async () => {
    // Still execute pending action even if skipping genres
    const actionExecuted = await executePendingAction();
    if (!actionExecuted) {
      router.push(pendingRedirect);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold text-center mb-2">
          Choose Your Favorite Genres
        </h1>
        <p className="text-center text-gray-600 mb-6">
          Select 1-5 genres to personalize your BookNest experience
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
          {genres.map((genre) => (
            <button
              key={genre.id}
              type="button"
              onClick={() => toggleGenre(genre.id)}
              className={`
                p-3 rounded-lg border-2 text-center transition-all
                ${selectedGenres.includes(genre.id)
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }
              `}
            >
              <span className="text-sm font-medium">{genre.name}</span>
            </button>
          ))}
        </div>

        <div className="text-center text-sm text-gray-500 mb-6">
          Selected: {selectedGenres.length} / 5
        </div>

        <div className="flex gap-4">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : 'Continue'}
          </button>
          <button
            onClick={skip}
            className="py-2 px-4 text-gray-600 hover:text-gray-800"
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
}