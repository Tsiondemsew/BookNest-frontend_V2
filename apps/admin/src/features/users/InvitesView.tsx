'use client';

import { useState } from 'react';
import { UserPlus, BookOpen, Building2 } from 'lucide-react';
import { adminApi } from '@/lib/api/client';
import { AdminButton, AdminCard, AdminInput, AdminSelect } from '@/components/ui/AdminUi';

export function InvitesView() {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'author' | 'publisher'>('author');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);
    try {
      await adminApi.inviteUser({ email, role });
      setMessage(
        `Invite sent to ${email}. They will open a registration form on BookNest to set their password and ${
          role === 'author' ? 'pen name' : 'company name'
        }, then go straight to Studio.`
      );
      setEmail('');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Invite failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg">
      <div className="flex items-center gap-3 mb-1">
        <div className="w-10 h-10 rounded-xl bg-[#2C3E50]/10 flex items-center justify-center">
          <UserPlus className="w-5 h-5 text-[#B85C38]" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-[#1A2A3A]">Invite registration</h1>
          <p className="text-sm text-[#4A5568]">
            Register authors and publishers via email invite.
          </p>
        </div>
      </div>

      <p className="mt-4 text-sm text-[#4A5568] rounded-xl border border-[#E8E2D9] bg-[#FDFBF7] px-4 py-3">
        Readers sign up on the main app — no invite needed. Invited users receive an email that opens
        a registration form on BookNest where they set a password and their{' '}
        {role === 'author' ? 'pen name' : 'company name'} before entering Studio.
      </p>

      <AdminCard className="mt-6 p-6">
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#1A2A3A] mb-1">Email</label>
            <AdminInput
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="author@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1A2A3A] mb-1">Role</label>
            <AdminSelect
              value={role}
              onChange={(e) => setRole(e.target.value as 'author' | 'publisher')}
            >
              <option value="author">Author</option>
              <option value="publisher">Publisher</option>
            </AdminSelect>
          </div>

          <div className="flex gap-3 pt-2">
            <div className="flex items-center gap-2 text-xs text-[#4A5568]">
              {role === 'author' ? (
                <BookOpen size={14} className="text-[#B85C38]" />
              ) : (
                <Building2 size={14} className="text-[#B85C38]" />
              )}
              <span>
                {role === 'author'
                  ? 'Can upload and sell their own books'
                  : 'Can publish books on behalf of authors'}
              </span>
            </div>
          </div>

          {message && (
            <p className="text-sm text-green-800 bg-green-50 border border-green-200 rounded-xl px-3 py-2">
              {message}
            </p>
          )}
          {error && (
            <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
              {error}
            </p>
          )}

          <AdminButton type="submit" disabled={loading} className="w-full">
            {loading ? 'Sending invite…' : 'Send invite'}
          </AdminButton>
        </form>
      </AdminCard>
    </div>
  );
}
