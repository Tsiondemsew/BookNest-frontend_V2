'use client';

import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { AuthPageShell } from '@/features/auth/components';
import { InviteRegistrationForm } from '@/features/auth/components/invite-registration-form';

export default function InviteRegistrationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
          <Loader2 className="w-10 h-10 text-[#B85C38] animate-spin" />
        </div>
      }
    >
      <AuthPageShell
        title="Complete your invitation"
        subtitle="Set your password and profile to join BookNest as an author or publisher."
      >
        <InviteRegistrationForm />
      </AuthPageShell>
    </Suspense>
  );
}
