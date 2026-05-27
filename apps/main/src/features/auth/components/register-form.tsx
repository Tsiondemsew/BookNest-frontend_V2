'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { Mail, Lock, User, Eye, EyeOff, UserPlus, Loader2 } from 'lucide-react';

export function RegisterForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [localError, setLocalError] = useState('');
  const { register, isLoading, error, clearError } = useAuthStore();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    clearError();

    if (!email || !password || !confirmPassword || !displayName) {
      setLocalError('All fields are required');
      return;
    }

    if (password !== confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters');
      return;
    }

    if (!email.includes('@')) {
      setLocalError('Please enter a valid email address');
      return;
    }

    try {
      await register(email, password, displayName);
      router.push('/onboarding/genres');
    } catch (err: any) {
      setLocalError(err.message || 'Registration failed');
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div>
        <label htmlFor="displayName" className="block text-sm font-medium text-[#1A2A3A] mb-1">
          Display Name
        </label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4A5568] w-4 h-4" />
          <input
            id="displayName"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
            className="w-full pl-10 pr-4 py-2.5 border border-[#E8E2D9] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#B85C38] focus:border-[#B85C38] transition-all placeholder:text-[#A0A0A0] text-black"
            placeholder="How should we call you?"
          />
        </div>
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-[#1A2A3A] mb-1">
          Email
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4A5568] w-4 h-4" />
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full pl-10 pr-4 py-2.5 border border-[#E8E2D9] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#B85C38] focus:border-[#B85C38] transition-all placeholder:text-[#A0A0A0] text-black"
            placeholder="you@example.com"
          />
        </div>
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-[#1A2A3A] mb-1">
          Password
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4A5568] w-4 h-4" />
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full pl-10 pr-10 py-2.5 border border-[#E8E2D9] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#B85C38] focus:border-[#B85C38] transition-all placeholder:text-[#A0A0A0] text-black"
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4A5568] hover:text-[#1A2A3A] transition-colors"
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
            className="w-full pl-10 pr-10 py-2.5 border border-[#E8E2D9] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#B85C38] focus:border-[#B85C38] transition-all placeholder:text-[#A0A0A0] text-black"
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4A5568] hover:text-[#1A2A3A] transition-colors"
          >
            {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      {(localError || error) && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm text-center">{localError || error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-2.5 bg-[#2C3E50] text-white rounded-lg font-medium hover:bg-[#1A2A3A] transition-colors disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Creating account...
          </>
        ) : (
          <>
            <UserPlus className="w-4 h-4" />
            Create Account
          </>
        )}
      </button>
    </form>
  );
}