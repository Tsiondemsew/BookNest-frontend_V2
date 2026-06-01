'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { LoginForm, AuthPageShell } from '@/features/auth/components';
import { useAuthStore } from '@/stores/authStore';
import { useTranslation } from '@/hooks/useTranslation';
import {
  buildRegisterUrl,
  completeAuthContinuation,
  readPendingActionFromSearchParams,
} from '@/lib/auth/pendingAuthAction';

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isInitializing, user } = useAuthStore();
  const { t } = useTranslation();

  const { redirect: redirectTo, action, bookFormatIds } =
    readPendingActionFromSearchParams(searchParams);

  useEffect(() => {
    if (!isInitializing && isAuthenticated && user) {
      completeAuthContinuation(router, searchParams, user);
    }
  }, [isAuthenticated, isInitializing, user, router, searchParams]);

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#2C3E50]/20 border-t-[#B85C38] rounded-full animate-spin" />
      </div>
    );
  }

  const registerHref = buildRegisterUrl({
    redirect: redirectTo,
    action,
    bookFormatIds,
  });

  const hasPendingPurchase = Boolean(action && bookFormatIds.length > 0);

  return (
    <AuthPageShell
      title={t('auth.welcomeBack')}
      subtitle={
        hasPendingPurchase ? t('auth.signInPurchaseSubtitle') : t('auth.signInSubtitle')
      }
      footer={
        <p className="text-sm text-[#4A5568]">
          {t('auth.noAccount')}{' '}
          <Link
            href={registerHref}
            className="text-[#B85C38] hover:text-[#8E735B] font-semibold underline-offset-2 hover:underline transition-colors"
          >
            {t('auth.createAccount')}
          </Link>
        </p>
      }
    >
      <LoginForm />
    </AuthPageShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-[#2C3E50]/20 border-t-[#B85C38] rounded-full animate-spin" />
        </div>
      }
    >
      <LoginPageContent />
    </Suspense>
  );
}
