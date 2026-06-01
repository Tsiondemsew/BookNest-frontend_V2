'use client';

import Link from 'next/link';
import { ArrowLeft, User, ExternalLink } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { AuthorRevenueAgreementCard } from './AuthorRevenueAgreementCard';
import { useAuthorRevenueAgreement } from '../hooks/useAuthorRevenueAgreement';

export function AuthorStudioProfileHub() {
  const { user } = useAuthStore();
  const { status, loading } = useAuthorRevenueAgreement();

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <Link
        href="/studio"
        className="inline-flex items-center gap-2 text-sm font-medium text-[#B85C38] hover:underline"
      >
        <ArrowLeft size={16} />
        Studio
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-[#1A2A3A]">Author profile</h1>
        <p className="mt-1 text-[#4A5568]">
          Manage your public author identity and legal agreements for publishing on BookNest.
        </p>
      </div>

      <div className="rounded-xl border border-[#E8E2D9] bg-white p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="rounded-xl bg-[#F5F1EB] p-3">
            <User size={24} className="text-[#B85C38]" />
          </div>
          <div>
            <p className="font-semibold text-[#1A2A3A]">{user?.publicName || 'Author'}</p>
            <p className="text-sm text-[#4A5568]">{user?.email}</p>
            <p className="mt-2 text-xs capitalize text-[#8E735B]">Role: {user?.role}</p>
          </div>
        </div>
        <Link
          href="/profile"
          className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#B85C38] hover:underline"
        >
          Edit pen name, bio & avatar
          <ExternalLink size={14} />
        </Link>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-[#1A2A3A] mb-3">Revenue agreement</h2>
        {!loading && !status?.signed && (
          <p className="mb-4 text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
            You must sign before any book can be approved by admin or submitted for review.
          </p>
        )}
        <AuthorRevenueAgreementCard />
      </div>
    </div>
  );
}
