'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { RegisterForm } from '@/features/auth/components';
import { useAuthStore } from '@/stores/authStore';
import { BookOpen, Globe } from 'lucide-react';
import {
  appendPendingActionQuery,
  buildLoginUrl,
  readPendingActionFromSearchParams,
} from '@/lib/auth/pendingAuthAction';

function RegisterPageContent() {
  const { isAuthenticated, isInitializing } = useAuthStore();
  const router = useRouter();
  const searchParams = useSearchParams();

  const { redirect: redirectTo, action, bookFormatIds } =
    readPendingActionFromSearchParams(searchParams);

  const onboardingAfterRegister = appendPendingActionQuery('/onboarding/genres', {
    redirect: redirectTo,
    action,
    bookFormatIds,
  });

  useEffect(() => {
    if (!isInitializing && isAuthenticated) {
      router.push(onboardingAfterRegister);
    }
  }, [isAuthenticated, isInitializing, router, onboardingAfterRegister]);

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#2C3E50] border-t-[#B85C38] rounded-full animate-spin"></div>
      </div>
    );
  }

  const loginHref = buildLoginUrl({
    redirect: redirectTo,
    action,
    bookFormatIds,
  });

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
              <p className="text-[#4A5568] text-sm mt-1">
                Create your free reader account — no invitation needed
              </p>
            </div>

            <RegisterForm />

            <div className="mt-6 text-center">
              <p className="text-sm text-[#4A5568]">
                Already have an account?{' '}
                <Link
                  href={loginHref}
                  className="text-[#B85C38] hover:text-[#8E735B] font-medium"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>

          <div className="mt-4 text-center">
            <button
              type="button"
              className="inline-flex items-center gap-1 text-sm text-[#4A5568] hover:text-[#B85C38] transition-colors"
            >
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
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-[#2C3E50] border-t-[#B85C38] rounded-full animate-spin"></div>
        </div>
      }
    >
      <RegisterPageContent />
    </Suspense>
  );
}
