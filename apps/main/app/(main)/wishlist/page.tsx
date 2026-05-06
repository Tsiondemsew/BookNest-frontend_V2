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
      <div className="max-w-4xl mx-auto text-center py-16">
        <Heart size={64} className="mx-auto text-[#4A5568] mb-4" />
        <h1 className="text-2xl font-bold text-[#1A2A3A] mb-2">Your Wishlist</h1>
        <p className="text-[#4A5568] mb-6">Please log in to view and manage your wishlist.</p>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#2C3E50] text-white rounded-lg hover:bg-[#1A2A3A] transition-colors"
        >
          Sign In
          <ArrowRight size={18} />
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-[#1A2A3A] mb-2">My Wishlist</h1>
        <p className="text-[#4A5568] mb-8">Books you've saved for later</p>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex gap-5 p-5 bg-white rounded-xl border border-[#E8E2D9] animate-pulse">
              <div className="w-24 h-32 bg-[#E8E2D9] rounded-lg"></div>
              <div className="flex-1 space-y-2">
                <div className="h-5 bg-[#E8E2D9] rounded w-1/3"></div>
                <div className="h-4 bg-[#E8E2D9] rounded w-1/4"></div>
                <div className="h-3 bg-[#E8E2D9] rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-16">
        <p className="text-red-500">Failed to load wishlist. Please try again.</p>
      </div>
    );
  }

  if (wishlist.length === 0) {
    return (
      <div className="text-center py-16">
        <Heart size={64} className="mx-auto text-[#4A5568] mb-4" />
        <h1 className="text-2xl font-bold text-[#1A2A3A] mb-2">Your Wishlist is Empty</h1>
        <p className="text-[#4A5568] mb-6">Save books you love to your wishlist and they'll appear here.</p>
        <Link
          href="/market"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#2C3E50] text-white rounded-lg hover:bg-[#1A2A3A] transition-colors"
        >
          <ShoppingBag size={18} />
          Browse Books
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1A2A3A]">My Wishlist</h1>
          <p className="text-[#4A5568] text-sm mt-1">
            {total} {total === 1 ? 'book' : 'books'} saved for later
          </p>
        </div>
        <Link
          href="/market"
          className="text-[#B85C38] hover:text-[#8E735B] text-sm font-medium flex items-center gap-1 transition-colors"
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