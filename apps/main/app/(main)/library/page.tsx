'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { BookOpen, Headphones, ArrowRight } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { apiClient } from '@/lib/api/client';
import { useQuery } from '@tanstack/react-query';

interface LibraryItem {
  id: string;
  purchased_at: string;
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
      <div className="container mx-auto px-4 py-16 text-center">
        <BookOpen size={64} className="mx-auto text-gray-300 mb-4" />
        <h1 className="text-2xl font-bold mb-2">My Library</h1>
        <p className="text-gray-600 mb-6">Please login to view your purchased books.</p>
        <Link href="/login" className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg">
          Sign In <ArrowRight size={18} />
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-8">My Library</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-lg animate-pulse">
              <div className="aspect-[2/3] bg-gray-200 rounded-t-lg"></div>
              <div className="p-4 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-red-500">Failed to load your library. Please try again.</p>
      </div>
    );
  }

  if (!library || library.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <BookOpen size={64} className="mx-auto text-gray-300 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Your Library is Empty</h1>
        <p className="text-gray-600 mb-6">You haven't purchased any books yet.</p>
        <Link href="/market" className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg">
          Browse Books <ArrowRight size={18} />
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-2">My Library</h1>
      <p className="text-gray-500 mb-8">Books you've purchased</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {library.map((item) => (
          <Link key={item.id} href={`/reader/${item.book.id}`} className="group">
            <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-[2/3] relative">
                <img
                  src={item.book.cover_image_url}
                  alt={item.book.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2 right-2">
                  <span className="text-xs bg-black/70 text-white px-2 py-1 rounded flex items-center gap-1">
                    {item.format.type === 'PDF' ? <BookOpen size={12} /> : <Headphones size={12} />}
                    {item.format.type}
                  </span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-lg line-clamp-1">{item.book.title}</h3>
                <p className="text-sm text-gray-600 mt-1 line-clamp-1">{item.book.author_name}</p>
                <div className="mt-2 text-xs text-gray-400">
                  Purchased: {new Date(item.purchased_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}