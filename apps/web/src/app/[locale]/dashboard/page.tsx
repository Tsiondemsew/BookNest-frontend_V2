'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/stores/authStore';
import { useTranslations } from 'next-intl';
import { AppShell } from '@/components/AppShell';
import { ArrowRight, Flame } from 'lucide-react';

const FEATURED_BOOKS = [
  { id: '1', title: 'The Midnight Library', author: 'Matt Haig', price: '199 ETB', cover: '/placeholder.svg?height=200&width=120' },
  { id: '2', title: 'Atomic Habits', author: 'James Clear', price: '149 ETB', cover: '/placeholder.svg?height=200&width=120' },
  { id: '3', title: 'Project Hail Mary', author: 'Andy Weir', price: '229 ETB', cover: '/placeholder.svg?height=200&width=120' },
  { id: '4', title: 'Educated', author: 'Tara Westover', price: '189 ETB', cover: '/placeholder.svg?height=200&width=120' },
];

export default function DashboardPage() {
  const params = useParams<{ locale: string }>();
  const locale = params?.locale ?? 'en';
  const t = useTranslations();
  const user = useAuthStore((s) => s.user);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-lg font-semibold mb-4">{t('common.loading')}</p>
          <Link
            href={`/${locale}/login`}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition"
          >
            {t('auth.login')}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <AppShell currentTab="market">
      <div className="bg-background">
        {/* Welcome Section */}
        <section className="bg-gradient-to-r from-primary/5 to-accent/5 border-b border-border">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                Welcome back, {user.displayName}!
              </h2>
              <p className="text-muted-foreground mt-2">{user.email}</p>
              
              {/* Reading Stats */}
              <div className="mt-8 bg-white rounded-lg border border-border p-6 inline-block">
                <div className="flex items-center gap-4">
                  <div className="text-4xl">
                    <Flame className="w-10 h-10 text-accent fill-accent" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground font-medium">Daily Streak</p>
                    <p className="text-3xl font-bold text-accent">7 days</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Books Section */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-2xl font-bold text-foreground">Featured Books</h3>
            <Link
              href={`/${locale}/discover`}
              className="text-accent hover:text-primary font-medium flex items-center gap-2 transition"
            >
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {FEATURED_BOOKS.map((book) => (
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
                </div>
                <div className="p-4">
                  <h4 className="font-serif-title font-semibold text-foreground line-clamp-2 text-sm md:text-base">
                    {book.title}
                  </h4>
                  <p className="text-xs md:text-sm text-muted-foreground mt-1">{book.author}</p>
                  <div className="flex justify-between items-center mt-4">
                    <p className="font-bold text-accent">{book.price}</p>
                    <button className="px-3 py-1.5 rounded-lg bg-accent text-accent-foreground text-xs md:text-sm font-medium hover:opacity-90 transition">
                      Buy
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Quick Links */}
        <section className="bg-card border-t border-border">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h3 className="text-2xl font-bold text-foreground mb-8">Explore</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Link
                href={`/${locale}/discover`}
                className="bg-white rounded-lg border border-border p-6 hover:shadow-lg transition hover:-translate-y-1"
              >
                <div className="text-4xl mb-4">📚</div>
                <h4 className="font-semibold text-lg text-foreground">{t('nav.discover')}</h4>
                <p className="text-muted-foreground mt-2 text-sm">Explore our vast collection of books.</p>
              </Link>

              <Link
                href={`/${locale}/library`}
                className="bg-white rounded-lg border border-border p-6 hover:shadow-lg transition hover:-translate-y-1"
              >
                <div className="text-4xl mb-4">📖</div>
                <h4 className="font-semibold text-lg text-foreground">{t('nav.library')}</h4>
                <p className="text-muted-foreground mt-2 text-sm">View your reading library and progress.</p>
              </Link>

              <Link
                href={`/${locale}/social`}
                className="bg-white rounded-lg border border-border p-6 hover:shadow-lg transition hover:-translate-y-1"
              >
                <div className="text-4xl mb-4">💬</div>
                <h4 className="font-semibold text-lg text-foreground">{t('nav.community')}</h4>
                <p className="text-muted-foreground mt-2 text-sm">Connect and share with other readers.</p>
              </Link>
            </div>
          </div>
        </section>

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
