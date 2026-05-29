import { redirect } from 'next/navigation';
import { DashboardShell } from '@/components/dashboard-shell';
import { verifyAdminSession } from '@/lib/auth';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { authenticated } = await verifyAdminSession();

  if (!authenticated) {
    redirect('/login');
  }

  return <DashboardShell>{children}</DashboardShell>;
}
