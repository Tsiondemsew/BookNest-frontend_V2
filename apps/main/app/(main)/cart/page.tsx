'use client';

import Link from 'next/link';
import { Trash2, ArrowRight, ShoppingBag, CreditCard } from 'lucide-react';
import { useCart } from '@/features/cart/hooks/useCart';
import { useAuthStore } from '@/stores/authStore';

export default function CartPage() {
  const { isAuthenticated } = useAuthStore();
  const { cart, isLoading, removeItem } = useCart();

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <ShoppingBag size={64} className="mx-auto text-gray-300 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Your Cart</h1>
        <p className="text-gray-600 mb-6">Please login to view your cart.</p>
        <Link href="/login" className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg">
          Sign In <ArrowRight size={18} />
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex gap-4 p-4 bg-gray-100 rounded-lg">
              <div className="w-24 h-32 bg-gray-200 rounded"></div>
              <div className="flex-1 space-y-2">
                <div className="h-5 bg-gray-200 rounded w-1/3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!cart?.items || cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <ShoppingBag size={64} className="mx-auto text-gray-300 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Your Cart is Empty</h1>
        <p className="text-gray-600 mb-6">Add some books to your cart and they'll appear here.</p>
        <Link href="/market" className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg">
          Browse Books <ArrowRight size={18} />
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Shopping Cart</h1>

      <div className="space-y-4">
        {cart.items.map((item) => {
          const book = item.book_format?.book;
          const price = item.book_format?.price || 0;
          const bookFormatId = item.book_format_id;
          
          return (
            <div key={item.id} className="flex gap-4 p-4 bg-white border rounded-lg shadow-sm">
              <img
                src={book?.cover_image_url || '/placeholder-book.jpg'}
                alt={book?.title || 'Book'}
                className="w-24 h-32 object-cover rounded"
              />
              
              <div className="flex-1">
                <div className="flex justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">{book?.title || 'Unknown Book'}</h3>
                    <p className="text-sm text-gray-600">{book?.author_name || 'Unknown Author'}</p>
                    <div className="mt-1">
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {item.book_format?.format_type || 'Unknown Format'}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                
                <div className="flex justify-between items-center mt-4">
                  <p className="font-semibold text-lg">
                    {price.toFixed(2)} ETB
                  </p>
                  <Link
                    href={`/checkout?book_format_id=${bookFormatId}`}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    <CreditCard size={16} />
                    Buy Now
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 border-t pt-6">
        <div className="flex justify-between text-xl font-bold">
          <span>Total</span>
          <span>{cart.total.toFixed(2)} ETB</span>
        </div>
      </div>
    </div>
  );
}