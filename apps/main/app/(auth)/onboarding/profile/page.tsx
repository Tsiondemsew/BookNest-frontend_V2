'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { BookOpen, Building2, ChevronRight, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { profileApi } from '@/lib/api/client';
import {
  completeAuthContinuation,
  readPendingActionFromSearchParams,
} from '@/lib/auth/pendingAuthAction';

function ProfileSetupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isInitializing: authLoading, user } = useAuthStore();
  const [penName, setPenName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAuthor = user?.role === 'author';
  const isPublisher = user?.role === 'publisher';

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (!authLoading && user && user.role !== 'author' && user.role !== 'publisher') {
      void completeAuthContinuation(router, searchParams, user);
    }
  }, [authLoading, router, searchParams, user]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (isAuthor && !penName.trim()) {
      setError('Please enter your pen name');
      return;
    }
    if (isPublisher && !companyName.trim()) {
      setError('Please enter your company name');
      return;
    }

    setIsSubmitting(true);
    try {
      if (isAuthor) {
        await profileApi.updateProfile({
          pen_name: penName.trim(),
          full_name: fullName.trim() || undefined,
        });
      } else if (isPublisher) {
        await profileApi.updateProfile({
          company_name: companyName.trim(),
        });
      }

      if (user) {
        await completeAuthContinuation(router, searchParams, user);
      } else {
        const { redirect } = readPendingActionFromSearchParams(searchParams);
        router.push(redirect);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Could not save your profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-[#B85C38] animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || !user || (!isAuthor && !isPublisher)) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col">
      <header className="border-b border-[#E8E2D9] bg-white">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-[#B85C38]" />
            <span className="text-xl font-bold text-[#1A2A3A]">BookNest</span>
          </Link>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-sm border border-[#E8E2D9] p-8">
            <div className="text-center mb-8">
              <div className="mx-auto w-12 h-12 rounded-xl bg-[#2C3E50]/10 flex items-center justify-center mb-4">
                {isAuthor ? (
                  <BookOpen className="w-6 h-6 text-[#B85C38]" />
                ) : (
                  <Building2 className="w-6 h-6 text-[#B85C38]" />
                )}
              </div>
              <h1 className="text-2xl font-bold text-[#1A2A3A]">
                {isAuthor ? 'Set up your author profile' : 'Set up your publisher profile'}
              </h1>
              <p className="text-[#4A5568] mt-2 text-sm">
                {isAuthor
                  ? 'Choose the pen name readers will see on your books.'
                  : 'Enter the company name that will appear on your catalog.'}
              </p>
            </div>

            {error && (
              <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm text-center">
                {error}
              </div>
            )}

            <form onSubmit={(e) => void onSubmit(e)} className="space-y-4">
              {isAuthor && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-[#1A2A3A] mb-1">
                      Pen name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={penName}
                      onChange={(e) => setPenName(e.target.value)}
                      placeholder="Jane Author"
                      className="w-full px-4 py-2.5 border border-[#E8E2D9] rounded-xl bg-[#FDFBF7]/50 text-[#1A2A3A] focus:outline-none focus:ring-2 focus:ring-[#B85C38]/30 focus:border-[#B85C38]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#1A2A3A] mb-1">
                      Legal name <span className="text-[#4A5568] font-normal">(optional)</span>
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Jane Doe"
                      className="w-full px-4 py-2.5 border border-[#E8E2D9] rounded-xl bg-[#FDFBF7]/50 text-[#1A2A3A] focus:outline-none focus:ring-2 focus:ring-[#B85C38]/30 focus:border-[#B85C38]"
                    />
                  </div>
                </>
              )}

              {isPublisher && (
                <div>
                  <label className="block text-sm font-medium text-[#1A2A3A] mb-1">
                    Company name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Acme Publishing"
                    className="w-full px-4 py-2.5 border border-[#E8E2D9] rounded-xl bg-[#FDFBF7]/50 text-[#1A2A3A] focus:outline-none focus:ring-2 focus:ring-[#B85C38]/30 focus:border-[#B85C38]"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 py-3 bg-[#2C3E50] text-white rounded-xl font-medium hover:bg-[#1A2A3A] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    Continue
                    <ChevronRight size={18} />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProfileSetupPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
          <Loader2 className="w-10 h-10 text-[#B85C38] animate-spin" />
        </div>
      }
    >
      <ProfileSetupContent />
    </Suspense>
  );
}
