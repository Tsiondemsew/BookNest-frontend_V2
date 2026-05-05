'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LoginForm } from '@/features/auth/components';
import { useAuthStore } from '@/stores/authStore';
import { BookOpen, ChevronRight, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  return (
    <div className="min-h-screen flex overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
      </div>

      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-purple-900 to-indigo-900">
        <div className="absolute inset-0 bg-black/20 z-10"></div>
        <div className="relative z-20 flex flex-col justify-center px-12 text-white">
          <div className="mb-8 flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl backdrop-blur-sm">
              <BookOpen className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-bold">BookNest</h1>
          </div>
          
          <h2 className="text-4xl font-bold mb-6">
            Your Literary Journey
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              Starts Here
            </span>
          </h2>
          
          <p className="text-lg text-gray-200 mb-8 leading-relaxed">
            Join thousands of readers, authors, and publishers in the ultimate 
            book community. Read, track, and connect — all in one place.
          </p>

          <div className="space-y-4">
            {[
              "📚 10,000+ Books Available",
              "🎯 Track Your Reading Progress",
              "💬 Real-time Community Chat",
              "📱 Read Offline with PWA"
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3 text-gray-200">
                <ChevronRight className="w-5 h-5 text-purple-400" />
                <span>{feature}</span>
              </div>
            ))}
          </div>

          {/* Floating book cards animation */}
          <div className="absolute bottom-10 right-10 opacity-20">
            <div className="animate-float-slow">
              <div className="w-16 h-24 bg-white/10 rounded-lg rotate-12"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center relative z-10 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/20">
            {/* Mobile Logo */}
            <div className="lg:hidden flex justify-center mb-8">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-white">BookNest</h1>
              </div>
            </div>

            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">
                Welcome Back
              </h2>
              <p className="text-gray-300">
                Sign in to continue your reading adventure
              </p>
            </div>

            <LoginForm />

            <div className="mt-6 text-center">
              <span className="text-gray-300">New to BookNest? </span>
              <Link 
                href="/register" 
                className="text-purple-400 hover:text-purple-300 font-semibold transition-colors inline-flex items-center gap-1"
              >
                Create an account
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Demo credentials hint */}
            <div className="mt-6 pt-6 border-t border-white/10">
              <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
                <Sparkles className="w-3 h-3" />
                <span>Demo: reader@booknest.com / any password</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) rotate(12deg); }
          50% { transform: translateY(-20px) rotate(12deg); }
        }
        .animate-float-slow {
          animation: float-slow 6s ease-in-out infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}