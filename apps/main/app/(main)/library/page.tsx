'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { BookOpen, Headphones, ArrowRight, Clock, CheckCircle } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { apiClient } from '@/lib/api/client';
import { useQuery } from '@tanstack/react-query';

interface LibraryItem {
  id: string;
  purchased_at: string;
  last_read?: string;
  progress?: number;
  format: {
    id: string;
    type: 'PDF' | 'Audio';
    price: number;
    currency: string;
    storage_path: string;
  };
  book: {
    id: string;
    title: string;
    subtitle?: string;
    description?: string;
    author_name: string;
    publisher_name?: string;
    cover_image_url: string;
    language: string;
    page_count?: number;
    duration_sec?: number;
  };
}

const fetchLibrary = async (): Promise<LibraryItem[]> => {
  const response = await apiClient.get<{ success: boolean; data: LibraryItem[] }>('/api/library');
  return response.data;
};

export default function LibraryPage() {
  const { isAuthenticated, user } = useAuthStore();
  const { data: library, isLoading, isError, refetch } = useQuery({
    queryKey: ['library'],
    queryFn: fetchLibrary,
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (isAuthenticated) {
      refetch();
    }
  }, [isAuthenticated, refetch]);

  if (!isAuthenticated) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <BookOpen size={64} className="mx-auto text-[#4A5568] mb-4" />
        <h1 className="text-2xl font-bold text-[#1A2A3A] mb-2">My Library</h1>
        <p className="text-[#4A5568] mb-6">Please login to view your purchased books.</p>
        <Link href="/login" className="inline-flex items-center gap-2 px-6 py-3 bg-[#2C3E50] text-white rounded-lg hover:bg-[#1A2A3A] transition-colors">
          Sign In <ArrowRight size={18} />
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1A2A3A] mb-2">My Library</h1>
          <p className="text-[#4A5568] mb-6">Your collection of purchased books</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-[#E8E2D9] overflow-hidden animate-pulse">
              <div className="aspect-[2/3] bg-gradient-to-br from-[#E8E2D9] to-[#D4CCC0]"></div>
              <div className="p-4 space-y-3">
                <div className="h-5 bg-[#E8E2D9] rounded w-3/4"></div>
                <div className="h-4 bg-[#E8E2D9] rounded w-1/2"></div>
                <div className="h-3 bg-[#E8E2D9] rounded w-1/3"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <p className="text-red-500">Failed to load your library. Please try again.</p>
        <button 
          onClick={() => refetch()}
          className="mt-4 px-4 py-2 bg-[#2C3E50] text-white rounded-lg text-sm hover:bg-[#1A2A3A] transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!library || library.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="max-w-md mx-auto">
          <BookOpen size={64} className="mx-auto text-[#4A5568] mb-4" />
          <h1 className="text-2xl font-bold text-[#1A2A3A] mb-2">Your Library is Empty</h1>
          <p className="text-[#4A5568] mb-6">You haven't purchased any books yet. Start your reading journey today!</p>
          <Link href="/market" className="inline-flex items-center gap-2 px-6 py-3 bg-[#2C3E50] text-white rounded-lg hover:bg-[#1A2A3A] transition-colors">
            Browse Marketplace <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    );
  }

  // Calculate stats
  const totalBooks = library.length;
  const recentlyPurchased = library.slice(0, 3);
  const readingStats = {
    totalBooks,
    formats: {
      pdf: library.filter(item => item.format.type === 'PDF').length,
      audio: library.filter(item => item.format.type === 'Audio').length,
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#1A2A3A]">My Library</h1>
        <p className="text-[#4A5568] mt-1">Your collection of purchased books</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-[#E8E2D9] p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#2C3E50]/10 rounded-lg">
              <BookOpen size={20} className="text-[#2C3E50]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#1A2A3A]">{totalBooks}</p>
              <p className="text-xs text-[#4A5568]">Total Books</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-[#E8E2D9] p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#B85C38]/10 rounded-lg">
              <BookOpen size={20} className="text-[#B85C38]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#1A2A3A]">{readingStats.formats.pdf}</p>
              <p className="text-xs text-[#4A5568]">eBooks (PDF)</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-[#E8E2D9] p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#8E735B]/10 rounded-lg">
              <Headphones size={20} className="text-[#8E735B]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#1A2A3A]">{readingStats.formats.audio}</p>
              <p className="text-xs text-[#4A5568]">Audiobooks</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recently Added Section */}
      {recentlyPurchased.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[#1A2A3A]">Recently Added</h2>
            <Link href="/library/all" className="text-sm text-[#B85C38] hover:text-[#8E735B] transition-colors">
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {recentlyPurchased.map((item) => (
              <Link key={item.id} href={`/reader/${item.book.id}`} className="group">
                <div className="flex gap-3 p-3 bg-white rounded-xl border border-[#E8E2D9] hover:border-[#B85C38]/30 hover:shadow-md transition-all">
                  <img
                    src={item.book.cover_image_url}
                    alt={item.book.title}
                    className="w-16 h-20 object-cover rounded-lg"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-[#1A2A3A] text-sm line-clamp-1 group-hover:text-[#B85C38] transition-colors">
                      {item.book.title}
                    </h3>
                    <p className="text-xs text-[#4A5568] mt-0.5 line-clamp-1">{item.book.author_name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs bg-[#F5F1EB] text-[#4A5568] px-1.5 py-0.5 rounded">
                        {item.format.type}
                      </span>
                      {item.last_read && (
                        <span className="text-xs text-[#4A5568] flex items-center gap-1">
                          <Clock size={10} />
                          In progress
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* All Books Grid */}
      <div>
        <h2 className="text-lg font-semibold text-[#1A2A3A] mb-4">All Books</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {library.map((item) => (
            <Link key={item.id} href={`/reader/${item.book.id}`} className="group">
              <div className="bg-white rounded-xl border border-[#E8E2D9] overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="aspect-[2/3] relative overflow-hidden bg-[#F5F1EB]">
                  <img
                    src={item.book.cover_image_url}
                    alt={item.book.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-400"
                  />
                  {/* Format Badge */}
                  <div className="absolute top-2 right-2">
                    <span className="text-xs bg-white/90 backdrop-blur-sm text-[#2C3E50] px-2 py-1 rounded-md flex items-center gap-1 shadow-sm">
                      {item.format.type === 'PDF' ? <BookOpen size={12} /> : <Headphones size={12} />}
                      {item.format.type}
                    </span>
                  </div>
                  {/* Progress Indicator */}
                  {item.progress && item.progress > 0 && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/30">
                      <div 
                        className="h-full bg-[#B85C38]" 
                        style={{ width: `${item.progress}%` }}
                      ></div>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-[#1A2A3A] text-base line-clamp-1 group-hover:text-[#B85C38] transition-colors">
                    {item.book.title}
                  </h3>
                  <p className="text-sm text-[#4A5568] mt-1 line-clamp-1">{item.book.author_name}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <p className="text-xs text-[#4A5568]">
                      Purchased: {new Date(item.purchased_at).toLocaleDateString()}
                    </p>
                    <span className="text-sm text-[#B85C38] font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      Read →
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}