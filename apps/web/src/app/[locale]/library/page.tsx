'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAuthStore } from '@/stores/authStore';
import { AppShell } from '@/components/AppShell';
import { BookOpen, CheckCircle, Clock } from 'lucide-react';

const MOCK_LIBRARY = [
  { id: '1', title: 'The Midnight Library', author: 'Matt Haig', progress: 45, status: 'reading', cover: '/placeholder.svg?height=200&width=120' },
  { id: '2', title: 'Atomic Habits', author: 'James Clear', progress: 100, status: 'finished', cover: '/placeholder.svg?height=200&width=120' },
  { id: '3', title: 'Project Hail Mary', author: 'Andy Weir', progress: 67, status: 'reading', cover: '/placeholder.svg?height=200&width=120' },
  { id: '4', title: 'Educated', author: 'Tara Westover', progress: 100, status: 'finished', cover: '/placeholder.svg?height=200&width=120' },
  { id: '5', title: 'Sapiens', author: 'Yuval Noah Harari', progress: 23, status: 'reading', cover: '/placeholder.svg?height=200&width=120' },
];

export default function LibraryPage() {
  const params = useParams<{ locale: string }>();
  const locale = params?.locale ?? 'en';
  const t = useTranslations();
  const user = useAuthStore((s) => s.user);
  const [filterStatus, setFilterStatus] = useState<'all' | 'reading' | 'finished'>('all');

  const filteredBooks = filterStatus === 'all' 
    ? MOCK_LIBRARY 
    : MOCK_LIBRARY.filter(book => book.status === filterStatus);

  const finishedCount = MOCK_LIBRARY.filter(b => b.status === 'finished').length;
  const readingCount = MOCK_LIBRARY.filter(b => b.status === 'reading').length;

  return (
    <AppShell currentTab="library">
      <div className="bg-background min-h-screen">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary/5 to-accent/5 border-b border-border">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-6">My Library</h1>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg border border-border p-4">
                <p className="text-sm text-muted-foreground font-medium">Books Owned</p>
                <p className="text-2xl font-bold text-foreground mt-2">{MOCK_LIBRARY.length}</p>
              </div>
              <div className="bg-white rounded-lg border border-border p-4">
                <p className="text-sm text-muted-foreground font-medium">Currently Reading</p>
                <p className="text-2xl font-bold text-accent mt-2">{readingCount}</p>
              </div>
              <div className="bg-white rounded-lg border border-border p-4">
                <p className="text-sm text-muted-foreground font-medium">Finished</p>
                <p className="text-2xl font-bold text-success mt-2">{finishedCount}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-card border-b border-border sticky top-0 z-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex gap-2">
              {[
                { id: 'all', label: 'All Books' },
                { id: 'reading', label: 'Currently Reading' },
                { id: 'finished', label: 'Finished' },
              ].map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setFilterStatus(filter.id as any)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    filterStatus === filter.id
                      ? 'bg-accent text-accent-foreground'
                      : 'bg-muted text-foreground hover:bg-muted/80'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Books List */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="space-y-6">
            {filteredBooks.map((book) => (
              <div key={book.id} className="bg-white rounded-lg border border-border p-6 hover:shadow-md transition">
                <div className="flex gap-4 md:gap-6">
                  {/* Book Cover */}
                  <div className="w-24 h-32 md:w-28 md:h-40 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                    <img
                      src={book.cover}
                      alt={book.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Book Info */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-serif-title font-bold text-lg md:text-xl text-foreground">
                        {book.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">{book.author}</p>

                      {/* Status Badge */}
                      <div className="flex items-center gap-2 mt-3">
                        {book.status === 'reading' ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-semibold">
                            <Clock className="w-3 h-3" />
                            Reading
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-success/10 text-success text-xs font-semibold">
                            <CheckCircle className="w-3 h-3" />
                            Finished
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-4">
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-xs font-semibold text-foreground">{book.progress}% Complete</p>
                        <button className="px-4 py-2 rounded-lg bg-accent text-accent-foreground text-sm font-medium hover:opacity-90 transition">
                          Open Reader
                        </button>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-accent h-full transition-all duration-300"
                          style={{ width: `${book.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredBooks.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No books found in this category.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="bg-foreground text-foreground/50 border-t border-border">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-sm">
            <p>&copy; 2024 BookNest. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </AppShell>
  );
}
