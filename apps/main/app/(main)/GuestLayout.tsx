'use client';

import Link from 'next/link';
import { BookOpen, Globe, User, ShoppingCart, Heart } from 'lucide-react';

export default function GuestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col">
      {/* Navigation Bar - Guest Only */}
      <nav className="bg-white border-b border-[#E8E2D9] sticky top-0 z-50 flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <BookOpen className="w-6 h-6 text-[#B85C38] group-hover:scale-110 transition-transform" />
              <span className="text-xl font-bold text-[#1A2A3A]">BookNest</span>
            </Link>
            
            {/* Navigation Links */}
            <div className="hidden md:flex items-center gap-8">
              <Link href="/" className="text-[#4A5568] hover:text-[#B85C38] transition-colors font-medium">
                Home
              </Link>
              <Link href="/market" className="text-[#4A5568] hover:text-[#B85C38] transition-colors font-medium">
                Marketplace
              </Link>
            </div>
            
            {/* Right Section */}
            <div className="flex items-center gap-4">
              {/* Language Toggle */}
              <button className="flex items-center gap-1 px-2 py-1.5 text-sm text-[#4A5568] hover:text-[#B85C38] transition-colors rounded-lg">
                <Globe size={16} />
                <span>EN</span>
              </button>
              
              <Link href="/login" className="px-4 py-2 text-[#2C3E50] font-medium hover:text-[#B85C38] transition-colors">
                Sign In
              </Link>
              <Link href="/register" className="px-4 py-2 bg-[#2C3E50] text-white rounded-lg text-sm font-medium hover:bg-[#1A2A3A] transition-colors shadow-sm">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>
      
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}