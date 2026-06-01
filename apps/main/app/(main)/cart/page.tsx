'use client';

import Link from 'next/link';
import { Trash2, ArrowRight, ShoppingBag, CreditCard } from 'lucide-react';
import { useCart } from '@/features/cart/hooks/useCart';
import { useAuthStore } from '@/stores/authStore';
import { useTranslation } from '@/hooks/useTranslation';

export default function CartPage() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuthStore();
  const { cart, isLoading, removeItem } = useCart();

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <ShoppingBag size={64} className="mx-auto text-[#4A5568] mb-4" />
        <h1 className="text-2xl font-bold text-[#1A2A3A] mb-2">{t('pages.shoppingCart')}</h1>
        <p className="text-[#4A5568] mb-6">{t('cart.loginPrompt')}</p>
        <Link href="/login" className="inline-flex items-center gap-2 px-6 py-3 bg-[#2C3E50] text-white rounded-lg hover:bg-[#1A2A3A] transition-colors">
          {t('common.signIn')} <ArrowRight size={18} />
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-[#1A2A3A] mb-6">{t('pages.shoppingCart')}</h1>
        <div className="space-y-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex gap-4 p-4 bg-white rounded-xl border border-[#E8E2D9] animate-pulse">
              <div className="w-24 h-32 bg-[#E8E2D9] rounded-lg"></div>
              <div className="flex-1 space-y-2">
                <div className="h-5 bg-[#E8E2D9] rounded w-1/3"></div>
                <div className="h-4 bg-[#E8E2D9] rounded w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!cart?.items || cart.items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto text-center py-16">
        <ShoppingBag size={64} className="mx-auto text-[#4A5568] mb-4" />
        <h1 className="text-2xl font-bold text-[#1A2A3A] mb-2">{t('cart.emptyTitle')}</h1>
        <p className="text-[#4A5568] mb-6">{t('cart.emptyDesc')}</p>
        <Link href="/market" className="inline-flex items-center gap-2 px-6 py-3 bg-[#2C3E50] text-white rounded-lg hover:bg-[#1A2A3A] transition-colors">
          {t('common.browseBooks')} <ArrowRight size={18} />
        </Link>
      </div>
    );
  }

  const itemCount = cart.items.length;

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-[#1A2A3A] mb-6">{t('pages.shoppingCart')}</h1>

      <div className="space-y-4">
        {cart.items.map((item) => {
          const book = item.book_format?.book;
          const price = item.book_format?.price || 0;

          return (
            <div key={item.id} className="flex gap-4 p-4 bg-white rounded-xl border border-[#E8E2D9] shadow-sm hover:shadow-md transition-all">
              <img
                src={book?.cover_image_url || '/placeholder-book.jpg'}
                alt={book?.title || 'Book'}
                className="w-24 h-32 object-cover rounded-lg"
              />

              <div className="flex-1">
                <div className="flex justify-between">
                  <div>
                    <h3 className="font-semibold text-[#1A2A3A] text-lg">{book?.title || t('common.unknownBook')}</h3>
                    <p className="text-sm text-[#4A5568]">{book?.author_name || t('common.unknownAuthor')}</p>
                    <div className="mt-1">
                      <span className="text-xs bg-[#F5F1EB] text-[#4A5568] px-2 py-1 rounded-md">
                        {item.book_format?.format_type || 'Unknown Format'}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-[#4A5568] hover:text-red-500 transition-colors"
                    aria-label={t('common.removeFromCart')}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <p className="font-bold text-lg text-[#2C3E50] mt-4">
                  {price.toFixed(2)} ETB
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 border-t border-[#E8E2D9] pt-6 space-y-4">
        <div className="flex justify-between text-xl font-bold text-[#1A2A3A]">
          <span>
            {t('cart.totalItems', {
              count: itemCount,
              unit: itemCount === 1 ? t('common.item') : t('common.items'),
            })}
          </span>
          <span>{cart.total.toFixed(2)} ETB</span>
        </div>
        <p className="text-sm text-[#4A5568]">
          {t('cart.paymentNote')}
        </p>
        <Link
          href="/checkout?from_cart=1"
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#B85C38] px-6 py-3 text-base font-medium text-white transition-colors hover:bg-[#8E735B] sm:w-auto sm:min-w-[240px]"
        >
          <CreditCard size={20} />
          {t('cart.proceedCheckout')}
        </Link>
      </div>
    </div>
  );
}
