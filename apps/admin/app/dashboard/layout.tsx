import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { DashboardShell } from '@/components/dashboard-shell';
import { verifyAdminSession } from '@/lib/auth';
import { getClearCookieOptions } from '@/lib/auth-cookie';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { authenticated } = await verifyAdminSession();

  if (!authenticated) {
    try {
      const cookieStore = await cookies();
      cookieStore.set('token', '', getClearCookieOptions());
    } catch {
      /* ignore */
    }
    redirect('/login');
  }

  return <DashboardShell>{children}</DashboardShell>;
}
