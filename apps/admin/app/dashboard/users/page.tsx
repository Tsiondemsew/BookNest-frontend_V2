import { Suspense } from 'react';
import { UserManagement } from '@/features/users';

export default function UsersPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-muted">Loading users…</div>}>
      <UserManagement />
    </Suspense>
  );
}
