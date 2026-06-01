'use client';

import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { forgotPasswordSchema, type ForgotPasswordInput } from '@repo/validation';
import { authApi } from '@/lib/api/client';
import { getFriendlyAuthMessage } from '@/lib/auth/mapAuthError';
import { AuthPageShell } from '@/features/auth/components';
import { AlertCircle, Loader2, CheckCircle } from 'lucide-react';
import { useState } from 'react';

const inputClass = (hasError: boolean) =>
  `w-full px-4 py-2.5 border rounded-xl bg-[#FDFBF7]/50 text-[#1A2A3A] placeholder:text-[#4A5568]/60 focus:outline-none focus:ring-2 focus:ring-[#B85C38]/30 focus:border-[#B85C38] disabled:opacity-60 transition-colors ${
    hasError ? 'border-red-400' : 'border-[#E8E2D9]'
  }`;

export default function ForgotPasswordPage() {
  const [success, setSuccess] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
    mode: 'onBlur',
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    setSubmitError(null);
    try {
      await authApi.forgotPassword({ email: data.email });
      setSubmittedEmail(data.email);
      setSuccess(true);
    } catch (err: unknown) {
      setSubmitError(getFriendlyAuthMessage(err));
    }
  };

  if (success) {
    return (
      <AuthPageShell
        title="Check your email"
        subtitle="We sent a password reset link to your inbox"
      >
        <div className="text-center space-y-4">
          <div className="w-14 h-14 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto">
            <CheckCircle className="w-7 h-7 text-emerald-600" />
          </div>
          <p className="text-sm text-[#4A5568] leading-relaxed">
            We&apos;ve sent a reset link to{' '}
            <strong className="text-[#1A2A3A]">{submittedEmail}</strong>
          </p>
          <Link
            href="/login"
            className="inline-flex items-center justify-center w-full py-3 px-4 bg-[#2C3E50] text-white rounded-xl hover:bg-[#1A2A3A] font-semibold transition-colors text-sm"
          >
            Back to sign in
          </Link>
        </div>
      </AuthPageShell>
    );
  }

  return (
    <AuthPageShell
      title="Reset password"
      subtitle="Enter your email and we'll send you a reset link"
      footer={
        <p className="text-sm text-[#4A5568]">
          Remember your password?{' '}
          <Link
            href="/login"
            className="text-[#B85C38] hover:text-[#8E735B] font-semibold underline-offset-2 hover:underline"
          >
            Sign in
          </Link>
        </p>
      }
    >
      {submitError && (
        <div className="mb-5 p-4 bg-red-50 border border-red-200/80 rounded-xl flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="text-sm text-red-700">{submitError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-[#2C3E50] mb-1.5">
            Email
          </label>
          <input
            id="email"
            type="email"
            disabled={isSubmitting}
            className={inputClass(!!errors.email)}
            placeholder="you@example.com"
            {...register('email')}
          />
          {errors.email && (
            <p className="text-red-600 text-sm mt-1.5">{errors.email.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 px-4 bg-[#2C3E50] text-white rounded-xl hover:bg-[#1A2A3A] disabled:opacity-50 font-semibold transition-colors"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Sending...
            </span>
          ) : (
            'Send reset link'
          )}
        </button>
      </form>
    </AuthPageShell>
  );
}
