'use client';

import { useState } from 'react';
import { adminApi } from '@/lib/api/client';

export function InvitesView() {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'author' | 'publisher'>('author');
  const [name, setName] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);
    try {
      await adminApi.inviteUser({
        email,
        role,
        pen_name: role === 'author' ? name : undefined,
        company_name: role === 'publisher' ? name : undefined,
        display_name: name,
      });
      setMessage(`Invite sent to ${email}. They will receive a Supabase invite email.`);
      setEmail('');
      setName('');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Invite failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-semibold text-zinc-900">Invite user</h1>
      <p className="mt-1 text-sm text-zinc-500">
        Invite authors and publishers. Readers register on the main app — no invite needed.
      </p>
      <form onSubmit={onSubmit} className="mt-6 space-y-4 rounded-xl border border-zinc-200 bg-white p-5">
        <div>
          <label className="block text-sm font-medium text-zinc-700">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700">Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as 'author' | 'publisher')}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          >
            <option value="author">Author</option>
            <option value="publisher">Publisher</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700">
            {role === 'author' ? 'Pen name' : 'Company name'}
          </label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          />
        </div>
        {message && <p className="text-sm text-green-700">{message}</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {loading ? 'Sending…' : 'Send invite'}
        </button>
      </form>
    </div>
  );
}
