'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useWishlistCount } from '@/features/wishlist/hooks/useWishlist';
import { CartIcon } from '@/features/CartIcon';
function WishlistIcon() {
  const { isAuthenticated } = useAuthStore();
  const { data: count } = useWishlistCount();

  if (!isAuthenticated) {
    return (
      <Link href="/login" className="text-gray-700 hover:text-blue-600">
        <Heart size={20} />
      </Link>
    );
  }

  return (
    <Link href="/wishlist" className="relative text-gray-700 hover:text-blue-600">
      <Heart size={20} />
      {count && count > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
          {count > 9 ? '9+' : count}
        </span>
      )}
    </Link>
  );
}

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoading, isAuthenticated, fetchMe, user } = useAuthStore(); // ✅ Added 'user' here

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-xl font-bold text-gray-900">
              BookNest
            </Link>
            
            <div className="flex items-center gap-6">
              <Link href="/market" className="text-gray-700 hover:text-blue-600">
                Marketplace
              </Link>
              
              {isAuthenticated && (
                <>
                  <Link href="/library" className="text-gray-700 hover:text-blue-600">
                    Library
                  </Link>
                  
                  {/* ✅ Studio link - only for authors and publishers */}
                  {(user?.role === 'author' || user?.role === 'publisher') && (
                    <Link href="/studio" className="text-gray-700 hover:text-blue-600">
                      Studio
                    </Link>
                  )}
                  
                  <WishlistIcon />
                  <CartIcon />
                  <Link href="/profile" className="text-gray-700 hover:text-blue-600">
                    Profile
                  </Link>
                </>
              )}
              
              {!isAuthenticated && (
                <Link href="/login" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>
      
      <main>{children}</main>
    </div>
  );
}