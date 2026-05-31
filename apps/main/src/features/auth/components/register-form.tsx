'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  registerFormSchema,
  type RegisterFormInput,
  getPasswordStrength,
  getPasswordStrengthLabel,
  PASSWORD_REQUIREMENTS,
} from '@repo/validation';
import { useAuthStore } from '@/stores/authStore';
import { authApi } from '@/lib/api/client';
import { getFriendlyAuthMessage } from '@/lib/auth/mapAuthError';
import { Eye, EyeOff, AlertCircle, Loader2, CheckCircle, XCircle } from 'lucide-react';

export function RegisterForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [resumedSignup, setResumedSignup] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [generalError, setGeneralError] = useState<string | null>(null);

  const { register: registerUser } = useAuthStore();

  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormInput>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      display_name: '',
    },
    mode: 'onBlur',
  });

  const password = watch('password') || '';
  const passwordStrength = getPasswordStrength(password);
  const strengthLabel = getPasswordStrengthLabel(passwordStrength);

  const onSubmit = async (data: RegisterFormInput) => {
    setGeneralError(null);

    const result = await registerUser(data.email, data.password, data.display_name);

    if (result.fieldErrors) {
      for (const [field, message] of Object.entries(result.fieldErrors)) {
        const key =
          field === 'displayName' ? 'display_name' : (field as keyof RegisterFormInput);
        setError(key, { message });
      }
    }

    if (!result.success) {
      setGeneralError(result.error ?? 'Registration failed. Please try again.');
      return;
    }

    setRegisteredEmail(data.email);
    setResumedSignup(!!result.resumed);
    setVerificationSent(true);
    if (result.message) {
      setResendMessage(result.message);
    }
  };

  const handleResendVerification = async () => {
    setResendMessage('');
    try {
      const res = await authApi.resendVerification({ email: registeredEmail });
      setResendMessage(
        (res as { message?: string }).message || 'Verification email resent! Check your inbox.'
      );
    } catch (err: unknown) {
      setResendMessage(getFriendlyAuthMessage(err));
    }
  };

  if (verificationSent) {
    return (
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900">
          {resumedSignup ? 'Finish verifying your email' : 'Check your email'}
        </h2>
        <p className="text-gray-600">
          {resumedSignup ? (
            <>
              You already started signing up with{' '}
              <strong className="text-gray-900">{registeredEmail}</strong>. We sent a fresh
              verification link to that address.
            </>
          ) : (
            <>
              We&apos;ve sent a verification link to{' '}
              <strong className="text-gray-900">{registeredEmail}</strong>
            </>
          )}
        </p>
        <p className="text-sm text-gray-500">
          {resumedSignup
            ? 'Open the link in that message to confirm your account, then sign in with the password you just chose.'
            : 'We&apos;ve sent a verification email from BookNest. Open the link in that message, then sign in.'}
        </p>

        {resendMessage && (
          <p
            className={`text-sm ${
              resendMessage.toLowerCase().includes('resent') ||
              resendMessage.toLowerCase().includes('check') ||
              resendMessage.toLowerCase().includes('sent') ||
              resendMessage.toLowerCase().includes('inbox')
                ? 'text-green-600'
                : 'text-red-600'
            }`}
          >
            {resendMessage}
          </p>
        )}

        <div className="space-y-2 pt-4">
          <button
            type="button"
            onClick={handleResendVerification}
            className="text-sm text-blue-600 hover:underline"
          >
            Resend verification email
          </button>
          <div>
            <button
              type="button"
              onClick={() => router.push('/login')}
              className="mt-2 text-sm text-gray-500 hover:text-gray-700"
            >
              Back to login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      {generalError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{generalError}</p>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Display Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          disabled={isSubmitting}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 ${
            errors.display_name ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="John Doe"
          {...register('display_name')}
        />
        {errors.display_name && (
          <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
            <AlertCircle size={12} />
            {errors.display_name.message}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          disabled={isSubmitting}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 ${
            errors.email ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="you@example.com"
          {...register('email')}
        />
        {errors.email && (
          <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
            <AlertCircle size={12} />
            {errors.email.message}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Password <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            disabled={isSubmitting}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 pr-10 ${
              errors.password ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Create a password"
            {...register('password')}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        {password && (
          <div className="mt-2 space-y-2">
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${strengthLabel.bgColor}`}
                  style={{ width: `${passwordStrength}%` }}
                />
              </div>
              <span className={`text-xs font-medium ${strengthLabel.color}`}>
                {strengthLabel.label}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
              {PASSWORD_REQUIREMENTS.map((req) => {
                const met = req.test(password);
                return (
                  <div key={req.key} className="flex items-center gap-1">
                    {met ? (
                      <CheckCircle size={12} className="text-green-500" />
                    ) : (
                      <XCircle size={12} className="text-gray-400" />
                    )}
                    <span className={met ? 'text-green-700' : 'text-gray-500'}>{req.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {errors.password && (
          <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
            <AlertCircle size={12} />
            {errors.password.message}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Confirm Password <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            disabled={isSubmitting}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 pr-10 ${
              errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Confirm your password"
            {...register('confirmPassword')}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
          >
            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
            <AlertCircle size={12} />
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-2.5 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium mt-6"
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Creating account...
          </span>
        ) : (
          'Create account'
        )}
      </button>

      <p className="text-xs text-center text-gray-500">
        By signing up, you agree to our{' '}
        <Link href="/terms" className="text-blue-600 hover:underline">
          Terms of Service
        </Link>{' '}
        and{' '}
        <Link href="/privacy" className="text-blue-600 hover:underline">
          Privacy Policy
        </Link>
      </p>
    </form>
  );
}
