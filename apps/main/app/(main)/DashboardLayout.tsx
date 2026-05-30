'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  BookOpen,
  Library,
  Users,
  MessageCircle,
  TrendingUp,
  Upload,
  BarChart3,
  Settings,
  LogOut,
  Heart,
  ShoppingBag,
  Award,
  Menu,
  ChevronLeft,
  Globe,
  Store,
  ShoppingCart,
  Download,
  Crown,
  DollarSign
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { isPublicAppPath } from '@/lib/auth/publicRoutes';

// Navigation structure - clean, grouped
// Updated navigation structure - Community FIRST
const navigationGroups = {
  reader: [
    {
      title: 'Community',
      items: [
        { name: 'Community Feed', href: '/community', icon: Users },
        { name: 'Messages', href: '/messages', icon: MessageCircle },
      ]
    },
    {
      title: 'Reading',
      items: [
        { name: 'My Library', href: '/library', icon: Library },
        { name: 'Reading Journey', href: '/dashboard/reading', icon: TrendingUp },
      ]
    },
    {
      title: 'Marketplace',
      items: [
        { name: 'Browse', href: '/market', icon: Store },
        { name: 'Cart', href: '/cart', icon: ShoppingCart },
        { name: 'Wishlist', href: '/wishlist', icon: Heart },
      ]
    },
    {
      title: 'Account',
      items: [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Profile', href: '/profile', icon: Settings },
      ]
    }
  ],
  author: [
    {
      title: 'Community',
      items: [
        { name: 'Community Feed', href: '/community', icon: Users },
        { name: 'Messages', href: '/messages', icon: MessageCircle },
      ]
    },
    {
      title: 'Library',
      items: [
        { name: 'My Library', href: '/library', icon: Library },
      ]
    },
    {
      title: 'Author Studio',
      items: [
        { name: 'Dashboard', href: '/studio', icon: Crown },
        { name: 'My Books', href: '/studio/books', icon: BookOpen },
        { name: 'Analytics', href: '/studio/analytics', icon: BarChart3 },
        { name: 'Earnings', href: '/studio/earnings', icon: DollarSign },
      ]
    },
    {
      title: 'Marketplace',
      items: [
        { name: 'Browse', href: '/market', icon: Store },
        { name: 'Cart', href: '/cart', icon: ShoppingCart },
        { name: 'Wishlist', href: '/wishlist', icon: Heart },
      ]
    },
    {
      title: 'Account',
      items: [
        { name: 'Profile', href: '/profile', icon: Settings },
      ]
    }
  ],
  publisher: [
    {
      title: 'Community',
      items: [
        { name: 'Community Feed', href: '/community', icon: Users },
        { name: 'Messages', href: '/messages', icon: MessageCircle },
      ]
    },
    {
      title: 'Publisher Studio',
      items: [
        { name: 'Dashboard', href: '/studio', icon: Crown },
        { name: 'Catalog', href: '/studio/books', icon: Library },
        { name: 'Analytics', href: '/studio/analytics', icon: BarChart3 },
        { name: 'Payouts', href: '/studio/earnings', icon: DollarSign }, 
      ]
    },
    {
      title: 'Marketplace',
      items: [
        { name: 'Browse', href: '/market', icon: Store },
      ]
    },
    {
      title: 'Account',
      items: [
        { name: 'Profile', href: '/profile', icon: Settings },
      ]
    }
  ]
};

interface DashboardLayoutProps {
  children: React.ReactNode;
  user: any;
}

export default function DashboardLayout({ children, user }: DashboardLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { logout, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated && pathname && !isPublicAppPath(pathname)) {
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        router.push(`/login?redirect=${encodeURIComponent(pathname)}&offline=1`);
      } else {
        router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      }
    }
  }, [isAuthenticated, pathname, router]);

  if (!isAuthenticated) {
    return null;
  }

  const userRole = user?.role === 'author' ? 'author' : user?.role === 'publisher' ? 'publisher' : 'reader';
  const groups = navigationGroups[userRole as keyof typeof navigationGroups] || navigationGroups.reader;

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const getPageTitle = () => {
    if (pathname === '/dashboard') return 'Dashboard';
    if (pathname === '/market') return 'Marketplace';
    if (pathname === '/library') return 'My Library';
    if (pathname === '/cart') return 'Shopping Cart';
    if (pathname === '/wishlist') return 'Wishlist';
    if (pathname === '/community') return 'Community Feed';
    if (pathname === '/messages') return 'Messages';
    if (pathname === '/profile') return 'Profile Settings';
    if (pathname === '/studio') return 'Studio Overview';
    if (pathname === '/studio/upload') return 'Upload Book';
    if (pathname === '/studio/books') return userRole === 'publisher' ? 'Catalog' : 'My Books';
    if (pathname === '/studio/analytics') return 'Analytics & Reports';
    if (pathname === '/studio/earnings') return userRole === 'publisher' ? 'Payouts' : 'Earnings';
    if (pathname?.startsWith('/dashboard/reading')) return 'Reading Journey';
    if (pathname?.startsWith('/dashboard/stats')) return 'Reading Journey';
    if (pathname?.startsWith('/dashboard/achievements')) return 'Reading Journey';
    return 'Dashboard';
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      {/* Sidebar - Fixed height, no scrollbar on body */}
      <aside 
        className={`fixed left-0 top-0 z-40 h-screen bg-white border-r border-[#E8E2D9] transition-all duration-300 flex flex-col ${
          sidebarCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Logo Section - Fixed */}
        <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-between'} px-4 py-5 border-b border-[#E8E2D9] flex-shrink-0`}>
          {!sidebarCollapsed && (
            <div className="flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-[#B85C38]" />
              <span className="text-xl font-bold text-[#1A2A3A]">BookNest</span>
            </div>
          )}
          {sidebarCollapsed && <BookOpen className="w-6 h-6 text-[#B85C38]" />}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-1.5 rounded-lg hover:bg-[#F5F1EB] transition-colors flex-shrink-0"
          >
            {sidebarCollapsed ? <Menu size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        {/* User Info - Fixed */}
        <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'} px-4 py-4 border-b border-[#E8E2D9] flex-shrink-0`}>
          <div className="w-10 h-10 rounded-full bg-[#2C3E50] flex items-center justify-center text-white font-semibold flex-shrink-0">
            {user?.name?.[0] || user?.email?.[0] || 'U'}
          </div>
          {!sidebarCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#1A2A3A] truncate">{user?.name || user?.email?.split('@')[0]}</p>
              <p className="text-xs text-[#4A5568] capitalize">{user?.role || 'Reader'}</p>
            </div>
          )}
        </div>

        {/* Navigation - Scrollable area with hidden scrollbar */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-4 custom-scrollbar">
          {groups.map((group, groupIdx) => (
            <div key={groupIdx} className="space-y-1">
              {!sidebarCollapsed && group.title && (
                <p className="px-3 text-xs font-semibold text-[#4A5568] uppercase tracking-wider mb-2">
                  {group.title}
                </p>
              )}
              {group.items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'} px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-[#2C3E50] text-white'
                        : 'text-[#4A5568] hover:bg-[#F5F1EB] hover:text-[#1A2A3A]'
                    }`}
                    title={sidebarCollapsed ? item.name : undefined}
                  >
                    <item.icon size={18} className="flex-shrink-0" />
                    {!sidebarCollapsed && <span>{item.name}</span>}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Bottom Section - Fixed */}
        <div className="border-t border-[#E8E2D9] p-3 space-y-2 flex-shrink-0">
          <button
            className={`flex items-center ${sidebarCollapsed ? 'justify-center w-full' : 'gap-3'} px-3 py-2 w-full rounded-lg text-sm font-medium text-[#4A5568] hover:bg-[#F5F1EB] transition-colors`}
            title={sidebarCollapsed ? 'Language' : undefined}
          >
            <Globe size={18} />
            {!sidebarCollapsed && <span>English</span>}
            {!sidebarCollapsed && <span className="ml-auto text-xs text-[#4A5568]">EN</span>}
          </button>
          
          <button
            onClick={handleLogout}
            className={`flex items-center ${sidebarCollapsed ? 'justify-center w-full' : 'gap-3'} px-3 py-2 w-full rounded-lg text-sm font-medium text-[#4A5568] hover:bg-red-50 hover:text-red-600 transition-colors`}
            title={sidebarCollapsed ? 'Logout' : undefined}
          >
            <LogOut size={18} />
            {!sidebarCollapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
        {/* Top Navigation Bar */}
        <header className="sticky top-0 z-30 bg-white border-b border-[#E8E2D9]">
          <div className="flex items-center justify-between px-6 py-3">
            <div>
              <h1 className="text-xl font-semibold text-[#1A2A3A]">{getPageTitle()}</h1>
            </div>
            
            <div className="flex items-center gap-3" />
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>

      {/* Global styles for custom scrollbar */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #E8E2D9;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #D4CCC0;
        }
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #E8E2D9 transparent;
        }
      `}</style>
    </div>
  );
}