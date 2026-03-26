'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

/**
 * Login page
 */
export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isLoading, error } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!email || !password) {
      setFormError('Please fill in all fields');
      return;
    }

    try {
      await login({ email, password });
      const redirect = searchParams.get('redirect') || '/dashboard';
      router.push(redirect);
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : 'Login failed. Please try again.'
      );
    }
  };

  return (
    <div>
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-foreground mb-2">BookNest</h1>
        <p className="text-foreground/60">Sign in to your account</p>
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
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium mt-6"
          aria-busy={isLoading}
        >
          {isLoading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>

      {/* Register link */}
      <p className="text-center text-sm text-foreground/60 mt-6">
        Don&apos;t have an account?{' '}
        <Link
          href="/register"
          className="text-primary hover:underline font-medium"
        >
          Create one
        </Link>
      </p>

      {/* Demo credentials hint */}
      <div className="mt-8 p-4 rounded-lg bg-muted text-xs text-foreground/60">
        <p className="font-semibold mb-2">Demo credentials (mock API):</p>
        <p>Email: demo@example.com</p>
        <p>Password: demo123</p>
      </div>
    </div>
  );
}
