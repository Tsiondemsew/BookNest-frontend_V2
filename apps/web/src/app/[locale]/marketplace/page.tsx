'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useAuthStore } from '@/stores/authStore';
import Link from 'next/link';

const MARKETPLACE_BOOKS = [
  {
    id: '1',
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    price: 4.99,
    seller: 'Alice Store',
    rating: 4.8,
    reviews: 156,
    cover: '📕',
    condition: 'Like New',
    format: 'eBook',
  },
  {
    id: '2',
    title: 'To Kill a Mockingbird',
    author: 'Harper Lee',
    price: 5.99,
    seller: 'Classic Books',
    rating: 4.9,
    reviews: 203,
    cover: '📗',
    condition: 'Good',
    format: 'eBook',
  },
  {
    id: '3',
    title: 'Pride and Prejudice',
    author: 'Jane Austen',
    price: 3.99,
    seller: 'Literary Collections',
    rating: 4.7,
    reviews: 89,
    cover: '📘',
    condition: 'Very Good',
    format: 'eBook',
  },
  {
    id: '4',
    title: 'Dune',
    author: 'Frank Herbert',
    price: 6.99,
    seller: 'Sci-Fi Vault',
    rating: 4.9,
    reviews: 312,
    cover: '📙',
    condition: 'Like New',
    format: 'eBook',
  },
  {
    id: '5',
    title: 'Sapiens',
    author: 'Yuval Noah Harari',
    price: 7.99,
    seller: 'Knowledge Hub',
    rating: 4.6,
    reviews: 178,
    cover: '📕',
    condition: 'New',
    format: 'eBook',
  },
  {
    id: '6',
    title: 'Educated',
    author: 'Tara Westover',
    price: 6.99,
    seller: 'Biography Store',
    rating: 4.8,
    reviews: 245,
    cover: '📗',
    condition: 'Like New',
    format: 'eBook',
  },
];

export default function MarketplacePage() {
  const t = useTranslations();
  const params = useParams<{ locale: string }>();
  const locale = params?.locale ?? 'en';
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'price-low' | 'price-high' | 'rating'>('rating');
  const [cart, setCart] = useState<string[]>([]);

  const filteredBooks = MARKETPLACE_BOOKS.filter((book) =>
    searchQuery === '' ||
    book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    book.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedBooks = [...filteredBooks].sort((a, b) => {
    if (sortBy === 'price-low') return a.price - b.price;
    if (sortBy === 'price-high') return b.price - a.price;
    return b.rating - a.rating;
  });

  const handleAddToCart = (bookId: string) => {
    setCart([...cart, bookId]);
  };

  const handleRemoveFromCart = (bookId: string) => {
    setCart(cart.filter((id) => id !== bookId));
  };

  const totalPrice = cart.reduce((sum, id) => {
    const book = MARKETPLACE_BOOKS.find((b) => b.id === id);
    return sum + (book?.price || 0);
  }, 0);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>{t('common.loading')}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold text-gray-900">BookNest</h1>
            <nav className="flex gap-4">
              <Link href={`/${locale}/discover`} className="text-gray-600 hover:text-gray-900">
                {t('nav.discover')}
              </Link>
              <Link href={`/${locale}/library`} className="text-gray-600 hover:text-gray-900">
                {t('nav.library')}
              </Link>
              <Link href={`/${locale}/marketplace`} className="font-bold text-blue-600">
                Marketplace
              </Link>
              <Link href={`/${locale}/profile`} className="text-gray-600 hover:text-gray-900">
                {t('nav.profile')}
              </Link>
            </nav>
          </div>

          {/* Search and Filter */}
          <div className="flex gap-4 flex-col md:flex-row">
            <input
              type="text"
              placeholder="Search books..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="rating">Highest Rated</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Books Grid */}
          <div className="lg:col-span-3">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Available Books</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {sortedBooks.map((book) => (
                <div
                  key={book.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition"
                >
                  <div className="h-40 bg-gradient-to-br from-blue-200 to-indigo-200 flex items-center justify-center text-5xl">
                    {book.cover}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-lg text-gray-900 truncate">{book.title}</h3>
                    <p className="text-gray-600 text-sm truncate">{book.author}</p>

                    {/* Rating */}
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-yellow-500">⭐ {book.rating}</span>
                      <span className="text-xs text-gray-600">({book.reviews})</span>
                    </div>

                    {/* Metadata */}
                    <div className="mt-2 text-xs text-gray-600 space-y-1">
                      <p>Format: {book.format}</p>
                      <p>Condition: {book.condition}</p>
                      <p>Seller: {book.seller}</p>
                    </div>

                    {/* Price and Action */}
                    <div className="mt-4 flex justify-between items-center">
                      <span className="text-2xl font-bold text-blue-600">${book.price.toFixed(2)}</span>
                      <button
                        onClick={() =>
                          cart.includes(book.id)
                            ? handleRemoveFromCart(book.id)
                            : handleAddToCart(book.id)
                        }
                        className={`px-4 py-2 rounded font-medium transition ${
                          cart.includes(book.id)
                            ? 'bg-red-600 text-white hover:bg-red-700'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                      >
                        {cart.includes(book.id) ? '✓ In Cart' : 'Add to Cart'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cart Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-20">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Shopping Cart</h3>

              {cart.length === 0 ? (
                <p className="text-gray-600 text-center py-8">Your cart is empty</p>
              ) : (
                <>
                  <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                    {cart.map((bookId) => {
                      const book = MARKETPLACE_BOOKS.find((b) => b.id === bookId);
                      if (!book) return null;
                      return (
                        <div
                          key={bookId}
                          className="flex justify-between items-start border-b pb-2"
                        >
                          <div>
                            <p className="font-medium text-sm text-gray-900 truncate">
                              {book.title}
                            </p>
                            <p className="text-xs text-gray-600">${book.price.toFixed(2)}</p>
                          </div>
                          <button
                            onClick={() => handleRemoveFromCart(bookId)}
                            className="text-red-600 hover:text-red-700 text-sm"
                          >
                            Remove
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center mb-4">
                      <span className="font-semibold text-gray-900">Total:</span>
                      <span className="text-2xl font-bold text-blue-600">
                        ${totalPrice.toFixed(2)}
                      </span>
                    </div>
                    <button className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition">
                      Proceed to Checkout
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
