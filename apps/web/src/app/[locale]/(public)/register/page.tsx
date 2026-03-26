'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

/**
 * Register page
 */
export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading, error } = useAuth();

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!displayName || !email || !password || !confirmPassword) {
      setFormError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setFormError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setFormError('Password must be at least 8 characters');
      return;
    }

    try {
      await register({ email, password, displayName });
      router.push('/dashboard');
    } catch (err) {
      setFormError(
        err instanceof Error
          ? err.message
          : 'Registration failed. Please try again.'
      );
    }
  };

  return (
    <div>
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-foreground mb-2">BookNest</h1>
        <p className="text-foreground/60">Create your account</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Error message */}
        {(formError || error) && (
          <div
            className="p-4 rounded-lg bg-accent/20 border border-accent text-accent text-sm"
            role="alert"
            aria-live="polite"
          >
            {formError || error}
          </div>
        )}

        {/* Display name input */}
        <div>
          <label
            htmlFor="displayName"
            className="block text-sm font-medium text-foreground mb-2"
          >
            Display Name
          </label>
          <input
            id="displayName"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="John Doe"
            className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary"
            disabled={isLoading}
            required
          />
        </div>

        {/* Email input */}
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-foreground mb-2"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary"
            disabled={isLoading}
            required
          />
        </div>

        {/* Password input */}
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-foreground mb-2"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary"
            disabled={isLoading}
            required
          />
          <p className="text-xs text-foreground/60 mt-1">
            At least 8 characters
          </p>
        </div>

        {/* Confirm password input */}
        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium text-foreground mb-2"
          >
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary"
            disabled={isLoading}
            required
          />
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium mt-6"
          aria-busy={isLoading}
        >
          {isLoading ? 'Creating account...' : 'Create account'}
        </button>
      </form>

      {/* Login link */}
      <p className="text-center text-sm text-foreground/60 mt-6">
        Already have an account?{' '}
        <Link href="/login" className="text-primary hover:underline font-medium">
          Sign in
        </Link>
      </p>
    </div>
  );
}
