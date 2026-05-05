'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Heart, ShoppingBag, ArrowRight } from 'lucide-react';
import { useWishlist } from '@/features/wishlist/hooks/useWishlist';
import { WishlistItemComponent } from '@/features/wishlist/components/WishlistItem';
import { useAuthStore } from '@/stores/authStore';

export default function WishlistPage() {
  const [page] = useState(1);
  const limit = 20;
  
  const { isAuthenticated } = useAuthStore();
  const { data, isLoading, isError } = useWishlist(page, limit);

  const wishlist = data?.items || [];
  const total = data?.pagination?.total || 0;

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Heart size={64} className="mx-auto text-gray-300 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Your Wishlist</h1>
        <p className="text-gray-600 mb-6">
          Please log in to view and manage your wishlist.
        </p>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Sign In
          <ArrowRight size={18} />
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">My Wishlist</h1>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex gap-4 p-4 bg-gray-100 rounded-lg animate-pulse">
              <div className="w-24 h-32 bg-gray-200 rounded"></div>
              <div className="flex-1 space-y-2">
                <div className="h-5 bg-gray-200 rounded w-1/3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
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
        <p className="text-red-500">Failed to load wishlist. Please try again.</p>
      </div>
    );
  }

  if (wishlist.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Heart size={64} className="mx-auto text-gray-300 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Your Wishlist is Empty</h1>
        <p className="text-gray-600 mb-6">
          Save books you love to your wishlist and they'll appear here.
        </p>
        <Link
          href="/market"
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <ShoppingBag size={18} />
          Browse Books
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">My Wishlist</h1>
          <p className="text-gray-500 text-sm mt-1">
            {total} {total === 1 ? 'book' : 'books'} saved
          </p>
        </div>
        <Link
          href="/market"
          className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
        >
          Continue Shopping
          <ArrowRight size={16} />
        </Link>
      </div>

      <div className="space-y-4">
        {wishlist.map((item) => (
          <WishlistItemComponent key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}