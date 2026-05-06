'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiClient } from '@/lib/api/client';
import { BookOpen, Lock, Eye, EyeOff, CheckCircle, ArrowLeft, Globe } from 'lucide-react';

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const token = hashParams.get('access_token');
    
    if (token) {
      setAccessToken(token);
    } else {
      setError('Invalid or expired reset link. Please request a new one.');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!accessToken) {
      setError('Invalid reset link');
      return;
    }

    setIsLoading(true);

    try {
      await apiClient.post('/api/auth/update-password', {
        access_token: accessToken,
        password: password,
      });

      setSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update password');
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
              <h1 className="text-2xl font-bold text-[#1A2A3A] mb-2">Password updated!</h1>
              <p className="text-[#4A5568] mb-6">
                Your password has been successfully changed.
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#2C3E50] text-white rounded-lg font-medium hover:bg-[#1A2A3A] transition-colors"
              >
                <ArrowLeft size={16} />
                Go to login
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
              <h1 className="text-2xl font-bold text-[#1A2A3A]">Create new password</h1>
              <p className="text-[#4A5568] text-sm mt-1">Enter your new password below</p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-[#1A2A3A] mb-1">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4A5568] w-4 h-4" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-10 pr-10 py-2.5 border border-[#E8E2D9] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#B85C38] focus:border-[#B85C38] transition-all"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4A5568] hover:text-[#1A2A3A]"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <p className="text-xs text-[#4A5568] mt-1">At least 6 characters</p>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#1A2A3A] mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4A5568] w-4 h-4" />
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full pl-10 pr-10 py-2.5 border border-[#E8E2D9] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#B85C38] focus:border-[#B85C38] transition-all"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4A5568] hover:text-[#1A2A3A]"
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 bg-[#2C3E50] text-white rounded-lg font-medium hover:bg-[#1A2A3A] transition-colors disabled:opacity-50 mt-4"
              >
                {isLoading ? 'Updating...' : 'Update password'}
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