'use client';

import Link from 'next/link';
import GuestLayout from './(main)/GuestLayout';
import { useState, useEffect } from 'react';
import { isAppInstalled, markAppInstalled } from '@/lib/pwa/isInstalledPwa';
import {
  BookOpen,
  Download,
  ArrowRight,
  BarChart3,
  MessageCircle,
  ShoppingBag,
  Library,
  Smartphone,
  ChevronRight,
} from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const features = [
  {
    icon: ShoppingBag,
    title: 'Marketplace',
    desc: 'Browse PDF and audiobooks from authors. Buy once, keep in your library.',
    accent: 'from-[#B85C38]/10 to-[#B85C38]/5',
  },
  {
    icon: BarChart3,
    title: 'Track progress',
    desc: 'Streaks, reading stats, and a clear view of where you left off.',
    accent: 'from-[#2C3E50]/10 to-[#2C3E50]/5',
  },
  {
    icon: MessageCircle,
    title: 'Community',
    desc: 'Follow readers and authors, share posts, and chat about what you read.',
    accent: 'from-[#8E735B]/10 to-[#8E735B]/5',
  },
];

const steps = [
  { num: '01', title: 'Create account', desc: 'Set up your reader profile in minutes.' },
  { num: '02', title: 'Build your library', desc: 'Buy books or add titles from the marketplace.' },
  { num: '03', title: 'Read & connect', desc: 'Track progress and join the conversation.' },
];

export default function PublicLandingPage() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    setInstalled(isAppInstalled());

    if (isAppInstalled()) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const onInstalled = () => setInstalled(true);

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      alert('Install is not available right now. Use your browser menu to add BookNest to your home screen.');
      return;
    }
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      markAppInstalled();
      setInstalled(true);
      setDeferredPrompt(null);
    }
  };

  return (
    <GuestLayout>
      <div className="relative overflow-hidden">
        {/* Hero */}
        <section className="relative">
          <div className="absolute inset-0 bg-gradient-to-b from-[#FDFBF7] via-[#FDFBF7] to-white pointer-events-none" />
          <div className="absolute top-0 right-0 w-[min(600px,90vw)] h-[min(600px,90vw)] bg-[#B85C38]/[0.06] rounded-full blur-3xl -translate-y-1/3 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#2C3E50]/[0.04] rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />
          <div
            className="absolute inset-0 opacity-[0.35] pointer-events-none"
            style={{
              backgroundImage:
                'radial-gradient(circle at 1px 1px, #E8E2D9 1px, transparent 0)',
              backgroundSize: '32px 32px',
            }}
          />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 lg:pt-20 pb-16 lg:pb-24">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              <div className="space-y-7 sm:space-y-8 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 bg-white text-[#2C3E50] px-4 py-2 rounded-full text-sm font-medium border border-[#E8E2D9] shadow-sm">
                  <BookOpen className="w-4 h-4 text-[#B85C38]" />
                  Your reading home
                </div>

                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[3.5rem] xl:text-7xl font-bold tracking-tight text-[#1A2A3A] leading-[1.08]">
                  Your next
                  <span className="text-[#B85C38]"> chapter</span>
                  <br className="hidden sm:block" />
                  <span className="sm:ml-0"> awaits</span>
                </h1>

                <p className="text-base sm:text-lg text-[#4A5568] max-w-lg mx-auto lg:mx-0 leading-relaxed">
                  Find your next book, track your progress, and connect with readers and authors
                  — all in one place.
                </p>

                <div className="flex flex-col sm:flex-row flex-wrap gap-3 justify-center lg:justify-start">
                  <Link
                    href="/register"
                    className="group bg-[#2C3E50] text-white px-7 py-3.5 rounded-xl font-semibold hover:bg-[#1A2A3A] transition-all shadow-lg shadow-[#2C3E50]/15 hover:shadow-xl inline-flex items-center justify-center gap-2"
                  >
                    Create account
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                  <Link
                    href="/login"
                    className="border border-[#E8E2D9] bg-white text-[#2C3E50] px-7 py-3.5 rounded-xl font-semibold hover:border-[#B85C38]/40 hover:bg-[#B85C38]/5 transition-all inline-flex items-center justify-center"
                  >
                    Sign in
                  </Link>
                </div>

                <div className="flex flex-wrap gap-4 justify-center lg:justify-start pt-1">
                  <Link
                    href="/market"
                    className="text-sm font-medium text-[#B85C38] hover:text-[#8E735B] inline-flex items-center gap-1.5 transition-colors"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    Browse marketplace
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                  {!installed && (
                    <button
                      type="button"
                      onClick={handleInstall}
                      className="text-sm font-medium text-[#4A5568] hover:text-[#B85C38] inline-flex items-center gap-1.5 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Install app
                    </button>
                  )}
                </div>
              </div>

              {/* Visual cards */}
              <div className="relative lg:pl-4 mt-4 lg:mt-0">
                <div className="relative h-[360px] sm:h-[420px] lg:h-[460px] max-w-md mx-auto lg:max-w-none">
                  <div className="absolute top-0 right-2 sm:right-10 w-48 sm:w-56 bg-white rounded-2xl shadow-xl shadow-[#2C3E50]/8 p-5 rotate-3 hover:rotate-0 transition-all duration-500 z-30 border border-[#E8E2D9]">
                    <div className="w-12 h-16 bg-gradient-to-br from-[#2C3E50]/20 to-[#B85C38]/25 rounded-lg mb-3" />
                    <div className="font-semibold text-[#1A2A3A]">The Night Circus</div>
                    <div className="text-sm text-[#4A5568]">Erin Morgenstern</div>
                    <div className="flex items-center gap-1 mt-2">
                      <span className="text-[#B85C38]">★</span>
                      <span className="text-sm text-[#4A5568]">4.8</span>
                    </div>
                  </div>

                  <div className="absolute top-20 sm:top-24 left-0 w-44 sm:w-52 bg-white rounded-2xl shadow-xl shadow-[#2C3E50]/8 p-5 -rotate-2 hover:rotate-0 transition-all duration-500 z-20 border border-[#E8E2D9]">
                    <BarChart3 className="w-8 h-8 text-[#B85C38] mb-2" />
                    <div className="font-semibold text-[#1A2A3A]">Reading streak</div>
                    <div className="text-sm text-[#4A5568]">12 days in a row</div>
                    <div className="w-full bg-[#E8E2D9] rounded-full h-1.5 mt-3">
                      <div className="bg-[#B85C38] h-1.5 rounded-full w-3/4 transition-all" />
                    </div>
                  </div>

                  <div className="absolute bottom-0 right-0 w-52 sm:w-64 bg-white rounded-2xl shadow-xl shadow-[#2C3E50]/8 p-5 rotate-2 hover:rotate-0 transition-all duration-500 z-10 border border-[#E8E2D9]">
                    <MessageCircle className="w-8 h-8 text-[#2C3E50] mb-2" />
                    <div className="font-semibold text-[#1A2A3A]">Book club chat</div>
                    <div className="text-sm text-[#4A5568]">Discussing this week&apos;s pick</div>
                    <div className="flex items-center gap-1.5 mt-3">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-xs text-[#4A5568]">Active now</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="border-y border-[#E8E2D9] bg-white/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16">
            <div className="grid sm:grid-cols-3 gap-8 sm:gap-6">
              {steps.map(({ num, title, desc }) => (
                <div key={num} className="text-center sm:text-left">
                  <span className="text-3xl font-bold text-[#B85C38]/30">{num}</span>
                  <h3 className="text-lg font-semibold text-[#1A2A3A] mt-2">{title}</h3>
                  <p className="text-sm text-[#4A5568] mt-1 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center mb-12 sm:mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#1A2A3A] tracking-tight">
              Built for readers
            </h2>
            <p className="text-[#4A5568] mt-3 max-w-2xl mx-auto text-sm sm:text-base">
              Marketplace, library, and community — connected in one app.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {features.map(({ icon: Icon, title, desc, accent }) => (
              <div
                key={title}
                className="group bg-white rounded-2xl p-6 sm:p-7 border border-[#E8E2D9] hover:border-[#B85C38]/25 hover:shadow-lg hover:shadow-[#2C3E50]/5 transition-all duration-300"
              >
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${accent} flex items-center justify-center mb-4 group-hover:scale-105 transition-transform`}
                >
                  <Icon className="w-6 h-6 text-[#B85C38]" />
                </div>
                <h3 className="text-xl font-semibold text-[#1A2A3A] mb-2">{title}</h3>
                <p className="text-[#4A5568] text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* PWA strip */}
        {!installed && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-20">
          <div className="rounded-2xl border border-[#E8E2D9] bg-gradient-to-br from-white to-[#FDFBF7] p-6 sm:p-8 lg:p-10 flex flex-col lg:flex-row items-center gap-6 lg:gap-10">
            <div className="w-14 h-14 rounded-2xl bg-[#2C3E50]/8 flex items-center justify-center flex-shrink-0">
              <Smartphone className="w-7 h-7 text-[#B85C38]" />
            </div>
            <div className="flex-1 text-center lg:text-left">
              <h3 className="text-xl font-semibold text-[#1A2A3A]">Read anywhere</h3>
              <p className="text-[#4A5568] text-sm sm:text-base mt-1.5 max-w-xl">
                Install BookNest on your device. Downloaded books stay available even when
                you&apos;re offline.
              </p>
            </div>
            <button
              type="button"
              onClick={handleInstall}
              className="flex-shrink-0 inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-[#E8E2D9] bg-white text-[#2C3E50] font-semibold hover:border-[#B85C38]/40 hover:bg-[#B85C38]/5 transition-all"
            >
              <Download className="w-4 h-4" />
              Install app
            </button>
          </div>
        </section>
        )}

        {/* CTA */}
        <section className="relative overflow-hidden bg-[#1A2A3A] text-white py-16 sm:py-20">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#B85C38]/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#2C3E50]/40 rounded-full blur-3xl" />
          <div className="relative max-w-3xl mx-auto px-4 sm:px-6 text-center">
            <Library className="w-10 h-10 text-[#B85C38] mx-auto mb-4" />
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Ready to start reading?</h2>
            <p className="text-white/70 mt-4 text-base sm:text-lg">
              Create your account and build your library today.
            </p>
            <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-3 mt-8">
              <Link
                href="/register"
                className="bg-[#B85C38] text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-[#a04f2f] transition-colors shadow-lg shadow-black/20 inline-flex items-center justify-center gap-2"
              >
                Create account
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/market"
                className="border border-white/25 text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-white/10 transition-colors inline-flex items-center justify-center"
              >
                Explore marketplace
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-[#E8E2D9] bg-white py-8 sm:py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2.5 text-[#1A2A3A] font-semibold">
              <div className="w-8 h-8 rounded-lg bg-[#2C3E50]/8 flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-[#B85C38]" />
              </div>
              BookNest
            </div>
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-[#4A5568]">
              <Link href="/market" className="hover:text-[#B85C38] transition-colors">
                Marketplace
              </Link>
              <Link href="/login" className="hover:text-[#B85C38] transition-colors">
                Sign in
              </Link>
              <Link href="/register" className="hover:text-[#B85C38] transition-colors">
                Create account
              </Link>
              {!installed && (
                <button
                  type="button"
                  onClick={handleInstall}
                  className="hover:text-[#B85C38] transition-colors"
                >
                  Install app
                </button>
              )}
            </div>
          </div>
        </footer>
      </div>
    </GuestLayout>
  );
}
