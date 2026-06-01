import { redirect } from 'next/navigation';

export default function RevenueRedirect() {
  redirect('/dashboard/reports?category=revenue');
}
