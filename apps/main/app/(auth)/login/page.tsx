'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { LoginForm } from '@/features/auth/components';
import { useAuthStore } from '@/stores/authStore';
import { BookOpen, Globe } from 'lucide-react';
import { apiClient } from '@/lib/api/client';

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading: authLoading, user } = useAuthStore();
  
  const redirectTo = searchParams.get('redirect') || '/dashboard';
  const action = searchParams.get('action');
  const bookFormatId = searchParams.get('book_format_id');

  // Handle post-login actions
  // In the useEffect that handles post-login actions
useEffect(() => {
  if (!authLoading && isAuthenticated && user) {
    const executePostLoginAction = async () => {
      console.log('Post-login action debug:');
      console.log('Action:', action);
      console.log('BookFormatId:', bookFormatId);
      console.log('RedirectTo:', redirectTo);
      
      if (action === 'add-to-cart' && bookFormatId) {
        console.log('Executing add-to-cart action');
        try {
          await apiClient.post('/api/cart/items', { book_format_id: bookFormatId });
          console.log('Add to cart successful, redirecting to /cart');
          router.push('/cart');
          return;
        } catch (error) {
          console.error('Failed to add to cart after login:', error);
        }
      } 
      
      if (action === 'buy' && bookFormatId) {
        console.log('Executing buy action, redirecting to checkout');
        router.push(`/checkout?book_format_id=${bookFormatId}`);
        return;
      }
      
      console.log('No matching action, redirecting to:', redirectTo);
      router.push(redirectTo);
    };
    
    executePostLoginAction();
  }
}, [isAuthenticated, authLoading, user, action, bookFormatId, redirectTo, router]);
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#2C3E50] border-t-[#B85C38] rounded-full animate-spin"></div>
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
              <h1 className="text-2xl font-bold text-[#1A2A3A]">Welcome back</h1>
              <p className="text-[#4A5568] text-sm mt-1">Sign in to continue reading</p>
            </div>

            <LoginForm />

            <div className="mt-6 text-center">
              <p className="text-sm text-[#4A5568]">
                Don't have an account?{' '}
                <Link 
                  href={`/register?redirect=${redirectTo}&action=${action || ''}&book_format_id=${bookFormatId || ''}`} 
                  className="text-[#B85C38] hover:text-[#8E735B] font-medium"
                >
                  Sign up
                </Link>
              </p>
            </div>
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

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#2C3E50] border-t-[#B85C38] rounded-full animate-spin"></div>
      </div>
    }>
      <LoginPageContent />
    </Suspense>
  );
}