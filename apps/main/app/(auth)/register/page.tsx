'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { RegisterForm } from '@/features/auth/components';
import { useAuthStore } from '@/stores/authStore';
import { BookOpen, Globe } from 'lucide-react';

function RegisterPageContent() {
  const { isAuthenticated, isLoading } = useAuthStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const redirectTo = searchParams.get('redirect') || '/onboarding/genres';
  const action = searchParams.get('action');
  const bookFormatId = searchParams.get('book_format_id');

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      // Pass action and book_format_id to onboarding completion
      let onboardingUrl = '/onboarding/genres';
      if (action && bookFormatId) {
        onboardingUrl += `?action=${action}&book_format_id=${bookFormatId}&redirect=${encodeURIComponent(redirectTo)}`;
      }
      router.push(onboardingUrl);
    }
  }, [isAuthenticated, isLoading, router, action, bookFormatId, redirectTo]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#2C3E50] border-t-[#B85C38] rounded-full animate-spin"></div>
      </div>
    );
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
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-[#1A2A3A]">Create account</h1>
              <p className="text-[#4A5568] text-sm mt-1">Join the BookNest community</p>
            </div>

            <RegisterForm />

            <div className="mt-6 text-center">
              <p className="text-sm text-[#4A5568]">
                Already have an account?{' '}
                <Link 
                  href={`/login?redirect=${redirectTo}&action=${action || ''}&book_format_id=${bookFormatId || ''}`}
                  className="text-[#B85C38] hover:text-[#8E735B] font-medium"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>

          <div className="mt-4 text-center">
            <button className="inline-flex items-center gap-1 text-sm text-[#4A5568] hover:text-[#B85C38] transition-colors">
              <Globe size={14} />
              <span>English</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#2C3E50] border-t-[#B85C38] rounded-full animate-spin"></div>
      </div>
    }>
      <RegisterPageContent />
    </Suspense>
  );
}