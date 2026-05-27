'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BookOpen, Globe, Menu, X } from 'lucide-react';

export default function GuestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col">
      {/* Navigation Bar - Guest Only */}
      <nav className="bg-white border-b border-[#E8E2D9] sticky top-0 z-50 shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <BookOpen className="w-6 h-6 text-[#B85C38] group-hover:scale-110 transition-transform" />
              <span className="text-xl font-bold text-[#1A2A3A]">BookNest</span>
            </Link>
            
            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-8">
              <Link href="/" className="text-[#4A5568] hover:text-[#B85C38] transition-colors font-medium">
                Home
              </Link>
              <Link href="/market" className="text-[#4A5568] hover:text-[#B85C38] transition-colors font-medium">
                Marketplace
              </Link>
            </div>
            
            {/* Desktop Right Section */}
            <div className="hidden md:flex items-center gap-4">
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

            {/* Mobile Hamburger Button */}
            <div className="flex md:hidden items-center">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-[#4A5568] hover:text-[#B85C38] p-2 focus:outline-none"
                aria-label="Toggle Menu"
              >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Drawer */}
        {isOpen && (
          <div className="md:hidden border-t border-[#E8E2D9] bg-white px-4 pt-2 pb-4 space-y-3 shadow-lg">
            <Link 
              href="/" 
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2 text-[#4A5568] hover:bg-[#FDFBF7] hover:text-[#B85C38] rounded-md font-medium transition-colors"
            >
              Home
            </Link>
            <Link 
              href="/market" 
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2 text-[#4A5568] hover:bg-[#FDFBF7] hover:text-[#B85C38] rounded-md font-medium transition-colors"
            >
              Marketplace
            </Link>
            
            <hr className="border-[#E8E2D9] my-2" />

            {/* Mobile Actions */}
            <div className="flex flex-col gap-2 px-3">
              <button className="flex items-center gap-2 py-2 text-[#4A5568] hover:text-[#B85C38] font-medium">
                <Globe size={18} />
                <span>Language: EN</span>
              </button>
              
              <Link 
                href="/login" 
                onClick={() => setIsOpen(false)}
                className="text-center py-2 text-[#2C3E50] font-medium border border-[#2C3E50] rounded-lg hover:bg-[#FDFBF7] transition-colors"
              >
                Sign In
              </Link>
              <Link 
                href="/register" 
                onClick={() => setIsOpen(false)}
                className="text-center py-2 bg-[#2C3E50] text-white rounded-lg font-medium hover:bg-[#1A2A3A] transition-colors shadow-sm"
              >
                Get Started
              </Link>
            </div>
          </div>
        )}
      </nav>
      
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}