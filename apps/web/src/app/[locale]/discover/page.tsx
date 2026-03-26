'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAuthStore } from '@/stores/authStore';
import { AppShell } from '@/components/AppShell';
import { Search, Filter, Star } from 'lucide-react';

const MOCK_BOOKS = [
  { id: '1', title: 'The Midnight Library', author: 'Matt Haig', price: '199 ETB', rating: 4.8, category: 'Fiction', cover: '/placeholder.svg?height=200&width=120' },
  { id: '2', title: 'Atomic Habits', author: 'James Clear', price: '149 ETB', rating: 4.9, category: 'Self-Help', cover: '/placeholder.svg?height=200&width=120' },
  { id: '3', title: 'Project Hail Mary', author: 'Andy Weir', price: '229 ETB', rating: 4.7, category: 'Sci-Fi', cover: '/placeholder.svg?height=200&width=120' },
  { id: '4', title: 'Educated', author: 'Tara Westover', price: '189 ETB', rating: 4.6, category: 'Biography', cover: '/placeholder.svg?height=200&width=120' },
  { id: '5', title: 'Sapiens', author: 'Yuval Noah Harari', price: '219 ETB', rating: 4.5, category: 'Non-Fiction', cover: '/placeholder.svg?height=200&width=120' },
  { id: '6', title: 'Dune', author: 'Frank Herbert', price: '249 ETB', rating: 4.8, category: 'Sci-Fi', cover: '/placeholder.svg?height=200&width=120' },
  { id: '7', title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', price: '129 ETB', rating: 4.4, category: 'Classic', cover: '/placeholder.svg?height=200&width=120' },
  { id: '8', title: 'Brahmagupta', author: 'Unknown', price: '99 ETB', rating: 4.3, category: 'Mathematics', cover: '/placeholder.svg?height=200&width=120' },
];

export default function DiscoverPage() {
  const params = useParams<{ locale: string }>();
  const locale = params?.locale ?? 'en';
  const t = useTranslations();
  const user = useAuthStore((s) => s.user);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Fiction', 'Sci-Fi', 'Self-Help', 'Biography', 'Non-Fiction', 'Classic'];
  
  const filteredBooks = MOCK_BOOKS.filter((book) => {
    const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         book.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || book.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <AppShell currentTab="market">
      <div className="bg-background">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary/5 to-accent/5 border-b border-border">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              Discover Books
            </h1>

            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by title or author..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-lg border border-border bg-white placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-card border-b border-border">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center gap-3 mb-4">
              <Filter className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm font-semibold text-foreground">Categories:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                    selectedCategory === category
                      ? 'bg-accent text-accent-foreground'
                      : 'bg-muted text-foreground hover:bg-muted/80'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Books Grid */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {filteredBooks.length > 0 ? (
            <>
              <p className="text-sm text-muted-foreground mb-6">
                Showing {filteredBooks.length} {selectedCategory === 'All' ? 'books' : `${selectedCategory} books`}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {filteredBooks.map((book) => (
                  <div
                    key={book.id}
                    className="group bg-white rounded-lg border border-border overflow-hidden hover:shadow-lg transition cursor-pointer"
                  >
                    <div className="relative overflow-hidden bg-muted aspect-[3/4]">
                      <img
                        src={book.cover}
                        alt={book.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition" />
                    </div>
                    <div className="p-4">
                      <h3 className="font-serif-title font-semibold text-foreground line-clamp-2 text-sm md:text-base">
                        {book.title}
                      </h3>
                      <p className="text-xs md:text-sm text-muted-foreground mt-1">{book.author}</p>
                      
                      {/* Rating */}
                      <div className="flex items-center gap-1 mt-2">
                        <Star className="w-4 h-4 fill-accent text-accent" />
                        <span className="text-xs font-semibold text-foreground">{book.rating}</span>
                      </div>

                      <div className="flex justify-between items-center mt-4">
                        <p className="font-bold text-accent text-sm md:text-base">{book.price}</p>
                        <button className="px-3 py-1.5 rounded-lg bg-accent text-accent-foreground text-xs md:text-sm font-medium hover:opacity-90 transition">
                          Buy via Chapa
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No books found matching your search.</p>
            </div>
          )}
        </section>

        {/* Footer */}
        <footer className="bg-foreground text-foreground/50 border-t border-border mt-12">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-sm">
            <p>&copy; 2024 BookNest. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </AppShell>
  );
}
