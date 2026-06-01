import { redirect } from 'next/navigation';
import { DEFAULT_AUTHENTICATED_HOME } from '@/lib/routes/defaultRoutes';

export default function DashboardPage() {
  redirect(DEFAULT_AUTHENTICATED_HOME);
}
