import { redirect } from 'next/navigation';

export default function ReadingStatsRedirect() {
  redirect('/dashboard/reading');
}
