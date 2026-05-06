'use client';

import { useState } from 'react';
import Link from 'next/link';
import { apiClient } from '@/lib/api/client';
import { BookOpen, Mail, ArrowLeft, CheckCircle, Globe } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      setIsLoading(false);
      return;
    }

    try {
      await apiClient.post('/api/auth/forgot-password', { email });
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
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
          <div className="max-w-md w-full text-center">
            <div className="bg-white rounded-2xl shadow-sm border border-[#E8E2D9] p-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-[#2D6A4F]" />
              </div>
              <h1 className="text-2xl font-bold text-[#1A2A3A] mb-2">Check your email</h1>
              <p className="text-[#4A5568] mb-6">
                We've sent a password reset link to <strong className="text-[#1A2A3A]">{email}</strong>
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#2C3E50] text-white rounded-lg font-medium hover:bg-[#1A2A3A] transition-colors"
              >
                <ArrowLeft size={16} />
                Back to login
              </Link>
            </div>
          </div>
        </div>
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
              <h1 className="text-2xl font-bold text-[#1A2A3A]">Reset password</h1>
              <p className="text-[#4A5568] text-sm mt-1">
                Enter your email and we'll send you a reset link
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-[#1A2A3A] mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4A5568] w-4 h-4" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-2.5 border border-[#E8E2D9] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#B85C38] focus:border-[#B85C38] transition-all"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 bg-[#2C3E50] text-white rounded-lg font-medium hover:bg-[#1A2A3A] transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Sending...' : 'Send reset link'}
              </button>

              <div className="text-center">
                <Link href="/login" className="text-sm text-[#B85C38] hover:text-[#8E735B] transition-colors">
                  Back to login
                </Link>
              </div>
            </form>
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