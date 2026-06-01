import { redirect } from 'next/navigation';

export default function RevenueSalesRedirect() {
  redirect('/dashboard/reports?category=revenue');
}
