'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingCart, Heart } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useCommerceCounts } from '@/hooks/useCommerceCounts';
import { NavCountBadge } from '@/components/NavCountBadge';

export function HeaderCommerceIcons() {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const { cartCount, wishlistCount } = useCommerceCounts();

  if (user?.role === 'publisher') return null;
  if (pathname?.startsWith('/checkout')) return null;

  return (
    <div className="flex items-center gap-0.5 sm:gap-1">
      <Link
        href="/wishlist"
        className={`relative inline-flex items-center justify-center w-9 h-9 rounded-xl transition-colors ${
          pathname === '/wishlist'
            ? 'bg-[#B85C38]/10 text-[#B85C38]'
            : 'text-[#4A5568] hover:bg-[#F5F1EB] hover:text-[#1A2A3A]'
        }`}
        aria-label={wishlistCount > 0 ? `Wishlist, ${wishlistCount} items` : 'Wishlist'}
        title="Wishlist"
      >
        <Heart size={20} strokeWidth={2} />
        <NavCountBadge count={wishlistCount} overlay />
      </Link>
      <Link
        href="/cart"
        className={`relative inline-flex items-center justify-center w-9 h-9 rounded-xl transition-colors ${
          pathname === '/cart'
            ? 'bg-[#B85C38]/10 text-[#B85C38]'
            : 'text-[#4A5568] hover:bg-[#F5F1EB] hover:text-[#1A2A3A]'
        }`}
        aria-label={cartCount > 0 ? `Cart, ${cartCount} items` : 'Cart'}
        title="Cart"
      >
        <ShoppingCart size={20} strokeWidth={2} />
        <NavCountBadge count={cartCount} overlay />
      </Link>
    </div>
  );
}
