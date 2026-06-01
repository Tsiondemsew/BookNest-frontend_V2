'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { RegisterForm, AuthPageShell } from '@/features/auth/components';
import { useAuthStore } from '@/stores/authStore';
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
        <div className="w-10 h-10 border-4 border-[#2C3E50]/20 border-t-[#B85C38] rounded-full animate-spin" />
      </div>
    );
  }

  const loginHref = buildLoginUrl({
    redirect: redirectTo,
    action,
    bookFormatIds,
  });

  return (
    <AuthPageShell
      title="Create account"
      subtitle="Set up your reader profile and start building your library"
      footer={
        <p className="text-sm text-[#4A5568]">
          Already have an account?{' '}
          <Link
            href={loginHref}
            className="text-[#B85C38] hover:text-[#8E735B] font-semibold underline-offset-2 hover:underline transition-colors"
          >
            Sign in
          </Link>
        </p>
      }
    >
      <RegisterForm />
    </AuthPageShell>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-[#2C3E50]/20 border-t-[#B85C38] rounded-full animate-spin" />
        </div>
      }
    >
      <RegisterPageContent />
    </Suspense>
  );
}
